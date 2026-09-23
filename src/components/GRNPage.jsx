import React, { useState } from 'react';
import { ArrowLeft, PackagePlus, Sparkles, Lock, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext.jsx';
import { useSession } from '../context/SessionContext.jsx';
import LineItemsTable, {
  blankLine,
  documentTotal,
  formatAmount,
  toStoredLines,
} from './LineItemsTable';

/** One prefilled row, so the form still opens with something in it. */
function openingLines(activeItems) {
  const first = activeItems[0];
  return [
    {
      ...blankLine(),
      itemCode: first?.itemCode || '',
      quantity: first ? '1500' : '',
      rate: first ? String(first.unitPrice) : '',
    },
  ];
}

export default function GRNPage({ onBackToDashboard, onTriggerComingSoon }) {
  const { addRecord, suppliers: activeSuppliers } = useAppState();
  const { items: activeItems } = useSession();

  const [supplierId, setSupplierId] = useState(activeSuppliers[0]?.supplierId || '');
  const [grnDate, setGrnDate] = useState('2026-09-18');
  const [lines, setLines] = useState(() => openingLines(activeItems));
  const [savedMessage, setSavedMessage] = useState('');

  const selectedSupplier = activeSuppliers.find((item) => item.supplierId === supplierId) || null;

  // A GRN has never carried GST in this prototype; the receipt value is the sum of its lines.
  const receiptTotal = documentTotal(lines);

  const handleSubmit = (e) => {
    e.preventDefault();

    const record = addRecord({
      type: 'Purchase',
      party: selectedSupplier ? selectedSupplier.name : '',
      amount: receiptTotal,
      date: grnDate,
      status: 'Unverified',
      lineItems: toStoredLines(lines, activeItems),
    });

    setSavedMessage(`Purchase recorded — ${record.id}`);
    setSupplierId('');
    setGrnDate('');
    setLines([blankLine()]);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Breadcrumb / Back button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#526174] hover:text-[#123B78] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Form Inactive (Prototype Preview)</span>
        </span>
      </div>

      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-8 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1265A8] mb-1">
              <PackagePlus className="w-4 h-4 text-[#10B8A5]" />
              <span>Goods Receipt Note Entry</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
              Create GRN
            </h2>
            <p className="text-sm md:text-base text-[#526174] mt-1">
              Record goods received from your supplier.
            </p>
          </div>
        </div>

        {/* Coming Soon Notice Banner */}
        <div className="mt-5 p-4 rounded-xl bg-teal-50/60 border border-[#10B8A5]/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#10B8A5] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#123B78] uppercase tracking-wide">
              COMING SOON — Inward Supply Reconciliation
            </h4>
            <p className="text-xs text-[#526174] mt-0.5 leading-relaxed">
              Recording goods receipts directly updates your inventory accounts, matches purchase bills, and documents supplier fulfillment reliability for institutional credibility.
            </p>
          </div>
        </div>

        {/* Visual GRN Form Layout (Disabled/Demonstration) */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Supplier Name */}
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm font-medium"
              >
                <option value="">Select supplier</option>
                {activeSuppliers.map((item) => (
                  <option key={item.supplierId} value={item.supplierId}>
                    {item.name} ({item.supplierId})
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier GSTIN */}
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Supplier GSTIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled
                readOnly
                value={selectedSupplier ? selectedSupplier.gstin : ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm cursor-not-allowed font-mono"
              />
            </div>

            {/* GRN Date */}
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                GRN Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={grnDate}
                onChange={(e) => setGrnDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
              />
            </div>

            {/* Reference (PO / Delivery Challan) */}
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Reference (PO / Challan No.)
              </label>
              <input
                type="text"
                disabled
                defaultValue="PO-2026-881 / Challan #DC-442"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm cursor-not-allowed"
              />
            </div>
          </div>

          {/* Product & Quantity Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#526174] mb-4">
              Material Receipt Details
            </h3>

            <LineItemsTable
              items={activeItems}
              lines={lines}
              onChange={setLines}
              addLabel="Add material"
            />
          </div>

          {/* Computed Summary Box */}
          <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 text-xs text-[#526174]">
              <div>
                {lines.length} {lines.length === 1 ? 'line item' : 'line items'} received
              </div>
              <div>Each line is quantity × rate, taken from your item master.</div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#526174]">Total Receipt Value</span>
              <div className="text-2xl font-bold text-[#123B78]">{formatAmount(receiptTotal)}</div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 font-semibold text-xs md:text-sm text-[#526174] hover:bg-slate-50"
            >
              Back to Dashboard
            </button>

            {savedMessage && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B8A5]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{savedMessage}</span>
              </span>
            )}

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#1265A8] hover:bg-[#123B78] text-white font-bold text-sm shadow-xs transition-colors"
            >
              Create GRN
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
