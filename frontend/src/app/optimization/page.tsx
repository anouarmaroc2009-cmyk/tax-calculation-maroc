'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

const fields: Record<string, { label: string; type: 'number' | 'boolean'; hint?: string }> = {
  dividendIncome: { label: 'Dividendes', type: 'number' },
  isExport: { label: 'Exportatrice', type: 'boolean', hint: 'Éligible CFC/IAZ' },
  netProfit: { label: 'Bénéfice net', type: 'number' },
  fixedAssets: { label: 'Immobilisations', type: 'number' },
  hasLosses: { label: 'Déficits', type: 'boolean' },
  annualRevenue: { label: 'CA annuel', type: 'number' },
  directorSalary: { label: 'Salaire dirigeant', type: 'number' },
  directorDividends: { label: 'Dividendes dirigeant', type: 'number' },
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

  const riskStyle = (r: string) => r === 'LOW' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700';

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg">⚡</div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Optimisation Fiscale</h1>
          <p className="text-sm text-gray-500">Stratégies légales classées par économies estimées</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-600 uppercase">Profil</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(profile).map(([k, v]) => {
            const meta = fields[k];
            if (!meta) return null;
            return meta.type === 'boolean' ? (
              <div key={k} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" checked={!!v} onChange={e => setProfile(p => ({ ...p, [k]: e.target.checked }))}
                  className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                <label className="text-sm text-gray-700">{meta.label}</label>
                {meta.hint && <span className="text-xs text-gray-400 ml-auto">{meta.hint}</span>}
              </div>
            ) : (
              <div key={k}>
                <label className="block text-xs text-gray-500 mb-1">{meta.label}</label>
                <input type="number" value={v as number} onChange={e => setProfile(p => ({ ...p, [k]: +e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500" />
              </div>
            );
          })}
        </div>
      </div>

      <button onClick={run} disabled={loading}
        className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-medium text-sm hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? 'Analyse...' : 'Optimiser'}
      </button>

      {err && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {err}</div>}

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-orange-50 to-white border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-sm text-gray-900">Recommandations</span>
            <div className="text-right">
              <div className="text-xs text-gray-500">Économies totales</div>
              <div className="text-xl font-bold text-orange-600">{result.totalSavings.toLocaleString()} MAD</div>
            </div>
          </div>
          <div className="p-5 space-y-3">
            {result.strategies?.map((s: any, i: number) => (
              <div key={s.id} className={`p-4 rounded-lg border ${riskStyle(s.risk)} flex items-center justify-between gap-4 ${
                i === 0 ? 'ring-2 ring-orange-300' : ''
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  {i === 0 && <span className="text-lg">🏆</span>}
                  <div>
                    <div className="font-medium text-sm text-gray-900">{s.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">{s.tax}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${riskStyle(s.risk).split(' ')[2]}`}>{s.risk === 'LOW' ? 'Faible risque' : 'Risque modéré'}</span>
                      <span className="text-xs text-gray-400">{s.timeline}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0 text-sm">
                  <div className="font-bold text-gray-900">{s.savings.toLocaleString()} MAD</div>
                  <div className="text-xs text-gray-400">/an</div>
                </div>
              </div>
            ))}
            {(!result.strategies || result.strategies.length === 0) && (
              <div className="text-center py-6 text-gray-400">
                <p className="text-sm">Aucune stratégie disponible pour ce profil</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
