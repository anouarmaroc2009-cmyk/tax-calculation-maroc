import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FiscalPro Maroc',
  description: 'Tax calculation & optimization platform for Moroccan accountants',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
