'use client';

export default function HomePage() {
  const modules = [
    { name: 'IS Engine', desc: 'Corporate Income Tax 2026', href: '/is', icon: '🏢' },
    { name: 'IR Engine', desc: 'Individual Income Tax', href: '/ir', icon: '👤' },
    { name: 'TVA Engine', desc: 'Value Added Tax 2026', href: '/tva', icon: '📊' },
    { name: 'Classification', desc: 'Active/Passive Engine', href: '/classification', icon: '🔍' },
    { name: 'Optimization', desc: 'Tax Planning Strategies', href: '/optimization', icon: '⚡' },
    { name: 'EDI Export', desc: 'DGI XML Generation', href: '/edi', icon: '📄' },
    { name: 'Penalties', desc: 'Article 208 Calculator', href: '/penalties', icon: '⚠️' },
    { name: 'Clients', desc: 'Taxpayer Management', href: '/clients', icon: '👥' },
  ];

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">FiscalPro Maroc</h1>
        <p className="text-gray-600">Tax calculation & optimization for Moroccan accountants — CGI 2026</p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map((m) => (
          <a key={m.name} href={m.href}
            className="group rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md hover:border-blue-300">
            <div className="mb-2 text-2xl">{m.icon}</div>
            <h2 className="font-semibold text-gray-900 group-hover:text-blue-600">{m.name}</h2>
            <p className="text-sm text-gray-500">{m.desc}</p>
          </a>
        ))}
      </div>

      <footer className="mt-12 border-t pt-4 text-center text-sm text-gray-400">
        Based on Code Général des Impôts (CGI) 2026 — Finance Law No. 50-25
      </footer>
    </div>
  );
}
