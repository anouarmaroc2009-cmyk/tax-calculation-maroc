export interface DepreciationConfig {
  category: string;
  slRate: number;
  usefulLife: number;
  eligibleDeclining: boolean;
  decliningCoefficients: { years: number; coefficient: number }[];
  passengerVehicleCap: number;
}

export const DEPRECIATION_RATES: DepreciationConfig[] = [
  { category: 'buildings', slRate: 0.04, usefulLife: 25, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 0 },
  { category: 'industrial_buildings', slRate: 0.05, usefulLife: 20, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 0 },
  { category: 'light_construction', slRate: 0.10, usefulLife: 10, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 0 },
  { category: 'fixtures', slRate: 0.10, usefulLife: 10, eligibleDeclining: true, decliningCoefficients: [
    { years: 4, coefficient: 1.5 }, { years: 6, coefficient: 2 }, { years: 10, coefficient: 3 },
  ], passengerVehicleCap: 0 },
  { category: 'machinery', slRate: 0.10, usefulLife: 10, eligibleDeclining: true, decliningCoefficients: [
    { years: 4, coefficient: 1.5 }, { years: 6, coefficient: 2 }, { years: 10, coefficient: 3 },
  ], passengerVehicleCap: 0 },
  { category: 'transport_equipment', slRate: 0.20, usefulLife: 5, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 0 },
  { category: 'passenger_vehicles', slRate: 0.20, usefulLife: 5, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 400_000 },
  { category: 'office_furniture', slRate: 0.10, usefulLife: 10, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 0 },
  { category: 'office_equipment', slRate: 0.15, usefulLife: 7, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 0 },
  { category: 'computer_equipment', slRate: 0.25, usefulLife: 4, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 0 },
  { category: 'software', slRate: 0.3333, usefulLife: 3, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 0 },
  { category: 'preliminary_expenses', slRate: 0.20, usefulLife: 5, eligibleDeclining: false, decliningCoefficients: [], passengerVehicleCap: 0 },
];
