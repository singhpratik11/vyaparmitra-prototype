import React from 'react';
import { FilePlus2, PackagePlus, LayoutDashboard, ArrowRight, Sparkles } from 'lucide-react';

export default function ActionCards({ onNavigate, onTriggerComingSoon }) {
  const cards = [
    {
      id: 'invoice',
      title: 'Create Invoice',
      tagline: 'SALE ENTRY',
      description: 'Record a sale and generate an invoice.',
      buttonText: 'Create Invoice →',
      icon: FilePlus2,
      accentColor: 'from-[#123B78] to-[#1265A8]',
      badgeBg: 'bg-[#E8F7F3] text-[#123B78]',
      targetView: 'create-invoice',
    },
    {
      id: 'grn',
      title: 'Create GRN',
      tagline: 'PURCHASE ENTRY',
      description: 'Record goods received from your supplier.',
      buttonText: 'Create GRN →',
      icon: PackagePlus,
      accentColor: 'from-[#1265A8] to-[#10B8A5]',
      badgeBg: 'bg-teal-50 text-teal-800',
      targetView: 'create-grn',
    },
    {
      id: 'dashboard',
      title: 'Business Dashboard',
      tagline: 'FINANCIAL VIEW',
      description: 'Track your business activity and financial record.',
      buttonText: 'View Dashboard →',
      icon: LayoutDashboard,
      accentColor: 'from-[#10B8A5] to-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-800',
      targetView: 'dashboard',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-card transition-all duration-200 flex flex-col justify-between group hover:border-[#1265A8]/30 relative overflow-hidden"
          >
            {/* Subtle top indicator bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentColor} opacity-70 group-hover:opacity-100 transition-opacity`}
            />

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#F6F9FB] border border-slate-200/60 flex items-center justify-center group-hover:bg-[#E8F7F3] transition-colors">
                  <Icon className="w-6 h-6 text-[#123B78] group-hover:text-[#10B8A5] transition-colors" />
                </div>
                <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${card.badgeBg}`}>
                  {card.tagline}
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#172033] tracking-tight group-hover:text-[#123B78] transition-colors">
                {card.title}
              </h3>

              <p className="text-sm text-[#526174] mt-2 leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="pt-6 mt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  if (card.targetView === 'dashboard') {
                    onNavigate('dashboard');
                  } else {
                    onNavigate(card.targetView);
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 shadow-xs bg-[#123B78] hover:bg-[#1265A8] text-white group-hover:gap-2.5"
              >
                <span>{card.buttonText}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
