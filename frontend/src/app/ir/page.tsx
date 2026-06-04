'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function IRPage() {
  const [form, setForm] = useState({
    salaries: [{ gross: 120000, cnss: 4860, amo: 2430, pension: 6000, otherDeductions: 0 }],
    rentalIncome: [{ gross: 90000 }],
    movableCapitalIncome: [] as { gross: number; withholdingAmount: number; isFinal: boolean }[],
    dependents: 2,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addSalary = () => setForm(f => ({ ...f, salaries: [...f.salaries, { gross: 0, cnss: 0, amo: 0, pension: 0, otherDeductions: 0 }] }));
  const updSal = (i: number, k: string, v: number) => {
    const s = [...form.salaries]; s[i] = { ...s[i], [k]: v }; setForm(f => ({ ...f, salaries: s }));
  };

  async function calc() {
    setLoading(true);
    try { const res = await api.ir.calculate(form); setResult(res); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const salaryFields = [
    { key: 'gross', label: 'Gross Salary' },
    { key: 'cnss', label: 'CNSS' },
    { key: 'amo', label: 'AMO' },
    { key: 'pension', label: 'Pension' },
    { key: 'otherDeductions', label: 'Other' },
  ];

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-2">Individual Income Tax (IR) Calculator</h1>
      <p className="text-sm text-gray-500 mb-6">CGI Art. 73 — 2026 progressive scale (0% – 38%)</p>

      <div className="mb-6">
        <h2 className="font-semibold text-sm mb-2">1. Salary Income</h2>
        {form.salaries.map((s, i) => (
          <div key={i} className="grid grid-cols-5 gap-2 mb-2 p-2 bg-gray-50 rounded">
            {salaryFields.map(f => (
              <div key={f.key}>
                <label className="text-xs text-gray-500">{f.label}</label>
                <input type="number" value={(s as any)[f.key]} onChange={e => updSal(i, f.key, +e.target.value)}
                  className="w-full border rounded p-1 text-sm" />
              </div>
            ))}
          </div>
        ))}
        <button onClick={addSalary} className="text-sm text-blue-600 hover:underline">+ Add another salary</button>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold text-sm mb-2">2. Rental Income (Annual Gross)</h2>
        {form.rentalIncome.map((r, i) => (
          <div key={i} className="max-w-xs mb-1">
            <input type="number" value={r.gross} onChange={e => {
              const copy = [...form.rentalIncome]; copy[i] = { ...copy[i], gross: +e.target.value }; setForm(f => ({ ...f, rentalIncome: copy }));
            }} className="w-full border rounded p-1 text-sm" placeholder="MAD/year" />
          </div>
        ))}
        <button onClick={() => setForm(f => ({ ...f, rentalIncome: [...f.rentalIncome, { gross: 0 }] }))}
          className="text-sm text-blue-600 hover:underline">+ Add property</button>
      </div>

      <div className="mb-6">
        <h2 className="font-semibold text-sm mb-2">3. Family</h2>
        <label className="text-xs text-gray-500">Number of dependents</label>
        <input type="number" value={form.dependents} onChange={e => setForm(f => ({ ...f, dependents: +e.target.value }))}
          className="w-24 border rounded p-1 text-sm ml-2" />
      </div>

      <button onClick={calc} disabled={loading}
        className="px-8 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition">
        {loading ? '⏳ Calculating...' : 'Calculate IR'}
      </button>

      {result && (
        <div className="mt-6 border rounded-lg bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-3">📊 IR Calculation — FY 2026</h2>

          <table className="w-full text-sm mb-4">
            <thead><tr className="text-gray-500 text-xs"><th className="text-left pb-1">Category</th><th className="text-right pb-1">Net Amount</th><th className="text-right pb-1">WHT Paid</th><th className="text-right pb-1">Type</th></tr></thead>
            <tbody>
              {result.categories?.map((c: any) => (
                <tr key={c.category} className="border-b">
                  <td className="py-1.5">{c.name}</td>
                  <td className="py-1.5 text-right font-mono">{c.net.toLocaleString()} MAD</td>
                  <td className="py-1.5 text-right font-mono">{c.withholding.toLocaleString()} MAD</td>
                  <td className="py-1.5 text-right text-xs">
                    <span className={`px-1.5 py-0.5 rounded ${c.classification === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {c.classification}
                    </span>
                    {c.isFinal && <span className="ml-1 text-gray-400">(Final)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between text-sm"><span>Global Net Taxable Income</span><span className="font-bold font-mono">{result.globalNetTaxableIncome.toLocaleString()} MAD</span></div>
            <div className="flex justify-between text-sm"><span>Gross IR (progressive scale)</span><span className="font-mono">{result.grossIR.toLocaleString()} MAD</span></div>
            <div className="flex justify-between text-sm"><span>Family Reduction</span><span className="font-mono text-green-600">-{result.familyReduction.toLocaleString()} MAD</span></div>
            <div className="flex justify-between text-sm"><span>Withholding Tax Credits</span><span className="font-mono text-green-600">-{result.withholdingCredits.toLocaleString()} MAD</span></div>
            {result.refund > 0 ? (
              <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2"><span>✅ Refund Due</span><span>{result.refund.toLocaleString()} MAD</span></div>
            ) : (
              <div className="flex justify-between text-lg font-bold border-t pt-2"><span>✅ Net IR Payable</span><span>{result.netIRPayable.toLocaleString()} MAD</span></div>
            )}
            <div className="flex justify-between text-xs text-gray-400"><span>Effective Rate</span><span>{result.effectiveRate}%</span></div>
          </div>

          {result.bracketDetail?.length > 0 && (
            <div className="mt-4 pt-3 border-t">
              <h3 className="font-semibold text-sm mb-2">📈 Progressive Scale Breakdown</h3>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden flex">
                {result.bracketDetail.map((b: any, i: number) => {
                  const colors = ['bg-green-400', 'bg-blue-400', 'bg-yellow-400', 'bg-orange-400', 'bg-red-400', 'bg-red-600'];
                  const pct = result.globalNetTaxableIncome > 0 ? (b.amount / result.globalNetTaxableIncome) * 100 : 0;
                  return <div key={i} className={`${colors[i] || 'bg-gray-400'} h-3`} style={{ width: `${pct}%` }} title={`${b.from}-${b.to}: ${b.rate * 100}%`} />;
                })}
              </div>
              <table className="w-full text-xs mt-2">
                <thead><tr className="text-gray-500"><th className="text-left">Bracket (MAD)</th><th className="text-right">Rate</th><th className="text-right">Amount</th><th className="text-right">Tax</th></tr></thead>
                <tbody>
                  {result.bracketDetail.map((b: any, i: number) => (
                    <tr key={i} className="border-b"><td>{b.from} – {b.to}</td><td className="text-right">{b.rate * 100}%</td><td className="text-right">{b.amount.toLocaleString()}</td><td className="text-right">{b.tax.toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
