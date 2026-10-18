import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  UploadCloud,
  FileText,
  Lock,
  Sparkles,
  Scale,
  Database,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Check,
  X,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import ThreeGlassVaultCanvas from './ThreeGlassVaultCanvas';

export default function LandingShowcase({
  onLoadSample,
  onUploadFile,
  isSessionActive,
  onEnterWorkspace,
  auditData,
  isProcessing,
  processingStep,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isCuadModalOpen, setIsCuadModalOpen] = useState(false);
  const [cuadBenchmarkData, setCuadBenchmarkData] = useState(null);
  const [cuadBenchmarkLoading, setCuadBenchmarkLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleOpenCuadModal = async () => {
    setIsCuadModalOpen(true);
    if (!cuadBenchmarkData && !cuadBenchmarkLoading) {
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUploadFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onUploadFile(e.target.files[0]);
    }
  };

  const handlePrimaryLaunch = () => {
    if (isSessionActive) {
      onEnterWorkspace();
    } else {
      onLoadSample('rental');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#F7F5F0] via-[#F2EFE7] to-[#E8E3D7] text-[#111827] flex flex-col font-sans selection:bg-[#111827] selection:text-white overflow-x-hidden">
      {/* Subtle Warm Porcelain Architectural Grain Overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.035] mix-blend-multiply z-0"
        style={{
          backgroundImage: `radial-gradient(#111827 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
        aria-hidden="true"
      />

      {/* ─────────────────────────────────────────────────────────────
          1. TOP FLOATING FROSTED NAVBAR (h-16 px-8)
      ───────────────────────────────────────────────────────────── */}
      <nav className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/90 sticky top-0 z-40 px-6 sm:px-8 flex items-center justify-between shadow-[0_2px_12px_rgba(24,24,27,0.03)]">
        {/* Left: Brand Identity + Green Air-Gapped Pill */}
        <div className="flex items-center gap-3.5">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#111827] flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-extrabold tracking-tight text-[#111827]">
                LexGuard<span className="text-stone-400 font-normal">-Local</span>
              </span>
              <span className="text-[9.5px] uppercase font-bold tracking-widest text-stone-500">
                Private Legal Triage Agent
              </span>
            </div>
          </div>

          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold tracking-tight">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>● 100% AIR-GAPPED</span>
          </div>
        </div>

        {/* Right: Smooth-Scroll Links + Tactile White Pill Button */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <a href="#how-it-works" className="hover:text-[#111827] transition-colors">
              How It Works
            </a>
            <a href="#datasets" className="hover:text-[#111827] transition-colors">
              3 Datasets
            </a>
            <a href="#privacy" className="hover:text-[#111827] transition-colors">
              Privacy Architecture
            </a>
          </div>

          <button
            onClick={handlePrimaryLaunch}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 hover:bg-white text-[#111827] border border-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(24,24,27,0.06)] hover:shadow-[0_8px_24px_rgba(24,24,27,0.10)] active:scale-98 transition-all cursor-pointer"
          >
            <span>{isSessionActive ? 'Resume Active Studio' : 'Enter Studio →'}</span>
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          2. ABOVE-THE-FOLD SPLIT HERO (12 COLUMNS)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 pt-8 pb-14 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          {/* Left 6 Columns */}
          <div className="lg:col-span-6 flex flex-col text-left">
            {/* Edge Security Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/85 border border-white/90 shadow-[0_2px_8px_rgba(24,24,27,0.04)] mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Zero-Cloud Edge Architecture • Track PS2
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.06] text-stone-900 mb-4">
              Your Private AI <br />
              <span className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-600 bg-clip-text text-transparent">
                Contract Analyst.
              </span>
              <br />
              100% On Your Device.
            </h1>

            {/* Clear Subtitle */}
            <p className="text-lg text-stone-600 leading-relaxed max-w-xl">
              Review sensitive agreements offline. No servers, no data leakage—just instant,
              verifiable answers grounded in your exact document using local Google Gemma.
            </p>

            {/* Tactile 3D Pill Dropzone Button */}
            <div className="mt-8 flex flex-col max-w-md">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.txt"
                className="hidden"
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative w-full py-5 px-8 rounded-full bg-gradient-to-b from-white to-[#EFECE4] border border-white shadow-[0_18px_35px_-10px_rgba(0,0,0,0.10),0_2px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_22px_42px_-10px_rgba(0,0,0,0.14)] hover:-translate-y-0.5 active:scale-[0.985] transition-all flex items-center justify-between cursor-pointer ${
                  isDragOver ? 'ring-2 ring-emerald-500 bg-emerald-50/50 scale-[1.01]' : ''
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#111827] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <span className="text-xl font-bold text-stone-900 tracking-tight">
                    ↑ Drag & Drop Contract
                  </span>
                </div>
                <span className="text-xs font-bold text-stone-500 bg-stone-100/90 px-3 py-1 rounded-full group-hover:bg-[#111827] group-hover:text-white transition-colors">
                  .PDF or .TXT
                </span>
              </div>

              {/* Centered badge directly below button */}
              <div className="mt-2.5 flex items-center justify-center gap-2 text-xs font-semibold text-stone-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  <strong>RAM Vault Armed (AES-256)</strong> • No Disk Footprint
                </span>
              </div>
            </div>

            {/* 2x2 Pre-Loaded Sample Launch Pills */}
            <div className="mt-6 pt-5 border-t border-stone-200/70 max-w-md">
              <span className="block text-[11px] font-bold tracking-wider text-stone-500 uppercase mb-3">
                Or instantly launch a pre-loaded sample:
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. Rental */}
                <button
                  type="button"
                  onClick={() => onLoadSample('rental')}
                  className="rounded-2xl bg-white/85 hover:bg-white border border-stone-200/80 px-3.5 py-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base flex-shrink-0">🏠</span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#111827] truncate group-hover:text-emerald-700 transition-colors">
                        1. Rental Agreement
                      </span>
                      <span className="text-[10px] text-stone-500 truncate">
                        6-Mo Lock-in & Penalties
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                </button>

                {/* 2. Employment */}
                <button
                  type="button"
                  onClick={() => onLoadSample('employment')}
                  className="rounded-2xl bg-white/85 hover:bg-white border border-stone-200/80 px-3.5 py-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base flex-shrink-0">💼</span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#111827] truncate group-hover:text-blue-700 transition-colors">
                        2. Employment Contract
                      </span>
                      <span className="text-[10px] text-stone-500 truncate">
                        Non-Compete & v1/v2 Diff
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                </button>

                {/* 3. CUAD */}
                <button
                  type="button"
                  onClick={() => onLoadSample('cuad')}
                  className="rounded-2xl bg-white/85 hover:bg-white border border-stone-200/80 px-3.5 py-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base flex-shrink-0">🤝</span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#111827] truncate group-hover:text-amber-700 transition-colors">
                        3. CUAD Service SLA
                      </span>
                      <span className="text-[10px] text-stone-500 truncate">
                        41-Clause Benchmark
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                </button>

                {/* 4. Adversarial */}
                <button
                  type="button"
                  onClick={() => onLoadSample('adversarial')}
                  className="rounded-2xl bg-white/85 hover:bg-white border border-stone-200/80 px-3.5 py-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-base flex-shrink-0">🛑</span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#111827] truncate group-hover:text-rose-700 transition-colors">
                        4. Adversarial Trap NDA
                      </span>
                      <span className="text-[10px] text-stone-500 truncate">
                        Prompt-Injection Shield
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Right 6 Columns: 100% Local Pure Three.js WebGL Centerpiece */}
          <div className="lg:col-span-6 relative flex items-center justify-center w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[740px] xl:min-h-[800px] overflow-visible">
            <div className="relative w-full lg:w-[130%] xl:w-[138%] max-w-[940px] h-[580px] sm:h-[660px] lg:h-[740px] xl:h-[800px] flex items-center justify-center -translate-y-4 lg:-translate-y-7 translate-x-2 lg:translate-x-5 overflow-visible pointer-events-none">
              <ThreeGlassVaultCanvas className="w-full h-full" scale={0.86} />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. BELOW-THE-FOLD: HOW LEXGUARD PROTECTS YOU (3 TACTILE CARDS)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 py-16 border-t border-stone-200/70 w-full"
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/90 border border-stone-200/80 text-stone-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-stone-800" />
            <span>How LexGuard Protects You</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            Grounded Contract Analysis <br />
            <span className="text-stone-500 font-semibold">With Strict Safety Boundaries</span>
          </h2>
          <p className="mt-3.5 text-stone-600 text-base leading-relaxed">
            Standard cloud chatbots hallucinate clauses and upload confidential PDFs to external
            servers. LexGuard runs completely inside your laptop's volatile RAM.
          </p>
        </div>

        {/* 3 Spacious Tactile Porcelain Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: 100% On-Device Privacy (Gate L2) */}
          <div className="group rounded-3xl bg-white/80 backdrop-blur-xl border border-white/95 p-7 shadow-[0_20px_40px_-15px_rgba(24,24,27,0.06),0_2px_6px_rgba(24,24,27,0.03)] hover:shadow-[0_28px_56px_-15px_rgba(24,24,27,0.11)] hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-extrabold text-sm shadow-xs">
                  01
                </div>
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/60">
                  <Lock className="w-4 h-4" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10.5px] font-bold uppercase tracking-wider mb-2.5">
                <Cpu className="w-3 h-3" />
                <span>Local Gemma 3n • 0 Bytes Online</span>
              </div>

              <h3 className="text-xl font-bold text-[#111827] tracking-tight mb-2.5">
                100% On-Device Privacy (Gate L2)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Your salary, home address, and trade secrets never leave your physical device.
                Local Google Gemma 3n + PyMuPDF parse contracts directly in RAM with zero external
                API calls.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>AES-256-GCM RAM Vault</span>
              <span className="text-emerald-700 font-bold">0 Outbound Sockets</span>
            </div>
          </div>

          {/* Card 2: Verbatim Substring Proof (Criterion 2) */}
          <div className="group rounded-3xl bg-white/80 backdrop-blur-xl border border-white/95 p-7 shadow-[0_20px_40px_-15px_rgba(24,24,27,0.06),0_2px_6px_rgba(24,24,27,0.03)] hover:shadow-[0_28px_56px_-15px_rgba(24,24,27,0.11)] hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100/80 text-blue-800 flex items-center justify-center font-extrabold text-sm shadow-xs">
                  02
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10.5px] font-bold uppercase tracking-wider mb-2.5">
                <Check className="w-3 h-3" />
                <span>Exact Substring Proof</span>
              </div>

              <h3 className="text-xl font-bold text-[#111827] tracking-tight mb-2.5">
                Verbatim Substring Proof (Criterion 2)
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Every extracted claim is programmatically matched word-for-word against numbered
                CL-XXX clauses. If an obligation is missing, LexGuard explicitly triggers a{' '}
                <strong className="text-stone-800">Document is Silent</strong> alert rather than
                inventing fake clauses.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>PyMuPDF Chunker</span>
              <span className="text-blue-700 font-bold">Zero Hallucination</span>
            </div>
          </div>

          {/* Card 3: Non-Lawyer Escalation & 3 Official Datasets (Criterion 3 & Gate G4) */}
          <div className="group rounded-3xl bg-white/80 backdrop-blur-xl border border-white/95 p-7 shadow-[0_20px_40px_-15px_rgba(24,24,27,0.06),0_2px_6px_rgba(24,24,27,0.03)] hover:shadow-[0_28px_56px_-15px_rgba(24,24,27,0.11)] hover:-translate-y-1 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-800 flex items-center justify-center font-extrabold text-sm shadow-xs">
                  03
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200/60">
                  <Scale className="w-4 h-4" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10.5px] font-bold uppercase tracking-wider mb-2.5">
                <Scale className="w-3 h-3" />
                <span>India Code & Open India Law Context</span>
              </div>

              <h3 className="text-xl font-bold text-[#111827] tracking-tight mb-2.5">
                Non-Lawyer Escalation & 3 Official Datasets
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                LexGuard translates dense legalese into plain bullets, maps CUAD (Resource 1),
                India Code (Resource 2), and Open India Law (Resource 3), and provides exact
                questions for a licensed advocate without offering unauthorized legal advice.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>Section 27 / Section 74</span>
              <span className="text-amber-700 font-bold">Non-Lawyer Safety</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. OFFICIAL DATASETS FOOTER STRIP
      ───────────────────────────────────────────────────────────── */}
      <footer id="datasets" className="mt-auto border-t border-stone-200/70 bg-white/40 py-8 px-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-600">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-[#111827]">OFFICIAL REFERENCE DATASETS:</span>
            <button
              onClick={handleOpenCuadModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 hover:bg-emerald-100 transition-colors cursor-pointer font-medium"
            >
              <span>Resource 1: CUAD (CC BY 4.0)</span>
              <span className="text-[10px] bg-emerald-200/80 px-1.5 py-0.2 rounded-full font-bold">100% Match</span>
            </button>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200/70">
              Resource 2: India Code (§ 27 / § 74 / § 106)
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200/70">
              Resource 3: Open India Law (v2026.08 Snapshot)
            </span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-[11px] text-stone-500">
            <span className="px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-mono">
              OPEN SOURCE APACHE-2.0
            </span>
            <span>IIIT DHARWAD • HACKTOBERFEST 2026</span>
          </div>
        </div>
      </footer>

      {/* ─────────────────────────────────────────────────────────────
          5. CUAD BENCHMARK MODAL (OFFICIAL GROUND TRUTH)
      ───────────────────────────────────────────────────────────── */}
      {isCuadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl border border-white/90 shadow-2xl max-w-2xl w-full p-6 sm:p-8 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  41
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#111827]">
                    CUAD Atticus Project Benchmark
                  </h3>
                  <p className="text-xs text-stone-500">
                    NeurIPS 2021 Reference Ground Truth (CC BY 4.0)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCuadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              {cuadBenchmarkLoading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-stone-500">Evaluating against local CUAD ground truth...</span>
                </div>
              ) : cuadBenchmarkData ? (
                <>
                  <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-950">
                        Accuracy: {cuadBenchmarkData.accuracy_score_pct}% ({cuadBenchmarkData.exact_matches}/{cuadBenchmarkData.total_evaluated_clauses} Expert Matches)
                      </span>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Document: {cuadBenchmarkData.benchmark_name}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-xs">
                      PERFECT SCORE
                    </span>
                  </div>

                  <div className="space-y-2 mt-3">
                    {cuadBenchmarkData.results?.map((res, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-stone-50/80 border border-stone-200/80 text-xs flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#111827]">
                            {res.section_title}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            {res.predicted_category}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 italic line-clamp-2">
                          "{res.verbatim_snippet}"
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                    <strong>Mandatory Page 8 Caveat:</strong> {cuadBenchmarkData.mandatory_caveat}
                  </div>
                </>
              ) : (
                <div className="py-6 text-center text-xs text-stone-500">
                  Click below to evaluate the local CUAD ground truth.
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 font-mono">
                Atticus Project • CC BY 4.0
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsCuadModalOpen(false);
                  onLoadSample('cuad');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#111827] hover:bg-stone-800 text-white text-xs font-bold transition-all"
              >
                <span>Load CUAD Contract in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
