'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function PenaltiesPage() {
  const [form, setForm] = useState({
    taxType: 'IS', taxAmount: 100000, dueDate: '2026-04-30', paymentDate: '2026-06-15',
  });
  const [result, setResult] = useState<any>(null);

  async function calc() {
    try { const r = await api.penalties.calculate(form); setResult(r); }
    catch (e) { console.error(e); }
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Penalty Calculator (Art. 208)</h1>

      <div className="space-y-3 mb-6">
        <div><label className="text-xs font-medium">Tax Type</label>
          <select value={form.taxType} onChange={e => setForm(f => ({ ...f, taxType: e.target.value }))}
            className="w-full border rounded p-2 text-sm">
            {['IS','IR','TVA','WHT'].map(t => <option key={t} value={t}>{t}</option>)}
          </select></div>
        <div><label className="text-xs font-medium">Tax Amount (MAD)</label>
          <input type="number" value={form.taxAmount} onChange={e => setForm(f => ({ ...f, taxAmount: +e.target.value }))}
            className="w-full border rounded p-2 text-sm" /></div>
        <div><label className="text-xs font-medium">Due Date</label>
          <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
            className="w-full border rounded p-2 text-sm" /></div>
        <div><label className="text-xs font-medium">Payment Date</label>
          <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
            className="w-full border rounded p-2 text-sm" /></div>
      </div>

      <button onClick={calc} className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">Calculate Penalty</button>

      {result && (
        <div className="mt-6 border rounded-lg bg-white p-6">
          <h2 className="font-semibold mb-3">Penalty Result</h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b"><td>Days Late</td><td className="text-right font-bold">{result.daysLate} days</td></tr>
              <tr className="border-b"><td>Penalty</td><td className="text-right text-red-600">{result.penaltyAmount.toLocaleString()} MAD</td></tr>
              <tr className="border-b"><td>Interest</td><td className="text-right text-yellow-600">{result.interestAmount.toLocaleString()} MAD</td></tr>
              <tr className="font-bold text-lg"><td>Total Due</td><td className="text-right">{result.total.toLocaleString()} MAD</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
