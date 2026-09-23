import React, { useState } from 'react';
import { ArrowLeft, Plus, Pencil } from 'lucide-react';
import MasterFormModal from './MasterFormModal';
import { useAppState } from '../context/AppStateContext.jsx';
import { useSession } from '../context/SessionContext.jsx';

/** Ids for masters this plant adds itself, kept apart from the seeded SUP-/BUY- numbers. */
function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

function MasterCard({ title, description, columns, rows, onAdd, onEdit, addLabel }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-6 md:p-7 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-[#172033] tracking-tight">{title}</h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-[#526174] px-2 py-0.5 rounded">
              {rows.length} on file
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">{description}</p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-[#123B78] hover:bg-slate-50 text-xs font-bold shadow-2xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#10B8A5]" />
          <span>{addLabel}</span>
        </button>
      </div>

      <div className="overflow-x-auto mt-4">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-[#526174] uppercase tracking-wider">
              {columns.map((column) => (
                <th key={column.key} className={`py-3 px-3 ${column.align || ''}`}>
                  {column.label}
                </th>
              ))}
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-[#F6F9FB]/80 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`py-3.5 px-3 text-xs md:text-sm ${column.cellClass || 'text-[#526174]'} ${column.align || ''}`}
                  >
                    {row[column.key] || '—'}
                  </td>
                ))}
                <td className="py-3.5 px-3 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => onEdit(row.source)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#1265A8] hover:text-[#123B78] hover:underline"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MastersPage({ onNavigate }) {
  const { suppliers, buyers, upsertMaster } = useAppState();
  const { customer } = useSession();
  const [editing, setEditing] = useState(null);

  const openAdd = (kind) => setEditing({ kind, entry: null });
  const openEdit = (kind) => (entry) => setEditing({ kind, entry });

  const handleSubmit = (values) => {
    const { kind, entry } = editing;
    const idKey = kind === 'suppliers' ? 'supplierId' : 'buyerId';
    upsertMaster(kind, {
      ...(entry || {}),
      ...values,
      [idKey]: entry ? entry[idKey] : makeId(kind === 'suppliers' ? 'SUP' : 'BUY'),
    });
    setEditing(null);
  };

  const supplierRows = suppliers.map((supplier) => ({
    id: supplier.supplierId,
    source: supplier,
    supplierId: supplier.supplierId,
    name: supplier.name,
    gstin: supplier.gstin,
    category: supplier.category,
    paymentTermsDays: supplier.paymentTermsDays,
  }));

  const buyerRows = buyers.map((buyer) => ({
    id: buyer.buyerId,
    source: buyer,
    buyerId: buyer.buyerId,
    name: buyer.name,
    gstin: buyer.gstin,
    city: buyer.city,
    paymentTermsDays: buyer.paymentTermsDays,
  }));

  return (
    <div className="space-y-6 md:space-y-8 max-w-7xl mx-auto">
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
            <span className="text-xs font-semibold text-[#1265A8]">Your Masters</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-[#172033] tracking-tight">
            Suppliers &amp; Buyers
          </h1>
          <p className="text-xs md:text-sm text-[#526174] mt-0.5">
            {customer?.name} only. Anything you add here shows up in the invoice and GRN pickers
            immediately, and every change is signed in the audit log.
          </p>
        </div>
      </div>

      <section aria-label="Supplier Masters">
        <MasterCard
          title="Suppliers"
          description="Who you buy from. Terms here set the due date on a goods receipt."
          addLabel="Add supplier"
          rows={supplierRows}
          onAdd={() => openAdd('suppliers')}
          onEdit={openEdit('suppliers')}
          columns={[
            { key: 'name', label: 'Supplier', cellClass: 'font-semibold text-[#172033]' },
            { key: 'gstin', label: 'GSTIN', cellClass: 'font-mono text-[#526174]' },
            { key: 'category', label: 'Category' },
            { key: 'paymentTermsDays', label: 'Terms (Days)', align: 'text-right', cellClass: 'font-mono text-[#172033]' },
          ]}
        />
      </section>

      <section aria-label="Buyer Masters">
        <MasterCard
          title="Buyers"
          description="Who you sell to. Terms here prefill the payment terms on an invoice."
          addLabel="Add buyer"
          rows={buyerRows}
          onAdd={() => openAdd('buyers')}
          onEdit={openEdit('buyers')}
          columns={[
            { key: 'name', label: 'Buyer', cellClass: 'font-semibold text-[#172033]' },
            { key: 'gstin', label: 'GSTIN', cellClass: 'font-mono text-[#526174]' },
            { key: 'city', label: 'City' },
            { key: 'paymentTermsDays', label: 'Terms (Days)', align: 'text-right', cellClass: 'font-mono text-[#172033]' },
          ]}
        />
      </section>

      <MasterFormModal
        isOpen={Boolean(editing)}
        kind={editing?.kind}
        entry={editing?.entry}
        onClose={() => setEditing(null)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
