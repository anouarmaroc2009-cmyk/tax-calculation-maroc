export class IndividualIncomeTaxEngine {
  private readonly BRACKETS = [
    { max: 30_000, rate: 0, deduct: 0 },
    { max: 50_000, rate: 0.10, deduct: 3_000 },
    { max: 60_000, rate: 0.20, deduct: 8_000 },
    { max: 80_000, rate: 0.30, deduct: 14_000 },
    { max: 180_000, rate: 0.34, deduct: 17_200 },
    { max: Infinity, rate: 0.38, deduct: 24_400 },
  ];

  calculate(input: IRInput): IRResult {
    const categories: IRCategoryResult[] = [];

    // Cat 1: Salaries
    const salaryTotal = (input.salaries || []).reduce((s, sal) => {
      const net = sal.gross - sal.cnss - sal.amo - sal.pension - sal.otherDeductions;
      const profExp = Math.min(net * 0.20, 30_000);
      return s + { gross: sal.gross, deductions: sal.cnss + sal.amo + sal.pension + sal.otherDeductions + profExp, net: net - profExp, wht: 0 };
    }, { gross: 0, deductions: 0, net: 0, wht: 0 });
    // Actually compute properly:
    let cat1Gross = 0, cat1Ded = 0, cat1Net = 0, cat1WHT = 0;
    for (const sal of (input.salaries || [])) {
      const beforeProf = sal.gross - sal.cnss - sal.amo - sal.pension - sal.otherDeductions;
      const profExp = Math.min(beforeProf * 0.20, 30_000);
      cat1Gross += sal.gross;
      cat1Ded += sal.cnss + sal.amo + sal.pension + sal.otherDeductions + profExp;
      cat1Net += beforeProf - profExp;
    }
    categories.push({ category: 1, name: 'Salaires', gross: cat1Gross, deductions: cat1Ded, net: cat1Net, withholding: cat1WHT, isFinal: false, classification: 'ACTIVE' });

    // Cat 4: Rental income
    let cat4Gross = 0, cat4Ded = 0, cat4Net = 0, cat4WHT = 0;
    for (const r of (input.rentalIncome || [])) {
      const abated = r.gross * 0.60; // 40% abatement
      cat4Gross += r.gross;
      cat4Ded += r.gross * 0.40;
      cat4Net += abated;
      cat4WHT += abated * (r.gross >= 120_000 ? 0.15 : 0.10);
    }
    if (cat4Gross > 0) categories.push({ category: 4, name: 'Revenus Fonciers', gross: cat4Gross, deductions: cat4Ded, net: cat4Net, withholding: cat4WHT, isFinal: false, classification: 'PASSIVE' });

    // Cat 5: Movable capital
    let cat5Net = 0, cat5WHT = 0, cat5Final = false;
    for (const m of (input.movableCapitalIncome || [])) {
      cat5WHT += m.withholdingAmount || 0;
      if (!m.isFinal) cat5Net += m.gross;
      if (m.isFinal) cat5Final = true;
    }
    if (cat5Net > 0 || cat5WHT > 0) categories.push({ category: 5, name: 'Capitaux Mobiliers', gross: cat5Net, deductions: 0, net: cat5Net, withholding: cat5WHT, isFinal: cat5Final, classification: 'PASSIVE' });

    const globalNet = categories.filter(c => !c.isFinal).reduce((s, c) => s + c.net, 0);
    const grossIR = this.computeProgressive(globalNet);
    const familyReduction = Math.min((input.dependents || 0) * 360, grossIR);
    const irAfterFamily = Math.max(0, grossIR - familyReduction);
    const credits = categories.filter(c => !c.isFinal).reduce((s, c) => s + c.withholding, 0);
    const netIR = Math.max(0, irAfterFamily - credits);
    const refund = credits > irAfterFamily ? credits - irAfterFamily : 0;

    return {
      categories,
      globalNetTaxableIncome: globalNet,
      grossIR, familyReduction, irAfterFamily,
      withholdingCredits: credits, netIRPayable: netIR, refund,
      effectiveRate: globalNet > 0 ? Math.round(netIR / globalNet * 10000) / 100 : 0,
      bracketDetail: this.getBrackets(globalNet),
    };
  }

  private computeProgressive(n: number): number {
    for (const b of this.BRACKETS) { if (n <= b.max) return Math.max(0, Math.round((n * b.rate - b.deduct) * 100) / 100); }
    return 0;
  }

  private getBrackets(n: number): { from: number; to: string; rate: number; amount: number; tax: number }[] {
    const res: any[] = []; let remaining = n;
    for (const b of this.BRACKETS) {
      if (remaining <= 0) break;
      const size = Math.min(remaining, b.max - (res.length ? this.BRACKETS[res.length - 1].max : 0));
      res.push({ from: res.length ? this.BRACKETS[res.length - 1].max + 1 : 0, to: b.max === Infinity ? '∞' : b.max.toLocaleString(), rate: b.rate, amount: size, tax: Math.round(size * b.rate * 100) / 100 });
      remaining -= size;
    }
    return res;
  }
}

export interface IRSalary { gross: number; cnss: number; amo: number; pension: number; otherDeductions: number; }
export interface IRRental { gross: number; }
export interface IRMovable { gross: number; withholdingAmount: number; isFinal: boolean; }
export interface IRInput { salaries?: IRSalary[]; rentalIncome?: IRRental[]; movableCapitalIncome?: IRMovable[]; dependents?: number; }
export interface IRCategoryResult { category: number; name: string; gross: number; deductions: number; net: number; withholding: number; isFinal: boolean; classification: string; }
export interface IRResult {
  categories: IRCategoryResult[]; globalNetTaxableIncome: number; grossIR: number;
  familyReduction: number; irAfterFamily: number; withholdingCredits: number;
  netIRPayable: number; refund: number; effectiveRate: number;
  bracketDetail: { from: number; to: string; rate: number; amount: number; tax: number }[];
}
