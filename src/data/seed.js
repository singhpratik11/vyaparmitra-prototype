// Demo trade activity, so no tenant ever opens to an empty ledger.
// Deterministic and hand-tuned: parties come from each tenant's own masters in the
// JSON, amounts are real item prices x quantity, and the payment/verification mix is
// chosen so the three plants land near their intended bands (Ramesh strong, Deccan
// improving, Shakti needs attention). Nothing here is real trade.

const DAY_MS = 24 * 60 * 60 * 1000;

function parseIso(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number);
  return Date.UTC(year, month - 1, day);
}

function toIso(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function shiftDays(isoDate, days) {
  return toIso(parseIso(isoDate) + days * DAY_MS);
}

/**
 * Expands a compact spec into a full record.
 * settlement: 'onTime' | 'late' | 'logged' | 'unpaid'
 *   onTime / late  -> bank-confirmed, so it counts toward on-time %
 *   logged         -> receipt logged but unverified, deliberately excluded from the metric
 *   unpaid         -> still open, feeds the reminder worklist
 */
function makeRecord({
  id,
  vendorId,
  type,
  party,
  amount,
  date,
  terms,
  verifiedBy = null,
  settlement,
  settledOffset = 0,
}) {
  const dueDate = shiftDays(date, terms);
  const paid = settlement !== 'unpaid';
  const paidDate = paid ? shiftDays(dueDate, settledOffset) : null;
  const bankConfirmed = settlement === 'onTime' || settlement === 'late';

  return {
    id,
    vendorId,
    type,
    party,
    amount,
    date,
    paymentTermsDays: terms,
    status: verifiedBy ? 'Verified' : 'Unverified',
    verificationSource: verifiedBy,
    paidOnTime: bankConfirmed ? settledOffset <= 0 : null,
    paymentStatus: paid ? 'Paid' : 'Unpaid',
    amountPaid: paid ? amount : 0,
    paidDate,
    paymentProof: paid ? (bankConfirmed ? 'Bank-confirmed' : 'Received (unverified)') : null,
    receiptFileName: null,
    paymentDirection: type === 'Purchase' ? 'Payable' : 'Receivable',
  };
}

const GST = 'GST e-invoice ref';
const BANK = 'Bank inflow matched';
const BUYER = 'Buyer confirmed';

// VM-0001 Ramesh Auto Components — pays and gets paid reliably, spread across buyers.
const RAMESH = [
  { id: 'SEED-R01', type: 'Sale', party: 'Pune OEM Motors Ltd', amount: 840000, date: '2026-06-25', terms: 60, verifiedBy: GST, settlement: 'onTime', settledOffset: -4 },
  { id: 'SEED-R02', type: 'Sale', party: 'Pune OEM Motors Ltd', amount: 990000, date: '2026-07-10', terms: 60, verifiedBy: GST, settlement: 'onTime', settledOffset: -2 },
  { id: 'SEED-R03', type: 'Sale', party: 'Nashik Auto Dealers', amount: 875000, date: '2026-07-02', terms: 45, verifiedBy: BANK, settlement: 'late', settledOffset: 6 },
  { id: 'SEED-R04', type: 'Sale', party: 'Bharat Commercial Vehicles', amount: 1020000, date: '2026-07-20', terms: 90, verifiedBy: GST, settlement: 'unpaid' },
  { id: 'SEED-R05', type: 'Sale', party: 'Western Spare Parts Co', amount: 432000, date: '2026-08-05', terms: 30, verifiedBy: BUYER, settlement: 'onTime', settledOffset: -3 },
  { id: 'SEED-R06', type: 'Sale', party: 'Nashik Auto Dealers', amount: 735000, date: '2026-08-18', terms: 45, verifiedBy: GST, settlement: 'unpaid' },
  { id: 'SEED-R07', type: 'Sale', party: 'Western Spare Parts Co', amount: 336000, date: '2026-09-02', terms: 30, verifiedBy: null, settlement: 'logged', settledOffset: -5 },
  { id: 'SEED-R08', type: 'Purchase', party: 'Pune Steel Traders', amount: 1200000, date: '2026-06-28', terms: 60, verifiedBy: GST, settlement: 'onTime', settledOffset: -6 },
  { id: 'SEED-R09', type: 'Purchase', party: 'Deccan Fasteners', amount: 850000, date: '2026-07-15', terms: 45, verifiedBy: BANK, settlement: 'onTime', settledOffset: -1 },
  { id: 'SEED-R10', type: 'Purchase', party: 'Bharat Rubber Works', amount: 620000, date: '2026-08-02', terms: 30, verifiedBy: GST, settlement: 'onTime', settledOffset: -2 },
  { id: 'SEED-R11', type: 'Purchase', party: 'Maharashtra Paints & Coatings', amount: 480000, date: '2026-08-20', terms: 30, verifiedBy: BANK, settlement: 'onTime', settledOffset: -4 },
  { id: 'SEED-R12', type: 'Purchase', party: 'Sahyadri Logistics', amount: 275000, date: '2026-09-10', terms: 15, verifiedBy: null, settlement: 'unpaid' },
];

// VM-0003 Deccan Pipes & Fittings — improving: decent record, some late, some unverified.
const DECCAN = [
  { id: 'SEED-D01', type: 'Sale', party: 'Hyderabad Construction Co', amount: 720000, date: '2026-06-28', terms: 60, verifiedBy: GST, settlement: 'onTime', settledOffset: -3 },
  { id: 'SEED-D02', type: 'Sale', party: 'Krishna Hardware Stores', amount: 264000, date: '2026-07-05', terms: 30, verifiedBy: BUYER, settlement: 'late', settledOffset: 9 },
  { id: 'SEED-D03', type: 'Sale', party: 'South Build Materials', amount: 332500, date: '2026-07-18', terms: 45, verifiedBy: GST, settlement: 'onTime', settledOffset: -2 },
  { id: 'SEED-D04', type: 'Sale', party: 'South Build Materials', amount: 540000, date: '2026-08-01', terms: 60, verifiedBy: GST, settlement: 'unpaid' },
  { id: 'SEED-D05', type: 'Sale', party: 'Krishna Hardware Stores', amount: 210000, date: '2026-08-14', terms: 30, verifiedBy: null, settlement: 'logged', settledOffset: -1 },
  { id: 'SEED-D06', type: 'Sale', party: 'South Build Materials', amount: 210000, date: '2026-09-02', terms: 45, verifiedBy: null, settlement: 'unpaid' },
  { id: 'SEED-D07', type: 'Sale', party: 'Hyderabad Construction Co', amount: 198000, date: '2026-09-15', terms: 60, verifiedBy: BANK, settlement: 'unpaid' },
  { id: 'SEED-D08', type: 'Purchase', party: 'Telangana Polymers', amount: 650000, date: '2026-06-20', terms: 60, verifiedBy: GST, settlement: 'onTime', settledOffset: -5 },
  { id: 'SEED-D09', type: 'Purchase', party: 'South Metal Works', amount: 420000, date: '2026-07-12', terms: 45, verifiedBy: BANK, settlement: 'late', settledOffset: 12 },
  { id: 'SEED-D10', type: 'Purchase', party: 'Godavari Chemicals', amount: 230000, date: '2026-08-05', terms: 30, verifiedBy: null, settlement: 'onTime', settledOffset: -2 },
  { id: 'SEED-D11', type: 'Purchase', party: 'Charminar Transport', amount: 110000, date: '2026-09-05', terms: 15, verifiedBy: GST, settlement: 'onTime', settledOffset: -1 },
  { id: 'SEED-D12', type: 'Purchase', party: 'Telangana Polymers', amount: 580000, date: '2026-09-12', terms: 60, verifiedBy: null, settlement: 'unpaid' },
];

// VM-0002 Shakti Textiles — needs attention: leans on one buyer, pays late, little verified.
const SHAKTI = [
  { id: 'SEED-S01', type: 'Sale', party: 'Ahmedabad Garments Pvt Ltd', amount: 510000, date: '2026-06-26', terms: 45, verifiedBy: GST, settlement: 'late', settledOffset: 14 },
  { id: 'SEED-S02', type: 'Sale', party: 'Ahmedabad Garments Pvt Ltd', amount: 720000, date: '2026-07-14', terms: 45, verifiedBy: BANK, settlement: 'onTime', settledOffset: -2 },
  { id: 'SEED-S03', type: 'Sale', party: 'Mumbai Fashion House', amount: 378000, date: '2026-08-02', terms: 60, verifiedBy: null, settlement: 'unpaid' },
  { id: 'SEED-S04', type: 'Sale', party: 'Delhi Apparel Traders', amount: 240000, date: '2026-08-16', terms: 30, verifiedBy: null, settlement: 'unpaid' },
  { id: 'SEED-S05', type: 'Sale', party: 'Ahmedabad Garments Pvt Ltd', amount: 380000, date: '2026-09-03', terms: 45, verifiedBy: GST, settlement: 'unpaid' },
  { id: 'SEED-S06', type: 'Sale', party: 'Surat Wholesale Fabrics', amount: 144000, date: '2026-09-14', terms: 30, verifiedBy: null, settlement: 'unpaid' },
  { id: 'SEED-S07', type: 'Purchase', party: 'Surat Yarn Mills', amount: 360000, date: '2026-06-22', terms: 45, verifiedBy: GST, settlement: 'onTime', settledOffset: -3 },
  { id: 'SEED-S08', type: 'Purchase', party: 'Gujarat Dyes & Chemicals', amount: 180000, date: '2026-07-20', terms: 30, verifiedBy: BANK, settlement: 'late', settledOffset: 11 },
  { id: 'SEED-S09', type: 'Purchase', party: 'Silk Route Traders', amount: 240000, date: '2026-07-08', terms: 60, verifiedBy: null, settlement: 'logged', settledOffset: 2 },
  { id: 'SEED-S10', type: 'Purchase', party: 'Western Packaging Co', amount: 95000, date: '2026-08-25', terms: 30, verifiedBy: null, settlement: 'unpaid' },
  { id: 'SEED-S11', type: 'Purchase', party: 'Surat Yarn Mill', amount: 150000, date: '2026-09-08', terms: 45, verifiedBy: null, settlement: 'unpaid' },
];

const BY_VENDOR = [
  ['VM-0001', RAMESH],
  ['VM-0002', SHAKTI],
  ['VM-0003', DECCAN],
];

/** The full demo ledger across all three tenants, newest first. */
export function buildSeedRecords() {
  return BY_VENDOR.flatMap(([vendorId, specs]) =>
    specs.map((spec) => makeRecord({ ...spec, vendorId }))
  ).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}
