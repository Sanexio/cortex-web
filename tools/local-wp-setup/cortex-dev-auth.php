<?php
/**
 * cortex-dev-auth — Local dev helper for Cortex-Web adapter (2026-04-18).
 *
 * Installed for Dr. Stracke's praxis-redesign Local site. Enables the
 * Cortex-Web WordPress adapter to authenticate via Application Passwords
 * against this Local site without modifying wp-config.php, the theme, or
 * any plugin.
 *
 * Two things happen here, and nothing else:
 *
 *   1. Rebuild PHP_AUTH_USER / PHP_AUTH_PW from the raw
 *      `Authorization: Basic ...` header. Apache sets these automatically;
 *      nginx (which Local uses) does not. Without this, WordPress'
 *      wp_validate_application_password() sees no credentials and returns
 *      rest_not_logged_in.
 *
 *   2. Force wp_is_application_passwords_available() to return true on this
 *      HTTP-only local site, since WP ties the feature to HTTPS by default.
 *
 * Deleting this file reverts everything. It does not modify any site data.
 *
 * Repo source of truth: ~/Cortex/projects/Cortex-Web/tools/local-wp-setup/cortex-dev-auth.php
 */

if ( empty( $_SERVER['PHP_AUTH_USER'] ) && ! empty( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
    $cortex_auth = (string) $_SERVER['HTTP_AUTHORIZATION'];
    if ( 0 === stripos( $cortex_auth, 'basic ' ) ) {
        $cortex_decoded = base64_decode( substr( $cortex_auth, 6 ), true );
        if ( false !== $cortex_decoded && false !== strpos( $cortex_decoded, ':' ) ) {
            list( $cortex_user, $cortex_pass ) = explode( ':', $cortex_decoded, 2 );
            $_SERVER['PHP_AUTH_USER'] = $cortex_user;
            $_SERVER['PHP_AUTH_PW']   = $cortex_pass;
        }
    }
    unset( $cortex_auth, $cortex_decoded, $cortex_user, $cortex_pass );
}

add_filter( 'wp_is_application_passwords_available', '__return_true' );
add_filter( 'wp_is_application_passwords_available_for_user', '__return_true' );
