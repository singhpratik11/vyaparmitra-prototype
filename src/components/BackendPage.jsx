import React, { useState } from 'react';
import { Building2, Globe2, Lock } from 'lucide-react';
import CreditworthinessCard from './CreditworthinessCard';
import RecentActivityTable from './RecentActivityTable';
import { customers, suppliersByVendor, itemsByVendor, masterScore } from '../data/database.js';
import { useSession } from '../context/SessionContext.jsx';

const BAND_STYLES = {
  Strong: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Improving: 'bg-blue-50 text-[#1265A8] border-blue-200',
  'Needs Attention': 'bg-amber-50 text-amber-800 border-amber-200',
};

const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatPct(value) {
  return value === null || value === undefined ? '—' : `${value}%`;
}

export default function BackendPage({ onTriggerComingSoon }) {
  const { selectedCustomerId, selectCustomer, session } = useSession();
  const [mode, setMode] = useState('customer');

  const suppliers = suppliersByVendor[selectedCustomerId] || [];
  const items = itemsByVendor[selectedCustomerId] || [];

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-[#1265A8]">Backend Console</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
            All Plants
          </h1>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            Signed in as {session?.name} · global access across every customer on the platform.
          </p>
        </div>

        {/* Mode choice */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F6F9FB] rounded-xl border border-slate-200/70 self-start sm:self-auto">
          {[
            { id: 'customer', label: 'Select a customer' },
            { id: 'global', label: 'Global data' },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setMode(option.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === option.id
                  ? 'bg-white text-[#123B78] shadow-xs border border-slate-200/50'
                  : 'text-[#526174] hover:text-[#172033]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'customer' && (
        <>
          {/* Customer picker */}
          <section aria-label="Customer Picker">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
              <div className="pb-5 border-b border-slate-100 mb-6">
                <h3 className="text-xl font-bold text-[#172033] tracking-tight">Customers</h3>
                <p className="text-xs md:text-sm text-[#526174] mt-0.5">
                  Pick a plant to see its suppliers, items, ledger and readiness.
                </p>
              </div>

              {customers.length === 0 && (
                <p className="text-sm text-[#526174]">
                  No customers loaded — the tenants list in the database is empty.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customers.map((customer) => (
                  <button
                    key={customer.vendorId}
                    type="button"
                    onClick={() => selectCustomer(customer.vendorId)}
                    className={`p-4 rounded-xl border text-left transition-colors ${
                      selectedCustomerId === customer.vendorId
                        ? 'bg-[#E8F7F3] border-[#10B8A5]/30'
                        : 'bg-[#F6F9FB] border-slate-200/70 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#526174]">{customer.vendorId}</span>
                      <Building2 className="w-4 h-4 text-[#1265A8]" />
                    </div>
                    <p className="text-base font-bold text-[#172033] mt-1.5">{customer.name}</p>
                    <p className="text-[11px] font-mono text-[#526174] mt-0.5">GSTIN: {customer.gstin}</p>
                    <p className="text-[10px] text-[#526174] mt-1.5">{customer.plan} plan</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          {!selectedCustomerId ? (
            <p className="text-sm text-[#526174]">Select a customer above to load their data.</p>
          ) : (
            <>
              <section aria-label="Customer Readiness">
                <CreditworthinessCard />
              </section>

              <section aria-label="Customer Masters">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
                  <div className="pb-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-[#172033] tracking-tight">Masters</h3>
                    <p className="text-xs md:text-sm text-[#526174] mt-0.5">
                      Suppliers and items on record for this plant.
                    </p>
                  </div>

                  <div className="pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#526174] mb-4">
                      Suppliers
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
                            <th className="py-3 px-3">Supplier</th>
                            <th className="py-3 px-3">GSTIN</th>
                            <th className="py-3 px-3">Category</th>
                            <th className="py-3 px-3 text-right">Terms (Days)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {suppliers.map((supplier) => (
                            <tr key={supplier.supplierId}>
                              <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                                {supplier.name}
                              </td>
                              <td className="py-3.5 px-3 font-mono text-xs md:text-sm text-[#526174]">
                                {supplier.gstin}
                              </td>
                              <td className="py-3.5 px-3 text-xs md:text-sm text-[#526174]">
                                {supplier.category}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                                {supplier.paymentTermsDays}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#526174] mb-4">
                      Items
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
                            <th className="py-3 px-3">Item</th>
                            <th className="py-3 px-3">Unit</th>
                            <th className="py-3 px-3 text-right">Unit Price</th>
                            <th className="py-3 px-3">HSN</th>
                            <th className="py-3 px-3 text-right">GST</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((item) => (
                            <tr key={item.itemCode}>
                              <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                                {item.name}
                              </td>
                              <td className="py-3.5 px-3 text-xs md:text-sm text-[#526174]">{item.unit}</td>
                              <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                                ₹{amountFormatter.format(item.unitPrice)}
                              </td>
                              <td className="py-3.5 px-3 font-mono text-xs md:text-sm text-[#526174]">
                                {item.hsnCode}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                                {formatPct(item.gstPct)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </section>

              <section aria-label="Customer Ledger">
                <RecentActivityTable onTriggerComingSoon={onTriggerComingSoon} />
              </section>
            </>
          )}
        </>
      )}

      {mode === 'global' && (
        <section aria-label="Global Data">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#172033] tracking-tight">
                    Master Creditworthiness Score
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-[#526174] px-2 py-0.5 rounded">
                    Backend model
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[#526174] mt-0.5">
                  Weighted model across every customer. Backend view only — the MSME app never shows this number.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold self-start sm:self-auto">
                <Lock className="w-3.5 h-3.5" />
                <span>Read Only</span>
              </span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Vendor ID</th>
                    <th className="py-3 px-3 text-right">On-time</th>
                    <th className="py-3 px-3 text-right">Verified</th>
                    <th className="py-3 px-3 text-right">Volume (₹L)</th>
                    <th className="py-3 px-3 text-right">Concentration</th>
                    <th className="py-3 px-3 text-right">Weighted Score</th>
                    <th className="py-3 px-3 text-center">Band</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {masterScore.map((row) => {
                    const customer = customers.find((item) => item.vendorId === row.vendorId);
                    return (
                      <tr key={row.vendorId} className="hover:bg-[#F6F9FB]/80 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                          {customer ? customer.name : row.vendorId}
                        </td>
                        <td className="py-3.5 px-3 font-mono text-xs md:text-sm text-[#526174]">
                          {row.vendorId}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                          {formatPct(row.onTimePaymentPct)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                          {formatPct(row.verifiedTxnsPct)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                          {row.monthlyTradeVolumeLakh}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                          {formatPct(row.largestBuyerConcentrationPct)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono font-bold text-[#123B78] text-xs md:text-sm">
                          {row.weightedScore}
                        </td>
                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                              BAND_STYLES[row.readinessBand] || BAND_STYLES['Needs Attention']
                            }`}
                          >
                            {row.readinessBand}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526174]">
              <span>Showing {masterScore.length} customers</span>
              <span className="mt-2 sm:mt-0">Prototype — scores are seeded demo values</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
