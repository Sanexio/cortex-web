<?php
/**
 * S67 — ES-Cluster „Praxisgemeinschaft"
 *
 * Inserts ES-translations for 12 pages of the Praxisgemeinschaft cluster
 * via direct WP-API. Bridges WPML so $sitepress sees them as proper
 * translations (same trid, language_code='es', source='de').
 *
 * Idempotent: skips pages that already have an ES-translation.
 *
 * Usage:
 *   php s67-es-cluster-praxisgemeinschaft.php          # dry-run (show plan)
 *   php s67-es-cluster-praxisgemeinschaft.php --commit # actually insert
 *
 * Templates classified (mirrors S65/S66 structure):
 *  - Self-render (10 pages, post_content ignored): praxis, team, unsere-partner,
 *    7 doctor pages — copy template, blank content, identical slug.
 *  - Standard-template (2 pages, content + postmeta translated): standorte,
 *    zweigpraxis-bockenheimer.
 *
 * Doctor page titles stay invariant (identifiers, rendered from team-data.php).
 *
 * Glossary compliance (LL-058 / Memory project_praxis_rechtsform_praxisgemeinschaft):
 *   ES: "comunidad de consulta médica" (NOT "consulta de grupo" — legal form).
 */

define( 'WP_USE_THEMES', false );
$wp_load = '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-load.php';
require $wp_load;

global $wpdb;

$commit = in_array( '--commit', $argv ?? [], true );
echo "MODE: " . ( $commit ? "COMMIT" : "DRY-RUN (use --commit to apply)" ) . "\n\n";

// ---------- Translations dictionary ----------------------------------------
// Format: [ de_id => [ slug, es_title, post_content_es, postmeta_es ] ]

$pages = [

    // ----- Self-render templates (10 pages) -----
    9671 => [ 'slug' => 'praxis',                    'es_title' => 'Comunidad de consulta médica',  'content_es' => '', 'meta_es' => [] ],
    9672 => [ 'slug' => 'team',                      'es_title' => 'Nuestro equipo',                'content_es' => '', 'meta_es' => [] ],
    9887 => [ 'slug' => 'unsere-partner',            'es_title' => 'Nuestros socios',               'content_es' => '', 'meta_es' => [] ],
    // Doctor pages — title invariant
    9675 => [ 'slug' => 'docteur-saul',  'es_title' => 'Docteur en méd. Sonja Saul', 'content_es' => '', 'meta_es' => [] ],
    9681 => [ 'slug' => 'dr-arbitmann',  'es_title' => 'Anna Arbitmann',             'content_es' => '', 'meta_es' => [] ],
    9676 => [ 'slug' => 'dr-barcsay',    'es_title' => 'Dr. Fabian Barcsay',         'content_es' => '', 'meta_es' => [] ],
    9678 => [ 'slug' => 'dr-jawich',     'es_title' => 'Dr. Issa Jawich',            'content_es' => '', 'meta_es' => [] ],
    9680 => [ 'slug' => 'dr-landeberg',  'es_title' => 'Linnea Landeberg',           'content_es' => '', 'meta_es' => [] ],
    9677 => [ 'slug' => 'dr-seelig',     'es_title' => 'Dr. Stefanie Seelig',        'content_es' => '', 'meta_es' => [] ],
    9679 => [ 'slug' => 'dr-shahin',     'es_title' => 'Dr. George Shahin',          'content_es' => '', 'meta_es' => [] ],

    // ----- Standard templates (2 pages, content + postmeta translated) -----
    9691 => [
        'slug'       => 'standorte',
        'es_title'   => 'Nuestros centros',
        'content_es' => <<<'HTML'
<!-- wp:paragraph -->
<p>El Praxiszentrum Dr. Stracke &amp; Kollegen le atiende en dos centros del Westend de Fráncfort. La cartera médica completa está disponible en ambos centros.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Nuestra consulta principal en Grüneburgweg 12 dispone de 17 salas de tratamiento y ofrece la cartera completa de medicina interna, medicina general y atención especializada.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>En nuestra consulta secundaria de Bockenheimer Landstraße 33, en el edificio Windows en Eterno, recibe la misma cartera de atención en un entorno moderno.</p>
<!-- /wp:paragraph -->

<!-- wp:media-text {"mediaId":9798,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-empfang.jpeg" alt="Zona de recepción de la consulta principal Grüneburgweg" class="wp-image-9798 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Recepción</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Aquí le recibe nuestro equipo. La recepción es el punto de contacto central para el registro, la concertación de citas y las consultas generales.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9802,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Sala de espera</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nuestra sala de espera, luminosa, ofrece espacio y tranquilidad antes de su cita. Una pantalla con información de la consulta y amplias ventanas con vistas al Westend crean un ambiente agradable.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-wartebereich.jpeg" alt="Sala de espera de la consulta principal Grüneburgweg" class="wp-image-9802 size-full" /></figure></div>
<!-- /wp:media-text -->



<!-- wp:media-text {"mediaPosition":"right","mediaId":9810,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Sala de consulta</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En nuestras salas de consulta realizamos la anamnesis, las conversaciones de asesoramiento y la explicación de los resultados. Nos tomamos tiempo para sus preguntas y comentamos los hallazgos con calma.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-sprechzimmer.jpeg" alt="Sala de consulta de la consulta principal Grüneburgweg" class="wp-image-9810 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaId":9814,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-behandlungszimmer.jpeg" alt="Sala de tratamiento amplia de la consulta principal" class="wp-image-9814 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Sala de tratamiento amplia</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nuestras salas de tratamiento amplias combinan zona de consulta y de exploración. Así integramos asesoramiento y exploración clínica en un entorno reservado.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9818,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Sala de ecografía</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En nuestras salas de ecografía exploramos órganos internos, la glándula tiroides, los vasos y mucho más. Los equipos de alta resolución permiten un diagnóstico preciso.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-sonographie-1.jpeg" alt="Sala de exploración ecográfica de la consulta principal" class="wp-image-9818 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaId":9822,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-sonographie-2.jpeg" alt="Segunda sala de exploración ecográfica de la consulta principal" class="wp-image-9822 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Segunda sala de ecografía</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Disponemos de varios puestos de ecografía, lo que permite realizar exploraciones en paralelo sin esperas.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9826,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Sala de exámenes especiales</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Disponemos de una sala dedicada a exámenes especiales como diagnósticos funcionales y controles de seguimiento.</p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-spezial-untersuchung.jpeg" alt="Sala de exámenes especiales de la consulta principal" class="wp-image-9826 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:media-text {"mediaId":9830,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2026/04/grueneburgweg-untersuchungsraum.jpeg" alt="Sala de exploración de la consulta principal" class="wp-image-9830 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:heading {"level":3} -->
<h3>Sala de exploración</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Aquí se realizan las exploraciones de rutina como la medición de la tensión arterial, la preparación del ECG y los chequeos preventivos.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->



<!-- wp:heading {"level":2} -->
<h2>Cómo llegar</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Ambos centros se encuentran en el Westend de Fráncfort y son fácilmente accesibles en transporte público (U-Bahn Westend para la consulta secundaria, U-Bahn Grüneburgweg para la consulta principal) y también en coche.</p>
<!-- /wp:paragraph -->

<!-- wp:html -->
<div class="pxz-map-embed" style="margin:2rem 0;border-radius:12px;overflow:hidden">

</div>
<!-- /wp:html -->
HTML,
        'meta_es' => [
            'pxz_standard_eyebrow' => 'Nuestros centros',
            'pxz_standard_h1'      => 'Dos direcciones. Una sola filosofía.',
            'pxz_standard_sub'     => '',
        ],
    ],

    9693 => [
        'slug'       => 'zweigpraxis-bockenheimer',
        'es_title'   => 'Consulta secundaria Bockenheimer Landstraße',
        'content_es' => <<<'HTML'
<!-- wp:media-text {"mediaId":9431,"mediaType":"image"} -->
<div class="wp-block-media-text is-stacked-on-mobile"><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2023/08/Raum-10-2000x1500-1-1024x768.jpeg" alt="Sala de tratamiento de la consulta secundaria Bockenheimer Landstraße" class="wp-image-9431 size-full" /></figure><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p>En nuestro segundo centro recibe la misma cartera médica que en la consulta principal de Grüneburgweg, en un entorno moderno y agradable. Nos encontrará en el edificio Windows, planta 5, en Eterno. Eterno cede los locales — usted sigue siendo paciente nuestro.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text -->

<!-- wp:spacer -->
<div style="height:60px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:media-text {"mediaPosition":"right","mediaId":9435,"mediaType":"image"} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile"><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p><strong>Puede concertar citas como de costumbre</strong> a través de Doctolib o por nuestra recepción. También puede gestionarlas a través de la recepción de Eterno.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Teléfono recepción Eterno:</strong> <a href="tel:+4969363937600">069 363937600</a></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>Correo recepción Eterno:</strong> <a href="mailto:windows@eternohealth.de">windows@eternohealth.de</a></p>
<!-- /wp:paragraph --></div><figure class="wp-block-media-text__media"><img src="/wp-content/uploads/2023/08/Raum-5-1500x1125-1-1024x768.jpeg" alt="Zona de recepción de la consulta secundaria" class="wp-image-9435 size-full" /></figure></div>
<!-- /wp:media-text -->

<!-- wp:spacer -->
<div style="height:40px" aria-hidden="true" class="wp-block-spacer"></div>
<!-- /wp:spacer -->

<!-- wp:paragraph -->
<p>Encontrará más información sobre nuestros centros y la consulta principal en <a href="/standorte/">Consulta principal Grüneburgweg</a>.</p>
<!-- /wp:paragraph -->
HTML,
        'meta_es' => [
            'pxz_standard_eyebrow' => 'Nuestros centros',
            'pxz_standard_sub'     => 'Bockenheimer Landstraße 33 — nuestro segundo centro en el Westend de Fráncfort.',
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

function get_existing_es_post( $trid ) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare(
        "SELECT element_id FROM {$wpdb->prefix}icl_translations WHERE trid=%d AND element_type='post_page' AND language_code='es'",
        $trid
    ) );
}

function copy_postmeta( $de_id, $es_id, $overrides ) {
    global $wpdb;
    $rows = $wpdb->get_results( $wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->prefix}postmeta WHERE post_id=%d", $de_id
    ), ARRAY_A );
    foreach ( $rows as $r ) {
        $key = $r['meta_key'];
        if ( in_array( $key, [ '_wpml_word_count', '_edit_lock', '_edit_last' ], true ) ) continue;
        $val = array_key_exists( $key, $overrides ) ? $overrides[ $key ] : $r['meta_value'];
        update_post_meta( $es_id, $key, $val );
    }
    foreach ( $overrides as $k => $v ) {
        if ( ! metadata_exists( 'post', $es_id, $k ) ) {
            update_post_meta( $es_id, $k, $v );
        }
    }
}

function bridge_wpml_es( $es_id, $trid ) {
    global $wpdb;
    $existing = $wpdb->get_var( $wpdb->prepare(
        "SELECT translation_id FROM {$wpdb->prefix}icl_translations WHERE element_id=%d AND element_type='post_page'",
        $es_id
    ) );
    if ( $existing ) {
        $wpdb->update(
            "{$wpdb->prefix}icl_translations",
            [ 'trid' => $trid, 'language_code' => 'es', 'source_language_code' => 'de' ],
            [ 'translation_id' => $existing ]
        );
    } else {
        $wpdb->insert( "{$wpdb->prefix}icl_translations", [
            'element_type'         => 'post_page',
            'element_id'           => $es_id,
            'trid'                 => $trid,
            'language_code'        => 'es',
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

    $existing_es = get_existing_es_post( $trid );
    if ( $existing_es ) {
        $results[] = [ $de_id, $cfg['slug'], 'EXISTS', "ES post {$existing_es} already linked" ];
        continue;
    }

    if ( ! $commit ) {
        $results[] = [ $de_id, $cfg['slug'], 'PLAN',
            "would create ES post (title={$cfg['es_title']}, content_len=" . strlen( $cfg['content_es'] ) . "), trid={$trid}" ];
        continue;
    }

    $es_post_data = [
        'post_author'    => $de->post_author,
        'post_date'      => current_time( 'mysql' ),
        'post_date_gmt'  => current_time( 'mysql', 1 ),
        'post_content'   => $cfg['content_es'],
        'post_title'     => $cfg['es_title'],
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
    $wpdb->insert( $wpdb->posts, $es_post_data );
    $es_id = (int) $wpdb->insert_id;
    if ( ! $es_id ) {
        $results[] = [ $de_id, $cfg['slug'], 'ERROR', 'wp_posts insert failed' ];
        continue;
    }
    $wpdb->update( $wpdb->posts, [ 'guid' => home_url( "/?page_id={$es_id}" ) ], [ 'ID' => $es_id ] );

    copy_postmeta( $de_id, $es_id, $cfg['meta_es'] );
    bridge_wpml_es( $es_id, $trid );

    $results[] = [ $de_id, $cfg['slug'], 'CREATED', "ES post {$es_id} linked via trid {$trid}" ];
}

// ---------- Summary --------------------------------------------------------
echo str_pad( 'DE_ID', 8 ) . str_pad( 'SLUG', 30 ) . str_pad( 'STATUS', 10 ) . "DETAIL\n";
echo str_repeat( '-', 110 ) . "\n";
foreach ( $results as $r ) {
    echo str_pad( $r[0], 8 ) . str_pad( $r[1], 30 ) . str_pad( $r[2], 10 ) . $r[3] . "\n";
}
echo "\nTotal pages processed: " . count( $results ) . "\n";
echo "Mode: " . ( $commit ? "COMMIT" : "DRY-RUN" ) . "\n";
