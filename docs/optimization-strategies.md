# Tax Optimization Module — Legal Strategies Under Moroccan CGI

## Purpose

The optimization engine identifies, ranks, and quantifies legal tax planning opportunities for Moroccan taxpayers. All strategies are within the CGI framework and include **compliance guardrails** to prevent abusive practices (Art. 172 — Abus de droit).

## Strategy Catalog

### S1 — Holding Company Structure

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 4-I (parent-subsidiary dividend exemption) |
| **Target** | Companies with excess cash generating passive income |
| **Mechanism** | Create a holding company → Dividends from subsidiaries 100% exempt from IS |
| **Savings** | IS 20-35% on dividend income that would otherwise be taxable |
| **Risk level** | LOW (expressly authorized) |
| **Requirements** | Hold ≥10% (or 150M MAD acquisition cost); provide attestation of share ownership |
| **Guardrails** | Must not be used solely for tax avoidance; substance required |

### S2 — CFC / IAZ Regime Selection

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 6-I, Art. 19-I-A |
| **Target** | Export-oriented companies, financial services, regional HQ |
| **Mechanism** | Establish in Casablanca Finance City or Industrial Acceleration Zone → 5-year full IS exemption, then 20% flat (regardless of profit) |
| **Savings** | 100% IS savings for 5 years; then 20% vs 35% for large companies |
| **Risk level** | LOW |
| **Requirements** | Real physical presence in zone; substance over form; 60-month minimum |
| **Guardrails** | Cannot be shell company; DGI audits physical presence |

### S3 — Investment Agreement (≥ 1.5B MAD)

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 19-I-A exception |
| **Target** | Large capital-intensive projects |
| **Mechanism** | Sign investment agreement with Moroccan state → locked at 20% IS rate perpetually |
| **Savings** | 15% rate differential vs 35% standard |
| **Risk level** | LOW |
| **Requirements** | Minimum 1.5 billion MAD investment; agreement with government |
| **Guardrails** | Must maintain investment commitments |

### S4 — IPO Tax Reduction

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 19-IV |
| **Target** | Companies planning to list on Casablanca Stock Exchange |
| **Mechanism** | List shares via public offering → reduced IS rate for fiscal year of listing |
| **Savings** | Variable (rate reduction on taxable profit) |
| **Risk level** | LOW-MEDIUM |
| **Requirements** | 10-year minimum listing commitment; exclusion: credit institutions, insurance, public concessions |
| **Guardrails** | Delisting within 10 years triggers clawback + penalties (Art. 232) |

### S5 — Group Restructuring (2026 Reform)

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Finance Law 2026 (NC 737) |
| **Target** | Groups planning asset transfers between subsidiaries |
| **Mechanism** | Intra-group asset transfers → 1,000 MAD fixed registration fee (instead of percentage) |
| **Savings** | Significant (registration fees normally 5-6% of asset value) |
| **Risk level** | LOW |
| **Requirements** | Same group of companies; formal restructuring plan |
| **Guardrails** | Cannot be used for third-party transfers disguised as intra-group |

### S6 — Depreciation Method Optimization

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 10-I-F-1°, Art. 10-III-A |
| **Target** | Companies with new capital equipment investments |
| **Mechanism** | Use declining-balance (dégressif) instead of straight-line (linéaire) for new equipment |
| **Savings** | Time value of money: defer IS by accelerating deductions to earlier years |
| **Risk level** | LOW |
| **Requirements** | New equipment only (not used); excludes buildings, passenger vehicles, furniture |
| **Coefficients** | 3-4yr → 1.5; 5-6yr → 2; >6yr → 3 |
| **Switch** | When declining-balance < straight-line on remaining NBV, switch to straight-line |

### S7 — Passenger Vehicle Cap Compliance

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 10-I-F-1° (2025 Finance Act) |
| **Target** | Companies with expensive passenger vehicles |
| **Mechanism** | Cap at 400,000 MAD TTC per vehicle; excess is non-deductible reintegration |
| **Savings** | Correct calculation avoids penalty (not a savings strategy, a compliance strategy) |
| **Risk level** | LOW (mandatory compliance) |
| **Note** | Commercial vehicles (trucks, vans) not subject to cap |

### S8 — Loss Carry-Forward Optimization

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 10-I-F-2° |
| **Target** | Companies with losses |
| **Mechanism** | Separate ordinary losses (4yr CF) from depreciation losses (unlimited CF); ensure depreciation is always recorded even in loss years |
| **Savings** | Preserves future deduction rights |
| **Risk level** | LOW |
| **Guardrails** | Unrecorded depreciation is permanently lost — must record every year |

### S9 — Salary vs Dividend Optimization for Directors

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 36 (salary), Art. 73 (dividends), Art. 73-II-B-7° |
| **Target** | Owner-managers of SARL/SA |
| **Mechanism** | Optimize mix of salary (deductible by company, taxed at IR 0-38%) vs dividends (non-deductible by company, 10% final WHT) |
| **Savings** | Balance corporate IS deduction against personal IR rate |
| **Risk level** | MEDIUM |
| **Guardrails** | Salary must be at market rate; excessive salary is reclassified as dividend (Art. 172) |

### S10 — Retirement Planning (2026 Reform)

| Parameter | Value |
|-----------|-------|
| **Legal basis** | 2026 Finance Law (CAMIR complementary pension exemption) |
| **Target** | Employees and professionals nearing retirement |
| **Mechanism** | Maximize contributions to CAMIR complementary pension; base + complementary pensions now fully exempt from IR |
| **Savings** | 100% of tax that would have been due on pension income (up to 38%) |
| **Risk level** | LOW |
| **Guardrails** | Only applies to CAMIR; other retirement products may differ |

### S11 — VAT Rate Optimization

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 99 |
| **Target** | Businesses with products/services near rate boundaries |
| **Mechanism** | Ensure correct classification of products between 10% and 20% rates; review supply chain for deduction optimization |
| **Savings** | 10% rate differential per transaction |
| **Risk level** | MEDIUM |
| **Guardrails** | Misclassification is tax fraud; DGI issues guidance circulars for borderline products |

### S12 — Family Charge Optimization

| Parameter | Value |
|-----------|-------|
| **Legal basis** | Art. 74 |
| **Target** | Individuals with dependents |
| **Mechanism** | Maximize dependent declarations; split income between spouses (each files separately if advantageous) |
| **Savings** | Depends on marginal rate differential between spouses |
| **Risk level** | LOW (if correctly applied) |
| **Guardrails** | Must reflect actual family structure; fictitious separation is abuse |

## Optimization Engine Algorithm

```typescript
interface OptimizationStrategy {
  id: string;
  name: string;
  legalBasis: string;
  applicableTaxTypes: ('IS' | 'IR' | 'TVA')[];
  eligibilityCheck: (profile: ClientProfile) => boolean;
  estimateSavings: (profile: ClientProfile) => number; // MAD
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  guardrails: ComplianceGuardrail[];
  requiredDocumentation: string[];
}

function runOptimization(clientProfile: ClientProfile): OptimizationReport {
  const applicableStrategies: RankedStrategy[] = [];

  for (const strategy of ALL_STRATEGIES) {
    // Step 1: Check eligibility
    if (!strategy.eligibilityCheck(clientProfile)) continue;

    // Step 2: Apply guardrails
    const guardrailViolations = strategy.guardrails
      .filter(g => !g.check(clientProfile))
      .map(g => g.violationMessage);

    if (guardrailViolations.length > 0) {
      // If any guardrail is RED (abusive), skip entirely
      if (guardrailViolations.some(v => v.severity === 'RED')) continue;
    }

    // Step 3: Estimate savings
    const savings = strategy.estimateSavings(clientProfile);

    applicableStrategies.push({
      strategy,
      savings,
      guardrailWarnings: guardrailViolations.filter(v => v.severity === 'YELLOW'),
      rankingScore: savings * riskWeight(strategy.riskLevel),
    });
  }

  // Step 4: Rank by savings (conservative estimate)
  applicableStrategies.sort((a, b) => b.rankingScore - a.rankingScore);

  return {
    strategies: applicableStrategies,
    totalEstimatedSavings: applicableStrategies
      .reduce((sum, s) => sum + s.savings, 0),
    recommendations: applicableStrategies.slice(0, 5).map(s => ({
      action: s.strategy.name,
      savings: s.savings,
      risk: s.strategy.riskLevel,
      timeline: estimateImplementationTime(s.strategy),
    })),
  };
}
```

## What-If Simulator

```typescript
interface WhatIfScenario {
  name: string;
  description: string;
  changes: {
    type: 'INCOME_CLASSIFICATION' | 'ENTITY_RESTRUCTURE' |
          'REGIME_CHANGE' | 'DEPRECIATION_METHOD' |
          'HOLDING_SETUP' | 'CFC_RELOCATION' |
          'SALARY_DIVIDEND_MIX' | 'VAT_RATE_CHANGE';
    parameters: Record<string, any>;
  }[];
}

// Simulator recomputes all 3 tax engines with the scenario applied
// and shows before/after comparison
```

## Compliance Guardrails

| # | Guardrail | Severity | CGI Reference |
|---|-----------|----------|---------------|
| G1 | Abus de droit (artificial arrangement for tax benefit) | RED | Art. 172 |
| G2 | Acte anormal de gestion (non-arm's-length transaction) | RED | Jurisprudence |
| G3 | Fiction juridique (sham legal structure) | RED | Art. 172 |
| G4 | Excessive director remuneration | YELLOW | Art. 36 + DGI guidelines |
| G5 | Substance-over-form for CFC/IAZ | YELLOW | Art. 6 |
| G6 | VAT misclassification | YELLOW | Art. 99 |
| G7 | Transfer pricing non-compliance (related parties) | RED | Art. 213 |
| G8 | Undocumented intra-group transactions | YELLOW | Art. 144 |
```
