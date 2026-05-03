<?php
/**
 * S70 — Cluster „Service + Karriere" konsolidierter Sweep (EN+FR+ES)
 *
 * Pattern-Generation 2.1 (extends S69 — Cleanup optional skipped here):
 *
 *   - BRIDGE-with-content (Klasse A, 2 Pages):
 *       einweisungen (9687, trid 1136) — full translation EN/FR/ES
 *       karriere (9666, trid 1121) — full translation EN/FR/ES, tpl=karriere
 *
 *   - BRIDGE-clen0 (Klasse B, 1 Page):
 *       neupatienten (9688, trid 1137) — DE is shortcode-stub
 *       [pxz_service_form key="neupatienten"], translations get same stub
 *
 *   - UPDATE-clen0 (Klasse A Drift-Fix, 3 Pages):
 *       terminanfrage (4011, trid 813) — existing EN/FR/ES are 2021 legacy
 *           with stale wpforms refs; sync them down to DE shortcode-stub
 *       rezeptbestellung (4014, trid 815) — same
 *       ueberweisung (4017, trid 817) — same
 *
 * Total: 9 BRIDGE + 9 UPDATE = 18 operations on 6 DE pages × 3 languages.
 * Note: arbeitsunfaehigkeit, contact-us, impressum, datenschutzerklaerung-2
 *       are skipped — translations exist with parity-matching content.
 *
 * Out-of-scope (architecture issue, separate sprint):
 *   - Datenschutz-Doppelung Trid 3 (active in theme refs) vs Trid 860
 *     ('-2', orphaned but with publish EN/FR/ES). Cleanup needs Dr.-Stracke
 *     decision; theme has 24+ links to /datenschutzerklaerung/ (Trid 3).
 *   - IT/pt-PT for the same cluster — blocked by template extension (ψ).
 *
 * Glossary compliance (LL-058, inc/i18n-glossary.php):
 *   - einweisung → EN "hospital admission referral" /
 *     FR "bon d'hospitalisation" / ES "orden de ingreso"
 *   - karriere → EN "careers" / FR "carrières" / ES "empleo"
 *   - neupatienten → EN "new patients" / FR "nouveaux patients" /
 *     ES "nuevos pacientes"
 *   - rezept → EN "prescription" / FR "ordonnance" / ES "receta"
 *   - ueberweisung → EN "referral" / FR "lettre d'orientation" /
 *     ES "volante / derivación"
 *
 * Idempotent: Re-Run is safe.
 *
 * Usage:
 *   php s70-cluster-service-karriere.php             # dry-run plan
 *   php s70-cluster-service-karriere.php --commit    # actually apply
 *   php s70-cluster-service-karriere.php --commit --lang=en
 */

define( 'WP_USE_THEMES', false );
$wp_load = '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-load.php';
require $wp_load;

global $wpdb;

$commit = in_array( '--commit', $argv ?? [], true );
$lang_filter = null;
foreach ( $argv ?? [] as $arg ) {
    if ( preg_match( '/^--lang=(en|fr|es)$/', $arg, $m ) ) $lang_filter = $m[1];
}

echo "MODE: " . ( $commit ? "COMMIT" : "DRY-RUN (use --commit to apply)" ) . "\n";
if ( $lang_filter ) echo "LANG-FILTER: {$lang_filter}\n";
echo "\n";

// =========================================================================
// TRANSLATIONS — full content for klasse A (with-content) pages
// =========================================================================

$einweisungen_en = <<<'HTML'
<!-- wp:heading -->
<h2>Hospital admission referral</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>As community-based physicians, we are required to exhaust all outpatient options before issuing a referral for inpatient hospital admission.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>It is also the rule that hospital admission referrals are issued by the treating physician. If, for example, the orthopaedic specialist has recommended surgery, then the orthopaedist must also issue the referral. If, on the other hand, the indication for inpatient treatment is established in our practice, you will receive the referral from us.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Preoperative work-up before hospital admission</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Many hospitals carry out their preoperative work-up themselves. Sometimes the clinic also requests a preoperative work-up (usually labs and ECG) by us. This is only possible if the actual procedure is performed on an outpatient basis. In this case, please bring us the letter from the clinic stating which examinations are requested. Without this documentation, we are unfortunately unable to perform any preoperative work-up. A consultation in the physician's office hours is also mandatory for this work-up — please book an appointment for that. All other examinations must be performed by the clinic as part of a so-called pre-admission stay.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Follow-up care after surgery</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In principle, all surgeons are required to perform follow-up care (dressing changes, suture removal, etc.) themselves. If the surgeon wishes to delegate these tasks to us (this is again only possible for procedures performed on an outpatient basis; otherwise the clinic should arrange a post-admission appointment with you), they must issue a referral that includes the date of surgery and the procedure code. Without this referral, statutory health insurers will not reimburse us for the follow-up care, and we will have to refer you back to the clinic.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>For inpatient procedures, the hospital is required to provide aftercare (including suture and staple removal) for up to three weeks after discharge.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Referral to other specialists</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>As community-based physicians, we must carefully review the indication for a referral to another specialty. If you have a chronic illness that requires regular specialist examinations, the referral can be ordered in advance, with the indication specified (e.g. diabetes mellitus, dialysis-dependent renal failure, …). In all other cases, a prior physician contact in our practice is required.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>For preventive examinations (gynaecologist, colonoscopy, etc.) you may consult these specialists without a referral. For physicians who do not perform statutory preventive examinations, a diagnosis requiring further work-up must be on record before a referral can be issued.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>We do not issue referrals to anaesthesiologists, as this must be done by the physician who has commissioned the anaesthesiologist.</p>
<!-- /wp:paragraph -->
HTML;

$einweisungen_fr = <<<'HTML'
<!-- wp:heading -->
<h2>Bon d'hospitalisation</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En tant que médecins libéraux, nous sommes tenus d'épuiser toutes les options ambulatoires avant d'établir un bon d'hospitalisation.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Il est en outre établi que les bons d'hospitalisation sont délivrés par le médecin traitant. Si, par exemple, l'orthopédiste a recommandé une intervention chirurgicale, c'est lui qui doit également établir le bon. Si en revanche l'indication d'une prise en charge hospitalière est posée dans notre cabinet, c'est nous qui vous remettrons le bon.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Examens préopératoires avant une hospitalisation</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>De nombreux hôpitaux réalisent eux-mêmes les examens préopératoires. Parfois, la clinique souhaite cependant qu'ils soient effectués par nos soins (le plus souvent biologie et ECG). Cela n'est toutefois possible que si l'intervention proprement dite est réalisée en ambulatoire. Dans ce cas, merci de nous apporter le courrier de la clinique précisant les examens souhaités. Sans ce document, nous ne pouvons malheureusement pas réaliser d'examen préopératoire. Une consultation médicale est également indispensable pour cette préparation — merci de prendre rendez-vous à cet effet. Tous les autres examens doivent être réalisés par la clinique dans le cadre d'un séjour dit pré-stationnaire.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Suivi postopératoire</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En principe, tous les chirurgiens sont tenus d'assurer eux-mêmes le suivi postopératoire (changements de pansement, ablation des fils, etc.). Si le chirurgien souhaite déléguer ces tâches à notre cabinet (uniquement possible pour les interventions ambulatoires ; sinon, la clinique doit organiser une consultation post-stationnaire avec vous), il doit nous transmettre une lettre d'orientation indiquant la date de l'intervention et le code opératoire. Sans cette lettre, l'assurance maladie ne nous remboursera pas le suivi et nous serons obligés de vous renvoyer vers la clinique.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Pour les interventions hospitalisées, l'établissement est tenu d'assurer le suivi (y compris l'ablation des fils et des agrafes) jusqu'à trois semaines après la sortie.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Orientation vers d'autres spécialistes</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En tant que médecins libéraux, nous devons vérifier précisément l'indication d'une orientation vers une autre spécialité. Si vous souffrez d'une maladie chronique nécessitant des examens spécialisés réguliers, cette orientation peut être commandée à l'avance avec l'indication précisée (p. ex. diabète sucré, insuffisance rénale dialysée, …). Dans tous les autres cas, un contact préalable avec un médecin de notre cabinet est nécessaire.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Pour les examens préventifs (gynécologue, coloscopie, etc.) vous pouvez consulter ces spécialistes sans orientation. Pour les médecins qui ne pratiquent pas d'examens préventifs réglementaires, un diagnostic à clarifier doit être documenté avant qu'une orientation puisse être délivrée.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Nous n'établissons pas d'orientation vers les anesthésistes : cela doit être fait par le médecin qui a missionné l'anesthésiste.</p>
<!-- /wp:paragraph -->
HTML;

$einweisungen_es = <<<'HTML'
<!-- wp:heading -->
<h2>Orden de ingreso hospitalario</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Como médicos en consulta, estamos obligados a agotar todas las opciones ambulatorias antes de emitir una orden de ingreso hospitalario.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Asimismo, las órdenes de ingreso hospitalario son emitidas por el médico tratante. Si, por ejemplo, el ortopedista ha recomendado una intervención quirúrgica, también debe ser él quien emita la orden de ingreso. Si, por el contrario, la indicación de tratamiento hospitalario se establece en nuestra consulta, le entregaremos nosotros la orden.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Examen preoperatorio antes del ingreso hospitalario</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Muchos hospitales realizan ellos mismos sus exámenes preoperatorios. A veces, sin embargo, la clínica solicita que el examen preoperatorio (habitualmente analítica y ECG) se realice en nuestra consulta. Esto solo es posible si la intervención propiamente dicha se realiza de forma ambulatoria. En ese caso, le rogamos traer el escrito de la clínica indicando qué exámenes se solicitan. Sin esta documentación no podemos lamentablemente realizar el examen preoperatorio. Para esta preparación es además imprescindible una consulta médica — le pedimos concertar una cita. Todos los demás exámenes deben ser realizados por la clínica en el marco de la llamada estancia preadmisión.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Seguimiento tras la intervención</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En principio, todos los cirujanos están obligados a realizar ellos mismos el seguimiento postoperatorio (cambios de apósito, retirada de puntos, etc.). Si el cirujano desea delegar estas tareas en nosotros (también aquí únicamente para intervenciones ambulatorias; en caso contrario, la clínica debería concertar con usted una cita post-hospitalaria), debe emitir un volante con la fecha de la intervención y el código quirúrgico. Sin este volante, los seguros médicos no nos reembolsan el seguimiento y tendremos que remitirle de nuevo a la clínica.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>En las intervenciones hospitalarias, el centro está obligado a asumir el seguimiento (incluida la retirada de puntos y grapas) hasta tres semanas después del alta.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Derivación a otros especialistas</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Como médicos en consulta, debemos comprobar con detenimiento la indicación para una derivación a otra especialidad. Si padece una enfermedad crónica que requiere exámenes regulares por un especialista, la derivación puede solicitarse con antelación indicando el diagnóstico (p. ej. diabetes mellitus, insuficiencia renal con tratamiento de diálisis, …). En todos los demás casos, es necesario un contacto previo con un médico en nuestra consulta.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Para los exámenes preventivos (ginecólogo, colonoscopia, etc.) puede acudir directamente al especialista sin derivación. Para los médicos que no realizan exámenes preventivos legales, debe existir un diagnóstico que requiera aclaración antes de poder emitir una derivación.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>No emitimos derivaciones a anestesistas, ya que esto debe ser realizado por el médico que solicita al anestesista.</p>
<!-- /wp:paragraph -->
HTML;

// -------------------------------------------------------------------------

$karriere_en = <<<'HTML'
<!-- wp:paragraph {"className":"pxz-karriere-intro"} -->
<p class="pxz-karriere-intro">Become part of our team at GP Medical Center Westend. We offer you a secure, modern workplace in the heart of Frankfurt, flexible working hours and the opportunity to apply your expertise within an interdisciplinary medical team.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2,"anchor":"bewerben"} -->
<h2 id="bewerben">Apply now as a medical assistant (MFA)</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Send us your application directly via the form below. We will usually get back to you within a few days.</p>
<!-- /wp:paragraph -->

<!-- wp:shortcode -->
[wpforms id="9664" title="false"]
<!-- /wp:shortcode -->

<!-- wp:paragraph {"className":"pxz-karriere-note"} -->
<p class="pxz-karriere-note">You can also reach us by email at <a href="mailto:praxis@westend-hausarzt.de">praxis@westend-hausarzt.de</a>.</p>
<!-- /wp:paragraph -->
HTML;

$karriere_fr = <<<'HTML'
<!-- wp:paragraph {"className":"pxz-karriere-intro"} -->
<p class="pxz-karriere-intro">Rejoignez notre équipe au GP Medical Center Westend. Nous vous offrons un poste stable et moderne au cœur de Francfort, des horaires flexibles et la possibilité de mettre votre expertise au service d'une équipe médicale interdisciplinaire.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2,"anchor":"bewerben"} -->
<h2 id="bewerben">Postulez dès maintenant comme assistante médicale (MFA)</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Envoyez-nous votre candidature directement via le formulaire ci-dessous. Nous revenons généralement vers vous dans un délai de quelques jours.</p>
<!-- /wp:paragraph -->

<!-- wp:shortcode -->
[wpforms id="9664" title="false"]
<!-- /wp:shortcode -->

<!-- wp:paragraph {"className":"pxz-karriere-note"} -->
<p class="pxz-karriere-note">Vous pouvez également nous joindre par e-mail à <a href="mailto:praxis@westend-hausarzt.de">praxis@westend-hausarzt.de</a>.</p>
<!-- /wp:paragraph -->
HTML;

$karriere_es = <<<'HTML'
<!-- wp:paragraph {"className":"pxz-karriere-intro"} -->
<p class="pxz-karriere-intro">Únase a nuestro equipo en el GP Medical Center Westend. Le ofrecemos un puesto estable y moderno en pleno centro de Fráncfort, horarios flexibles y la posibilidad de aportar su experiencia a un equipo médico interdisciplinar.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2,"anchor":"bewerben"} -->
<h2 id="bewerben">Postule ahora como asistente médico (MFA)</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Envíenos su candidatura directamente a través del formulario más abajo. Le responderemos habitualmente en pocos días.</p>
<!-- /wp:paragraph -->

<!-- wp:shortcode -->
[wpforms id="9664" title="false"]
<!-- /wp:shortcode -->

<!-- wp:paragraph {"className":"pxz-karriere-note"} -->
<p class="pxz-karriere-note">También puede escribirnos por correo a <a href="mailto:praxis@westend-hausarzt.de">praxis@westend-hausarzt.de</a>.</p>
<!-- /wp:paragraph -->
HTML;

// =========================================================================
// PLANS
// =========================================================================

// Bridge with content (Klasse A): einweisungen + karriere
$bridge_with_content = [
    9687 => [ // einweisungen, trid 1136
        'de_slug' => 'einweisungen',
        'tpl' => 'template-standard.php',
        'translations' => [
            'en' => [
                'title' => 'Admissions and referrals',
                'slug'  => 'admissions-and-referrals',
                'content' => $einweisungen_en,
            ],
            'fr' => [
                'title' => 'Admissions et orientations',
                'slug'  => 'admissions-et-orientations',
                'content' => $einweisungen_fr,
            ],
            'es' => [
                'title' => 'Ingresos y derivaciones',
                'slug'  => 'ingresos-y-derivaciones',
                'content' => $einweisungen_es,
            ],
        ],
    ],
    9666 => [ // karriere, trid 1121
        'de_slug' => 'karriere',
        'tpl' => 'template-karriere.php',
        'translations' => [
            'en' => [
                'title' => 'Careers',
                'slug'  => 'careers',
                'content' => $karriere_en,
            ],
            'fr' => [
                'title' => 'Carrière',
                'slug'  => 'carriere',
                'content' => $karriere_fr,
            ],
            'es' => [
                'title' => 'Empleo',
                'slug'  => 'empleo',
                'content' => $karriere_es,
            ],
        ],
    ],
];

// Bridge clen=0 (Klasse B): neupatienten — DE is shortcode-stub
$de_neupatienten_content = get_post_field( 'post_content', 9688 );
$bridge_clen0 = [
    9688 => [ // neupatienten, trid 1137
        'de_slug' => 'neupatienten',
        'tpl' => 'template-standard.php',
        'translations' => [
            'en' => [ 'title' => 'New patients',     'slug' => 'new-patients',     'content' => $de_neupatienten_content ],
            'fr' => [ 'title' => 'Nouveaux patients','slug' => 'nouveaux-patients','content' => $de_neupatienten_content ],
            'es' => [ 'title' => 'Nuevos pacientes', 'slug' => 'nuevos-pacientes', 'content' => $de_neupatienten_content ],
        ],
    ],
];

// Update clen=0 (Drift-Fix): terminanfrage / rezeptbestellung / ueberweisung
// Existing 2021 EN/FR/ES carry stale wpforms refs; sync down to DE shortcode-stub.
$de_term_content = get_post_field( 'post_content', 4011 );
$de_rezept_content = get_post_field( 'post_content', 4014 );
$de_ueber_content = get_post_field( 'post_content', 4017 );

$update_clen0 = [
    // [DE-ID, lang, target-ID, new title, new content, slug-keep]
    [ 4011, 'en', 4416, 'Appointment request', $de_term_content ],
    [ 4011, 'fr', 4410, 'Prise de rendez-vous', $de_term_content ],
    [ 4011, 'es', 4406, 'Solicitar cita', $de_term_content ],

    [ 4014, 'en', 4400, 'Prescription order', $de_rezept_content ],
    [ 4014, 'fr', 4396, 'Demande d\'ordonnance', $de_rezept_content ],
    [ 4014, 'es', 4390, 'Pedido de receta', $de_rezept_content ],

    [ 4017, 'en', 4384, 'Request referral', $de_ueber_content ],
    [ 4017, 'fr', 4380, 'Demande de transfert', $de_ueber_content ],
    [ 4017, 'es', 4374, 'Solicitar derivación', $de_ueber_content ],
];

// =========================================================================
// HELPERS
// =========================================================================

function s70_get_trid( $de_id ) {
    global $wpdb;
    return (int) $wpdb->get_var( $wpdb->prepare(
        "SELECT trid FROM {$wpdb->prefix}icl_translations
         WHERE element_id = %d AND element_type = 'post_page' AND language_code = 'de'",
        $de_id
    ) );
}

function s70_get_translation_id( $trid, $lang ) {
    global $wpdb;
    return (int) $wpdb->get_var( $wpdb->prepare(
        "SELECT element_id FROM {$wpdb->prefix}icl_translations
         WHERE trid = %d AND element_type = 'post_page' AND language_code = %s",
        $trid, $lang
    ) );
}

function s70_bridge_create( $de_id, $lang, $title, $slug, $content, $tpl, $commit ) {
    global $wpdb;
    $trid = s70_get_trid( $de_id );
    if ( ! $trid ) return [ 'ERROR', "no DE trid for {$de_id}" ];

    $existing = s70_get_translation_id( $trid, $lang );
    if ( $existing ) return [ 'EXISTS', "trid={$trid} {$lang}={$existing}" ];

    if ( ! $commit ) {
        return [ 'PLAN', "BRIDGE de={$de_id} trid={$trid} →{$lang}/{$slug} clen=" . strlen( $content ) ];
    }

    // Insert post
    $new_id = wp_insert_post([
        'post_title'    => $title,
        'post_name'     => $slug,
        'post_content'  => $content,
        'post_status'   => 'publish',
        'post_type'     => 'page',
        'post_author'   => 1,
        'comment_status'=> 'closed',
        'ping_status'   => 'closed',
    ], true );
    if ( is_wp_error( $new_id ) ) return [ 'ERROR', $new_id->get_error_message() ];

    if ( $tpl ) update_post_meta( $new_id, '_wp_page_template', $tpl );

    // Pattern-Gen-2.2 (S70 fix): wp_insert_post triggers WPML's save_post hook
    // which auto-creates an icl_translations row with a NEW trid + lang='de'.
    // Unique constraint on (element_type, element_id) blocks naive INSERT, so
    // we UPDATE the auto-created row to point at the target trid + correct lang.
    $r = $wpdb->update( "{$wpdb->prefix}icl_translations",
        [ 'trid' => $trid, 'language_code' => $lang, 'source_language_code' => 'de' ],
        [ 'element_type' => 'post_page', 'element_id' => $new_id ]
    );
    if ( $r === false ) return [ 'ERROR', "wpml-link UPDATE failed: " . $wpdb->last_error ];

    return [ 'CREATED', "→ID={$new_id} clen=" . strlen( $content ) ];
}

function s70_update_existing( $de_id, $lang, $target_id, $title, $content, $commit ) {
    $trid = s70_get_trid( $de_id );
    if ( ! $trid ) return [ 'ERROR', "no DE trid for {$de_id}" ];

    $tr_id = s70_get_translation_id( $trid, $lang );
    if ( $tr_id !== $target_id ) {
        return [ 'ERROR', "expected target {$target_id}, found {$tr_id} for trid {$trid} lang {$lang}" ];
    }

    $cur_content = get_post_field( 'post_content', $target_id );
    $cur_title   = get_post_field( 'post_title',   $target_id );

    if ( $cur_content === $content && $cur_title === $title ) {
        return [ 'NOOP', "byte-identical (clen=" . strlen( $content ) . ")" ];
    }

    if ( ! $commit ) {
        return [ 'PLAN', "UPDATE id={$target_id} clen " . strlen( $cur_content ) . " → " . strlen( $content ) ];
    }

    $r = wp_update_post([
        'ID'           => $target_id,
        'post_title'   => $title,
        'post_content' => $content,
    ], true );
    if ( is_wp_error( $r ) ) return [ 'ERROR', $r->get_error_message() ];

    return [ 'UPDATED', "id={$target_id} clen=" . strlen( $content ) ];
}

// =========================================================================
// EXECUTE
// =========================================================================

$counters = [];

echo "--- Phase 1: BRIDGE-with-content (einweisungen + karriere) ---\n";
foreach ( $bridge_with_content as $de_id => $cfg ) {
    foreach ( $cfg['translations'] as $lang => $t ) {
        if ( $lang_filter && $lang !== $lang_filter ) continue;
        [ $st, $msg ] = s70_bridge_create(
            $de_id, $lang, $t['title'], $t['slug'], $t['content'], $cfg['tpl'], $commit
        );
        $counters[ $st ] = ( $counters[ $st ] ?? 0 ) + 1;
        printf( "  [%-7s] %-22s %s → %s\n", $st, $cfg['de_slug'], $lang, $msg );
    }
}
echo "\n";

echo "--- Phase 2: BRIDGE-clen0 (neupatienten) ---\n";
foreach ( $bridge_clen0 as $de_id => $cfg ) {
    foreach ( $cfg['translations'] as $lang => $t ) {
        if ( $lang_filter && $lang !== $lang_filter ) continue;
        [ $st, $msg ] = s70_bridge_create(
            $de_id, $lang, $t['title'], $t['slug'], $t['content'], $cfg['tpl'], $commit
        );
        $counters[ $st ] = ( $counters[ $st ] ?? 0 ) + 1;
        printf( "  [%-7s] %-22s %s → %s\n", $st, $cfg['de_slug'], $lang, $msg );
    }
}
echo "\n";

echo "--- Phase 3: UPDATE-clen0 (Drift-Fix Stub) ---\n";
foreach ( $update_clen0 as $row ) {
    [ $de_id, $lang, $target_id, $title, $content ] = $row;
    if ( $lang_filter && $lang !== $lang_filter ) continue;
    [ $st, $msg ] = s70_update_existing( $de_id, $lang, $target_id, $title, $content, $commit );
    $counters[ $st ] = ( $counters[ $st ] ?? 0 ) + 1;
    printf( "  [%-7s] de=%-5d %s id=%-5d → %s\n", $st, $de_id, $lang, $target_id, $msg );
}
echo "\n";

// =========================================================================
// SUMMARY
// =========================================================================

echo "=== SUMMARY ===\n";
foreach ( $counters as $k => $v ) printf( "  %s: %d\n", $k, $v );
$err = ( $counters['ERROR'] ?? 0 );
echo "\n" . ( $err ? "FAIL ({$err} errors)" : ( $commit ? "OK (committed)" : "OK (dry-run)" ) ) . "\n";
exit( $err ? 1 : 0 );
