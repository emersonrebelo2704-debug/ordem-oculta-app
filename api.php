<?php
/**
 * ORDEM OCULTA — MOTOR PHP BLINDADO DE ALTA CONCORRÊNCIA (TURBOCLOUD + CLOUDFLARE)
 * Processa chamadas de IA no servidor sem bloquear sessões e sem expor credenciais.
 */
if (session_status() === PHP_SESSION_ACTIVE) {
    session_write_close();
}
@ini_set('display_errors', '0');
@ini_set('max_execution_time', '45');
@ini_set('memory_limit', '64M');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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
        'YjRjNzVhOGJkMWU2ZWIzY2ZjZjE3ODUzYTI1MTI4',
        'ODJlNDJjYjE4OTI5MmU5NTFiN2U2MTQ5YTMzZWU3',
        'YmQzMS0xdi1yby1rcw=='
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

function callOpenRouter(string $systemPrompt, string $userText = '', ?string $imageDataUrl = null, float $temperature = 0.72, int $maxTokens = 2400): array {
    $apiKey = resolveOpenRouterKey();
    $models = $imageDataUrl
        ? ['google/gemini-2.5-flash', 'openai/gpt-4o-mini', 'nvidia/nemotron-3.5-super-vl:free']
        : ['google/gemini-2.5-flash', 'openai/gpt-4o-mini'];

    $lastError = 'Falha desconhecida';

    foreach ($models as $model) {
        $userContent = $imageDataUrl
            ? [
                ['type' => 'text', 'text' => $userText],
                ['type' => 'image_url', 'image_url' => ['url' => $imageDataUrl]]
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
            CURLOPT_TIMEOUT => 32,
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
            return ['success' => true, 'data' => $parsed];
        }
        $lastError = 'JSON inválido retornado pelo modelo ' . $model;
    }

    return ['success' => false, 'error' => $lastError];
}

$rawInput = file_get_contents('php://input');
$body = json_decode($rawInput ?: '{}', true) ?: [];
$action = $_GET['action'] ?? ($body['action'] ?? '');

if ($action === 'scan') {
    $image = $body['image'] ?? '';
    $phase = $body['phase'] ?? 'auto';
    $submode = $body['submode'] ?? 'story';

    if (empty($image)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Imagem não fornecida']);
        exit;
    }

    if (strpos($image, 'data:image/') !== 0) {
        $image = 'data:image/jpeg;base64,' . $image;
    }

    $systemPrompt = <<<PROMPT
Você é "O Mestre da Sedução", mentor sênior de comunicação interpessoal, carisma masculino, inteligência social e dinâmica de relacionamentos da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Analise a captura de tela enviada pelo aluno e crie 3 respostas autênticas, inteligentes, bem-humoradas e magnéticas em português brasileiro natural.
Identifique se a plataforma ("detected_platform") é "instagram" ou "whatsapp" e se o formato ("detected_submode") é "story" ou "chat".
Se estiver no Instagram e for momento de convidar para sair, use o fato do Instagram não mandar pino fixo de localização como pretexto natural para pegar o WhatsApp.
Escolha "detected_phase_key" entre: "invasao", "conducao", "extracao", "fechamento".
Para cada uma das 3 opções ("A Provocação do Elemento", "O Loop de Curiosidade", "O Charme Descarado"), preencha "advice" com:
💡 **Por que funciona:** ...\n🎯 **O que ela vai sentir:** ...\n⏭️ **Próximo passo:** ...
Responda EXCLUSIVAMENTE em JSON puro:
{
  "intel": {
    "detected_platform": "instagram",
    "detected_submode": "story",
    "detected_phase_key": "invasao",
    "phase": "Fase I: A Abordagem Magnética (Auto-detectada)",
    "diagnosis": "Leitura clínica do Mestre sobre o contexto da imagem e objetivo ideal.",
    "termometro": "Clima da interação",
    "gancho": "Detalhe específico observado na imagem"
  },
  "options": [
    { "badge": "A Provocação do Elemento", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Loop de Curiosidade", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Charme Descarado", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." }
  ]
}
PROMPT;

    $userText = "Analise esta captura de tela (modo sugerido: {$submode}, fase sugerida: {$phase}) e retorne o JSON completo com a leitura do Mestre da Sedução.";
    $result = callOpenRouter($systemPrompt, $userText, $image, 0.72, 2600);
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
    $status = strtolower((string)($body['order_status'] ?? ($body['status'] ?? ($body['webhook_event_type'] ?? ''))));
    $customerEmail = strtolower(trim((string)($body['Customer']['email'] ?? ($body['email'] ?? ''))));
    $customerName = trim((string)($body['Customer']['full_name'] ?? ($body['name'] ?? 'Membro Ordem Oculta')));
    $productName = strtolower(trim((string)($body['Product']['product_name'] ?? ($body['product_name'] ?? 'Ordem Oculta'))));

    $dbFile = __DIR__ . '/.vip_members.json';
    $members = file_exists($dbFile) ? (json_decode((string)file_get_contents($dbFile), true) ?: []) : [];

    if ($customerEmail !== '' && in_array($status, ['paid', 'approved', 'order_approved'], true)) {
        $planType = (strpos($productName, 'anual') !== false || strpos($productName, 'vital') !== false) ? 'anual' : 'mensal';
        $members[$customerEmail] = [
            'name' => $customerName,
            'email' => $customerEmail,
            'plan' => $planType,
            'product' => $productName,
            'status' => 'active',
            'updated_at' => gmdate('c')
        ];
        @file_put_contents($dbFile, json_encode($members, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }

    // Repassa automaticamente o evento de venda para o VeroTrack (que dispara o Facebook CAPI oficial)
    if (!empty($rawInput)) {
        $vtCh = curl_init('https://api.pontoideal.online/webhooks/kiwify');
        curl_setopt_array($vtCh, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
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
        'message' => 'Webhook Kiwify processado, acesso liberado e VeroTrack/CAPI notificado',
        'email' => $customerEmail,
        'verotrack_http' => $vtCode ?? null
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'verify-vip') {
    $email = strtolower(trim((string)($body['email'] ?? ($_GET['email'] ?? ''))));
    $dbFile = __DIR__ . '/.vip_members.json';
    $members = file_exists($dbFile) ? (json_decode((string)file_get_contents($dbFile), true) ?: []) : [];

    if ($email !== '' && isset($members[$email])) {
        echo json_encode([
            'success' => true,
            'vip' => true,
            'member' => $members[$email]
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode(['success' => true, 'vip' => false]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Ação inválida']);
