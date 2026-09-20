// Single source of truth: the JSON database that ships with the app.
// Shape: { tenants:[{ vendorId, name, gstin, ..., suppliers[], items[], buyers[] }], users[], masterScore[] }
import database from './vyaparmitra-database.json';

export const tenants = database.tenants;
export const users = database.users;
export const masterScore = database.masterScore;

/** Tenants are the platform's customers; kept under both names for readability. */
export const customers = tenants;

function byVendor(key) {
  return Object.fromEntries(tenants.map((tenant) => [tenant.vendorId, tenant[key] || []]));
}

export const suppliersByVendor = byVendor('suppliers');
export const itemsByVendor = byVendor('items');
export const buyersByVendor = byVendor('buyers');

export function getTenant(vendorId) {
  return tenants.find((tenant) => tenant.vendorId === vendorId) || null;
}
