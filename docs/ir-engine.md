# IR Engine — Individual Income Tax (Impôt sur le Revenu)

## Purpose

Calculates Individual Income Tax for natural persons under Moroccan CGI 2026. Handles all 6 income categories, the progressive scale, withholding tax credits, and family charge reductions.

## Algorithm — Step by Step

### Step 1: Collect Income by Category (Art. 36)

#### Category 1 — Salaires (Salaries)

```
Taxable Salary = Annual Gross Salary
  - CNSS employee share
  - AMO contribution
  - CIMR (pension fund) contribution
  - Professional expense deduction (20% fixed, capped at 30,000 MAD)
  - Group insurance premiums (capped)
```

#### Category 2 — Revenus Professionnels (Professional)

```
Regime RNR (CA > 2M MAD):
  Net = Actual Revenue - Actual Deductible Expenses

Regime RNS (CA 500K - 2M MAD):
  Net = Revenue × (1 - Fixed Deduction %)

Regime CPU (Liberal Professions):
  Net = Revenue × (1 - Fixed Deduction %) per profession category
```

#### Category 3 — Revenus Agricoles (Agricultural)

```
Net = Revenue - Actual Expenses (or flat-rate regime)
```

#### Category 4 — Revenus Fonciers (Real Estate) (Art. 57)

```
Gross Rental Income (annual)
  - 40% abatement (for maintenance, depreciation, management)
  = Net Rental Income

WHT Applied:
  < 120,000 MAD/year → 10% (non-final)
  ≥ 120,000 MAD/year → 15% (non-final)

Note: WHT is non-final. Rental income must be included in global IR.
```

#### Category 5 — Revenus des Capitaux Mobiliers (Movable Capital)

| Sub-type | WHT Rate | Nature | Include in Global IR? |
|----------|----------|--------|----------------------|
| Dividends (Moroccan) | 10% | Final | No |
| Interest (non-professional) | 30% | Final | No |
| Interest (professional) | 20% | Creditable | Yes |
| Foreign-source dividends | 15% | Declarable | Yes (credit for foreign tax) |
| Foreign-source interest | 15% | Declarable | Yes (credit for foreign tax) |

#### Category 6 — Plus-values (Capital Gains)

```
Listed Shares:
  Gain = Sale Price - Acquisition Price - Brokerage Fees
  Tax = Gain × 15%
  Flat rate, not included in global IR

Unlisted Shares:
  Gain = Sale Price - Acquisition Price - Brokerage Fees  
  Tax = Gain × 20%
  Flat rate, not included in global IR

Real Estate:
  Gain = Sale Price - Acquisition Price - Improvement Costs - Time-based Abatement
  Tax = max(Gain × 20%, Sale Price × 3%)
  Flat rate, declared within 30 days
```

### Step 2: Compute Global Net Taxable Income

```
Global Net Taxable Income =
  Cat1_Net + Cat2_Net + Cat3_Net + Cat4_Net
  + (Cat5_Declarable items) + (Cat6_if_global)

Items with Final WHT are excluded (tax settled at source).
```

### Step 3: Apply Progressive Scale (Art. 73)

```typescript
function computeIR(netTaxableIncome: number): number {
  const BRACKETS = [
    { max: 30_000, rate: 0.00, deduction: 0 },
    { max: 50_000, rate: 0.10, deduction: 3_000 },
    { max: 60_000, rate: 0.20, deduction: 8_000 },
    { max: 80_000, rate: 0.30, deduction: 14_000 },
    { max: 180_000, rate: 0.34, deduction: 17_200 },
    { max: Infinity, rate: 0.38, deduction: 24_400 },
  ];

  for (const bracket of BRACKETS) {
    if (netTaxableIncome <= bracket.max) {
      return Math.round((netTaxableIncome * bracket.rate - bracket.deduction) * 100) / 100;
    }
  }

  return 0; // fallback
}
```

### Step 4: Apply Family Charge Reduction (Art. 74)

```typescript
function applyFamilyReduction(grossIR: number, dependents: number): number {
  const reductionPerDependent = getReductionAmount(); // per Finance Law
  return max(0, grossIR - dependents * reductionPerDependent);
}
```

### Step 5: Apply Withholding Tax Credits

```typescript
function applyTaxCredits(irAfterFamily: number, credits: WithholdingTaxCredit[]): number {
  let totalCredits = 0;
  for (const credit of credits) {
    totalCredits += credit.amount; // e.g., 20% creditable WHT on interest
  }
  return max(0, irAfterFamily - totalCredits);
}
```

### Step 6: Net IR Payable / Refund

```
If (Total Credits > IR After Family) → Refund due
If (Total Credits < IR After Family) → Balance payable
```

## Engine Interface

```typescript
interface IRCalculationInput {
  fiscalYear: number;
  taxpayerType: 'SINGLE' | 'MARRIED' | 'HEAD_OF_HOUSEHOLD';
  dependents: number;

  // Category 1: Salaries
  salaries: SalaryIncome[];

  // Category 2: Professional
  professionalIncome: ProfessionalIncome;

  // Category 3: Agricultural
  agriculturalIncome: AgriculturalIncome;

  // Category 4: Real Estate
  rentalIncome: RentalIncome[];

  // Category 5: Movable Capital
  movableCapitalIncome: MovableCapitalIncome[];

  // Category 6: Capital Gains
  capitalGains: CapitalGain[];
}

interface IRCalculationResult {
  incomeByCategory: {
    category: number;
    grossAmount: number;
    deductions: number;
    netAmount: number;
    withholdingTaxPaid: number;
    isFinalWithholding: boolean;
  }[];

  globalNetTaxableIncome: number;
  grossIR: number;
  familyReduction: number;
  irAfterFamily: number;
  taxCredits: number;

  totalWithholdingTaxes: number;
  netIRPayable: number;
  refundAmount: number;

  effectiveRate: number; // netIRPayable / globalNetTaxableIncome
}
```

## Special Cases

| Case | Handling |
|------|----------|
| Single-employer salaried | IR withheld at source; no annual declaration needed |
| Multi-employer | Must file annual global declaration (SIMPL-IR) |
| Auto-entrepreneur | Specific CPU regime; simplified rates |
| MRE (Moroccan living abroad) | Taxed only on Moroccan-source income |
| Real estate sale | Tax within 30 days of deed; min 3% of price |
| Foreign-source income | Included in global IR; foreign tax credit available |
| Complementary pension (CAMIR) | Exempt from IR (2026 reform) |
| Base pension | Exempt from IR (2026 reform — total exemption for all pensions) |
```
