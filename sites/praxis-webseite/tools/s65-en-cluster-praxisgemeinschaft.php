<?php
/**
 * S65 — EN-Cluster „Praxisgemeinschaft"
 *
 * Inserts EN-translations for 12 pages of the Praxisgemeinschaft cluster
 * via direct WP-API. Bridges WPML so $sitepress sees them as proper
 * translations (same trid, language_code='en', source='de').
 *
 * Idempotent: skips pages that already have an EN-translation.
 *
 * Usage:
 *   php s65-en-cluster-praxisgemeinschaft.php          # dry-run (show plan)
 *   php s65-en-cluster-praxisgemeinschaft.php --commit # actually insert
 *
 * Templates classified:
 *  - Self-render (10 pages, post_content ignored): praxis, team, unsere-partner,
 *    7 doctor pages — copy template, blank content, identical slug.
 *  - Standard-template (2 pages, content + postmeta translated): standorte,
 *    zweigpraxis-bockenheimer.
 *
 * Doctor page titles stay invariant (identifiers, rendered from team-data.php).
 */

define( 'WP_USE_THEMES', false );
$wp_load = '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-load.php';
require $wp_load;

global $wpdb;

$commit = in_array( '--commit', $argv ?? [], true );
echo "MODE: " . ( $commit ? "COMMIT" : "DRY-RUN (use --commit to apply)" ) . "\n\n";

// ---------- Translations dictionary ----------------------------------------
// Format: [ de_id => [ slug, en_title, post_content_en, postmeta_en ] ]
// post_content_en = '' means "self-render template; content ignored"
// postmeta_en is merged into copy from DE postmeta (overrides on key match)

$pages = [

    // ----- Self-render templates (10 pages) -----
    9671 => [ 'slug' => 'praxis',                    'en_title' => 'Shared medical practice', 'content_en' => '', 'meta_en' => [] ],
    9672 => [ 'slug' => 'team',                      'en_title' => 'Our team',                'content_en' => '', 'meta_en' => [] ],
    9887 => [ 'slug' => 'unsere-partner',            'en_title' => 'Our partners',            'content_en' => '', 'meta_en' => [] ],
    // Doctor pages — title invariant (identifier rendered from team-data.php)
    9675 => [ 'slug' => 'docteur-saul',  'en_title' => 'Docteur en méd. Sonja Saul', 'content_en' => '', 'meta_en' => [] ],
    9681 => [ 'slug' => 'dr-arbitmann',  'en_title' => 'Anna Arbitmann',             'content_en' => '', 'meta_en' => [] ],
    9676 => [ 'slug' => 'dr-barcsay',    'en_title' => 'Dr. Fabian Barcsay',         'content_en' => '', 'meta_en' => [] ],
    9678 => [ 'slug' => 'dr-jawich',     'en_title' => 'Dr. Issa Jawich',            'content_en' => '', 'meta_en' => [] ],
    9680 => [ 'slug' => 'dr-landeberg',  'en_title' => 'Linnea Landeberg',           'content_en' => '', 'meta_en' => [] ],
    9677 => [ 'slug' => 'dr-seelig',     'en_title' => 'Dr. Stefanie Seelig',        'content_en' => '', 'meta_en' => [] ],
    9679 => [ 'slug' => 'dr-shahin',     'en_title' => 'Dr. George Shahin',          'content_en' => '', 'meta_en' => [] ],

    // ----- Standard templates (2 pages, content + postmeta translated) -----
    9691 => [
        'slug'       => 'standorte',
        'en_title'   => 'Locations',
        'content_en' => <<<'HTML'
<!-- wp:paragraph -->
<p>Praxiszentrum Dr. Stracke &amp; Kollegen serves you at two locations in Frankfurt's Westend. The complete medical care portfolio is available at both.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Our main practice at Grüneburgweg 12 has 17 treatment rooms and the full portfolio of internal medicine, general practice and specialist care.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>At our branch practice on Bockenheimer Landstraße 33 inside the Windows building at Eterno, you receive the same care portfolio in a modern setting.</p>
<!-- /wp:paragraph -->

<!-- wp:media-text {"mediaId":9798,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-empfang.jpeg" alt="Reception area at the main practice on Grüneburgweg" class="wp-image-9798 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Reception</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Our team welcomes you here. Reception is the central point of contact for check-in, appointment booking and general enquiries.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9802,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Waiting area</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Our bright waiting area offers space and quiet before your appointment. A practice-information screen and generous windows facing the Westend create a pleasant atmosphere.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-wartebereich.jpeg" alt="Waiting area at the main practice on Grüneburgweg" class="wp-image-9802 size-full" /></figure></div>
<!-- /wp:media-text -->



<!-- wp:media-text {"mediaPosition":"right","mediaId":9810,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Consulting room</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In our consulting rooms we hold history-taking, advisory conversations and explain findings. We take time for your questions and discuss results in a calm setting.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-sprechzimmer.jpeg" alt="Consulting room at the main practice on Grüneburgweg" class="wp-image-9810 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaId":9814,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-behandlungszimmer.jpeg" alt="Large treatment room at the main practice" class="wp-image-9814 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Large treatment room</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Our large treatment rooms combine consulting and examination space, allowing us to integrate advisory conversations and clinical examination in a private setting.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9818,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Ultrasound room</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In our ultrasound rooms we examine internal organs, the thyroid gland, vessels and more. High-resolution equipment enables precise diagnostics.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-sonographie-1.jpeg" alt="Ultrasound examination room at the main practice" class="wp-image-9818 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaId":9822,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-sonographie-2.jpeg" alt="Second ultrasound examination room at the main practice" class="wp-image-9822 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Second ultrasound room</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>We have several ultrasound stations, so parallel examinations are possible without waiting times.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9826,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Special examination room</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A dedicated room is available for special examinations such as functional diagnostics and follow-up checks.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-spezial-untersuchung.jpeg" alt="Special examination room at the main practice" class="wp-image-9826 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaId":9830,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-untersuchungsraum.jpeg" alt="Examination room at the main practice" class="wp-image-9830 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Examination room</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Routine examinations such as blood pressure measurement, ECG preparation and preventive check-ups take place here.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->



<!-- wp:heading {"level":2} -->
<h2>Getting here</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Both locations are in Frankfurt's Westend and are easy to reach by public transport (U-Bahn Westend for the branch practice, U-Bahn Grüneburgweg for the main practice) as well as by car.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<div class="pxz-map-embed" style="margin:2rem 0;border-radius:12px;overflow:hidden">

</div>
<!-- /wp:html -->
HTML,
        'meta_en' => [
            'pxz_standard_eyebrow' => 'Locations',
            'pxz_standard_h1'      => 'Two addresses. One mindset.',
            'pxz_standard_sub'     => '',
        ],
    ],

    9693 => [
        'slug'       => 'zweigpraxis-bockenheimer',
        'en_title'   => 'Branch practice Bockenheimer Landstraße',
        'content_en' => <<<'HTML'
<!-- wp:media-text {"mediaId":9431,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2023/08/Raum-10-2000x1500-1-1024x768.jpeg" alt="Treatment room at the branch practice on Bockenheimer Landstraße" class="wp-image-9431 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p>At our second location you receive the same medical care portfolio as at our main practice on Grüneburgweg, in a modern, pleasant setting. You will find us in the Windows building on the 5th floor at Eterno. Eterno provides the premises — you remain our patients.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:spacer -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9435,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p><strong>You can book appointments as usual</strong> via Doctolib or through our reception. You may also arrange appointments through Eterno's reception.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Eterno reception phone:</strong> <a href="tel:+4969363937600">069 363937600</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Eterno reception email:</strong> <a href="mailto:windows@eternohealth.de">windows@eternohealth.de</a></p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2023/08/Raum-5-1500x1125-1-1024x768.jpeg" alt="Reception area at the branch practice" class="wp-image-9435 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:spacer -->
<div style="height:40px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:paragraph -->
<p>You will find further location information and our main practice under <a href="/standorte/">Main practice Grüneburgweg</a>.</p>
<!-- /wp:paragraph -->
HTML,
        'meta_en' => [
            'pxz_standard_eyebrow' => 'Locations',
            'pxz_standard_sub'     => "Bockenheimer Landstraße 33 — our second location in Frankfurt's Westend.",
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

function get_existing_en_post( $trid ) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare(
        "SELECT element_id FROM {$wpdb->prefix}icl_translations WHERE trid=%d AND element_type='post_page' AND language_code='en'",
        $trid
    ) );
}

function copy_postmeta( $de_id, $en_id, $overrides ) {
    global $wpdb;
    $rows = $wpdb->get_results( $wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->prefix}postmeta WHERE post_id=%d", $de_id
    ), ARRAY_A );
    foreach ( $rows as $r ) {
        $key = $r['meta_key'];
        // Skip auto-managed by WPML / WP
        if ( in_array( $key, [ '_wpml_word_count', '_edit_lock', '_edit_last' ], true ) ) continue;
        $val = array_key_exists( $key, $overrides ) ? $overrides[ $key ] : $r['meta_value'];
        update_post_meta( $en_id, $key, $val );
    }
    // Apply remaining overrides that did not exist on DE side
    foreach ( $overrides as $k => $v ) {
        if ( ! metadata_exists( 'post', $en_id, $k ) ) {
            update_post_meta( $en_id, $k, $v );
        }
    }
}

function bridge_wpml( $en_id, $trid ) {
    global $wpdb;
    // Insert into icl_translations: same trid, language_code=en, source=de
    $existing = $wpdb->get_var( $wpdb->prepare(
        "SELECT translation_id FROM {$wpdb->prefix}icl_translations WHERE element_id=%d AND element_type='post_page'",
        $en_id
    ) );
    if ( $existing ) {
        $wpdb->update(
            "{$wpdb->prefix}icl_translations",
            [ 'trid' => $trid, 'language_code' => 'en', 'source_language_code' => 'de' ],
            [ 'translation_id' => $existing ]
        );
    } else {
        $wpdb->insert( "{$wpdb->prefix}icl_translations", [
            'element_type'         => 'post_page',
            'element_id'           => $en_id,
            'trid'                 => $trid,
            'language_code'        => 'en',
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

    $existing_en = get_existing_en_post( $trid );
    if ( $existing_en ) {
        $results[] = [ $de_id, $cfg['slug'], 'EXISTS', "EN post {$existing_en} already linked" ];
        continue;
    }

    if ( ! $commit ) {
        $results[] = [ $de_id, $cfg['slug'], 'PLAN',
            "would create EN post (title={$cfg['en_title']}, content_len=" . strlen( $cfg['content_en'] ) . "), trid={$trid}" ];
        continue;
    }

    // ---- COMMIT ----
    // wp_insert_post forces unique slug. Use direct DB insert to keep DE-slug.
    $en_post_data = [
        'post_author'    => $de->post_author,
        'post_date'      => current_time( 'mysql' ),
        'post_date_gmt'  => current_time( 'mysql', 1 ),
        'post_content'   => $cfg['content_en'],
        'post_title'     => $cfg['en_title'],
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
    $wpdb->insert( $wpdb->posts, $en_post_data );
    $en_id = (int) $wpdb->insert_id;
    if ( ! $en_id ) {
        $results[] = [ $de_id, $cfg['slug'], 'ERROR', 'wp_posts insert failed' ];
        continue;
    }
    // Set guid post-insert (WP convention: site_url + ?p=ID)
    $wpdb->update( $wpdb->posts, [ 'guid' => home_url( "/?page_id={$en_id}" ) ], [ 'ID' => $en_id ] );

    copy_postmeta( $de_id, $en_id, $cfg['meta_en'] );
    bridge_wpml( $en_id, $trid );

    $results[] = [ $de_id, $cfg['slug'], 'CREATED', "EN post {$en_id} linked via trid {$trid}" ];
}

// ---------- Summary --------------------------------------------------------
echo str_pad( 'DE_ID', 8 ) . str_pad( 'SLUG', 30 ) . str_pad( 'STATUS', 10 ) . "DETAIL\n";
echo str_repeat( '-', 110 ) . "\n";
foreach ( $results as $r ) {
    echo str_pad( $r[0], 8 ) . str_pad( $r[1], 30 ) . str_pad( $r[2], 10 ) . $r[3] . "\n";
}
echo "\nTotal pages processed: " . count( $results ) . "\n";
echo "Mode: " . ( $commit ? "COMMIT" : "DRY-RUN" ) . "\n";
