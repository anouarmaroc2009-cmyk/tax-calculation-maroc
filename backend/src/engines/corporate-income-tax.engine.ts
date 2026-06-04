import { Injectable } from '@nestjs/common';

// Types
export type CompanyType =
  | 'STANDARD' | 'CREDIT_INSTITUTION' | 'INSURANCE' | 'BANK_AL_MAGHRIB' | 'CDG'
  | 'CFC' | 'IAZ' | 'INVESTMENT_AGREEMENT' | 'MICROFINANCE';

export interface TaxAdjustment {
  type: 'REINTEGRATION' | 'DEDUCTION';
  category: string;
  description: string;
  amount: number;
  cgiReference?: string;
}

export interface LossCarryForward {
  originFiscalYear: number;
  ordinaryLossAmount: number;
  depreciationLossAmount: number;
  ordinaryLossUsed: number;
  depreciationLossUsed: number;
}

export interface QuarterlyInstallment {
  installmentNumber: number;
  dueDate: string;
  amount: number;
  rateTransition: boolean;
}

export interface ISCalculationInput {
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
  operatingMonths: number;
  investmentAgreementAmount?: number;
}

export interface ISCalculationResult {
  netAccountingProfit: number;
  totalReintegrations: number;
  totalDeductions: number;
  netTaxableProfit: number;
  rateApplied: number;
  rateReason: string;
  grossIS: number;
  mcBase: number;
  mcRate: number;
  mcExempt: boolean;
  mcAmount: number;
  isBeforeLossCF: number;
  lossCarryForwardApplied: number;
  ordinaryLossRemaining: number;
  depreciationLossRemaining: number;
  netISPayable: number;
  foreignTaxCredits: number;
  quarterlyInstallments: QuarterlyInstallment[];
  mcExcessCarryForward: number;
  effectiveTaxRate: number;
}

@Injectable()
export class CorporateIncomeTaxEngine {
  private readonly MC_RATE_STANDARD = 0.0025;
  private readonly MC_RATE_REDUCED = 0.0015;
  private readonly MC_MINIMUM = 3000;
  private readonly MC_EXEMPT_MONTHS = 36;

  calculate(input: ISCalculationInput): ISCalculationResult {
    const netAccountingProfit = input.netAccountingProfit;
    const totalReintegrations = input.reintegrations
      .filter(r => r.type === 'REINTEGRATION')
      .reduce((s, r) => s + r.amount, 0);
    const totalDeductions = input.deductions
      .filter(d => d.type === 'DEDUCTION')
      .reduce((s, d) => s + d.amount, 0);

    const netTaxableProfit = netAccountingProfit + totalReintegrations - totalDeductions;

    const { rate: rateApplied, reason: rateReason } = this.determineRate(
      netTaxableProfit,
      input.companyType,
      input.investmentAgreementAmount,
    );

    const grossIS = Math.max(0, netTaxableProfit * rateApplied);
    const grossISAfterCredits = Math.max(0, grossIS - input.foreignTaxCredits);

    const { mcAmount, mcExempt } = this.computeMinimumContribution(
      input.totalRevenue,
      input.financialIncome,
      input.subsidies,
      input.operatingMonths,
      input.companyType,
    );

    const isBeforeLossCF = Math.max(grossISAfterCredits, mcAmount);

    const {
      lossApplied,
      ordinaryLossRemaining,
      depreciationLossRemaining,
    } = this.applyLossCarryForward(isBeforeLossCF, input.priorYearLosses, input.fiscalYear);

    const netISPayable = Math.max(0, isBeforeLossCF - lossApplied);

    const mcExcess = isBeforeLossCF === mcAmount && grossISAfterCredits < mcAmount
      ? mcAmount - grossISAfterCredits
      : 0;

    const quarterlyInstallments = this.computeQuarterlyInstallments(
      netISPayable,
      input.fiscalYear,
    );

    return {
      netAccountingProfit,
      totalReintegrations,
      totalDeductions,
      netTaxableProfit,
      rateApplied,
      rateReason,
      grossIS,
      mcBase: input.totalRevenue + input.financialIncome + input.subsidies,
      mcRate: mcExempt ? 0 : this.MC_RATE_STANDARD,
      mcExempt,
      mcAmount,
      isBeforeLossCF,
      lossCarryForwardApplied: lossApplied,
      ordinaryLossRemaining,
      depreciationLossRemaining,
      netISPayable,
      foreignTaxCredits: input.foreignTaxCredits,
      quarterlyInstallments,
      mcExcessCarryForward: mcExcess,
      effectiveTaxRate: netISPayable / (netTaxableProfit || 1),
    };
  }

  private determineRate(
    profit: number,
    companyType: CompanyType,
    investmentAgreementAmount?: number,
  ): { rate: number; reason: string } {
    switch (companyType) {
      case 'CREDIT_INSTITUTION':
      case 'INSURANCE':
      case 'BANK_AL_MAGHRIB':
      case 'CDG':
        return { rate: 0.40, reason: 'Art. 19-I-C — Credit/insurance institutions' };
      case 'CFC':
      case 'IAZ':
        return { rate: 0.20, reason: 'Art. 19-I-A — CFC/IAZ flat rate' };
      case 'INVESTMENT_AGREEMENT':
        if ((investmentAgreementAmount ?? 0) >= 1_500_000_000) {
          return { rate: 0.20, reason: 'Art. 19-I-A — Investment agreement ≥ 1.5B MAD' };
        }
        break;
      case 'MICROFINANCE':
        return { rate: profit >= 100_000_000 ? 0.35 : 0.20, reason: 'FN 2026 — Microfinance transition' };
    }

    if (profit >= 100_000_000) {
      return { rate: 0.35, reason: 'Art. 19-I-B — Large company rate' };
    }
    return { rate: 0.20, reason: 'Art. 19-I-A — Standard rate' };
  }

  private computeMinimumContribution(
    totalRevenue: number,
    financialIncome: number,
    subsidies: number,
    operatingMonths: number,
    companyType: CompanyType,
  ): { mcAmount: number; mcExempt: boolean } {
    const mcExempt = operatingMonths <= this.MC_EXEMPT_MONTHS;

    if (mcExempt) {
      return { mcAmount: 0, mcExempt: true };
    }

    const mcBase = totalRevenue + financialIncome + subsidies;
    const mcRate = this.isReducedMC(companyType)
      ? this.MC_RATE_REDUCED
      : this.MC_RATE_STANDARD;
    const mcAmount = Math.max(mcBase * mcRate, this.MC_MINIMUM);

    return { mcAmount: Math.round(mcAmount * 100) / 100, mcExempt: false };
  }

  private isReducedMC(companyType: CompanyType): boolean {
    // Petroleum, gas, butter, oil, sugar, flour, water, electricity, medicines
    // Determined by client's activity sector, not entity type
    return false; // Implement via sector check
  }

  private applyLossCarryForward(
    taxableAmount: number,
    losses: LossCarryForward[],
    currentYear: number,
  ): { lossApplied: number; ordinaryLossRemaining: number; depreciationLossRemaining: number } {
    let remaining = taxableAmount;
    let totalApplied = 0;
    let ordinaryRemaining = 0;
    let depreciationRemaining = 0;

    const sorted = [...losses]
      .filter(l => l.originFiscalYear < currentYear)
      .sort((a, b) => a.originFiscalYear - b.originFiscalYear);

    for (const loss of sorted) {
      if (remaining <= 0) break;

      const yearsElapsed = currentYear - loss.originFiscalYear;

      // Ordinary loss: max 4 years carry-forward
      const ordinaryAvailable = loss.ordinaryLossAmount - loss.ordinaryLossUsed;
      if (ordinaryAvailable > 0 && yearsElapsed <= 4) {
        const used = Math.min(remaining, ordinaryAvailable);
        remaining -= used;
        totalApplied += used;
      }

      // Depreciation loss: unlimited carry-forward
      const depreciationAvailable = loss.depreciationLossAmount - loss.depreciationLossUsed;
      if (depreciationAvailable > 0) {
        const used = Math.min(remaining, depreciationAvailable);
        remaining -= used;
        totalApplied += used;
      }
    }

    const remainingLoss = losses
      .filter(l => l.originFiscalYear < currentYear)
      .reduce((sum, l) => sum + (l.ordinaryLossAmount - l.ordinaryLossUsed), 0);
    ordinaryRemaining = Math.max(0, remainingLoss - Math.min(remainingLoss, totalApplied));

    return {
      lossApplied: totalApplied,
      ordinaryLossRemaining: ordinaryRemaining,
      depreciationLossRemaining: 0,
    };
  }

  private computeQuarterlyInstallments(
    netISPayable: number,
    fiscalYear: number,
  ): QuarterlyInstallment[] {
    const isTransitionYear = fiscalYear >= 2023 && fiscalYear <= 2026;
    const quarterlyAmount = Math.round((netISPayable / 4) * 100) / 100;

    return [1, 2, 3, 4].map((num) => {
      const month = num * 3;
      const year = fiscalYear;
      const dueDate = `${year}-${String(month).padStart(2, '0')}-30`;

      return {
        installmentNumber: num,
        dueDate,
        amount: quarterlyAmount,
        rateTransition: isTransitionYear,
      };
    });
  }
}
