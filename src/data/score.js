// One implementation of the readiness model, shared by the MSME card and the backend
// console so the two can never drift. The parameter definitions come from scoreModel
// in vyaparmitra-seed-records.json and are followed literally:
//
//   onTimePaymentPct             paid-on-time / BANK-CONFIRMED paid records.
//                                Deliberately narrower than the definition string in the
//                                seed file: a self-reported receipt is excluded from both
//                                sides of this ratio, matching the verification thesis.
//   verifiedTxnsPct              verified / all records
//   tradeVolumeLakhPerMonth      sales value / 3 months, in lakh
//   largestBuyerConcentrationPct largest buyer share of sales value
//                                (diversification sub-score = 100 - this)
import { scoreModel } from './database.js';
import { PAYMENT_PROOF_CONFIRMED } from '../context/AppStateContext.jsx';

/** The window the seeded ledger covers; the model quotes volume per month over it. */
const VOLUME_MONTHS = 3;

export const PARAMETERS = [
  {
    key: 'onTimePayment',
    label: 'On-time payment %',
    definition: 'paid-on-time / bank-confirmed paid records; self-reported receipts excluded',
  },
  { key: 'verifiedTxns', label: 'Verified transactions %', definition: scoreModel.parameters.verifiedTxnsPct },
  { key: 'tradeVolume', label: 'Monthly trade volume', definition: scoreModel.parameters.tradeVolumeLakhPerMonth },
  {
    key: 'buyerDiversification',
    label: 'Largest-buyer concentration',
    definition: scoreModel.parameters.largestBuyerConcentrationPct,
  },
];

function sumAmounts(records) {
  return records.reduce((total, record) => total + (Number(record.amount) || 0), 0);
}

/** The four raw parameters, measured off one tenant's records. */
export function measureTenant(records) {
  const sales = records.filter((record) => record.type === 'Sale');
  const salesValue = sumAmounts(sales);
  // Only a bank-confirmed settlement counts either way: a self-reported receipt can
  // neither lift nor drag the on-time ratio.
  const paid = records.filter(
    (record) => record.paymentStatus === 'Paid' && record.paymentProof === PAYMENT_PROOF_CONFIRMED
  );

  const byBuyer = new Map();
  sales.forEach((record) => {
    byBuyer.set(record.party, (byBuyer.get(record.party) || 0) + (Number(record.amount) || 0));
  });

  return {
    recordCount: records.length,
    confirmedCount: paid.length,
    selfReportedCount: records.filter(
      (record) => record.paymentStatus === 'Paid' && record.paymentProof !== PAYMENT_PROOF_CONFIRMED
    ).length,
    onTimePct: paid.length
      ? (paid.filter((record) => record.paidOnTime === true).length / paid.length) * 100
      : null,
    verifiedPct: records.length
      ? (records.filter((record) => record.status === 'Verified').length / records.length) * 100
      : null,
    tradeVolumeLakh: salesValue / VOLUME_MONTHS / 100000,
    concentrationPct: salesValue ? (Math.max(...byBuyer.values()) / salesValue) * 100 : null,
  };
}

/**
 * Applies the weights to those parameters. Weights and thresholds are passed in so the
 * backend can re-score live while the MSME card uses the JSON defaults.
 */
export function scoreTenant(
  records,
  weights = scoreModel.weights,
  thresholds = { strong: scoreModel.strongThreshold, improving: scoreModel.improvingThreshold },
  volumeTargetLakh = scoreModel.volumeTargetLakh
) {
  const measured = measureTenant(records);

  const subScores = {
    onTimePayment: measured.onTimePct ?? 0,
    verifiedTxns: measured.verifiedPct ?? 0,
    tradeVolume: Math.min(100, (measured.tradeVolumeLakh / volumeTargetLakh) * 100),
    buyerDiversification: measured.concentrationPct === null ? 0 : 100 - measured.concentrationPct,
  };

  const values = {
    onTimePayment:
      measured.onTimePct === null
        ? 'No bank-confirmed payments'
        : `${Math.round(measured.onTimePct)}%`,
    verifiedTxns: measured.verifiedPct === null ? 'No records' : `${Math.round(measured.verifiedPct)}%`,
    tradeVolume: `₹${measured.tradeVolumeLakh.toFixed(1)}L / month`,
    buyerDiversification:
      measured.concentrationPct === null ? 'No sales' : `${Math.round(measured.concentrationPct)}%`,
  };

  const rows = PARAMETERS.map((parameter) => ({
    ...parameter,
    value: values[parameter.key],
    weight: weights[parameter.key],
    subScore: subScores[parameter.key],
    contribution: subScores[parameter.key] * weights[parameter.key],
  }));

  const weighted = rows.reduce((total, row) => total + row.contribution, 0);
  const band =
    weighted >= thresholds.strong
      ? 'Strong'
      : weighted >= thresholds.improving
        ? 'Improving'
        : 'Needs Attention';

  return { measured, rows, weighted, band };
}
