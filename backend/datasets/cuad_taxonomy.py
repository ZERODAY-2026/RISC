"""CUAD (Contract Understanding Atticus Dataset) Taxonomy & Classification Engine.

Reference: Hendrycks et al., "CUAD: An Expert-Annotated NLP Dataset for Legal Contract Review",
NeurIPS 2021 Datasets & Benchmarks.
License: Creative Commons Attribution 4.0 International (CC BY 4.0).
Participant Guide Page 8 Resource 1.
"""
import re
from typing import Optional, List, Dict, Tuple

CUAD_CAVEAT = (
    "CUAD Benchmark (CC BY 4.0 — Hendrycks et al., NeurIPS 2021): "
    "Commercial corporate agreement used to benchmark clause extraction against expert labels; "
    "not presented as proof for consumer rental/employment documents."
)

# The 41 official clause categories defined by legal experts in the CUAD benchmark
CUAD_41_CATEGORIES: List[str] = [
    "Document Name",
    "Parties",
    "Agreement Date",
    "Effective Date",
    "Expiration Date",
    "Renewal Term",
    "Notice Period To Terminate Renewal",
    "Governing Law",
    "Most Favored Nation",
    "Competitive Restriction Exception",
    "Non-Compete",
    "Exclusivity",
    "No-Solicit Of Customers",
    "No-Solicit Of Employees",
    "Non-Disparagement",
    "Termination For Convenience",
    "Rofr / Rofo / Rofn",
    "Change Of Control",
    "Anti-Assignment",
    "Revenue / Profit Sharing",
    "Price Restriction",
    "Minimum Commitment",
    "Volume Restriction",
    "IP Ownership Assignment",
    "Joint IP Ownership",
    "License Grant",
    "Non-Transferable License",
    "Exclusivity License",
    "Irrevocable License",
    "Source Code Escrow",
    "Post-Termination Services",
    "Audit Rights",
    "Uncapped Liability",
    "Cap On Liability",
    "Liquidated Damages",
    "Warranty Duration",
    "Insurance",
    "Covenant Not To Sue",
    "Third Party Beneficiary",
    "Unilateral Termination",
    "Confidentiality",
]

# Classification rule patterns mapping keywords / phrases to CUAD categories
_CUAD_RULES: List[Tuple[str, List[re.Pattern]]] = [
    ("Non-Compete", [
        re.compile(r"\bnon[\s\-]compete\b", re.I),
        re.compile(r"\brestraint\s+of\s+trade\b", re.I),
        re.compile(r"\bshall\s+not\s+(?:directly\s+or\s+indirectly\s+)?(?:engage|compete|work\s+for\s+any\s+compet)\b", re.I),
        re.compile(r"\bcompeting\s+(?:software|firm|business|enterprise)\b", re.I),
    ]),
    ("Liquidated Damages", [
        re.compile(r"\bliquidated\s+damages\b", re.I),
        re.compile(r"\bfinancial\s+penalty\b", re.I),
        re.compile(r"\bpenalty\s+of\s+inr\b", re.I),
        re.compile(r"\bdelay\s+penalty\b", re.I),
        re.compile(r"\bpre[\s\-]estimate\s+of\s+(?:loss|damages)\b", re.I),
    ]),
    ("IP Ownership Assignment", [
        re.compile(r"\bintellectual\s+property\s+assignment\b", re.I),
        re.compile(r"\bworks?\s+made\s+for\s+hire\b", re.I),
        re.compile(r"\bsole\s+and\s+exclusive\s+property\s+of\s+the\s+company\b", re.I),
        re.compile(r"\binventions?,\s+discoveries,\s+designs\b", re.I),
        re.compile(r"\bassigns?\s+(?:all\s+)?right,\s+title\s+and\s+interest\b", re.I),
    ]),
    ("Governing Law", [
        re.compile(r"\bgoverning\s+law\b", re.I),
        re.compile(r"\bjurisdiction\s+of\s+the\s+courts\b", re.I),
        re.compile(r"\blaws\s+of\s+india\b", re.I),
        re.compile(r"\bexclusive\s+jurisdiction\b", re.I),
        re.compile(r"\barbitration\s+and\s+conciliation\b", re.I),
    ]),
    ("Termination For Convenience", [
        re.compile(r"\bterminat(?:e|ion)\s+for\s+convenience\b", re.I),
        re.compile(r"\beither\s+party\s+may\s+terminate\b", re.I),
        re.compile(r"\bnotice\s+period\b", re.I),
        re.compile(r"\bgiving\s+\d+\s+(?:days|months)\s+prior\s+notice\b", re.I),
    ]),
    ("Unilateral Termination", [
        re.compile(r"\bunilateral(?:ly)?\b", re.I),
        re.compile(r"\bwithout\s+assigning\s+any\s+reason\b", re.I),
        re.compile(r"\breserves?\s+the\s+(?:sole\s+)?right\s+to\s+terminate\s+immediately\b", re.I),
    ]),
    ("Confidentiality", [
        re.compile(r"\bconfidentiality\b", re.I),
        re.compile(r"\btrade\s+secrets?\b", re.I),
        re.compile(r"\bnon[\s\-]disclosure\b", re.I),
        re.compile(r"\bmaintain\s+absolute\s+secrecy\b", re.I),
        re.compile(r"\bproprietary\s+information\b", re.I),
    ]),
    ("Cap On Liability", [
        re.compile(r"\bcap\s+on\s+liability\b", re.I),
        re.compile(r"\blimitation\s+of\s+liability\b", re.I),
        re.compile(r"\bliability\s+shall\s+not\s+exceed\b", re.I),
        re.compile(r"\bmaximum\s+aggregate\s+liability\b", re.I),
    ]),
    ("Uncapped Liability", [
        re.compile(r"\buncapped\s+liability\b", re.I),
        re.compile(r"\bwithout\s+limitation\s+as\s+to\s+amount\b", re.I),
        re.compile(r"\bno\s+cap\s+shall\s+apply\b", re.I),
    ]),
    ("Audit Rights", [
        re.compile(r"\baudit\s+rights?\b", re.I),
        re.compile(r"\bright\s+to\s+inspect\s+and\s+audit\b", re.I),
        re.compile(r"\bbooks\s+and\s+records\b", re.I),
    ]),
    ("Anti-Assignment", [
        re.compile(r"\banti[\s\-]assignment\b", re.I),
        re.compile(r"\bshall\s+not\s+assign\s+or\s+transfer\b", re.I),
        re.compile(r"\bwithout\s+(?:the\s+)?prior\s+written\s+consent\b", re.I),
        re.compile(r"\bsublet\s+the\s+premises\b", re.I),
    ]),
    ("Exclusivity", [
        re.compile(r"\bexclusivity\b", re.I),
        re.compile(r"\bexclusive\s+provider\b", re.I),
        re.compile(r"\bsole\s+and\s+exclusive\b", re.I),
    ]),
    ("No-Solicit Of Employees", [
        re.compile(r"\bno[\s\-]solicit(?:ation)?\s+of\s+employees\b", re.I),
        re.compile(r"\bshall\s+not\s+(?:solicit|entice|hire)\s+any\s+employee\b", re.I),
    ]),
    ("No-Solicit Of Customers", [
        re.compile(r"\bno[\s\-]solicit(?:ation)?\s+of\s+customers\b", re.I),
        re.compile(r"\bshall\s+not\s+(?:solicit|divert)\s+any\s+(?:client|customer)\b", re.I),
    ]),
    ("Renewal Term", [
        re.compile(r"\brenewal\s+term\b", re.I),
        re.compile(r"\bautomatically\s+renew\b", re.I),
        re.compile(r"\bextended\s+for\s+(?:an\s+additional|successive)\b", re.I),
    ]),
    ("Effective Date", [
        re.compile(r"\beffective\s+date\b", re.I),
        re.compile(r"\bcommencing\s+from\b", re.I),
        re.compile(r"\bshall\s+take\s+effect\s+on\b", re.I),
    ]),
    ("Parties", [
        re.compile(r"\bby\s+and\s+between\b", re.I),
        re.compile(r"\bparty\s+of\s+the\s+(?:first|second)\s+part\b", re.I),
        re.compile(r"\bhereinafter\s+referred\s+to\s+as\b", re.I),
    ]),
    ("Document Name", [
        re.compile(r"\bthis\s+(?:residential\s+lease|employment|master\s+services|commercial\s+lease)\s+agreement\b", re.I),
        re.compile(r"\bagreement\s+title\b", re.I),
    ]),
]


def classify_cuad_category(clause_text: str, section_title: str = "") -> Optional[str]:
    """Deterministically map a contract clause to one of CUAD's 41 official categories.
    
    Checks section title headings first for explicit legal naming, then scans body text.
    Returns the matching category string or 'General Obligation' if no specific category applies.
    """
    combined = f"{section_title} {clause_text}".strip()
    if not combined:
        return None

    # 1. Match section title first with high-precision keywords
    if section_title:
        st_lower = section_title.lower()
        if "license grant" in st_lower or ("license" in st_lower and "grant" in st_lower):
            return "License Grant"
        if "intellectual property" in st_lower or "ip ownership" in st_lower or "invention" in st_lower:
            return "IP Ownership Assignment"
        if "non-compete" in st_lower or "restrictive covenant" in st_lower:
            return "Non-Compete"
        if "liability" in st_lower or "cap" in st_lower:
            return "Cap On Liability"
        if "liquidated damages" in st_lower or "penalty" in st_lower:
            return "Liquidated Damages"
        if "audit" in st_lower:
            return "Audit Rights"
        if "termination" in st_lower and ("convenience" in st_lower or "notice" in st_lower):
            return "Termination For Convenience"
        if "assignment" in st_lower:
            return "Anti-Assignment"
        if "governing law" in st_lower or "dispute resolution" in st_lower or "jurisdiction" in st_lower:
            return "Governing Law"
        if "confidential" in st_lower:
            return "Confidentiality"

    # 2. Rule-based regex pattern match on combined text
    for category, patterns in _CUAD_RULES:
        for pat in patterns:
            if pat.search(combined):
                return category

    return "General Commercial Term"
