// Demo trade activity, so no tenant ever opens to an empty ledger.
// The records themselves live in vyaparmitra-seed-records.json, keyed by vendorId;
// this module only expands them into the shape the store keeps. Nothing here invents
// trade — edit the JSON to change the demo.
import { seedRecords, users } from './database.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIso(isoDate) {
  const [year, month, day] = String(isoDate || '').split('-').map(Number);
  return Number.isFinite(year) ? Date.UTC(year, month - 1, day) : null;
}

function toIso(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** The file carries dueDate; the store derives due dates from terms, so invert it. */
function termsBetween(date, dueDate) {
  const from = parseIso(date);
  const to = parseIso(dueDate);
  if (from === null || to === null) return 0;
  return Math.round((to - from) / DAY_MS);
}

function todayMs() {
  const now = new Date();
  return parseIso(toIso(now.getTime() - now.getTimezoneOffset() * 60000));
}

/**
 * The file records WHETHER a payment landed on time, not the day it landed. Place it a
 * few days either side of the due date, then clamp it between the trade date and today
 * so the demo never shows money moving in the future. `paidOnTime` from the file stays
 * the authority on timing; this date is only for display and due-date helpers.
 */
function settlementDate(record, dueDate) {
  if (record.paymentStatus !== 'Paid') return null;
  const due = parseIso(dueDate);
  const issued = parseIso(record.date);
  if (due === null) return null;

  const nominal = due + (record.paidOnTime === true ? -3 : 7) * DAY_MS;
  const clamped = Math.min(nominal, todayMs());
  return toIso(issued === null ? clamped : Math.max(clamped, issued));
}

function expand(record) {
  const terms = termsBetween(record.date, record.dueDate);
  const paid = record.paymentStatus === 'Paid';

  return {
    id: record.id,
    vendorId: record.vendorId,
    type: record.type,
    party: record.party,
    amount: Number(record.amount) || 0,
    date: record.date,
    paymentTermsDays: terms,
    status: record.status,
    verificationSource: record.verificationSource ?? null,
    paidOnTime: record.paidOnTime ?? null,
    paymentStatus: record.paymentStatus,
    amountPaid: paid ? Number(record.amount) || 0 : 0,
    paidDate: settlementDate(record, record.dueDate),
    // The file's paymentSource already uses the two proof states the store keeps.
    paymentProof: paid ? record.paymentSource ?? null : null,
    receiptFileName: null,
    paymentDirection: record.type === 'Purchase' ? 'Payable' : 'Receivable',
  };
}

/**
 * A few illustrative audit entries per tenant, attributed to that plant's own staff, so
 * the log reads as a history rather than an empty table on first run.
 */
const SEED_AUDIT = [
  { vendorId: 'VM-0001', employeeId: 'E002', daysAgo: 9, action: 'Recorded sale invoice', target: 'VM-0001-R003 · Nashik Auto Dealers' },
  { vendorId: 'VM-0001', employeeId: 'E001', daysAgo: 7, action: 'Verified record', target: 'VM-0001-R003 · GST e-invoice' },
  { vendorId: 'VM-0001', employeeId: 'E004', daysAgo: 4, action: 'Bank-matched payment', target: 'VM-0001-R001 · Pune OEM Motors Ltd' },
  { vendorId: 'VM-0002', employeeId: 'E003', daysAgo: 11, action: 'Recorded goods receipt', target: 'VM-0002-R007 · Surat Yarn Mills' },
  { vendorId: 'VM-0002', employeeId: 'E001', daysAgo: 5, action: 'Logged payment receipt', target: 'VM-0002-R002 · Ahmedabad Garments Pvt Ltd' },
  { vendorId: 'VM-0003', employeeId: 'E002', daysAgo: 8, action: 'Recorded sale invoice', target: 'VM-0003-R002 · Krishna Hardware Stores' },
  { vendorId: 'VM-0003', employeeId: 'E001', daysAgo: 3, action: 'Shared profile with lending partner', target: 'Readiness profile' },
];

/** Seeded history for the audit view, newest first. */
export function buildSeedAuditLog() {
  const now = Date.now();
  return SEED_AUDIT.map((entry) => {
    const user = users.find(
      (candidate) => candidate.vendorId === entry.vendorId && candidate.employeeId === entry.employeeId
    );
    return {
      timestamp: new Date(now - entry.daysAgo * DAY_MS).toISOString(),
      vendorId: entry.vendorId,
      employeeId: entry.employeeId,
      name: user ? user.name : entry.employeeId,
      role: user ? user.role : 'Unknown',
      action: entry.action,
      target: entry.target,
    };
  }).sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
}

/** The full demo ledger across every tenant in the file, newest first. */
export function buildSeedRecords() {
  return Object.values(seedRecords)
    .flat()
    .map(expand)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
