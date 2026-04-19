#!/usr/bin/env python3
"""
Validierungsskript für den Juvantis Medical Knowledge Graph.
Prüft Datenintegrität, Duplikate, fehlende Felder, verwaiste Knoten.

Aufruf:
    python3 _config/validate_graph.py
    (aus dem knowledge-graph/ Verzeichnis)
"""

import json
import sys
from collections import Counter
from pathlib import Path

GRAPH_FILE = Path(__file__).parent.parent / "medical-knowledge-graph.json"

REQUIRED_ORGAN_FIELDS = {"id", "label", "system", "color", "description"}
REQUIRED_LAB_FIELDS = {"id", "label", "unit", "normalRange", "category", "significance"}
REQUIRED_DISEASE_FIELDS = {"id", "label", "severity", "icd10", "category"}
REQUIRED_EDGE_FIELDS = {"from", "to", "type", "detail"}
VALID_EDGE_TYPES = {"organ_produces_lab", "lab_indicates_disease", "disease_affects_organ"}
VALID_SEVERITIES = {
    "akut-lebensbedrohlich", "akut-schwer", "akut-mittel",
    "chronisch-schwer", "chronisch-progredient", "chronisch-mittel",
    "chronisch-leicht", "variabel"
}

def validate():
    errors = []
    warnings = []

    # Laden
    try:
        with open(GRAPH_FILE) as f:
            data = json.load(f)
    except Exception as e:
        print(f"FATAL: Kann {GRAPH_FILE} nicht laden: {e}")
        sys.exit(1)

    organs = data.get("organs", [])
    labs = data.get("labvalues", [])
    diseases = data.get("diseases", [])
    edges = data.get("edges", [])

    organ_ids = set()
    lab_ids = set()
    disease_ids = set()

    # ─── Organe prüfen ───────────────────────────────────────
    for i, o in enumerate(organs):
        missing = REQUIRED_ORGAN_FIELDS - set(o.keys())
        if missing:
            errors.append(f"Organ [{i}] ({o.get('id','?')}): Fehlende Felder: {missing}")
        oid = o.get("id")
        if oid in organ_ids:
            errors.append(f"Organ [{i}]: Duplikat-ID '{oid}'")
        organ_ids.add(oid)

    # ─── Laborwerte prüfen ───────────────────────────────────
    for i, l in enumerate(labs):
        missing = REQUIRED_LAB_FIELDS - set(l.keys())
        if missing:
            errors.append(f"Lab [{i}] ({l.get('id','?')}): Fehlende Felder: {missing}")
        lid = l.get("id")
        if lid in lab_ids:
            errors.append(f"Lab [{i}]: Duplikat-ID '{lid}'")
        lab_ids.add(lid)

    # ─── Erkrankungen prüfen ─────────────────────────────────
    for i, d in enumerate(diseases):
        missing = REQUIRED_DISEASE_FIELDS - set(d.keys())
        if missing:
            errors.append(f"Disease [{i}] ({d.get('id','?')}): Fehlende Felder: {missing}")
        did = d.get("id")
        if did in disease_ids:
            errors.append(f"Disease [{i}]: Duplikat-ID '{did}'")
        disease_ids.add(did)
        sev = d.get("severity", "")
        if sev and sev not in VALID_SEVERITIES:
            # Erlaubt zusammengesetzte wie "akut/chronisch-schwer"
            if not any(s in sev for s in VALID_SEVERITIES):
                warnings.append(f"Disease '{did}': Ungewöhnliche severity '{sev}'")

    all_ids = organ_ids | lab_ids | disease_ids

    # ─── Kanten prüfen ───────────────────────────────────────
    edge_dupes = Counter()
    for i, e in enumerate(edges):
        missing = REQUIRED_EDGE_FIELDS - set(e.keys())
        if missing:
            errors.append(f"Edge [{i}]: Fehlende Felder: {missing}")

        etype = e.get("type", "")
        if etype not in VALID_EDGE_TYPES:
            errors.append(f"Edge [{i}]: Ungültiger Typ '{etype}'")

        fr, to = e.get("from", ""), e.get("to", "")

        # Referenzintegrität
        if etype == "organ_produces_lab":
            if fr not in organ_ids:
                errors.append(f"Edge [{i}]: from '{fr}' nicht in organs")
            if to not in lab_ids:
                errors.append(f"Edge [{i}]: to '{to}' nicht in labvalues")
        elif etype == "lab_indicates_disease":
            if fr not in lab_ids:
                errors.append(f"Edge [{i}]: from '{fr}' nicht in labvalues")
            if to not in disease_ids:
                errors.append(f"Edge [{i}]: to '{to}' nicht in diseases")
            if "direction" not in e:
                warnings.append(f"Edge [{i}] ({fr}→{to}): Fehlendes 'direction'-Feld (R-KG-005)")
        elif etype == "disease_affects_organ":
            if fr not in disease_ids:
                errors.append(f"Edge [{i}]: from '{fr}' nicht in diseases")
            if to not in organ_ids:
                errors.append(f"Edge [{i}]: to '{to}' nicht in organs")

        # Duplikat-Prüfung
        edge_key = (fr, to, etype)
        edge_dupes[edge_key] += 1
        if edge_dupes[edge_key] > 1:
            errors.append(f"Edge [{i}]: Duplikat ({fr} → {to}, {etype})")

    # ─── Verwaiste Knoten ────────────────────────────────────
    referenced = set()
    for e in edges:
        referenced.add(e.get("from", ""))
        referenced.add(e.get("to", ""))

    orphan_organs = organ_ids - referenced
    orphan_labs = lab_ids - referenced
    orphan_diseases = disease_ids - referenced

    if orphan_organs:
        warnings.append(f"Verwaiste Organe (keine Kanten): {orphan_organs}")
    if orphan_labs:
        warnings.append(f"Verwaiste Laborwerte (keine Kanten): {orphan_labs}")
    if orphan_diseases:
        warnings.append(f"Verwaiste Erkrankungen (keine Kanten): {orphan_diseases}")

    # ─── Ergebnis ────────────────────────────────────────────
    type_counts = Counter(e["type"] for e in edges)

    print("=" * 60)
    print("JUVANTIS KNOWLEDGE GRAPH — VALIDIERUNG")
    print("=" * 60)
    print(f"Organe:       {len(organs)}")
    print(f"Laborwerte:   {len(labs)}")
    print(f"Erkrankungen: {len(diseases)}")
    print(f"Kanten:       {len(edges)}")
    for t, c in sorted(type_counts.items()):
        print(f"  {t}: {c}")
    print()

    if errors:
        print(f"❌ FEHLER ({len(errors)}):")
        for e in errors:
            print(f"  - {e}")
    else:
        print("✅ Keine Fehler")

    if warnings:
        print(f"\n⚠️  WARNUNGEN ({len(warnings)}):")
        for w in warnings:
            print(f"  - {w}")
    else:
        print("✅ Keine Warnungen")

    print()
    if errors:
        print("ERGEBNIS: ❌ FEHLGESCHLAGEN")
        sys.exit(1)
    else:
        print("ERGEBNIS: ✅ BESTANDEN")
        sys.exit(0)

if __name__ == "__main__":
    validate()
