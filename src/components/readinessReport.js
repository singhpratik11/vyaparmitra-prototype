// Client-side credit-readiness report. Opens a self-contained document in a new window
// and asks the browser to print it, so "Save as PDF" produces the file — no PDF library,
// no backend, and no print rules bolted onto the app's own stylesheet.
import { scoreTenant } from '../data/score.js';

const BRAND = {
  navy: '#123B78',
  blue: '#1265A8',
  teal: '#10B8A5',
  mint: '#E8F7F3',
  dark: '#172033',
  muted: '#526174',
  surface: '#F6F9FB',
  line: '#E2E8F0',
};

const amountFormatter = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

function formatAmount(amount) {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return `₹${amountFormatter.format(amount || 0)}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function today() {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, '0')} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"]/g, (character) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]
  );
}

function bandColour(band) {
  if (band === 'Strong') return '#047857';
  if (band === 'Improving') return BRAND.blue;
  return '#92400E';
}

/**
 * Builds and opens the report for one tenant.
 * @param {object} customer tenant record from the database
 * @param {Array} records that tenant's ledger
 */
export function openReadinessReport(customer, records) {
  const { measured, rows, weighted, band } = scoreTenant(records);

  const verified = records.filter((record) => record.status === 'Verified');
  const sales = records.filter((record) => record.type === 'Sale');
  const purchases = records.filter((record) => record.type === 'Purchase');
  const paid = records.filter((record) => record.paymentStatus === 'Paid');
  const bankConfirmed = paid.filter((record) => record.paymentProof === 'Bank-confirmed');
  const totalValue = records.reduce((total, record) => total + (Number(record.amount) || 0), 0);

  const parameterRows = rows
    .map(
      (row) => `
        <tr>
          <td>${escapeHtml(row.label)}</td>
          <td class="num">${escapeHtml(row.value)}</td>
          <td class="num">${Math.round(row.weight * 100)}%</td>
          <td class="num">${row.subScore.toFixed(1)}</td>
          <td class="num strong">${row.contribution.toFixed(1)}</td>
        </tr>`
    )
    .join('');

  const summaryRows = [
    ['Records on file', `${records.length}`],
    ['Verified records', `${verified.length} of ${records.length}`],
    ['Sales invoices', `${sales.length}`],
    ['Supplier receipts (GRN)', `${purchases.length}`],
    ['Total recorded trade', formatAmount(totalValue)],
    ['Settled payments', `${paid.length}`],
    ['Bank-confirmed settlements', `${bankConfirmed.length}`],
  ]
    .map(([label, value]) => `<tr><td>${label}</td><td class="num strong">${escapeHtml(value)}</td></tr>`)
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Credit Readiness Report — ${escapeHtml(customer?.name)}</title>
<style>
  @page { margin: 18mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 32px 36px; background: #fff; color: ${BRAND.dark};
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px; line-height: 1.5;
  }
  .brand { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: ${BRAND.blue}; }
  h1 { font-size: 26px; margin: 6px 0 2px; letter-spacing: -.01em; }
  .sub { color: ${BRAND.muted}; font-size: 12px; }
  .rule { height: 1px; background: ${BRAND.line}; margin: 20px 0; }
  .score-row { display: flex; align-items: center; justify-content: space-between; gap: 24px;
    background: ${BRAND.surface}; border: 1px solid ${BRAND.line}; border-radius: 14px; padding: 18px 20px; }
  .score-value { font-size: 34px; font-weight: 700; color: ${BRAND.navy}; line-height: 1; }
  .band { display: inline-block; padding: 4px 12px; border-radius: 999px; font-weight: 700; font-size: 12px;
    background: ${BRAND.mint}; color: ${bandColour(band)}; }
  h2 { font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    color: ${BRAND.muted}; margin: 24px 0 10px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; letter-spacing: .06em; text-transform: uppercase;
    color: ${BRAND.muted}; border-bottom: 1px solid ${BRAND.line}; padding: 8px 6px; }
  td { padding: 9px 6px; border-bottom: 1px solid #F1F5F9; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  td.strong { font-weight: 700; color: ${BRAND.navy}; }
  tr.total td { border-top: 2px solid ${BRAND.line}; border-bottom: none; font-weight: 700; padding-top: 12px; }
  .two { display: flex; gap: 28px; }
  .two > div { flex: 1; }
  .note { margin-top: 26px; padding: 12px 14px; border: 1px solid ${BRAND.line};
    border-radius: 10px; background: ${BRAND.surface}; color: ${BRAND.muted}; font-size: 11px; }
  .foot { margin-top: 18px; color: ${BRAND.muted}; font-size: 10px; display: flex; justify-content: space-between; }
</style>
</head>
<body>
  <div class="brand">VyaparMitra · Credit Readiness Report</div>
  <h1>${escapeHtml(customer?.name)}</h1>
  <div class="sub">
    GSTIN ${escapeHtml(customer?.gstin)} · Vendor ID ${escapeHtml(customer?.vendorId)} · Generated ${today()}
  </div>

  <div class="rule"></div>

  <div class="score-row">
    <div>
      <div class="sub">Weighted readiness score</div>
      <div class="score-value">${weighted.toFixed(1)}<span style="font-size:15px;color:${BRAND.muted}">/100</span></div>
    </div>
    <div style="text-align:right">
      <div class="sub" style="margin-bottom:6px">Readiness band</div>
      <span class="band">${escapeHtml(band)}</span>
    </div>
  </div>

  <h2>How the score is reached</h2>
  <table>
    <thead>
      <tr><th>Parameter</th><th style="text-align:right">Value</th><th style="text-align:right">Weight</th>
      <th style="text-align:right">Sub-score</th><th style="text-align:right">Contribution</th></tr>
    </thead>
    <tbody>
      ${parameterRows}
      <tr class="total"><td colspan="4">Weighted score</td><td class="num">${weighted.toFixed(1)}</td></tr>
    </tbody>
  </table>

  <div class="two">
    <div>
      <h2>Verified trade summary</h2>
      <table><tbody>${summaryRows}</tbody></table>
    </div>
    <div>
      <h2>What the band means</h2>
      <p class="sub" style="margin-top:0">
        The band reflects recorded trade only: whether invoices were settled on time, how much of the
        ledger carries verification, the value passing through, and how far the business depends on a
        single buyer. It is a presentation of the record, not a lending decision.
      </p>
      <p class="sub">
        Largest buyer currently accounts for
        ${measured.concentrationPct === null ? 'no recorded sales' : `${Math.round(measured.concentrationPct)}% of sales`}.
      </p>
    </div>
  </div>

  <div class="note">
    <strong>Prototype — simulated.</strong> Figures come from records kept in this prototype and from
    simulated verification. This is not a bank or NBFC credit score, and it is not an offer of credit.
    Final terms are set by a lending partner, not by VyaparMitra.
  </div>

  <div class="foot">
    <span>© ${new Date().getFullYear()} VyaparMitra Technologies · Prototype</span>
    <span>Business together for a brighter tomorrow</span>
  </div>
</body>
</html>`;

  const reportWindow = window.open('', '_blank', 'width=900,height=1100');
  if (!reportWindow) return false;

  reportWindow.document.write(html);
  reportWindow.document.close();
  reportWindow.focus();
  // Let the document lay out before the print dialog opens.
  reportWindow.setTimeout(() => reportWindow.print(), 400);
  return true;
}
