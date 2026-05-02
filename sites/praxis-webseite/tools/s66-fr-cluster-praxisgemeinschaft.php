<?php
/**
 * S66 — FR-Cluster „Praxisgemeinschaft"
 *
 * Inserts FR-translations for 12 pages of the Praxisgemeinschaft cluster
 * via direct WP-API. Bridges WPML so $sitepress sees them as proper
 * translations (same trid, language_code='fr', source='de').
 *
 * Idempotent: skips pages that already have an FR-translation.
 *
 * Usage:
 *   php s66-fr-cluster-praxisgemeinschaft.php          # dry-run (show plan)
 *   php s66-fr-cluster-praxisgemeinschaft.php --commit # actually insert
 *
 * Templates classified (mirrors S65 structure):
 *  - Self-render (10 pages, post_content ignored): praxis, team, unsere-partner,
 *    7 doctor pages — copy template, blank content, identical slug.
 *  - Standard-template (2 pages, content + postmeta translated): standorte,
 *    zweigpraxis-bockenheimer.
 *
 * Doctor page titles stay invariant (identifiers, rendered from team-data.php).
 *
 * Glossary compliance (LL-058 / Memory project_praxis_rechtsform_praxisgemeinschaft):
 *   FR: "cabinet médical en communauté de pratique" (NOT "cabinet de groupe").
 */

define( 'WP_USE_THEMES', false );
$wp_load = '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-load.php';
require $wp_load;

global $wpdb;

$commit = in_array( '--commit', $argv ?? [], true );
echo "MODE: " . ( $commit ? "COMMIT" : "DRY-RUN (use --commit to apply)" ) . "\n\n";

// ---------- Translations dictionary ----------------------------------------
// Format: [ de_id => [ slug, fr_title, post_content_fr, postmeta_fr ] ]
// post_content_fr = '' means "self-render template; content ignored"
// postmeta_fr is merged into copy from DE postmeta (overrides on key match)

$pages = [

    // ----- Self-render templates (10 pages) -----
    9671 => [ 'slug' => 'praxis',                    'fr_title' => 'Cabinet médical en communauté de pratique', 'content_fr' => '', 'meta_fr' => [] ],
    9672 => [ 'slug' => 'team',                      'fr_title' => 'Notre équipe',                              'content_fr' => '', 'meta_fr' => [] ],
    9887 => [ 'slug' => 'unsere-partner',            'fr_title' => 'Nos partenaires',                           'content_fr' => '', 'meta_fr' => [] ],
    // Doctor pages — title invariant (identifier rendered from team-data.php)
    9675 => [ 'slug' => 'docteur-saul',  'fr_title' => 'Docteur en méd. Sonja Saul', 'content_fr' => '', 'meta_fr' => [] ],
    9681 => [ 'slug' => 'dr-arbitmann',  'fr_title' => 'Anna Arbitmann',             'content_fr' => '', 'meta_fr' => [] ],
    9676 => [ 'slug' => 'dr-barcsay',    'fr_title' => 'Dr. Fabian Barcsay',         'content_fr' => '', 'meta_fr' => [] ],
    9678 => [ 'slug' => 'dr-jawich',     'fr_title' => 'Dr. Issa Jawich',            'content_fr' => '', 'meta_fr' => [] ],
    9680 => [ 'slug' => 'dr-landeberg',  'fr_title' => 'Linnea Landeberg',           'content_fr' => '', 'meta_fr' => [] ],
    9677 => [ 'slug' => 'dr-seelig',     'fr_title' => 'Dr. Stefanie Seelig',        'content_fr' => '', 'meta_fr' => [] ],
    9679 => [ 'slug' => 'dr-shahin',     'fr_title' => 'Dr. George Shahin',          'content_fr' => '', 'meta_fr' => [] ],

    // ----- Standard templates (2 pages, content + postmeta translated) -----
    9691 => [
        'slug'       => 'standorte',
        'fr_title'   => 'Nos cabinets',
        'content_fr' => <<<'HTML'
<!-- wp:paragraph -->
<p>Le Praxiszentrum Dr. Stracke &amp; Kollegen vous accueille sur deux sites dans le Westend de Francfort. L'ensemble du portefeuille médical est disponible sur les deux sites.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Notre cabinet principal au Grüneburgweg 12 dispose de 17 salles de soins et propose l'ensemble du portefeuille de médecine interne, de médecine générale et de soins spécialisés.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>À notre cabinet annexe situé Bockenheimer Landstraße 33, dans l'immeuble Windows chez Eterno, vous bénéficiez du même portefeuille de soins dans un cadre moderne.</p>
<!-- /wp:paragraph -->

<!-- wp:media-text {"mediaId":9798,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-empfang.jpeg" alt="Zone d'accueil du cabinet principal Grüneburgweg" class="wp-image-9798 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Accueil</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Notre équipe vous y accueille. L'accueil est le point de contact central pour l'enregistrement, la prise de rendez-vous et toute demande générale.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9802,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Salle d'attente</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Notre salle d'attente lumineuse offre espace et tranquillité avant votre rendez-vous. Un écran d'information de cabinet et de larges fenêtres donnant sur le Westend créent une atmosphère agréable.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-wartebereich.jpeg" alt="Salle d'attente du cabinet principal Grüneburgweg" class="wp-image-9802 size-full" /></figure></div>
<!-- /wp:media-text -->



<!-- wp:media-text {"mediaPosition":"right","mediaId":9810,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Salle de consultation</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Dans nos salles de consultation, nous menons l'anamnèse, les entretiens de conseil et l'explication des résultats. Nous prenons le temps pour vos questions et discutons des résultats dans le calme.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-sprechzimmer.jpeg" alt="Salle de consultation du cabinet principal Grüneburgweg" class="wp-image-9810 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaId":9814,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-behandlungszimmer.jpeg" alt="Grande salle de soins du cabinet principal" class="wp-image-9814 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Grande salle de soins</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nos grandes salles de soins combinent espace de consultation et zone d'examen. Nous pouvons ainsi associer entretien de conseil et examen clinique dans un cadre protégé.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9818,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Salle d'échographie</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Dans nos salles d'échographie, nous examinons les organes internes, la thyroïde, les vaisseaux et plus encore. Des appareils à haute résolution permettent un diagnostic précis.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-sonographie-1.jpeg" alt="Salle d'examen échographique du cabinet principal" class="wp-image-9818 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaId":9822,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-sonographie-2.jpeg" alt="Deuxième salle d'examen échographique du cabinet principal" class="wp-image-9822 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Deuxième salle d'échographie</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nous disposons de plusieurs postes d'échographie, ce qui permet des examens en parallèle sans temps d'attente.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9826,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Salle d'examens spécialisés</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Une salle dédiée est disponible pour les examens spécialisés tels que les diagnostics fonctionnels et les contrôles de suivi.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-spezial-untersuchung.jpeg" alt="Salle d'examens spécialisés du cabinet principal" class="wp-image-9826 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaId":9830,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-untersuchungsraum.jpeg" alt="Salle d'examen du cabinet principal" class="wp-image-9830 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Salle d'examen</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Les examens de routine tels que la mesure de la tension artérielle, la préparation de l'ECG et les bilans de prévention y sont réalisés.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->



<!-- wp:heading {"level":2} -->
<h2>Accès</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Les deux sites se trouvent dans le Westend de Francfort et sont facilement accessibles en transports en commun (U-Bahn Westend pour le cabinet annexe, U-Bahn Grüneburgweg pour le cabinet principal) ainsi qu'en voiture.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<div class="pxz-map-embed" style="margin:2rem 0;border-radius:12px;overflow:hidden">

</div>
<!-- /wp:html -->
HTML,
        'meta_fr' => [
            'pxz_standard_eyebrow' => 'Nos cabinets',
            'pxz_standard_h1'      => 'Deux adresses. Une seule philosophie.',
            'pxz_standard_sub'     => '',
        ],
    ],

    9693 => [
        'slug'       => 'zweigpraxis-bockenheimer',
        'fr_title'   => 'Cabinet annexe Bockenheimer Landstraße',
        'content_fr' => <<<'HTML'
<!-- wp:media-text {"mediaId":9431,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2023/08/Raum-10-2000x1500-1-1024x768.jpeg" alt="Salle de soins du cabinet annexe Bockenheimer Landstraße" class="wp-image-9431 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p>Sur notre deuxième site, vous bénéficiez du même portefeuille médical qu'au cabinet principal Grüneburgweg, dans un cadre moderne et accueillant. Vous nous trouverez dans l'immeuble Windows au 5ᵉ étage chez Eterno. Eterno met les locaux à disposition — vous restez nos patients.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:spacer -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9435,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p><strong>Vous pouvez prendre rendez-vous comme d'habitude</strong> via Doctolib ou auprès de notre accueil. Vous pouvez également organiser des rendez-vous via l'accueil d'Eterno.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Téléphone accueil Eterno :</strong> <a href="tel:+4969363937600">069 363937600</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>E-mail accueil Eterno :</strong> <a href="mailto:windows@eternohealth.de">windows@eternohealth.de</a></p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2023/08/Raum-5-1500x1125-1-1024x768.jpeg" alt="Zone d'accueil du cabinet annexe" class="wp-image-9435 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:spacer -->
<div style="height:40px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:paragraph -->
<p>Vous trouverez d'autres informations sur nos sites et le cabinet principal sous <a href="/standorte/">Cabinet principal Grüneburgweg</a>.</p>
<!-- /wp:paragraph -->
HTML,
        'meta_fr' => [
            'pxz_standard_eyebrow' => 'Nos cabinets',
            'pxz_standard_sub'     => "Bockenheimer Landstraße 33 — notre deuxième cabinet dans le Westend de Francfort.",
        ],
    ],
];

// ---------- Helpers --------------------------------------------------------

function get_trid_for_de_post( $de_id ) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare(
        "SELECT trid FROM {$wpdb->prefix}icl_translations WHERE element_id=%d AND element_type='post_page' AND language_code='de'",
        $de_id
    ) );
}

function get_existing_fr_post( $trid ) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare(
        "SELECT element_id FROM {$wpdb->prefix}icl_translations WHERE trid=%d AND element_type='post_page' AND language_code='fr'",
        $trid
    ) );
}

function copy_postmeta( $de_id, $fr_id, $overrides ) {
    global $wpdb;
    $rows = $wpdb->get_results( $wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->prefix}postmeta WHERE post_id=%d", $de_id
    ), ARRAY_A );
    foreach ( $rows as $r ) {
        $key = $r['meta_key'];
        // Skip auto-managed by WPML / WP
        if ( in_array( $key, [ '_wpml_word_count', '_edit_lock', '_edit_last' ], true ) ) continue;
        $val = array_key_exists( $key, $overrides ) ? $overrides[ $key ] : $r['meta_value'];
        update_post_meta( $fr_id, $key, $val );
    }
    // Apply remaining overrides that did not exist on DE side
    foreach ( $overrides as $k => $v ) {
        if ( ! metadata_exists( 'post', $fr_id, $k ) ) {
            update_post_meta( $fr_id, $k, $v );
        }
    }
}

function bridge_wpml_fr( $fr_id, $trid ) {
    global $wpdb;
    // Insert into icl_translations: same trid, language_code=fr, source=de
    $existing = $wpdb->get_var( $wpdb->prepare(
        "SELECT translation_id FROM {$wpdb->prefix}icl_translations WHERE element_id=%d AND element_type='post_page'",
        $fr_id
    ) );
    if ( $existing ) {
        $wpdb->update(
            "{$wpdb->prefix}icl_translations",
            [ 'trid' => $trid, 'language_code' => 'fr', 'source_language_code' => 'de' ],
            [ 'translation_id' => $existing ]
        );
    } else {
        $wpdb->insert( "{$wpdb->prefix}icl_translations", [
            'element_type'         => 'post_page',
            'element_id'           => $fr_id,
            'trid'                 => $trid,
            'language_code'        => 'fr',
            'source_language_code' => 'de',
        ] );
    }
}

// ---------- Main loop ------------------------------------------------------

$results = [];
foreach ( $pages as $de_id => $cfg ) {
    $de = get_post( $de_id );
    if ( ! $de ) {
        $results[] = [ $de_id, $cfg['slug'], 'SKIP', 'DE post not found' ];
        continue;
    }

    $trid = get_trid_for_de_post( $de_id );
    if ( ! $trid ) {
        $results[] = [ $de_id, $cfg['slug'], 'SKIP', 'no WPML trid' ];
        continue;
    }

    $existing_fr = get_existing_fr_post( $trid );
    if ( $existing_fr ) {
        $results[] = [ $de_id, $cfg['slug'], 'EXISTS', "FR post {$existing_fr} already linked" ];
        continue;
    }

    if ( ! $commit ) {
        $results[] = [ $de_id, $cfg['slug'], 'PLAN',
            "would create FR post (title={$cfg['fr_title']}, content_len=" . strlen( $cfg['content_fr'] ) . "), trid={$trid}" ];
        continue;
    }

    // ---- COMMIT ----
    // wp_insert_post forces unique slug. Use direct DB insert to keep DE-slug.
    $fr_post_data = [
        'post_author'    => $de->post_author,
        'post_date'      => current_time( 'mysql' ),
        'post_date_gmt'  => current_time( 'mysql', 1 ),
        'post_content'   => $cfg['content_fr'],
        'post_title'     => $cfg['fr_title'],
        'post_excerpt'   => '',
        'post_status'    => 'publish',
        'comment_status' => 'closed',
        'ping_status'    => 'closed',
        'post_password'  => '',
        'post_name'      => $cfg['slug'],
        'to_ping'        => '',
        'pinged'         => '',
        'post_modified'  => current_time( 'mysql' ),
        'post_modified_gmt' => current_time( 'mysql', 1 ),
        'post_content_filtered' => '',
        'post_parent'    => $de->post_parent,
        'guid'           => '',
        'menu_order'     => $de->menu_order,
        'post_type'      => 'page',
        'post_mime_type' => '',
        'comment_count'  => 0,
    ];
    $wpdb->insert( $wpdb->posts, $fr_post_data );
    $fr_id = (int) $wpdb->insert_id;
    if ( ! $fr_id ) {
        $results[] = [ $de_id, $cfg['slug'], 'ERROR', 'wp_posts insert failed' ];
        continue;
    }
    // Set guid post-insert (WP convention: site_url + ?p=ID)
    $wpdb->update( $wpdb->posts, [ 'guid' => home_url( "/?page_id={$fr_id}" ) ], [ 'ID' => $fr_id ] );

    copy_postmeta( $de_id, $fr_id, $cfg['meta_fr'] );
    bridge_wpml_fr( $fr_id, $trid );

    $results[] = [ $de_id, $cfg['slug'], 'CREATED', "FR post {$fr_id} linked via trid {$trid}" ];
}

// ---------- Summary --------------------------------------------------------
echo str_pad( 'DE_ID', 8 ) . str_pad( 'SLUG', 30 ) . str_pad( 'STATUS', 10 ) . "DETAIL\n";
echo str_repeat( '-', 110 ) . "\n";
foreach ( $results as $r ) {
    echo str_pad( $r[0], 8 ) . str_pad( $r[1], 30 ) . str_pad( $r[2], 10 ) . $r[3] . "\n";
}
echo "\nTotal pages processed: " . count( $results ) . "\n";
echo "Mode: " . ( $commit ? "COMMIT" : "DRY-RUN" ) . "\n";
