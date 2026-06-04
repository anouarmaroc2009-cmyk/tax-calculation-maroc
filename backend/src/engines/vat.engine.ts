export class VATEngine {
  calculate(input: TVAInput): TVAResult {
    const collect20 = (input.sales || []).filter(s => s.rateCode === 'STANDARD').reduce((s, t) => s + t.ht, 0);
    const collect10 = (input.sales || []).filter(s => s.rateCode === 'REDUCED_ADD' || s.rateCode === 'REDUCED_SDD').reduce((s, t) => s + t.ht, 0);
    const vatCollected = Math.round((collect20 * 0.20 + collect10 * 0.10) * 100) / 100;

    const ded20 = (input.purchases || []).filter(s => s.rateCode === 'STANDARD').reduce((s, t) => s + t.ht, 0);
    const ded10 = (input.purchases || []).filter(s => s.rateCode === 'REDUCED_ADD').reduce((s, t) => s + t.ht, 0);
    const vatDeductible = Math.round((ded20 * 0.20 + ded10 * 0.10) * 100) / 100;

    const net = vatCollected - vatDeductible - (input.priorCredit || 0);
    const frequency = (input.priorYearCA || 0) > 1_000_000 ? 'MONTHLY' : 'QUARTERLY';

    const deadline = this.getDeadline(input.periodType || 'MONTHLY', input.periodNumber || 1);

    return {
      vatCollected: { standard: Math.round(collect20 * 0.20 * 100) / 100, reduced: Math.round(collect10 * 0.10 * 100) / 100, total: vatCollected },
      vatDeductible,
      netVAT: net,
      vatPayable: Math.max(0, net),
      vatCredit: Math.abs(Math.min(0, net)),
      priorCredit: input.priorCredit || 0,
      filingFrequency: frequency,
      deadline,
    };
  }

  private getDeadline(type: string, num: number): string {
    const now = new Date();
    let year = now.getFullYear();
    let month = type === 'MONTHLY' ? num + 1 : num * 3 + 1;
    if (month > 12) { year++; month -= 12; }
    return `${year}-${String(month).padStart(2, '0')}-20`;
  }
}

export interface TVATransaction { ht: number; rateCode: string; }
export interface TVAInput { sales?: TVATransaction[]; purchases?: TVATransaction[]; priorCredit?: number; priorYearCA?: number; periodType?: string; periodNumber?: number; }
export interface TVAResult {
  vatCollected: { standard: number; reduced: number; total: number };
  vatDeductible: number; netVAT: number; vatPayable: number; vatCredit: number;
  priorCredit: number; filingFrequency: string; deadline: string;
}
