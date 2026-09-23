import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

/** 28 -> "28% (14% CGST + 14% SGST)", the split the invoice form already displayed. */
export function formatGst(gstPct) {
  if (gstPct === undefined || gstPct === null) return '';
  const half = Number((gstPct / 2).toFixed(2));
  return `${gstPct}% (${half}% CGST + ${half}% SGST)`;
}

const currency = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatAmount(value) {
  return `₹${currency.format(Number(value) || 0)}`;
}

let lineKey = 0;

export function blankLine() {
  lineKey += 1;
  return { key: `L${lineKey}`, itemCode: '', quantity: '', rate: '' };
}

export function lineTotal(line) {
  return (Number(line.quantity) || 0) * (Number(line.rate) || 0);
}

export function documentTotal(lines) {
  return lines.reduce((total, line) => total + lineTotal(line), 0);
}

/** GST is charged per line at the item master's own rate, so a mixed-rate document still adds up. */
export function documentGst(lines, items) {
  return lines.reduce((total, line) => {
    const master = items.find((item) => item.itemCode === line.itemCode);
    return total + (lineTotal(line) * (Number(master?.gstPct) || 0)) / 100;
  }, 0);
}

/** The line items as they are stored on a ledger record — no React keys, resolved names. */
export function toStoredLines(lines, items) {
  return lines
    .filter((line) => line.itemCode && lineTotal(line) > 0)
    .map((line) => {
      const master = items.find((item) => item.itemCode === line.itemCode);
      return {
        itemCode: line.itemCode,
        name: master ? master.name : line.itemCode,
        unit: master ? master.unit : '',
        quantity: Number(line.quantity) || 0,
        rate: Number(line.rate) || 0,
        gstPct: Number(master?.gstPct) || 0,
        amount: lineTotal(line),
      };
    });
}

/**
 * Several item rows on one invoice or GRN. Rate prefills from the item master and stays
 * editable, and the line total is always quantity x rate. Styling is the forms' own.
 */
export default function LineItemsTable({ items, lines, onChange, showGst = false, addLabel = 'Add item' }) {
  const updateLine = (index, patch) => {
    onChange(lines.map((line, position) => (position === index ? { ...line, ...patch } : line)));
  };

  const handleItemChange = (index, nextCode) => {
    const master = items.find((item) => item.itemCode === nextCode);
    // Picking an item refills the rate from the master; the user can still overwrite it.
    updateLine(index, { itemCode: nextCode, rate: master ? String(master.unitPrice) : '' });
  };

  const removeLine = (index) => {
    onChange(lines.length === 1 ? [blankLine()] : lines.filter((line, position) => position !== index));
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              <th className="pb-2 pr-3 font-bold">Product / Service</th>
              <th className="pb-2 px-3 font-bold w-28">Quantity</th>
              <th className="pb-2 px-3 font-bold w-28">Rate (₹)</th>
              {showGst && <th className="pb-2 px-3 font-bold w-60">GST Rate</th>}
              <th className="pb-2 px-3 font-bold w-32 text-right">Line Total</th>
              <th className="pb-2 pl-3 font-bold w-12"></th>
            </tr>
          </thead>

          <tbody>
            {lines.map((line, index) => {
              const master = items.find((item) => item.itemCode === line.itemCode) || null;
              return (
                <tr key={line.key}>
                  <td className="py-1.5 pr-3 align-top">
                    <select
                      value={line.itemCode}
                      onChange={(e) => handleItemChange(index, e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
                    >
                      <option value="">Select item</option>
                      {items.map((item) => (
                        <option key={item.itemCode} value={item.itemCode}>
                          {item.name} ({item.itemCode})
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="py-1.5 px-3 align-top">
                    <input
                      type="number"
                      min="0"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, { quantity: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm"
                    />
                  </td>

                  <td className="py-1.5 px-3 align-top">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.rate}
                      onChange={(e) => updateLine(index, { rate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm font-mono"
                    />
                  </td>

                  {showGst && (
                    <td className="py-1.5 px-3 align-top">
                      <input
                        type="text"
                        disabled
                        readOnly
                        value={formatGst(master?.gstPct)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50/70 text-[#172033] text-sm cursor-not-allowed"
                      />
                    </td>
                  )}

                  <td className="py-1.5 px-3 align-top text-right">
                    <div className="px-3 py-2 text-sm font-mono font-semibold text-[#172033]">
                      {formatAmount(lineTotal(line))}
                    </div>
                  </td>

                  <td className="py-1.5 pl-3 align-top">
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      aria-label="Remove line item"
                      className="p-2 rounded-xl text-[#526174] hover:bg-slate-100 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => onChange([...lines, blankLine()])}
        className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors"
      >
        <Plus className="w-4 h-4 text-[#10B8A5]" />
        <span>{addLabel}</span>
      </button>
    </div>
  );
}
