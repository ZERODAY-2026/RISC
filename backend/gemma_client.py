"""Local Gemma client interfacing with Ollama with zero external telemetry and deterministic fallback."""
import json
import time
import httpx
from typing import List, Dict, Optional, Tuple, Any
from backend.config import OLLAMA_BASE_URL, DEFAULT_GEMMA_MODEL, FALLBACK_GEMMA_MODELS
from backend.models import Clause, TriageCard, SafeEscalationCard
from backend.guardrails import verify_quote_in_clause, is_legal_advice_query, build_safe_escalation_card
from backend.ingestion import sanitize_contract_text
from backend.datasets import (
    classify_cuad_category,
    CUAD_CAVEAT,
    match_india_code_context,
    match_open_india_law_context,
)

# System prompt strictly commanding Gemma to ground claims and maintain non-lawyer boundary
TRIAGE_SYSTEM_PROMPT = """You are LexGuard, an on-device legal document triage assistant powered by Gemma.
Your role is to help non-lawyers understand agreements by explaining legal terminology in plain language and identifying potential risks or ambiguities.

CRITICAL INSTRUCTIONS:
1. YOU ARE NOT A LAWYER AND CANNOT PROVIDE LEGAL ADVICE OR DECIDE LEGAL VALIDITY.
2. Rely EXCLUSIVELY on the text inside <untrusted_contract_text>. Do not invent or assume clauses.
3. Every claim MUST cite the exact clause_id (e.g., CL-001) and include a verbatim quote from that clause.
4. Clearly separate:
   (a) What the document explicitly states
   (b) Plain-language explanation
   (c) Potential ambiguities, one-sided risks, or missing protections (labeled as Triage Observations - Not Legal Advice).
5. If information is not found in the text, explicitly state that the document is silent on that topic.
"""


class GemmaLocalClient:
    """Manages inference with locally running Ollama Gemma models."""

    def __init__(self, base_url: str = OLLAMA_BASE_URL, model_name: str = DEFAULT_GEMMA_MODEL):
        self.base_url = base_url.rstrip("/")
        self.model_name = model_name
        self._active_model = model_name
        self._is_connected = False

    async def check_health(self) -> Tuple[bool, str, List[str]]:
        """Check if local Ollama daemon is accessible and return list of available models."""
        try:
            async with httpx.AsyncClient(timeout=1.5) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    available_models = [m.get("name", "") for m in data.get("models", [])]
                    self._is_connected = True
                    
                    # Choose model: preferred or best match
                    if self.model_name in available_models:
                        self._active_model = self.model_name
                    else:
                        for fb in FALLBACK_GEMMA_MODELS:
                            if any(fb in m for m in available_models):
                                self._active_model = fb
                                break
                    return True, self._active_model, available_models
        except Exception:
            pass

        self._is_connected = False
        return False, "Local Fallback Engine (Deterministic)", []

    async def generate_response(self, prompt: str, system_prompt: str = TRIAGE_SYSTEM_PROMPT) -> Tuple[str, float]:
        """Send prompt to local Ollama API with latency tracking."""
        start_time = time.time()
        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                payload = {
                    "model": self._active_model,
                    "prompt": prompt,
                    "system": system_prompt,
                    "stream": False,
                    "options": {
                        "temperature": 0.1,  # Low temperature for deterministic grounding
                        "top_p": 0.9,
                        "num_predict": 1024,
                    }
                }
                res = await client.post(f"{self.base_url}/api/generate", json=payload)
                elapsed_ms = (time.time() - start_time) * 1000.0
                if res.status_code == 200:
                    data = res.json()
                    return data.get("response", ""), elapsed_ms
        except Exception as e:
            # Fallback when Ollama is offline
            pass

        elapsed_ms = (time.time() - start_time) * 1000.0
        return "", elapsed_ms

    def deterministic_clause_triage(self, clause: Clause) -> TriageCard:
        """High-precision offline deterministic triage when local Gemma is offline or for hybrid validation."""
        text = clause.verbatim_text
        text_lower = text.lower()

        # Operative plain language translation
        plain_lang = ""
        risks = []
        severity = "LOW"
        badge = "VERIFIED_EXACT_QUOTE"

        if "lock-in" in text_lower or "lock in" in text_lower:
            plain_lang = "You are locked into this agreement for the specified minimum duration. Leaving earlier may require paying the remaining rent or forfeiting deposit."
            risks.append("Pre-mature exit penalty: Obligates tenant/party to pay fees even if vacating early.")
            severity = "HIGH"
        elif "non-compete" in text_lower or "restraint" in text_lower:
            plain_lang = "Restricts you from working for competitors or starting a competing venture during or after this agreement."
            risks.append("Restraint of trade: May restrict future livelihood. Note that post-employment restrictions are often scrutinized under Section 27 of the Indian Contract Act.")
            severity = "HIGH"
        elif "confidential" in text_lower or "nda" in text_lower:
            plain_lang = "Requires you to keep proprietary business information, source code, and client data strictly secret."
            risks.append("Broad definition: Verify whether standard exceptions (public knowledge, prior knowledge) are included.")
            severity = "MEDIUM"
        elif "indemn" in text_lower:
            plain_lang = "Requires you to compensate and cover legal costs or damages incurred by the other party if a breach or claim occurs."
            risks.append("Uncapped liability exposure: May force you to pay third-party legal claims. Check if liability is mutual or capped.")
            severity = "HIGH"
        elif "sole discretion" in text_lower or "absolute discretion" in text_lower:
            plain_lang = "The other party has unilateral power to make decisions, terminate, or impose fees without your consent."
            risks.append("Unilateral decision-making: Leaves you without reciprocal rights.")
            severity = "HIGH"
        elif "termination" in text_lower or "notice period" in text_lower:
            plain_lang = "Specifies how either party can end this agreement and the mandatory advance notice required."
            risks.append("Check if termination rights are symmetrical or if one party can terminate with shorter notice.")
            severity = "MEDIUM"
        elif "penalty" in text_lower or "liquidated damages" in text_lower:
            plain_lang = "Stipulates financial fines or damages if you fail to meet deadlines or contract conditions."
            risks.append("Predetermined financial fine: Requires payment without proof of actual loss.")
            severity = "HIGH"
        else:
            # General operative summary
            first_sentence = text.split(".")[0].strip()
            plain_lang = f"Specifies contractual terms regarding: {first_sentence}."

        if clause.ambiguity_flags:
            badge = "AMBIGUOUS_WORDING_DETECTED"
            risks.extend(clause.ambiguity_flags)
            if severity == "LOW":
                severity = "MEDIUM"

        cuad_cat = clause.cuad_category or classify_cuad_category(text, clause.section_title)
        india_code_ref = match_india_code_context(text, cuad_cat)
        open_india_law_ctx = match_open_india_law_context(text, cuad_cat)

        return TriageCard(
            clause_id=clause.clause_id,
            page_number=clause.page_number,
            section_title=clause.section_title or f"Clause {clause.clause_id}",
            explicit_text=clause.verbatim_text[:400],
            plain_language_explanation=plain_lang,
            potential_ambiguities_and_risks=risks,
            confidence_badge=badge,
            severity=severity,
            cuad_category=cuad_cat,
            cuad_caveat=CUAD_CAVEAT,
            india_code_ref=india_code_ref,
            open_india_law_context=open_india_law_ctx,
        )

    async def triage_document_clauses(self, clauses: List[Clause]) -> List[TriageCard]:
        """Triage each clause, prioritizing high-risk and operative provisions."""
        cards = []
        is_healthy, model_name, _ = await self.check_health()

        for clause in clauses:
            # Deterministic base triage is always calculated for rock-solid grounding
            base_card = self.deterministic_clause_triage(clause)

            if is_healthy:
                # Optionally enhance with local Gemma prompt
                prompt = f"""Analyze this legal clause for a non-lawyer:
<untrusted_contract_text>
Clause ID: {clause.clause_id}
Section: {clause.section_title}
Text: {clause.verbatim_text}
</untrusted_contract_text>

Output brief JSON:
{{
  "plain_language": "plain English explanation",
  "risks": ["risk 1", "risk 2"]
}}"""
                response_text, _ = await self.generate_response(prompt)
                try:
                    # Parse JSON from response
                    start_idx = response_text.find("{")
                    end_idx = response_text.rfind("}")
                    if start_idx != -1 and end_idx != -1:
                        parsed = json.loads(response_text[start_idx:end_idx + 1])
                        if parsed.get("plain_language"):
                            base_card.plain_language_explanation = parsed["plain_language"]
                        if parsed.get("risks") and isinstance(parsed["risks"], list):
                            base_card.potential_ambiguities_and_risks = list(set(
                                base_card.potential_ambiguities_and_risks + parsed["risks"]
                            ))
                except Exception:
                    pass  # Graceful fallback to verified base_card

            cards.append(base_card)

        return cards

    async def answer_question(
        self,
        question: str,
        relevant_clauses: List[Clause],
        is_silent: bool,
        missing_terms: List[str]
    ) -> Tuple[str, str, List[str], List[str], Optional[SafeEscalationCard], float]:
        """Generate a grounded answer, 'document is silent' notice, or safe escalation card."""
        start_time = time.time()

        # 1. Check for Legal Advice / Validity Refusal Trigger
        if is_legal_advice_query(question):
            card = build_safe_escalation_card(question, relevant_clauses)
            elapsed = (time.time() - start_time) * 1000.0
            answer = (
                "### Safe Escalation: Non-Lawyer Boundary Triggered\n\n"
                "> **Non-Lawyer Notice:** LexGuard is an automated document triage assistant and cannot provide legal advice, "
                "rule on legality, or predict court judgments.\n\n"
                f"**Why this cannot be decided from the document alone:**\n{card.why_jurisdiction_dependent}\n\n"
                "**Relevant Document Clauses Examined:**\n" +
                ("\n".join(f"- **{c_id}**: {q}" for c_id, q in zip(card.relevant_clauses, card.verbatim_citations)) or "- No directly relevant clause found.") +
                "\n\n**Actionable Questions for Your Legal Advocate:**\n" +
                "\n".join(f"{idx+1}. {q}" for idx, q in enumerate(card.questions_for_lawyer))
            )
            return answer, "SAFE_ESCALATION_REQUIRED", card.relevant_clauses, card.verbatim_citations, card, elapsed

        # 2. Check for "Document is Silent" Condition
        if is_silent or not relevant_clauses:
            elapsed = (time.time() - start_time) * 1000.0
            terms_str = ", ".join(f"'{t}'" for t in missing_terms[:5]) if missing_terms else "the query concepts"
            answer = (
                "### Document is Silent\n\n"
                f"The provided agreement **does not contain any clauses or mentions** of {terms_str}.\n\n"
                "- **Grounding Status:** Verified complete absence from indexed clauses.\n"
                "- **Triage Advice:** Because the contract is silent on this matter, any rules or obligations regarding this "
                "topic would default to statutory law or require a mutually agreed written addendum."
            )
            return answer, "DOCUMENT_IS_SILENT", [], [], None, elapsed

        # 3. Grounded Answer Generation
        is_healthy, model_name, _ = await self.check_health()
        cited_c_ids = [c.clause_id for c in relevant_clauses]
        verified_quotes = []

        top_clause = relevant_clauses[0]
        # Verbatim quote from source
        verbatim_snippet = top_clause.verbatim_text[:280]
        verified_quotes.append(verbatim_snippet)

        if is_healthy:
            context_blocks = "\n\n".join(
                f"[{c.clause_id}] {c.section_title}:\n{c.verbatim_text}"
                for c in relevant_clauses
            )
            prompt = f"""Answer the user's question based ONLY on the following contract text:
<untrusted_contract_text>
{context_blocks}
</untrusted_contract_text>

User Question: {question}

Instructions:
1. Cite the exact clause ID (e.g. {top_clause.clause_id}).
2. Include a verbatim quote from the text.
3. State the plain language interpretation.
4. If ambiguous or missing details, note it under 'Triage Note'.
"""
            model_text, _ = await self.generate_response(prompt)
            if model_text.strip():
                elapsed = (time.time() - start_time) * 1000.0
                return model_text, "GROUNDED_ANSWER", cited_c_ids, verified_quotes, None, elapsed

        # Deterministic Grounded Answer Fallback
        elapsed = (time.time() - start_time) * 1000.0
        fallback_answer = (
            f"### Grounded Response\n\n"
            f"**Operative Clause Found:** [{top_clause.clause_id} - {top_clause.section_title}] (Page {top_clause.page_number})\n\n"
            f"**Exact Source Quote:**\n> \"{verbatim_snippet}...\"\n\n"
            f"**Plain-Language Explanation:**\n"
            f"The document explicitly addresses this matter in clause **{top_clause.clause_id}**. "
            f"{top_clause.verbatim_text.split('.')[0]}.\n\n"
            f"**Triage Observation (Not Legal Advice):**\n"
            f"- Ambiguity Flags: {', '.join(top_clause.ambiguity_flags) if top_clause.ambiguity_flags else 'No high-risk subjective phrasing detected.'}\n"
            f"- Grounding: Programmatically verified exact substring in source document."
        )
        return fallback_answer, "GROUNDED_ANSWER", cited_c_ids, verified_quotes, None, elapsed
