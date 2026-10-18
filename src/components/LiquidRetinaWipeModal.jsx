import React, { useEffect, useState } from 'react';
import { Trash2, ShieldAlert, KeyRound, Lock, Zap, X, CheckCircle2 } from 'lucide-react';

/**
 * LiquidRetinaWipeModal
 * High-definition Liquid Retina frosted glassmorphism confirmation modal
 * for secure session wipe and in-memory AES-256-GCM zeroization.
 */
export default function LiquidRetinaWipeModal({ isOpen, onClose, onConfirm, isWiping }) {
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnimating(true);
      const handleKeyDown = (e) => {
        if (e.key === 'Escape' && !isWiping) {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setAnimating(false);
    }
  }, [isOpen, isWiping, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wipe-modal-title"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. ULTRA-DEEP FROSTED BACKDROP WITH LIQUID AMBIENT SHIMMER
      ───────────────────────────────────────────────────────────── */}
      <div
        onClick={isWiping ? undefined : onClose}
        className="fixed inset-0 bg-slate-950/30 backdrop-blur-xl transition-opacity duration-300 animate-in fade-in"
      />

      {/* Ambient liquid glow behind the modal card */}
      <div
        className="pointer-events-none absolute w-[420px] h-[360px] rounded-full bg-gradient-to-tr from-rose-500/20 via-red-500/15 to-amber-400/20 blur-3xl opacity-75 transform -translate-y-4"
        aria-hidden="true"
      />

      {/* ─────────────────────────────────────────────────────────────
          2. LIQUID RETINA CARD SURFACE (Apple-Style Squircle & Sheen)
      ───────────────────────────────────────────────────────────── */}
      <div
        className={`relative w-full max-w-md rounded-3xl bg-white/92 backdrop-blur-2xl border border-white/80 p-6 sm:p-7 shadow-[0_32px_80px_-16px_rgba(15,23,42,0.22),0_0_0_1px_rgba(255,255,255,0.9)] ring-1 ring-slate-900/5 transition-all duration-300 transform ${
          animating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-2'
        }`}
      >
        {/* Close Button */}
        {!isWiping && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100/80 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Liquid Icon Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            {/* Outer pulsating liquid halo */}
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-red-500/20 via-rose-500/30 to-amber-500/20 blur-md animate-pulse" />
            
            {/* Liquid icon badge */}
            <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/10 via-red-500/15 to-orange-500/10 border border-rose-200/80 shadow-inner">
              <Trash2 className="w-7 h-7 text-rose-600 animate-in zoom-in-50 duration-300" />
            </div>
          </div>

          {/* Micro-badge */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50/90 border border-rose-200/70 text-[10.5px] font-bold text-rose-700 uppercase tracking-wider mb-2.5">
            <Lock className="w-3 h-3 text-rose-600" />
            <span>Cryptographic Session Wipe</span>
          </div>

          <h3 id="wipe-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            Securely Wipe Session from RAM?
          </h3>
          <p className="text-xs sm:text-[13px] text-slate-600 mt-2 leading-relaxed max-w-sm">
            This will immediately overwrite and permanently purge all extracted clauses, BM25 indices, and cryptographic session keys from active system memory.
          </p>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            3. TECHNICAL SECURITY ASSURANCE POINTS (LIQUID SLATE PILLS)
        ───────────────────────────────────────────────────────────── */}
        <div className="mt-5 space-y-2 rounded-2xl bg-slate-50/80 border border-slate-200/70 p-3.5 text-left">
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <KeyRound className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-slate-900">Ephemeral Key Zeroization:</strong>
              <span className="block text-slate-500 text-[11px] leading-tight">
                Destroys the 256-bit CSPRNG AES master key, rendering memory unrecoverable.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700 pt-1 border-t border-slate-200/50">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-slate-900">RAM Physical Overwrite (0x00):</strong>
              <span className="block text-slate-500 text-[11px] leading-tight">
                Active document buffers overwritten with null bytes, followed by garbage collection.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-700 pt-1 border-t border-slate-200/50">
            <ShieldAlert className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold text-slate-900">Zero Disk Residue:</strong>
              <span className="block text-slate-500 text-[11px] leading-tight">
                No temporary files or cached vector embeddings are retained on disk.
              </span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            4. ACTION BUTTONS (LIQUID GLASS CANCEL + CRIMSON PURGE)
        ───────────────────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isWiping}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl border border-slate-200 bg-white/90 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold transition-all shadow-2xs hover:shadow-xs disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isWiping}
            className="w-full sm:w-1/2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:via-rose-700 hover:to-red-700 active:scale-98 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-rose-500/25 flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isWiping ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Zeroizing RAM...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Wipe & Purge RAM</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
