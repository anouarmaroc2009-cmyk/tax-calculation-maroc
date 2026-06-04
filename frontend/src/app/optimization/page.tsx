'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function OptimizationPage() {
  const [profile, setProfile] = useState({
    dividendIncome: 50000, isExport: false, netProfit: 500000,
    fixedAssets: 2000000, hasLosses: false, annualRevenue: 3000000,
    directorSalary: 240000, directorDividends: 60000,
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { const r = await api.optimization.run(profile); setResult(r); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold mb-2">Tax Optimization</h1>
      <p className="text-sm text-gray-500 mb-6">12 legal strategies — all within CGI framework</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {Object.entries(profile).map(([k, v]) => (
          <div key={k}>
            <label className="text-xs font-medium">{k.replace(/([A-Z])/g, ' $1').trim()}</label>
            {typeof v === 'boolean' ? (
              <input type="checkbox" checked={v} onChange={e => setProfile(p => ({ ...p, [k]: e.target.checked }))} className="ml-2" />
            ) : (
              <input type="number" value={v} onChange={e => setProfile(p => ({ ...p, [k]: +e.target.value }))}
                className="w-full border rounded p-1 text-sm" />
            )}
          </div>
        ))}
      </div>

      <button onClick={run} disabled={loading}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50">
        {loading ? 'Analyzing...' : 'Run Optimization'}
      </button>

      {result && (
        <div className="mt-6 border rounded-lg bg-white p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recommendations</h2>
            <span className="text-2xl font-bold text-green-600">{result.totalSavings.toLocaleString()} MAD</span>
          </div>
          {result.strategies?.map((s: any) => (
            <div key={s.id} className="flex justify-between border-b py-3">
              <div>
                <span className="font-medium">{s.name}</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100">{s.tax}</span>
                <span className={`ml-1 text-xs px-2 py-0.5 rounded ${s.risk === 'LOW' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.risk}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">{s.savings.toLocaleString()} MAD</div>
                <div className="text-xs text-gray-400">{s.timeline}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
