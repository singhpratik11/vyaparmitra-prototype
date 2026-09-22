import React from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { useAppState } from '../context/AppStateContext.jsx';
import { customers } from '../data/database.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatWhen(timestamp) {
  const when = new Date(timestamp);
  if (Number.isNaN(when.getTime())) return timestamp;
  const day = String(when.getDate()).padStart(2, '0');
  const time = `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}`;
  return `${day} ${MONTHS[when.getMonth()]} ${when.getFullYear()}, ${time}`;
}

function tenantName(vendorId) {
  const customer = customers.find((item) => item.vendorId === vendorId);
  return customer ? customer.name : vendorId || '—';
}

/**
 * Read-only history of who changed what. `vendorId` narrows it to one plant; leaving it
 * out shows every tenant, which only the backend console does.
 */
export default function AuditLogPage({ vendorId = null, onNavigate }) {
  const { auditLog } = useAppState();

  const entries = vendorId ? auditLog.filter((entry) => entry.vendorId === vendorId) : auditLog;
  const showTenant = !vendorId;

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
      {onNavigate && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                onClick={() => onNavigate('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526174] hover:text-[#123B78]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </button>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-[#1265A8]">Accountability</span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">Audit Log</h1>
            <p className="text-xs md:text-sm text-[#526174] mt-0.5">
              Every change to your records, and who made it.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-semibold self-start sm:self-auto">
            <Lock className="w-3.5 h-3.5" />
            <span>Read Only</span>
          </span>
        </div>
      )}

      <section aria-label="Audit Log">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#172033] tracking-tight">Activity Trail</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-[#526174] px-2 py-0.5 rounded">
                  Read Only
                </span>
              </div>
              <p className="text-xs md:text-sm text-[#526174] mt-0.5">
                {showTenant
                  ? 'Every attributed change across all plants on the platform.'
                  : 'Attributed to the signed-in user, not the role being viewed.'}
              </p>
            </div>
          </div>

          {entries.length === 0 ? (
            <p className="mt-4 text-sm text-[#526174]">No activity recorded yet.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
                    <th className="py-3 px-3">When</th>
                    {showTenant && <th className="py-3 px-3">Tenant</th>}
                    <th className="py-3 px-3">Who</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map((entry, index) => (
                    <tr
                      key={`${entry.timestamp}-${index}`}
                      className="hover:bg-[#F6F9FB]/80 transition-colors"
                    >
                      <td className="py-3.5 px-3 font-medium text-[#172033] whitespace-nowrap text-xs md:text-sm">
                        {formatWhen(entry.timestamp)}
                      </td>

                      {showTenant && (
                        <td className="py-3.5 px-3 text-xs md:text-sm text-[#526174]">
                          {tenantName(entry.vendorId)}
                        </td>
                      )}

                      <td className="py-3.5 px-3 font-semibold text-[#172033] text-xs md:text-sm">
                        {entry.name}{' '}
                        <span className="font-mono font-normal text-[#526174]">({entry.employeeId})</span>
                      </td>

                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-[#526174]">
                          {entry.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 text-xs md:text-sm text-[#172033]">{entry.action}</td>

                      <td className="py-3.5 px-3 text-xs md:text-sm text-[#526174]">{entry.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-[#526174]">
            <span>
              Showing {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
            <span className="mt-2 sm:mt-0">Prototype — entries are never edited or removed</span>
          </div>
        </div>
      </section>
    </div>
  );
}
