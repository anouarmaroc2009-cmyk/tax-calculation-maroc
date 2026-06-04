export class CorporateIncomeTaxEngine {
  calculate(input: ISInput): ISResult {
    const netAccountingProfit = input.netAccountingProfit;
    const totalReintegrations = (input.reintegrations || []).reduce((s, r) => s + r.amount, 0);
    const totalDeductions = (input.deductions || []).reduce((s, d) => s + d.amount, 0);
    const netTaxableProfit = Math.max(0, netAccountingProfit + totalReintegrations - totalDeductions);

    const rateInfo = this.getRate(netTaxableProfit, input.companyType, input.investmentAgreementAmount || 0);
    const grossIS = Math.round(netTaxableProfit * rateInfo.rate * 100) / 100;

    const mcBase = input.totalRevenue + (input.financialIncome || 0) + (input.subsidies || 0);
    const mcExempt = (input.operatingMonths || 999) <= 36;
    const mcAmount = mcExempt ? 0 : Math.max(Math.round(mcBase * 0.0025 * 100) / 100, 3000);

    const isDue = Math.max(grossIS, mcAmount);
    const lossApplied = this.applyLossCF(isDue, input.priorYearLosses || [], input.fiscalYear);
    const netISPayable = Math.max(0, isDue - lossApplied);

    const lastDay = (y: number, m: number) => new Date(y, m, 0).getDate();
    const installments = [1, 2, 3, 4].map(n => {
      const m = n * 3;
      return {
        number: n,
        dueDate: `${input.fiscalYear}-${String(m).padStart(2, '0')}-${lastDay(input.fiscalYear, m)}`,
        amount: Math.round(netISPayable / 4 * 100) / 100,
      };
    });

    return {
      netAccountingProfit,
      totalReintegrations,
      totalDeductions,
      netTaxableProfit,
      rateApplied: rateInfo.rate,
      rateLabel: rateInfo.label,
      grossIS,
      mcBase,
      mcRate: 0.0025,
      mcExempt,
      mcAmount,
      isDue,
      lossCarryForwardApplied: lossApplied,
      netISPayable,
      quarterlyInstallments: installments,
      effectiveRate: netTaxableProfit > 0 ? Math.round(netISPayable / netTaxableProfit * 10000) / 100 : 0,
    };
  }

  private getRate(profit: number, type: string, agreement: number) {
    if (['CREDIT_INSTITUTION', 'INSURANCE', 'BANK_AL_MAGHRIB', 'CDG'].includes(type))
      return { rate: 0.40, label: '40% — Credit/Insurance (Art. 19-I-C)' };
    if (['CFC', 'IAZ'].includes(type))
      return { rate: 0.20, label: '20% — CFC/IAZ flat (Art. 19-I-A)' };
    if (type === 'INVESTMENT_AGREEMENT' && agreement >= 1_500_000_000)
      return { rate: 0.20, label: '20% — Investment agreement ≥ 1.5B MAD' };
    if (profit >= 100_000_000)
      return { rate: 0.35, label: '35% — Large company (Art. 19-I-B)' };
    return { rate: 0.20, label: '20% — Standard (Art. 19-I-A)' };
  }

  private applyLossCF(amount: number, losses: ISLossCF[], year: number): number {
    let remaining = amount, applied = 0;
    const sorted = losses.filter(l => l.originYear < year).sort((a, b) => a.originYear - b.originYear);
    for (const loss of sorted) {
      if (remaining <= 0) break;
      const yrs = year - loss.originYear;
      if (loss.type === 'ORDINARY' && yrs <= 4) {
        const used = Math.min(remaining, loss.remaining);
        remaining -= used; applied += used;
      } else if (loss.type === 'DEPRECIATION') {
        const used = Math.min(remaining, loss.remaining);
        remaining -= used; applied += used;
      }
    }
    return applied;
  }
}

export interface ISAdjustment { type: 'REINTEGRATION' | 'DEDUCTION'; category: string; description: string; amount: number; }
export interface ISLossCF { originYear: number; type: 'ORDINARY' | 'DEPRECIATION'; remaining: number; }
export interface ISInput {
  fiscalYear: number; companyType: string; netAccountingProfit: number; totalRevenue: number;
  financialIncome?: number; subsidies?: number; operatingMonths?: number; investmentAgreementAmount?: number;
  reintegrations?: ISAdjustment[]; deductions?: ISAdjustment[]; priorYearLosses?: ISLossCF[];
}
export interface ISResult {
  netAccountingProfit: number; totalReintegrations: number; totalDeductions: number;
  netTaxableProfit: number; rateApplied: number; rateLabel: string; grossIS: number;
  mcBase: number; mcRate: number; mcExempt: boolean; mcAmount: number; isDue: number;
  lossCarryForwardApplied: number; netISPayable: number;
  quarterlyInstallments: { number: number; dueDate: string; amount: number }[];
  effectiveRate: number;
}
