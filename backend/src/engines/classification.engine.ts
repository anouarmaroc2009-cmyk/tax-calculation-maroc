import { Injectable } from '@nestjs/common';

export type IncomeType =
  | 'SALARY' | 'PROFESSIONAL_FEES' | 'COMMERCIAL_PROFIT' | 'INDUSTRIAL_PROFIT'
  | 'AGRICULTURAL' | 'DIVIDEND' | 'INTEREST' | 'RENTAL_RESIDENTIAL'
  | 'RENTAL_COMMERCIAL' | 'ROYALTY' | 'CAPITAL_GAIN_SECURITIES'
  | 'CAPITAL_GAIN_REAL_ESTATE';

export type AssetType =
  | 'FACTORY' | 'OFFICE_OWN_USE' | 'OFFICE_RENTAL' | 'MACHINERY'
  | 'COMPANY_CAR' | 'IT_EQUIPMENT' | 'PORTFOLIO_CONTROL'
  | 'PORTFOLIO_MINORITY' | 'INVESTMENT_REAL_ESTATE' | 'LAND'
  | 'CASH' | 'PATENT' | 'ART_COLLECTIBLE' | 'INVENTORY';

export type Classification = 'ACTIVE' | 'PASSIVE' | 'MIXED';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ClassificationRule {
  type: IncomeType | AssetType;
  defaultClassification: Classification;
  reclassificationRules: {
    trigger: string;
    condition: (context: ClassificationContext) => boolean;
    newClassification: Classification;
    riskLevel: RiskLevel;
  }[];
}

export interface ClassificationContext {
  entityType: string;
  annualWorkHours: number;
  portfolioManagementHours: number;
  numberOfProperties: number;
  isProfessionalLandlord: boolean;
  sharePercentage: number;
  isRegisteredProfessional: boolean;
  isCoreBusiness: boolean;
}

export interface ClassificationResult {
  classification: Classification;
  reasoning: string;
  riskLevel: RiskLevel;
  cgiReferences: string[];
  documentationRequired: string[];
  isReclassified: boolean;
  supportingCalculations: Record<string, number>;
}

const INCOME_CLASSIFICATION_RULES: ClassificationRule[] = [
  { type: 'SALARY', defaultClassification: 'ACTIVE', reclassificationRules: [] },
  { type: 'PROFESSIONAL_FEES', defaultClassification: 'ACTIVE', reclassificationRules: [] },
  { type: 'COMMERCIAL_PROFIT', defaultClassification: 'ACTIVE', reclassificationRules: [] },
  { type: 'INDUSTRIAL_PROFIT', defaultClassification: 'ACTIVE', reclassificationRules: [] },
  { type: 'AGRICULTURAL', defaultClassification: 'ACTIVE', reclassificationRules: [{
    trigger: 'Land leased out without operation',
    condition: (ctx) => !ctx.isCoreBusiness,
    newClassification: 'PASSIVE',
    riskLevel: 'LOW',
  }]},
  { type: 'DIVIDEND', defaultClassification: 'PASSIVE', reclassificationRules: [{
    trigger: 'Professional securities trader (Art. 39)',
    condition: (ctx) => ctx.isRegisteredProfessional && ctx.sharePercentage >= 0.10,
    newClassification: 'ACTIVE',
    riskLevel: 'MEDIUM',
  }]},
  { type: 'INTEREST', defaultClassification: 'PASSIVE', reclassificationRules: [{
    trigger: 'Working capital management in professional activity',
    condition: (ctx) => ctx.isRegisteredProfessional,
    newClassification: 'ACTIVE',
    riskLevel: 'LOW',
  }]},
  { type: 'RENTAL_RESIDENTIAL', defaultClassification: 'PASSIVE', reclassificationRules: [{
    trigger: 'Professional landlord (5+ properties or registered)',
    condition: (ctx) => ctx.numberOfProperties > 5 || ctx.isProfessionalLandlord,
    newClassification: 'ACTIVE',
    riskLevel: 'MEDIUM',
  }]},
  { type: 'RENTAL_COMMERCIAL', defaultClassification: 'PASSIVE', reclassificationRules: [{
    trigger: 'Professional real estate activity',
    condition: (ctx) => ctx.isProfessionalLandlord,
    newClassification: 'ACTIVE',
    riskLevel: 'MEDIUM',
  }]},
  { type: 'CAPITAL_GAIN_SECURITIES', defaultClassification: 'PASSIVE', reclassificationRules: [{
    trigger: 'Portfolio management >25% of working time (Art. 39)',
    condition: (ctx) => ctx.annualWorkHours > 0 && (ctx.portfolioManagementHours / ctx.annualWorkHours) > 0.25,
    newClassification: 'ACTIVE',
    riskLevel: 'HIGH',
  }]},
  { type: 'CAPITAL_GAIN_REAL_ESTATE', defaultClassification: 'PASSIVE', reclassificationRules: [{
    trigger: 'Real estate professional (Art. 41)',
    condition: (ctx) => ctx.isProfessionalLandlord,
    newClassification: 'ACTIVE',
    riskLevel: 'MEDIUM',
  }]},
];

const ASSET_CLASSIFICATION_RULES: ClassificationRule[] = [
  { type: 'FACTORY', defaultClassification: 'ACTIVE', reclassificationRules: [] },
  { type: 'OFFICE_OWN_USE', defaultClassification: 'ACTIVE', reclassificationRules: [] },
  { type: 'OFFICE_RENTAL', defaultClassification: 'PASSIVE', reclassificationRules: [{
    trigger: 'Company operates in same building',
    condition: (ctx) => ctx.isCoreBusiness,
    newClassification: 'MIXED',
    riskLevel: 'LOW',
  }]},
  { type: 'MACHINERY', defaultClassification: 'ACTIVE', reclassificationRules: [] },
  { type: 'COMPANY_CAR', defaultClassification: 'ACTIVE', reclassificationRules: [] },
  { type: 'IT_EQUIPMENT', defaultClassification: 'ACTIVE', reclassificationRules: [] },
  { type: 'PORTFOLIO_CONTROL', defaultClassification: 'ACTIVE', reclassificationRules: [{
    trigger: 'Minority passive stake',
    condition: (ctx) => ctx.sharePercentage < 0.10,
    newClassification: 'PASSIVE',
    riskLevel: 'LOW',
  }]},
  { type: 'PORTFOLIO_MINORITY', defaultClassification: 'PASSIVE', reclassificationRules: [{
    trigger: 'Material influence (10%+) with board representation',
    condition: (ctx) => ctx.sharePercentage >= 0.10,
    newClassification: 'ACTIVE',
    riskLevel: 'MEDIUM',
  }]},
  { type: 'INVESTMENT_REAL_ESTATE', defaultClassification: 'PASSIVE', reclassificationRules: [] },
  { type: 'LAND', defaultClassification: 'MIXED', reclassificationRules: [
    { trigger: 'Used in business operations',
      condition: (ctx) => ctx.isCoreBusiness, newClassification: 'ACTIVE', riskLevel: 'LOW' },
    { trigger: 'Held purely for investment',
      condition: (ctx) => !ctx.isCoreBusiness, newClassification: 'PASSIVE', riskLevel: 'LOW' },
  ]},
  { type: 'PATENT', defaultClassification: 'ACTIVE', reclassificationRules: [{
    trigger: 'IP held purely for licensing (non-core)',
    condition: (ctx) => !ctx.isCoreBusiness,
    newClassification: 'PASSIVE',
    riskLevel: 'MEDIUM',
  }]},
  { type: 'ART_COLLECTIBLE', defaultClassification: 'PASSIVE', reclassificationRules: [] },
  { type: 'INVENTORY', defaultClassification: 'ACTIVE', reclassificationRules: [] },
];

@Injectable()
export class ClassificationEngine {
  classifyIncome(
    incomeType: IncomeType,
    grossAmount: number,
    context: ClassificationContext,
    expenses?: number,
  ): ClassificationResult {
    const rule = INCOME_CLASSIFICATION_RULES.find(r => r.type === incomeType);
    if (!rule) return this.defaultResult('ACTIVE', true);

    let classification = rule.defaultClassification;
    let isReclassified = false;
    let riskLevel: RiskLevel = 'LOW';
    let reasoning = `Default classification for ${incomeType}`;

    for (const rc of rule.reclassificationRules) {
      if (rc.condition(context)) {
        classification = rc.newClassification;
        isReclassified = true;
        riskLevel = rc.riskLevel;
        reasoning = `Reclassified: ${rc.trigger}`;
        break;
      }
    }

    return {
      classification,
      reasoning,
      riskLevel,
      cgiReferences: classification === 'ACTIVE' ? ['Art. 39', 'Art. 41'] : ['Art. 73', 'Art. 57'],
      documentationRequired: isReclassified ? ['Activity declaration', 'Time tracking records', 'Contractual agreements'] : [],
      isReclassified,
      supportingCalculations: { grossAmount: grossAmount, expenses: expenses ?? 0 },
    };
  }

  classifyAsset(
    assetType: AssetType,
    acquisitionCost: number,
    context: ClassificationContext,
  ): ClassificationResult {
    const rule = ASSET_CLASSIFICATION_RULES.find(r => r.type === assetType);
    if (!rule) return this.defaultResult('ACTIVE', true);

    let classification = rule.defaultClassification;
    let isReclassified = false;
    let riskLevel: RiskLevel = 'LOW';
    let reasoning = `Default classification for ${assetType}`;

    for (const rc of rule.reclassificationRules) {
      if (rc.condition(context)) {
        classification = rc.newClassification;
        isReclassified = true;
        riskLevel = rc.riskLevel;
        reasoning = `Reclassified: ${rc.trigger}`;
        break;
      }
    }

    return {
      classification,
      reasoning,
      riskLevel,
      cgiReferences: ['Art. 10', 'CGI 2026'],
      documentationRequired: isReclassified ? ['Asset usage declaration', 'Board resolution'] : [],
      isReclassified,
      supportingCalculations: { acquisitionCost },
    };
  }

  private defaultResult(classification: Classification, isActive: boolean): ClassificationResult {
    return {
      classification,
      reasoning: 'Default classification',
      riskLevel: 'LOW',
      cgiReferences: ['CGI 2026'],
      documentationRequired: [],
      isReclassified: false,
      supportingCalculations: {},
    };
  }
}
