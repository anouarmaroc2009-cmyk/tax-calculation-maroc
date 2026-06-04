import { Injectable } from '@nestjs/common';

export type VATRateCode = 'STANDARD' | 'REDUCED_ADD' | 'REDUCED_SDD' | 'EXPORT_ADD' | 'EXEMPT_SDD';
export type FilingFrequency = 'MONTHLY' | 'QUARTERLY';
export type PeriodType = 'MONTHLY' | 'QUARTERLY';

export interface Transaction {
  type: 'SALE' | 'PURCHASE' | 'CREDIT_NOTE';
  htAmount: number;
  vatRateCode: VATRateCode;
  vatAmount: number;
  deductionRight: 'FULL' | 'PARTIAL' | 'NONE';
}

export interface AutoLiquidationTransaction {
  supplierName: string;
  invoiceRef: string;
  materialType: 'INDUSTRIAL_WASTE' | 'SCRAP_METAL' | 'RECOVERY_MATERIALS';
  htAmount: number;
}

export interface TVACalculationInput {
  fiscalYear: number;
  periodType: PeriodType;
  periodNumber: number;
  periodStart: string;
  periodEnd: string;
  sales: Transaction[];
  purchases: Transaction[];
  autoLiquidationTransactions?: AutoLiquidationTransaction[];
  priorCredit: number;
  priorYearCA: number;
}

export interface TVACalculationResult {
  vatCollected: {
    standard: number;
    reduced: number;
    total: number;
  };
  vatDeductible: number;
  netVAT: number;
  vatPayable: number;
  vatCredit: number;
  priorCredit: number;
  creditAfter: number;
  effectiveDate: string;
  deadline: string;
  filingFrequency: FilingFrequency;
  isAutoLiquidationApplied: boolean;
  autoLiquidationAmount: number;
}

const VAT_RATES: Record<VATRateCode, number> = {
  STANDARD: 0.20,
  REDUCED_ADD: 0.10,
  REDUCED_SDD: 0.10,
  EXPORT_ADD: 0,
  EXEMPT_SDD: 0,
};

const DEDUCTION_MATRIX: Record<VATRateCode, 'FULL' | 'NONE'> = {
  STANDARD: 'FULL',
  REDUCED_ADD: 'FULL',
  REDUCED_SDD: 'NONE',
  EXPORT_ADD: 'FULL',
  EXEMPT_SDD: 'NONE',
};

@Injectable()
export class VATEngine {
  calculate(input: TVACalculationInput): TVACalculationResult {
    const { vatCollected, collectedBreakdown } = this.computeVATCollected(input.sales);
    const vatDeductible = this.computeVATDeductible(input.purchases);

    let netVAT = vatCollected.total - vatDeductible - input.priorCredit;

    let autoLiquidationAmount = 0;
    if (input.autoLiquidationTransactions && input.autoLiquidationTransactions.length > 0) {
      autoLiquidationAmount = this.computeAutoLiquidation(input.autoLiquidationTransactions);
      // Auto-liquidation: buyer self-assesses and simultaneously deducts
      // Net effect on cash: 0, but increases collected and deductible equally
    }

    const vatPayable = Math.max(0, netVAT);
    const vatCredit = Math.abs(Math.min(0, netVAT));

    const filingFrequency = this.determineFilingFrequency(input.priorYearCA);

    return {
      vatCollected: collectedBreakdown,
      vatDeductible,
      netVAT,
      vatPayable,
      vatCredit,
      priorCredit: input.priorCredit,
      creditAfter: vatCredit,
      effectiveDate: input.periodEnd,
      deadline: this.computeDeadline(input.periodType, input.periodNumber, input.periodEnd),
      filingFrequency,
      isAutoLiquidationApplied: autoLiquidationAmount > 0,
      autoLiquidationAmount,
    };
  }

  private computeVATCollected(sales: Transaction[]) {
    let standard = 0;
    let reduced = 0;
    let total = 0;

    for (const sale of sales) {
      const rate = VAT_RATES[sale.vatRateCode];
      const vat = sale.htAmount * rate;
      sale.vatAmount = vat;
      total += vat;

      if (sale.vatRateCode === 'STANDARD') standard += vat;
      else if (sale.vatRateCode === 'REDUCED_ADD' || sale.vatRateCode === 'REDUCED_SDD') reduced += vat;
    }

    return {
      vatCollected: total,
      collectedBreakdown: { standard: Math.round(standard * 100) / 100, reduced: Math.round(reduced * 100) / 100, total: Math.round(total * 100) / 100 },
    };
  }

  private computeVATDeductible(purchases: Transaction[]): number {
    let total = 0;

    for (const purchase of purchases) {
      const allowedDeduction = DEDUCTION_MATRIX[purchase.vatRateCode];
      if (allowedDeduction === 'FULL') {
        total += purchase.htAmount * VAT_RATES[purchase.vatRateCode];
      }
      // REDUCED_SDD and EXEMPT_SDD: no deduction
    }

    return Math.round(total * 100) / 100;
  }

  private computeAutoLiquidation(transactions: AutoLiquidationTransaction[]): number {
    let total = 0;
    for (const t of transactions) {
      total += t.htAmount * 0.20;
    }
    return Math.round(total * 100) / 100;
  }

  private determineFilingFrequency(priorYearCA: number): FilingFrequency {
    return priorYearCA > 1_000_000 ? 'MONTHLY' : 'QUARTERLY';
  }

  private computeDeadline(periodType: PeriodType, periodNumber: number, periodEnd: string): string {
    const endDate = new Date(periodEnd);
    const year = endDate.getFullYear();
    const month = endDate.getMonth() + 1;

    if (periodType === 'MONTHLY') {
      const deadlineMonth = month === 12 ? 1 : month + 1;
      const deadlineYear = month === 12 ? year + 1 : year;
      return `${deadlineYear}-${String(deadlineMonth).padStart(2, '0')}-20`;
    }

    // Quarterly: 20th of month following quarter end
    const quarterEndMonths = [3, 6, 9, 12];
    const endMonth = quarterEndMonths[periodNumber - 1];
    const deadlineMonth = endMonth === 12 ? 1 : endMonth + 1;
    const deadlineYear = endMonth === 12 ? year + 1 : year;
    return `${deadlineYear}-${String(deadlineMonth).padStart(2, '0')}-20`;
  }
}
