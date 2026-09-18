# VyaparMitra Frontend Prototype

> **Business Together for a Brighter Tomorrow**

A frontend-only prototype for **VyaparMitra**, a financial platform tailored for traditional Indian MSMEs. Built around the core principle: *"Modern Bahi Khata meets modern fintech"* and *"Enter information once. Use it everywhere."*

## 🎯 Core Product Logic

```
SALE ──► INVOICE ──► BUSINESS RECORD ──► CREDITWORTHINESS
```

- **Record Once**: Day-to-day trade entries (Invoices & Goods Received Notes).
- **Automated Ledger**: Maintains an immutable, verifiable trading history.
- **Financial Credibility**: Demonstrates trading consistency without real loan scoring claims or NBFC eligibility implications in this prototype.

---

## 🎨 Visual Identity & Brand

- **Primary Navy**: `#123B78`
- **Blue**: `#1265A8`
- **Teal**: `#10B8A5`
- **Light Mint**: `#E8F7F3`
- **Dark Text**: `#172033`
- **Secondary Text**: `#526174`
- **Background**: `#F6F9FB`
- **Typography**: Plus Jakarta Sans (Formal Corporate & Financial) & Inter

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run

```bash
# Install dependencies
npm install

# Start local dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📁 Key Components

- `src/components/Sidebar.jsx`: 3 primary navigation items (Create Invoice, Create GRN, Dashboard) and business profile.
- `src/components/CreditworthinessCard.jsx`: Hero card displaying `● HEALTHY` indicator and prototype disclaimer.
- `src/components/ActionCards.jsx`: Entry point action cards.
- `src/components/BusinessFlowVisual.jsx`: Interactive visual flow pipeline.
- `src/components/BusinessSnapshot.jsx`: Key metrics (₹12.4L Sales, ₹2.8L Receivables, ₹7.1L Purchases, 48 Invoices).
- `src/components/RecentActivityTable.jsx`: Static mock MSME ledger activity.
- `src/components/InvoicePage.jsx` & `GRNPage.jsx`: Disabled visual form layouts.
- `src/components/ComingSoonModal.jsx`: Unified prototype dialog on action triggers.
