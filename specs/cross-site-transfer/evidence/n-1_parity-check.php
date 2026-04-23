<?php
// N-1 AK-11 Parity Check: json-path vs. inline-fallback.
// Runs in 2 modes controlled by env PARITY_MODE=json|inline.
//
// Usage (see run-parity.sh in same dir):
//   PARITY_MODE=json   php n-1_parity-check.php > out.json
//   PARITY_MODE=inline php n-1_parity-check.php > out.inline

define('ABSPATH', '/tmp/wp-fake/');
$theme_path = '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-content/themes/praxiszentrum';
define('PXZ_PATH', $theme_path);

$mode = getenv('PARITY_MODE') ?: 'json';

$json_file = $theme_path . '/inc/data/team.json';
$json_backup = $theme_path . '/inc/data/team.json.parity-test-hidden';

if ($mode === 'inline') {
    // Hide JSON so pxz_team_doctors_from_json() returns null -> fallback runs.
    if (file_exists($json_file)) {
        rename($json_file, $json_backup);
    }
}

require $theme_path . '/inc/team-data.php';
$doctors = pxz_team_doctors();

if ($mode === 'inline') {
    // Restore JSON immediately (even if below fails later).
    if (file_exists($json_backup)) {
        rename($json_backup, $json_file);
    }
}

// Normalize: sort each doctor's keys alphabetically for diff stability.
// (Inline array keeps declaration order; JSON from adapter is also deterministic
// but via a different key order. Alpha-sort makes the two canonical.)
$normalized = array_map(function ($d) {
    ksort($d);
    return $d;
}, $doctors);

echo json_encode($normalized, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . "\n";
