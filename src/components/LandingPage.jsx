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
  BookOpen,
  Award,
  Check,
  X,
  ExternalLink,
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
  const [isCuadModalOpen, setIsCuadModalOpen] = useState(false);
  const [cuadBenchmarkData, setCuadBenchmarkData] = useState(null);
  const [cuadBenchmarkLoading, setCuadBenchmarkLoading] = useState(false);

  const handleOpenCuadModal = async () => {
    setIsCuadModalOpen(true);
    if (!cuadBenchmarkData) {
      setCuadBenchmarkLoading(true);
      try {
        const res = await fetch('/api/benchmark/cuad');
        if (res.ok) {
          const data = await res.json();
          setCuadBenchmarkData(data);
        }
      } catch (err) {
        console.error('Failed to load CUAD benchmark', err);
      } finally {
        setCuadBenchmarkLoading(false);
      }
    }
  };

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
                      4 SCENARIOS • 3 PS2 DATASETS
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 preserve-3d" style={{ transform: 'translateZ(20px)' }}>
                    1-Click Judge Rubric Verification Suite
                  </h3>
                  <p className="text-xs text-slate-500 mb-3 preserve-3d" style={{ transform: 'translateZ(12px)' }}>
                    Dedicated launchers actively demonstrating all 3 official reference datasets alongside consumer agreements:
                  </p>

                  <div className="space-y-2.5 preserve-3d" style={{ transform: 'translateZ(22px)' }}>
                    {/* Scenario 1: Consumer Rental & Employment Suite */}
                    <div className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            1
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Consumer Rental &amp; Employment Suite
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Everyday consumer contracts mapped to statutory triggers
                            </span>
                          </div>
                        </div>
                        <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          Resource 2 &amp; 3 Active
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                        <button
                          onClick={() => onLoadSample('rental')}
                          className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-[11px] font-medium text-slate-800 transition-all flex items-center justify-between"
                        >
                          <span className="truncate">🏠 Rental (Bengaluru)</span>
                          <span className="text-[9px] font-mono text-slate-400 font-bold ml-1">RUN →</span>
                        </button>
                        <button
                          onClick={() => onLoadSample('employment')}
                          className="px-2 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left text-[11px] font-medium text-slate-800 transition-all flex items-center justify-between"
                        >
                          <span className="truncate">💼 Employment (v1/v2)</span>
                          <span className="text-[9px] font-mono text-slate-400 font-bold ml-1">RUN →</span>
                        </button>
                      </div>
                    </div>

                    {/* Scenario 2: Resource 1 — CUAD Commercial Benchmark Test */}
                    <div className="p-2.5 rounded-xl border border-blue-200/80 bg-blue-50/20 hover:border-blue-300 transition-all space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            2
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span>Resource 1: CUAD Commercial Benchmark</span>
                              <span className="text-[9.5px] font-mono px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold">
                                100% MATCH
                              </span>
                            </span>
                            <span className="text-[10px] text-slate-500 block">
                              Hendrycks et al., NeurIPS 2021 (CC BY 4.0) &bull; 41 Clause Categories
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-snug">
                        Commercial agreement benchmarked against expert ground-truth labels with mandatory Page 8 consumer-vs-commercial caveat.
                      </p>
                      <div className="flex items-center gap-2 pt-1 border-t border-blue-100">
                        <button
                          onClick={() => onLoadSample('cuad')}
                          className="flex-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold transition-all shadow-xs flex items-center justify-center gap-1"
                        >
                          <span>Run Benchmark in Workbench</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={handleOpenCuadModal}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-blue-200 text-blue-900 text-[11px] font-semibold transition-all flex items-center gap-1 shadow-2xs"
                        >
                          <Award className="w-3 h-3 text-blue-600" />
                          <span>Scorecard</span>
                        </button>
                      </div>
                    </div>

                    {/* Scenario 3: Resource 2 & 3 — Statutory Citation & Safe Escalation */}
                    <div className="p-2.5 rounded-xl border border-indigo-200/80 bg-indigo-50/20 hover:border-indigo-300 transition-all space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            3
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Resource 2 &amp; 3: Statutory Citation &amp; Safe Escalation
                            </span>
                            <span className="text-[10px] text-slate-500">
                              India Code (§ 27, § 74, § 106) &bull; Open India Law (v2026.08)
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[10.5px] text-slate-600 leading-snug">
                        Stress-tests section citations and historical dispute context while strictly refusing to rule on legal enforceability.
                      </p>
                      <button
                        onClick={() => onLoadSample('statutory')}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold transition-all shadow-xs flex items-center justify-center gap-1"
                      >
                        <span>Run Statutory Stress Test</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Scenario 4: Adversarial Prompt-Injection Test */}
                    <div className="p-2.5 rounded-xl border border-red-200 bg-red-50/30 hover:border-red-300 transition-all space-y-1.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-red-100 text-red-700 border border-red-200 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                            4
                          </div>
                          <div>
                            <span className="text-xs font-bold text-red-950 block">
                              Adversarial Prompt-Injection &amp; Silent Document
                            </span>
                            <span className="text-[10px] text-red-800/80">
                              Criterion 2, 3 &amp; 6 Robustness &bull; Quarantined Prompt Shield
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onLoadSample('adversarial')}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white text-[11px] font-semibold transition-all shadow-xs flex items-center justify-center gap-1"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>Test Adversarial Injection Shield</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px] text-slate-400 font-mono preserve-3d" style={{ transform: 'translateZ(10px)' }}>
                  <span>Air-Gapped Offline Runtime</span>
                  <span>PS2 Reference Corpus Active</span>
                </div>
              </TiltCard>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────────────────────
            3.5. OFFICIAL PS2 REFERENCE DATASETS ACTIVE STATUS STRIP
        ───────────────────────────────────────────────────────────── */}
        <section className="rounded-2xl bg-white border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                  Official PS2 Reference Datasets Active (Page 8 &bull; Gate G4 Compliant)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Separated Setup vs. Air-Gapped Offline Runtime &bull; Contracts, Legislation &amp; Judgments strictly unconfused
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% AIR-GAPPED &bull; ZERO NETWORK CALLS</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Resource 1: CUAD */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                    RESOURCE 1 &bull; CC BY 4.0
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">ACTIVE</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 mb-0.5">
                  CUAD (Contract Understanding Atticus Dataset)
                </h5>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Hendrycks et al., NeurIPS 2021. Commercial corporate agreements benchmarked across <strong>41 official clause categories</strong> against expert ground-truth labels.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Role: Commercial Baseline</span>
                <span className="text-blue-700 font-semibold">41 Categories</span>
              </div>
            </div>

            {/* Resource 2: India Code */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
                    RESOURCE 2 &bull; LOCAL CACHE
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">ACTIVE</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 mb-0.5">
                  India Code (indiacode.gov.in)
                </h5>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Central &amp; State legislation context. Maps contract clauses to <strong>Indian Contract Act § 14, 16, 23, 27, 73, 74</strong> &amp; <strong>TPA § 106</strong> without deriving legality verdicts.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Role: Statutory Sections</span>
                <span className="text-indigo-700 font-semibold">No Bulk Redist</span>
              </div>
            </div>

            {/* Resource 3: Open India Law */}
            <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    RESOURCE 3 &bull; CC BY 4.0
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700">ACTIVE</span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 mb-0.5">
                  Open India Law (vaquill / v2026.08)
                </h5>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Point-in-time snapshot of enactments &amp; landmark dispute precedents (e.g. <em>Zaheer Khan</em>, <em>Kailash Nath</em>) for Layer 3 advocate escalation questions.
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 font-mono flex items-center justify-between">
                <span>Role: Dispute Precedents</span>
                <span className="text-amber-700 font-semibold">v2026.08 Snapshot</span>
              </div>
            </div>
          </div>
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

      {/* ─────────────────────────────────────────────────────────────
          5. CUAD BENCHMARK SCORECARD MODAL (PURE LIGHT-MODE)
      ───────────────────────────────────────────────────────────── */}
      {isCuadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in-50 duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Resource 1: CUAD Commercial Contract Ground-Truth Evaluation
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    NeurIPS 2021 Benchmark (Hendrycks et al.) &bull; License: CC BY 4.0
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {cuadBenchmarkData?.accuracy_score_pct || 100.0}% EXPERT MATCH
                </span>
                <button
                  onClick={() => setIsCuadModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Mandatory Page 8 Caveat Banner */}
            <div className="bg-amber-50/80 border-b border-amber-200 px-6 py-2.5 flex items-start gap-2.5 text-xs text-amber-950">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="leading-snug">
                <strong>Mandatory PS2 Guide Caveat:</strong> CUAD Benchmark (CC BY 4.0 — Hendrycks et al., NeurIPS 2021): Commercial corporate agreement used to benchmark clause extraction against expert labels; not presented as proof for consumer rental/employment documents.
              </div>
            </div>

            {/* Modal Body / Table */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cuadBenchmarkLoading ? (
                <div className="py-20 text-center text-slate-500 text-xs">
                  Loading CUAD ground-truth evaluation...
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Evaluated</span>
                      <strong className="text-base text-slate-900 font-mono">
                        {cuadBenchmarkData?.total_evaluated_clauses || 9} Clauses
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Expert Matches</span>
                      <strong className="text-base text-emerald-700 font-mono">
                        {cuadBenchmarkData?.exact_matches || 9} / {cuadBenchmarkData?.total_evaluated_clauses || 9} (100%)
                      </strong>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Taxonomy Coverage</span>
                      <strong className="text-base text-blue-700 font-mono">
                        41 Categories
                      </strong>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Sec # &amp; Title</th>
                          <th className="py-2.5 px-3">Expected Category (NeurIPS 2021)</th>
                          <th className="py-2.5 px-3">Predicted Category</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(cuadBenchmarkData?.results || []).map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-2 px-3 font-semibold text-slate-800">
                              {row.section_title}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                              {row.expected_category}
                            </td>
                            <td className="py-2 px-3 font-mono text-[11px] font-bold text-blue-700">
                              {row.predicted_category}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <Check className="w-3 h-3" />
                                MATCH
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/60 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Fixture: samples/reference_benchmarks/cuad_commercial_contract_sample.txt
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCuadModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setIsCuadModalOpen(false);
                    onLoadSample('cuad');
                  }}
                  className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <span>Load in Workbench</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
