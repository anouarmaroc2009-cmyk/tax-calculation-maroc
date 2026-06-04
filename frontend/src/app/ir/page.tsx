'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function IRPage() {
  const [form, setForm] = useState({
    salaries: [{ gross: 300000, cnss: 25680, amo: 12000, pension: 18000, otherDeductions: 0 }],
    rentalIncome: [{ gross: 120000 }],
    movableCapitalIncome: [] as { gross: number; withholdingAmount: number; isFinal: boolean }[],
    dependents: 2,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  function updSal(i: number, k: string, v: number) {
    const copy = [...form.salaries]; copy[i] = { ...copy[i], [k]: v }; setForm(f => ({ ...f, salaries: copy }));
  }

  const scale = [
    { from: 0, to: 30000, rate: 0, label: '0%' },
    { from: 30001, to: 50000, rate: 10, label: '10%' },
    { from: 50001, to: 60000, rate: 20, label: '20%' },
    { from: 60001, to: 80000, rate: 30, label: '30%' },
    { from: 80001, to: 180000, rate: 34, label: '34%' },
    { from: 180001, to: null, rate: 38, label: '38%' },
  ];

  async function calc() {
    setLoading(true); setErr('');
    try { const res = await api.ir.calculate(form); setResult(res); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-2xl">👤</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impôt sur le Revenu (IR)</h1>
          <p className="text-sm text-gray-500">Barème progressif 0–38% — 6 catégories de revenus</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Barème IR 2026</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase">Tranche</th>
                <th className="text-right py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Taux</th>
                <th className="text-right py-2 px-4 text-xs font-semibold text-gray-500 uppercase">Déduction</th>
              </tr>
            </thead>
            <tbody>
              {scale.map(s => (
                <tr key={s.label} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="py-2 pr-4 text-gray-700">{s.from.toLocaleString()} — {s.to ? `${s.to.toLocaleString()} MAD` : '∞'}</td>
                  <td className="text-right py-2 px-4 font-mono font-semibold">{s.rate}%</td>
                  <td className="text-right py-2 px-4 font-mono text-gray-500">{s.rate > 0 ? `${[0,3000,8000,14000,17200,24400][scale.indexOf(s)]} MAD` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Revenus salariaux (Catégorie 1)</h2>
        </div>
        {form.salaries.map((s, i) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 bg-gray-50/50 rounded-xl">
            <div><label className="input-label">Salaire brut</label>
              <input type="number" value={s.gross} onChange={e => updSal(i, 'gross', +e.target.value)} className="input-field" /></div>
            <div><label className="input-label">CNSS</label>
              <input type="number" value={s.cnss} onChange={e => updSal(i, 'cnss', +e.target.value)} className="input-field" /></div>
            <div><label className="input-label">AMO</label>
              <input type="number" value={s.amo} onChange={e => updSal(i, 'amo', +e.target.value)} className="input-field" /></div>
            <div><label className="input-label">Caisse retraite</label>
              <input type="number" value={s.pension} onChange={e => updSal(i, 'pension', +e.target.value)} className="input-field" /></div>
            <div><label className="input-label">Autres déductions</label>
              <input type="number" value={s.otherDeductions} onChange={e => updSal(i, 'otherDeductions', +e.target.value)} className="input-field" /></div>
          </div>
        ))}
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Revenus fonciers (Catégorie 4)</h2>
        </div>
        {form.rentalIncome.map((r, i) => (
          <div key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50/50 rounded-xl">
            <div><label className="input-label">Loyer brut annuel</label>
              <input type="number" value={r.gross} onChange={e => { const copy = [...form.rentalIncome]; copy[i] = { ...copy[i], gross: +e.target.value }; setForm(f => ({ ...f, rentalIncome: copy })); }} className="input-field" /></div>
            <div className="flex items-center text-sm text-gray-500 pt-6">
              <span className="badge-blue">Abattement 40%</span>
              <span className="ml-2">Revenu imposable: {Math.round(r.gross * 0.6).toLocaleString()} MAD</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div>
            <label className="input-label">Nombre de personnes à charge</label>
            <input type="number" value={form.dependents} onChange={e => setForm(f => ({ ...f, dependents: +e.target.value }))} className="input-field w-24" />
          </div>
          <div className="text-sm text-gray-500 pt-5">
            <span className="badge-green">360 MAD / personne</span>
            <span className="ml-2">Réduction famille: {form.dependents * 360} MAD</span>
          </div>
        </div>
      </div>

      <button onClick={calc} disabled={loading} className="btn-primary min-w-[160px]">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Calcul...
          </span>
        ) : 'Calculer IR'}
      </button>

      {err && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm text-red-700 flex items-center gap-2"><span>⚠️</span> {err}</p>
        </div>
      )}

      {result && (
        <div className="card divide-y divide-gray-50 overflow-hidden">
          <div className="p-5 flex items-center justify-between bg-gradient-to-r from-emerald-50/50 to-transparent">
            <h3 className="font-semibold text-gray-900">Résultat IR</h3>
            <span className="text-xs text-gray-400">Taux effectif: {result.effectiveRate}%</span>
          </div>

          {result.categories?.map((c: any) => (
            <div key={c.category} className="px-5 py-3 flex items-center justify-between hover:bg-gray-50/50">
              <div>
                <span className="font-medium text-gray-900">{c.name}</span>
                <span className={`ml-2 badge ${c.classification === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`}>{c.classification}</span>
              </div>
              <div className="text-right font-mono text-sm">
                <div className="text-gray-600">{c.net.toLocaleString()} MAD</div>
                {c.withholding > 0 && <div className="text-xs text-gray-400">RAS: {c.withholding.toLocaleString()} MAD</div>}
              </div>
            </div>
          ))}

          <table className="result-table">
            <tbody>
              <tr><td className="font-semibold">Revenu net global imposable</td><td className="text-right font-bold font-mono">{result.globalNetTaxableIncome.toLocaleString()} MAD</td></tr>
              <tr><td>IR brut (barème progressif)</td><td className="text-right font-mono">{result.grossIR.toLocaleString()} MAD</td></tr>
              <tr><td>Réduction famille</td><td className="text-right font-mono text-emerald-600">-{result.familyReduction.toLocaleString()} MAD</td></tr>
              <tr><td>IR après réduction famille</td><td className="text-right font-mono font-semibold">{result.irAfterFamily.toLocaleString()} MAD</td></tr>
              <tr><td>Crédits d'impôt (RAS)</td><td className="text-right font-mono text-emerald-600">-{result.withholdingCredits.toLocaleString()} MAD</td></tr>
              <tr className="bg-emerald-50/50">
                <td className="font-bold text-lg text-gray-900">IR net à payer</td>
                <td className="text-right font-bold text-lg font-mono text-emerald-700">{result.netIRPayable.toLocaleString()} MAD</td>
              </tr>
              {result.refund > 0 && (
                <tr className="bg-blue-50/50">
                  <td className="font-semibold text-blue-700">Remboursement d'impôt</td>
                  <td className="text-right font-bold font-mono text-blue-700">{result.refund.toLocaleString()} MAD</td>
                </tr>
              )}
            </tbody>
          </table>

          {result.bracketDetail?.length > 0 && (
            <div className="p-5 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Détail par tranche</h4>
              <div className="space-y-2">
                {result.bracketDetail.map((b: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-gray-400 font-mono">{b.from.toLocaleString()}–{b.to}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500" style={{ width: `${(b.tax / result.grossIR * 100)}%` }}></div>
                    </div>
                    <span className="w-20 text-right text-xs font-mono text-gray-600">{b.tax.toLocaleString()} MAD</span>
                    <span className="w-10 text-right text-xs text-gray-400">{(b.rate * 100).toFixed(0)}%</span>
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
