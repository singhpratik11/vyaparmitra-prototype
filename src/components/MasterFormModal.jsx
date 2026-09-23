import React, { useEffect, useState } from 'react';
import { X, ArrowRight, Info } from 'lucide-react';
import Logo from './Logo';

const BLANK = { name: '', gstin: '', detail: '', paymentTermsDays: '30' };

/**
 * Add or edit one supplier or buyer. Same fields the seeded masters carry: the third
 * one is a category for suppliers and a city for buyers.
 */
export default function MasterFormModal({ isOpen, kind, entry, onClose, onSubmit }) {
  const [form, setForm] = useState(BLANK);

  const isSupplier = kind === 'suppliers';
  const detailLabel = isSupplier ? 'Category' : 'City';
  const detailKey = isSupplier ? 'category' : 'city';
  const noun = isSupplier ? 'supplier' : 'buyer';

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      entry
        ? {
            name: entry.name || '',
            gstin: entry.gstin || '',
            detail: entry[detailKey] || '',
            paymentTermsDays: String(entry.paymentTermsDays ?? ''),
          }
        : BLANK
    );
  }, [isOpen, entry, detailKey]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

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
            {isSupplier ? 'Supplier master' : 'Buyer master'}
          </span>

          <h3 className="text-2xl font-bold text-[#123B78] tracking-tight">
            {entry ? `EDIT ${noun.toUpperCase()}` : `ADD ${noun.toUpperCase()}`}
          </h3>

          <p className="text-xs md:text-sm text-[#526174] mt-2">
            {entry ? entry.name : `A new ${noun} appears in your pickers straight away.`}
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              name: form.name.trim(),
              gstin: form.gstin.trim().toUpperCase(),
              [detailKey]: form.detail.trim(),
              paymentTermsDays: Number(form.paymentTermsDays) || 0,
            });
          }}
          className="mt-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                {isSupplier ? 'Supplier Name' : 'Buyer Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                GSTIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.gstin}
                onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                {detailLabel}
              </label>
              <input
                type="text"
                value={form.detail}
                onChange={(e) => setForm({ ...form, detail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Payment Terms (Days)
              </label>
              <input
                type="number"
                min="0"
                value={form.paymentTermsDays}
                onChange={(e) => setForm({ ...form, paymentTermsDays: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F6F9FB] border border-slate-200/70 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-[#1265A8]" />
            <p className="text-xs text-[#526174] leading-relaxed">
              Saved against your plant only, and written to the audit log with your name. The seeded
              master list is never rewritten — your change sits on top of it.
            </p>
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
              <span>{entry ? 'Save changes' : `Add ${noun}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
