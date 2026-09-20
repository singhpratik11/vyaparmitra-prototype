import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Info } from 'lucide-react';
import Logo from './Logo';
import { todayIsoDate } from '../context/AppStateContext.jsx';

export default function RecordPaymentModal({ isOpen, record, onClose, onSubmit }) {
  const [amountPaid, setAmountPaid] = useState('');
  const [paidDate, setPaidDate] = useState('');
  const [receiptFileName, setReceiptFileName] = useState(null);

  // Reopening for another row starts from that row's own figures.
  useEffect(() => {
    if (!isOpen || !record) return;
    setAmountPaid(String(record.amountPaid || record.amount || ''));
    setPaidDate(record.paidDate || todayIsoDate());
    setReceiptFileName(record.receiptFileName || null);
  }, [isOpen, record]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !record) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#172033]/50 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="bg-white rounded-2xl border border-slate-200/90 w-full max-w-lg p-6 md:p-8 shadow-modal relative transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[#526174] hover:bg-slate-100 hover:text-[#172033] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-2">
          <div className="flex justify-center mb-5">
            <Logo size="small" />
          </div>

          <span className="text-[11px] font-bold uppercase tracking-widest text-[#10B8A5] px-3 py-1 bg-[#E8F7F3] rounded-full inline-block mb-3">
            {record.paymentDirection === 'Payable' ? 'Payment to supplier' : 'Payment from buyer'}
          </span>

          <h3 className="text-2xl font-bold text-[#123B78] tracking-tight">
            RECORD PAYMENT
          </h3>

          <p className="text-xs md:text-sm text-[#526174] mt-2">
            {record.party} · {record.type} · {record.id}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ amountPaid, paidDate, receiptFileName });
          }}
          className="mt-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Amount Received <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Paid On <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
              Receipt — reference only, not used for verification
            </label>

            <input
              type="file"
              onChange={(e) => setReceiptFileName(e.target.files?.[0]?.name || null)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
            />

            {receiptFileName && (
              <p className="mt-1.5 text-[11px] font-mono text-[#526174] truncate">{receiptFileName}</p>
            )}

            <div className="mt-3 p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 text-left flex items-start gap-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#1265A8]" />
              <p className="text-xs text-[#526174] leading-relaxed">
                Prototype — bank verification simulated. Logging a receipt clears the reminder but stays
                unverified, and an attached file never changes that. Only a bank match counts toward your
                on-time record.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs md:text-sm text-[#526174] hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#123B78] hover:bg-[#1265A8] text-white font-bold text-sm shadow-xs transition-colors"
            >
              <span>Log receipt</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
