const modules = [
  { name: 'IS — Impôt sur les Sociétés', desc: 'Taux 2026 (20%/35%/40%), cotisation minimale, acomptes provisionnels, report des déficits.', href: '/is', emoji: '🏢', color: 'border-blue-200 hover:border-blue-400', badge: 'bg-blue-100 text-blue-700' },
  { name: 'IR — Impôt sur le Revenu', desc: 'Barème progressif 0-38%, 6 catégories, abattement foncier 40%, crédits RAS, réduction famille.', href: '/ir', emoji: '👤', color: 'border-emerald-200 hover:border-emerald-400', badge: 'bg-emerald-100 text-emerald-700' },
  { name: 'TVA — Taxe sur la Valeur Ajoutée', desc: 'Taux 20%/10%, matrice de déduction, crédit de TVA, échéances mensuelles/trimestrielles.', href: '/tva', emoji: '📊', color: 'border-purple-200 hover:border-purple-400', badge: 'bg-purple-100 text-purple-700' },
  { name: 'Classification Actif/Passif', desc: '6 types de revenus, règles de reclassification pour trader, professionnel, portefeuille, biens.', href: '/classification', emoji: '🔍', color: 'border-amber-200 hover:border-amber-400', badge: 'bg-amber-100 text-amber-700' },
  { name: 'Optimisation Fiscale', desc: 'Stratégies classées par économies estimées, niveaux de risque et délais de mise en œuvre.', href: '/optimization', emoji: '⚡', color: 'border-orange-200 hover:border-orange-400', badge: 'bg-orange-100 text-orange-700' },
  { name: 'Pénalités Art. 208', desc: 'Pénalités de retard 5%/10%/20%, intérêts 0.5%/mois, calcul des majorations.', href: '/penalties', emoji: '⚠️', color: 'border-red-200 hover:border-red-400', badge: 'bg-red-100 text-red-700' },
];

export default function HomePage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center pt-8 pb-4">
        <div className="inline-flex items-center gap-2 bg-blue-50 rounded-full px-4 py-1.5 mb-4">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span className="text-xs font-medium text-blue-700">Code Général des Impôts 2026</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
          FiscalPro <span className="text-blue-600">Maroc</span>
        </h1>
        <p className="text-base text-gray-500">Calcul et optimisation fiscale pour experts-comptables marocains</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map(m => (
          <a key={m.name} href={m.href}
            className={`block bg-white rounded-xl border-2 ${m.color} p-5 shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${m.badge}`}>
                {m.emoji}
              </div>
              <div>
                <h2 className="font-semibold text-sm text-gray-900">{m.name}</h2>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{m.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg shrink-0">🚀</div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">Démarrage rapide</p>
            <p className="text-xs text-gray-500">Clonez et exécutez les deux serveurs</p>
          </div>
          <pre className="bg-gray-900 text-gray-100 px-4 py-2 rounded-lg text-xs overflow-x-auto w-full sm:w-auto">.\start.ps1</pre>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { n: '6', l: 'Moteurs de calcul', c: 'text-blue-600' },
          { n: '2026', l: 'CGI à jour', c: 'text-emerald-600' },
          { n: '12', l: 'Stratégies', c: 'text-amber-600' },
          { n: '28+', l: 'Tables BDD', c: 'text-purple-600' },
        ].map(s => (
          <div key={s.l} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className={`text-xl font-bold ${s.c}`}>{s.n}</div>
            <div className="text-xs text-gray-500 mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
