import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FiscalPro Maroc — Calculateurs Fiscaux CGI 2026',
  description: 'Plateforme de calcul et d\'optimisation fiscale pour experts-comptables marocains. IS, IR, TVA, Classification, Optimisation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" />
      </head>
      <body className="text-gray-900 antialiased">
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <a href="/" className="flex items-center gap-2.5">
                <span className="text-2xl">📊</span>
                <span className="text-lg font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">FiscalPro</span>
                <span className="hidden sm:inline text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Maroc</span>
              </a>
              <div className="hidden md:flex items-center gap-6">
                <a href="/is" className="nav-link">IS</a>
                <a href="/ir" className="nav-link">IR</a>
                <a href="/tva" className="nav-link">TVA</a>
                <a href="/classification" className="nav-link">Classification</a>
                <a href="/optimization" className="nav-link">Optimisation</a>
                <a href="/penalties" className="nav-link">Pénalités</a>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">CGI 2026</span>
                <a href="https://github.com/anouarmaroc2009-cmyk/tax-calculation-maroc" target="_blank" rel="noopener" className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        <footer className="border-t border-gray-200/60 bg-white/50 mt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400">
                Basé sur le Code Général des Impôts (CGI) — Finance Law No. 50-25 (2026)
              </p>
              <p className="text-xs text-gray-400">
                Développé pour les experts-comptables marocains
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
