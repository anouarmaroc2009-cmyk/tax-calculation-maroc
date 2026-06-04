'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function PenaltiesPage() {
  const [form, setForm] = useState({
    taxType: 'IS', taxAmount: 100000, dueDate: '2026-04-30', paymentDate: '2026-06-15',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const today = new Date().toISOString().split('T')[0];

  async function calc() {
    setLoading(true); setErr('');
    try { const r = await api.penalties.calculate(form); setResult(r); }
    catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  }

  const penaltyRates: Record<string, { rate: string; desc: string }> = {
    IS: { rate: '5% / 10%', desc: '5% ≤ 30j, 10% > 30j + 0.5%/mois intérêt' },
    IR: { rate: '5% / 10%', desc: '5% ≤ 30j, 10% > 30j + 0.5%/mois intérêt' },
    TVA: { rate: '20%', desc: '20% forfaitaire + 0.5%/mois intérêt' },
    WHT: { rate: '20%', desc: '20% forfaitaire + 0.5%/mois intérêt' },
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">⚠️</div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calcul des Pénalités (Art. 208)</h1>
          <p className="text-sm text-gray-500">Pénalités de retard et intérêts de retard — Code Général des Impôts</p>
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Barème des pénalités</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(penaltyRates).map(([k, v]) => (
            <div key={k} className="border border-gray-100 rounded-xl p-3 text-center hover:bg-gray-50/50">
              <div className="text-sm font-bold text-gray-900">{k}</div>
              <div className="text-lg font-bold text-red-600 mt-1">{v.rate}</div>
              <div className="text-xs text-gray-400 mt-1">{v.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Paramètres</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="input-label">Type d&apos;impôt</label>
            <select value={form.taxType} onChange={e => setForm(f => ({ ...f, taxType: e.target.value }))} className="select-field">
              <option value="IS">IS — Impôt sur les Sociétés</option>
              <option value="IR">IR — Impôt sur le Revenu</option>
              <option value="TVA">TVA — Taxe sur la Valeur Ajoutée</option>
              <option value="WHT">RAS — Retenue à la Source</option>
            </select>
          </div>
          <div>
            <label className="input-label">Montant de l&apos;impôt dû</label>
            <div className="relative">
              <input type="number" value={form.taxAmount} onChange={e => setForm(f => ({ ...f, taxAmount: +e.target.value }))} className="input-field pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">MAD</span>
            </div>
          </div>
          <div>
            <label className="input-label">Date d&apos;échéance légale</label>
            <input type="date" value={form.dueDate} max={today} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="input-label">Date de paiement effective</label>
            <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} className="input-field" />
          </div>
        </div>
      </div>

      <button onClick={calc} disabled={loading} className="btn-primary min-w-[160px] bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Calcul...
          </span>
        ) : 'Calculer les pénalités'}
      </button>

      {err && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4">
          <p className="text-sm text-red-700 flex items-center gap-2"><span>⚠️</span> {err}</p>
        </div>
      )}

      {result && (
        <div className="card overflow-hidden">
          <div className="p-5 bg-gradient-to-r from-red-50/50 to-transparent border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Résultat — Pénalités Art. 208</h3>
          </div>

          <div className="grid grid-cols-3 divide-x divide-gray-50">
            <div className="p-5 text-center">
              <div className="text-xs text-gray-400 mb-1">Jours de retard</div>
              <div className="text-2xl font-bold text-gray-900">{result.daysLate}</div>
              <div className="text-xs text-gray-400">jours</div>
            </div>
            <div className="p-5 text-center">
              <div className="text-xs text-gray-400 mb-1">Pénalité</div>
              <div className="text-2xl font-bold text-red-600">{result.penaltyAmount?.toLocaleString()} MAD</div>
              <div className="text-xs text-gray-400">
                {result.daysLate <= 30 ? '5%' : result.taxType === 'TVA' || result.taxType === 'WHT' ? '20%' : '10%'}
              </div>
            </div>
            <div className="p-5 text-center">
              <div className="text-xs text-gray-400 mb-1">Intérêts de retard</div>
              <div className="text-2xl font-bold text-amber-600">{result.interestAmount?.toLocaleString()} MAD</div>
              <div className="text-xs text-gray-400">0.5% / mois</div>
            </div>
          </div>

          <div className="border-t border-gray-50 p-5 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-gray-900">Total dû</span>
              <span className="text-2xl font-bold text-red-600">{result.total?.toLocaleString()} MAD</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
