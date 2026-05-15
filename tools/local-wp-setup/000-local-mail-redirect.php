<?php
/**
 * Plugin Name: PXZ Local Mail Bridge
 * Description: On *.local hosts, diverts wp_mail() either to the Local-by-Flywheel
 *              Mailpit catcher (default) OR forwards via HMAC-signed POST to the
 *              .de Mail-Bridge for REAL delivery to Dr. Stracke's own mailboxes
 *              (whitelisted: praxis@westend-hausarzt.de, stracke.md@me.com).
 *              Production hosts stay untouched.
 * Version:     2.0.0
 * Author:      praxis-webseite / Cortex
 *
 * Companion: wp-content/mu-plugins/pxz-mail-bridge-receiver.php on .de site.
 * Secret:    stored only in wp_options['pxz_bridge_secret'] (never in code).
 */

if ( ! defined( 'ABSPATH' ) ) exit;

function pxz_is_local_host() {
    $host = parse_url( home_url(), PHP_URL_HOST );
    return $host && substr( $host, -6 ) === '.local';
}

/* ------------------------------------------------------------------
 * 1) Bridge — runs BEFORE the Mailpit catcher. If the recipient is on
 *    Dr. Stracke's own whitelist, forward to .de bridge for real
 *    delivery. Everything else falls through to Mailpit (next section).
 * ------------------------------------------------------------------ */
add_filter( 'pre_wp_mail', function ( $null, $atts ) {
    if ( ! pxz_is_local_host() ) {
        return $null;
    }
    $secret = get_option( 'pxz_bridge_secret', '' );
    if ( ! $secret ) {
        return $null;
    }

    $to = $atts['to'] ?? '';
    if ( is_array( $to ) ) {
        $to = $to[0] ?? '';
    }
    $to = trim( (string) $to );

    $allow = [ 'praxis@westend-hausarzt.de', 'stracke.md@me.com' ];
    if ( ! in_array( strtolower( $to ), array_map( 'strtolower', $allow ), true ) ) {
        return $null;
    }

    $payload = [
        'to'      => $to,
        'subject' => $atts['subject'] ?? '',
        'message' => $atts['message'] ?? '',
        'headers' => $atts['headers'] ?? [],
    ];
    $body = wp_json_encode( $payload );
    $ts   = (string) time();
    $sig  = hash_hmac( 'sha256', $ts . "\n" . $body, $secret );

    $resp = wp_remote_post( 'https://westend-hausarzt.de/wp-json/pxz/v1/mail-bridge', [
        'body'      => $body,
        'headers'   => [
            'Content-Type'  => 'application/json',
            'X-PXZ-Sig'     => $sig,
            'X-PXZ-Ts'      => $ts,
            'Authorization' => 'Basic ' . base64_encode( 'praxis:Sanexio' ),
        ],
        'timeout'   => 15,
        'sslverify' => true,
    ] );

    if ( is_wp_error( $resp ) ) {
        return $null;
    }
    if ( wp_remote_retrieve_response_code( $resp ) !== 200 ) {
        return $null;
    }
    $j = json_decode( wp_remote_retrieve_body( $resp ), true );
    if ( ! is_array( $j ) || empty( $j['sent'] ) ) {
        return $null;
    }
    return true;
}, 10, 2 );

/* ------------------------------------------------------------------
 * 2) Mailpit fallback — everything not whitelisted (e.g. patient
 *    confirmation mails to fake addresses) stays inside Mailpit.
 * ------------------------------------------------------------------ */
add_filter( 'option_wp_mail_smtp', function ( $value ) {
    if ( ! pxz_is_local_host() ) return $value;
    if ( ! is_array( $value ) ) $value = [];

    $value['mail'] = array_merge( $value['mail'] ?? [], [
        'from_email'       => 'dev@westend-hausarzt.local',
        'from_name'        => 'GP Medical Center Westend (Dev)',
        'mailer'           => 'smtp',
        'return_path'      => false,
        'from_email_force' => true,
        'from_name_force'  => false,
    ] );
    $value['smtp'] = array_merge( $value['smtp'] ?? [], [
        'host'       => '127.0.0.1',
        'port'       => 10001,
        'encryption' => 'none',
        'auth'       => false,
        'autotls'    => false,
        'user'       => '',
        'pass'       => '',
    ] );
    unset( $value['general']['usage_tracking'] );
    return $value;
}, PHP_INT_MAX );

add_action( 'phpmailer_init', function ( $phpmailer ) {
    if ( ! pxz_is_local_host() ) return;
    $phpmailer->isSMTP();
    $phpmailer->Host        = '127.0.0.1';
    $phpmailer->Port        = 10001;
    $phpmailer->SMTPAuth    = false;
    $phpmailer->SMTPSecure  = '';
    $phpmailer->SMTPAutoTLS = false;
}, PHP_INT_MAX );

/* ------------------------------------------------------------------
 * 3) Surface failures for WP-CLI tests.
 * ------------------------------------------------------------------ */
add_action( 'wp_mail_failed', function ( $e ) {
    if ( pxz_is_local_host() && defined( 'WP_CLI' ) && WP_CLI ) {
        \WP_CLI::warning( 'wp_mail failed: ' . $e->get_error_message() );
    }
} );
