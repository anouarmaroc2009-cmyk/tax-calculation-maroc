'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

const types = [
  { value: 'SALARY', label: 'Salaire', hint: 'Toujours actif', cls: 'ACTIVE' },
  { value: 'PROFESSIONAL', label: 'Libérale', hint: 'Toujours actif', cls: 'ACTIVE' },
  { value: 'DIVIDEND', label: 'Dividendes', hint: 'Passif sauf trader', cls: 'PASSIVE' },
  { value: 'INTEREST', label: 'Intérêts', hint: 'Passif sauf trader', cls: 'PASSIVE' },
  { value: 'RENTAL', label: 'Fonciers', hint: 'Passif sauf pro +3 biens', cls: 'PASSIVE' },
  { value: 'CAPITAL_GAIN', label: 'Plus-values', hint: 'Passif sauf trader', cls: 'PASSIVE' },
];

export default function ClassifyPage() {
  const [type, setType] = useState('DIVIDEND');
  const [ctx, setCtx] = useState({ isSecuritiesTrader: false, isProfessional: false, numProperties: 0, portfolioHours: 0, workHours: 2080 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function classify() {
    setLoading(true); setErr('');
    try { const r = await api.classification.classify(type, ctx); setResult(r); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-lg">🔍</div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Classification Actif / Passif</h1>
          <p className="text-sm text-gray-500">Moteur de classification des revenus</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs font-semibold text-gray-600 uppercase mb-3">Type de revenu</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {types.map(t => (
            <button key={t.value} onClick={() => setType(t.value)}
              className={`p-3 rounded-lg border-2 text-left transition-all ${
                type === t.value ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-gray-900">{t.label}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  t.cls === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>{t.cls}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{t.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-600 uppercase">Contexte</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['isSecuritiesTrader', 'Négociateur valeurs', 'checkbox'],
            ['isProfessional', 'Activité principale', 'checkbox'],
            ['numProperties', 'Nb biens locatifs', 'number'],
            ['portfolioHours', 'Heures/an portefeuille', 'number'],
          ].map(([k, l, t]) => (
            <div key={k} className={`flex ${t === 'checkbox' ? 'items-center gap-3 p-3 bg-gray-50 rounded-lg' : 'flex-col'}`}>
              {t === 'checkbox' ? (
                <>
                  <label className="text-sm text-gray-700 flex-1">{l}</label>
                  <input type="checkbox" checked={(ctx as any)[k]}
                    onChange={e => setCtx(c => ({ ...c, [k]: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                </>
              ) : (
                <>
                  <label className="block text-xs text-gray-500 mb-1">{l}</label>
                  <input type="number" value={(ctx as any)[k]} onChange={e => setCtx(c => ({ ...c, [k]: +e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500" />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700">
          Reclassification si &gt;25% du temps en gestion de portefeuille (&gt;{Math.round(ctx.workHours * 0.25)}h/an)
        </div>
      </div>

      <button onClick={classify} disabled={loading}
        className="px-6 py-2.5 bg-amber-600 text-white rounded-lg font-medium text-sm hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? 'Classification...' : 'Classifier'}
      </button>

      {err && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {err}</div>}

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${result.classification === 'ACTIVE' ? 'bg-emerald-50' : 'bg-amber-50'}`}>
              {result.classification === 'ACTIVE' ? '🏃' : '🛋️'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-3 py-1 rounded text-sm font-bold ${
                  result.classification === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>{result.classification}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  result.riskLevel === 'LOW' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>Risque: {result.riskLevel}</span>
              </div>
              <p className="text-sm text-gray-500">{result.reasoning}</p>
            </div>
          </div>
          {result.savings > 0 && (
            <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
              <span className="font-semibold">Potentiel:</span> Avantage taux {(result.savings * 100).toFixed(0)}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}
