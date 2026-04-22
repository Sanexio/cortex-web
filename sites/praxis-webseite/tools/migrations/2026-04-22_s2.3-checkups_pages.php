<?php
/**
 * S2.3-checkups — Cluster checkups Content-Migration (Session 18, 2026-04-22).
 *
 * Updates 5 existing publish pages in Local-WP:
 *   461  /check-ups/             → template-checkup-hub.php
 *   272  /gesundheits-check-up/  → template-standard.php  (+ hero-img + xbrand CTA)
 *   336  /cardio-check-up/       → template-standard.php  (+ hero-img + xbrand CTA)
 *   339  /angio-check-up/        → template-standard.php  (+ hero-img + xbrand CTA)
 *   348  /tumorscreening/        → template-standard.php  (no hero, no xbrand CTA)
 *
 * Page 9668 /basic-check/ is intentionally NOT touched here — it is rendered by
 * the Cortex-Web WP-Adapter against trunk/content/products/bluttests/basic-check.yaml
 * (sync-wp.sh). That adapter does NOT set _wp_page_template — so we set it for
 * 9668 in this script as well, but content/title/excerpt come from the adapter.
 *
 * Idempotent: re-running compares each value to the current DB state and only
 * writes when it would change. Output ends with a summary "changed=N skipped=M".
 *
 * Pre-snapshot: take a mysqldump BEFORE running this script (rollback evidence).
 *
 * Usage:
 *   /usr/local/bin/php sites/praxis-webseite/tools/migrations/2026-04-22_s2.3-checkups_pages.php
 *
 * Or via Local's bundled PHP (recommended on Cluster-Mini-02).
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

$DOCTOLIB_URL = 'https://www.doctolib.de/internist-und-allgemeinmediziner/frankfurt-am-main/dr-stracke';

/* ---------------------------------------------------------------------------
 * Content blocks per page (modernized 1:1 from _content-archive/checkups/de/).
 * Tippfehler korrigiert, Großschreibung normalisiert, Doppeltexte in
 * gesundheits-check-up durch Verlinkung ersetzt.
 * ------------------------------------------------------------------------ */

function content_check_ups() {
    return <<<HTML
<!-- wp:paragraph -->
<p>Vorbeugen ist besser als Heilen — diesen berühmt gewordenen Satz des Arztes Christoph Wilhelm Hufeland (1762–1836) kennen sicher alle. Er macht deutlich, dass die Prävention ein wichtiger Baustein der Medizin ist. Bei uns in der Praxis legt das gesamte Team besonderen Wert auf die Gesundheitsvorsorge.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Auch für die Krankenkassen ist die Gesundheitsvorsorge ein wichtiges Thema. Sie bieten zur Früherkennung von Diabetes, Herzproblemen oder Nierenerkrankungen eine gesetzliche Gesundheitsuntersuchung an, in der Risiken und Vorbelastungen abgefragt werden. Die Inhalte unterscheiden sich je nach Altersgruppe.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Gesetzlicher Check-Up 18 – 34 Jahre</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In diesem Lebensabschnitt übernimmt die Krankenkasse einmalig die Kosten für eine vorsorgende Gesundheitsuntersuchung. Sie umfasst:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>Anamnese und Familienanamnese</li><li>Kontrolle des Impfstatus</li><li>Körperliche Untersuchung</li><li>Blutdruckkontrolle</li><li>Bei positiver Familienanamnese, Übergewicht oder Bluthochdruck: Kontrolle der Blutfettwerte und des Blutzuckers</li></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3>Gesetzlicher Check-Up ab 35 Jahren</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Ab 35 Jahren übernimmt die Krankenkasse alle drei Jahre die Kosten für eine Gesundheitsuntersuchung. Sie umfasst zusätzlich:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>Blutabnahme: Cholesterinwerte und Blutzucker</li><li>Urinkontrolle</li></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3>Erweiterte Check-Ups für Privatpatienten und Selbstzahler</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Unabhängig von der gesetzlichen Vorsorgeuntersuchung bieten wir umfassendere Check-Up-Programme an. Sie kombinieren ein erweitertes Laborprofil mit Ultraschall- und Funktionsuntersuchungen und decken Bereiche ab, für die sonst mehrere Fachärzte aufgesucht werden müssten. Welcher Check zu Ihnen passt, sehen Sie im Überblick weiter unten — wir beraten Sie gerne individuell.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_gesundheits_check_up() {
    return <<<HTML
<!-- wp:paragraph -->
<p>Mit unserem Gesundheits-Check-Up stellen wir Sie an einem Tag komplett auf den Kopf. Sie durchlaufen während des Check-Ups verschiedene Untersuchungs-Blöcke, die auch separat in Anspruch genommen werden können.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Hierbei decken wir ein Untersuchungsspektrum ab, für das Sie sonst mehrere Ärzte an verschiedenen Orten aufsuchen müssten. Da wir in Frankfurt bestens vernetzt sind, können wir bei Bedarf weiterführende Termine bei unseren Fachkollegen organisieren.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Je nach Risikoprofil dauert ein kompletter Check-Up zwischen zwei und drei Stunden. Wir setzen zwei Schwerpunkte: Ihr persönliches Tumor-Risiko und Ihre kardiovaskulären Risikofaktoren.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Ablauf eines Check-Ups</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Wir beginnen mit einem ausführlichen Gespräch zu Ihrer medizinischen Vorgeschichte. Auf dieser Basis planen wir die weiteren Untersuchungen. Empfehlung: Bis zwei Tage vor dem Check-Up zur Blutentnahme vorbeikommen, damit die Laborwerte vorliegen. Eine Blutentnahme am Tag des Checks ist ebenfalls möglich; auffällige Werte besprechen wir dann telefonisch nach.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Im Anschluss durchlaufen Sie die Untersuchungs-Blöcke — einzeln oder als Gesamtpaket.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Kardio-Block — Herz-Kreislaufsystem</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Echokardiografie, Belastungs-EKG und Lungenfunktion zur Abklärung struktureller Herzerkrankungen und der koronaren Durchblutung. <a href="/cardio-check-up/">Mehr zum Cardio-Check-Up &rarr;</a></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Angio-Block — Gefäßsystem</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Carotis-Duplex, Bauchaorten-Screening, Knöchel-Arm-Index und Bein-Duplex zur Schlaganfall- und PAVK-Vorsorge. <a href="/angio-check-up/">Mehr zum Angio-Check-Up &rarr;</a></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Gastro-Block — Bauchorgane</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Sonografie von Leber, Gallensystem, Bauchspeicheldrüse, Milz und (bei Beschwerden) Darm. Insbesondere die Leber als zentrales Stoffwechselorgan profitiert von einer frühzeitigen Bildgebung — eine beginnende Fettleber lässt sich im Ultraschall gut erkennen.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Nephro-Block — Urogenitalsystem</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Sonografie der Nieren und Harnblase sowie — beim Mann — der Prostata. Die Nieren übernehmen Entgiftung und Steuerung des Flüssigkeits- und Salzhaushaltes; strukturelle Veränderungen können hier früh erkannt werden. Bei der Prostata kombinieren wir den Ultraschall mit der PSA-Wert-Bestimmung.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Über die genauen Gebühren der einzelnen Leistungen informieren wir Sie gerne in der Praxis.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_cardio_check_up() {
    return <<<HTML
<!-- wp:paragraph -->
<p>Mit unserem Cardio-Check-Up erstellen wir eine ausführliche Analyse Ihres persönlichen kardiovaskulären Risikos und erarbeiten anschließend mit Ihnen Präventionsstrategien zur Vermeidung von Herzinfarkten.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Nach einem ausführlichen Erstgespräch durchlaufen Sie eine Reihe von Untersuchungen: körperliche Untersuchung mit Blutentnahme, Echokardiografie, Belastungs-EKG (Ergometrie) und abschließend eine Spirometrie (Lungenfunktion). Planen Sie dafür rund zwei Stunden ein.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Im Vordergrund steht die Abklärung des Risikos für strukturelle Herzerkrankungen. Beispiele: koronare Herzkrankheit, Veränderungen an den Herzklappen oder Auswirkungen eines Bluthochdrucks am Herz.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Echokardiografie</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Echokardiografie (Herzultraschall) beschreibt Funktion und Struktur des Herzens. Wir beurteilen die Pumpfunktion des linken und rechten Herzens, prüfen auf Wandbewegungsstörungen und beurteilen die Herzklappen auf Verengungen und Schlussunfähigkeiten. Bei Auffälligkeiten ergänzen wir weiterführende Ultraschall-Untersuchungen.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Ergometrie mit Lungenfunktion</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Da der Herzultraschall nur indirekte Zeichen einer koronaren Gefäßerkrankung zeigt, ergänzen wir das Belastungs-EKG. Bei ausreichender Belastung können sich Zeichen einer Minderdurchblutung des Herzmuskels demarkieren. Im Anschluss komplettieren wir die Diagnostik mit einer Lungenfunktionsmessung.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Über die genauen Gebühren der einzelnen Leistungen informieren wir Sie gerne in der Praxis.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_angio_check_up() {
    return <<<HTML
<!-- wp:paragraph -->
<p>Unsere Gefäße versorgen alle Organe mit Nährstoffen und Energie. Schädigungen an den Gefäßen ziehen meist auch Schädigungen von Organen nach sich. Mit unserem Gefäß-Screening erhalten Sie einen aktuellen Status Ihres Gefäßsystems.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Carotis-Duplex</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Eine der häufigsten Ursachen eines Schlaganfalls ist eine Verkalkung der Halsschlagader. Wir beurteilen die Halsgefäße auf Plaques und Verkalkungen. Bei auffälligen Befunden können wir mit medikamentöser Therapie und vorbeugenden Maßnahmen ein Fortschreiten der Erkrankung bremsen und einem Hirninfarkt vorbeugen.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Bauchaorten-Screening</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die Bauchschlagader hält im Verlauf des Lebens viel Druck aus. Bei ausgeprägten kardiovaskulären Risikofaktoren nimmt sie schneller Schaden — sichtbar als Verkalkungen oder Erweiterungen bis hin zu einem behandlungsbedürftigen Aneurysma. Diese Veränderungen bleiben oft unbemerkt; ein Ultraschall der Aorta ist die einfache Vorsorge.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>ABI — Knöchel-Arm-Index</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Die sogenannte Schaufensterkrankheit (PAVK) beruht auf einer Verkalkung der Beinarterien. Eine Messung der Blutdruckwerte an Armen und Beinen liefert einen ersten Hinweis. Bei auffälligem Befund veranlassen wir weiterführende Untersuchungen.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Duplex der Beingefäße</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Mit dem Bein-Duplex verfolgen wir einzelne Gefäße entlang ihres Verlaufs durch das Becken bis in die Unterschenkel und prüfen sie auf relevante Verkalkungen oder Engstellen. Bei klinisch auffälligen Befunden erfolgt die Überweisung an einen Angiologen, ggf. zur Aufdehnung mit Ballon und Stentimplantation.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Über die genauen Gebühren der einzelnen Leistungen informieren wir Sie gerne in der Praxis.</p>
<!-- /wp:paragraph -->
HTML;
}

function content_tumorscreening() {
    return <<<HTML
<!-- wp:paragraph -->
<p>Es gibt — ähnlich der Vorsorge für Herz-Kreislauf- und Gefäßerkrankungen — präventive Maßnahmen zur Vorbeugung vieler Tumorerkrankungen. Trotzdem liegt es häufig am Schicksal, ob jemand an Krebs erkrankt. Umso wichtiger ist eine frühzeitige Diagnose: viele Krebserkrankungen sind im frühen Stadium heilbar.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Für Frauen und Männer gibt es ein gesetzliches Vorsorgeprogramm mit Hautkrebs- und Darmkrebsscreening sowie gynäkologischen bzw. urologischen Vorsorgeuntersuchungen. Damit ist allerdings nur ein Teil möglicher Vorsorgen abgedeckt. Screenings auf Schilddrüsen- oder Nierenzellkarzinome zählen zum Beispiel nicht zur allgemeinen Tumorvorsorge.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Unser erweitertes Tumor-Vorsorgeprogramm besteht im Wesentlichen aus Ultraschalluntersuchungen der Schilddrüse sowie der inneren Organe. In unserem Sono-Atlas finden Sie Beispiele für Erkrankungen, die teilweise erst zufällig im Ultraschall entdeckt worden sind.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Über die genauen Gebühren der einzelnen Leistungen informieren wir Sie gerne in der Praxis.</p>
<!-- /wp:paragraph -->
HTML;
}

/* ---------------------------------------------------------------------------
 * Page configuration matrix
 * ------------------------------------------------------------------------ */

$pages = [
    [
        'id'       => 461,
        'slug'     => 'check-ups',
        'title'    => 'Check-Up-Programme',
        'template' => 'template-checkup-hub.php',
        'content'  => content_check_ups(),
        'meta'     => [
            'pxz_hub_eyebrow' => 'Vorsorge',
            'pxz_hub_h1'      => 'Unsere Check-Up-Programme',
            'pxz_hub_sub'     => 'Welcher Check passt zu Ihrer Lebenssituation? Ein Überblick über die gesetzliche Vorsorge und unsere erweiterten Selbstzahler-Programme.',
        ],
    ],
    [
        'id'       => 272,
        'slug'     => 'gesundheits-check-up',
        'title'    => 'Gesundheits-Check-Up',
        'template' => 'template-standard.php',
        'content'  => content_gesundheits_check_up(),
        'meta'     => [
            'pxz_standard_eyebrow'           => 'Check-Up-Programm',
            'pxz_standard_h1'                => 'Gesundheits-Check-Up',
            'pxz_standard_sub'               => 'Eine umfassende Risikoanalyse an einem Tag — vier Untersuchungs-Blöcke, eine Praxis.',
            'pxz_standard_hero_image_id'     => '4152',
            'pxz_standard_hero_image_alt'    => 'Gefäßvisualisierung — Gesundheits-Check-Up',
            'pxz_standard_cta_primary_label' => 'Selbstzahler-Bluttest',
            'pxz_standard_cta_primary_url'   => '/basic-check/',
            'pxz_standard_cta_ghost_label'   => 'Termin vereinbaren',
            'pxz_standard_cta_ghost_url'     => $DOCTOLIB_URL,
        ],
    ],
    [
        'id'       => 336,
        'slug'     => 'cardio-check-up',
        'title'    => 'Cardio-Check-Up',
        'template' => 'template-standard.php',
        'content'  => content_cardio_check_up(),
        'meta'     => [
            'pxz_standard_eyebrow'           => 'Check-Up-Programm',
            'pxz_standard_h1'                => 'Cardio-Check-Up',
            'pxz_standard_sub'               => 'Strukturierte Herzvorsorge: Echokardiografie, Belastungs-EKG und Lungenfunktion.',
            'pxz_standard_hero_image_id'     => '3977',
            'pxz_standard_hero_image_alt'    => 'Cardio-Check-Up — Herzdiagnostik',
            'pxz_standard_cta_primary_label' => 'Selbstzahler-Bluttest',
            'pxz_standard_cta_primary_url'   => '/basic-check/',
            'pxz_standard_cta_ghost_label'   => 'Termin vereinbaren',
            'pxz_standard_cta_ghost_url'     => $DOCTOLIB_URL,
        ],
    ],
    [
        'id'       => 339,
        'slug'     => 'angio-check-up',
        'title'    => 'Angio-Check-Up',
        'template' => 'template-standard.php',
        'content'  => content_angio_check_up(),
        'meta'     => [
            'pxz_standard_eyebrow'           => 'Check-Up-Programm',
            'pxz_standard_h1'                => 'Angio-Check-Up',
            'pxz_standard_sub'               => 'Gefäß-Screening zur Schlaganfall- und PAVK-Vorsorge.',
            'pxz_standard_hero_image_id'     => '4124',
            'pxz_standard_hero_image_alt'    => 'Angio-Check-Up — Gefäßdiagnostik',
            'pxz_standard_cta_primary_label' => 'Selbstzahler-Bluttest',
            'pxz_standard_cta_primary_url'   => '/basic-check/',
            'pxz_standard_cta_ghost_label'   => 'Termin vereinbaren',
            'pxz_standard_cta_ghost_url'     => $DOCTOLIB_URL,
        ],
    ],
    [
        'id'       => 348,
        'slug'     => 'tumorscreening',
        'title'    => 'Tumor-Screening',
        'template' => 'template-standard.php',
        'content'  => content_tumorscreening(),
        'meta'     => [
            'pxz_standard_eyebrow'           => 'Erweiterte Vorsorge',
            'pxz_standard_h1'                => 'Tumor-Screening',
            'pxz_standard_sub'               => 'Erweitertes Krebs-Vorsorgeprogramm mit Sonografie der Schilddrüse und der inneren Organe.',
            'pxz_standard_cta_primary_label' => 'Termin vereinbaren',
            'pxz_standard_cta_primary_url'   => $DOCTOLIB_URL,
        ],
    ],
    // Page 9668 (basic-check) — only set the template; content is owned by the WP-Adapter.
    [
        'id'       => 9668,
        'slug'     => 'basic-check',
        'template' => 'template-bridge-product.php',
        // No 'title', 'content', 'meta' (other than template) — adapter owns them.
        'meta'     => [
            'pxz_bridge_eyebrow' => 'Selbstzahler-Angebot',
            'pxz_bridge_h1'      => 'Basic-Check Laborprofil',
            'pxz_bridge_sub'     => 'Kompakter Laborcheck mit 15 Parametern — auch direkt online über unseren Partner Sanexio buchbar.',
        ],
    ],
];

/* ---------------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------------ */

function get_post_field( mysqli $db, int $id, string $field ) {
    $stmt = $db->prepare( "SELECT $field FROM wp_posts WHERE ID=? LIMIT 1" );
    $stmt->bind_param( 'i', $id );
    $stmt->execute();
    $stmt->bind_result( $val );
    $found = $stmt->fetch();
    $stmt->close();
    return $found ? $val : null;
}

function get_post_meta_value( mysqli $db, int $id, string $key ) {
    $stmt = $db->prepare( "SELECT meta_value FROM wp_postmeta WHERE post_id=? AND meta_key=? LIMIT 1" );
    $stmt->bind_param( 'is', $id, $key );
    $stmt->execute();
    $stmt->bind_result( $val );
    $found = $stmt->fetch();
    $stmt->close();
    return $found ? $val : null;
}

function upsert_post_meta( mysqli $db, int $id, string $key, string $value, array &$counters ) {
    $current = get_post_meta_value( $db, $id, $key );
    if ( $current === $value ) {
        $counters['skipped']++;
        return;
    }
    if ( $current === null ) {
        $stmt = $db->prepare( "INSERT INTO wp_postmeta (post_id, meta_key, meta_value) VALUES (?,?,?)" );
        $stmt->bind_param( 'iss', $id, $key, $value );
        $stmt->execute();
        $stmt->close();
        $counters['inserted']++;
    } else {
        $stmt = $db->prepare( "UPDATE wp_postmeta SET meta_value=? WHERE post_id=? AND meta_key=?" );
        $stmt->bind_param( 'sis', $value, $id, $key );
        $stmt->execute();
        $stmt->close();
        $counters['updated']++;
    }
}

function update_post_field( mysqli $db, int $id, string $field, string $value, array &$counters ) {
    $current = get_post_field( $db, $id, $field );
    if ( $current === $value ) {
        $counters['skipped']++;
        return;
    }
    $stmt = $db->prepare( "UPDATE wp_posts SET $field=?, post_modified=NOW(), post_modified_gmt=UTC_TIMESTAMP() WHERE ID=?" );
    $stmt->bind_param( 'si', $value, $id );
    $stmt->execute();
    $stmt->close();
    $counters['updated']++;
}

/* ---------------------------------------------------------------------------
 * Apply
 * ------------------------------------------------------------------------ */

$counters = [ 'inserted' => 0, 'updated' => 0, 'skipped' => 0 ];

foreach ( $pages as $p ) {
    $id  = (int) $p['id'];
    $tag = "id=$id slug={$p['slug']}";

    // Verify page exists.
    $exists = get_post_field( $mysqli, $id, 'ID' );
    if ( $exists === null ) {
        echo "MISSING $tag — skipped\n";
        continue;
    }

    // Title (only when set in config — adapter owns 9668 title).
    if ( isset( $p['title'] ) ) {
        update_post_field( $mysqli, $id, 'post_title', $p['title'], $counters );
    }
    // Content (same caveat).
    if ( isset( $p['content'] ) ) {
        update_post_field( $mysqli, $id, 'post_content', $p['content'], $counters );
    }
    // Template meta.
    upsert_post_meta( $mysqli, $id, '_wp_page_template', $p['template'], $counters );

    // Other pxz_* meta.
    foreach ( $p['meta'] as $k => $v ) {
        upsert_post_meta( $mysqli, $id, $k, (string) $v, $counters );
    }

    echo "DONE    $tag template={$p['template']}\n";
}

echo "\nSummary: inserted={$counters['inserted']}  updated={$counters['updated']}  skipped={$counters['skipped']}\n";

$mysqli->close();
