'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function TVAPage() {
  const [form, setForm] = useState({
    periodType: 'MONTHLY', periodNumber: 1,
    sales: [{ ht: 500000, rateCode: 'STANDARD' }, { ht: 100000, rateCode: 'REDUCED_ADD' }],
    purchases: [{ ht: 300000, rateCode: 'STANDARD' }, { ht: 50000, rateCode: 'REDUCED_ADD' }],
    priorCredit: 0, priorYearCA: 2000000,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const updSale = (i: number, k: string, v: any) => {
    const copy = [...form.sales]; copy[i] = { ...copy[i], [k]: v }; setForm(f => ({ ...f, sales: copy }));
  };
  const updPurch = (i: number, k: string, v: any) => {
    const copy = [...form.purchases]; copy[i] = { ...copy[i], [k]: v }; setForm(f => ({ ...f, purchases: copy }));
  };

  const rateOptions = ['STANDARD', 'REDUCED_ADD', 'REDUCED_SDD', 'EXEMPT_SDD'];
  const purchRateOptions = ['STANDARD', 'REDUCED_ADD', 'EXEMPT_SDD'];

  async function calc() {
    setLoading(true);
    try { const res = await api.tva.calculate(form); setResult(res); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold mb-2">VAT (TVA) Calculator</h1>
      <p className="text-sm text-gray-500 mb-6">Post-2026 reform — 20% / 10% rates</p>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="font-semibold text-sm mb-2">Sales (HT — MAD)</h2>
          {form.sales.map((s, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input type="number" value={s.ht} onChange={e => updSale(i, 'ht', +e.value)}
                className="flex-1 border rounded p-1 text-sm" placeholder="Amount" />
              <select value={s.rateCode} onChange={e => updSale(i, 'rateCode', e.target.value)}
                className="w-32 border rounded p-1 text-sm">
                {rateOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => setForm(f => ({ ...f, sales: [...f.sales, { ht: 0, rateCode: 'STANDARD' }] }))}
            className="text-xs text-blue-600 mt-1">+ Add Sale</button>
        </div>

        <div>
          <h2 className="font-semibold text-sm mb-2">Purchases (HT — MAD)</h2>
          {form.purchases.map((p, i) => (
            <div key={i} className="flex gap-2 mb-1">
              <input type="number" value={p.ht} onChange={e => updPurch(i, 'ht', +e.value)}
                className="flex-1 border rounded p-1 text-sm" placeholder="Amount" />
              <select value={p.rateCode} onChange={e => updPurch(i, 'rateCode', e.target.value)}
                className="w-32 border rounded p-1 text-sm">
                {purchRateOptions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => setForm(f => ({ ...f, purchases: [...f.purchases, { ht: 0, rateCode: 'STANDARD' }] }))}
            className="text-xs text-blue-600 mt-1">+ Add Purchase</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div><label className="text-xs font-medium">Prior Credit (MAD)</label>
          <input type="number" value={form.priorCredit} onChange={e => setForm(f => ({ ...f, priorCredit: +e.value }))}
            className="w-full border rounded p-2 text-sm" /></div>
        <div><label className="text-xs font-medium">Prior Year CA (MAD) — determines filing frequency</label>
          <input type="number" value={form.priorYearCA} onChange={e => setForm(f => ({ ...f, priorYearCA: +e.value }))}
            className="w-full border rounded p-2 text-sm" /></div>
      </div>

      <button onClick={calc} disabled={loading}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
        {loading ? 'Calculating...' : 'Calculate TVA'}
      </button>

      {result && (
        <div className="mt-6 border rounded-lg bg-white p-6">
          <h2 className="text-lg font-semibold mb-3">TVA Result</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b"><td>VAT Collected (20%)</td><td className="text-right font-mono">{result.vatCollected.standard.toLocaleString()} MAD</td></tr>
              <tr className="border-b"><td>VAT Collected (10%)</td><td className="text-right font-mono">{result.vatCollected.reduced.toLocaleString()} MAD</td></tr>
              <tr className="border-b"><td className="font-semibold">Total VAT Collected</td><td className="text-right font-mono font-semibold">{result.vatCollected.total.toLocaleString()} MAD</td></tr>
              <tr className="border-b"><td>VAT Deductible</td><td className="text-right font-mono">({result.vatDeductible.toLocaleString()} MAD)</td></tr>
              <tr className="border-b"><td>Prior Credit</td><td className="text-right font-mono">({result.priorCredit.toLocaleString()} MAD)</td></tr>
              {result.vatPayable > 0 ? (
                <tr className="font-bold"><td className="text-lg">VAT Payable</td><td className="text-right text-lg text-red-600">{result.vatPayable.toLocaleString()} MAD</td></tr>
              ) : (
                <tr className="font-bold text-green-600"><td className="text-lg">VAT Credit (to carry forward)</td><td className="text-right text-lg">{result.vatCredit.toLocaleString()} MAD</td></tr>
              )}
              <tr><td>Filing Frequency</td><td className="text-right">{result.filingFrequency}</td></tr>
              <tr><td>Deadline</td><td className="text-right">{result.deadline}</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
