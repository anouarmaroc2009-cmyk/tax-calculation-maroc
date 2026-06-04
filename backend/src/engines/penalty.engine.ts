export class PenaltyEngine {
  calculate(input: PenaltyInput): PenaltyResult {
    const daysLate = input.paymentDate ? Math.max(0, Math.ceil((new Date(input.paymentDate).getTime() - new Date(input.dueDate).getTime()) / (1000 * 60 * 60 * 24))) : 0;
    let penalty = 0, interest = 0;

    if (daysLate > 0) {
      const isVAT = input.taxType === 'TVA' || input.taxType === 'WHT';
      if (daysLate <= 30) {
        penalty = input.taxAmount * (isVAT ? 0.05 : 0.05);
      } else {
        penalty = input.taxAmount * (isVAT ? 0.20 : 0.10);
        interest = input.taxAmount * 0.05; // first month
        const extraMonths = Math.ceil(daysLate / 30) - 1;
        if (extraMonths > 0) interest += input.taxAmount * 0.005 * extraMonths;
      }
    }

    const total = Math.round((penalty + interest) * 100) / 100;
    return { penaltyAmount: Math.round(penalty * 100) / 100, interestAmount: Math.round(interest * 100) / 100, total, daysLate, taxType: input.taxType };
  }
}
export interface PenaltyInput { taxType: string; taxAmount: number; dueDate: string; paymentDate?: string; }
export interface PenaltyResult { penaltyAmount: number; interestAmount: number; total: number; daysLate: number; taxType: string; }
