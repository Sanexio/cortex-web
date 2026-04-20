<?php
/**
 * S2.3-D Phase 3 — Mojibake-Fix
 *
 * Canonical ftfy-equivalent: UTF-8 → Windows-1252 bytes → UTF-8
 * Per-Page safety check (Mojibake-Marker-Diff, UTF-8-Validity).
 *
 * Scope: wp_posts WHERE post_type='page' AND post_status='publish'
 * Idempotent: 2. Lauf produziert 0 Changes.
 * Reversibel: mysqldump-Pre-Snapshot liegt vor.
 *
 * Usage:  php 2026-04-20_s2.3-d_mojibake-fix.php [--dry-run]
 */

$DRY_RUN = in_array('--dry-run', $argv);
$SOCKET  = $_SERVER['HOME'] . '/Library/Application Support/Local/run/VFEzUQg6g/mysql/mysqld.sock';

$mysqli = new mysqli('localhost', 'root', 'root', 'local', null, $SOCKET);
if ($mysqli->connect_errno) {
    fwrite(STDERR, "Connect failed: " . $mysqli->connect_error . "\n");
    exit(1);
}
$mysqli->set_charset('utf8mb4');

// --- Mojibake-Detection: 4 Marker-Klassen ---
function has_mojibake(string $s): bool {
    // a) 7-byte "â€X" sequences (starts C3 A2 E2 82 AC)
    if (strpos($s, "\xC3\xA2\xE2\x82\xAC") !== false) return true;
    // b) "Ã" + Umlaut-Folgebyte: Ã¤ Ã¶ Ã¼ ÃŸ Ã„ Ã– Ãœ Ã© Ã¨ Ã Ã±
    if (preg_match('/\xC3\x83[\xA0-\xBF\x80-\x9F]/', $s)) return true;
    // c) "Â" + punctuation (C3 82 + 2nd byte) — NBSP, copyright, paragraph etc.
    if (preg_match('/\xC3\x82[\x80-\xBF]/', $s)) return true;
    // d) Lone "â€" (C3 A2 E2 80) — em/en-dash variants where 3rd-byte varies
    if (strpos($s, "\xC3\xA2\xE2\x80") !== false) return true;
    return false;
}

// --- ftfy-equivalent re-encoding ---
function fix_utf8_double_encode(string $s): ?string {
    // Step 1: Interpret current UTF-8 chars as Windows-1252 bytes (gives original UTF-8 bytes).
    $tmp = @mb_convert_encoding($s, 'Windows-1252', 'UTF-8');
    if ($tmp === false || $tmp === null) return null;
    // Step 2: Interpret those bytes as UTF-8 (decodes the original characters).
    $fixed = @mb_convert_encoding($tmp, 'UTF-8', 'UTF-8');
    if ($fixed === false || $fixed === null) return null;
    // Validity: mb_check_encoding ensures valid UTF-8.
    if (!mb_check_encoding($fixed, 'UTF-8')) return null;
    return $fixed;
}

// --- Main loop: publish pages only ---
$result = $mysqli->query("SELECT ID, post_content FROM wp_posts WHERE post_type='page' AND post_status='publish' ORDER BY ID");
if (!$result) { fwrite(STDERR, "Query failed: " . $mysqli->error . "\n"); exit(1); }

$stats = [
    'scanned' => 0,
    'had_mojibake' => 0,
    'fixed' => 0,
    'residue' => 0,       // still has mojibake after fix
    'unchanged' => 0,
    'invalid_utf8' => 0,
    'residue_ids' => [],
];

$update_stmt = $mysqli->prepare("UPDATE wp_posts SET post_content = ? WHERE ID = ?");

while ($row = $result->fetch_assoc()) {
    $stats['scanned']++;
    $id = (int)$row['ID'];
    $orig = $row['post_content'];

    if (!has_mojibake($orig)) {
        $stats['unchanged']++;
        continue;
    }

    $stats['had_mojibake']++;
    $fixed = fix_utf8_double_encode($orig);

    if ($fixed === null) {
        $stats['invalid_utf8']++;
        $stats['residue_ids'][] = $id;
        continue;
    }

    // Safety: fixed must NOT introduce new broken sequences AND reduce mojibake markers
    if (has_mojibake($fixed)) {
        // Partial fix possible — still preserve if it's better, else skip
        $orig_score = substr_count($orig, "\xC3\x82") + substr_count($orig, "\xC3\x83") + substr_count($orig, "\xC3\xA2\xE2\x82\xAC") + substr_count($orig, "\xC3\xA2\xE2\x80");
        $fixed_score = substr_count($fixed, "\xC3\x82") + substr_count($fixed, "\xC3\x83") + substr_count($fixed, "\xC3\xA2\xE2\x82\xAC") + substr_count($fixed, "\xC3\xA2\xE2\x80");
        if ($fixed_score >= $orig_score) {
            $stats['residue']++;
            $stats['residue_ids'][] = $id;
            continue;
        }
    }

    if ($fixed === $orig) {
        $stats['unchanged']++;
        continue;
    }

    if ($DRY_RUN) {
        $stats['fixed']++;
    } else {
        $update_stmt->bind_param('si', $fixed, $id);
        if ($update_stmt->execute() && $update_stmt->affected_rows > 0) {
            $stats['fixed']++;
        } else {
            $stats['unchanged']++;
        }
    }
}
$result->close();
$update_stmt->close();
$mysqli->close();

echo "=== Mojibake-Fix Report ===\n";
echo "Date:          " . gmdate('c') . "\n";
echo "Mode:          " . ($DRY_RUN ? 'DRY-RUN (no DB writes)' : 'LIVE') . "\n";
echo "Scanned:       " . $stats['scanned'] . "\n";
echo "Had mojibake:  " . $stats['had_mojibake'] . "\n";
echo "Fixed:         " . $stats['fixed'] . "\n";
echo "Residue:       " . $stats['residue'] . "\n";
echo "Invalid UTF-8: " . $stats['invalid_utf8'] . "\n";
echo "Unchanged:     " . $stats['unchanged'] . "\n";
if (!empty($stats['residue_ids'])) {
    echo "Residue IDs:   " . implode(',', $stats['residue_ids']) . "\n";
}
exit(0);
