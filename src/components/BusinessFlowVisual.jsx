import React from 'react';
import { ShoppingCart, FileText, BookOpenCheck, Award, ArrowRight, ArrowDown } from 'lucide-react';

export default function BusinessFlowVisual() {
  const steps = [
    {
      id: 1,
      title: 'SALE',
      sub: 'Business Activity',
      desc: 'Transact naturally with buyers and suppliers.',
      icon: ShoppingCart,
      color: '#123B78',
      lightBg: 'bg-[#123B78]/5',
      borderColor: 'border-[#123B78]/20',
      iconColor: 'text-[#123B78]',
    },
    {
      id: 2,
      title: 'INVOICE',
      sub: 'Single Entry',
      desc: 'Record once to generate clean, verified bills.',
      icon: FileText,
      color: '#1265A8',
      lightBg: 'bg-[#1265A8]/5',
      borderColor: 'border-[#1265A8]/20',
      iconColor: 'text-[#1265A8]',
    },
    {
      id: 3,
      title: 'BUSINESS RECORD',
      sub: 'Automatic Ledger',
      desc: 'Build an untampered, structured trading history.',
      icon: BookOpenCheck,
      color: '#10B8A5',
      lightBg: 'bg-[#E8F7F3]',
      borderColor: 'border-[#10B8A5]/30',
      iconColor: 'text-[#10B8A5]',
    },
    {
      id: 4,
      title: 'CREDITWORTHINESS',
      sub: 'Financial Credibility',
      desc: 'Lenders evaluate verified operational proof.',
      icon: Award,
      color: '#059669',
      lightBg: 'bg-emerald-50',
      borderColor: 'border-emerald-500/25',
      iconColor: 'text-emerald-600',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
      {/* Header section with principle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1265A8] bg-[#E8F7F3] px-2.5 py-0.5 rounded-md">
              Core Product Principle
            </span>
            <span className="text-xs text-[#526174]">Future Platform Architecture</span>
          </div>
          <h3 className="text-xl font-bold text-[#172033] tracking-tight mt-1.5">
            “Enter information once. Use it everywhere.”
          </h3>
        </div>
        <p className="text-xs md:text-sm text-[#526174] max-w-md">
          How VyapaarMitra converts everyday MSME business activity into transparent financial credibility.
        </p>
      </div>

      {/* Connected Flow Pipeline */}
      <div className="mt-6">
        {/* Desktop Pipeline (Horizontal Grid with Connectors) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.id} className="relative flex flex-col">
                {/* Step Card */}
                <div
                  className={`flex-1 rounded-xl p-4 border ${step.borderColor} ${step.lightBg} transition-all duration-200 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-slate-200/60 shadow-2xs flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${step.iconColor}`} />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#526174]/70">
                        0{step.id}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-[#526174] uppercase tracking-wider">
                      {step.sub}
                    </div>
                    <h4 className="text-base font-bold text-[#172033] tracking-tight mt-0.5">
                      {step.title}
                    </h4>

                    <p className="text-xs text-[#526174] mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>

                {/* Desktop Arrow to next step */}
                {!isLast && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs items-center justify-center text-[#1265A8]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Mobile Arrow down to next step */}
                {!isLast && (
                  <div className="md:hidden flex justify-center py-2 text-[#1265A8]">
                    <ArrowDown className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
