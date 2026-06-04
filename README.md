# FiscalPro Maroc — Tax Calculation & Optimization Platform

Plateforme de calcul et d'optimisation fiscale pour experts-comptables marocains basée sur le **Code Général des Impôts (CGI) 2026** (Finance Law No. 50-25).

## Quick Start

**Prérequis:** [Node.js](https://nodejs.org) (v18+)

```bash
# Clone
git clone https://github.com/anouarmaroc2009-cmyk/tax-calculation-maroc.git
cd tax-calculation-maroc

# Option 1: Script automatique (PowerShell)
.\start.ps1

# Option 2: Manuellement
# Terminal 1 — Backend (API)
cd backend
npm install
npx nest start --watch
# → API sur http://localhost:4000

# Terminal 2 — Frontend (UI)
cd frontend
npm install
npm run dev
# → UI sur http://localhost:3000

# Option 3: Docker
docker-compose up -d
```

## API Endpoints

Le backend expose 6 endpoints REST sur `http://localhost:4000/api/v1`:

| Endpoint | POST Body | Calcule |
|----------|-----------|---------|
| `/is/calculate` | `{ fiscalYear, companyType, netAccountingProfit, totalRevenue, ... }` | IS (taux 20%/35%/40%), CM, acomptes |
| `/ir/calculate` | `{ salaries[], rentalIncome[], dependents }` | IR (barème progressif 0-38%), RVI |
| `/tva/calculate` | `{ sales[], purchases[], priorCredit, ... }` | TVA collectée/déductible, crédit |
| `/classification/classify` | `{ type, context }` | Classification actif/passif |
| `/optimization/run` | `{ dividendIncome, netProfit, fixedAssets, ... }` | Stratégies d'optimisation |
| `/penalties/calculate` | `{ taxType, taxAmount, dueDate, paymentDate }` | Pénalités Art. 208 |

## Structure du projet

```
tax-calculation-maroc/
├── backend/                     # NestJS API (TypeScript)
│   ├── src/
│   │   ├── main.ts             # Point d'entrée, CORS, ValidationPipe
│   │   ├── app.module.ts       # Module NestJS (6 controllers + 6 providers)
│   │   ├── controllers/        # REST controllers (is, ir, tva, classification, optimization, penalties)
│   │   └── engines/            # Moteurs de calcul (pure functions)
│   ├── prisma/schema.prisma    # Modèle de données (Firm, User, Client, FiscalYear)
│   ├── .env                    # PORT=4000
│   └── package.json
├── frontend/                    # Next.js 14 App Router
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css     # Design system Tailwind + composants customs
│   │   │   ├── layout.tsx      # Navbar + Footer
│   │   │   ├── page.tsx        # Page d'accueil
│   │   │   ├── is/page.tsx     # Calculateur IS
│   │   │   ├── ir/page.tsx     # Calculateur IR
│   │   │   ├── tva/page.tsx    # Calculateur TVA
│   │   │   ├── classification/  # Classification Actif/Passif
│   │   │   ├── optimization/   # Optimisation fiscale
│   │   │   └── penalties/      # Pénalités Art. 208
│   │   └── lib/api.ts          # Client API typé
│   ├── .env.local              # NEXT_PUBLIC_API_URL
│   └── package.json
├── database/
│   └── schema.sql              # 28 tables PostgreSQL
├── docs/                       # Documentation technique complète
├── docker-compose.yml          # PostgreSQL + Redis + Backend + Frontend
├── start.ps1                   # Script de démarrage automatique
└── README.md
```

## Moteurs de calcul

Chaque moteur est une classe pure (sans état) qui prend des entrées typées et retourne des résultats typés:

- **IS** (corporate-income-tax.engine.ts): Taux 20%/35%/40% (Art. 19-I), CM 0.25% (min 3 000 MAD), acomptes trimestriels, report déficitaire 4 ans
- **IR** (individual-income-tax.engine.ts): Barème 6 tranches (0%-38%), Cat. 1 (salaires), Cat. 4 (fonciers, abattement 40%), Cat. 5 (capitaux mobiliers), réduction famille (360 MAD/personne)
- **TVA** (vat.engine.ts): Taux 20%/10%, matrice de déduction, auto-liquidation, mensuel/trimestriel
- **Classification** (classification.engine.ts): 6 types de revenus, règles de reclassification (trader, professionnel, >25% portefeuille, >5 biens)
- **Optimisation** (optimization.engine.ts): 6 stratégies classées par économies, niveaux de risque, délais
- **Pénalités** (penalty.engine.ts): Art. 208 — pénalité 5% (≤30j) / 10% (>30j) / 20% (TVA/RAS), intérêt 0.5%/mois

## License

Private — Accounting firm internal use.
