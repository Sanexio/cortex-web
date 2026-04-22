<?php
/**
 * S2.4 — Create /fachrichtungen/ stub page in Local WP.
 *
 * Purpose: the new top-nav (S2.4) links to /fachrichtungen/, but the landing
 * page is a skeleton from S2.2 with no content. We render an honest stub via
 * template-standard.php so the menu link returns HTTP 200 with readable
 * placeholder text ("Fachrichtungs-Übersicht folgt in Kürze").
 *
 * The real card-grid landing (template-fachrichtung-landing.php) becomes the
 * target template once cluster `fachrichtungen` migrates in a later S2.3-Cx
 * session.
 *
 * Idempotent: re-running updates existing page, no duplicates.
 * After run: flushes rewrite_rules so /fachrichtungen/ resolves.
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
    $r = $db->query( "SELECT ID FROM wp_posts WHERE post_name='$slug' AND post_type='page' LIMIT 1" );
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
        $guid = "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/?page_id=$id";
        $db->query( "UPDATE wp_posts SET guid='" . $db->real_escape_string( $guid ) . "' WHERE ID=$id" );
        echo "INSERT  id=$id slug={$p['slug']}\n";
    }

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
        $stmt = $db->prepare( "UPDATE wp_postmeta SET meta_value=? WHERE meta_id=?" );
        $mid = (int) $row['meta_id'];
        $stmt->bind_param( 'si', $value, $mid );
        $stmt->execute();
        $stmt->close();
    } else {
        $stmt = $db->prepare( "INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?)" );
        $stmt->bind_param( 'iss', $post_id, $key, $value );
        $stmt->execute();
        $stmt->close();
    }
}

function upsert_wpml_de( mysqli $db, int $post_id ) {
    $r = $db->query(
        "SELECT translation_id FROM wp_icl_translations
         WHERE element_id=$post_id AND element_type='post_page' LIMIT 1"
    );
    $row = $r ? $r->fetch_assoc() : null;
    if ( $row ) {
        echo "WPML    id=$post_id already registered\n";
        return;
    }
    $r = $db->query( "SELECT MAX(trid) AS max_trid FROM wp_icl_translations" );
    $max_trid = (int) ( $r ? $r->fetch_assoc()['max_trid'] : 0 );
    $new_trid = $max_trid + 1;
    $db->query(
        "INSERT INTO wp_icl_translations
           (element_type, element_id, trid, language_code, source_language_code)
         VALUES
           ('post_page', $post_id, $new_trid, 'de', NULL)"
    );
    echo "WPML    id=$post_id registered as de-original (trid=$new_trid)\n";
}

// ---------------------------------------------------------------------------
// /fachrichtungen/ — S2.4 stub
// ---------------------------------------------------------------------------

$content = <<<'HTML'
<h2>Unsere medizinischen Fachrichtungen</h2>
<p>Das Praxiszentrum Dr. Stracke &amp; Kollegen bündelt acht medizinische Fachrichtungen unter einem Dach: Innere Medizin und Allgemeinmedizin als hausärztliche Basis, ergänzt um HNO, Neurologie, Psychologie, Physiotherapie, Gynäkologie und Urologie. So decken wir ein breites Spektrum ab — von der Grundversorgung bis zur fachärztlichen Abklärung.</p>

<h2>Detailseiten in Vorbereitung</h2>
<p>Wir arbeiten gerade daran, jede Fachrichtung mit eigenen Detailseiten und Ärzte-Profilen auszustatten. Bis dahin erreichen Sie uns für alle Fragen zu unseren Angeboten über unsere <a href="/contact-us/">Kontaktseite</a> oder telefonisch unter <a href="tel:+4969247574523">069 247 574 523</a>.</p>

<h2>Weitere Wege zu unseren Angeboten</h2>
<ul>
  <li><a href="/check-ups/">Check-Ups &amp; Vorsorge</a> — Gesundheits-, Cardio-, Angio-Check-Up, Tumorscreening, Basic-Check</li>
  <li><a href="/sprechstunden/">Sprechzeiten &amp; Termin</a> — Öffnungszeiten, offene Sprechstunde, Online-Termin</li>
  <li><a href="/team/">Unser Team</a> — Ärztinnen, Ärzte und medizinische Fachangestellte</li>
</ul>
HTML;

$excerpt = 'Acht medizinische Fachrichtungen unter einem Dach: Innere Medizin, Allgemeinmedizin, HNO, Neurologie, Psychologie, Physiotherapie, Gynäkologie, Urologie. Detail-Seiten in Vorbereitung.';

$id = upsert_page( $mysqli, [
    'slug'     => 'fachrichtungen',
    'title'    => 'Fachrichtungen',
    'content'  => $content,
    'excerpt'  => $excerpt,
    'template' => 'template-standard.php',
    'meta'     => [
        'pxz_standard_eyebrow' => 'Medizinische Schwerpunkte · Westend',
        'pxz_standard_h1'      => 'Acht Fachrichtungen unter einem Dach',
        'pxz_standard_sub'     => 'Hausärztliche Grundversorgung plus Fachmedizin — vernetzt, kurze Wege, persönliche Betreuung.',
        'pxz_standard_cta_primary_label' => 'Termin anfragen',
        'pxz_standard_cta_primary_url'   => '/sprechstunden/',
        'pxz_standard_cta_ghost_label'   => 'Kontakt aufnehmen',
        'pxz_standard_cta_ghost_url'     => '/contact-us/',
    ],
] );

upsert_wpml_de( $mysqli, $id );

// Flush rewrite rules so the new slug resolves.
$mysqli->query( "DELETE FROM wp_options WHERE option_name='rewrite_rules'" );
echo "FLUSH   rewrite_rules deleted (WP regenerates on next request)\n";

$mysqli->close();
echo "DONE.\n";
