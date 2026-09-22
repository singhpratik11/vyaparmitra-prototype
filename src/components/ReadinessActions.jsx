import React, { useState } from 'react';
import { FileDown, ShieldCheck, Landmark, Info } from 'lucide-react';
import { useAppState } from '../context/AppStateContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import { scoreTenant } from '../data/score.js';
import { openReadinessReport } from './readinessReport.js';

const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatLakh(amount) {
  return `₹${(amount / 100000).toFixed(1)}L`;
}

/**
 * Indicative working-capital shapes by band. Amounts are multiples of the business's own
 * monthly trade volume, so a bigger book sees bigger numbers; rate and tenure widen as the
 * band weakens. Simulated throughout — no lender has seen any of this.
 */
const OFFER_SHAPES = {
  Strong: [
    { name: 'Invoice advance', multiple: 0.6, rateFrom: 13.5, rateTo: 15.0, tenure: '30–90 days' },
    { name: 'Working capital line', multiple: 1.2, rateFrom: 14.0, rateTo: 16.5, tenure: '12 months' },
    { name: 'Term facility', multiple: 2.0, rateFrom: 15.0, rateTo: 17.0, tenure: '24 months' },
  ],
  Improving: [
    { name: 'Invoice advance', multiple: 0.4, rateFrom: 16.0, rateTo: 18.0, tenure: '30–60 days' },
    { name: 'Working capital line', multiple: 0.8, rateFrom: 17.0, rateTo: 19.5, tenure: '6–12 months' },
  ],
  'Needs Attention': [
    { name: 'Small invoice advance', multiple: 0.2, rateFrom: 20.0, rateTo: 22.5, tenure: '30 days' },
    { name: 'Secured short-term line', multiple: 0.35, rateFrom: 21.0, rateTo: 24.0, tenure: '3–6 months' },
  ],
};

const BAND_NOTE = {
  Strong: 'A verified, well-settled record usually attracts the widest range and the finest pricing.',
  Improving: 'Partners typically start smaller here and revisit terms as the settled record builds.',
  'Needs Attention':
    'With little verified or on-time history on file, expect small, short and closely-priced facilities.',
};

export default function ReadinessActions({ onShare }) {
  const { records } = useAppState();
  const { customer } = useSession();
  const [showOffers, setShowOffers] = useState(false);
  const [reportBlocked, setReportBlocked] = useState(false);

  const { measured, band } = scoreTenant(records);
  const monthlyVolume = measured.tradeVolumeLakh * 100000;
  const offers = OFFER_SHAPES[band] || OFFER_SHAPES['Needs Attention'];

  const handleDownload = () => {
    const opened = openReadinessReport(customer, records);
    setReportBlocked(!opened);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#172033] tracking-tight">Act on your record</h3>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            Take your readiness profile to a lending partner, on your terms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <FileDown className="w-4 h-4 text-[#1265A8]" />
            <span>Download report</span>
          </button>

          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#10B8A5]" />
            <span>Share with lender</span>
          </button>

          <button
            type="button"
            onClick={() => setShowOffers(!showOffers)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <Landmark className="w-4 h-4 text-[#1265A8]" />
            <span>{showOffers ? 'Hide loan options' : 'See loan options'}</span>
          </button>
        </div>
      </div>

      {reportBlocked && (
        <p className="mt-4 text-xs font-semibold text-amber-800">
          The report opens in a new tab — allow pop-ups for this site and try again.
        </p>
      )}

      {showOffers && (
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#526174]">
                Indicative working capital
              </h4>
              <p className="text-xs text-[#526174] mt-1">{BAND_NOTE[band]}</p>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold self-start sm:self-auto">
              <Info className="w-3.5 h-3.5" />
              <span>Prototype — simulated</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
                  <th className="py-3 px-3">Facility</th>
                  <th className="py-3 px-3 text-right">Indicative amount</th>
                  <th className="py-3 px-3 text-right">Indicative rate</th>
                  <th className="py-3 px-3 text-right">Tenure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {offers.map((offer) => {
                  const midpoint = monthlyVolume * offer.multiple;
                  return (
                    <tr key={offer.name} className="hover:bg-[#F6F9FB]/80 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                        {offer.name}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                        {formatLakh(midpoint * 0.8)} – {formatLakh(midpoint * 1.2)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                        {offer.rateFrom.toFixed(1)}% – {offer.rateTo.toFixed(1)}% p.a.
                      </td>
                      <td className="py-3.5 px-3 text-right text-xs md:text-sm text-[#526174]">
                        {offer.tenure}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#1265A8]" />
            <p className="text-xs text-[#526174] leading-relaxed">
              Indicative only — final terms are set by the lender, not VyaparMitra. These ranges are
              illustrative shapes based on your own recorded trade ({formatLakh(monthlyVolume)} a month) and
              your {band.toLowerCase()} band. Nothing here is an offer, an approval, or a quote, and no
              lending partner has seen your profile unless you have shared it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
