import React, { useRef, useState } from 'react';
import { ArrowLeft, Building2, Globe2, Lock, RotateCcw } from 'lucide-react';
import CreditworthinessCard from './CreditworthinessCard';
import RecentActivityTable from './RecentActivityTable';
import AuditLogPage from './AuditLogPage';
import { customers, itemsByVendor, scoreModel } from '../data/database.js';
import { useSession } from '../context/SessionContext.jsx';
import { useAppState } from '../context/AppStateContext.jsx';
import { PARAMETERS, scoreTenant } from '../data/score.js';

const BAND_STYLES = {
  Strong: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Improving: 'bg-blue-50 text-[#1265A8] border-blue-200',
  'Needs Attention': 'bg-amber-50 text-amber-800 border-amber-200',
};

const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatPct(value) {
  return value === null || value === undefined ? '—' : `${value}%`;
}

/** Parameter-by-parameter view of how a tenant's weighted score was reached. */
function ScoreBreakdown({ title, subtitle, score }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#172033] tracking-tight">{title}</h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-[#526174] px-2 py-0.5 rounded">
              Backend model
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">{subtitle}</p>
        </div>

        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border self-start sm:self-auto ${
            BAND_STYLES[score.band]
          }`}
        >
          {score.band}
        </span>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              <th className="py-3 px-3">Parameter</th>
              <th className="py-3 px-3">Value</th>
              <th className="py-3 px-3 text-right">Weight</th>
              <th className="py-3 px-3 text-right">Sub-score (0–100)</th>
              <th className="py-3 px-3 text-right">Contribution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {score.rows.map((row) => (
              <tr key={row.key} className="hover:bg-[#F6F9FB]/80 transition-colors">
                <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">{row.label}</td>
                <td className="py-3.5 px-3 text-xs md:text-sm text-[#526174]">{row.value}</td>
                <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#526174]">
                  {Math.round(row.weight * 100)}%
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                  {row.subScore.toFixed(1)}
                </td>
                <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                  {row.contribution.toFixed(1)}
                </td>
              </tr>
            ))}
            <tr className="border-t border-slate-200">
              <td className="py-3.5 px-3 font-bold text-[#172033] text-xs md:text-sm" colSpan={4}>
                Weighted Score
              </td>
              <td className="py-3.5 px-3 text-right font-mono font-bold text-[#123B78] text-xs md:text-sm">
                {score.weighted.toFixed(1)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function BackendPage({ onTriggerComingSoon }) {
  const { selectedCustomerId, selectCustomer, session } = useSession();
  const { allRecords, resetDemoData, mastersFor, scoreSettings, setScoreSetting, resetScoreSettings } =
    useAppState();
  const [mode, setMode] = useState('customer');
  const [query, setQuery] = useState('');
  const { weights, thresholds } = scoreSettings;

  // What a field held when it gained focus, so one settled edit writes one audit entry.
  const editStart = useRef({});

  // Captured the first time a field moves, whether or not a focus event reached us.
  const beginEdit = (kind, key) => {
    const slot = `${kind}.${key}`;
    if (editStart.current[slot] === undefined) editStart.current[slot] = scoreSettings[kind][key];
  };

  const changeSetting = (kind, key, value) => {
    beginEdit(kind, key);
    setScoreSetting(kind, key, value, { audit: false });
  };

  const commitEdit = (kind, key, value) => {
    const from = editStart.current[`${kind}.${key}`];
    setScoreSetting(kind, key, value, { from });
    delete editStart.current[`${kind}.${key}`];
  };

  const weightTotalPct = Math.round(
    PARAMETERS.reduce((total, parameter) => total + (Number(weights[parameter.key]) || 0), 0) * 100
  );

  const recordsFor = (vendorId) => allRecords.filter((record) => record.vendorId === vendorId);
  const scoreFor = (vendorId) =>
    scoreTenant(recordsFor(vendorId), weights, thresholds, scoreModel.volumeTargetLakh);

  const selectedScore = selectedCustomerId ? scoreFor(selectedCustomerId) : null;

  const tenantMasters = mastersFor(selectedCustomerId);
  const suppliers = tenantMasters.suppliers;
  const buyers = tenantMasters.buyers;
  const items = itemsByVendor[selectedCustomerId] || [];

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
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={resetDemoData}
            title="Restore the seeded demo ledger for all three plants"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-[#1265A8]" />
            <span>Reset demo data</span>
          </button>

        <div className="flex items-center gap-1.5 p-1 bg-[#F6F9FB] rounded-xl border border-slate-200/70">
          {[
            { id: 'customer', label: 'Select a customer' },
            { id: 'global', label: 'Global data' },
            { id: 'audit', label: 'Audit log' },
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

              <section aria-label="Customer Score Breakdown">
                <ScoreBreakdown
                  title="Score Breakdown"
                  subtitle={`Computed live from this plant's ${selectedScore.measured.recordCount} records and the current weights. Backend view only — the MSME app never shows this number.`}
                  score={selectedScore}
                />
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
        <>
          <section aria-label="Score Model Settings">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-[#172033] tracking-tight">Score Model</h3>
                  <p className="text-xs md:text-sm text-[#526174] mt-0.5">
                    Edit a weight or threshold and every plant re-scores immediately — readiness cards,
                    breakdowns, reports and loan options all follow. Each change is written to the audit log.
                  </p>
                </div>

                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border self-start sm:self-auto ${
                    weightTotalPct === 100
                      ? 'bg-[#E8F7F3] text-[#123B78] border-[#10B8A5]/30'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {weightTotalPct === 100
                    ? 'Weights total 100%'
                    : `Weights must total 100% — currently ${weightTotalPct}%`}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PARAMETERS.map((parameter) => (
                  <div
                    key={parameter.key}
                    className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70"
                  >
                    <label className="block text-xs font-semibold text-[#526174] mb-2">
                      {parameter.label}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={Math.round(weights[parameter.key] * 100)}
                      onFocus={() => beginEdit('weights', parameter.key)}
                      onChange={(e) =>
                        changeSetting('weights', parameter.key, (Number(e.target.value) || 0) / 100)
                      }
                      onBlur={(e) =>
                        commitEdit('weights', parameter.key, (Number(e.target.value) || 0) / 100)
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#172033] text-sm font-mono"
                    />
                    <p className="text-[10px] text-[#526174] mt-1.5">Weight %</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70">
                  <label className="block text-xs font-semibold text-[#526174] mb-2">
                    Strong threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={thresholds.strong}
                    onFocus={() => beginEdit('thresholds', 'strong')}
                    onChange={(e) => changeSetting('thresholds', 'strong', Number(e.target.value) || 0)}
                    onBlur={(e) => commitEdit('thresholds', 'strong', Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#172033] text-sm font-mono"
                  />
                  <p className="text-[10px] text-[#526174] mt-1.5">Score at or above = Strong</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70">
                  <label className="block text-xs font-semibold text-[#526174] mb-2">
                    Improving threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={thresholds.improving}
                    onFocus={() => beginEdit('thresholds', 'improving')}
                    onChange={(e) => changeSetting('thresholds', 'improving', Number(e.target.value) || 0)}
                    onBlur={(e) => commitEdit('thresholds', 'improving', Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#172033] text-sm font-mono"
                  />
                  <p className="text-[10px] text-[#526174] mt-1.5">Score at or above = Improving</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70">
                  <label className="block text-xs font-semibold text-[#526174] mb-2">
                    Volume target
                  </label>
                  <p className="text-base font-bold text-[#123B78] mt-1">
                    ₹{scoreModel.volumeTargetLakh}L / month
                  </p>
                  <p className="text-[10px] text-[#526174] mt-1.5">Full marks on trade volume</p>
                </div>

                <div className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70">
                  <label className="block text-xs font-semibold text-[#526174] mb-2">Reset</label>
                  <button
                    type="button"
                    onClick={resetScoreSettings}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-[#526174] hover:bg-slate-50 text-xs font-semibold transition-colors"
                  >
                    Restore JSON defaults
                  </button>
                </div>
              </div>
            </div>
          </section>

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
                    Computed live from each plant's recorded trade. Backend view only — the MSME app
                    never shows this number.
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
                      <th className="py-3 px-3 text-right">Records</th>
                      <th className="py-3 px-3 text-right">On-time</th>
                      <th className="py-3 px-3 text-right">Verified</th>
                      <th className="py-3 px-3 text-right">Volume (₹L)</th>
                      <th className="py-3 px-3 text-right">Concentration</th>
                      <th className="py-3 px-3 text-right">Weighted Score</th>
                      <th className="py-3 px-3 text-center">Band</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {customers.map((customer) => {
                      const score = scoreFor(customer.vendorId);
                      const measured = score.measured;
                      return (
                        <tr key={customer.vendorId} className="hover:bg-[#F6F9FB]/80 transition-colors">
                          <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                            {customer.name}
                          </td>
                          <td className="py-3.5 px-3 font-mono text-xs md:text-sm text-[#526174]">
                            {customer.vendorId}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#526174]">
                            {measured.recordCount}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                            {measured.onTimePct === null ? '—' : `${Math.round(measured.onTimePct)}%`}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                            {measured.verifiedPct === null ? '—' : `${Math.round(measured.verifiedPct)}%`}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                            {measured.tradeVolumeLakh.toFixed(1)}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono text-xs md:text-sm text-[#172033]">
                            {measured.concentrationPct === null
                              ? '—'
                              : `${Math.round(measured.concentrationPct)}%`}
                          </td>
                          <td className="py-3.5 px-3 text-right font-mono font-bold text-[#123B78] text-xs md:text-sm">
                            {score.weighted.toFixed(1)}
                          </td>
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                BAND_STYLES[score.band]
                              }`}
                            >
                              {score.band}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526174]">
                <span>Showing {customers.length} customers</span>
                <span className="mt-2 sm:mt-0">
                  Strong ≥ {thresholds.strong} · Improving ≥ {thresholds.improving}
                </span>
              </div>
            </div>
          </section>

          {customers.map((customer) => (
            <section key={customer.vendorId} aria-label={`Score Breakdown ${customer.vendorId}`}>
              <ScoreBreakdown
                title={`${customer.name} — Score Breakdown`}
                subtitle={`${customer.vendorId} · computed live from its recorded trade and the current weights.`}
                score={scoreFor(customer.vendorId)}
              />
            </section>
          ))}
        </>
      )}

      {mode === 'audit' && <AuditLogPage />}
    </div>
  );
}
