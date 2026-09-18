import React from 'react';
import { IndianRupee, TrendingUp, Clock, FileCheck2, ShoppingBag } from 'lucide-react';

export default function BusinessSnapshot() {
  const stats = [
    {
      id: 'sales',
      label: 'Total Sales',
      value: '₹12.4L',
      subtext: '32 customer orders logged',
      icon: TrendingUp,
      color: 'text-[#123B78]',
      badge: '+14% this month',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    },
    {
      id: 'receivables',
      label: 'Receivables',
      value: '₹2.8L',
      subtext: '8 invoices pending collection',
      icon: Clock,
      color: 'text-[#1265A8]',
      badge: 'Avg. 18 days cycle',
      badgeColor: 'bg-blue-50 text-[#1265A8]',
    },
    {
      id: 'purchases',
      label: 'Purchases',
      value: '₹7.1L',
      subtext: '16 supplier GRNs logged',
      icon: ShoppingBag,
      color: 'text-[#10B8A5]',
      badge: 'Balanced cash outflow',
      badgeColor: 'bg-[#E8F7F3] text-[#123B78]',
    },
    {
      id: 'invoices',
      label: 'Invoices',
      value: '48',
      subtext: '100% digitally recorded',
      icon: FileCheck2,
      color: 'text-[#123B78]',
      badge: 'Zero omissions',
      badgeColor: 'bg-slate-100 text-[#526174]',
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-5 border-b border-slate-100 mb-6">
        <div>
          <h3 className="text-xl font-bold text-[#172033] tracking-tight">
            Business Snapshot
          </h3>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            Key operational indicators automatically compiled from registered invoices & GRNs.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-semibold text-[#526174] self-start sm:self-auto">
          <span>PROTOTYPE / DEMO VALUES</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-[#F6F9FB] border border-slate-200/70 hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#526174]">
                  {item.label}
                </span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>

              <div className="mt-2.5 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-bold text-[#172033] tracking-tight">
                  {item.value}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-[#526174] truncate">
                  {item.subtext}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
