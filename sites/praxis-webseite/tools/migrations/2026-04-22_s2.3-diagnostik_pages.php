<?php
/**
 * S2.3-diagnostik — Cluster diagnostik Migration (Session 21, 2026-04-22).
 *
 * Mutations on Local-WP:
 *   INSERT:
 *     NEW   /diagnostik/                          template-diagnostik-hub.php   (Top-Hub)
 *
 *   UPDATES (slug + template + optional post_parent + content):
 *     277   /ultraschalldiagnostik/  → /sonographie/              template-diagnostik-hub.php (Sub-Hub)
 *     357   /schilddruesen-sonographie/ → /sonographie/schilddruese/   (nested, post_parent=277)
 *     360   /ultraschall-der-beingefaesse/ → /sonographie/beingefaesse/ (nested, post_parent=277)
 *    4206   /sono-atlas/             → /sonographie/atlas/        (nested, post_parent=277)
 *                                                                 status depends on INCLUDE_SONO_ATLAS env (R-7)
 *     289   /belastungs-ekg/         (slug stays)                 content kuratiert + Cross-Link
 *     292   /lungenfunktion/         (slug stays)                 content kuratiert + Cross-Link
 *     296   /labordiagnostik/        → /labor/                    content konsolidiert 296+475, 4 H2
 *
 *   DRAFT:
 *     475   /rund-ums-labor/         → status=draft                (Inhalt in 296 fusioniert)
 *
 *   DELETE:
 *    4297   Shell-Dublette (post_name=sono-atlas, content_length=0)
 *
 *   Additionally:
 *     - _wp_old_slug meta for each slug-change (301-Redirect)
 *     - wp_icl_translations upsert (DE) for the new /diagnostik/ page
 *     - DELETE wp_options.rewrite_rules (forces WP to regenerate nested rules)
 *
 * Idempotency: each operation compares to current DB state, only writes when
 * a change is needed. Output ends with a summary line.
 *
 * Pre-snapshot: take a mysqldump BEFORE running this script (rollback
 * evidence in specs/sprint-2/evidence/2026-04-22_s2.3-diagnostik_mysqldump-pre.sql.gz).
 *
 * R-7 DSGVO sono-atlas gate:
 *   Atlas page (ID 4206) is SKIPPED by default (kept at its current slug +
 *   status until Dr. Stracke confirms patient anonymisation). Set
 *   INCLUDE_SONO_ATLAS=1 in the environment to migrate + publish it.
 *   Set INCLUDE_SONO_ATLAS=draft to migrate it as draft (URL exists but
 *   not publicly indexable).
 *
 * Usage:
 *   PHP='/Users/cluster-mini-02/Library/Application Support/Local/lightning-services/php-8.4.18+1/bin/darwin-arm64/bin/php'
 *   "$PHP" sites/praxis-webseite/tools/migrations/2026-04-22_s2.3-diagnostik_pages.php            # dry-run
 *   APPLY=1 "$PHP" sites/praxis-webseite/tools/migrations/2026-04-22_s2.3-diagnostik_pages.php    # write
 *   APPLY=1 INCLUDE_SONO_ATLAS=draft "$PHP" … # also migrate atlas as draft
 */

$SOCKET = '/Users/cluster-mini-02/Library/Application Support/Local/run/VFEzUQg6g/mysql/mysqld.sock';
$DB     = 'local';
$USER   = 'root';
$PASS   = 'root';

$APPLY              = getenv( 'APPLY' ) === '1';
// getenv returns false when unset (not ''). Normalise so downstream
// equality/strict-comparison checks are predictable.
$raw_atlas          = getenv( 'INCLUDE_SONO_ATLAS' );
$INCLUDE_SONO_ATLAS = ( $raw_atlas === false ) ? '' : (string) $raw_atlas;

$mysqli = new mysqli( 'localhost', $USER, $PASS, $DB, 0, $SOCKET );
if ( $mysqli->connect_errno ) {
    fwrite( STDERR, "DB connect failed: " . $mysqli->connect_error . "\n" );
    exit( 1 );
}
$mysqli->set_charset( 'utf8mb4' );

$stats = [
    'created' => 0,
    'updated' => 0,
    'deleted' => 0,
    'drafted' => 0,
    'skipped' => 0,
    'meta_updates' => 0,
    'wpml_inserts' => 0,
    'sonoatlas'    => 'skipped',
];

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

function update_post_field( $mysqli, $apply, $id, $field, $value ) {
    $row = fetch_row( $mysqli, "SELECT $field AS v FROM wp_posts WHERE ID=?", 'i', $id );
    if ( $row && (string) $row['v'] === (string) $value ) {
        return [ 'changed' => false ];
    }
    if ( $apply ) {
        mxq( $mysqli, "UPDATE wp_posts SET $field=? WHERE ID=?", 'si', $value, $id );
    }
    return [ 'changed' => true, 'from' => $row['v'] ?? null, 'to' => $value ];
}

function set_post_meta( $mysqli, $apply, $post_id, $key, $value ) {
    $row = fetch_row( $mysqli,
        "SELECT meta_id, meta_value FROM wp_postmeta WHERE post_id=? AND meta_key=? LIMIT 1",
        'is', $post_id, $key );
    if ( $row ) {
        if ( (string) $row['meta_value'] === (string) $value ) return [ 'changed' => false ];
        if ( $apply ) {
            mxq( $mysqli, "UPDATE wp_postmeta SET meta_value=? WHERE meta_id=?", 'si', $value, (int) $row['meta_id'] );
        }
        return [ 'changed' => true, 'from' => $row['meta_value'], 'to' => $value ];
    }
    if ( $apply ) {
        mxq( $mysqli, "INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?,?,?)",
            'iss', $post_id, $key, $value );
    }
    return [ 'changed' => true, 'from' => null, 'to' => $value ];
}

function upsert_wpml_de( $mysqli, $apply, $post_id ) {
    $row = fetch_row( $mysqli,
        "SELECT translation_id FROM wp_icl_translations WHERE element_id=? AND element_type='post_page' LIMIT 1",
        'i', $post_id );
    if ( $row ) return [ 'changed' => false ];
    if ( $apply ) {
        $max  = fetch_row( $mysqli, "SELECT COALESCE(MAX(trid), 0) AS m FROM wp_icl_translations" );
        $trid = ( (int) $max['m'] ) + 1;
        mxq( $mysqli,
            "INSERT INTO wp_icl_translations (element_type, element_id, trid, language_code, source_language_code)
             VALUES ('post_page', ?, ?, 'de', NULL)",
            'ii', $post_id, $trid );
    }
    return [ 'changed' => true ];
}

/**
 * Idempotent insert of a publish page. Returns the post_id (existing or new).
 */
function ensure_page( $mysqli, $apply, $slug, $title, $content, $template ) {
    $existing = fetch_row( $mysqli,
        "SELECT ID, post_content FROM wp_posts WHERE post_name=? AND post_type='page' LIMIT 1",
        's', $slug );
    if ( $existing ) {
        $id = (int) $existing['ID'];
        $meta = set_post_meta( $mysqli, $apply, $id, '_wp_page_template', $template );
        // Refresh content if it differs (allows re-runs to update the hub page body).
        $content_changed = false;
        if ( (string) $existing['post_content'] !== (string) $content ) {
            if ( $apply ) {
                mxq( $mysqli, "UPDATE wp_posts SET post_content=? WHERE ID=?", 'si', $content, $id );
            }
            $content_changed = true;
        }
        return [ 'id' => $id, 'created' => false, 'meta_changed' => $meta['changed'], 'content_changed' => $content_changed ];
    }
    $now = date( 'Y-m-d H:i:s' );
    if ( $apply ) {
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
        mxq( $mysqli, "UPDATE wp_posts SET guid=? WHERE ID=?",
            'si', "https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/?page_id=$id", $id );
        set_post_meta( $mysqli, true, $id, '_wp_page_template', $template );
    } else {
        $id = -1; // placeholder for dry-run
    }
    return [ 'id' => $id, 'created' => true, 'meta_changed' => true, 'content_changed' => true ];
}

function set_old_slug( $mysqli, $apply, $post_id, $old_slug ) {
    // _wp_old_slug meta allows WP to 301-redirect old slug → new slug.
    // Only add if not already present for this value.
    $existing = fetch_row( $mysqli,
        "SELECT meta_id FROM wp_postmeta WHERE post_id=? AND meta_key='_wp_old_slug' AND meta_value=? LIMIT 1",
        'is', $post_id, $old_slug );
    if ( $existing ) return [ 'changed' => false ];
    if ( $apply ) {
        mxq( $mysqli, "INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?, '_wp_old_slug', ?)",
            'is', $post_id, $old_slug );
    }
    return [ 'changed' => true ];
}

/* ---------------------------------------------------------------------------
 * Content blocks (curated, Mojibake-clean)
 * ------------------------------------------------------------------------ */

function content_diagnostik_hub() {
    // Keep short — the template draws the 4-card grid + crosslinks + CTA itself.
    return <<<HTML
<!-- wp:paragraph -->
<p>Wir führen die wichtigsten apparativen Untersuchungen direkt in der Praxis durch — ohne Überweisungskette, ohne Wartezeit auf ein externes Institut. Befunde besprechen wir in der gleichen oder einer zeitnahen Folgekonsultation.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_sonographie_subhub() {
    // Curated from archive ID 277. Mojibake-clean. Images omitted (E-2); hub
    // template draws the cards for the 3 nested children below this body.
    return <<<HTML
<!-- wp:paragraph -->
<p>Die Sonographie ist ein bildgebendes Verfahren mit Ultraschallwellen zur Untersuchung innerer Organe. Ein wesentlicher Vorteil gegenüber dem Röntgen liegt in der Unschädlichkeit der eingesetzten Schallwellen — auch sensible Gewebe werden nicht beschädigt, die Untersuchung verläuft schmerzfrei und kann beliebig oft wiederholt werden.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Welche Organe wir untersuchen</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Kopf und Hals</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Am Hals beurteilen wir vor allem die Halsschlagader (Carotis) auf Verkalkungen und entzündliche Veränderungen sowie die Schilddrüse, um frühzeitig Knoten oder Vergrößerungen zu erkennen — insbesondere bei auffälligen Laborwerten. Für die Schilddrüse gibt es eine eigene Detailseite.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Herz</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Mit der Echokardiographie (Herzultraschall) überprüfen wir Pumpfunktion, Wandbewegung und Herzklappen. Wandbewegungsstörungen können auf eine koronare Herzkrankheit hinweisen; außerdem lassen sich ein bisher unentdeckter Bluthochdruck oder Lungenerkrankungen erkennen.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Bauchraum</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Beim Abdomen-Ultraschall untersuchen wir Leber, Gallenblase und Gallenwege, Bauchspeicheldrüse, Milz und Anteile des Magens. Gleichzeitig beurteilen wir die großen Bauchgefäße (Aorta, Hohlvene, Pfortader), die Nieren und die ableitenden Harnwege. Beim Mann wird zusätzlich die Prostata orientierend mitbeurteilt.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Beingefäße</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Bei entsprechenden Beschwerden führen wir eine orientierende Diagnostik der Beinarterien (Verdacht auf pAVK / „Schaufensterkrankheit") und der Venen (Thrombose-Verdacht) durch. Für die vertiefte Abklärung gibt es eine eigene Detailseite.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Bewegungsapparat</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Wir können Weichteile und Gelenke sonographisch beurteilen — vor allem Sehnen und Bänder an Knie, Schulter (Rotatorenmanschette), Ellbogen, Hand und Handgelenk. Muskelverletzungen, Hämatome und Entzündungen peripherer Nerven wie beim Karpaltunnelsyndrom sind darstellbar.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_sono_schilddruese() {
    return <<<HTML
<!-- wp:paragraph -->
<p>Die Schilddrüse ist ein am Hals gelegenes Organ, das lebenswichtige Hormone produziert. Diese regulieren den Grundumsatz, wirken in fast allen Körperzellen und regen dort den Energiestoffwechsel an. Zur Hormonbildung ist Jod notwendig. Bei Unterversorgung kommt es zu einer Mehrproduktion des Steuerungshormons TSH — was zu Wachstum der Schilddrüse und schließlich zur Ausbildung eines Kropfs (Struma) führen kann.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Wann wir eine Schilddrüsen-Sonographie durchführen</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Finden wir bei der körperlichen Untersuchung eine vergrößerte Schilddrüse oder fallen im Labor TSH, fT3 oder fT4 auf, ist die Sonographie der erste Schritt der bildgebenden Abklärung. Ergibt sich ein Verdacht auf Knoten oder Funktionsstörung, ergänzen wir die Diagnostik mit Szintigraphie, in selteneren Fällen mit Computertomographie oder Kernspin.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Ablauf</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Untersuchung dauert rund 10 Minuten. Sie liegen auf dem Rücken, der Hals wird leicht überstreckt; wir tragen Ultraschall-Gel auf und fahren mit dem Schallkopf über beide Schilddrüsenlappen und den Isthmus. Ergänzend beurteilen wir die Lymphknoten der Halsregion.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Verwandte Untersuchungen</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Schilddrüsen-Sonographie ist Teil unseres <a href="/check-ups/tumorscreening/">Tumor-Screenings</a>. Ergibt sich ein Verdacht auf eine Hormonstörung, besprechen wir weitere Laborwerte unter <a href="/labor/">Labor</a>.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_sono_beingefaesse() {
    return <<<HTML
<!-- wp:heading -->
<h2>ABI — Knöchel-Arm-Index</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die sogenannte Schaufensterkrankheit (periphere arterielle Verschlusskrankheit, pAVK) beruht auf einer Verkalkung der Beinarterien. Betroffene müssen nach einer bestimmten Gehstrecke stehenbleiben, weil es unter Belastung zu einer Minderdurchblutung der Beinmuskulatur kommt. Eine Messung der Blutdruckwerte an beiden Armen und Beinen (ABI) gibt einen ersten Anhalt für das Vorliegen dieser Erkrankung.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Duplex der Beingefäße</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Mit dem Duplex der Beingefäße verfolgen wir einzelne Arterien und Venen entlang ihres Verlaufs durch das Becken bis in die Unterschenkel und erkennen relevante Verkalkungen, Engstellen oder Thrombosen. Bei ausgeprägten Befunden überweisen wir zum Angiologen zur weiteren Abklärung — typische Folgetherapie ist die Aufdehnung mittels Ballon und ggf. Stent-Implantation.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Verwandte Untersuchungen</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Gefäß-Sonographie der Beine ist Teil unseres <a href="/check-ups/angio-check-up/">Angio-Check-Ups</a> (Schlaganfall- und pAVK-Vorsorge).</p>
<!-- /wp:paragraph -->
HTML;
}

function content_sono_atlas() {
    // Curated from archive 4206. Mojibake-clean. Image URLs preserved.
    // DSGVO-footer clarifies anonymisation (Dr. Stracke's arztliche Einschätzung).
    return <<<HTML
<!-- wp:paragraph -->
<p>Diese Seite zeigt ausgewählte Sonographie-Befunde aus unserer Praxis. Die Aufnahmen sind anonymisiert und dienen der Veranschaulichung typischer Ultraschall-Bilder.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Alphabetisch geordnete Befunde</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Dünndarmileus</h3>
<!-- /wp:heading -->

<!-- wp:gallery {"ids":[4473],"linkTo":"none"} -->
<figure class="wp-block-gallery columns-1 is-cropped"><ul class="blocks-gallery-grid"><li class="blocks-gallery-item"><figure><img src="https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/wp-content/uploads/2021/02/Duenndarmileus-1.jpg" alt="Sonographie-Befund Dünndarmileus mit Erweiterung der Darmschlinge" class="wp-image-4473"/><figcaption class="blocks-gallery-item__caption">Dünndarmileus mit Erweiterung der Darmschlinge</figcaption></figure></li></ul></figure>
<!-- /wp:gallery -->

<!-- wp:heading {"level":3} -->
<h3>Processus uncinatus</h3>
<!-- /wp:heading -->

<!-- wp:gallery {"ids":[4464,4468],"linkTo":"none"} -->
<figure class="wp-block-gallery columns-2 is-cropped"><ul class="blocks-gallery-grid"><li class="blocks-gallery-item"><figure><img src="https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/wp-content/uploads/2021/02/Processus-uncinatus-1.jpg" alt="Sonographie Processus uncinatus" class="wp-image-4464"/><figcaption class="blocks-gallery-item__caption">Processus uncinatus</figcaption></figure></li><li class="blocks-gallery-item"><figure><img src="https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/wp-content/uploads/2021/02/Processus-uncinatus-2-1024x723.jpg" alt="Sonographie Pankreasregion mit Gefäßen" class="wp-image-4468"/><figcaption class="blocks-gallery-item__caption">Pankreasregion mit Gefäßen</figcaption></figure></li></ul></figure>
<!-- /wp:gallery -->

<!-- wp:heading {"level":3} -->
<h3>Prostataadenom</h3>
<!-- /wp:heading -->

<!-- wp:gallery {"ids":[4487,4483],"linkTo":"none"} -->
<figure class="wp-block-gallery columns-2 is-cropped"><ul class="blocks-gallery-grid"><li class="blocks-gallery-item"><figure><img src="https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/wp-content/uploads/2021/02/Prostata-Adenom-3-1024x720.jpg" alt="Sonographie Prostataadenom Ansicht 1" class="wp-image-4487"/></figure></li><li class="blocks-gallery-item"><figure><img src="https://gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604.local/wp-content/uploads/2021/02/Prostata-Adenom-2-1024x725.jpg" alt="Sonographie Prostataadenom Ansicht 2" class="wp-image-4483"/></figure></li></ul></figure>
<!-- /wp:gallery -->

<!-- wp:paragraph {"className":"pxz-footnote"} -->
<p class="pxz-footnote"><em>Hinweis: Alle gezeigten Befundbilder sind patienten-anonymisiert. Die Aufnahmen enthalten keine personenbezogenen Daten und dienen ausschließlich der medizinischen Veranschaulichung.</em></p>
<!-- /wp:paragraph -->
HTML;
}

function content_belastungs_ekg() {
    return <<<HTML
<!-- wp:heading -->
<h2>Ergometrie</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Ergometrie kann Hinweise auf Verkalkungen der Herzkranzgefäße liefern. Unser Herz schlägt in Ruhe etwa 60-mal pro Minute und muss sich dabei zusammenziehen und wieder ausdehnen. Nur während der Ausdehnung wird es selbst mit Blut und Sauerstoff versorgt — die herzeigenen Versorgungsgefäße werden während des Zusammenziehens abgedrückt.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Bei Verkalkungen ist die Durchblutung der Innenschichten des Herzmuskels eingeschränkt, weil durch den reduzierten Durchmesser weniger Blut pro Zeit durchfließen kann. In Ruhe mag das nicht weiter stören; unter Belastung steigt der Puls, die Erholungszeit zwischen den Schlägen sinkt — und damit die Zeit für die Sauerstoffversorgung.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Wann wir ein Belastungs-EKG einsetzen</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Wir führen das Belastungs-EKG bei Verdacht auf koronare Herzkrankheit ein, zur Abklärung unklarer Thoraxbeschwerden unter Belastung und zur Einschätzung des kardiovaskulären Risikos — etwa vor geplanter sportlicher Belastung oder bei Wiederaufnahme körperlicher Aktivität nach längerer Pause.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Ablauf</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Sie treten auf einem Fahrrad-Ergometer in die Pedale. Die Belastungsstufe steigt alle zwei Minuten; währenddessen zeichnen wir Ihr EKG auf und messen wiederholt den Blutdruck. Die Untersuchung dauert rund 20 Minuten, wird bei Erreichen der Zielherzfrequenz oder bei Beschwerden beendet. Treten im EKG typische Veränderungen auf, werten wir das als Hinweis auf eine Minderdurchblutung.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Verwandte Untersuchungen</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Das Belastungs-EKG ist fester Bestandteil unseres <a href="/check-ups/cardio-check-up/">Cardio-Check-Ups</a>, kombiniert mit Echokardiographie und Lungenfunktion.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_lungenfunktion() {
    return <<<HTML
<!-- wp:heading -->
<h2>Spirometrie</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Lunge ist ein sehr leistungsfähiges Organ. Sie versorgt den Körper mit Sauerstoff und transportiert das beim Stoffwechsel entstehende Kohlendioxid mit der Ausatemluft ab. Mit jedem Atemzug ziehen wir etwa 0,5 Liter Luft ein — das sind rund 10 Liter pro Minute, 14.400 Liter am Tag. Damit ist die Lunge das Organ, das am stärksten von allen Organen Schadstoffen direkt ausgesetzt ist.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Angeborene Störungen, chronische Entzündungen und Schadstoffbelastungen können die Lungenfunktion beeinträchtigen. Die Spirometrie misst statische und dynamische Lungenvolumina sowie Atemstromstärken und macht solche Veränderungen sichtbar.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Was wir mit der Lungenfunktion abklären</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li>Verengung der Bronchien — Asthma bronchiale, chronisch obstruktive Lungenerkrankung (COPD)</li><li>Einschätzung des Schweregrads einer Obstruktion</li><li>Verlaufsbeurteilung und Therapiekontrolle bei bereits bekannter Erkrankung</li><li>Abklärung eines chronischen Hustens</li><li>Früherkennung von Schäden durch inhalative Noxen (z. B. Rauchgasbelastung)</li><li>Arbeitsmedizinische Fragestellungen und Präoperative Diagnostik</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Ablauf</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Sie bekommen eine Nasenklammer aufgesetzt, damit die Messung ausschließlich über den Mund erfolgt. Dann umschließen Sie das Mundstück mit den Lippen und atmen nach Anleitung drei Zyklen normal, anschließend dreimal tief und fest ein und aus. Währenddessen zeichnen Strömungs- oder Volumensensoren Ihre Atemflüsse auf. Die Untersuchung dauert rund fünf Minuten.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Verwandte Untersuchungen</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Standardmäßig ist die Lungenfunktion Teil unseres <a href="/check-ups/gesundheits-check-up/">Gesundheits-Check-Ups</a>. Bei Verdacht auf kombinierte kardiopulmonale Erkrankungen kombinieren wir die Spirometrie mit dem <a href="/belastungs-ekg/">Belastungs-EKG</a> und der <a href="/sonographie/">Echokardiographie</a>.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_labor() {
    // Consolidated from archive 296 + 475. Mojibake-clean. 4 H2 sections.
    return <<<HTML
<!-- wp:paragraph -->
<p>Ein großer Teil unserer internistischen Diagnostik stützt sich auf Laborwerte aus Blut, Urin oder Stuhl. Wir nehmen die Proben in der Praxis ab und senden sie je nach Fragestellung an die Laborgemeinschaft oder unser externes Fachlabor (Synlab). Ergebnisse besprechen wir in der Folgekonsultation.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Welche Werte wir bestimmen</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li>Kleines und großes Blutbild (Analyse der Blutzellen, reife/unreife Zellen)</li><li>Nierenfunktionswerte (Kreatinin, Harnstoff, eGFR)</li><li>Leberwerte und Gallenwerte</li><li>Bauchspeicheldrüse (Lipase, Amylase)</li><li>Schilddrüsenwerte (TSH, fT3, fT4, Antikörper bei Bedarf)</li><li>Herzenzyme (hochsensitives Troponin bei Bedarf)</li><li>Entzündungswerte (CRP, BSG, Leukozyten)</li><li>Blutgerinnung (Quick, INR, PTT)</li><li>Fettstoffwechsel — Gesamtcholesterin, HDL, LDL, Triglyzeride</li><li>Elektrolyte (Kalium, Natrium, Kalzium, Magnesium)</li><li>HbA1c (Langzeitzucker) und Nüchternglukose</li><li>Tumormarker als Verlaufsparameter</li><li>Borrelien nach Zeckenbiss, Chlamydien, Darmparasiten</li><li>Milchzucker- und Getreideunverträglichkeit</li><li>Rheumafaktoren und Autoimmun-Antikörper</li><li>Epstein-Barr-Virus (z. B. bei Pfeifferschem Drüsenfieber)</li><li>Antikörper zur Kontrolle des Impfstatus</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Wie die Blutentnahme abläuft</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Blutentnahme ist bei der Diagnostik vieler Erkrankungen ein unverzichtbarer Baustein. Bei Abnahme, Lagerung und Transport ins Labor können jedoch Fehler auftreten, die das Ergebnis so stark beeinflussen, dass eine Interpretation nur eingeschränkt möglich ist. Wir achten auf standardisierte Abläufe: korrekte Abnahmereihenfolge der Röhrchen, sofortiger Transport bei temperatursensitiven Parametern, nüchtern-abgenommene Proben für Stoffwechsel-Werte.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Wenn Sie für einen Termin nüchtern sein sollen, geben wir Ihnen das bei der Terminvergabe ausdrücklich mit. Nüchtern heißt: mindestens 8 Stunden keine Nahrung, keine gezuckerten Getränke — Wasser und ungesüßter Tee sind in Ordnung.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>24-Stunden-Sammelurin und weitere Probenarten</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Für bestimmte Fragestellungen ist Ihre Mithilfe nötig. Beim 24-Stunden-Sammelurin sammeln Sie über einen vollständigen Tag sämtlichen Urin in einem Gefäß, das wir Ihnen in der Praxis ausgeben. Ähnliches gilt für Stuhlproben (z. B. bei Verdacht auf Darmparasiten). Wir erklären den Ablauf vor Ausgabe des Probengefäßes schriftlich und persönlich.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Befundabruf und Besprechung</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die meisten Werte liegen innerhalb von ein bis zwei Werktagen vor. Wir besprechen Ergebnisse in der Folgekonsultation oder — bei unauffälligen Routinebefunden und Ihrem Einverständnis — telefonisch. Auffällige Werte klären wir immer persönlich.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Selbstzahler-Alternative</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Unser Partner Sanexio bietet mit dem <a href="/basic-check/">Basic-Check</a> einen kompakten Selbstzahler-Laborcheck mit 15 Parametern — auch direkt online buchbar, Abnahme bei uns in der Praxis.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_rund_ums_labor_draft_stub() {
    return <<<HTML
<!-- wp:paragraph -->
<p><em>Diese Seite wurde mit <a href="/labor/">/labor/</a> zusammengeführt. Alle Inhalte rund um Blutentnahme, 24-Stunden-Sammelurin und Befundabruf finden Sie dort.</em></p>
<!-- /wp:paragraph -->
HTML;
}

/* ---------------------------------------------------------------------------
 * Migration runner
 * ------------------------------------------------------------------------ */

function step_header( $title ) {
    echo "\n" . str_repeat( '━', 72 ) . "\n";
    echo "  $title\n";
    echo str_repeat( '━', 72 ) . "\n";
}

function log_op( &$stats, $key, $msg ) {
    $stats[ $key ] = ( $stats[ $key ] ?? 0 ) + 1;
    echo "    ✓ $msg\n";
}
function log_skip( &$stats, $msg ) {
    $stats['skipped']++;
    echo "    = $msg (skipped)\n";
}

echo "S2.3-diagnostik migration — " . ( $APPLY ? 'APPLY MODE' : 'DRY-RUN (set APPLY=1 to write)' ) . "\n";
echo "INCLUDE_SONO_ATLAS=" . ( $INCLUDE_SONO_ATLAS === '' ? '(unset — atlas SKIPPED, R-7 pending)' : $INCLUDE_SONO_ATLAS ) . "\n";

/* Step 1: INSERT /diagnostik/ hub page */
step_header( 'Step 1 — INSERT /diagnostik/ (Top-Hub)' );
$res = ensure_page( $mysqli, $APPLY, 'diagnostik', 'Diagnostik', content_diagnostik_hub(), 'template-diagnostik-hub.php' );
if ( $res['created'] ) { log_op( $stats, 'created', "/diagnostik/ created (id=" . $res['id'] . ")" ); }
else {
    if ( $res['content_changed'] || $res['meta_changed'] ) {
        log_op( $stats, 'updated', "/diagnostik/ refreshed (id=" . $res['id'] . ")" );
    } else {
        log_skip( $stats, "/diagnostik/ already correct (id=" . $res['id'] . ")" );
    }
}
if ( $res['id'] > 0 ) {
    $w = upsert_wpml_de( $mysqli, $APPLY, $res['id'] );
    if ( $w['changed'] ) { $stats['wpml_inserts']++; echo "    ✓ WPML-DE registered\n"; }
    else { echo "    = WPML-DE already present\n"; }
}

/* Step 2: UPDATE 277 → /sonographie/ as sub-hub */
step_header( 'Step 2 — UPDATE 277: /ultraschalldiagnostik/ → /sonographie/ (Sub-Hub)' );
$changes = 0;
$r = update_post_field( $mysqli, $APPLY, 277, 'post_name',    'sonographie' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 277, 'post_title',   'Sonographie' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 277, 'post_content', content_sonographie_subhub() ); if ( $r['changed'] ) $changes++;
$r = set_post_meta( $mysqli, $APPLY, 277, '_wp_page_template', 'template-diagnostik-hub.php' ); if ( $r['changed'] ) $changes++;
$r = set_old_slug( $mysqli, $APPLY, 277, 'ultraschalldiagnostik' ); if ( $r['changed'] ) $changes++;
if ( $changes > 0 ) log_op( $stats, 'updated', "277 → /sonographie/ ($changes changes)" );
else log_skip( $stats, "277 already at /sonographie/" );

/* Step 3: UPDATE 357 → /sonographie/schilddruese/ (nested) */
step_header( 'Step 3 — UPDATE 357: /schilddruesen-sonographie/ → /sonographie/schilddruese/' );
$changes = 0;
$r = update_post_field( $mysqli, $APPLY, 357, 'post_name',   'schilddruese' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 357, 'post_title',  'Schilddrüsen-Sonographie' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 357, 'post_parent', '277' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 357, 'post_content', content_sono_schilddruese() ); if ( $r['changed'] ) $changes++;
$r = set_old_slug( $mysqli, $APPLY, 357, 'schilddruesen-sonographie' ); if ( $r['changed'] ) $changes++;
if ( $changes > 0 ) log_op( $stats, 'updated', "357 → /sonographie/schilddruese/ ($changes changes)" );
else log_skip( $stats, "357 already nested" );

/* Step 4: UPDATE 360 → /sonographie/beingefaesse/ */
step_header( 'Step 4 — UPDATE 360: /ultraschall-der-beingefaesse/ → /sonographie/beingefaesse/' );
$changes = 0;
$r = update_post_field( $mysqli, $APPLY, 360, 'post_name',   'beingefaesse' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 360, 'post_title',  'Gefäß-Sonographie der Beine' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 360, 'post_parent', '277' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 360, 'post_content', content_sono_beingefaesse() ); if ( $r['changed'] ) $changes++;
$r = set_old_slug( $mysqli, $APPLY, 360, 'ultraschall-der-beingefaesse' ); if ( $r['changed'] ) $changes++;
if ( $changes > 0 ) log_op( $stats, 'updated', "360 → /sonographie/beingefaesse/ ($changes changes)" );
else log_skip( $stats, "360 already nested" );

/* Step 5: UPDATE 4206 → /sonographie/atlas/ (R-7 GATED) */
step_header( 'Step 5 — UPDATE 4206: /sono-atlas/ → /sonographie/atlas/ (R-7 gated)' );
if ( $INCLUDE_SONO_ATLAS === '' ) {
    echo "    ⏸  R-7 pending: Dr. Stracke has not yet confirmed atlas handling.\n";
    echo "       Atlas stays at current slug/status. Set INCLUDE_SONO_ATLAS=1 (publish)\n";
    echo "       or INCLUDE_SONO_ATLAS=draft (URL exists but hidden) to migrate.\n";
    $stats['skipped']++;
    $stats['sonoatlas'] = 'skipped (R-7)';
} else {
    $target_status = ( $INCLUDE_SONO_ATLAS === 'draft' ) ? 'draft' : 'publish';
    $changes = 0;
    $r = update_post_field( $mysqli, $APPLY, 4206, 'post_name',    'atlas' ); if ( $r['changed'] ) $changes++;
    $r = update_post_field( $mysqli, $APPLY, 4206, 'post_title',   'Sonographie-Befundatlas' ); if ( $r['changed'] ) $changes++;
    $r = update_post_field( $mysqli, $APPLY, 4206, 'post_parent',  '277' ); if ( $r['changed'] ) $changes++;
    $r = update_post_field( $mysqli, $APPLY, 4206, 'post_status',  $target_status ); if ( $r['changed'] ) $changes++;
    $r = update_post_field( $mysqli, $APPLY, 4206, 'post_content', content_sono_atlas() ); if ( $r['changed'] ) $changes++;
    $r = set_old_slug( $mysqli, $APPLY, 4206, 'sono-atlas' ); if ( $r['changed'] ) $changes++;
    if ( $changes > 0 ) { log_op( $stats, 'updated', "4206 → /sonographie/atlas/ (status=$target_status, $changes changes)" ); }
    else { log_skip( $stats, "4206 already at /sonographie/atlas/ (status=$target_status)" ); }
    $stats['sonoatlas'] = "migrated (status=$target_status)";
}

/* Step 6: DELETE 4297 (Shell-Dublette) */
step_header( 'Step 6 — DELETE 4297 (Shell-Dublette, 0 Content)' );
$ex = fetch_row( $mysqli, "SELECT ID FROM wp_posts WHERE ID=4297" );
if ( $ex ) {
    if ( $APPLY ) {
        mxq( $mysqli, "DELETE FROM wp_postmeta WHERE post_id=4297" );
        mxq( $mysqli, "DELETE FROM wp_icl_translations WHERE element_id=4297 AND element_type='post_page'" );
        mxq( $mysqli, "DELETE FROM wp_posts WHERE ID=4297" );
    }
    log_op( $stats, 'deleted', "4297 removed (posts + postmeta + wpml)" );
} else {
    log_skip( $stats, "4297 already gone" );
}

/* Step 7: UPDATE 289 content only */
step_header( 'Step 7 — UPDATE 289 /belastungs-ekg/ (content only)' );
$r = update_post_field( $mysqli, $APPLY, 289, 'post_content', content_belastungs_ekg() );
if ( $r['changed'] ) log_op( $stats, 'updated', "289 content refreshed" );
else log_skip( $stats, "289 content already current" );

/* Step 8: UPDATE 292 content only */
step_header( 'Step 8 — UPDATE 292 /lungenfunktion/ (content only)' );
$r = update_post_field( $mysqli, $APPLY, 292, 'post_content', content_lungenfunktion() );
if ( $r['changed'] ) log_op( $stats, 'updated', "292 content refreshed" );
else log_skip( $stats, "292 content already current" );

/* Step 9: UPDATE 296 → /labor/ (slug + consolidated content from 296+475) */
step_header( 'Step 9 — UPDATE 296: /labordiagnostik/ → /labor/ (Slug + Merge with 475)' );
$changes = 0;
$r = update_post_field( $mysqli, $APPLY, 296, 'post_name',    'labor' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 296, 'post_title',   'Labor' ); if ( $r['changed'] ) $changes++;
$r = update_post_field( $mysqli, $APPLY, 296, 'post_content', content_labor() ); if ( $r['changed'] ) $changes++;
$r = set_old_slug( $mysqli, $APPLY, 296, 'labordiagnostik' ); if ( $r['changed'] ) $changes++;
if ( $changes > 0 ) log_op( $stats, 'updated', "296 → /labor/ ($changes changes, includes 475 merge)" );
else log_skip( $stats, "296 already at /labor/" );

/* Step 10: UPDATE 475 → draft (stub) */
step_header( 'Step 10 — UPDATE 475 /rund-ums-labor/ → draft (content fused into /labor/)' );
$cur = fetch_row( $mysqli, "SELECT post_status FROM wp_posts WHERE ID=475" );
if ( $cur && $cur['post_status'] === 'draft' ) {
    log_skip( $stats, "475 already draft" );
} else {
    $r = update_post_field( $mysqli, $APPLY, 475, 'post_status', 'draft' );
    update_post_field( $mysqli, $APPLY, 475, 'post_content', content_rund_ums_labor_draft_stub() );
    log_op( $stats, 'drafted', "475 → draft (stub content pointing to /labor/)" );
}

/* Step 11: Flush rewrite rules (so nested URLs resolve) */
step_header( 'Step 11 — Flush rewrite rules' );
if ( $APPLY ) {
    mxq( $mysqli, "DELETE FROM wp_options WHERE option_name = 'rewrite_rules'" );
    echo "    ✓ wp_options.rewrite_rules deleted — WP will regenerate on next request\n";
} else {
    echo "    (dry-run) would delete wp_options.rewrite_rules\n";
}

/* Summary */
step_header( 'Summary' );
printf( "    created=%d updated=%d deleted=%d drafted=%d skipped=%d meta_updates=%d wpml_inserts=%d\n",
    $stats['created'], $stats['updated'], $stats['deleted'], $stats['drafted'], $stats['skipped'],
    $stats['meta_updates'], $stats['wpml_inserts'] );
echo "    sonoatlas: " . $stats['sonoatlas'] . "\n";
echo "\n" . ( $APPLY ? "WROTE TO DATABASE. Run curl-matrix + verify.sh next (T10)." : "DRY-RUN COMPLETE. Review then re-run with APPLY=1." ) . "\n";
