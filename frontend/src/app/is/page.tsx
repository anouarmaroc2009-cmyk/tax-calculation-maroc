'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

interface Form {
  fiscalYear: number; companyType: string; netAccountingProfit: number; totalRevenue: number;
  financialIncome: number; subsidies: number; operatingMonths: number; investmentAgreementAmount: number;
  reintegrations: { type: string; category: string; description: string; amount: number }[];
  deductions: { type: string; category: string; description: string; amount: number }[];
  priorYearLosses: { originYear: number; type: string; remaining: number }[];
}

export default function ISPage() {
  const [form, setForm] = useState<Form>({
    fiscalYear: 2026, companyType: 'STANDARD', netAccountingProfit: 500000, totalRevenue: 3000000,
    financialIncome: 50000, subsidies: 0, operatingMonths: 48, investmentAgreementAmount: 0,
    reintegrations: [{ type: 'REINTEGRATION', category: 'vehicle', description: 'Vehicle cap excess', amount: 20000 }],
    deductions: [], priorYearLosses: [],
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const update = (k: keyof Form, v: any) => setForm(f => ({ ...f, [k]: v }));

  async function calc() {
    setLoading(true); setErr('');
    try { const res = await api.is.calculate(form); setResult(res); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const companyTypes = [
    { value: 'STANDARD', label: 'Standard (20% or 35%)' },
    { value: 'CREDIT_INSTITUTION', label: 'Credit Institution / Insurance (40%)' },
    { value: 'CFC', label: 'CFC Company (20% flat)' },
    { value: 'IAZ', label: 'IAZ Company (20% flat)' },
    { value: 'INVESTMENT_AGREEMENT', label: 'Investment Agreement ≥ 1.5B (20%)' },
  ];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-2">Corporate Income Tax (IS) Calculator</h1>
      <p className="text-sm text-gray-500 mb-6">CGI Art. 19-I — 2026 final proportional rates</p>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Company Type</label>
          <select value={form.companyType} onChange={e => update('companyType', e.target.value)}
            className="w-full border rounded p-2 text-sm mt-1">
            {companyTypes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Fiscal Year</label>
          <input type="number" value={form.fiscalYear} onChange={e => update('fiscalYear', +e.target.value)}
            className="w-full border rounded p-2 text-sm mt-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Months Since Startup (MC exemption: ≤ 36)</label>
          <input type="number" value={form.operatingMonths} onChange={e => update('operatingMonths', +e.target.value)}
            className="w-full border rounded p-2 text-sm mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Net Accounting Profit (MAD)</label>
          <input type="number" value={form.netAccountingProfit} onChange={e => update('netAccountingProfit', +e.target.value)}
            className="w-full border rounded p-2 text-sm mt-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Total Revenue (MAD)</label>
          <input type="number" value={form.totalRevenue} onChange={e => update('totalRevenue', +e.target.value)}
            className="w-full border rounded p-2 text-sm mt-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Financial Income (MAD)</label>
          <input type="number" value={form.financialIncome} onChange={e => update('financialIncome', +e.target.value)}
            className="w-full border rounded p-2 text-sm mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">Subsidies (MAD)</label>
          <input type="number" value={form.subsidies} onChange={e => update('subsidies', +e.target.value)}
            className="w-full border rounded p-2 text-sm mt-1" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">Investment Agreement Amount (MAD)</label>
          <input type="number" value={form.investmentAgreementAmount} onChange={e => update('investmentAgreementAmount', +e.target.value)}
            className="w-full border rounded p-2 text-sm mt-1" />
        </div>
        <div></div>
      </div>

      <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
        <p className="text-xs text-gray-500 mb-1"><b>Réintégration active:</b> Vehicle cap excess — 20,000 MAD</p>
        <p className="text-xs text-gray-400">Add more adjustments via the API (reintegrations[] / deductions[])</p>
      </div>

      <button onClick={calc} disabled={loading}
        className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition">
        {loading ? '⏳ Calculating...' : 'Calculate IS'}
      </button>

      {err && <p className="mt-2 text-red-600 text-sm">❌ {err}</p>}

      {result && (
        <div className="mt-6 border rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">📊 IS Calculation — FY {form.fiscalYear}</h2>
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Net Accounting Profit', result.netAccountingProfit],
                ['Total Réintégrations', result.totalReintegrations],
                ['Total Déductions', result.totalDeductions],
                ['Net Taxable Profit (RNI)', result.netTaxableProfit, 'font-bold'],
                ['Rate Applied', result.rateLabel],
                ['Gross IS', result.grossIS],
                ['MC Base', result.mcBase],
                ['Minimum Contribution', result.mcAmount, result.mcExempt ? '(Exempt — startup)' : ''],
                ['⚠ IS Due (max of Gross IS / MC)', result.isDue, 'font-bold'],
                ['Loss Carry-Forward Applied', result.lossCarryForwardApplied],
                ['✅ Net IS Payable', result.netISPayable, 'font-bold text-lg text-blue-700'],
                ['Effective Tax Rate', `${result.effectiveRate}%`],
              ].map(([l, v, extra]) => (
                <tr key={l as string} className="border-b last:border-b-0">
                  <td className={`py-1.5 pr-4 ${(extra as string || '').includes('text-lg') ? '' : 'text-gray-600'}`}>
                    {l}
                  </td>
                  <td className={`py-1.5 font-mono text-right ${extra as string || ''}`}>
                    {typeof v === 'number' ? `${(v as number).toLocaleString()} MAD` : v}
                  </td>
                  <td className="py-1.5 text-gray-400 text-xs pl-2">{(extra as string || '').replace('font-bold', '').replace('text-lg', '').replace('text-blue-700', '') || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {result.quarterlyInstallments?.length > 0 && (
            <div className="mt-5 pt-3 border-t">
              <h3 className="font-semibold text-sm mb-2">📅 Quarterly Installments</h3>
              <div className="grid grid-cols-4 gap-3">
                {result.quarterlyInstallments.map((q: any) => (
                  <div key={q.number} className="border rounded-lg p-3 text-center bg-blue-50">
                    <div className="text-xs text-gray-500">Quarter {q.number}</div>
                    <div className="text-xs text-gray-400">Due {q.dueDate}</div>
                    <div className="font-bold text-blue-700 mt-1">{q.amount.toLocaleString()} MAD</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
