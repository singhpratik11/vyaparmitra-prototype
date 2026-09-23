# VyaparMitra Frontend Prototype

> **Business Together for a Brighter Tomorrow**

A frontend-only prototype of **VyaparMitra**, a trade-record app for Indian MSMEs. A business records
its sales invoices and goods receipts; the app keeps them as a ledger, tracks which ones were paid and
verified, turns that into a credit-readiness band, and lets the owner share the result with a lending
partner.

Everything runs in the browser. There are no servers, no APIs, no real GST or bank integrations — the
verification and payment checks are simulated, and the data ships with the code.

---

## Run it

Needs Node 18+ and npm.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build into dist/
npm run preview  # serve that build
```

---

## Sign in

The login takes a **Vendor ID + Employee ID pair**, checked against the demo user list. There are no
passwords. Two shortcut buttons on the login screen fill a pair in for you.

| Vendor ID | Employee ID | Who you become |
|---|---|---|
| `VM-0001` | `E001` | Ramesh Patel — Owner of Ramesh Auto Components |
| `VM-0001` | `E002` / `E003` / `E004` | Billing Clerk / Warehouse Clerk / Finance |
| `VM-0002` | `E001` | Kavita Shah — Owner of Shakti Textiles |
| `VM-0003` | `E001` | Venkat Rao — Owner of Deccan Pipes & Fittings |
| `ADMIN` | `B001` | Backend console, all three tenants |

You only ever see your own plant's data. A refresh signs you out again.

Once inside, the header has a **view-as picker** listing that plant's staff plus a lending partner, so
you can see the same data through another role without signing out. It changes what's on screen only —
the audit log still records the person who actually signed in.

---

## What each role can do

| Role | Can reach |
|---|---|
| **Owner** | Everything in their own plant: home, dashboard, worklist, invoices, GRNs, masters, audit log |
| **Billing Clerk** | Create Invoice |
| **Warehouse Clerk** | Create GRN, Payment Worklist |
| **Finance** | Home, dashboard, worklist — settles payments but cannot raise invoices or GRNs |
| **Lender** | The shared readiness profile, and nothing else |
| **Backend** | The console across every tenant |

A role never sees a link to a screen it cannot open.

---

## The screens

**Home** — a greeting, the trading-health badge, the two entry actions (Create Invoice, Create GRN),
and a diagram of the four steps a sale passes through: SALE → INVOICE → BUSINESS RECORD →
CREDITWORTHINESS.

**Create Invoice** — pick a buyer (their GSTIN and agreed payment terms fill in), set the date, then
add line items: pick an item from your master, enter a quantity, and the rate prefills from the item
master and stays editable. Each line shows its own total; the box at the bottom keeps a running
subtotal, the GST at each item's own rate, and the payable total. `+ Add item` appends a row and each
row has a remove control. Saving writes one record to the ledger for the document subtotal, with the
individual lines stored on it.

**Create GRN** — the same line-items entry for goods received from a supplier, with no GST. It also has
a **Scan barcode** button: a *simulated* scan (no camera) that walks your item master and drops in the
next item at quantity 1, editable like any other row.

**Business Dashboard** — the business snapshot, the credit-readiness card, and the full ledger.

*On the readiness card:* a band — **Strong**, **Improving** or **Needs Attention** — never a number.
Underneath it are the three measures that moved it: settlements, recorded trade volume, and the share
of records that are verified. Three actions sit beside it:

- **Download report** — opens a printable one-page credit-readiness report (print to PDF; no library).
- **Share with lender** — a consent dialog showing exactly what the partner would see. Until you
  confirm, the lender view is empty. Afterwards the lender can respond Approve / Make offer / Decline,
  and the answer comes back to you.
- **See loan options** — indicative facility shapes scaled off your own monthly trade and band.
  Illustrative only; nothing is an offer.

*In the ledger:* each row carries its status and payment state, and you can verify a record (simulated
— it stamps a source such as "GST e-invoice ref") or record a payment against it.

**Payment Worklist** — everything unpaid, in three buckets: Overdue, Due this week, Due next week,
split into money owed to you and money you owe. The nav carries an amber count of overdue items. A row
leaves a bucket only when it is fully paid.

**Suppliers & Buyers** (Owner) — add and edit your own suppliers and buyers: name, GSTIN,
category/city, payment terms. Anything you add shows up in the invoice and GRN pickers immediately.
Your changes layer over the shipped list rather than rewriting it.

**Audit Log** — every state-changing action, with who did it, when, and what it touched. Read-only.
Owners see their own plant; the backend sees all of them.

---

## How a record moves

```
created (Unverified, Unpaid)
   → verified            simulated check, stamps a verification source
   → payment recorded    "Received (unverified)" — clears the reminder
   → bank-matched        "Bank-confirmed" — the only proof that counts for the score
```

Payment proof is deliberately two-state. Logging a receipt is enough to clear a reminder but is not
credit-grade; only a simulated bank match is, so a self-reported receipt cannot lift the score.

---

## How the readiness band is worked out

Four parameters, measured from the records on file, each scored 0–100 and weighted:

| Parameter | Measured as | Weight |
|---|---|---|
| On-time payment | paid on time ÷ **bank-confirmed** paid records (self-reported excluded) | 35% |
| Verified transactions | verified ÷ all records | 25% |
| Monthly trade volume | sales value ÷ 3 months, against a ₹50L/month target | 20% |
| Buyer diversification | 100 − the largest buyer's share of sales | 20% |

The weighted total lands in a band: **Strong** at 75+, **Improving** at 50+, **Needs Attention** below.
With the shipped data that gives 81.2 / 69.1 / 23.7 for the three plants.

The MSME app shows the band word; the backend console and the downloadable report show the number.

---

## Backend console (`ADMIN` / `B001`)

Four tabs across all tenants:

- **Select a customer** — searchable list; picking a plant drills into its readiness, score breakdown,
  masters and ledger.
- **Global data** — every tenant's score side by side, a parameter-by-parameter breakdown for each, and
  the **Score Model** panel: the four weights and the two band thresholds are editable, every tenant
  re-scores live as you type, a running check flags when the weights do not total 100%, and *Restore
  JSON defaults* puts the model back. Weight changes are written to the audit log. No other role can
  see or change them.
- **Retention** — seeded activation cohorts and how they held up month to month.
- **Audit log** — every tenant's trail in one place.

**Reset demo data** returns everything to the shipped state.

---

## Where the data lives

- `src/data/vyaparmitra-database.json` — the three tenants, their staff, and their supplier / item /
  buyer masters.
- `src/data/vyaparmitra-seed-records.json` — the seeded ledger (13 / 11 / 9 records) and the scoring
  model.
- Anything you do in the app is held in `localStorage` under `vyaparmitra:appState:v1` — records, audit
  log, master edits and score settings. Clearing it (or *Reset demo data*) reseeds from the files. An
  empty ledger reseeds; a ledger with real records in it is never overwritten.

Sign-in itself is in memory only, so a refresh returns you to the login screen.

---

## What is simulated

Verification, bank matching, the lender's decision, the barcode scan, the cohort retention figures and
the loan options are all simulated in the browser. The readiness band is a presentation of the recorded
trade — it is not a bank or NBFC credit score and it is not an offer of credit.

---

## Project layout

React 18 + Vite 5 + Tailwind 3, plain JSX, desktop-only, no router — `App.jsx` switches the current
view and `src/data/roles.js` decides which views a role may reach.

| Path | What it holds |
|---|---|
| `src/App.jsx` | View switching, role gating, the view-as picker |
| `src/context/SessionContext.jsx` | Who is signed in, which tenant is in scope |
| `src/context/AppStateContext.jsx` | Records, audit log, master edits, score settings; localStorage |
| `src/data/score.js` | The one scoring implementation, shared by the card and the console |
| `src/data/roles.js` | `ROLE_VIEWS` — the single permissions map |
| `src/components/` | The screens and their pieces |

Brand tokens (in `tailwind.config.js`): navy `#123B78`, blue `#1265A8`, teal `#10B8A5`, mint `#E8F7F3`,
dark text `#172033`, secondary text `#526174`, background `#F6F9FB`, Plus Jakarta Sans.
