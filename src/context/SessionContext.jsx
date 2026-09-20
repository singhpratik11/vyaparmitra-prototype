import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { customers, users, suppliersByVendor, itemsByVendor, buyersByVendor } from '../data/database.js';

const ADMIN_VENDOR_ID = 'ADMIN';

const SessionContext = createContext(null);

/** Matches the login PAIR against the Users sheet. Unknown pairs are rejected. */
export function findUser(vendorId, employeeId) {
  const vendor = String(vendorId || '').trim().toUpperCase();
  const employee = String(employeeId || '').trim().toUpperCase();
  if (!vendor || !employee) return null;
  return (
    users.find(
      (user) => user.vendorId.toUpperCase() === vendor && user.employeeId.toUpperCase() === employee
    ) || null
  );
}

export function SessionProvider({ children }) {
  const [session, setSession] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [viewAsRole, setViewAsRole] = useState(null);

  const signIn = useCallback((vendorId, employeeId) => {
    const user = findUser(vendorId, employeeId);
    if (!user) {
      return { ok: false, error: 'No such Vendor ID and Employee ID pair. Check both and try again.' };
    }
    setSession(user);
    setSelectedCustomerId(null);
    setViewAsRole(null);
    return { ok: true };
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setSelectedCustomerId(null);
    setViewAsRole(null);
  }, []);

  const isAdmin = session?.vendorId === ADMIN_VENDOR_ID;

  // The tenant whose data is on screen: an admin's chosen customer, else the user's own plant.
  const scopeVendorId = isAdmin ? selectedCustomerId : session?.vendorId ?? null;

  const value = useMemo(() => {
    const customer = customers.find((item) => item.vendorId === scopeVendorId) || null;

    return {
      session,
      isAdmin,
      signIn,
      signOut,
      scopeVendorId,
      customer,
      suppliers: suppliersByVendor[scopeVendorId] || [],
      items: itemsByVendor[scopeVendorId] || [],
      buyers: buyersByVendor[scopeVendorId] || [],
      tenantUsers: users.filter((user) => user.vendorId === scopeVendorId),
      selectedCustomerId,
      selectCustomer: setSelectedCustomerId,
      // "View as" is a demo helper only; it never changes who is signed in.
      viewAsRole,
      setViewAsRole,
      role: viewAsRole || session?.role || null,
    };
  }, [session, isAdmin, signIn, signOut, scopeVendorId, selectedCustomerId, viewAsRole]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used inside a SessionProvider');
  }
  return context;
}
