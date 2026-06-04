# Penalties & Late Payment Rules — Article 208 CGI

## Purpose

Calculates penalties, late payment interest, and other sanctions for non-compliance with Moroccan tax obligations. Integrated so accountants can estimate the cost of delays and prioritize compliance.

## Late Filing Penalties (Défaut de Déclaration)

| Delay | Penalty | Legal Basis |
|-------|---------|-------------|
| ≤ 30 days late | 5% of tax due | Art. 186, 208 |
| > 30 days late | 15% of tax due | Art. 186, 208 |
| Automatic taxation (no filing at all) | 20% of tax due | Art. 186 |
| Corrective return (filed voluntarily) | 5% of additional tax | Art. 186 |

## Late Payment Penalties (Défaut de Paiement)

| Scenario | Penalty + Interest | Legal Basis |
|----------|-------------------|-------------|
| Payment within 30 days of deadline | 5% penalty | Art. 208-I |
| Payment > 30 days after deadline | 10% penalty + 5% for first month + 0.5%/month | Art. 208-I |
| VAT or WHT non-payment / late payment | 20% penalty (instead of standard rates) | Art. 208-I |
| Payment after tax assessment (rôle) | 0.5%/month from issuance date | Art. 208-I |
| Minimum penalty for registration fees | 100 MAD | Art. 208-II |

### Detailed Interest Calculation

```typescript
function calculateLatePaymentPenalty(
  taxAmount: number,
  dueDate: Date,
  paymentDate: Date,
  taxType: 'STANDARD' | 'VAT_OR_WHT',
): PenaltyCalculation {
  const daysLate = differenceInDays(paymentDate, dueDate);
  let totalPenalty = 0;

  if (daysLate <= 30) {
    // Within 30 days grace
    if (taxType === 'VAT_OR_WHT') {
      totalPenalty = taxAmount * 0.05; // 5% penalty
    } else {
      totalPenalty = taxAmount * 0.05; // 5% penalty
    }
  } else {
    // Beyond 30 days
    if (taxType === 'VAT_OR_WHT') {
      totalPenalty = taxAmount * 0.20; // 20% fixed penalty for VAT/WHT
    } else {
      totalPenalty = taxAmount * 0.10; // 10% penalty
    }

    // First month interest: 5%
    totalPenalty += taxAmount * 0.05;

    // Subsequent months: 0.5% per month
    const monthsLate = Math.ceil(daysLate / 30) - 1;
    if (monthsLate > 0) {
      totalPenalty += taxAmount * 0.005 * monthsLate;
    }
  }

  return {
    penaltyRate: totalPenalty / taxAmount,
    penaltyAmount: Math.round(totalPenalty * 100) / 100,
    breakdown: {
      basePenalty: taxAmount * 0.10,
      firstMonthInterest: taxAmount * 0.05,
      subsequentMonthsInterest: taxAmount * 0.005 * Math.max(0, Math.ceil(daysLate / 30) - 1),
      vatWhtSurcharge: taxType === 'VAT_OR_WHT' ? taxAmount * 0.10 : 0,
    },
  };
}
```

## Penalty Caps & Minimums

| Item | Value |
|------|-------|
| Minimum penalty (registration fees) | 100 MAD |
| Minimum penalty (vehicle tax) | 100 MAD |
| Maximum penalty period | 12 months (after that, no additional monthly interest if taxpayer has filed a formal appeal) |

## IR-Specific Penalties

| Violation | Penalty |
|-----------|---------|
| Late filing of annual IR declaration | 15% (min 500 MAD) |
| Late filing > 6 months | 30% (doubled) |
| Non-filing of rental income | Up to 20% of tax due |
| Non-declaration of foreign-source income | 15% + interest |

## TVA-Specific Penalties

| Violation | Penalty |
|-----------|---------|
| Late TVA payment | 20% (Art. 208-I) |
| Non-submission of TVA declaration | 20% of TVA due |
| Incorrect rate application | Back-tax + 10-20% penalty |
| Failure to self-invoice (auto-liquidation) | 20% of amount |

## Penalty Engine Interface

```typescript
interface PenaltyInput {
  taxType: 'IS' | 'IR' | 'TVA' | 'WHT' | 'REGISTRATION' | 'VEHICLE_TAX';
  declarationType: 'ANNUAL' | 'MONTHLY' | 'QUARTERLY' | 'ONE_TIME';
  taxAmount: number;
  dueDate: Date;
  paymentDate?: Date; // null if unpaid
  filingDate?: Date; // null if not filed
  correctionType?: 'VOLUNTARY' | 'AUDIT' | 'NONE';
}

interface PenaltyCalculation {
  totalPenalty: number;
  totalInterest: number;
  grandTotal: number; // penalty + interest
  breakdown: {
    lateFilingPenalty: number;
    latePaymentPenalty: number;
    latePaymentInterest: number;
    vatWhtSurcharge: number;
    correctionPenalty: number;
  };
  applicableArticles: string[]; // e.g., ['Art. 186', 'Art. 208']
  minimumAmountApplied: number;
}

function calculatePenalties(input: PenaltyInput): PenaltyCalculation {
  let lateFiling = 0;
  let latePayment = 0;
  let interest = 0;
  let vatSurcharge = 0;

  // Late filing
  if (input.filingDate && input.filingDate > input.dueDate) {
    const daysLate = differenceInDays(input.filingDate, input.dueDate);
    if (daysLate <= 30) {
      lateFiling = input.taxAmount * 0.05;
    } else {
      lateFiling = input.taxAmount * 0.15;
    }
  }

  // Late payment
  if (input.paymentDate && input.paymentDate > input.dueDate) {
    const daysLate = differenceInDays(input.paymentDate, input.dueDate);

    if (input.taxType === 'TVA' || input.taxType === 'WHT') {
      // 20% penalty for VAT/WHT
      latePayment = input.taxAmount * 0.20;
    } else if (daysLate <= 30) {
      latePayment = input.taxAmount * 0.05;
    } else {
      latePayment = input.taxAmount * 0.10;
      // 5% first month + 0.5%/month
      interest = input.taxAmount * 0.05;
      const monthsLate = Math.ceil(daysLate / 30) - 1;
      if (monthsLate > 0) {
        interest += input.taxAmount * 0.005 * monthsLate;
      }
    }
  }

  // Apply minimums
  const total = lateFiling + latePayment + interest + vatSurcharge;
  let minimum = 0;
  if (input.taxType === 'REGISTRATION' || input.taxType === 'VEHICLE_TAX') {
    minimum = 100;
  } else if (input.taxType === 'IR' && input.declarationType === 'ANNUAL') {
    minimum = 500;
  }

  return {
    totalPenalty: lateFiling + latePayment + vatSurcharge,
    totalInterest: interest,
    grandTotal: Math.max(total, minimum),
    breakdown: { lateFilingPenalty: lateFiling, latePaymentPenalty: latePayment, latePaymentInterest: interest, vatWhtSurcharge: vatSurcharge, correctionPenalty: 0 },
    applicableArticles: ['Art. 186', 'Art. 208'],
    minimumAmountApplied: minimum,
  };
}
```

## Key Compliance Reminders

| Rule | Detail |
|------|--------|
| IR filing deadline | April 30, 2026 (for 2025 income) |
| Rental income filing | March 31, 2026 |
| Real estate capital gains | Within 30 days of deed |
| TVA monthly | 20th of following month |
| TVA quarterly | 20th of month after quarter |
| IS quarterly installments | End of M3, M6, M9, M12 |
| IS annual return | Within 90 days of fiscal year end |
| Minimum penalty for IR | 500 MAD |
| Appeal effect | Interest stops accruing after 12 months if appeal filed |
```
