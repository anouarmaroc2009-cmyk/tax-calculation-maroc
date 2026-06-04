'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

const incomeTypes = [
  { value: 'SALARY', label: 'Salaire', defaultClass: 'ACTIVE', hint: 'Toujours actif' },
  { value: 'PROFESSIONAL', label: 'Profession libérale', defaultClass: 'ACTIVE', hint: 'Toujours actif' },
  { value: 'DIVIDEND', label: 'Dividendes', defaultClass: 'PASSIVE', hint: 'Passif sauf si trader' },
  { value: 'INTEREST', label: 'Intérêts', defaultClass: 'PASSIVE', hint: 'Passif sauf si trader' },
  { value: 'RENTAL', label: 'Revenus fonciers', defaultClass: 'PASSIVE', hint: 'Passif sauf si pro +3 biens' },
  { value: 'CAPITAL_GAIN', label: 'Plus-values', defaultClass: 'PASSIVE', hint: 'Passif sauf si trader' },
];

export default function ClassifyPage() {
  const [type, setType] = useState('DIVIDEND');
  const [context, setContext] = useState({ isSecuritiesTrader: false, isProfessional: false, numProperties: 0, portfolioHours: 0, workHours: 2080 });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function classify() {
    setLoading(true); setErr('');
    try { const r = await api.classification.classify(type, context); setResult(r); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const selected = incomeTypes.find(t => t.value === type);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">🔍</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classification Actif / Passif</h1>
          <p className="text-sm text-gray-500">Moteur de classification des revenus avec règles de reclassification</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Type de revenu</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {incomeTypes.map(t => (
            <button key={t.value} onClick={() => setType(t.value)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                type === t.value
                  ? 'border-amber-500 bg-amber-50/50 shadow-sm'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{t.label}</span>
                <span className={`badge ${t.defaultClass === 'ACTIVE' ? 'badge-green' : 'badge-yellow'}`}>{t.defaultClass}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">{t.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Contexte — {selected?.label}</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
            <label className="text-sm text-gray-700 flex-1">Négociateur en valeurs mobilières</label>
            <input type="checkbox" checked={context.isSecuritiesTrader}
              onChange={e => setContext(c => ({ ...c, isSecuritiesTrader: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-xl">
            <label className="text-sm text-gray-700 flex-1">Professionnel (activité principale)</label>
            <input type="checkbox" checked={context.isProfessional}
              onChange={e => setContext(c => ({ ...c, isProfessional: e.target.checked }))}
              className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
          </div>
          <div>
            <label className="input-label">Nombre de biens locatifs</label>
            <input type="number" value={context.numProperties}
              onChange={e => setContext(c => ({ ...c, numProperties: +e.target.value }))}
              className="input-field" />
          </div>
          <div>
            <label className="input-label">Heures/an gestion de portefeuille</label>
            <input type="number" value={context.portfolioHours}
              onChange={e => setContext(c => ({ ...c, portfolioHours: +e.target.value }))}
              className="input-field" />
          </div>
        </div>
        <div className="text-xs text-gray-400 p-3 bg-blue-50/50 rounded-xl">
          <span className="font-medium text-blue-700">Règle de reclassification:</span> Si un contribuable consulte &gt;25% de son temps à la gestion de portefeuille (&gt;{Math.round(context.workHours * 0.25)}h/an), les revenus de capitaux mobiliers sont reclassifiés en ACTIFS.
        </div>
      </div>

      <button onClick={classify} disabled={loading} className="btn-primary min-w-[160px]">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Classification...
          </span>
        ) : 'Classifier'}
      </button>

      {err && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm text-red-700 flex items-center gap-2"><span>⚠️</span> {err}</p>
        </div>
      )}

      {result && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
              result.classification === 'ACTIVE' ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              {result.classification === 'ACTIVE' ? '🏃' : '🛋️'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`badge text-sm px-3 py-1 ${
                  result.classification === 'ACTIVE' ? 'badge-green' : 'badge-yellow'
                }`}>{result.classification}</span>
                <span className={`badge ${result.riskLevel === 'LOW' ? 'badge-green' : result.riskLevel === 'MEDIUM' ? 'badge-yellow' : 'badge-red'}`}>
                  Risque: {result.riskLevel}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">{result.reasoning}</p>
            </div>
          </div>
          {result.savings > 0 && (
            <div className="bg-blue-50/50 rounded-xl p-4">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Potentiel d&apos;optimisation:</span> Avantage taux estimé à {(result.savings * 100).toFixed(0)}% en classification {result.classification === 'ACTIVE' ? 'ACTIVE' : 'PASSIVE'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
