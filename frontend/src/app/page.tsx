'use client';

import { useState, useEffect } from 'react';

const modules = [
  { name: 'IS — Impôt sur les Sociétés', desc: 'Calculez l\'IS selon les taux 2026 (20%/35%/40%), la cotisation minimale (0.25%), les acomptes provisionnels et le report des déficits.', href: '/is', icon: '🏢', color: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-600' },
  { name: 'IR — Impôt sur le Revenu', desc: 'Barème progressif 0-38%, 6 catégories de revenus, abattement foncier, crédits de retenue à la source et calcul du RVI.', href: '/ir', icon: '👤', color: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-600' },
  { name: 'TVA — Taxe sur la Valeur Ajoutée', desc: 'Régime post-réforme 2026 (20%/10%), matrice de déduction, auto-liquidation, crédit de TVA et échéances mensuelles/trimestrielles.', href: '/tva', icon: '📊', color: 'from-purple-500 to-purple-600', light: 'bg-purple-50 text-purple-600' },
  { name: 'Classification Actif/Passif', desc: 'Moteur de classification des revenus en actifs/passifs avec règles de reclassification pour valeurs mobilières, location et plus-values.', href: '/classification', icon: '🔍', color: 'from-amber-500 to-amber-600', light: 'bg-amber-50 text-amber-600' },
  { name: 'Optimisation Fiscale', desc: '12 stratégies fiscales légales classées par économies estimées, niveaux de risque et délais de mise en œuvre.', href: '/optimization', icon: '⚡', color: 'from-orange-500 to-orange-600', light: 'bg-orange-50 text-orange-600' },
  { name: 'Calcul des Pénalités', desc: 'Pénalités de retard Article 208 (5%/10%/20%), intérêts de retard 0.5%/mois et majorations pour défaut de déclaration.', href: '/penalties', icon: '⚠️', color: 'from-red-500 to-red-600', light: 'bg-red-50 text-red-600' },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="space-y-10">
      <div className="text-center max-w-2xl mx-auto pt-6 pb-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-xs font-medium text-blue-700">Code Général des Impôts 2026 — Finance Law No. 50-25</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          FiscalPro <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Maroc</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Plateforme de calcul et d&apos;optimisation fiscale pour experts-comptables marocains
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((m, i) => (
          <a key={m.name} href={m.href}
            className="group card-hover p-6 relative overflow-hidden"
            style={mounted ? { animationDelay: `${i * 80}ms` } : undefined}>
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-5 bg-gradient-to-br ${m.color}`}></div>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl ${m.light} flex items-center justify-center text-xl shrink-0`}>
                {m.icon}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{m.name}</h2>
                <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">{m.desc}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Accéder au calculateur</span>
              <svg className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
            </div>
          </a>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">🚀</div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Démarrage rapide</h3>
            <p className="text-sm text-gray-500">Clonez le dépôt et lancez avec Docker</p>
          </div>
          <div className="w-full sm:w-auto">
            <div className="bg-gray-900 rounded-xl p-3 overflow-x-auto">
              <code className="text-xs text-gray-100 whitespace-nowrap">git clone ... &amp;&amp; cd tax-calculation-maroc &amp;&amp; docker-compose up -d</code>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { n: '6', l: 'Moteurs de calcul', c: 'bg-blue-50 text-blue-600' },
          { n: '28+', l: 'Tables base de données', c: 'bg-emerald-50 text-emerald-600' },
          { n: '2026', l: 'CGI à jour', c: 'bg-purple-50 text-purple-600' },
          { n: '12', l: 'Stratégies d\'optimisation', c: 'bg-amber-50 text-amber-600' },
        ].map(s => (
          <div key={s.l} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${s.c.split(' ')[1]}`}>{s.n}</div>
            <div className="text-xs text-gray-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
