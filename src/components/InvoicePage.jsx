import React, { useState } from 'react';
import { ArrowLeft, FilePlus2, Sparkles, AlertCircle, Info, Lock, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext.jsx';

export default function InvoicePage({ onBackToDashboard, onTriggerComingSoon }) {
  const { addRecord } = useAppState();

  const [buyer, setBuyer] = useState('Sharma Enterprises Pvt Ltd');
  const [invoiceDate, setInvoiceDate] = useState('2026-09-18');
  const [paymentTermsDays, setPaymentTermsDays] = useState('30');
  const [quantity, setQuantity] = useState('250');
  const [rate, setRate] = useState('960');
  const [savedMessage, setSavedMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const record = addRecord({
      type: 'Sale',
      party: buyer,
      amount: Number(quantity) * Number(rate),
      date: invoiceDate,
      paymentTermsDays: Number(paymentTermsDays),
      status: 'Unverified',
    });

    setSavedMessage(`Sale recorded — ${record.id}`);
    setBuyer('');
    setInvoiceDate('');
    setPaymentTermsDays('');
    setQuantity('');
    setRate('');
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
              <FilePlus2 className="w-4 h-4 text-[#10B8A5]" />
              <span>Sale & Billing Entry</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
              Create Invoice
            </h2>
            <p className="text-sm md:text-base text-[#526174] mt-1">
              Record your sale once. Your business record updates automatically.
            </p>
          </div>
        </div>

        {/* Coming Soon Notice Banner */}
        <div className="mt-5 p-4 rounded-xl bg-[#E8F7F3] border border-[#10B8A5]/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-[#10B8A5] flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-[#123B78] uppercase tracking-wide">
              COMING SOON — Single-Entry Financial Ledger
            </h4>
            <p className="text-xs text-[#526174] mt-0.5 leading-relaxed">
              In the upcoming release, this single invoice entry will simultaneously dispatch an e-bill, log counterparty receivables, and strengthen your business credit profile.
            </p>
          </div>
        </div>

        {/* Visual Invoice Form Layout (Disabled/Demonstration) */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={buyer}
                onChange={(e) => setBuyer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm font-medium"
              />
            </div>

            {/* Customer GSTIN */}
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Customer GSTIN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled
                defaultValue="27AAACS8931F1ZM"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm cursor-not-allowed font-mono"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
              />
            </div>

            {/* Payment Terms */}
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
          </div>

          {/* Line Item Section */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#526174] mb-4">
              Item Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Product / Service */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Product / Service Description
                </label>
                <input
                  type="text"
                  disabled
                  defaultValue="Precision Machined Component #MC-402"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm cursor-not-allowed"
                />
              </div>

              {/* Quantity */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Quantity
                </label>
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
                />
              </div>

              {/* Rate */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  Rate (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm font-mono"
                />
              </div>

              {/* GST */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-[#172033] mb-1.5">
                  GST Rate
                </label>
                <input
                  type="text"
                  disabled
                  defaultValue="18% (9% CGST + 9% SGST)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Computed Summary Box */}
          <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1 text-xs text-[#526174]">
              <div>Subtotal: <span className="font-semibold text-[#172033]">₹2,40,000.00</span></div>
              <div>Estimated GST (18%): <span className="font-semibold text-[#172033]">₹43,200.00</span></div>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#526174]">Total Payable Amount</span>
              <div className="text-2xl font-bold text-[#123B78]">
                ₹2,83,200.00
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
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#123B78] hover:bg-[#1265A8] text-white font-bold text-sm shadow-xs transition-colors"
            >
              Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
