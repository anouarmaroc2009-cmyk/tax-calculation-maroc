'use client';

export default function HomePage() {
  const modules = [
    { name: 'IS — Corporate Income Tax', desc: '2026 rates (20%/35%/40%), minimum contribution, quarterly installments', href: '/is', icon: '🏢', color: 'border-blue-400 hover:border-blue-600' },
    { name: 'IR — Individual Income Tax', desc: 'Progressive 0-38% scale, 6 categories, withholding credits, bracket detail', href: '/ir', icon: '👤', color: 'border-green-400 hover:border-green-600' },
    { name: 'TVA — Value Added Tax', desc: 'Post-2026 reform (20%/10%), deduction matrix, filing frequency, deadlines', href: '/tva', icon: '📊', color: 'border-purple-400 hover:border-purple-600' },
    { name: 'Classification Engine', desc: 'Active vs Passive income & asset classification with reclassification rules', href: '/classification', icon: '🔍', color: 'border-yellow-400 hover:border-yellow-600' },
    { name: 'Tax Optimization', desc: '12 legal strategies ranked by savings, risk levels, implementation timeline', href: '/optimization', icon: '⚡', color: 'border-orange-400 hover:border-orange-600' },
    { name: 'Penalty Calculator', desc: 'Article 208 — late filing & payment penalties, interest calculation', href: '/penalties', icon: '⚠️', color: 'border-red-400 hover:border-red-600' },
  ];

  return (
    <div className="mx-auto max-w-5xl p-6">
      <header className="mb-8 border-b pb-5">
        <h1 className="text-3xl font-bold text-gray-900">FiscalPro Maroc</h1>
        <p className="text-gray-500 mt-1">Tax calculation & optimization platform for Moroccan accountants</p>
        <div className="mt-2 flex gap-2 text-xs text-gray-400">
          <span className="bg-blue-50 px-2 py-0.5 rounded">CGI 2026</span>
          <span className="bg-green-50 px-2 py-0.5 rounded">Finance Law No. 50-25</span>
          <span className="bg-gray-50 px-2 py-0.5 rounded">Active/Passive Engine</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <a key={m.name} href={m.href}
            className={`rounded-lg border-2 bg-white p-5 shadow-sm transition-all hover:shadow-md ${m.color}`}>
            <div className="text-2xl mb-2">{m.icon}</div>
            <h2 className="font-semibold text-gray-900 group-hover:text-blue-600">{m.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{m.desc}</p>
          </a>
        ))}
      </div>

      <div className="mt-10 border-t pt-4">
        <h2 className="font-semibold text-sm text-gray-600 mb-2">Quick Start</h2>
        <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`git clone https://github.com/anouarmaroc2009-cmyk/tax-calculation-maroc.git
cd tax-calculation-maroc
docker-compose up -d
# Open http://localhost:3000`}
        </pre>
      </div>

      <footer className="mt-8 border-t pt-4 text-center text-xs text-gray-400">
        Built on Code Général des Impôts (CGI) 2026 — Finance Law No. 50-25
      </footer>
    </div>
  );
}
