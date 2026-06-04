-- FiscalPro Maroc — Full PostgreSQL Schema
-- Based on CGI 2026 (Code Général des Impôts)

-- ============================================================
-- PART 1: TENANCY & ACCESS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE firms (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(255) NOT NULL,
    ice             VARCHAR(15),
    if_             VARCHAR(15),   -- Identifiant Fiscal
    cnss_number     VARCHAR(20),
    address         TEXT,
    city            VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    logo_url        TEXT,
    subscription_plan VARCHAR(50) DEFAULT 'professional',
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id         UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    role            VARCHAR(50) NOT NULL DEFAULT 'accountant'
                    CHECK (role IN ('admin', 'manager', 'accountant', 'client_view')),
    is_active       BOOLEAN DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 2: CLIENTS (TAXPAYERS)
-- ============================================================

CREATE TABLE clients (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id         UUID NOT NULL REFERENCES firms(id) ON DELETE CASCADE,
    client_type     VARCHAR(50) NOT NULL
                    CHECK (client_type IN (
                        'SA', 'SARL', 'SAS', 'SNC', 'SCS',
                        'INDIVIDUAL', 'INDEPENDENT', 'AUTO_ENTREPRENEUR',
                        'ASSOCIATION', 'GROUPEMENT', 'OTHER'
                    )),
    entity_name     VARCHAR(255),       -- company name or individual full name
    first_name      VARCHAR(100),
    last_name       VARCHAR(100),
    ice             VARCHAR(15),         -- Identifiant Commun de l'Entreprise
    if_             VARCHAR(15),         -- Identifiant Fiscal
    cin             VARCHAR(20),         -- Carte Nationale (individuals)
    rc              VARCHAR(30),         -- Registre de Commerce
    patente         VARCHAR(30),         -- Patente / Taxe Professionnelle
    cnss_number     VARCHAR(20),
    tax_center      VARCHAR(100),        -- Centre des Impôts
    jurisdiction    VARCHAR(100),        -- Interlocuteur fiscal
    address         TEXT,
    city            VARCHAR(100),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    fiscal_regime   VARCHAR(50)
                    CHECK (fiscal_regime IN (
                        'RN', 'RNS', 'RNR', 'CPU',
                        'AUTO_ENTREPRENEUR',
                        'REGIME_REEL', 'REGIME_SIMPLIFIE',
                        'FORFAIT_AGRICOLE'
                    )),
    vat_subject     BOOLEAN DEFAULT false,
    vat_regime      VARCHAR(20) CHECK (vat_regime IN ('MONTHLY', 'QUARTERLY', 'EXEMPT')),
    is_export_company BOOLEAN DEFAULT false,
    is_cfc          BOOLEAN DEFAULT false,
    is_iaz          BOOLEAN DEFAULT false,
    has_investment_agreement BOOLEAN DEFAULT false,
    investment_agreement_amount DECIMAL(18,2),
    activity_sector VARCHAR(100),
    notes           TEXT,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 3: FISCAL YEARS & DECLARATIONS
-- ============================================================

CREATE TABLE fiscal_years (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    year            INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2099),
    date_start      DATE NOT NULL,
    date_end        DATE NOT NULL,
    status          VARCHAR(50) DEFAULT 'draft'
                    CHECK (status IN ('draft', 'in_progress', 'completed', 'filed', 'audited')),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, year)
);

-- ============================================================
-- PART 4: FINANCIAL DATA (P&L, Balance Sheet)
-- ============================================================

CREATE TABLE account_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(10) UNIQUE NOT NULL,  -- e.g., '1', '2', '3', '4', '5', '6', '7'
    name_ar         VARCHAR(255),
    name_fr         VARCHAR(255),
    type            VARCHAR(20) NOT NULL CHECK (type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'))
);

CREATE TABLE accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id     UUID REFERENCES account_categories(id),
    code            VARCHAR(20) UNIQUE NOT NULL,  -- e.g., '1111', '2111', '6111'
    name_ar         VARCHAR(255),
    name_fr         VARCHAR(255),
    is_balance_sheet BOOLEAN DEFAULT false,
    is_pl_account   BOOLEAN DEFAULT false,
    vat_rate_code   VARCHAR(20),                  -- STANDARD, REDUCED_ADD, REDUCED_SDD, EXPORT, EXEMPT
    is_depreciable  BOOLEAN DEFAULT false,
    is_passive_default BOOLEAN DEFAULT false       -- Default classification
);

CREATE TABLE journal_entries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fiscal_year_id  UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
    entry_date      DATE NOT NULL,
    reference       VARCHAR(50),
    description     TEXT,
    entry_type      VARCHAR(20) CHECK (entry_type IN ('SALE', 'PURCHASE', 'EXPENSE', 'REVENUE', 'ASSET', 'ADJUSTMENT', 'CLOSING')),
    is_validated    BOOLEAN DEFAULT false,
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE journal_lines (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entry_id        UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id      UUID NOT NULL REFERENCES accounts(id),
    debit_amount    DECIMAL(18,2) DEFAULT 0,
    credit_amount   DECIMAL(18,2) DEFAULT 0,
    vat_amount      DECIMAL(18,2) DEFAULT 0,
    vat_rate_code   VARCHAR(20),
    is_auto_liquidation BOOLEAN DEFAULT false,
    description     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 5: ASSET REGISTER (with Active/Passive Classification)
-- ============================================================

CREATE TABLE asset_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(20) UNIQUE NOT NULL,
    name_fr         VARCHAR(255),
    default_sl_rate DECIMAL(5,2),      -- Default straight-line depreciation rate (%)
    default_useful_life INTEGER,       -- Default useful life in years
    eligible_declining BOOLEAN DEFAULT false,
    passenger_vehicle_cap BOOLEAN DEFAULT false,
    vat_recovery    BOOLEAN DEFAULT true,
    default_classification VARCHAR(20) DEFAULT 'ACTIVE'
                    CHECK (default_classification IN ('ACTIVE', 'PASSIVE', 'MIXED')),
    cgi_article     VARCHAR(50)
);

CREATE TABLE assets (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    asset_category_id UUID REFERENCES asset_categories(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    acquisition_date DATE,
    in_service_date DATE,
    acquisition_cost DECIMAL(18,2) NOT NULL,
    residual_value  DECIMAL(18,2) DEFAULT 0,
    depreciation_method VARCHAR(20) DEFAULT 'STRAIGHT_LINE'
                    CHECK (depreciation_method IN ('STRAIGHT_LINE', 'DECLINING_BALANCE', 'NONE')),
    depreciation_rate DECIMAL(5,2),    -- Custom rate (null = use category default)
    useful_life     INTEGER,            -- Custom life (null = use category default)
    classification  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
                    CHECK (classification IN ('ACTIVE', 'PASSIVE', 'MIXED')),
    classification_reasoning TEXT,
    is_passenger_vehicle BOOLEAN DEFAULT false,
    vehicle_cap_applied BOOLEAN DEFAULT false,
    status          VARCHAR(50) DEFAULT 'IN_USE'
                    CHECK (status IN ('IN_USE', 'FULLY_DEPRECIATED', 'SOLD', 'SCRAPPED')),
    disposal_date   DATE,
    disposal_price  DECIMAL(18,2),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE depreciation_schedule (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id        UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    fiscal_year     INTEGER NOT NULL,
    annual_charge   DECIMAL(18,2) NOT NULL,
    accumulated_depreciation DECIMAL(18,2) NOT NULL,
    net_book_value  DECIMAL(18,2) NOT NULL,
    method_applied  VARCHAR(20) NOT NULL,
    is_recorded     BOOLEAN DEFAULT false,   -- Must be recorded in accounts to be deductible
    reintegration_amount DECIMAL(18,2) DEFAULT 0,  -- Non-deductible portion (e.g., vehicle cap excess)
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, fiscal_year)
);

-- ============================================================
-- PART 6: IS TAX ENGINE DATA
-- ============================================================

CREATE TABLE is_calculations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fiscal_year_id  UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
    -- Inputs
    net_accounting_profit DECIMAL(18,2),
    total_revenue   DECIMAL(18,2),
    financial_income DECIMAL(18,2),
    subsidies       DECIMAL(18,2),
    -- Adjustments
    total_reintegrations DECIMAL(18,2) DEFAULT 0,
    total_deductions DECIMAL(18,2) DEFAULT 0,
    net_taxable_profit DECIMAL(18,2),
    -- Rate application
    is_rate_applied DECIMAL(5,2),       -- e.g., 20.00, 35.00, 40.00
    is_rate_reason  VARCHAR(100),       -- Why this rate was applied
    gross_is        DECIMAL(18,2),
    -- Minimum Contribution
    mc_base         DECIMAL(18,2),
    mc_rate_applied DECIMAL(5,2),
    mc_amount       DECIMAL(18,2),
    mc_exempt       BOOLEAN DEFAULT false,
    -- Loss carry-forward
    loss_cf_applied DECIMAL(18,2) DEFAULT 0,
    loss_cf_remaining DECIMAL(18,2) DEFAULT 0,
    loss_cf_depreciation_unlimited DECIMAL(18,2) DEFAULT 0,
    -- Result
    is_due          DECIMAL(18,2),
    foreign_tax_credits DECIMAL(18,2) DEFAULT 0,
    net_is_payable  DECIMAL(18,2),
    -- Status
    calculation_date TIMESTAMPTZ DEFAULT NOW(),
    calculated_by   UUID REFERENCES users(id),
    is_final        BOOLEAN DEFAULT false,
    UNIQUE(fiscal_year_id)
);

CREATE TABLE is_tax_adjustments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    is_calculation_id UUID NOT NULL REFERENCES is_calculations(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('REINTEGRATION', 'DEDUCTION')),
    category        VARCHAR(100),        -- e.g., 'passenger_vehicle_excess', 'non_deductible_provision'
    description     TEXT,
    amount          DECIMAL(18,2) NOT NULL,
    cgi_reference   VARCHAR(50),         -- e.g., 'Art. 10-I-F-1°'
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE is_quarterly_installments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fiscal_year_id  UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL CHECK (installment_number BETWEEN 1 AND 4),
    due_date        DATE NOT NULL,
    base_amount     DECIMAL(18,2),       -- 25% of prior year IS
    rate_transition BOOLEAN DEFAULT false, -- True if 2023-2026 transition applies
    amount_due      DECIMAL(18,2) NOT NULL,
    amount_paid     DECIMAL(18,2) DEFAULT 0,
    payment_date    DATE,
    status          VARCHAR(20) DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'partial', 'overdue')),
    notes           TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(fiscal_year_id, installment_number)
);

CREATE TABLE is_loss_carryforward (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    origin_fiscal_year INTEGER NOT NULL,
    amount          DECIMAL(18,2) NOT NULL,
    loss_type       VARCHAR(20) NOT NULL CHECK (loss_type IN ('ORDINARY', 'DEPRECIATION')),
    amount_used     DECIMAL(18,2) DEFAULT 0,
    expires_at      INTEGER,             -- origin_year + 4 for ordinary, NULL for unlimited
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, origin_fiscal_year, loss_type)
);

-- ============================================================
-- PART 7: IR TAX ENGINE DATA
-- ============================================================

CREATE TABLE ir_calculations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fiscal_year_id  UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
    taxpayer_type   VARCHAR(50) DEFAULT 'SINGLE'
                    CHECK (taxpayer_type IN ('SINGLE', 'MARRIED', 'HEAD_OF_HOUSEHOLD')),
    dependents      INTEGER DEFAULT 0,
    -- Category totals
    cat1_salaries_net DECIMAL(18,2) DEFAULT 0,
    cat2_professional_net DECIMAL(18,2) DEFAULT 0,
    cat3_agricultural_net DECIMAL(18,2) DEFAULT 0,
    cat4_rental_net DECIMAL(18,2) DEFAULT 0,
    cat5_movable_capital_net DECIMAL(18,2) DEFAULT 0,
    cat6_capital_gains_net DECIMAL(18,2) DEFAULT 0,
    -- Aggregates
    global_net_taxable_income DECIMAL(18,2),
    gross_ir        DECIMAL(18,2),
    family_reduction DECIMAL(18,2) DEFAULT 0,
    ir_after_family DECIMAL(18,2),
    withholding_tax_credits DECIMAL(18,2) DEFAULT 0,
    net_ir_payable  DECIMAL(18,2),
    effective_rate  DECIMAL(5,2),
    calculation_date TIMESTAMPTZ DEFAULT NOW(),
    calculated_by   UUID REFERENCES users(id),
    is_final        BOOLEAN DEFAULT false,
    UNIQUE(fiscal_year_id)
);

CREATE TABLE ir_income_categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ir_calculation_id UUID NOT NULL REFERENCES ir_calculations(id) ON DELETE CASCADE,
    category_number INTEGER NOT NULL CHECK (category_number BETWEEN 1 AND 6),
    category_name   VARCHAR(100),
    gross_amount    DECIMAL(18,2),
    deductions_amount DECIMAL(18,2),
    net_amount      DECIMAL(18,2),
    withholding_tax DECIMAL(18,2) DEFAULT 0,
    is_final_withholding BOOLEAN DEFAULT false,
    classification  VARCHAR(20) NOT NULL CHECK (classification IN ('ACTIVE', 'PASSIVE')),
    regime          VARCHAR(50),         -- RNR, RNS, CPU, etc.
    UNIQUE(ir_calculation_id, category_number)
);

CREATE TABLE ir_withholding_taxes (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ir_calculation_id UUID REFERENCES ir_calculations(id) ON DELETE CASCADE,
    client_id       UUID NOT NULL REFERENCES clients(id),
    income_type     VARCHAR(50) NOT NULL
                    CHECK (income_type IN ('SALARY', 'DIVIDEND', 'INTEREST', 'RENTAL', 'CAPITAL_GAIN', 'FOREIGN_INCOME')),
    payer_name      VARCHAR(255),
    gross_amount    DECIMAL(18,2),
    withholding_rate DECIMAL(5,2),
    withholding_amount DECIMAL(18,2),
    is_final        BOOLEAN DEFAULT false,
    is_creditable   BOOLEAN DEFAULT false,
    withholding_date DATE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 8: TVA ENGINE DATA
-- ============================================================

CREATE TABLE tva_declarations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fiscal_year_id  UUID NOT NULL REFERENCES fiscal_years(id) ON DELETE CASCADE,
    period_type     VARCHAR(20) NOT NULL CHECK (period_type IN ('MONTHLY', 'QUARTERLY')),
    period_number   INTEGER NOT NULL,    -- 1-12 for monthly, 1-4 for quarterly
    period_start    DATE NOT NULL,
    period_end      DATE NOT NULL,
    -- VAT collected
    sales_20_pct    DECIMAL(18,2),       -- HT sales at 20%
    vat_collected_20 DECIMAL(18,2),
    sales_10_pct    DECIMAL(18,2),       -- HT sales at 10%
    vat_collected_10 DECIMAL(18,2),
    sales_0_pct     DECIMAL(18,2),       -- Exempt ADD
    sales_exempt_sdd DECIMAL(18,2),      -- Exempt SDD
    total_vat_collected DECIMAL(18,2),
    -- VAT deductible
    purchases_20_pct DECIMAL(18,2),
    vat_deductible_20 DECIMAL(18,2),
    purchases_10_pct DECIMAL(18,2),
    vat_deductible_10 DECIMAL(18,2),
    total_vat_deductible DECIMAL(18,2),
    -- Results
    net_vat         DECIMAL(18,2),
    prior_credit    DECIMAL(18,2) DEFAULT 0,
    vat_payable     DECIMAL(18,2) DEFAULT 0,
    vat_credit_carryforward DECIMAL(18,2) DEFAULT 0,
    auto_liquidation_applied BOOLEAN DEFAULT false,
    auto_liquidation_amount DECIMAL(18,2) DEFAULT 0,
    -- Status
    status          VARCHAR(20) DEFAULT 'draft'
                    CHECK (status IN ('draft', 'calculated', 'filed', 'paid')),
    deadline        DATE,
    filing_date     DATE,
    payment_date    DATE,
    calculation_date TIMESTAMPTZ DEFAULT NOW(),
    calculated_by   UUID REFERENCES users(id),
    notes           TEXT,
    UNIQUE(fiscal_year_id, period_type, period_number)
);

CREATE TABLE tva_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tva_declaration_id UUID NOT NULL REFERENCES tva_declarations(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL CHECK (type IN ('SALE', 'PURCHASE', 'AUTO_LIQUIDATION', 'CREDIT_NOTE')),
    invoice_number  VARCHAR(50),
    invoice_date    DATE,
    supplier_customer VARCHAR(255),
    if_             VARCHAR(15),
    ht_amount       DECIMAL(18,2) NOT NULL,
    vat_rate_code   VARCHAR(30) NOT NULL,
    vat_amount      DECIMAL(18,2),
    deduction_right VARCHAR(10) CHECK (deduction_right IN ('FULL', 'PARTIAL', 'NONE')),
    classification  VARCHAR(20) DEFAULT 'ACTIVE'
                    CHECK (classification IN ('ACTIVE', 'PASSIVE', 'MIXED')),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 9: CLASSIFICATION & OPTIMIZATION
-- ============================================================

CREATE TABLE classification_results (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    fiscal_year_id  UUID REFERENCES fiscal_years(id),
    classified_type VARCHAR(20) NOT NULL CHECK (classified_type IN ('INCOME', 'ASSET')),
    ref_id          UUID,                -- FK to income category or asset
    ref_name        VARCHAR(255),
    default_classification VARCHAR(20) NOT NULL,
    actual_classification VARCHAR(20) NOT NULL CHECK (actual_classification IN ('ACTIVE', 'PASSIVE', 'MIXED')),
    reclassification_applied BOOLEAN DEFAULT false,
    reclassification_rule VARCHAR(100),
    reasoning       TEXT,
    risk_level      VARCHAR(20) DEFAULT 'LOW'
                    CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    cgi_references  TEXT[],
    documentation_required TEXT[],
    calculated_by   UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE optimization_plans (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    fiscal_year_id  UUID REFERENCES fiscal_years(id),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) DEFAULT 'draft'
                    CHECK (status IN ('draft', 'active', 'implemented', 'abandoned')),
    total_estimated_savings DECIMAL(18,2),
    risk_level      VARCHAR(20) DEFAULT 'LOW'
                    CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    created_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE optimization_recommendations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plan_id         UUID NOT NULL REFERENCES optimization_plans(id) ON DELETE CASCADE,
    strategy_code   VARCHAR(20) NOT NULL, -- S1-S12
    strategy_name   VARCHAR(255) NOT NULL,
    description     TEXT,
    estimated_savings DECIMAL(18,2),
    risk_level      VARCHAR(20) DEFAULT 'LOW'
                    CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    implementation_timeline VARCHAR(100),
    prerequisites   TEXT[],
    guardrail_warnings TEXT[],
    legal_basis     VARCHAR(100),
    is_selected     BOOLEAN DEFAULT false,
    implementation_status VARCHAR(20) DEFAULT 'pending'
                    CHECK (implementation_status IN ('pending', 'in_progress', 'done', 'skipped')),
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 10: PENALTIES
-- ============================================================

CREATE TABLE penalty_calculations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id       UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tax_type        VARCHAR(50) NOT NULL,
    declaration_type VARCHAR(50),
    tax_amount      DECIMAL(18,2) NOT NULL,
    due_date        DATE NOT NULL,
    filing_date     DATE,
    payment_date    DATE,
    -- Calculated
    late_filing_penalty DECIMAL(18,2) DEFAULT 0,
    late_payment_penalty DECIMAL(18,2) DEFAULT 0,
    late_payment_interest DECIMAL(18,2) DEFAULT 0,
    vat_wht_surcharge DECIMAL(18,2) DEFAULT 0,
    total_penalty   DECIMAL(18,2),
    minimum_applied DECIMAL(18,2) DEFAULT 0,
    applicable_articles TEXT[],
    notes           TEXT,
    calculated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 11: EDI / DGI INTEGRATION
-- ============================================================

CREATE TABLE edi_submissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id         UUID NOT NULL REFERENCES firms(id),
    client_id       UUID NOT NULL REFERENCES clients(id),
    declaration_type VARCHAR(20) NOT NULL CHECK (declaration_type IN ('IS_ANNUAL', 'IR_ANNUAL', 'TVA')),
    fiscal_year_id  UUID REFERENCES fiscal_years(id),
    period          VARCHAR(20),         -- For TVA: '2026-M01', '2026-Q1'
    xml_content     TEXT NOT NULL,
    xml_file_name   VARCHAR(255),
    file_size_bytes INTEGER,
    -- Submission tracking
    submission_date TIMESTAMPTZ,
    dgi_tracking_id VARCHAR(100),
    status          VARCHAR(50) DEFAULT 'generated'
                    CHECK (status IN ('generated', 'uploaded', 'validated', 'accepted', 'rejected', 'filed')),
    error_message   TEXT,
    error_file_url  TEXT,
    -- Processing
    submitted_by    UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PART 12: AUDIT LOG
-- ============================================================

CREATE TABLE audit_log (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firm_id         UUID REFERENCES firms(id),
    user_id         UUID REFERENCES users(id),
    client_id       UUID REFERENCES clients(id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(100),
    entity_id       UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_clients_firm ON clients(firm_id);
CREATE INDEX idx_fiscal_years_client ON fiscal_years(client_id);
CREATE INDEX idx_assets_client ON assets(client_id);
CREATE INDEX idx_is_calculations_fy ON is_calculations(fiscal_year_id);
CREATE INDEX idx_ir_calculations_fy ON ir_calculations(fiscal_year_id);
CREATE INDEX idx_tva_declarations_fy ON tva_declarations(fiscal_year_id);
CREATE INDEX idx_optimization_plans_client ON optimization_plans(client_id);
CREATE INDEX idx_edi_submissions_status ON edi_submissions(status);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
CREATE INDEX idx_audit_log_firm ON audit_log(firm_id);
CREATE INDEX idx_is_installments_fy ON is_quarterly_installments(fiscal_year_id);
CREATE INDEX idx_is_loss_cf_client ON is_loss_carryforward(client_id);
CREATE INDEX idx_classification_client ON classification_results(client_id);
CREATE INDEX idx_tva_transactions_decl ON tva_transactions(tva_declaration_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE fiscal_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE is_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ir_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tva_declarations ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE classification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE penalty_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE edi_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only see data from their own firm
CREATE POLICY firm_isolation ON clients
    USING (firm_id = current_setting('app.current_firm_id')::UUID);

-- (Repeat for each table with firm_id)

-- ============================================================
-- END OF SCHEMA
-- ============================================================
