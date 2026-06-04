# Entity Relationship Diagram

## Core Entity Map

```
firms ──1:N── users
  │
  └──1:N── clients
             │
             ├──1:N── fiscal_years
             │          │
             │          ├──1:1── is_calculations
             │          │          │
             │          │          ├──1:N── is_tax_adjustments
             │          │          ├──1:N── is_quarterly_installments
             │          │          └──1:N── is_loss_carryforward
             │          │
             │          ├──1:1── ir_calculations
             │          │          │
             │          │          ├──1:N── ir_income_categories
             │          │          └──1:N── ir_withholding_taxes
             │          │
             │          ├──1:N── tva_declarations
             │          │          │
             │          │          └──1:N── tva_transactions
             │          │
             │          ├──1:N── journal_entries
             │          │          │
             │          │          └──1:N── journal_lines
             │          │
             │          └──1:N── classification_results
             │
             ├──1:N── assets
             │          │
             │          ├──1:N── depreciation_schedule
             │          └──N:1── asset_categories
             │
             ├──1:N── optimization_plans
             │          │
             │          └──1:N── optimization_recommendations
             │
             ├──1:N── penalty_calculations
             │
             └──1:N── edi_submissions

accounts ──N:1── account_categories
```

## Key Relationships

| Parent | Child | Cardinality | Description |
|--------|-------|-------------|-------------|
| firms | users | 1:N | A firm has multiple users |
| firms | clients | 1:N | A firm manages multiple client taxpayers |
| clients | fiscal_years | 1:N | Each client has many fiscal years |
| fiscal_years | is_calculations | 1:1 | One IS calculation per fiscal year |
| fiscal_years | ir_calculations | 1:1 | One IR calculation per fiscal year |
| fiscal_years | tva_declarations | 1:N | Multiple TVA declarations per fiscal year |
| fiscal_years | journal_entries | 1:N | All journal entries for the fiscal year |
| clients | assets | 1:N | Asset register per client |
| assets | depreciation_schedule | 1:N | Annual depreciation entries per asset |
| clients | optimization_plans | 1:N | Multiple optimization plans per client |
| optimization_plans | optimization_recommendations | 1:N | Strategies within a plan |
| fiscal_years | classification_results | 1:N | Classification results for context |

## Notes

- **Multi-tenancy** is enforced via `firm_id` on all client-facing tables, with Row-Level Security (RLS) in PostgreSQL
- **Active/Passive classification** is stored at the line-item level in `classification_results`, enabling full audit trails
- **Tax adjustments** are individual line items in `is_tax_adjustments` for full traceability
- **EDI submissions** store the raw XML for resubmission if needed
- **Audit log** captures all changes to tax-significant data
- **Loss carry-forward** is tracked per client per origin year with separate handling for ordinary (4yr expiry) and depreciation (unlimited) losses
- **Vehicle cap** is tracked at the asset level with the `vehicle_cap_applied` flag and the excess is recorded in `depreciation_schedule.reintegration_amount`
```
