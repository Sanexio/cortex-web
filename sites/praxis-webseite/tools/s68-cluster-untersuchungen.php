<?php
/**
 * S68 — Cluster „Untersuchungen" (EN+FR+ES) konsolidierter Sweep
 *
 * Pattern-Generation 2 (Cluster-Sweep) — extends S65/S66/S67 single-language
 * bridge skripts to a multi-language consolidated sweep with two modes:
 *
 *   - BRIDGE-Mode (Klasse B, neue 2026-Pages, 11 Pages):
 *       Standard WPML-bridge insert mit DE-Slug invariant. Content leer
 *       (template-detail-page.php holt aus Trunk; Hub 9682 hat eigene
 *       Übersetzung). Identisch zu S65/S66/S67.
 *
 *   - UPDATE-Mode (Klasse A, historische 2021-Pages mit WPML-AT-Bestand,
 *     6 Pages): vorhandene EN/FR/ES-Pages werden inhaltlich auf aktuellen
 *     DE-Stand überschrieben (post_content + post_title + Postmeta-Selektiv).
 *     Slug bleibt erhalten (SEO/Backlinks von 4 Jahren). Skip wenn keine
 *     Existing-Page (Edge-case, wäre Klasse B).
 *
 * Verbindliche Arbeitsregel S66 (Lungenfunktion-Drift-Befund):
 *   Bei jedem Cluster-Sweep werden Klasse-A-Drift-Pages mit-gefixt — pro
 *   Cluster eine Welle, kein Native-Review-Sprint nötig.
 *
 * Cluster „Untersuchungen" Inventar (17 DE-Pages):
 *   Klasse A (UPDATE, 6): sonographie, belastungs-ekg, lungenfunktion,
 *     echokardiographie, carotis-duplex, schilddruese
 *   Klasse B (BRIDGE, 11): untersuchungen (Hub), bauchspeicheldruese, nieren,
 *     prostata, leber, body-check, sono-check, komplett-check, kardio-check,
 *     fit-for-diving, eye-check
 *
 * Total Page-Operationen: 6×3 (Update) + 11×3 (Bridge) = 51.
 *
 * Idempotent: Re-Run ist sicher.
 *   - Bridge-Mode: Existing → SKIP (EXISTS).
 *   - Update-Mode: Existing → re-Update (Idempotent: identical bytes after
 *     2nd run).
 *
 * Glossary compliance (LL-058):
 *   - Praxisgemeinschaft → EN "shared medical practice", FR "cabinet médical
 *     en communauté de pratique", ES "comunidad de consulta médica"
 *   - Sonographie/Ultraschall → EN "ultrasound", FR "échographie", ES "ecografía"
 *   - Echokardiographie → EN "echocardiography", FR "échocardiographie",
 *     ES "ecocardiografía"
 *   - Carotis → EN "carotid", FR "carotidien", ES "carotídeo"
 *
 * Usage:
 *   php s68-cluster-untersuchungen.php           # dry-run (show plan)
 *   php s68-cluster-untersuchungen.php --commit  # actually apply
 *   php s68-cluster-untersuchungen.php --commit --lang=en   # only EN
 */

define( 'WP_USE_THEMES', false );
$wp_load = '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-load.php';
require $wp_load;

global $wpdb;

$commit  = in_array( '--commit', $argv ?? [], true );
$lang_filter = null;
foreach ( $argv ?? [] as $arg ) {
    if ( preg_match( '/^--lang=(en|fr|es)$/', $arg, $m ) ) {
        $lang_filter = $m[1];
    }
}

echo "MODE: " . ( $commit ? "COMMIT" : "DRY-RUN (use --commit to apply)" ) . "\n";
if ( $lang_filter ) echo "LANG-FILTER: {$lang_filter}\n";
echo "\n";

// ==========================================================================
// BRIDGE-Mode pages (Klasse B, 11 Pages, content leer ausser Hub 9682)
// ==========================================================================

$bridge_pages = [

    // ----- Hub mit Übersetzungen -----
    9682 => [
        'slug' => 'untersuchungen',
        'translations' => [
            'en' => [
                'title' => 'Examinations',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p>We perform the most important diagnostic examinations directly in our practice — without referral chains, without waiting for an external institute. Findings are discussed in the same or a timely follow-up consultation.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'fr' => [
                'title' => 'Examens',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p>Nous réalisons les principaux examens d'imagerie et fonctionnels directement au cabinet — sans chaîne de prescription, sans attendre un institut externe. Les résultats sont commentés au cours de la même consultation ou d'un rendez-vous de suivi rapproché.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'es' => [
                'title' => 'Exámenes',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p>Realizamos las principales exploraciones aparatuales directamente en la consulta — sin cadena de derivación, sin esperar a un instituto externo. Los hallazgos se comentan en la misma consulta o en un control de seguimiento cercano.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
        ],
    ],

    // ----- Sonographie-Sub-Detail-Pages (template-detail-page.php, content leer) -----
    9840 => [ 'slug' => 'bauchspeicheldruese',
        'translations' => [
            'en' => [ 'title' => 'Pancreas',                   'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Pancréas',                   'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Páncreas',                   'content' => '', 'meta' => [] ],
        ],
    ],
    9841 => [ 'slug' => 'nieren',
        'translations' => [
            'en' => [ 'title' => 'Kidneys and Urinary Tract',  'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Reins et voies urinaires',   'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Riñones y vías urinarias',   'content' => '', 'meta' => [] ],
        ],
    ],
    9842 => [ 'slug' => 'prostata',
        'translations' => [
            'en' => [ 'title' => 'Prostate and Bladder',       'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Prostate et vessie',         'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Próstata y vejiga',          'content' => '', 'meta' => [] ],
        ],
    ],
    9843 => [ 'slug' => 'leber',
        'translations' => [
            'en' => [ 'title' => 'Liver and Gallbladder',      'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Foie et vésicule',           'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Hígado y vesícula',          'content' => '', 'meta' => [] ],
        ],
    ],

    // ----- Check-Up Detail-Pages (template-detail-page.php, content leer) -----
    9844 => [ 'slug' => 'body-check',
        'translations' => [
            'en' => [ 'title' => 'Body Check',     'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Body Check',     'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Body Check',     'content' => '', 'meta' => [] ],
        ],
    ],
    9845 => [ 'slug' => 'sono-check',
        'translations' => [
            'en' => [ 'title' => 'Sono Check',     'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Sono Check',     'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Sono Check',     'content' => '', 'meta' => [] ],
        ],
    ],
    9846 => [ 'slug' => 'komplett-check',
        'translations' => [
            'en' => [ 'title' => 'Complete Check', 'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Examen complet', 'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Examen completo','content' => '', 'meta' => [] ],
        ],
    ],
    9847 => [ 'slug' => 'kardio-check',
        'translations' => [
            'en' => [ 'title' => 'Cardio Check',   'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Cardio Check',   'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Cardio Check',   'content' => '', 'meta' => [] ],
        ],
    ],
    9848 => [ 'slug' => 'fit-for-diving',
        'translations' => [
            'en' => [ 'title' => 'Fit for Diving', 'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Fit for Diving', 'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Fit for Diving', 'content' => '', 'meta' => [] ],
        ],
    ],
    9849 => [ 'slug' => 'eye-check',
        'translations' => [
            'en' => [ 'title' => 'Eye Check',      'content' => '', 'meta' => [] ],
            'fr' => [ 'title' => 'Eye Check',      'content' => '', 'meta' => [] ],
            'es' => [ 'title' => 'Eye Check',      'content' => '', 'meta' => [] ],
        ],
    ],
];

// ==========================================================================
// UPDATE-Mode pages (Klasse A, 6 Pages, Drift-Fix mit Volltext-Übersetzung)
// ==========================================================================

$update_pages = [

    // ----- 277 Sonographie -----
    277 => [
        'slug' => 'sonographie',
        'translations' => [
            'en' => [
                'title' => 'Ultrasound',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p>Ultrasound is an imaging procedure that uses sound waves to examine internal organs. A key advantage over X-ray lies in the harmlessness of the sound waves — even sensitive tissue is not damaged, the examination is painless and can be repeated as often as needed.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Which organs we examine</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Head and neck</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>At the neck we primarily assess the carotid artery for calcifications and inflammatory changes, as well as the thyroid gland to detect nodules or enlargement at an early stage — particularly when laboratory values are abnormal. There is a dedicated detail page for the thyroid gland.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Heart</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>With echocardiography (cardiac ultrasound) we examine pumping function, wall motion and heart valves. Wall motion abnormalities can indicate coronary artery disease; in addition, previously undetected high blood pressure or pulmonary disease can be identified.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Abdomen</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>During abdominal ultrasound we examine the liver, gallbladder and bile ducts, pancreas, spleen and parts of the stomach. We also assess the large abdominal vessels (aorta, vena cava, portal vein), the kidneys and urinary tract. In men, the prostate is additionally evaluated as an orientation.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Leg vessels</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>For corresponding complaints we perform an orienting examination of the leg arteries (suspected peripheral arterial disease / "intermittent claudication") and veins (suspected thrombosis). A dedicated detail page is available for in-depth assessment.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Musculoskeletal system</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>We can assess soft tissue and joints by ultrasound — primarily tendons and ligaments at the knee, shoulder (rotator cuff), elbow, hand and wrist. Muscle injuries, hematomas and inflammation of peripheral nerves such as in carpal tunnel syndrome can be visualized.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'fr' => [
                'title' => 'Échographie',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p>L'échographie est un procédé d'imagerie utilisant des ondes ultrasonores pour examiner les organes internes. Un avantage majeur par rapport à la radiographie réside dans l'innocuité des ondes utilisées — même les tissus sensibles ne sont pas endommagés, l'examen est indolore et peut être répété autant de fois que nécessaire.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Quels organes nous examinons</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Tête et cou</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Au niveau du cou, nous évaluons en priorité la carotide à la recherche de calcifications et de modifications inflammatoires, ainsi que la thyroïde afin de dépister précocement nodules ou augmentation de volume — notamment en cas de bilan biologique perturbé. Une page dédiée existe pour la thyroïde.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Cœur</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>L'échocardiographie permet d'évaluer la fonction de pompe, la cinétique pariétale et les valves cardiaques. Les troubles de la cinétique pariétale peuvent évoquer une maladie coronarienne ; il est en outre possible de détecter une hypertension artérielle ou une pathologie pulmonaire passée jusque-là inaperçue.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Abdomen</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Lors de l'échographie abdominale, nous examinons le foie, la vésicule biliaire et les voies biliaires, le pancréas, la rate et certaines portions de l'estomac. Nous évaluons également les gros vaisseaux abdominaux (aorte, veine cave, veine porte), les reins et les voies urinaires. Chez l'homme, la prostate fait également l'objet d'une évaluation d'orientation.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Vaisseaux des jambes</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En présence de symptômes évocateurs, nous réalisons un examen d'orientation des artères des membres inférieurs (suspicion d'AOMI / « claudication intermittente ») et des veines (suspicion de thrombose). Une page dédiée existe pour l'évaluation approfondie.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Appareil locomoteur</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nous pouvons évaluer les tissus mous et les articulations par échographie — principalement les tendons et ligaments du genou, de l'épaule (coiffe des rotateurs), du coude, de la main et du poignet. Lésions musculaires, hématomes et inflammations des nerfs périphériques tels que le syndrome du canal carpien sont également visibles.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'es' => [
                'title' => 'Ecografía',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p>La ecografía es un procedimiento de imagen que utiliza ondas ultrasónicas para explorar los órganos internos. Una ventaja esencial frente a la radiografía es la inocuidad de las ondas empleadas — incluso los tejidos sensibles no resultan dañados, la exploración es indolora y puede repetirse cuantas veces sea necesario.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Qué órganos exploramos</h2>
<!-- /wp:heading -->

<!-- wp:heading {"level":3} -->
<h3>Cabeza y cuello</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En el cuello evaluamos sobre todo la arteria carótida en busca de calcificaciones y cambios inflamatorios, así como la glándula tiroides para detectar precozmente nódulos o aumentos de tamaño — especialmente cuando hay analíticas alteradas. Existe una página específica para la tiroides.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Corazón</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Con la ecocardiografía exploramos la función de bomba, la cinética parietal y las válvulas cardíacas. Las alteraciones de la cinética parietal pueden indicar enfermedad coronaria; además se puede detectar una hipertensión arterial o una enfermedad pulmonar hasta entonces no diagnosticadas.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Abdomen</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En la ecografía abdominal exploramos el hígado, la vesícula biliar y las vías biliares, el páncreas, el bazo y partes del estómago. Evaluamos al mismo tiempo los grandes vasos abdominales (aorta, vena cava, vena porta), los riñones y las vías urinarias. En el varón se evalúa adicionalmente la próstata de forma orientativa.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Vasos de las piernas</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Ante síntomas correspondientes realizamos una exploración orientativa de las arterias de las piernas (sospecha de enfermedad arterial periférica / «claudicación intermitente») y de las venas (sospecha de trombosis). Existe una página específica para el estudio en profundidad.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Aparato locomotor</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Podemos evaluar partes blandas y articulaciones por ecografía — sobre todo tendones y ligamentos de la rodilla, el hombro (manguito de los rotadores), el codo, la mano y la muñeca. Lesiones musculares, hematomas e inflamaciones de nervios periféricos como el síndrome del túnel carpiano son visualizables.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
        ],
    ],

    // ----- 289 Belastungs-EKG -----
    289 => [
        'slug' => 'belastungs-ekg',
        'translations' => [
            'en' => [
                'title' => 'Exercise ECG',
                'content' => <<<'HTML'
<!-- wp:heading -->
<h2>Ergometry</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Ergometry can provide indications of calcifications in the coronary arteries. At rest our heart beats about 60 times per minute and must contract and expand again. Only during expansion is the heart itself supplied with blood and oxygen — the heart's own supply vessels are squeezed shut during contraction.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>With calcifications, blood flow to the inner layers of the heart muscle is restricted because the reduced diameter allows less blood to pass per unit of time. This may not be noticeable at rest; under exertion, however, the pulse rises, the recovery time between beats decreases — and with it the time available for oxygen supply.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>When we use the exercise ECG</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>We perform the exercise ECG when coronary heart disease is suspected, to clarify unclear chest complaints under exertion, and to estimate cardiovascular risk — for instance before planned athletic exertion or when resuming physical activity after a longer break.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Procedure</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>You pedal on a bicycle ergometer. The workload increases every two minutes; meanwhile we record your ECG and measure your blood pressure repeatedly. The examination lasts around 20 minutes and is ended once the target heart rate is reached or if symptoms occur. If typical changes appear in the ECG, we interpret them as an indication of reduced blood flow.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Related examinations</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The exercise ECG is a fixed component of our <a href="/kardio-check/">Cardio Check</a>, combined with echocardiography and lung function testing.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'fr' => [
                'title' => "ECG d'effort",
                'content' => <<<'HTML'
<!-- wp:heading -->
<h2>Ergométrie</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>L'ergométrie peut apporter des indices de calcifications des artères coronaires. Au repos, notre cœur bat environ 60 fois par minute et doit se contracter puis se relâcher à nouveau. C'est uniquement pendant la phase de relâchement que le cœur est lui-même approvisionné en sang et en oxygène — les artères coronaires sont comprimées pendant la contraction.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>En présence de calcifications, l'irrigation des couches internes du myocarde est limitée parce que la réduction du diamètre ne laisse passer qu'un débit sanguin moindre par unité de temps. Au repos cela peut rester sans conséquence ; à l'effort, en revanche, le pouls augmente, le temps de récupération entre les battements diminue — et avec lui le temps disponible pour l'apport en oxygène.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Quand nous utilisons l'ECG d'effort</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nous réalisons l'ECG d'effort en cas de suspicion de maladie coronarienne, pour explorer des douleurs thoraciques peu claires à l'effort et pour estimer le risque cardiovasculaire — par exemple avant une activité sportive prévue ou lors de la reprise d'une activité physique après une longue interruption.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Déroulement</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Vous pédalez sur un cyclo-ergomètre. La charge augmente toutes les deux minutes ; pendant ce temps nous enregistrons votre ECG et mesurons à plusieurs reprises votre tension artérielle. L'examen dure environ 20 minutes et est interrompu lorsque la fréquence cardiaque cible est atteinte ou en cas de gêne. Si des modifications typiques apparaissent à l'ECG, nous les interprétons comme un indice d'hypoperfusion.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Examens associés</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>L'ECG d'effort fait partie intégrante de notre <a href="/kardio-check/">Cardio Check</a>, en association avec l'échocardiographie et l'exploration fonctionnelle respiratoire.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'es' => [
                'title' => 'ECG de esfuerzo',
                'content' => <<<'HTML'
<!-- wp:heading -->
<h2>Ergometría</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La ergometría puede aportar indicios de calcificaciones en las arterias coronarias. En reposo nuestro corazón late unas 60 veces por minuto y debe contraerse y volverse a expandir. Sólo durante la expansión el propio corazón recibe sangre y oxígeno — las arterias coronarias se comprimen durante la contracción.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Cuando hay calcificaciones, la irrigación de las capas internas del miocardio se ve limitada, porque el menor diámetro permite que pase menos sangre por unidad de tiempo. En reposo puede no producir molestias; con el esfuerzo, sin embargo, el pulso aumenta, el tiempo de recuperación entre latidos se acorta — y con él el tiempo disponible para el aporte de oxígeno.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Cuándo utilizamos la ECG de esfuerzo</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Realizamos la ECG de esfuerzo ante sospecha de enfermedad coronaria, para aclarar molestias torácicas poco definidas durante el esfuerzo y para estimar el riesgo cardiovascular — por ejemplo antes de una actividad deportiva prevista o al retomar la actividad física tras una pausa prolongada.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Desarrollo</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Usted pedalea sobre un cicloergómetro. La carga aumenta cada dos minutos; mientras tanto registramos su ECG y medimos repetidamente la tensión arterial. La exploración dura unos 20 minutos y se interrumpe al alcanzar la frecuencia cardíaca objetivo o si aparecen molestias. Si en el ECG aparecen cambios típicos, los interpretamos como indicio de menor irrigación.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Exploraciones relacionadas</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La ECG de esfuerzo forma parte integral de nuestro <a href="/kardio-check/">Cardio Check</a>, en combinación con ecocardiografía y exploración de la función pulmonar.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
        ],
    ],

    // ----- 292 Lungenfunktion -----
    292 => [
        'slug' => 'lungenfunktion',
        'translations' => [
            'en' => [
                'title' => 'Lung Function',
                'content' => <<<'HTML'
<!-- wp:heading -->
<h2>Spirometry</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The lung is a highly capable organ. It supplies the body with oxygen and removes the carbon dioxide produced during metabolism through the exhaled air. With every breath we draw in about 0.5 litres of air — that adds up to around 10 litres per minute, 14,400 litres per day. This makes the lung the organ most directly exposed to harmful substances of all organs.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Congenital disorders, chronic inflammation and exposure to harmful substances can impair lung function. Spirometry measures static and dynamic lung volumes as well as flow rates and renders such changes visible.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>What we clarify with lung function testing</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li>Narrowing of the bronchi — bronchial asthma, chronic obstructive pulmonary disease (COPD)</li><li>Estimation of the severity of an obstruction</li><li>Follow-up assessment and therapy monitoring of an already known disease</li><li>Investigation of chronic cough</li><li>Early detection of damage from inhaled noxious substances (e.g. exposure to tobacco smoke)</li><li>Occupational medicine questions and pre-operative diagnostics</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Procedure</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>You receive a nose clip so that the measurement is performed exclusively through the mouth. Then you enclose the mouthpiece with your lips and breathe according to instruction — three normal cycles, then three deep and forceful inhalations and exhalations. During this, flow or volume sensors record your breathing flows. The examination lasts around five minutes.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Related examinations</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Lung function testing is a standard part of our <a href="/komplett-check/">Complete Check</a>. If combined cardiopulmonary disease is suspected, we combine spirometry with the <a href="/belastungs-ekg/">exercise ECG</a> and <a href="/sonographie/">ultrasound</a>.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'fr' => [
                'title' => 'Fonction pulmonaire',
                'content' => <<<'HTML'
<!-- wp:heading -->
<h2>Spirométrie</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Le poumon est un organe très performant. Il fournit l'oxygène à l'organisme et évacue le dioxyde de carbone produit par le métabolisme avec l'air expiré. À chaque respiration, nous inhalons environ 0,5 litre d'air — soit près de 10 litres par minute, 14 400 litres par jour. Le poumon est ainsi l'organe le plus directement exposé aux substances nocives.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Des troubles congénitaux, des inflammations chroniques et des expositions à des polluants peuvent altérer la fonction pulmonaire. La spirométrie mesure les volumes pulmonaires statiques et dynamiques ainsi que les débits respiratoires et rend visibles ces modifications.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Ce que nous explorons avec l'EFR</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li>Rétrécissement des bronches — asthme bronchique, broncho-pneumopathie chronique obstructive (BPCO)</li><li>Évaluation du degré de sévérité d'une obstruction</li><li>Suivi évolutif et contrôle thérapeutique d'une maladie déjà connue</li><li>Bilan d'une toux chronique</li><li>Détection précoce de lésions par inhalation de noxes (p. ex. exposition à la fumée de tabac)</li><li>Questions de médecine du travail et bilans pré-opératoires</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Déroulement</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Vous portez une pince-nez afin que la mesure soit effectuée exclusivement par la bouche. Vous serrez ensuite l'embout buccal entre les lèvres et respirez selon les consignes — trois cycles normaux, puis trois inspirations et expirations profondes et forcées. Pendant ce temps, des capteurs de débit ou de volume enregistrent vos flux respiratoires. L'examen dure environ cinq minutes.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Examens associés</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>L'exploration fonctionnelle respiratoire fait par défaut partie de notre <a href="/komplett-check/">Examen complet</a>. En cas de suspicion d'atteinte cardiopulmonaire combinée, nous associons la spirométrie à l'<a href="/belastungs-ekg/">ECG d'effort</a> et à l'<a href="/sonographie/">échographie</a>.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'es' => [
                'title' => 'Función pulmonar',
                'content' => <<<'HTML'
<!-- wp:heading -->
<h2>Espirometría</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>El pulmón es un órgano muy eficiente. Aporta oxígeno al organismo y elimina con el aire espirado el dióxido de carbono producido por el metabolismo. Con cada respiración inhalamos unos 0,5 litros de aire — eso supone unos 10 litros por minuto, 14 400 litros al día. Es por ello el órgano de todos los del cuerpo más directamente expuesto a sustancias nocivas.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Trastornos congénitos, inflamaciones crónicas y exposiciones a contaminantes pueden alterar la función pulmonar. La espirometría mide volúmenes pulmonares estáticos y dinámicos así como los flujos respiratorios y hace visibles esos cambios.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Qué aclaramos con la exploración de la función pulmonar</h2>
<!-- /wp:heading -->

<!-- wp:list -->
<ul><li>Estrechamiento de los bronquios — asma bronquial, enfermedad pulmonar obstructiva crónica (EPOC)</li><li>Estimación de la gravedad de una obstrucción</li><li>Seguimiento evolutivo y control terapéutico de una enfermedad ya conocida</li><li>Estudio de tos crónica</li><li>Detección precoz de lesiones por noxas inhaladas (p. ej. exposición a humo de tabaco)</li><li>Cuestiones de medicina laboral y diagnóstico preoperatorio</li></ul>
<!-- /wp:list -->

<!-- wp:heading -->
<h2>Desarrollo</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Se le coloca una pinza nasal para que la medición se realice exclusivamente por la boca. Después usted rodea con los labios la boquilla y respira siguiendo nuestras indicaciones — tres ciclos normales y a continuación tres inspiraciones y espiraciones profundas y enérgicas. Durante este tiempo, sensores de flujo o de volumen registran sus flujos respiratorios. La exploración dura unos cinco minutos.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Exploraciones relacionadas</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La función pulmonar forma parte por defecto de nuestro <a href="/komplett-check/">Examen completo</a>. Ante sospecha de enfermedad cardiopulmonar combinada, asociamos la espirometría con la <a href="/belastungs-ekg/">ECG de esfuerzo</a> y la <a href="/sonographie/">ecografía</a>.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
        ],
    ],

    // ----- 351 Echokardiographie -----
    351 => [
        'slug' => 'echokardiographie',
        'translations' => [
            'en' => [
                'title' => 'Echocardiography',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p><strong>Cardiac ultrasound</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Cardiac ultrasound can be used for extended diagnostics of cardiovascular diseases. It provides valuable information about cardiac function and possible defects. Diseases of the heart muscle, inflammation, blood clots and heart failure can also be detected with the help of echocardiography.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>In principle, performing a cardiac ultrasound is low-risk and painless for patients.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Information about cardiac ultrasound</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Echocardiography can be used for extended diagnostics in cardiovascular diseases. It provides valuable information about cardiac function and possible damage. Diseases of the heart muscle, inflammation, defects of the heart valves and heart failure can be detected with the help of echocardiography.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>In principle, performing a cardiac ultrasound is low-risk and painless for patients.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3><strong>Possible findings of a cardiac ultrasound</strong></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A cardiac ultrasound is mostly used to assess the performance of the heart and to detect indications of structural changes.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Possible indications for cardiac ultrasound include:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>Clarification of unusual heart sounds</li><li>Suspected heart attack</li><li>Follow-up of scars in the heart muscle after an infarction</li><li>Clarification of heart failure</li><li>Congenital heart defect</li><li>Structural diseases of the heart</li><li>Suspected narrowing of the coronary arteries</li><li>Clarification of wall motion abnormalities</li><li>Suspected myocardial inflammation</li><li>Extended diagnostics following abnormal ECG findings</li></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3><strong>How informative is echocardiography?</strong></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In a cardiac ultrasound, the structure of the heart, its anatomy as well as its function and blood flow are visualised. This enables a reliable, accurate and especially rapid diagnosis when structural heart disease is suspected.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'fr' => [
                'title' => 'Échocardiographie',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p><strong>Échographie cardiaque</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>L'échographie cardiaque peut être utilisée pour le diagnostic approfondi des maladies cardio-vasculaires. Elle fournit des informations précieuses sur la fonction cardiaque et d'éventuels défauts. Les maladies du muscle cardiaque, les inflammations, les caillots sanguins et l'insuffisance cardiaque peuvent également être identifiés grâce à l'échocardiographie.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>De manière générale, la réalisation d'une échographie cardiaque est peu invasive et indolore pour les patients.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Informations sur l'échographie cardiaque</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>L'échocardiographie peut être utilisée pour le diagnostic approfondi des maladies cardio-vasculaires. Elle fournit des informations précieuses sur la fonction cardiaque et d'éventuelles atteintes. Maladies du muscle cardiaque, inflammations, anomalies des valves cardiaques et insuffisance cardiaque peuvent être détectées grâce à l'échocardiographie.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>De manière générale, la réalisation d'une échographie cardiaque est peu invasive et indolore pour les patients.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3><strong>Anomalies pouvant être identifiées par une échographie cardiaque</strong></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Une échographie cardiaque est le plus souvent utilisée pour évaluer la performance du cœur et chercher des indices d'anomalies structurelles.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Indications possibles de l'échographie cardiaque :</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>Évaluation de souffles cardiaques</li><li>Suspicion d'infarctus du myocarde</li><li>Suivi de cicatrices myocardiques après un infarctus</li><li>Bilan d'une insuffisance cardiaque</li><li>Cardiopathie congénitale</li><li>Maladies structurelles du cœur</li><li>Suspicion de sténose des artères coronaires</li><li>Évaluation des troubles de la cinétique pariétale</li><li>Suspicion de myocardite</li><li>Diagnostic complémentaire après ECG anormal</li></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3><strong>Quelle est la valeur diagnostique d'une échocardiographie ?</strong></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Lors d'une échographie cardiaque, la structure, l'anatomie ainsi que la fonction et le flux sanguin du cœur sont visualisés. Cela permet un diagnostic fiable, précis et surtout rapide en cas de suspicion d'une atteinte structurelle du cœur.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'es' => [
                'title' => 'Ecocardiografía',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p><strong>Ecografía cardíaca</strong></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>La ecografía cardíaca puede utilizarse para el diagnóstico ampliado de enfermedades cardiovasculares. Aporta información valiosa sobre la función cardíaca y posibles defectos. Enfermedades del músculo cardíaco, inflamaciones, coágulos sanguíneos e insuficiencia cardíaca pueden detectarse también con la ecocardiografía.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>En general, la realización de una ecografía cardíaca es de bajo riesgo e indolora para los pacientes.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Información sobre la ecografía cardíaca</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La ecocardiografía puede emplearse para el diagnóstico ampliado de enfermedades cardiovasculares. Aporta información valiosa sobre la función cardíaca y posibles daños. Enfermedades del músculo cardíaco, inflamaciones, defectos de las válvulas cardíacas e insuficiencia cardíaca pueden detectarse con la ecocardiografía.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>En general, la realización de una ecografía cardíaca es de bajo riesgo e indolora para los pacientes.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3><strong>Posibles hallazgos en una ecografía cardíaca</strong></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Una ecografía cardíaca se utiliza sobre todo para evaluar el rendimiento del corazón y buscar indicios de alteraciones estructurales.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Posibles indicaciones para la ecografía cardíaca:</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li>Aclaración de soplos cardíacos llamativos</li><li>Sospecha de infarto de miocardio</li><li>Control evolutivo de cicatrices del miocardio tras un infarto</li><li>Estudio de insuficiencia cardíaca</li><li>Cardiopatía congénita</li><li>Enfermedades estructurales del corazón</li><li>Sospecha de estenosis de las arterias coronarias</li><li>Estudio de alteraciones de la cinética parietal</li><li>Sospecha de miocarditis</li><li>Diagnóstico ampliado tras ECG patológico</li></ul>
<!-- /wp:list -->

<!-- wp:heading {"level":3} -->
<h3><strong>¿Qué valor diagnóstico tiene una ecocardiografía?</strong></h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En una ecografía cardíaca se visualizan la estructura, la anatomía, la función y el flujo sanguíneo del corazón. Esto permite un diagnóstico fiable, exacto y, sobre todo, rápido ante sospecha de enfermedades estructurales del corazón.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
        ],
    ],

    // ----- 354 Carotis-Duplex -----
    354 => [
        'slug' => 'carotis-duplex',
        'translations' => [
            'en' => [
                'title' => 'Carotid Duplex',
                'content' => <<<'HTML'
<!-- wp:heading -->
<h2>Ultrasound of the carotid arteries</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Sonography of the carotid arteries consists, on the one hand, of measuring the inner wall thickness (intima-media complex) and, on the other, of visualising soft, hard, calcified or shadow-casting plaques in the supply area of the cerebral vessels visible outside the skull.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Widening of the intima-media complex and plaques are signs of systemic atherosclerosis. In combination with elevated cholesterol values, high blood pressure, overweight or smoking, sonography of the carotid arteries therefore provides essential information about your individual risk profile.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Color-coded duplex sonography of the carotid vessels also reveals significant narrowing, occlusions, vessel wall tears or relevant changes in blood flow.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'fr' => [
                'title' => 'Doppler carotidien',
                'content' => <<<'HTML'
<!-- wp:heading -->
<h2>Échographie des artères carotides</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>L'échographie des artères carotides consiste d'une part à mesurer l'épaisseur de la paroi interne (complexe intima-média) et d'autre part à visualiser les plaques molles, dures, calcifiées ou créant une ombre acoustique dans le territoire d'irrigation des vaisseaux cérébraux extracrâniens visibles.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>L'épaississement du complexe intima-média et les plaques sont des signes d'athérosclérose systémique. En association avec un cholestérol élevé, une hypertension artérielle, un surpoids ou un tabagisme, l'échographie des vaisseaux du cou fournit donc des informations essentielles sur votre profil de risque personnel.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>L'écho-doppler couleur des vaisseaux carotidiens révèle en outre des sténoses significatives, des occlusions, des déchirures pariétales ou des modifications notables du flux sanguin.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'es' => [
                'title' => 'Doppler carotídeo',
                'content' => <<<'HTML'
<!-- wp:heading -->
<h2>Ecografía de las arterias carótidas</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La ecografía de las arterias carótidas consiste, por un lado, en la determinación del grosor de la capa interna de la pared (complejo íntima-media) y, por otro, en la visualización de placas blandas, duras, calcificadas o que generan sombra acústica en el territorio de los vasos cerebrales extracraneales visibles.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>El engrosamiento del complejo íntima-media y la presencia de placas son signos de aterosclerosis sistémica. En asociación con cifras elevadas de colesterol, hipertensión arterial, sobrepeso o tabaquismo, la ecografía de los vasos del cuello aporta por ello información esencial sobre su perfil de riesgo personal.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>La ecografía dúplex color de los vasos carotídeos revela además estenosis significativas, oclusiones, disecciones parietales o cambios relevantes del flujo sanguíneo.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
        ],
    ],

    // ----- 357 Schilddrüsen-Sonographie -----
    357 => [
        'slug' => 'schilddruese',
        'translations' => [
            'en' => [
                'title' => 'Thyroid Ultrasound',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p>The thyroid gland is an organ located in the neck that produces vital hormones. These regulate the basal metabolic rate, act in almost all body cells and stimulate energy metabolism there. Iodine is required for hormone production. With insufficient supply, an overproduction of the regulating hormone TSH occurs — which can lead to growth of the thyroid and ultimately to the formation of a goitre (struma).</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>When we perform a thyroid ultrasound</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>If we find an enlarged thyroid during physical examination, or if TSH, fT3 or fT4 are abnormal in the laboratory, ultrasound is the first step of imaging diagnostics. If a nodule or functional disorder is suspected, we extend the diagnostics with scintigraphy and, in rarer cases, with computed tomography or MRI.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Procedure</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The examination takes around 10 minutes. You lie on your back, the neck is slightly extended; we apply ultrasound gel and move the probe across both thyroid lobes and the isthmus. We also assess the lymph nodes of the cervical region.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Related examinations</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Thyroid ultrasound is part of our <a href="/komplett-check/">Complete Check</a>. If a hormonal disorder is suspected, we discuss further laboratory values under <a href="/labor/">Laboratory</a>.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'fr' => [
                'title' => 'Échographie thyroïdienne',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p>La thyroïde est un organe situé dans le cou qui produit des hormones vitales. Celles-ci régulent le métabolisme de base, agissent dans presque toutes les cellules de l'organisme et y stimulent le métabolisme énergétique. La synthèse hormonale nécessite de l'iode. En cas d'apport insuffisant, on observe une surproduction de l'hormone régulatrice TSH — ce qui peut entraîner une croissance de la thyroïde et, à terme, la formation d'un goitre (struma).</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Quand nous réalisons une échographie thyroïdienne</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Si nous découvrons une thyroïde augmentée de volume lors de l'examen clinique, ou si la TSH, la fT3 ou la fT4 sont anormales au bilan biologique, l'échographie est la première étape du bilan d'imagerie. En cas de suspicion de nodule ou de trouble fonctionnel, nous complétons le bilan par une scintigraphie, plus rarement par un scanner ou une IRM.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Déroulement</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>L'examen dure environ 10 minutes. Vous êtes allongé sur le dos, le cou en légère extension ; nous appliquons un gel d'échographie et passons la sonde sur les deux lobes thyroïdiens et l'isthme. Nous évaluons en complément les ganglions lymphatiques de la région cervicale.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Examens associés</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>L'échographie thyroïdienne fait partie de notre <a href="/komplett-check/">Examen complet</a>. En cas de suspicion de trouble hormonal, nous discutons d'autres bilans biologiques à la rubrique <a href="/labor/">Laboratoire</a>.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
            ],
            'es' => [
                'title' => 'Ecografía tiroidea',
                'content' => <<<'HTML'
<!-- wp:paragraph -->
<p>La tiroides es un órgano situado en el cuello que produce hormonas vitales. Éstas regulan el metabolismo basal, actúan en casi todas las células del organismo y estimulan en ellas el metabolismo energético. Para la síntesis hormonal es necesario el yodo. En caso de aporte insuficiente, se produce una sobreproducción de la hormona reguladora TSH — lo que puede conducir a un crecimiento de la tiroides y, finalmente, a la formación de un bocio (struma).</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Cuándo realizamos una ecografía tiroidea</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Si en la exploración clínica detectamos una tiroides aumentada de tamaño, o si en el laboratorio aparecen alterados TSH, fT3 o fT4, la ecografía es el primer paso del diagnóstico por imagen. Ante sospecha de nódulo o trastorno funcional, ampliamos el estudio con gammagrafía y, en casos más raros, con tomografía computarizada o resonancia magnética.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Desarrollo</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La exploración dura unos 10 minutos. Usted se tumba boca arriba, con el cuello ligeramente extendido; aplicamos gel de ecografía y desplazamos la sonda sobre ambos lóbulos tiroideos y el istmo. Evaluamos además los ganglios linfáticos de la región cervical.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Exploraciones relacionadas</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La ecografía tiroidea forma parte de nuestro <a href="/komplett-check/">Examen completo</a>. Ante sospecha de trastorno hormonal, comentamos otros valores de laboratorio en <a href="/labor/">Laboratorio</a>.</p>
<!-- /wp:paragraph -->
HTML,
                'meta' => [],
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

// ==========================================================================
// MAIN-LOOP
// ==========================================================================

$results = [];
$langs = $lang_filter ? [ $lang_filter ] : [ 'en', 'fr', 'es' ];

// ----- BRIDGE-Mode -----
foreach ( $bridge_pages as $de_id => $cfg ) {
    $de = get_post( $de_id );
    if ( ! $de ) {
        $results[] = [ 'BRIDGE', $de_id, $cfg['slug'], '-', 'SKIP', 'DE post not found' ];
        continue;
    }
    $trid = get_trid_for_de_post( $de_id );
    if ( ! $trid ) {
        $results[] = [ 'BRIDGE', $de_id, $cfg['slug'], '-', 'SKIP', 'no WPML trid' ];
        continue;
    }
    foreach ( $langs as $lang ) {
        $tcfg = $cfg['translations'][ $lang ] ?? null;
        if ( ! $tcfg ) {
            $results[] = [ 'BRIDGE', $de_id, $cfg['slug'], $lang, 'SKIP', 'no translation defined' ];
            continue;
        }
        $existing = get_existing_translation( $trid, $lang );
        if ( $existing ) {
            $results[] = [ 'BRIDGE', $de_id, $cfg['slug'], $lang, 'EXISTS', "post {$existing} already linked" ];
            continue;
        }
        if ( ! $commit ) {
            $results[] = [ 'BRIDGE', $de_id, $cfg['slug'], $lang, 'PLAN',
                "would insert (title={$tcfg['title']}, content_len=" . strlen( $tcfg['content'] ) . "), trid={$trid}" ];
            continue;
        }
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
        global $wpdb;
        $wpdb->insert( $wpdb->posts, $post_data );
        $new_id = (int) $wpdb->insert_id;
        if ( ! $new_id ) {
            $results[] = [ 'BRIDGE', $de_id, $cfg['slug'], $lang, 'ERROR', 'wp_posts insert failed' ];
            continue;
        }
        $wpdb->update( $wpdb->posts, [ 'guid' => home_url( "/?page_id={$new_id}" ) ], [ 'ID' => $new_id ] );
        copy_postmeta_with_overrides( $de_id, $new_id, $tcfg['meta'] );
        bridge_wpml_translation( $new_id, $trid, $lang );
        $results[] = [ 'BRIDGE', $de_id, $cfg['slug'], $lang, 'CREATED', "post {$new_id} linked via trid {$trid}" ];
    }
}

// ----- UPDATE-Mode -----
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
        if ( ! $tcfg ) {
            $results[] = [ 'UPDATE', $de_id, $cfg['slug'], $lang, 'SKIP', 'no translation defined' ];
            continue;
        }
        $existing = get_existing_translation( $trid, $lang );
        if ( ! $existing ) {
            // Edge case: kein existing → würde Bridge-Insert sein. Wir markieren als WARN.
            $results[] = [ 'UPDATE', $de_id, $cfg['slug'], $lang, 'WARN', 'no existing translation (would need bridge); skipping' ];
            continue;
        }
        if ( ! $commit ) {
            $results[] = [ 'UPDATE', $de_id, $cfg['slug'], $lang, 'PLAN',
                "would update post {$existing} (title={$tcfg['title']}, content_len=" . strlen( $tcfg['content'] ) . ")" ];
            continue;
        }
        global $wpdb;
        $wpdb->update( $wpdb->posts,
            [
                'post_title'   => $tcfg['title'],
                'post_content' => $tcfg['content'],
                'post_modified'     => current_time( 'mysql' ),
                'post_modified_gmt' => current_time( 'mysql', 1 ),
            ],
            [ 'ID' => $existing ]
        );
        // Postmeta-Overrides nur wenn definiert (sparsam — keine bulk-copy)
        foreach ( $tcfg['meta'] as $k => $v ) {
            update_post_meta( $existing, $k, $v );
        }
        clean_post_cache( $existing );
        $results[] = [ 'UPDATE', $de_id, $cfg['slug'], $lang, 'UPDATED', "post {$existing} content+title overwritten" ];
    }
}

// ==========================================================================
// SUMMARY
// ==========================================================================

echo str_pad( 'MODE', 8 ) . str_pad( 'DE_ID', 7 ) . str_pad( 'SLUG', 22 ) . str_pad( 'LANG', 5 ) . str_pad( 'STATUS', 9 ) . "DETAIL\n";
echo str_repeat( '-', 130 ) . "\n";
foreach ( $results as $r ) {
    echo str_pad( $r[0], 8 ) . str_pad( $r[1], 7 ) . str_pad( substr($r[2],0,20), 22 ) . str_pad( $r[3], 5 ) . str_pad( $r[4], 9 ) . $r[5] . "\n";
}

// Aggregat
$counts = [];
foreach ( $results as $r ) {
    $key = $r[4];
    $counts[ $key ] = ( $counts[ $key ] ?? 0 ) + 1;
}
echo "\nAggregate: ";
foreach ( $counts as $k => $v ) echo "{$k}={$v} ";
echo "\nTotal operations: " . count( $results ) . "\n";
echo "Mode: " . ( $commit ? "COMMIT" : "DRY-RUN" ) . "\n";
