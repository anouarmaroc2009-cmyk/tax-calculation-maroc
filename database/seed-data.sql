-- FiscalPro Maroc — Reference Data Seed
-- CGI 2026 rates, categories, and configuration

-- ============================================================
-- ASSET CATEGORIES (with depreciation rules)
-- ============================================================

INSERT INTO asset_categories (code, name_fr, default_sl_rate, default_useful_life, eligible_declining, passenger_vehicle_cap, vat_recovery, default_classification, cgi_article) VALUES
('IMM_PRO', 'Constructions professionnelles', 4.00, 25, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('IMM_INDU', 'Constructions industrielles', 5.00, 20, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('IMM_LEGER', 'Constructions légères', 10.00, 10, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('AGENCEMENT', 'Agencements et aménagements', 10.00, 10, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('MAT_OUTIL', 'Matériel et outillage industriel', 10.00, 10, true, false, true, 'ACTIVE', 'Art. 10-I-F-1°, Art. 10-III-A'),
('MAT_TRANS', 'Matériel de transport', 20.00, 5, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('VEH_TOUR', 'Véhicules de tourisme', 20.00, 5, false, true, true, 'MIXED', 'Art. 10-I-F-1° (plafond 400K)'),
('MOB_BUREAU', 'Mobilier de bureau', 10.00, 10, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('MAT_BUREAU', 'Matériel de bureau', 15.00, 7, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('ORDINATEUR', 'Matériel informatique', 25.00, 4, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('LOGICIEL', 'Logiciels', 33.33, 3, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('BREVET', 'Brevets et licences', 20.00, 5, false, false, true, 'ACTIVE', 'Art. 10-I-F-1°'),
('INVEST_PORT', 'Investissements de portefeuille', NULL, NULL, false, false, false, 'PASSIVE', 'Art. 39'),
('IMM_RENT', 'Immeubles locatifs', NULL, NULL, false, false, false, 'PASSIVE', 'Art. 57'),
('TERRAIN', 'Terrains', NULL, NULL, false, false, false, 'MIXED', 'Art. 10 (non amortissable)'),
('FONDS_COMM', 'Fonds de commerce', NULL, NULL, false, false, false, 'ACTIVE', 'Art. 10 (non amortissable)'),
('FRAIS_PREL', 'Frais préliminaires', 20.00, 5, false, false, true, 'ACTIVE', 'Art. 10-I-F-1° (5 ans max)');

-- ============================================================
-- REFERENCE TAX RATES CONFIGURATION
-- ============================================================

-- IS rates configuration (stored as JSON for flexibility)
-- Applied in engine via config file; stored here for reference/audit
-- See docs/is-engine.md for full logic

-- IR progressive scale (stored for engine use)
-- See docs/ir-engine.md

-- TVA rates configuration
-- See docs/tva-engine.md

-- ============================================================
-- NOTE: For production, reference data should also include:
-- 1. Official CGI text references for each rate
-- 2. DGI XSD schema versions for EDI generation
-- 3. Sector-specific classification rules
-- 4. Optimization rule definitions
-- ============================================================
