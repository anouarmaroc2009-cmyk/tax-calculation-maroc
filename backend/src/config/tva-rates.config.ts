export const TVA_RATES_2026 = {
  STANDARD: 0.20,
  REDUCED: 0.10,
  EXPORT: 0,
};

export const DEDUCTION_RIGHT_MATRIX = {
  STANDARD: 'FULL' as const,
  REDUCED_ADD: 'FULL' as const,
  REDUCED_SDD: 'NONE' as const,
  EXPORT_ADD: 'FULL' as const,
  EXEMPT_SDD: 'NONE' as const,
};
