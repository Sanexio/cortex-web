<?php
/**
 * Plugin Name: PXZ Mail Bridge Receiver
 * Description: Accepts HMAC-authenticated POSTs from the Praxis-Webseite Local-Staging
 *              and re-delivers via wp_mail() in the .de context (Hoster-PHP-mail()).
 *              Allows local real-delivery without holding SMTP credentials on the Mac.
 *              Strict recipient whitelist (Dr. Stracke's own mailboxes only) — not an
 *              open relay.
 * Version:     1.0.0
 * Author:      praxis-webseite / Cortex
 *
 * Install on:  westend-hausarzt.de (production).
 *              Path: wp-content/mu-plugins/pxz-mail-bridge-receiver.php
 * Companion:   wp-content/mu-plugins/000-local-mail-redirect.php on Local-Staging.
 *
 * Secret:      stored only in wp_options['pxz_bridge_secret'] (never in code).
 * Auth:        HMAC-SHA256 over "<ts>\n<body>" with shared secret, ±120s window.
 * Outer auth:  HTTP-Basic-Auth (Apache-Edge) still applies for /wp-json on .de.
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'rest_api_init', function () {
    register_rest_route( 'pxz/v1', '/mail-bridge', [
        'methods'             => 'POST',
        'callback'            => 'pxz_mail_bridge_receive',
        'permission_callback' => '__return_true',
    ] );
} );

function pxz_mail_bridge_receive( WP_REST_Request $req ) {
    $secret = get_option( 'pxz_bridge_secret', '' );
    if ( ! $secret ) {
        return new WP_Error( 'pxz_bridge_disabled', 'bridge disabled (no secret)', [ 'status' => 503 ] );
    }

    $body_raw   = $req->get_body();
    $sig_header = (string) $req->get_header( 'x-pxz-sig' );
    $ts_header  = (string) $req->get_header( 'x-pxz-ts' );

    if ( ! $sig_header || ! $ts_header ) {
        return new WP_Error( 'pxz_missing_auth', 'auth headers missing', [ 'status' => 401 ] );
    }
    if ( abs( time() - intval( $ts_header ) ) > 120 ) {
        return new WP_Error( 'pxz_stale', 'timestamp out of window', [ 'status' => 401 ] );
    }

    $expected = hash_hmac( 'sha256', $ts_header . "\n" . $body_raw, $secret );
    if ( ! hash_equals( $expected, $sig_header ) ) {
        return new WP_Error( 'pxz_bad_sig', 'signature mismatch', [ 'status' => 401 ] );
    }

    $payload = json_decode( $body_raw, true );
    if ( ! is_array( $payload ) ) {
        return new WP_Error( 'pxz_bad_body', 'invalid json', [ 'status' => 400 ] );
    }

    $to       = $payload['to']      ?? '';
    $subject  = (string) ( $payload['subject'] ?? '' );
    $message  = (string) ( $payload['message'] ?? '' );
    $headers  = $payload['headers'] ?? [];
    $to_norm  = is_array( $to ) ? ( $to[0] ?? '' ) : (string) $to;
    $to_norm  = trim( $to_norm );

    // Strict whitelist — only Dr. Stracke's own mailboxes. Prevents open-relay abuse.
    $allow = [ 'praxis@westend-hausarzt.de', 'stracke.md@me.com' ];
    if ( ! in_array( strtolower( $to_norm ), array_map( 'strtolower', $allow ), true ) ) {
        return rest_ensure_response( [ 'ok' => false, 'reason' => 'recipient_not_whitelisted', 'to' => $to_norm ] );
    }

    // Rate-limit: 30 per 10 min.
    $count = (int) get_transient( 'pxz_bridge_count' );
    if ( $count >= 30 ) {
        return new WP_Error( 'pxz_rate_limit', 'rate limit (30/10min)', [ 'status' => 429 ] );
    }
    set_transient( 'pxz_bridge_count', $count + 1, 600 );

    // Tag subject so Dr. Stracke can distinguish source.
    $tagged = '[Local-Staging] ' . $subject;

    $err = '';
    $cb  = function ( $wp_error ) use ( &$err ) {
        if ( $wp_error instanceof WP_Error ) {
            $err = $wp_error->get_error_message();
        }
    };
    add_action( 'wp_mail_failed', $cb );
    $sent = wp_mail( $to_norm, $tagged, $message, is_array( $headers ) ? $headers : [] );
    remove_action( 'wp_mail_failed', $cb );

    return rest_ensure_response( [
        'ok'     => (bool) $sent,
        'sent'   => (bool) $sent,
        'to'     => $to_norm,
        'error'  => $err,
    ] );
}
