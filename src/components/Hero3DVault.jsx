import React, { useState } from 'react';
import { ShieldCheck, Lock, Cpu, Sparkles, Scale, KeyRound } from 'lucide-react';

/**
 * Hero3DVault: Immersive 3D interactive legal security & encryption centerpiece.
 * Uses CSS 3D transforms (preserve-3d, translateZ, rotateX/Y) with orbital rings
 * and multi-depth floating satellite chips positioned with full clearance and zero overlap.
 */
export default function Hero3DVault({ is3DActive = true, cipherSuite, keyFingerprint }) {
  const [coords, setCoords] = useState({ rotX: 8, rotY: -10 });

  const handleMouseMove = (e) => {
    if (!is3DActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setCoords({
      rotX: -((y / (rect.height / 2)) * 12),
      rotY: (x / (rect.width / 2)) * 16,
    });
  };

  const handleMouseLeave = () => {
    setCoords({ rotX: 8, rotY: -10 });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[580px] h-[280px] mx-auto perspective-1200 cursor-pointer select-none my-6 flex items-center justify-center"
    >
      {/* 3D Ambient Depth Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-100/50 via-slate-100/40 to-indigo-100/50 rounded-full blur-3xl opacity-75 -z-10 animate-pulse-halo" />

      {/* Main 3D Floating Stage */}
      <div
        className="relative w-[300px] h-[160px] preserve-3d transition-transform duration-200 ease-out"
        style={{
          transform: `rotateX(${coords.rotX}deg) rotateY(${coords.rotY}deg) translateZ(10px)`,
        }}
      >
        {/* Orbital Ring 1 (Slow Clockwise) */}
        <div className="absolute inset-0 m-auto w-[310px] h-[310px] rounded-full border border-dashed border-slate-300/80 animate-orbit-slow pointer-events-none -z-10" />

        {/* Orbital Ring 2 (Fast Counter-Clockwise) */}
        <div className="absolute inset-0 m-auto w-[240px] h-[240px] rounded-full border border-slate-200/90 animate-orbit-reverse pointer-events-none -z-10" />

        {/* SATELLITE CHIP 1: RAM VAULT ARMED (Clear of the center card with generous margins) */}
        <div
          className="absolute -top-16 -left-12 sm:-left-28 px-4 py-2 rounded-xl bg-white/95 border-2 border-emerald-300 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-30 preserve-3d animate-float-3d"
          style={{ transform: 'translateZ(65px)' }}
        >
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="flex flex-col text-left">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-800 leading-tight">
              RAM Vault Armed
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-500 leading-tight mt-0.5 whitespace-nowrap">
              AES-256-GCM • Zero Residue
            </span>
          </div>
        </div>

        {/* SATELLITE CHIP 2: 100% LOCAL INFERENCE (Clear of the center card with generous margins) */}
        <div
          className="absolute -top-16 -right-12 sm:-right-28 px-4 py-2 rounded-xl bg-white/95 border-2 border-indigo-200 shadow-xl backdrop-blur-md flex items-center gap-2.5 z-30 preserve-3d animate-float-3d"
          style={{ transform: 'translateZ(65px)', animationDelay: '1.2s' }}
        >
          <div className="w-5 h-5 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10.5px] font-black uppercase tracking-wider text-slate-800 leading-tight">
              100% Local Inference
            </span>
            <span className="text-[9px] font-mono font-bold text-slate-500 leading-tight mt-0.5 whitespace-nowrap">
              0 Outbound Sockets
            </span>
          </div>
        </div>

        {/* Base 3D Isometric Glass Plate (Centerpiece) */}
        <div
          className="absolute inset-0 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_20px_40px_rgba(15,23,42,0.09),0_1px_3px_rgba(15,23,42,0.04)] flex flex-col items-center justify-center p-4 preserve-3d z-10"
          style={{ transform: 'translateZ(18px)' }}
        >
          {/* Subtle grid pattern inside plate */}
          <div className="absolute inset-0 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:12px_12px] opacity-25 rounded-2xl pointer-events-none" />

          {/* Core Suspended 3D Shield (translateZ: 32px) */}
          <div
            className="w-13 h-13 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-[0_12px_24px_rgba(15,23,42,0.3)] mb-2 preserve-3d transition-transform hover:scale-105"
            style={{ transform: 'translateZ(32px)' }}
          >
            <div className="relative">
              <ShieldCheck className="w-6 h-6 text-emerald-400 stroke-[2.2]" />
              <Lock className="w-3 h-3 text-white absolute -bottom-1 -right-1 stroke-[2.5]" />
            </div>
          </div>

          <div
            className="text-center preserve-3d"
            style={{ transform: 'translateZ(24px)' }}
          >
            <span className="text-[11.5px] font-black uppercase tracking-wider text-slate-900 block leading-tight">
              LexGuard Cryptographic Vault
            </span>
            <span className="text-[9.5px] font-mono font-bold text-emerald-600 block mt-0.5">
              AES-256-GCM RAM Isolated
            </span>
          </div>
        </div>

        {/* SATELLITE CHIP 3: DETERMINISTIC CITATIONS (Bottom Center) */}
        <div
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl bg-slate-900 text-white shadow-xl flex items-center gap-2 z-30 preserve-3d"
          style={{ transform: 'translateX(-50%) translateZ(48px)' }}
        >
          <Scale className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[9.5px] font-bold font-mono tracking-wider text-slate-200">
            DETERMINISTIC CL-XXX GROUNDING
          </span>
        </div>
      </div>
    </div>
  );
}
