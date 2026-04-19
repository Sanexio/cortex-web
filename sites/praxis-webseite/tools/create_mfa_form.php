<?php
/**
 * Create (or update) the MFA application WPForms form.
 * Run via: wp eval-file tools/create_mfa_form.php
 *
 * Idempotent: if a form with the given slug marker already exists, it is updated.
 */

if ( ! function_exists( 'wpforms' ) ) {
    echo "WPForms plugin not active — abort.\n";
    return;
}

$form_title = 'Bewerbung MFA';
$marker     = 'pxz_mfa_application_v1';

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
    'field_id' => 8,
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
            'label'    => 'Telefonnummer',
            'format'   => 'international',
            'size'     => 'medium',
            'required' => '1',
        ],
        4 => [
            'id'          => 4,
            'type'        => 'textarea',
            'label'       => 'Ihre Nachricht an uns',
            'description' => 'Erzählen Sie uns kurz, warum Sie sich bei uns bewerben und welche Qualifikationen Sie mitbringen.',
            'size'        => 'medium',
            'required'    => '0',
        ],
        5 => [
            'id'              => 5,
            'type'            => 'file-upload',
            'label'           => 'Lebenslauf und Zeugnisse',
            'description'     => 'Bitte laden Sie Ihren Lebenslauf und relevante Zeugnisse als PDF hoch (max. 5 Dateien, jeweils bis 10 MB).',
            'extensions'      => 'pdf,doc,docx,jpg,jpeg,png',
            'max_size'        => '10',
            'max_file_number' => '5',
            'required'        => '1',
            'style'           => 'modern',
            'media_library'   => '0',
        ],
        6 => [
            'id'              => 6,
            'type'            => 'checkbox',
            'label'           => 'Datenschutz',
            'label_hide'      => '1',
            'choices'         => [
                1 => [
                    'label' => 'Ich willige ein, dass meine Angaben und Daten zur Bearbeitung meiner Bewerbung elektronisch erhoben und gespeichert werden. Hinweise zum Umgang mit Ihren Daten finden Sie in unserer <a href="/datenschutz/" target="_blank" rel="noopener">Datenschutzerklärung</a>.',
                    'value' => '1',
                ],
            ],
            'choices_images'  => '',
            'required'        => '1',
            'input_columns'   => '',
        ],
    ],
    'settings' => [
        'form_title'                   => $form_title,
        'form_desc'                    => '',
        'form_class'                   => 'pxz-mfa-form',
        'submit_text'                  => 'Bewerbung absenden',
        'submit_text_processing'       => 'Wird gesendet …',
        'submit_class'                 => 'pxz-btn pxz-btn-amber',
        'honeypot'                     => '1',
        'antispam_v3'                  => '1',
        'dynamic_population'           => '0',
        'notifications'                => [
            1 => [
                'notification_name'              => 'Bewerbung an Praxis',
                'email'                          => 'praxis@westend-hausarzt.de',
                'subject'                        => 'Neue MFA-Bewerbung von {field_id="1"}',
                'sender_name'                    => '{site_name}',
                'sender_address'                 => '{admin_email}',
                'replyto'                        => '{field_id="2"}',
                'message'                        => "Neue Bewerbung über die Website:\n\n{all_fields}",
                'file_upload_attachment_enable'  => '1',
            ],
        ],
        'confirmations' => [
            1 => [
                'type'           => 'message',
                'message'        => '<h3 style="margin:0 0 0.75rem;color:#f6b23c;">Vielen Dank!</h3><p>Ihre Bewerbung ist bei uns eingegangen. Wir melden uns zeitnah bei Ihnen.</p>',
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
    $form_id                = (int) $existing[0];
    $form_data['id']        = $form_id;
    $form_data['settings']['form_title'] = $form_title;
    $post_content           = wp_slash( wp_json_encode( $form_data ) );
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
