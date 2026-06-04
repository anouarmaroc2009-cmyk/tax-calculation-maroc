'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

const rateOpts = [
  { value: 'STANDARD', label: '20% (Standard)' },
  { value: 'REDUCED_ADD', label: '10% (Réduit)' },
  { value: 'REDUCED_SDD', label: '0% (Export/SDD)' },
  { value: 'EXEMPT_SDD', label: 'Exonéré' },
];
const purchOpts = [
  { value: 'STANDARD', label: '20%' },
  { value: 'REDUCED_ADD', label: '10%' },
  { value: 'EXEMPT_SDD', label: 'Non déd.' },
];

export default function TVAPage() {
  const [form, setForm] = useState({
    periodType: 'MONTHLY', periodNumber: 1,
    sales: [{ ht: 500000, rateCode: 'STANDARD' }, { ht: 100000, rateCode: 'REDUCED_ADD' }],
    purchases: [{ ht: 300000, rateCode: 'STANDARD' }, { ht: 50000, rateCode: 'REDUCED_ADD' }],
    priorCredit: 0, priorYearCA: 2000000,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const updSale = (i: number, k: string, v: any) => {
    const copy = [...form.sales]; copy[i] = { ...copy[i], [k]: v }; setForm(f => ({ ...f, sales: copy }));
  };
  const updPurch = (i: number, k: string, v: any) => {
    const copy = [...form.purchases]; copy[i] = { ...copy[i], [k]: v }; setForm(f => ({ ...f, purchases: copy }));
  };

  async function calc() {
    setLoading(true); setErr('');
    try { const res = await api.tva.calculate(form); setResult(res); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-lg">📊</div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Taxe sur la Valeur Ajoutée (TVA)</h1>
          <p className="text-sm text-gray-500">Régime post-réforme 2026 — 20% / 10%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-600 uppercase">Période</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type</label>
            <select value={form.periodType} onChange={e => setForm(f => ({ ...f, periodType: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
              <option value="MONTHLY">Mensuelle</option>
              <option value="QUARTERLY">Trimestrielle</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">N° période</label>
            <input type="number" value={form.periodNumber} onChange={e => setForm(f => ({ ...f, periodNumber: +e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">CA N-1</label>
            <input type="number" value={form.priorYearCA} onChange={e => setForm(f => ({ ...f, priorYearCA: +e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-600 uppercase">Ventes (HT)</p>
          {form.sales.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input type="number" value={s.ht} onChange={e => updSale(i, 'ht', +e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" placeholder="Montant" />
              <select value={s.rateCode} onChange={e => updSale(i, 'rateCode', e.target.value)}
                className="w-32 border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                {rateOpts.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => setForm(f => ({ ...f, sales: [...f.sales, { ht: 0, rateCode: 'STANDARD' }] }))}
            className="text-xs text-purple-600 font-medium hover:text-purple-700">+ Ajouter</button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <p className="text-xs font-semibold text-gray-600 uppercase">Achats (HT)</p>
          {form.purchases.map((p, i) => (
            <div key={i} className="flex gap-2">
              <input type="number" value={p.ht} onChange={e => updPurch(i, 'ht', +e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" placeholder="Montant" />
              <select value={p.rateCode} onChange={e => updPurch(i, 'rateCode', e.target.value)}
                className="w-24 border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                {purchOpts.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          ))}
          <button onClick={() => setForm(f => ({ ...f, purchases: [...f.purchases, { ht: 0, rateCode: 'STANDARD' }] }))}
            className="text-xs text-purple-600 font-medium hover:text-purple-700">+ Ajouter</button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Crédit antérieur</p>
        <div className="relative max-w-xs">
          <input type="number" value={form.priorCredit} onChange={e => setForm(f => ({ ...f, priorCredit: +e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 pr-14" />
          <span className="absolute right-3 top-2 text-xs text-gray-400">MAD</span>
        </div>
      </div>

      <button onClick={calc} disabled={loading}
        className="px-6 py-2.5 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? 'Calcul...' : 'Calculer TVA'}
      </button>

      {err && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {err}</div>}

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-purple-50 to-white border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">Résultat TVA</span>
            <div className="flex items-center gap-3">
              <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">{result.filingFrequency}</span>
              <span className="text-xs text-gray-500">Échéance: {result.deadline}</span>
            </div>
          </div>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-50"><td className="py-2 px-4 text-gray-600">TVA collectée (20%)</td><td className="py-2 px-4 text-right font-mono">{result.vatCollected?.standard?.toLocaleString()} MAD</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-4 text-gray-600">TVA collectée (10%)</td><td className="py-2 px-4 text-right font-mono">{result.vatCollected?.reduced?.toLocaleString()} MAD</td></tr>
              <tr className="border-b border-gray-200"><td className="py-2 px-4 font-semibold">Total collectée</td><td className="py-2 px-4 text-right font-semibold font-mono">{result.vatCollected?.total?.toLocaleString()} MAD</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-4 text-gray-600">TVA déductible</td><td className="py-2 px-4 text-right font-mono text-red-600">-{result.vatDeductible?.toLocaleString()} MAD</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-4 text-gray-600">Crédit antérieur</td><td className="py-2 px-4 text-right font-mono text-red-600">-{result.priorCredit?.toLocaleString()} MAD</td></tr>
              {result.vatPayable > 0 ? (
                <tr className="bg-red-50"><td className="py-3 px-4 font-bold text-gray-900 text-base">TVA à payer</td><td className="py-3 px-4 text-right font-bold font-mono text-red-600 text-base">{result.vatPayable?.toLocaleString()} MAD</td></tr>
              ) : (
                <tr className="bg-green-50"><td className="py-3 px-4 font-bold text-gray-900 text-base">Crédit reportable</td><td className="py-3 px-4 text-right font-bold font-mono text-green-600 text-base">{result.vatCredit?.toLocaleString()} MAD</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
