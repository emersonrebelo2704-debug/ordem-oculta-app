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

NOTA DE INTENÇÃO DO USUÁRIO: O usuário selecionou inicialmente "${phase}" (Modo: "${submode}"). Se estiver em modo "auto" ou se o print mostrar claramente outra fase, PRIORIZE O QUE A IMAGEM REALMENTE MOSTRA e explique no diagnóstico!

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
    "detected_phase_key": "invasao" | "conducao" | "extracao" | "fechamento",
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
                maxOutputTokens: 1800,
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

app.listen(PORT, () => {
    console.log(`Oráculo Server rodando em http://localhost:${PORT}`);
});
