// Segregation of duties. One map, read by the router and by every screen that offers a
// shortcut into a view, so a control can never appear for a role that cannot reach it.
export const ROLE_VIEWS = {
  // The Owner also keeps their own supplier and buyer masters.
  Owner: ['home', 'dashboard', 'worklist', 'create-invoice', 'create-grn', 'masters', 'audit'],
  'Billing Clerk': ['create-invoice'],
  'Warehouse Clerk': ['create-grn', 'worklist'],
  // Finance reads the ledger and the cash view and settles payments, but does not
  // originate trade: no invoices, no goods receipts.
  Finance: ['home', 'dashboard', 'worklist'],
  Lender: ['profile'],
  'Backend (global access)': ['backend'],
};

export function viewsFor(role) {
  return ROLE_VIEWS[role] || [];
}

export function canAccess(role, view) {
  return viewsFor(role).includes(view);
}
