# FiscalPro Maroc — Tax Calculation & Optimization Platform

A full-featured web application for Moroccan accountants, auto-calculating **Corporate Income Tax (IS)**, **Individual Income Tax (IR)**, and **Value Added Tax (TVA)** under the 2026 CGI (Code Général des Impôts) reform. Distinguishes between **passive and active income/assets** and includes a **tax optimization module** with permissible strategies under Moroccan law.

## Repository Structure

```
tax-calculation-maroc/
├── ARCHITECTURE.md          # Full system architecture & design
├── ROADMAP.md               # Development phases & timeline
├── docs/                    # Detailed tax engine documentation
│   ├── tax-rates-2026.md           # Complete rate tables (IS, IR, TVA)
│   ├── is-engine.md                # Corporate Income Tax engine spec
│   ├── ir-engine.md                # Individual Income Tax engine spec
│   ├── tva-engine.md               # VAT engine spec
│   ├── active-passive-classification.md  # Active/passive classification
│   ├── optimization-strategies.md  # Legal tax optimization module
│   ├── dgi-integration.md          # DGI Electronic Filing (EDI/EFI)
│   └── penalties-rules.md          # Penalties, late payment & interest
├── database/
│   ├── schema.sql           # Full PostgreSQL schema
│   ├── erd.md               # Entity-Relationship Diagram
│   └── seed-data.sql        # Reference data (rates, codes, rules)
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── engines/         # Tax calculation engines
│   │   ├── services/        # Business logic services
│   │   ├── api/             # REST controllers
│   │   ├── models/          # TypeScript interfaces/types
│   │   └── config/          # Rate tables & rule configs
│   └── package.json
├── frontend/                # Next.js 14 SPA
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable UI components
│   │   └── lib/             # Client-side utilities
│   └── package.json
└── docker-compose.yml
```

## Quick Start

```bash
# Clone
git clone https://github.com/anouarmaroc2009-cmyk/tax-calculation-maroc.git
cd tax-calculation-maroc

# Start with Docker
docker-compose up -d

# Or run backend separately
cd backend && npm install && npm run dev

# Or run frontend separately
cd frontend && npm install && npm run dev
```

## Key Features

| Module | Description |
|--------|-------------|
| **IS Engine** | Corporate Income Tax — 2026 progressive-to-proportional rates (20%/35%/40%), Minimum Contribution (0.25%), quarterly installments, loss carry-forward (4 years) |
| **IR Engine** | Individual Income Tax — 6-bracket progressive scale (0%-38%), all 6 income categories, final/creditable withholding taxes, family charge reductions |
| **TVA Engine** | Value Added Tax — post-2026 reform rates (20%/10%/0%), monthly/quarterly filing, deduction rights matrix, auto-liquidation |
| **Classification Engine** | Active vs Passive income & asset classification per CGI distinctions |
| **Optimization Module** | Legal tax planning strategies: holding structures, CFC/IAZ, CFC, IPO, group restructuring, depreciation optimization, what-if simulation |
| **DGI Integration** | EDI XML generation for Simpl-IS, Simpl-IR, Simpl-TVA portals |
| **Penalties Calculator** | Article 208 penalties: late filing (5%-20%), late payment (5%-20% + 0.5%/month) |

## Legal Compliance

All calculations are based on the **Code Général des Impôts (CGI) 2026 edition** incorporating Finance Law No. 50-25 for fiscal year 2026, including:
- IS rate convergence completion (Art. 19-I)
- TVA rate simplification (Art. 99 — 2-rate system)
- IR scale adjustments (Art. 73)
- Depreciation rules (Art. 10-I-F-1°, Art. 10-III-A)
- Passenger vehicle cap: 400,000 MAD TTC
- Complementary pension exemption
- Fertilizing materials VAT exemption

## License

Private — Accounting firm internal use.
