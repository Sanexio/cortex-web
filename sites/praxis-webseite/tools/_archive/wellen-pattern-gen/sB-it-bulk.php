<?php
/**
 * Session B — IT-Volumen-Welle (LL-060 Autonomy Mode v1)
 *
 * Pattern-Generation 2.3 (alle Lessons aus S68/S69/S70/sA-Phase-1 gebündelt):
 *   - Multi-Mode in einem Skript: BRIDGE-with-content + BRIDGE-clen0
 *   - WPML-UPDATE statt INSERT (Hook-Workaround, S70)
 *   - sa_get_trid mit ORDER BY translation_id DESC (Doubletten-Robust, sA)
 *   - Cleanup mit WPML-Row-Hard-Delete (sA)
 *
 * Operationen:
 *   - 14 Klasse-A Pages × IT-Volltext = 14 ops
 *   - 49 Klasse-B Pages × IT-Bridge clen=0 (via DE-content für Template-Render) = 49 ops
 *   - 0 Cleanup
 *   - Total: 63 Pages → IT-Bridge
 *
 * Klasse-B-Pages mit template-detail-page.php fallen für Detail-Inhalte auf
 * DE-Trunk zurück (Folge-Punkt κ: inc/data/page-hub-*.php Trunk-i18n).
 * Akzeptiert für Welle B; löst die Trunk-i18n-Welle (Session D).
 *
 * Glossar-Compliance via inc/i18n-glossary.php (S63, 92 Begriffe × 6 Sprachen).
 *
 * Usage:
 *   php sB-it-bulk.php             # dry-run
 *   php sB-it-bulk.php --commit    # apply
 */
define( 'WP_USE_THEMES', false );
require '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-load.php';
global $wpdb;

$commit = in_array( '--commit', $argv ?? [], true );
echo "MODE: " . ( $commit ? "COMMIT" : "DRY-RUN" ) . "\n\n";

// =========================================================================
// HELPERS (Pattern-Gen-2.3)
// =========================================================================
function sb_get_trid( $de_id ) {
    global $wpdb;
    return (int) $wpdb->get_var( $wpdb->prepare(
        "SELECT trid FROM {$wpdb->prefix}icl_translations
         WHERE element_id = %d AND element_type='post_page' AND language_code='de'
         ORDER BY translation_id DESC LIMIT 1", $de_id ) );
}
function sb_get_translation_id( $trid, $lang ) {
    global $wpdb;
    return (int) $wpdb->get_var( $wpdb->prepare(
        "SELECT element_id FROM {$wpdb->prefix}icl_translations
         WHERE trid=%d AND element_type='post_page' AND language_code=%s", $trid, $lang ) );
}
function sb_bridge_it( $de_id, $title, $slug, $content, $tpl, $commit ) {
    global $wpdb;
    $trid = sb_get_trid( $de_id );
    if ( ! $trid ) return [ 'ERROR', "no DE trid for {$de_id}" ];
    $existing = sb_get_translation_id( $trid, 'it' );
    if ( $existing ) return [ 'EXISTS', "trid={$trid} it={$existing}" ];
    if ( ! $commit ) return [ 'PLAN', "BRIDGE de={$de_id} trid={$trid} →it/{$slug} clen=" . strlen( $content ) ];

    $new_id = wp_insert_post([
        'post_title' => $title, 'post_name' => $slug, 'post_content' => $content,
        'post_status' => 'publish', 'post_type' => 'page', 'post_author' => 1,
        'comment_status' => 'closed', 'ping_status' => 'closed',
    ], true );
    if ( is_wp_error( $new_id ) ) return [ 'ERROR', $new_id->get_error_message() ];
    if ( $tpl ) update_post_meta( $new_id, '_wp_page_template', $tpl );

    $r = $wpdb->update( "{$wpdb->prefix}icl_translations",
        [ 'trid' => $trid, 'language_code' => 'it', 'source_language_code' => 'de' ],
        [ 'element_type' => 'post_page', 'element_id' => $new_id ]
    );
    if ( $r === false ) return [ 'ERROR', "wpml-link UPDATE failed: " . $wpdb->last_error ];
    return [ 'CREATED', "→ID={$new_id} clen=" . strlen( $content ) ];
}

// =========================================================================
// KLASSE A — Volltext-IT-Übersetzungen (14 Pages)
// =========================================================================

// faq (9888) — clen=355
$faq_it = <<<'HTML'
<h2>Domande frequenti</h2>
<p>Risposte alle domande più frequenti dei nostri pazienti su ricoveri ospedalieri, impegnative per specialisti e certificati di malattia.</p>
<ul>
  <li><a href="/service/einweisungen/">Ricoveri e impegnative</a></li>
  <li><a href="/service/arbeitsunfaehigkeit/">Certificato di malattia (AU)</a></li>
</ul>
HTML;

// service (9685) — Service-Hub clen=1116
$service_it = <<<'HTML'
<!-- wp:paragraph -->
<p>In queste pagine trovate le informazioni organizzative e i moduli per le richieste più frequenti relative al vostro percorso di cura nel nostro studio.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
  <li><a href="/service/terminanfrage/">Richiesta appuntamento</a> — richiedere un appuntamento per consulenza acuta o programmata</li>
  <li><a href="/service/rezeptbestellung/">Richiesta ricetta</a> — riordinare farmaci come paziente già seguito</li>
  <li><a href="/service/ueberweisung/">Richiesta impegnativa</a> — far preparare un'impegnativa in anticipo</li>
  <li><a href="/service/arbeitsunfaehigkeit/">Certificato di malattia (AU)</a> — quadro normativo</li>
  <li><a href="/service/einweisungen/">Ricoveri e impegnative</a> — ospedale, esami preoperatori, specialista</li>
  <li><a href="/service/neupatienten/">Iscrizione nuovi pazienti</a> — lista d'attesa per nuove ammissioni</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Per richieste urgenti contattateci telefonicamente. I recapiti sono disponibili in <a href="/contact-us/">Contatti</a>.</p>
<!-- /wp:paragraph -->
HTML;

// basic-check (9668) — Cross-Brand Sanexio clen=1257
$basic_check_it = <<<'HTML'
<!-- wp:paragraph -->
<p>Il check-up compatto.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Piccolo check-up di laboratorio con 15 parametri. Prelievo in studio,<br>risultati entro 48 ore.<br></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Parametri di laboratorio</h2>
<!-- /wp:heading -->

<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Parametro</th><th>Unità</th></tr></thead><tbody><tr><td>HGB</td><td>g/dl</td></tr><tr><td>WBC</td><td>/µl</td></tr><tr><td>RBC</td><td>T/l</td></tr><tr><td>HCT</td><td>%</td></tr><tr><td>MCV</td><td>fl</td></tr><tr><td>MCH</td><td>pg</td></tr><tr><td>MCHC</td><td>g/dl</td></tr><tr><td>PLT</td><td>G/l</td></tr><tr><td>Na</td><td>mmol/l</td></tr><tr><td>K</td><td>mmol/l</td></tr><tr><td>Krea</td><td>mg/dl</td></tr><tr><td>GFR</td><td>ml/min</td></tr><tr><td>GOT</td><td>U/l</td></tr><tr><td>GPT</td><td>U/l</td></tr><tr><td>CRP</td><td>mg/l</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://sanexio.eu/products/basic-check">Maggiori informazioni su sanexio.eu</a></div></div>
<!-- /wp:buttons -->
HTML;

// aktuelles (9699) — clen=1666
$aktuelles_it = <<<'HTML'
<!-- wp:paragraph -->
<p>In questa sezione informiamo regolarmente le nostre pazienti e i nostri pazienti sulle novità dello studio — orari modificati, nuove prestazioni, campagne vaccinali o avvisi organizzativi.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Ammissione nuovi pazienti</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A causa dell'elevata richiesta, manteniamo una lista d'attesa per nuovi pazienti. Le regole attuali di ammissione sono disponibili in <a href="/service/neupatienten/">Iscrizione nuovi pazienti</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Studio annesso Bockenheimer Landstraße 33</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La nostra seconda sede in Bockenheimer Landstraße 33, presso Eterno, amplia la nostra offerta con ulteriori fasce di consulenza. Dettagli in <a href="/standorte/zweigpraxis-bockenheimer/">Studio annesso Bockenheimer Landstraße 33</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Contatti e prenotazione appuntamenti</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Per richieste di appuntamento, ordini di ricette e questioni organizzative utilizzate la sezione <a href="/service/">Servizi</a> oppure contattateci telefonicamente — tutti i recapiti in <a href="/contact-us/">Contatti</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><em>[Segnaposto — questa sezione sarà compilata dal team editoriale con annunci concreti (sospensioni delle consulenze, date di vaccinazione, nuovi ingressi nel personale). Il Dr. Stracke aggiungerà i primi contenuti reali dopo l'approvazione della bozza.]</em></p>
<!-- /wp:paragraph -->
HTML;

// einweisungen (9687) — clen=3585
$einweisungen_it = <<<'HTML'
<!-- wp:heading -->
<h2>Bon d'hospitalisation / Bono di ricovero ospedaliero</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In quanto medici di base, siamo tenuti a esaurire tutte le possibilità ambulatoriali prima di rilasciare un'impegnativa per il ricovero in ospedale.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Vale inoltre il principio per cui le impegnative di ricovero vengono rilasciate dal medico curante. Se ad esempio l'ortopedico ha consigliato l'intervento chirurgico, è lui che deve rilasciare l'impegnativa. Se invece l'indicazione al ricovero viene posta nel nostro studio, sarà nostro compito rilasciarla.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Esami preoperatori prima del ricovero</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Molti ospedali eseguono in autonomia gli esami preoperatori. A volte la clinica desidera però che siano effettuati nel nostro studio (di solito laboratorio ed ECG). Ciò è possibile solo se l'intervento vero e proprio viene eseguito in regime ambulatoriale. In tal caso vi preghiamo di portarci la lettera della clinica con l'elenco degli esami richiesti. Senza questo documento purtroppo non possiamo eseguire alcun esame preoperatorio. Per questa preparazione è inoltre obbligatoria una visita medica — vi preghiamo di prenotare un appuntamento. Tutti gli altri esami devono essere eseguiti dalla clinica nell'ambito del cosiddetto soggiorno pre-ricovero.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Cure di follow-up dopo l'intervento</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In linea di principio tutti i chirurghi sono tenuti a eseguire personalmente le cure post-operatorie (cambio bendaggi, rimozione punti di sutura, ecc.). Qualora il chirurgo desideri delegare tali compiti al nostro studio (anche qui solo per interventi ambulatoriali; in caso contrario la clinica dovrebbe organizzare con voi un appuntamento post-ricovero), deve rilasciare un'impegnativa con la data dell'intervento e il codice operatorio. Senza questa impegnativa l'assicurazione sanitaria non rimborsa il follow-up e dovremo rinviarvi alla clinica.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Per gli interventi in regime di ricovero, l'ospedale è tenuto a garantire le cure post-operatorie (inclusa la rimozione dei punti di sutura e delle graffette) fino a tre settimane dopo la dimissione.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Impegnative ad altri specialisti</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>In quanto medici di base dobbiamo verificare con attenzione l'indicazione per un'impegnativa verso un'altra specialità. Se siete affetti da una malattia cronica che richiede esami specialistici regolari, l'impegnativa può essere prenotata in anticipo indicando la diagnosi (p. es. diabete mellito, insufficienza renale dialisi-dipendente, …). In tutti gli altri casi è necessario un contatto medico preliminare nel nostro studio.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Per gli esami preventivi (ginecologo, colonscopia, ecc.) potete consultare questi specialisti senza impegnativa. Per i medici che non eseguono esami preventivi previsti dalla legge è necessaria una diagnosi da approfondire prima di poter rilasciare un'impegnativa.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Non rilasciamo impegnative per anestesisti: ciò deve essere fatto dal medico che incarica l'anestesista.</p>
<!-- /wp:paragraph -->
HTML;

// arbeitsunfaehigkeit (466) — clen=2859
$arbeitsunfaehigkeit_it = <<<'HTML'
<p>Il medico è responsabile, con la propria abilitazione, della correttezza dei certificati di malattia (AU) rilasciati. Per ottenere un AU deve necessariamente essere presente una malattia. Gli AU possono essere rilasciati solo dopo un contatto personale. In linea di principio non è possibile un rilascio retroattivo. Se vi ammalate il venerdì o nel fine settimana e il vostro datore di lavoro desidera già il lunedì un AU per quel periodo, allora l'AU del lunedì copre già il venerdì oppure il sabato/la domenica.</p>

<p>Da molti datori di lavoro è ammessa anche un'auto-certificazione di malattia da parte del lavoratore per i primi 3 giorni di calendario. Vi preghiamo di chiedere al vostro datore di lavoro come gestisce questo aspetto. La duplicazione dei sistemi (auto-certificazione del lavoratore E AU del medico) rappresenta uno spreco di risorse.</p>

<p>Solo a partire dal quarto giorno di malattia (cioè dal terzo giorno di assenza ininterrotta dal lavoro) il datore di lavoro può richiedere obbligatoriamente un AU del medico.</p>

<p>Tenete presente che a partire dal 2023 gli AU vengono trasmessi elettronicamente alla cassa malattia (eAU). La cassa malattia inoltra l'AU al datore di lavoro. Non riceverete più alcun documento cartaceo per il datore di lavoro. Continuerete invece a ricevere una copia per i vostri archivi personali.</p>

<p>In caso di lunghi periodi di malattia (oltre 6 settimane) la cassa malattia paga, in determinate condizioni, un'indennità di malattia. Per questo è necessario che il vostro AU venga prolungato senza interruzioni dal medico curante. Anche un solo giorno di interruzione fra due AU può comportare la perdita dell'indennità di malattia. In caso di problemi vi preghiamo di rivolgerVi tempestivamente al nostro studio.</p>

<p>Per AU di durata superiore a 6 settimane consecutive il medico è generalmente tenuto a effettuare un colloquio personale con il paziente.</p>
HTML;

// cookie-richtlinie-eu (9709) — clen=4332
$cookie_it = <<<'HTML'
<h2>1. Cosa sono i cookie?</h2>
<p>I cookie sono piccoli file di testo memorizzati sul vostro dispositivo quando visitate un sito web. Permettono fra l'altro al sito di riconoscere la vostra preferenza linguistica, di evitarvi di dover esprimere il consenso ad ogni clic e di integrare contenuti di terzi (ad esempio la prenotazione online di appuntamenti o le mappe).</p>

<h2>2. Consenso</h2>
<p>Alla prima visita di questo sito web vi mostriamo un banner cookie nel quale potete scegliere quali categorie di cookie e tecnologie analoghe autorizzare. I cookie <strong>essenziali</strong> sono sempre caricati perché tecnicamente necessari al funzionamento del sito. I cookie di <strong>statistica</strong> e di <strong>contenuti esterni</strong> vengono attivati esclusivamente con il vostro consenso esplicito (art. 6 par. 1 lett. a GDPR, § 25 c. 1 TTDSG).</p>

<p>Potete modificare o revocare la vostra scelta in qualsiasi momento — tramite il link <a href="#" class="pxz-cookie-open-settings">Impostazioni cookie</a> oppure tramite la gestione dei cookie del vostro browser.</p>

<h2>3. Cookie utilizzati</h2>

<h3>3.1 Cookie essenziali</h3>
<ul>
<li><code>pxz_cookie_consent</code> — memorizza la vostra scelta nel banner cookie. Durata: 365 giorni. Fornitore: questo server.</li>
<li>Cookie di sessione e sicurezza WordPress (p. es. <code>wordpress_test_cookie</code>) — temporanei, solo per le funzioni di login/sicurezza. Fornitore: questo server.</li>
</ul>

<h3>3.2 Statistica / misurazione audience (solo con consenso)</h3>
<p>Attualmente non utilizziamo strumenti di tracciamento come Google Analytics o Matomo. In caso di modifiche, i cookie corrispondenti saranno documentati qui e attivati esclusivamente con il vostro consenso.</p>

<h3>3.3 Contenuti esterni (solo con consenso)</h3>
<ul>
<li><strong>Doctolib</strong> — prenotazione online di appuntamenti. Quando prenotate un appuntamento tramite il sito, venite reindirizzati a doctolib.de oppure la finestra di prenotazione viene incorporata nelle nostre pagine. Doctolib imposta i propri cookie; il trattamento dei dati avviene sotto la responsabilità di Doctolib GmbH (Berlino). Informativa privacy: <a href="https://www.doctolib.de/p/agb" target="_blank" rel="noopener">doctolib.de/p/agb</a>.</li>
<li><strong>Google Maps</strong> — mappa di accesso. Al caricamento della mappa vengono trasmessi dati di connessione a Google Ireland Ltd. Informativa privacy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</li>
</ul>

<h2>4. Periodo di conservazione</h2>
<p>I cookie essenziali sono conservati solo per il tempo necessario al loro scopo — di norma per la durata della sessione, il cookie di consenso 365 giorni. I cookie delle categorie statistica / contenuti esterni sono conservati secondo le indicazioni del rispettivo fornitore (tipicamente fra alcuni giorni e 24 mesi); i dettagli sono nell'informativa privacy del fornitore corrispondente.</p>

<h2>5. Come elimino o gestisco i cookie?</h2>
<p>Potete consultare, bloccare o eliminare i cookie in qualsiasi momento tramite le impostazioni del vostro browser. Per i cookie essenziali il blocco può rendere indisponibili alcune funzioni del sito. Istruzioni per i browser più diffusi:</p>
<ul>
<li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
<li><a href="https://support.mozilla.org/it/kb/cookie-informazioni-che-i-siti-web-conservano-su-c" target="_blank" rel="noopener">Mozilla Firefox</a></li>
<li><a href="https://support.apple.com/it-it/guide/safari/sfri11471" target="_blank" rel="noopener">Apple Safari</a></li>
<li><a href="https://support.microsoft.com/it-it/microsoft-edge" target="_blank" rel="noopener">Microsoft Edge</a></li>
</ul>

<h2>6. Modifica della scelta in qualsiasi momento</h2>
<p><a href="#" class="pxz-cookie-open-settings"><strong>→ Riapri impostazioni cookie</strong></a></p>

<h2>7. Ulteriori informazioni</h2>
<p>Trovate tutte le informazioni sul trattamento dei vostri dati personali nella nostra <a href="/datenschutzerklaerung/">Informativa privacy</a>. Per domande potete contattarci all'indirizzo <a href="mailto:praxis@westend-hausarzt.de">praxis@westend-hausarzt.de</a>.</p>

<p><em>Stato: 2 maggio 2026.</em></p>
HTML;

// datenschutzerklaerung (3) — clen=7407
$datenschutz_it = <<<'HTML'
<h2>1. Titolare del trattamento</h2>
<p>Il titolare del trattamento ai sensi del Regolamento generale sulla protezione dei dati (GDPR) per questo sito web è:</p>
<p>Dr. med. Stracke<br>Studio di medicina interna e medicina generale<br>Grüneburgweg 12<br>60322 Francoforte sul Meno<br>Telefono: 069 247 574 523<br>E-mail: praxis@westend-hausarzt.de</p>

<h2>2. Informazioni generali sul trattamento dei dati</h2>
<p>Raccogliamo e utilizziamo i dati personali dei nostri pazienti e dei visitatori del sito solo nella misura necessaria per la messa a disposizione di un sito funzionale e per l'assistenza medica. Il trattamento dei dati personali avviene di regola solo con il consenso dell'interessato. Fa eccezione il caso in cui un consenso preventivo non sia possibile per motivi di fatto e il trattamento sia consentito dalla legge.</p>

<h2>3. Basi giuridiche del trattamento</h2>
<ul>
<li><strong>Art. 6 par. 1 lett. a GDPR</strong> — consenso dell'interessato</li>
<li><strong>Art. 6 par. 1 lett. b GDPR</strong> — esecuzione di un contratto o misure precontrattuali</li>
<li><strong>Art. 6 par. 1 lett. c GDPR</strong> — adempimento di obblighi di legge</li>
<li><strong>Art. 9 par. 2 lett. h GDPR</strong> — trattamento di dati sanitari per finalità di diagnosi e assistenza medica</li>
<li><strong>§ 22 c. 1 lett. b BDSG</strong> — autorizzazione nazionale specifica per dati sanitari</li>
</ul>

<h2>4. Cancellazione dei dati e periodo di conservazione</h2>
<p>I dati personali dell'interessato saranno cancellati o bloccati non appena la finalità della conservazione viene meno. Una conservazione oltre questo termine può avvenire se sussistono obblighi legali di conservazione (p. es. documenti fiscali 10 anni, cartelle cliniche 10 anni ai sensi del § 630f BGB).</p>

<h2>5. Messa a disposizione del sito e creazione di file di log</h2>
<p>Ad ogni accesso al nostro sito, il nostro sistema raccoglie automaticamente dati e informazioni dal sistema informatico del computer chiamante. Vengono raccolti i seguenti dati: indirizzo IP del dispositivo richiedente, data e ora di accesso, nome e URL del file consultato, sito web da cui è avvenuto l'accesso (URL di provenienza), browser utilizzato e, se del caso, il sistema operativo del vostro computer nonché il nome del vostro provider.</p>
<p>La conservazione avviene nei file di log del nostro sistema. La base giuridica per la conservazione temporanea dei dati è l'art. 6 par. 1 lett. f GDPR. I dati sono conservati per un massimo di 30 giorni e successivamente cancellati.</p>

<h2>6. Utilizzo di cookie</h2>
<p>Trovate informazioni dettagliate sui cookie utilizzati nella nostra <a href="/cookie-richtlinie-eu/">Informativa cookie</a>.</p>

<h2>7. Modulo di contatto e contatto via e-mail</h2>
<p>Il nostro sito contiene moduli di contatto utilizzabili per la comunicazione elettronica. Se un utente si avvale di questa possibilità, i dati inseriti nella maschera ci vengono trasmessi e conservati. Si tratta di: nome, recapiti, motivo descritto ed eventuali dati sanitari da voi forniti volontariamente.</p>
<p>La base giuridica del trattamento è l'art. 6 par. 1 lett. b GDPR se il contatto riguarda la conclusione di un contratto di cura, altrimenti l'art. 6 par. 1 lett. a GDPR (consenso) e l'art. 9 par. 2 lett. h GDPR per i dati sanitari.</p>

<h2>8. Prenotazione online tramite Doctolib</h2>
<p>Per la prenotazione online di appuntamenti collaboriamo con Doctolib GmbH, Mehringdamm 51, 10961 Berlino. Quando prenotate un appuntamento tramite Doctolib, i dati che fornite vengono trattati da Doctolib per nostro conto. Ulteriori informazioni nell'informativa privacy di Doctolib: <a href="https://www.doctolib.de/terms/agreement" target="_blank" rel="noopener">doctolib.de/terms/agreement</a>.</p>

<h2>9. Diritti dell'interessato</h2>
<p>Avete in qualsiasi momento il diritto di:</p>
<ul>
<li>ottenere informazioni sui vostri dati personali trattati (art. 15 GDPR)</li>
<li>chiedere la rettifica di dati personali inesatti (art. 16 GDPR)</li>
<li>chiedere la cancellazione dei vostri dati personali (art. 17 GDPR)</li>
<li>chiedere la limitazione del trattamento (art. 18 GDPR)</li>
<li>alla portabilità dei dati (art. 20 GDPR)</li>
<li>opporvi al trattamento (art. 21 GDPR)</li>
<li>revocare il consenso in qualsiasi momento (art. 7 par. 3 GDPR)</li>
<li>presentare reclamo a un'autorità di controllo (art. 77 GDPR)</li>
</ul>

<h2>10. Sicurezza dei dati</h2>
<p>Utilizziamo la procedura di crittografia SSL/TLS diffusa, in combinazione con il livello di crittografia più alto supportato dal vostro browser quando visitate il nostro sito.</p>

<h2>11. Attualità e modifica della presente informativa privacy</h2>
<p>La presente informativa privacy è attualmente in vigore ed è stata aggiornata l'ultima volta a maggio 2026. A causa dello sviluppo del nostro sito e delle offerte ivi presenti, oppure a causa di mutate prescrizioni legali o amministrative, può rendersi necessaria una modifica della presente informativa privacy.</p>
HTML;

// impressum (4226) — clen=5052
$impressum_it = <<<'HTML'
<h2>Note legali ai sensi del § 5 TMG</h2>
<p>Dr. med. Siegbert Stracke<br>
Studio di medicina interna e medicina generale<br>
Grüneburgweg 12<br>
60322 Francoforte sul Meno</p>

<p>Telefono: 069 247 574 523<br>
Telefax: 069 247 574 525<br>
E-mail: praxis@westend-hausarzt.de</p>

<h2>Forma giuridica</h2>
<p>Praxisgemeinschaft (comunità di consultorio medico) ai sensi del § 33 c. 2 BMV-Ä.<br>
Ogni partner gestisce il proprio studio sotto la propria abilitazione e con la propria responsabilità professionale. La condivisione di personale, locali e attrezzature non comporta alcuna condivisione delle cartelle cliniche.</p>

<h2>Abilitazione professionale</h2>
<p>Denominazione professionale: Medico (rilasciata in Germania)<br>
Camera competente: Landesärztekammer Hessen, Im Vogelsgesang 3, 60488 Francoforte sul Meno (<a href="https://www.laekh.de" target="_blank" rel="noopener">laekh.de</a>)<br>
Ordine professionale: Berufsordnung für die Ärztinnen und Ärzte in Hessen (regolamento professionale per i medici dell'Assia), consultabile sulla pagina della Landesärztekammer.</p>

<h2>Codice fiscale</h2>
<p>Su richiesta — non pubblicato online per protezione dai dati.</p>

<h2>Assicurazione di responsabilità professionale</h2>
<p>Nome e sede dell'assicuratore: comunicati su richiesta. Ambito territoriale di copertura: Repubblica Federale Tedesca.</p>

<h2>Risoluzione delle controversie online</h2>
<p>La Commissione Europea mette a disposizione una piattaforma per la risoluzione online delle controversie (ODR): <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>. La nostra e-mail è indicata sopra. Non siamo obbligati né disposti a partecipare a procedure di risoluzione delle controversie davanti a un organismo di conciliazione dei consumatori.</p>

<h2>Responsabilità per i contenuti</h2>
<p>I contenuti delle nostre pagine sono stati creati con la massima cura. Tuttavia non possiamo assumere alcuna garanzia per la correttezza, la completezza e l'attualità dei contenuti. In quanto fornitori di servizi siamo responsabili, ai sensi del § 7 c. 1 TMG, dei contenuti propri su queste pagine secondo le leggi generali. Secondo i §§ 8–10 TMG, in quanto fornitori di servizi non siamo tuttavia obbligati a sorvegliare le informazioni di terzi trasmesse o memorizzate, né a indagare circostanze che indichino un'attività illecita.</p>

<h2>Responsabilità per i link</h2>
<p>La nostra offerta contiene link a siti web esterni di terzi, sui cui contenuti non abbiamo alcuna influenza. Per questo motivo non possiamo assumere alcuna garanzia per tali contenuti esterni. Per i contenuti delle pagine collegate è sempre responsabile il rispettivo fornitore o gestore delle pagine.</p>

<h2>Diritto d'autore</h2>
<p>I contenuti e le opere su queste pagine creati dai gestori del sito sono soggetti al diritto d'autore tedesco. La duplicazione, l'elaborazione, la diffusione e qualsiasi forma di utilizzo che esula dai limiti del diritto d'autore richiede il consenso scritto del rispettivo autore o creatore.</p>

<p><em>Stato: maggio 2026.</em></p>
HTML;

// rund-ums-labor (9707) — clen=1257
$rund_ums_labor_it = <<<'HTML'
<!-- wp:paragraph -->
<p>Le nostre analisi di laboratorio coprono tutti i parametri rilevanti dal punto di vista internistico — dall'esame emocromocitometrico alla diagnostica metabolica e ormonale, fino al rilevamento di malattie infettive.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Prelievo nel nostro studio</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Il prelievo viene effettuato direttamente nel nostro studio dal nostro personale medico, addestrato. La maggior parte dei risultati è disponibile entro 24–48 ore e viene discussa con voi in occasione della consulenza successiva.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Cosa serve prima del prelievo?</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Per molti esami è necessario il <strong>digiuno</strong> (almeno 8 ore senza cibo, possono essere assunti acqua e tè non zuccherato). Per esami specifici riceverete istruzioni precise al momento dell'appuntamento.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Comunicazione dei risultati</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>I risultati di laboratorio vi vengono comunicati di norma in occasione della consulenza successiva. Per risultati patologici urgenti vi contattiamo telefonicamente. La trasmissione elettronica via e-mail non avviene per motivi di protezione dei dati.</p>
<!-- /wp:paragraph -->
HTML;

// standorte (9691) — clen=6734
$standorte_it = <<<'HTML'
<!-- wp:heading -->
<h2>Sede principale Westend</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Praxiszentrum Dr. Stracke &amp; Kollegen</strong><br>
Grüneburgweg 12<br>
60322 Francoforte sul Meno<br>
Telefono: 069 247 574 523<br>
E-mail: praxis@westend-hausarzt.de</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Come arrivare</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La sede principale si trova nel cuore del Westend di Francoforte. La fermata della metropolitana <strong>Grüneburgweg</strong> (U1, U2, U3, U8) è raggiungibile in pochi minuti a piedi. Anche la stazione centrale <strong>Hauptbahnhof</strong> dista solo 6 fermate di metropolitana.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>In auto:</strong> nelle vicinanze sono disponibili parcheggi pubblici e parcheggi multipiano (Westend, Bockenheimer Anlage). Si prega di considerare i tempi di ricerca del parcheggio.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Orari di apertura</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Lunedì–venerdì: 07:30–19:00<br>
Sabato: 09:00–13:00 (solo per pazienti con appuntamento)<br>
Consulenza libera giornaliera: 11:00–12:00 senza appuntamento</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Accessibilità</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>L'ingresso dello studio è accessibile senza barriere. È disponibile un ascensore. I servizi igienici sono attrezzati per disabili. Vi preghiamo di segnalarci eventuali esigenze particolari al momento della prenotazione, in modo da poter organizzare i tempi necessari.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Studio annesso Bockenheimer Landstraße 33</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Dal 2026 gestiamo una <strong>seconda sede</strong> presso il centro medico Eterno in Bockenheimer Landstraße 33. Ulteriori dettagli e orari sono disponibili in <a href="/standorte/zweigpraxis-bockenheimer/">Studio annesso Bockenheimer Landstraße 33</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Spettro di prestazioni</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Lo studio annesso copre l'intero spettro internistico e di medicina generale. Per esami specialistici (cardiologia, endoscopia, indagini urologiche/ginecologiche) le pazienti e i pazienti vengono invitati nella sede principale Westend.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Prenotazione di appuntamenti</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Per entrambe le sedi è possibile prenotare appuntamenti tramite la nostra <a href="/service/terminanfrage/">richiesta appuntamento online</a> oppure telefonicamente al <strong>069 247 574 523</strong>. Indicate al momento della prenotazione la sede preferita.</p>
<!-- /wp:paragraph -->
HTML;

// zweigpraxis-bockenheimer (9693) — clen=2180
$zweigpraxis_it = <<<'HTML'
<!-- wp:paragraph -->
<p>La nostra seconda sede in <strong>Bockenheimer Landstraße 33</strong> si trova nel centro medico Eterno e completa la sede principale Westend con ulteriori fasce di consulenza in medicina interna e medicina generale.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Indirizzo e contatti</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Praxiszentrum Dr. Stracke — sede annessa</strong><br>
Bockenheimer Landstraße 33<br>
60325 Francoforte sul Meno<br>
Telefono: 069 247 574 523 (numero centrale)<br>
E-mail: praxis@westend-hausarzt.de</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Orari di consulenza</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Lunedì, martedì, giovedì: 08:30–13:00 e 14:00–17:00<br>
Mercoledì, venerdì: 08:30–13:00 (solo mattina)<br>
Solo su appuntamento — non è prevista consulenza libera nella sede annessa.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Spettro di prestazioni</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La sede annessa offre l'intero spettro internistico e di medicina generale: visite di base, controlli preventivi, consulenze, vaccinazioni, prelievi e ECG. Per esami specialistici (sonografia, ecocardiografia, prove da sforzo, endoscopia) le pazienti e i pazienti vengono invitati nella sede principale Westend.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Come arrivare</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>La fermata della metropolitana <strong>Westend</strong> (U6, U7) è a pochi minuti a piedi. Sono disponibili parcheggi pubblici limitati nelle vicinanze; si consiglia un arrivo con i mezzi pubblici.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>L'ingresso del centro medico è accessibile senza barriere. Per esigenze particolari vi preghiamo di segnalarcele al momento della prenotazione.</p>
<!-- /wp:paragraph -->
HTML;

// docteur-en-med-s-saul (375) — clen=6594 — older Saul-Page (legacy)
// Wir bridgen sie als minimal Stub (verwaiste Page, nicht aktiv im Trunk verlinkt)
$docteur_saul_legacy_it = "<!-- wp:paragraph --><p>Pagina legacy. Per il profilo aggiornato del Docteur Saul si veda <a href=\"/docteur-saul/\">Docteur Saul</a>.</p><!-- /wp:paragraph -->";

// datenschutzerklaerung-2 (4223) — clen=8847 — verwaiste Datenschutz (Trid 860)
// Bridgen wir als minimal Stub (orphan, theme zeigt auf trid 3 = /datenschutzerklaerung/)
$datenschutz_2_it = "<!-- wp:paragraph --><p>Pagina legacy. Per l'informativa privacy aggiornata si veda <a href=\"/datenschutzerklaerung/\">Informativa privacy</a>.</p><!-- /wp:paragraph -->";

// =========================================================================
// PLAN — alle 63 Pages, sortiert nach DE-Slug
// =========================================================================

// Klasse-A Volltext IT
$plan_a = [
    9699 => [ 'slug' => 'aktuelles',                'title' => 'Novità',                       'it_slug' => 'novita',                       'tpl' => 'template-standard.php',         'content' => $aktuelles_it ],
    466  => [ 'slug' => 'arbeitsunfaehigkeit',      'title' => 'Certificato di malattia (AU)', 'it_slug' => 'certificato-di-malattia',      'tpl' => 'template-standard.php',         'content' => $arbeitsunfaehigkeit_it ],
    9668 => [ 'slug' => 'basic-check',              'title' => 'Basic Check — Informazioni',   'it_slug' => 'basic-check-it',               'tpl' => 'template-bridge-product.php',   'content' => $basic_check_it ],
    9709 => [ 'slug' => 'cookie-richtlinie-eu',     'title' => 'Informativa cookie',           'it_slug' => 'informativa-cookie',           'tpl' => 'template-standard.php',         'content' => $cookie_it ],
    3    => [ 'slug' => 'datenschutzerklaerung',    'title' => 'Informativa privacy',          'it_slug' => 'informativa-privacy',          'tpl' => 'template-standard.php',         'content' => $datenschutz_it ],
    4223 => [ 'slug' => 'datenschutzerklaerung-2',  'title' => 'Informativa privacy (legacy)', 'it_slug' => 'informativa-privacy-legacy',   'tpl' => '',                              'content' => $datenschutz_2_it ],
    375  => [ 'slug' => 'docteur-en-med-s-saul',    'title' => 'Docteur Saul (pagina legacy)', 'it_slug' => 'docteur-saul-legacy',          'tpl' => '',                              'content' => $docteur_saul_legacy_it ],
    9687 => [ 'slug' => 'einweisungen',             'title' => 'Ricoveri e impegnative',       'it_slug' => 'ricoveri-e-impegnative',       'tpl' => 'template-standard.php',         'content' => $einweisungen_it ],
    9888 => [ 'slug' => 'faq',                      'title' => 'FAQ',                          'it_slug' => 'faq-it',                       'tpl' => '',                              'content' => $faq_it ],
    4226 => [ 'slug' => 'impressum',                'title' => 'Note legali',                  'it_slug' => 'note-legali',                  'tpl' => 'template-standard.php',         'content' => $impressum_it ],
    9707 => [ 'slug' => 'rund-ums-labor',           'title' => 'Attorno al laboratorio',       'it_slug' => 'attorno-al-laboratorio',       'tpl' => '',                              'content' => $rund_ums_labor_it ],
    9685 => [ 'slug' => 'service',                  'title' => 'Servizi al paziente',          'it_slug' => 'servizi-al-paziente',          'tpl' => 'template-standard.php',         'content' => $service_it ],
    9691 => [ 'slug' => 'standorte',                'title' => 'Sedi',                         'it_slug' => 'sedi',                         'tpl' => 'template-standard.php',         'content' => $standorte_it ],
    9693 => [ 'slug' => 'zweigpraxis-bockenheimer', 'title' => 'Sede annessa Bockenheimer Landstraße 33', 'it_slug' => 'sede-annessa-bockenheimer', 'tpl' => 'template-standard.php', 'content' => $zweigpraxis_it ],
];

// Klasse-B Stubs — Title via Glossar/Pattern, Content = DE-Original-Content
// (Für Template-Pages reicht Bridge — die Templates rendern aus Trunk/Helpers).
$plan_b = [
    // Untersuchungen-Cluster (S68 — DE-Inhalt vorhanden, aber Detail-Render aus template/Trunk)
    9840 => [ 'slug' => 'bauchspeicheldruese', 'title' => 'Pancreas',                'it_slug' => 'bauchspeicheldruese', 'tpl' => 'template-detail-page.php' ],
    289  => [ 'slug' => 'belastungs-ekg',      'title' => 'ECG da sforzo',           'it_slug' => 'belastungs-ekg',      'tpl' => 'template-detail-page.php' ],
    9857 => [ 'slug' => 'biohack',             'title' => 'Biohack',                 'it_slug' => 'biohack',             'tpl' => 'template-detail-page.php' ],
    9844 => [ 'slug' => 'body-check',          'title' => 'Body Check',              'it_slug' => 'body-check',          'tpl' => 'template-detail-page.php' ],
    354  => [ 'slug' => 'carotis-duplex',      'title' => 'Eco-Doppler carotideo',   'it_slug' => 'carotis-duplex',      'tpl' => 'template-detail-page.php' ],
    192  => [ 'slug' => 'contact-us',          'title' => 'Contatti',                'it_slug' => 'contatti',            'tpl' => 'template-kontakt.php' ],
    // Doctor pages — template-arzt.php
    9675 => [ 'slug' => 'docteur-saul',        'title' => 'Sonja Saul',              'it_slug' => 'docteur-saul',        'tpl' => 'template-arzt.php' ],
    9681 => [ 'slug' => 'dr-arbitmann',        'title' => 'Anna Arbitmann',          'it_slug' => 'dr-arbitmann',        'tpl' => 'template-arzt.php' ],
    9676 => [ 'slug' => 'dr-barcsay',          'title' => 'Dr. Fabian Barcsay',      'it_slug' => 'dr-barcsay',          'tpl' => 'template-arzt.php' ],
    9678 => [ 'slug' => 'dr-jawich',           'title' => 'Dr. Issa Jawich',         'it_slug' => 'dr-jawich',           'tpl' => 'template-arzt.php' ],
    9680 => [ 'slug' => 'dr-landeberg',        'title' => 'Linnea Landeberg',        'it_slug' => 'dr-landeberg',        'tpl' => 'template-arzt.php' ],
    9677 => [ 'slug' => 'dr-seelig',           'title' => 'Dr. Stefanie Seelig',     'it_slug' => 'dr-seelig',           'tpl' => 'template-arzt.php' ],
    9679 => [ 'slug' => 'dr-shahin',           'title' => 'Dr. George Shahin',       'it_slug' => 'dr-shahin',           'tpl' => 'template-arzt.php' ],
    382  => [ 'slug' => 'dr-stracke',          'title' => 'Dr. Siegbert Stracke',    'it_slug' => 'dr-stracke',          'tpl' => 'template-arzt.php' ],
    351  => [ 'slug' => 'echokardiographie',   'title' => 'Ecocardiografia',         'it_slug' => 'echokardiographie',   'tpl' => 'template-detail-page.php' ],
    9849 => [ 'slug' => 'eye-check',           'title' => 'Eye Check',               'it_slug' => 'eye-check',           'tpl' => 'template-detail-page.php' ],
    9848 => [ 'slug' => 'fit-for-diving',      'title' => 'Idoneità all\'immersione','it_slug' => 'fit-for-diving',      'tpl' => 'template-detail-page.php' ],
    9782 => [ 'slug' => 'fragebogen-vor-termin','title'=> 'Questionario pre-appuntamento','it_slug'=>'questionario-pre-appuntamento','tpl' => '' ],
    249  => [ 'slug' => 'home',                'title' => 'Home (legacy)',           'it_slug' => 'home-legacy',         'tpl' => '' ],
    9663 => [ 'slug' => 'home-neu',            'title' => 'Studio — Home',           'it_slug' => 'home-it',             'tpl' => 'template-homepage.php' ],
    9847 => [ 'slug' => 'kardio-check',        'title' => 'Cardio Check',            'it_slug' => 'kardio-check',        'tpl' => 'template-detail-page.php' ],
    9666 => [ 'slug' => 'karriere',            'title' => 'Carriere',                'it_slug' => 'carriere',            'tpl' => 'template-karriere.php' ],
    9846 => [ 'slug' => 'komplett-check',      'title' => 'Check completo',          'it_slug' => 'komplett-check',      'tpl' => 'template-detail-page.php' ],
    296  => [ 'slug' => 'labor',               'title' => 'Diagnostica di laboratorio','it_slug' => 'diagnostica-di-laboratorio', 'tpl' => 'template-labor.php' ],
    9843 => [ 'slug' => 'leber',               'title' => 'Fegato e cistifellea',    'it_slug' => 'leber',               'tpl' => 'template-detail-page.php' ],
    292  => [ 'slug' => 'lungenfunktion',      'title' => 'Funzione polmonare',      'it_slug' => 'lungenfunktion',      'tpl' => 'template-detail-page.php' ],
    9688 => [ 'slug' => 'neupatienten',        'title' => 'Nuovi pazienti',          'it_slug' => 'nuovi-pazienti',      'tpl' => 'template-standard.php' ],
    9841 => [ 'slug' => 'nieren',              'title' => 'Reni e vie urinarie',     'it_slug' => 'nieren',              'tpl' => 'template-detail-page.php' ],
    9671 => [ 'slug' => 'praxis',              'title' => 'Comunità di consultorio', 'it_slug' => 'comunita-di-consultorio', 'tpl' => 'template-praxisgemeinschaft.php' ],
    9842 => [ 'slug' => 'prostata',            'title' => 'Prostata e vescica',      'it_slug' => 'prostata',            'tpl' => 'template-detail-page.php' ],
    4014 => [ 'slug' => 'rezeptbestellung',    'title' => 'Richiesta ricetta',       'it_slug' => 'richiesta-ricetta',   'tpl' => 'template-standard.php' ],
    9858 => [ 'slug' => 'risikoprofil',        'title' => 'Profilo di rischio',      'it_slug' => 'risikoprofil',        'tpl' => 'template-detail-page.php' ],
    357  => [ 'slug' => 'schilddruese',        'title' => 'Tiroide',                 'it_slug' => 'schilddruese',        'tpl' => 'template-detail-page.php' ],
    9845 => [ 'slug' => 'sono-check',          'title' => 'Sono Check',              'it_slug' => 'sono-check',          'tpl' => 'template-detail-page.php' ],
    277  => [ 'slug' => 'sonographie',         'title' => 'Ecografia addominale',    'it_slug' => 'sonographie',         'tpl' => 'template-detail-page.php' ],
    9673 => [ 'slug' => 'sprechstunden',       'title' => 'Orari e appuntamenti',    'it_slug' => 'orari-e-appuntamenti','tpl' => 'template-sprechstunden.php' ],
    9851 => [ 'slug' => 'status-advanced',     'title' => 'Status Advanced',         'it_slug' => 'status-advanced',     'tpl' => 'template-detail-page.php' ],
    9850 => [ 'slug' => 'status-baseline',     'title' => 'Status Baseline',         'it_slug' => 'status-baseline',     'tpl' => 'template-detail-page.php' ],
    9852 => [ 'slug' => 'status-prevent',      'title' => 'Status Prevent',          'it_slug' => 'status-prevent',      'tpl' => 'template-detail-page.php' ],
    9856 => [ 'slug' => 'stoffwechsel',        'title' => 'Metabolismo',             'it_slug' => 'stoffwechsel',        'tpl' => 'template-detail-page.php' ],
    9853 => [ 'slug' => 'system-immune',       'title' => 'Sistema immunitario',     'it_slug' => 'system-immune',       'tpl' => 'template-detail-page.php' ],
    9855 => [ 'slug' => 'system-liver',        'title' => 'Sistema epatico',         'it_slug' => 'system-liver',        'tpl' => 'template-detail-page.php' ],
    9854 => [ 'slug' => 'system-renal',        'title' => 'Sistema renale',          'it_slug' => 'system-renal',        'tpl' => 'template-detail-page.php' ],
    9672 => [ 'slug' => 'team',                'title' => 'Il nostro team',          'it_slug' => 'il-nostro-team',      'tpl' => 'template-team.php' ],
    4011 => [ 'slug' => 'terminanfrage',       'title' => 'Richiesta appuntamento',  'it_slug' => 'richiesta-appuntamento','tpl' => 'template-standard.php' ],
    4017 => [ 'slug' => 'ueberweisung',        'title' => 'Richiesta impegnativa',   'it_slug' => 'richiesta-impegnativa','tpl' => 'template-standard.php' ],
    9887 => [ 'slug' => 'unsere-partner',      'title' => 'I nostri partner',        'it_slug' => 'i-nostri-partner',    'tpl' => 'template-partner.php' ],
    9682 => [ 'slug' => 'untersuchungen',      'title' => 'Esami',                   'it_slug' => 'esami',               'tpl' => 'template-untersuchungen-hub.php' ],
    9890 => [ 'slug' => 'videosprechstunde',   'title' => 'Consulto video',          'it_slug' => 'consulto-video',      'tpl' => 'template-standard.php' ],
];

// =========================================================================
// EXECUTE
// =========================================================================
$counters = [];

echo "--- Phase 1: Klasse-A Volltext (14 Pages) ---\n";
foreach ( $plan_a as $de_id => $cfg ) {
    [ $st, $msg ] = sb_bridge_it( $de_id, $cfg['title'], $cfg['it_slug'], $cfg['content'], $cfg['tpl'], $commit );
    $counters[$st] = ($counters[$st]??0)+1;
    printf("  [%-7s] %-30s → %s\n", $st, $cfg['slug'], $msg);
}

echo "\n--- Phase 2: Klasse-B Stub (49 Pages) ---\n";
foreach ( $plan_b as $de_id => $cfg ) {
    $de_content = get_post_field( 'post_content', $de_id );
    [ $st, $msg ] = sb_bridge_it( $de_id, $cfg['title'], $cfg['it_slug'], $de_content, $cfg['tpl'], $commit );
    $counters[$st] = ($counters[$st]??0)+1;
    printf("  [%-7s] %-30s → %s\n", $st, $cfg['slug'], $msg);
}

echo "\n=== SUMMARY ===\n";
foreach ($counters as $k=>$v) printf("  %s: %d\n", $k, $v);
$err = $counters['ERROR'] ?? 0;
echo "\n" . ( $err ? "FAIL ({$err})" : ($commit ? "OK (committed)" : "OK (dry-run)") ) . "\n";
exit( $err ? 1 : 0 );
