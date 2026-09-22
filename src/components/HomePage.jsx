import React from 'react';
import { 
  FilePlus2, 
  PackagePlus, 
  LayoutDashboard, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Info,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import BusinessFlowVisual from './BusinessFlowVisual';
import { useSession } from '../context/SessionContext.jsx';
import { canAccess } from '../data/roles.js';

export default function HomePage({ onNavigate, onTriggerComingSoon }) {
  const { customer, role } = useSession();
  const mayInvoice = canAccess(role, 'create-invoice');
  const mayReceive = canAccess(role, 'create-grn');

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Welcoming Hero Banner (Calm, Warm, Non-intimidating) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background tint */}
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-gradient-to-br from-[#E8F7F3] to-[#10B8A5]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F7F3] rounded-full text-xs font-bold text-[#123B78]">
              <Sparkles className="w-3.5 h-3.5 text-[#10B8A5]" />
              <span>Modern Bahi Khata for Indian MSMEs</span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-[#172033] tracking-tight">
              Namaste, <span className="text-[#123B78]">{customer?.name}</span>
            </h1>

            <p className="text-sm md:text-base text-[#526174] leading-relaxed">
              Record your sales and purchases once. VyaparMitra turns your everyday trade into a verified financial record that speaks for your credibility.
            </p>
          </div>

          {/* Quick Creditworthiness Status Badge */}
          <div className="p-5 rounded-2xl bg-[#F6F9FB] border border-slate-200/80 flex-shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1265A8]">
                Trading Health
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
                ● HEALTHY
              </span>
            </div>

            <p className="text-xs text-[#526174] mt-2.5 leading-relaxed">
              Your business activity shows steady, verified trading history.
            </p>

            <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-[#526174]">
              <span>Prototype status</span>
              <button
                onClick={() => onNavigate('dashboard')}
                className="font-semibold text-[#1265A8] hover:text-[#123B78] inline-flex items-center gap-1"
              >
                <span>View details</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. The Two Core Daily Actions — only the ones this role may perform */}
      {(mayInvoice || mayReceive) && (
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-[#172033] tracking-tight">
            What would you like to do today?
          </h2>
          <p className="text-xs md:text-sm text-[#526174]">
            Two simple actions to manage your daily trade. Enter information once, use it everywhere.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Action 1: Create Invoice */}
          {mayInvoice && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-card hover:border-[#123B78]/40 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#E8F7F3] flex items-center justify-center text-[#123B78] group-hover:scale-105 transition-transform">
                  <FilePlus2 className="w-6 h-6 text-[#10B8A5]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#1265A8]">
                  Sales Entry
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#172033] tracking-tight group-hover:text-[#123B78] transition-colors">
                Create Invoice
              </h3>

              <p className="text-sm text-[#526174] mt-2 leading-relaxed">
                Record a sale to your customer and generate a clean, compliant invoice. Automatically updates your receivables and trading track record.
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('create-invoice')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#123B78] hover:bg-[#1265A8] text-white font-bold text-sm shadow-xs transition-colors"
              >
                <span>Create Invoice →</span>
              </button>
            </div>
          </div>
          )}

          {/* Action 2: Create GRN */}
          {mayReceive && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-card hover:border-[#10B8A5]/40 transition-all group flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-[#10B8A5] group-hover:scale-105 transition-transform">
                  <PackagePlus className="w-6 h-6 text-[#10B8A5]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#E8F7F3] text-[#123B78]">
                  Purchase Entry
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#172033] tracking-tight group-hover:text-[#1265A8] transition-colors">
                Create GRN (Goods Received)
              </h3>

              <p className="text-sm text-[#526174] mt-2 leading-relaxed">
                Record material or goods received from your supplier. Automatically matches purchase bills and verifies fulfillment consistency.
              </p>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigate('create-grn')}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#1265A8] hover:bg-[#123B78] text-white font-bold text-sm shadow-xs transition-colors"
              >
                <span>Create GRN →</span>
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
      )}

      {/* 3. Business Dashboard Gateway Card */}
      <div className="bg-gradient-to-r from-[#123B78] to-[#1265A8] rounded-2xl p-6 md:p-7 text-white shadow-card flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#10B8A5]">
            <LayoutDashboard className="w-4 h-4" />
            <span>FINANCIAL OVERVIEW</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Looking for detailed ledger records and metrics?
          </h3>
          <p className="text-xs md:text-sm text-slate-200">
            Check your total sales, pending receivables, supplier purchases, and full transaction history on the dedicated Business Dashboard.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#123B78] font-bold text-sm shadow-xs transition-colors self-start md:self-auto"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-4 h-4 text-[#10B8A5]" />
        </button>
      </div>

      {/* 4. Connected Core Logic Visual */}
      <div>
        <BusinessFlowVisual />
      </div>
    </div>
  );
}
