import React, { useState } from 'react';
import { FileText, PackageCheck, ArrowUpRight, ArrowDownLeft, Filter, ExternalLink } from 'lucide-react';

export default function RecentActivityTable({ onTriggerComingSoon }) {
  const [filter, setFilter] = useState('ALL');

  const activities = [
    {
      id: 'TXN-9021',
      date: '18 Sep 2026',
      type: 'Invoice',
      party: 'ABC Traders',
      amount: '₹2,40,000',
      status: 'Paid',
      statusStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      direction: 'credit',
    },
    {
      id: 'TXN-9020',
      date: '17 Sep 2026',
      type: 'GRN',
      party: 'XYZ Suppliers',
      amount: '₹1,80,000',
      status: 'Received',
      statusStyle: 'bg-blue-50 text-[#1265A8] border-blue-200',
      direction: 'debit',
    },
    {
      id: 'TXN-9019',
      date: '16 Sep 2026',
      type: 'Invoice',
      party: 'Kumar Retail',
      amount: '₹95,000',
      status: 'Pending',
      statusStyle: 'bg-amber-50 text-amber-700 border-amber-200',
      direction: 'credit',
    },
    {
      id: 'TXN-9018',
      date: '15 Sep 2026',
      type: 'Invoice',
      party: 'Sharma Textiles',
      amount: '₹3,10,000',
      status: 'Paid',
      statusStyle: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      direction: 'credit',
    },
    {
      id: 'TXN-9017',
      date: '14 Sep 2026',
      type: 'GRN',
      party: 'Bharat Steel Mills',
      amount: '₹4,25,000',
      status: 'Received',
      statusStyle: 'bg-blue-50 text-[#1265A8] border-blue-200',
      direction: 'debit',
    },
    {
      id: 'TXN-9016',
      date: '12 Sep 2026',
      type: 'Invoice',
      party: 'Gupta & Sons Ltd',
      amount: '₹1,50,000',
      status: 'Pending',
      statusStyle: 'bg-amber-50 text-amber-700 border-amber-200',
      direction: 'credit',
    },
  ];

  const filteredActivities = activities.filter((act) => {
    if (filter === 'INVOICE') return act.type === 'Invoice';
    if (filter === 'GRN') return act.type === 'GRN';
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
                  {row.date}
                </td>

                {/* Type */}
                <td className="py-3.5 px-3 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${
                      row.type === 'Invoice'
                        ? 'bg-[#E8F7F3] text-[#123B78]'
                        : 'bg-blue-50 text-[#1265A8]'
                    }`}
                  >
                    {row.type === 'Invoice' ? (
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
                  {row.amount}
                </td>

                {/* Status */}
                <td className="py-3.5 px-3 text-center whitespace-nowrap">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${row.statusStyle}`}
                  >
                    {row.status}
                  </span>
                </td>

                {/* Action */}
                <td className="py-3.5 px-3 text-right whitespace-nowrap">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526174]">
        <span>Showing {filteredActivities.length} mock ledger entries</span>
        <button
          onClick={onTriggerComingSoon}
          className="text-xs font-semibold text-[#1265A8] hover:text-[#123B78] mt-2 sm:mt-0"
        >
          Export Ledger (Coming Soon) →
        </button>
      </div>
    </div>
  );
}
