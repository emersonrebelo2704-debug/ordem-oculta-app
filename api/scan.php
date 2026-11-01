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
TAREFA 1: DIAGNÓSTICO AUTOMÁTICO DE FASE (LEITURA VISUAL E CONTEXTUAL DO PRINT)
Avalie a imagem enviada e identifique com precisão cirúrgica em qual fase a interação se encontra:

1. [FASE I: A INVASÃO]
   - Cenário: É um Story novo (Instagram Stories), foto de perfil, ou print da DM sem mensagens anteriores (início do zero).
   - Objetivo: Quebrar o padrão dos caras previsíveis que elogiam ("linda", "maravilhosa") usando os elementos inusitados do cenário ou gerando um loop de curiosidade irresistível.

2. [FASE II: A CONDUÇÃO]
   - Cenário: Já há troca de mensagens na tela, ou o homem mandou mensagem e ela deixou no visto / demorou / respondeu seca, ou a conversa está morna.
   - Objetivo: Recuperar o frame de alto valor, quebrar o vácuo sem parecer carente, criar tensão emocional/sexual, ditar o ritmo e desarmar a pose de inacessível dela.

3. [FASE III: A EXTRAÇÃO]
   - Cenário: A conversa já engrenou, ela está rindo, mandando áudios ou textos longos, e está no momento de transferir do Instagram para o WhatsApp pessoal.
   - Objetivo: Fazer a transição fluida para o WhatsApp de forma magnética e natural, sem pedir permissão como um necessitado.

4. [FASE IV: O FECHAMENTO]
   - Cenário: Já estão conversando com bastante intimidade (no Instagram ou WhatsApp), e é a hora de fechar o encontro presencial a dois (drinks, jantar, barzinho).
   - Objetivo: Fazer o convite fechado e assertivo (dia, horário e estilo), eliminando desculpas de "vou ver na agenda".

NOTA DE INTENÇÃO DO USUÁRIO: O usuário selecionou inicialmente "{$phase}" (Modo: "{$submode}"). Se estiver em modo "auto" ou se o print mostrar claramente outra fase, PRIORIZE O QUE A IMAGEM REALMENTE MOSTRA e explique no diagnóstico!

---
TAREFA 2: REGRAS PARA GERAR AS 3 OPÇÕES (ADAPTADAS À FASE DETECTADA)

OPÇÃO 1: A PROVOCAÇÃO DO ELEMENTO (Quebra de Padrão / Humor Cortante)
- Se Fase I: Provocação ousada e bem-humorada sobre o detalhe mais visível (camisa de time, carro, biquíni, academia, amigos próximos).
- Se Fase II: Quebra de vácuo ou resposta descontraída que coloca o ego dela em teste sem carência.
- Se Fase III: Pretexto funcional ou desafio para ela mandar o WhatsApp.
- Se Fase IV: Convite direto com falsa escolha e autoridade.

OPÇÃO 2: O LOOP DE CURIOSIDADE (A Pergunta Enigmática / Tensão)
- Deixa uma lacuna aberta que a obriga psicologicamente a responder perguntando "como assim?", "o que?", "kkkk por que?".

OPÇÃO 3: O CHARME DESCARADO (Frame de Alto Valor / Desqualificação Elegante)
- Demonstra que o homem tem padrões altos, não é influenciado pela beleza dela e sabe liderar a dinâmica.

---
TAREFA 3: PARECER DO EXPERT (CONSULTORIA COMPORTAMENTAL APROFUNDADA)
Para cada opção, o campo "advice" DEVE conter obrigatoriamente:
- 💡 **Por que funciona:** O gatilho comportamental (gatilho do ego, quebra de expectativa, efeito contraste).
- 🎯 **O que ela vai sentir:** A sensação psicológica exata no momento em que a notificação apitar na tela dela.
- ⏭️ **Próximo passo:** O roteiro exato do que ele deve responder na réplica para dar continuidade.

---
SAÍDA EM FORMATO JSON PURO (SEM CRASES DE MARKDOWN):
{
  "intel": {
    "detected_phase_key": "invasao",
    "phase": "Fase II: A Condução (Auto-detectada)",
    "diagnosis": "Diagnóstico do Oráculo explicando exatamente o estado da conversa e o objetivo tático.",
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
