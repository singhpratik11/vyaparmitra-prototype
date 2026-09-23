import React, { useRef, useState } from 'react';
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

  // Direct = goods from the item master. Indirect = consumables, MRO and other spend that
  // was never catalogued, so it is typed in rather than picked.
  const [purchaseKind, setPurchaseKind] = useState('Direct');
  const [itemDescription, setItemDescription] = useState('');
  const [indirectAmount, setIndirectAmount] = useState('');
  const [paymentTermsDays, setPaymentTermsDays] = useState(
    String(activeSuppliers[0]?.paymentTermsDays ?? '')
  );

  const isIndirect = purchaseKind === 'Indirect';
  const selectedSupplier = activeSuppliers.find((item) => item.supplierId === supplierId) || null;

  /** Picking a supplier carries its agreed terms across, the way the invoice form does. */
  const handleSupplierChange = (nextSupplierId) => {
    setSupplierId(nextSupplierId);
    const nextSupplier = activeSuppliers.find((item) => item.supplierId === nextSupplierId);
    setPaymentTermsDays(nextSupplier ? String(nextSupplier.paymentTermsDays) : '');
  };

  // A GRN has never carried GST in this prototype; the receipt value is the sum of its lines.
  const receiptTotal = documentTotal(lines);

  // SIMULATED scanner — no camera, no barcode reader. It walks the tenant's own item master
  // in order so a demo repeats the same way twice, and only does fast line entry.
  const scanPosition = useRef(0);

  const handleScan = () => {
    if (!activeItems.length) return;
    const scanned = activeItems[scanPosition.current % activeItems.length];
    scanPosition.current += 1;
    setLines((current) => [
      ...current,
      { ...blankLine(), itemCode: scanned.itemCode, quantity: '1', rate: String(scanned.unitPrice) },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const record = isIndirect
      ? addRecord({
          type: 'Indirect',
          party: selectedSupplier ? selectedSupplier.name : '',
          amount: Number(indirectAmount) || 0,
          date: grnDate,
          paymentTermsDays: Number(paymentTermsDays),
          status: 'Unverified',
          itemDescription: itemDescription.trim(),
        })
      : addRecord({
          type: 'Purchase',
          party: selectedSupplier ? selectedSupplier.name : '',
          amount: receiptTotal,
          date: grnDate,
          status: 'Unverified',
          lineItems: toStoredLines(lines, activeItems),
        });

    setSavedMessage(
      `${isIndirect ? 'Indirect purchase' : 'Purchase'} recorded — ${record.id}`
    );
    setSupplierId('');
    setGrnDate('');
    setLines([blankLine()]);
    setItemDescription('');
    setIndirectAmount('');
    setPaymentTermsDays('');
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
          {/* Direct goods vs indirect spend — the rest of the form is the same either way. */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#526174]">
                Purchase Type
              </h3>
              <p className="text-xs text-[#526174] mt-0.5">
                {isIndirect
                  ? 'Consumables, MRO and other spend that is not a catalogued part.'
                  : 'Goods received against your item master.'}
              </p>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-[#F6F9FB] rounded-xl border border-slate-200/70 self-start sm:self-auto">
              {['Direct', 'Indirect'].map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setPurchaseKind(kind)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    purchaseKind === kind
                      ? 'bg-white text-[#123B78] shadow-xs border border-slate-200/50'
                      : 'text-[#526174] hover:text-[#172033]'
                  }`}
                >
                  {kind}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Supplier Name */}
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Supplier Name <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
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

            {/* Reference on a goods receipt; agreed terms on an indirect purchase */}
            {isIndirect ? (
              <div>
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                  Payment Terms
                </label>
                <input
                  type="number"
                  min="0"
                  value={paymentTermsDays}
                  onChange={(e) => setPaymentTermsDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
                />
              </div>
            ) : (
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
            )}
          </div>

          {/* Product & Quantity Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#526174] mb-4">
              {isIndirect ? 'Indirect Purchase Details' : 'Material Receipt Details'}
            </h3>

            {isIndirect ? (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-8">
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Item Description <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={itemDescription}
                    onChange={(e) => setItemDescription(e.target.value)}
                    placeholder="e.g. machine coolant, packaging tape"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
                  />
                </div>

                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                    Amount (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={indirectAmount}
                    onChange={(e) => setIndirectAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#123B78] font-bold text-sm font-mono"
                  />
                </div>
              </div>
            ) : (
              <LineItemsTable
                items={activeItems}
                lines={lines}
                onChange={setLines}
                addLabel="Add material"
                onScan={handleScan}
                scanLabel="Scan barcode"
              />
            )}
          </div>

          {/* Computed Summary Box */}
          <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 text-xs text-[#526174]">
              {isIndirect ? (
                <>
                  <div>Recorded as an indirect purchase — no catalogued item.</div>
                  <div>
                    It sits in payables and on the reminder worklist like any other purchase.
                  </div>
                </>
              ) : (
                <>
                  <div>
                    {lines.length} {lines.length === 1 ? 'line item' : 'line items'} received
                  </div>
                  <div>Each line is quantity × rate, taken from your item master.</div>
                </>
              )}
            </div>
            <div className="text-right">
              <span className="text-xs text-[#526174]">
                {isIndirect ? 'Total Purchase Value' : 'Total Receipt Value'}
              </span>
              <div className="text-2xl font-bold text-[#123B78]">
                {formatAmount(isIndirect ? Number(indirectAmount) || 0 : receiptTotal)}
              </div>
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
              {isIndirect ? 'Record Indirect Purchase' : 'Create GRN'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
