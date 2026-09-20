import React from 'react';
import { BadgeCheck, ShieldCheck, Clock, CheckCircle2, Lock } from 'lucide-react';
import CreditworthinessCard from './CreditworthinessCard';
import { useAppState } from '../context/AppStateContext.jsx';
import { useSession } from '../context/SessionContext.jsx';

const DECISIONS = ['Approve', 'Make offer', 'Decline'];

const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatAmount(amount) {
  return `₹${amountFormatter.format(amount || 0)}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(isoDate) {
  if (!isoDate) return '—';
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!parts) return isoDate;
  const [, year, month, day] = parts;
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

export default function LenderProfilePage() {
  const { records, profileShared, lenderDecision, setLenderDecision } = useAppState();
  const { customer } = useSession();

  if (!profileShared) {
    return (
      <p className="text-sm text-[#526174]">
        No business has shared a profile with you yet.
      </p>
    );
  }

  const settled = records.filter((record) => record.paidOnTime === true || record.paidOnTime === false);
  const onTime = settled.filter((record) => record.paidOnTime === true).length;
  const verifiedCount = records.filter((record) => record.status === 'Verified').length;

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#1265A8]">Lending Partner View</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
            {customer?.name}
          </h1>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            Shared with your consent. Read-only — you present readiness, the partner decides.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold self-start sm:self-auto">
          <Lock className="w-3.5 h-3.5" />
          <span>Read Only</span>
        </span>
      </div>

      {/* 1. Readiness status (the same card the business sees) */}
      <section aria-label="Readiness Status">
        <CreditworthinessCard />
      </section>

      {/* 2. On-time payment summary */}
      <section aria-label="On-time Payment Summary">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
          <div className="pb-5 border-b border-slate-100 mb-6">
            <h3 className="text-xl font-bold text-[#172033] tracking-tight">
              On-time Payment Summary
            </h3>
            <p className="text-xs md:text-sm text-[#526174] mt-0.5">
              Settlement outcomes recorded against this business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#526174]">Settled</span>
                <CheckCircle2 className="w-4 h-4 text-[#10B8A5]" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-bold text-[#172033] tracking-tight">
                  {settled.length}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-[#526174] truncate">
                  of {records.length} recorded
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#526174]">Paid on time</span>
                <Clock className="w-4 h-4 text-[#1265A8]" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-bold text-[#172033] tracking-tight">
                  {settled.length ? `${Math.round((onTime / settled.length) * 100)}%` : '—'}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-[#526174] truncate">
                  {settled.length ? `${onTime} of ${settled.length} settled` : 'No settlements yet'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#526174]">Verified records</span>
                <ShieldCheck className="w-4 h-4 text-[#10B8A5]" />
              </div>
              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-bold text-[#172033] tracking-tight">
                  {verifiedCount}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-[#526174] truncate">
                  of {records.length} recorded
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Per-record verification evidence */}
      <section aria-label="Verification Evidence">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
          <div className="pb-5 border-b border-slate-100">
            <h3 className="text-xl font-bold text-[#172033] tracking-tight">
              Verification Evidence
            </h3>
            <p className="text-xs md:text-sm text-[#526174] mt-0.5">
              Every recorded trade and the evidence behind its verification.
            </p>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Party</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((row) => (
                  <tr key={row.id}>
                    <td className="py-3.5 px-3 font-medium text-[#172033] whitespace-nowrap text-xs md:text-sm">
                      {formatDate(row.date)}
                    </td>

                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                          row.type === 'Sale'
                            ? 'bg-[#E8F7F3] text-[#123B78]'
                            : 'bg-blue-50 text-[#1265A8]'
                        }`}
                      >
                        <span>{row.type}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                      {row.party}
                    </td>

                    <td className="py-3.5 px-3 text-right font-mono font-bold text-[#172033] text-xs md:text-sm whitespace-nowrap">
                      {formatAmount(row.amount)}
                    </td>

                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          row.status === 'Verified'
                            ? 'bg-[#E8F7F3] text-[#123B78] border-[#10B8A5]/30'
                            : 'bg-slate-100 text-[#526174] border-slate-200'
                        }`}
                      >
                        {row.status === 'Verified' && (
                          <BadgeCheck className="w-3.5 h-3.5 text-[#10B8A5]" />
                        )}
                        <span>{row.status}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-3 text-xs md:text-sm text-[#526174]">
                      {row.verificationSource || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526174]">
            <span>Showing {records.length} shared records</span>
            <span>Prototype — verification simulated</span>
          </div>
        </div>
      </section>

      {/* 4. Return decision */}
      <section aria-label="Return Decision">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-[#172033] tracking-tight">
                Return a decision
              </h3>
              <p className="text-xs md:text-sm text-[#526174] mt-0.5">
                Your decision goes back to the business. VyapaarMitra does not decide.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              {DECISIONS.map((decision) => (
                <button
                  key={decision}
                  type="button"
                  onClick={() => setLenderDecision(decision)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-colors ${
                    lenderDecision === decision
                      ? 'bg-[#123B78] text-white'
                      : 'bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50'
                  }`}
                >
                  <span>{decision}</span>
                </button>
              ))}
            </div>
          </div>

          {lenderDecision && (
            <p className="mt-4 pt-3 border-t border-slate-100 text-xs text-[#526174]">
              Returned to the business: <span className="font-semibold text-[#172033]">{lenderDecision}</span>
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
