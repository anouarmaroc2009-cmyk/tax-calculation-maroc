'use client';
import { useState } from 'react';
import { api } from '@/lib/api';

const rates: Record<string, { rate: string; desc: string }> = {
  IS: { rate: '5% / 10%', desc: '5% ≤30j, 10% >30j' },
  IR: { rate: '5% / 10%', desc: '5% ≤30j, 10% >30j' },
  TVA: { rate: '20%', desc: 'Forfaitaire 20%' },
  WHT: { rate: '20%', desc: 'Forfaitaire 20%' },
};

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

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-lg">⚠️</div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pénalités (Art. 208)</h1>
          <p className="text-sm text-gray-500">Pénalités de retard et intérêts</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(rates).map(([k, v]) => (
          <div key={k} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-sm font-bold text-gray-900">{k}</div>
            <div className="text-lg font-bold text-red-600 mt-1">{v.rate}</div>
            <div className="text-xs text-gray-400 mt-1">{v.desc}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-600 uppercase">Paramètres</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Type d'impôt</label>
            <select value={form.taxType} onChange={e => setForm(f => ({ ...f, taxType: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500">
              <option value="IS">IS</option><option value="IR">IR</option><option value="TVA">TVA</option><option value="WHT">RAS</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Montant dû</label>
            <div className="relative">
              <input type="number" value={form.taxAmount} onChange={e => setForm(f => ({ ...f, taxAmount: +e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 pr-14" />
              <span className="absolute right-3 top-2 text-xs text-gray-400">MAD</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date d'échéance</label>
            <input type="date" value={form.dueDate} max={today} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date de paiement</label>
            <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500" />
          </div>
        </div>
      </div>

      <button onClick={calc} disabled={loading}
        className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium text-sm hover:bg-red-700 active:scale-[0.98] transition-all disabled:opacity-50">
        {loading ? 'Calcul...' : 'Calculer pénalités'}
      </button>

      {err && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠️ {err}</div>}

      {result && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gradient-to-r from-red-50 to-white border-b border-gray-100">
            <span className="font-semibold text-sm text-gray-900">Résultat — Art. 208</span>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            <div className="p-5 text-center">
              <div className="text-xs text-gray-400 mb-1">Jours de retard</div>
              <div className="text-2xl font-bold text-gray-900">{result.daysLate}</div>
              <div className="text-xs text-gray-400">jours</div>
            </div>
            <div className="p-5 text-center">
              <div className="text-xs text-gray-400 mb-1">Pénalité</div>
              <div className="text-2xl font-bold text-red-600">{result.penaltyAmount?.toLocaleString()} MAD</div>
            </div>
            <div className="p-5 text-center">
              <div className="text-xs text-gray-400 mb-1">Intérêts</div>
              <div className="text-2xl font-bold text-amber-600">{result.interestAmount?.toLocaleString()} MAD</div>
            </div>
          </div>
          <div className="border-t border-gray-100 p-5 bg-gray-50 flex items-center justify-between">
            <span className="font-bold text-gray-900">Total dû</span>
            <span className="text-2xl font-bold text-red-600">{result.total?.toLocaleString()} MAD</span>
          </div>
        </div>
      )}
    </div>
  );
}
