<?php
/**
 * S2.3 Batch B — Create /praxis/ and /team/ pages in Local WP.
 *
 * Idempotent: re-running this script updates existing pages rather than
 * inserting duplicates. Uses mysqli directly (S2.0b-LL-2: Local uses
 * Unix socket; pass the socket as 5th arg to new mysqli() for robustness).
 *
 * After run: delete rewrite_rules option so WP regenerates with the new
 * page slugs (S2.0f / S2.0e-LL-5 learning: pages inserted via SQL need a
 * rewrite-rules flush before the URL resolves).
 *
 * Usage (from repo root):
 *   PHP=/Users/cluster-mini-02/Local\ Sites/.../app/public/wp-load.php # not used
 *   /usr/local/bin/php sites/praxis-webseite/tools/migrations/2026-04-19_s2.3-b_pages.php
 *
 * Or run the equivalent /bin/php via the Local shell.
 */

$SOCKET = '/Users/cluster-mini-02/Library/Application Support/Local/run/VFEzUQg6g/mysql/mysqld.sock';
$DB     = 'local';
$USER   = 'root';
$PASS   = 'root';

$mysqli = new mysqli( 'localhost', $USER, $PASS, $DB, 0, $SOCKET );
if ( $mysqli->connect_errno ) {
    fwrite( STDERR, "DB connect failed: " . $mysqli->connect_error . "\n" );
    exit( 1 );
}
$mysqli->set_charset( 'utf8mb4' );

function upsert_page( mysqli $db, array $p ) {
    $slug = $db->real_escape_string( $p['slug'] );
    $r = $db->query(
        "SELECT ID FROM wp_posts WHERE post_name='$slug' AND post_type='page' LIMIT 1"
    );
    $row = $r ? $r->fetch_assoc() : null;

    if ( $row ) {
        $id = (int) $row['ID'];
        $stmt = $db->prepare(
            "UPDATE wp_posts
             SET post_title=?, post_content=?, post_excerpt=?, post_status='publish',
                 post_modified=NOW(), post_modified_gmt=UTC_TIMESTAMP()
             WHERE ID=?"
        );
        $stmt->bind_param( 'sssi', $p['title'], $p['content'], $p['excerpt'], $id );
        $stmt->execute();
        $stmt->close();
        echo "UPDATE  id=$id slug={$p['slug']}\n";
    } else {
        $stmt = $db->prepare(
            "INSERT INTO wp_posts
               (post_author, post_date, post_date_gmt, post_content, post_title,
                post_excerpt, post_status, comment_status, ping_status, post_password,
                post_name, to_ping, pinged, post_modified, post_modified_gmt,
                post_content_filtered, post_parent, guid, menu_order, post_type,
                post_mime_type, comment_count)
             VALUES
               (1, NOW(), UTC_TIMESTAMP(), ?, ?,
                ?, 'publish', 'closed', 'closed', '',
                ?, '', '', NOW(), UTC_TIMESTAMP(),
                '', 0, '', 0, 'page',
                '', 0)"
        );
        $stmt->bind_param( 'ssss', $p['content'], $p['title'], $p['excerpt'], $p['slug'] );
        $stmt->execute();
        $id = $stmt->insert_id;
        $stmt->close();
        // Set GUID to a stable URL (best-practice after insert).
        $guid = "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/?page_id=$id";
        $db->query( "UPDATE wp_posts SET guid='" . $db->real_escape_string( $guid ) . "' WHERE ID=$id" );
        echo "INSERT  id=$id slug={$p['slug']}\n";
    }

    // Set meta: _wp_page_template, and all pxz_* hero/CTA meta.
    upsert_meta( $db, $id, '_wp_page_template', $p['template'] );
    foreach ( $p['meta'] as $k => $v ) {
        upsert_meta( $db, $id, $k, $v );
    }

    return $id;
}

function upsert_meta( mysqli $db, int $post_id, string $key, string $value ) {
    $r = $db->query(
        "SELECT meta_id FROM wp_postmeta
         WHERE post_id=$post_id AND meta_key='" . $db->real_escape_string( $key ) . "' LIMIT 1"
    );
    $row = $r ? $r->fetch_assoc() : null;
    if ( $row ) {
        $stmt = $db->prepare(
            "UPDATE wp_postmeta SET meta_value=? WHERE meta_id=?"
        );
        $mid = (int) $row['meta_id'];
        $stmt->bind_param( 'si', $value, $mid );
        $stmt->execute();
        $stmt->close();
    } else {
        $stmt = $db->prepare(
            "INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?)"
        );
        $stmt->bind_param( 'iss', $post_id, $key, $value );
        $stmt->execute();
        $stmt->close();
    }
}

// ---------------------------------------------------------------------------
// Page 1 — /praxis/
// ---------------------------------------------------------------------------

$praxis_content = <<<'HTML'
<h2>Ihre Hausarztpraxis im Herzen Frankfurts</h2>
<p>Im Westend betreuen wir Sie als internistische Schwerpunktpraxis – mit dem vollen Leistungsspektrum hausärztlicher Grundversorgung und einer modernen Diagnostik, die sonst auf mehrere Facharztpraxen verteilt ist. Kurze Wege, schnelle Abklärung, persönliche Betreuung. Das ist unser Anspruch.</p>

<h2>Rundumversorgung unter einem Dach</h2>
<p>Was uns ausmacht: Sie bekommen bei uns das, wofür Sie sonst mehrere Termine an verschiedenen Orten bräuchten. Unser Leistungsspektrum reicht vom klassischen Hausarztkontakt bis zur spezialisierten Inneren Medizin – mit aktueller Geräteausstattung und kurzen Wegen zu Fachkolleginnen und Fachkollegen im Haus.</p>
<ul>
  <li><strong>Internistische Diagnostik.</strong> Labor, EKG und Ultraschall direkt in der Praxis. Ergebnisse meist am selben Tag.</li>
  <li><strong>Hausärztliche Betreuung und Vorsorge.</strong> Check-up 35, Hautkrebs-Screening, Impfberatung, Reisemedizin.</li>
  <li><strong>Chronische Erkrankungen.</strong> Strukturierte DMP-Programme bei Diabetes, COPD, KHK und Asthma.</li>
  <li><strong>Vernetzte Facharzt-Medizin.</strong> HNO, Neurologie, Psychologie, Physiotherapie – unter einem Dach, mit Terminen, die halten.</li>
  <li><strong>Mehrsprachige Betreuung.</strong> Deutsch, Englisch, Französisch, Spanisch – nicht über Dolmetscher-App, sondern direkt in der Sprache Ihres Vertrauens.</li>
  <li><strong>Moderne Geräteausstattung.</strong> Ultraschall, EKG, Lungenfunktion und Labor-Analytik auf aktuellem Facharztniveau.</li>
</ul>

<h2>Unser Team im Überblick</h2>
<p>Neun Ärztinnen und Ärzte, fünf Medizinische Fachangestellte, siebzehn Behandlungsräume an zwei Standorten im Westend. Jede Kollegin und jeder Kollege bringt eigene Schwerpunkte mit – von Diabetologie über Tropenmedizin bis zur Sportmedizin.</p>
<p>Mehr zu den Menschen hinter der Praxis finden Sie auf <a href="/team/">Unser Team</a>.</p>

<h2>International Patients</h2>
<p>Wir betreuen seit Jahren Patientinnen und Patienten aus Frankfurts internationaler Community. Die Anamnese läuft in der Sprache, in der Sie sich medizinisch wohlfühlen – mit ärztlicher Fachsprache, nicht über Dolmetscher-Umwege.</p>
<p><em>We offer medical consultations in English, French and Spanish. Feel free to book your appointment in the language of your choice – medical history and results will be discussed in that language throughout.</em></p>

<h2>Kurze Wartezeiten, effiziente Abläufe</h2>
<p>Für viele unserer Patientinnen und Patienten im Frankfurter Westend ist Wartezeit teurer als die Behandlung selbst. Wir takten unsere Termine so, dass Sie nicht für uns warten müssen. Für akute Beschwerden gibt es zusätzlich unsere <strong>offene Sprechstunde täglich von 11:00 bis 12:00 Uhr</strong> – ohne Termin.</p>
<p>Alle Sprechzeiten und die Online-Terminbuchung finden Sie auf <a href="/sprechstunden/">Sprechzeiten &amp; Termin</a>.</p>
HTML;

$praxis_excerpt = 'Internistische Schwerpunktpraxis im Frankfurter Westend: moderne Diagnostik, 9 Ärzte, 17 Behandlungsräume, kurze Wartezeiten und mehrsprachige Betreuung. Rundumversorgung aus einer Hand.';

$praxis_id = upsert_page( $mysqli, [
    'slug'     => 'praxis',
    'title'    => 'Unsere Praxis',
    'content'  => $praxis_content,
    'excerpt'  => $praxis_excerpt,
    'template' => 'template-standard.php',
    'meta'     => [
        'pxz_standard_eyebrow' => 'Internistische Schwerpunktpraxis · Westend',
        'pxz_standard_h1'      => 'Internistische Schwerpunktpraxis mit hausärztlicher Grundversorgung',
        'pxz_standard_sub'     => 'Moderne Medizin, kurze Wartezeiten, Rundumversorgung aus einer Hand.',
        'pxz_standard_cta_primary_label' => 'Sprechzeiten & Termin',
        'pxz_standard_cta_primary_url'   => '/sprechstunden/',
        'pxz_standard_cta_ghost_label'   => 'Team kennenlernen',
        'pxz_standard_cta_ghost_url'     => '/team/',
    ],
] );

// ---------------------------------------------------------------------------
// Page 2 — /team/
// ---------------------------------------------------------------------------

$team_content = <<<'HTML'
<h2>Medizin ist Teamarbeit</h2>
<p>Gute Medizin entsteht nicht aus einer einzelnen Sprechstunde. Sie entsteht aus dem Zusammenspiel aller, die Sie bei uns begleiten – von der ersten Begrüßung am Empfang über die Blutabnahme und das EKG bis zur Befundbesprechung in der Arztsprechstunde. Wir sehen uns als ein Team, nicht als Einzelkämpfer.</p>

<h2>Wofür wir stehen</h2>
<ul>
  <li><strong>Kompetenz auf Facharztniveau.</strong> Innere Medizin und Allgemeinmedizin mit Zusatzqualifikationen in Diabetologie, Ernährungsmedizin, Tropenmedizin, Sportmedizin und Palliativmedizin.</li>
  <li><strong>Zeit für Sie.</strong> Unsere Termine sind so getaktet, dass wir zuhören können – ohne ständigen Blick auf die Uhr. Das ist in einer modernen Hausarztpraxis nicht selbstverständlich, für uns aber Pflicht.</li>
  <li><strong>Mehrsprachige Medizin.</strong> Anamnese und Befundbesprechung in Deutsch, Englisch, Französisch und Spanisch – mit ärztlicher Fachsprache in der jeweiligen Sprache, nicht über Übersetzer-Umwege.</li>
  <li><strong>Vernetzte Versorgung.</strong> Kurze Wege zu den Fachkolleginnen und Fachkollegen im Haus – HNO, Neurologie, Psychologie, Physiotherapie. Wenn wir weiterschicken müssen, dann mit Terminen, die halten.</li>
</ul>

<h2>Das Team im Überblick</h2>
<p>Wir arbeiten an zwei Standorten im Frankfurter Westend zusammen:</p>
<ul>
  <li>9 Ärztinnen und Ärzte mit Schwerpunkt Innere Medizin und Allgemeinmedizin</li>
  <li>5 Medizinische Fachangestellte für Anmeldung, Blutentnahme, Labor und Abrechnung</li>
  <li>17 Behandlungsräume auf zwei Standorten im Westend</li>
</ul>
<p>Die einzelnen Profile unserer Ärztinnen und Ärzte folgen in Kürze auf der <a href="/aerzte/">Ärzte-Übersicht</a>.</p>

<h2>Werden Sie Teil des Teams</h2>
<p>Wir suchen Menschen, die gute Medizin als Teamsport verstehen – Ärztinnen, Ärzte, MFAs und Quereinsteigerinnen mit Gesundheitsberuf. Wenn das nach Ihnen klingt: Auf unserer <a href="/karriere/">Karriere-Seite</a> finden Sie die aktuellen Stellen und eine Kurzbeschreibung, wie Arbeiten bei uns aussieht.</p>
HTML;

$team_excerpt = 'Wofür unser Praxisteam steht: Kompetenz auf Facharztniveau, Zeit für Sie, mehrsprachige Medizin, vernetzte Versorgung. 9 Ärztinnen und Ärzte und 5 MFAs arbeiten Hand in Hand.';

$team_id = upsert_page( $mysqli, [
    'slug'     => 'team',
    'title'    => 'Unser Team',
    'content'  => $team_content,
    'excerpt'  => $team_excerpt,
    'template' => 'template-standard.php',
    'meta'     => [
        'pxz_standard_eyebrow' => 'Team & Werte',
        'pxz_standard_h1'      => 'Unser Team – Menschen, die für Ihre Gesundheit arbeiten',
        'pxz_standard_sub'     => 'Ärztinnen, Ärzte und Medizinische Fachangestellte – Hand in Hand.',
        'pxz_standard_cta_primary_label' => 'Karriere bei uns',
        'pxz_standard_cta_primary_url'   => '/karriere/',
        'pxz_standard_cta_ghost_label'   => '',
        'pxz_standard_cta_ghost_url'     => '',
    ],
] );

// ---------------------------------------------------------------------------
// WPML: register each page in wp_icl_translations as de-original.
// Without this, WPML (SitePress Multilingual) triggers 404 for direct-SQL
// pages because no translation entry exists for the active language.
// Idempotent: insert only if missing.
// ---------------------------------------------------------------------------
function upsert_wpml_de( mysqli $db, int $post_id ) {
    $r = $db->query(
        "SELECT translation_id FROM wp_icl_translations
         WHERE element_type='post_page' AND element_id=$post_id LIMIT 1"
    );
    if ( $r && $r->num_rows > 0 ) {
        echo "WPML    post_id=$post_id already registered\n";
        return;
    }
    $r = $db->query( "SELECT MAX(trid) AS max_trid FROM wp_icl_translations" );
    $next = 1 + (int) $r->fetch_assoc()['max_trid'];
    $stmt = $db->prepare(
        "INSERT INTO wp_icl_translations
           (element_type, element_id, trid, language_code, source_language_code)
         VALUES ('post_page', ?, ?, 'de', NULL)"
    );
    $stmt->bind_param( 'ii', $post_id, $next );
    $stmt->execute();
    $stmt->close();
    echo "WPML    post_id=$post_id registered as de-original (trid=$next)\n";
}

upsert_wpml_de( $mysqli, $praxis_id );
upsert_wpml_de( $mysqli, $team_id );

// ---------------------------------------------------------------------------
// Flush rewrite rules so that the new page slugs resolve.
// ---------------------------------------------------------------------------
$mysqli->query( "DELETE FROM wp_options WHERE option_name='rewrite_rules'" );
echo "FLUSH   rewrite_rules deleted (WP regenerates on next request)\n";

$mysqli->close();
echo "DONE    praxis_id=$praxis_id team_id=$team_id\n";
echo "NOTE    To flush rewrite rules non-lazily, run (once):\n";
echo "        php -d mysqli.default_socket=<socket> -r '... require wp-load.php; flush_rewrite_rules(); ...'\n";
