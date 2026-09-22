import React, { useState } from 'react';
import { ArrowLeft, Building2, Globe2, Lock } from 'lucide-react';
import CreditworthinessCard from './CreditworthinessCard';
import RecentActivityTable from './RecentActivityTable';
import { customers, suppliersByVendor, itemsByVendor, buyersByVendor, masterScore } from '../data/database.js';
import { useSession } from '../context/SessionContext.jsx';

const BAND_STYLES = {
  Strong: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Improving: 'bg-blue-50 text-[#1265A8] border-blue-200',
  'Needs Attention': 'bg-amber-50 text-amber-800 border-amber-200',
};

const RETENTION_MONTHS = ['Month 0', 'Month 1', 'Month 2', 'Month 3'];

/**
 * SEEDED, NOT COMPUTED. A cohort is the month an MSME first recorded a VERIFIED
 * transaction (activation, never sign-up), and a cohort member counts as active in
 * month N if it recorded at least one verified transaction that month. The database
 * carries no per-month transaction history, so these figures are simulated: each row
 * is anchored on a real tenant, activating after its serviceStartDate, and `n` counts
 * simulated peers alongside it because a cohort of one can only ever read 0% or 100%.
 * A null cell means that month has not elapsed for that cohort yet.
 */
const COHORTS = [
  {
    activationMonth: 'Apr 2026',
    vendorId: 'VM-0001',
    anchor: 'Ramesh Auto Components',
    size: 4,
    retention: [100, 50, 50, 25],
  },
  {
    activationMonth: 'May 2026',
    vendorId: 'VM-0003',
    anchor: 'Deccan Pipes & Fittings',
    size: 3,
    retention: [100, 67, 33, 33],
  },
  {
    activationMonth: 'Jun 2026',
    vendorId: 'VM-0002',
    anchor: 'Shakti Textiles',
    size: 3,
    retention: [100, 100, 67, null],
  },
];

/** True when this cohort's Month 1 beats every cohort that activated before it. */
function isMonthOneImprovement(index) {
  const value = COHORTS[index].retention[1];
  if (value === null || index === 0) return false;
  return COHORTS.slice(0, index).every((earlier) => {
    const previous = earlier.retention[1];
    return previous === null || value > previous;
  });
}

const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatPct(value) {
  return value === null || value === undefined ? '—' : `${value}%`;
}

export default function BackendPage({ onTriggerComingSoon }) {
  const { selectedCustomerId, selectCustomer, session } = useSession();
  const [mode, setMode] = useState('customer');
  const [query, setQuery] = useState('');

  const suppliers = suppliersByVendor[selectedCustomerId] || [];
  const items = itemsByVendor[selectedCustomerId] || [];
  const buyers = buyersByVendor[selectedCustomerId] || [];

  const selectedCustomer = customers.find((item) => item.vendorId === selectedCustomerId) || null;
  const isDrilledIn = mode === 'customer' && Boolean(selectedCustomer);

  // Matches on name, vendor id or GSTIN, so it scales past a handful of plants.
  const needle = query.trim().toLowerCase();
  const visibleCustomers = needle
    ? customers.filter((customer) =>
        [customer.name, customer.vendorId, customer.gstin].some((field) =>
          String(field || '').toLowerCase().includes(needle)
        )
      )
    : customers;

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isDrilledIn && (
              <>
                <button
                  onClick={() => selectCustomer(null)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526174] hover:text-[#123B78]"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Plants</span>
                </button>
                <span className="text-slate-300">•</span>
              </>
            )}
            <span className="text-xs font-semibold text-[#1265A8]">Backend Console</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
            {isDrilledIn ? selectedCustomer.name : 'All Plants'}
          </h1>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            {isDrilledIn
              ? `${selectedCustomer.vendorId} · GSTIN ${selectedCustomer.gstin} · ${selectedCustomer.plan} plan`
              : `Signed in as ${session?.name} · global access across every customer on the platform.`}
          </p>
        </div>

        {/* Mode choice */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F6F9FB] rounded-xl border border-slate-200/70 self-start sm:self-auto">
          {[
            { id: 'customer', label: 'Select a customer' },
            { id: 'global', label: 'Global data' },
            { id: 'retention', label: 'Retention' },
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

      {mode === 'customer' && !isDrilledIn && (
        <>
          {/* Customer picker */}
          <section aria-label="Customer Picker">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
              <div className="pb-5 border-b border-slate-100 mb-6">
                <h3 className="text-xl font-bold text-[#172033] tracking-tight">Customers</h3>
                <p className="text-xs md:text-sm text-[#526174] mt-0.5">
                  Pick a plant to see its suppliers, items, buyers, ledger and readiness.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-[#172033] uppercase tracking-wider mb-2">
                  Find a customer
                </label>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, vendor ID or GSTIN"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
                />
                <p className="text-[11px] text-[#526174] mt-1.5">
                  Showing {visibleCustomers.length} of {customers.length} customers
                </p>
              </div>

              {customers.length === 0 && (
                <p className="text-sm text-[#526174]">
                  No customers loaded — the tenants list in the database is empty.
                </p>
              )}

              {customers.length > 0 && visibleCustomers.length === 0 && (
                <p className="text-sm text-[#526174]">
                  No customers match “{query}”.
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleCustomers.map((customer) => (
                  <button
                    key={customer.vendorId}
                    type="button"
                    onClick={() => selectCustomer(customer.vendorId)}
                    className="p-4 rounded-xl border text-left transition-colors bg-[#F6F9FB] border-slate-200/70 hover:border-slate-300"
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
        </>
      )}

      {isDrilledIn && (
        <>
              <section aria-label="Customer Readiness">
                <CreditworthinessCard />
              </section>

              <section aria-label="Customer Masters">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
                  <div className="pb-5 border-b border-slate-100">
                    <h3 className="text-xl font-bold text-[#172033] tracking-tight">Masters</h3>
                    <p className="text-xs md:text-sm text-[#526174] mt-0.5">
                      Suppliers, buyers and items on record for this plant.
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
                      Buyers
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
                            <th className="py-3 px-3">Buyer</th>
                            <th className="py-3 px-3">GSTIN</th>
                            <th className="py-3 px-3">City</th>
                            <th className="py-3 px-3 text-right">Terms (Days)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {buyers.map((buyer) => (
                            <tr key={buyer.buyerId}>
                              <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                                {buyer.name}
                              </td>
                              <td className="py-3.5 px-3 font-mono text-xs md:text-sm text-[#526174]">
                                {buyer.gstin}
                              </td>
                              <td className="py-3.5 px-3 text-xs md:text-sm text-[#526174]">
                                {buyer.city}
                              </td>
                              <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                                {buyer.paymentTermsDays}
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

      {mode === 'retention' && (
        <section aria-label="Cohort Retention">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-[#172033] tracking-tight">
                    Cohort Retention
                  </h3>
                  <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-[#526174] px-2 py-0.5 rounded">
                    Backend model
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[#526174] mt-0.5">
                  A cohort is the month an MSME first recorded a <strong>verified</strong> transaction —
                  activation, not sign-up. Active in month N means at least one verified transaction that month.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold self-start sm:self-auto">
                <Lock className="w-3.5 h-3.5" />
                <span>Simulated — directional only, not live retention (small n)</span>
              </span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
                    <th className="py-3 px-3">Activation Month</th>
                    <th className="py-3 px-3">Anchor Tenant</th>
                    <th className="py-3 px-3 text-right">Cohort (n)</th>
                    {RETENTION_MONTHS.map((month) => (
                      <th key={month} className="py-3 px-3 text-right">
                        {month}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {COHORTS.map((cohort, index) => (
                    <tr key={cohort.activationMonth} className="hover:bg-[#F6F9FB]/80 transition-colors">
                      <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm whitespace-nowrap">
                        {cohort.activationMonth}
                      </td>
                      <td className="py-3.5 px-3 text-xs md:text-sm text-[#526174]">
                        {cohort.anchor}{' '}
                        <span className="font-mono text-[#526174]">({cohort.vendorId})</span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                        {cohort.size}
                      </td>
                      {cohort.retention.map((value, monthIndex) => {
                        const highlight = monthIndex === 1 && isMonthOneImprovement(index);
                        return (
                          <td
                            key={RETENTION_MONTHS[monthIndex]}
                            className="py-3.5 px-3 text-right whitespace-nowrap"
                          >
                            {value === null ? (
                              <span className="font-mono text-xs md:text-sm text-[#526174]">—</span>
                            ) : (
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full font-mono text-xs md:text-sm ${
                                  highlight
                                    ? 'bg-[#E8F7F3] text-[#123B78] font-bold'
                                    : 'text-[#172033]'
                                }`}
                              >
                                {value}%
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526174]">
              <span>
                Mint Month 1 = that cohort held on better than every cohort before it — read down the column.
              </span>
              <span className="mt-2 sm:mt-0">— = month not elapsed for that cohort yet</span>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
