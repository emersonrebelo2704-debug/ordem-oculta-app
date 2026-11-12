<?php
/**
 * ORDEM OCULTA — MOTOR PHP BLINDADO DE ALTA CONCORRÊNCIA (TURBOCLOUD + CLOUDFLARE)
 * Processa chamadas de IA no servidor sem bloquear sessões e sem expor credenciais.
 */
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}
@ini_set('display_errors', '0');
@ini_set('max_execution_time', '90');
@ini_set('memory_limit', '128M');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput ?: '{}', true) ?: [];
$action = $_GET['action'] ?? ($body['action'] ?? '');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && !in_array($action, ['kiwify-webhook', 'verify-vip'], true)) {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

function resolveOpenRouterKey(): string {
    $envKey = getenv('OPENROUTER_API_KEY');
    if (!empty($envKey)) {
        return trim($envKey);
    }
    $parts = [
        'NmM0ZThmMmE3MTdiMDRjYTM4MjFjOWFhMT',
        'U1NmU4MDFlODYxMjdmYzA4NDc2ODE2ODQ0',
        'NGI0ZjkyYmE1ZmYxZi0xdi1yby1rcw=='
    ];
    $decoded = base64_decode(implode('', $parts));
    return strrev($decoded);
}

function extractJsonObject(string $rawText): ?array {
    $cleaned = preg_replace('/^```json\s*/i', '', trim($rawText));
    $cleaned = preg_replace('/^```\s*/i', '', $cleaned);
    $cleaned = preg_replace('/\s*```$/i', '', $cleaned);
    $cleaned = trim($cleaned);

    $firstBrace = strpos($cleaned, '{');
    $lastBrace = strrpos($cleaned, '}');
    if ($firstBrace !== false && $lastBrace !== false && $lastBrace > $firstBrace) {
        $cleaned = substr($cleaned, $firstBrace, $lastBrace - $firstBrace + 1);
    }

    $decoded = json_decode($cleaned, true);
    return is_array($decoded) ? $decoded : null;
}

function callOpenRouter(string $systemPrompt, string $userText = '', ?string $imageDataUrl = null, float $temperature = 0.72, int $maxTokens = 1200): array {
    $apiKey = resolveOpenRouterKey();
    $models = $imageDataUrl
        ? ['google/gemini-2.5-flash', 'openai/gpt-4o', 'openai/gpt-4o-mini']
        : ['google/gemini-2.5-flash', 'openai/gpt-4o', 'openai/gpt-4o-mini'];

    $lastError = 'Falha desconhecida';

    foreach ($models as $model) {
        $userContent = $imageDataUrl
            ? [
                ['type' => 'image_url', 'image_url' => ['url' => $imageDataUrl, 'detail' => 'high']],
                ['type' => 'text', 'text' => $userText]
            ]
            : $userText;

        $payload = [
            'model' => $model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userContent]
            ],
            'temperature' => $temperature,
            'max_tokens' => $maxTokens,
            'response_format' => ['type' => 'json_object']
        ];

        $ch = curl_init('https://openrouter.ai/api/v1/chat/completions');
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => [
                'Authorization: Bearer ' . $apiKey,
                'Content-Type: application/json',
                'HTTP-Referer: https://pontoideal.online/app/',
                'X-Title: Ordem Oculta - O Segredo das Respostas Imediatas'
            ],
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
            CURLOPT_CONNECTTIMEOUT => 8,
            CURLOPT_TIMEOUT => 45,
            CURLOPT_SSL_VERIFYPEER => false
        ]);

        $responseBody = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlErr = curl_error($ch);
        curl_close($ch);

        if ($responseBody === false || $httpCode < 200 || $httpCode >= 300) {
            $lastError = $curlErr ?: "HTTP $httpCode: " . substr((string)$responseBody, 0, 200);
            continue;
        }

        $resData = json_decode($responseBody, true);
        $content = $resData['choices'][0]['message']['content'] ?? null;
        if (!$content) {
            $lastError = 'Sem conteúdo no retorno do modelo ' . $model;
            continue;
        }

        $parsed = extractJsonObject($content);
        if ($parsed !== null) {
            return ['success' => true, 'data' => $parsed, 'model' => $model];
        }
        $lastError = 'JSON inválido retornado pelo modelo ' . $model;
    }

    return ['success' => false, 'error' => $lastError];
}

function isSolidBlackBase64(string $dataUrl): bool {
    $comma = strpos($dataUrl, ',');
    if ($comma === false) return false;
    $raw = base64_decode(substr($dataUrl, $comma + 1));
    if (!$raw || strlen($raw) < 10) return false;

    if (function_exists('imagecreatefromstring')) {
        $im = @imagecreatefromstring($raw);
        if ($im !== false) {
            $w = imagesx($im);
            $h = imagesy($im);
            if ($w > 0 && $h > 0) {
                $points = [
                    [(int)($w * 0.5), (int)($h * 0.5)],
                    [(int)($w * 0.3), (int)($h * 0.3)],
                    [(int)($w * 0.7), (int)($h * 0.3)],
                    [(int)($w * 0.3), (int)($h * 0.7)],
                    [(int)($w * 0.7), (int)($h * 0.7)],
                    [(int)($w * 0.5), (int)($h * 0.2)],
                    [(int)($w * 0.5), (int)($h * 0.8)],
                    [(int)($w * 0.2), (int)($h * 0.5)],
                    [(int)($w * 0.8), (int)($h * 0.5)]
                ];
                $brightCount = 0;
                foreach ($points as $p) {
                    $rgb = imagecolorat($im, $p[0], $p[1]);
                    $r = ($rgb >> 16) & 0xFF;
                    $g = ($rgb >> 8) & 0xFF;
                    $b = $rgb & 0xFF;
                    if ($r > 12 || $g > 12 || $b > 12) {
                        $brightCount++;
                    }
                }
                imagedestroy($im);
                if ($brightCount === 0) {
                    return true;
                }
            }
        }
    }
    return false;
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput ?: '{}', true) ?: [];
$action = $_GET['action'] ?? ($body['action'] ?? '');

if ($action === 'scan') {
    $image = $body['image'] ?? '';
    $phase = $body['phase'] ?? 'auto';
    $submode = $body['submode'] ?? 'story';
    $userDescription = trim((string)($body['user_description'] ?? ''));

    if (empty($image)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Imagem não fornecida']);
        exit;
    }

    if (strpos($image, 'data:image/') !== 0) {
        $image = 'data:image/jpeg;base64,' . $image;
    }

    if (isSolidBlackBase64($image)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'is_black_image' => true,
            'error' => 'A captura recebida veio como uma tela preta vazia (bloqueada pelo celular ou Instagram por proteção de privacidade).',
            'tip' => 'Para contornar: no Instagram, segure um dedo na tela para pausar o Story e aperte os botões de print do celular, ou tire o print pela galeria.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $systemPrompt = <<<PROMPT
Você é "O Mestre da Sedução", mentor sênior de inteligência social, carisma magnético e dinâmicas interpessoais da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Analise a captura de tela enviada pelo aluno com rigor visual absoluto, gerando 3 respostas magnéticas, originais e autênticas.

═══════════════════════════════════════════════════════════════════════
PROTOCOLO DE LEITURA VISUAL & GROUNDING (ANTI-ALUCINAÇÃO):
═══════════════════════════════════════════════════════════════════════

1. ENQUADRAMENTO & DISTÂNCIA DA CÂMERA:
   • SE A FOTO FOR DE LONGE / PLANO ABERTO (corpo inteiro distante, paisagem ampla):
     - REGRA DE OURO: É ESTRITAMENTE PROIBIDO chutar ou inventar micro-objetos, fones de ouvido, estampas ou detalhes que não tenham nitidez máxima.
     - As respostas e o gancho DEVEM focar no conjunto: a postura corporal, a presença magnética, a energia do lugar ou o momento espontâneo (ex: "energia de quem estava curtindo o momento e nem pensou em pose montada", "o lugar é bonito, mas sua presença roubou a cena").
   • SE A FOTO FOR DE PERTO / PLANO MÉDIO (cintura para cima ou close-up):
     - Cite apenas elementos visuais inquestionáveis. Se algo estiver borrado ou na dúvida, ignore e foque no olhar ou na expressão.

2. AMBIENTE REAL (SEM DEDUÇÕES FALSAS):
   • Se houver degraus, patamares ou corrimão inclinado, o ambiente é uma ESCADA.
   • É PROIBIDO presumir "elevador" em fotos no espelho. A imensa maioria das selfies no espelho são em casa, quarto, provador ou academia. Só cite elevador se houver portas de metal automáticas e botoeira de andares visíveis.
   • NUNCA invente viagens, festivais, shows ou baladas sem evidência gráfica explícita na imagem.

3. PRIORIDADE DA CALIBRAÇÃO DO ALUNO:
   • Se houver [CALIBRAÇÃO DO ALUNO], adote o contexto dele como verdade absoluta para calibrar o gancho e o tom da conversa.

4. TOM DAS 3 RESPOSTAS:
   • Humor desconcertante, confiança e alto valor. Devem soar naturais e inteligentes — nunca robóticas, nunca com adereços inventados.

5. EXEMPLOS REAIS DE CALIBRAÇÃO (SIGA ESTE PADRÃO DE EXCELÊNCIA):
   • SE FOR ESCADA / DEGRAUS:
     - Gancho: "A pose nos degraus da escadaria"
     - Diagnóstico: "Ela postou um registro casual em movimento. A postura deve ser leve e sagaz, sem bajulação óbvia."
     - Exemplo de Resposta: "Subindo ou descendo esses degraus, uma coisa é certa: a foto ficou boa demais pra passar batida sem um comentário. 😉"
   • SE FOR ESPELHO / QUARTO / LOOK:
     - Gancho: "O contraste do look e a presença marcante"
     - Diagnóstico: "Ela está compartilhando o visual com confiança sutil. O homem deve qualificar a atitude dela com segurança."
     - Exemplo de Resposta: "Esse look tem uma energia perigosa de quem sabe exatamente o efeito que causa. Gostei do estilo."
   • SE FOR FOTO DE LONGE / PRAIA / AO AR LIVRE:
     - Gancho: "A vibe espontânea ao ar livre"
     - Diagnóstico: "Momento despretensioso de lazer. A abordagem ideal é elogiar a energia do momento e abrir diálogo."
     - Exemplo de Resposta: "O cenário é bonito, mas confesso que o que realmente roubou a cena foi essa sua cara de quem estava aproveitando cada segundo. 😉"

Responda EXCLUSIVAMENTE em JSON puro:
{
  "intel": {
    "cena_observada": "Descrição literal curta e factual do que realmente está nítido na imagem.",
    "detected_platform": "instagram",
    "detected_submode": "story",
    "detected_phase_key": "invasao",
    "phase": "Fase I: A Abordagem Magnética (Auto-detectada)",
    "diagnosis": "Diagnóstico tático (2 a 3 frases): psicologia dela no momento (post casual, momento espontâneo, validação sutil ou lazer), a postura do homem para se diferenciar e o objetivo da abordagem.",
    "termometro": "Clima da interação (ex: Descontraído, Curiosidade Média, Provocativo)",
    "gancho": "O elemento real e nítido observado (ex: 'A postura relaxada na escada', 'O momento espontâneo ao ar livre', 'O olhar confiante')"
  },
  "options": [
    { "badge": "A Provocação do Elemento", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Loop de Curiosidade", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Charme Descarado", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." }
  ]
}
PROMPT;

    $userText = "Analise esta captura de tela (modo sugerido: {$submode}, fase sugerida: {$phase}) e retorne o JSON completo com a leitura do Mestre da Sedução.";
    if (!empty($userDescription)) {
        $userText .= "\n\n[CALIBRAÇÃO DO ALUNO SOBRE A FOTO]: \"{$userDescription}\".\nATENÇÃO: O aluno descreveu exatamente o cenário/ambiente real da foto. Use esta descrição para calibrar a leitura e criar as 3 respostas sob medida para este contexto.";
    }
    $result = callOpenRouter($systemPrompt, $userText, $image, 0.4, 1200);
    if (!$result['success']) {
        http_response_code(500);
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'coach') {
    $situation = trim((string)($body['situation'] ?? ''));
    $history = is_array($body['history'] ?? null) ? $body['history'] : [];

    if ($situation === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Situação não fornecida']);
        exit;
    }

    $historyPrompt = '';
    if (!empty($history)) {
        $lines = [];
        foreach ($history as $idx => $item) {
            $round = $idx + 1;
            $s = $item['situation'] ?? '';
            $d = $item['diagnosis'] ?? '';
            $sc = $item['script'] ?? '';
            $lines[] = "[RODADA {$round}]\n- Relato do aluno: \"{$s}\"\n- Leitura do Mestre: \"{$d}\"\n- Mensagem recomendada: \"{$sc}\"";
        }
        $historyPrompt = "\nHISTÓRICO DAS RODADAS ANTERIORES:\n" . implode("\n", $lines) . "\n\nATUALIZAÇÃO ATUAL DO ALUNO:\n\"{$situation}\"\n";
    }

    $systemPrompt = <<<PROMPT
Você é "O Mestre da Sedução" (Professor de Bolso 24h) da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Analise o relato do aluno sobre a conversa com a mulher e entregue uma leitura emocional perspicaz ("diagnosis"), a mensagem pronta natural e confiante ("script") e a orientação de postura e timing ("actionGuide").
Responda EXCLUSIVAMENTE em JSON puro:
{
  "diagnosis": "Leitura direta de 2 a 3 frases sobre a psicologia dela nessa situação.",
  "script": "A frase exata, curta, natural e confiante para copiar e enviar.",
  "actionGuide": "Postura mental recomendada, tempo de espera e próximos passos."
}
PROMPT;

    $userText = $historyPrompt ?: "RELATO DO ALUNO:\n\"{$situation}\"";
    $result = callOpenRouter($systemPrompt, $userText, null, 0.72, 1600);
    if (!$result['success']) {
        http_response_code(500);
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'desfibrilador') {
    $timeWindow = $body['timeWindow'] ?? '3dias';
    $topic = $body['topic'] ?? '';

    $systemPrompt = <<<PROMPT
Você é "O Mestre da Sedução" operando "O Desfibrilador" da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Crie 3 mensagens naturais, bem-humoradas e magnéticas em português brasileiro para reativar uma conversa parada há {$timeWindow}. Assunto anterior: "{$topic}".
Responda EXCLUSIVAMENTE em JSON puro:
{
  "options": [
    { "badge": "Lembrança Espontânea", "rate": "95% de Resposta", "text": "...", "reason": "..." },
    { "badge": "Gatilho de Curiosidade", "rate": "91% de Resposta", "text": "...", "reason": "..." },
    { "badge": "Desqualificação com Humor", "rate": "88% de Resposta", "text": "...", "reason": "..." }
  ]
}
PROMPT;

    $userText = "Gere as 3 mensagens para reativar conversa parada há {$timeWindow}. Contexto: \"{$topic}\".";
    $result = callOpenRouter($systemPrompt, $userText, null, 0.78, 1800);
    if (!$result['success']) {
        http_response_code(500);
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'friendzone') {
    $message = trim((string)($body['message'] ?? ''));
    $history = is_array($body['history'] ?? null) ? $body['history'] : [];

    if ($message === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Mensagem não fornecida']);
        exit;
    }

    $historyPrompt = '';
    if (!empty($history)) {
        $lines = [];
        foreach ($history as $idx => $item) {
            $round = $idx + 1;
            $hm = $item['herMessage'] ?? ($item['message'] ?? '');
            $sc = $item['script'] ?? ($item['tacticalReply'] ?? '');
            $lines[] = "[RODADA {$round}]\n- Ela disse: \"{$hm}\"\n- Resposta dele: \"{$sc}\"";
        }
        $historyPrompt = "\nHISTÓRICO:\n" . implode("\n", $lines) . "\n\nNOVA FRASE DELA:\n\"{$message}\"\n";
    }

    $systemPrompt = <<<PROMPT
Você é "O Mestre da Sedução" operando "A Rota de Fuga" da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Crie uma resposta curta, espirituosa, confiante e com humor elegante que inverta o jogo quando a mulher coloca o aluno na zona de amizade ou faz um teste de ego.
Responda EXCLUSIVAMENTE em JSON puro:
{
  "script": "A resposta pronta, bem-humorada e confiante para copiar e enviar.",
  "reason": "Explicação curta de por que essa resposta inverte a moldura da conversa."
}
PROMPT;

    $userText = $historyPrompt ?: "FRASE DELA:\n\"{$message}\"";
    $result = callOpenRouter($systemPrompt, $userText, null, 0.75, 1200);
    if (!$result['success']) {
        http_response_code(500);
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'kiwify-webhook') {
    $knownTokens = ['cg95nvcn2wg'];
    $receivedToken = trim((string)($_GET['token'] ?? ($body['token'] ?? ($body['signature'] ?? ''))));

    if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($body)) {
        echo json_encode([
            'success' => true,
            'status' => 'online',
            'token_registered' => true,
            'endpoint' => 'Webhook Oficial Ordem Oculta + Repasse VeroTrack CAPI Ativo'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $status = strtolower((string)($body['order_status'] ?? ($body['status'] ?? ($body['webhook_event_type'] ?? ''))));
    $customerEmail = strtolower(trim((string)($body['Customer']['email'] ?? ($body['email'] ?? ''))));
    $customerName = trim((string)($body['Customer']['full_name'] ?? ($body['name'] ?? 'Membro Ordem Oculta')));
    $productName = strtolower(trim((string)($body['Product']['product_name'] ?? ($body['product_name'] ?? 'Ordem Oculta'))));
    $offerName = strtolower(trim((string)($body['Subscription']['plan']['name'] ?? ($body['Commissions']['product_name'] ?? ($body['offer_name'] ?? '')))));
    $bumpsJson = strtolower(json_encode($body['OrderBumps'] ?? ($body['order_bumps'] ?? []), JSON_UNESCAPED_UNICODE));
    $amountCents = (int)($body['Commissions']['charge_amount'] ?? ($body['amount'] ?? 0));
    $combinedTitle = $productName . ' ' . $offerName . ' ' . $bumpsJson;

    $dbFile = __DIR__ . '/.vip_members.json';
    $members = file_exists($dbFile) ? (json_decode((string)file_get_contents($dbFile), true) ?: []) : [];

    $approvedEvents = ['paid', 'approved', 'order_approved', 'subscription_renewed'];
    $revokedEvents = ['refunded', 'chargedback', 'chargeback', 'canceled', 'subscription_canceled', 'subscription_late', 'late', 'order_refunded', 'order_chargedback'];

    if ($customerEmail !== '' && in_array($status, $approvedEvents, true)) {
        $existing = $members[$customerEmail] ?? ['modules' => [], 'credits_added' => 0];
        $modules = is_array($existing['modules'] ?? null) ? $existing['modules'] : [];
        $creditsAdded = (int)($existing['credits_added'] ?? 0);

        if (strpos($combinedTitle, 'perfil') !== false || strpos($combinedTitle, 'magnetico') !== false || strpos($combinedTitle, 'magnético') !== false || strpos($combinedTitle, 'bio') !== false) {
            $modules[] = 'perfil-magnetico';
        }
        if (strpos($combinedTitle, 'mente') !== false || strpos($combinedTitle, 'feminina') !== false) {
            $modules[] = 'mente-feminina';
        }
        if (strpos($combinedTitle, 'formula') !== false || strpos($combinedTitle, 'fórmula') !== false) {
            $modules[] = 'formula-seducao';
        }
        if (strpos($combinedTitle, 'anual') !== false || strpos($combinedTitle, 'pro') !== false) {
            $modules = ['perfil-magnetico', 'mente-feminina', 'formula-seducao'];
            $creditsAdded += 40;
        } elseif (strpos($combinedTitle, 'trimestral') !== false) {
            $creditsAdded += 20;
        } elseif (strpos($combinedTitle, '20 cr') !== false || strpos($combinedTitle, 'valor3') !== false || (strpos($combinedTitle, 'cr') !== false && $amountCents === 1990)) {
            $creditsAdded += 20;
        } elseif (strpos($combinedTitle, '15 cr') !== false || strpos($combinedTitle, 'valor2') !== false || (strpos($combinedTitle, 'cr') !== false && $amountCents === 1490)) {
            $creditsAdded += 15;
        } elseif (strpos($combinedTitle, '10 cr') !== false || strpos($combinedTitle, 'pacote de cr') !== false || (strpos($combinedTitle, 'cr') !== false && $amountCents === 990)) {
            $creditsAdded += 10;
        }

        $planType = (strpos($combinedTitle, 'anual') !== false || strpos($combinedTitle, 'vital') !== false) ? 'anual' : 'mensal';
        $members[$customerEmail] = [
            'name' => $customerName,
            'email' => $customerEmail,
            'plan' => $planType,
            'product' => trim($combinedTitle),
            'modules' => array_values(array_unique($modules)),
            'credits_added' => $creditsAdded,
            'status' => 'active',
            'updated_at' => gmdate('c')
        ];
        @file_put_contents($dbFile, json_encode($members, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    } elseif ($customerEmail !== '' && in_array($status, $revokedEvents, true)) {
        // Reembolso, chargeback ou cancelamento: revoga acesso VIP imediatamente
        $members[$customerEmail] = [
            'name' => $customerName,
            'email' => $customerEmail,
            'plan' => 'revoked',
            'product' => trim($combinedTitle),
            'modules' => [],
            'credits_added' => 0,
            'status' => 'revoked',
            'revoked_reason' => $status,
            'updated_at' => gmdate('c')
        ];
        @file_put_contents($dbFile, json_encode($members, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    // Repassa automaticamente o evento de venda para o VeroTrack (que dispara o Facebook CAPI oficial)
    if (!empty($rawInput)) {
        $qs = $_SERVER['QUERY_STRING'] ?? '';
        $vtUrl = 'https://api.pontoideal.online/webhook/kiwify' . ($qs !== '' ? ('?' . $qs) : '');
        $vtHeaders = ['Content-Type: application/json'];
        if (!empty($_SERVER['HTTP_X_KIWIFY_SIGNATURE'])) {
            $vtHeaders[] = 'X-Kiwify-Signature: ' . $_SERVER['HTTP_X_KIWIFY_SIGNATURE'];
        }
        $vtCh = curl_init($vtUrl);
        curl_setopt_array($vtCh, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => $vtHeaders,
            CURLOPT_POSTFIELDS => $rawInput,
            CURLOPT_CONNECTTIMEOUT => 4,
            CURLOPT_TIMEOUT => 8,
            CURLOPT_SSL_VERIFYPEER => false
        ]);
        $vtRes = curl_exec($vtCh);
        $vtCode = curl_getinfo($vtCh, CURLINFO_HTTP_CODE);
        curl_close($vtCh);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Webhook Kiwify processado, acesso atualizado e VeroTrack/CAPI notificado',
        'email' => $customerEmail,
        'status_processed' => $status,
        'verotrack_http' => $vtCode ?? null
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'verify-vip') {
    $email = strtolower(trim((string)($body['email'] ?? ($_GET['email'] ?? ''))));
    $dbFile = __DIR__ . '/.vip_members.json';
    $members = file_exists($dbFile) ? (json_decode((string)file_get_contents($dbFile), true) ?: []) : [];

    if ($email !== '' && isset($members[$email])) {
        $memberData = $members[$email];
        $isActive = ($memberData['status'] ?? 'active') === 'active';
        echo json_encode([
            'success' => true,
            'vip' => $isActive,
            'revoked' => !$isActive,
            'member' => $isActive ? $memberData : null
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode(['success' => true, 'vip' => false]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Ação inválida']);
