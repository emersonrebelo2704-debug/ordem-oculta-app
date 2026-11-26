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
                'creditos_plano' => 999,
                'creditos_avulsos' => 0,
                'credits_added' => 999,
                'status' => 'ativa',
                'password_hash' => null,
                'processed_orders' => [],
                'updated_at' => gmdate('c')
            ];
            $changed = true;
        } elseif (!isset($members[$ownerEmail]['creditos_plano'])) {
            $members[$ownerEmail]['creditos_plano'] = (int)($members[$ownerEmail]['credits_added'] ?? 999);
            $members[$ownerEmail]['creditos_avulsos'] = (int)($members[$ownerEmail]['creditos_avulsos'] ?? 0);
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

define('DEMO_SCAN_COOLDOWN_SECONDS', 1800); // 30 minutos para liberar o 2º Scan no modo Demo
define('GOOGLE_OAUTH_CLIENT_ID', '24987514921-tvlgolv7ommioi52qhobg693bpgq10dc.apps.googleusercontent.com');

function isDemoMember(array $member): bool {
    $st = strtolower(trim((string)($member['status'] ?? '')));
    $pl = strtolower(trim((string)($member['plan'] ?? '')));
    return $st === 'demo' || $pl === 'demo';
}

function isPaidMemberActive(array $member): bool {
    if (isDemoMember($member)) {
        return false;
    }
    $st = strtolower(trim((string)($member['status'] ?? '')));
    return in_array($st, ['ativa', 'active', 'paid', 'approved'], true);
}

function isMemberStatusActive(array $member): bool {
    return isPaidMemberActive($member) || isDemoMember($member);
}

function getMemberRank(array $member): string {
    if (isDemoMember($member)) {
        return 'Iniciado da Ordem';
    }
    $plan = strtolower(trim((string)($member['plan'] ?? 'mensal')));
    if ($plan === 'anual') {
        return 'Mestre da Ordem';
    }
    if ($plan === 'trimestral') {
        return 'Membro Conselheiro';
    }
    return 'Membro Guardião';
}

function getDemoQuotas(array $member): array {
    $dq = is_array($member['demo_quotas'] ?? null) ? $member['demo_quotas'] : [];
    $scanUsed = max(0, (int)($dq['scan_used'] ?? 0));
    $firstScanAt = !empty($dq['first_scan_at']) ? (int)$dq['first_scan_at'] : null;
    $coachUsed = max(0, (int)($dq['coach_used'] ?? 0));
    $desfUsed = max(0, (int)($dq['desfibrilador_used'] ?? 0));
    $fzUsed = max(0, (int)($dq['friendzone_used'] ?? 0));

    $scanLimit = 2;
    $coachLimit = 1;
    $desfLimit = 1;
    $fzLimit = 1;

    $scanRem = max(0, $scanLimit - $scanUsed);
    $coachRem = max(0, $coachLimit - $coachUsed);
    $desfRem = max(0, $desfLimit - $desfUsed);
    $fzRem = max(0, $fzLimit - $fzUsed);

    $now = time();
    $nextScanUnlockAt = null;
    $scanCooldownSeconds = 0;
    if ($scanUsed === 1 && $firstScanAt !== null) {
        $nextScanUnlockAt = $firstScanAt + DEMO_SCAN_COOLDOWN_SECONDS;
        $scanCooldownSeconds = max(0, $nextScanUnlockAt - $now);
    }

    return [
        'scan_limit' => $scanLimit,
        'scan_used' => $scanUsed,
        'scan_remaining' => $scanRem,
        'first_scan_at' => $firstScanAt,
        'next_scan_unlock_at' => $nextScanUnlockAt,
        'scan_cooldown_seconds' => $scanCooldownSeconds,
        'coach_limit' => $coachLimit,
        'coach_used' => $coachUsed,
        'coach_remaining' => $coachRem,
        'desfibrilador_limit' => $desfLimit,
        'desfibrilador_used' => $desfUsed,
        'desfibrilador_remaining' => $desfRem,
        'friendzone_limit' => $fzLimit,
        'friendzone_used' => $fzUsed,
        'friendzone_remaining' => $fzRem,
        'total_remaining' => $scanRem + $coachRem + $desfRem + $fzRem
    ];
}

function checkDemoToolAccess(array $member, string $tool): void {
    if (!isDemoMember($member)) {
        return;
    }
    $cleanEmail = strtolower(trim((string)($member['email'] ?? '')));
    $members = loadMembersDb();
    $fresh = $members[$cleanEmail] ?? $member;
    if (!isDemoMember($fresh)) {
        return;
    }

    $q = getDemoQuotas($fresh);

    if ($tool === 'scan') {
        if ($q['scan_used'] >= $q['scan_limit']) {
            http_response_code(402);
            echo json_encode([
                'success' => false,
                'no_credits' => true,
                'is_demo' => true,
                'tool_locked' => 'scan',
                'demo_quotas' => $q,
                'credits' => ['creditos_plano' => $q['total_remaining'], 'creditos_avulsos' => 0, 'total' => $q['total_remaining']],
                'error' => 'Você concluiu seus 2 Scans gratuitos no Oráculo. Escolha seu plano oficial abaixo para liberar Scans de Prints ILIMITADOS agora mesmo.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        if ($q['scan_used'] === 1 && $q['scan_cooldown_seconds'] > 0) {
            http_response_code(429);
            $mins = (int)ceil($q['scan_cooldown_seconds'] / 60);
            echo json_encode([
                'success' => false,
                'scan_cooldown' => true,
                'is_demo' => true,
                'remaining_seconds' => $q['scan_cooldown_seconds'],
                'unlock_at' => $q['next_scan_unlock_at'],
                'demo_quotas' => $q,
                'error' => "Seu 2º Scan Gratuito libera em {$mins} min para você escanear a resposta dela — ou desbloqueie o Oráculo ILIMITADO agora!"
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        return;
    }

    $toolMessages = [
        'coach' => [
            'used' => $q['coach_used'],
            'limit' => $q['coach_limit'],
            'msg' => 'Você concluiu sua consulta gratuita ao Mestre da Sedução. Escolha seu plano oficial abaixo para continuar este caso sem interrupções.'
        ],
        'desfibrilador' => [
            'used' => $q['desfibrilador_used'],
            'limit' => $q['desfibrilador_limit'],
            'msg' => 'Você concluiu seu teste gratuito no Desfibrilador. Escolha seu plano oficial abaixo para gerar gatilhos anti-vácuo ilimitados.'
        ],
        'friendzone' => [
            'used' => $q['friendzone_used'],
            'limit' => $q['friendzone_limit'],
            'msg' => 'Você concluiu seu teste gratuito na Rota de Fuga. Escolha seu plano oficial abaixo para continuar desarmando os testes dela.'
        ]
    ];

    if (isset($toolMessages[$tool]) && $toolMessages[$tool]['used'] >= $toolMessages[$tool]['limit']) {
        http_response_code(402);
        echo json_encode([
            'success' => false,
            'no_credits' => true,
            'is_demo' => true,
            'tool_locked' => $tool,
            'demo_quotas' => $q,
            'credits' => ['creditos_plano' => $q['total_remaining'], 'creditos_avulsos' => 0, 'total' => $q['total_remaining']],
            'error' => $toolMessages[$tool]['msg']
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

function recordDemoToolUse(string $email, string $tool): array {
    $cleanEmail = strtolower(trim($email));
    $members = loadMembersDb();
    if (!isset($members[$cleanEmail])) {
        return [];
    }
    $dq = is_array($members[$cleanEmail]['demo_quotas'] ?? null) ? $members[$cleanEmail]['demo_quotas'] : [];
    if ($tool === 'scan') {
        $prev = max(0, (int)($dq['scan_used'] ?? 0));
        $dq['scan_used'] = $prev + 1;
        if ($prev === 0 || empty($dq['first_scan_at'])) {
            $dq['first_scan_at'] = time();
        } else {
            $dq['second_scan_at'] = time();
        }
    } else {
        $key = $tool . '_used';
        $dq[$key] = max(0, (int)($dq[$key] ?? 0)) + 1;
    }

    $members[$cleanEmail]['demo_quotas'] = $dq;
    $q = getDemoQuotas($members[$cleanEmail]);
    $members[$cleanEmail]['creditos_plano'] = $q['total_remaining'];
    $members[$cleanEmail]['credits_added'] = $q['total_remaining'];
    $members[$cleanEmail]['updated_at'] = gmdate('c');
    saveMembersDb($members);

    return $q;
}

function getMemberPlanCredits(array $member): int {
    if (isDemoMember($member)) {
        return getDemoQuotas($member)['total_remaining'];
    }
    if (isset($member['creditos_plano'])) {
        return max(0, (int)$member['creditos_plano']);
    }
    return max(0, (int)($member['credits_added'] ?? 10));
}

function getMemberExtraCredits(array $member): int {
    if (isDemoMember($member)) {
        return 0;
    }
    return max(0, (int)($member['creditos_avulsos'] ?? 0));
}

function getMemberTotalCredits(array $member): int {
    return getMemberPlanCredits($member) + getMemberExtraCredits($member);
}

/**
 * Desconta 1 crédito do membro assinante ativo:
 * - Primeiro desconta de creditos_plano
 * - Só desconta de creditos_avulsos quando creditos_plano === 0
 */
function consumeMemberCredit(string $email): array {
    $cleanEmail = strtolower(trim($email));
    $members = loadMembersDb();
    if (!isset($members[$cleanEmail]) || !isPaidMemberActive($members[$cleanEmail])) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'auth_required' => true,
            'error' => 'Sua assinatura precisa estar ativa para utilizar seus créditos.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $member = $members[$cleanEmail];
    $planCr = getMemberPlanCredits($member);
    $extraCr = getMemberExtraCredits($member);

    if (($planCr + $extraCr) <= 0) {
        http_response_code(402);
        echo json_encode([
            'success' => false,
            'no_credits' => true,
            'is_demo' => false,
            'credits' => [
                'creditos_plano' => 0,
                'creditos_avulsos' => 0,
                'total' => 0
            ],
            'error' => 'Seus créditos acabaram. Recarregue créditos avulsos ou faça upgrade para continuar.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($planCr > 0) {
        $planCr--;
    } else {
        $extraCr--;
    }

    $members[$cleanEmail]['creditos_plano'] = $planCr;
    $members[$cleanEmail]['creditos_avulsos'] = $extraCr;
    $members[$cleanEmail]['credits_added'] = $planCr + $extraCr;
    $members[$cleanEmail]['updated_at'] = gmdate('c');
    saveMembersDb($members);

    return [
        'ok' => true,
        'creditos_plano' => $planCr,
        'creditos_avulsos' => $extraCr,
        'total' => $planCr + $extraCr
    ];
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

function sendPurchaseWelcomeEmail(string $toEmail, string $name, string $plan, array $modules = []): bool {
    $cleanName = !empty($name) ? htmlspecialchars($name, ENT_QUOTES, 'UTF-8') : 'Membro';
    $accessLink = "https://pontoideal.online/app/?acesso=1&email=" . urlencode($toEmail);
    
    $modulesHtml = '';
    if (in_array('perfil-magnetico', $modules, true)) {
        $modulesHtml .= '<li style="margin-bottom:6px; color:#d1d5db;">📘 <strong>Livro:</strong> Como Criar um Perfil Magnético (Liberado no Arsenal)</li>';
    }
    if (in_array('mente-feminina', $modules, true)) {
        $modulesHtml .= '<li style="margin-bottom:6px; color:#d1d5db;">🧠 <strong>Livro:</strong> A Mente Feminina Decodificada (Liberado no Arsenal)</li>';
    }
    if (in_array('formula-seducao', $modules, true)) {
        $modulesHtml .= '<li style="margin-bottom:6px; color:#d1d5db;">🎬 <strong>Curso:</strong> A Fórmula Secreta da Sedução (Liberado na Kiwify)</li>';
    }

    $modulesSection = '';
    if (!empty($modulesHtml)) {
        $modulesSection = <<<HTML
        <div style="background:#14141c; border:1px solid rgba(212,175,55,0.25); border-radius:12px; padding:16px; margin:20px 0; text-align:left;">
            <div style="color:#d4af37; font-weight:800; font-size:12px; letter-spacing:1px; margin-bottom:10px; text-transform:uppercase;">Bônus e Materiais Inclusos:</div>
            <ul style="margin:0; padding-left:18px; font-size:13px; line-height:1.5;">
                {$modulesHtml}
            </ul>
        </div>
HTML;
    }

    $subject = "=?UTF-8?B?" . base64_encode("[ACESSO LIBERADO] ⚡ Seu acesso à Ordem Oculta chegou!") . "?=";

    $bodyHtml = <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Acesso Liberado - Ordem Oculta</title>
</head>
<body style="margin:0; padding:0; background-color:#08080a; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color:#f3f4f6;">
<table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#08080a; padding:30px 10px;">
  <tr>
    <td align="center">
      <table width="100%" max-width="580" border="0" cellspacing="0" cellpadding="0" style="max-width:580px; background:linear-gradient(180deg, #12121a 0%, #0c0c12 100%); border:1px solid rgba(212,175,55,0.35); border-radius:20px; padding:35px 25px; box-shadow:0 15px 40px rgba(0,0,0,0.85); text-align:center;">
        <tr>
          <td>
            <div style="display:inline-block; margin-bottom:15px;">
              <span style="display:inline-block; background:rgba(212,175,55,0.15); border:1px solid #d4af37; color:#d4af37; font-size:11px; font-weight:800; letter-spacing:1.5px; padding:6px 14px; border-radius:99px; text-transform:uppercase;">
                ⚡ Vaga Confirmada
              </span>
            </div>
            
            <h1 style="color:#ffffff; font-size:24px; font-weight:900; margin:0 0 14px; letter-spacing:0.3px; line-height:1.3;">
              Bem-vindo à <span style="color:#d4af37;">Ordem Oculta</span>
            </h1>
            
            <p style="color:#9ca3af; font-size:14.5px; line-height:1.6; margin:0 0 22px;">
              Olá, <strong>{$cleanName}</strong>! Seu pagamento foi aprovado com sucesso e o seu acesso oficial às ferramentas do Mestre da Sedução já está pronto para uso.
            </p>

            <div style="background:rgba(255,255,255,0.03); border:1px dashed rgba(255,255,255,0.15); border-radius:12px; padding:14px; margin:0 0 22px; text-align:left;">
              <div style="font-size:12px; color:#9ca3af; margin-bottom:4px;">Seu e-mail de acesso cadastrado:</div>
              <div style="font-size:14px; font-weight:700; color:#ffffff;">{$toEmail}</div>
            </div>

            {$modulesSection}

            <div style="margin:28px 0 24px;">
              <a href="{$accessLink}" target="_blank" style="display:inline-block; width:88%; max-width:380px; background:linear-gradient(135deg, #d4af37 0%, #aa8210 100%); color:#08080a; font-size:15px; font-weight:900; text-transform:uppercase; letter-spacing:0.5px; padding:16px 20px; border-radius:12px; text-decoration:none; box-shadow:0 6px 25px rgba(212,175,55,0.35);">
                Entrar no Aplicativo Agora &rarr;
              </a>
            </div>

            <p style="color:#6b7280; font-size:12px; line-height:1.5; margin:0 0 25px;">
              💡 <strong>Dica importante:</strong> Salve este e-mail nos seus favoritos para nunca perder o link de entrada. Você também pode fixar o aplicativo na tela inicial do seu celular.
            </p>

            <div style="border-top:1px solid rgba(255,255,255,0.08); padding-top:20px; font-size:11.5px; color:#6b7280; line-height:1.5;">
              Precisa de ajuda com seu acesso? Fale com nosso suporte oficial:<br>
              <a href="mailto:assistente@pontoideal.online" style="color:#d4af37; text-decoration:none; font-weight:700;">assistente@pontoideal.online</a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
HTML;

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        'From: Ordem Oculta <assistente@pontoideal.online>',
        'Reply-To: assistente@pontoideal.online',
        'X-Mailer: PHP/' . phpversion()
    ];

    return @mail($toEmail, $subject, $bodyHtml, implode("\r\n", $headers));
}

function sanitizeMemberPublic(array $member): array {
    $isDemo = isDemoMember($member);
    $demoQuotas = $isDemo ? getDemoQuotas($member) : null;
    $planCr = $isDemo ? $demoQuotas['total_remaining'] : getMemberPlanCredits($member);
    $extraCr = $isDemo ? 0 : getMemberExtraCredits($member);
    $totalCr = $planCr + $extraCr;
    return [
        'name' => $member['name'] ?? ($isDemo ? 'Iniciado da Ordem' : 'Membro da Ordem'),
        'email' => $member['email'] ?? '',
        'plan' => $member['plan'] ?? ($isDemo ? 'demo' : 'mensal'),
        'rank' => getMemberRank($member),
        'is_demo' => $isDemo,
        'demo_quotas' => $demoQuotas,
        'modules' => $member['modules'] ?? [],
        'creditos_plano' => $planCr,
        'creditos_avulsos' => $extraCr,
        'total_credits' => $totalCr,
        'credits_added' => $totalCr,
        'status' => isMemberStatusActive($member) ? ($isDemo ? 'demo' : 'ativa') : ($member['status'] ?? 'inativa'),
        'subscription_expires_at' => $member['subscription_expires_at'] ?? null,
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
        ? "O membro da Ordem selecionou a fase '{$phase}'. Calibre as 3 respostas para essa fase."
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
        ? "O membro da Ordem selecionou especificamente a fase '{$phase}'. Calibre as 3 respostas para cumprir o objetivo dessa fase, mantendo 100% de conexão com o texto da conversa."
        : "Classifique a fase ideal da conversa ('conducao' para Fase II: A Condução & Tensão, 'extracao' para Fase III: A Transição pro WhatsApp, ou 'fechamento' para Fase IV: O Convite a Dois).";

    $chatSystem = <<<PROMPT
Você é "O Mestre da Sedução", especialista exclusivamente em RESPONDER CONVERSAS DE DM E WHATSAPP da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Você receberá a transcrição exata das mensagens lidas do print da conversa do membro da Ordem com a mulher.

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
            'error' => 'E-mail não encontrado. Use a aba "Teste Grátis" para iniciar sua degustação ou "Primeiro Acesso" se acabou de comprar.'
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
        // Blindagem crítica: conta Demo criada via Google não pode ganhar status 'ativa' nem ter senha definida sem Google
        if (isDemoMember($member)) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Esta conta está no modo Teste Grátis. Volte na aba "Teste Grátis" e entre só com seu e-mail (ou Google) em 1 clique.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
        // Primeiro acesso de membro PAGO aprovado na Kiwify que ainda não tinha senha
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
        'is_demo' => isDemoMember($member),
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
    // Se não existe OU se ainda está como 'demo' (acabou de pagar no Pix/Cartão e aguarda o webhook da Kiwify promover para 'ativa')
    if (!isset($members[$email]) || isDemoMember($members[$email])) {
        echo json_encode([
            'success' => false,
            'pending_webhook' => true,
            'message' => 'Confirmando seu pagamento na Kiwify...'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $member = $members[$email];
    if (!isPaidMemberActive($member)) {
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
            'error' => 'Este e-mail já possui senha cadastrada. Volte para a aba "Entrar" e acesse com sua senha (ou com o Google).'
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

if ($action === 'auth-register-demo') {
    $email = strtolower(trim((string)($body['email'] ?? '')));
    $name = trim((string)($body['name'] ?? ''));
    $password = trim((string)($body['password'] ?? ''));

    if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Digite um e-mail válido para iniciar seu teste gratuito.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $members = loadMembersDb();

    if (isset($members[$email])) {
        $existing = $members[$email];
        if (isPaidMemberActive($existing)) {
            http_response_code(409);
            echo json_encode([
                'success' => false,
                'is_paid_member' => true,
                'error' => 'Este e-mail já é um Membro Oficial da Ordem Oculta! Redirecionando para o Login...'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!isDemoMember($existing)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Esta conta consta como inativa. Escolha um plano oficial para ativar seu acesso.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        // Já existia como conta demo: retoma sem resetar cotas nem o cronômetro de 30 min
        $storedHash = (string)($existing['password_hash'] ?? '');
        if ($password !== '' && $storedHash !== '' && !password_verify($password, $storedHash)) {
            http_response_code(401);
            echo json_encode([
                'success' => false,
                'error' => 'Este e-mail já possui cadastro de Iniciação. Digite a mesma senha criada anteriormente (ou entre com o Google).'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $token = generateMemberToken($email);
        echo json_encode([
            'success' => true,
            'is_demo' => true,
            'token' => $token,
            'member' => sanitizeMemberPublic($members[$email])
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Novo cadastro Demo (1 teste em cada uma das 4 ferramentas + 2º Scan liberado após 30 min = 5 testes totais)
    $passwordHash = ($password !== '' && strlen($password) >= 4) ? password_hash($password, PASSWORD_DEFAULT) : '';
    $newMember = [
        'name' => $name !== '' ? $name : 'Iniciado da Ordem',
        'email' => $email,
        'status' => 'demo',
        'plan' => 'demo',
        'demo_quotas' => [
            'scan_used' => 0,
            'first_scan_at' => null,
            'coach_used' => 0,
            'desfibrilador_used' => 0,
            'friendzone_used' => 0
        ],
        'creditos_plano' => 5,
        'creditos_avulsos' => 0,
        'credits_added' => 5,
        'password_hash' => $passwordHash,
        'created_at' => gmdate('c'),
        'updated_at' => gmdate('c'),
        'modules' => []
    ];

    $members[$email] = $newMember;
    saveMembersDb($members);

    $token = generateMemberToken($email);
    echo json_encode([
        'success' => true,
        'is_demo' => true,
        'token' => $token,
        'member' => sanitizeMemberPublic($newMember)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'auth-google') {
    $credential = trim((string)($body['credential'] ?? ''));
    if ($credential === '') {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Credencial do Google não fornecida.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Valida o token ID direto no endpoint seguro do Google
    $ch = curl_init('https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($credential));
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_SSL_VERIFYPEER => true
    ]);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || empty($res)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Falha ao autenticar com o Google. Tente novamente.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $googleUser = json_decode($res, true);
    if (!is_array($googleUser) || empty($googleUser['email'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'E-mail do Google não identificado.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Valida audiência (Client ID oficial) e e-mail verificado
    $aud = trim((string)($googleUser['aud'] ?? ''));
    $emailVerified = ($googleUser['email_verified'] ?? false);
    if ($aud !== GOOGLE_OAUTH_CLIENT_ID || ($emailVerified !== true && $emailVerified !== 'true')) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Token Google inválido para este aplicativo.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $email = strtolower(trim($googleUser['email']));
    $name = trim($googleUser['name'] ?? 'Iniciado da Ordem');
    $googleId = trim($googleUser['sub'] ?? '');

    $members = loadMembersDb();

    // Se o usuário já existe (Membro Oficial Pago ou Iniciado Demo retornando após 30 min / comprando plano)
    if (isset($members[$email])) {
        $existing = $members[$email];
        if (isPaidMemberActive($existing)) {
            if (empty($existing['google_id']) && $googleId !== '') {
                $members[$email]['google_id'] = $googleId;
                saveMembersDb($members);
                $existing = $members[$email];
            }
            $token = generateMemberToken($email);
            echo json_encode([
                'success' => true,
                'is_demo' => false,
                'token' => $token,
                'member' => sanitizeMemberPublic($existing)
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (!isDemoMember($existing)) {
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Sua assinatura consta como inativa ou reembolsada. Regularize seu acesso para entrar.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        if (empty($existing['google_id']) && $googleId !== '') {
            $members[$email]['google_id'] = $googleId;
        }
        if (!isset($existing['demo_quotas'])) {
            $members[$email]['demo_quotas'] = [
                'scan_used' => 0,
                'first_scan_at' => null,
                'coach_used' => 0,
                'desfibrilador_used' => 0,
                'friendzone_used' => 0
            ];
        }
        saveMembersDb($members);

        $token = generateMemberToken($email);
        echo json_encode([
            'success' => true,
            'is_demo' => true,
            'token' => $token,
            'member' => sanitizeMemberPublic($members[$email])
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Novo cadastro Demo via Google (1 clique -> 2 Scans c/ 30min + 1 teste nas 4 ferramentas)
    $newMember = [
        'name' => $name !== '' ? $name : 'Iniciado da Ordem',
        'email' => $email,
        'google_id' => $googleId,
        'status' => 'demo',
        'plan' => 'demo',
        'demo_quotas' => [
            'scan_used' => 0,
            'first_scan_at' => null,
            'coach_used' => 0,
            'desfibrilador_used' => 0,
            'friendzone_used' => 0
        ],
        'creditos_plano' => 5,
        'creditos_avulsos' => 0,
        'credits_added' => 5,
        'password_hash' => '',
        'created_at' => gmdate('c'),
        'updated_at' => gmdate('c'),
        'modules' => []
    ];

    $members[$email] = $newMember;
    saveMembersDb($members);

    $token = generateMemberToken($email);
    echo json_encode([
        'success' => true,
        'is_demo' => true,
        'token' => $token,
        'member' => sanitizeMemberPublic($newMember)
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'scan') {
    $member = requireActiveMemberSession($body);
    $isDemo = isDemoMember($member);
    if ($isDemo) {
        checkDemoToolAccess($member, 'scan');
    }

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
    } else {
        if ($isDemo) {
            $q = recordDemoToolUse($member['email'], 'scan');
            $result['demo_quotas'] = $q;
            $result['credits'] = [
                'ok' => true,
                'creditos_plano' => $q['total_remaining'] ?? 0,
                'creditos_avulsos' => 0,
                'total' => $q['total_remaining'] ?? 0
            ];
        }
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'coach') {
    $member = requireActiveMemberSession($body);
    $isDemo = isDemoMember($member);
    if ($isDemo) {
        checkDemoToolAccess($member, 'coach');
    } else {
        $totalAvailable = getMemberPlanCredits($member) + getMemberExtraCredits($member);
        if ($totalAvailable <= 0) {
            http_response_code(402);
            echo json_encode([
                'success' => false,
                'no_credits' => true,
                'is_demo' => false,
                'error' => 'Seus Créditos Táticos acabaram. Faça uma recarga avulsa para continuar.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $situation = trim((string)($body['situation'] ?? ''));
    $history = is_array($body['history'] ?? null) ? $body['history'] : [];
    // Limite de Contexto: envia no máximo as últimas 8 mensagens do chat atual
    if (count($history) > 8) {
        $history = array_slice($history, -8);
    }

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
            $lines[] = "[RODADA {$round}]\n- Relato do membro: \"{$s}\"\n- Leitura do Mestre: \"{$d}\"\n- Mensagem recomendada: \"{$sc}\"";
        }
        $historyPrompt = "\nHISTÓRICO DAS RODADAS ANTERIORES (ÚLTIMAS " . count($history) . "):\n" . implode("\n", $lines) . "\n\nATUALIZAÇÃO ATUAL DO MEMBRO:\n\"{$situation}\"\n";
    }

    $systemPrompt = <<<PROMPT
Você é "O Mestre da Sedução" (Professor de Bolso 24h) da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Aplique as 3 Skills Mestres de Relacionamento (Moldura de Alto Valor, Loop de Curiosidade e Linguagem Limpa sem Bajulação) para orientar o membro da Ordem:
Analise o relato do membro e entregue:
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

    $userText = $historyPrompt ?: "RELATO DO MEMBRO:\n\"{$situation}\"";
    $result = callOpenRouter($systemPrompt, $userText, null, 0.72, 1600);
    if (!$result['success']) {
        http_response_code(500);
    } else {
        if ($isDemo) {
            $q = recordDemoToolUse($member['email'], 'coach');
            $result['demo_quotas'] = $q;
            $result['credits'] = [
                'ok' => true,
                'creditos_plano' => $q['total_remaining'] ?? 0,
                'creditos_avulsos' => 0,
                'total' => $q['total_remaining'] ?? 0
            ];
        } else {
            $creditRes = consumeMemberCredit($member['email']);
            if (!empty($creditRes['ok'])) {
                $result['credits'] = $creditRes;
            }
        }
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'desfibrilador') {
    $member = requireActiveMemberSession($body);
    $isDemo = isDemoMember($member);
    if ($isDemo) {
        checkDemoToolAccess($member, 'desfibrilador');
    }

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
    } else {
        if ($isDemo) {
            $q = recordDemoToolUse($member['email'], 'desfibrilador');
            $result['demo_quotas'] = $q;
            $result['credits'] = [
                'ok' => true,
                'creditos_plano' => $q['total_remaining'] ?? 0,
                'creditos_avulsos' => 0,
                'total' => $q['total_remaining'] ?? 0
            ];
        }
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'friendzone') {
    $member = requireActiveMemberSession($body);
    $isDemo = isDemoMember($member);
    if ($isDemo) {
        checkDemoToolAccess($member, 'friendzone');
    } else {
        $totalAvailable = getMemberPlanCredits($member) + getMemberExtraCredits($member);
        if ($totalAvailable <= 0) {
            http_response_code(402);
            echo json_encode([
                'success' => false,
                'no_credits' => true,
                'is_demo' => false,
                'error' => 'Seus Créditos Táticos acabaram. Faça uma recarga avulsa para continuar.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    $message = trim((string)($body['message'] ?? ''));
    $history = is_array($body['history'] ?? null) ? $body['history'] : [];
    // Limite de Contexto: envia no máximo as últimas 8 mensagens do chat atual
    if (count($history) > 8) {
        $history = array_slice($history, -8);
    }

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
        $historyPrompt = "\nHISTÓRICO (ÚLTIMAS " . count($history) . "):\n" . implode("\n", $lines) . "\n\nNOVA FRASE DELA:\n\"{$message}\"\n";
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
    } else {
        if ($isDemo) {
            $q = recordDemoToolUse($member['email'], 'friendzone');
            $result['demo_quotas'] = $q;
            $result['credits'] = [
                'ok' => true,
                'creditos_plano' => $q['total_remaining'] ?? 0,
                'creditos_avulsos' => 0,
                'total' => $q['total_remaining'] ?? 0
            ];
        } else {
            $creditRes = consumeMemberCredit($member['email']);
            if (!empty($creditRes['ok'])) {
                $result['credits'] = $creditRes;
            }
        }
    }
    echo json_encode($result, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'kiwify-webhook') {
    $expectedToken = getenv('KIWIFY_WEBHOOK_TOKEN') ?: 'cg95nvcn2wg';
    $receivedToken = trim((string)(
        $_GET['token']
        ?? ($_GET['signature']
        ?? ($body['token']
        ?? ($body['signature']
        ?? ($_SERVER['HTTP_X_KIWIFY_SIGNATURE'] ?? ''))))
    ));

    if ($_SERVER['REQUEST_METHOD'] === 'GET' && empty($body)) {
        echo json_encode([
            'success' => true,
            'status' => 'online',
            'token_registered' => true,
            'endpoint' => 'Webhook Oficial Ordem Oculta + Repasse VeroTrack CAPI Ativo'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($receivedToken !== $expectedToken) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'error' => 'KIWIFY_WEBHOOK_TOKEN inválido ou ausente.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $orderId = trim((string)($body['order_id'] ?? ($body['id'] ?? ($body['webhook_id'] ?? ''))));
    $status = strtolower((string)($body['order_status'] ?? ($body['status'] ?? ($body['webhook_event_type'] ?? ''))));
    $customerEmail = strtolower(trim((string)($body['Customer']['email'] ?? ($body['email'] ?? ''))));
    $customerName = trim((string)($body['Customer']['full_name'] ?? ($body['name'] ?? 'Membro Ordem Oculta')));
    $productName = strtolower(trim((string)($body['Product']['product_name'] ?? ($body['product_name'] ?? 'Ordem Oculta'))));
    $offerName = strtolower(trim((string)($body['Subscription']['plan']['name'] ?? ($body['Commissions']['product_name'] ?? ($body['offer_name'] ?? '')))));
    $offerCode = strtolower(trim((string)(
        $body['offer_code']
        ?? ($body['offer_id']
        ?? ($body['checkout_link']
        ?? ($body['Product']['offer_code']
        ?? ($body['Subscription']['plan']['id'] ?? ''))))
    )));
    $bumpsJson = strtolower(json_encode($body['OrderBumps'] ?? ($body['order_bumps'] ?? []), JSON_UNESCAPED_UNICODE));

    // Trata valores em centavos (ex: 1990) ou decimal (ex: 19.90 / "19,90")
    $rawAmount = $body['Commissions']['charge_amount'] ?? ($body['amount'] ?? ($body['total'] ?? ($body['value'] ?? 0)));
    if (is_string($rawAmount)) {
        $rawAmount = str_replace(['R$', ' ', ','], ['', '', '.'], $rawAmount);
    }
    $numericAmount = (float)$rawAmount;
    if ($numericAmount > 0 && $numericAmount < 500 && (strpos((string)$rawAmount, '.') !== false || $numericAmount <= 250)) {
        $amountCents = (int)round($numericAmount * 100);
    } else {
        $amountCents = (int)round($numericAmount);
    }

    $combinedTitle = $productName . ' ' . $offerName . ' ' . $offerCode . ' ' . $bumpsJson;
    $rawLower = strtolower((string)$rawInput);

    $members = loadMembersDb();

    $approvedEvents = ['paid', 'approved', 'order_approved', 'subscription_renewed'];
    $revokedEvents = ['refunded', 'chargedback', 'chargeback', 'canceled', 'subscription_canceled', 'subscription_late', 'late', 'order_refunded', 'order_chargedback'];

    $duplicateBlocked = false;
    $purchaseCategory = 'none';

    if ($customerEmail !== '' && in_array($status, $approvedEvents, true)) {
        $isNewMember = !isset($members[$customerEmail]);
        $existing = $members[$customerEmail] ?? [
            'modules' => [],
            'creditos_plano' => 10,
            'creditos_avulsos' => 0,
            'password_hash' => null,
            'processed_orders' => []
        ];

        $processedOrders = is_array($existing['processed_orders'] ?? null) ? $existing['processed_orders'] : [];

        // Trava de Duplicidade de order_id
        if ($orderId !== '' && in_array($orderId, $processedOrders, true)) {
            echo json_encode([
                'success' => true,
                'duplicate_blocked' => true,
                'order_id' => $orderId,
                'message' => 'Order ID já processado anteriormente. Duplicidade bloqueada.',
                'email' => $customerEmail,
                'member' => sanitizeMemberPublic($existing)
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        $wasDemo = !$isNewMember && isDemoMember($existing);
        $modules = is_array($existing['modules'] ?? null) ? $existing['modules'] : [];
        $planCredits = ($isNewMember || $wasDemo) ? 0 : getMemberPlanCredits($existing);
        $extraCredits = ($isNewMember || $wasDemo) ? 0 : getMemberExtraCredits($existing);
        $existingPasswordHash = $existing['password_hash'] ?? null;
        if ($existingPasswordHash === '') {
            $existingPasswordHash = null;
        }
        $existingGoogleId = $existing['google_id'] ?? null;
        $existingPlan = $wasDemo ? 'mensal' : (string)($existing['plan'] ?? 'mensal');
        $existingExpiresAt = $existing['subscription_expires_at'] ?? gmdate('c', time() + 30 * 86400);

        // Modules / Order Bumps (verifica tanto nos campos estruturados quanto no payload bruto)
        $bumpSearchText = $combinedTitle . ' ' . $rawLower;
        $boughtPerfil = (
            strpos($bumpSearchText, 'perfil') !== false
            || strpos($bumpSearchText, 'magnetico') !== false
            || strpos($bumpSearchText, 'magnético') !== false
            || strpos($bumpSearchText, 'huatviz') !== false
        );
        $boughtMente = (
            strpos($bumpSearchText, 'mente feminina') !== false
            || strpos($bumpSearchText, 'mente_feminina') !== false
            || strpos($bumpSearchText, 'decodificada') !== false
            || strpos($bumpSearchText, 'rvaozjy') !== false
            || strpos($combinedTitle, 'mente') !== false
        );
        $boughtFormula = (
            strpos($bumpSearchText, 'formula') !== false
            || strpos($bumpSearchText, 'fórmula') !== false
            || strpos($bumpSearchText, 'dizoxuj') !== false
        );

        if ($boughtPerfil) {
            $modules[] = 'perfil-magnetico';
        }
        if ($boughtMente) {
            $modules[] = 'mente-feminina';
        }
        if ($boughtFormula) {
            $modules[] = 'formula-seducao';
        }

        // Identificação de Pacotes Avulsos (Ordem Oculta - Consultas Avulsas) vs Módulo Individual vs Assinatura Principal
        $hasCode25 = (strpos($rawLower, 'f8sgclt') !== false);
        $hasCode15 = (strpos($rawLower, 'mbeun4x') !== false);
        $hasCode8  = (strpos($rawLower, 'jszvjnu') !== false);
        $isAvulsoKeyword = (
            strpos($productName . ' ' . $offerName, 'avuls') !== false
            || strpos($productName . ' ' . $offerName, 'recarga') !== false
            || strpos($productName . ' ' . $offerName, 'crédito') !== false
            || strpos($productName . ' ' . $offerName, 'credito') !== false
            || strpos($productName . ' ' . $offerName, 'pacote') !== false
        );
        $isModuleProductOnly = (
            ($boughtPerfil || $boughtMente || $boughtFormula)
            && strpos($productName, 'ordem oculta') === false
            && !$hasCode25 && !$hasCode15 && !$hasCode8 && !$isAvulsoKeyword
        );
        $isAvulsoAmount = (!$isModuleProductOnly && in_array($amountCents, [990, 1490, 1990], true));

        $keepDemoQuotas = null;
        if ($isModuleProductOnly) {
            // Webhook avulso apenas de um e-book / módulo do Arsenal (ou Order Bump enviado separado pela Kiwify)
            $purchaseCategory = 'modulo_arsenal';
            if ($wasDemo) {
                $planType = 'demo';
                $expiresAt = null;
                $memberStatus = 'demo';
                $keepDemoQuotas = $existing['demo_quotas'] ?? null;
                $planCredits = getDemoQuotas($existing)['total_remaining'];
            } else {
                $planType = $existingPlan;
                $expiresAt = $existingExpiresAt;
                $memberStatus = $existing['status'] ?? 'ativa';
            }
        } elseif ($hasCode25 || $hasCode15 || $hasCode8 || $isAvulsoKeyword || $isAvulsoAmount) {
            $purchaseCategory = 'pacote_avulso';
            $addedAvulsos = 0;
            if ($hasCode25 || $amountCents === 1990 || strpos($combinedTitle, '25 cr') !== false || strpos($combinedTitle, '20 cr') !== false) {
                $addedAvulsos = 25;
            } elseif ($hasCode15 || $amountCents === 1490 || strpos($combinedTitle, '15 cr') !== false) {
                $addedAvulsos = 15;
            } elseif ($hasCode8 || $amountCents === 990 || strpos($combinedTitle, '8 cr') !== false || strpos($combinedTitle, '10 cr') !== false) {
                $addedAvulsos = 8;
            } else {
                $addedAvulsos = 8;
            }

            // Soma diretamente em creditos_avulsos (ETERNOS) sem alterar creditos_plano nem vencimento da assinatura
            $extraCredits += $addedAvulsos;
            $planType = $existingPlan;
            $expiresAt = $existingExpiresAt;
            $memberStatus = 'ativa';
        } else {
            // Assinatura Principal (A Ordem Oculta) ou Renovação Mensal
            $purchaseCategory = 'assinatura_principal';
            $isAnualPlan = (
                strpos($combinedTitle, 'anual') !== false
                || strpos($combinedTitle, 'plano pro') !== false
                || strpos($combinedTitle, 'vital') !== false
                || $amountCents === 19790
            );
            $isTrimestralPlan = (
                strpos($combinedTitle, 'trimestral') !== false
                || $amountCents === 9790
            );

            if ($isAnualPlan) {
                $modules = ['perfil-magnetico', 'mente-feminina', 'formula-seducao'];
                $planCredits = 40;
                $planType = 'anual';
                $expiresAt = gmdate('c', time() + 365 * 86400);
            } elseif ($isTrimestralPlan) {
                $planCredits = 20;
                $planType = 'trimestral';
                $expiresAt = gmdate('c', time() + 90 * 86400);
            } else {
                // Plano Mensal (nova assinatura ou renovação mensal)
                $planCredits = 10;
                $planType = 'mensal';
                $expiresAt = gmdate('c', time() + 30 * 86400);
            }
            // IMPORTANTE: creditos_avulsos ($extraCredits) NUNCA é zerado nem sobrescrito na renovação!
            $memberStatus = 'ativa';
        }

        if ($orderId !== '') {
            $processedOrders[] = $orderId;
        }

        $updatedRecord = [
            'name' => $customerName,
            'email' => $customerEmail,
            'google_id' => $existingGoogleId,
            'plan' => $planType,
            'product' => trim($productName . ' ' . $offerName),
            'modules' => array_values(array_unique($modules)),
            'creditos_plano' => $planCredits,
            'creditos_avulsos' => $extraCredits,
            'credits_added' => $planCredits + $extraCredits,
            'status' => $memberStatus,
            'password_hash' => $existingPasswordHash,
            'subscription_expires_at' => $expiresAt,
            'processed_orders' => array_values(array_unique($processedOrders)),
            'updated_at' => gmdate('c')
        ];
        if ($keepDemoQuotas !== null) {
            $updatedRecord['demo_quotas'] = $keepDemoQuotas;
        }
        $members[$customerEmail] = $updatedRecord;
        saveMembersDb($members);

        // Dispara e-mail oficial com o link de acesso e credenciais
        $emailSent = sendPurchaseWelcomeEmail($customerEmail, $customerName, $planType, $modules);
    } elseif ($customerEmail !== '' && in_array($status, $revokedEvents, true)) {
        // Reembolso, chargeback ou cancelamento: revoga status da assinatura, mantendo registro
        $existing = $members[$customerEmail] ?? [];
        $existingPasswordHash = $existing['password_hash'] ?? null;
        $members[$customerEmail] = [
            'name' => $customerName,
            'email' => $customerEmail,
            'plan' => 'revoked',
            'product' => trim($productName . ' ' . $offerName),
            'modules' => [],
            'creditos_plano' => 0,
            'creditos_avulsos' => getMemberExtraCredits($existing),
            'credits_added' => 0,
            'status' => 'revoked',
            'revoked_reason' => $status,
            'password_hash' => $existingPasswordHash,
            'processed_orders' => is_array($existing['processed_orders'] ?? null) ? $existing['processed_orders'] : [],
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
        'duplicate_blocked' => $duplicateBlocked,
        'purchase_category' => $purchaseCategory,
        'order_id' => $orderId,
        'message' => 'Webhook Kiwify processado, acesso atualizado e VeroTrack/CAPI notificado',
        'email' => $customerEmail,
        'status_processed' => $status,
        'member' => isset($members[$customerEmail]) ? sanitizeMemberPublic($members[$customerEmail]) : null,
        'verotrack_http' => $vtCode ?? null
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($action === 'cleanup-test-webhook-user') {
    $expectedToken = getenv('KIWIFY_WEBHOOK_TOKEN') ?: 'cg95nvcn2wg';
    $receivedToken = trim((string)($_GET['token'] ?? ($body['token'] ?? '')));
    if ($receivedToken !== $expectedToken) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Forbidden']);
        exit;
    }
    $testEmail = 'teste_webhook@ordemoculta.com';
    $members = loadMembersDb();
    $existed = isset($members[$testEmail]);
    unset($members[$testEmail]);
    saveMembersDb($members);
    echo json_encode(['success' => true, 'deleted' => $existed, 'email' => $testEmail]);
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
