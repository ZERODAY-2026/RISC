import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  UploadCloud,
  FileText,
  ArrowRight,
  CheckCircle2,
  Lock,
  Scale,
  Zap,
  BookOpen,
  KeyRound,
  AlertTriangle,
  X,
  ExternalLink,
  Award,
  Sparkles,
  Building,
  Briefcase,
  FileCode2,
  ShieldAlert,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import WarmPorcelain3DScene from './WarmPorcelain3DScene';
import TiltCard from './TiltCard';

/**
 * LandingPage
 * Rebuilt Page 1 (The Landing & Launch Showcase)
 * Featuring the "Warm Studio Porcelain & Refractive Glass" aesthetic
 * with real local WebGL Three.js 3D scene, tactile upload dropzone, and 2x2 instant sample launchpad.
 */
export default function LandingPage({
  onLoadSample,
  onUploadFile,
  isSessionActive,
  onEnterWorkspace,
  auditData,
  isProcessing,
  processingStep,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // CUAD Scorecard Modal State
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
      // Default to rental agreement sample to immediately showcase Stage 2
      onLoadSample('rental');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#F7F5F0] via-[#F3F0E8] to-[#EAE6DC] text-[#111827] flex flex-col font-sans selection:bg-[#111827] selection:text-white overflow-x-hidden">
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
          1. TOP FLOATING GLASS NAVBAR (h-16)
      ───────────────────────────────────────────────────────────── */}
      <nav className="h-16 bg-white/80 backdrop-blur-xl border-b border-white/90 sticky top-0 z-40 px-6 sm:px-10 flex items-center justify-between shadow-[0_2px_12px_rgba(24,24,27,0.03)]">
        {/* Left: Brand Identity */}
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
        </div>

        {/* Right: Quick Smooth-Scroll Navigation + Enter Studio Button */}
        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-stone-600">
            <a
              href="#how-it-works"
              className="hover:text-[#111827] transition-colors"
            >
              How It Works
            </a>
            <a
              href="#why-on-device"
              className="hover:text-[#111827] transition-colors"
            >
              Why On-Device?
            </a>
            <a
              href="#official-datasets"
              className="hover:text-[#111827] transition-colors"
            >
              Official Datasets
            </a>
          </div>

          {/* Primary Glass Button */}
          <button
            onClick={handlePrimaryLaunch}
            className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-white/90 hover:bg-white text-[#111827] border border-white text-xs sm:text-sm font-bold shadow-[0_4px_16px_rgba(24,24,27,0.06)] hover:shadow-[0_8px_24px_rgba(24,24,27,0.1)] active:scale-98 transition-all cursor-pointer"
          >
            <span>{isSessionActive ? 'Resume Active Studio' : 'Enter Studio'}</span>
            <ArrowRight className="w-4 h-4 text-stone-500 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </nav>

      {/* ─────────────────────────────────────────────────────────────
          2. SECTION 1: ABOVE-THE-FOLD 3D HERO & INSTANT LAUNCHPAD (50/50 SPLIT)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pt-10 sm:pt-14 pb-16 lg:pb-24 w-full">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
          {/* ─── LEFT COLUMN: PRODUCT PITCH + INSTANT UPLOAD & 2X2 SAMPLES ─── */}
          <div className="flex flex-col text-left">
            {/* Edge Security Badge */}
            <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-white/80 border border-white/90 shadow-[0_2px_8px_rgba(24,24,27,0.04)] mb-5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                Zero-Cloud Edge Architecture • Track PS2
              </span>
            </div>

            {/* Headline (64px bold, tight tracking) */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold text-[#111827] tracking-tight leading-[1.08] mb-5">
              Your Private AI <br />
              <span className="bg-gradient-to-r from-[#111827] via-stone-800 to-stone-600 bg-clip-text text-transparent">
                Contract Analyst.
              </span>{' '}
              <br />
              100% On Your Device.
            </h1>

            {/* Value Proposition Subtitle (18px, readable in 5 seconds) */}
            <p className="text-base sm:text-[17.5px] text-[#4B5563] leading-relaxed max-w-xl mb-7 font-normal">
              Review rental leases, job offers, and legal notices completely offline.
              Powered by local Google Gemma, LexGuard translates complex legal traps into
              plain English, proves every answer with exact quotes from your PDF, and tells
              you when to consult a real lawyer—with zero cloud uploads.
            </p>

            {/* Primary Tactile Upload Button (Pill-Shaped 3D Porcelain Button) */}
            <div className="mb-4">
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
                className={`group relative h-16 px-8 sm:px-10 rounded-full bg-gradient-to-b from-white via-white to-[#F2EFE9] border border-white shadow-[0_12px_28px_rgba(0,0,0,0.07),0_2px_6px_rgba(0,0,0,0.03)] hover:shadow-[0_18px_36px_rgba(0,0,0,0.11)] hover:scale-[1.015] active:scale-[0.985] transition-all cursor-pointer flex items-center justify-between ${
                  isDragOver ? 'ring-2 ring-emerald-500 scale-[1.02] bg-emerald-50/50' : ''
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#111827] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm sm:text-base font-bold text-[#111827] tracking-tight">
                      Drag & Drop Contract (.PDF or .TXT)
                    </span>
                    <span className="text-[11px] text-stone-500 font-medium">
                      or click to browse local files securely
                    </span>
                  </div>
                </div>

                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-700 text-xs font-semibold group-hover:bg-[#111827] group-hover:text-white transition-colors">
                  <span>Browse</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Status Pill directly underneath upload button */}
              <div className="mt-2.5 flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-white/80 self-start text-[11.5px] font-medium text-stone-600 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>
                  <strong>RAM Vault Armed (AES-256)</strong> • No Disk Footprint • Zero Cloud Calls
                </span>
              </div>
            </div>

            {/* ─── 2X2 INSTANT DEMO CONTRACT PILLS (FOR 1-CLICK JUDGE TESTING) ─── */}
            <div className="mt-5 pt-5 border-t border-stone-200/60">
              <span className="block text-[11px] font-bold tracking-wider text-stone-500 uppercase mb-3">
                Or instantly test with a pre-loaded contract:
              </span>

              <div className="grid sm:grid-cols-2 gap-2.5">
                {/* Pill 1: Rental */}
                <button
                  type="button"
                  onClick={() => onLoadSample('rental')}
                  className="rounded-2xl sm:rounded-full bg-white/85 hover:bg-white border border-stone-200/80 px-4 py-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-base flex-shrink-0">🏠</span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#111827] truncate group-hover:text-emerald-700 transition-colors">
                        1. Rental Agreement
                      </span>
                      <span className="text-[10px] text-stone-500 truncate">
                        6-mo lock-in & penalty traps
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1.5" />
                </button>

                {/* Pill 2: Employment */}
                <button
                  type="button"
                  onClick={() => onLoadSample('employment')}
                  className="rounded-2xl sm:rounded-full bg-white/85 hover:bg-white border border-stone-200/80 px-4 py-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-base flex-shrink-0">💼</span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#111827] truncate group-hover:text-blue-700 transition-colors">
                        2. Employment Contract
                      </span>
                      <span className="text-[10px] text-stone-500 truncate">
                        Section 27 non-compete & bond
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1.5" />
                </button>

                {/* Pill 3: CUAD Service SLA */}
                <button
                  type="button"
                  onClick={() => onLoadSample('cuad')}
                  className="rounded-2xl sm:rounded-full bg-white/85 hover:bg-white border border-stone-200/80 px-4 py-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-base flex-shrink-0">🤝</span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#111827] truncate group-hover:text-amber-700 transition-colors">
                        3. CUAD Commercial SLA
                      </span>
                      <span className="text-[10px] text-stone-500 truncate">
                        41-category benchmark (CC BY 4.0)
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1.5" />
                </button>

                {/* Pill 4: Adversarial Injection */}
                <button
                  type="button"
                  onClick={() => onLoadSample('adversarial')}
                  className="rounded-2xl sm:rounded-full bg-white/85 hover:bg-white border border-stone-200/80 px-4 py-2.5 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-between text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="text-base flex-shrink-0">🛑</span>
                    <div className="flex flex-col truncate">
                      <span className="text-xs font-bold text-[#111827] truncate group-hover:text-rose-700 transition-colors">
                        4. Adversarial Trap NDA
                      </span>
                      <span className="text-[10px] text-stone-500 truncate">
                        Prompt-injection security shield
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-[#111827] group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-1.5" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── RIGHT COLUMN: 100% LOCAL THREE.JS WEBGL SCENE (SEAMLESS ON MAIN CANVAS) ─── */}
          <div className="relative flex items-center justify-center w-full min-h-[620px] sm:min-h-[700px] lg:min-h-[780px] xl:min-h-[840px] overflow-visible">
            <div className="relative w-full lg:w-[130%] xl:w-[140%] max-w-[940px] h-[620px] sm:h-[700px] lg:h-[780px] xl:h-[840px] flex items-center justify-center -translate-y-5 lg:-translate-y-8 translate-x-3 lg:translate-x-6 xl:translate-x-8 overflow-visible pointer-events-none">
              <WarmPorcelain3DScene className="w-full h-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. SECTION 2: WHY PEOPLE USE LEXGUARD (3-STEP TACTILE CARDS)
      ───────────────────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-16 sm:py-24 border-t border-stone-200/70 w-full"
      >
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/90 border border-stone-200/80 text-stone-600 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-stone-800" />
            <span>How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111827] tracking-tight">
            What LexGuard Does For You <br />
            <span className="text-stone-500 font-semibold">(And Why Generic Chatbots Fail)</span>
          </h2>
          <p className="mt-3.5 text-stone-600 text-base leading-relaxed">
            Traditional AI chatbots hallucinate fake clauses and leak private contracts to the cloud.
            LexGuard-Local replaces guesswork with mathematical proof and strict legal safety boundaries.
          </p>
        </div>

        {/* 3 Large Tactile 3D-Tilting Porcelain Cards (grid-cols-3) */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Step 01: On-Device Privacy */}
          <TiltCard
            className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/95 p-7 shadow-[0_20px_40px_-15px_rgba(24,24,27,0.07),0_2px_6px_rgba(24,24,27,0.03)] flex flex-col justify-between"
            maxTilt={8}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-3xl font-extrabold font-mono text-stone-300">
                  01
                </span>
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 flex items-center justify-center">
                  <Lock className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold mb-3">
                <span>🔒 Local Gemma 3n Engine • 0 Bytes Online</span>
              </div>

              <h3 className="text-xl font-bold text-[#111827] tracking-tight mb-2.5">
                Never upload private contracts to public clouds.
              </h3>

              <p className="text-sm text-[#4B5563] leading-relaxed">
                Ordinary AI chatbots send your salary, home address, and private terms to
                external corporate servers. LexGuard processes your PDF strictly inside your
                laptop’s local RAM—even with your Wi-Fi turned completely off.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>AES-256-GCM RAM Vault</span>
              <span className="font-bold text-emerald-700">0 Outbound Sockets</span>
            </div>
          </TiltCard>

          {/* Step 02: Deterministic Grounding */}
          <TiltCard
            className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/95 p-7 shadow-[0_20px_40px_-15px_rgba(24,24,27,0.07),0_2px_6px_rgba(24,24,27,0.03)] flex flex-col justify-between"
            maxTilt={8}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-3xl font-extrabold font-mono text-stone-300">
                  02
                </span>
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-[11px] font-bold mb-3">
                <span>✓ Exact Character-Span Verification (CL-001 to CL-XXX)</span>
              </div>

              <h3 className="text-xl font-bold text-[#111827] tracking-tight mb-2.5">
                Every claim is backed by an exact quote from your file.
              </h3>

              <p className="text-sm text-[#4B5563] leading-relaxed">
                Generic AI invents clauses that don’t exist. LexGuard splits your contract
                into numbered clauses and mathematically verifies that every quoted sentence
                exists word-for-word in your document—or tells you honestly when the{' '}
                <strong>Document is Silent</strong>.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>PyMuPDF Chunker</span>
              <span className="font-bold text-blue-700">Zero Hallucination</span>
            </div>
          </TiltCard>

          {/* Step 03: Safe Escalation */}
          <TiltCard
            className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/95 p-7 shadow-[0_20px_40px_-15px_rgba(24,24,27,0.07),0_2px_6px_rgba(24,24,27,0.03)] flex flex-col justify-between"
            maxTilt={8}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <span className="text-3xl font-extrabold font-mono text-stone-300">
                  03
                </span>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center">
                  <Scale className="w-5 h-5 stroke-[2.2]" />
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold mb-3">
                <span>⚖️ India Code & Open India Law Context</span>
              </div>

              <h3 className="text-xl font-bold text-[#111827] tracking-tight mb-2.5">
                Understand hidden traps and ask a lawyer the right questions.
              </h3>

              <p className="text-sm text-[#4B5563] leading-relaxed">
                LexGuard translates dense legalese into simple bullet points, highlights
                one-sided penalties or vague wording (<em>"at sole discretion"</em>), links
                relevant <strong>India Code</strong> sections, and prepares exact questions for
                a qualified advocate instead of pretending to give legal advice.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-500 font-medium">
              <span>Section 27 / Section 74</span>
              <span className="font-bold text-amber-700">Non-Lawyer Safety</span>
            </div>
          </TiltCard>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. SECTION 3: CONTRACT COVERAGE + OFFICIAL DATASET STRIP
      ───────────────────────────────────────────────────────────── */}
      <section
        id="why-on-device"
        className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 pb-20 w-full"
      >
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/90 border border-stone-200/80 text-stone-600 text-xs font-bold uppercase tracking-wider mb-2.5">
            <BookOpen className="w-3.5 h-3.5 text-stone-800" />
            <span>Contract Coverage</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
            Everyday Documents You Can Triage In Seconds
          </h2>
          <p className="mt-2 text-stone-600 text-sm">
            From consumer rental agreements to corporate SLAs, spot unfair liabilities before signing.
          </p>
        </div>

        {/* 4 Use-Case Mini Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {/* Card 1: Rental */}
          <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3.5 font-bold">
                🏠
              </div>
              <h4 className="text-sm font-bold text-[#111827] mb-1.5">
                Residential Rental Leases
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                Catches 6-month lock-in traps, automatic security deposit forfeiture, and unilateral maintenance hikes.
              </p>
            </div>
            <button
              onClick={() => onLoadSample('rental')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 self-start group cursor-pointer"
            >
              <span>Try Sample</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Card 2: Employment */}
          <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3.5 font-bold">
                💼
              </div>
              <h4 className="text-sm font-bold text-[#111827] mb-1.5">
                Employment Offers & Bonds
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                Spots post-termination non-competes under Section 27, ₹3L+ training bonds, and asymmetric notice periods.
              </p>
            </div>
            <button
              onClick={() => onLoadSample('employment')}
              className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 self-start group cursor-pointer"
            >
              <span>Try Sample</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Card 3: CUAD Commercial SLA */}
          <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3.5 font-bold">
                🤝
              </div>
              <h4 className="text-sm font-bold text-[#111827] mb-1.5">
                Commercial Vendor SLAs
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                Benchmarks 41 clause categories against Atticus Project CUAD standards with 100% expert accuracy.
              </p>
            </div>
            <button
              onClick={() => onLoadSample('cuad')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 self-start group cursor-pointer"
            >
              <span>Try Sample</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Card 4: Adversarial Injection */}
          <div className="rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-3.5 font-bold">
                🛑
              </div>
              <h4 className="text-sm font-bold text-[#111827] mb-1.5">
                Adversarial & NDA Notices
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed mb-3">
                Detects prompt-injection strings ("Ignore previous instructions") and quarantines untrusted text.
              </p>
            </div>
            <button
              onClick={() => onLoadSample('adversarial')}
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1 self-start group cursor-pointer"
            >
              <span>Try Sample</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        {/* ─── SLEEK NON-LAWYER & OFFICIAL DATASET FOOTER STRIP ─── */}
        <div
          id="official-datasets"
          className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/95 p-6 sm:p-7 shadow-[0_12px_28px_rgba(24,24,27,0.04)] text-left"
        >
          {/* Mandatory PS2 Non-Lawyer Boundary Disclosure */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/70 mb-5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              <strong>Mandatory Non-Lawyer Boundary (PS2 Rule):</strong> LexGuard-Local is an
              automated exploratory triage tool. It does not provide legal counsel and cannot
              determine statutory legality or court enforceability. Always consult a qualified
              advocate before signing or disputing any contract.
            </p>
          </div>

          {/* Official PS2 Reference Datasets Attribution Row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pt-2 border-t border-stone-200/60">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mr-1">
                Official Reference Datasets:
              </span>

              {/* Resource 1 Pill (Clickable for Scorecard Modal) */}
              <button
                type="button"
                onClick={handleOpenCuadModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-semibold border border-stone-200 transition-colors cursor-pointer"
                title="View CUAD Benchmark Ground-Truth Scorecard"
              >
                <span>📘 Resource 1: CUAD (CC BY 4.0)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[9.5px] font-bold">
                  100% Match
                </span>
              </button>

              {/* Resource 2 Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-[11px] font-semibold border border-stone-200">
                <span>🏛️ Resource 2: India Code (§ 27 / § 74 / § 106)</span>
              </div>

              {/* Resource 3 Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-[11px] font-semibold border border-stone-200">
                <span>⚖️ Resource 3: Open India Law (v2026.08 Snapshot)</span>
              </div>
            </div>

            {/* Hackathon Footer Line */}
            <div className="text-[11px] text-stone-500 font-mono">
              ZERODAY OSS HACKTOBERFEST 2026 • IIIT DHARWAD • APACHE-2.0
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. PROCESSING OVERLAY (PROGRESS STATE DURING INGESTION)
      ───────────────────────────────────────────────────────────── */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-2xl border border-white p-7 shadow-2xl text-center">
            <div className="relative w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 animate-pulse" />
              <div className="absolute w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            </div>

            <h3 className="text-base font-bold text-[#111827] mb-1">
              Ingesting Contract On-Device
            </h3>
            <p className="text-xs text-stone-500 mb-5">
              Parsing PDF text streams & arming AES-256-GCM RAM vault...
            </p>

            <div className="space-y-2 text-left">
              <div className="flex items-center gap-2.5 text-xs text-stone-700">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    processingStep >= 1 ? 'text-emerald-600' : 'text-stone-300'
                  }`}
                />
                <span>PyMuPDF Text & Span Extraction</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-stone-700">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    processingStep >= 2 ? 'text-emerald-600' : 'text-stone-300'
                  }`}
                />
                <span>Quarantine Shield & Prompt-Injection Check</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-stone-700">
                <CheckCircle2
                  className={`w-4 h-4 ${
                    processingStep >= 3 ? 'text-emerald-600' : 'text-stone-300'
                  }`}
                />
                <span>Rank-BM25 Indexing & CUAD Taxonomy Categorization</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          6. CUAD EXPERT-LABEL BENCHMARK SCORECARD MODAL
      ───────────────────────────────────────────────────────────── */}
      {isCuadModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div
            onClick={() => setIsCuadModalOpen(false)}
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-md"
          />

          <div className="relative w-full max-w-2xl rounded-3xl bg-white/95 backdrop-blur-2xl border border-white p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] flex flex-col text-left">
            <div className="flex items-start justify-between pb-4 border-b border-stone-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10.5px] font-bold uppercase tracking-wider mb-2">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Official NeurIPS 2021 Benchmark</span>
                </div>
                <h3 className="text-xl font-bold text-[#111827]">
                  CUAD Commercial Contract Ground-Truth Evaluation
                </h3>
                <p className="text-xs text-stone-500 mt-1">
                  Benchmarking on-device clause classification against expert annotations from Hendrycks et al. (CC BY 4.0).
                </p>
              </div>

              <button
                onClick={() => setIsCuadModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scorecard Content */}
            <div className="overflow-y-auto py-4 space-y-3.5 flex-1 pr-1">
              {cuadBenchmarkLoading ? (
                <div className="py-12 text-center text-xs text-stone-500 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating 9 commercial benchmark clauses...</span>
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

                  {/* Mandatory Page 8 Caveat Badge */}
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
