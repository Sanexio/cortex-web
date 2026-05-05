<?php
/**
 * Create (or update) the /karriere/ page and link it to the MFA application form.
 * Idempotent via the pxz_marker post-meta.
 */

$marker = 'pxz_karriere_page_v1';

// Find form by marker so we can embed its shortcode.
$forms = get_posts( [
    'post_type'      => 'wpforms',
    'post_status'    => 'any',
    'posts_per_page' => 1,
    'meta_key'       => 'pxz_marker',
    'meta_value'     => 'pxz_mfa_application_v1',
    'fields'         => 'ids',
] );
if ( empty( $forms ) ) {
    echo "ERROR: MFA form not found. Run create_mfa_form.php first.\n";
    return;
}
$form_id = (int) $forms[0];

$page_title = 'Karriere';
$page_slug  = 'karriere';

$content = <<<HTML
<!-- wp:paragraph {"className":"pxz-karriere-intro"} -->
<p class="pxz-karriere-intro">Werden Sie Teil unseres Teams am GP Medical Center Westend. Wir bieten Ihnen einen sicheren, modernen Arbeitsplatz im Herzen Frankfurts, flexible Arbeitszeiten und die Möglichkeit, Ihr Fachwissen in einem interdisziplinären Ärzteteam einzubringen.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2,"anchor":"bewerben"} -->
<h2 id="bewerben">Jetzt als MFA bewerben</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Senden Sie uns Ihre Bewerbung direkt über das untenstehende Formular. Wir melden uns in der Regel innerhalb weniger Tage bei Ihnen.</p>
<!-- /wp:paragraph -->

<!-- wp:shortcode -->
[wpforms id="{$form_id}" title="false"]
<!-- /wp:shortcode -->

<!-- wp:paragraph {"className":"pxz-karriere-note"} -->
<p class="pxz-karriere-note">Alternativ erreichen Sie uns per E-Mail unter <a href="mailto:praxis@westend-hausarzt.de">praxis@westend-hausarzt.de</a>.</p>
<!-- /wp:paragraph -->
HTML;

$existing = get_posts( [
    'post_type'      => 'page',
    'post_status'    => 'any',
    'posts_per_page' => -1,
    'meta_key'       => 'pxz_marker',
    'meta_value'     => $marker,
    'fields'         => 'ids',
] );

if ( ! empty( $existing ) ) {
    $page_id = (int) $existing[0];
    wp_update_post( [
        'ID'           => $page_id,
        'post_title'   => $page_title,
        'post_name'    => $page_slug,
        'post_content' => $content,
        'post_status'  => 'publish',
    ] );
    echo "updated karriere page id={$page_id}\n";
} else {
    // Check if a page with that slug already exists without our marker.
    $maybe = get_page_by_path( $page_slug );
    if ( $maybe ) {
        echo "WARN: a page '/{$page_slug}/' already exists (id={$maybe->ID}) without marker — updating it.\n";
        wp_update_post( [
            'ID'           => $maybe->ID,
            'post_title'   => $page_title,
            'post_content' => $content,
            'post_status'  => 'publish',
        ] );
        update_post_meta( $maybe->ID, 'pxz_marker', $marker );
        $page_id = $maybe->ID;
    } else {
        $page_id = wp_insert_post( [
            'post_type'    => 'page',
            'post_title'   => $page_title,
            'post_name'    => $page_slug,
            'post_content' => $content,
            'post_status'  => 'publish',
        ] );
        update_post_meta( $page_id, 'pxz_marker', $marker );
        echo "created karriere page id={$page_id}\n";
    }
}

echo "URL: " . get_permalink( $page_id ) . "#bewerben\n";
echo "FORM_ID=" . $form_id . "\n";
