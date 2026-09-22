import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { suppliersByVendor } from '../data/database.js';
import { buildSeedRecords } from '../data/seed.js';
import { useSession } from './SessionContext.jsx';

/** Every tenant's suppliers, for resolving payment terms off a record's party name. */
const ALL_SUPPLIERS = Object.values(suppliersByVendor).flat();

const STORAGE_KEY = 'vyaparmitra:appState:v1';

/**
 * Payment proof is two-state. Logging a receipt is good enough to clear a reminder but
 * is NOT credit-grade; only a simulated Account Aggregator match is. The user can reach
 * the first state, never the second.
 */
export const PAYMENT_PROOF_LOGGED = 'Received (unverified)';
export const PAYMENT_PROOF_CONFIRMED = 'Bank-confirmed';

/** Maps the retired three-value paymentSource onto the two proof states. */
const LEGACY_SOURCE_PROOF = {
  'Bank-matched (AA)': PAYMENT_PROOF_CONFIRMED,
  'Buyer-confirmed': PAYMENT_PROOF_LOGGED,
  'Self-reported': PAYMENT_PROOF_LOGGED,
};

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(isoDate) {
  const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate || '');
  if (!parts) return null;
  return Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
}

function toIsoDate(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

/** Today in the viewer's own timezone, not UTC. */
export function todayIsoDate() {
  const now = new Date();
  return toIsoDate(now.getTime() - now.getTimezoneOffset() * 60000);
}

/**
 * A GRN carries no payment terms of its own, so fall back to the terms the supplier
 * master holds for that party. Anything still unknown is treated as due on the date.
 */
export function getPaymentTermsDays(record) {
  const own = Number(record?.paymentTermsDays);
  if (own) return own;
  if (record?.type === 'Purchase') {
    const supplier = ALL_SUPPLIERS.find((item) => item.name === record?.party);
    if (supplier) return Number(supplier.paymentTermsDays) || 0;
  }
  return 0;
}

/** Derived, never stored: storing it would go stale if the date or terms change. */
export function getDueDate(record) {
  const issued = parseIsoDate(record?.date);
  if (issued === null) return null;
  return toIsoDate(issued + getPaymentTermsDays(record) * DAY_MS);
}

/** Anything not fully paid still needs chasing, including partially paid invoices. */
export function isUnpaid(record) {
  return record?.paymentStatus !== 'Paid';
}

/** Days from today to the due date: negative = overdue, 0 = due today. */
export function getDaysUntilDue(record, today = todayIsoDate()) {
  const due = parseIsoDate(getDueDate(record));
  const now = parseIsoDate(today);
  if (due === null || now === null) return null;
  return Math.round((due - now) / DAY_MS);
}

/**
 * Which reminder bucket a record sits in, by due date against today alone — nothing
 * an operator does moves a record between buckets except settling it.
 */
export function getDueBucket(record, today = todayIsoDate()) {
  const days = getDaysUntilDue(record, today);
  if (days === null) return null;
  if (days < 0) return 'Overdue';
  if (days <= 7) return 'Due this week';
  if (days <= 14) return 'Due next week';
  return null;
}

/** Derived: paidDate − dueDate in days. Negative = early, 0 = on time, null = unknown. */
export function getDaysLate(record) {
  const due = parseIsoDate(getDueDate(record));
  const paid = parseIsoDate(record?.paidDate);
  if (due === null || paid === null) return null;
  return Math.round((paid - due) / DAY_MS);
}

export function isBankConfirmed(record) {
  return record?.paymentProof === PAYMENT_PROOF_CONFIRMED;
}

/** An invoice has matured once its due date has passed. */
export function hasMatured(record, today = todayIsoDate()) {
  const due = getDueDate(record);
  return Boolean(due) && due <= today;
}

/**
 * On-time % = bank-confirmed payments made on/before the due date, over bank-confirmed
 * payments on matured invoices. Logged-but-unverified receipts are shown in the ledger
 * but deliberately excluded here, so a self-reported receipt cannot inflate readiness.
 */
export function getPaymentPerformance(records, today = todayIsoDate()) {
  const confirmed = records.filter((record) => isBankConfirmed(record) && record.paidDate);
  const considered = confirmed.filter((record) => hasMatured(record, today));
  const onTime = considered.filter((record) => (getDaysLate(record) ?? 1) <= 0);

  return {
    onTimeShare: considered.length ? onTime.length / considered.length : null,
    consideredCount: considered.length,
    onTimeCount: onTime.length,
    unverifiedExcluded: records.filter((record) => record.paymentProof === PAYMENT_PROOF_LOGGED).length,
    receivableCount: considered.filter((record) => record.paymentDirection === 'Receivable').length,
    payableCount: considered.filter((record) => record.paymentDirection === 'Payable').length,
  };
}

/**
 * @typedef {Object} TradeRecord
 * @property {string} id
 * @property {'Sale'|'Purchase'} type
 * @property {string} party              Buyer for a Sale, seller for a Purchase.
 * @property {number} amount             Rupees, plain number (no formatting).
 * @property {string} date               ISO date string, e.g. '2026-09-20'.
 * @property {number} paymentTermsDays
 * @property {'Unverified'|'Verified'} status
 * @property {string|null} verificationSource
 * @property {boolean|null} paidOnTime   Whether the payment landed on or before its due date.
 *                                       Seeded records carry it; a logged receipt leaves it null
 *                                       until a bank match settles the question.
 * @property {'Unpaid'|'Partially Paid'|'Paid'} paymentStatus
 * @property {number} amountPaid
 * @property {string|null} paidDate      ISO date the money actually moved.
 * @property {string|null} paymentProof  PAYMENT_PROOF_LOGGED or PAYMENT_PROOF_CONFIRMED.
 * @property {string|null} receiptFileName Reference only — never affects proof or the score.
 * @property {'Receivable'|'Payable'|null} paymentDirection  Sale = buyer pays us, Purchase = we pay.
 */

/**
 * @typedef {Object} AppState
 * @property {TradeRecord[]} records
 * @property {boolean} profileShared
 * @property {'Approve'|'Make offer'|'Decline'|null} lenderDecision
 */

/** A fresh session opens on the demo ledger rather than three empty plants. */
function freshState() {
  return {
    records: buildSeedRecords(),
    profileShared: false,
    lenderDecision: null,
  };
}

const AppStateContext = createContext(null);

function readPersistedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return freshState();

    const parsed = JSON.parse(raw);
    const stored = Array.isArray(parsed?.records) ? parsed.records.map(withPaymentDefaults) : [];

    // A browser that used the app before this seed existed carries an empty ledger.
    // Nothing deletes records, so an empty array means "never seeded", not "cleared" —
    // heal it here rather than making every such session start on blank screens.
    if (stored.length === 0) return freshState();

    return {
      records: stored,
      profileShared: Boolean(parsed?.profileShared),
      lenderDecision: parsed?.lenderDecision ?? null,
    };
  } catch {
    // Private window, blocked storage, or corrupt payload: start from the demo ledger.
    return freshState();
  }
}

/** Fills the payment fields so records saved before this layer existed still work. */
function withPaymentDefaults(record) {
  const { paymentSource, ...rest } = record || {};
  const next = {
    ...rest,
    paymentStatus: record?.paymentStatus ?? 'Unpaid',
    amountPaid: Number(record?.amountPaid) || 0,
    paidDate: record?.paidDate ?? null,
    paymentProof: record?.paymentProof ?? LEGACY_SOURCE_PROOF[paymentSource] ?? null,
    receiptFileName: record?.receiptFileName ?? null,
    paymentDirection: record?.paymentDirection ?? (record?.type === 'Purchase' ? 'Payable' : 'Receivable'),
    // Records saved before tenants existed belong to the plant the app ran as.
    vendorId: record?.vendorId ?? 'VM-0001',
  };

  return next;
}

function createRecordId() {
  return `REC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function AppStateProvider({ children }) {
  const { scopeVendorId } = useSession();
  const [state, setState] = useState(readPersistedState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Persistence is best-effort; the prototype still works in-memory.
    }
  }, [state]);

  /** Adds a record, filling in id, the tenant it belongs to, and the unverified defaults. */
  const addRecord = useCallback((record) => {
    const newRecord = withPaymentDefaults({
      id: record?.id || createRecordId(),
      vendorId: record?.vendorId ?? scopeVendorId ?? null,
      type: record?.type ?? 'Sale',
      party: record?.party ?? '',
      amount: Number(record?.amount) || 0,
      date: record?.date ?? new Date().toISOString().slice(0, 10),
      paymentTermsDays: Number(record?.paymentTermsDays) || 0,
      status: record?.status ?? 'Unverified',
      verificationSource: record?.verificationSource ?? null,
      paidOnTime: record?.paidOnTime ?? null,
    });
    setState((prev) => ({ ...prev, records: [newRecord, ...prev.records] }));
    return newRecord;
  }, [scopeVendorId]);

  /** Marks one record Verified and stamps where the verification came from. */
  const verifyRecord = useCallback((id, verificationSource = null) => {
    setState((prev) => ({
      ...prev,
      records: prev.records.map((record) =>
        record.id === id
          ? { ...record, status: 'Verified', verificationSource }
          : record
      ),
    }));
  }, []);

  const setProfileShared = useCallback((profileShared) => {
    setState((prev) => ({ ...prev, profileShared: Boolean(profileShared) }));
  }, []);

  /**
   * Logs a receipt. Clears the reminder and marks the record paid, but the proof is
   * only ever PAYMENT_PROOF_LOGGED — the user cannot reach the confirmed state here.
   */
  const recordPayment = useCallback((id, { amountPaid, paidDate, receiptFileName }) => {
    setState((prev) => ({
      ...prev,
      records: prev.records.map((record) => {
        if (record.id !== id) return record;

        const paid = Number(amountPaid) || 0;
        const total = Number(record.amount) || 0;
        const next = {
          ...record,
          amountPaid: paid,
          paidDate: paid > 0 ? paidDate || null : null,
          paymentProof: paid > 0 ? PAYMENT_PROOF_LOGGED : null,
          receiptFileName: receiptFileName ?? record.receiptFileName ?? null,
          paymentStatus: paid <= 0 ? 'Unpaid' : paid >= total ? 'Paid' : 'Partially Paid',
          paymentDirection: record.type === 'Purchase' ? 'Payable' : 'Receivable',
        };

        // A logged receipt is never credit-grade, so this stays null until a bank match.
        next.paidOnTime = null;
        return next;
      }),
    }));
  }, []);

  /**
   * Simulated Account Aggregator match — no bank call is made. It confirms the inflow
   * already logged against the invoice rather than inventing a different date, and takes
   * no user input, because the MSME does not control bank confirmation.
   */
  const bankMatchPayment = useCallback((id) => {
    setState((prev) => ({
      ...prev,
      records: prev.records.map((record) => {
        if (record.id !== id || !record.paidDate) return record;

        const next = { ...record, paymentProof: PAYMENT_PROOF_CONFIRMED };
        const daysLate = getDaysLate(next);
        next.paidOnTime = daysLate !== null ? daysLate <= 0 : null;
        return next;
      }),
    }));
  }, []);

  /** Restores the seeded demo ledger and clears any sharing or lender decision. */
  const resetDemoData = useCallback(() => {
    setState(freshState());
  }, []);

  /** Records the lending partner's decision: 'Approve', 'Make offer' or 'Decline'. */
  const setLenderDecision = useCallback((lenderDecision) => {
    setState((prev) => ({ ...prev, lenderDecision: lenderDecision ?? null }));
  }, []);

  // A tenant only ever sees its own ledger; an admin sees the customer they picked.
  const scopedRecords = useMemo(
    () => state.records.filter((record) => record.vendorId === scopeVendorId),
    [state.records, scopeVendorId]
  );

  const value = useMemo(
    () => ({
      records: scopedRecords,
      allRecords: state.records,
      profileShared: state.profileShared,
      lenderDecision: state.lenderDecision,
      addRecord,
      verifyRecord,
      recordPayment,
      bankMatchPayment,
      resetDemoData,
      setProfileShared,
      setLenderDecision,
    }),
    [
      scopedRecords,
      state.records,
      state.profileShared,
      state.lenderDecision,
      addRecord,
      verifyRecord,
      recordPayment,
      bankMatchPayment,
      resetDemoData,
      setProfileShared,
      setLenderDecision,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used inside an AppStateProvider');
  }
  return context;
}

export { STORAGE_KEY };
