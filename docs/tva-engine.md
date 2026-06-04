# TVA Engine — Value Added Tax (Taxe sur la Valeur Ajoutée)

## Purpose

Calculates VAT payable/refundable for businesses under Moroccan CGI 2026 post-reform rules. Handles rate classification, deduction rights, filing regimes, and auto-liquidation.

## Algorithm — Step by Step

### Step 1: Classify Transactions by VAT Rate

Each transaction (sale or purchase) is classified into:

| Rate | Code | Deduction Right | Examples |
|------|------|----------------|----------|
| 20% | STANDARD | Full | General goods/services, electricity, domestic air/sea, non-urban freight |
| 10% | REDUCED_ADD | Full (ADD) | Banking, hotels, restaurants, urban transport, road freight, sugar, oil, rice, long pasta |
| 10% | REDUCED_SDD | None (SDD) | Insurance brokers, direct marketers |
| 0% | EXPORT_ADD | Full (ADD) | Exports, international transport |
| Exempt | EXEMPT_SDD | None (SDD) | Bread, couscous, semolina, domestic water, essential meds, books, short pasta (2026), fertilizing materials (2026) |

### Step 2: Compute VAT Collected (TVA Collectée)

```typescript
function computeVATCollected(sales: Transaction[]): VATByRate {
  const collected = new VATByRate();

  for (const sale of sales) {
    switch (sale.rateCode) {
      case 'STANDARD':
        collected.standard += sale.htAmount * 0.20;
        break;
      case 'REDUCED_ADD':
      case 'REDUCED_SDD':
        collected.reduced += sale.htAmount * 0.10;
        break;
      case 'EXPORT_ADD':
      case 'EXEMPT_SDD':
        // No VAT collected
        break;
    }
  }

  return collected;
}
```

### Step 3: Compute VAT Deductible (TVA Déductible)

```typescript
function computeVATDeductible(purchases: Transaction[]): number {
  let totalDeductible = 0;

  for (const purchase of purchases) {
    // Only ADD (with deduction right) transactions are deductible
    if (purchase.rateCode === 'STANDARD') {
      totalDeductible += purchase.htAmount * 0.20;
    } else if (purchase.rateCode === 'REDUCED_ADD') {
      totalDeductible += purchase.htAmount * 0.10;
    }
    // REDUCED_SDD, EXPORT_ADD (already 0), EXEMPT_SDD → no input deduction
  }

  return totalDeductible;
}
```

### Step 4: Deduction Right Matrix

| Input Type | Deductible? | Notes |
|-----------|-------------|-------|
| Goods for resale | Yes | Full |
| Raw materials | Yes | Full |
| Operating expenses (taxable output) | Yes | Full |
| Fixed assets (used for taxable ops) | Yes | Full |
| Passenger vehicles | Partial | Personal use portion non-deductible |
| Entertainment & hospitality | Capped | Partial |
| Mixed-use goods/services | Pro-rata | Based on taxable/total turnover |
| Exempt output (SDD) inputs | No | No deduction |
| Export inputs | Yes | Full (refundable) |

### Step 5: Net VAT

```
Net_VAT = Total_VAT_Collected - Total_VAT_Deductible

if Net_VAT > 0 → Payable to DGI
if Net_VAT < 0 → Credit (carry-forward or refund for exporters)
```

### Step 6: Apply Auto-Liquidation (2026)

```typescript
interface AutoLiquidationTransaction {
  supplier: string;
  invoiceRef: string;
  ty: 'INDUSTRIAL_WASTE' | 'SCRAP_METAL' | 'RECOVERY_MATERIALS';
  htAmount: number;
}

function applyAutoLiquidation(
  collected: number,
  purchases: AutoLiquidationTransaction[]
): number {
  for (const t of purchases) {
    // Buyer self-assesses VAT at standard rate
    const selfAssessedVAT = t.htAmount * 0.20;
    // Buyer simultaneously deducts the same amount
    // Net effect: DGI captures VAT without cash flow impact
    // collected stays unchanged (supplier didn't charge VAT)
  }
  return collected;
}
```

### Step 7: Filing Regime Determination

```typescript
function getFilingRegime(priorYearCA: number): FilingRegime {
  if (priorYearCA > 1_000_000) {
    return { frequency: 'MONTHLY', deadline: '20th of following month' };
  } else if (priorYearCA > 500_000) {
    return { frequency: 'QUARTERLY', deadline: '20th of month after quarter' };
  } else {
    return { frequency: 'NONE', deadline: null }; // Below threshold, not subject
  }
}
```

## Engine Interface

```typescript
interface TVACalculationInput {
  fiscalYear: number;
  period: { type: 'MONTHLY' | 'QUARTERLY'; number: number }; // e.g., 1-12 or 1-4
  sales: Transaction[];
  purchases: Transaction[];
  autoLiquidationTransactions?: AutoLiquidationTransaction[];
  priorCredit: number; // VAT credit carried from prior period
}

interface TVACalculationResult {
  vatCollected: {
    standard: number;  // 20%
    reduced: number;   // 10%
    total: number;
  };
  vatDeductible: number;
  netVAT: number;
  vatPayable: number;  // if netVAT > 0
  vatCredit: number;   // if netVAT < 0 (absolute value)
  effectiveDate: Date;
  deadline: Date;
  isAutoLiquidationApplied: boolean;
}
```

## Rate Transition History (for reference)

| Year | Standard | Intermediate | Reduced | Super-Reduced |
|------|----------|-------------|---------|---------------|
| 2023 (pre-reform) | 20% | 14% | 10% | 7% |
| 2024 | 20% | 13% (↓) | 10% | 7% |
| 2025 | 20% | 12% (↓) | 10% | 7% → 0% (phased out) |
| **2026 (post-reform)** | **20%** | **—** | **10%** | **—** |
```
