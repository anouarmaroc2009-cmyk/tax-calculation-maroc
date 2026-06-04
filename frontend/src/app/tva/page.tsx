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
  const [err, setErr] = useState('');

  const updSale = (i: number, k: string, v: any) => {
    const copy = [...form.sales]; copy[i] = { ...copy[i], [k]: v }; setForm(f => ({ ...f, sales: copy }));
  };
  const updPurch = (i: number, k: string, v: any) => {
    const copy = [...form.purchases]; copy[i] = { ...copy[i], [k]: v }; setForm(f => ({ ...f, purchases: copy }));
  };

  const rateOptions = [
    { value: 'STANDARD', label: '20% (Standard)' },
    { value: 'REDUCED_ADD', label: '10% (Réduit additionnel)' },
    { value: 'REDUCED_SDD', label: '0% (Export/SDD)' },
    { value: 'EXEMPT_SDD', label: 'Exonéré' },
  ];
  const purchRateOptions = [
    { value: 'STANDARD', label: '20% (Déductible)' },
    { value: 'REDUCED_ADD', label: '10% (Déductible)' },
    { value: 'EXEMPT_SDD', label: 'Non déductible' },
  ];

  async function calc() {
    setLoading(true); setErr('');
    try { const res = await api.tva.calculate(form); setResult(res); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-2xl">📊</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Taxe sur la Valeur Ajoutée (TVA)</h1>
          <p className="text-sm text-gray-500">Régime post-réforme 2026 — Taux 20% / 10%</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Période de déclaration</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Type de période</label>
            <select value={form.periodType} onChange={e => setForm(f => ({ ...f, periodType: e.target.value }))} className="select-field">
              <option value="MONTHLY">Mensuelle</option>
              <option value="QUARTERLY">Trimestrielle</option>
            </select>
          </div>
          <div>
            <label className="input-label">Période n°</label>
            <input type="number" min={1} max={12} value={form.periodNumber} onChange={e => setForm(f => ({ ...f, periodNumber: +e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="input-label">CA N-1 (pour déterminer fréquence)</label>
            <div className="relative">
              <input type="number" value={form.priorYearCA} onChange={e => setForm(f => ({ ...f, priorYearCA: +e.target.value }))} className="input-field pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Ventes</h2>
            </div>
            <span className="text-xs text-gray-400">HT</span>
          </div>
          <div className="space-y-2">
            {form.sales.map((s, i) => (
              <div key={i} className="flex gap-2">
                <div className="relative flex-1">
                  <input type="number" value={s.ht} onChange={e => updSale(i, 'ht', +e.target.value)} className="input-field pr-14" placeholder="Montant HT" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
                </div>
                <select value={s.rateCode} onChange={e => updSale(i, 'rateCode', e.target.value)} className="select-field w-40">
                  {rateOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={() => setForm(f => ({ ...f, sales: [...f.sales, { ht: 0, rateCode: 'STANDARD' }] }))}
            className="text-xs font-medium text-purple-600 hover:text-purple-700">+ Ajouter une vente</button>
        </div>

        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Achats</h2>
            </div>
            <span className="text-xs text-gray-400">HT</span>
          </div>
          <div className="space-y-2">
            {form.purchases.map((p, i) => (
              <div key={i} className="flex gap-2">
                <div className="relative flex-1">
                  <input type="number" value={p.ht} onChange={e => updPurch(i, 'ht', +e.target.value)} className="input-field pr-14" placeholder="Montant HT" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
                </div>
                <select value={p.rateCode} onChange={e => updPurch(i, 'rateCode', e.target.value)} className="select-field w-40">
                  {purchRateOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <button onClick={() => setForm(f => ({ ...f, purchases: [...f.purchases, { ht: 0, rateCode: 'STANDARD' }] }))}
            className="text-xs font-medium text-purple-600 hover:text-purple-700">+ Ajouter un achat</button>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Crédit antérieur</h2>
        </div>
        <div className="relative max-w-xs">
          <input type="number" value={form.priorCredit} onChange={e => setForm(f => ({ ...f, priorCredit: +e.target.value }))} className="input-field pr-16" placeholder="0" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
        </div>
      </div>

      <button onClick={calc} disabled={loading} className="btn-primary min-w-[160px]">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Calcul...
          </span>
        ) : 'Calculer TVA'}
      </button>

      {err && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm text-red-700 flex items-center gap-2"><span>⚠️</span> {err}</p>
        </div>
      )}

      {result && (
        <div className="card divide-y divide-gray-50 overflow-hidden">
          <div className="p-5 flex items-center justify-between bg-gradient-to-r from-purple-50/50 to-transparent">
            <h3 className="font-semibold text-gray-900">Résultat TVA</h3>
            <div className="flex items-center gap-3">
              <span className="badge-blue">{result.filingFrequency}</span>
              <span className="text-xs text-gray-400">Échéance: {result.deadline}</span>
            </div>
          </div>
          <table className="result-table">
            <tbody>
              <tr><td>TVA collectée (20%)</td><td className="text-right font-mono">{result.vatCollected?.standard?.toLocaleString()} MAD</td></tr>
              <tr><td>TVA collectée (10%)</td><td className="text-right font-mono">{result.vatCollected?.reduced?.toLocaleString()} MAD</td></tr>
              <tr className="border-b-2 border-gray-100">
                <td className="font-semibold">Total TVA collectée</td>
                <td className="text-right font-semibold font-mono">{result.vatCollected?.total?.toLocaleString()} MAD</td>
              </tr>
              <tr><td>TVA déductible</td><td className="text-right font-mono text-red-600">(-{result.vatDeductible?.toLocaleString()} MAD)</td></tr>
              <tr><td>Crédit antérieur</td><td className="text-right font-mono text-red-600">(-{result.priorCredit?.toLocaleString()} MAD)</td></tr>
              {result.vatPayable > 0 ? (
                <tr className="bg-red-50/50">
                  <td className="font-bold text-lg text-gray-900">TVA à payer</td>
                  <td className="text-right font-bold text-lg font-mono text-red-600">{result.vatPayable?.toLocaleString()} MAD</td>
                </tr>
              ) : (
                <tr className="bg-green-50/50">
                  <td className="font-bold text-lg text-gray-900">Crédit de TVA (reportable)</td>
                  <td className="text-right font-bold text-lg font-mono text-green-600">{result.vatCredit?.toLocaleString()} MAD</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
