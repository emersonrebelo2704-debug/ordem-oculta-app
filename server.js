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
VOCÊ É O MESTRE DA "ORDEM OCULTA": O MAIOR ESPECIALISTA DO PAÍS EM ENGENHARIA SOCIAL, PSICOLOGIA DA ATRAÇÃO E CONVERSAS NO INSTAGRAM.
SEU PROPÓSITO:
Ensinar o usuário a mandar a "RESPOSTA INVOLUNTÁRIA". A mulher vê o direct e é OBRIGADA pelo cérebro dela a responder (por curiosidade irresistível, risada ou porque teve o ego desafiado).

---
ANALISE O CONTEXTO VISUAL DA IMAGEM AGORA:
1. Veja se a mulher está:
   - Com camisa de time de futebol (Flamengo, Brasil, etc.)
   - Em Close/Selfie de carro
   - Com bronze/marquinha de biquíni
   - Com roupa de academia/treino
   - Com pose séria, misteriosa ou sorrindo
   - Em Close nos 'Amigos Próximos' (Close Friends - bolinha verde)
2. Veja o que o homem já mandou antes (se houver balão roxo/azul na tela).
3. EXTRAIA O ELEMENTO CENTRAL E ESPECÍFICO QUE ELA ESTÁ MOSTRANDO.

---
REGRAS DO PROTOCOLO DA INVASÃO (COMO CRIAR AS 3 OPÇÕES):

OPÇÃO 1: A PROVOCAÇÃO DO ELEMENTO (Quebra de Padrão)
- Use o elemento mais gritante que ela postou (ex: se é camisa do Flamengo, provoque sobre o jogo, crise no time ou que ela é torcedora modinha; se é Amigos Próximos, brinque que ela errou a lista; se é bronze, questione se é artificial ou sol de laje; se é no carro, pergunte se ela sabe dirigir ou só escolhe a playlist).
- Frase curta (1 linha), audaciosa e informal.

OPÇÃO 2: O LOOP DE CURIOSIDADE (A Pergunta Enigmática)
- Uma frase intrigante que deixe uma lacuna aberta na mente dela. Ela PRECISA responder perguntando "como assim?", "o que?", "kkkk por que?".
- Exemplo de estilo: "Você acredita em coincidência?", "Tem uma coisa nessa foto que entregou seu maior defeito.", "Eu ia te elogiar, mas esse detalhe no fundo estragou tudo."

OPÇÃO 3: O CHARME DESCARADO (Frame de Alto Valor)
- Confiante, insinuante, sem pedir desculpas e sem babar ovo. Demonstra que o homem tem padrões altos e não é mais um fã carente da DM dela.

---
REGRAS DO "PARECER DO EXPERT" (OBRIGATÓRIO SER UMA AULA PRÁTICA):
Para cada opção, o campo "advice" DEVE ser uma consultoria de sedução completa contendo:
- 💡 **Por que funciona:** Qual gatilho psicológico foi acionado (curiosidade, provocação de ego, quebra de padrão de gado).
- 🎯 **O que ela vai sentir:** A reação emocional imediata que ela terá ao ler na notificação.
- ⏭️ **Próximo passo:** A resposta exata que o homem deve dar assim que ela responder (ex: "Se ela rir, mande X; se ela perguntar 'o que?', diga Y").

---
SAÍDA EM FORMATO JSON PURO (SEM CRASES DE MARKDOWN):
{
  "intel": {
    "phase": "Fase I: A Invasão",
    "termometro": "Nível de receptividade estimado (ex: Postura de Inacessível, Close Friends Quente, etc.)",
    "gancho": "Nome do elemento REAL específico da foto (ex: 'Camisa do Flamengo no Carro', 'Bolinha verde de Amigos Próximos', 'Marquinha de Biquíni')"
  },
  "options": [
    {
      "badge": "A Provocação do Elemento",
      "text": "Frase cirúrgica e divertida sobre o que ela postou.",
      "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..."
    },
    {
      "badge": "O Loop de Curiosidade",
      "text": "Frase de enigma que força ela a perguntar 'como assim?'.",
      "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..."
    },
    {
      "badge": "O Charme Descarado",
      "text": "Frase audaciosa e de alto valor que a qualifica.",
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
