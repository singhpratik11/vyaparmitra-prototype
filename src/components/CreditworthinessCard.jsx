import React from 'react';
import { ShieldCheck, Info, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export default function CreditworthinessCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs relative overflow-hidden">
      {/* Subtle brand tint gradient accent in top right */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-[#E8F7F3] to-[#10B8A5]/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Side: Title, Status, and Narrative */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1265A8]">
            <ShieldCheck className="w-4 h-4 text-[#10B8A5]" />
            <span>Financial Credibility Indicator</span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h2 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
              Business Creditworthiness
            </h2>

            {/* Health Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 font-bold text-sm tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
              </span>
              <span>● HEALTHY</span>
            </div>
          </div>

          <p className="text-sm md:text-base text-[#526174] font-normal leading-relaxed">
            Your recorded business activity indicates a consistent trading history.
          </p>

          {/* Prototype Disclaimer */}
          <div className="flex items-center gap-1.5 text-xs text-[#526174]/80 pt-1">
            <Info className="w-3.5 h-3.5 flex-shrink-0 text-[#1265A8]" />
            <span className="italic">
              Prototype indicator — not a bank/NBFC credit score.
            </span>
          </div>
        </div>

        {/* Right Side: Visual Business Signals (Bahi Khata Meets Fintech) */}
        <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-3 lg:flex lg:items-center gap-3">
          <div className="p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 min-w-[125px]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#526174]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B8A5]" />
              <span>Settlements</span>
            </div>
            <p className="text-base font-bold text-[#123B78] mt-1">98.4%</p>
            <p className="text-[10px] text-[#526174]">On-time history</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 min-w-[125px]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#526174]">
              <Clock className="w-3.5 h-3.5 text-[#1265A8]" />
              <span>Consistency</span>
            </div>
            <p className="text-base font-bold text-[#123B78] mt-1">Active</p>
            <p className="text-[10px] text-[#526174]">Continuous trading</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 min-w-[125px] col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#526174]">
              <TrendingUp className="w-3.5 h-3.5 text-[#10B8A5]" />
              <span>Record Health</span>
            </div>
            <p className="text-base font-bold text-[#10B8A5] mt-1">Verified</p>
            <p className="text-[10px] text-[#526174]">Clean bahi khata</p>
          </div>
        </div>
      </div>
    </div>
  );
}
