import { Injectable } from '@nestjs/common';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface OptimizationStrategy {
  id: string;
  name: string;
  legalBasis: string;
  applicableTaxTypes: ('IS' | 'IR' | 'TVA')[];
  description: string;
  riskLevel: RiskLevel;
  implementationTimeline: string;
  prerequisites: string[];
  guardrails: string[];
}

export interface ClientProfile {
  entityType: string;
  annualRevenue: number;
  netProfit: number;
  hasSubsidiaries: boolean;
  isExportCompany: boolean;
  isInCFC: boolean;
  isInIAZ: boolean;
  hasInvestmentAgreement: boolean;
  investmentAgreementAmount: number;
  isPubliclyListed: boolean;
  fixedAssetBase: number;
  passengerVehicleCount: number;
  passengerVehicleTotalCost: number;
  hasLosses: boolean;
  lossAmount: number;
  directorSalary: number;
  directorDividends: number;
  numberOfEmployees: number;
  isGroupRestructuringPlanned: boolean;
  hasForeignIncome: boolean;
  dividualIncome: number;
  interestIncome: number;
  rentalProperties: number;
  rentalIncome: number;
  portfolioSecurities: boolean;
  portfolioManagementHours: number;
  annualWorkHours: number;
  isProfessionalLandlord: boolean;
  nearingRetirement: boolean;
  pensionContributions: number;
}

export interface RankedStrategy {
  strategy: OptimizationStrategy;
  estimatedSavings: number;
  riskLevel: RiskLevel;
  guardrailWarnings: string[];
  rankingScore: number;
}

export interface OptimizationReport {
  strategies: RankedStrategy[];
  totalEstimatedSavings: number;
  recommendations: {
    action: string;
    savings: number;
    risk: RiskLevel;
    timeline: string;
  }[];
  summary: string;
}

const ALL_STRATEGIES: OptimizationStrategy[] = [
  {
    id: 'S1', name: 'Holding Company Structure',
    legalBasis: 'Art. 4-I — Parent-subsidiary dividend exemption (100%)',
    applicableTaxTypes: ['IS'],
    description: 'Create a holding company to receive dividends from subsidiaries tax-free',
    riskLevel: 'LOW', implementationTimeline: '3-6 months',
    prerequisites: ['At least one subsidiary'], guardrails: ['Must not be solely tax-motivated', 'Substance required'],
  },
  {
    id: 'S2', name: 'CFC / IAZ Regime Selection',
    legalBasis: 'Art. 6-I, Art. 19-I-A',
    applicableTaxTypes: ['IS'],
    description: 'Establish in Casablanca Finance City or Industrial Acceleration Zone',
    riskLevel: 'LOW', implementationTimeline: '6-12 months',
    prerequisites: ['Export activity or financial services', 'Physical presence in zone'],
    guardrails: ['Must maintain substance', '60-month commitment'],
  },
  {
    id: 'S3', name: 'Investment Agreement (20% Rate Lock)',
    legalBasis: 'Art. 19-I-A exception',
    applicableTaxTypes: ['IS'],
    description: 'Sign investment agreement with government for 20% locked rate',
    riskLevel: 'LOW', implementationTimeline: '6-18 months',
    prerequisites: ['Minimum 1.5B MAD investment'], guardrails: ['Must maintain investment commitments'],
  },
  {
    id: 'S4', name: 'IPO Tax Reduction',
    legalBasis: 'Art. 19-IV',
    applicableTaxTypes: ['IS'],
    description: 'List on Casablanca Stock Exchange for reduced IS rate',
    riskLevel: 'MEDIUM', implementationTimeline: '12-24 months',
    prerequisites: ['Meet exchange listing requirements', '3-year financial history'],
    guardrails: ['10-year listing commitment', 'Clawback if delisted early'],
  },
  {
    id: 'S5', name: 'Group Restructuring Registration Fee Relief',
    legalBasis: 'FL 2026 (NC 737)',
    applicableTaxTypes: ['IS'],
    description: 'Intra-group asset transfers at 1,000 MAD fixed fee',
    riskLevel: 'LOW', implementationTimeline: '1-3 months',
    prerequisites: ['Group of companies', 'Formal restructuring plan'],
    guardrails: ['Cannot disguise third-party transfers'],
  },
  {
    id: 'S6', name: 'Declining-Balance Depreciation',
    legalBasis: 'Art. 10-III-A',
    applicableTaxTypes: ['IS'],
    description: 'Accelerate depreciation of new capital equipment',
    riskLevel: 'LOW', implementationTimeline: 'Immediate',
    prerequisites: ['New equipment (not used)', 'Not buildings/vehicles/furniture'],
    guardrails: ['Switch to straight-line when beneficial'],
  },
  {
    id: 'S7', name: 'Passenger Vehicle Cap Compliance',
    legalBasis: 'Art. 10-I-F-1° (400K MAD cap)',
    applicableTaxTypes: ['IS'],
    description: 'Ensure correct depreciation calculation for expensive vehicles',
    riskLevel: 'LOW', implementationTimeline: 'Immediate',
    prerequisites: ['Passenger vehicles > 400K MAD TTC'], guardrails: ['Commercial vehicles not subject to cap'],
  },
  {
    id: 'S8', name: 'Loss Carry-Forward Preservation',
    legalBasis: 'Art. 10-I-F-2°',
    applicableTaxTypes: ['IS'],
    description: 'Record depreciation even in loss years to preserve unlimited CF',
    riskLevel: 'LOW', implementationTimeline: 'Immediate',
    prerequisites: ['Tax losses'], guardrails: ['Unrecorded depreciation is permanently lost'],
  },
  {
    id: 'S9', name: 'Salary vs Dividend Mix Optimization',
    legalBasis: 'Art. 36 (salary), Art. 73 (dividends)',
    applicableTaxTypes: ['IS', 'IR'],
    description: 'Optimize director remuneration between salary and dividends',
    riskLevel: 'MEDIUM', implementationTimeline: '1-3 months',
    prerequisites: ['Owner-managed company'], guardrails: ['Salary must be at market rate'],
  },
  {
    id: 'S10', name: 'Pension Exemption Planning',
    legalBasis: 'FL 2026 — CAMIR pension exemption',
    applicableTaxTypes: ['IR'],
    description: 'Maximize CAMIR contributions; pensions now fully exempt from IR',
    riskLevel: 'LOW', implementationTimeline: '3-6 months',
    prerequisites: ['CAMIR membership', 'Nearing retirement'],
    guardrails: ['Only CAMIR; other products may differ'],
  },
  {
    id: 'S11', name: 'VAT Rate Classification Review',
    legalBasis: 'Art. 99 (post-2026 reform)',
    applicableTaxTypes: ['TVA'],
    description: 'Review product/service classification between 10% and 20% rates',
    riskLevel: 'MEDIUM', implementationTimeline: '1-2 months',
    prerequisites: ['Products near rate boundaries'], guardrails: ['Misclassification is tax fraud'],
  },
  {
    id: 'S12', name: 'Family Charge Optimization',
    legalBasis: 'Art. 74',
    applicableTaxTypes: ['IR'],
    description: 'Optimize dependent declarations and income splitting between spouses',
    riskLevel: 'LOW', implementationTimeline: 'Immediate',
    prerequisites: ['Individual with dependents or spouse with income'],
    guardrails: ['Must reflect actual family structure'],
  },
];

@Injectable()
export class OptimizationEngine {
  run(clientProfile: ClientProfile): OptimizationReport {
    const ranked: RankedStrategy[] = [];

    for (const strategy of ALL_STRATEGIES) {
      const savings = this.estimateSavings(strategy.id, clientProfile);
      if (savings === 0) continue;

      const guardrails = this.checkGuardrails(strategy, clientProfile);
      if (guardrails.some(g => g.includes('[BLOCKED]'))) continue;

      const riskLevel = strategy.riskLevel;
      const riskWeight = riskLevel === 'LOW' ? 1.0 : riskLevel === 'MEDIUM' ? 0.7 : 0.4;

      ranked.push({
        strategy,
        estimatedSavings: savings,
        riskLevel,
        guardrailWarnings: guardrails.filter(g => g.includes('[WARNING]')),
        rankingScore: savings * riskWeight,
      });
    }

    ranked.sort((a, b) => b.rankingScore - a.rankingScore);

    return {
      strategies: ranked,
      totalEstimatedSavings: ranked.reduce((s, r) => s + r.estimatedSavings, 0),
      recommendations: ranked.slice(0, 5).map(r => ({
        action: r.strategy.name,
        savings: r.estimatedSavings,
        risk: r.riskLevel,
        timeline: r.strategy.implementationTimeline,
      })),
      summary: this.generateSummary(ranked),
    };
  }

  private estimateSavings(strategyId: string, profile: ClientProfile): number {
    switch (strategyId) {
      case 'S1': return profile.dividualIncome > 0 ? profile.dividualIncome * 0.20 : 0;
      case 'S2': return profile.isInCFC || profile.isInIAZ ? profile.netProfit * 0.15 : 0;
      case 'S3': return profile.hasInvestmentAgreement && profile.investmentAgreementAmount >= 1_500_000_000 ? profile.netProfit * 0.15 : 0;
      case 'S4': return (profile.isPubliclyListed && profile.netProfit > 0) ? profile.netProfit * 0.05 : 0;
      case 'S5': return profile.isGroupRestructuringPlanned ? 50_000 : 0; // Estimated registration fee savings
      case 'S6': return profile.fixedAssetBase * 0.02; // Estimated PV of accelerated depreciation
      case 'S7': return profile.passengerVehicleCount * 5_000; // Avoided penalty
      case 'S8': return profile.lossAmount > 0 ? profile.netProfit * 0.10 : 0;
      case 'S9': return this.estimateSalaryDividendSavings(profile);
      case 'S10': return profile.nearingRetirement && profile.pensionContributions > 0 ? profile.pensionContributions * 0.38 : 0;
      case 'S11': return profile.annualRevenue * 0.01;
      case 'S12': return 3_000; // Estimated family reduction
      default: return 0;
    }
  }

  private estimateSalaryDividendSavings(profile: ClientProfile): number {
    const totalComp = profile.directorSalary + profile.directorDividends;
    if (totalComp === 0) return 0;
    const currentSalaryRatio = profile.directorSalary / totalComp;

    // Simplistic: test shifting 10% of compensation
    const testShiftAmount = totalComp * 0.10;
    const irCostShift = testShiftAmount * 0.38; // Marginal IR rate on additional salary
    const isSavingShift = testShiftAmount * 0.10; // 10% dividend WHT if taken as dividend

    // Company saves IS if salary (deductible) replaces dividend (non-deductible)
    const companyISBenefit = testShiftAmount * 0.20;
    const personalCost = currentSalaryRatio > 0.5 ? irCostShift - isSavingShift : isSavingShift - irCostShift;

    return Math.max(0, companyISBenefit - personalCost);
  }

  private checkGuardrails(strategy: OptimizationStrategy, profile: ClientProfile): string[] {
    const warnings: string[] = [];
    if (strategy.id === 'S2' && !profile.isExportCompany && !profile.isInCFC && !profile.isInIAZ) {
      warnings.push('[WARNING] CFC/IAZ requires real export activity');
    }
    if (strategy.id === 'S9' && profile.directorSalary > profile.annualRevenue * 0.30) {
      warnings.push('[WARNING] Salary > 30% of revenue may be challenged as excessive');
    }
    return warnings;
  }

  private generateSummary(ranked: RankedStrategy[]): string {
    if (ranked.length === 0) return 'No optimization opportunities identified for current profile.';
    const top = ranked[0];
    return `Top opportunity: ${top.strategy.name} (est. ${top.estimatedSavings.toLocaleString()} MAD savings, ${top.riskLevel} risk). ${ranked.length} strategies available in total.`;
  }
}
