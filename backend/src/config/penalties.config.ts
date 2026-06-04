export const PENALTY_RATES = {
  lateFiling: {
    within30Days: 0.05,
    after30Days: 0.15,
    automaticTaxation: 0.20,
    correctiveReturn: 0.05,
  },
  latePayment: {
    within30Days: 0.05,
    after30Days: 0.10,
    vatOrWHT: 0.20,
    firstMonthInterest: 0.05,
    subsequentMonthlyInterest: 0.005,
  },
  minimums: {
    registration: 100,
    vehicleTax: 100,
    irAnnual: 500,
  },
};
