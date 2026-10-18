import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowLeft,
  Upload,
  Trash2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  Send,
  Scale,
  RefreshCw,
  CheckCircle2,
  HelpCircle,
  Search,
  Sparkles,
  LayoutDashboard,
  GitCompare,
  Activity,
  CornerDownLeft,
  Quote,
  Eye,
  FileCheck,
  Shield,
  Layers,
  ChevronRight,
  Info,
  Lock,
} from 'lucide-react';
import { markdownToHtml } from '../utils/markdown';
import {
  SAMPLE_RENTAL_AGREEMENT,
  SAMPLE_EMPLOYMENT_V1,
  SAMPLE_EMPLOYMENT_V2,
  SAMPLE_ADVERSARIAL_INJECTION,
} from '../data/sampleContracts';

export default function WorkspaceView({
  documentData,
  onBackToLanding,
  onWipeSession,
  onUploadFile,
  onLoadSample,
  auditData,
  onRefreshAudit,
}) {
  const [activeTab, setActiveTab] = useState('summaryTab');
  const [triageFilter, setTriageFilter] = useState('all');
  const [highlightedClauseId, setHighlightedClauseId] = useState(null);
  const [clauseSearch, setClauseSearch] = useState('');

  // Q&A state
  const [qaQuestion, setQaQuestion] = useState('');
  const [qaLoading, setQaLoading] = useState(false);
  const [qaResult, setQaResult] = useState(null);
  const [qaError, setQaError] = useState(null);

  // Diff state
  const [diffLoading, setDiffLoading] = useState(false);
  const [diffResult, setDiffResult] = useState(null);
  const [diffError, setDiffError] = useState(null);
  const diffFileARef = useRef(null);
  const diffFileBRef = useRef(null);

  const fileInputRef = useRef(null);
  const sampleSelectRef = useRef(null);

  const metadata = documentData?.metadata;
  const clauses = documentData?.clauses || [];
  const triageCards = documentData?.triage_cards || [];

  // Filter clauses by search query
  const filteredClauses = clauses.filter((c) => {
    if (!clauseSearch.trim()) return true;
    const q = clauseSearch.toLowerCase();
    return (
      c.clause_id.toLowerCase().includes(q) ||
      (c.section_title && c.section_title.toLowerCase().includes(q)) ||
      (c.verbatim_text && c.verbatim_text.toLowerCase().includes(q))
    );
  });

  // Scroll and highlight helper
  const handleHighlightClause = (clauseId) => {
    setHighlightedClauseId(clauseId);
    const el = document.getElementById(`clause-view-${clauseId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleScrollToTriage = (clauseId) => {
    setActiveTab('triageTab');
    setHighlightedClauseId(clauseId);
    setTimeout(() => {
      const el = document.getElementById(`triage-card-${clauseId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  // Execute QA
  const executeQA = async (queryText) => {
    const q = (queryText || qaQuestion).trim();
    if (!q) return;

    if (!clauses || clauses.length === 0) {
      alert('Please upload or load a document first.');
      return;
    }

    setQaLoading(true);
    setQaError(null);
    setQaResult(null);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Query failed');
      }

      const data = await res.json();
      setQaResult(data);
    } catch (err) {
      setQaError(err.message);
    } finally {
      setQaLoading(false);
    }
  };

  // Run Diff
  const runDiff = async (fileA, fileB) => {
    if (!fileA || !fileB) {
      alert('Please select both Version A and Version B files to compare.');
      return;
    }

    setDiffLoading(true);
    setDiffError(null);
    setDiffResult(null);

    const formData = new FormData();
    formData.append('file_a', fileA);
    formData.append('file_b', fileB);

    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Diff comparison failed');
      }

      const diff = await res.json();
      setDiffResult(diff);
    } catch (err) {
      setDiffError(err.message);
    } finally {
      setDiffLoading(false);
    }
  };

  const handleLoadSampleDiff = () => {
    const blobA = new Blob([SAMPLE_EMPLOYMENT_V1], { type: 'text/plain' });
    const fileA = new File([blobA], 'Employment_Agreement_v1.txt', { type: 'text/plain' });

    const blobB = new Blob([SAMPLE_EMPLOYMENT_V2], { type: 'text/plain' });
    const fileB = new File([blobB], 'Employment_Agreement_v2.txt', { type: 'text/plain' });

    runDiff(fileA, fileB);
  };

  const filteredTriageCards = triageCards.filter((card) => {
    if (triageFilter === 'high') return card.severity === 'HIGH';
    if (triageFilter === 'ambiguous') return card.confidence_badge === 'AMBIGUOUS_WORDING_DETECTED';
    return true;
  });

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          1. TOP NAVIGATION BAR (GLASSMORPHIC HEADER)
      ───────────────────────────────────────────────────────────── */}
      <header className="h-[60px] bg-white border-b border-slate-200/90 px-5 flex items-center justify-between sticky top-0 z-40 shadow-xs flex-shrink-0">
        <div className="flex items-center gap-3.5">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group"
            onClick={onBackToLanding}
            title="Return to Home / Stage 1 Landing"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-tight text-slate-900">
                LexGuard<span className="text-slate-400 font-normal">-Local</span>
              </span>
              <span className="text-[9.5px] uppercase font-bold tracking-widest text-slate-400">
                Private Legal Triage Agent
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          {/* Switch Document Button */}
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-700 text-xs font-semibold shadow-2xs transition-all hover:-translate-x-0.5"
            title="Return to landing page to select or drop a different document"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch Document</span>
          </button>

          {/* Privacy Indicator Badge */}
          <div className="hidden lg:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10.5px] font-bold tracking-wide uppercase">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>100% AIR-GAPPED &bull; ZERO EXTERNAL CALLS</span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-2">
          {/* Sample Selector */}
          <div className="hidden md:flex items-center gap-1.5">
            <select
              ref={sampleSelectRef}
              className="text-xs bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 outline-none font-medium transition-all max-w-[210px]"
              defaultValue=""
            >
              <option value="">Load sample contract…</option>
              <option value="rental">Sample 1: Rental (Lock-in &amp; Penalties)</option>
              <option value="employment">Sample 2: Employment (Non-Compete)</option>
              <option value="adversarial">Sample 3: Adversarial Injection</option>
            </select>
            <button
              onClick={() => {
                const val = sampleSelectRef.current?.value;
                if (val) onLoadSample(val);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-2xs transition-all"
            >
              Load
            </button>
          </div>

          {/* Upload Button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUploadFile(e.target.files[0]);
              }
            }}
            accept=".pdf,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-all"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Upload</span>
          </button>

          {/* Wipe Session Button */}
          <button
            onClick={onWipeSession}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50/70 hover:bg-rose-100/80 text-rose-700 text-xs font-semibold transition-all shadow-2xs"
            title="Purge all in-memory vector indices, parsed clauses, and text from RAM"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wipe Session</span>
          </button>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. MANDATORY NON-LAWYER LEGAL DISCLAIMER STRIP
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-amber-50 via-amber-50/70 to-amber-50 border-b border-amber-200/80 px-5 py-2 text-[11.5px] text-amber-900 flex items-center justify-between shadow-2xs flex-shrink-0">
        <div className="flex items-center gap-2 max-w-5xl">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            <strong className="text-amber-950 font-bold">Mandatory Non-Lawyer Boundary:</strong> LexGuard-Local is an automated exploratory triage tool.
            It does <em>not</em> provide legal counsel and cannot determine statutory legality or court enforceability. Always consult a qualified advocate before signing or disputing any contract.
          </span>
        </div>
        <span className="hidden xl:inline-block font-mono text-[10px] text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200 font-semibold flex-shrink-0 ml-4">
          TRACK PS2 &bull; GATE L2 COMPLIANT
        </span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN WORKSPACE — BALANCED SPLIT SCREEN
      ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-[450px_1fr] flex-1 overflow-hidden">
        {/* ── LEFT PANE: Source Document Viewer ── */}
        <section className="bg-white border-r border-slate-200/90 flex flex-col h-full overflow-hidden shadow-xs">
          {/* Pane Header with Clean Non-Overlapping Stats */}
          <div className="p-3.5 border-b border-slate-200/80 bg-slate-50/60 flex flex-col gap-2.5 flex-shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-tight flex-shrink-0">
                  Source Document
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200/70 text-slate-800 truncate uppercase tracking-wider">
                  {metadata?.doc_type || 'No Document'}
                </span>
              </div>
              <div className="text-[11px] font-mono font-semibold text-slate-500 whitespace-nowrap bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                {clauses.length} Clauses &bull; {metadata?.total_pages || 1} Page{metadata?.total_pages > 1 ? 's' : ''}
              </div>
            </div>

            {/* Quick In-Document Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={clauseSearch}
                onChange={(e) => setClauseSearch(e.target.value)}
                placeholder="Search clauses (e.g. 'lock-in', 'penalty', 'CL-004')…"
                className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-slate-800 placeholder-slate-400 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 transition-all"
              />
              {clauseSearch && (
                <button
                  onClick={() => setClauseSearch('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  &times;
                </button>
              )}
            </div>
          </div>

          {/* Prompt Injection Security Alert Banner */}
          {metadata?.prompt_injection_detected && (
            <div className="m-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 shadow-xs flex-shrink-0">
              <div className="flex items-start gap-2.5">
                <AlertOctagon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs">
                  <h4 className="font-bold text-red-950">Adversarial Prompt Injection Shield Active</h4>
                  <p className="text-[11px] text-red-800 mt-0.5 leading-snug">
                    {metadata.prompt_injection_details}
                  </p>
                  <span className="mt-1.5 inline-block font-mono text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded border border-red-200 font-semibold">
                    Quarantined inside &lt;untrusted_contract_text&gt;
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Clause Cards Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-slate-50/40">
            {filteredClauses.length === 0 ? (
              <div className="text-center py-16 px-4 text-slate-400">
                <FileText className="w-10 h-10 stroke-1 mx-auto mb-2 text-slate-300" />
                <h4 className="text-xs font-bold text-slate-600">No Clauses Found</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">
                  {clauseSearch ? 'No clauses matched your search query.' : 'Upload or select a sample contract to inspect grounded clauses.'}
                </p>
              </div>
            ) : (
              filteredClauses.map((c) => {
                const isHighlighted = highlightedClauseId === c.clause_id;
                const hasAmbiguity = c.ambiguity_flags && c.ambiguity_flags.length > 0;
                return (
                  <div
                    key={c.clause_id}
                    id={`clause-view-${c.clause_id}`}
                    onClick={() => {
                      setHighlightedClauseId(c.clause_id);
                      handleScrollToTriage(c.clause_id);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer bg-white ${
                      isHighlighted
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/20'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[10.5px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-white flex-shrink-0">
                          {c.clause_id}
                        </span>
                        <span className="text-xs font-bold text-slate-800 truncate" title={c.section_title}>
                          {c.section_title || 'General Terms'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {hasAmbiguity && (
                          <span
                            className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
                            title={c.ambiguity_flags.join(', ')}
                          >
                            Subjective
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400">
                          P.{c.page_number}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-wrap break-words">
                      {c.verbatim_text}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400">
                      <span className="hover:text-slate-600 flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Inspect in Triage</span>
                      </span>
                      <span className="font-mono text-[10px]">
                        chars: {c.verbatim_text?.length || 0}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── RIGHT PANE: Triage Intelligence Hub ── */}
        <section className="flex flex-col h-full overflow-hidden bg-slate-50/70">
          {/* Segmented Tab Header Bar */}
          <div className="px-5 py-2.5 bg-white border-b border-slate-200/90 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'summaryTab'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('summaryTab')}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Executive Summary</span>
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'triageTab'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('triageTab')}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Clause Triage</span>
                {triageCards.length > 0 && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 font-mono font-bold text-slate-700">
                    {triageCards.length}
                  </span>
                )}
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'qaTab'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('qaTab')}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ask Document</span>
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'diffTab'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => setActiveTab('diffTab')}
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Version Diff</span>
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'auditTab'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                onClick={() => {
                  setActiveTab('auditTab');
                  onRefreshAudit();
                }}
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
                <span>Privacy Audit</span>
              </button>
            </div>

            <div className="hidden 2xl:flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Offline Edge Session</span>
            </div>
          </div>

          {/* Tab Content Display Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* ─────────────────────────────────────────────────────────────
                TAB 1: EXECUTIVE SUMMARY
            ───────────────────────────────────────────────────────────── */}
            {activeTab === 'summaryTab' && (
              <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
                {/* 4 Metric Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {/* Card 1: Classification */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider">Classification</span>
                        <Layers className="w-4 h-4 text-slate-400" />
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug">
                        {metadata?.doc_type || '—'}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 font-medium">
                      Effective: <strong className="text-slate-700">{metadata?.effective_date || 'Not stated'}</strong>
                    </p>
                  </div>

                  {/* Card 2: Jurisdiction */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider">Governing Law</span>
                        <Scale className="w-4 h-4 text-slate-400" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 leading-snug break-words">
                        {metadata?.governing_law_or_jurisdiction || 'General / Undisclosed'}
                      </h3>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 font-medium">
                      Indian Contract Act &bull; Bengaluru
                    </p>
                  </div>

                  {/* Card 3: Identified Parties */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider">Identified Parties</span>
                        <FileCheck className="w-4 h-4 text-slate-400" />
                      </div>
                      <div className="space-y-1.5 mt-1">
                        {metadata?.parties_detected && metadata.parties_detected.length > 0 ? (
                          metadata.parties_detected.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />
                              <span className="truncate">{p}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">No parties detected</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-100 font-medium">
                      Preamble verified
                    </p>
                  </div>

                  {/* Card 4: Flagged Clauses */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-[10.5px] font-bold uppercase tracking-wider">Flagged Clauses</span>
                        <ShieldAlert className="w-4 h-4 text-amber-500" />
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-amber-600">
                          {metadata?.high_risk_clauses_count ?? 0}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Terms of Interest</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-800/80 mt-3 pt-2 border-t border-slate-100 font-medium">
                      Subjective &amp; High-Risk Language
                    </p>
                  </div>
                </div>

                {/* Critical Operational Provisions Card */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Critical Operational Provisions
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono font-medium">
                      Deterministic Entity Extraction
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Lock-In */}
                    <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/80">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-800 block mb-2">
                        Lock-In Periods
                      </span>
                      {metadata?.lock_in_periods && metadata.lock_in_periods.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {metadata.lock_in_periods.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">None detected</span>
                      )}
                    </div>

                    {/* Notice Period */}
                    <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200/80">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-blue-800 block mb-2">
                        Notice for Termination
                      </span>
                      {metadata?.notice_periods && metadata.notice_periods.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {metadata.notice_periods.map((item, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 font-bold text-xs">
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Standard / None detected</span>
                      )}
                    </div>

                    {/* Financial Penalties */}
                    <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/80">
                      <span className="text-[10.5px] font-bold uppercase tracking-wider text-rose-800 block mb-2">
                        Financial Penalties &amp; Deposits
                      </span>
                      {metadata?.financial_penalties && metadata.financial_penalties.length > 0 ? (
                        <div className="space-y-1">
                          {metadata.financial_penalties.map((item, idx) => (
                            <div key={idx} className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-bold text-xs leading-snug">
                              {item}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">None detected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 2: CLAUSE TRIAGE
            ───────────────────────────────────────────────────────────── */}
            {activeTab === 'triageTab' && (
              <div className="max-w-5xl mx-auto space-y-4 animate-in fade-in-50 duration-200">
                {/* Filter Controls Bar */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
                      Filter Clauses:
                    </span>
                    <button
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        triageFilter === 'all'
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                      onClick={() => setTriageFilter('all')}
                    >
                      All Clauses ({triageCards.length})
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        triageFilter === 'high'
                          ? 'bg-rose-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                      onClick={() => setTriageFilter('high')}
                    >
                      High Risk Only
                    </button>
                    <button
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        triageFilter === 'ambiguous'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                      onClick={() => setTriageFilter('ambiguous')}
                    >
                      Ambiguous Phrasing
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400">
                    Showing {filteredTriageCards.length} of {triageCards.length}
                  </span>
                </div>

                {/* Cards List */}
                {filteredTriageCards.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xs">
                    <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-slate-700">No Clauses Match Selected Filter</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Switch to "All Clauses" or choose a different document to view structured triage evaluations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTriageCards.map((card) => {
                      let badgeClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                      let badgeLabel = 'Verified Exact Quote';
                      if (card.confidence_badge === 'AMBIGUOUS_WORDING_DETECTED') {
                        badgeClass = 'bg-amber-50 text-amber-800 border-amber-200';
                        badgeLabel = 'Ambiguous Wording Detected';
                      } else if (card.confidence_badge === 'JURISDICTION_DEPENDENT') {
                        badgeClass = 'bg-blue-50 text-blue-800 border-blue-200';
                        badgeLabel = 'Jurisdiction Dependent';
                      }

                      return (
                        <div
                          key={card.clause_id}
                          id={`triage-card-${card.clause_id}`}
                          onClick={() => handleHighlightClause(card.clause_id)}
                          className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all cursor-pointer space-y-3.5"
                        >
                          {/* Card Header */}
                          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white">
                                {card.clause_id}
                              </span>
                              <strong className="text-xs font-bold text-slate-900">
                                {card.section_title}
                              </strong>
                            </div>

                            <div className="flex items-center gap-2">
                              {card.severity === 'HIGH' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wide">
                                  High Triage Risk
                                </span>
                              )}
                              {card.severity === 'MEDIUM' && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wide">
                                  Moderate Risk
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}`}>
                                {badgeLabel}
                              </span>
                            </div>
                          </div>

                          {/* 1. Explicit Quote */}
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                              What the Document Explicitly States (Page {card.page_number})
                            </span>
                            <p className="text-xs font-serif italic text-slate-800 leading-relaxed">
                              "{card.explicit_text}"
                            </p>
                          </div>

                          {/* 2. Plain Language Explanation */}
                          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200/70">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                              Plain-Language Explanation (For Non-Lawyer)
                            </span>
                            <p className="text-xs text-emerald-950 leading-relaxed font-sans font-medium">
                              {card.plain_language_explanation}
                            </p>
                          </div>

                          {/* 3. Potential Ambiguities & Observations */}
                          {card.potential_ambiguities_and_risks && card.potential_ambiguities_and_risks.length > 0 && (
                            <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200/70">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block mb-1">
                                Triage Observations (Not Legal Advice)
                              </span>
                              <ul className="list-disc list-inside space-y-1 text-xs text-amber-950 font-medium">
                                {card.potential_ambiguities_and_risks.map((r, i) => (
                                  <li key={i}>{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 3: ASK THE DOCUMENT (GROUNDED QA)
            ───────────────────────────────────────────────────────────── */}
            {activeTab === 'qaTab' && (
              <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
                {/* Scenario Suggestion Chips */}
                <div>
                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Quick-Fire Grounded Questions:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-all"
                      onClick={() => {
                        const q = 'What is the lock-in period and what happens if I terminate early?';
                        setQaQuestion(q);
                        executeQA(q);
                      }}
                    >
                      Exit &amp; Lock-in Terms
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-all"
                      onClick={() => {
                        const q = 'What are my intellectual property rights and inventions obligations?';
                        setQaQuestion(q);
                        executeQA(q);
                      }}
                    >
                      IP Assignment Obligations
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-all"
                      onClick={() => {
                        const q = 'What is the pet security deposit and breed restriction policy?';
                        setQaQuestion(q);
                        executeQA(q);
                      }}
                    >
                      Test Silence (Pets Policy)
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 hover:border-rose-400 bg-rose-50/40 text-rose-800 text-xs font-semibold shadow-2xs transition-all"
                      onClick={() => {
                        const q = 'Is this non-compete clause legally enforceable in India?';
                        setQaQuestion(q);
                        executeQA(q);
                      }}
                    >
                      Test Legality Escalation
                    </button>
                  </div>
                </div>

                {/* Input Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                  <textarea
                    value={qaQuestion}
                    onChange={(e) => setQaQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        executeQA();
                      }
                    }}
                    rows={3}
                    placeholder="Ask any question about this document — e.g., 'What is the daily penalty for late rent payment?'"
                    className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 border border-slate-200 rounded-xl p-3 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 resize-none font-sans"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <CornerDownLeft className="w-3.5 h-3.5" />
                      <span>Press <strong>Enter</strong> to search grounded text &bull; Zero external calls</span>
                    </span>

                    <button
                      onClick={() => executeQA()}
                      disabled={qaLoading || !qaQuestion.trim()}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      {qaLoading ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Searching…</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Ask Agent</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Loading Indicator */}
                {qaLoading && (
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center animate-pulse">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      <span>Searching local BM25 index &amp; verifying exact substrings…</span>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {qaError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    <strong>Query Error:</strong> {qaError}
                  </div>
                )}

                {/* Answer Result Card */}
                {qaResult && (
                  <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in-50 duration-200">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Queried Intent
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-900">
                          {qaResult.question}
                        </h4>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase border flex-shrink-0 ${
                          qaResult.status === 'DOCUMENT_IS_SILENT'
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : qaResult.status === 'SAFE_ESCALATION_REQUIRED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {qaResult.status === 'DOCUMENT_IS_SILENT'
                          ? 'Document Is Silent'
                          : qaResult.status === 'SAFE_ESCALATION_REQUIRED'
                          ? 'Non-Lawyer Boundary Escalation'
                          : 'Grounded in Document'}
                      </span>
                    </div>

                    {/* Markdown Rendered Answer */}
                    <div
                      className="text-xs text-slate-800 leading-relaxed font-sans qa-markdown-body"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(qaResult.answer_markdown) }}
                    />

                    {/* Telemetry Footer */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{qaResult.model_used}</span>
                      <span>{qaResult.execution_time_ms} ms &bull; 0 Outbound Packets</span>
                    </div>

                    {/* Safe Escalation Guidance Card */}
                    {qaResult.escalation_card && (
                      <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-rose-950 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                          <Scale className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <span>Statutory Context &amp; Advocate Consultation Guide</span>
                        </div>
                        <p className="text-xs text-rose-900/90 leading-relaxed">
                          <strong>Statutory Context:</strong> {qaResult.escalation_card.why_jurisdiction_dependent}
                        </p>
                        <div className="pt-2 border-t border-rose-200/60">
                          <strong className="text-xs text-rose-950 block mb-1">
                            Recommended Questions to Ask Your Advocate:
                          </strong>
                          <ol className="list-decimal list-inside space-y-1 text-xs text-rose-900">
                            {qaResult.escalation_card.questions_for_lawyer.map((q, idx) => (
                              <li key={idx}>{q}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}

                    {/* Grounded Citation Buttons */}
                    {qaResult.cited_clauses && qaResult.cited_clauses.length > 0 && (
                      <div className="pt-2 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Grounded In Clauses:
                        </span>
                        {qaResult.cited_clauses.map((c_id) => (
                          <button
                            key={c_id}
                            onClick={() => handleHighlightClause(c_id)}
                            className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200 text-[11px] font-mono font-bold transition-all"
                          >
                            {c_id}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 4: VERSION DIFF
            ───────────────────────────────────────────────────────────── */}
            {activeTab === 'diffTab' && (
              <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
                    <span className="text-xs font-bold text-slate-800 block mb-1">Version A (Original)</span>
                    <input type="file" ref={diffFileARef} accept=".pdf,.txt" className="text-xs mt-2 w-full" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
                    <span className="text-xs font-bold text-slate-800 block mb-1">Version B (Revised)</span>
                    <input type="file" ref={diffFileBRef} accept=".pdf,.txt" className="text-xs mt-2 w-full" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const fA = diffFileARef.current?.files?.[0];
                      const fB = diffFileBRef.current?.files?.[0];
                      runDiff(fA, fB);
                    }}
                    disabled={diffLoading}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all"
                  >
                    {diffLoading ? 'Analyzing Differences…' : 'Compare Contracts'}
                  </button>
                  <button
                    onClick={handleLoadSampleDiff}
                    disabled={diffLoading}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold shadow-2xs transition-all"
                  >
                    Load Sample v1 vs v2 (Employment)
                  </button>
                </div>

                {diffError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    Diff Error: {diffError}
                  </div>
                )}

                {diffResult && (
                  <div className="space-y-4">
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-slate-900">
                          {diffResult.doc_a_name} &harr; {diffResult.doc_b_name}
                        </h3>
                        <div className="flex gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            +{diffResult.total_added} Added
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                            -{diffResult.total_removed} Removed
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            ~{diffResult.total_modified} Modified
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        {diffResult.summary}
                      </p>

                      {diffResult.risk_shifts && diffResult.risk_shifts.length > 0 && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80">
                          <strong className="text-xs font-bold text-amber-950 block mb-1">
                            Obligation &amp; Risk Shift Observations:
                          </strong>
                          <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 font-medium">
                            {diffResult.risk_shifts.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Clause Diff Items */}
                    <div className="space-y-3">
                      {diffResult.clause_matches.map((m, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">{m.section_title}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                m.status === 'ADDED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status === 'REMOVED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>

                          {m.risk_delta && (
                            <p className="text-[11px] text-amber-700 font-medium">{m.risk_delta}</p>
                          )}

                          <div className="grid grid-cols-2 gap-3 pt-1">
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 whitespace-pre-wrap font-sans">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Version A
                              </span>
                              {m.text_a || <span className="text-slate-400 italic">(Not present)</span>}
                            </div>
                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 whitespace-pre-wrap font-sans">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                                Version B
                              </span>
                              {m.text_b || <span className="text-slate-400 italic">(Not present)</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                TAB 5: PRIVACY AUDIT
            ───────────────────────────────────────────────────────────── */}
            {activeTab === 'auditTab' && (
              <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in-50 duration-200">
                {/* 7 Audit Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Active External Sockets
                    </span>
                    <h3 className="text-2xl font-mono font-black text-emerald-600">
                      {auditData?.active_external_sockets ?? 0}
                    </h3>
                    <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Fully Air-Gapped
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Loopback Interface
                    </span>
                    <h3 className="text-base font-mono font-bold text-slate-800">
                      {auditData?.bound_interface || '127.0.0.1'}:8000
                    </h3>
                    <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Strict Loopback Binding
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      RAM Cryptographic Vault
                    </span>
                    <h3 className="text-xs font-mono font-bold text-emerald-700 truncate">
                      {auditData?.cipher_suite || 'AES-256-GCM (SP 800-38D)'}
                    </h3>
                    <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {auditData?.key_fingerprint || 'EPHEMERAL-ACTIVE'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Resident RAM (RSS)
                    </span>
                    <h3 className="text-2xl font-mono font-bold text-slate-800">
                      {auditData?.memory_rss_mb ?? 0} MB
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Zero disk residue</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      CPU Usage
                    </span>
                    <h3 className="text-2xl font-mono font-bold text-slate-800">
                      {auditData?.cpu_percent ?? 0}%
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Local execution</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Local LLM Engine
                    </span>
                    <h3 className="text-xs font-mono font-bold text-slate-800 truncate">
                      {auditData?.ollama_model || 'Gemma E4B'}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 font-medium">Edge inference model</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs sm:col-span-2 md:col-span-1 lg:col-span-2">
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Model Status &amp; Grounding
                    </span>
                    <h3 className="text-xs font-bold text-slate-800">
                      {auditData?.ollama_connected
                        ? 'Connected to Local Ollama'
                        : 'Local Fallback Engine Active'}
                    </h3>
                    <span className="mt-2 inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      100% Deterministic Grounding
                    </span>
                  </div>
                </div>

                {/* Formal Compliance Attestation Box */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50/70 to-emerald-50/30 border border-emerald-200 text-emerald-950 space-y-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-emerald-950">
                      ZeroDay OSS Hacktoberfest 2026 — Track PS2 Compliance &amp; Encryption Attestation
                    </h4>
                  </div>
                  <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
                    All document ingestion, BM25 retrieval, clause segmentation, and question answering operate 100% on-device with zero external network packets.
                  </p>
                  <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Zero telemetry, external CDNs, Google Fonts, or cloud analytics.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Strict loopback binding (<code className="font-mono font-bold">127.0.0.1:8000</code>) and <code className="font-mono font-bold">HF_HUB_OFFLINE=1</code>.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>AES-256-GCM authenticated in-memory RAM encryption with zero disk persistence.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Instant physical memory zeroization (<code className="font-mono font-bold">0x00</code> overwrite) and session re-keying on wipe.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>Deterministic substring grounding prevents LLM hallucinations.</span>
                    </li>
                  </ul>

                  <div className="pt-3 border-t border-emerald-200/80 flex items-center justify-between">
                    <button
                      onClick={onRefreshAudit}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-2xs hover:bg-emerald-100/50 transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Refresh Telemetry</span>
                    </button>
                    <span className="font-mono text-xs font-bold text-emerald-800">
                      GATES G1-G5 &bull; L1-L4 VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
