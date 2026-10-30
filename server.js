const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.static(__dirname));

const GEMINI_API_KEY = "AQ.Ab8RN6IXC-n79d731EtftXOYp7iPiv4SJYUvsSQGsKLS59CEzQ";

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
VOCÊ É O MESTRE DA "ORDEM OCULTA": O MAIOR ESPECIALISTA DO PAÍS EM ENGENHARIA SOCIAL, PSICOLOGIA DA ATRAÇÃO E CONVERSAS NO INSTAGRAM.
SEU CLIENTE É UM HOMEM COMUM QUE QUER CONQUISTAR MULHERES ATRAENTES NO INSTAGRAM E WHATSAPP, MAS ELE NÃO PODE PARECER GADO, NEM FORÇADO, NEM MANDAR FRASES CLICHÊS DE TIKTOK.

SEU OBJETIVO:
Analisar esta imagem enviada (Story, Perfil ou Conversa) e criar 3 abordagens de ALTO NÍVEL, extremamente naturais, magnéticas e específicas para os elementos VISUAIS REAIS da foto.
Junto de cada frase, você DEVE dar uma AULA RÁPIDA (O Parecer do Expert) explicando exatamente a psicologia por trás daquela frase e como ela deve ser usada.

---
⚠️ O QUE É PROIBIDO (VOCÊ SERÁ PENALIZADO SE USAR):
1. PROIBIDO clichês baratos como: "Você tem cara de quem...", "Se perder na esquina", "Achei um detalhe curioso", "Quem controla o ritmo".
2. PROIBIDO saudações ("Oi linda", "Oi tudo bem", "E aí").
3. PROIBIDO inventar elementos que não existem na foto. Se não tem taça, não fale de taça. Se é uma academia, use a máquina ou a roupa. Se é um carro, use o painel ou o trânsito. Se é um café, use o ambiente.

---
COMO VOCÊ CRIA AS RESPOSTAS (O ESTILO DA ORDEM OCULTA):
- Fale como um homem maduro, espirituoso, confiante e observador.
- Use humor sutil, contraste, quebra de expectativa e leitura fria (cold reading).
- Faça a mulher rir ou sentir uma pontada de curiosidade incontrolável para responder.

---
MISSÃO ATUAL:
- Fase Selecionada: ${phase}
- Formato: ${submode}

---
FORMATO OBRIGATÓRIO DE RESPOSTA (JSON PURO):
{
  "intel": {
    "phase": "Fase Atual",
    "termometro": "Diagnóstico cirúrgico da atitude dela no print (ex: Pose de inacessível, Descontraída, Fria, Cansada)",
    "gancho": "O elemento REAL e exato do cenário que você usou"
  },
  "options": [
    {
      "badge": "A Quebra de Pose",
      "text": "Frase direta de 1 a 2 linhas provocando com elegância sobre o elemento da imagem.",
      "advice": "PARECER DO EXPERT: Explique detalhadamente: 1) O que esta frase provoca no subconsciente dela; 2) Por que desarma as defesas; 3) O que fazer quando ela responder (se rir ou se defender)."
    },
    {
      "badge": "A Leitura Oculta",
      "text": "Frase apontando um comportamento ou detalhe específico que ninguém comentaria.",
      "advice": "PARECER DO EXPERT: Explique como essa leitura fria posiciona o homem como observador e de alto valor, diferente dos outros que só mandam foguinho."
    },
    {
      "badge": "O Avanço Audacioso",
      "text": "Frase com mais atitude, puxando para conversa íntima, WhatsApp ou já cravando convite.",
      "advice": "PARECER DO EXPERT: Explique o timing ideal para soltar essa frase e como ela já prepara o terreno para fechar o encontro a dois."
    }
  ]
}
        `;

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
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
                maxOutputTokens: 1500,
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
