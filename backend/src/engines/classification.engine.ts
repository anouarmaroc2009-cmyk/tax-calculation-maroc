export class ClassificationEngine {
  classifyIncome(type: string, context: ClassContext): ClassResult {
    const map: Record<string, { default: string; reclass?: { condition: () => boolean; to: string }[] }> = {
      SALARY: { default: 'ACTIVE' },
      PROFESSIONAL: { default: 'ACTIVE' },
      DIVIDEND: { default: 'PASSIVE', reclass: [{ condition: () => context.isSecuritiesTrader || false, to: 'ACTIVE' }] },
      INTEREST: { default: 'PASSIVE', reclass: [{ condition: () => context.isProfessional || false, to: 'ACTIVE' }] },
      RENTAL: { default: 'PASSIVE', reclass: [{ condition: () => (context.numProperties || 0) > 5, to: 'ACTIVE' }] },
      CAPITAL_GAIN: { default: 'PASSIVE', reclass: [{ condition: () => ((context.portfolioHours || 0) / Math.max(context.workHours || 1, 1)) > 0.25, to: 'ACTIVE' }] },
    };
    const rule = map[type] || { default: 'ACTIVE' };
    let classification = rule.default;
    let reason = `Default: ${rule.default}`;
    if (rule.reclass) {
      for (const r of rule.reclass) {
        if (r.condition()) { classification = r.to; reason = `Reclassified to ${r.to}`; break; }
      }
    }
    const savings = classification === 'PASSIVE' ? this.estimatePassiveSavings(type) : 0;
    return { classification, reasoning: reason, savings, riskLevel: classification === 'ACTIVE' ? 'LOW' : 'LOW' };
  }

  private estimatePassiveSavings(type: string): number {
    if (type === 'DIVIDEND') return 0.10; // 10% final vs up to 38% IR
    if (type === 'INTEREST') return 0.30;
    if (type === 'RENTAL') return 0.15;
    return 0;
  }
}

export interface ClassContext { isSecuritiesTrader?: boolean; isProfessional?: boolean; numProperties?: number; portfolioHours?: number; workHours?: number; }
export interface ClassResult { classification: string; reasoning: string; savings: number; riskLevel: string; }
