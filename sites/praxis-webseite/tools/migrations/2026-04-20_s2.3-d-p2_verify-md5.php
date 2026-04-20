<?php
/**
 * S2.3-D Phase 2 — MD5 Integrity Verifier
 *
 * For each archive file, verify:
 *   Body-MD5 (file) == content_md5 (front-matter) == MD5(post_content) (DB)
 *
 * Exit 0 = all match. Exit 2 = any mismatch.
 */

declare(strict_types=1);

const DB_HOST = 'localhost';
const DB_USER = 'root';
const DB_PASS = 'root';
const DB_NAME = 'local';
const DB_SOCK = '/Users/cluster-mini-02/Library/Application Support/Local/run/VFEzUQg6g/mysql/mysqld.sock';

$projectRoot = dirname(__DIR__, 2);
$archiveRoot = $projectRoot . '/_content-archive';
$bodyMarkerStart = '<!-- BODY-BEGIN';

$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME, 0, DB_SOCK);
if ($mysqli->connect_errno) { fwrite(STDERR, "DB connect failed\n"); exit(1); }
$mysqli->set_charset('utf8mb4');

$dbMd5 = [];
$res = $mysqli->query("SELECT ID, MD5(post_content) AS m FROM wp_posts WHERE post_type='page' AND post_status IN ('publish','draft','private')");
while ($r = $res->fetch_assoc()) $dbMd5[(int)$r['ID']] = $r['m'];
$res->free();
$mysqli->close();

function walk(string $dir): array {
    $out = [];
    foreach (new RecursiveIteratorIterator(new RecursiveDirectoryIterator($dir)) as $f) {
        if ($f->isFile() && substr($f->getFilename(), -3) === '.md' && $f->getFilename() !== 'README.md') {
            $out[] = $f->getPathname();
        }
    }
    return $out;
}

$files = walk($archiveRoot);
$total = count($files);
$ok = 0; $fail = 0;
$mismatches = [];

foreach ($files as $path) {
    $raw = file_get_contents($path);
    if ($raw === false) { $fail++; $mismatches[] = "$path: read failed"; continue; }

    if (!preg_match('/^id: (\d+)$/m', $raw, $mm)) { $fail++; $mismatches[] = "$path: no id"; continue; }
    $id = (int)$mm[1];

    if (!preg_match('/^content_md5: "([a-f0-9]{32})"$/m', $raw, $mm2)) { $fail++; $mismatches[] = "$path: no content_md5"; continue; }
    $fmMd5 = $mm2[1];

    $markerPos = strpos($raw, $bodyMarkerStart);
    if ($markerPos === false) { $fail++; $mismatches[] = "$path: no body marker"; continue; }
    $nl = strpos($raw, "\n", $markerPos);
    if ($nl === false) { $fail++; $mismatches[] = "$path: no newline after marker"; continue; }
    $body = substr($raw, $nl + 1);
    $bodyMd5 = md5($body);

    $dbVal = $dbMd5[$id] ?? null;
    if ($dbVal === null) { $fail++; $mismatches[] = "$path: id $id not in DB"; continue; }

    if ($bodyMd5 === $fmMd5 && $fmMd5 === $dbVal) {
        $ok++;
    } else {
        $fail++;
        $mismatches[] = sprintf("id=%d body=%s fm=%s db=%s %s", $id, $bodyMd5, $fmMd5, $dbVal, $path);
    }
}

fwrite(STDOUT, "Total files checked: $total\n");
fwrite(STDOUT, "  OK (3-way match):   $ok\n");
fwrite(STDOUT, "  FAIL:               $fail\n");
if (!empty($mismatches)) {
    fwrite(STDOUT, "\nMismatches:\n");
    foreach (array_slice($mismatches, 0, 20) as $m) fwrite(STDOUT, "  $m\n");
    if (count($mismatches) > 20) fwrite(STDOUT, "  ... and " . (count($mismatches) - 20) . " more\n");
}
exit($fail > 0 ? 2 : 0);
