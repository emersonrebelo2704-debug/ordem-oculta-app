const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.static(__dirname));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "AQ.Ab8RN6LBf8SRBcoc8j0mmiYFj8PlPnCNTyn3bbr29iD-_V0DFw";

app.post('/api/scan', async (req, res) => {
    try {
        const { image, phase = 'invasao', submode = 'story' } = req.body;

        if (!image) {
            return res.status(400).json({ success: false, error: 'Imagem não fornecida' });
        }

        let mimeType = 'image/jpeg';
        let base64Data = image;
        const matches = image.match(/^data:(image\/[a-zA-Z0-9\+\-\.]+);base64,/);
        if (matches) {
            mimeType = matches[1];
            base64Data = image.split(',')[1];
        }

        const systemPrompt = `
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
        `;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: systemPrompt },
                        {
                            inlineData: {
                                mimeType: mimeType,
                                data: base64Data
                            }
                        }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 3500,
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (!response.ok || !resData.candidates || !resData.candidates[0].content) {
            return res.status(500).json({
                success: false,
                error: 'Erro na API Gemini',
                details: resData
            });
        }

        const rawText = resData.candidates[0].content.parts[0].text;
        const cleanText = rawText.replace(/^```json\s*|\s*```$/gm, '').trim();
        const decoded = JSON.parse(cleanText);

        res.json({
            success: true,
            data: decoded
        });

    } catch (err) {
        console.error("Erro interno:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ENDPOINT DO COACH DE EMERGÊNCIA (DESCREVER SITUAÇÃO)
app.post('/api/coach', async (req, res) => {
    try {
        const { situation } = req.body;

        if (!situation || situation.trim().length === 0) {
            return res.status(400).json({ success: false, error: 'Situação não fornecida' });
        }

        const systemPrompt = `
VOCÊ É O COACH TÁTICO DE EMERGÊNCIA DA "ORDEM OCULTA": O MAIOR ESTRATEGISTA EM DINÂMICA SOCIAL E CONVERSAS DO PAÍS.
O usuário está em uma situação crítica/tensa com uma mulher (vácuo, teste de desinteresse, dúvida do que mandar).
Sua missão é dar um DIAGNÓSTICO FRIO, DESPROPOrcionalMENTE PRECISO e fornecer a RESPOSTA CIRÚRGICA exata para ele virar o jogo agora.

FORMATO OBRIGATÓRIO DE SAÍDA (JSON PURO):
{
  "diagnosis": "Explicação fria e direta de 2 a 3 linhas sobre a psicologia dela e o que causou essa situação.",
  "script": "A frase exata que ele deve mandar (curta, magnética e sem carência).",
  "actionGuide": "A atitude mental recomendada (tempo de espera para mandar, postura e timing)."
}
        `;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: systemPrompt },
                        { text: `SITUAÇÃO DO USUÁRIO:\n"${situation}"` }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                maxOutputTokens: 2000,
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (!response.ok || !resData.candidates || !resData.candidates[0].content) {
            return res.status(500).json({ success: false, error: 'Erro na API Gemini', details: resData });
        }

        const rawText = resData.candidates[0].content.parts[0].text;
        const cleanText = rawText.replace(/^```json\s*|\s*```$/gm, '').trim();
        const decoded = JSON.parse(cleanText);

        res.json({
            success: true,
            data: decoded
        });

    } catch (err) {
        console.error("Erro interno no coach:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// ENDPOINT D'O DESFIBRILADOR (RESSUSCITAÇÃO DE VÁCUO & GHOSTING COM IA)
app.post('/api/desfibrilador', async (req, res) => {
    try {
        const { timeWindow = '3dias', topic = '' } = req.body;

        const systemPrompt = `
VOCÊ É O MESTRE DA PSICOLOGIA DE RESSUSCITAÇÃO DE CONVERSAS ("O DESFIBRILADOR").
VOCÊ É O MAIOR ESPECIALISTA DO BRASIL EM REVERTER VÁCUO E GHOSTING NO INSTAGRAM E WHATSAPP.

O USUÁRIO ESTÁ DIANTE DE UM PROBLEMA GRAVE:
Ele e a mulher conversavam, mas a conversa morreu ou ela parou de responder há ${timeWindow}.
O último assunto que eles conversavam ou contexto informado foi: "${topic || 'Vácuo sem assunto específico'}".

SUAS REGRAS INEGOCIÁVEIS (ANTI-GENÉRICO & LINGUAGEM NATURAL):
1. PROIBIÇÃO DE MENSAGENS ROBÓTICAS OU FORMULAICAS:
   - NUNCA use frases artificiais como "Você não vai acreditar sobre o que estávamos falando sobre X". Isso soa como robô mal traduzido!
   - Fale como um homem autêntico, descontraído, com malícia e naturalidade brasileira. Use pontuação informal ("kkkk", reticências no momento certo, frases curtas).
2. INCORPORAÇÃO ORGÂNICA DO ASSUNTO:
   - Se o usuário falou que o assunto era "festas quando era mais novo vs hoje em dia mais sossegado", a frase DEVE soar natural, por exemplo:
     * "Lembrei agora da nossa conversa sobre as festas de antigamente... na moral, se a gente tentasse fazer metade daquilo hoje, a gente não sobrevivia até domingo kkkk"
     * "Acabei de ver uma cena na rua que me fez lembrar exatamente do que você me falou sobre a fase das festas. Tive que vir te contar."
3. AS 3 VERTENTES EXATAS QUE VOCÊ DEVE GERAR:

GATILHO 1: A LEMBRANÇA ESPONTÂNEA (Loop de Curiosidade & Conexão)
- O homem viu algo no dia a dia dele que o fez lembrar de algo específico que ela disse ou do assunto anterior.
- Soa 100% genuíno, sem parecer que ele estava pensando nela o tempo todo.

GATILHO 2: O FALSO ENGANO / PROVOCAÇÃO BEM-HUMORADA
- Uma quebra de expectativa onde ele parece que vai mandar outra coisa ou joga uma cutucada elegante sobre o sumiço dela.

GATILHO 3: A DESQUALIFICAÇÃO COM HUMOR (Alto Valor & Desapego)
- Mostra que o homem é seguro de si, brinca com o vácuo com leveza sem cobrar satisfação e inverte o papel (coloca ela na posição de quem precisa se justificar).

FORMATO OBRIGATÓRIO DE SAÍDA (JSON PURO):
{
  "options": [
    {
      "badge": "Lembrança Espontânea",
      "rate": "95% de Resposta",
      "text": "Frase natural e orgânica citando o contexto sem parecer forçado.",
      "reason": "Por que desarma o vácuo e como ela vai interpretar."
    },
    {
      "badge": "Gatilho de Curiosidade",
      "rate": "91% de Resposta",
      "text": "Frase enigmática e magnética.",
      "reason": "Por que força ela a abrir o direct e perguntar o que houve."
    },
    {
      "badge": "Desqualificação com Humor",
      "rate": "88% de Resposta",
      "text": "Frase de alto valor brincando com o silêncio dela.",
      "reason": "Mostra desapego e masculinidade sem ressentimento."
    }
  ]
}
        `;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${GEMINI_API_KEY}`;
        const payload = {
            contents: [
                {
                    parts: [
                        { text: systemPrompt }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.75,
                topP: 0.95,
                maxOutputTokens: 2000,
                responseMimeType: "application/json"
            }
        };

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const resData = await response.json();

        if (!response.ok || !resData.candidates || !resData.candidates[0].content) {
            return res.status(500).json({ success: false, error: 'Erro na API Gemini', details: resData });
        }

        const rawText = resData.candidates[0].content.parts[0].text;
        const cleanText = rawText.replace(/^```json\s*|\s*```$/gm, '').trim();
        const decoded = JSON.parse(cleanText);

        res.json({
            success: true,
            data: decoded
        });

    } catch (err) {
        console.error("Erro interno no desfibrilador:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Oráculo Server rodando em http://localhost:${PORT}`);
});
