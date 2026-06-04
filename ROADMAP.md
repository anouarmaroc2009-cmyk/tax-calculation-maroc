# FiscalPro Maroc — Development Roadmap

## Phase P0: Foundation (Weeks 1-8)
- Entity & Client Management
- Chart of Accounts import (Plan Comptable Marocain)
- Journal entry CRUD
- **IS Engine** — Full pipeline with 2026 rates, tax adjustments, MC, quarterly installments, loss carry-forward
- PostgreSQL schema creation & migrations
- Docker setup for local development

## Phase P1: IR Engine (Weeks 9-14)
- All 6 income category processors
- Progressive scale with bracket detail
- Withholding tax matrix (final/creditable)
- Family charge reduction
- **IR Calculator UI** with live bracket visualization

## Phase P2: TVA Engine (Weeks 15-20)
- Post-2026 reform rates (20%/10%/0%)
- Deduction rights matrix
- Auto-liquidation for industrial waste
- Monthly/quarterly filing & deadline calculation
- **TVA return generation** (XML + PDF)

## Phase P3: Active/Passive Classification (Weeks 21-24)
- Income classification rules engine
- Asset classification rules engine
- Reclassification triggers & documentation tracking
- Audit trail for all classifications
- **Classification dashboard** with risk indicators

## Phase P4: Optimization Module (Weeks 25-32)
- 12-strategy rule engine
- Eligibility checking per client profile
- Savings estimation (conservative)
- What-if scenario simulator
- Compliance guardrails (Art. 172 — abus de droit)
- **Optimization report PDF generation**

## Phase P5: DGI Integration & Reporting (Weeks 33-38)
- EDI XML generation for Simpl-IS (liasse fiscale)
- EDI XML generation for Simpl-IR (global declaration)
- EDI XML generation for Simpl-TVA (periodic return)
- XSD schema validation
- PDF generation for all tax forms
- Multi-year comparative analytics
- **Dashboard** — real-time tax position, deadlines, penalties

## Phase P6: Production Readiness (Weeks 39-44)
- Multi-tenant hardening with RLS
- RBAC with 4 roles
- Audit logging
- Rate limiting & security
- Performance tuning & caching
- Load testing
- CI/CD pipeline (GitHub Actions)
- User documentation in French & Arabic
- Training materials for accountants

## Past Phases (Completed)

### Phase P0 Status — ✅ Documentation Complete
- [x] Full architecture document (ARCHITECTURE.md)
- [x] Complete PostgreSQL schema (28 tables)
- [x] IS engine with full 2026 rates
- [x] IR engine with 2026 progressive scale
- [x] TVA engine post-2026 reform
- [x] Active/Passive classification rules (15+ categories)
- [x] Optimization strategies (S1-S12)
- [x] DGI integration documentation (Simpl-IS, Simpl-IR, Simpl-TVA)
- [x] Penalties calculator (Art. 208)
- [x] Backend starter (NestJS + TypeScript)
- [x] Frontend starter (Next.js 14)
- [x] Docker Compose for local dev

## Next Milestones

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| MVP with IS Engine | Week 8 | Working IS calculation + quarterly installments + MC |
| IR Engine Live | Week 14 | Full IR calculation + withholding matrix |
| TVA Returns | Week 20 | Monthly/quarterly TVA filing generation |
| Classification | Week 24 | Active/Passive tagging across all client data |
| Optimization | Week 32 | What-if simulator with ranked strategies |
| DGI Integration | Week 38 | EDI XML export for all 3 portals |
| Production Launch | Week 44 | Live multi-tenant deployment |
```
