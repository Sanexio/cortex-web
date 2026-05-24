<?php
// One-shot DB-Patch: Blog-Cleanup — entfernt 11 alte Drafts (2019/2020) + Reste.
// Token-geschützt, idempotent (DELETE WHERE IN (...) auf nicht-vorhandene IDs ist no-op).
// Nach Run: dieses File via SFTP wieder löschen.
declare(strict_types=1);
header('Content-Type: text/plain; charset=utf-8');

const TOKEN = '7e1a926d633f56af69819cd84b3eb33d';
if (!hash_equals(TOKEN, $_GET['token'] ?? '')) {
    http_response_code(403);
    exit("Forbidden\n");
}

set_time_limit(120);
mysqli_report(MYSQLI_REPORT_OFF);

$wp_config = __DIR__ . '/wp-config.php'; // script sits next to wp-config.php in public_html/
if (!file_exists($wp_config)) {
    exit("FAIL: wp-config.php not found at $wp_config\n");
}
$cfg = file_get_contents($wp_config);
preg_match("/'DB_NAME',\s*'([^']+)'/", $cfg, $m1);
preg_match("/'DB_USER',\s*'([^']+)'/", $cfg, $m2);
preg_match("/'DB_PASSWORD',\s*'([^']*)'/", $cfg, $m3);
preg_match("/'DB_HOST',\s*'([^']+)'/", $cfg, $m4);
preg_match("/\\\$table_prefix\s*=\s*'([^']+)'/", $cfg, $m5);
[$DB_NAME, $DB_USER, $DB_PASS, $DB_HOST] = [$m1[1], $m2[1], $m3[1], $m4[1]];
$P = $m5[1] ?? 'wp_';

function ts(string $m): void { echo '[' . date('H:i:s') . '] ' . $m . PHP_EOL; @ob_flush(); @flush(); }

ts("Connect $DB_USER@$DB_HOST/$DB_NAME (prefix=$P)");
$db = mysqli_init();
$db->options(MYSQLI_OPT_CONNECT_TIMEOUT, 10);
if (!@$db->real_connect($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME)) {
    exit('CONNECT-FAIL: ' . mysqli_connect_error() . "\n");
}
$db->set_charset('utf8mb4');

// Old draft post IDs (2019/2020)
$DRAFT_IDS = '506,806,910,1006,1272,1450,1451,1656,2126,2323,2369';
// Revision IDs of those drafts (one each, IDs 10271..10282 except 10281 which is current publish)
$REV_IDS = '10271,10272,10273,10274,10275,10276,10277,10278,10279,10280,10282';
$ALL_IDS = $DRAFT_IDS . ',' . $REV_IDS;
// WPML trids of those drafts
$TRIDS = '635,637,638,640,642,643,644,650,654,655,656';
// Term IDs to delete (5 empty post_tags + 4 orphan categories)
$TERM_IDS = '2,4,25,26,27,28,29,30,32';

// Pre-flight: what exists on remote?
ts('=== Pre-Flight ===');
$r = $db->query("SELECT COUNT(*) AS n FROM {$P}posts WHERE ID IN ($ALL_IDS)");
$pre_posts = (int)($r->fetch_assoc()['n'] ?? 0);
ts("  Posts (drafts+revisions) on remote: $pre_posts");

$r = $db->query("SELECT COUNT(*) AS n FROM {$P}postmeta WHERE post_id IN ($ALL_IDS)");
$pre_meta = (int)($r->fetch_assoc()['n'] ?? 0);
ts("  Postmeta rows: $pre_meta");

$r = $db->query("SELECT COUNT(*) AS n FROM {$P}term_relationships WHERE object_id IN ($DRAFT_IDS)");
$pre_tr = (int)($r->fetch_assoc()['n'] ?? 0);
ts("  Term-Relationships: $pre_tr");

$r = $db->query("SELECT COUNT(*) AS n FROM {$P}icl_translations WHERE trid IN ($TRIDS) AND element_type='post_post'");
$pre_wpml = (int)($r->fetch_assoc()['n'] ?? 0);
ts("  WPML icl_translations: $pre_wpml");

$r = $db->query("SELECT COUNT(*) AS n FROM {$P}terms WHERE term_id IN ($TERM_IDS)");
$pre_terms = (int)($r->fetch_assoc()['n'] ?? 0);
ts("  Terms (tags+orphan-cats): $pre_terms");

if ($pre_posts === 0 && $pre_meta === 0 && $pre_tr === 0 && $pre_wpml === 0 && $pre_terms === 0) {
    ts('NOTHING TO DO — remote already clean.');
    exit;
}

// === Apply ===
ts('=== DELETE ===');
$db->begin_transaction();
try {
    $sql = [
        "DELETE FROM {$P}postmeta WHERE post_id IN ($ALL_IDS)",
        "DELETE FROM {$P}term_relationships WHERE object_id IN ($DRAFT_IDS)",
        "DELETE FROM {$P}icl_translations WHERE trid IN ($TRIDS) AND element_type='post_post'",
        "DELETE FROM {$P}posts WHERE ID IN ($ALL_IDS)",
        "DELETE FROM {$P}term_taxonomy WHERE term_id IN ($TERM_IDS)",
        "DELETE FROM {$P}terms WHERE term_id IN ($TERM_IDS)",
    ];
    foreach ($sql as $q) {
        if (!$db->query($q)) {
            throw new RuntimeException('SQL-Fail: ' . $db->error . ' · ' . $q);
        }
        ts("  OK [{$db->affected_rows}]: " . preg_replace('/\s+/', ' ', substr($q, 0, 80)) . '...');
    }
    $db->commit();
    ts('COMMIT.');
} catch (Throwable $e) {
    $db->rollback();
    ts('ROLLBACK: ' . $e->getMessage());
    exit(1);
}

// Post-flight
ts('=== Post-Flight ===');
$r = $db->query("SELECT COUNT(*) AS n FROM {$P}posts WHERE post_type='post' AND post_status='publish'");
ts("  Publish-Posts remaining: " . (int)$r->fetch_assoc()['n']);
$r = $db->query("SELECT ID, post_title FROM {$P}posts WHERE post_type='post' AND post_status='publish' ORDER BY post_date DESC");
while ($row = $r->fetch_assoc()) ts("    [{$row['ID']}] {$row['post_title']}");

$r = $db->query("SELECT COUNT(*) AS n FROM {$P}posts WHERE ID IN ($ALL_IDS)");
ts("  Old IDs left: " . (int)$r->fetch_assoc()['n']);
$r = $db->query("SELECT COUNT(*) AS n FROM {$P}postmeta WHERE post_id IN ($ALL_IDS)");
ts("  Old postmeta left: " . (int)$r->fetch_assoc()['n']);
$r = $db->query("SELECT COUNT(*) AS n FROM {$P}icl_translations WHERE trid IN ($TRIDS) AND element_type='post_post'");
ts("  Old WPML rows left: " . (int)$r->fetch_assoc()['n']);
$r = $db->query("SELECT COUNT(*) AS n FROM {$P}terms WHERE term_id IN ($TERM_IDS)");
ts("  Old terms left: " . (int)$r->fetch_assoc()['n']);

ts('DONE. Remember to delete this script via SFTP.');
