# Knowledge Graph — Status & Fortschritt

> **Letzte Aktualisierung:** 2026-04-06, Batch 26 + Cross-Links + Visualisierung v2.0
> **Validierung:** ✅ Bestanden (0 Fehler, 0 Warnungen)
> **Live auf Website:** ⏳ Deployment läuft

## Aktuelle Zählung

| Typ | Anzahl | Ziel (Batch 0–25) | Abdeckung |
|-----|--------|-------------------|-----------|
| Organe | 29 | ~30+ | 97% |
| Laborwerte | 351 | ~350+ | **100%** |
| Erkrankungen | 193 | ~170+ | **114%** |
| Kanten | 1574 | ~1200+ | **131%** |

## Abgeschlossene Batches

### Batch 0 — Initialer Graph (2026-04-05)
- **Scope:** Kernsortiment der häufigsten Organroutine-Parameter
- **Hinzugefügt:** 15 Organe, 51 Laborwerte, 40 Erkrankungen, 240 Kanten
- **Kategorien:** Herzmarker, Leberenzyme, Nierenfunktion, Elektrolyte (K, Na, Ca, PO4),
  Schilddrüse, Glukosestoffwechsel, Pankreas, Blutbild (Basis), Entzündung (CRP),
  Eisenstoffwechsel, Vitamine (D, B12, Folsäure), Lipide, Gerinnung (INR, D-Dimer),
  PSA, Nebennierenhormone, BGA (pO2, pCO2), Muskelmarker
- **Datenquelle:** Claude medizinisches Fachwissen (Herold, Harrison's, Thomas Laborlexikon)
- **Status:** ✅ Implementiert + in index.html visualisiert

## Ausstehende Batches

### Batch 1 — Differentialblutbild & Erythrozytenindizes ✅ (2026-04-05)
**Neue Laborwerte (~12):**
- Neutrophile (abs. + %), Lymphozyten, Monozyten, Eosinophile, Basophile
- MCV, MCH, MCHC, RDW
- Retikulozyten
- BSG (Blutsenkung)

**Neue Erkrankungen (~8):**
- Neutropenie, Lymphom, Eosinophilie/Allergische Erkr., Basophilie,
  Polycythaemia vera, Myelodysplastisches Syndrom, Megaloblastäre Anämie,
  Thalassämie

**Geschätzte Kanten:** ~40

### Batch 2 — Entzündung & Infektiologie ✅ (2026-04-06)
**Neue Laborwerte (9):**
- Procalcitonin (PCT), IL-6, Presepsin
- Blutkulturen (qualitativ), Laktat
- Antistreptolysin-O (ASL), Anti-DNase B
- IL-10, TNF-α (aus Lückenanalyse ergänzt)
- BSG war bereits in Batch 1

**Neue Erkrankungen (6):**
- Bakterielle Meningitis, Endokarditis, Osteomyelitis,
  Rheumatisches Fieber, SIRS, Peritonitis

**Neue Kanten (64):** inkl. Verlinkung bestehender Werte (CRP, BSG, Leukozyten, Ferritin) mit neuen Erkrankungen

**Lückenanalyse-Ergänzungen umgesetzt:**
- IL-10 (anti-inflammatorisch) ✅
- TNF-α (pro-inflammatorisch, Biologika-Monitoring) ✅
- Ferritin als Akute-Phase-Protein verlinkt ✅

### Batch 3 — Gerinnung erweitert ✅ (2026-04-06)
**Neue Laborwerte (10):**
- aPTT, Fibrinogen, Antithrombin III, Protein C, Protein S
- Faktor V Leiden (APC-Resistenz), Lupus-Antikoagulans
- Anti-Xa, Thrombinzeit (TZ), Von-Willebrand-Faktor

**Neue Erkrankungen (5):**
- Hämophilie A, Hämophilie B, Von-Willebrand-Syndrom,
  Antiphospholipid-Syndrom (APS), HIT

**Neue Kanten (51):** inkl. Verlinkung bestehender Werte (INR, D-Dimer, Thrombozyten) mit neuen Erkrankungen

### Batch 4 — Autoimmundiagnostik ✅ (2026-04-06)
**Neue Organe (2):** Gelenke/Synovia, Haut

**Neue Laborwerte (23, inkl. 6 Lückenanalyse):**
- ANA, Anti-dsDNA, ENA-Screen, Anti-Smith, Anti-SSA/Ro, Anti-SSB/La
- c-ANCA, p-ANCA, Anti-MPO, Anti-PR3
- Rheumafaktor (RF), Anti-CCP
- Komplement C3, C4, CH50
- Anti-Cardiolipin, Anti-Beta2-GP1
- Anti-Jo-1, Anti-Scl-70, Anti-Centromer, Anti-SMA, Anti-LKM1, AMA (Lückenanalyse)

**Neue Erkrankungen (11, inkl. 2 vorgezogen aus Batch 7):**
- SLE, Rheumatoide Arthritis, Sjögren, Sklerodermie, Polymyositis/Dermatomyositis
- GPA (Wegener), MPA, Vaskulitis, MCTD
- Autoimmunhepatitis, PBC (vorgezogen — Lückenanalyse-Labs benötigen Zielerkrankungen)
- APS war bereits in Batch 3

**Neue Kanten (107):** inkl. bestehende Werte (CRP, BSG, CK, LDH, Kreatinin, GOT, GPT, GGT, AP, Bilirubin, Albumin)

**Lückenanalyse-Ergänzungen umgesetzt:**
- Anti-Jo-1, Anti-Scl-70, Anti-Centromer ✅
- Anti-SMA, Anti-LKM1, AMA ✅
- Autoimmunhepatitis + PBC als Zielerkrankungen vorgezogen ✅

### Batch 5 — Hormone & Endokrinologie erweitert ✅ (2026-04-06)
**Neue Organe (3):** Hypophyse, Gonaden (Ovarien/Hoden), Uterus

**Neue Laborwerte (20, inkl. 6 Lückenanalyse):**
- Testosteron, Östradiol, Progesteron, LH, FSH, Prolaktin, DHEA-S, SHBG
- GH, IGF-1, ADH, Renin, Aldosteron-Renin-Quotient, Metanephrine
- Serotonin, 5-HIAA, Katecholamine 24h-Urin, VIP, Glukagon, 17-OH-Progesteron (Lückenanalyse)

**Neue Erkrankungen (11):**
- PCOS, Hypogonadismus, Hyperprolaktinämie, Akromegalie, Phäochromozytom
- Diabetes insipidus, SIADH, Amenorrhoe, Wachstumshormonmangel
- AGS, Karzinoidsyndrom (für Lückenanalyse-Labs)

**Neue Kanten (91):** inkl. bestehende Werte (Natrium, Glukose, Kalium, Insulin, Cortisol, TSH)

**Lückenanalyse-Ergänzungen umgesetzt:**
- Serotonin, 5-HIAA, Katecholamine 24h-Urin, VIP, Glukagon, 17-OH-Progesteron ✅
- AGS + Karzinoidsyndrom als Zielerkrankungen ergänzt ✅

### Batch 6 — Tumormarker komplett ✅ (2026-04-06)
**Neue Organe (3):** Mamma, Ovar, Kolon/Rektum

**Neue Laborwerte (15):**
- CEA, CA 19-9, CA 125, CA 15-3, AFP, Beta-HCG
- NSE, CYFRA 21-1, SCC, Chromogranin A, S100
- Thyreoglobulin, Calcitonin
- Protein-Elektrophorese, Bence-Jones-Protein
- LDH war bereits vorhanden (neue Kanten zu Melanom, Lymphom, Keimzelltumor, Myelom)

**Neue Erkrankungen (12):**
- Kolorektales Karzinom, Mammakarzinom, Ovarialkarzinom, Pankreaskarzinom
- HCC, Bronchialkarzinom, Schilddrüsenkarzinom, Keimzelltumor
- NET, Multiples Myelom, Malignes Melanom, Zervixkarzinom

**Neue Kanten (85):** inkl. Cross-Links bestehender Werte (LDH, Hämoglobin, Calcium, Kreatinin, Albumin, BSG, GOT, GGT, Bilirubin, TSH)

### Batch 7 — Leber & Hepatologie erweitert ✅ (2026-04-06)
**Neue Laborwerte (9):**
- CHE, GLDH, Ammoniak, Coeruloplasmin, Kupfer (Serum)
- Alpha-1-Antitrypsin, Bilirubin direkt/indirekt, Haptoglobin

**Neue Erkrankungen (4):**
- Morbus Wilson, Alpha-1-Antitrypsin-Mangel, Hämochromatose, PSC
- Autoimmunhepatitis + PBC waren bereits in Batch 4

**Neue Kanten (50):** inkl. bestehende Werte (Eisen, Ferritin, Transferrin, GOT, GPT, GGT, AP, Albumin, INR, p-ANCA)

### Batch 8 — Niere & Urologie erweitert ✅ (2026-04-06)
**Neue Organe (2):** Harnblase, Harnleiter (Ureter)

**Neue Laborwerte (8):**
- Cystatin C, UACR, Urin-Sediment, Urin-Stix
- Beta-2-Mikroglobulin, Osmolalität, Kreatinin-Clearance, Urin-Natrium

**Neue Erkrankungen (6):**
- Glomerulonephritis, IgA-Nephropathie, Diabetische Nephropathie
- Interstitielle Nephritis, HWI, Nephrolithiasis

**Neue Kanten (50):** inkl. bestehende Werte (Kreatinin, GFR, HbA1c, C3, Leukozyten, PCT, Calcium, Harnsäure, Eosinophile)

### Batch 9 — Vitamine, Spurenelemente & Mangelzustände ✅ (2026-04-06)
**Neue Laborwerte (15, inkl. 4 Lückenanalyse):**
- Vitamin A, E, K, B1, B6, Zink, Selen, Mangan, Magnesium, Chlorid, Bicarbonat
- Vitamin C, B3, Coenzym Q10, Omega-3-Index (Lückenanalyse)
- Kupfer war bereits in Batch 7

**Neue Erkrankungen (6):**
- Skorbut, Beriberi, Pellagra, Rachitis/Osteomalazie, Zinkmangel, Selenmangel

**Neue Kanten (51):** inkl. Cross-Links (Vitamin D, Calcium, Phosphat, AP, Hb, LDH, BNP, TSH, Omega-3→Atherosklerose/MI)

**Lückenanalyse-Ergänzungen umgesetzt:**
- Vitamin C, B3/Niacin, Coenzym Q10, Omega-3-Index ✅

### Batch 10 — BGA & Säure-Base-Haushalt erweitert ✅ (2026-04-06)
**Neue Laborwerte (6, inkl. 2 Lückenanalyse):**
- pH (arteriell), Base Excess, SaO₂, Anionenlücke
- Methämoglobin, Carboxyhämoglobin (Lückenanalyse)
- Bicarbonat war bereits in Batch 9, Laktat in Batch 2

**Neue Erkrankungen (6):**
- Metabolische Azidose/Alkalose, Respiratorische Azidose/Alkalose
- Laktatazidose, Diabetische Ketoazidose (DKA)

**Neue Kanten (53):** inkl. bestehende Werte (pCO₂, Bicarbonat, Laktat, Glukose, Kalium, Natrium, Chlorid, Kreatinin)

**Lückenanalyse-Ergänzungen umgesetzt:**
- Methämoglobin (Met-Hb) ✅
- Carboxyhämoglobin (CO-Hb) ✅

### Batch 11 — Allergie & Immunologie ✅ (2026-04-06)
**Neue Laborwerte (7):**
- Gesamt-IgE, spezifisches IgE (RAST), IgG, IgA, IgM, Tryptase, ECP
- CH50 war bereits in Batch 4

**Neue Erkrankungen (6):**
- Anaphylaxie, Allergische Rhinitis, Asthma bronchiale
- Mastozytose, IgA-Mangel, CVID

**Neue Kanten (43):** inkl. Cross-Links (Eosinophile, Leukozyten, CRP, CH50)

### Batch 12 — Infektiologie Serologie ✅ (2026-04-06)
**Neue Laborwerte (19, inkl. 7 Lückenanalyse):**
- HBsAg, Anti-HBs, Anti-HBc, Anti-HCV, HCV-RNA, HIV-Combo
- Lues-Screening, Borrelien-AK, FSME-AK, EBV-Panel, CMV-AK, Quantiferon/IGRA
- SARS-CoV-2, Influenza A/B, RSV, HPV-Typisierung, Toxoplasmose-AK, VZV-AK, Masern/Röteln-AK (Lückenanalyse)

**Neue Erkrankungen (8):**
- Hepatitis B, Hepatitis C, HIV, Syphilis, Borreliose
- Infektiöse Mononukleose (EBV), CMV-Infektion, Tuberkulose

**Neue Kanten (60):** inkl. Cross-Links (GOT, GPT, Lymphozyten, LDH, CRP, BSG)

**Lückenanalyse-Ergänzungen umgesetzt:**
- SARS-CoV-2, Influenza, RSV, HPV, Toxoplasmose, VZV-AK, Masern/Röteln-AK ✅

**Meilenstein:** 🎯 **1000 Kanten erreicht!**

### Batch 13 — Schilddrüse & Nebenschilddrüse erweitert ✅ (2026-04-06)
**Neues Organ (1):** Nebenschilddrüse (Parathyroid)

**Neue Laborwerte (5, inkl. 1 Lückenanalyse):**
- TPO-AK, TRAK, Calcium ionisiert, Calcitriol, TG-AK (Lückenanalyse)
- Thyreoglobulin + Calcitonin waren bereits in Batch 6

**Neue Erkrankungen (4):**
- Morbus Basedow, Schilddrüsenadenom, Hypoparathyreoidismus, MEN-Syndrome

**Neue Kanten (42):** inkl. Cross-Links (TSH, fT3, fT4, PTH, Calcium, Phosphat, Chromogranin A, bestehende Thyreoglobulin/Calcitonin)

**Lückenanalyse-Ergänzung:** TG-Antikörper ✅

### Batch 14 — Kardiovaskuläre Risikofaktoren erweitert ✅ (2026-04-06)
**Neue Laborwerte (9):**
- Lp(a), ApoB, ApoA1, Homocystein, hs-CRP
- NT-proBNP, Galectin-3, sST2, Lp-PLA2

**Neue Erkrankungen (4):**
- Familiäre Hypercholesterinämie, pAVK, Aortenaneurysma, Karotisstenose

**Neue Kanten (42):** inkl. Cross-Links (LDL, Cholesterin, BNP → neue Marker-Erkrankungen)

### Batch 15 — Gastrointestinal erweitert ✅ (2026-04-06)
**Neue Organe (2):** Ösophagus, Gallenblase

**Neue Laborwerte (6):**
- Pankreas-Elastase, Calprotectin, Gastrin, H. pylori, Anti-tTG, Anti-Endomysium
- IgA + LDH waren bereits vorhanden

**Neue Erkrankungen (8):**
- Morbus Crohn, Colitis ulcerosa, Zöliakie, H. pylori-Gastritis
- Magenulkus, Cholelithiasis, Exokrine Pankreasinsuffizienz, Reizdarmsyndrom

**Neue Kanten (45):** inkl. Cross-Links (CRP, BSG, Albumin, Hb, Eisen, Lipase, GGT, Bilirubin, AP, p-ANCA, IgA)

### Batch 16 — Genetik & Spezialdiagnostik ✅ (2026-04-06)
**Neue Laborwerte (12, inkl. 6 Lückenanalyse):**
- Prothrombin-Mutation, HLA-B27, HFE-Gen, BRCA1/2, Karyotyp, Pharmakogenetik
- BCR-ABL, JAK2-V617F, EGFR-Mutation, BRAF-V600E, MSI, PD-L1 (Lückenanalyse)
- Faktor V Leiden war bereits in Batch 3

**Neue Erkrankungen (3):**
- Morbus Bechterew, Thrombophilie (hereditär), Lynch-Syndrom
- Hämochromatose war bereits in Batch 7

**Neue Kanten (35):** inkl. Cross-Links (FVL→Thrombophilie, BSG/CRP→Bechterew, Tumormarker→molekulare Targets)

**Lückenanalyse-Ergänzungen umgesetzt:**
- BCR-ABL, JAK2-V617F, EGFR, BRAF-V600E, MSI, PD-L1 ✅

### Batch 17 — Knochenmarker & Osteologie ✅ (2026-04-06)
**Neue Laborwerte (6):**
- Osteocalcin, CTX (Beta-CrossLaps), P1NP, DPD (Urin), TRAP5b, Knochen-AP
  
**Neue Erkrankungen (3):**
- Morbus Paget, Renale Osteodystrophie, Knochenmetastasen
- Osteomalazie war bereits als Rachitis in Batch 9

**Neue Kanten (32):** inkl. Cross-Links (AP, Calcium, PTH, Calcitriol, Phosphat, LDH)

🎯 **Kanten-Ziel erreicht: 1196/1200+ (100%)**

### Batch 18 — Liquor & Neurologie ✅ (2026-04-06)
**Neue Laborwerte (7):**
- Liquor-Zellzahl, -Eiweiß, -Glukose, -Laktat, OKB, Tau-Protein, Beta-Amyloid
- NSE/S100 waren bereits vorhanden (neue Kanten zu Neuro-Erkrankungen)

**Neue Erkrankungen (5):**
- Multiple Sklerose, Alzheimer, GBS, Enzephalitis, SAB
- Bakterielle Meningitis war bereits in Batch 2

**Neue Kanten (34):** inkl. Cross-Links (NSE, S100, CRP, Leukozyten)

### Batch 19 — Therapeutic Drug Monitoring (TDM) ✅ (2026-04-06)
**Neue Laborwerte (12):**
- Digoxin, Lithium, Valproat, Carbamazepin, Phenytoin
- Ciclosporin, Tacrolimus, Methotrexat
- Vancomycin, Gentamicin, Theophyllin, Amiodaron

**Neue Erkrankungen (4):**
- Medikamenten-Intoxikation, Transplantatabstoßung, Lithium-Nephropathie, Amiodaron-Thyreotoxikose

**Neue Kanten (43):** inkl. Cross-Links (Kreatinin, TSH, fT4, GPT → neue Erkrankungen)

### Batch 20 — Toxikologie & Drogenscreening ✅ (2026-04-06)
**Neue Laborwerte (7):**
- Ethanol, Paracetamol-Spiegel, Salicylat-Spiegel, Drogenscreening Urin
- Blei (Pb), Quecksilber (Hg), Cholinesterase Erythrozyten
- CO-Hb, Met-Hb waren bereits in Batch 10, CHE in Batch 7

**Neue Erkrankungen (5):**
- Paracetamol-Intoxikation, CO-Vergiftung, Methämoglobinämie, Bleivergiftung, Organophosphat-Vergiftung

**Neue Kanten (35):** inkl. Cross-Links (GPT, INR, Hb, Retikulozyten, Laktat, SaO₂, CHE)

### Batch 21 — Transfusionsmedizin ✅ (2026-04-06)
**Neue Laborwerte (6):** Blutgruppe, AKS, DAT, IAT, Kreuzprobe, Kälteagglutinine
**Neue Erkrankungen (3):** Transfusionsreaktion, Kälteagglutinin-Krankheit, MHN
**Neue Kanten (26)**

### Batch 22 — Schwangerschaft & Pränataldiagnostik ✅ (2026-04-06)
**Neues Organ (1):** Plazenta
**Neue Laborwerte (6):** PAPP-A, freies Beta-HCG, oGTT, Anti-D-Titer, sFlt-1/PlGF, fetales Fibronectin
**Neue Erkrankungen (5):** GDM, Präeklampsie, HELLP, EUG, MH fetalis
**Neue Kanten (29)**

### Batch 23 — Stuhldiagnostik erweitert ✅ (2026-04-06)
**Neue Laborwerte (4):** iFOBT, C.-diff-Toxin, Parasiten/Stuhl, Zonulin
**Neue Erkrankungen (3):** Pseudomembranöse Kolitis, Kolorektales Adenom, Intestinale Parasitosen
**Neue Kanten (15)**

### Batch 24 — Diabetes Spezialdiagnostik ✅ (2026-04-06)
**Neue Laborwerte (7):** C-Peptid, GAD-AK, IA-2-AK, ICA, ZnT8-AK, Fructosamin, HOMA-IR
**Neue Erkrankungen (3):** LADA, Insulinom, Prä-Diabetes
**Neue Kanten (26)**

**Neue Erkrankungen (~3):**
- LADA (Late Autoimmune Diabetes in Adults),
  Insulinom, Prä-Diabetes (gestörte Glukosetoleranz)

**Geschätzte Kanten:** ~22

### Batch 25 — Hämatologie Spezialdiagnostik ✅ (2026-04-06)
**Neue Laborwerte (6):** EPO, Hb-Elektrophorese, G6PD, PFA-100, Ery-Morphologie, Ret-Hb (CHr)
**Neue Erkrankungen (4):** Sichelzellanämie, G6PD-Mangel, TTP, HUS (Thalassämie existierte bereits)
**Neue Kanten (32)**

---
## 🎯 PROJEKT ABGESCHLOSSEN — Alle 26 Batches (0–25) implementiert!

## Ergänzungen zu bestehenden Batches (aus Lückenanalyse)

Folgende Werte wurden bei der Lückenanalyse identifiziert und MÜSSEN
in die jeweiligen Batches aufgenommen werden:

| Batch | Ergänzungen |
|-------|------------|
| 4 (Autoimmun) | +Anti-Jo-1, Anti-Scl-70, Anti-Centromer, Anti-SMA, Anti-LKM1, AMA |
| 5 (Hormone) | +Serotonin, 5-HIAA, Katecholamine 24h-Urin, VIP, Glukagon, 17-OH-Progesteron |
| 9 (Vitamine) | +Vitamin C, B3/Niacin, Coenzym Q10, Omega-3-Index |
| 12 (Serologie) | +SARS-CoV-2, Influenza, RSV, HPV, Toxoplasmose, VZV-AK, Masern/Röteln-AK |
| 13 (Schilddrüse) | +TG-Antikörper |
| 16 (Genetik) | +BCR-ABL, JAK2-V617F, EGFR-Mutation, BRAF-V600E, MSI, PD-L1 |

Siehe `LUECKENANALYSE.md` für vollständige Details.

## Fehlende Organe (kumuliert über alle Batches)

| Organ | Geplant in Batch |
|-------|-----------------|
| Hypophyse | 5 |
| Ovarien/Hoden | 5 |
| Uterus | 5 |
| Haut | 4 |
| Gelenke/Synovia | 4 |
| Mamma | 6 |
| Ovar | 6 |
| Kolon/Rektum | 6 |
| Harnblase | 8 |
| Harnleiter | 8 |
| Ösophagus | 15 |
| Gallenblase | 15 |
| Plazenta | 22 |
| Nebenschilddrüse (eigener Knoten) | 13 |
| Lymphknoten | 6 |
| Thymus | 11 |

## Zusammenfassung Expansion (KORRIGIERT)

| Batch | Kategorie | Neue Labs | Neue Erkr. | Neue Organe |
|-------|-----------|-----------|------------|-------------|
| 0 ✅ | Basis-Sortiment | 51 | 40 | 15 |
| 1 ✅ | Diff-BB & Ery-Indizes | 11 | 8 | 0 |
| 2 ✅ | Entzündung & Infektio | 9 | 6 | 0 |
| 3 ✅ | Gerinnung erweitert | 10 | 5 | 0 |
| 4 ✅ | Autoimmun (+6 Ergänzungen) | 23 | 11 | 2 |
| 5 ✅ | Hormone (+6 Ergänzungen) | 20 | 11 | 3 |
| 6 ✅ | Tumormarker komplett | 15 | 12 | 3 |
| 7 ✅ | Leber erweitert | 9 | 4 | 0 |
| 8 ✅ | Niere erweitert | 8 | 6 | 2 |
| 9 ✅ | Vitamine (+4 Ergänzungen) | 15 | 6 | 0 |
| 10 ✅ | BGA & Säure-Base | 6 | 6 | 0 |
| 11 ✅ | Allergie & Immuno | 7 | 6 | 0 |
| 12 ✅ | Infektio-Serologie (+7 Erg.) | 19 | 8 | 0 |
| 13 ✅ | SD & NSD (+1 Ergänzung) | 5 | 4 | 1 |
| 14 ✅ | Kardiovaskulär erw. | 9 | 4 | 0 |
| 15 ✅ | GI erweitert | 6 | 8 | 2 |
| 16 ✅ | Genetik (+6 Ergänzungen) | 12 | 3 | 0 |
| 17 ✅ | Knochenmarker | 6 | 3 | 0 |
| 18 ✅ | Liquor & Neuro | 7 | 5 | 0 |
| 19 ✅ | TDM (NEU) | 12 | 4 | 0 |
| 20 ✅ | Toxikologie (NEU) | 7 | 5 | 0 |
| 21 ✅ | Transfusionsmedizin (NEU) | 6 | 3 | 0 |
| 22 ✅ | Schwangerschaft (NEU) | 6 | 5 | 1 |
| 23 ✅ | Stuhldiagnostik (NEU) | 4 | 3 | 0 |
| 24 ✅ | Diabetes Spezial (NEU) | 7 | 3 | 0 |
| 25 ✅ | Hämatologie Spezial (NEU) | 6 | 4 | 0 |
| **GESAMT** | | **~350+** | **~170+** | **~30+** |
