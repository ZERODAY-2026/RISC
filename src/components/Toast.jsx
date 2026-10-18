import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200 shadow-xl text-slate-800 text-xs font-medium animate-in slide-in-from-bottom-3 duration-200">
      {isSuccess && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
      {isError && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
      {!isSuccess && !isError && <Info className="w-4 h-4 text-slate-600 flex-shrink-0" />}
      <span>{toast.message}</span>
      <button
        onClick={onClose}
        className="ml-2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
