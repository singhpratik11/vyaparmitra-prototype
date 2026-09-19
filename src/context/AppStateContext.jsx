import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'vyaparmitra:appState:v1';

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
 * @property {boolean|null} paidOnTime   null until the payment outcome is known.
 */

/**
 * @typedef {Object} AppState
 * @property {TradeRecord[]} records
 * @property {boolean} profileShared
 */

/** @type {AppState} */
const INITIAL_STATE = {
  records: [],
  profileShared: false,
};

const AppStateContext = createContext(null);

function readPersistedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      records: Array.isArray(parsed?.records) ? parsed.records : [],
      profileShared: Boolean(parsed?.profileShared),
    };
  } catch {
    // Private window, blocked storage, or corrupt payload: start clean.
    return INITIAL_STATE;
  }
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
    const newRecord = {
      id: record?.id || createRecordId(),
      type: record?.type ?? 'Sale',
      party: record?.party ?? '',
      amount: Number(record?.amount) || 0,
      date: record?.date ?? new Date().toISOString().slice(0, 10),
      paymentTermsDays: Number(record?.paymentTermsDays) || 0,
      status: record?.status ?? 'Unverified',
      verificationSource: record?.verificationSource ?? null,
      paidOnTime: record?.paidOnTime ?? null,
    };
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

  const value = useMemo(
    () => ({
      records: state.records,
      profileShared: state.profileShared,
      addRecord,
      verifyRecord,
      setProfileShared,
    }),
    [state.records, state.profileShared, addRecord, verifyRecord, setProfileShared]
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
