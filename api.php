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

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && !in_array($action, ['kiwify-webhook', 'verify-vip', 'auth-session'], true)) {
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

/**
 * ============================================================================
 * SISTEMA DE AUTENTICAÇÃO E BLINDAGEM DE MEMBROS (KIWIFY + SESSÃO PERSISTENTE)
 * ============================================================================
 */
function getMembersDbPath(): string {
    return __DIR__ . '/.vip_members.json';
}

function loadMembersDb(): array {
    $dbFile = getMembersDbPath();
    $members = file_exists($dbFile) ? (json_decode((string)file_get_contents($dbFile), true) ?: []) : [];
    if (!is_array($members)) {
        $members = [];
    }

    // Garante contas de administração do proprietário sempre ativas
    $ownerEmails = ['emersonrebelo2704@gmail.com', 'assistente@pontoideal.online'];
    $changed = false;
    foreach ($ownerEmails as $ownerEmail) {
        if (!isset($members[$ownerEmail])) {
            $members[$ownerEmail] = [
                'name' => 'Administrador Ordem Oculta',
                'email' => $ownerEmail,
                'plan' => 'anual',
                'product' => 'Ordem Oculta Anual PRO (Owner)',
                'modules' => ['perfil-magnetico', 'mente-feminina', 'formula-seducao'],
                'credits_added' => 999,
                'status' => 'ativa',
                'password_hash' => '',
                'updated_at' => gmdate('c')
            ];
            $changed = true;
        }
    }
    if ($changed) {
        @file_put_contents($dbFile, json_encode($members, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
    }
    return $members;
}

function saveMembersDb(array $members): void {
    $dbFile = getMembersDbPath();
    @file_put_contents($dbFile, json_encode($members, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX);
}

function isMemberStatusActive(array $member): bool {
    $st = strtolower(trim((string)($member['status'] ?? '')));
    return in_array($st, ['ativa', 'active', 'paid', 'approved'], true);
}

function generateMemberToken(string $email): string {
    $cleanEmail = strtolower(trim($email));
    $secret = 'oo_member_hmac_2026_' . resolveOpenRouterKey();
    $sig = hash_hmac('sha256', $cleanEmail . '|ordem_oculta_ativa', $secret);
    return rtrim(strtr(base64_encode($cleanEmail), '+/', '-_'), '=') . '.' . $sig;
}

function verifyMemberToken(?string $token): ?array {
    if (empty($token) || strpos($token, '.') === false) {
        return null;
    }
    [$b64Email, $sig] = explode('.', $token, 2);
    $email = strtolower(trim((string)base64_decode(strtr($b64Email, '-_', '+/'))));
    if ($email === '') {
        return null;
    }
    $expectedToken = generateMemberToken($email);
    if (!hash_equals($expectedToken, $token)) {
        return null;
    }
    $members = loadMembersDb();
    if (!isset($members[$email])) {
        return null;
    }
    $member = $members[$email];
    if (!isMemberStatusActive($member)) {
        return null;
    }
    return $member;
}

function extractRequestToken(array $body): string {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? ($_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');
    if (preg_match('/Bearer\s+(.+)$/i', $authHeader, $matches)) {
        return trim($matches[1]);
    }
    return trim((string)($body['auth_token'] ?? ($body['token'] ?? ($_GET['auth_token'] ?? ''))));
}

function sanitizeMemberPublic(array $member): array {
    return [
        'name' => $member['name'] ?? 'Membro Ordem Oculta',
        'email' => $member['email'] ?? '',
        'plan' => $member['plan'] ?? 'mensal',
        'modules' => $member['modules'] ?? [],
        'credits_added' => (int)($member['credits_added'] ?? 10),
        'status' => isMemberStatusActive($member) ? 'ativa' : ($member['status'] ?? 'inativa'),
        'updated_at' => $member['updated_at'] ?? gmdate('c')
    ];
}

function requireActiveMemberSession(array $body): array {
    $token = extractRequestToken($body);
    $member = verifyMemberToken($token);
    if ($member === null) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'auth_required' => true,
            'error' => 'Acesso exclusivo para assinantes ativos. Faça login com seu e-mail da Kiwify para utilizar o aplicativo.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    return $member;
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

function callOpenRouter(string $systemPrompt, string $userText = '', ?string $imageDataUrl = null, float $temperature = 0.72, int $maxTokens = 1500, ?array $preferredModels = null): array {
    $apiKey = resolveOpenRouterKey();
    $models = $preferredModels ?: ($imageDataUrl
        ? ['openai/gpt-4o', 'google/gemini-2.5-flash', 'openai/gpt-4o-mini']
        : ['openai/gpt-4o', 'google/gemini-2.5-flash', 'openai/gpt-4o-mini']);

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

/**
 * ============================================================================
 * ARQUITETURA DE DIVISÃO DE IAs (MOTORES INDEPENDENTES: FOTO vs CONVERSA)
 * ============================================================================
 * 1. IA Leitora Óptica (OCR & Classificador Puro): Identifica se é Foto ou Conversa
 *    e extrai o texto exato dos balões sem viés criativo.
 * 2. IA Especialista em Fotos/Stories: 100% dedicada a leitura de cena/postura.
 * 3. IA Especialista em Conversas/DMs: 100% dedicada a responder o texto lido.
 */

function runVisualReaderOCR(string $image): array {
    $ocrSystem = <<<PROMPT
Você é um motor óptico de precisão (OCR e Analisador Visual Neutro). Sua única função é observar a imagem com exatidão factual, sem inventar nada.

1. Identifique o "tipo":
   • "chat": se a imagem for um print de conversa com balões de mensagens trocadas (Direct do Instagram, WhatsApp, Tinder, etc.).
   • "story": se a imagem for uma foto de uma pessoa, selfie, espelho, paisagem, comida ou post (sem balões de bate-papo).

2. Verifique a visibilidade ("legivel"):
   • Se a imagem estiver tão borrada, escura ou cortada que seja impossível ler o texto da conversa ou enxergar a foto com segurança, defina "legivel": false e explique em "motivo_ilegivel" e "recomendacao". Caso contrário, defina "legivel": true.

3. Se for "chat" (conversa):
   • Leia palavra por palavra cada balão de mensagem de cima para baixo.
   • Balões alinhados à ESQUERDA (ou com rótulo "Ela:") foram enviados por ELA.
   • Balões alinhados à DIREITA foram enviados por ELE.
   • Preencha "mensagens_transcritas" com todas as mensagens na ordem exata e "ultima_mensagem_dela" com a última frase exata que ela escreveu.

4. Se for "story" (foto):
   • Descreva em "cena_da_foto" apenas o que está claramente visível (postura dela, expressão, ambiente geral como escada, quarto/espelho, praia, restaurante, academia, ao ar livre). Se a foto for de longe, descreva apenas a postura e a paisagem geral, sem adivinhar micro-detalhes. Nunca mencione a palavra elevador em selfies de espelho.
   • Se houver legenda escrita sobre a foto do Story, copie-a em "legenda_do_story".

Responda EXCLUSIVAMENTE em JSON puro:
{
  "tipo": "chat ou story",
  "legivel": true,
  "motivo_ilegivel": "",
  "recomendacao": "",
  "mensagens_transcritas": [],
  "ultima_mensagem_dela": "",
  "cena_da_foto": "",
  "legenda_do_story": ""
}
PROMPT;

    $ocrUser = "Analise a imagem com precisão óptica. Se for conversa ('chat'), transcreva todas as mensagens palavra por palavra. Se for foto ('story'), descreva a cena factual e eventual legenda. Retorne JSON puro.";
    return callOpenRouter($ocrSystem, $ocrUser, $image, 0.1, 900, ['google/gemini-2.5-flash', 'openai/gpt-4o']);
}

function runPhotoStoryMasterAI(array $ocrData, string $phase): array {
    $cenaFoto = trim((string)($ocrData['cena_da_foto'] ?? 'Foto postada no Story/Perfil'));
    $legendaStory = trim((string)($ocrData['legenda_do_story'] ?? ''));

    $phaseInstruction = ($phase !== 'auto' && $phase !== '')
        ? "O aluno selecionou a fase '{$phase}'. Calibre as 3 respostas para essa fase."
        : "Use 'invasao' (Fase I: A Abordagem Magnética) como padrão para fotos/stories.";

    $photoSystem = <<<PROMPT
Você é "O Mestre da Sedução", especialista exclusivamente em ABORDAGEM DE FOTOS, STORIES E PERFIS da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Você receberá a descrição visual exata da foto/story que a mulher postou e deverá criar 3 primeiras abordagens magnéticas, originais e autênticas para puxar assunto com alto valor.

═══════════════════════════════════════════════════════════════════════
DIRETRIZES EXCLUSIVAS DO MOTOR DE FOTOS & STORIES:
═══════════════════════════════════════════════════════════════════════
1. FOCO NA CENA REAL E NA POSTURA:
   • Baseie-se estritamente na cena descrita e na legenda do story (se houver).
   • Não invente objetos que não estejam na descrição. Foque na energia do momento, na postura, no estilo ou na atitude dela.

2. AS 3 SKILLS MESTRES DE ABORDAGEM EM FOTOS:
   • Moldura de Alto Valor: Proibido fazer elogios genéricos de "linda", "maravilhosa" ou "princesa". Comente a atitude, o estilo ou a vibe do momento.
   • Loop de Curiosidade: Crie uma observação intrigante ou provocação leve que faça ela querer responder na hora.
   • Tom Limpo e Natural: Frases curtas (1 a 2 linhas), em português brasileiro natural de Instagram Direct.

3. FASE:
   • {$phaseInstruction}

Responda EXCLUSIVAMENTE em JSON puro:
{
  "intel": {
    "detected_platform": "instagram",
    "detected_submode": "story",
    "detected_phase_key": "invasao",
    "phase": "Fase I: A Abordagem Magnética",
    "diagnosis": "Diagnóstico comportamental (2 a 3 frases): a psicologia dela ao postar essa foto e a postura ideal para o homem se destacar.",
    "termometro": "Clima da foto (ex: Descontraído, Validação Sutil, Espontâneo, Provocativo)",
    "gancho": "O elemento principal observado na foto (ex: 'A postura confiante no registro', 'A vibe espontânea ao ar livre')"
  },
  "options": [
    { "badge": "A Provocação do Elemento", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Loop de Curiosidade", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Charme Descarado", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." }
  ]
}
PROMPT;

    $photoUser = "CENA OBSERVADA NA FOTO:\n\"{$cenaFoto}\"\n";
    if ($legendaStory !== '') {
        $photoUser .= "LEGENDA ESCRITA NO STORY:\n\"{$legendaStory}\"\n";
    }
    $photoUser .= "\nGere o JSON com o diagnóstico comportamental e as 3 abordagens magnéticas.";
    return callOpenRouter($photoSystem, $photoUser, null, 0.5, 1300);
}

function runChatConversationMasterAI(array $ocrData, string $phase): array {
    $messagesList = $ocrData['mensagens_transcritas'] ?? [];
    $lastHerMsg = trim((string)($ocrData['ultima_mensagem_dela'] ?? ''));
    $transcriptText = is_array($messagesList) && !empty($messagesList)
        ? implode("\n", $messagesList)
        : $lastHerMsg;

    $phaseInstruction = ($phase !== 'auto' && $phase !== '')
        ? "O aluno selecionou especificamente a fase '{$phase}'. Calibre as 3 respostas para cumprir o objetivo dessa fase, mantendo 100% de conexão com o texto da conversa."
        : "Classifique a fase ideal da conversa ('conducao' para Fase II: A Condução & Tensão, 'extracao' para Fase III: A Transição pro WhatsApp, ou 'fechamento' para Fase IV: O Convite a Dois).";

    $chatSystem = <<<PROMPT
Você é "O Mestre da Sedução", especialista exclusivamente em RESPONDER CONVERSAS DE DM E WHATSAPP da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Você receberá a transcrição exata das mensagens lidas do print da conversa do aluno com a mulher.

═══════════════════════════════════════════════════════════════════════
DIRETRIZES EXCLUSIVAS DO MOTOR DE CONVERSAS (TEXTO DE MENSAGENS):
═══════════════════════════════════════════════════════════════════════
1. FIDELIDADE 100% AO TEXTO DA CONVERSA:
   • Responda DIRETAMENTE ao que está escrito nas mensagens abaixo, especialmente à última mensagem enviada por ELA!
   • É PROIBIDO inventar elementos visuais ou assuntos fora do texto (jamais fale de cabelo, roupa, foto ou coisas que não estejam escritas nas mensagens).
   • Se ela perguntou algo ou puxou um tema específico (ex: "eclipse", "bobo", "trabalho", "fim de semana", etc.), as 3 respostas DEVEM continuar exatamente esse tema com inteligência, humor e tensão positiva!

2. AS 3 SKILLS MESTRES NA CONVERSA:
   • Moldura de Alto Valor: Mantenha postura confiante, divertida e desafiadora, sem parecer carente ou ansioso.
   • Loop de Curiosidade: Deixe um gancho na resposta para manter a conversa viva e envolvente.
   • Tom Limpo e Natural: Frases curtas (1 a 2 linhas), prontas para copiar e colar no Direct/WhatsApp.

3. FASE DA CONVERSA:
   • {$phaseInstruction}

Responda EXCLUSIVAMENTE em JSON puro:
{
  "intel": {
    "detected_platform": "instagram",
    "detected_submode": "chat",
    "detected_phase_key": "conducao",
    "phase": "Fase II: A Condução & Tensão",
    "diagnosis": "Diagnóstico tático da conversa (2 a 3 frases): o nível de interesse dela pelo que ela respondeu e como conduzir agora.",
    "termometro": "Clima atual da conversa (ex: Receptiva e Curiosa, Entrou na Brincadeira, Teste de Frame, Pronta pro Avanço)",
    "gancho": "O ponto exato da mensagem dela que está sendo respondido"
  },
  "options": [
    { "badge": "A Provocação do Elemento", "text": "Resposta 1 direta ao que ela disse...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Loop de Curiosidade", "text": "Resposta 2 direta ao que ela disse...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Charme Descarado", "text": "Resposta 3 direta ao que ela disse...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." }
  ]
}
PROMPT;

    $chatUser = "MENSAGENS LIDAS DO PRINT DA CONVERSA:\n{$transcriptText}\n\nÚLTIMA MENSAGEM DELA:\n\"{$lastHerMsg}\"\n\nGere o JSON com o diagnóstico e as 3 respostas diretas para responder a essa conversa.";
    return callOpenRouter($chatSystem, $chatUser, null, 0.5, 1300);
}

if ($action === 'auth-session') {
    $token = extractRequestToken($body);
    $member = verifyMemberToken($token);
    if ($member === null) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'authenticated' => false,
            'error' => 'Sessão inválida ou expirada.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'token' => $token,
        'member' => sanitizeMemberPublic($member)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'auth-login') {
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = trim((string)($body['password'] ?? ''));

    if ($email === '' || $password === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Preencha seu e-mail e sua senha.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $members = loadMembersDb();
    if (!isset($members[$email])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'E-mail não encontrado como assinante. Se você acabou de comprar na Kiwify, toque em "Primeiro acesso após compra".'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $member = $members[$email];
    if (!isMemberStatusActive($member)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Sua assinatura consta como inativa ou reembolsada. Regularize seu acesso para entrar.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $storedHash = (string)($member['password_hash'] ?? '');
    if ($storedHash === '') {
        // Primeiro acesso: se o membro já está aprovado na Kiwify e ainda não tinha senha, registra a senha digitada e libera na hora!
        if (strlen($password) < 4) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Crie uma senha com pelo menos 4 caracteres.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $members[$email]['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        $members[$email]['status'] = 'ativa';
        $members[$email]['updated_at'] = gmdate('c');
        saveMembersDb($members);
        $member = $members[$email];
    } else {
        if (!password_verify($password, $storedHash)) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Senha incorreta. Verifique e tente novamente.'], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $token = generateMemberToken($email);
    echo json_encode([
        'success' => true,
        'token' => $token,
        'member' => sanitizeMemberPublic($member)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'auth-activate') {
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $password = trim((string)($body['password'] ?? ''));

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Digite um e-mail válido usado na compra da Kiwify.'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    if (strlen($password) < 4) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Crie uma senha com pelo menos 4 caracteres.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $members = loadMembersDb();
    if (!isset($members[$email])) {
        // Webhook da Kiwify ainda não chegou ou e-mail aguardando compensação Pix
        echo json_encode([
            'success' => false,
            'pending_webhook' => true,
            'message' => 'Confirmando seu pagamento na Kiwify...'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $member = $members[$email];
    if (!isMemberStatusActive($member)) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'Esta assinatura consta como cancelada ou reembolsada na Kiwify.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $storedHash = (string)($member['password_hash'] ?? '');
    if ($storedHash !== '' && !password_verify($password, $storedHash)) {
        http_response_code(409);
        echo json_encode([
            'success' => false,
            'already_activated' => true,
            'error' => 'Este e-mail já possui senha cadastrada. Volte para a tela de Login e entre com sua senha.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($storedHash === '') {
        $members[$email]['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
        $members[$email]['status'] = 'ativa';
        $members[$email]['updated_at'] = gmdate('c');
        saveMembersDb($members);
        $member = $members[$email];
    }

    $token = generateMemberToken($email);
    echo json_encode([
        'success' => true,
        'activated' => true,
        'token' => $token,
        'member' => sanitizeMemberPublic($member)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'scan') {
    requireActiveMemberSession($body);
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

    // ETAPA 1: IA Leitora Óptica & Classificadora (Separa Foto vs Conversa e faz OCR puro)
    $ocrResult = runVisualReaderOCR($image);
    if (!$ocrResult['success']) {
        http_response_code(500);
        echo json_encode($ocrResult, JSON_UNESCAPED_UNICODE);
        exit;
    }

    $ocrData = $ocrResult['data'];

    // Verifica se a imagem está ilegível/borrada
    if (isset($ocrData['legivel']) && $ocrData['legivel'] === false) {
        echo json_encode([
            'success' => false,
            'is_unreadable_image' => true,
            'reason' => !empty($ocrData['motivo_ilegivel']) ? $ocrData['motivo_ilegivel'] : 'Não foi possível ler com nitidez o texto ou os detalhes desta imagem.',
            'recommendation' => !empty($ocrData['recomendacao']) ? $ocrData['recomendacao'] : 'Deixe a conversa ou foto bem visível e nítida na tela, segure a imagem e tire um novo print.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $detectedType = strtolower(trim((string)($ocrData['tipo'] ?? $submode)));
    $hasChatMessages = !empty($ocrData['mensagens_transcritas']) && is_array($ocrData['mensagens_transcritas']) && count($ocrData['mensagens_transcritas']) > 0;

    // ETAPA 2: Roteamento para a IA Especialista correspondente (100% separadas!)
    if ($detectedType === 'chat' && $hasChatMessages) {
        // Aciona IA #2: Especialista Exclusiva em Responder Conversas (opera sobre o texto puro já transcrito!)
        $result = runChatConversationMasterAI($ocrData, $phase);
        if ($result['success']) {
            $result['data']['ocr_debug'] = $ocrData;
        }
    } else {
        // Aciona IA #1: Especialista Exclusiva em Fotos & Stories (opera sobre a cena extraída sem regras de chat!)
        $result = runPhotoStoryMasterAI($ocrData, $phase);
        if ($result['success']) {
            $result['data']['ocr_debug'] = $ocrData;
        }
    }

    if (!$result['success']) {
        http_response_code(500);
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'coach') {
    requireActiveMemberSession($body);
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
Aplique as 3 Skills Mestres de Relacionamento (Moldura de Alto Valor, Loop de Curiosidade e Linguagem Limpa sem Bajulação) para orientar o aluno:
Analise o relato do aluno e entregue:
1. "diagnosis": Análise comportamental direta (2 a 3 frases) revelando a psicologia dela nessa situação e o que ela está realmente testando no homem.
2. "script": Frase exata, curta (1 a 2 linhas), inteligente e magnética para copiar e enviar agora mesmo.
3. "actionGuide": Orientação tática de postura mental, tempo ideal de espera antes de mandar e o próximo movimento.
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
    requireActiveMemberSession($body);
    $timeWindow = $body['timeWindow'] ?? '3dias';
    $topic = $body['topic'] ?? '';

    $systemPrompt = <<<PROMPT
Você é "O Mestre da Sedução" operando "O Desfibrilador" da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Crie 3 mensagens irresistíveis, leves e autênticas em português brasileiro para reativar uma conversa parada há {$timeWindow}, aplicando as Skills de Curiosidade e Moldura de Alto Valor (sem demonstrar carência, sem cobrar resposta, com humor sagaz). Assunto anterior: "{$topic}".
Responda EXCLUSIVAMENTE em JSON puro:
{
  "options": [
    { "badge": "Lembrança Espontânea", "rate": "95% de Resposta", "text": "...", "reason": "💡 Por que funciona e o que desperta nela." },
    { "badge": "Gatilho de Curiosidade", "rate": "91% de Resposta", "text": "...", "reason": "💡 Por que funciona e o que desperta nela." },
    { "badge": "Desqualificação com Humor", "rate": "88% de Resposta", "text": "...", "reason": "💡 Por que funciona e o que desperta nela." }
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
    requireActiveMemberSession($body);
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
Você é "O Mestre da Sedução" operando "A Rota de Fuga da Friendzone" da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Crie uma resposta curta, espirituosa, confiante e com charme provocativo que quebre instantaneamente a moldura de "amigo bonzinho", restabelecendo tensão e valor masculino sem ser agressivo.
Responda EXCLUSIVAMENTE em JSON puro:
{
  "script": "A resposta pronta, magnética e afiada para copiar e enviar.",
  "reason": "Explicação tática de por que essa resposta inverte o controle da dinâmica."
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

    $members = loadMembersDb();

    $approvedEvents = ['paid', 'approved', 'order_approved', 'subscription_renewed'];
    $revokedEvents = ['refunded', 'chargedback', 'chargeback', 'canceled', 'subscription_canceled', 'subscription_late', 'late', 'order_refunded', 'order_chargedback'];

    if ($customerEmail !== '' && in_array($status, $approvedEvents, true)) {
        $existing = $members[$customerEmail] ?? ['modules' => [], 'credits_added' => 0, 'password_hash' => ''];
        $modules = is_array($existing['modules'] ?? null) ? $existing['modules'] : [];
        $creditsAdded = (int)($existing['credits_added'] ?? 0);
        $existingPasswordHash = (string)($existing['password_hash'] ?? '');

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
        } else {
            // Compra do plano principal Mensal
            $creditsAdded += 10;
        }

        $planType = (strpos($combinedTitle, 'anual') !== false || strpos($combinedTitle, 'vital') !== false)
            ? 'anual'
            : ((strpos($combinedTitle, 'trimestral') !== false) ? 'trimestral' : 'mensal');

        $members[$customerEmail] = [
            'name' => $customerName,
            'email' => $customerEmail,
            'plan' => $planType,
            'product' => trim($combinedTitle),
            'modules' => array_values(array_unique($modules)),
            'credits_added' => $creditsAdded,
            'status' => 'ativa',
            'password_hash' => $existingPasswordHash,
            'updated_at' => gmdate('c')
        ];
        saveMembersDb($members);
    } elseif ($customerEmail !== '' && in_array($status, $revokedEvents, true)) {
        // Reembolso, chargeback ou cancelamento: revoga acesso imediatamente
        $existingPasswordHash = (string)($members[$customerEmail]['password_hash'] ?? '');
        $members[$customerEmail] = [
            'name' => $customerName,
            'email' => $customerEmail,
            'plan' => 'revoked',
            'product' => trim($combinedTitle),
            'modules' => [],
            'credits_added' => 0,
            'status' => 'revoked',
            'revoked_reason' => $status,
            'password_hash' => $existingPasswordHash,
            'updated_at' => gmdate('c')
        ];
        saveMembersDb($members);
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
    $members = loadMembersDb();

    if ($email !== '' && isset($members[$email])) {
        $memberData = $members[$email];
        $isActive = isMemberStatusActive($memberData);
        echo json_encode([
            'success' => true,
            'vip' => $isActive,
            'revoked' => !$isActive,
            'member' => $isActive ? sanitizeMemberPublic($memberData) : null
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode(['success' => true, 'vip' => false]);
    exit;
}

http_response_code(400);
echo json_encode(['success' => false, 'error' => 'Ação inválida']);
