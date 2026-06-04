'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

const companyTypes = [
  { value: 'STANDARD', label: 'Standard', rate: '20% ou 35%' },
  { value: 'CREDIT_INSTITUTION', label: 'Crédit/Assurance', rate: '40%' },
  { value: 'CFC', label: 'CFC', rate: '20%' },
  { value: 'IAZ', label: 'IAZ', rate: '20%' },
  { value: 'INVESTMENT_AGREEMENT', label: 'Convention ≥ 1.5B', rate: '20%' },
];

export default function ISPage() {
  const [form, setForm] = useState({
    fiscalYear: 2026, companyType: 'STANDARD', netAccountingProfit: 500000, totalRevenue: 3000000,
    financialIncome: 50000, subsidies: 0, operatingMonths: 48, investmentAgreementAmount: 0,
    reintegrations: [{ type: 'REINTEGRATION', category: 'vehicle', description: 'Vehicle cap excess', amount: 20000 }],
    deductions: [], priorYearLosses: [],
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  async function calc() {
    setLoading(true); setErr('');
    try { const res = await api.is.calculate(form); setResult(res); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg">🏢</div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Impôt sur les Sociétés (IS)</h1>
          <p className="text-sm text-gray-500">CGI Art. 19-I — Taux 2026</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Entreprise</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
            <select value={form.companyType} onChange={e => update('companyType', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
              {companyTypes.map(c => <option key={c.value} value={c.value}>{c.label} ({c.rate})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Exercice</label>
            <input type="number" value={form.fiscalYear} onChange={e => update('fiscalYear', +e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mois (exo CM ≤ 36)</label>
            <input type="number" value={form.operatingMonths} onChange={e => update('operatingMonths', +e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Financier</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ['netAccountingProfit', 'Résultat net comptable'],
            ['totalRevenue', 'Chiffre d\'affaires'],
            ['financialIncome', 'Produits financiers'],
            ['subsidies', 'Subventions'],
            ['investmentAgreementAmount', 'Convention invest.'],
          ].map(([k, l]) => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
              <div className="relative">
                <input type="number" value={(form as any)[k]} onChange={e => update(k, +e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 pr-14" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {form.reintegrations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Réintégrations</p>
          {form.reintegrations.map((r, i) => (
            <div key={i} className="flex items-center gap-3 text-sm p-3 bg-amber-50 rounded-lg">
              <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-medium">{r.category}</span>
              <span className="text-gray-600 flex-1">{r.description}</span>
              <span className="font-semibold text-gray-900">{r.amount.toLocaleString()} MAD</span>
            </div>
          ))}
        </div>
      )}

      <button onClick={calc} disabled={loading}
        className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        {loading ? 'Calcul...' : 'Calculer IS'}
      </button>

      {err && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {err}</div>}

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-900 text-sm">Résultat IS — {form.fiscalYear}</span>
            <span className="text-xs text-gray-500">{result.rateLabel}</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {[
                ['Résultat net comptable', result.netAccountingProfit],
                ['Réintégrations', result.totalReintegrations],
                ['Déductions', result.totalDeductions],
                ['RNI', result.netTaxableProfit, 'font-semibold'],
                ['IS brut', result.grossIS],
                ['Base CM', result.mcBase],
                ['Cotisation minimale', result.mcAmount, result.mcExempt ? '✓ Exonérée' : '0.25%'],
                ['IS dû', result.isDue, 'font-bold text-blue-700'],
                ['Report déficitaire', result.lossCarryForwardApplied],
              ].map(([l, v, extra]) => (
                <tr key={l as string} className="border-b border-gray-50">
                  <td className={`py-2 px-4 text-gray-600 ${(extra as string || '').includes('font-bold') ? 'font-bold text-gray-900' : ''}`}>{l}</td>
                  <td className={`py-2 px-4 text-right font-mono ${(extra as string || '')}`}>
                    {typeof v === 'number' ? `${v.toLocaleString()} MAD` : v}
                  </td>
                  <td className="py-2 px-4 text-right text-xs text-gray-400 w-32">{typeof extra === 'string' && !extra.includes('font') ? extra : ''}</td>
                </tr>
              ))}
              <tr className="bg-blue-50">
                <td className="py-3 px-4 font-bold text-gray-900 text-base">IS net à payer</td>
                <td className="py-3 px-4 text-right font-bold font-mono text-blue-700 text-base">{result.netISPayable.toLocaleString()} MAD</td>
                <td className="py-3 px-4 text-right text-xs text-gray-400">Taux eff. {result.effectiveRate}%</td>
              </tr>
            </tbody>
          </table>
          {result.quarterlyInstallments?.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 space-y-3">
              <p className="text-xs font-semibold text-gray-600 uppercase">Acomptes trimestriels</p>
              <div className="grid grid-cols-4 gap-3">
                {result.quarterlyInstallments.map((q: any) => (
                  <div key={q.number} className="border border-gray-200 rounded-lg p-3 text-center bg-gray-50">
                    <div className="text-xs text-gray-500">T{q.number}</div>
                    <div className="text-xs text-gray-400">{q.dueDate}</div>
                    <div className="font-bold text-blue-700">{q.amount.toLocaleString()} MAD</div>
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
