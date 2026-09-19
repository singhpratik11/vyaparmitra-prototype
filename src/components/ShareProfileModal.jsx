import React, { useEffect } from 'react';
import { X, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

export default function ShareProfileModal({ isOpen, onClose, onConfirm }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172033]/50 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl border border-slate-200/90 w-full max-w-lg p-6 md:p-8 shadow-modal relative transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#526174] hover:bg-slate-100 hover:text-[#172033] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="text-center pt-2">
          {/* Official Brand Logo */}
          <div className="flex justify-center mb-5">
            <Logo size="small" />
          </div>

          {/* Heading */}
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#10B8A5] px-3 py-1 bg-[#E8F7F3] rounded-full inline-block mb-3">
            Your Consent
          </span>

          <h3 className="text-2xl font-bold text-[#123B78] tracking-tight">
            SHARE WITH A LENDING PARTNER
          </h3>

          {/* Main Statement */}
          <p className="text-base md:text-lg font-medium text-[#172033] mt-4 leading-relaxed max-w-md mx-auto">
            “Your trade record stays yours. Share it with a lending partner and they decide what
            they can offer.”
          </p>

          {/* Supporting Text */}
          <p className="text-xs md:text-sm text-[#526174] mt-2">
            VyapaarMitra presents your readiness. It never approves anything itself.
          </p>

          {/* What the partner sees */}
          <div className="mt-6 p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#123B78] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#10B8A5]" />
              <span>What the partner sees</span>
            </div>
            <p className="text-xs text-[#526174] leading-relaxed">
              Your readiness status, the verification evidence behind each record, and your on-time
              payment summary. Nothing else is shared, and you can stop sharing at any time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs md:text-sm text-[#526174] hover:bg-slate-50"
            >
              Not now
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#123B78] hover:bg-[#1265A8] text-white font-bold text-sm shadow-xs transition-colors"
            >
              <span>Check Credit Eligibility</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
