# DGI Integration — Electronic Filing (EDI / EFI)

## Overview

The Direction Générale des Impôts (DGI) provides three electronic portals:

| Portal | Tax Type | Filing Mode | URL |
|--------|----------|-------------|-----|
| **Simpl-IS** | Corporate Income Tax | EDI + EFI | https://simplis.tax.gov.ma |
| **Simpl-IR** | Individual Income Tax | EDI + EFI | https://simplir.tax.gov.ma |
| **Simpl-TVA** | Value Added Tax | EDI + EFI | https://simpltva.tax.gov.ma |

## Filing Methods

### EFI (Échange de Formulaires Informatisé)
- Manual data entry through web forms
- No technical integration needed
- Suitable for small businesses

### EDI (Échange de Données Informatisé)
- XML file upload generated from accounting software
- Requires XSD-compliant XML generation
- **This is what our platform implements**

## EDI XML Structure

All EDI files follow the DGI XSD schema (version 1.7 for Simpl-IS):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<DeclarationFiscale>
  <!-- PART 1: Header (common to all declarations) -->
  <Entete>
    <IdentifiantFiscal>99999999</IdentifiantFiscal>
    <ICE>999999999999999</ICE>
    <RaisonSociale>ACME SARL</RaisonSociale>
    <ExerciceFiscal>2026</ExerciceFiscal>
    <TypeDeclaration>IS_ANNUEL</TypeDeclaration>
    <DateGeneration>2026-04-15</DateGeneration>
    <VersionSchema>1.7</VersionSchema>
  </Entete>

  <!-- PART 2: Declaration-specific body -->
  <CorpsDeclaration>
    <!-- See below for specific formats -->
  </CorpsDeclaration>

  <!-- PART 3: Supporting documents -->
  <PiecesJointes>
    <!-- Optional attachments -->
  </PiecesJointes>
</DeclarationFiscale>
```

## Supported Declarations

### Simpl-IS — Annual IS Declaration (Liasse Fiscale)

The IS declaration includes these forms (états):
- **Cahier de Déclaration IS** — main return
- **État 1101** — Balance sheet (Actif)
- **État 1102** — Balance sheet (Passif)
- **État 1103** — P&L (Compte de produits et charges)
- **État 1104** — Tax adjustments (Réintégrations et déductions)
- **État 1105** — Fixed assets & depreciation
- **État 1106** — Provisions
- **État 1107** — Shareholder structure
- **État 1108** — Minimum Contribution calculation
- **État 1109** — Quarterly installments recap

### Simpl-IR — Annual IR Declaration

- **Déclaration du Revenu Global** — Global income return
- **État ADC041F** — Salaries and wages summary
- **État ADC042F** — Withholding tax on salaries
- **État ADC044F** — Employee payroll register

### Simpl-TVA — Periodic TVA Declaration

- **Déclaration Mensuelle/Trimestrielle de TVA**
- **Tableau des Déductions de TVA**
- **État des Achats** — Purchase ledger summary
- **État des Ventes** — Sales ledger summary

## EDI Submission Workflow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Accounting      │     │  Our Platform    │     │  DGI Portal      │
│  Software        │     │  (EDI Generator) │     │  (Simpl-XX)      │
│                  │     │                  │     │                  │
│  Export data     │────▶│  1. Validate     │────▶│  3. Receive XML  │
│  (CSV/XLSX/API)  │     │     against XSD  │     │  4. Format check │
│                  │     │  2. Generate XML │     │  5. Business     │
│                  │     │     file         │     │     validation   │
│                  │     │  6. Upload via   │     │  6. Load into    │
│                  │     │     browser/API  │     │     declaration  │
│                  │     │                  │     │  7. Track status │
│                  │     │                  │     │  8. Notify       │
│                  │     │                  │     │     result       │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## EDI Submission Steps (Detailed)

### Step 1: Generate XML
```typescript
function generateISDeclaration(input: ISDeclarationInput): string {
  // 1. Calculate IS using IS engine
  const calculation = calculateIS(input);

  // 2. Map to DGI state codes (codes état)
  const xmlData: EDIISDeclaration = {
    entete: createHeader(input),
    etat1101: buildBalanceSheet(input.balanceSheet),
    etat1102: buildBalanceSheetPassif(input.balanceSheet),
    etat1103: buildPnL(input.profitAndLoss),
    etat1104: buildTaxAdjustments(calculation.reintegrations, calculation.deductions),
    etat1105: buildFixedAssets(input.fixedAssets),
    etat1106: buildProvisions(input.provisions),
    etat1107: buildShareholders(input.shareholders),
    etat1108: buildMinimumContribution(calculation.minimumContribution),
    etat1109: buildQuarterlyInstallments(calculation.quarterlyInstallments),
  };

  // 3. Validate against XSD
  const xml = serializeToXML(xmlData);
  if (!validateXSD(xml, 'simpl-is-v1.7.xsd')) {
    throw new Error('EDI XML validation failed');
  }

  return xml;
}
```

### Step 2: Connect to DGI Portal
- Authenticate via the portal (credentials or certificate)
- Navigate to EDI section
- Upload XML file
- Submit for validation

### Step 3: Track Processing

| Status | Meaning | Next Action |
|--------|---------|-------------|
| En instance de traitement | File received, queued for processing | Wait |
| Accepté | File passed all checks | Proceed to finalize declaration |
| Rejeté | File failed format or business checks | Download error report, fix, resubmit |

### Step 4: Error Handling

Format errors (immediate rejection):
- Not a valid XML file
- IF does not match taxpayer
- XSD schema violation
- Required fields missing

Business errors (async rejection):
- Inconsistent data across forms
- Balance sheet doesn't balance
- Tax adjustments out of reasonable range
- MC calculation incorrect

## XML Generation Service Interface

```typescript
interface EDIGenerationService {
  generateISDeclaration(fiscalYear: number, clientId: string): Promise<XMLFile>;
  generateIRDeclaration(fiscalYear: number, clientId: string): Promise<XMLFile>;
  generateTVADeclaration(period: TVAPeriod, clientId: string): Promise<XMLFile>;

  validateXML(xml: string, schema: 'IS' | 'IR' | 'TVA'): ValidationResult;
  submitToDGI(xml: string, portal: 'SIMPL_IS' | 'SIMPL_IR' | 'SIMPL_TVA'): Promise<SubmissionResult>;
  trackSubmission(submissionId: string): Promise<SubmissionStatus>;
  downloadErrorReport(submissionId: string): Promise<ErrorReport>;
}
```

## DGI Integration Testing

Since the DGI portal is a production system:
- Use the DGI test environment if available
- Validate XSD schemas locally (ships with the project)
- Manual first submission per client before automating
- Maintain a sandbox with dummy data for integration testing
```
