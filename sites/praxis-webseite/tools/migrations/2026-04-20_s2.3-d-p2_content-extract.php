<?php
/**
 * S2.3-D Phase 2 — Content-Extract Generator
 *
 * Reads all wp_posts pages (publish + draft + private) from Local-WP DB,
 * writes one Markdown file per page with YAML front-matter + raw post_content body
 * into sites/praxis-webseite/_content-archive/<cluster>/<lang_or_status>/<slug>-<id>.md.
 *
 * Idempotent: on re-run, pages with matching content_md5 are skipped.
 * Updates page-inventory-full.csv with new column `archive_path`.
 *
 * Invariants:
 * - No DB writes (read-only queries).
 * - No theme touch.
 * - Deterministic output (stable YAML key order).
 *
 * Usage:
 *   php tools/migrations/2026-04-20_s2.3-d-p2_content-extract.php
 */

declare(strict_types=1);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASS = 'root';
const DB_NAME = 'local';
const DB_SOCK = '/Users/cluster-mini-02/Library/Application Support/Local/run/VFEzUQg6g/mysql/mysqld.sock';

$projectRoot   = dirname(__DIR__, 2); // sites/praxis-webseite/
$archiveRoot   = $projectRoot . '/_content-archive';
$inventoryPath = $projectRoot . '/specs/sprint-2/S2.3-D/page-inventory-full.csv';
$prodBase      = 'https://westend-hausarzt.com';
$extractorVer  = '2026-04-20_s2.3-d-p2_v1';
$bodyMarker    = "<!-- BODY-BEGIN — ab hier ORIGINAL post_content 1:1, keine Änderung erlaubt. content_md5 bezieht sich auf alles NACH dieser Marker-Zeile bis Dateiende (ohne finalen Newline). -->\n";

// ---------------------------------------------------------------------------
// DB Connection
// ---------------------------------------------------------------------------
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, 0, DB_SOCK);
if ($mysqli->connect_errno) {
    fwrite(STDERR, "DB connect failed: {$mysqli->connect_error}\n");
    exit(1);
}
$mysqli->set_charset('utf8mb4');
// Neutralize MySQL 8 only_full_group_by for LEFT JOIN + GROUP BY (pattern from Phase 1)
$mysqli->query("SET SESSION sql_mode = REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', '')");

// ---------------------------------------------------------------------------
// Load inventory CSV (authoritative source for cluster/priority/trunk flags)
// ---------------------------------------------------------------------------
if (!file_exists($inventoryPath)) {
    fwrite(STDERR, "Inventory CSV not found: $inventoryPath\n");
    exit(1);
}
$fh = fopen($inventoryPath, 'r');
$header = fgetcsv($fh);
$inventory = [];
while (($row = fgetcsv($fh)) !== false) {
    $rec = array_combine($header, $row);
    $inventory[(int)$rec['id']] = $rec;
}
fclose($fh);
fwrite(STDOUT, "Inventory loaded: " . count($inventory) . " pages\n");

// ---------------------------------------------------------------------------
// Fetch all pages + meta + wpml lang
// ---------------------------------------------------------------------------
$sql = "
  SELECT p.ID, p.post_name, p.post_title, p.post_status, p.post_parent,
         p.post_date, p.post_modified, p.post_excerpt, p.menu_order,
         p.comment_status, p.ping_status, p.post_password,
         p.post_content,
         t.language_code AS wpml_lang
  FROM wp_posts p
  LEFT JOIN wp_icl_translations t
         ON t.element_id = p.ID
        AND t.element_type = 'post_page'
  WHERE p.post_type = 'page'
    AND p.post_status IN ('publish', 'draft', 'private')
  ORDER BY p.ID
";
$res = $mysqli->query($sql);
if (!$res) {
    fwrite(STDERR, "Page query failed: {$mysqli->error}\n");
    exit(1);
}

// Preload all post_meta for these IDs (single query, indexed)
$idList = [];
$pages  = [];
while ($p = $res->fetch_assoc()) {
    $idList[] = (int)$p['ID'];
    $pages[(int)$p['ID']] = $p;
}
$res->free();
fwrite(STDOUT, "Pages from DB: " . count($pages) . "\n");

$metaByPost = [];
if (!empty($idList)) {
    $inClause = implode(',', $idList);
    $metaRes = $mysqli->query("SELECT post_id, meta_key, meta_value FROM wp_postmeta WHERE post_id IN ($inClause)");
    while ($m = $metaRes->fetch_assoc()) {
        $pid = (int)$m['post_id'];
        $metaByPost[$pid][$m['meta_key']] = $m['meta_value'];
    }
    $metaRes->free();
}

// Build parent lookup (for prod_url_guess)
$parentOf = [];
$slugOf   = [];
foreach ($pages as $id => $p) {
    $parentOf[$id] = (int)$p['post_parent'];
    $slugOf[$id]   = $p['post_name'];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function yaml_escape_string(string $s): string {
    // Stable, deterministic: always double-quote, escape backslash and double-quote
    $s = str_replace('\\', '\\\\', $s);
    $s = str_replace('"', '\\"', $s);
    // Escape control chars
    $s = preg_replace_callback('/[\x00-\x1f]/', function ($m) {
        $byte = ord($m[0]);
        if ($byte === 0x0a) return '\\n';
        if ($byte === 0x0d) return '\\r';
        if ($byte === 0x09) return '\\t';
        return sprintf('\\x%02x', $byte);
    }, $s);
    return '"' . $s . '"';
}

function yaml_value($v): string {
    if (is_null($v))  return 'null';
    if (is_bool($v))  return $v ? 'true' : 'false';
    if (is_int($v))   return (string)$v;
    if (is_float($v)) return (string)$v;
    if (is_array($v)) {
        if (empty($v)) return '[]';
        // Flat list of scalars → block style
        $out = "\n";
        foreach ($v as $item) {
            $out .= '  - ' . yaml_value($item) . "\n";
        }
        return rtrim($out, "\n");
    }
    return yaml_escape_string((string)$v);
}

function build_prod_url(int $id, array $parentOf, array $slugOf, string $prodBase): ?string {
    $chain = [];
    $cur   = $id;
    $depth = 0;
    while ($cur > 0 && $depth < 10) {
        if (!isset($slugOf[$cur])) return null;
        array_unshift($chain, $slugOf[$cur]);
        $cur = $parentOf[$cur] ?? 0;
        $depth++;
    }
    if ($depth >= 10) return null;
    return $prodBase . '/' . implode('/', $chain) . '/';
}

function detect_lang_for_cluster(string $cluster, ?string $wpmlLang): string {
    if ($cluster === 'i18n-dublette') {
        if ($wpmlLang && in_array($wpmlLang, ['en', 'fr', 'es'], true)) return $wpmlLang;
        return 'unknown';
    }
    return 'de';
}

function extract_image_urls(string $content): array {
    if (!preg_match_all('#<img[^>]+src=["\']([^"\']+)["\']#i', $content, $m)) return [];
    return array_values(array_unique($m[1]));
}

function collect_meta_whitelist(array $allMeta): array {
    $out = [];
    // Fixed whitelist
    $fixed = [
        '_wp_page_template', '_thumbnail_id',
        '_yoast_wpseo_title', '_yoast_wpseo_metadesc', '_yoast_wpseo_focuskw',
        '_yoast_wpseo_canonical', '_yoast_wpseo_opengraph-title', '_yoast_wpseo_opengraph-description',
    ];
    foreach ($fixed as $k) {
        $out[$k] = $allMeta[$k] ?? null;
    }
    // Wildcard capture for _aioseo_* and _yoast_*
    foreach ($allMeta as $k => $v) {
        if (!array_key_exists($k, $out) && (strpos($k, '_aioseo_') === 0 || strpos($k, '_yoast_') === 0)) {
            $out[$k] = $v;
        }
    }
    return $out;
}

/**
 * Emit front-matter block. Stable key order.
 */
function emit_front_matter(array $fm): string {
    $order = [
        // Inventory columns (1:1 CSV)
        'id', 'slug', 'title', 'status', 'parent_id', 'template', 'wpml_lang',
        'content_length', 'image_count', 'image_source_hint', 'mojibake_hits_pre',
        'cluster', 'priority', 'trunk_candidate', 'cross_site_potential',
        // Extraction metadata
        'post_date', 'post_modified', 'post_excerpt', 'menu_order',
        'post_password_protected', 'comment_status', 'ping_status',
        // Meta block
        'meta',
        // Images
        'image_urls',
        // Integrity
        'content_md5', 'extracted_at', 'extractor_version',
        // Prod URL
        'prod_url_guess',
        // Archive path
        'archive_path',
    ];
    $out = "---\n";
    foreach ($order as $k) {
        if (!array_key_exists($k, $fm)) continue;
        $v = $fm[$k];
        if ($k === 'meta') {
            $out .= "meta:\n";
            if (empty($v)) { $out .= "  {}\n"; continue; }
            foreach ($v as $mk => $mv) {
                $out .= '  ' . $mk . ': ' . yaml_value($mv) . "\n";
            }
        } elseif ($k === 'image_urls') {
            if (empty($v)) { $out .= "image_urls: []\n"; }
            else {
                $out .= "image_urls:\n";
                foreach ($v as $u) { $out .= '  - ' . yaml_value($u) . "\n"; }
            }
        } else {
            $out .= $k . ': ' . yaml_value($v) . "\n";
        }
    }
    $out .= "---\n\n";
    return $out;
}

// ---------------------------------------------------------------------------
// Generate files
// ---------------------------------------------------------------------------
$counters = ['created' => 0, 'updated' => 0, 'skipped' => 0, 'errors' => 0];
$archivePathById = [];

if (!is_dir($archiveRoot)) mkdir($archiveRoot, 0755, true);

foreach ($pages as $id => $p) {
    if (!isset($inventory[$id])) {
        fwrite(STDERR, "WARN: ID $id not in inventory, skipping\n");
        $counters['errors']++;
        continue;
    }
    $inv    = $inventory[$id];
    $status = $p['post_status'];
    $cluster = $inv['cluster'];
    $lang   = detect_lang_for_cluster($cluster, $p['wpml_lang'] ?: null);

    // Ablage: draft/private in _status/<status>/, sonst <cluster>/<lang>/
    if ($status === 'draft' || $status === 'private') {
        $relDir = "_status/$status";
    } else {
        $relDir = "$cluster/$lang";
    }
    $slug = $p['post_name'] !== '' ? $p['post_name'] : ('no-slug-' . $id);
    $file = $slug . '-' . $id . '.md';
    $relPath = "$relDir/$file";
    $absDir  = "$archiveRoot/$relDir";
    $absPath = "$absDir/$file";

    if (!is_dir($absDir)) mkdir($absDir, 0755, true);

    $content  = $p['post_content'];
    $contentMd5 = md5($content);

    $frontMatter = [
        // Inventory
        'id'                    => (int)$id,
        'slug'                  => $slug,
        'title'                 => $p['post_title'],
        'status'                => $status,
        'parent_id'             => (int)$p['post_parent'],
        'template'              => $inv['template'],
        'wpml_lang'             => $p['wpml_lang'] ?: '-',
        'content_length'        => (int)$inv['content_length'],
        'image_count'           => (int)$inv['image_count'],
        'image_source_hint'     => $inv['image_source_hint'],
        'mojibake_hits_pre'     => (int)$inv['mojibake_hits_pre'],
        'cluster'               => $cluster,
        'priority'              => $inv['priority'],
        'trunk_candidate'       => $inv['trunk_candidate'],
        'cross_site_potential'  => $inv['cross_site_potential'],
        // Extraction
        'post_date'             => $p['post_date'],
        'post_modified'         => $p['post_modified'],
        'post_excerpt'          => $p['post_excerpt'],
        'menu_order'            => (int)$p['menu_order'],
        'post_password_protected' => !empty($p['post_password']),
        'comment_status'        => $p['comment_status'],
        'ping_status'           => $p['ping_status'],
        // Meta whitelist
        'meta'                  => collect_meta_whitelist($metaByPost[$id] ?? []),
        // Images
        'image_urls'            => extract_image_urls($content),
        // Integrity
        'content_md5'           => $contentMd5,
        'extracted_at'          => date('c'),
        'extractor_version'     => $extractorVer,
        // Prod URL
        'prod_url_guess'        => build_prod_url($id, $parentOf, $slugOf, $prodBase),
        // Archive path
        'archive_path'          => $relPath,
    ];

    // Idempotency: read existing file, compare content_md5 in front-matter
    if (file_exists($absPath)) {
        $existing = file_get_contents($absPath);
        if ($existing !== false && preg_match('/^content_md5: "([a-f0-9]{32})"/m', $existing, $mm)) {
            if ($mm[1] === $contentMd5) {
                $counters['skipped']++;
                $archivePathById[$id] = $relPath;
                continue;
            }
        }
        // MD5 differs → overwrite
        $counters['updated']++;
    } else {
        $counters['created']++;
    }

    $fm = emit_front_matter($frontMatter);
    $out = $fm . $bodyMarker . $content;

    // Atomic write: tmp + rename
    $tmp = $absPath . '.tmp';
    if (file_put_contents($tmp, $out) === false) {
        fwrite(STDERR, "ERROR: write failed for $absPath\n");
        $counters['errors']++;
        continue;
    }
    rename($tmp, $absPath);
    $archivePathById[$id] = $relPath;
}

// ---------------------------------------------------------------------------
// Update inventory CSV with archive_path column
// ---------------------------------------------------------------------------
$csvPath = $projectRoot . '/specs/sprint-2/S2.3-D/page-inventory-full.csv';
$tmpCsv  = $csvPath . '.new';
$rh = fopen($csvPath, 'r');
$wh = fopen($tmpCsv, 'w');
$header = fgetcsv($rh);
$hasArchiveCol = in_array('archive_path', $header, true);
if (!$hasArchiveCol) $header[] = 'archive_path';
fputcsv($wh, $header);
while (($row = fgetcsv($rh)) !== false) {
    $rec = array_combine(array_slice($header, 0, count($row)), $row);
    $id = (int)$rec['id'];
    $path = $archivePathById[$id] ?? '';
    if ($hasArchiveCol) {
        $row[array_search('archive_path', $header, true)] = $path;
    } else {
        $row[] = $path;
    }
    fputcsv($wh, $row);
}
fclose($rh);
fclose($wh);
rename($tmpCsv, $csvPath);

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
$mysqli->close();
$total = count($pages);
fwrite(STDOUT, "\n== Summary ==\n");
fwrite(STDOUT, "Total pages processed: $total\n");
fwrite(STDOUT, "  created: {$counters['created']}\n");
fwrite(STDOUT, "  updated: {$counters['updated']}\n");
fwrite(STDOUT, "  skipped: {$counters['skipped']}\n");
fwrite(STDOUT, "  errors:  {$counters['errors']}\n");
fwrite(STDOUT, "Archive root: $archiveRoot\n");
fwrite(STDOUT, "Inventory CSV updated with archive_path column.\n");

exit($counters['errors'] > 0 ? 2 : 0);
