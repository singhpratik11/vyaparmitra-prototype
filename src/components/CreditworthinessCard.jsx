import React from 'react';
import { ShieldCheck, Info, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { useAppState } from '../context/AppStateContext.jsx';
import { scoreTenant } from '../data/score.js';

const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatAmount(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amountFormatter.format(amount || 0)}`;
}

function formatShare(share) {
  return share === null ? '—' : `${Math.round(share * 100)}%`;
}

function sumAmounts(records) {
  return records.reduce((total, record) => total + (Number(record.amount) || 0), 0);
}

const STATUS_STYLES = {
  Strong: {
    pill: 'bg-emerald-50 border-emerald-200/80 text-emerald-700',
    ping: 'bg-emerald-400',
    dot: 'bg-emerald-600',
  },
  Improving: {
    pill: 'bg-blue-50 border-blue-200/80 text-[#1265A8]',
    ping: 'bg-[#1265A8]',
    dot: 'bg-[#1265A8]',
  },
  'Needs attention': {
    pill: 'bg-amber-50 border-amber-200/80 text-amber-800',
    ping: 'bg-amber-400',
    dot: 'bg-amber-600',
  },
};

export default function CreditworthinessCard() {
  const { records, scoreSettings } = useAppState();

  // Same model the backend scores with, so the band here can never contradict it.
  // The weighted number itself stays backend-only; this card shows the word alone.
  const { measured, band } = scoreTenant(records, scoreSettings.weights, scoreSettings.thresholds);
  const volume = sumAmounts(records);
  const verifiedShare = measured.verifiedPct === null ? null : measured.verifiedPct / 100;
  const onTimeShare = measured.onTimePct === null ? null : measured.onTimePct / 100;
  const concentration = measured.concentrationPct === null ? null : measured.concentrationPct / 100;

  const status = records.length === 0 ? 'Needs attention' : band === 'Needs Attention' ? 'Needs attention' : band;
  const statusStyle = STATUS_STYLES[status];

  const narrative = records.length
    ? [
        `${records.length} record${records.length === 1 ? '' : 's'} worth ${formatAmount(volume)} recorded`,
        verifiedShare === null ? null : `${formatShare(verifiedShare)} verified`,
        concentration === null ? null : `largest buyer ${formatShare(concentration)} of sales`,
      ]
        .filter(Boolean)
        .join(', ') + `.${onTimeShare === null ? ' No settled payments yet.' : ''}`
    : 'No trade recorded yet — add invoices and GRNs to build a presentable record.';

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
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border font-bold text-sm tracking-wide ${statusStyle.pill}`}>
              <span className="relative flex h-2.5 w-2.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusStyle.ping}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${statusStyle.dot}`}></span>
              </span>
              <span>● {status.toUpperCase()}</span>
            </div>
          </div>

          <p className="text-sm md:text-base text-[#526174] font-normal leading-relaxed">
            {narrative}
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
            <p className="text-base font-bold text-[#123B78] mt-1">{formatShare(onTimeShare)}</p>
            <p className="text-[10px] text-[#526174]">
              {onTimeShare === null
                ? 'No bank-confirmed payments yet'
                : measured.selfReportedCount
                  ? `${measured.confirmedCount} bank-confirmed · ${measured.selfReportedCount} self-reported excluded`
                  : `${measured.confirmedCount} bank-confirmed payment${measured.confirmedCount === 1 ? '' : 's'}`}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 min-w-[125px]">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#526174]">
              <Clock className="w-3.5 h-3.5 text-[#1265A8]" />
              <span>Consistency</span>
            </div>
            <p className="text-base font-bold text-[#123B78] mt-1">{formatAmount(volume)}</p>
            <p className="text-[10px] text-[#526174]">Recorded trade volume</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 min-w-[125px] col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#526174]">
              <TrendingUp className="w-3.5 h-3.5 text-[#10B8A5]" />
              <span>Record Health</span>
            </div>
            <p className="text-base font-bold text-[#10B8A5] mt-1">{formatShare(verifiedShare)}</p>
            <p className="text-[10px] text-[#526174]">Records verified</p>
          </div>
        </div>
      </div>
    </div>
  );
}
