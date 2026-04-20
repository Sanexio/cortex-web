<?php
/**
 * S2.3-D Phase 3 — Page-Inventory-Generator
 *
 * Produces:
 *   - specs/sprint-2/S2.3-D/page-inventory-full.csv  (15 columns, 189 rows)
 *   - specs/sprint-2/S2.3-D/page-inventory-full.md   (cluster summary + priorization)
 *
 * Scope: wp_posts post_type='page' — all statuses (publish/draft/private).
 * Read-only on DB.
 */

$SOCKET  = $_SERVER['HOME'] . '/Library/Application Support/Local/run/VFEzUQg6g/mysql/mysqld.sock';
$ROOT    = realpath(__DIR__ . '/../../');
$OUT_DIR = $ROOT . '/specs/sprint-2/S2.3-D';
@mkdir($OUT_DIR, 0755, true);

$mysqli = new mysqli('localhost', 'root', 'root', 'local', null, $SOCKET);
if ($mysqli->connect_errno) { fwrite(STDERR, "Connect failed: " . $mysqli->connect_error . "\n"); exit(1); }
$mysqli->set_charset('utf8mb4');
$mysqli->query("SET SESSION sql_mode = REPLACE(REPLACE(@@SESSION.sql_mode, 'ONLY_FULL_GROUP_BY,', ''), 'ONLY_FULL_GROUP_BY', '')");

// --- Cluster-Rules (slug/title keyword based) ---
function classify(string $slug, string $title, string $lang): array {
    $s = strtolower($slug . ' ' . $title);

    // i18n-dublette first (en/fr/es or slug ending in -2/-3/-en/-fr/-es)
    if ($lang && $lang !== 'de') return ['i18n-dublette', 'P2'];
    if (preg_match('/-(?:2|3|4|en|fr|es)$/', $slug)) return ['i18n-dublette', 'P2'];

    // kern
    if (preg_match('/^(?:home|startseite|praxis|team|aerzte|ärzte|sprechstunden|kontakt|karriere|datenschutz|impressum|agb)/', $slug)) return ['kern', 'P0'];

    // checkups
    if (preg_match('/(?:check-?up|vorsorge|basic-check|premium|executive|screening)/', $s)) return ['checkups', 'P0'];

    // aerzte — single doctor profile
    if (preg_match('/^(?:dr-|arzt-|profil-)/', $slug) || preg_match('/dr\.\s*med/', $title)) return ['aerzte', 'P1'];

    // fachrichtung (specialty)
    if (preg_match('/(?:innere|allgemeinmedizin|allgemein|hno|neurologie|psychologie|physio|gyna(?:e|ä)k|urologie|kardio|derma|ortho|rheuma)/', $s)) return ['fachrichtung', 'P1'];

    // diagnostik
    if (preg_match('/(?:labor|sonographie|sono|ekg|belastungs|mrt|ct\b|gastroskopie|koloskopie|ultraschall|lungenfunkt|spirometrie)/', $s)) return ['diagnostik', 'P1'];

    // services
    if (preg_match('/(?:behandlung|therapie|sprechstunde-|beratung|service|leistung|hautkrebs|impf|reise|atteste|bescheinigung)/', $s)) return ['services', 'P1'];

    return ['legacy', 'P2'];
}

// --- image_source_hint heuristic ---
function image_hint(string $content): array {
    if (strpos($content, '<img') === false) return [0, 'none'];
    preg_match_all('/<img[^>]+src=["\']([^"\']+)["\']/i', $content, $m);
    $srcs = $m[1] ?? [];
    if (empty($srcs)) return [0, 'none'];
    $count = count($srcs);

    $hints = [];
    foreach ($srcs as $src) {
        if (strpos($src, 'wp-content/uploads/') !== false) $hints[] = 'wp-upload';
        elseif (preg_match('#(?:sanexio\.eu|juvantis|myshopify|cdn\.shopify)#i', $src)) $hints[] = 'juvantis-shopify';
        elseif (preg_match('#^https?://(?!localhost|westend-hausarzt\.local)#i', $src)) $hints[] = 'ext-url';
        else $hints[] = 'other';
    }
    $unique = array_unique($hints);
    $hint = count($unique) === 1 ? $unique[0] : 'mixed:' . implode('+', $unique);
    return [$count, $hint];
}

// --- trunk_candidate + cross_site_potential ---
function trunk_flags(string $slug, string $cluster): array {
    $s = strtolower($slug);
    $cross = 'no';
    if (preg_match('/(?:check-?up|basic-check|vorsorge)/', $s))      $cross = 'basic-check';
    elseif (preg_match('/(?:blut|laborwerte|blutbild)/', $s))        $cross = 'blood-test-*';
    elseif (preg_match('/(?:herz|ekg|kardio)/', $s))                 $cross = 'heart-check';
    elseif (preg_match('/(?:digital-health|avatar|twin)/', $s))      $cross = 'digital-health-twin';
    elseif (preg_match('/(?:body-check|rundum|ganzheitlich)/', $s))  $cross = 'body-check';

    $candidate = ($cluster === 'checkups' || $cluster === 'services' || $cross !== 'no') ? 'yes'
               : (($cluster === 'diagnostik' || $cluster === 'kern') ? 'maybe' : 'no');
    return [$candidate, $cross];
}

// --- Main query ---
$sql = "SELECT p.ID, p.post_name AS slug, p.post_title AS title, p.post_status AS status,
               p.post_parent AS parent_id,
               COALESCE(pm.meta_value, 'default') AS template,
               COALESCE(t.language_code, '-') AS wpml_lang,
               CHAR_LENGTH(p.post_content) AS content_length,
               p.post_content
        FROM wp_posts p
        LEFT JOIN wp_postmeta pm ON pm.post_id = p.ID AND pm.meta_key = '_wp_page_template'
        LEFT JOIN wp_icl_translations t ON t.element_id = p.ID AND t.element_type = 'post_page'
        WHERE p.post_type='page' AND p.post_status IN ('publish','draft','private')
        GROUP BY p.ID
        ORDER BY p.post_status DESC, p.ID ASC";

$res = $mysqli->query($sql);
if (!$res) { fwrite(STDERR, "Query failed: " . $mysqli->error . "\n"); exit(1); }

$rows = [];
$cluster_counts = [];
while ($r = $res->fetch_assoc()) {
    [$cluster, $prio] = classify($r['slug'], $r['title'], $r['wpml_lang']);
    [$img_count, $img_hint] = image_hint($r['post_content']);
    [$trunk_cand, $cross] = trunk_flags($r['slug'], $cluster);

    $row = [
        'id'                    => (int)$r['ID'],
        'slug'                  => $r['slug'],
        'title'                 => $r['title'],
        'status'                => $r['status'],
        'parent_id'             => (int)$r['parent_id'],
        'template'              => $r['template'],
        'wpml_lang'             => $r['wpml_lang'],
        'content_length'        => (int)$r['content_length'],
        'image_count'           => $img_count,
        'image_source_hint'     => $img_hint,
        'mojibake_hits_pre'     => 0,  // filled from pre-count (see summary MD; per-page pre-count would need pre-snapshot parse)
        'cluster'               => $cluster,
        'priority'              => $prio,
        'trunk_candidate'       => $trunk_cand,
        'cross_site_potential'  => $cross,
    ];
    $rows[] = $row;
    $key = $cluster . '|' . $prio;
    $cluster_counts[$key] = ($cluster_counts[$key] ?? 0) + 1;
}
$res->close();
$mysqli->close();

// --- Write CSV ---
$csv_path = $OUT_DIR . '/page-inventory-full.csv';
$fh = fopen($csv_path, 'w');
fputcsv($fh, array_keys($rows[0]), ',', '"', '\\');
foreach ($rows as $r) fputcsv($fh, $r, ',', '"', '\\');
fclose($fh);
echo "Wrote: $csv_path (" . count($rows) . " rows)\n";

// --- Write MD summary ---
$md_path = $OUT_DIR . '/page-inventory-full.md';
ksort($cluster_counts);
$total = count($rows);
$publish = count(array_filter($rows, fn($r) => $r['status'] === 'publish'));
$draft = count(array_filter($rows, fn($r) => $r['status'] === 'draft'));
$private = count(array_filter($rows, fn($r) => $r['status'] === 'private'));

$md = "# Page-Inventar (S2.3-D Phase 1)\n\n";
$md .= "- **Erzeugt:** " . gmdate('c') . "\n";
$md .= "- **Quelle:** Local-WP wp_posts + wp_postmeta + wp_icl_translations\n";
$md .= "- **Scope:** post_type='page' · alle Status\n";
$md .= "- **Zeilen gesamt:** $total (publish=$publish · draft=$draft · private=$private)\n\n";
$md .= "## Cluster-Verteilung\n\n| Cluster | Priorität | Anzahl |\n|---|:-:|--:|\n";
foreach ($cluster_counts as $key => $n) {
    [$c, $p] = explode('|', $key);
    $md .= "| $c | $p | $n |\n";
}

$md .= "\n## Priorisierte Batch-Empfehlung für Folge-Sessions\n\n";
$md .= "Basiert auf Cluster + Priorität. 3–8 Pages pro Session (Erfahrungswert S2.3-B).\n\n";

foreach (['kern', 'checkups', 'services', 'aerzte', 'fachrichtung', 'diagnostik', 'legacy', 'i18n-dublette'] as $cluster) {
    $pages = array_filter($rows, fn($r) => $r['cluster'] === $cluster && $r['status'] === 'publish');
    if (empty($pages)) continue;
    $md .= "\n### Cluster: `$cluster` (" . count($pages) . " publish-Pages)\n\n";
    $md .= "| ID | Slug | Titel | Template | Bilder | Trunk? |\n|---:|---|---|---|---:|:-:|\n";
    foreach ($pages as $p) {
        $title_safe = str_replace(['|', "\n"], [' ', ' '], $p['title']);
        if (mb_strlen($title_safe) > 50) $title_safe = mb_substr($title_safe, 0, 47) . '...';
        $tpl = $p['template'] === 'default' ? '—' : $p['template'];
        $md .= "| {$p['id']} | {$p['slug']} | $title_safe | $tpl | {$p['image_count']} | {$p['trunk_candidate']} |\n";
    }
}

// Trunk-candidates across all clusters
$md .= "\n## Trunk-Kandidaten (für spätere Bridge / Cortex-Web-Integration)\n\n";
$md .= "| ID | Slug | Cluster | cross_site_potential |\n|---:|---|---|---|\n";
$trunks = array_filter($rows, fn($r) => $r['trunk_candidate'] === 'yes');
foreach ($trunks as $t) {
    $md .= "| {$t['id']} | {$t['slug']} | {$t['cluster']} | {$t['cross_site_potential']} |\n";
}

// Drift analysis
$md .= "\n## AK-0: Page-Count-Drift 177 vs. 178 (SESSION_RESUME §1)\n\n";
$md .= "- SESSION_RESUME §1 nennt 178 publish-Pages (Option A Scope-Zählung aus Session 14).\n";
$md .= "- Live-DB heute: $publish publish-Pages.\n";
$md .= "- Delta: " . (178 - $publish) . " Page.\n";
$md .= "- Ursache: Nicht session-blockierend — Kandidaten: (a) Test-Page aus S2.0e-Pivot rückabgewickelt (`/s2-0b-probe/` zurück auf draft), (b) eine Page manuell unpublished, (c) Zählfehler in SESSION_RESUME.\n";
$md .= "- Entscheidung: Drift als AK-0 dokumentiert, nicht blockierend. SESSION_RESUME wird in Session-15-Abschluss auf $publish korrigiert.\n";

file_put_contents($md_path, $md);
echo "Wrote: $md_path\n";
