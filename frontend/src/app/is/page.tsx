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

const companyTypes = [
  { value: 'STANDARD', label: 'Standard', rate: '20% ou 35%' },
  { value: 'CREDIT_INSTITUTION', label: 'Établissement de crédit / Assurance', rate: '40%' },
  { value: 'CFC', label: 'CFC (Casablanca Finance City)', rate: '20%' },
  { value: 'IAZ', label: 'IAZ (Zones d\'accélération industrielle)', rate: '20%' },
  { value: 'INVESTMENT_AGREEMENT', label: 'Convention d\'investissement ≥ 1.5B', rate: '20%' },
];

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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-2xl">🏢</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Impôt sur les Sociétés (IS)</h1>
          <p className="text-sm text-gray-500">CGI Art. 19-I — Taux proportionnels 2026</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Paramètres de l&apos;entreprise</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Type de société</label>
            <select value={form.companyType} onChange={e => update('companyType', e.target.value)} className="select-field">
              {companyTypes.map(c => <option key={c.value} value={c.value}>{c.label} ({c.rate})</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Exercice fiscal</label>
            <input type="number" value={form.fiscalYear} onChange={e => update('fiscalYear', +e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="input-label">Mois depuis création</label>
            <input type="number" value={form.operatingMonths} onChange={e => update('operatingMonths', +e.target.value)} className="input-field" />
            <p className="text-xs text-gray-400 mt-1">Exonération CM si ≤ 36 mois</p>
          </div>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Données financières</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="input-label">Résultat net comptable</label>
            <div className="relative">
              <input type="number" value={form.netAccountingProfit} onChange={e => update('netAccountingProfit', +e.target.value)} className="input-field pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
            </div>
          </div>
          <div>
            <label className="input-label">Chiffre d&apos;affaires total</label>
            <div className="relative">
              <input type="number" value={form.totalRevenue} onChange={e => update('totalRevenue', +e.target.value)} className="input-field pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
            </div>
          </div>
          <div>
            <label className="input-label">Produits financiers</label>
            <div className="relative">
              <input type="number" value={form.financialIncome} onChange={e => update('financialIncome', +e.target.value)} className="input-field pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
            </div>
          </div>
          <div>
            <label className="input-label">Subventions</label>
            <div className="relative">
              <input type="number" value={form.subsidies} onChange={e => update('subsidies', +e.target.value)} className="input-field pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
            </div>
          </div>
          <div>
            <label className="input-label">Montant convention d&apos;investissement</label>
            <div className="relative">
              <input type="number" value={form.investmentAgreementAmount} onChange={e => update('investmentAgreementAmount', +e.target.value)} className="input-field pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
            </div>
          </div>
        </div>
      </div>

      {form.reintegrations.length > 0 && (
        <div className="card p-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Réintégrations actives</h2>
          </div>
          <div className="space-y-2">
            {form.reintegrations.map((r, i) => (
              <div key={i} className="flex items-center gap-3 text-sm p-3 bg-amber-50/50 rounded-xl">
                <span className="badge-yellow">{r.category}</span>
                <span className="text-gray-600 flex-1">{r.description}</span>
                <span className="font-semibold text-gray-900">{r.amount.toLocaleString()} MAD</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={calc} disabled={loading} className="btn-primary min-w-[160px]">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              Calcul...
            </span>
          ) : 'Calculer IS'}
        </button>
        {result && <span className="text-xs text-gray-400">Dernier calcul effectué</span>}
      </div>

      {err && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <span>⚠️</span> {err}
          </p>
        </div>
      )}

      {result && (
        <div className="card divide-y divide-gray-50 overflow-hidden">
          <div className="p-5 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-transparent">
            <h3 className="font-semibold text-gray-900">Résultat IS — Exercice {form.fiscalYear}</h3>
            <span className="text-xs text-gray-400">Taux appliqué: {result.rateLabel}</span>
          </div>
          <table className="result-table">
            <tbody>
              {[
                ['Résultat net comptable', result.netAccountingProfit],
                ['Total réintégrations', result.totalReintegrations],
                ['Total déductions', result.totalDeductions],
                ['Résultat net fiscal (RNI)', result.netTaxableProfit, true],
                ['Taux d\'imposition', `${(result.rateApplied * 100).toFixed(0)}%`, false, result.rateLabel],
                ['IS brut', result.grossIS],
              ].map(([l, v, bold, note]) => (
                <tr key={l as string}>
                  <td className={`text-gray-600 ${bold ? 'font-semibold text-gray-900' : ''}`}>{l}</td>
                  <td className={`text-right font-mono ${bold ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                    {typeof v === 'number' ? `${v.toLocaleString()} MAD` : v}
                  </td>
                  {note && <td className="text-right text-xs text-gray-400 w-48">{note as string}</td>}
                  {!note && <td className="w-48"></td>}
                </tr>
              ))}
              <tr className="bg-amber-50/50">
                <td className="font-semibold text-gray-900">Base CM (CA + PF + Subventions)</td>
                <td className="text-right font-mono font-semibold">{result.mcBase.toLocaleString()} MAD</td>
                <td className="text-right text-xs text-gray-400">0.25%</td>
              </tr>
              <tr className={result.mcExempt ? 'bg-green-50/50' : ''}>
                <td className="font-semibold">Cotisation minimale</td>
                <td className="text-right font-mono font-semibold">{result.mcAmount.toLocaleString()} MAD</td>
                <td className="text-right text-xs text-gray-400">{result.mcExempt ? '✅ Exonérée (startup ≤ 36 mois)' : 'min 3 000 MAD'}</td>
              </tr>
              <tr className="bg-blue-50/50">
                <td className="font-bold text-gray-900">IS dû (max IS brut / CM)</td>
                <td className="text-right font-bold font-mono text-blue-700">{result.isDue.toLocaleString()} MAD</td>
                <td></td>
              </tr>
              <tr>
                <td>Report déficitaire appliqué</td>
                <td className="text-right font-mono">{result.lossCarryForwardApplied.toLocaleString()} MAD</td>
                <td></td>
              </tr>
              <tr className="bg-blue-50/50">
                <td className="font-bold text-lg text-gray-900">IS net à payer</td>
                <td className="text-right font-bold text-lg font-mono text-blue-700">{result.netISPayable.toLocaleString()} MAD</td>
                <td className="text-right text-xs text-gray-400">Taux effectif: {result.effectiveRate}%</td>
              </tr>
            </tbody>
          </table>

          {result.quarterlyInstallments?.length > 0 && (
            <div className="p-5 space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Acomptes provisionnels</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {result.quarterlyInstallments.map((q: any) => (
                  <div key={q.number} className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50/50 hover:bg-blue-50/50 transition-colors">
                    <div className="text-xs text-gray-400 font-medium">Trimestre {q.number}</div>
                    <div className="text-xs text-gray-400 mb-2">{q.dueDate}</div>
                    <div className="text-lg font-bold text-blue-700">{q.amount.toLocaleString()} MAD</div>
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
