import React, { useState } from 'react';
import { ArrowRight, Info, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import { useSession } from '../context/SessionContext.jsx';

export default function LoginPage() {
  const { signIn } = useSession();
  const [vendorId, setVendorId] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = signIn(vendorId, employeeId);
    if (!result.ok) setError(result.error);
  };

  return (
    <div className="min-h-screen bg-[#F6F9FB] text-[#172033] flex flex-col antialiased selection:bg-[#E8F7F3] selection:text-[#123B78]">
      {/* Top Banner indicating prototype mode */}
      <aside aria-label="Prototype environment notice" className="bg-[#123B78] text-white text-[11px] font-medium py-1.5 px-4 text-center select-none flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#10B8A5] inline-block animate-pulse"></span>
        <span>
          <strong>VyaparMitra Executive Prototype:</strong> Frontend demonstration mode. No live banking, GST, or database integrations.
        </span>
      </aside>

      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="bg-white rounded-2xl border border-slate-200/90 w-full max-w-lg p-6 md:p-8 shadow-xs">
          <div className="text-center">
            <div className="flex justify-center mb-5">
              <Logo size="small" />
            </div>

            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1265A8] mb-1">
              <ShieldCheck className="w-4 h-4 text-[#10B8A5]" />
              <span>Plant Sign In</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
              Sign in to VyaparMitra
            </h2>
            <p className="text-sm md:text-base text-[#526174] mt-1">
              Your Vendor ID and Employee ID work as a pair.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                  Vendor ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={vendorId}
                  onChange={(e) => {
                    setVendorId(e.target.value);
                    setError('');
                  }}
                  placeholder="VM-0001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    setError('');
                  }}
                  placeholder="E001"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm font-mono"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-600">{error}</p>
            )}

            <div className="p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#1265A8]" />
              <p className="text-xs text-[#526174] leading-relaxed">
                Prototype login — demo only, no real auth. The pair is checked against the demo user list;
                there are no passwords and nothing is sent anywhere.
              </p>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#123B78] hover:bg-[#1265A8] text-white font-bold text-sm shadow-xs transition-colors"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </main>

      <footer className="py-6 px-6 text-center text-xs text-[#526174] border-t border-slate-200/60 bg-white/50">
        <p>© 2026 VyaparMitra Technologies. Prototype version for Product Management presentation.</p>
      </footer>
    </div>
  );
}
