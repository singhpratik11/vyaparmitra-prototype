import React, { useState } from 'react';
import { ArrowLeft, Clock, IndianRupee } from 'lucide-react';
import RecordPaymentModal from './RecordPaymentModal';
import {
  useAppState,
  isPurchaseRecord,
  isUnpaid,
  getDueDate,
  getDueBucket,
  getDaysUntilDue,
} from '../context/AppStateContext.jsx';

const BUCKETS = ['Overdue', 'Due this week', 'Due next week'];

const BUCKET_STYLES = {
  Overdue: 'bg-amber-50 text-amber-800 border-amber-200',
  'Due this week': 'bg-blue-50 text-[#1265A8] border-blue-200',
  'Due next week': 'bg-slate-100 text-[#526174] border-slate-200',
};

// Which side of the ledger each role may work.
const ROLE_SIDES = {
  Owner: ['receivables', 'payables'],
  Finance: ['receivables', 'payables'],
  'Warehouse Clerk': ['payables'],
};

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

function formatTiming(record) {
  const days = getDaysUntilDue(record);
  if (days === null) return '—';
  if (days < 0) return `${Math.abs(days)} ${Math.abs(days) === 1 ? 'day' : 'days'} overdue`;
  if (days === 0) return 'due today';
  return `in ${days} ${days === 1 ? 'day' : 'days'}`;
}

function BucketTable({ bucket, rows, actionLabel, onAction }) {
  if (!rows.length) return null;

  return (
    <div className="pt-4 border-t border-slate-100">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#526174]">{bucket}</h3>
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${BUCKET_STYLES[bucket]}`}
        >
          {rows.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              <th className="py-3 px-3">Party</th>
              <th className="py-3 px-3 text-right">Amount</th>
              <th className="py-3 px-3">Due Date</th>
              <th className="py-3 px-3">Timing</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-[#F6F9FB]/80 transition-colors">
                <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                  {row.party}
                </td>

                <td className="py-3.5 px-3 text-right font-mono font-bold text-[#172033] text-xs md:text-sm whitespace-nowrap">
                  {formatAmount(row.amount)}
                </td>

                <td className="py-3.5 px-3 font-medium text-[#172033] whitespace-nowrap text-xs md:text-sm">
                  {formatDate(getDueDate(row))}
                </td>

                <td className="py-3.5 px-3 whitespace-nowrap text-xs md:text-sm text-[#526174]">
                  {formatTiming(row)}
                  {row.paymentStatus === 'Partially Paid' && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-[#1265A8]">
                      Part paid
                    </span>
                  )}
                </td>

                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onAction(row.id)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1265A8] hover:text-[#123B78] hover:underline"
                  >
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span>{actionLabel}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WorklistCard({ title, description, records, actionLabel, onAction }) {
  const buckets = BUCKETS.map((bucket) => ({
    bucket,
    rows: records.filter((record) => getDueBucket(record) === bucket),
  }));
  const total = buckets.reduce((sum, entry) => sum + entry.rows.length, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#172033] tracking-tight">{title}</h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-[#526174] px-2 py-0.5 rounded">
              {total} open
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">{description}</p>
        </div>
      </div>

      {total === 0 ? (
        <p className="mt-4 text-sm text-[#526174]">Nothing due in the next two weeks.</p>
      ) : (
        buckets.map((entry) => (
          <BucketTable
            key={entry.bucket}
            bucket={entry.bucket}
            rows={entry.rows}
            actionLabel={actionLabel}
            onAction={onAction}
          />
        ))
      )}
    </div>
  );
}

export default function WorklistPage({ role, onNavigate }) {
  const { records, recordPayment } = useAppState();
  const [paymentRecordId, setPaymentRecordId] = useState(null);

  const paymentRecord = records.find((record) => record.id === paymentRecordId) || null;
  const sides = ROLE_SIDES[role] || [];

  const openItems = records.filter((record) => isUnpaid(record) && getDueBucket(record));
  const receivables = openItems.filter((record) => record.type === 'Sale');
  const payables = openItems.filter((record) => isPurchaseRecord(record));

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526174] hover:text-[#123B78]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </button>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-semibold text-[#1265A8]">Payment Reminders</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
            Payment Worklist
          </h1>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            Unpaid records bucketed by due date. An item leaves a bucket only when you log the payment.
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold self-start sm:self-auto">
          <Clock className="w-3.5 h-3.5" />
          <span>Prototype — reminders simulated</span>
        </span>
      </div>

      {sides.includes('receivables') && (
        <section aria-label="Receivables Worklist">
          <WorklistCard
            title="Receivables"
            description="Unpaid sale invoices — money your buyers owe you."
            records={receivables}
            actionLabel="Log received"
            onAction={setPaymentRecordId}
          />
        </section>
      )}

      {sides.includes('payables') && (
        <section aria-label="Payables Worklist">
          <WorklistCard
            title="Payables"
            description="Unpaid supplier bills — money you owe, on the supplier's terms."
            records={payables}
            actionLabel="Mark settled"
            onAction={setPaymentRecordId}
          />
        </section>
      )}

      {/* Same simulated capture the ledger uses, so every payment still carries a source */}
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
