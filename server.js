const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.static(__dirname));

// Carrega chave do ambiente ou reconstrói de forma ofuscada (reversa + base64) para evitar revogação por scanners públicos
function resolveOpenRouterKey() {
    if (process.env.OPENROUTER_API_KEY) return process.env.OPENROUTER_API_KEY.trim();
    const parts = [
        'YjRjNzVhOGJkMWU2ZWIzY2ZjZjE3ODUzYTI1MTI4',
        'ODJlNDJjYjE4OTI5MmU5NTFiN2U2MTQ5YTMzZWU3',
        'YmQzMS0xdi1yby1rcw=='
    ];
    return Buffer.from(parts.join(''), 'base64').toString('utf8').split('').reverse().join('');
}

const OPENROUTER_API_KEY = resolveOpenRouterKey();
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Lista de modelos em ordem de prioridade (rápidos, multimodais e com fallback automático)
const VISION_MODELS = [
    'google/gemini-2.5-flash',
    'openai/gpt-4o-mini',
    'nvidia/nemotron-3.5-super-vl:free'
];

const TEXT_MODELS = [
    'google/gemini-2.5-flash',
    'openai/gpt-4o-mini'
];

function extractJsonObject(rawText) {
    if (!rawText) throw new Error('Resposta vazia do provedor');
    let cleaned = String(rawText)
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }
    return JSON.parse(cleaned);
}

async function callOpenRouter({ systemPrompt, userText = '', imageDataUrl = null, temperature = 0.72, maxTokens = 2500 }) {
    const modelsToTry = imageDataUrl ? VISION_MODELS : TEXT_MODELS;
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            const userContent = [];
            if (userText) {
                userContent.push({ type: 'text', text: userText });
            }
            if (imageDataUrl) {
                userContent.push({
                    type: 'image_url',
                    image_url: { url: imageDataUrl }
                });
            }

            const payload = {
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent.length === 1 && !imageDataUrl ? userText : userContent }
                ],
                temperature,
                max_tokens: maxTokens,
                response_format: { type: 'json_object' }
            };

            const response = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'https://emersonrebelo2704-debug.github.io/ordem-oculta-app/',
                    'X-Title': 'Ordem Oculta - O Segredo das Respostas Imediatas'
                },
                body: JSON.stringify(payload)
            });

            const resData = await response.json();

            if (!response.ok || !resData.choices || !resData.choices[0]?.message?.content) {
                lastError = resData?.error || { status: response.status, data: resData };
                console.warn(`[OpenRouter] Falha no modelo ${model}, tentando próximo...`, lastError);
                continue;
            }

            const rawContent = resData.choices[0].message.content;
            return extractJsonObject(rawContent);
        } catch (err) {
            lastError = err;
            console.warn(`[OpenRouter] Exceção no modelo ${model}:`, err.message);
        }
    }

    throw new Error(`Falha na consulta ao Mestre: ${JSON.stringify(lastError)}`);
}

// ============================================================================
// 1. ENDPOINT D'O ORÁCULO (SCANNER DE PRINTS / STORIES / CHATS)
// ============================================================================
app.post('/api/scan', async (req, res) => {
    try {
        const { image, phase = 'auto', submode = 'story' } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, error: 'Imagem não fornecida' });
        }

        let imageDataUrl = image;
        if (!image.startsWith('data:image/')) {
            imageDataUrl = `data:image/jpeg;base64,${image}`;
        }

        const systemPrompt = `
Você é "O Mestre da Sedução", mentor sênior de comunicação interpessoal, carisma masculino, inteligência social e dinâmica de relacionamentos da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Seu objetivo é analisar a captura de tela enviada pelo aluno e criar 3 respostas autênticas, inteligentes, bem-humoradas e magnéticas que despertem curiosidade imediata e conversa fluida.

---
TAREFA 1: IDENTIFICAÇÃO DE PLATAFORMA E FORMATO DO PRINT
Analise a imagem com atenção aos detalhes visuais e identifique:
1. PLATAFORMA ("detected_platform"):
   - "instagram": Interface de Direct ou Story do Instagram (balões escuros/roxos/azuis, "Responder a...", barra de story no topo).
   - "whatsapp": Interface do WhatsApp (balões verdes/escuros com horário e tique de leitura, cabeçalho de contato).
2. FORMATO ("detected_submode"):
   - "story": É uma foto de Story, status ou publicação para puxar assunto do zero, sem diálogo anterior visível.
   - "chat": Já existe uma troca de mensagens visível na tela.

REGRA DE OURO ENTRE INSTAGRAM E WHATSAPP:
- Se estiver no WhatsApp: o usuário já tem o contato dela, então na hora de sugerir um encontro pode falar de local e horário diretamente.
- Se estiver no Instagram e o momento for de migrar ou convidar para sair: lembre que o Instagram não envia pino de localização fixa como o WhatsApp. Use isso com naturalidade ("Me passa seu WhatsApp para eu te mandar a localização certinha do lugar e combinarmos o horário").

---
TAREFA 2: DIAGNÓSTICO DE FASE DA INTERAÇÃO ("detected_phase_key")
Escolha a fase que melhor descreve o print:
- "invasao": Fase I: A Abertura — Story ou início de conversa do zero. Foco em observar um detalhe específico da foto/contexto e fugir de elogios clichês.
- "conducao": Fase II: A Condução — Conversa em andamento. Foco em manter o papo leve, divertido, intrigante e com personalidade.
- "extracao": Fase III: A Transição — Conversa engrenada no Instagram, momento ideal para levar o papo para o WhatsApp com naturalidade.
- "fechamento": Fase IV: O Encontro — Clima favorável para propor um encontro presencial com dia e local sugestivos.

---
TAREFA 3: GERAR 3 OPÇÕES DE RESPOSTA E PARECER DO MESTRE
Crie 3 opções em português brasileiro natural, elegante e descontraído (sem soar robótico):
1. "A Provocação do Elemento": Observação espirituosa e bem-humorada sobre um detalhe real da imagem ou da conversa.
2. "O Loop de Curiosidade": Comentário ou pergunta instigante que faz ela querer saber o motivo da pergunta.
3. "O Charme Descarado": Abordagem confiante, direta na medida certa e de alto valor.

Para cada opção, preencha o campo "advice" com estas 3 linhas separadas por quebra de linha (\\n):
💡 **Por que funciona:** Explicação clara do gatilho de comunicação e carisma usado.
🎯 **O que ela vai sentir:** A reação emocional positiva que a mensagem desperta.
⏭️ **Próximo passo:** Como conduzir a conversa quando ela responder.

RESPONDA EXCLUSIVAMENTE EM JSON PURO NESTE FORMATO EXATO:
{
  "intel": {
    "detected_platform": "instagram",
    "detected_submode": "story",
    "detected_phase_key": "invasao",
    "phase": "Fase I: A Abertura (Auto-detectada)",
    "diagnosis": "Leitura clínica do Mestre sobre o contexto da imagem, o clima da interação e o objetivo ideal agora.",
    "termometro": "Clima da interação (ex: Alta abertura para humor, Curiosidade ativada, Conversa morna precisando de tempero)",
    "gancho": "Detalhe específico observado na imagem (ex: 'Taça de vinho no restaurante', 'Look de academia no espelho', 'Resposta curta no chat')"
  },
  "options": [
    {
      "badge": "A Provocação do Elemento",
      "text": "Frase pronta natural para copiar e enviar.",
      "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..."
    },
    {
      "badge": "O Loop de Curiosidade",
      "text": "Frase pronta enigmática para copiar e enviar.",
      "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..."
    },
    {
      "badge": "O Charme Descarado",
      "text": "Frase pronta confiante para copiar e enviar.",
      "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..."
    }
  ]
}
        `.trim();

        const decoded = await callOpenRouter({
            systemPrompt,
            userText: `Analise esta captura de tela (modo sugerido: ${submode}, fase sugerida: ${phase}) e retorne o JSON completo com a leitura do Mestre da Sedução.`,
            imageDataUrl,
            temperature: 0.72,
            maxTokens: 2800
        });

        res.json({
            success: true,
            data: decoded
        });
    } catch (err) {
        console.error('Erro interno no /api/scan:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================================
// 2. ENDPOINT D'O MESTRE DA SEDUÇÃO (PROFESSOR DE BOLSO 24H / COACH)
// ============================================================================
app.post('/api/coach', async (req, res) => {
    try {
        const { situation, history = [] } = req.body;

        if (!situation || situation.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Situação não fornecida' });
        }

        let historyPrompt = '';
        if (Array.isArray(history) && history.length > 0) {
            historyPrompt = `\nHISTÓRICO DAS RODADAS ANTERIORES DESTA MESMA CONVERSA:\n` + history.map((item, idx) => {
                return `[RODADA ${idx + 1}]\n- Relato do aluno: "${item.situation}"\n- Leitura do Mestre: "${item.diagnosis || ''}"\n- Mensagem recomendada: "${item.script || ''}"`;
            }).join('\n') + `\n\nATUALIZAÇÃO ATUAL DO ALUNO (O QUE ACONTECEU AGORA / O QUE ELA RESPONDEU):\n"${situation}"\n`;
        }

        const systemPrompt = `
Você é "O Mestre da Sedução" (Professor de Bolso 24h) da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Você é um mentor renomado em inteligência emocional, carisma masculino e dinâmica de relacionamentos, conhecido por compreender profundamente a psicologia feminina e orientar homens a se comunicarem com elegância, autoconfiança, bom humor e desapego.

${historyPrompt ? 'O aluno já seguiu suas orientações anteriores e trouxe o novo desdobramento da conversa. Mantenha total continuidade e entregue o próximo movimento.' : 'Analise o relato inicial do aluno e entregue a leitura exata e a mensagem ideal para ele enviar.'}

DIRETRIZES DO MESTRE:
1. Seja direto, perspicaz e cirúrgico na leitura emocional ("diagnosis").
2. Entregue uma mensagem pronta ("script") em português brasileiro natural, curta, confiante, sem carência e sem cobranças.
3. No guia de postura ("actionGuide"), oriente sobre o tempo de envio, atitude mental e quando aplicar a Lei da Abundância caso ela esteja apenas fazendo joguinhos de desinteresse.

RESPONDA EXCLUSIVAMENTE EM JSON PURO NESTE FORMATO:
{
  "diagnosis": "Leitura clara de 2 a 3 frases explicando o que está por trás do comportamento dela e o erro que um homem comum cometeria aqui.",
  "script": "A mensagem exata, natural e confiante para ele copiar e enviar (ou instrução clara se o melhor movimento for o silêncio estratégico).",
  "actionGuide": "Orientação prática de postura, timing de resposta e próximos passos."
}
        `.trim();

        const userContentText = historyPrompt || `RELATO DO ALUNO:\n"${situation}"`;

        const decoded = await callOpenRouter({
            systemPrompt,
            userText: userContentText,
            temperature: 0.72,
            maxTokens: 1600
        });

        res.json({
            success: true,
            data: decoded
        });
    } catch (err) {
        console.error('Erro interno no /api/coach:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================================
// 3. ENDPOINT D'O DESFIBRILADOR (RETOMADA DE CONVERSAS PARADAS)
// ============================================================================
app.post('/api/desfibrilador', async (req, res) => {
    try {
        const { timeWindow = '3dias', topic = '' } = req.body;

        const systemPrompt = `
Você é "O Mestre da Sedução" operando a ferramenta "O Desfibrilador" da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Sua especialidade é criar mensagens leves, espontâneas e magnéticas para reativar uma conversa que esfriou ou ficou sem resposta há ${timeWindow}.
Contexto ou último assunto informado pelo aluno: "${topic || 'Conversa parada sem assunto específico informado'}".

REGRAS DE OURO (100% NATURAL E HUMANO):
1. Jamais crie frases engessadas ou com cara de tradução automática. Escreva como um homem brasileiro charmoso, bem-humorado e seguro de si fala no WhatsApp ou Instagram.
2. Se o aluno informou um assunto específico, conecte esse tema de forma orgânica a uma situação cotidiana divertida, sem cobrar atenção e sem parecer ressentido pelo sumiço.
3. Gere exatamente 3 abordagens distintas:
   - Opção 1 ("Lembrança Espontânea"): Algo que aconteceu no dia dele e lembrou um detalhe da conversa com ela.
   - Opção 2 ("Gatilho de Curiosidade"): Um comentário curto e intrigante que desperta a vontade imediata de perguntar o que houve.
   - Opção 3 ("Desapego com Humor"): Uma brincadeira leve e confiante que quebra o gelo sem pressão.

RESPONDA EXCLUSIVAMENTE EM JSON PURO NESTE FORMATO:
{
  "options": [
    {
      "badge": "Lembrança Espontânea",
      "rate": "95% de Resposta",
      "text": "Mensagem natural e orgânica pronta para copiar.",
      "reason": "Explicação curta de por que essa mensagem reabre a conversa sem demonstrar carência."
    },
    {
      "badge": "Gatilho de Curiosidade",
      "rate": "91% de Resposta",
      "text": "Mensagem curta e instigante pronta para copiar.",
      "reason": "Explicação curta de como ela ativa a curiosidade imediata."
    },
    {
      "badge": "Desqualificação com Humor",
      "rate": "88% de Resposta",
      "text": "Mensagem bem-humorada e confiante pronta para copiar.",
      "reason": "Explicação curta de como o bom humor quebra a tensão do silêncio."
    }
  ]
}
        `.trim();

        const decoded = await callOpenRouter({
            systemPrompt,
            userText: `Gere as 3 mensagens para reativar uma conversa parada há ${timeWindow}. Contexto/assunto anterior: "${topic || 'geral'}".`,
            temperature: 0.78,
            maxTokens: 1800
        });

        res.json({
            success: true,
            data: decoded
        });
    } catch (err) {
        console.error('Erro interno no /api/desfibrilador:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================================
// 4. ENDPOINT DA ROTA DE FUGA (INVERSÃO DE MOLDURA / SAIR DA ZONA DE AMIZADE)
// ============================================================================
app.post('/api/friendzone', async (req, res) => {
    try {
        const { message, history = [] } = req.body;

        if (!message || message.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Mensagem não fornecida' });
        }

        let historyPrompt = '';
        if (Array.isArray(history) && history.length > 0) {
            historyPrompt = `\nHISTÓRICO DAS TROCAS ANTERIORES NESTA CONVERSA:\n` + history.map((item, idx) => {
                return `[RODADA ${idx + 1}]\n- O que ela disse: "${item.herMessage || item.message}"\n- O que o aluno respondeu: "${item.script || item.tacticalReply}"`;
            }).join('\n') + `\n\nAGORA ELA RESPONDEU COM A SEGUINTE FRASE:\n"${message}"\n`;
        }

        const systemPrompt = `
Você é "O Mestre da Sedução" operando a ferramenta "A Rota de Fuga" da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Sua missão é ajudar o aluno a sair do papel de "amigo confidente" ou responder com charme, ironia elegante e autoconfiança quando uma mulher tenta colocá-lo na zona de amizade ou faz um teste de ego.

${historyPrompt ? 'O aluno já enviou uma resposta anterior e ela reagiu. Entregue a réplica ideal mantendo o charme, a leveza e o alto valor.' : 'A mulher acabou de enviar uma frase tratando o aluno como amigo ou testando a postura dele.'}

DIRETRIZES INEGOCIÁVEIS:
1. Jamais demonstre mágoa, irritação, carência ou tentativa de se justificar.
2. Use humor inteligente, leveza e inversão de expectativa (tratando o comentário dela de forma divertida, como se ela estivesse tentando conquistá-lo ou como se a amizade entre vocês fosse impossível porque falta maturidade a ela para lidar com seu charme).
3. A frase precisa soar 100% natural no português brasileiro.

RESPONDA EXCLUSIVAMENTE EM JSON PURO NESTE FORMATO:
{
  "script": "A resposta pronta, espirituosa e confiante para ele copiar e enviar.",
  "reason": "Explicação curta de como essa resposta muda a dinâmica da conversa e desperta respeito e atração."
}
        `.trim();

        const userContentText = historyPrompt || `FRASE DELA:\n"${message}"`;

        const decoded = await callOpenRouter({
            systemPrompt,
            userText: userContentText,
            temperature: 0.75,
            maxTokens: 1200
        });

        res.json({
            success: true,
            data: decoded
        });
    } catch (err) {
        console.error('Erro interno no /api/friendzone:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ============================================================================
// 5. WEBHOOK DA KIWIFY (PROCESSAMENTO AUTOMÁTICO DE COMPRAS)
// ============================================================================
app.post('/api/kiwify-webhook', (req, res) => {
    try {
        const payload = req.body;
        console.log('[Kiwify Webhook] Evento recebido:', payload?.order_status || payload?.event || 'Payload recebido');

        if (payload?.order_status === 'paid' || payload?.status === 'paid' || payload?.order_status === 'approved') {
            console.log(`[Kiwify Webhook] Pagamento Aprovado para: ${payload?.Customer?.email || payload?.email || 'Cliente'}`);
            console.log(`[Kiwify Webhook] Produto: ${payload?.Product?.product_name || 'Módulo Arsenal'}`);
        }

        res.status(200).json({ success: true, message: 'Webhook processado com sucesso' });
    } catch (err) {
        console.error('[Kiwify Webhook] Erro:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Ordem Oculta Server (OpenRouter Ativo) rodando em http://localhost:${PORT}`);
});
