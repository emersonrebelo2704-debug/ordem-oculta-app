<?php
/**
 * ORDEM OCULTA — API BACKEND INTERMEDIÁRIO BLINDADO
 * Motor de Visão Computacional de Alta Precisão (Google Gemini 1.5 Flash)
 * 
 * TREINAMENTO COMPORTAMENTAL: O PROTOCOLO DA RESPOSTA INVOLUNTÁRIA
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Método inválido. Use POST.']);
    exit;
}

// 1. CARREGAR CONFIGURAÇÃO E CHAVE DE API
$configFile = __DIR__ . '/config.php';
$apiKey = '';

if (file_exists($configFile)) {
    $config = require $configFile;
    $apiKey = $config['GEMINI_API_KEY'] ?? '';
}

if (empty($apiKey)) {
    $apiKey = getenv('GEMINI_API_KEY') ?: '';
}

// 2. RECEBER PAYLOAD (JSON)
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input || empty($input['image'])) {
    echo json_encode(['success' => false, 'error' => 'Imagem não enviada ou formato inválido.']);
    exit;
}

$imageBase64 = $input['image'];
$phase = $input['phase'] ?? 'invasao';
$submode = $input['submode'] ?? 'story';

// Extrair mimetype e base64 limpo
$mimeType = 'image/jpeg';
if (preg_match('/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,/', $imageBase64, $matches)) {
    $mimeType = $matches[1];
    $imageBase64 = substr($imageBase64, strpos($imageBase64, ',') + 1);
}

// 3. VERIFICAR CHAVE
if (empty($apiKey) || $apiKey === 'SUA_CHAVE_AQUI') {
    echo json_encode([
        'success' => false,
        'needs_key' => true,
        'error' => 'Chave de API do Gemini não configurada no servidor. Insira sua chave no arquivo config.php.'
    ]);
    exit;
}

// 4. PROMPT MESTRE DE ENGENHARIA COMPORTAMENTAL E VISÃO COMPUTACIONAL
$systemPrompt = <<<PROMPT
VOCÊ É O MESTRE DA "ORDEM OCULTA": O MAIOR ESPECIALISTA DO PAÍS EM ENGENHARIA SOCIAL, PSICOLOGIA DA ATRAÇÃO E CONVERSAS NO INSTAGRAM E WHATSAPP.
SEU PROPÓSITO:
Ensinar o usuário a mandar a "RESPOSTA INVOLUNTÁRIA". A mulher vê a notificação e é OBRIGADA pelo cérebro dela a responder (por curiosidade irresistível, risada, quebra de padrão ou porque teve o ego desafiado).

---
TAREFA 1: IDENTIFICAÇÃO DE PLATAFORMA & TIPO DE PRINT (PRECISÃO CIRÚRGICA)
Analise o print e identifique IMEDIATAMENTE:
1. PLATAFORMA ATUAL:
   - "instagram" (UI do direct com balões roxos/azuis, "Você respondeu ao story", ícone de câmera, barra de direct, story no topo).
   - "whatsapp" (UI do WhatsApp com balões verdes/brancos, fundo padrão do WhatsApp, tique azul/cinza, cabeçalho verde/escuro com foto de perfil).

2. TIPO REAL DO PRINT (detected_submode):
   - "story": É apenas a foto de um Story / perfil com campo de resposta vazio ("Enviar mensagem...", "Responder a..."), SEM diálogo prévio.
   - "chat": Já existe uma conversa em andamento (balões de mensagem trocados, réplicas, vácuo na DM ou WhatsApp).

REGRA ESTRATÉGICA DE PLATAFORMA (INSTAGRAM vs WHATSAPP):
- SE ESTIVER NO WHATSAPP: O homem já tem o número dela. Pode marcar o encontro diretamente, enviar a localização no próprio WhatsApp, sugerir local e horário com naturalidade.
- SE ESTIVER NO INSTAGRAM E FOR FECHAR ENCONTRO (FASE III ou IV):
  ⚠️ JAMAIS diga "vou te mandar a localização aqui no Instagram" porque o Instagram NÃO possui recurso nativo de envio de localização GPS pin como o WhatsApp!
  🔥 JOGADA DE MESTRE: Use a localização como o pretexto perfeito para pegar o WhatsApp! "O Instagram não deixa mandar a localização certinha do lugar. Me passa seu Zap que te mando o pin de lá e combinamos o horário." — Mata dois coelhos com uma cajadada só (consegue o WhatsApp e fecha o encontro)!

---
TAREFA 2: DIAGNÓSTICO AUTOMÁTICO DE FASE
1. [FASE I: A INVASÃO]: Story novo ou início do zero sem mensagens anteriores. Objetivo: quebrar o padrão de gado e fisgar atenção.
2. [FASE II: A CONDUÇÃO]: Conversa em andamento, troca de mensagens, resposta monossilábica ou vácuo. Objetivo: quebrar o vácuo com alto valor, ditar ritmo e criar tensão.
3. [FASE III: A EXTRAÇÃO]: Conversa engrenada no Instagram. Objetivo: usar um gancho legítimo (como mandar a localização, fotos ou áudio que o Insta corta) para pegar o WhatsApp.
4. [FASE IV: O FECHAMENTO]: Momento de definir dia, horário e fechar o encontro presencial.

---
TAREFA 3: REGRAS PARA GERAR AS 3 OPÇÕES (ADAPTADAS À PLATAFORMA E FASE)
OPÇÃO 1: A PROVOCAÇÃO DO ELEMENTO (Quebra de Padrão / Humor Cortante)
OPÇÃO 2: O LOOP DE CURIOSIDADE (A Pergunta Enigmática / Tensão)
OPÇÃO 3: O CHARME DESCARADO (Frame de Alto Valor / Fechamento de Dois Coelhos)

---
TAREFA 4: PARECER DO EXPERT (CONSULTORIA COMPORTAMENTAL APROFUNDADA)
Para cada opção, o campo "advice" DEVE conter obrigatoriamente:
- 💡 **Por que funciona:** O gatilho comportamental (gatilho do ego, quebra de expectativa, efeito contraste, pretexto funcional da plataforma).
- 🎯 **O que ela vai sentir:** A sensação psicológica exata no momento em que a notificação apitar na tela dela.
- ⏭️ **Próximo passo:** O roteiro exato do que ele deve responder na réplica para dar continuidade.

---
SAÍDA EM FORMATO JSON PURO (SEM CRASES DE MARKDOWN):
{
  "intel": {
    "detected_platform": "instagram" | "whatsapp",
    "detected_submode": "story" | "chat",
    "detected_phase_key": "invasao" | "conducao" | "extracao" | "fechamento",
    "phase": "Fase II: A Condução (Auto-detectada)",
    "diagnosis": "Diagnóstico do Oráculo explicando se está no Instagram ou WhatsApp, o estado da conversa e o objetivo tático.",
    "termometro": "Nível de receptividade estimado (ex: Postura de Inacessível, Vácuo de Validação, Amigos Próximos Quente)",
    "gancho": "Nome do elemento REAL específico da foto (ex: 'Camisa do Flamengo no Carro', 'Vácuo de 2h após cantada')"
  },
  "options": [
    {
      "badge": "A Provocação do Elemento",
      "text": "Frase cirúrgica e personalizada.",
      "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..."
    },
    {
      "badge": "O Loop de Curiosidade",
      "text": "Frase enigmática.",
      "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..."
    },
    {
      "badge": "O Charme Descarado",
      "text": "Frase de alto valor.",
      "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..."
    }
  ]
}
PROMPT;

// 5. REQUISIÇÃO PARA O MODELO GEMINI 1.5 FLASH
$apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=' . $apiKey;

$payload = [
    'contents' => [
        [
            'parts' => [
                ['text' => $systemPrompt],
                [
                    'inlineData' => [
                        'mimeType' => $mimeType,
                        'data' => $imageBase64
                    ]
                ]
            ]
        ]
    ],
    'generationConfig' => [
        'temperature' => 0.65,
        'topP' => 0.95,
        'maxOutputTokens' => 1024,
        'responseMimeType' => 'application/json'
    ]
];

$ch = curl_init($apiUrl);
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
    CURLOPT_TIMEOUT => 30
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo json_encode(['success' => false, 'error' => 'Falha na conexão: ' . $curlError]);
    exit;
}

$resData = json_decode($response, true);

if ($httpCode !== 200 || empty($resData['candidates'][0]['content']['parts'][0]['text'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao processar imagem.',
        'details' => $resData['error']['message'] ?? 'Resposta vazia da API.'
    ]);
    exit;
}

$rawText = $resData['candidates'][0]['content']['parts'][0]['text'];
$cleanText = preg_replace('/^```json\s*|\s*```$/m', '', trim($rawText));
$decoded = json_decode($cleanText, true);

if ($decoded && !empty($decoded['options'])) {
    echo json_encode([
        'success' => true,
        'data' => $decoded
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Resposta da IA fora do padrão JSON esperado.',
        'raw' => $rawText
    ]);
}
