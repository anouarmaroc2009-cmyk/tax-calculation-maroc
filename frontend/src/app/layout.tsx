import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FiscalPro Maroc — Calculateurs Fiscaux CGI 2026',
  description: 'Plateforme de calcul et d\'optimisation fiscale pour experts-comptables marocains',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 text-gray-900 antialiased font-sans">
        <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <a href="/" className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <span className="text-base font-bold text-blue-700">FiscalPro</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Maroc</span>
              </a>
              <div className="hidden md:flex items-center gap-5 text-sm font-medium text-gray-500">
                <a href="/is" className="hover:text-blue-600 transition-colors">IS</a>
                <a href="/ir" className="hover:text-blue-600 transition-colors">IR</a>
                <a href="/tva" className="hover:text-blue-600 transition-colors">TVA</a>
                <a href="/classification" className="hover:text-blue-600 transition-colors">Classification</a>
                <a href="/optimization" className="hover:text-blue-600 transition-colors">Optimisation</a>
                <a href="/penalties" className="hover:text-blue-600 transition-colors">Pénalités</a>
              </div>
              <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">CGI 2026</span>
            </div>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        <footer className="border-t border-gray-200 bg-white/50 mt-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 text-center text-xs text-gray-400">
            Code Général des Impôts (CGI) — Finance Law No. 50-25 (2026)
          </div>
        </footer>
      </body>
    </html>
  );
}
