'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export default function ClassifyPage() {
  const [type, setType] = useState('DIVIDEND');
  const [context, setContext] = useState({ isSecuritiesTrader: false, isProfessional: false, numProperties: 0, portfolioHours: 0, workHours: 2080 });
  const [result, setResult] = useState<any>(null);

  async function classify() {
    try { const r = await api.classification.classify(type, context); setResult(r); }
    catch (e) { console.error(e); }
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="text-2xl font-bold mb-2">Active/Passive Classification</h1>
      <p className="text-sm text-gray-500 mb-6">Determines tax treatment of income streams</p>

      <div className="space-y-3 mb-6">
        <div><label className="text-xs font-medium">Income Type</label>
          <select value={type} onChange={e => setType(e.target.value)}
            className="w-full border rounded p-2 text-sm">SALARY, PROFESSIONAL, DIVIDEND, INTEREST, RENTAL, CAPITAL_GAIN.split(',').map(t => <option key={t} value={t}>{t}</option>)</select></div>
        <div><label className="text-xs font-medium">Is Securities Trader?</label>
          <input type="checkbox" checked={context.isSecuritiesTrader} onChange={e => setContext(c => ({ ...c, isSecuritiesTrader: e.target.checked }))} className="ml-2" /></div>
        <div><label className="text-xs font-medium">Is Professional?</label>
          <input type="checkbox" checked={context.isProfessional} onChange={e => setContext(c => ({ ...c, isProfessional: e.target.checked }))} className="ml-2" /></div>
        <div><label className="text-xs font-medium">Number of Rental Properties</label>
          <input type="number" value={context.numProperties} onChange={e => setContext(c => ({ ...c, numProperties: +e.value }))}
            className="w-full border rounded p-2 text-sm" /></div>
        <div><label className="text-xs font-medium">Portfolio Mgmt Hours/Year</label>
          <input type="number" value={context.portfolioHours} onChange={e => setContext(c => ({ ...c, portfolioHours: +e.value }))}
            className="w-full border rounded p-2 text-sm" /></div>
      </div>

      <button onClick={classify} className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Classify</button>

      {result && (
        <div className="mt-6 border rounded-lg bg-white p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded text-sm font-bold ${result.classification === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{result.classification}</span>
            <span className="text-xs text-gray-400">Risk: {result.riskLevel}</span>
          </div>
          <p className="text-sm">{result.reasoning}</p>
          {result.savings > 0 && <p className="text-sm text-blue-600 mt-2">Tax savings potential: {(result.savings * 100).toFixed(0)}% rate advantage</p>}
        </div>
      )}
    </div>
  );
}
