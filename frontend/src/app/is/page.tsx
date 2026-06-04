'use client';
import { useState } from 'react';

type CompanyType = 'STANDARD' | 'CREDIT_INSTITUTION' | 'INSURANCE' | 'CFC' | 'IAZ' | 'INVESTMENT_AGREEMENT' | 'MICROFINANCE';

interface FormData {
  netAccountingProfit: number;
  totalRevenue: number;
  financialIncome: number;
  subsidies: number;
  companyType: CompanyType;
  operatingMonths: number;
  investmentAgreementAmount: number;
  reintegrations: number;
  deductions: number;
}

interface Result {
  netTaxableProfit: number;
  rateApplied: number;
  grossIS: number;
  mcAmount: number;
  isDue: number;
  netISPayable: number;
  effectiveTaxRate: number;
}

export default function ISPage() {
  const [form, setForm] = useState<FormData>({
    netAccountingProfit: 500000, totalRevenue: 3000000, financialIncome: 50000,
    subsidies: 0, companyType: 'STANDARD', operatingMonths: 48,
    investmentAgreementAmount: 0, reintegrations: 20000, deductions: 10000,
  });
  const [result, setResult] = useState<Result | null>(null);

  function calculate() {
    const netTaxableProfit = form.netAccountingProfit + form.reintegrations - form.deductions;
    let rate = 0.20;
    if (form.companyType === 'CREDIT_INSTITUTION' || form.companyType === 'INSURANCE') rate = 0.40;
    else if (form.companyType === 'CFC' || form.companyType === 'IAZ') rate = 0.20;
    else if (form.companyType === 'INVESTMENT_AGREEMENT' && form.investmentAgreementAmount >= 1_500_000_000) rate = 0.20;
    else if (form.companyType === 'MICROFINANCE') rate = netTaxableProfit >= 100_000_000 ? 0.35 : 0.20;
    else if (netTaxableProfit >= 100_000_000) rate = 0.35;

    const grossIS = Math.max(0, netTaxableProfit * rate);
    const mcBase = form.totalRevenue + form.financialIncome + form.subsidies;
    const mcAmount = form.operatingMonths <= 36 ? 0 : Math.max(mcBase * 0.0025, 3000);
    const isDue = Math.max(grossIS, mcAmount);
    const netISPayable = isDue;

    setResult({ netTaxableProfit, rateApplied: rate, grossIS, mcAmount, isDue, netISPayable, effectiveTaxRate: netISPayable / (netTaxableProfit || 1) });
  }

  const update = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Corporate Income Tax (IS) Calculator</h1>
      <p className="mb-4 text-sm text-gray-500">CGI Art. 19-I — 2026 final rates</p>

      <div className="mb-6 grid grid-cols-2 gap-4">
        {[
          { k: 'netAccountingProfit', l: 'Net Accounting Profit (MAD)', t: 'number' },
          { k: 'totalRevenue', l: 'Total Revenue (MAD)', t: 'number' },
          { k: 'financialIncome', l: 'Financial Income (MAD)', t: 'number' },
          { k: 'subsidies', l: 'Subsidies (MAD)', t: 'number' },
          { k: 'reintegrations', l: 'Réintégrations (MAD)', t: 'number' },
          { k: 'deductions', l: 'Déductions (MAD)', t: 'number' },
          { k: 'operatingMonths', l: 'Months Since Startup', t: 'number' },
          { k: 'investmentAgreementAmount', l: 'Investment Agreement (MAD)', t: 'number' },
        ].map(f => (
          <div key={f.k}>
            <label className="block text-sm font-medium text-gray-700">{f.l}</label>
            <input type={f.t} value={(form as any)[f.k]} onChange={e => update(f.k as keyof FormData, parseFloat(e.target.value) || 0)}
              className="mt-1 w-full rounded border p-2 text-sm" />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700">Company Type</label>
          <select value={form.companyType} onChange={e => update('companyType', e.target.value)}
            className="mt-1 w-full rounded border p-2 text-sm">
            <option value="STANDARD">Standard</option>
            <option value="CREDIT_INSTITUTION">Credit Institution / Insurance</option>
            <option value="CFC">CFC Company</option>
            <option value="IAZ">IAZ Company</option>
            <option value="INVESTMENT_AGREEMENT">Investment Agreement ≥ 1.5B</option>
            <option value="MICROFINANCE">Microfinance (Transition)</option>
          </select>
        </div>
      </div>

      <button onClick={calculate} className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">
        Calculate IS
      </button>

      {result && (
        <div className="mt-6 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Results — FY 2026</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <ResultRow label="Net Taxable Profit" value={result.netTaxableProfit} />
            <ResultRow label="Rate Applied" value={`${(result.rateApplied * 100).toFixed(1)}%`} />
            <ResultRow label="Gross IS" value={result.grossIS} />
            <ResultRow label="Minimum Contribution" value={result.mcAmount} />
            <ResultRow label="IS Due (max)" value={result.isDue} bold />
            <ResultRow label="Net IS Payable" value={result.netISPayable} bold />
            <ResultRow label="Effective Tax Rate" value={`${(result.effectiveTaxRate * 100).toFixed(2)}%`} />
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value, bold }: { label: string; value: number | string; bold?: boolean }) {
  return (
    <div className={`flex justify-between border-b py-1 ${bold ? 'font-semibold' : ''}`}>
      <span>{label}</span>
      <span>{typeof value === 'number' ? `${value.toLocaleString()} MAD` : value}</span>
    </div>
  );
}
