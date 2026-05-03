<?php
/**
 * Session A — EN/FR/ES-Lückenschluss (LL-060 Autonomy Mode v1)
 *
 * Pattern-Generation 2.2 (BRIDGE-via-UPDATE statt INSERT, S70-Fix für WPML
 * save_post Auto-Hook).
 *
 * Operationen:
 *   - Phase 0 CLEANUP (4 hard-deletes):
 *       4356  questionnaire-sur-les-douleurs-thoraciques-2 (DE-Page mit FR-Slug,
 *             trid 627, importer junk)
 *       4796/4788/4790  Datenschutz EN/ES/FR-drafts
 *             (WPML-Boilerplate von 2021, nicht DE-konsistent)
 *
 *   - Phase 1 BRIDGE-with-content (6 Pages × 3 Sprachen = 18 ops):
 *       datenschutzerklaerung (3, trid 541) — DSGVO-Volltext
 *       basic-check (9668, trid 1122) — Cross-Brand Sanexio
 *       service (9685, trid 1135) — Service-Hub
 *       aktuelles (9699, trid 1140) — News (mit Platzhalter)
 *       cookie-richtlinie-eu (9709, trid 14709) — Cookie-Richtlinie
 *       faq (9888, trid 14750) — FAQ-Hub klein
 *
 *   - Phase 2 BRIDGE-clen0 (4 Pages × 3 Sprachen = 12 ops):
 *       home-neu (9663, trid 1120) — template-homepage.php
 *       sprechstunden (9673, trid 1125) — template-sprechstunden.php
 *       fragebogen-vor-termin (9782, trid 14710) — Shortcode-Stub
 *       videosprechstunde (9890, trid 14751) — Shortcode-Stub
 *
 * Total: 4 + 18 + 12 = 34 operations.
 *
 * Übersetzungen sind glossar-konform (inc/i18n-glossary.php), eigenständig
 * von Claude erstellt (nicht WPML-AT, nicht DeepL — siehe S63 E1).
 *
 * Usage: php sA-luecken-bulk.php [--commit] [--lang=en|fr|es] [--skip-cleanup]
 */
define( 'WP_USE_THEMES', false );
require '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-load.php';
global $wpdb;

$commit = in_array( '--commit', $argv ?? [], true );
$skip_cleanup = in_array( '--skip-cleanup', $argv ?? [], true );
$lang_filter = null;
foreach ( $argv ?? [] as $arg ) {
    if ( preg_match( '/^--lang=(en|fr|es)$/', $arg, $m ) ) $lang_filter = $m[1];
}
echo "MODE: " . ( $commit ? "COMMIT" : "DRY-RUN" ) . ( $lang_filter ? " LANG={$lang_filter}" : "" ) . "\n\n";

// =========================================================================
// CLEANUP
// =========================================================================
$cleanup_ids = [
    4356 => 'questionnaire-sur-les-douleurs-thoraciques-2 (DE page with FR slug, trid 627 importer junk)',
    4796 => 'datenschutz EN-draft (2021 WPML boilerplate, not DE-consistent)',
    4788 => 'datenschutz ES-draft (2021 WPML boilerplate, not DE-consistent)',
    4790 => 'datenschutz FR-draft (2021 WPML boilerplate, not DE-consistent)',
];

// =========================================================================
// TRANSLATIONS — FAQ
// =========================================================================
$faq_en = <<<'HTML'
<h2>Frequently asked questions</h2>
<p>Answers to the most common questions our patients ask about hospital admission referrals, specialist referrals and sickness leave certificates.</p>
<ul>
  <li><a href="/service/einweisungen/">Admissions and referrals</a></li>
  <li><a href="/service/arbeitsunfaehigkeit/">Sickness leave certificate (AU)</a></li>
</ul>
HTML;
$faq_fr = <<<'HTML'
<h2>Questions fréquentes</h2>
<p>Réponses aux questions les plus fréquentes de nos patients concernant les bons d'hospitalisation, les orientations vers d'autres spécialistes et les arrêts maladie.</p>
<ul>
  <li><a href="/service/einweisungen/">Admissions et orientations</a></li>
  <li><a href="/service/arbeitsunfaehigkeit/">Arrêt maladie (AU)</a></li>
</ul>
HTML;
$faq_es = <<<'HTML'
<h2>Preguntas frecuentes</h2>
<p>Respuestas a las preguntas más frecuentes de nuestros pacientes sobre órdenes de ingreso hospitalario, derivaciones a otros especialistas y bajas laborales.</p>
<ul>
  <li><a href="/service/einweisungen/">Ingresos y derivaciones</a></li>
  <li><a href="/service/arbeitsunfaehigkeit/">Baja laboral (AU)</a></li>
</ul>
HTML;

// =========================================================================
// TRANSLATIONS — SERVICE-HUB
// =========================================================================
$service_en = <<<'HTML'
<!-- wp:paragraph -->
<p>On these pages you will find organisational information and forms for common matters around your treatment in our practice.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
  <li><a href="/service/terminanfrage/">Appointment request</a> — request an appointment for acute or scheduled office hours</li>
  <li><a href="/service/rezeptbestellung/">Prescription order</a> — reorder medication as an existing patient</li>
  <li><a href="/service/ueberweisung/">Request a referral</a> — have a referral prepared in advance</li>
  <li><a href="/service/arbeitsunfaehigkeit/">Sickness leave certificate (AU)</a> — legal framework</li>
  <li><a href="/service/einweisungen/">Admissions and referrals</a> — hospital, preoperative work-up, specialist</li>
  <li><a href="/service/neupatienten/">New patient registration</a> — waiting list for new admissions</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>For acute matters please reach us by phone. Contact details are available under <a href="/contact-us/">Contact</a>.</p>
<!-- /wp:paragraph -->
HTML;
$service_fr = <<<'HTML'
<!-- wp:paragraph -->
<p>Vous trouverez sur ces pages les informations organisationnelles et les formulaires concernant les démarches courantes liées à votre prise en charge au cabinet.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
  <li><a href="/service/terminanfrage/">Prise de rendez-vous</a> — demander un rendez-vous pour une consultation aiguë ou programmée</li>
  <li><a href="/service/rezeptbestellung/">Commande d'ordonnance</a> — renouveler vos médicaments en tant que patient existant</li>
  <li><a href="/service/ueberweisung/">Demander une orientation</a> — préparer une lettre d'orientation à l'avance</li>
  <li><a href="/service/arbeitsunfaehigkeit/">Arrêt maladie (AU)</a> — cadre juridique</li>
  <li><a href="/service/einweisungen/">Admissions et orientations</a> — hôpital, examens préopératoires, spécialistes</li>
  <li><a href="/service/neupatienten/">Inscription nouveaux patients</a> — liste d'attente pour les nouvelles admissions</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Pour les demandes urgentes, contactez-nous par téléphone. Les coordonnées sont indiquées sous <a href="/contact-us/">Contact</a>.</p>
<!-- /wp:paragraph -->
HTML;
$service_es = <<<'HTML'
<!-- wp:paragraph -->
<p>En estas páginas encontrará información organizativa y formularios para las gestiones habituales relacionadas con su atención en la consulta.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
  <li><a href="/service/terminanfrage/">Solicitar cita</a> — pedir una cita para consulta aguda o programada</li>
  <li><a href="/service/rezeptbestellung/">Pedido de receta</a> — renovar medicamentos como paciente existente</li>
  <li><a href="/service/ueberweisung/">Solicitar derivación</a> — preparar un volante con antelación</li>
  <li><a href="/service/arbeitsunfaehigkeit/">Baja laboral (AU)</a> — marco legal</li>
  <li><a href="/service/einweisungen/">Ingresos y derivaciones</a> — hospital, examen preoperatorio, especialista</li>
  <li><a href="/service/neupatienten/">Registro nuevos pacientes</a> — lista de espera para nuevas admisiones</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Para asuntos urgentes contacte con nosotros por teléfono. Encontrará los datos de contacto en <a href="/contact-us/">Contacto</a>.</p>
<!-- /wp:paragraph -->
HTML;

// =========================================================================
// TRANSLATIONS — AKTUELLES
// =========================================================================
$aktuelles_en = <<<'HTML'
<!-- wp:paragraph -->
<p>Here we keep our patients regularly informed about practice news — modified office hours, new services, vaccination campaigns or organisational notices.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>New patient admission</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Due to high demand, we maintain a waiting list for new patients. Current admission rules are available under <a href="/service/neupatienten/">New patient registration</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Branch practice Bockenheimer Landstraße 33</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Our second location at Bockenheimer Landstraße 33 in the Eterno building extends our service portfolio with additional consultation slots. Details under <a href="/standorte/zweigpraxis-bockenheimer/">Branch practice Bockenheimer Landstraße 33</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Contact &amp; appointment booking</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>For appointment requests, prescription orders and organisational matters please use our <a href="/service/">Services</a> or reach us by phone — all contact details under <a href="/contact-us/">Contact</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><em>[Placeholder — this section will be populated by the editorial team with concrete announcements (consultation pauses, vaccination dates, staff additions). Dr. Stracke adds the first real content after acceptance of the draft.]</em></p>
<!-- /wp:paragraph -->
HTML;
$aktuelles_fr = <<<'HTML'
<!-- wp:paragraph -->
<p>Cette page rassemble les actualités du cabinet à destination de nos patients — modifications des horaires, nouvelles prestations, campagnes de vaccination ou informations organisationnelles.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Inscription nouveaux patients</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>En raison de la forte demande, nous tenons une liste d'attente pour les nouveaux patients. Les règles d'admission actuelles sont disponibles sous <a href="/service/neupatienten/">Inscription nouveaux patients</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Cabinet annexe Bockenheimer Landstraße 33</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Notre deuxième site Bockenheimer Landstraße 33 chez Eterno élargit notre offre avec des créneaux de consultation supplémentaires. Détails sous <a href="/standorte/zweigpraxis-bockenheimer/">Cabinet annexe Bockenheimer Landstraße 33</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Contact et prise de rendez-vous</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Pour les demandes de rendez-vous, les commandes d'ordonnances et les questions organisationnelles, utilisez notre rubrique <a href="/service/">Services</a> ou contactez-nous par téléphone — toutes les coordonnées sous <a href="/contact-us/">Contact</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><em>[Espace réservé — cette section sera enrichie par l'équipe éditoriale avec des annonces concrètes (pauses de consultation, dates de vaccination, arrivées de personnel). Dr Stracke ajoute le premier contenu réel après validation de la maquette.]</em></p>
<!-- /wp:paragraph -->
HTML;
$aktuelles_es = <<<'HTML'
<!-- wp:paragraph -->
<p>En esta página informamos periódicamente a nuestras pacientes y pacientes sobre las novedades de la consulta — cambios en los horarios, nuevas prestaciones, campañas de vacunación o avisos organizativos.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Admisión de nuevos pacientes</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Debido a la alta demanda, mantenemos una lista de espera para nuevos pacientes. Las normas actuales de admisión están disponibles en <a href="/service/neupatienten/">Registro nuevos pacientes</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Consulta secundaria Bockenheimer Landstraße 33</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Nuestra segunda sede en Bockenheimer Landstraße 33, en el edificio Eterno, amplía nuestra oferta con franjas de consulta adicionales. Detalles en <a href="/standorte/zweigpraxis-bockenheimer/">Consulta secundaria Bockenheimer Landstraße 33</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Contacto y reserva de cita</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Para solicitudes de cita, pedidos de receta y asuntos organizativos utilice nuestra sección <a href="/service/">Servicios</a> o contacte con nosotros por teléfono — todos los datos de contacto en <a href="/contact-us/">Contacto</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><em>[Marcador — esta sección será completada por el equipo editorial con anuncios concretos (pausas de consulta, fechas de vacunación, incorporaciones de personal). El Dr. Stracke añadirá los primeros contenidos reales tras la aceptación del borrador.]</em></p>
<!-- /wp:paragraph -->
HTML;

// =========================================================================
// TRANSLATIONS — BASIC-CHECK (Cross-Brand Sanexio)
// =========================================================================
$basic_check_en = <<<'HTML'
<!-- wp:paragraph -->
<p>The compact health check.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Small lab check with 15 parameters. Sample taken at the practice,<br>results within 48 hours.<br></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Lab parameters</h2>
<!-- /wp:heading -->

<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Parameter</th><th>Unit</th></tr></thead><tbody><tr><td>HGB</td><td>g/dl</td></tr><tr><td>WBC</td><td>/µl</td></tr><tr><td>RBC</td><td>T/l</td></tr><tr><td>HCT</td><td>%</td></tr><tr><td>MCV</td><td>fl</td></tr><tr><td>MCH</td><td>pg</td></tr><tr><td>MCHC</td><td>g/dl</td></tr><tr><td>PLT</td><td>G/l</td></tr><tr><td>Na</td><td>mmol/l</td></tr><tr><td>K</td><td>mmol/l</td></tr><tr><td>Krea</td><td>mg/dl</td></tr><tr><td>GFR</td><td>ml/min</td></tr><tr><td>GOT</td><td>U/l</td></tr><tr><td>GPT</td><td>U/l</td></tr><tr><td>CRP</td><td>mg/l</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://sanexio.eu/products/basic-check">Learn more on sanexio.eu</a></div></div>
<!-- /wp:buttons -->
HTML;
$basic_check_fr = <<<'HTML'
<!-- wp:paragraph -->
<p>Le bilan de santé compact.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Petit bilan biologique avec 15 paramètres. Prélèvement au cabinet,<br>résultat sous 48 heures.<br></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Paramètres biologiques</h2>
<!-- /wp:heading -->

<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Paramètre</th><th>Unité</th></tr></thead><tbody><tr><td>HGB</td><td>g/dl</td></tr><tr><td>WBC</td><td>/µl</td></tr><tr><td>RBC</td><td>T/l</td></tr><tr><td>HCT</td><td>%</td></tr><tr><td>MCV</td><td>fl</td></tr><tr><td>MCH</td><td>pg</td></tr><tr><td>MCHC</td><td>g/dl</td></tr><tr><td>PLT</td><td>G/l</td></tr><tr><td>Na</td><td>mmol/l</td></tr><tr><td>K</td><td>mmol/l</td></tr><tr><td>Krea</td><td>mg/dl</td></tr><tr><td>GFR</td><td>ml/min</td></tr><tr><td>GOT</td><td>U/l</td></tr><tr><td>GPT</td><td>U/l</td></tr><tr><td>CRP</td><td>mg/l</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://sanexio.eu/products/basic-check">En savoir plus sur sanexio.eu</a></div></div>
<!-- /wp:buttons -->
HTML;
$basic_check_es = <<<'HTML'
<!-- wp:paragraph -->
<p>El chequeo de salud compacto.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Pequeña analítica con 15 parámetros. Extracción en la consulta,<br>resultados en 48 horas.<br></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Parámetros de laboratorio</h2>
<!-- /wp:heading -->

<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Parámetro</th><th>Unidad</th></tr></thead><tbody><tr><td>HGB</td><td>g/dl</td></tr><tr><td>WBC</td><td>/µl</td></tr><tr><td>RBC</td><td>T/l</td></tr><tr><td>HCT</td><td>%</td></tr><tr><td>MCV</td><td>fl</td></tr><tr><td>MCH</td><td>pg</td></tr><tr><td>MCHC</td><td>g/dl</td></tr><tr><td>PLT</td><td>G/l</td></tr><tr><td>Na</td><td>mmol/l</td></tr><tr><td>K</td><td>mmol/l</td></tr><tr><td>Krea</td><td>mg/dl</td></tr><tr><td>GFR</td><td>ml/min</td></tr><tr><td>GOT</td><td>U/l</td></tr><tr><td>GPT</td><td>U/l</td></tr><tr><td>CRP</td><td>mg/l</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://sanexio.eu/products/basic-check">Más información en sanexio.eu</a></div></div>
<!-- /wp:buttons -->
HTML;

// =========================================================================
// TRANSLATIONS — COOKIE-RICHTLINIE
// =========================================================================
$cookie_en = <<<'HTML'
<h2>1. What are cookies?</h2>
<p>Cookies are small text files stored on your device when you visit a website. They allow, among other things, the website to recognise your language preference, prevent you from having to re-consent on every click, and enable third-party content (such as online appointment booking or maps) to be embedded.</p>

<h2>2. Consent</h2>
<p>On your first visit to this website, we display a cookie banner where you can choose which categories of cookies and comparable technologies you allow. <strong>Essential</strong> cookies are always loaded as they are technically required for the operation of the website. <strong>Statistics</strong> and <strong>external content</strong> are activated only with your explicit consent (Art. 6 (1) (a) GDPR, § 25 (1) TTDSG).</p>

<p>You may adjust or withdraw your selection at any time — via the link <a href="#" class="pxz-cookie-open-settings">Cookie settings</a> or via your browser's cookie management.</p>

<h2>3. Cookies in use</h2>

<h3>3.1 Essential cookies</h3>
<ul>
<li><code>pxz_cookie_consent</code> — stores your selection in the cookie banner. Lifetime: 365 days. Provider: this server.</li>
<li>WordPress session and security cookies (e.g. <code>wordpress_test_cookie</code>) — temporary, only for login/security functions. Provider: this server.</li>
</ul>

<h3>3.2 Statistics / reach measurement (only with consent)</h3>
<p>We currently do not use any tracking tools such as Google Analytics or Matomo. Should this change, the corresponding cookies will be documented here and activated only with your consent.</p>

<h3>3.3 External content (only with consent)</h3>
<ul>
<li><strong>Doctolib</strong> — online appointment booking. When you book an appointment via the website, you are redirected to doctolib.de or the booking window is embedded in our pages. Doctolib sets its own cookies; data processing takes place under the responsibility of Doctolib GmbH (Berlin). Privacy notice: <a href="https://www.doctolib.de/p/agb" target="_blank" rel="noopener">doctolib.de/p/agb</a>.</li>
<li><strong>Google Maps</strong> — directions sketch. When the map is loaded, connection data is transmitted to Google Ireland Ltd. Privacy notice: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</li>
</ul>

<h2>4. Storage period</h2>
<p>Essential cookies are stored only as long as required for their purpose — usually for the duration of the session, the cookie consent storage 365 days. Cookies in the statistics / external content categories are stored according to the respective provider's specifications (typically between a few days and 24 months); details can be found in the respective provider's privacy policy.</p>

<h2>5. How do I delete or manage cookies?</h2>
<p>You can view, block or delete cookies at any time via your browser settings. For essential cookies, blocking may render functions of the website unavailable. Instructions for the most common browsers:</p>
<ul>
<li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
<li><a href="https://support.mozilla.org/en-US/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noopener">Mozilla Firefox</a></li>
<li><a href="https://support.apple.com/en-us/guide/safari/sfri11471" target="_blank" rel="noopener">Apple Safari</a></li>
<li><a href="https://support.microsoft.com/en-us/microsoft-edge" target="_blank" rel="noopener">Microsoft Edge</a></li>
</ul>

<h2>6. Adjust selection at any time</h2>
<p><a href="#" class="pxz-cookie-open-settings"><strong>→ Open cookie settings again</strong></a></p>

<h2>7. Further information</h2>
<p>Comprehensive information on the processing of your personal data can be found in our <a href="/datenschutzerklaerung/">Privacy Policy</a>. For questions reach us at <a href="mailto:praxis@westend-hausarzt.de">praxis@westend-hausarzt.de</a>.</p>

<p><em>Status: 2 May 2026.</em></p>
HTML;
$cookie_fr = <<<'HTML'
<h2>1. Que sont les cookies ?</h2>
<p>Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web. Ils permettent notamment au site de reconnaître votre préférence linguistique, vous évitent de devoir consentir à chaque clic et permettent l'intégration de contenus tiers (par exemple la prise de rendez-vous en ligne ou les cartes).</p>

<h2>2. Consentement</h2>
<p>Lors de votre première visite, nous affichons une bannière cookies dans laquelle vous pouvez choisir quelles catégories de cookies et de technologies comparables vous autorisez. Les cookies <strong>essentiels</strong> sont toujours chargés car techniquement nécessaires au fonctionnement du site. Les <strong>statistiques</strong> et les <strong>contenus externes</strong> ne sont activés qu'avec votre consentement explicite (art. 6 (1) (a) RGPD, § 25 (1) TTDSG).</p>

<p>Vous pouvez ajuster ou retirer votre choix à tout moment — via le lien <a href="#" class="pxz-cookie-open-settings">Paramètres des cookies</a> ou via la gestion des cookies de votre navigateur.</p>

<h2>3. Cookies utilisés</h2>

<h3>3.1 Cookies essentiels</h3>
<ul>
<li><code>pxz_cookie_consent</code> — enregistre votre choix dans la bannière. Durée : 365 jours. Fournisseur : ce serveur.</li>
<li>Cookies de session et de sécurité WordPress (p. ex. <code>wordpress_test_cookie</code>) — temporaires, uniquement pour les fonctions de connexion/sécurité. Fournisseur : ce serveur.</li>
</ul>

<h3>3.2 Statistiques / mesure d'audience (uniquement avec consentement)</h3>
<p>Nous n'utilisons actuellement aucun outil de suivi tel que Google Analytics ou Matomo. Si cela devait changer, les cookies correspondants seraient documentés ici et activés uniquement avec votre consentement.</p>

<h3>3.3 Contenus externes (uniquement avec consentement)</h3>
<ul>
<li><strong>Doctolib</strong> — prise de rendez-vous en ligne. Lorsque vous réservez un rendez-vous via le site, vous êtes redirigé vers doctolib.de ou la fenêtre de réservation est intégrée dans nos pages. Doctolib place ses propres cookies ; le traitement des données est sous la responsabilité de Doctolib GmbH (Berlin). Mentions de confidentialité : <a href="https://www.doctolib.de/p/agb" target="_blank" rel="noopener">doctolib.de/p/agb</a>.</li>
<li><strong>Google Maps</strong> — plan d'accès. Lors du chargement de la carte, des données de connexion sont transmises à Google Ireland Ltd. Mentions de confidentialité : <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</li>
</ul>

<h2>4. Durée de conservation</h2>
<p>Les cookies essentiels sont conservés uniquement le temps nécessaire à leur finalité — le plus souvent la durée de la session, le cookie de consentement 365 jours. Les cookies des catégories statistiques / contenus externes sont conservés selon les indications du fournisseur concerné (généralement entre quelques jours et 24 mois) ; les détails figurent dans la politique de confidentialité du fournisseur correspondant.</p>

<h2>5. Comment supprimer ou gérer les cookies ?</h2>
<p>Vous pouvez à tout moment consulter, bloquer ou supprimer les cookies via les paramètres de votre navigateur. Pour les cookies essentiels, le blocage peut rendre certaines fonctions du site indisponibles. Instructions pour les navigateurs les plus courants :</p>
<ul>
<li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
<li><a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" rel="noopener">Mozilla Firefox</a></li>
<li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471" target="_blank" rel="noopener">Apple Safari</a></li>
<li><a href="https://support.microsoft.com/fr-fr/microsoft-edge" target="_blank" rel="noopener">Microsoft Edge</a></li>
</ul>

<h2>6. Ajuster le choix à tout moment</h2>
<p><a href="#" class="pxz-cookie-open-settings"><strong>→ Rouvrir les paramètres des cookies</strong></a></p>

<h2>7. Informations complémentaires</h2>
<p>Vous trouverez l'intégralité des informations sur le traitement de vos données personnelles dans notre <a href="/datenschutzerklaerung/">Politique de confidentialité</a>. Pour toute question, contactez-nous à <a href="mailto:praxis@westend-hausarzt.de">praxis@westend-hausarzt.de</a>.</p>

<p><em>État : 2 mai 2026.</em></p>
HTML;
$cookie_es = <<<'HTML'
<h2>1. ¿Qué son las cookies?</h2>
<p>Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Permiten, entre otras cosas, que el sitio reconozca su preferencia de idioma, que no tenga que consentir nuevamente con cada clic o que se puedan integrar contenidos de terceros (por ejemplo, la reserva de cita online o mapas).</p>

<h2>2. Consentimiento</h2>
<p>En su primera visita a este sitio web le mostramos un banner de cookies en el que puede elegir qué categorías de cookies y tecnologías comparables permite. Las cookies <strong>esenciales</strong> se cargan siempre por ser técnicamente necesarias para el funcionamiento del sitio. Las <strong>estadísticas</strong> y los <strong>contenidos externos</strong> se activan únicamente con su consentimiento explícito (art. 6, apdo. 1, letra a, RGPD; § 25 (1) TTDSG).</p>

<p>Puede modificar o retirar su selección en cualquier momento — mediante el enlace <a href="#" class="pxz-cookie-open-settings">Ajustes de cookies</a> o a través de la gestión de cookies de su navegador.</p>

<h2>3. Cookies en uso</h2>

<h3>3.1 Cookies esenciales</h3>
<ul>
<li><code>pxz_cookie_consent</code> — guarda su selección en el banner de cookies. Duración: 365 días. Proveedor: este servidor.</li>
<li>Cookies de sesión y seguridad de WordPress (p. ej. <code>wordpress_test_cookie</code>) — temporales, sólo para funciones de inicio de sesión/seguridad. Proveedor: este servidor.</li>
</ul>

<h3>3.2 Estadísticas / medición de alcance (sólo con consentimiento)</h3>
<p>Actualmente no utilizamos herramientas de seguimiento como Google Analytics o Matomo. Si esto cambiase, las cookies correspondientes se documentarán aquí y se activarán únicamente con su consentimiento.</p>

<h3>3.3 Contenidos externos (sólo con consentimiento)</h3>
<ul>
<li><strong>Doctolib</strong> — reserva de cita online. Si reserva una cita a través del sitio, será redirigido a doctolib.de o la ventana de reserva se integrará en nuestras páginas. Doctolib instala sus propias cookies; el tratamiento de datos se realiza bajo la responsabilidad de Doctolib GmbH (Berlín). Aviso de privacidad: <a href="https://www.doctolib.de/p/agb" target="_blank" rel="noopener">doctolib.de/p/agb</a>.</li>
<li><strong>Google Maps</strong> — plano de acceso. Al cargar el mapa se transmiten datos de conexión a Google Ireland Ltd. Aviso de privacidad: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</li>
</ul>

<h2>4. Duración de almacenamiento</h2>
<p>Las cookies esenciales se almacenan únicamente el tiempo necesario para su finalidad — habitualmente durante la sesión; la cookie de consentimiento 365 días. Las cookies de las categorías estadísticas / contenidos externos se almacenan según las indicaciones del proveedor correspondiente (normalmente entre unos pocos días y 24 meses); los detalles figuran en la política de privacidad del proveedor en cuestión.</p>

<h2>5. ¿Cómo borro o gestiono las cookies?</h2>
<p>Puede consultar, bloquear o eliminar las cookies en cualquier momento mediante la configuración de su navegador. Para las cookies esenciales, el bloqueo puede hacer que ciertas funciones del sitio dejen de estar disponibles. Instrucciones para los navegadores más habituales:</p>
<ul>
<li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
<li><a href="https://support.mozilla.org/es/kb/proteccion-mejorada-rastreo-firefox-escritorio" target="_blank" rel="noopener">Mozilla Firefox</a></li>
<li><a href="https://support.apple.com/es-es/guide/safari/sfri11471" target="_blank" rel="noopener">Apple Safari</a></li>
<li><a href="https://support.microsoft.com/es-es/microsoft-edge" target="_blank" rel="noopener">Microsoft Edge</a></li>
</ul>

<h2>6. Modificar la selección en cualquier momento</h2>
<p><a href="#" class="pxz-cookie-open-settings"><strong>→ Volver a abrir los ajustes de cookies</strong></a></p>

<h2>7. Información adicional</h2>
<p>Encontrará información completa sobre el tratamiento de sus datos personales en nuestra <a href="/datenschutzerklaerung/">Política de privacidad</a>. Para cualquier consulta puede escribirnos a <a href="mailto:praxis@westend-hausarzt.de">praxis@westend-hausarzt.de</a>.</p>

<p><em>Estado: 2 de mayo de 2026.</em></p>
HTML;

// =========================================================================
// TRANSLATIONS — DATENSCHUTZERKLÄRUNG (DSGVO)
// =========================================================================
$ds_en = <<<'HTML'
<h2>1. Controller</h2>
<p>The controller within the meaning of the General Data Protection Regulation (GDPR) for this website is:</p>
<p>Dr. med. Stracke<br>Internal medicine and family practice<br>Grüneburgweg 12<br>60322 Frankfurt am Main<br>Phone: 069 247 574 523<br>Email: praxis@westend-hausarzt.de</p>

<h2>2. General information on data processing</h2>
<p>We collect and use personal data of our patients and website visitors only insofar as this is necessary for the provision of a functional website and for medical care. The processing of personal data takes place regularly only with the consent of the data subject. An exception applies in cases where prior consent cannot be obtained for factual reasons and the processing of the data is permitted by law.</p>

<h2>3. Legal bases of processing</h2>
<ul>
<li><strong>Art. 6 (1) (a) GDPR</strong> — consent of the data subject</li>
<li><strong>Art. 6 (1) (b) GDPR</strong> — performance of a contract or pre-contractual measures</li>
<li><strong>Art. 6 (1) (c) GDPR</strong> — compliance with legal obligations</li>
<li><strong>Art. 9 (2) (h) GDPR</strong> — processing of health data for the purpose of medical diagnosis and care</li>
<li><strong>§ 22 (1) (b) BDSG</strong> — special national permission for health data</li>
</ul>

<h2>4. Data deletion and storage period</h2>
<p>Personal data of the data subject will be erased or blocked as soon as the purpose of storage no longer applies. Storage may take place beyond this if statutory retention obligations apply (e.g. tax-relevant documents 10 years, medical records 10 years according to § 630f BGB).</p>

<h2>5. Provision of the website and creation of log files</h2>
<p>Each time our website is accessed, our system automatically collects data and information from the computer system of the calling computer. The following data is collected: IP address of the requesting device, date and time of access, name and URL of the file accessed, website from which access was made (referrer URL), browser used and, if applicable, the operating system of your computer as well as the name of your access provider.</p>
<p>Storage takes place in log files of our system. The legal basis for the temporary storage of the data is Art. 6 (1) (f) GDPR. The data is stored for a maximum of 30 days and then deleted.</p>

<h2>6. Use of cookies</h2>
<p>Detailed information on the cookies used can be found in our <a href="/cookie-richtlinie-eu/">Cookie Policy</a>.</p>

<h2>7. Contact form and email contact</h2>
<p>Our website contains contact forms that can be used for electronic contact. If a user uses this option, the data entered in the input mask is transmitted to us and stored. These data are: name, contact details, the matter described and any health information you voluntarily provide.</p>
<p>The legal basis for the processing of the data is Art. 6 (1) (b) GDPR if the contact concerns the conclusion of a treatment contract, otherwise Art. 6 (1) (a) GDPR (consent) and Art. 9 (2) (h) GDPR for health data.</p>

<h2>8. Online appointment booking via Doctolib</h2>
<p>For online appointment booking we cooperate with Doctolib GmbH, Mehringdamm 51, 10961 Berlin. When you book an appointment via Doctolib, the data you provide will be processed by Doctolib on our behalf. Further information can be found in Doctolib's privacy policy: <a href="https://www.doctolib.de/terms/agreement" target="_blank" rel="noopener">doctolib.de/terms/agreement</a>.</p>

<h2>9. Rights of the data subject</h2>
<p>You have the right at any time:</p>
<ul>
<li>to obtain information about your processed personal data (Art. 15 GDPR)</li>
<li>to request the rectification of inaccurate personal data (Art. 16 GDPR)</li>
<li>to request the erasure of your personal data (Art. 17 GDPR)</li>
<li>to request the restriction of processing (Art. 18 GDPR)</li>
<li>to data portability (Art. 20 GDPR)</li>
<li>to object to processing (Art. 21 GDPR)</li>
<li>to withdraw consent at any time (Art. 7 (3) GDPR)</li>
<li>to lodge a complaint with a supervisory authority (Art. 77 GDPR)</li>
</ul>

<h2>10. Data security</h2>
<p>We use the widespread SSL/TLS encryption procedure in conjunction with the highest encryption level supported by your browser when visiting our website.</p>

<h2>11. Topicality and amendment of this privacy policy</h2>
<p>This privacy policy is currently valid and was last updated in May 2026. Due to the further development of our website and offers thereon or due to changed legal or official requirements, it may become necessary to amend this privacy policy.</p>
HTML;
$ds_fr = <<<'HTML'
<h2>1. Responsable du traitement</h2>
<p>Le responsable du traitement au sens du Règlement général sur la protection des données (RGPD) pour ce site web est :</p>
<p>Dr méd. Stracke<br>Cabinet de médecine interne et de médecine générale<br>Grüneburgweg 12<br>60322 Francfort-sur-le-Main<br>Téléphone : 069 247 574 523<br>Courriel : praxis@westend-hausarzt.de</p>

<h2>2. Informations générales sur le traitement des données</h2>
<p>Nous collectons et utilisons les données personnelles de nos patients et visiteurs du site uniquement dans la mesure où cela est nécessaire à la mise à disposition d'un site web fonctionnel et à la prise en charge médicale. Le traitement des données à caractère personnel n'a en règle générale lieu qu'avec le consentement de la personne concernée. Une exception s'applique dans les cas où il n'est pas possible d'obtenir un consentement préalable pour des raisons factuelles et où le traitement est autorisé par la loi.</p>

<h2>3. Bases légales du traitement</h2>
<ul>
<li><strong>Art. 6 (1) (a) RGPD</strong> — consentement de la personne concernée</li>
<li><strong>Art. 6 (1) (b) RGPD</strong> — exécution d'un contrat ou mesures précontractuelles</li>
<li><strong>Art. 6 (1) (c) RGPD</strong> — respect d'obligations légales</li>
<li><strong>Art. 9 (2) (h) RGPD</strong> — traitement de données de santé à des fins de diagnostic médical et de prise en charge</li>
<li><strong>§ 22 (1) (b) BDSG</strong> — autorisation nationale spéciale pour les données de santé</li>
</ul>

<h2>4. Effacement des données et durée de conservation</h2>
<p>Les données personnelles de la personne concernée seront effacées ou bloquées dès que la finalité de leur conservation cessera de s'appliquer. Une conservation au-delà peut avoir lieu si des obligations légales de conservation s'appliquent (p. ex. documents fiscaux 10 ans, dossiers médicaux 10 ans selon § 630f BGB).</p>

<h2>5. Mise à disposition du site et création de fichiers journaux</h2>
<p>À chaque accès à notre site, notre système collecte automatiquement des données et informations du système informatique de l'ordinateur appelant. Les données suivantes sont collectées : adresse IP de l'appareil, date et heure de l'accès, nom et URL du fichier consulté, site web à partir duquel l'accès a eu lieu (URL de référence), navigateur utilisé et, le cas échéant, système d'exploitation de votre ordinateur ainsi que le nom de votre fournisseur d'accès.</p>
<p>La conservation s'effectue dans les fichiers journaux de notre système. La base légale de la conservation temporaire des données est l'art. 6 (1) (f) RGPD. Les données sont conservées au maximum 30 jours puis supprimées.</p>

<h2>6. Utilisation de cookies</h2>
<p>Vous trouverez des informations détaillées sur les cookies utilisés dans notre <a href="/cookie-richtlinie-eu/">Politique de cookies</a>.</p>

<h2>7. Formulaire de contact et contact par e-mail</h2>
<p>Notre site comporte des formulaires de contact pouvant être utilisés pour une prise de contact électronique. Si un utilisateur utilise cette possibilité, les données saisies dans le masque de saisie nous sont transmises et conservées. Ces données sont : nom, coordonnées, motif décrit et toutes informations de santé que vous communiquez volontairement.</p>
<p>La base légale du traitement est l'art. 6 (1) (b) RGPD si le contact porte sur la conclusion d'un contrat de soins, sinon l'art. 6 (1) (a) RGPD (consentement) et l'art. 9 (2) (h) RGPD pour les données de santé.</p>

<h2>8. Prise de rendez-vous en ligne via Doctolib</h2>
<p>Pour la prise de rendez-vous en ligne, nous coopérons avec Doctolib GmbH, Mehringdamm 51, 10961 Berlin. Lorsque vous réservez un rendez-vous via Doctolib, les données que vous fournissez sont traitées par Doctolib pour notre compte. De plus amples informations figurent dans la politique de confidentialité de Doctolib : <a href="https://www.doctolib.de/terms/agreement" target="_blank" rel="noopener">doctolib.de/terms/agreement</a>.</p>

<h2>9. Droits de la personne concernée</h2>
<p>Vous disposez à tout moment du droit :</p>
<ul>
<li>d'obtenir des informations sur vos données personnelles traitées (art. 15 RGPD)</li>
<li>de demander la rectification de données personnelles inexactes (art. 16 RGPD)</li>
<li>de demander l'effacement de vos données personnelles (art. 17 RGPD)</li>
<li>de demander la limitation du traitement (art. 18 RGPD)</li>
<li>à la portabilité des données (art. 20 RGPD)</li>
<li>de vous opposer au traitement (art. 21 RGPD)</li>
<li>de retirer votre consentement à tout moment (art. 7 (3) RGPD)</li>
<li>d'introduire une réclamation auprès d'une autorité de contrôle (art. 77 RGPD)</li>
</ul>

<h2>10. Sécurité des données</h2>
<p>Nous utilisons la procédure de chiffrement SSL/TLS répandue, en combinaison avec le plus haut niveau de chiffrement pris en charge par votre navigateur lors de la consultation de notre site.</p>

<h2>11. Actualité et modification de la présente politique de confidentialité</h2>
<p>La présente politique de confidentialité est en vigueur et a été mise à jour pour la dernière fois en mai 2026. En raison du développement de notre site et des offres qui y figurent ou en raison de l'évolution des exigences légales ou administratives, il peut devenir nécessaire de modifier la présente politique de confidentialité.</p>
HTML;
$ds_es = <<<'HTML'
<h2>1. Responsable</h2>
<p>El responsable a efectos del Reglamento General de Protección de Datos (RGPD) de este sitio web es:</p>
<p>Dr. med. Stracke<br>Consulta de medicina interna y medicina general<br>Grüneburgweg 12<br>60322 Fráncfort del Meno<br>Teléfono: 069 247 574 523<br>Correo electrónico: praxis@westend-hausarzt.de</p>

<h2>2. Información general sobre el tratamiento de datos</h2>
<p>Recogemos y utilizamos los datos personales de nuestros pacientes y visitantes del sitio web únicamente en la medida en que sea necesario para la puesta a disposición de un sitio web funcional y para la asistencia médica. El tratamiento de datos personales se realiza por regla general únicamente con el consentimiento del interesado. Se aplica una excepción en aquellos casos en los que no sea posible obtener un consentimiento previo por motivos fácticos y el tratamiento esté permitido por la ley.</p>

<h2>3. Bases jurídicas del tratamiento</h2>
<ul>
<li><strong>Art. 6, apdo. 1, letra a, RGPD</strong> — consentimiento del interesado</li>
<li><strong>Art. 6, apdo. 1, letra b, RGPD</strong> — ejecución de un contrato o medidas precontractuales</li>
<li><strong>Art. 6, apdo. 1, letra c, RGPD</strong> — cumplimiento de obligaciones legales</li>
<li><strong>Art. 9, apdo. 2, letra h, RGPD</strong> — tratamiento de datos de salud con fines de diagnóstico médico y asistencia sanitaria</li>
<li><strong>§ 22 (1) (b) BDSG</strong> — autorización nacional especial para datos de salud</li>
</ul>

<h2>4. Supresión de los datos y plazo de conservación</h2>
<p>Los datos personales del interesado se suprimirán o bloquearán tan pronto como deje de aplicarse la finalidad de la conservación. La conservación más allá puede tener lugar si existen obligaciones legales de conservación (p. ej. documentos fiscales 10 años, historia clínica 10 años según § 630f BGB).</p>

<h2>5. Provisión del sitio web y creación de ficheros de registro</h2>
<p>En cada acceso a nuestro sitio web, nuestro sistema recoge automáticamente datos e información del sistema informático del ordenador que realiza la consulta. Se recopilan los siguientes datos: dirección IP del dispositivo solicitante, fecha y hora de acceso, nombre y URL del archivo consultado, sitio web desde el que se realizó el acceso (URL de referencia), navegador utilizado y, en su caso, el sistema operativo de su ordenador, así como el nombre de su proveedor de acceso.</p>
<p>La conservación se realiza en los ficheros de registro de nuestro sistema. La base jurídica de la conservación temporal de los datos es el art. 6, apdo. 1, letra f, RGPD. Los datos se conservan un máximo de 30 días y, a continuación, se suprimen.</p>

<h2>6. Uso de cookies</h2>
<p>Encontrará información detallada sobre las cookies utilizadas en nuestra <a href="/cookie-richtlinie-eu/">Política de cookies</a>.</p>

<h2>7. Formulario de contacto y contacto por correo electrónico</h2>
<p>Nuestro sitio web contiene formularios de contacto que se pueden utilizar para el contacto electrónico. Si un usuario utiliza esta opción, los datos introducidos en la máscara de entrada se nos transmiten y se almacenan. Estos datos son: nombre, datos de contacto, asunto descrito y, en su caso, los datos de salud que usted facilite voluntariamente.</p>
<p>La base jurídica del tratamiento es el art. 6, apdo. 1, letra b, RGPD si el contacto se refiere a la celebración de un contrato de tratamiento; en caso contrario, el art. 6, apdo. 1, letra a, RGPD (consentimiento) y el art. 9, apdo. 2, letra h, RGPD para datos de salud.</p>

<h2>8. Reserva de cita en línea a través de Doctolib</h2>
<p>Para la reserva de cita en línea cooperamos con Doctolib GmbH, Mehringdamm 51, 10961 Berlín. Cuando reserva una cita a través de Doctolib, los datos que facilita son tratados por Doctolib por encargo nuestro. Encontrará más información en la política de privacidad de Doctolib: <a href="https://www.doctolib.de/terms/agreement" target="_blank" rel="noopener">doctolib.de/terms/agreement</a>.</p>

<h2>9. Derechos del interesado</h2>
<p>Tiene derecho en cualquier momento:</p>
<ul>
<li>a obtener información sobre sus datos personales tratados (art. 15 RGPD)</li>
<li>a solicitar la rectificación de datos personales inexactos (art. 16 RGPD)</li>
<li>a solicitar la supresión de sus datos personales (art. 17 RGPD)</li>
<li>a solicitar la limitación del tratamiento (art. 18 RGPD)</li>
<li>a la portabilidad de los datos (art. 20 RGPD)</li>
<li>a oponerse al tratamiento (art. 21 RGPD)</li>
<li>a retirar el consentimiento en cualquier momento (art. 7, apdo. 3, RGPD)</li>
<li>a presentar una reclamación ante una autoridad de control (art. 77 RGPD)</li>
</ul>

<h2>10. Seguridad de los datos</h2>
<p>Utilizamos el procedimiento de cifrado SSL/TLS extendido, junto con el nivel de cifrado más alto soportado por su navegador, al visitar nuestro sitio web.</p>

<h2>11. Actualidad y modificación de esta política de privacidad</h2>
<p>Esta política de privacidad está vigente actualmente y se actualizó por última vez en mayo de 2026. Debido al desarrollo de nuestro sitio web y de las ofertas en él, o a cambios en los requisitos legales o administrativos, puede ser necesario modificar la presente política de privacidad.</p>
HTML;

// =========================================================================
// PLANS
// =========================================================================
$bridge_with_content = [
    3 => [
        'de_slug' => 'datenschutzerklaerung',
        'tpl' => 'template-standard.php',
        'translations' => [
            'en' => [ 'title' => 'Privacy Policy',                  'slug' => 'privacy-policy',                  'content' => $ds_en ],
            'fr' => [ 'title' => 'Politique de confidentialité',    'slug' => 'politique-de-confidentialite',    'content' => $ds_fr ],
            'es' => [ 'title' => 'Política de privacidad',          'slug' => 'politica-de-privacidad',          'content' => $ds_es ],
        ],
    ],
    9668 => [
        'de_slug' => 'basic-check',
        'tpl' => 'template-bridge-product.php',
        'translations' => [
            'en' => [ 'title' => 'Basic Check — Information', 'slug' => 'basic-check-en', 'content' => $basic_check_en ],
            'fr' => [ 'title' => 'Basic Check — Information', 'slug' => 'basic-check-fr', 'content' => $basic_check_fr ],
            'es' => [ 'title' => 'Basic Check — Información', 'slug' => 'basic-check-es', 'content' => $basic_check_es ],
        ],
    ],
    9685 => [
        'de_slug' => 'service',
        'tpl' => 'template-standard.php',
        'translations' => [
            'en' => [ 'title' => 'Patient services',     'slug' => 'patient-services',     'content' => $service_en ],
            'fr' => [ 'title' => 'Services aux patients','slug' => 'services-aux-patients','content' => $service_fr ],
            'es' => [ 'title' => 'Servicios al paciente','slug' => 'servicios-al-paciente','content' => $service_es ],
        ],
    ],
    9699 => [
        'de_slug' => 'aktuelles',
        'tpl' => 'template-standard.php',
        'translations' => [
            'en' => [ 'title' => 'News',      'slug' => 'news',       'content' => $aktuelles_en ],
            'fr' => [ 'title' => 'Actualités','slug' => 'actualites', 'content' => $aktuelles_fr ],
            'es' => [ 'title' => 'Novedades', 'slug' => 'novedades',  'content' => $aktuelles_es ],
        ],
    ],
    9709 => [
        'de_slug' => 'cookie-richtlinie-eu',
        'tpl' => 'template-standard.php',
        'translations' => [
            'en' => [ 'title' => 'Cookie Policy',         'slug' => 'cookie-policy',         'content' => $cookie_en ],
            'fr' => [ 'title' => 'Politique de cookies',  'slug' => 'politique-cookies',     'content' => $cookie_fr ],
            'es' => [ 'title' => 'Política de cookies',   'slug' => 'politica-de-cookies',   'content' => $cookie_es ],
        ],
    ],
    9888 => [
        'de_slug' => 'faq',
        'tpl' => '',
        'translations' => [
            'en' => [ 'title' => 'FAQ', 'slug' => 'faq-en', 'content' => $faq_en ],
            'fr' => [ 'title' => 'FAQ', 'slug' => 'faq-fr', 'content' => $faq_fr ],
            'es' => [ 'title' => 'FAQ', 'slug' => 'faq-es', 'content' => $faq_es ],
        ],
    ],
];

$de_home_content      = get_post_field( 'post_content', 9663 );
$de_sprech_content    = get_post_field( 'post_content', 9673 );
$de_fragebogen_content= get_post_field( 'post_content', 9782 );
$de_video_content     = get_post_field( 'post_content', 9890 );

$bridge_clen0 = [
    9663 => [
        'de_slug' => 'home-neu',
        'tpl' => 'template-homepage.php',
        'translations' => [
            'en' => [ 'title' => 'Practice — Home',    'slug' => 'home-en', 'content' => $de_home_content ],
            'fr' => [ 'title' => 'Cabinet — Accueil',  'slug' => 'home-fr', 'content' => $de_home_content ],
            'es' => [ 'title' => 'Consulta — Inicio',  'slug' => 'home-es', 'content' => $de_home_content ],
        ],
    ],
    9673 => [
        'de_slug' => 'sprechstunden',
        'tpl' => 'template-sprechstunden.php',
        'translations' => [
            'en' => [ 'title' => 'Office hours & appointments', 'slug' => 'office-hours',          'content' => $de_sprech_content ],
            'fr' => [ 'title' => 'Horaires et rendez-vous',     'slug' => 'horaires-consultation', 'content' => $de_sprech_content ],
            'es' => [ 'title' => 'Horarios y citas',            'slug' => 'horarios-consulta',     'content' => $de_sprech_content ],
        ],
    ],
    9782 => [
        'de_slug' => 'fragebogen-vor-termin',
        'tpl' => '',
        'translations' => [
            'en' => [ 'title' => 'Pre-appointment questionnaire', 'slug' => 'pre-appointment-questionnaire', 'content' => $de_fragebogen_content ],
            'fr' => [ 'title' => 'Questionnaire pré-RDV',         'slug' => 'questionnaire-pre-rdv',         'content' => $de_fragebogen_content ],
            'es' => [ 'title' => 'Cuestionario previo a la cita', 'slug' => 'cuestionario-previo-cita',      'content' => $de_fragebogen_content ],
        ],
    ],
    9890 => [
        'de_slug' => 'videosprechstunde',
        'tpl' => 'template-standard.php',
        'translations' => [
            'en' => [ 'title' => 'Video consultation',     'slug' => 'video-consultation',     'content' => $de_video_content ],
            'fr' => [ 'title' => 'Consultation par vidéo', 'slug' => 'consultation-par-video', 'content' => $de_video_content ],
            'es' => [ 'title' => 'Consulta por vídeo',     'slug' => 'consulta-por-video',     'content' => $de_video_content ],
        ],
    ],
];

// =========================================================================
// HELPERS (Pattern-Gen-2.2)
// =========================================================================
function sa_get_trid( $de_id ) {
    global $wpdb;
    // Pattern-Gen-2.3: bei mehreren DE-Rows (Doubletten) den höchsten translation_id
    // nehmen (jüngster Eintrag). WP-Default-Pages (ID 1, 2, 3) haben oft historische
    // Doubletten aus WPML-Setup-Phasen.
    return (int) $wpdb->get_var( $wpdb->prepare(
        "SELECT trid FROM {$wpdb->prefix}icl_translations
         WHERE element_id = %d AND element_type='post_page' AND language_code='de'
         ORDER BY translation_id DESC LIMIT 1", $de_id ) );
}
function sa_get_translation_id( $trid, $lang ) {
    global $wpdb;
    return (int) $wpdb->get_var( $wpdb->prepare(
        "SELECT element_id FROM {$wpdb->prefix}icl_translations
         WHERE trid=%d AND element_type='post_page' AND language_code=%s", $trid, $lang ) );
}
function sa_bridge( $de_id, $lang, $title, $slug, $content, $tpl, $commit ) {
    global $wpdb;
    $trid = sa_get_trid( $de_id );
    if ( ! $trid ) return [ 'ERROR', "no DE trid for {$de_id}" ];
    $existing = sa_get_translation_id( $trid, $lang );
    if ( $existing ) return [ 'EXISTS', "trid={$trid} {$lang}={$existing}" ];
    if ( ! $commit ) return [ 'PLAN', "BRIDGE de={$de_id} trid={$trid} →{$lang}/{$slug} clen=" . strlen( $content ) ];

    $new_id = wp_insert_post([
        'post_title' => $title, 'post_name' => $slug, 'post_content' => $content,
        'post_status' => 'publish', 'post_type' => 'page', 'post_author' => 1,
        'comment_status' => 'closed', 'ping_status' => 'closed',
    ], true );
    if ( is_wp_error( $new_id ) ) return [ 'ERROR', $new_id->get_error_message() ];
    if ( $tpl ) update_post_meta( $new_id, '_wp_page_template', $tpl );

    $r = $wpdb->update( "{$wpdb->prefix}icl_translations",
        [ 'trid' => $trid, 'language_code' => $lang, 'source_language_code' => 'de' ],
        [ 'element_type' => 'post_page', 'element_id' => $new_id ]
    );
    if ( $r === false ) return [ 'ERROR', "wpml-link UPDATE failed: " . $wpdb->last_error ];
    return [ 'CREATED', "→ID={$new_id} clen=" . strlen( $content ) ];
}

// =========================================================================
// EXECUTE
// =========================================================================
$counters = [];

if ( ! $skip_cleanup ) {
    echo "--- Phase 0: CLEANUP ---\n";
    foreach ( $cleanup_ids as $id => $reason ) {
        $p = get_post( $id );
        if ( ! $p ) {
            $counters['SKIP'] = ($counters['SKIP'] ?? 0)+1;
            printf("  [SKIP   ] ID=%d already deleted\n", $id);
            continue;
        }
        if ( ! $commit ) {
            $counters['PLAN'] = ($counters['PLAN'] ?? 0)+1;
            printf("  [PLAN   ] ID=%d delete: %s\n", $id, $reason);
            continue;
        }
        $r = wp_delete_post( $id, true );
        if ( $r ) {
            // Pattern-Gen-2.3: WPML-Rows hängen oft noch nach wp_delete_post.
            // Stale rows verhindern später korrekte BRIDGE-Erkennung (geben EXISTS
            // statt CREATED zurück). Hard-delete sie explizit.
            $stale = $wpdb->delete( "{$wpdb->prefix}icl_translations",
                [ 'element_id' => $id, 'element_type' => 'post_page' ] );
            $counters['DELETED'] = ($counters['DELETED'] ?? 0)+1;
            printf("  [DELETED] ID=%d (+%d wpml-rows) %s\n", $id, $stale, $reason);
        } else {
            $counters['ERROR'] = ($counters['ERROR'] ?? 0)+1;
            printf("  [ERROR  ] ID=%d delete failed\n", $id);
        }
    }
    echo "\n";
}

echo "--- Phase 1: BRIDGE-with-content ---\n";
foreach ( $bridge_with_content as $de_id => $cfg ) {
    foreach ( $cfg['translations'] as $lang => $t ) {
        if ( $lang_filter && $lang !== $lang_filter ) continue;
        [ $st, $msg ] = sa_bridge( $de_id, $lang, $t['title'], $t['slug'], $t['content'], $cfg['tpl'], $commit );
        $counters[$st] = ($counters[$st]??0)+1;
        printf("  [%-7s] %-22s %s → %s\n", $st, $cfg['de_slug'], $lang, $msg);
    }
}
echo "\n--- Phase 2: BRIDGE-clen0 ---\n";
foreach ( $bridge_clen0 as $de_id => $cfg ) {
    foreach ( $cfg['translations'] as $lang => $t ) {
        if ( $lang_filter && $lang !== $lang_filter ) continue;
        [ $st, $msg ] = sa_bridge( $de_id, $lang, $t['title'], $t['slug'], $t['content'], $cfg['tpl'], $commit );
        $counters[$st] = ($counters[$st]??0)+1;
        printf("  [%-7s] %-22s %s → %s\n", $st, $cfg['de_slug'], $lang, $msg);
    }
}
echo "\n=== SUMMARY ===\n";
foreach ($counters as $k=>$v) printf("  %s: %d\n", $k, $v);
$err = $counters['ERROR'] ?? 0;
echo "\n" . ( $err ? "FAIL ({$err})" : ($commit ? "OK (committed)" : "OK (dry-run)") ) . "\n";
exit( $err ? 1 : 0 );
