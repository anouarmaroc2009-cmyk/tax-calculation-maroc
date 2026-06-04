# FiscalPro Maroc — Architecture

## 1. System Overview

Multi-tenant SaaS web application for Moroccan accounting firms. Three core tax engines (IS, IR, TVA) fed by a unified chart of accounts, with an Active/Passive classification layer and cross-cutting optimization engine.

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui + React Query |
| **Backend** | NestJS 10 + TypeScript + Prisma ORM |
| **Database** | PostgreSQL 16 + Redis 7 (cache, session, queue) |
| **PDF/XML** | Puppeteer + XML Builder (EDI generation) |
| **Auth** | Keycloak with RBAC (Accountant, Manager, Admin, Client-Viewer) |
| **Infrastructure** | Docker + Kubernetes, CI/CD via GitHub Actions |
| **Monitoring** | Prometheus + Grafana + Sentry |
| **Queue** | Bull (Redis) for async EDI submission & PDF generation |

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Web App    │  │  Mobile PWA │  │  API Client │             │
│  │ (Next.js)   │  │ (React Nat) │  │ (Postman/   │             │
│  │             │  │             │  │  Integrato) │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
└─────────┼────────────────┼─────────────────┼────────────────────┘
          │                │                 │
┌─────────┴────────────────┴─────────────────┴────────────────────┐
│                      API GATEWAY (Kong)                         │
│  Auth · Rate Limit · Routing · Logging · WAF                    │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────┐
│                    MICROSERVICES LAYER                           │
│                                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │  Client  │ │   Tax    │ │  Report  │ │   Document       │  │
│  │ Service  │ │ Service  │ │  Service │ │   Service        │  │
│  │          │ │          │ │          │ │   (EDI/PDF)      │  │
│  │ - CRUD   │ │ - IS     │ │ - Global │ │                  │  │
│  │ - Fiscal │ │ - IR     │ │ - Annual │ │ - XML Gen       │  │
│  │ - Regime │ │ - TVA    │ │ - Multi- │ │ - EDI Submit    │  │
│  │ - Entity │ │ - Penalty│ │  year    │ │ - PDF Fill      │  │
│  └──────────┘ └────┬─────┘ └──────────┘ └──────────────────┘  │
│                    │                                            │
│  ┌─────────────────┴─────────────────────────────────────────┐ │
│  │              ENGINE LAYER (stateless)                     │ │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐           │ │
│  │  │ IS Engine  │ │ IR Engine  │ │ TVA Engine │           │ │
│  │  │ - Calc     │ │ - Calc     │ │ - Calc     │           │ │
│  │  │ - Install. │ │ - WHT      │ │ - Deduct.  │           │ │
│  │  │ - MC       │ │ - Global   │ │ - Matrix    │           │ │
│  │  │ - Carryfwd │ │ - Scale    │ │ - Self-inv │           │ │
│  │  └────────────┘ └────────────┘ └────────────┘           │ │
│  │  ┌──────────────────────────────────────────┐           │ │
│  │  │ Classification Engine                    │           │ │
│  │  │ - Active vs Passive Income               │           │ │
│  │  │ - Active vs Passive Assets               │           │ │
│  │  │ - Reclassification Triggers              │           │ │
│  │  └──────────────────────────────────────────┘           │ │
│  │  ┌──────────────────────────────────────────┐           │ │
│  │  │ Optimization Engine (Rule-based)         │           │ │
│  │  │ - Strategy ranking                       │           │ │
│  │  │ - What-if simulator                      │           │ │
│  │  │ - Compliance guardrails                  │           │ │
│  │  └──────────────────────────────────────────┘           │ │
│  └─────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │
┌────────────────────────────────┴────────────────────────────────┐
│                     DATA LAYER                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │PostgreSQL│  │  Redis   │  │   S3     │  │  Elasticsearch│  │
│  │ - Master │  │ - Cache  │  │ - Docs   │  │  - Search     │  │
│  │ - Audit  │  │ - Queue  │  │ - PDF    │  │  - Logs       │  │
│  │ - Archive│  │ - Session│  │ - Attach.│  │               │  │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Data Flows

### 3.1 IS Calculation Flow

```
Client selects fiscal year + company
        │
        ▼
[1] Fetch P&L, Balance Sheet, Prior-year tax adjustments
        │
        ▼
[2] Classification Engine tags income/asset lines → Active/Passive
        │
        ▼
[3] IS Engine Pipeline:
        │
        ├── Compute Net Accounting Profit (RN)
        ├── Apply Tax Adjustments:
        │   ├── Réintégrations (non-deductible expenses)
        │   │   ├── Passenger vehicle excess (>400K MAD TTC)
        │   │   ├── Non-deductible provisions
        │   │   ├── Fines & penalties
        │   │   ├── Entertainment > deductible limits
        │   │   └── CIT itself
        │   └── Déductions (tax-exempt income, provisions released)
        │
        ├── = Net Taxable Profit (RNI)
        │
        ├── Apply IS Rate (Art. 19-I):
        │   ├── Profit < 100M MAD       → 20%
        │   ├── Profit ≥ 100M MAD       → 35%
        │   ├── Credit/Insurance/BAM/CDG → 40%
        │   ├── CFC/IAZ                 → 20%
        │   └── Investment Agreement ≥1.5B → 20%
        │
        ├── = Gross IS
        │
        ├── Subtract: Tax credits (foreign tax, IPO reduction)
        ├── Compare with: Minimum Contribution (0.25% of revenue, min 3K)
        │
        ├── = IS Due (max of Gross IS and MC)
        │
        ├── Apply Loss Carry-forward (4 years, unlimited for depreciation)
        │
        └── Generate:
            ├── Annual IS Return (XML EDI for Simpl-IS)
            ├── 4 Quarterly Installment Vouchers
            └── PDF Report
```

### 3.2 IR Calculation Flow

```
Input: Individual taxpayer's income data
        │
        ▼
[1] Categorize into 6 income categories (Art. 36 CGI):
        │
        ├── (1) Salaires (Salaries) → Net = Gross - CNSS - AMO - Frais prof.
        ├── (2) Revenus Professionnels → RNR/RNS/CPU regimes
        ├── (3) Revenus Agricoles
        ├── (4) Revenus Fonciers → 40% abatement, then 10% or 15% WHT
        ├── (5) Revenus des Capitaux Mobiliers:
        │       ├── Dividends: 10% final WHT (Art. 73-II-B-7°)
        │       ├── Interest (non-prof.): 30% final WHT (Art. 73-II-G-3°)
        │       ├── Interest (professional): 20% creditable WHT
        │       └── Foreign-source: 15% declarable
        └── (6) Plus-values:
                ├── Listed shares: 15%
                ├── Unlisted shares: 20%
                └── Real estate: 20% (min 3% of sale price)
        │
        ▼
[2] Classification Engine:
        ├── Active Income: Salaries, Professional, Agricultural
        └── Passive Income: Dividends, Interest, Rental, Capital Gains
        │
        ▼
[3] Compute Global Net Taxable Income
        │
        ▼
[4] Apply Progressive Scale (Art. 73):
        │
        ├── 0 - 30,000 MAD    → 0%
        ├── 30,001 - 50,000   → 10% (deduct 3,000)
        ├── 50,001 - 60,000   → 20% (deduct 8,000)
        ├── 60,001 - 80,000   → 30% (deduct 14,000)
        ├── 80,001 - 180,000  → 34% (deduct 17,200)
        └── > 180,000         → 38% (deduct 24,400)
        │
        ▼
[5] Apply Family Charge Reduction (Art. 74):
        │
        └── Base reduction + per-dependent allowance
        │
        ▼
[6] Subtract Withholding Tax Credits
        │
        ▼
[7] Generate:
        ├── Annual IR Declaration (XML for Simpl-IR)
        ├── Monthly withholding statements (for employers)
        └── PDF Summary
```

### 3.3 TVA Calculation Flow

```
Input: Sales & purchase invoices for the period
        │
        ▼
[1] Classify transactions by VAT rate (Art. 99):
        │
        ├── 20% Standard: most goods & services
        ├── 10% Reduced: banking, hotels, urban transport, sugar, oil, rice
        ├── 0% / Exempt:
        │   ├── ADD (with deduction right): exports
        │   └── SDD (without deduction right): bread, couscous, water, meds
        │
        ▼
[2] Compute VAT Collected (TVA collectée):
        │
        └── Σ(Sales_i × Rate_i)
        │
        ▼
[3] Compute VAT Deductible (TVA déductible):
        │
        └── Σ(Purchases_j × Rate_j × Right_to_Deduct_Flag_j)
        │
        ▼
[4] Net VAT = Collected - Deductible
        │
        ├── If positive → Payable to DGI
        └── If negative → Credit carry-forward
        │
        ▼
[5] Generate:
        ├── Monthly/Quarterly TVA Declaration (XML EDI for Simpl-TVA)
        └── PDF Report
```

### 3.4 Tax Optimization Flow

```
Input: Client's full fiscal profile
        │
        ▼
[1] Optimization Engine loads rules:
        │
        ├── Holding structure potential (parent-subsidiary regime)
        ├── CFC/IAZ eligibility check
        ├── IPO readiness assessment
        ├── Group restructuring opportunities
        ├── Depreciation method optimizer (straight-line vs declining-balance)
        ├── Passenger vehicle cap compliance
        ├── Loss carry-forward tracking
        ├── Investment agreement (>1.5B MAD) qualification
        ├── Retirement planning (pension exemption 2026)
        └── Category arbitrage (salary vs dividends for directors)
        │
        ▼
[2] Rank strategies by estimated MAD savings (conservative)
        │
        ▼
[3] Filter by compliance level:
        │
        ├── Green: fully within CGI, zero audit risk
        ├── Yellow: requires documentation, low audit risk
        └── Red: blocked (abus de droit Art. 172)
        │
        ▼
[4] User selects strategies → What-if Simulator recomputes IS/IR/TVA
        │
        ▼
[5] Generate:
        ├── Optimization Report (PDF)
        ├── Action Plan with timeline
        └── Compliance documentation checklist
```

## 4. Directory Structure

```
src/
├── engines/                           # Pure calculation engines (no I/O)
│   ├── corporate-income-tax.engine.ts
│   ├── individual-income-tax.engine.ts
│   ├── vat.engine.ts
│   ├── minimum-contribution.engine.ts
│   ├── depreciation.engine.ts
│   ├── progressive-scale.engine.ts
│   ├── withholding-tax.engine.ts
│   ├── penalty-calculator.engine.ts
│   ├── classification.engine.ts
│   └── optimization.engine.ts
│
├── services/                          # Business logic with DB access
│   ├── client.service.ts
│   ├── fiscal-year.service.ts
│   ├── declaration.service.ts
│   ├── installment.service.ts
│   ├── edi-generation.service.ts
│   ├── pdf-generation.service.ts
│   ├── audit-log.service.ts
│   └── cache.service.ts
│
├── api/                               # REST (NestJS controllers)
│   ├── clients.controller.ts
│   ├── is-declarations.controller.ts
│   ├── ir-declarations.controller.ts
│   ├── tva-declarations.controller.ts
│   ├── optimization.controller.ts
│   └── edi.controller.ts
│
├── models/                            # TypeScript interfaces/types
│   ├── client.interface.ts
│   ├── fiscal-year.interface.ts
│   ├── declaration.interface.ts
│   ├── tax-adjustment.interface.ts
│   ├── income-category.interface.ts
│   ├── asset.interface.ts
│   ├── optimization-plan.interface.ts
│   └── edi-format.interface.ts
│
└── config/                            # Rate tables & rule configs
    ├── is-rates.config.ts             # 2026 IS rates table
    ├── ir-scale.config.ts             # 2026 IR brackets
    ├── tva-rates.config.ts            # 2026 TVA rates
    ├── depreciation-rates.config.ts   # Asset depreciation rates
    ├── penalties.config.ts            # Article 208 penalty rules
    ├── optimization-rules.config.ts   # Optimization rule definitions
    └── classification-rules.config.ts # Active/Passive classification rules
```

## 5. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Engines are stateless | Pure functions with (config, inputs) → outputs. Easy to test, cache, and scale |
| Rate tables in config, not DB | Tax rates change yearly; config-as-code enables git tracking & review |
| Classification as separate engine | Enables reuse across IS, IR, and Optimization modules |
| Optimization is rule-based (not ML) | Tax law is deterministic; rules are auditable and defensible to DGI |
| EDI XML generation server-side | Avoids exposing XSD schema complexity to frontend |
| Prisma ORM | Type-safe database access with migrations; supports PostgreSQL advanced features |
| Microservices via NestJS modules | Monorepo with module boundaries; extractable into separate services if needed |
| Multi-tenant by client_account_id | Row-level security in PostgreSQL (RLS) for data isolation |

## 6. Security

- **Authentication**: Keycloak with OAuth2/OIDC
- **Authorization**: RBAC with 4 roles (Admin, Manager, Accountant, ClientView)
- **Data isolation**: Row-Level Security (RLS) on PostgreSQL
- **Encryption at rest**: AES-256 for S3 documents
- **Encryption in transit**: TLS 1.3
- **Audit log**: All tax calculations logged immutably
- **Sensitive data**: Client IF/ICE numbers encrypted at application level

## 7. Deployment

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Production  │     │   Staging    │     │  Developer   │
│  (K8s cluster│     │  (K8s or VM) │     │  (Docker    │
│   HA, 3+    │     │              │     │   Compose)  │
│   replicas)  │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘

CI/CD: GitHub Actions → Build → Test → Docker Image → Deploy
```

## 8. Environment Variables

```
DATABASE_URL=postgresql://user:pass@host:5432/fiscalpro
REDIS_URL=redis://host:6379
S3_BUCKET=fiscalpro-documents
S3_REGION=us-east-1
KEYCLOAK_URL=https://auth.fiscalpro.ma
KEYCLOAK_REALM=fiscalpro
DGI_SIMPL_IS_URL=https://simplis.tax.gov.ma
DGI_SIMPL_IR_URL=https://simplir.tax.gov.ma
DGI_SIMPL_TVA_URL=https://simpltva.tax.gov.ma
NODE_ENV=production
```
