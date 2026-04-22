<?php
/**
 * S2.3-aerzte-services — Cluster aerzte + services Migration (Session 20, 2026-04-22).
 *
 * Mutations on Local-WP:
 *   UPDATES:
 *     382  /dr-siegbert-stracke-mba/ → /dr-stracke/      template-arzt.php   (Stracke-Profil, curated)
 *     261  /internistische-…/        → /leistungen/      template-leistungen.php
 *     299  /impfungen/               (slug stays)        default template    (consolidated content from 299+472)
 *     472  /rund-ums-impfen/         → status=draft      (content fused into 299)
 *    5709  /corona-impfung/          → status=draft      (Pandemie-Stand 2022 obsolet)
 *     368  /arzt-team/               → status=draft      (redundant zu /team/ Grid)
 *
 *   INSERTS (7 new doctor profile pages, all template-arzt.php, publish, WPML DE):
 *     /docteur-saul/, /dr-barcsay/, /dr-seelig/, /dr-jawich/,
 *     /dr-shahin/, /dr-landeberg/, /dr-arbitmann/
 *
 * Idempotent: each operation compares to current DB state, only writes when
 * a change is needed. Output ends with "created=N updated=M skipped=K".
 *
 * Per Dr. Stracke constraint (2026-04-22): every doctor must always be
 * surfaced — the "Other doctors" cross-link section is rendered by
 * template-arzt.php from pxz_team_doctors() in the theme.
 *
 * Pre-snapshot: take a mysqldump BEFORE running this script (rollback evidence).
 *
 * Usage:
 *   /Users/cluster-mini-02/Library/Application\ Support/Local/lightning-services/php-8.3.6+0/bin/darwin-arm64/bin/php sites/praxis-webseite/tools/migrations/2026-04-22_s2.3-aerzte-services_pages.php
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

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

function mxq( $mysqli, $sql, $types = '', ...$params ) {
    $stmt = $mysqli->prepare( $sql );
    if ( ! $stmt ) {
        fwrite( STDERR, "Prepare failed: $sql — " . $mysqli->error . "\n" );
        exit( 1 );
    }
    if ( $types !== '' ) $stmt->bind_param( $types, ...$params );
    if ( ! $stmt->execute() ) {
        fwrite( STDERR, "Execute failed: $sql — " . $stmt->error . "\n" );
        exit( 1 );
    }
    return $stmt;
}

function fetch_row( $mysqli, $sql, $types = '', ...$params ) {
    $stmt = mxq( $mysqli, $sql, $types, ...$params );
    $res  = $stmt->get_result();
    return $res ? $res->fetch_assoc() : null;
}

function update_post_field( $mysqli, $id, $field, $value ) {
    $row = fetch_row( $mysqli, "SELECT $field AS v FROM wp_posts WHERE ID=?", 'i', $id );
    if ( $row && (string) $row['v'] === (string) $value ) {
        return [ 'changed' => false ];
    }
    mxq( $mysqli, "UPDATE wp_posts SET $field=? WHERE ID=?", 'si', $value, $id );
    return [ 'changed' => true ];
}

function set_post_meta( $mysqli, $post_id, $key, $value ) {
    $row = fetch_row( $mysqli,
        "SELECT meta_id, meta_value FROM wp_postmeta WHERE post_id=? AND meta_key=? LIMIT 1",
        'is', $post_id, $key );
    if ( $row ) {
        if ( (string) $row['meta_value'] === (string) $value ) return [ 'changed' => false ];
        mxq( $mysqli, "UPDATE wp_postmeta SET meta_value=? WHERE meta_id=?", 'si', $value, (int) $row['meta_id'] );
        return [ 'changed' => true ];
    }
    mxq( $mysqli, "INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?,?,?)",
        'iss', $post_id, $key, $value );
    return [ 'changed' => true ];
}

function delete_post_meta( $mysqli, $post_id, $key ) {
    $row = fetch_row( $mysqli,
        "SELECT meta_id FROM wp_postmeta WHERE post_id=? AND meta_key=? LIMIT 1",
        'is', $post_id, $key );
    if ( ! $row ) return [ 'changed' => false ];
    mxq( $mysqli, "DELETE FROM wp_postmeta WHERE meta_id=?", 'i', (int) $row['meta_id'] );
    return [ 'changed' => true ];
}

/**
 * Idempotent insert of a publish page. Skips if the slug already exists.
 * Returns the post_id (existing or new).
 */
function ensure_page( $mysqli, $slug, $title, $content, $template ) {
    $existing = fetch_row( $mysqli,
        "SELECT ID FROM wp_posts WHERE post_name=? AND post_type='page' LIMIT 1",
        's', $slug );
    if ( $existing ) {
        $id = (int) $existing['ID'];
        // Backfill template if missing (idempotent).
        $r = set_post_meta( $mysqli, $id, '_wp_page_template', $template );
        return [ 'id' => $id, 'created' => false, 'meta_changed' => $r['changed'] ];
    }
    $now = date( 'Y-m-d H:i:s' );
    mxq( $mysqli,
        "INSERT INTO wp_posts
           (post_author, post_date, post_date_gmt, post_content, post_title,
            post_excerpt, post_status, comment_status, ping_status, post_password,
            post_name, to_ping, pinged, post_modified, post_modified_gmt,
            post_content_filtered, post_parent, guid, menu_order, post_type, post_mime_type, comment_count)
         VALUES (1, ?, ?, ?, ?, '', 'publish', 'closed', 'closed', '',
                 ?, '', '', ?, ?, '', 0, '', 0, 'page', '', 0)",
        'sssssss', $now, $now, $content, $title, $slug, $now, $now );
    $id = $mysqli->insert_id;
    // GUID convention.
    mxq( $mysqli, "UPDATE wp_posts SET guid=? WHERE ID=?",
        'si', "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/?page_id=$id", $id );
    set_post_meta( $mysqli, $id, '_wp_page_template', $template );
    return [ 'id' => $id, 'created' => true, 'meta_changed' => true ];
}

/**
 * Idempotent WPML-DE registration (S2.3-B-LL-2 pattern).
 */
function upsert_wpml_de( $mysqli, $post_id ) {
    $row = fetch_row( $mysqli,
        "SELECT translation_id FROM wp_icl_translations WHERE element_id=? AND element_type='post_page' LIMIT 1",
        'i', $post_id );
    if ( $row ) return [ 'changed' => false ];
    // Compute next trid (deterministic per insert).
    $max = fetch_row( $mysqli, "SELECT COALESCE(MAX(trid), 0) AS m FROM wp_icl_translations" );
    $trid = ( (int) $max['m'] ) + 1;
    mxq( $mysqli,
        "INSERT INTO wp_icl_translations (element_type, element_id, trid, language_code, source_language_code)
         VALUES ('post_page', ?, ?, 'de', NULL)",
        'ii', $post_id, $trid );
    return [ 'changed' => true ];
}

function set_status( $mysqli, $id, $status ) {
    return update_post_field( $mysqli, $id, 'post_status', $status );
}

/* ---------------------------------------------------------------------------
 * Content blocks
 * ------------------------------------------------------------------------ */

/**
 * Curated Dr. Stracke profile — content based on _content-archive/aerzte/de/
 * dr-siegbert-stracke-mba-382.md (post_modified 2023-08-16). Mojibake-clean
 * (the archive has `?` replacement chars from earlier import; we restore the
 * intended German letters here without inventing facts).
 */
function content_dr_stracke() {
    return <<<HTML
<!-- wp:paragraph {"className":"pxz-lead"} -->
<p class="pxz-lead">Schwerpunkt Innere Medizin, Notfall- und Intensivmedizin sowie digitale Versorgungsstrukturen. Als Praxisinhaber verbindet Dr. Stracke klinische Erfahrung mit modernen ambulanten Prozessen.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Berufliche Schwerpunkte</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li><strong>Seit 2010</strong> Facharzt für Innere Medizin mit Schwerpunkt auf Notfall- und Intensivmedizin</li><li><strong>Seit 2011</strong> Gesundheitsökonom &amp; Executive MBA Health Care Management mit Schwerpunkt auf der Entwicklung neuer Versorgungsstrukturen</li><li><strong>Seit 2013</strong> Geschäftsführender Gesellschafter Sanexio GmbH &amp; Co. KG mit Schwerpunkt auf digitale Lösungen im Gesundheitswesen und Big-Data-Management</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Werdegang</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Facharzt Innere Medizin · Notfallmedizin</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li><strong>02/2005 – 04/2007:</strong> Ambulanz, Herzkatheterlabor, Intermediate-Care-Station</li><li><strong>04/2007 – 12/2009:</strong> Kardiologische und pulmologische Intensivstation der Medizinischen Klinik I</li><li><strong>01/2008 – 12/2009:</strong> Notarzt am Standort des Universitätsklinikums Gießen</li><li><strong>01/2010 – 12/2012:</strong> Medizinische Klinik Universitätsklinikum Gießen</li><li><strong>01/2013 – 12/2018:</strong> Freiberuflicher Arzt, Schwerpunkt Notaufnahmen</li></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3>Gesundheitsökonom &amp; Executive MBA</h3>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li><strong>01/2013 – heute:</strong> Geschäftsführender Gesellschafter Sanexio GmbH</li><li><strong>11/2021 – heute:</strong> Private Equity Advisor (EBS)</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Ausbildung</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Studium der Medizin</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>10/1998 – 10/2004 <strong>Staatsexamen, Approbation zum Arzt</strong> · Justus-Liebig-Universität Gießen · Note: sehr gut</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Promotion: <em>„Laser-Doppler-Fluxmetrie bei Osteoporose. Eine Untersuchung der Durchblutung des distalen Radius im Übergangsbereich von Periost zu Knochen mit Hilfe der Laser-Doppler-Fluxmetrie zur Erfassung funktioneller Parameter der Mikrozirkulation"</em></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Gesundheitsökonom &amp; MBA</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>09/2011 – 09/2012 <strong>MBA Health Care Management</strong> · European Business School · OAM: very good</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Thesis: <em>„Der Terminkontrakthandel als Risikoinstrument für die Beteiligten im Gesundheitswesen"</em></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><em>Auslandssemester</em> an der University of Stellenbosch · Cape Town, South Africa · 2011</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>09/2010 – 09/2011 <strong>Gesundheitsökonom</strong> · European Business School · Note: sehr gut · ECTS-Grade: A</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Thesis: <em>„Grace-Risk-Score zur Steuerung von Patientenströmen in einer Chest-Pain-Unit unter ökonomischen Aspekten"</em></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Studium Mathematik &amp; Informatik</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>2008 <em>Gasthörer Wirtschaftsinformatik</em> · Fernuniversität Hagen</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>10/1998 – 10/2000 <em>Gasthörer Mathematik</em> · JLU Gießen</p>
<!-- /wp:paragraph -->
HTML;
}

/**
 * Consolidated /impfungen/ content — fuses former /impfungen/ (ID 299) and
 * /rund-ums-impfen/ (ID 472). Mojibake bereinigt, Doppelungen entfernt.
 */
function content_impfungen() {
    return <<<HTML
<!-- wp:paragraph {"className":"pxz-lead"} -->
<p class="pxz-lead">Impfberatung nach STIKO-Empfehlung – mit Impfbuch-Check, individuellem Impfplan und Reisemedizin. Wir beraten Sie zu Auffrisch- und Reiseimpfungen für sich und Ihre Familie.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Impfbuch-Check</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Senden Sie uns Ihr Impfbuch zu oder bringen Sie es zur nächsten Sprechstunde mit. Wir prüfen, ob Impfungen oder Auffrischungen fehlen, und erstellen einen individuellen Plan. Auf Wunsch erinnern wir Sie automatisch an ausstehende Termine.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Im Spätsommer ist es wichtig, rechtzeitig an die jährliche Influenza-Impfung zu denken. Ältere Personen oder chronisch Kranke sollten die Pneumokokken-Impfung nicht versäumen. Eventuell kommt für Sie auch eine Frühsommer-Meningoenzephalitis (FSME)-Impfung in Frage. Bestimmte Berufsgruppen oder Personen mit erhöhter Infektionsgefahr sollten an die Hepatitis-A- und -B-Impfung sowie die Tollwut-Impfung denken.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Auffrisch- und Nachholimpfungen sowie Impfungen für berufsbedingte Auslandsaufenthalte werden in aller Regel von den Krankenkassen bezahlt. Berufsbedingte Inlandsimpfungen muss Ihr Arbeitgeber Ihnen erstatten.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Impfschutz für Kinder</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Impfungen für den Säugling beginnen ab einem Alter von zwei Monaten. Das sind die Impfungen gegen Diphtherie, Tetanus, Keuchhusten (Pertussis), Kinderlähmung (Poliomyelitis), bakterielle Hirnhautentzündung durch Hämophilus-Bakterien (Hib) und Hepatitis B. Diese können mit Kombinationsimpfstoffen als Sechsfach-Impfung durchgeführt werden, sodass viermal jeweils nur eine Injektion notwendig ist.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Ab dem Alter von elf Monaten kommen die Impfungen gegen Masern, Mumps, Röteln und Windpocken (Varizellen) dazu. Auch hier können Kombinationsimpfstoffe verwendet werden. Diese keineswegs harmlosen Erkrankungen können zu gefährlichen Komplikationen mit schweren gesundheitlichen Schäden führen.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Für Säuglinge, Kinder und Jugendliche, die an bestimmten Grunderkrankungen leiden, ist zusätzlich eine Pneumokokken- oder Influenza-Impfung wichtig. Bei ungeimpften Kindern und Jugendlichen sollte an den Schutz gegen Windpocken und Hepatitis B gedacht werden. Bei Mädchen ist im Hinblick auf eine spätere Schwangerschaft die Überprüfung des Schutzes gegen Röteln notwendig.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Impfschutz für Erwachsene</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Impfen ist kein Kinderkram. Häufig fehlen die Auffrischimpfungen. So sind viele Erwachsene nicht ausreichend gegen Diphtherie und Tetanus geschützt. Hier empfiehlt die STIKO eine Auffrischung alle zehn Jahre mit einem Kombinationsimpfstoff. Auch wenn die Grundimmunisierung schon länger zurückliegt, reicht eine Auffrischimpfung.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Mit Kinderkrankheiten wie Masern können sich auch Erwachsene anstecken. Beim Erwachsenen verlaufen diese Krankheiten wesentlich schwerer und sind oft mit Komplikationen verbunden. So kann Mumps bei Männern zu Zeugungsunfähigkeit führen. Röteln in der Schwangerschaft verursachen schwere Behinderungen beim ungeborenen Kind. Nehmen Sie fehlende Impfungen also nicht auf die leichte Schulter – sprechen Sie mit uns über eine Nachimpfung.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Reiseimpfungen</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Reiseziel, Reisedauer, Reisestil und Ihr Impfstatus – diese Informationen benötigen wir, um Ihnen einen individuellen Impfplan für den nächsten Urlaub erstellen zu können.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Teilweise gibt es Empfehlungen der Einreiseländer wie bei der Meningokokken-Impfung. Andere Impfungen, beispielsweise gegen Cholera oder Gelbfieber, werden vom Einreise- oder Transitland vorgeschrieben.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Die meisten Reiseimpfungen sind freiwillig (FSME, Hepatitis A/B, Polio, Tollwut, Typhus). Die Kosten für Reiseschutzimpfungen werden von den gesetzlichen Krankenkassen nicht übernommen. Wichtig ist, dies frühzeitig bei der Reiseplanung zu berücksichtigen. Aber auch bei Last-Minute-Reisen ist oftmals noch ein Schutz möglich.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>STIKO-Empfehlungen</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Empfehlungen der Ständigen Impfkommission (STIKO) des Robert-Koch-Instituts (RKI) enthalten alle für den Impfschutz notwendigen Impfungen. Die eingesetzten Impfstoffe unterliegen einer ständigen Überwachung. Wir orientieren uns bei jeder Beratung am aktuellen Stand der STIKO-Empfehlungen.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Bewahren Sie Ihr Impfbuch sorgfältig auf – es ist die wichtigste Grundlage jeder Impfberatung. Bei Verlust können wir den Schutz teilweise rekonstruieren, eine vollständige Dokumentation ist jedoch wertvoll.</p>
<!-- /wp:paragraph -->
HTML;
}

/* ---------------------------------------------------------------------------
 * Counters
 * ------------------------------------------------------------------------ */
$created = 0;
$updated = 0;
$skipped = 0;

function tally( $what, $r ) {
    global $created, $updated, $skipped;
    if ( ! empty( $r['created'] ) ) { $created++; echo "  CREATE  $what (id=" . $r['id'] . ")\n"; }
    elseif ( ! empty( $r['changed'] ) ) { $updated++; echo "  UPDATE  $what\n"; }
    elseif ( ! empty( $r['meta_changed'] ) ) { $updated++; echo "  UPDATE  $what (meta)\n"; }
    else { $skipped++; echo "  SKIP    $what\n"; }
}

echo "=== S2.3-aerzte-services migration ===\n";

/* ---------------------------------------------------------------------------
 * UPDATES
 * ------------------------------------------------------------------------ */

// 382 Stracke profile.
echo "\n[Update] ID 382 → /dr-stracke/ (template-arzt.php)\n";
tally( '382 post_name=dr-stracke',     update_post_field( $mysqli, 382, 'post_name', 'dr-stracke' ) );
tally( '382 post_title=Dr. med. Siegbert Stracke', update_post_field( $mysqli, 382, 'post_title', 'Dr. med. Siegbert Stracke' ) );
tally( '382 post_content=curated',      update_post_field( $mysqli, 382, 'post_content', content_dr_stracke() ) );
tally( '382 _wp_page_template=arzt',    set_post_meta( $mysqli, 382, '_wp_page_template', 'template-arzt.php' ) );
tally( '382 status=publish',            set_status( $mysqli, 382, 'publish' ) );

// 261 → /leistungen/.
echo "\n[Update] ID 261 → /leistungen/ (template-leistungen.php)\n";
tally( '261 post_name=leistungen',          update_post_field( $mysqli, 261, 'post_name', 'leistungen' ) );
tally( '261 post_title=Unsere Leistungen',  update_post_field( $mysqli, 261, 'post_title', 'Unsere Leistungen' ) );
// Hub renders its own grid — the_content() is hidden, but we set a one-line lead so SEO snapshot is non-empty.
tally( '261 post_content=hub-lead',         update_post_field( $mysqli, 261, 'post_content', '<!-- wp:paragraph --><p>Internistische Schwerpunktpraxis mit hausärztlicher Grundversorgung.</p><!-- /wp:paragraph -->' ) );
tally( '261 _wp_page_template=leistungen',  set_post_meta( $mysqli, 261, '_wp_page_template', 'template-leistungen.php' ) );
tally( '261 status=publish',                set_status( $mysqli, 261, 'publish' ) );

// 299 Impfungen consolidated.
echo "\n[Update] ID 299 /impfungen/ (consolidated content from 299+472)\n";
tally( '299 post_content=consolidated',     update_post_field( $mysqli, 299, 'post_content', content_impfungen() ) );
tally( '299 post_title=Impfungen',          update_post_field( $mysqli, 299, 'post_title', 'Impfungen' ) );
tally( '299 _wp_page_template=default',     delete_post_meta( $mysqli, 299, '_wp_page_template' ) );
tally( '299 status=publish',                set_status( $mysqli, 299, 'publish' ) );

// Drafts.
echo "\n[Draft] redundant/obsolete pages → status=draft\n";
tally( '472 /rund-ums-impfen/ → draft', set_status( $mysqli, 472, 'draft' ) );
tally( '5709 /corona-impfung/ → draft', set_status( $mysqli, 5709, 'draft' ) );
tally( '368 /arzt-team/ → draft',       set_status( $mysqli, 368, 'draft' ) );

/* ---------------------------------------------------------------------------
 * INSERTS — 7 new doctor profile pages
 * ------------------------------------------------------------------------ */

// Mirror pxz_team_doctors() — keep order so /team/ grid + DB inserts match.
$new_doctors = [
    [ 'docteur-saul',  'Docteur en méd. Sonja Saul' ],
    [ 'dr-barcsay',    'Dr. Fabian Barcsay' ],
    [ 'dr-seelig',     'Dr. Stefanie Seelig' ],
    [ 'dr-jawich',     'Dr. Issa Jawich' ],
    [ 'dr-shahin',     'Dr. George Shahin' ],
    [ 'dr-landeberg',  'Linne Landeberg' ],
    [ 'dr-arbitmann',  'Anna Arbitmann' ],
];

echo "\n[Insert] 7 new doctor profile pages (template-arzt.php, status=publish, WPML DE)\n";
foreach ( $new_doctors as [ $slug, $title ] ) {
    // Stub content — empty post_content lets template-arzt.php fall back to
    // the intro from pxz_team_doctors() + placeholder vita block.
    $r = ensure_page( $mysqli, $slug, $title, '', 'template-arzt.php' );
    tally( "/{$slug}/", $r );
    $r2 = upsert_wpml_de( $mysqli, $r['id'] );
    if ( ! empty( $r2['changed'] ) ) { echo "  WPML    /{$slug}/ → DE registered\n"; $updated++; }
}

/* ---------------------------------------------------------------------------
 * Summary + flush rewrite hint
 * ------------------------------------------------------------------------ */
echo "\n--- Summary ---\n";
echo "created=$created  updated=$updated  skipped=$skipped\n";

// Force WP to rebuild rewrite rules so /dr-stracke/, /leistungen/ etc. resolve
// without manual visit to wp-admin → Permalinks.
echo "\nFlushing rewrite_rules option (WP rebuilds on next request)\n";
mxq( $mysqli, "DELETE FROM wp_options WHERE option_name='rewrite_rules'" );

$mysqli->close();
echo "Done.\n";
