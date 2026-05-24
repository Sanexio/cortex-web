# Cortex-Web — Tool-Helper

Wiederverwendbare Bash-Module für die `tools/*.sh`-Skripte.

## `tenant-path.sh`

Zentraler Resolver für den aktiven Tenant-Daten-Pfad. **Pflicht-Verwendung
in allen Adapter-/Sync-Skripten ab Welle 1.1** (siehe
`Nexus/specs/cortex-platform/01_CORTEX_WEB_SPLIT.md`).

### Hintergrund

Cortex-Web wird in Framework + Tenant-Daten aufgespalten. Damit Adapter
auf einem beliebigen Mac sowohl mit einem realen Tenant-Repo als auch mit
dem Demo-Tenant (`trunk/_examples/`) laufen, müssen sie den Pfad **zur
Laufzeit** auflösen — nicht hartkodieren.

### Auflösungs-Reihenfolge

1. ENV-Variable `CORTEX_TENANT_DIR` (höchste Priorität)
2. Default-File `~/.cortex/tenant-path` (eine Zeile mit dem Pfad)
3. Fallback: `<repo>/trunk/_examples` (Demo-Modus)

### Verwendung

```bash
#!/usr/bin/env bash
source "$(dirname "$0")/lib/tenant-path.sh"

# Tenant-Root holen
TENANT=$(tenant_path)
echo "Lese Tenant aus: $TENANT"

# Sub-Pfad holen
TEAM_DIR=$(tenant_path trunk/content/team)
for f in "$TEAM_DIR"/*.yaml; do
    echo "Team-Member: $f"
done

# Diagnose (für Adapter-Logs)
tenant_describe
# Beispiel-Output: "Tenant: /Users/ssmd/Cortex/projects/Sanexio-Tenant (via CORTEX_TENANT_DIR)"

# Demo-Check
if tenant_is_examples; then
    echo "WARN: Demo-Modus — Output ist nur zur Veranschaulichung."
fi
```

### Konvention für CORTEX_TENANT_DIR

Pfad **zum Tenant-Repo-Root**, nicht zum `trunk/`-Unterordner:

```bash
# Richtig:
export CORTEX_TENANT_DIR=/Users/ssmd/Cortex/projects/Sanexio-Tenant

# Falsch:
export CORTEX_TENANT_DIR=/Users/ssmd/Cortex/projects/Sanexio-Tenant/trunk
```

Der Helper hängt `trunk/...`-Sub-Pfade selbst an.

### Migrations-Plan

- **Welle 1.1 (heute)**: Helper angelegt, `_examples/`-Demo-Inhalt steht,
  1 Pilot-Adapter migriert.
- **Welle 1.2–1.4**: alle bestehenden Adapter Schritt für Schritt
  umstellen. Vor jedem Migrations-Commit prüfen: kein hartcodierter
  Pfad zu `trunk/content/` mehr.
- **Welle 1.5**: Pre-Commit-Linter prüft, dass kein neues Skript wieder
  hardcodiert.
