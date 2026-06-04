# IS Engine — Corporate Income Tax (Impôt sur les Sociétés)

## Purpose

Calculates Corporate Income Tax for companies under Moroccan CGI 2026, including tax adjustments, rate application, minimum contribution, quarterly installments, and loss carry-forward.

## Algorithm — Step by Step

### Step 1: Compute Net Accounting Profit (RN)

```
RN = Total Revenue (Produits) - Total Expenses (Charges)
```

From the client's P&L statement.

### Step 2: Apply Tax Adjustments → Net Taxable Profit (RNI)

```
Réintégrations (Add-backs):
  + Non-deductible provisions
  + Passenger vehicle depreciation excess (>400,000 MAD TTC)
  + Fines, penalties, tax penalties
  + CIT itself (not deductible)
  + Entertainment expenses > deductible portion
  + Gifts > deductible limits
  + Exaggerated / unjustified expenses
  + Depreciation not conforming to CGI rates
  + Non-deductible taxes

Déductions (Deductions):
  - Tax-exempt income (dividends from subsidiaries, if 100% exemption)
  - Provisions released that were previously deducted
  - Depreciation previously disallowed (now allowed)
  - Tax credits
  - Investment premiums
```

### Step 3: Determine IS Rate

```typescript
function getISRate(profit: number, companyType: CompanyType): number {
  if (companyType === 'CREDIT_INSTITUTION' ||
      companyType === 'INSURANCE' ||
      companyType === 'BANK_AL_MAGHRIB' ||
      companyType === 'CDG') {
    return 0.40;  // Art. 19-I-C
  }

  if (companyType === 'CFC' || companyType === 'IAZ') {
    return 0.20;  // Art. 19-I-A (regardless of profit)
  }

  if (hasInvestmentAgreement(companyType) && getInvestmentAmount() >= 1_500_000_000) {
    return 0.20;  // Art. 19-I-A exception
  }

  if (profit >= 100_000_000) {
    return 0.35;  // Art. 19-I-B
  }

  return 0.20;  // Art. 19-I-A (default)
}
```

### Step 4: Compute Gross IS

```
Gross IS = RNI × Rate
```

### Step 5: Apply Foreign Tax Credit (if applicable)

```
Gross IS = max(0, Gross IS - ForeignTaxCredit)
```

### Step 6: Compute Minimum Contribution (MC)

```
MC Base = Operating Revenue + Financial Income + Subsidies Received

if (monthsSinceStartup <= 36) {
  MC = 0  // First 36 months exemption
} else {
  let mcRate = 0.0025;  // 0.25% default
  if (isReducedRateProduct(client)) {
    mcRate = 0.0015;  // 0.15% for petroleum, gas, butter, etc.
  }
  MC = max(MC_Base × mcRate, 3000)  // min 3,000 MAD
}
```

### Step 7: IS Due

```
IS_Due = max(Gross_IS, MC)
```

### Step 8: Apply Loss Carry-Forward

```typescript
interface LossCarryForward {
  fiscalYear: number;
  ordinaryLossAmount: number;     // carry-forward 4 years
  depreciationLossAmount: number; // unlimited carry-forward
}

function applyLossCarryForward(fiscalYear: number, profits: number, losses: LossCarryForward[]): number {
  let remaining = profits;

  // First apply oldest losses (FIFO)
  const sorted = losses.filter(l => l.fiscalYear < fiscalYear)
                       .sort((a, b) => a.fiscalYear - b.fiscalYear);

  for (const loss of sorted) {
    const yearsElapsed = fiscalYear - loss.fiscalYear;

    // Ordinary loss: max 4 years
    if (loss.ordinaryLossAmount > 0 && yearsElapsed <= 4) {
      const used = Math.min(remaining, loss.ordinaryLossAmount);
      remaining -= used;
    }

    // Depreciation loss: unlimited carry-forward
    if (loss.depreciationLossAmount > 0) {
      const used = Math.min(remaining, loss.depreciationLossAmount);
      remaining -= used;
    }

    if (remaining <= 0) break;
  }

  return max(0, remaining);
}
```

### Step 9: Net IS Payable

```
Net_IS_Payable = max(0, IS_Due - LossCarryForwardApplied)
```

### Step 10: Quarterly Installments

```
Quarterly_Amount = Net_IS_Payable / 4

Schedule:
  Installment 1: due end of M3 (e.g., March 31)
  Installment 2: due end of M6 (e.g., June 30)
  Installment 3: due end of M9 (e.g., September 30)
  Installment 4: due end of M12 (e.g., December 31)
```

Transitional rule (2023-2026): installments based on current-year rate, not prior-year rate.

### Step 11: Annual Reconciliation

```
Prior-Year Overpayment = Σ Installments - Actual IS Due
  if positive → credit for next year (offset within 3 years)
  if negative → balance to pay with annual return
```

## Engine Interface

```typescript
interface ISCalculationInput {
  fiscalYear: number;
  companyType: CompanyType;
  totalRevenue: number;
  financialIncome: number;
  subsidies: number;
  netAccountingProfit: number;
  reintegrations: TaxAdjustment[];
  deductions: TaxAdjustment[];
  priorYearLosses: LossCarryForward[];
  priorYearMCExcess: number;
  foreignTaxCredits: number;
  operatingMonths: number;  // for MC exemption
}

interface ISCalculationResult {
  grossIS: number;
  rateApplied: number;
  minimumContribution: number;
  isDueBeforeLossCF: number;
  lossCarryForwardApplied: number;
  remainingLossesAfter: LossCarryForward[];
  netISPayable: number;
  quarterlyInstallments: QuarterlyInstallment[];
  mcExcessCarryForward: number;
}
```

## Special Cases

| Case | Handling |
|------|----------|
| Deficit year | IS = 0, pay MC only (if applicable), loss available for carry-forward |
| Startup (≤ 36 months) | MC exempt, IS on profits only |
| CFC/IAZ companies | 20% flat rate post 5-year exemption |
| Investment agreement ≥ 1.5B MAD | 20% rate locked in regardless of profit |
| Group companies | Parent-subsidiary dividend exemption (100%) |
| IPO companies | Tax reduction available (Art. 19-IV) |
| Industrial companies | Standard rates apply (no separate regime post-2026) |
```
