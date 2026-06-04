# Active vs Passive Classification Engine

## Purpose

The classification engine tags every income stream and asset as **Active** or **Passive** based on the Moroccan CGI framework. This distinction is critical because:

- **IS**: Passive income (dividends, interest) may benefit from 100% exemption under parent-subsidiary regime; passive assets (investments) vs operating assets affect balance sheet ratios
- **IR**: Active income (salaries, professional) is subject to progressive scale (0-38%); Passive income (dividends 10% final, interest 30% final) is taxed at source at flat rates
- **Optimization**: Reclassifying income/asset types can yield significant tax savings

## Classification Rules

### Income Classification

| Income Type | Default | Reclassifiable To | Conditions for Reclassification |
|------------|---------|-------------------|-------------------------------|
| Salaries | Active | — | Always active |
| Professional fees (BNC) | Active | — | Always active |
| Commercial/Industrial profit (BIC) | Active | — | Always active |
| Agricultural revenue | Active | Passive | If land leased out without operation |
| Dividends | Passive | Active | Only if professional securities trader (Art. 39) |
| Interest (cash deposits) | Passive | Active | If part of working capital management (professional activity) |
| Rental income (residential) | Passive | Active | If professional landlord (>5 properties, or registered as profession) |
| Rental income (commercial) | Passive | Active | If professional landlord |
| Capital gains (securities) | Passive | Active | If >25% of working time spent on portfolio management |
| Capital gains (real estate) | Passive | Active | If real estate professional (Art. 41) |
| Royalties/IP income | Passive | Active | If core business activity |

### Asset Classification

| Asset Type | Default Active/Passive | VAT Treatment | Depreciation |
|-----------|----------------------|---------------|--------------|
| Factory building | Active | Full deduction | 4-5% straight-line |
| Office building (own use) | Active | Full deduction | 4-5% straight-line |
| Office building (rented out) | Passive | No deduction (if residential) | Not depreciable |
| Production machinery | Active | Full deduction | 10% SL or degressive |
| Company cars | Active (capped) | Capped deduction | 20-25% SL (cap 400K TTC) |
| IT equipment | Active | Full deduction | 20-25% SL |
| Portfolio shares (controlling) | Active | N/A | N/A |
| Portfolio shares (<10% stake) | Passive | N/A | N/A |
| Investment real estate | Passive | No deduction | Not depreciable |
| Land | Active (if business) / Passive (if investment) | No VAT | Not depreciable |
| Cash > operating needs | Passive | N/A | N/A |
| Patents/IP (used in business) | Active | Full deduction | Based on duration |
| Art/collectibles (investment) | Passive | No deduction | Not depreciable |
| Inventory/stock | Active | Full deduction | N/A |

## Classification Algorithm

```typescript
enum Classification {
  ACTIVE = 'ACTIVE',
  PASSIVE = 'PASSIVE',
  MIXED = 'MIXED',  // requires pro-rata splitting
}

interface ClassificationRule {
  incomeType: IncomeType;
  assetType?: AssetType;
  defaultClassification: Classification;
  reclassificationRules: ReclassificationRule[];
}

interface ReclassificationRule {
  trigger: string;
  conditions: Condition[];
  newClassification: Classification;
  requiredDocumentation: string[];
  auditRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

function classify(input: ClassificationInput): ClassificationResult {
  // Step 1: Apply default classification
  let result = getDefaultClassification(input);

  // Step 2: Check reclassification triggers
  for (const rule of getApplicableRules(input)) {
    if (evaluateConditions(rule.conditions, input)) {
      result = {
        classification: rule.newClassification,
        reasoning: rule.description,
        riskLevel: rule.auditRisk,
        documentationRequired: rule.requiredDocumentation,
      };
      break;  // First matching rule wins
    }
  }

  // Step 3: Generate audit trail
  return {
    ...result,
    supportingCalculations: generateSupportingCalc(input),
    cgiReferences: result.classification === 'ACTIVE'
      ? ['Art. 39', 'Art. 41']
      : ['Art. 73', 'Art. 57'],
  };
}
```

## Impact on Tax Calculations

### On IS (Corporate Income Tax)

| Classification | IS Treatment |
|---------------|-------------|
| Active income | Included in taxable profit at full progressive rate |
| Passive income (dividends from subsidiaries) | 100% exempt (parent-subsidiary regime) |
| Passive income (other) | Included in taxable profit |
| Active assets | Depreciable, VAT deductible |
| Passive assets | Not depreciable, no VAT deduction |

### On IR (Individual Income Tax)

| Classification | IR Treatment |
|---------------|-------------|
| Active income | Included in global income → progressive scale (0-38%) |
| Passive income (dividends) | 10% final WHT — not included in global IR |
| Passive income (interest, non-professional) | 30% final WHT — not included in global IR |
| Passive income (interest, professional) | 20% creditable WHT — included in global IR |
| Passive income (rental) | 10-15% WHT (non-final) — included in global IR with 40% abatement |
| Passive capital gains (securities) | 15-20% flat rate |
| Passive capital gains (real estate) | 20% flat (min 3% of price) |

### On Optimization

The classification engine feeds directly into the optimization module:
- "You have 60% passive assets — consider transferring to a holding structure"
- "Your rental income is classified as passive — would professional landlord status save tax?"
- "Your portfolio exceeds 25% of working time — reclassification as active may apply"
```
