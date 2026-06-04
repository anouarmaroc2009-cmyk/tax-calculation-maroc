'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

const scale = [
  { from: 0, to: 30000, rate: 0, deduct: 0 },
  { from: 30001, to: 50000, rate: 10, deduct: 3000 },
  { from: 50001, to: 60000, rate: 20, deduct: 8000 },
  { from: 60001, to: 80000, rate: 30, deduct: 14000 },
  { from: 80001, to: 180000, rate: 34, deduct: 17200 },
  { from: 180001, to: null, rate: 38, deduct: 24400 },
];

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

  async function calc() {
    setLoading(true); setErr('');
    try { const res = await api.ir.calculate(form); setResult(res); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-lg">👤</div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Impôt sur le Revenu (IR)</h1>
          <p className="text-sm text-gray-500">Barème progressif 0–38% — CGI 2026</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Barème IR 2026</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase">Tranche</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Taux</th>
              <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase">Déduction</th>
            </tr>
          </thead>
          <tbody>
            {scale.map(s => (
              <tr key={s.rate} className="border-b border-gray-50">
                <td className="py-2 text-gray-700">{s.from.toLocaleString()} — {s.to ? `${s.to.toLocaleString()}` : '∞'}</td>
                <td className="py-2 text-right font-mono font-semibold">{s.rate}%</td>
                <td className="py-2 text-right font-mono text-gray-500">{s.deduct > 0 ? `${s.deduct.toLocaleString()} MAD` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-600 uppercase">Salaires (Cat. 1)</p>
        {form.salaries.map((s, i) => (
          <div key={i} className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-3 bg-gray-50 rounded-lg">
            {[['gross','Brut'],['cnss','CNSS'],['amo','AMO'],['pension','Retraite'],['otherDeductions','Autres']].map(([k,l]) => (
              <div key={k}>
                <label className="block text-xs text-gray-500 mb-1">{l}</label>
                <input type="number" value={(s as any)[k]} onChange={e => updSal(i, k, +e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
        <p className="text-xs font-semibold text-gray-600 uppercase">Fonciers (Cat. 4)</p>
        {form.rentalIncome.map((r, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">Loyer brut annuel</label>
              <input type="number" value={r.gross}
                onChange={e => { const copy = [...form.rentalIncome]; copy[i] = { ...copy[i], gross: +e.target.value }; setForm(f => ({ ...f, rentalIncome: copy })); }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div className="pt-4">
              <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">Abattement 40%</span>
              <span className="text-xs text-gray-500 ml-2">Net: {Math.round(r.gross * 0.6).toLocaleString()} MAD</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Personnes à charge</label>
          <input type="number" value={form.dependents} onChange={e => setForm(f => ({ ...f, dependents: +e.target.value }))}
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
        </div>
        <div className="pt-4">
          <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-medium">360 MAD/pers</span>
          <span className="text-xs text-gray-500 ml-2">Réduction: {form.dependents * 360} MAD</span>
        </div>
      </div>

      <button onClick={calc} disabled={loading}
        className="px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium text-sm hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? 'Calcul...' : 'Calculer IR'}
      </button>

      {err && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {err}</div>}

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-emerald-50 to-white border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">Résultat IR</span>
            <span className="text-xs text-gray-500">Taux effectif: {result.effectiveRate}%</span>
          </div>
          {result.categories?.map((c: any) => (
            <div key={c.category} className="px-5 py-2 border-b border-gray-50 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-gray-900">{c.name}</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${c.classification === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.classification}</span>
              </div>
              <span className="font-mono text-gray-700">{c.net.toLocaleString()} MAD</span>
            </div>
          ))}
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-50"><td className="py-2 px-4 font-semibold">Revenu net global</td><td className="py-2 px-4 text-right font-bold font-mono">{result.globalNetTaxableIncome.toLocaleString()} MAD</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-4 text-gray-600">IR brut</td><td className="py-2 px-4 text-right font-mono">{result.grossIR.toLocaleString()} MAD</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-4 text-gray-600">Réduction famille</td><td className="py-2 px-4 text-right font-mono text-emerald-600">-{result.familyReduction.toLocaleString()} MAD</td></tr>
              <tr className="border-b border-gray-50"><td className="py-2 px-4 text-gray-600">Crédits RAS</td><td className="py-2 px-4 text-right font-mono text-emerald-600">-{result.withholdingCredits.toLocaleString()} MAD</td></tr>
              <tr className="bg-emerald-50"><td className="py-3 px-4 font-bold text-gray-900 text-base">IR net à payer</td><td className="py-3 px-4 text-right font-bold font-mono text-emerald-700 text-base">{result.netIRPayable.toLocaleString()} MAD</td></tr>
              {result.refund > 0 && <tr className="bg-blue-50"><td className="py-2 px-4 font-semibold text-blue-700">Remboursement</td><td className="py-2 px-4 text-right font-bold font-mono text-blue-700">{result.refund.toLocaleString()} MAD</td></tr>}
            </tbody>
          </table>
          {result.bracketDetail?.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Détail tranches</p>
              <div className="space-y-2">
                {result.bracketDetail.map((b: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="w-24 text-gray-400 font-mono">{b.from.toLocaleString()}–{b.to}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${(b.tax / result.grossIR * 100)}%` }}></div>
                    </div>
                    <span className="w-20 text-right font-mono text-gray-600">{b.tax.toLocaleString()} MAD</span>
                    <span className="w-8 text-right text-gray-400">{(b.rate * 100).toFixed(0)}%</span>
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
