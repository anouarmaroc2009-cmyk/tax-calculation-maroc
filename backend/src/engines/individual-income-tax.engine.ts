import { Injectable } from '@nestjs/common';

export interface SalaryIncome {
  employerName: string;
  grossAnnualSalary: number;
  cnssDeduction: number;
  amoDeduction: number;
  pensionDeduction: number;
  otherDeductions: number;
  isSingleEmployer: boolean;
}

export interface ProfessionalIncome {
  regime: 'RNR' | 'RNS' | 'CPU';
  revenue: number;
  actualExpenses?: number;
  fixedDeductionRate?: number; // For RNS/CPU
}

export interface AgriculturalIncome {
  regime: 'ACTUAL' | 'FLAT_RATE';
  revenue: number;
  expenses?: number;
}

export interface RentalIncome {
  propertyType: 'RESIDENTIAL' | 'COMMERCIAL' | 'PROFESSIONAL';
  grossAnnualRent: number;
  isProfessionalLandlord: boolean;
}

export interface MovableCapitalIncome {
  type: 'DIVIDEND_MOROCCO' | 'DIVIDEND_FOREIGN' | 'INTEREST_NON_PROFESSIONAL'
       | 'INTEREST_PROFESSIONAL' | 'FOREIGN_INCOME';
  grossAmount: number;
  withholdingRate: number;
  withholdingAmount: number;
  isFinalWithholding: boolean;
  isCreditable: boolean;
  foreignTaxPaid?: number;
}

export interface CapitalGain {
  type: 'LISTED_SHARES' | 'UNLISTED_SHARES' | 'REAL_ESTATE';
  salePrice: number;
  acquisitionPrice: number;
  expenses: number;
  timeBasedAbatement?: number; // For real estate
  minTaxRate?: number;
}

export interface WithholdingTaxCredit {
  incomeType: string;
  amount: number;
  isFinal: boolean;
}

export interface IRCalculationInput {
  fiscalYear: number;
  taxpayerType: 'SINGLE' | 'MARRIED' | 'HEAD_OF_HOUSEHOLD';
  dependents: number;
  salaries: SalaryIncome[];
  professionalIncome?: ProfessionalIncome;
  agriculturalIncome?: AgriculturalIncome;
  rentalIncome: RentalIncome[];
  movableCapitalIncome: MovableCapitalIncome[];
  capitalGains: CapitalGain[];
}

export interface IRCalculationResult {
  incomeByCategory: {
    category: number;
    name: string;
    grossAmount: number;
    deductions: number;
    netAmount: number;
    withholdingTaxPaid: number;
    isFinalWithholding: boolean;
    classification: 'ACTIVE' | 'PASSIVE';
  }[];
  globalNetTaxableIncome: number;
  grossIR: number;
  familyReduction: number;
  irAfterFamily: number;
  withholdingTaxCredits: number;
  netIRPayable: number;
  refundAmount: number;
  effectiveRate: number;
  details: {
    brackets: { from: number; to: number; rate: number; amountInBracket: number; taxInBracket: number }[];
  };
}

const IR_BRACKETS_2026 = [
  { from: 0, to: 30_000, rate: 0.00, deduction: 0 },
  { from: 30_001, to: 50_000, rate: 0.10, deduction: 3_000 },
  { from: 50_001, to: 60_000, rate: 0.20, deduction: 8_000 },
  { from: 60_001, to: 80_000, rate: 0.30, deduction: 14_000 },
  { from: 80_001, to: 180_000, rate: 0.34, deduction: 17_200 },
  { from: 180_001, to: Infinity, rate: 0.38, deduction: 24_400 },
];

@Injectable()
export class IndividualIncomeTaxEngine {
  private readonly SALARY_PROFESSIONAL_EXPENSE_RATE = 0.20;
  private readonly SALARY_DEDUCTION_CAP = 30_000;
  private readonly RENTAL_ABATEMENT = 0.40;

  calculate(input: IRCalculationInput): IRCalculationResult {
    const categories: IRCalculationResult['incomeByCategory'] = [];

    // Category 1: Salaries
    const cat1 = this.computeSalaries(input.salaries);
    categories.push(this.makeCategory(1, 'Salaires', cat1.gross, cat1.deductions, cat1.net, cat1.whtPaid, cat1.finalWHT));

    // Category 2: Professional
    const cat2 = this.computeProfessional(input.professionalIncome);
    if (cat2) {
      categories.push(this.makeCategory(2, 'Revenus Professionnels', cat2.gross, cat2.deductions, cat2.net, 0, false));
    }

    // Category 3: Agricultural
    const cat3 = this.computeAgricultural(input.agriculturalIncome);
    if (cat3) {
      categories.push(this.makeCategory(3, 'Revenus Agricoles', cat3.gross, cat3.deductions, cat3.net, 0, false));
    }

    // Category 4: Rental
    const cat4 = this.computeRental(input.rentalIncome);
    categories.push(this.makeCategory(4, 'Revenus Fonciers', cat4.gross, cat4.deductions, cat4.net, cat4.whtPaid, false));

    // Category 5: Movable Capital
    const cat5 = this.computeMovableCapital(input.movableCapitalIncome);
    categories.push(this.makeCategory(5, 'Capitaux Mobiliers', cat5.gross, cat5.deductions, cat5.netForGlobal, cat5.whtPaid, cat5.finalWHT));

    // Category 6: Capital Gains
    const cat6 = this.computeCapitalGains(input.capitalGains);
    if (cat6.gross > 0) {
      categories.push(this.makeCategory(6, 'Plus-values', cat6.gross, 0, cat6.netForGlobal, cat6.taxPaid, cat6.finalWHT));
    }

    // Calculate global net taxable income (only non-final categories)
    const globalNet = categories
      .filter(c => !c.isFinalWithholding)
      .reduce((s, c) => s + c.netAmount, 0);

    const grossIR = this.computeProgressiveIR(globalNet);

    const familyReduction = this.computeFamilyReduction(grossIR, input.dependents);
    const irAfterFamily = Math.max(0, grossIR - familyReduction);

    const taxCredits = categories
      .filter(c => !c.isFinalWithholding) // Only non-final WHT can be credited
      .reduce((s, c) => s + c.withholdingTaxPaid, 0);

    const netIR = Math.max(0, irAfterFamily - taxCredits);

    const refund = taxCredits > irAfterFamily ? taxCredits - irAfterFamily : 0;

    return {
      incomeByCategory: categories,
      globalNetTaxableIncome: globalNet,
      grossIR,
      familyReduction,
      irAfterFamily,
      withholdingTaxCredits: taxCredits,
      netIRPayable: netIR,
      refundAmount: refund,
      effectiveRate: globalNet > 0 ? netIR / globalNet : 0,
      details: {
        brackets: this.computeBracketDetail(globalNet),
      },
    };
  }

  private computeSalaries(salaries: SalaryIncome[]) {
    let gross = 0;
    let deductions = 0;
    let whtPaid = 0;

    for (const s of salaries) {
      const netBeforeProfExp = s.grossAnnualSalary - s.cnssDeduction - s.amoDeduction
        - s.pensionDeduction - s.otherDeductions;
      const profExpense = Math.min(
        netBeforeProfExp * this.SALARY_PROFESSIONAL_EXPENSE_RATE,
        this.SALARY_DEDUCTION_CAP,
      );
      gross += s.grossAnnualSalary;
      deductions += s.cnssDeduction + s.amoDeduction + s.pensionDeduction
        + s.otherDeductions + profExpense;

      if (s.isSingleEmployer) {
        whtPaid += this.computeProgressiveIR(netBeforeProfExp - profExpense);
      }
    }

    const net = gross - deductions;

    return {
      gross,
      deductions,
      net,
      whtPaid,
      finalWHT: false,
    };
  }

  private computeProfessional(income?: ProfessionalIncome) {
    if (!income) return null;
    let deductions = 0;
    switch (income.regime) {
      case 'RNR':
        deductions = income.actualExpenses ?? 0;
        break;
      case 'RNS':
        deductions = income.revenue * (income.fixedDeductionRate ?? 0.35);
        break;
      case 'CPU':
        deductions = income.revenue * (income.fixedDeductionRate ?? 0.40);
        break;
    }
    return { gross: income.revenue, deductions, net: Math.max(0, income.revenue - deductions) };
  }

  private computeAgricultural(income?: AgriculturalIncome) {
    if (!income) return null;
    if (income.regime === 'ACTUAL') {
      const deductions = income.expenses ?? 0;
      return { gross: income.revenue, deductions, net: Math.max(0, income.revenue - deductions) };
    }
    // Flat rate: fixed deduction
    const deductionRate = 0.50;
    const deductions = income.revenue * deductionRate;
    return { gross: income.revenue, deductions, net: Math.max(0, income.revenue - deductions) };
  }

  private computeRental(rentals: RentalIncome[]) {
    let gross = 0;
    let whtTotal = 0;
    for (const r of rentals) {
      gross += r.grossAnnualRent;
      const abated = r.grossAnnualRent * (1 - this.RENTAL_ABATEMENT);
      const whtRate = r.grossAnnualRent < 120_000 ? 0.10 : 0.15;
      whtTotal += abated * whtRate;
    }
    return {
      gross,
      deductions: gross * this.RENTAL_ABATEMENT,
      net: gross * (1 - this.RENTAL_ABATEMENT),
      whtPaid: whtTotal,
    };
  }

  private computeMovableCapital(incomes: MovableCapitalIncome[]) {
    let gross = 0;
    let netForGlobal = 0;
    let whtPaid = 0;
    let finalWHT = false;

    for (const inc of incomes) {
      gross += inc.grossAmount;
      whtPaid += inc.withholdingAmount;
      if (!inc.isFinalWithholding) {
        netForGlobal += inc.grossAmount;
      }
      if (inc.isFinalWithholding) {
        finalWHT = true;
      }
    }

    return { gross, deductions: 0, netForGlobal, whtPaid, finalWHT };
  }

  private computeCapitalGains(gains: CapitalGain[]) {
    let gross = 0;
    let netForGlobal = 0;
    let taxPaid = 0;
    let finalWHT = true;

    for (const g of gains) {
      const gain = g.salePrice - g.acquisitionPrice - g.expenses;
      gross += gain;

      switch (g.type) {
        case 'LISTED_SHARES':
          taxPaid += gain * 0.15;
          break;
        case 'UNLISTED_SHARES':
          taxPaid += gain * 0.20;
          break;
        case 'REAL_ESTATE': {
          const abatedGain = gain * (g.timeBasedAbatement ?? 1);
          const taxByRate = abatedGain * 0.20;
          const taxByMin = g.salePrice * (g.minTaxRate ?? 0.03);
          taxPaid += Math.max(taxByRate, taxByMin);
          break;
        }
      }
    }

    return { gross, netForGlobal, taxPaid, finalWHT };
  }

  private computeProgressiveIR(netIncome: number): number {
    for (const bracket of IR_BRACKETS_2026) {
      if (netIncome <= bracket.to) {
        return Math.max(0, Math.round((netIncome * bracket.rate - bracket.deduction) * 100) / 100);
      }
    }
    return 0;
  }

  private computeBracketDetail(netIncome: number) {
    const details: IRCalculationResult['details']['brackets'] = [];
    let remaining = netIncome;

    for (const bracket of IR_BRACKETS_2026) {
      if (remaining <= 0) break;
      const bracketSize = Math.min(remaining, bracket.to - bracket.from + 1);
      const taxInBracket = bracketSize * bracket.rate;
      details.push({
        from: bracket.from,
        to: bracket.to,
        rate: bracket.rate,
        amountInBracket: bracketSize,
        taxInBracket,
      });
      remaining -= bracketSize;
    }

    return details;
  }

  private computeFamilyReduction(grossIR: number, dependents: number): number {
    // Per Art. 74 — amounts set by annual Finance Law
    const reductionPerDependent = 360; // 2026 reference amount
    return Math.min(dependents * reductionPerDependent, grossIR);
  }

  private makeCategory(
    category: number, name: string, gross: number, deductions: number,
    net: number, whtPaid: number, finalWHT: boolean,
  ): IRCalculationResult['incomeByCategory'][0] {
    return {
      category,
      name,
      grossAmount: gross,
      deductions,
      netAmount: net,
      withholdingTaxPaid: whtPaid,
      isFinalWithholding: finalWHT,
      classification: category <= 3 ? 'ACTIVE' : 'PASSIVE',
    };
  }
}
