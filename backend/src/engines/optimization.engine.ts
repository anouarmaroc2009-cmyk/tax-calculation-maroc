export class OptimizationEngine {
  run(profile: OptProfile): OptReport {
    const strategies = [
      { id: 'S1', name: 'Holding Company Structure', tax: 'IS', savings: profile.dividendIncome ? profile.dividendIncome * 0.20 : 0, risk: 'LOW' as const, timeline: '3-6 months' },
      { id: 'S2', name: 'CFC/IAZ Regime', tax: 'IS', savings: profile.isExport ? profile.netProfit * 0.15 : 0, risk: 'LOW' as const, timeline: '6-12 months' },
      { id: 'S6', name: 'Declining-Balance Depreciation', tax: 'IS', savings: (profile.fixedAssets || 0) * 0.02, risk: 'LOW' as const, timeline: 'Immediate' },
      { id: 'S8', name: 'Loss Carry-Forward Preservation', tax: 'IS', savings: profile.hasLosses ? (profile.netProfit || 0) * 0.10 : 0, risk: 'LOW' as const, timeline: 'Immediate' },
      { id: 'S9', name: 'Salary vs Dividend Mix', tax: 'IS/IR', savings: this.salDivSavings(profile), risk: 'MEDIUM' as const, timeline: '1-3 months' },
      { id: 'S11', name: 'VAT Rate Review', tax: 'TVA', savings: (profile.annualRevenue || 0) * 0.005, risk: 'MEDIUM' as const, timeline: '1-2 months' },
    ].filter(s => s.savings > 0).sort((a, b) => b.savings - a.savings);

    return {
      strategies: strategies.map(s => ({ ...s, savings: Math.round(s.savings * 100) / 100 })),
      totalSavings: Math.round(strategies.reduce((s, st) => s + st.savings, 0) * 100) / 100,
    };
  }
  private salDivSavings(p: OptProfile): number {
    const total = (p.directorSalary || 0) + (p.directorDividends || 0);
    if (!total) return 0;
    const shift = total * 0.10;
    const irCost = shift * 0.38;
    const divCost = shift * 0.10;
    const companyBenefit = shift * 0.20;
    return Math.max(0, Math.round((companyBenefit - irCost + divCost) * 100) / 100);
  }
}
export interface OptProfile { dividendIncome?: number; isExport?: boolean; netProfit?: number; fixedAssets?: number; hasLosses?: boolean; annualRevenue?: number; directorSalary?: number; directorDividends?: number; }
export interface OptReport { strategies: { id: string; name: string; tax: string; savings: number; risk: string; timeline: string }[]; totalSavings: number; }
