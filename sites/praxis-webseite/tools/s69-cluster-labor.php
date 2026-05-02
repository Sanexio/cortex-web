<?php
/**
 * S69 — Cluster „Labor" (EN+FR+ES) konsolidierter Sweep + Cleanup
 *
 * Pattern-Generation 2.1 (Cluster-Sweep mit Cleanup) — extends S68:
 *
 *   - CLEANUP-Mode (NEW in S69):
 *       Hard-deletes 13 unused pages (DE drafts, WPML orphans, importer junk)
 *       via wp_delete_post($id, true). Cascades wp_icl_translations + meta.
 *       Aktiviert durch User-Direktive S69 / 2026-05-03:
 *       „Hard-Delete, ich will keinen Ballast auf der Seite mit mir rumschleppen."
 *       Persistiert als Memory feedback_no_legacy_ballast_hard_delete.md.
 *
 *   - BRIDGE-Mode (clen=0): 9 Detail-Pages (template-detail-page.php),
 *     DE-Slug invariant, content empty. Identisch zu S68 Klasse B.
 *
 *   - BRIDGE-Mode (with-content): Hub `labor` ES neu + `rund-ums-labor`
 *     EN/FR/ES neu. Lokalisierte Slugs (slug_override pro Translation).
 *     Volltext-Übersetzung des DE-Inhalts.
 *
 *   - UPDATE-Mode (Klasse A): Hub `labor` EN+FR Drift-Fix
 *     (existing 4855/4849, post_content + post_title überschreiben,
 *     Slug erhalten für SEO).
 *
 * Cluster „Labor" Inventar (11 aktive DE-Pages, post-cleanup):
 *   Klasse A (UPDATE, 1): labor (Hub, trid 551) — EN+FR Drift-Fix
 *   Klasse A (BRIDGE-with-content, 2): labor ES, rund-ums-labor EN/FR/ES
 *   Klasse B (BRIDGE clen=0, 9): status-baseline, status-advanced,
 *     status-prevent, system-immune, system-renal, system-liver,
 *     stoffwechsel, biohack, risikoprofil
 *
 * Total Operationen: 13 cleanup + 33 sweep (2 update + 4 bridge-content +
 * 27 bridge-clen0) = 46 operations.
 *
 * Idempotent: Re-Run ist sicher.
 *   - Cleanup: not-found Page → SKIP
 *   - Bridge: existing translation → EXISTS (skip)
 *   - Update: existing translation → re-update (byte-identical)
 *
 * Glossary compliance (LL-058):
 *   - Labor → EN "laboratory diagnostics" / FR "diagnostic de laboratoire" /
 *     ES "laboratorio" (Kurzform per Dr. Stracke S69)
 *   - Stoffwechsel → EN "metabolism" / FR "métabolisme" / ES "metabolismo"
 *   - Risikoprofil → EN "risk profile" / FR "profil de risque" /
 *     ES "perfil de riesgo"
 *   - Genetik-Beratung → EN "genetic counseling" / FR "conseil génétique" /
 *     ES "asesoramiento genético"
 *   - Status Baseline/Advanced/Prevent: invariant (Sanexio brand naming,
 *     gem. nav-data.php $l_checkup_*).
 *
 * Usage:
 *   php s69-cluster-labor.php           # dry-run (show plan)
 *   php s69-cluster-labor.php --commit  # actually apply
 *   php s69-cluster-labor.php --commit --lang=en        # only EN ops
 *   php s69-cluster-labor.php --commit --skip-cleanup   # skip phase 0
 */

define( 'WP_USE_THEMES', false );
$wp_load = '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-load.php';
require $wp_load;

global $wpdb;

$commit  = in_array( '--commit', $argv ?? [], true );
$skip_cleanup = in_array( '--skip-cleanup', $argv ?? [], true );
$lang_filter = null;
foreach ( $argv ?? [] as $arg ) {
    if ( preg_match( '/^--lang=(en|fr|es)$/', $arg, $m ) ) {
        $lang_filter = $m[1];
    }
}

echo "MODE: " . ( $commit ? "COMMIT" : "DRY-RUN (use --commit to apply)" ) . "\n";
if ( $lang_filter ) echo "LANG-FILTER: {$lang_filter}\n";
if ( $skip_cleanup ) echo "SKIP-CLEANUP: yes\n";
echo "\n";

// ==========================================================================
// CLEANUP — Hard-Delete unused pages (Dr. Stracke directive S69)
// ==========================================================================
//
// 13 pages identified by audit:
//   - 475: rund-ums-labor-legacy-475 (DE draft, trid 628)
//   - 4452, 4442, 4438: WPML-AT orphans of trid 628 (no DE counterpart)
//   - 9869–9877 (9): bloody-check-* + labor-* DE drafts (importer junk,
//     trids 14740–14748)
//
// Live-reference audit pre-cleanup (grep theme + DB joins): 0 references.
// Asset filenames in inc/data/page-hub-*.php (labor-mini-check-up.png etc.)
// are upload paths, not page slugs — unaffected by hard-delete.

$cleanup_ids = [
    475   => 'rund-ums-labor-legacy-475 (DE draft, trid 628)',
    4438  => 'en-torno-al-laboratorio (ES orphan, trid 628)',
    4442  => 'au-sujet-du-laboratoire (FR orphan, trid 628)',
    4452  => 'all-around-the-laboratory (EN orphan, trid 628)',
    9869  => 'bloody-check (DE draft, importer junk, trid 14740)',
    9871  => 'bloody-check-risikolabor-kopie (DE draft, trid 14742)',
    9872  => 'bloody-check-risikolabor-kopie-1 (DE draft, trid 14743)',
    9873  => 'bloody-check-stoffwechsel-kopie (DE draft, trid 14744)',
    9874  => 'labor-abwehr-immunsystem (DE draft, trid 14745)',
    9875  => 'labor-pravention (DE draft, trid 14746)',
    9876  => 'labor-check-up (DE draft, trid 14747)',
    9877  => 'labor-mini-check-up (DE draft, trid 14748)',
    9707  => null, // placeholder — RESERVED (rund-ums-labor publish, KEEP — verify in audit)
];
// rund-ums-labor (9707) is published and live-linked from page-hub-leistungen.php.
// MUST NOT be cleaned — translated instead. Removed from cleanup map below.
unset( $cleanup_ids[9707] );

// ==========================================================================
// BRIDGE-Mode pages (Klasse B, 9 detail pages, content empty, DE-slug invariant)
// ==========================================================================

$bridge_pages_clen0 = [

    9850 => [ 'slug' => 'status-baseline',
        'translations' => [
            'en' => [ 'title' => 'Status Baseline',  'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Status Baseline',  'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Status Baseline',  'content' => '', 'meta' => [] ],
        ],
    ],
    9851 => [ 'slug' => 'status-advanced',
        'translations' => [
            'en' => [ 'title' => 'Status Advanced',  'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Status Advanced',  'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Status Advanced',  'content' => '', 'meta' => [] ],
        ],
    ],
    9852 => [ 'slug' => 'status-prevent',
        'translations' => [
            'en' => [ 'title' => 'Status Prevent',   'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Status Prevent',   'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Status Prevent',   'content' => '', 'meta' => [] ],
        ],
    ],
    9853 => [ 'slug' => 'system-immune',
        'translations' => [
            'en' => [ 'title' => 'Immune System',         'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Système immunitaire',   'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Sistema inmunitario',   'content' => '', 'meta' => [] ],
        ],
    ],
    9854 => [ 'slug' => 'system-renal',
        'translations' => [
            'en' => [ 'title' => 'Kidneys',          'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Reins',            'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Riñones',          'content' => '', 'meta' => [] ],
        ],
    ],
    9855 => [ 'slug' => 'system-liver',
        'translations' => [
            'en' => [ 'title' => 'Liver',            'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Foie',             'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Hígado',           'content' => '', 'meta' => [] ],
        ],
    ],
    9856 => [ 'slug' => 'stoffwechsel',
        'translations' => [
            'en' => [ 'title' => 'Metabolism',       'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Métabolisme',      'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Metabolismo',      'content' => '', 'meta' => [] ],
        ],
    ],
    9857 => [ 'slug' => 'biohack',
        'translations' => [
            'en' => [ 'title' => 'Genetic Counseling',   'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Conseil génétique',    'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Asesoramiento genético', 'content' => '', 'meta' => [] ],
        ],
    ],
    9858 => [ 'slug' => 'risikoprofil',
        'translations' => [
            'en' => [ 'title' => 'Risk Profile',         'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Profil de risque',     'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Perfil de riesgo',     'content' => '', 'meta' => [] ],
        ],
    ],
];

// ==========================================================================
// BRIDGE-Mode pages (Klasse A, with content + localized slug-override)
// Used for: Hub-`labor` ES (no existing translation) + rund-ums-labor EN/FR/ES.
// ==========================================================================

$labor_hub_es_content = <<<'HTML'
<!-- wp:paragraph -->
<p>Una parte importante de nuestro diagnóstico interno se basa en valores de laboratorio obtenidos a partir de sangre, orina o heces. Tomamos las muestras en la consulta y las enviamos según la indicación a la asociación de laboratorio o a nuestro laboratorio especializado externo (Synlab). Comentamos los resultados en la consulta de seguimiento.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Qué parámetros determinamos</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li>Hemograma básico y completo (análisis de las células sanguíneas, células maduras/inmaduras)</li><li>Función renal (creatinina, urea, FGe)</li><li>Valores hepáticos y biliares</li><li>Páncreas (lipasa, amilasa)</li><li>Valores tiroideos (TSH, T3 libre, T4 libre, anticuerpos si procede)</li><li>Enzimas cardíacas (troponina de alta sensibilidad si procede)</li><li>Parámetros de inflamación (PCR, VSG, leucocitos)</li><li>Coagulación (Quick, INR, PTT)</li><li>Metabolismo lipídico — colesterol total, HDL, LDL, triglicéridos</li><li>Electrolitos (potasio, sodio, calcio, magnesio)</li><li>HbA1c (azúcar a largo plazo) y glucosa en ayunas</li><li>Marcadores tumorales como parámetros de seguimiento</li><li>Borrelias tras picadura de garrapata, clamidias, parásitos intestinales</li><li>Intolerancia a la lactosa y al gluten</li><li>Factor reumatoide y anticuerpos autoinmunes</li><li>Virus de Epstein-Barr (p. ej. en mononucleosis infecciosa)</li><li>Anticuerpos para el control del estado vacunal</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Cómo se realiza la extracción de sangre</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La extracción de sangre es un componente indispensable en el diagnóstico de muchas enfermedades. Sin embargo, durante la extracción, el almacenamiento y el transporte al laboratorio pueden producirse errores que afecten al resultado de tal manera que su interpretación sea solo limitada. Cuidamos los procesos estandarizados: orden correcto de extracción de los tubos, transporte inmediato para parámetros sensibles a la temperatura, muestras en ayunas para los valores metabólicos.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Si para una cita debe acudir en ayunas, se lo indicamos expresamente al concertarla. En ayunas significa: al menos 8 horas sin alimentos, sin bebidas azucaradas — agua y té sin azúcar están permitidos.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Orina de 24 horas y otros tipos de muestra</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Para determinadas indicaciones es necesaria su colaboración. En la orina de 24 horas, recoge durante un día completo toda la orina en un recipiente que le entregamos en la consulta. Lo mismo se aplica a las muestras de heces (p. ej. ante sospecha de parásitos intestinales). Le explicamos el procedimiento por escrito y personalmente antes de la entrega del recipiente.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Consulta de resultados</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La mayoría de los valores está disponible en uno o dos días laborables. Comentamos los resultados en la consulta de seguimiento o — en hallazgos rutinarios sin alteraciones y con su consentimiento — por teléfono. Los valores alterados los aclaramos siempre personalmente.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Alternativa privada</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nuestro socio Sanexio ofrece con el <a href="/basic-check/">Basic-Check</a> un análisis de laboratorio privado compacto con 15 parámetros — también reservable directamente en línea, con extracción en nuestra consulta.</p>
<!-- /wp:paragraph -->
HTML;

$labor_hub_en_content = <<<'HTML'
<!-- wp:paragraph -->
<p>A large part of our internal-medicine diagnostics relies on laboratory values from blood, urine or stool. We take samples on site and send them, depending on the question, to the laboratory community or to our external specialist lab (Synlab). Results are discussed in the follow-up consultation.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Which parameters we determine</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li>Small and full blood count (analysis of blood cells, mature/immature cells)</li><li>Kidney function (creatinine, urea, eGFR)</li><li>Liver and gallbladder values</li><li>Pancreas (lipase, amylase)</li><li>Thyroid values (TSH, fT3, fT4, antibodies if needed)</li><li>Cardiac enzymes (high-sensitivity troponin if needed)</li><li>Inflammation markers (CRP, ESR, leukocytes)</li><li>Coagulation (Quick, INR, PTT)</li><li>Lipid metabolism — total cholesterol, HDL, LDL, triglycerides</li><li>Electrolytes (potassium, sodium, calcium, magnesium)</li><li>HbA1c (long-term blood sugar) and fasting glucose</li><li>Tumor markers as follow-up parameters</li><li>Borreliosis after tick bites, chlamydia, intestinal parasites</li><li>Lactose and gluten intolerance</li><li>Rheumatoid factors and autoimmune antibodies</li><li>Epstein-Barr virus (e.g. in infectious mononucleosis)</li><li>Antibodies to verify vaccination status</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>How blood sampling works</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Blood sampling is an indispensable building block in the diagnosis of many illnesses. Errors during sampling, storage and transport to the laboratory can however affect the result so strongly that interpretation is only partly possible. We follow standardized procedures: correct order of tubes during draw, immediate transport of temperature-sensitive parameters, fasting samples for metabolic values.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>If you should be fasting for an appointment, we tell you explicitly when scheduling. Fasting means: at least 8 hours without food, no sugary drinks — water and unsweetened tea are fine.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>24-hour urine and further sample types</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>For certain questions your cooperation is needed. For 24-hour urine you collect all urine over a full day in a container that we hand out in the practice. Similar applies to stool samples (e.g. when intestinal parasites are suspected). We explain the procedure in writing and in person before handing out the container.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Results consultation</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Most values are available within one to two working days. We discuss results in the follow-up consultation or — in case of unremarkable routine findings and with your consent — by phone. Conspicuous values are always discussed in person.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Self-pay alternative</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Our partner Sanexio offers with the <a href="/basic-check/">Basic Check</a> a compact self-pay laboratory check with 15 parameters — also bookable directly online, sample taken at our practice.</p>
<!-- /wp:paragraph -->
HTML;

$labor_hub_fr_content = <<<'HTML'
<!-- wp:paragraph -->
<p>Une part importante de notre diagnostic en médecine interne s'appuie sur les valeurs de laboratoire issues du sang, des urines ou des selles. Nous effectuons les prélèvements au cabinet et les envoyons selon la question à la communauté de laboratoire ou à notre laboratoire spécialisé externe (Synlab). Les résultats sont commentés lors de la consultation de suivi.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Quels paramètres nous déterminons</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li>Hémogramme simple et complet (analyse des cellules sanguines, cellules matures/immatures)</li><li>Fonction rénale (créatinine, urée, DFGe)</li><li>Bilan hépatique et biliaire</li><li>Pancréas (lipase, amylase)</li><li>Bilan thyroïdien (TSH, T3 libre, T4 libre, anticorps si nécessaire)</li><li>Enzymes cardiaques (troponine hypersensible si nécessaire)</li><li>Marqueurs d'inflammation (CRP, VS, leucocytes)</li><li>Coagulation (Quick, INR, TCA)</li><li>Métabolisme lipidique — cholestérol total, HDL, LDL, triglycérides</li><li>Électrolytes (potassium, sodium, calcium, magnésium)</li><li>HbA1c (sucre à long terme) et glycémie à jeun</li><li>Marqueurs tumoraux comme paramètres de suivi</li><li>Borrélies après morsure de tique, chlamydiae, parasites intestinaux</li><li>Intolérance au lactose et au gluten</li><li>Facteur rhumatoïde et anticorps auto-immuns</li><li>Virus d'Epstein-Barr (p. ex. en cas de mononucléose infectieuse)</li><li>Anticorps pour le contrôle du statut vaccinal</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Comment se déroule la prise de sang</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La prise de sang est un élément indispensable au diagnostic de nombreuses maladies. Lors du prélèvement, du stockage et du transport vers le laboratoire, des erreurs peuvent toutefois survenir et influencer le résultat à un point tel que son interprétation n'est que partielle. Nous veillons à des procédures standardisées : ordre correct des tubes lors du prélèvement, transport immédiat des paramètres sensibles à la température, échantillons à jeun pour les valeurs métaboliques.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Si vous devez être à jeun pour un rendez-vous, nous vous l'indiquons expressément lors de la prise de rendez-vous. À jeun signifie : au moins 8 heures sans aliments, sans boissons sucrées — l'eau et le thé non sucré sont autorisés.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Urines de 24 heures et autres types d'échantillons</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Pour certaines questions, votre collaboration est nécessaire. Pour les urines de 24 heures, vous recueillez sur une journée complète l'ensemble des urines dans un récipient que nous remettons au cabinet. Cela vaut aussi pour les selles (p. ex. en cas de suspicion de parasites intestinaux). Nous expliquons la procédure par écrit et en personne avant la remise du récipient.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Récupération et discussion des résultats</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La plupart des valeurs sont disponibles sous un à deux jours ouvrés. Nous commentons les résultats lors de la consultation de suivi ou — en cas de bilans de routine sans particularité et avec votre accord — par téléphone. Les valeurs anormales sont toujours discutées en personne.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Alternative privée</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Notre partenaire Sanexio propose avec le <a href="/basic-check/">Basic Check</a> un bilan biologique privé compact à 15 paramètres — également réservable en ligne, prélèvement effectué au cabinet.</p>
<!-- /wp:paragraph -->
HTML;

$rund_de_content = <<<'HTML'
<p>Die Blutentnahme gehört bei der Diagnose vieler Erkrankungen zu einem unverzichtbaren Bestandteil während des Untersuchungsvorgangs.</p>

<p>Allerdings können bei der Blutabnahme, der Lagerung der Blutproben sowie dem Transport ins Labor viele Fehler passieren, die das Ergebnis so stark beeinflussen können, dass eine Interpretation der Ergebnisse nur eingeschränkt oder überhaupt nicht möglich ist. Dies kann sogar in seltenen Fällen dazu führen, dass man eine falsche Diagnose stellt, wenn man sich zu stark auf die Aussagekraft der Laborwerte verlässt.</p>

<p>Unter dem Begriff „Labor“ sind hierbei nicht nur die Blutentnahmen gemeint, auch Abstriche oder Urinproben gehören genauso dazu. In den meisten Fällen werden wir die Diagnostik hier in der Praxis an Ort und Stelle vornehmen. Es gibt aber auch Fälle, wo Ihre Mitarbeit gefragt ist, zum Beispiel bei einer 24-h-Sammelurindiagnostik oder bei der Stuhldiagnostik.</p>

<p>Daher wollen wir Ihnen hier in der Rubrik „Rund ums Labor“ einige der wichtigsten Fallstricke erläutern, so dass Sie als informierter Patient mithelfen, dass die bei Ihnen bestimmten Werte dann auch die entsprechende Aussagekraft haben und uns helfen, die richtige Diagnose bei Ihnen zu stellen.</p>
HTML;

$rund_en_content = <<<'HTML'
<p>Blood sampling is an indispensable part of the diagnostic process in many diseases.</p>

<p>However, during sample collection, storage of the blood samples, and transport to the laboratory, many errors can occur. These errors may affect the result so strongly that interpretation is only partly possible — or not at all. In rare cases this can lead to a wrong diagnosis if too much weight is placed on the laboratory values alone.</p>

<p>The term "laboratory" here covers not only blood draws but also swabs and urine samples. In most cases we perform the diagnostics on the spot in our practice. There are also situations in which your cooperation is needed, for example with 24-hour urine collection or with stool diagnostics.</p>

<p>This is why we want to explain in this section "About our lab" some of the most important pitfalls, so that you as an informed patient can help to make sure your values carry the appropriate significance and support us in reaching the right diagnosis.</p>
HTML;

$rund_fr_content = <<<'HTML'
<p>La prise de sang fait partie intégrante du processus diagnostique de nombreuses maladies.</p>

<p>Cependant, lors du prélèvement, du stockage des échantillons sanguins et du transport vers le laboratoire, de nombreuses erreurs peuvent survenir. Elles peuvent influencer le résultat à un point tel que l'interprétation n'est possible que de manière limitée — voire pas du tout. Dans de rares cas, cela peut même conduire à un diagnostic erroné si l'on se fie trop aux seules valeurs de laboratoire.</p>

<p>Le terme « laboratoire » désigne ici non seulement les prises de sang, mais aussi les frottis ou les échantillons d'urine. Dans la plupart des cas, nous réalisons le diagnostic sur place au cabinet. Il existe néanmoins des situations où votre collaboration est nécessaire, par exemple lors d'un recueil d'urines de 24 heures ou d'un diagnostic des selles.</p>

<p>C'est pourquoi nous souhaitons vous expliquer dans cette rubrique « Autour du laboratoire » quelques-uns des pièges les plus importants, afin qu'en tant que patient informé vous contribuiez à donner aux valeurs déterminées chez vous toute leur portée et nous aidiez à poser le bon diagnostic.</p>
HTML;

$rund_es_content = <<<'HTML'
<p>La extracción de sangre forma parte indispensable del proceso diagnóstico en muchas enfermedades.</p>

<p>Sin embargo, durante la extracción, el almacenamiento de las muestras de sangre y el transporte al laboratorio pueden producirse numerosos errores. Estos pueden afectar al resultado de tal manera que la interpretación sea solo limitada — o no sea posible en absoluto. En casos raros incluso puede llevar a un diagnóstico erróneo si se confía demasiado en los solos valores de laboratorio.</p>

<p>El término «laboratorio» abarca aquí no solo las extracciones de sangre, sino también los frotis o las muestras de orina. En la mayoría de los casos realizamos el diagnóstico en la propia consulta. Pero también hay situaciones en las que se requiere su colaboración, por ejemplo en la recogida de orina de 24 horas o en el diagnóstico de heces.</p>

<p>Por ello queremos explicarle en esta sección «Sobre el laboratorio» algunos de los obstáculos más importantes, para que usted como paciente informado contribuya a que los valores determinados tengan la pertinencia adecuada y nos ayude a establecer el diagnóstico correcto.</p>
HTML;

$bridge_pages_with_content = [

    // ----- rund-ums-labor (9707, trid 14707) EN+FR+ES all new -----
    9707 => [ 'slug' => 'rund-ums-labor',
        'translations' => [
            'en' => [
                'title' => 'About our lab',
                'slug_override' => 'about-our-lab',
                'content' => $rund_en_content,
                'meta' => [],
            ],
            'fr' => [
                'title' => 'Autour du laboratoire',
                'slug_override' => 'autour-du-laboratoire',
                'content' => $rund_fr_content,
                'meta' => [],
            ],
            'es' => [
                'title' => 'Sobre el laboratorio',
                'slug_override' => 'sobre-el-laboratorio',
                'content' => $rund_es_content,
                'meta' => [],
            ],
        ],
    ],
];

// ==========================================================================
// UPDATE-Mode pages (Klasse A, Hub-`labor` EN+FR Drift-Fix)
// ==========================================================================

$update_pages = [

    // Hub `labor` (trid 551) — all 3 languages have WPML-AT 2021 drift content.
    // ES previously had slug `analiticas-de-sangre` (semantisch verengt auf Blut);
    // wird auf glossar-konformes `laboratorio` migriert (Dr. Stracke S69 directive).
    296 => [ 'slug' => 'labor',
        'translations' => [
            'en' => [
                'title'   => 'Laboratory diagnostics',
                'content' => $labor_hub_en_content,
                'meta'    => [],
            ],
            'fr' => [
                'title'   => 'Diagnostic de laboratoire',
                'content' => $labor_hub_fr_content,
                'meta'    => [],
            ],
            'es' => [
                'title'    => 'Laboratorio',
                'slug_new' => 'laboratorio',
                'content'  => $labor_hub_es_content,
                'meta'     => [],
            ],
        ],
    ],
];

// ==========================================================================
// HELPERS
// ==========================================================================

function get_trid_for_de_post( $de_id ) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare(
        "SELECT trid FROM {$wpdb->prefix}icl_translations WHERE element_id=%d AND element_type='post_page' AND language_code='de'",
        $de_id
    ) );
}

function get_existing_translation( $trid, $lang ) {
    global $wpdb;
    return $wpdb->get_var( $wpdb->prepare(
        "SELECT element_id FROM {$wpdb->prefix}icl_translations WHERE trid=%d AND element_type='post_page' AND language_code=%s",
        $trid, $lang
    ) );
}

function copy_postmeta_with_overrides( $de_id, $target_id, $overrides ) {
    global $wpdb;
    $rows = $wpdb->get_results( $wpdb->prepare(
        "SELECT meta_key, meta_value FROM {$wpdb->prefix}postmeta WHERE post_id=%d", $de_id
    ), ARRAY_A );
    foreach ( $rows as $r ) {
        $key = $r['meta_key'];
        if ( in_array( $key, [ '_wpml_word_count', '_edit_lock', '_edit_last' ], true ) ) continue;
        $val = array_key_exists( $key, $overrides ) ? $overrides[ $key ] : $r['meta_value'];
        update_post_meta( $target_id, $key, $val );
    }
    foreach ( $overrides as $k => $v ) {
        if ( ! metadata_exists( 'post', $target_id, $k ) ) {
            update_post_meta( $target_id, $k, $v );
        }
    }
}

function bridge_wpml_translation( $target_id, $trid, $lang ) {
    global $wpdb;
    $existing = $wpdb->get_var( $wpdb->prepare(
        "SELECT translation_id FROM {$wpdb->prefix}icl_translations WHERE element_id=%d AND element_type='post_page'",
        $target_id
    ) );
    if ( $existing ) {
        $wpdb->update(
            "{$wpdb->prefix}icl_translations",
            [ 'trid' => $trid, 'language_code' => $lang, 'source_language_code' => 'de' ],
            [ 'translation_id' => $existing ]
        );
    } else {
        $wpdb->insert( "{$wpdb->prefix}icl_translations", [
            'element_type'         => 'post_page',
            'element_id'           => $target_id,
            'trid'                 => $trid,
            'language_code'        => $lang,
            'source_language_code' => 'de',
        ] );
    }
}

function bridge_insert_post( $de, $cfg, $tcfg, $lang ) {
    global $wpdb;
    $slug = $tcfg['slug_override'] ?? $cfg['slug'];
    $post_data = [
        'post_author'    => $de->post_author,
        'post_date'      => current_time( 'mysql' ),
        'post_date_gmt'  => current_time( 'mysql', 1 ),
        'post_content'   => $tcfg['content'],
        'post_title'     => $tcfg['title'],
        'post_excerpt'   => '',
        'post_status'    => 'publish',
        'comment_status' => 'closed',
        'ping_status'    => 'closed',
        'post_password'  => '',
        'post_name'      => $slug,
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
    $wpdb->insert( $wpdb->posts, $post_data );
    $new_id = (int) $wpdb->insert_id;
    if ( ! $new_id ) return 0;
    $wpdb->update( $wpdb->posts, [ 'guid' => home_url( "/?page_id={$new_id}" ) ], [ 'ID' => $new_id ] );
    return $new_id;
}

function process_bridge_set( $set, $mode_label, $langs, $commit, &$results ) {
    foreach ( $set as $de_id => $cfg ) {
        $de = get_post( $de_id );
        if ( ! $de ) {
            $results[] = [ $mode_label, $de_id, $cfg['slug'], '-', 'SKIP', 'DE post not found' ];
            continue;
        }
        $trid = get_trid_for_de_post( $de_id );
        if ( ! $trid ) {
            $results[] = [ $mode_label, $de_id, $cfg['slug'], '-', 'SKIP', 'no WPML trid' ];
            continue;
        }
        foreach ( $langs as $lang ) {
            $tcfg = $cfg['translations'][ $lang ] ?? null;
            if ( ! $tcfg ) continue;
            $existing = get_existing_translation( $trid, $lang );
            if ( $existing ) {
                $results[] = [ $mode_label, $de_id, $cfg['slug'], $lang, 'EXISTS', "post {$existing} already linked" ];
                continue;
            }
            $slug_used = $tcfg['slug_override'] ?? $cfg['slug'];
            if ( ! $commit ) {
                $results[] = [ $mode_label, $de_id, $cfg['slug'], $lang, 'PLAN',
                    "would insert (slug={$slug_used}, title={$tcfg['title']}, clen=" . strlen( $tcfg['content'] ) . "), trid={$trid}" ];
                continue;
            }
            $new_id = bridge_insert_post( $de, $cfg, $tcfg, $lang );
            if ( ! $new_id ) {
                $results[] = [ $mode_label, $de_id, $cfg['slug'], $lang, 'ERROR', 'wp_posts insert failed' ];
                continue;
            }
            copy_postmeta_with_overrides( $de_id, $new_id, $tcfg['meta'] );
            bridge_wpml_translation( $new_id, $trid, $lang );
            $results[] = [ $mode_label, $de_id, $cfg['slug'], $lang, 'CREATED', "post {$new_id} (slug={$slug_used}) linked via trid {$trid}" ];
        }
    }
}

// ==========================================================================
// MAIN-LOOP
// ==========================================================================

$results = [];
$langs = $lang_filter ? [ $lang_filter ] : [ 'en', 'fr', 'es' ];

// ----- Phase 0: CLEANUP -----
if ( ! $skip_cleanup ) {
    foreach ( $cleanup_ids as $id => $note ) {
        $p = get_post( $id );
        if ( ! $p ) {
            $results[] = [ 'CLEANUP', $id, '-', '-', 'SKIP', "not found ({$note})" ];
            continue;
        }
        if ( ! $commit ) {
            $results[] = [ 'CLEANUP', $id, $p->post_name, '-', 'PLAN', "would hard-delete: {$note}" ];
            continue;
        }
        $deleted = wp_delete_post( $id, true );
        if ( $deleted ) {
            $results[] = [ 'CLEANUP', $id, $p->post_name, '-', 'DELETED', $note ];
        } else {
            $results[] = [ 'CLEANUP', $id, $p->post_name, '-', 'ERROR', "wp_delete_post returned false ({$note})" ];
        }
    }
}

// ----- Phase 1: BRIDGE clen=0 (Klasse B detail pages) -----
process_bridge_set( $bridge_pages_clen0, 'BRIDGE0', $langs, $commit, $results );

// ----- Phase 2: BRIDGE with-content (Klasse A new translations) -----
process_bridge_set( $bridge_pages_with_content, 'BRIDGEC', $langs, $commit, $results );

// ----- Phase 3: UPDATE (Klasse A drift-fix on existing translations) -----
foreach ( $update_pages as $de_id => $cfg ) {
    $de = get_post( $de_id );
    if ( ! $de ) {
        $results[] = [ 'UPDATE', $de_id, $cfg['slug'], '-', 'SKIP', 'DE post not found' ];
        continue;
    }
    $trid = get_trid_for_de_post( $de_id );
    if ( ! $trid ) {
        $results[] = [ 'UPDATE', $de_id, $cfg['slug'], '-', 'SKIP', 'no WPML trid' ];
        continue;
    }
    foreach ( $langs as $lang ) {
        $tcfg = $cfg['translations'][ $lang ] ?? null;
        if ( ! $tcfg ) continue;
        $existing = get_existing_translation( $trid, $lang );
        if ( ! $existing ) {
            $results[] = [ 'UPDATE', $de_id, $cfg['slug'], $lang, 'WARN', 'no existing translation; skipping' ];
            continue;
        }
        $slug_new  = $tcfg['slug_new'] ?? null;
        $slug_note = $slug_new ? " + slug→{$slug_new}" : '';
        if ( ! $commit ) {
            $results[] = [ 'UPDATE', $de_id, $cfg['slug'], $lang, 'PLAN',
                "would update post {$existing} (title={$tcfg['title']}, clen=" . strlen( $tcfg['content'] ) . "{$slug_note})" ];
            continue;
        }
        global $wpdb;
        $update_data = [
            'post_title'   => $tcfg['title'],
            'post_content' => $tcfg['content'],
            'post_modified'     => current_time( 'mysql' ),
            'post_modified_gmt' => current_time( 'mysql', 1 ),
        ];
        if ( $slug_new ) {
            $update_data['post_name'] = $slug_new;
        }
        $wpdb->update( $wpdb->posts, $update_data, [ 'ID' => $existing ] );
        foreach ( $tcfg['meta'] as $k => $v ) {
            update_post_meta( $existing, $k, $v );
        }
        clean_post_cache( $existing );
        $results[] = [ 'UPDATE', $de_id, $cfg['slug'], $lang, 'UPDATED', "post {$existing} content+title overwritten{$slug_note}" ];
    }
}

// ==========================================================================
// SUMMARY
// ==========================================================================

echo str_pad( 'MODE', 9 ) . str_pad( 'DE_ID', 7 ) . str_pad( 'SLUG', 24 ) . str_pad( 'LANG', 5 ) . str_pad( 'STATUS', 9 ) . "DETAIL\n";
echo str_repeat( '-', 140 ) . "\n";
foreach ( $results as $r ) {
    echo str_pad( $r[0], 9 ) . str_pad( $r[1], 7 ) . str_pad( substr($r[2],0,22), 24 ) . str_pad( $r[3], 5 ) . str_pad( $r[4], 9 ) . $r[5] . "\n";
}

$counts = [];
foreach ( $results as $r ) {
    $key = $r[4];
    $counts[ $key ] = ( $counts[ $key ] ?? 0 ) + 1;
}
echo "\nAggregate: ";
foreach ( $counts as $k => $v ) echo "{$k}={$v} ";
echo "\nTotal operations: " . count( $results ) . "\n";
echo "Mode: " . ( $commit ? "COMMIT" : "DRY-RUN" ) . "\n";
