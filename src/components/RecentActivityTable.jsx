import React, { useState } from 'react';
import { FileText, PackageCheck, ArrowUpRight, ArrowDownLeft, Filter, ExternalLink, ShieldCheck, BadgeCheck, IndianRupee, Landmark } from 'lucide-react';
import { useAppState, getDaysLate, isPurchaseRecord, PAYMENT_PROOF_LOGGED, PAYMENT_PROOF_CONFIRMED } from '../context/AppStateContext.jsx';
import RecordPaymentModal from './RecordPaymentModal';
import { openReadinessReport } from './readinessReport.js';
import { useSession } from '../context/SessionContext.jsx';

const PAYMENT_STATUS_STYLES = {
  Paid: 'bg-[#E8F7F3] text-[#123B78] border-[#10B8A5]/30',
  'Partially Paid': 'bg-blue-50 text-[#1265A8] border-blue-200',
  Unpaid: 'bg-slate-100 text-[#526174] border-slate-200',
};

// Bank-confirmed is the strong proof; a logged receipt is the weak one.
const PAYMENT_PROOF_TAGS = {
  [PAYMENT_PROOF_CONFIRMED]: { label: 'Bank-confirmed', style: 'bg-[#E8F7F3] text-[#123B78]' },
  [PAYMENT_PROOF_LOGGED]: { label: 'Received (unverified)', style: 'bg-amber-50 text-amber-800' },
};

function formatTiming(record) {
  const daysLate = getDaysLate(record);

  // The seeded ledger states whether a payment was on time; trust that over the day
  // count, which can disagree when an invoice was settled before it matured.
  if (record.paidOnTime === false) {
    return daysLate !== null && daysLate > 0
      ? `${daysLate} ${daysLate === 1 ? 'day' : 'days'} late`
      : 'late';
  }
  if (record.paidOnTime === true) return 'on time';

  if (daysLate === null) return null;
  return daysLate <= 0 ? 'on time' : `${daysLate} ${daysLate === 1 ? 'day' : 'days'} late`;
}

// Simulated only — the prototype has no verification integrations.
const VERIFICATION_SOURCES = ['GST e-invoice ref', 'Bank inflow matched', 'Buyer confirmed'];

const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatAmount(amount) {
  return `₹${amountFormatter.format(amount || 0)}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Renders the stored yyyy-mm-dd as "18 Sep 2026", the shape the table already used.
function formatDate(isoDate) {
  if (!isoDate) return '—';
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!parts) return isoDate;
  const [, year, month, day] = parts;
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

export default function RecentActivityTable({ onTriggerComingSoon }) {
  const { records, verifyRecord, recordPayment, bankMatchPayment, scoreSettings } = useAppState();
  const { customer } = useSession();
  const [filter, setFilter] = useState('ALL');
  const [paymentRecordId, setPaymentRecordId] = useState(null);

  const paymentRecord = records.find((record) => record.id === paymentRecordId) || null;

  // Cycles through the mock sources as records get verified.
  const verifiedCount = records.filter((record) => record.status === 'Verified').length;

  const handleVerify = (event, id) => {
    event.stopPropagation();
    verifyRecord(id, VERIFICATION_SOURCES[verifiedCount % VERIFICATION_SOURCES.length]);
  };

  const filteredActivities = records.filter((record) => {
    if (filter === 'INVOICE') return record.type === 'Sale';
    if (filter === 'GRN') return isPurchaseRecord(record);
    return true;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#172033] tracking-tight">
              Recent Business Activity
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-[#526174] px-2 py-0.5 rounded">
              Mock Ledger
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            Static view of verified invoices and supplier goods receipts.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F6F9FB] rounded-xl border border-slate-200/70 self-start sm:self-auto">
          {['ALL', 'INVOICE', 'GRN'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filter === type
                  ? 'bg-white text-[#123B78] shadow-xs border border-slate-200/50'
                  : 'text-[#526174] hover:text-[#172033]'
              }`}
            >
              {type === 'ALL' ? 'All Activity' : type === 'INVOICE' ? 'Invoices' : 'GRNs'}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              <th className="py-3 px-3">Date</th>
              <th className="py-3 px-3">Type</th>
              <th className="py-3 px-3">Party</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-3 text-center">Status</th>
              <th className="py-3 px-3 text-center">Payment</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredActivities.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-[#F6F9FB]/80 transition-colors group cursor-pointer"
                onClick={onTriggerComingSoon}
              >
                {/* Date */}
                <td className="py-3.5 px-3 font-medium text-[#172033] whitespace-nowrap text-xs md:text-sm">
                  {formatDate(row.date)}
                </td>

                {/* Type */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                      row.type === 'Sale'
                        ? 'bg-[#E8F7F3] text-[#123B78]'
                        : 'bg-blue-50 text-[#1265A8]'
                    }`}
                  >
                    {row.type === 'Sale' ? (
                      <FileText className="w-3.5 h-3.5 text-[#10B8A5]" />
                    ) : (
                      <PackageCheck className="w-3.5 h-3.5 text-[#1265A8]" />
                    )}
                    <span>{row.type}</span>
                  </span>
                </td>

                {/* Party */}
                <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                  {row.party}
                </td>

                {/* Amount */}
                <td className="py-3.5 px-3 text-right font-mono font-bold text-[#172033] text-xs md:text-sm whitespace-nowrap">
                  {formatAmount(row.amount)}
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                  <span
                    title={row.verificationSource || undefined}
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

                {/* Payment */}
                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      PAYMENT_STATUS_STYLES[row.paymentStatus] || PAYMENT_STATUS_STYLES.Unpaid
                    }`}
                  >
                    {row.paymentStatus || 'Unpaid'}
                  </span>

                  {row.paymentProof && (
                    <div className="mt-1 flex items-center justify-center gap-1.5">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          PAYMENT_PROOF_TAGS[row.paymentProof].style
                        }`}
                      >
                        {PAYMENT_PROOF_TAGS[row.paymentProof].label}
                      </span>
                      <span className="text-[10px] text-[#526174]">{formatTiming(row)}</span>
                    </div>
                  )}
                </td>

                {/* Action */}
                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-3">
                    {row.status === 'Unverified' && (
                      <button
                        type="button"
                        onClick={(e) => handleVerify(e, row.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B8A5] hover:text-[#123B78] hover:underline"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPaymentRecordId(row.id);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1265A8] hover:text-[#123B78] hover:underline"
                    >
                      <IndianRupee className="w-3.5 h-3.5" />
                      <span>Log receipt</span>
                    </button>

                    {row.paymentProof === PAYMENT_PROOF_LOGGED && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          bankMatchPayment(row.id);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B8A5] hover:text-[#123B78] hover:underline"
                      >
                        <Landmark className="w-3.5 h-3.5" />
                        <span>Bank-match (AA)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTriggerComingSoon();
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#1265A8] hover:text-[#123B78] hover:underline"
                    >
                      <span>Details</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526174]">
        <span>Showing {filteredActivities.length} mock ledger entries</span>
        <span>Prototype — verification &amp; bank matching simulated</span>
        <button
          onClick={() => openReadinessReport(customer, records, scoreSettings)}
          className="text-xs font-semibold text-[#1265A8] hover:text-[#123B78] mt-2 sm:mt-0"
        >
          Download report →
        </button>
      </div>

      {/* Simulated payment capture — no bank or Account Aggregator call is made */}
      <RecordPaymentModal
        isOpen={Boolean(paymentRecord)}
        record={paymentRecord}
        onClose={() => setPaymentRecordId(null)}
        onSubmit={(payment) => {
          recordPayment(paymentRecord.id, payment);
          setPaymentRecordId(null);
        }}
      />
    </div>
  );
}
