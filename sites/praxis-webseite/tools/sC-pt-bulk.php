<?php
/**
 * Session C — pt-PT-Volumen-Welle (LL-060 Autonomy Mode v1)
 *
 * Identisches Pattern wie sB-it-bulk.php (Pattern-Generation 2.3),
 * Sprachcode 'pt-pt' (WPML-Konvention für Português europeu).
 *
 * 14 Klasse-A Volltext-Übersetzungen + 49 Klasse-B Stubs = 63 ops.
 *
 * Sprachregister: formelles europäisches Portugiesisch (Sie-Form via
 * "o senhor / a senhora" als Anrede, NICHT brasilianisch).
 *
 * Usage: php sC-pt-bulk.php [--commit]
 */
define( 'WP_USE_THEMES', false );
require '/Users/cluster-mini-02/Local Sites/gpmedicalcenterwestend-7ded2f4ae8c4343d2029-202604/app/public/wp-load.php';
global $wpdb;

$commit = in_array( '--commit', $argv ?? [], true );
echo "MODE: " . ( $commit ? "COMMIT" : "DRY-RUN" ) . "\n\n";

function sc_get_trid( $de_id ) {
    global $wpdb;
    return (int) $wpdb->get_var( $wpdb->prepare(
        "SELECT trid FROM {$wpdb->prefix}icl_translations
         WHERE element_id = %d AND element_type='post_page' AND language_code='de'
         ORDER BY translation_id DESC LIMIT 1", $de_id ) );
}
function sc_get_translation_id( $trid, $lang ) {
    global $wpdb;
    return (int) $wpdb->get_var( $wpdb->prepare(
        "SELECT element_id FROM {$wpdb->prefix}icl_translations
         WHERE trid=%d AND element_type='post_page' AND language_code=%s", $trid, $lang ) );
}
function sc_bridge_pt( $de_id, $title, $slug, $content, $tpl, $commit ) {
    global $wpdb;
    $trid = sc_get_trid( $de_id );
    if ( ! $trid ) return [ 'ERROR', "no DE trid for {$de_id}" ];
    $existing = sc_get_translation_id( $trid, 'pt-pt' );
    if ( $existing ) return [ 'EXISTS', "trid={$trid} pt={$existing}" ];
    if ( ! $commit ) return [ 'PLAN', "BRIDGE de={$de_id} trid={$trid} →pt-pt/{$slug} clen=" . strlen( $content ) ];

    $new_id = wp_insert_post([
        'post_title' => $title, 'post_name' => $slug, 'post_content' => $content,
        'post_status' => 'publish', 'post_type' => 'page', 'post_author' => 1,
        'comment_status' => 'closed', 'ping_status' => 'closed',
    ], true );
    if ( is_wp_error( $new_id ) ) return [ 'ERROR', $new_id->get_error_message() ];
    if ( $tpl ) update_post_meta( $new_id, '_wp_page_template', $tpl );

    $r = $wpdb->update( "{$wpdb->prefix}icl_translations",
        [ 'trid' => $trid, 'language_code' => 'pt-pt', 'source_language_code' => 'de' ],
        [ 'element_type' => 'post_page', 'element_id' => $new_id ]
    );
    if ( $r === false ) return [ 'ERROR', "wpml-link UPDATE failed: " . $wpdb->last_error ];
    return [ 'CREATED', "→ID={$new_id} clen=" . strlen( $content ) ];
}

// =========================================================================
// KLASSE A — Volltext-pt-PT-Übersetzungen (14 Pages)
// =========================================================================

$faq_pt = <<<'HTML'
<h2>Perguntas frequentes</h2>
<p>Respostas às perguntas mais frequentes dos nossos pacientes sobre internamentos hospitalares, credenciais para especialistas e baixas médicas.</p>
<ul>
  <li><a href="/service/einweisungen/">Internamentos e credenciais</a></li>
  <li><a href="/service/arbeitsunfaehigkeit/">Baixa médica (AU)</a></li>
</ul>
HTML;

$service_pt = <<<'HTML'
<!-- wp:paragraph -->
<p>Nestas páginas encontra informações organizativas e formulários para os assuntos mais frequentes relacionados com o seu acompanhamento no nosso consultório.</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul>
  <li><a href="/service/terminanfrage/">Pedido de consulta</a> — solicitar consulta aguda ou marcada</li>
  <li><a href="/service/rezeptbestellung/">Pedido de receita</a> — renovar medicação como paciente já acompanhado</li>
  <li><a href="/service/ueberweisung/">Pedido de credencial</a> — preparar uma credencial com antecedência</li>
  <li><a href="/service/arbeitsunfaehigkeit/">Baixa médica (AU)</a> — quadro legal</li>
  <li><a href="/service/einweisungen/">Internamentos e credenciais</a> — hospital, exames pré-operatórios, especialista</li>
  <li><a href="/service/neupatienten/">Inscrição de novos pacientes</a> — lista de espera para novas admissões</li>
</ul>
<!-- /wp:list -->

<!-- wp:paragraph -->
<p>Para assuntos urgentes contacte-nos por telefone. Encontrará os contactos em <a href="/contact-us/">Contacto</a>.</p>
<!-- /wp:paragraph -->
HTML;

$basic_check_pt = <<<'HTML'
<!-- wp:paragraph -->
<p>O check-up de saúde compacto.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Pequena análise laboratorial com 15 parâmetros. Colheita no consultório,<br>resultado em 48 horas.<br></p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Parâmetros laboratoriais</h2>
<!-- /wp:heading -->

<!-- wp:table -->
<figure class="wp-block-table"><table><thead><tr><th>Parâmetro</th><th>Unidade</th></tr></thead><tbody><tr><td>HGB</td><td>g/dl</td></tr><tr><td>WBC</td><td>/µl</td></tr><tr><td>RBC</td><td>T/l</td></tr><tr><td>HCT</td><td>%</td></tr><tr><td>MCV</td><td>fl</td></tr><tr><td>MCH</td><td>pg</td></tr><tr><td>MCHC</td><td>g/dl</td></tr><tr><td>PLT</td><td>G/l</td></tr><tr><td>Na</td><td>mmol/l</td></tr><tr><td>K</td><td>mmol/l</td></tr><tr><td>Krea</td><td>mg/dl</td></tr><tr><td>GFR</td><td>ml/min</td></tr><tr><td>GOT</td><td>U/l</td></tr><tr><td>GPT</td><td>U/l</td></tr><tr><td>CRP</td><td>mg/l</td></tr></tbody></table></figure>
<!-- /wp:table -->

<!-- wp:buttons -->
<div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="https://sanexio.eu/products/basic-check">Saiba mais em sanexio.eu</a></div></div>
<!-- /wp:buttons -->
HTML;

$aktuelles_pt = <<<'HTML'
<!-- wp:paragraph -->
<p>Nesta secção informamos regularmente as nossas pacientes e os nossos pacientes sobre as novidades do consultório — alterações de horários, novos serviços, campanhas de vacinação ou avisos organizativos.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Admissão de novos pacientes</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Devido à elevada procura, mantemos uma lista de espera para novos pacientes. As regras actuais de admissão estão disponíveis em <a href="/service/neupatienten/">Inscrição de novos pacientes</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Consultório anexo Bockenheimer Landstraße 33</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A nossa segunda localização na Bockenheimer Landstraße 33, no edifício Eterno, amplia a nossa oferta com horários de consulta adicionais. Detalhes em <a href="/standorte/zweigpraxis-bockenheimer/">Consultório anexo Bockenheimer Landstraße 33</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Contactos e marcação de consultas</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Para pedidos de consulta, pedidos de receita e questões organizativas utilize a nossa secção <a href="/service/">Serviços</a> ou contacte-nos por telefone — todos os contactos em <a href="/contact-us/">Contacto</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><em>[Marcador — esta secção será preenchida pela equipa editorial com anúncios concretos (suspensões de consultas, datas de vacinação, novos colaboradores). O Dr. Stracke acrescentará os primeiros conteúdos reais após a aprovação do esboço.]</em></p>
<!-- /wp:paragraph -->
HTML;

$einweisungen_pt = <<<'HTML'
<!-- wp:heading -->
<h2>Requisição de internamento hospitalar</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Como médicos em consultório, estamos obrigados a esgotar todas as opções ambulatórias antes de emitir uma requisição de internamento hospitalar.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Aplica-se também o princípio de que as requisições de internamento são emitidas pelo médico assistente. Se, por exemplo, o ortopedista recomendou a cirurgia, é a ele que cabe emitir a requisição. Se, por outro lado, a indicação de internamento for estabelecida no nosso consultório, será nosso o papel de a emitir.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Exames pré-operatórios antes do internamento</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Muitos hospitais realizam autonomamente os exames pré-operatórios. Por vezes a clínica solicita, no entanto, que sejam efectuados pelo nosso consultório (habitualmente análises e ECG). Tal só é possível quando a intervenção propriamente dita é realizada em regime ambulatório. Nesse caso, agradecemos que nos traga a carta da clínica indicando os exames solicitados. Sem este documento não podemos infelizmente efectuar qualquer exame pré-operatório. Para esta preparação é também obrigatória uma consulta médica — agradecemos que marque uma consulta para o efeito. Todos os outros exames devem ser realizados pela clínica no âmbito do chamado internamento pré-operatório.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Acompanhamento pós-operatório</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Em princípio, todos os cirurgiões estão obrigados a realizar pessoalmente o acompanhamento pós-operatório (mudanças de penso, remoção de pontos, etc.). Caso o cirurgião deseje delegar estas tarefas no nosso consultório (também aqui apenas para intervenções ambulatórias; caso contrário, a clínica deveria marcar consigo uma consulta pós-internamento), tem de emitir uma credencial com a data da intervenção e o código operatório. Sem esta credencial, os seguros de saúde não nos reembolsam o acompanhamento e teremos de o reencaminhar para a clínica.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Em intervenções com internamento, o hospital é obrigado a assegurar o acompanhamento (incluindo remoção de pontos e agrafos) até três semanas após a alta.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Credenciais para outros especialistas</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Como médicos em consultório, devemos verificar com cuidado a indicação para uma credencial dirigida a outra especialidade. Se sofre de uma doença crónica que exige exames especializados regulares, a credencial pode ser pedida com antecedência indicando o diagnóstico (p. ex. diabetes mellitus, insuficiência renal dependente de diálise, …). Em todos os outros casos é necessário um contacto médico prévio no nosso consultório.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Para os exames preventivos (ginecologista, colonoscopia, etc.) pode consultar estes especialistas sem credencial. Para os médicos que não realizam exames preventivos legalmente previstos, é necessário um diagnóstico a esclarecer antes de poder ser emitida uma credencial.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Não emitimos credenciais para anestesistas: tal deve ser feito pelo médico que solicita o anestesista.</p>
<!-- /wp:paragraph -->
HTML;

$arbeitsunfaehigkeit_pt = <<<'HTML'
<p>O médico responde, com a sua habilitação, pela correcção dos certificados de baixa médica (AU) emitidos. Para receber uma AU é imprescindível que exista uma doença. As AU só podem ser emitidas após contacto pessoal. Em regra, não é possível a emissão retroactiva. Se ficar doente à sexta-feira ou ao fim-de-semana e a sua entidade patronal exigir já à segunda-feira uma AU para esse período, então a AU de segunda-feira já cobre a sexta-feira ou o sábado/domingo.</p>

<p>Em muitas entidades patronais é também aceite uma auto-declaração de doença pelo trabalhador para os primeiros 3 dias de calendário. Agradecemos que confirme com a sua entidade patronal como gere este aspecto. A duplicação dos sistemas (auto-declaração do trabalhador E AU médica) representa um desperdício de recursos.</p>

<p>Apenas a partir do quarto dia de doença (ou seja, do terceiro dia de ausência ininterrupta do trabalho) a entidade patronal pode exigir obrigatoriamente uma AU médica.</p>

<p>Tenha presente que, a partir de 2023, as AU são transmitidas electronicamente à caixa de doença (eAU). A caixa de doença encaminha a AU à entidade patronal. Já não receberá qualquer documento em papel para a entidade patronal. Continuará, no entanto, a receber uma cópia para os seus arquivos pessoais.</p>

<p>Em períodos longos de doença (mais de 6 semanas) a caixa de doença paga, sob certas condições, um subsídio de doença. Para tal é necessário que a sua AU seja prolongada sem interrupção pelo médico assistente. Mesmo um único dia de interrupção entre duas AU pode implicar a perda do subsídio. Em caso de problemas, agradecemos que nos contacte atempadamente.</p>

<p>Para AU com duração superior a 6 semanas consecutivas, o médico está, em regra, obrigado a realizar uma consulta presencial com o paciente.</p>
HTML;

$cookie_pt = <<<'HTML'
<h2>1. O que são cookies?</h2>
<p>Cookies são pequenos ficheiros de texto guardados no seu dispositivo quando visita um sítio web. Permitem, entre outras coisas, que o sítio reconheça a sua preferência linguística, evitam que tenha de consentir novamente em cada clique e permitem a integração de conteúdos de terceiros (por exemplo a marcação de consultas online ou os mapas).</p>

<h2>2. Consentimento</h2>
<p>Na sua primeira visita a este sítio mostramos-lhe um banner de cookies, no qual pode escolher quais as categorias de cookies e tecnologias semelhantes que autoriza. Os cookies <strong>essenciais</strong> são sempre carregados por serem tecnicamente necessários ao funcionamento do sítio. As <strong>estatísticas</strong> e os <strong>conteúdos externos</strong> são activados unicamente com o seu consentimento explícito (art. 6.º n.º 1 al. a RGPD, § 25 n.º 1 TTDSG).</p>

<p>Pode ajustar ou retirar a sua selecção a qualquer momento — através do link <a href="#" class="pxz-cookie-open-settings">Definições de cookies</a> ou através da gestão de cookies do seu navegador.</p>

<h2>3. Cookies em utilização</h2>

<h3>3.1 Cookies essenciais</h3>
<ul>
<li><code>pxz_cookie_consent</code> — guarda a sua selecção no banner de cookies. Duração: 365 dias. Fornecedor: este servidor.</li>
<li>Cookies de sessão e segurança do WordPress (p. ex. <code>wordpress_test_cookie</code>) — temporários, apenas para funções de início de sessão/segurança. Fornecedor: este servidor.</li>
</ul>

<h3>3.2 Estatísticas / medição de audiência (apenas com consentimento)</h3>
<p>Actualmente não utilizamos quaisquer ferramentas de tracking como o Google Analytics ou o Matomo. Caso se altere, os cookies correspondentes serão documentados aqui e activados unicamente com o seu consentimento.</p>

<h3>3.3 Conteúdos externos (apenas com consentimento)</h3>
<ul>
<li><strong>Doctolib</strong> — marcação de consultas online. Quando marca uma consulta através do sítio, é redireccionado para doctolib.de ou a janela de marcação é incorporada nas nossas páginas. A Doctolib instala os seus próprios cookies; o tratamento dos dados ocorre sob a responsabilidade da Doctolib GmbH (Berlim). Aviso de privacidade: <a href="https://www.doctolib.de/p/agb" target="_blank" rel="noopener">doctolib.de/p/agb</a>.</li>
<li><strong>Google Maps</strong> — esquema de acesso. No carregamento do mapa são transmitidos dados de ligação à Google Ireland Ltd. Aviso de privacidade: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">policies.google.com/privacy</a>.</li>
</ul>

<h2>4. Período de conservação</h2>
<p>Os cookies essenciais são conservados apenas pelo tempo necessário à sua finalidade — habitualmente durante a sessão; o cookie de consentimento 365 dias. Os cookies das categorias estatísticas / conteúdos externos são conservados de acordo com as indicações do respectivo fornecedor (tipicamente entre alguns dias e 24 meses); os pormenores constam da política de privacidade do fornecedor em causa.</p>

<h2>5. Como apagar ou gerir os cookies?</h2>
<p>Pode consultar, bloquear ou apagar os cookies a qualquer momento através das definições do seu navegador. No caso dos cookies essenciais, o bloqueio pode tornar indisponíveis algumas funcionalidades do sítio. Instruções para os navegadores mais comuns:</p>
<ul>
<li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener">Google Chrome</a></li>
<li><a href="https://support.mozilla.org/pt-PT/kb/cookies-informacoes-que-os-sites-guardam-no-seu-co" target="_blank" rel="noopener">Mozilla Firefox</a></li>
<li><a href="https://support.apple.com/pt-pt/guide/safari/sfri11471" target="_blank" rel="noopener">Apple Safari</a></li>
<li><a href="https://support.microsoft.com/pt-pt/microsoft-edge" target="_blank" rel="noopener">Microsoft Edge</a></li>
</ul>

<h2>6. Ajustar a selecção a qualquer momento</h2>
<p><a href="#" class="pxz-cookie-open-settings"><strong>→ Reabrir as definições de cookies</strong></a></p>

<h2>7. Informação adicional</h2>
<p>Encontrará informação completa sobre o tratamento dos seus dados pessoais na nossa <a href="/datenschutzerklaerung/">Política de privacidade</a>. Para qualquer questão pode contactar-nos em <a href="mailto:praxis@westend-hausarzt.de">praxis@westend-hausarzt.de</a>.</p>

<p><em>Estado: 2 de Maio de 2026.</em></p>
HTML;

$datenschutz_pt = <<<'HTML'
<h2>1. Responsável pelo tratamento</h2>
<p>O responsável pelo tratamento na acepção do Regulamento Geral sobre a Protecção de Dados (RGPD) para este sítio é:</p>
<p>Dr. med. Stracke<br>Consultório de medicina interna e medicina geral<br>Grüneburgweg 12<br>60322 Frankfurt am Main<br>Telefone: 069 247 574 523<br>Correio electrónico: praxis@westend-hausarzt.de</p>

<h2>2. Informação geral sobre o tratamento de dados</h2>
<p>Recolhemos e utilizamos os dados pessoais dos nossos pacientes e visitantes do sítio apenas na medida em que tal seja necessário para a disponibilização de um sítio funcional e para a prestação de cuidados médicos. O tratamento de dados pessoais ocorre, em regra, apenas com o consentimento do titular dos dados. Aplica-se uma excepção nos casos em que não seja possível obter um consentimento prévio por motivos factuais e o tratamento seja permitido por lei.</p>

<h2>3. Bases jurídicas do tratamento</h2>
<ul>
<li><strong>Art. 6.º n.º 1 al. a RGPD</strong> — consentimento do titular dos dados</li>
<li><strong>Art. 6.º n.º 1 al. b RGPD</strong> — execução de contrato ou medidas pré-contratuais</li>
<li><strong>Art. 6.º n.º 1 al. c RGPD</strong> — cumprimento de obrigações legais</li>
<li><strong>Art. 9.º n.º 2 al. h RGPD</strong> — tratamento de dados de saúde para fins de diagnóstico médico e prestação de cuidados</li>
<li><strong>§ 22 n.º 1 al. b BDSG</strong> — autorização nacional específica para dados de saúde</li>
</ul>

<h2>4. Eliminação dos dados e prazo de conservação</h2>
<p>Os dados pessoais do titular dos dados serão apagados ou bloqueados logo que a finalidade da conservação deixe de se aplicar. Pode ocorrer conservação para além desse prazo se existirem obrigações legais de conservação (p. ex. documentos fiscais 10 anos, processos clínicos 10 anos nos termos do § 630f BGB).</p>

<h2>5. Disponibilização do sítio e criação de ficheiros de registo</h2>
<p>Em cada acesso ao nosso sítio, o nosso sistema recolhe automaticamente dados e informação do sistema informático do computador que efectua o pedido. São recolhidos os seguintes dados: endereço IP do dispositivo solicitante, data e hora do acesso, nome e URL do ficheiro consultado, sítio a partir do qual foi efectuado o acesso (URL de referência), navegador utilizado e, se aplicável, sistema operativo do seu computador, bem como o nome do seu fornecedor de acesso.</p>
<p>A conservação ocorre nos ficheiros de registo do nosso sistema. A base jurídica para a conservação temporária dos dados é o art. 6.º n.º 1 al. f RGPD. Os dados são conservados, no máximo, durante 30 dias e, em seguida, apagados.</p>

<h2>6. Utilização de cookies</h2>
<p>Encontrará informação detalhada sobre os cookies utilizados na nossa <a href="/cookie-richtlinie-eu/">Política de cookies</a>.</p>

<h2>7. Formulário de contacto e contacto por correio electrónico</h2>
<p>O nosso sítio contém formulários de contacto utilizáveis para contacto electrónico. Caso um utilizador recorra a esta possibilidade, os dados introduzidos na máscara são-nos transmitidos e conservados. Esses dados são: nome, contactos, motivo descrito e eventuais dados de saúde fornecidos voluntariamente.</p>
<p>A base jurídica do tratamento é o art. 6.º n.º 1 al. b RGPD se o contacto disser respeito à celebração de um contrato de cuidados, caso contrário o art. 6.º n.º 1 al. a RGPD (consentimento) e o art. 9.º n.º 2 al. h RGPD para dados de saúde.</p>

<h2>8. Marcação de consultas online através da Doctolib</h2>
<p>Para a marcação online de consultas, cooperamos com a Doctolib GmbH, Mehringdamm 51, 10961 Berlim. Quando marca uma consulta através da Doctolib, os dados que fornece são tratados pela Doctolib em nosso nome. Mais informação na política de privacidade da Doctolib: <a href="https://www.doctolib.de/terms/agreement" target="_blank" rel="noopener">doctolib.de/terms/agreement</a>.</p>

<h2>9. Direitos do titular dos dados</h2>
<p>Tem, a qualquer momento, o direito de:</p>
<ul>
<li>obter informação sobre os seus dados pessoais tratados (art. 15.º RGPD)</li>
<li>solicitar a rectificação de dados pessoais inexactos (art. 16.º RGPD)</li>
<li>solicitar o apagamento dos seus dados pessoais (art. 17.º RGPD)</li>
<li>solicitar a limitação do tratamento (art. 18.º RGPD)</li>
<li>à portabilidade dos dados (art. 20.º RGPD)</li>
<li>opor-se ao tratamento (art. 21.º RGPD)</li>
<li>retirar o consentimento a qualquer momento (art. 7.º n.º 3 RGPD)</li>
<li>apresentar reclamação a uma autoridade de controlo (art. 77.º RGPD)</li>
</ul>

<h2>10. Segurança dos dados</h2>
<p>Utilizamos o procedimento de cifragem SSL/TLS amplamente difundido, em conjugação com o nível de cifragem mais elevado suportado pelo seu navegador, ao visitar o nosso sítio.</p>

<h2>11. Actualidade e alteração desta política de privacidade</h2>
<p>A presente política de privacidade encontra-se actualmente em vigor e foi actualizada pela última vez em Maio de 2026. Devido ao desenvolvimento do nosso sítio e das ofertas nele contidas, ou por força de exigências legais ou administrativas alteradas, pode tornar-se necessária a alteração da presente política de privacidade.</p>
HTML;

$impressum_pt = <<<'HTML'
<h2>Aviso legal nos termos do § 5 TMG</h2>
<p>Dr. med. Siegbert Stracke<br>
Consultório de medicina interna e medicina geral<br>
Grüneburgweg 12<br>
60322 Frankfurt am Main</p>

<p>Telefone: 069 247 574 523<br>
Telefax: 069 247 574 525<br>
Correio electrónico: praxis@westend-hausarzt.de</p>

<h2>Forma jurídica</h2>
<p>Praxisgemeinschaft (comunidade de consultórios médicos) nos termos do § 33 n.º 2 BMV-Ä.<br>
Cada parceiro gere o seu próprio consultório sob a sua própria habilitação e responsabilidade profissional. A partilha de pessoal, instalações e equipamento não implica qualquer partilha dos processos clínicos dos pacientes.</p>

<h2>Habilitação profissional</h2>
<p>Designação profissional: Médico (atribuída na Alemanha)<br>
Câmara competente: Landesärztekammer Hessen, Im Vogelsgesang 3, 60488 Frankfurt am Main (<a href="https://www.laekh.de" target="_blank" rel="noopener">laekh.de</a>)<br>
Código deontológico: Berufsordnung für die Ärztinnen und Ärzte in Hessen (regulamento profissional para os médicos do Hessen), consultável na página da Landesärztekammer.</p>

<h2>Número de contribuinte</h2>
<p>A pedido — não publicado em linha por motivos de protecção de dados.</p>

<h2>Seguro de responsabilidade profissional</h2>
<p>Nome e sede da seguradora: comunicados a pedido. Âmbito territorial de cobertura: República Federal da Alemanha.</p>

<h2>Resolução de litígios em linha</h2>
<p>A Comissão Europeia disponibiliza uma plataforma para a resolução de litígios em linha (RLL): <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener">ec.europa.eu/consumers/odr</a>. O nosso correio electrónico está indicado acima. Não estamos obrigados nem dispostos a participar em procedimentos de resolução de litígios perante uma entidade de conciliação de consumidores.</p>

<h2>Responsabilidade pelos conteúdos</h2>
<p>Os conteúdos das nossas páginas foram criados com o maior cuidado. No entanto, não podemos assumir qualquer garantia pela exactidão, integralidade e actualidade dos conteúdos. Como prestadores de serviços, somos responsáveis, nos termos do § 7 n.º 1 TMG, pelos conteúdos próprios destas páginas, ao abrigo das leis gerais. Nos termos dos §§ 8 a 10 TMG não estamos, contudo, obrigados, enquanto prestadores de serviços, a vigiar as informações de terceiros transmitidas ou armazenadas, nem a investigar circunstâncias que indiquem uma actividade ilícita.</p>

<h2>Responsabilidade pelos hiperligações</h2>
<p>A nossa oferta contém hiperligações para sítios web externos de terceiros, sobre cujos conteúdos não temos qualquer influência. Por este motivo não podemos assumir qualquer garantia por esses conteúdos externos. Pelos conteúdos das páginas ligadas é sempre responsável o respectivo fornecedor ou operador das páginas.</p>

<h2>Direitos de autor</h2>
<p>Os conteúdos e as obras destas páginas criados pelos operadores do sítio estão sujeitos ao direito de autor alemão. A duplicação, processamento, divulgação e qualquer forma de utilização que excedam os limites do direito de autor exigem o consentimento escrito do respectivo autor ou criador.</p>

<p><em>Estado: Maio de 2026.</em></p>
HTML;

$rund_ums_labor_pt = <<<'HTML'
<!-- wp:paragraph -->
<p>As nossas análises laboratoriais cobrem todos os parâmetros relevantes do ponto de vista da medicina interna — desde o hemograma à diagnóstica metabólica e hormonal, até à detecção de doenças infecciosas.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Colheita no nosso consultório</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A colheita é efectuada directamente no nosso consultório pelo nosso pessoal médico, com formação. A maior parte dos resultados está disponível em 24–48 horas e é discutida consigo na consulta seguinte.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>O que é necessário antes da colheita?</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Para muitos exames é necessário <strong>jejum</strong> (pelo menos 8 horas sem alimento, podendo ser ingerida água e chá não açucarado). Para exames específicos receberá instruções precisas no momento da marcação.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Comunicação dos resultados</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Os resultados laboratoriais são-lhe, em regra, comunicados na consulta seguinte. Para resultados patológicos urgentes contactamo-lo telefonicamente. A transmissão electrónica por correio electrónico não é efectuada por motivos de protecção de dados.</p>
<!-- /wp:paragraph -->
HTML;

$standorte_pt = <<<'HTML'
<!-- wp:heading -->
<h2>Sede principal Westend</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Praxiszentrum Dr. Stracke &amp; Kollegen</strong><br>
Grüneburgweg 12<br>
60322 Frankfurt am Main<br>
Telefone: 069 247 574 523<br>
Correio electrónico: praxis@westend-hausarzt.de</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Como chegar</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A sede principal localiza-se no coração do Westend de Frankfurt. A estação de metropolitano <strong>Grüneburgweg</strong> (U1, U2, U3, U8) fica a poucos minutos a pé. Também a estação central <strong>Hauptbahnhof</strong> dista apenas 6 paragens de metropolitano.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p><strong>De automóvel:</strong> existem nas imediações lugares de estacionamento públicos e parques cobertos (Westend, Bockenheimer Anlage). Pondere os tempos de procura de estacionamento.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Horário de funcionamento</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Segunda a sexta: 07h30–19h00<br>
Sábado: 09h00–13h00 (apenas para pacientes com marcação)<br>
Consulta livre diária: 11h00–12h00 sem marcação</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Acessibilidade</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A entrada do consultório é acessível sem barreiras. Existe elevador. Os sanitários estão equipados para pessoas com mobilidade reduzida. Agradecemos que nos comunique necessidades particulares no momento da marcação, para podermos prever o tempo necessário.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Consultório anexo Bockenheimer Landstraße 33</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Desde 2026 operamos uma <strong>segunda localização</strong> no centro médico Eterno, na Bockenheimer Landstraße 33. Encontrará pormenores e horários em <a href="/standorte/zweigpraxis-bockenheimer/">Consultório anexo Bockenheimer Landstraße 33</a>.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":3} -->
<h3>Espectro de prestações</h3>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>O consultório anexo cobre todo o espectro de medicina interna e medicina geral. Para exames especializados (cardiologia, endoscopia, exames urológicos/ginecológicos) as pacientes e os pacientes são convidados para a sede principal Westend.</p>
<!-- /wp:paragraph -->

<!-- wp:heading -->
<h2>Marcação de consultas</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Para ambas as localizações é possível marcar consultas através do nosso <a href="/service/terminanfrage/">pedido de consulta online</a> ou por telefone, no <strong>069 247 574 523</strong>. Indique no momento da marcação a localização preferida.</p>
<!-- /wp:paragraph -->
HTML;

$zweigpraxis_pt = <<<'HTML'
<!-- wp:paragraph -->
<p>A nossa segunda localização na <strong>Bockenheimer Landstraße 33</strong> situa-se no centro médico Eterno e complementa a sede principal Westend com horários de consulta adicionais em medicina interna e medicina geral.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Endereço e contactos</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><strong>Praxiszentrum Dr. Stracke — sede anexa</strong><br>
Bockenheimer Landstraße 33<br>
60325 Frankfurt am Main<br>
Telefone: 069 247 574 523 (número central)<br>
Correio electrónico: praxis@westend-hausarzt.de</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Horário de consultas</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Segunda, terça, quinta: 08h30–13h00 e 14h00–17h00<br>
Quarta, sexta: 08h30–13h00 (apenas manhã)<br>
Apenas com marcação — não está prevista consulta livre na sede anexa.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Espectro de prestações</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A sede anexa oferece todo o espectro de medicina interna e medicina geral: consultas de base, controlos preventivos, aconselhamento, vacinações, colheitas e ECG. Para exames especializados (sonografia, ecocardiografia, prova de esforço, endoscopia) as pacientes e os pacientes são convidados para a sede principal Westend.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":2} -->
<h2>Como chegar</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>A estação de metropolitano <strong>Westend</strong> (U6, U7) fica a poucos minutos a pé. Existem lugares de estacionamento públicos limitados nas imediações; recomenda-se a chegada em transportes públicos.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>A entrada do centro médico é acessível sem barreiras. Para necessidades particulares agradecemos que nos contacte no momento da marcação.</p>
<!-- /wp:paragraph -->
HTML;

$docteur_saul_legacy_pt = "<!-- wp:paragraph --><p>Página legacy. Para o perfil actualizado do Docteur Saul consulte <a href=\"/docteur-saul/\">Docteur Saul</a>.</p><!-- /wp:paragraph -->";

$datenschutz_2_pt = "<!-- wp:paragraph --><p>Página legacy. Para a política de privacidade actualizada consulte <a href=\"/datenschutzerklaerung/\">Política de privacidade</a>.</p><!-- /wp:paragraph -->";

// =========================================================================
// PLANS
// =========================================================================
$plan_a = [
    9699 => [ 'slug' => 'aktuelles',                'title' => 'Novidades',                       'pt_slug' => 'novidades',                       'tpl' => 'template-standard.php',         'content' => $aktuelles_pt ],
    466  => [ 'slug' => 'arbeitsunfaehigkeit',      'title' => 'Baixa médica (AU)',               'pt_slug' => 'baixa-medica',                    'tpl' => 'template-standard.php',         'content' => $arbeitsunfaehigkeit_pt ],
    9668 => [ 'slug' => 'basic-check',              'title' => 'Basic Check — Informações',       'pt_slug' => 'basic-check-pt',                  'tpl' => 'template-bridge-product.php',   'content' => $basic_check_pt ],
    9709 => [ 'slug' => 'cookie-richtlinie-eu',     'title' => 'Política de cookies',             'pt_slug' => 'politica-de-cookies-pt',          'tpl' => 'template-standard.php',         'content' => $cookie_pt ],
    3    => [ 'slug' => 'datenschutzerklaerung',    'title' => 'Política de privacidade',         'pt_slug' => 'politica-de-privacidade-pt',      'tpl' => 'template-standard.php',         'content' => $datenschutz_pt ],
    4223 => [ 'slug' => 'datenschutzerklaerung-2',  'title' => 'Política de privacidade (legacy)','pt_slug' => 'politica-de-privacidade-legacy',  'tpl' => '',                              'content' => $datenschutz_2_pt ],
    375  => [ 'slug' => 'docteur-en-med-s-saul',    'title' => 'Docteur Saul (página legacy)',    'pt_slug' => 'docteur-saul-legacy-pt',          'tpl' => '',                              'content' => $docteur_saul_legacy_pt ],
    9687 => [ 'slug' => 'einweisungen',             'title' => 'Internamentos e credenciais',     'pt_slug' => 'internamentos-e-credenciais',     'tpl' => 'template-standard.php',         'content' => $einweisungen_pt ],
    9888 => [ 'slug' => 'faq',                      'title' => 'FAQ',                             'pt_slug' => 'faq-pt',                          'tpl' => '',                              'content' => $faq_pt ],
    4226 => [ 'slug' => 'impressum',                'title' => 'Aviso legal',                     'pt_slug' => 'aviso-legal',                     'tpl' => 'template-standard.php',         'content' => $impressum_pt ],
    9707 => [ 'slug' => 'rund-ums-labor',           'title' => 'Sobre o laboratório',             'pt_slug' => 'sobre-o-laboratorio-pt',          'tpl' => '',                              'content' => $rund_ums_labor_pt ],
    9685 => [ 'slug' => 'service',                  'title' => 'Serviços ao paciente',            'pt_slug' => 'servicos-ao-paciente',            'tpl' => 'template-standard.php',         'content' => $service_pt ],
    9691 => [ 'slug' => 'standorte',                'title' => 'Localizações',                    'pt_slug' => 'localizacoes',                    'tpl' => 'template-standard.php',         'content' => $standorte_pt ],
    9693 => [ 'slug' => 'zweigpraxis-bockenheimer', 'title' => 'Sede anexa Bockenheimer Landstraße 33', 'pt_slug' => 'sede-anexa-bockenheimer',   'tpl' => 'template-standard.php',         'content' => $zweigpraxis_pt ],
];

$plan_b = [
    9840 => [ 'slug' => 'bauchspeicheldruese', 'title' => 'Pâncreas',                'pt_slug' => 'bauchspeicheldruese-pt', 'tpl' => 'template-detail-page.php' ],
    289  => [ 'slug' => 'belastungs-ekg',      'title' => 'ECG de esforço',          'pt_slug' => 'belastungs-ekg-pt',      'tpl' => 'template-detail-page.php' ],
    9857 => [ 'slug' => 'biohack',             'title' => 'Biohack',                 'pt_slug' => 'biohack-pt',             'tpl' => 'template-detail-page.php' ],
    9844 => [ 'slug' => 'body-check',          'title' => 'Body Check',              'pt_slug' => 'body-check-pt',          'tpl' => 'template-detail-page.php' ],
    354  => [ 'slug' => 'carotis-duplex',      'title' => 'Doppler carotídeo',       'pt_slug' => 'carotis-duplex-pt',      'tpl' => 'template-detail-page.php' ],
    192  => [ 'slug' => 'contact-us',          'title' => 'Contacto',                'pt_slug' => 'contacto',               'tpl' => 'template-kontakt.php' ],
    9675 => [ 'slug' => 'docteur-saul',        'title' => 'Sonja Saul',              'pt_slug' => 'docteur-saul-pt',        'tpl' => 'template-arzt.php' ],
    9681 => [ 'slug' => 'dr-arbitmann',        'title' => 'Anna Arbitmann',          'pt_slug' => 'dr-arbitmann-pt',        'tpl' => 'template-arzt.php' ],
    9676 => [ 'slug' => 'dr-barcsay',          'title' => 'Dr. Fabian Barcsay',      'pt_slug' => 'dr-barcsay-pt',          'tpl' => 'template-arzt.php' ],
    9678 => [ 'slug' => 'dr-jawich',           'title' => 'Dr. Issa Jawich',         'pt_slug' => 'dr-jawich-pt',           'tpl' => 'template-arzt.php' ],
    9680 => [ 'slug' => 'dr-landeberg',        'title' => 'Linnea Landeberg',        'pt_slug' => 'dr-landeberg-pt',        'tpl' => 'template-arzt.php' ],
    9677 => [ 'slug' => 'dr-seelig',           'title' => 'Dr. Stefanie Seelig',     'pt_slug' => 'dr-seelig-pt',           'tpl' => 'template-arzt.php' ],
    9679 => [ 'slug' => 'dr-shahin',           'title' => 'Dr. George Shahin',       'pt_slug' => 'dr-shahin-pt',           'tpl' => 'template-arzt.php' ],
    382  => [ 'slug' => 'dr-stracke',          'title' => 'Dr. Siegbert Stracke',    'pt_slug' => 'dr-stracke-pt',          'tpl' => 'template-arzt.php' ],
    351  => [ 'slug' => 'echokardiographie',   'title' => 'Ecocardiografia',         'pt_slug' => 'echokardiographie-pt',   'tpl' => 'template-detail-page.php' ],
    9849 => [ 'slug' => 'eye-check',           'title' => 'Eye Check',               'pt_slug' => 'eye-check-pt',           'tpl' => 'template-detail-page.php' ],
    9848 => [ 'slug' => 'fit-for-diving',      'title' => 'Aptidão para mergulho',   'pt_slug' => 'fit-for-diving-pt',      'tpl' => 'template-detail-page.php' ],
    9782 => [ 'slug' => 'fragebogen-vor-termin','title'=> 'Questionário pré-consulta','pt_slug'=>'questionario-pre-consulta','tpl' => '' ],
    249  => [ 'slug' => 'home',                'title' => 'Home (legacy)',           'pt_slug' => 'home-legacy-pt',         'tpl' => '' ],
    9663 => [ 'slug' => 'home-neu',            'title' => 'Consultório — Início',    'pt_slug' => 'home-pt',                'tpl' => 'template-homepage.php' ],
    9847 => [ 'slug' => 'kardio-check',        'title' => 'Cardio Check',            'pt_slug' => 'kardio-check-pt',        'tpl' => 'template-detail-page.php' ],
    9666 => [ 'slug' => 'karriere',            'title' => 'Carreiras',               'pt_slug' => 'carreiras',              'tpl' => 'template-karriere.php' ],
    9846 => [ 'slug' => 'komplett-check',      'title' => 'Exame completo',          'pt_slug' => 'komplett-check-pt',      'tpl' => 'template-detail-page.php' ],
    296  => [ 'slug' => 'labor',               'title' => 'Diagnóstico laboratorial','pt_slug' => 'diagnostico-laboratorial','tpl' => 'template-labor.php' ],
    9843 => [ 'slug' => 'leber',               'title' => 'Fígado e vesícula',       'pt_slug' => 'leber-pt',               'tpl' => 'template-detail-page.php' ],
    292  => [ 'slug' => 'lungenfunktion',      'title' => 'Função pulmonar',         'pt_slug' => 'lungenfunktion-pt',      'tpl' => 'template-detail-page.php' ],
    9688 => [ 'slug' => 'neupatienten',        'title' => 'Novos pacientes',         'pt_slug' => 'novos-pacientes',        'tpl' => 'template-standard.php' ],
    9841 => [ 'slug' => 'nieren',              'title' => 'Rins e vias urinárias',   'pt_slug' => 'nieren-pt',              'tpl' => 'template-detail-page.php' ],
    9671 => [ 'slug' => 'praxis',              'title' => 'Comunidade de consultório','pt_slug' => 'comunidade-de-consultorio','tpl' => 'template-praxisgemeinschaft.php' ],
    9842 => [ 'slug' => 'prostata',            'title' => 'Próstata e bexiga',       'pt_slug' => 'prostata-pt',            'tpl' => 'template-detail-page.php' ],
    4014 => [ 'slug' => 'rezeptbestellung',    'title' => 'Pedido de receita',       'pt_slug' => 'pedido-de-receita',      'tpl' => 'template-standard.php' ],
    9858 => [ 'slug' => 'risikoprofil',        'title' => 'Perfil de risco',         'pt_slug' => 'risikoprofil-pt',        'tpl' => 'template-detail-page.php' ],
    357  => [ 'slug' => 'schilddruese',        'title' => 'Tiroide',                 'pt_slug' => 'schilddruese-pt',        'tpl' => 'template-detail-page.php' ],
    9845 => [ 'slug' => 'sono-check',          'title' => 'Sono Check',              'pt_slug' => 'sono-check-pt',          'tpl' => 'template-detail-page.php' ],
    277  => [ 'slug' => 'sonographie',         'title' => 'Ecografia abdominal',     'pt_slug' => 'sonographie-pt',         'tpl' => 'template-detail-page.php' ],
    9673 => [ 'slug' => 'sprechstunden',       'title' => 'Horários e consultas',    'pt_slug' => 'horarios-e-consultas',   'tpl' => 'template-sprechstunden.php' ],
    9851 => [ 'slug' => 'status-advanced',     'title' => 'Status Advanced',         'pt_slug' => 'status-advanced-pt',     'tpl' => 'template-detail-page.php' ],
    9850 => [ 'slug' => 'status-baseline',     'title' => 'Status Baseline',         'pt_slug' => 'status-baseline-pt',     'tpl' => 'template-detail-page.php' ],
    9852 => [ 'slug' => 'status-prevent',      'title' => 'Status Prevent',          'pt_slug' => 'status-prevent-pt',      'tpl' => 'template-detail-page.php' ],
    9856 => [ 'slug' => 'stoffwechsel',        'title' => 'Metabolismo',             'pt_slug' => 'stoffwechsel-pt',        'tpl' => 'template-detail-page.php' ],
    9853 => [ 'slug' => 'system-immune',       'title' => 'Sistema imunitário',      'pt_slug' => 'system-immune-pt',       'tpl' => 'template-detail-page.php' ],
    9855 => [ 'slug' => 'system-liver',        'title' => 'Sistema hepático',        'pt_slug' => 'system-liver-pt',        'tpl' => 'template-detail-page.php' ],
    9854 => [ 'slug' => 'system-renal',        'title' => 'Sistema renal',           'pt_slug' => 'system-renal-pt',        'tpl' => 'template-detail-page.php' ],
    9672 => [ 'slug' => 'team',                'title' => 'A nossa equipa',          'pt_slug' => 'a-nossa-equipa',         'tpl' => 'template-team.php' ],
    4011 => [ 'slug' => 'terminanfrage',       'title' => 'Pedido de consulta',      'pt_slug' => 'pedido-de-consulta',     'tpl' => 'template-standard.php' ],
    4017 => [ 'slug' => 'ueberweisung',        'title' => 'Pedido de credencial',    'pt_slug' => 'pedido-de-credencial',   'tpl' => 'template-standard.php' ],
    9887 => [ 'slug' => 'unsere-partner',      'title' => 'Os nossos parceiros',     'pt_slug' => 'os-nossos-parceiros',    'tpl' => 'template-partner.php' ],
    9682 => [ 'slug' => 'untersuchungen',      'title' => 'Exames',                  'pt_slug' => 'exames',                 'tpl' => 'template-untersuchungen-hub.php' ],
    9890 => [ 'slug' => 'videosprechstunde',   'title' => 'Consulta por vídeo',      'pt_slug' => 'consulta-por-video-pt',  'tpl' => 'template-standard.php' ],
];

// EXECUTE
$counters = [];
echo "--- Phase 1: Klasse-A Volltext (14 Pages) ---\n";
foreach ( $plan_a as $de_id => $cfg ) {
    [ $st, $msg ] = sc_bridge_pt( $de_id, $cfg['title'], $cfg['pt_slug'], $cfg['content'], $cfg['tpl'], $commit );
    $counters[$st] = ($counters[$st]??0)+1;
    printf("  [%-7s] %-30s → %s\n", $st, $cfg['slug'], $msg);
}
echo "\n--- Phase 2: Klasse-B Stub (49 Pages) ---\n";
foreach ( $plan_b as $de_id => $cfg ) {
    $de_content = get_post_field( 'post_content', $de_id );
    [ $st, $msg ] = sc_bridge_pt( $de_id, $cfg['title'], $cfg['pt_slug'], $de_content, $cfg['tpl'], $commit );
    $counters[$st] = ($counters[$st]??0)+1;
    printf("  [%-7s] %-30s → %s\n", $st, $cfg['slug'], $msg);
}
echo "\n=== SUMMARY ===\n";
foreach ($counters as $k=>$v) printf("  %s: %d\n", $k, $v);
$err = $counters['ERROR'] ?? 0;
echo "\n" . ( $err ? "FAIL ({$err})" : ($commit ? "OK (committed)" : "OK (dry-run)") ) . "\n";
exit( $err ? 1 : 0 );
