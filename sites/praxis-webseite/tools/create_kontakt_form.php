<?php
/**
 * Create (or update) the contact WPForms form for /kontakt/.
 * Run via: wp eval-file tools/create_kontakt_form.php
 *
 * Idempotent: if a form with the marker pxz_kontakt_form_v1 already exists,
 * it is updated in place. Otherwise a new form is created and tagged.
 *
 * Marker pattern matches template-kontakt.php (form_id lookup by meta_value).
 */

if ( ! function_exists( 'wpforms' ) ) {
    echo "WPForms plugin not active — abort.\n";
    return;
}

$form_title = 'Kontakt';
$marker     = 'pxz_kontakt_form_v1';

// Look for existing form tagged with our marker.
$existing = get_posts( [
    'post_type'      => 'wpforms',
    'post_status'    => 'any',
    'posts_per_page' => -1,
    'meta_key'       => 'pxz_marker',
    'meta_value'     => $marker,
    'fields'         => 'ids',
] );

$form_data = [
    'id'       => 0,
    'field_id' => 7,
    'fields'   => [
        1 => [
            'id'       => 1,
            'type'     => 'name',
            'label'    => 'Ihr Name',
            'format'   => 'first-last',
            'size'     => 'medium',
            'required' => '1',
        ],
        2 => [
            'id'       => 2,
            'type'     => 'email',
            'label'    => 'E-Mail-Adresse',
            'size'     => 'medium',
            'required' => '1',
        ],
        3 => [
            'id'       => 3,
            'type'     => 'phone',
            'label'    => 'Telefonnummer (optional)',
            'format'   => 'international',
            'size'     => 'medium',
            'required' => '0',
        ],
        4 => [
            'id'         => 4,
            'type'       => 'select',
            'label'      => 'Ihr Anliegen',
            'size'       => 'medium',
            'required'   => '1',
            'choices'    => [
                1 => [ 'label' => 'Allgemeine Frage',           'value' => 'allgemein'   ],
                2 => [ 'label' => 'Terminanfrage',              'value' => 'termin'      ],
                3 => [ 'label' => 'Rezept- oder Überweisungsanfrage', 'value' => 'rezept' ],
                4 => [ 'label' => 'Feedback',                   'value' => 'feedback'    ],
                5 => [ 'label' => 'Sonstiges',                  'value' => 'sonstiges'   ],
            ],
            'placeholder' => 'Bitte auswählen',
            'choices_images' => '',
        ],
        5 => [
            'id'          => 5,
            'type'        => 'textarea',
            'label'       => 'Ihre Nachricht',
            'description' => 'Bitte senden Sie uns über dieses Formular <strong>keine Gesundheitsdaten, Symptome oder Diagnosen</strong>. Für medizinische Anliegen rufen Sie uns bitte an oder vereinbaren Sie einen Termin.',
            'size'        => 'medium',
            'required'    => '1',
        ],
        6 => [
            'id'              => 6,
            'type'            => 'checkbox',
            'label'           => 'Datenschutz',
            'label_hide'      => '1',
            'choices'         => [
                1 => [
                    'label' => 'Ich willige ein, dass meine Angaben zur Bearbeitung meiner Anfrage elektronisch erhoben und gespeichert werden. Hinweise zum Umgang mit Ihren Daten finden Sie in unserer <a href="/datenschutz/" target="_blank" rel="noopener">Datenschutzerklärung</a>.',
                    'value' => '1',
                ],
            ],
            'choices_images'  => '',
            'required'        => '1',
            'input_columns'   => '',
        ],
    ],
    'settings' => [
        'form_title'             => $form_title,
        'form_desc'              => '',
        'form_class'             => 'pxz-kontakt-wpforms-form',
        'submit_text'            => 'Nachricht senden',
        'submit_text_processing' => 'Wird gesendet …',
        'submit_class'           => 'pxz-btn pxz-btn-amber',
        'honeypot'               => '1',
        'antispam_v3'            => '1',
        'dynamic_population'     => '0',
        'notifications'          => [
            1 => [
                'notification_name' => 'Kontaktanfrage an Praxis',
                'email'             => 'praxis@westend-hausarzt.de',
                'subject'           => 'Neue Kontaktanfrage ({field_id="4"}) von {field_id="1"}',
                'sender_name'       => '{site_name}',
                'sender_address'    => '{admin_email}',
                'replyto'           => '{field_id="2"}',
                'message'           => "Neue Kontaktanfrage über die Website:\n\n{all_fields}",
            ],
        ],
        'confirmations' => [
            1 => [
                'type'           => 'message',
                'message'        => '<h3 style="margin:0 0 0.75rem;color:#f6b23c;">Vielen Dank!</h3><p>Ihre Nachricht ist bei uns eingegangen. Wir melden uns in den nächsten Tagen bei Ihnen.</p>',
                'message_scroll' => '1',
                'name'           => 'Standard-Bestätigung',
            ],
        ],
    ],
    'meta' => [
        'template' => 'blank',
    ],
];

if ( ! empty( $existing ) ) {
    $form_id                             = (int) $existing[0];
    $form_data['id']                     = $form_id;
    $form_data['settings']['form_title'] = $form_title;
    $post_content                        = wp_slash( wp_json_encode( $form_data ) );
    wp_update_post( [
        'ID'           => $form_id,
        'post_title'   => $form_title,
        'post_content' => $post_content,
        'post_status'  => 'publish',
    ] );
    echo "updated existing form id={$form_id}\n";
} else {
    $form_id = wp_insert_post( [
        'post_type'    => 'wpforms',
        'post_status'  => 'publish',
        'post_title'   => $form_title,
        'post_excerpt' => '',
        'post_content' => '',
    ] );
    $form_data['id'] = (int) $form_id;
    $post_content   = wp_slash( wp_json_encode( $form_data ) );
    wp_update_post( [
        'ID'           => $form_id,
        'post_content' => $post_content,
    ] );
    update_post_meta( $form_id, 'pxz_marker', $marker );
    echo "created new form id={$form_id}\n";
}

echo "SHORTCODE: [wpforms id=\"{$form_id}\" title=\"false\"]\n";
