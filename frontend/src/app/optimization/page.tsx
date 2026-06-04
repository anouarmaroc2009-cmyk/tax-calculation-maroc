'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

const fieldMeta: Record<string, { label: string; type: 'number' | 'boolean'; hint?: string }> = {
  dividendIncome: { label: 'Revenus de dividendes', type: 'number' },
  isExport: { label: 'Activité exportatrice', type: 'boolean', hint: 'CFC/IAZ éligible' },
  netProfit: { label: 'Bénéfice net', type: 'number' },
  fixedAssets: { label: 'Immobilisations corporelles', type: 'number', hint: 'Base amortissable' },
  hasLosses: { label: 'Déficits antérieurs', type: 'boolean' },
  annualRevenue: { label: 'Chiffre d\'affaires annuel', type: 'number' },
  directorSalary: { label: 'Salaire du dirigeant', type: 'number' },
  directorDividends: { label: 'Dividendes du dirigeant', type: 'number' },
};

export default function OptimizationPage() {
  const [profile, setProfile] = useState({
    dividendIncome: 50000, isExport: false, netProfit: 500000,
    fixedAssets: 2000000, hasLosses: false, annualRevenue: 3000000,
    directorSalary: 240000, directorDividends: 60000,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function run() {
    setLoading(true); setErr('');
    try { const r = await api.optimization.run(profile); setResult(r); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const riskColor = (r: string) => {
    if (r === 'LOW') return 'bg-green-50 text-green-700 border-green-200';
    if (r === 'MEDIUM') return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl">⚡</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Optimisation Fiscale</h1>
          <p className="text-sm text-gray-500">Stratégies légales dans le cadre du CGI — classées par économies estimées</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Profil de l&apos;entreprise</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(profile).map(([k, v]) => {
            const meta = fieldMeta[k];
            return (
              <div key={k}>
                <label className="input-label">{meta?.label || k}</label>
                {meta?.type === 'boolean' ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
                    <input type="checkbox" checked={!!v}
                      onChange={e => setProfile(p => ({ ...p, [k]: e.target.checked }))}
                      className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                    {meta.hint && <span className="text-xs text-gray-400">{meta.hint}</span>}
                  </div>
                ) : (
                  <div className="relative">
                    <input type="number" value={v as number}
                      onChange={e => setProfile(p => ({ ...p, [k]: +e.target.value }))}
                      className="input-field pr-14" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={run} disabled={loading} className="btn-primary min-w-[160px]">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Analyse...
          </span>
        ) : 'Lancer l\'optimisation'}
      </button>

      {err && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm text-red-700 flex items-center gap-2"><span>⚠️</span> {err}</p>
        </div>
      )}

      {result && (
        <div className="card divide-y divide-gray-50 overflow-hidden">
          <div className="p-5 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-transparent">
            <h3 className="font-semibold text-gray-900">Recommandations</h3>
            <div className="text-right">
              <div className="text-xs text-gray-400">Économies totales estimées</div>
              <div className="text-2xl font-bold text-orange-600">{result.totalSavings.toLocaleString()} MAD</div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {result.strategies?.map((s: any, i: number) => (
              <div key={s.id} className={`p-4 rounded-xl border ${riskColor(s.risk)} flex items-center justify-between gap-4 ${
                i === 0 ? 'ring-2 ring-orange-300' : ''
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  {i === 0 && <span className="text-lg">🏆</span>}
                  <div>
                    <div className="font-medium text-gray-900">{s.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge-blue text-xs">{s.tax}</span>
                      <span className="badge text-xs border" style={{ borderColor: 'inherit' }}>{s.risk === 'LOW' ? 'Faible risque' : s.risk === 'MEDIUM' ? 'Risque modéré' : 'Risque élevé'}</span>
                      <span className="text-xs text-gray-400">{s.timeline}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold text-gray-900">{s.savings.toLocaleString()} MAD</div>
                  <div className="text-xs text-gray-400">/ an</div>
                </div>
              </div>
            ))}
            {(!result.strategies || result.strategies.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">🤔</div>
                <p className="text-sm">Aucune stratégie disponible pour ce profil</p>
                <p className="text-xs mt-1">Essayez de modifier les paramètres</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
