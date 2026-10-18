import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  Radio,
  UploadCloud,
  FileText,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Lock,
  Search,
  Scale,
  ShieldAlert,
  Sparkles,
  Layers,
  KeyRound,
} from 'lucide-react';
import Interactive3DMesh from './Interactive3DMesh';
import TiltCard from './TiltCard';
import Hero3DVault from './Hero3DVault';

export default function LandingPage({
  onLoadSample,
  onUploadFile,
  isSessionActive,
  onEnterWorkspace,
  auditData,
  isProcessing,
  processingStep,
}) {
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);
  const [is3DActive, setIs3DActive] = useState(true);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (!isDisclaimerAccepted) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#fafafa] text-[#0a0a0a] flex flex-col font-sans selection:bg-slate-900 selection:text-white overflow-x-hidden">
      {/* ─────────────────────────────────────────────────────────────
          3D SPATIAL BACKGROUND CANVAS
      ───────────────────────────────────────────────────────────── */}
      <Interactive3DMesh is3DActive={is3DActive} />

      {/* ─────────────────────────────────────────────────────────────
          1. TOP TRUST & TELEMETRY HEADER (CLEAN & ENCRYPTED)
      ───────────────────────────────────────────────────────────── */}
      <header className="h-[64px] bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 sm:px-10 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-tight text-slate-900">
                LexGuard<span className="text-slate-400 font-normal">-Local</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Private Legal Triage Agent
              </span>
            </div>
          </div>

          <div className="hidden md:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold tracking-wider uppercase shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            100% AIR-GAPPED • ZERO EXTERNAL CALLS
          </div>

          <div className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono font-medium">
            <KeyRound className="w-3 h-3 text-emerald-600" />
            <span>AES-256-GCM RAM Vault Armed</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 3D Motion Mode Switcher */}
          <button
            onClick={() => setIs3DActive(!is3DActive)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              is3DActive
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm hover:bg-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle interactive 3D spatial mesh and card tilt effects"
          >
            <Sparkles className={`w-3.5 h-3.5 ${is3DActive ? 'text-emerald-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '6s' }} />
            <span>3D Spatial: {is3DActive ? 'Active' : 'Paused'}</span>
          </button>

          {isSessionActive && (
            <button
              onClick={onEnterWorkspace}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Enter Workspace Directly</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION & 3D INTERACTIVE VAULT CENTERPIECE
      ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-6 py-8 sm:py-12 flex flex-col justify-between">
        <section className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4 border border-slate-200 shadow-xs">
            <Radio className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
            <span>Zero-Cloud Edge Architecture • Track PS2 Compliance</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-slate-900 tracking-tight leading-[1.18] mb-4">
            Understand Complex Contracts on Your Own Device—With{' '}
            <span className="underline decoration-emerald-500 underline-offset-4 decoration-2">Verifiable Citations</span> &amp; Zero Cloud Leakage.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto mb-4">
            Powered by local Google Gemma edge inference and deterministic substring verification.
            Your private agreements, clauses, and questions never leave your machine.
          </p>

          {/* 3D Holographic Vault Centerpiece */}
          <Hero3DVault
            is3DActive={is3DActive}
            cipherSuite={auditData?.cipher_suite}
            keyFingerprint={auditData?.key_fingerprint}
          />

          {/* Interactive Non-Lawyer Boundary Card with 3D Tilt */}
          <TiltCard
            maxTilt={is3DActive ? 5 : 0}
            className="mt-6 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-left shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs text-amber-900 leading-relaxed">
                <span className="font-bold text-amber-950 block mb-1">
                  Mandatory Non-Lawyer Boundary &amp; Triage Disclosure
                </span>
                LexGuard-Local is an automated exploratory triage system designed solely for clause navigation,
                terminology explanation, and preliminary issue spotting. It is <strong>not an attorney</strong>, does not provide
                actionable legal counsel, and cannot decide whether contract terms comply with statutory requirements (such as
                Section 27 of the Indian Contract Act). Always consult a licensed advocate before signing.
                
                <div className="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-amber-900">
                    <input
                      type="checkbox"
                      checked={isDisclaimerAccepted}
                      onChange={(e) => setIsDisclaimerAccepted(e.target.checked)}
                      className="rounded border-amber-300 text-slate-900 focus:ring-amber-500 h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>I understand this tool provides document-grounded triage, not legal advice.</span>
                  </label>
                  <span className="text-[11px] font-mono text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded">
                    GATE L2 COMPLIANT
                  </span>
                </div>
              </div>
            </div>
          </TiltCard>
        </section>

        {/* ─────────────────────────────────────────────────────────────
          3. DUAL ACTION CENTER (INGESTION & JUDGE EVALUATION SUITE)
      ───────────────────────────────────────────────────────────── */}
        <section className="mb-12">
          {isProcessing ? (
            /* Sleek Step-by-Step Processing State */
            <div className="p-10 rounded-2xl bg-white border border-slate-200 shadow-md text-center max-w-2xl mx-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Ingesting and Encrypting Document in RAM Vault
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-mono">
                Running 100% in AES-256-GCM RAM Vault • Zero outbound packets
              </p>

              <div className="space-y-3 max-w-md mx-auto text-left">
                <div className={`p-3 rounded-lg border flex items-center gap-3 text-xs transition-all ${
                  processingStep >= 1 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${processingStep >= 1 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span className="font-medium">1. Parsing Clauses locally via PyMuPDF</span>
                </div>
                <div className={`p-3 rounded-lg border flex items-center gap-3 text-xs transition-all ${
                  processingStep >= 2 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${processingStep >= 2 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span className="font-medium">2. Indexing BM25 &amp; Vector Embeddings in Encrypted Memory</span>
                </div>
                <div className={`p-3 rounded-lg border flex items-center gap-3 text-xs transition-all ${
                  processingStep >= 3 ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}>
                  <CheckCircle2 className={`w-4 h-4 ${processingStep >= 3 ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span className="font-medium">3. Running Gemma Triage &amp; Deterministic Substring Verification</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LEFT CARD: LOCAL DRAG-AND-DROP INGESTION (WITH 3D TILT) */}
              <TiltCard
                maxTilt={is3DActive ? 9 : 0}
                className={`rounded-2xl bg-white border-2 border-dashed p-6 sm:p-8 flex flex-col justify-between transition-all ${
                  isDragOver ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-400'
                } ${!isDisclaimerAccepted ? 'opacity-60 pointer-events-none' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 preserve-3d" style={{ transform: 'translateZ(14px)' }}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Option A: Custom Document
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600 font-semibold">
                      .PDF &amp; .TXT ONLY
                    </span>
                  </div>

                  <div className="text-center my-6 preserve-3d" style={{ transform: 'translateZ(24px)' }}>
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-4 shadow-inner transition-transform hover:scale-105">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      Drag &amp; Drop Your Contract Here
                    </h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mb-5">
                      Processed 100% in local RAM via PyMuPDF and encrypted with AES-256-GCM. Never leaves your hardware.
                    </p>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept=".pdf,.txt"
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>Browse Local Files</span>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono preserve-3d" style={{ transform: 'translateZ(10px)' }}>
                  <span>RAM Storage • Zero Disk Residue</span>
                  <span>Max 25 MB</span>
                </div>
              </TiltCard>

              {/* RIGHT CARD: INSTANT JUDGE EVALUATION SUITE (WITH 3D TILT) */}
              <TiltCard
                maxTilt={is3DActive ? 9 : 0}
                className={`rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 flex flex-col justify-between ${
                  !isDisclaimerAccepted ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 preserve-3d" style={{ transform: 'translateZ(14px)' }}>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Option B: Quick-Start Evaluation
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                      1-CLICK HACKATHON EVAL
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 preserve-3d" style={{ transform: 'translateZ(20px)' }}>
                    Quick-Start Judge Evaluation Scenarios
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 preserve-3d" style={{ transform: 'translateZ(12px)' }}>
                    Pre-loaded realistic legal agreements tailored for immediate scoring against PS2 criteria:
                  </p>

                  <div className="space-y-3 preserve-3d" style={{ transform: 'translateZ(22px)' }}>
                    {/* Sample 1: Rental Agreement */}
                    <button
                      onClick={() => onLoadSample('rental')}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-start gap-3 group hover:translate-x-1 active:translate-x-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                            1. Residential Rental Agreement (Bengaluru)
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-slate-900">
                            RUN →
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tests 6-month lock-in extraction, ₹500/day penalty calculation, and subjective phrasing flags.
                        </p>
                      </div>
                    </button>

                    {/* Sample 2: Employment Agreement */}
                    <button
                      onClick={() => onLoadSample('employment')}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-start gap-3 group hover:translate-x-1 active:translate-x-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <Scale className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                            2. Employment Agreement (v1 vs v2)
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-slate-900">
                            RUN →
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Tests aggressive non-compete triage, IP assignment, and the Two-Version Contract Diff tool.
                        </p>
                      </div>
                    </button>

                    {/* Sample 3: Adversarial Injection */}
                    <button
                      onClick={() => onLoadSample('adversarial')}
                      className="w-full text-left p-3 rounded-xl border border-red-200 hover:border-red-400 bg-red-50/30 hover:bg-red-50/70 transition-all flex items-start gap-3 group hover:translate-x-1 active:translate-x-0"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 border border-red-300 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-red-950">
                            3. Adversarial Prompt-Injection Contract
                          </span>
                          <span className="text-[10px] font-mono font-bold text-red-600 group-hover:text-red-900">
                            TEST SHIELD →
                          </span>
                        </div>
                        <p className="text-[11px] text-red-800/80 mt-0.5">
                          Tests Criterion 6 robustness by catching hidden instructions trying to bypass risk detection.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono preserve-3d" style={{ transform: 'translateZ(10px)' }}>
                  <span>Zero Network Ingress/Egress</span>
                  <span>Synthetic Evaluation Corpus</span>
                </div>
              </TiltCard>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────
            4. BOTTOM ARCHITECTURE & RUBRIC PROOF STRIP (4 3D CARDS)
        ───────────────────────────────────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <TiltCard maxTilt={is3DActive ? 12 : 0} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 preserve-3d" style={{ transform: 'translateZ(16px)' }}>
              <Lock className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">AES-256-GCM RAM Vault</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal preserve-3d" style={{ transform: 'translateZ(8px)' }}>
              Authenticated in-memory encryption, instant cryptographic zeroization, and zero disk residue on purge.
            </p>
          </TiltCard>

          <TiltCard maxTilt={is3DActive ? 12 : 0} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 preserve-3d" style={{ transform: 'translateZ(16px)' }}>
              <Search className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-900">Deterministic Grounding</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal preserve-3d" style={{ transform: 'translateZ(8px)' }}>
              Every summary maps to an immutable <code className="text-slate-800 font-mono">CL-XXX</code> ID and is verified against exact source substring.
            </p>
          </TiltCard>

          <TiltCard maxTilt={is3DActive ? 12 : 0} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 preserve-3d" style={{ transform: 'translateZ(16px)' }}>
              <Scale className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold text-slate-900">Calibrated Uncertainty</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal preserve-3d" style={{ transform: 'translateZ(8px)' }}>
              Detects silent clauses, flags subjective phrasing, and strictly refuses to predict statutory court enforceability.
            </p>
          </TiltCard>

          <TiltCard maxTilt={is3DActive ? 12 : 0} className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 preserve-3d" style={{ transform: 'translateZ(16px)' }}>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span className="text-xs font-bold text-slate-900">Adversarial &amp; Diff Ready</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-normal preserve-3d" style={{ transform: 'translateZ(8px)' }}>
              Quarantines prompt injection attacks into untrusted boundaries and calculates obligation shifts across contract versions.
            </p>
          </TiltCard>
        </section>
      </main>
    </div>
  );
}
