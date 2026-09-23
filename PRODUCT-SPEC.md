# VyaparMitra — Product Specification

*Invoice-to-Credit Wallet for India's traditional MSMEs.*
*Prototype build — Product Management coursework, Group A1.*

---

## 1. What VyaparMitra is

VyaparMitra helps a GST-registered MSME turn the trade it already does into a **verified financial record** that a lender can act on — without collateral.

The problem: a small manufacturer or trader does genuine, consistent business, but that activity is scattered across invoices, GST returns and bank statements. No single party sees the whole picture, so banks fall back on collateral the business doesn't have, and it stays locked out of credit despite real revenue.

The product records each sale and purchase **once**, verifies it against outside sources, turns it into a **credit-readiness profile**, and — only with the owner's consent — shares it with a lender.

**The product spine.** Every feature exists to serve this one flow:

`SALE → INVOICE / GRN → VERIFIED RECORD → CREDIT-READINESS → CREDIT`

**Target customer:** GST-registered manufacturer or trader, roughly ₹5–25 crore turnover, still billing manually, selling on 30–90 day credit terms.

---

## 2. Prototype status (read this first)

This is a **frontend-only prototype** (React + Vite + Tailwind, deployed on Vercel). It demonstrates the full workflow and the scoring model, not production integrations.

Everything external is **simulated**: there is no live GST connection, no real Account Aggregator / bank feed, no real lender system, and no production authentication. Data is seeded (3 sample businesses, ~33 trade records) and stored in the browser's local storage. Where verification, bank-matching or lending appears, it is a stand-in for the real integration, and the interface labels it as a prototype.

The point of the prototype is to answer one question: *will verified trade actually become a credit score a lender can use?* — by letting someone see it happen end to end.

---

## 3. Who uses it — access, roles and tenants

### Login
A user signs in with two identifiers, matched as a pair:
- **Vendor ID** — the business (plant). Assigned by VyaparMitra, like an SAP plant code (e.g. `VM-0001`).
- **Employee ID** — the person inside that business (e.g. `E001`). Unique only within a plant.

An unknown vendor/employee pair is rejected. This mirrors how a real multi-tenant system provisions the business, then lets the business map its own people.

### Tenant isolation
Each business is walled off. A user only ever sees their own business's data. The backend team is the only party that sees across all businesses.

### Roles and what each can do
Roles enforce **segregation of duties** — no single person controls a whole transaction, which is what stops fabricated trade.

- **Owner (key user)** — full control within their own business, including adding and editing their own suppliers, buyers and items. No access to the backend. Every action the owner takes is written to the audit log (accountability in place of separation, since a small-business owner does many jobs).
- **Billing clerk** — creates sales invoices only.
- **Warehouse clerk** — creates goods-received notes (GRNs) only.
- **Finance** — views the ledger and cash position and records/reconciles payments. Cannot create invoices or GRNs (removed deliberately, so the person overseeing money can't also fabricate the source documents).
- **Lending partner** — sees only a read-only credit-readiness profile that an owner has chosen to share, and returns a decision. No access to raw data.
- **Backend / Admin** — VyaparMitra's own team. Full access across all businesses, plus the score model.

### Audit log
Every state-changing action (create, edit, verify, payment, share, master change) is recorded with who did it — timestamp, business, employee, role, action. Visible to the Owner (own business) and to the Backend console (all businesses). This is both a control and the evidence trail behind the fraud-prevention story.

---

## 4. Recording trade — capture

### Invoices (sales)
The billing clerk records a sale. The **Customer** field is a picker over the business's own buyer list and auto-fills the buyer's GSTIN and payment terms. An invoice supports **multiple line items** (item, quantity, rate, line total) with a document total, drawn from the business's item master.

### GRNs (purchases)
The warehouse clerk records goods received against a supplier. The **Supplier** field is a picker that fills the supplier's GSTIN. A GRN supports **multiple line items**.

- **Direct purchases** — catalogued parts that go into what the business sells (steel, fasteners, etc.), picked from the item master.
- **Indirect purchases** — consumables, MRO and other running expenses that aren't a catalogued part. The user types a free-text description (e.g. "machine coolant"), so they aren't limited by a fixed list. Indirect purchases record and behave like any purchase; their payment behaviour feeds the score, but they do not affect trade volume (trade volume measures sales, not overhead).

### Master data
Each business has its own **suppliers, buyers and items**. Suppliers and buyers carry a name, GSTIN, category/city and payment terms; items carry a code, unit, price, HSN and GST rate. The **Owner** can add and edit their own masters, so they don't have to go through the backend team for every new supplier or buyer.

### The ledger
Every invoice and GRN builds an immutable, timestamped **trade ledger** showing date, type (sale/purchase), party, amount, verification status and payment status. This is the raw material the score is built from.

---

## 5. Making it trustworthy — verification

Self-entered data is worthless to a lender, because the person entering it wants a loan. So a record only becomes trustworthy when corroborated by a source **the business doesn't control**. There are two things being verified:

### The transaction is real
A recorded invoice or purchase moves from **Unverified** to **Verified** when matched against an outside source:
- **GST e-invoice** — the invoice was reported to the GST network.
- **Bank inflow/outflow (Account Aggregator)** — the money movement is visible in the bank statement.
- **Buyer/supplier confirmation** — the counterparty acknowledges it.

Any one of these flips a record to Verified. This feeds the *verified-transactions* score parameter.

### The payment actually happened, on time
This uses the **stricter, bank-confirmed-only** rule. A payment counts toward on-time behaviour only when a real bank credit/debit is matched to the invoice via Account Aggregator. A self-reported "yes, I paid" is recorded but **does not count** toward the score.

Because payments aren't tagged to invoices, matching applies by amount and counterparty, oldest-invoice-first (FIFO) when a lump payment is ambiguous, and resolves ties conservatively (assume the reading that makes the business look worse, never better).

In the prototype all of this is simulated, but the logic already enforces the distinction: self-reported data never counts as verified.

---

## 6. The score — credit readiness

The score turns verified trade into a single readiness view. It is computed live from the ledger (one shared model, used by the readiness card, the backend breakdown, the report and the loan options).

### The four parameters
| Parameter | Weight | What it measures |
|---|---|---|
| On-time payment % | 35% | Of bank-confirmed paid records, the share paid on or before the due date. Self-reported payments excluded. |
| Verified transactions % | 25% | Share of records externally corroborated. |
| Trade volume | 20% | Sales value over ~3 months, averaged monthly (₹50L/month = full marks). Measures scale. Sales only — purchases don't feed it. |
| Buyer diversification | 20% | 100 minus the largest buyer's share of sales. Rewards not depending on one customer. |

Each parameter becomes a 0–100 sub-score; the weighted sum is the readiness score. **Bands:** Strong (≥75), Improving (≥50), Needs Attention (below 50).

### Where the number shows and where it doesn't
- The in-app **readiness card** shows the **band only** (Strong / Improving / Needs Attention), never a number, to keep the everyday surface non-judgmental.
- The **owner's downloadable report** and the **backend breakdown** show the full number and the parameter-by-parameter contribution — this is transparency to the owner about their own business, not a lender-facing decision.
- VyaparMitra never presents a number to a lender as an underwriting decision. The lender assesses; we present readiness.

### Editable weights (backend)
The backend team can change the four weights and the two band thresholds. Every business re-scores live, with a check that weights total 100%. This lets the model be tuned and stress-tested (e.g. weight verification higher and watch an unverified business's score fall).

---

## 7. Acting on the profile — owner actions

Once a business has a readiness profile, the owner can:
- **Download report** — a clean, on-brand credit-readiness report (identity, score, band, parameter breakdown, verified-trade summary) as a printable/PDF document.
- **Share with lender** — a consent-gated share ("your trade record stays yours…") that sends the read-only profile to the lending partner, who returns a decision (approve / make an offer / decline) that the owner then sees.
- **See loan options** — indicative working-capital options that scale with the readiness band, clearly labelled *indicative only — final terms are set by the lender, not VyaparMitra*. Nothing here is a firm quote or an approval.

A **receivables and payables view / worklist** surfaces what the business is owed and owes, so the finance user has a recurring reason to open the tool between borrowing cycles.

---

## 8. The backend console (VyaparMitra's team)

Signed in as Admin, the backend team gets global access with these views:
- **Select a customer** — search and open any business to see its suppliers, items, buyers, ledger and readiness, with a filter for scale.
- **Global data** — all businesses side by side, each with its score breakdown, plus the editable **score-model settings** (weights and thresholds).
- **Retention** — a cohort table (and trend) showing, per activation month, how many businesses keep recording over the following months. Clearly labelled *simulated / directional*, since a small prototype has no real retention.
- **Audit log** — every action across all businesses.
- **Reset demo data** — restores the seeded businesses and records to a clean state for a fresh demo.

---

## 9. What VyaparMitra deliberately does NOT do (non-goals)

These boundaries are strategy, not gaps. They keep the product a light, fundable data layer instead of drifting into a lender, a credit bureau, or an accounting tool.

- **We do not lend or disburse money.** No balance-sheet risk, no banking licence needed.
- **We do not issue an underwriting score to lenders.** We present readiness; the lender decides. (Issuing an owned credit score risks being regulated as a credit bureau.)
- **We are not accounting or GST-filing software, and we do not track inventory.** Capture serves the credit signal, not book-keeping. (An inventory module was considered and dropped as scope creep.)
- **We do not do treasury / payment-terms advisory** in this build.
- **We do not push debt.** The product builds financial credibility; language is "Check Credit Eligibility," never "Get Instant Loan."

---

## 10. Data protection and ethics

- **DPDP:** consent per purpose, data minimisation, purpose limitation (recording consent is separate from lender-sharing consent), defined retention.
- **RBI:** payment data would be stored only in India.
- **Owner-controlled sharing:** a profile reaches a lender only on the owner's explicit consent.
- **Conservative by design:** unverified and self-reported data never inflate the score. The model would rather understate a business's creditworthiness than overstate it, because overstating hurts both the business and the lender.

*(In the prototype, all data is fictitious — invented businesses and GSTINs — so nothing above involves real personal or financial data.)*

---

*Prototype: vyaparmitra-prototype.vercel.app · Developed by Group A1.*
