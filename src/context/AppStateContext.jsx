import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { activeSuppliers } from '../data/database.js';

const STORAGE_KEY = 'vyaparmitra:appState:v1';

/** Simulated only — no bank or Account Aggregator call is ever made. */
export const PAYMENT_SOURCES = ['Bank-matched (AA)', 'Buyer-confirmed', 'Self-reported'];

/** A payment only counts toward on-time % when someone other than the MSME confirms it. */
const CORROBORATED_SOURCES = ['Bank-matched (AA)', 'Buyer-confirmed'];

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
    const supplier = activeSuppliers.find((item) => item.name === record?.party);
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

export function isCorroborated(record) {
  return CORROBORATED_SOURCES.includes(record?.paymentSource);
}

/** An invoice has matured once its due date has passed. */
export function hasMatured(record, today = todayIsoDate()) {
  const due = getDueDate(record);
  return Boolean(due) && due <= today;
}

/**
 * On-time % = corroborated payments made on/before the due date, over corroborated
 * payments on matured invoices. Self-reported payments are shown in the ledger but
 * deliberately excluded here, so they cannot inflate readiness.
 */
export function getPaymentPerformance(records, today = todayIsoDate()) {
  const corroborated = records.filter((record) => isCorroborated(record) && record.paidDate);
  const considered = corroborated.filter((record) => hasMatured(record, today));
  const onTime = considered.filter((record) => (getDaysLate(record) ?? 1) <= 0);

  return {
    onTimeShare: considered.length ? onTime.length / considered.length : null,
    consideredCount: considered.length,
    onTimeCount: onTime.length,
    selfReportedExcluded: records.filter((record) => record.paymentSource === 'Self-reported').length,
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
 * @property {boolean|null} paidOnTime   Derived from a CORROBORATED payment only; null otherwise.
 * @property {'Unpaid'|'Partially Paid'|'Paid'} paymentStatus
 * @property {number} amountPaid
 * @property {string|null} paidDate      ISO date the money actually moved.
 * @property {string|null} paymentSource One of PAYMENT_SOURCES.
 * @property {'Receivable'|'Payable'|null} paymentDirection  Sale = buyer pays us, Purchase = we pay.
 */

/**
 * @typedef {Object} AppState
 * @property {TradeRecord[]} records
 * @property {boolean} profileShared
 * @property {'Approve'|'Make offer'|'Decline'|null} lenderDecision
 */

/** @type {AppState} */
const INITIAL_STATE = {
  records: [],
  profileShared: false,
  lenderDecision: null,
};

const AppStateContext = createContext(null);

function readPersistedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      records: Array.isArray(parsed?.records) ? parsed.records.map(withPaymentDefaults) : [],
      profileShared: Boolean(parsed?.profileShared),
      lenderDecision: parsed?.lenderDecision ?? null,
    };
  } catch {
    // Private window, blocked storage, or corrupt payload: start clean.
    return INITIAL_STATE;
  }
}

/** Fills the payment fields so records saved before this layer existed still work. */
function withPaymentDefaults(record) {
  return {
    ...record,
    paymentStatus: record?.paymentStatus ?? 'Unpaid',
    amountPaid: Number(record?.amountPaid) || 0,
    paidDate: record?.paidDate ?? null,
    paymentSource: record?.paymentSource ?? null,
    paymentDirection: record?.paymentDirection ?? (record?.type === 'Purchase' ? 'Payable' : 'Receivable'),
  };
}

function createRecordId() {
  return `REC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function AppStateProvider({ children }) {
  const [state, setState] = useState(readPersistedState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Persistence is best-effort; the prototype still works in-memory.
    }
  }, [state]);

  /** Adds a record, filling in id and the unverified defaults. */
  const addRecord = useCallback((record) => {
    const newRecord = withPaymentDefaults({
      id: record?.id || createRecordId(),
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
  }, []);

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
   * Simulated payment capture. paymentStatus follows amountPaid against the invoice
   * total, and paidOnTime is refreshed as a derived convenience for corroborated
   * payments only — a self-reported payment leaves it null, so it stays out of every
   * metric that reads it.
   */
  const recordPayment = useCallback((id, { amountPaid, paidDate, paymentSource }) => {
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
          paymentSource: paid > 0 ? paymentSource ?? null : null,
          paymentStatus: paid <= 0 ? 'Unpaid' : paid >= total ? 'Paid' : 'Partially Paid',
          paymentDirection: record.type === 'Purchase' ? 'Payable' : 'Receivable',
        };

        const daysLate = getDaysLate(next);
        next.paidOnTime = isCorroborated(next) && daysLate !== null ? daysLate <= 0 : null;
        return next;
      }),
    }));
  }, []);

  /** Records the lending partner's decision: 'Approve', 'Make offer' or 'Decline'. */
  const setLenderDecision = useCallback((lenderDecision) => {
    setState((prev) => ({ ...prev, lenderDecision: lenderDecision ?? null }));
  }, []);

  const value = useMemo(
    () => ({
      records: state.records,
      profileShared: state.profileShared,
      lenderDecision: state.lenderDecision,
      addRecord,
      verifyRecord,
      recordPayment,
      setProfileShared,
      setLenderDecision,
    }),
    [
      state.records,
      state.profileShared,
      state.lenderDecision,
      addRecord,
      verifyRecord,
      recordPayment,
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
