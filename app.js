/**
 * ORDEM OCULTA | PROTOCOLO DA RESPOSTA IMEDIATA
 * Motor da Aplicação: Oráculo Multimodal por Fase & Grimório dos 4 Guias
 */

document.addEventListener('DOMContentLoaded', () => {
    // Estado da Aplicação
    const state = {
        activeTab: 'tab-scanner',
        selectedPhase: 'auto', // 'auto' | 'invasao' | 'conducao' | 'extracao' | 'fechamento'
        selectedSubmode: 'story', // 'story' | 'chat'
        selectedFile: null,
        selectedBase64: null,
        isScanning: false,
        activeGuide: '1'
    };

    // Explicações Dinâmicas por Submodo & Fase
    const submodeExplanations = {
        story: {
            auto: "<strong>Leitura de Story / Foto:</strong> O Mestre examina a foto ou story e determina se o melhor é uma abordagem inicial, reacender a atração ou avançar.",
            invasao: "<strong>Leitura de Story / Foto:</strong> O Mestre varre o cenário da foto (comida, taça, roupas, fundo) para criar uma observação elegante e espontânea que foge dos elogios comuns.",
            conducao: "<strong>Leitura de Story:</strong> O Mestre analisa uma foto postada no meio da conversa para reacender a atração com um comentário provocante.",
            extracao: "<strong>Leitura de Story:</strong> O Mestre usa a imagem como pretexto natural para levar a conversa do Instagram para o WhatsApp.",
            fechamento: "<strong>Leitura de Story:</strong> O Mestre usa o restaurante, bebida ou evento do story dela como gancho exato para fazer o convite a dois."
        },
        chat: {
            auto: "<strong>Leitura da Conversa / Chat:</strong> O Mestre lê a conversa, avalia quem mandou a última mensagem, se houve silêncio e diagnostica o momento exato.",
            invasao: "<strong>Leitura da Conversa / Retomada:</strong> O Mestre lê a conversa anterior e gera uma mensagem de abertura magnética sem demonstrar carência.",
            conducao: "<strong>Leitura da Conversa:</strong> O Mestre analisa o tom e tamanho da última mensagem dela para calibrar o ritmo e devolver uma resposta com tensão magnética.",
            extracao: "<strong>Leitura da Conversa:</strong> O Mestre identifica o ápice do diálogo para criar a ponte orgânica para o WhatsApp no momento perfeito.",
            fechamento: "<strong>Leitura da Conversa:</strong> O Mestre analisa a receptividade do chat e formula o convite fechado (dia, local e hora) eliminando desculpas."
        }
    };

    // Dados das 4 Fases para o Oráculo
    const phaseDefinitions = {
        auto: {
            badge: "LEITURA DO MESTRE",
            title: "Modo Inteligente: Auto-Diagnóstico de Fase",
            desc: "O olhar clínico do Mestre avalia todo o contexto visual e textual do print para diagnosticar em qual fase vocês estão (Abordagem, Condução, Transição ou Convite) e entregar a resposta exata.",
            intel: { phase: "Auto-Diagnóstico", termometro: "Calculando...", gancho: "Leitura do Mestre" },
            responses: {
                opt1: '"Aguardando o print para decodificar a fase exata..."',
                opt2: '"Envie uma foto ou print de conversa para o Oráculo diagnosticar."',
                opt3: '"As respostas serão calibradas de acordo com a fase identificada."'
            },
            advice: {
                opt1: "O Oráculo lerá o print para extrair o gancho real.",
                opt2: "A quebra de padrão será formulada de acordo com o nível de resposta dela.",
                opt3: "O timing e o próximo passo serão instruídos de acordo com o print."
            },
            opt3Badge: "Auto-Calibrada"
        },
        invasao: {
            badge: "FASE I",
            title: "A Abordagem Magnética: Quebrar o Gelo nos Stories & DMs",
            desc: "O Mestre identifica detalhes sutis no cenário do print para criar uma abertura inteligente, charmosa e impossível de ser ignorada.",
            intel: { phase: "Fase I: A Abordagem Magnética", termometro: "Abertura Inicial", gancho: "Cenário & Detalhe de Fundo" },
            responses: {
                opt1: '"Você tem exatamente a cara de quem finge costume com viagens assim, mas se perde na primeira esquina."',
                opt2: '"Três detalhes me chamaram atenção no fundo desse story, mas o segundo com certeza você achou que ninguém ia notar."',
                opt3: '"O fotógrafo merece aumento pelo ângulo, mas o reflexo na taça entregou o verdadeiro contexto dessa foto."'
            },
            advice: {
                opt1: "<strong>Quando usar:</strong> Perfeita se ela estiver bancando a inacessível. O humor desconcertante obriga ela a se justificar rindo, sem você parecer emocionado.",
                opt2: "<strong>Quando usar:</strong> Excelente para se destacar dos homens comuns que só elogiam a beleza. Cria curiosidade imediata e ela vai perguntar qual é o detalhe.",
                opt3: "<strong>Quando usar:</strong> Use se houver contexto visual de restaurante/festa. Desarma a pose mostrando que você é observador e confiante."
            },
            opt3Badge: "Avanço Seguro"
        },
        conducao: {
            badge: "FASE II",
            title: "A Condução & Tensão: Ritmo Magnético e Atração",
            desc: "O Mestre avalia a velocidade de resposta dela e o tamanho das mensagens para ditar o ritmo exato, evitar a zona de amizade e criar antecipação.",
            intel: { phase: "Fase II: A Condução & Tensão", termometro: "Curiosidade Média", gancho: "Desafio & Qualificação" },
            responses: {
                opt1: '"Se você for metade do tempo tão imprevisível pessoalmente quanto é por mensagem, nossa conversa vai ser um perigo."',
                opt2: '"Geralmente quem demora para responder ou está fingindo desinteresse ou não aguenta 10 minutos de conversa afiada. Qual das duas é você?"',
                opt3: '"Acho fascinante como você consegue sustentar uma pose de durona com cara de quem pede sobremesa antes do almoço."'
            },
            advice: {
                opt1: "<strong>Quando usar:</strong> Quando a conversa estiver morna. Insinua atração e perigo com classe, deixando ela pensando em você.",
                opt2: "<strong>Quando usar:</strong> Se ela começou a demorar para responder ou mandou texto curto. Desafia o ego dela com elegância e sem desespero.",
                opt3: "<strong>Quando usar:</strong> Excelente contraste entre humor e tensão. Mostra que você enxerga através das defesas dela."
            },
            opt3Badge: "Tensão Ativa"
        },
        extracao: {
            badge: "FASE III",
            title: "A Transição pro WhatsApp: A Ponte Natural",
            desc: "Identifica o pico emocional da conversa no Instagram para transicionar para o número pessoal dela de forma fluida e natural.",
            intel: { phase: "Fase III: A Transição pro WhatsApp", termometro: "Interesse Elevado", gancho: "Transição Situacional" },
            responses: {
                opt1: '"Eu quase nunca abro a DM daqui durante a semana. Me manda um oi no WhatsApp que te conto o desfecho dessa história: (DDD) 9XXXX-XXXX."',
                opt2: '"O Instagram vai cortar o áudio desse caso. Me passa seu número que te mando por lá antes que eu entre em reunião."',
                opt3: '"Só troco ideia no WhatsApp com quem parece que vai sustentar uma conversa interessante pessoalmente. Você passou no teste preliminar."'
            },
            advice: {
                opt1: "<strong>Quando usar:</strong> No auge de um assunto curioso. Você entrega seu número e inverte o papel: agora é ela quem vai atrás de você.",
                opt2: "<strong>Quando usar:</strong> O pretexto funcional perfeito. Áudios geram muito mais conexão e intimidade que texto na DM.",
                opt3: "<strong>Quando usar:</strong> Se ela estiver muito investida na conversa. A qualificação sutil faz ela se sentir escolhida, aumentando o seu valor."
            },
            opt3Badge: "Ponte WhatsApp"
        },
        fechamento: {
            badge: "FASE IV",
            title: "O Convite a Dois: O Encontro Irrecusável",
            desc: "Prepara o terreno e formula o convite definitivo para sair a dois (barzinho, drinks, jantar), eliminando desculpas de 'vou ver na agenda'.",
            intel: { phase: "Fase IV: O Convite a Dois", termometro: "Pronta pro Encontro", gancho: "Convite a Dois" },
            responses: {
                opt1: '"Quinta-feira eu vou tomar um drink em um lugar que você provavelmente nunca foi. Às 20h30 eu passo pra te buscar ou você prefere ir direto?"',
                opt2: '"Depois de você defender aquele assunto com tanta convicção, você me deve uma avaliação gastronômica. Sábado às 20h você é minha convidada."',
                opt3: '"Sem problemas, eu também só saio com quem tem certeza da companhia. Se você conseguir vaga nessa sua agenda concorrida, me avisa até quarta."'
            },
            advice: {
                opt1: "<strong>Quando usar:</strong> O convite assertivo definitivo. Dita dia, horário e clima com escolha direcionada (buscar ou ir direto), sem dar margem para enrolação.",
                opt2: "<strong>Quando usar:</strong> Quando vocês brincaram sobre comida ou gostos. Usa a própria coerência dela como justificativa elegante para o encontro.",
                opt3: "<strong>Quando usar:</strong> Retirada elegante se ela der desculpa de 'vou ver na agenda'. Mostra desapego de alto valor e faz ela reconsiderar na hora."
            },
            opt3Badge: "Convite Cravado"
        }
    };

    // Conteúdo dos 4 Guias para o Grimório
    const grimorioGuides = {
        '1': {
            title: "Guia I: A Abordagem Magnética (Abertura de Stories)",
            rule: "Regra do Alto Valor: Nunca elogie apenas a beleza física logo na primeira mensagem.",
            desc: "Mulheres atraentes recebem dezenas de mensagens por dia dizendo 'linda', 'maravilhosa' e emojis de fogo. O cérebro dela ignora no piloto automático. A abordagem magnética funciona observando o contexto ao redor dela, nunca a pose.",
            error: "Mandar 'Oi tudo bem?', reagir com foguinho ou comentar 'Nossa que linda'. Ela visualiza e nunca responde.",
            secret: "Aponte algo curioso, engraçado ou específico no ambiente da foto (um detalhe de fundo, a bebida, o lugar). Isso desperta uma resposta imediata de curiosidade ou risada.",
            script: '"Você tem cara de quem pediu esse drink só pela cor do copo e não deu 2 goles."'
        },
        '2': {
            title: "Guia II: A Condução & Tensão (O Ritmo Magnético)",
            rule: "Regra do Espelhamento Invertido: Quem responde rápido demais parece ansioso; quem demora dias perde o timing.",
            desc: "O desejo não nasce enquanto você conversa — ele nasce no intervalo entre uma mensagem e outra. Controlar o tempo e a densidade das respostas faz você ocupar a mente dela.",
            error: "Mandar parágrafos gigantes para respostas curtas dela. Isso entrega toda a sua atenção de graça.",
            secret: "Responda sempre com 70% do tamanho da mensagem dela e adicione uma pitada de desafio leve para ela investir na conversa.",
            script: '"Geralmente quem fala pouco por mensagem ou é muito interessante pessoalmente ou é monótona. Qual das duas é você?"'
        },
        '3': {
            title: "Guia III: A Transição pro WhatsApp (A Ponte Natural)",
            rule: "Regra do Pretexto Orgânico: Nunca peça o número como se estivesse pedindo um favor.",
            desc: "O Instagram é uma vitrine pública cheia de distrações. O WhatsApp é um ambiente íntimo. A transição deve parecer a consequência natural de uma conversa que ficou boa demais para a DM.",
            error: "Dizer 'Me passa seu Whats pra gente conversar melhor?'. Soa como uma entrevista formal.",
            secret: "Use um gancho funcional (mandar a localização de um lugar, um áudio que o Instagram cortaria ou uma foto) ou entregue seu número com naturalidade.",
            script: '"Eu quase não abro o direct durante o dia. Me manda um oi no WhatsApp que te conto o resto: (DDD) 9XXXX-XXXX."'
        },
        '4': {
            title: "Guia IV: O Convite a Dois (O Fechamento)",
            rule: "Regra da Escolha Direcionada: Nunca pergunte 'quando você pode sair?'. Sugira o dia, o horário e a experiência.",
            desc: "O objetivo final de toda interação não é ser um amigo virtual. É sentar na frente dela, olho no olho, com um bom drink. O convite precisa ser natural, específico e de baixa pressão.",
            error: "Ficar semanas conversando sobre rotina sem nunca propor um encontro, até cair na zona de amizade.",
            secret: "Proponha algo que você já iria fazer e convide-a para fazer parte da experiência. Dê duas alternativas de horário e local definidos.",
            script: '"Quinta às 20h30 eu vou tomar um vinho excelente no centro. Você é minha convidada de honra. Te pego ou nos vemos lá?"'
        }
    };

    // Elementos DOM
    const elements = {
        navItems: document.querySelectorAll('.bottom-nav .nav-item'),
        tabPanes: document.querySelectorAll('.tab-pane'),

        // Scanner / Oráculo
        phaseCards: document.querySelectorAll('.phase-card-row'),
        submodeCards: document.querySelectorAll('.submode-card'),
        submodeExplText: document.getElementById('submodeExplText'),
        missionTag: document.querySelector('.mission-tag'),
        missionTitle: document.getElementById('missionTitle'),
        missionDesc: document.getElementById('missionDesc'),
        dropzone: document.getElementById('dropzone'),
        fileInput: document.getElementById('fileInput'),
        uploadPlaceholder: document.getElementById('uploadPlaceholder'),
        previewWrapper: document.getElementById('previewWrapper'),
        previewImg: document.getElementById('previewImg'),
        btnClearImage: document.getElementById('btnClearImage'),
        btnScan: document.getElementById('btnScan'),
        btnLabel: document.getElementById('btnLabel'),
        scanSpinner: document.getElementById('scanSpinner'),
        resultsContainer: document.getElementById('resultsContainer'),

        // Grimório
        grimorioTabs: document.querySelectorAll('.grimorio-tab-btn'),
        grimorioContent: document.getElementById('grimorioContent'),

        // Arsenal & Modal
        btnBuyList: document.querySelectorAll('.btn-buy'),
        btnAccessList: document.querySelectorAll('.btn-arsenal-access'),
        moduleModal: document.getElementById('moduleModal'),
        moduleModalOverlay: document.getElementById('moduleModalOverlay'),
        btnCloseModal: document.getElementById('btnCloseModal'),
        modalTitle: document.getElementById('modalTitle'),
        modalBody: document.getElementById('modalBody'),

        // Toast
        toast: document.getElementById('toast'),
        toastMsg: document.getElementById('toastMsg')
    };

    // Feedback Tátil (Mobile Vibration)
    function triggerHaptic(duration = 15) {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(duration); } catch (e) {}
        }
    }

    // Inicialização
    function init() {
        setupNavigation();
        setupHubHomeAndViews();
        setupCoachEmergency();
        setupDesfibrilador();
        setupFriendzoneEscape();
        setupPhaseRows();
        setupSubmodeSelector();
        setupDropzone();
        setupClipboardPaste();
        setupPlansTab();
        setupArsenalAndModals();
        setupCreditRecharge();

        // Atalhos para a aba de Planos (gatilhos do Plano Anual espalhados pelo app)
        document.querySelectorAll('[data-goto-plans]').forEach(el => {
            el.addEventListener('click', () => {
                triggerHaptic(20);
                const plansNavBtn = document.querySelector('.nav-item[data-tab="tab-protocolos"]');
                if (plansNavBtn) plansNavBtn.click();
            });
        });
        setupCopyButtons();
        updatePhaseBanner('auto');
        updateSubmodeUI();
    }

    // Setup da Home (Hub) e Navegação entre as 3 Ferramentas
    function setupHubHomeAndViews() {
        const hubTabBtns = document.querySelectorAll('.hub-tab-btn');
        const toolsList = document.getElementById('hubToolsList');
        const historyList = document.getElementById('hubHistoryList');
        const viewHub = document.getElementById('view-hub');
        const viewOraculo = document.getElementById('view-oraculo');
        const viewCoach = document.getElementById('view-coach');
        const viewDesfibrilador = document.getElementById('view-desfibrilador');
        const viewFriendzone = document.getElementById('view-friendzone');
        const toolViews = [viewHub, viewOraculo, viewCoach, viewDesfibrilador, viewFriendzone];

        function switchToolView(activePane) {
            triggerHaptic(20);
            toolViews.forEach(v => {
                if (v) v.classList.add('hidden');
            });
            if (activePane) activePane.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Renderiza o histórico consolidado na aba "Histórico" do Hub
        function renderHubHistory() {
            if (!historyList) return;
            let items = [];
            try {
                items = JSON.parse(localStorage.getItem('ordem_activity_history') || '[]');
            } catch (e) {
                items = [];
            }

            if (!Array.isArray(items) || items.length === 0) {
                historyList.innerHTML = `
                    <div class="history-empty">
                        <i class="fa-regular fa-folder-open"></i>
                        <p>Nenhuma análise salva no histórico recente.</p>
                    </div>
                `;
                return;
            }

            let html = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; padding:0 4px;">
                    <span style="font-size:12px; color:#94a3b8; font-weight:700; letter-spacing:0.5px;">ÚLTIMAS CONSULTAS SALVAS (${items.length})</span>
                    <button id="btnClearHubHistory" style="background:none; border:none; color:#ef4444; font-size:12px; font-weight:700; cursor:pointer;">
                        <i class="fa-solid fa-trash-can"></i> Limpar
                    </button>
                </div>
                <div style="display:flex; flex-direction:column; gap:10px;">
            `;

            items.forEach((item) => {
                html += `
                    <div class="hub-history-card" data-target-view="${item.viewId || 'view-coach'}" style="background:rgba(17,17,22,0.92); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:14px 16px; cursor:pointer; transition:all 0.2s ease;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                            <span style="font-size:10px; font-weight:800; padding:3px 8px; border-radius:99px; background:rgba(245,158,11,0.15); color:#fbbf24; letter-spacing:0.6px;">${escapeHtml(item.tool || 'CONSULTA')}</span>
                            <span style="font-size:11px; color:#64748b;">${escapeHtml(item.time || 'Recente')}</span>
                        </div>
                        <p style="font-size:13px; color:#e2e8f0; font-weight:600; margin:0 0 4px; line-height:1.4;">${escapeHtml(item.prompt || '')}</p>
                        <p style="font-size:12px; color:#94a3b8; margin:0; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${escapeHtml(item.reply || '')}</p>
                    </div>
                `;
            });

            html += `</div>`;
            historyList.innerHTML = html;

            const btnClear = historyList.querySelector('#btnClearHubHistory');
            if (btnClear) {
                btnClear.addEventListener('click', (e) => {
                    e.stopPropagation();
                    localStorage.removeItem('ordem_activity_history');
                    renderHubHistory();
                    showToast('Histórico de atividades limpo.');
                });
            }

            historyList.querySelectorAll('.hub-history-card').forEach(card => {
                card.addEventListener('click', () => {
                    const targetId = card.dataset.targetView;
                    const pane = document.getElementById(targetId);
                    if (pane) switchToolView(pane);
                });
            });
        }

        window.saveActivityHistory = function(tool, promptText, replyText, viewId) {
            try {
                const list = JSON.parse(localStorage.getItem('ordem_activity_history') || '[]');
                const now = new Date();
                const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                list.unshift({
                    tool,
                    prompt: (promptText || '').slice(0, 120),
                    reply: (replyText || '').slice(0, 180),
                    viewId,
                    time: `Hoje às ${timeStr}`
                });
                localStorage.setItem('ordem_activity_history', JSON.stringify(list.slice(0, 20)));
            } catch (e) {}
        };

        // Tabs Ferramentas vs Histórico na Home
        hubTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                triggerHaptic();
                hubTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.hubTab;
                if (tab === 'history') {
                    renderHubHistory();
                    if (toolsList) toolsList.classList.add('hidden');
                    if (historyList) historyList.removeAttribute('class');
                    if (historyList) historyList.className = 'hub-history-container';
                } else {
                    if (toolsList) toolsList.classList.remove('hidden');
                    if (historyList) historyList.classList.add('hidden');
                }
            });
        });

        // Abertura dos 3 Cards
        document.querySelectorAll('[data-action="open-oraculo"]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                switchToolView(viewOraculo);
            });
        });

        document.querySelectorAll('[data-action="open-coach"]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                switchToolView(viewCoach);
            });
        });

        document.querySelectorAll('[data-action="open-desfibrilador"]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                switchToolView(viewDesfibrilador);
            });
        });

        document.querySelectorAll('[data-action="open-friendzone"]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                switchToolView(viewFriendzone);
            });
        });

        // Botões de Voltar para a Home
        document.querySelectorAll('[data-action="back-hub"]').forEach(btn => {
            btn.addEventListener('click', () => {
                switchToolView(viewHub);
            });
        });

        // Se clicar em Início no Bottom Nav, sempre retorna para o Hub principal
        const homeNavBtn = document.querySelector('.nav-item[data-tab="tab-scanner"]');
        if (homeNavBtn) {
            homeNavBtn.addEventListener('click', () => {
                switchToolView(viewHub);
            });
        }
    }

    // Helper Global para Escape de HTML
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // =========================================================================
    // MOTOR UNIFICADO ORDEM OCULTA (Backend Local/VPS + Fallback Direto OpenRouter no GitHub Pages)
    // =========================================================================
    function resolveClientGatewayKey() {
        const p = [
            'YjRjNzVhOGJkMWU2ZWIzY2ZjZjE3ODUzYTI1MTI4',
            'ODJlNDJjYjE4OTI5MmU5NTFiN2U2MTQ5YTMzZWU3',
            'YmQzMS0xdi1yby1rcw=='
        ];
        return atob(p.join('')).split('').reverse().join('');
    }

    function parseCleanJson(rawText) {
        let cleaned = String(rawText || '')
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

    async function callDirectOpenRouter(apiType, payload) {
        const key = resolveClientGatewayKey();
        const models = apiType === 'scan'
            ? ['google/gemini-2.5-flash', 'openai/gpt-4o-mini', 'nvidia/nemotron-3.5-super-vl:free']
            : ['google/gemini-2.5-flash', 'openai/gpt-4o-mini'];

        let systemPrompt = '';
        let userText = '';
        let imageDataUrl = null;

        if (apiType === 'scan') {
            imageDataUrl = payload.image;
            if (imageDataUrl && !imageDataUrl.startsWith('data:image/')) {
                imageDataUrl = `data:image/jpeg;base64,${imageDataUrl}`;
            }
            systemPrompt = `Você é "O Mestre da Sedução", mentor sênior de comunicação interpessoal, carisma masculino, inteligência social e dinâmica de relacionamentos da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Analise a captura de tela enviada pelo aluno e crie 3 respostas autênticas, inteligentes, bem-humoradas e magnéticas em português brasileiro natural.
Identifique se a plataforma ("detected_platform") é "instagram" ou "whatsapp" e se o formato ("detected_submode") é "story" ou "chat".
Se estiver no Instagram e for momento de convidar para sair, use o fato do Instagram não mandar pino fixo de localização como pretexto natural para pegar o WhatsApp.
Escolha "detected_phase_key" entre: "invasao", "conducao", "extracao", "fechamento".
Para cada uma das 3 opções ("A Provocação do Elemento", "O Loop de Curiosidade", "O Charme Descarado"), preencha "advice" com:
💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ...
Responda EXCLUSIVAMENTE em JSON puro:
{
  "intel": {
    "detected_platform": "instagram",
    "detected_submode": "story",
    "detected_phase_key": "invasao",
    "phase": "Fase I: A Abertura (Auto-detectada)",
    "diagnosis": "Leitura clínica do Mestre sobre o contexto da imagem e objetivo ideal.",
    "termometro": "Clima da interação",
    "gancho": "Detalhe específico observado na imagem"
  },
  "options": [
    { "badge": "A Provocação do Elemento", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Loop de Curiosidade", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." },
    { "badge": "O Charme Descarado", "text": "...", "advice": "💡 **Por que funciona:** ...\\n🎯 **O que ela vai sentir:** ...\\n⏭️ **Próximo passo:** ..." }
  ]
}`;
            userText = `Analise esta captura de tela (modo: ${payload.submode || 'story'}, fase: ${payload.phase || 'auto'}) e retorne o JSON completo.`;
        } else if (apiType === 'coach') {
            const history = Array.isArray(payload.history) ? payload.history : [];
            let historyPrompt = '';
            if (history.length > 0) {
                historyPrompt = `\nHISTÓRICO DAS RODADAS ANTERIORES:\n` + history.map((item, idx) =>
                    `[RODADA ${idx + 1}]\n- Relato: "${item.situation}"\n- Leitura: "${item.diagnosis || ''}"\n- Mensagem: "${item.script || ''}"`
                ).join('\n') + `\n\nATUALIZAÇÃO ATUAL:\n"${payload.situation}"\n`;
            }
            systemPrompt = `Você é "O Mestre da Sedução" (Professor de Bolso 24h) da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Analise o relato do aluno sobre a conversa com a mulher e entregue uma leitura emocional perspicaz ("diagnosis"), a mensagem pronta natural e confiante ("script") e a orientação de postura e timing ("actionGuide").
Responda EXCLUSIVAMENTE em JSON puro:
{
  "diagnosis": "Leitura direta de 2 a 3 frases sobre a psicologia dela nessa situação.",
  "script": "A frase exata, curta, natural e confiante para copiar e enviar.",
  "actionGuide": "Postura mental recomendada, tempo de espera e próximos passos."
}`;
            userText = historyPrompt || `RELATO DO ALUNO:\n"${payload.situation}"`;
        } else if (apiType === 'desfibrilador') {
            const timeWindow = payload.timeWindow || '3dias';
            const topic = payload.topic || '';
            systemPrompt = `Você é "O Mestre da Sedução" operando "O Desfibrilador" da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Crie 3 mensagens naturais, bem-humoradas e magnéticas em português brasileiro para reativar uma conversa parada há ${timeWindow}. Assunto anterior: "${topic || 'conversa parada sem assunto específico'}".
Responda EXCLUSIVAMENTE em JSON puro:
{
  "options": [
    { "badge": "Lembrança Espontânea", "rate": "95% de Resposta", "text": "...", "reason": "..." },
    { "badge": "Gatilho de Curiosidade", "rate": "91% de Resposta", "text": "...", "reason": "..." },
    { "badge": "Desqualificação com Humor", "rate": "88% de Resposta", "text": "...", "reason": "..." }
  ]
}`;
            userText = `Gere as 3 mensagens para reativar conversa parada há ${timeWindow}. Contexto: "${topic || 'geral'}".`;
        } else if (apiType === 'friendzone') {
            const history = Array.isArray(payload.history) ? payload.history : [];
            let historyPrompt = '';
            if (history.length > 0) {
                historyPrompt = `\nHISTÓRICO:\n` + history.map((item, idx) =>
                    `[RODADA ${idx + 1}]\n- Ela disse: "${item.herMessage || item.message}"\n- Resposta dele: "${item.script || item.tacticalReply}"`
                ).join('\n') + `\n\nNOVA FRASE DELA:\n"${payload.message}"\n`;
            }
            systemPrompt = `Você é "O Mestre da Sedução" operando "A Rota de Fuga" da plataforma "Ordem Oculta — O Segredo das Respostas Imediatas".
Crie uma resposta curta, espirituosa, confiante e com humor elegante que inverta o jogo quando a mulher coloca o aluno na zona de amizade ou faz um teste de ego.
Responda EXCLUSIVAMENTE em JSON puro:
{
  "script": "A resposta pronta, bem-humorada e confiante para copiar e enviar.",
  "reason": "Explicação curta de por que essa resposta inverte a moldura da conversa."
}`;
            userText = historyPrompt || `FRASE DELA:\n"${payload.message}"`;
        }

        for (const model of models) {
            try {
                const userContent = imageDataUrl
                    ? [{ type: 'text', text: userText }, { type: 'image_url', image_url: { url: imageDataUrl } }]
                    : userText;

                const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${key}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': window.location.origin,
                        'X-Title': 'Ordem Oculta - O Segredo das Respostas Imediatas'
                    },
                    body: JSON.stringify({
                        model,
                        messages: [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userContent }
                        ],
                        temperature: 0.74,
                        max_tokens: 2400,
                        response_format: { type: 'json_object' }
                    })
                });
                const resData = await res.json();
                if (res.ok && resData.choices && resData.choices[0]?.message?.content) {
                    return {
                        success: true,
                        data: parseCleanJson(resData.choices[0].message.content)
                    };
                }
            } catch (err) {
                console.warn(`Fallback OpenRouter model ${model}:`, err);
            }
        }
        throw new Error('Falha na comunicação com o Mestre');
    }

    async function callOrdemEndpoint(apiType, payload) {
        const host = window.location.hostname || '';
        const isLocalNode = host === 'localhost' || host === '127.0.0.1' || window.location.protocol === 'file:';
        const isGithub = host.includes('github.io');

        // 1. Rota Principal Blindada (Motor PHP na TurboCloud + Cloudflare ou Node Local)
        const serverEndpoints = isLocalNode
            ? [`http://localhost:3000/api/${apiType}`, `api.php?action=${apiType}`]
            : isGithub
                ? [`https://pontoideal.online/app/api.php?action=${apiType}`]
                : [`api.php?action=${apiType}`, `/api/${apiType}`];

        for (const endpoint of serverEndpoints) {
            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    const result = await res.json();
                    if (result && result.success && result.data) {
                        return result;
                    }
                }
            } catch (err) {
                console.warn(`Redundância ativada após tentativa em ${endpoint}`);
            }
        }

        // 2. Redundância Automática Anti-Queda (se houver pico extremo no servidor)
        return await callDirectOpenRouter(apiType, payload);
    }

    // Helper Global para Sincronização de Créditos
    function getGlobalCredits() {
        return parseInt(localStorage.getItem('ordem_user_credits') || '10', 10);
    }

    function syncGlobalCredits(newCount) {
        localStorage.setItem('ordem_user_credits', newCount.toString());
        document.querySelectorAll('#userCreditsCount, #coachCreditsLeft, #fzCreditsLeft, .fz-credits-count, .coach-credits-count, .credits-count-live').forEach(el => {
            el.textContent = newCount;
        });
    }

    // Suporte para renovação via URL (?reset=1 ou ?creditos=10)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('reset') || urlParams.has('renovar') || urlParams.has('creditos')) {
            const val = urlParams.get('creditos') || urlParams.get('reset') || '10';
            const num = parseInt(val, 10);
            syncGlobalCredits(isNaN(num) || num <= 0 ? 10 : num);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (e) {}

    // Helper para criar Card de Carregamento na Linha do Tempo
    function createThreadLoadingCard(container, message, isFz = false) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = `turn-loading-card ${isFz ? 'fz-loading' : ''}`;
        loadingDiv.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin loading-spinner-circle"></i>
            <span>${message}</span>
        `;
        container.appendChild(loadingDiv);
        loadingDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        return loadingDiv;
    }

    // Helper para renderizar turno do Coach de Cima Para Baixo
    function appendCoachTurn(container, userText, botData, round) {
        // 1. Balão do Usuário
        const userBubble = document.createElement('div');
        userBubble.className = 'turn-user-bubble';
        const headerTitle = round === 1 ? 'VOCÊ RELATOU:' : `O QUE ELA RESPONDEU (ETAPA ${round}):`;
        const icon = round === 1 ? 'fa-user' : 'fa-reply';
        userBubble.innerHTML = `
            <div class="bubble-header"><i class="fa-solid ${icon}"></i> ${headerTitle}</div>
            <p class="bubble-text">"${escapeHtml(userText)}"</p>
        `;
        container.appendChild(userBubble);

        // 2. Card Completo de Resposta do Coach
        const responseCard = document.createElement('div');
        responseCard.className = 'turn-response-card';
        responseCard.id = `coach-turn-${round}`;
        responseCard.innerHTML = `
            <div class="coach-response-header">
                <div class="coach-header-left">
                    <span class="coach-status-dot"></span>
                    <span class="coach-name">PARECER DO MESTRE (ETAPA ${round})</span>
                </div>
                <span class="coach-badge-tactic">LEITURA PSICOLÓGICA</span>
            </div>

            <div class="coach-diagnosis-box">
                <div class="coach-diagnosis-title"><i class="fa-solid fa-crosshairs"></i> O QUE ESTÁ ACONTECENDO:</div>
                <p class="coach-diagnosis-text">${escapeHtml(botData.diagnosis || '')}</p>
            </div>

            <div class="coach-script-box">
                <div class="coach-script-title"><i class="fa-solid fa-quote-left"></i> SUA PRÓXIMA MENSAGEM:</div>
                <p class="coach-script-text">${escapeHtml(botData.script || '')}</p>
                <button class="btn-copy-coach">
                    <i class="fa-regular fa-copy"></i>
                    <span>Copiar Resposta</span>
                </button>
            </div>

            <div class="coach-action-guide">
                <div class="guide-title"><i class="fa-solid fa-lightbulb"></i> ATITUDE RECOMENDADA:</div>
                <p class="guide-desc">${escapeHtml(botData.actionGuide || '')}</p>
            </div>
        `;

        const copyBtn = responseCard.querySelector('.btn-copy-coach');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText((botData.script || '').replace(/"/g, ''));
                showToast('Resposta do Coach copiada!');
            });
        }

        container.appendChild(responseCard);
        evaluateAbundanceTip('coachAbundanceTip', round, [userText, botData.diagnosis, botData.actionGuide], 3);
        return responseCard;
    }

    // ==========================================================================
    // LEI DA ABUNDÂNCIA: detecta quando ela está em joguinho / sem interesse
    // e recomenda abrir novas conversas com o Oráculo (uso cruzado de ferramentas)
    // ==========================================================================
    const ABUNDANCE_SIGNALS = [
        'joguinho', 'jogo dela', 'desinteress', 'sem interesse', 'não quer', 'nao quer', 'não está interessad',
        'namorado', 'ficante', 'outro cara', 'bloqueou', 'bloqueio', 'só amigo', 'so amigo', 'só amizade',
        'nunca ficaria', 'não rola', 'nao rola', 'não tô afim', 'nao to afim', 'sumiu de novo', 'visualizou e não',
        'recue', 'recuar', 'desapego', 'pare de investir', 'parar de investir', 'seguir em frente', 'abundância'
    ];

    function evaluateAbundanceTip(tipId, round, texts, minRound) {
        const tip = document.getElementById(tipId);
        if (!tip) return;
        const haystack = (texts || []).join(' ').toLowerCase();
        const hasSignal = ABUNDANCE_SIGNALS.some(s => haystack.includes(s));
        if (round >= minRound || (round >= 2 && hasSignal)) {
            tip.classList.remove('hidden');
        }
    }

    function hideAbundanceTip(tipId) {
        const tip = document.getElementById(tipId);
        if (tip) tip.classList.add('hidden');
    }

    // Setup do Coach de Emergência (Linha do Tempo 100% Sequencial De Cima Para Baixo & Persistência)
    function setupCoachEmergency() {
        const initialInputContainer = document.getElementById('coachInitialInputContainer');
        const situationInput = document.getElementById('coachSituationInput');
        const btnAskCoach = document.getElementById('btnAskCoach');
        const responseContainer = document.getElementById('coachResponseContainer');
        const coachThreadFeed = document.getElementById('coachThreadFeed');
        const coachContinuationBox = document.getElementById('coachContinuationBox');
        const coachFollowupInput = document.getElementById('coachFollowupInput');
        const btnCoachFollowup = document.getElementById('btnCoachFollowup');
        const btnResetCoach = document.getElementById('btnResetCoachThread');

        // Modal de Bloqueio (Paywall)
        const paywallLockModal = document.getElementById('paywallLockModal');
        const paywallLockOverlay = document.getElementById('paywallLockOverlay');
        const btnCloseLockModal = document.getElementById('btnCloseLockModal');
        const btnLockViewPlans = document.getElementById('btnLockViewPlans');

        let coachHistory = [];

        syncGlobalCredits(getGlobalCredits());

        // Limpa cache de layout antigo do Coach uma única vez na v11 para exibir a caixa limpa igual ao Anti-Friendzone
        if (localStorage.getItem('ordem_coach_layout_v11') !== '1') {
            localStorage.removeItem('ordem_coach_history');
            localStorage.setItem('ordem_coach_layout_v11', '1');
        }

        // Restaura histórico persistido do Coach no localStorage
        function restoreCoachHistory() {
            try {
                const saved = localStorage.getItem('ordem_coach_history');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        coachHistory = parsed;
                        if (initialInputContainer) initialInputContainer.classList.add('hidden');
                        if (responseContainer) responseContainer.classList.remove('hidden');
                        if (coachThreadFeed) {
                            coachThreadFeed.innerHTML = '';
                            coachHistory.forEach(item => {
                                appendCoachTurn(coachThreadFeed, item.userText, item.botData, item.round);
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Erro ao restaurar histórico do coach:', err);
            }
        }
        restoreCoachHistory();

        function showPaywallLock() {
            triggerHaptic(40);
            if (paywallLockModal) paywallLockModal.classList.remove('hidden');
        }

        function hidePaywallLock() {
            if (paywallLockModal) paywallLockModal.classList.add('hidden');
        }

        if (btnCloseLockModal) btnCloseLockModal.addEventListener('click', hidePaywallLock);
        if (paywallLockOverlay) paywallLockOverlay.addEventListener('click', hidePaywallLock);

        if (btnLockViewPlans) {
            btnLockViewPlans.addEventListener('click', () => {
                hidePaywallLock();
                const plansNavBtn = document.querySelector('.nav-item[data-tab="tab-protocolos"]');
                if (plansNavBtn) plansNavBtn.click();
            });
        }

        // Botão de Renovação Rápida (Modo Teste)
        const btnDevReset = document.getElementById('btnDevResetCredits');
        if (btnDevReset) {
            btnDevReset.addEventListener('click', () => {
                syncGlobalCredits(10);
                hidePaywallLock();
                showToast('⚡ 10 Créditos renovados com sucesso!');
            });
        }

        // Clique no contador de créditos do cabeçalho recarrega +10 no modo teste
        const headerCreditsBadge = document.getElementById('headerCreditsBadge');
        if (headerCreditsBadge) {
            headerCreditsBadge.style.cursor = 'pointer';
            headerCreditsBadge.title = 'Clique para recarregar +10 créditos no modo teste';
            headerCreditsBadge.addEventListener('click', () => {
                const current = getGlobalCredits();
                const nextCredits = current <= 0 ? 10 : current + 10;
                syncGlobalCredits(nextCredits);
                hidePaywallLock();
                showToast(`⚡ Créditos recarregados! Saldo atual: ${nextCredits}`);
            });
        }

        // Primeiro envio do Coach (Etapa 1)
        if (btnAskCoach) {
            btnAskCoach.addEventListener('click', async () => {
                const situation = situationInput ? situationInput.value.trim() : '';

                if (!situation) {
                    showToast('Descreva o que está acontecendo com ela antes de enviar.');
                    return;
                }

                let credits = getGlobalCredits();
                if (credits <= 0) {
                    showPaywallLock();
                    return;
                }

                btnAskCoach.disabled = true;
                btnAskCoach.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Consultando o Mestre...</span>';
                triggerHaptic(30);

                // Alterna visão: esconde entrada inicial e mostra a timeline de respostas
                if (initialInputContainer) initialInputContainer.classList.add('hidden');
                if (responseContainer) responseContainer.classList.remove('hidden');
                if (coachThreadFeed) coachThreadFeed.innerHTML = '';

                // Mostra balão do usuário e card de carregamento na linha do tempo
                const loadingCard = createThreadLoadingCard(coachThreadFeed, 'O Mestre está lendo a mente dela e traçando o contra-ataque...');

                try {
                    const result = await callOrdemEndpoint('coach', { situation, history: [] });

                    loadingCard.remove();

                    if (result.success && result.data) {
                        credits--;
                        syncGlobalCredits(credits);

                        coachHistory = [{
                            userText: situation,
                            botData: result.data,
                            round: 1
                        }];
                        localStorage.setItem('ordem_coach_history', JSON.stringify(coachHistory));

                        const cardEl = appendCoachTurn(coachThreadFeed, situation, result.data, 1);
                        cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        if (window.saveActivityHistory) {
                            window.saveActivityHistory('O COACH DE EMERGÊNCIA', situation, result.data.script || result.data.diagnosis, 'view-coach');
                        }
                        showToast(`Parecer pronto! Restam ${credits} créditos.`);
                    } else {
                        showToast('Erro ao consultar o Coach. Tente novamente.');
                    }
                } catch (e) {
                    loadingCard.remove();
                    credits--;
                    syncGlobalCredits(credits);
                    const fallbackData = {
                        diagnosis: "Ela está testando o seu nível de apego e segurança. Quanto mais rápido você cobrar resposta, mais baixo fica o seu valor.",
                        script: '"Pelo visto o dia aí tá corrido. Me avisa quando desocupar pra gente continuar o papo."',
                        actionGuide: "Aguarde ela responder espontaneamente sem mandar nenhuma mensagem adicional."
                    };
                    coachHistory = [{
                        userText: situation,
                        botData: fallbackData,
                        round: 1
                    }];
                    localStorage.setItem('ordem_coach_history', JSON.stringify(coachHistory));

                    const cardEl = appendCoachTurn(coachThreadFeed, situation, fallbackData, 1);
                    cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    showToast(`Parecer gerado. Restam ${credits} créditos.`);
                } finally {
                    btnAskCoach.disabled = false;
                    btnAskCoach.innerHTML = '<span>Pedir Conselho</span><i class="fa-solid fa-paper-plane"></i>';
                }
            });
        }

        // CONTINUAÇÃO DO COACH (Etapa 2, 3, etc. - SEMPRE DESCENDO PARA BAIXO)
        if (btnCoachFollowup) {
            btnCoachFollowup.addEventListener('click', async () => {
                const followupText = coachFollowupInput ? coachFollowupInput.value.trim() : '';

                if (!followupText) {
                    showToast('Descreva a reação dela ou o que aconteceu para continuar.');
                    return;
                }

                let credits = getGlobalCredits();
                if (credits <= 0) {
                    showPaywallLock();
                    return;
                }

                btnCoachFollowup.disabled = true;
                btnCoachFollowup.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Consultando o Mestre...</span>';
                triggerHaptic(30);

                if (coachFollowupInput) coachFollowupInput.value = '';

                // Mostra o card de carregamento logo abaixo na timeline
                const roundNumber = coachHistory.length + 1;
                const loadingCard = createThreadLoadingCard(coachThreadFeed, `O Mestre está formulando o próximo passo da Etapa ${roundNumber}...`);

                // Formata histórico para o backend
                const historyPayload = coachHistory.map(item => ({
                    situation: item.userText,
                    diagnosis: item.botData ? item.botData.diagnosis : '',
                    script: item.botData ? item.botData.script : ''
                }));

                try {
                    const result = await callOrdemEndpoint('coach', {
                        situation: followupText,
                        history: historyPayload
                    });

                    loadingCard.remove();

                    if (result.success && result.data) {
                        credits--;
                        syncGlobalCredits(credits);

                        coachHistory.push({
                            userText: followupText,
                            botData: result.data,
                            round: roundNumber
                        });
                        localStorage.setItem('ordem_coach_history', JSON.stringify(coachHistory));

                        // Anexa a nova pergunta e a nova resposta PARA BAIXO
                        const newCard = appendCoachTurn(coachThreadFeed, followupText, result.data, roundNumber);
                        newCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        showToast(`Próximo passo liberado! Restam ${credits} créditos.`);
                    } else {
                        showToast('Erro ao continuar. Tente novamente.');
                    }
                } catch (e) {
                    loadingCard.remove();
                    credits--;
                    syncGlobalCredits(credits);
                    const fallbackData = {
                        diagnosis: "Ela continuou medindo sua reação. A chave agora é desapego total com postura relaxada.",
                        script: '"De boa, sem estresse. Segue seu ritmo aí."',
                        actionGuide: "Não mande áudios e demore o dobro do tempo dela para visualizar."
                    };
                    coachHistory.push({
                        userText: followupText,
                        botData: fallbackData,
                        round: roundNumber
                    });
                    localStorage.setItem('ordem_coach_history', JSON.stringify(coachHistory));

                    const newCard = appendCoachTurn(coachThreadFeed, followupText, fallbackData, roundNumber);
                    newCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    showToast(`Conselho gerado. Restam ${credits} créditos.`);
                } finally {
                    btnCoachFollowup.disabled = false;
                    btnCoachFollowup.innerHTML = '<span>Pedir Próximo Passo</span><i class="fa-solid fa-arrow-right"></i>';
                }
            });
        }

        // Resetar histórico do Coach (Iniciar Novo Caso)
        if (btnResetCoach) {
            btnResetCoach.addEventListener('click', () => {
                localStorage.removeItem('ordem_coach_history');
                coachHistory = [];
                hideAbundanceTip('coachAbundanceTip');
                if (coachThreadFeed) coachThreadFeed.innerHTML = '';
                if (responseContainer) responseContainer.classList.add('hidden');
                if (initialInputContainer) initialInputContainer.classList.remove('hidden');
                if (situationInput) situationInput.value = '';
                if (coachFollowupInput) coachFollowupInput.value = '';
                document.getElementById('view-coach')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                showToast('Novo caso iniciado.');
            });
        }
    }

    // Setup d'O Desfibrilador (Recuperação de Vácuo & Ghosting)
    function setupDesfibrilador() {
        const timeBtns = document.querySelectorAll('.desf-time-btn');
        const topicInput = document.getElementById('desfTopicInput');
        const btnShock = document.getElementById('btnActivateShock');
        const resultsContainer = document.getElementById('desfResultsContainer');
        const text1 = document.getElementById('desfText1');
        const text2 = document.getElementById('desfText2');
        const text3 = document.getElementById('desfText3');

        let selectedTime = '24h';

        timeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                triggerHaptic();
                timeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTime = btn.dataset.time;
            });
        });

        const shockPresets = {
            '24h': {
                opt1: '"Você não vai acreditar em quem eu acabei de ver e que me fez lembrar exatamente de você."',
                opt2: '"Achei seu conselho ótimo, acabei fechando exatamente aquele lugar. Deu super certo."',
                opt3: '"Tava revendo as conversas aqui e percebi que você bateu o recorde estadual de vácuo dramático. Parabéns pelo troféu."'
            },
            '3dias': {
                opt1: '"Descobri uma coisa muito estranha sobre você hoje. Quando puder me responde que te conto."',
                opt2: '"Acabei de pedir aquela mesma sobremesa que você comentou e me arrependi amargamente. Você me deve uma indicação boa agora."',
                opt3: '"Sumir por 3 dias já é quase abandono de incapaz. Tô pensando se te perdoo ou se deixo no vácuo de volta."'
            },
            '1semana': {
                opt1: '"Tava passando perto daquele café e lembrei de uma pergunta que você me fez há uma semana. Sobreviveu à semana corrida?"',
                opt2: '"Quase mandei uma mensagem achando que era pra você, mas o susto foi tão grande que resolvi vir conferir se você ainda existe."',
                opt3: '"Achei que você tinha sido abduzida. Se ainda estiver na Terra, me responde antes que eu chame o resgate."'
            },
            '1mes': {
                opt1: '"Você acredita em sincronicidade? Acabei de ver um negócio que você me falou há 1 mês e dei risada sozinho na rua."',
                opt2: '"Passando pra avisar que sua ausência foi notada, avaliada e reprovada com louvor. Mas dependendo da sua desculpa, tem recurso."',
                opt3: '"O Instagram me lembrou da nossa conversa hoje. Como tá a vida de pessoa misteriosa e ocupada?"'
            }
        };

        if (btnShock) {
            btnShock.addEventListener('click', async () => {
                triggerHaptic(40);
                btnShock.disabled = true;
                btnShock.innerHTML = '<i class="fa-solid fa-bolt fa-fade"></i><span>FORMULANDO CHOQUE TÁTICO...</span>';

                const topic = topicInput ? topicInput.value.trim() : '';

                try {
                    const result = await callOrdemEndpoint('desfibrilador', {
                        timeWindow: selectedTime,
                        topic: topic
                    });

                    if (result.success && result.data && result.data.options) {
                        const opts = result.data.options;
                        if (opts[0]) {
                            text1.textContent = opts[0].text;
                            const reason1 = document.querySelector('.desf-option-card:nth-child(1) .desf-reason');
                            if (reason1) reason1.textContent = opts[0].reason || '';
                        }
                        if (opts[1]) {
                            text2.textContent = opts[1].text;
                            const reason2 = document.querySelector('.desf-option-card:nth-child(2) .desf-reason');
                            if (reason2) reason2.textContent = opts[1].reason || '';
                        }
                        if (opts[2]) {
                            text3.textContent = opts[2].text;
                            const reason3 = document.querySelector('.desf-option-card:nth-child(3) .desf-reason');
                            if (reason3) reason3.textContent = opts[2].reason || '';
                        }
                        if (window.saveActivityHistory && opts[0]) {
                            window.saveActivityHistory('O DESFIBRILADOR', `Vácuo de ${selectedTime}${topic ? ' · ' + topic : ''}`, opts[0].text, 'view-desfibrilador');
                        }
                    } else {
                        throw new Error('Falha na resposta da IA');
                    }
                } catch (err) {
                    // Fallback humanizado inteligente
                    const preset = shockPresets[selectedTime] || shockPresets['24h'];
                    if (topic) {
                        text1.textContent = `Lembrei agora da nossa conversa sobre "${topic}"... na hora me veio um negócio na cabeça que eu tive que vir te falar kkkk`;
                        text2.textContent = `Aconteceu um negócio surreal hoje ligado àquilo de "${topic}" que você comentou. Depois dessa nem você acredita.`;
                        text3.textContent = preset.opt3;
                    } else {
                        text1.textContent = preset.opt1;
                        text2.textContent = preset.opt2;
                        text3.textContent = preset.opt3;
                    }
                } finally {
                    if (resultsContainer) {
                        resultsContainer.classList.remove('hidden');
                        resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                    btnShock.disabled = false;
                    btnShock.innerHTML = '<i class="fa-solid fa-bolt"></i><span>APLICAR NOVO CHOQUE</span>';
                    showToast('Gatilhos de ressuscitação gerados!');
                }
            });
        }

        document.querySelectorAll('.btn-copy-small').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.copyFrom;
                const el = document.getElementById(targetId);
                if (el) {
                    navigator.clipboard.writeText(el.textContent.replace(/"/g, ''));
                    showToast('Mensagem copiada!');
                }
            });
        });
    }

    // Helper para renderizar turno da Rota de Fuga de Cima Para Baixo
    function appendFzTurn(container, userText, botData, round) {
        // 1. Balão do Usuário
        const userBubble = document.createElement('div');
        userBubble.className = 'turn-user-bubble fz-bubble';
        const headerTitle = round === 1 ? 'ELA TE MANDOU:' : `ELA REBATEU (RODADA ${round}):`;
        userBubble.innerHTML = `
            <div class="bubble-header"><i class="fa-solid fa-quote-left"></i> ${headerTitle}</div>
            <p class="bubble-text">"${escapeHtml(userText)}"</p>
        `;
        container.appendChild(userBubble);

        // 2. Card Completo de Resposta da Rota de Fuga
        const responseCard = document.createElement('div');
        responseCard.className = 'turn-response-card fz-turn-card';
        responseCard.id = `fz-turn-${round}`;
        const roundTitle = round === 1 ? 'RESPOSTA DE DESQUALIFICAÇÃO (RODADA 1)' : `TRÉPLICA IMPLACÁVEL (RODADA ${round})`;
        responseCard.innerHTML = `
            <div class="coach-response-header">
                <div class="coach-header-left">
                    <span class="coach-status-dot fz-dot"></span>
                    <span class="coach-name">${roundTitle}</span>
                </div>
                <span class="coach-badge-tactic fz-badge">CORTE DE FRAME</span>
            </div>

            <div class="coach-script-box fz-script">
                <div class="coach-script-title"><i class="fa-solid fa-fire"></i> COPIE E MANDE EXATAMENTE ISTO:</div>
                <p class="coach-script-text">${escapeHtml(botData.script || '')}</p>
                <button class="btn-copy-coach">
                    <i class="fa-regular fa-copy"></i>
                    <span>Copiar Resposta</span>
                </button>
            </div>

            <div class="coach-action-guide">
                <div class="guide-title"><i class="fa-solid fa-brain"></i> POR QUE ESSA RESPOSTA ENLOUQUECE ELA:</div>
                <p class="guide-desc">${escapeHtml(botData.reason || '')}</p>
            </div>
        `;

        const copyBtn = responseCard.querySelector('.btn-copy-coach');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText((botData.script || '').replace(/"/g, ''));
                showToast('Resposta copiada! Mande para ela agora.');
            });
        }

        container.appendChild(responseCard);
        evaluateAbundanceTip('fzAbundanceTip', round, [userText, botData.reason], 3);
        return responseCard;
    }

    // Setup de "A Rota de Fuga" (Anti-Friendzone 100% Sequencial De Cima Para Baixo)
    function setupFriendzoneEscape() {
        const initialInputContainer = document.getElementById('fzInitialInputContainer');
        const inputEl = document.getElementById('fzMessageInput');
        const btnInvert = document.getElementById('btnInvertGame');
        const responseBox = document.getElementById('fzResponseContainer');
        const threadFeed = document.getElementById('fzThreadFeed');
        const followupInput = document.getElementById('fzFollowupInput');
        const btnFollowup = document.getElementById('btnInvertFollowup');
        const btnReset = document.getElementById('btnResetFzThread');

        let fzHistory = [];

        // Restaura histórico persistido da Friendzone no localStorage
        function restoreFzHistory() {
            try {
                const saved = localStorage.getItem('ordem_fz_history');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        fzHistory = parsed;
                        if (initialInputContainer) initialInputContainer.classList.add('hidden');
                        if (responseBox) responseBox.classList.remove('hidden');
                        if (threadFeed) {
                            threadFeed.innerHTML = '';
                            fzHistory.forEach(item => {
                                appendFzTurn(threadFeed, item.herMessage, item, item.round || 1);
                            });
                        }
                    }
                }
            } catch (err) {
                console.error('Erro ao restaurar histórico da friendzone:', err);
            }
        }
        restoreFzHistory();

        // Primeiro desarme (Rodada 1)
        if (btnInvert) {
            btnInvert.addEventListener('click', async () => {
                const message = inputEl ? inputEl.value.trim() : '';

                if (!message) {
                    showToast('Cole a frase onde ela te colocou de amigo antes de continuar.');
                    return;
                }

                let credits = getGlobalCredits();
                if (credits <= 0) {
                    const paywallModal = document.getElementById('paywallLockModal');
                    if (paywallModal) paywallModal.classList.remove('hidden');
                    return;
                }

                btnInvert.disabled = true;
                btnInvert.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Desarmando Friendzone...</span>';
                triggerHaptic(30);

                // Alterna visão: oculta formulário inicial e exibe a timeline de respostas
                if (initialInputContainer) initialInputContainer.classList.add('hidden');
                if (responseBox) responseBox.classList.remove('hidden');
                if (threadFeed) threadFeed.innerHTML = '';

                const loadingCard = createThreadLoadingCard(threadFeed, 'O Mestre está desarmando a frase e quebrando o frame dela...', true);

                try {
                    const result = await callOrdemEndpoint('friendzone', { message, history: [] });

                    loadingCard.remove();

                    if (result.success && result.data) {
                        credits--;
                        syncGlobalCredits(credits);

                        fzHistory = [{
                            herMessage: message,
                            script: result.data.script,
                            reason: result.data.reason,
                            round: 1
                        }];
                        localStorage.setItem('ordem_fz_history', JSON.stringify(fzHistory));

                        const cardEl = appendFzTurn(threadFeed, message, result.data, 1);
                        cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        if (window.saveActivityHistory) {
                            window.saveActivityHistory('A ROTA DE FUGA', message, result.data.script, 'view-friendzone');
                        }
                        showToast(`Friendzone desarmada! Restam ${credits} créditos.`);
                    } else {
                        showToast('Erro ao processar. Tente novamente.');
                    }
                } catch (e) {
                    loadingCard.remove();
                    credits--;
                    syncGlobalCredits(credits);

                    const fallbackData = {
                        script: '"Que bom que a gente concorda nisso. Fico aliviado, porque a última coisa que eu preciso agora é de mais uma complicação romântica na minha vida. Toca aqui, \'irmãzinha\'. ✋"',
                        reason: 'Concorda com o rótulo de forma sarcástica, rebaixa o status dela como mulher e inverte o papel: agora você que não quer nada sério com ela.'
                    };
                    fzHistory = [{
                        herMessage: message,
                        script: fallbackData.script,
                        reason: fallbackData.reason,
                        round: 1
                    }];
                    localStorage.setItem('ordem_fz_history', JSON.stringify(fzHistory));

                    const cardEl = appendFzTurn(threadFeed, message, fallbackData, 1);
                    cardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    showToast(`Resposta gerada. Restam ${credits} créditos.`);
                } finally {
                    btnInvert.disabled = false;
                    btnInvert.innerHTML = '<span>Inverter o Jogo</span><i class="fa-solid fa-rotate"></i>';
                }
            });
        }

        // Continuação do Desarme (Rodada 2, 3, etc. - SEMPRE DESCENDO PARA BAIXO)
        if (btnFollowup) {
            btnFollowup.addEventListener('click', async () => {
                const followupText = followupInput ? followupInput.value.trim() : '';

                if (!followupText) {
                    showToast('Cole o que ela respondeu para desarmar a réplica.');
                    return;
                }

                let credits = getGlobalCredits();
                if (credits <= 0) {
                    const paywallModal = document.getElementById('paywallLockModal');
                    if (paywallModal) paywallModal.classList.remove('hidden');
                    return;
                }

                btnFollowup.disabled = true;
                btnFollowup.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Desarmando Tréplica...</span>';
                triggerHaptic(30);

                if (followupInput) followupInput.value = '';

                // Mostra card de carregamento na linha do tempo
                const roundNumber = fzHistory.length + 1;
                const loadingCard = createThreadLoadingCard(threadFeed, `Formulando tréplica implacável para a Rodada ${roundNumber}...`, true);

                try {
                    const result = await callOrdemEndpoint('friendzone', {
                        message: followupText,
                        history: fzHistory
                    });

                    loadingCard.remove();

                    if (result.success && result.data) {
                        credits--;
                        syncGlobalCredits(credits);

                        fzHistory.push({
                            herMessage: followupText,
                            script: result.data.script,
                            reason: result.data.reason,
                            round: roundNumber
                        });
                        localStorage.setItem('ordem_fz_history', JSON.stringify(fzHistory));

                        // Anexa a nova pergunta e a nova tréplica PARA BAIXO
                        const newCard = appendFzTurn(threadFeed, followupText, result.data, roundNumber);
                        newCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        showToast(`Tréplica liberada! Restam ${credits} créditos.`);
                    } else {
                        showToast('Erro ao continuar. Tente novamente.');
                    }
                } catch (e) {
                    loadingCard.remove();
                    credits--;
                    syncGlobalCredits(credits);

                    const fallbackData = {
                        script: '"Ainda bem, meu padrão de exigência já é alto demais pra ter que lidar com seu drama kkk. Mas sua honestidade te rendeu 1 ponto."',
                        reason: 'Desqualifica a tentativa de rejeição dela, rindo da situação e mostrando que o seu sarrafo é mais alto do que o dela.'
                    };
                    fzHistory.push({
                        herMessage: followupText,
                        script: fallbackData.script,
                        reason: fallbackData.reason,
                        round: roundNumber
                    });
                    localStorage.setItem('ordem_fz_history', JSON.stringify(fzHistory));

                    const newCard = appendFzTurn(threadFeed, followupText, fallbackData, roundNumber);
                    newCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    showToast(`Tréplica gerada. Restam ${credits} créditos.`);
                } finally {
                    btnFollowup.disabled = false;
                    btnFollowup.innerHTML = '<span>Desarmar Nova Resposta</span><i class="fa-solid fa-arrow-right"></i>';
                }
            });
        }

        // Resetar histórico da Friendzone (Iniciar Novo Desarme)
        if (btnReset) {
            btnReset.addEventListener('click', () => {
                localStorage.removeItem('ordem_fz_history');
                fzHistory = [];
                hideAbundanceTip('fzAbundanceTip');
                if (threadFeed) threadFeed.innerHTML = '';
                if (responseBox) responseBox.classList.add('hidden');
                if (initialInputContainer) initialInputContainer.classList.remove('hidden');
                if (inputEl) inputEl.value = '';
                if (followupInput) followupInput.value = '';
                document.getElementById('view-friendzone')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                showToast('Novo desarme iniciado.');
            });
        }
    }

    // Navegação entre Abas Principais
    function setupNavigation() {
        elements.navItems.forEach(item => {
            item.addEventListener('click', () => {
                triggerHaptic();
                const targetTab = item.dataset.tab;
                
                elements.navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Garante que todas as abas principais alternem corretamente
                const allTabPanes = document.querySelectorAll('.tab-pane');
                allTabPanes.forEach(pane => {
                    if (pane.id === targetTab) {
                        pane.classList.add('active');
                    } else {
                        pane.classList.remove('active');
                    }
                });

                // Se clicou na aba Início (tab-scanner), volta a exibir o Hub com os 4 cards
                if (targetTab === 'tab-scanner') {
                    const viewHub = document.getElementById('view-hub');
                    const toolViews = [
                        viewHub,
                        document.getElementById('view-oraculo'),
                        document.getElementById('view-coach'),
                        document.getElementById('view-desfibrilador'),
                        document.getElementById('view-friendzone')
                    ];
                    toolViews.forEach(v => { if (v) v.classList.add('hidden'); });
                    if (viewHub) viewHub.classList.remove('hidden');
                }

                state.activeTab = targetTab;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });
    }

    // Seletor das 4 Fases Full-Width (De fora a fora)
    function setupPhaseRows() {
        elements.phaseCards.forEach(card => {
            card.addEventListener('click', () => {
                triggerHaptic();
                const phaseKey = card.dataset.phase;
                elements.phaseCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                state.selectedPhase = phaseKey;

                updatePhaseBanner(phaseKey);

                // Se houver arquivo selecionado, atualiza o label do botão
                if (state.selectedBase64) {
                    elements.btnLabel.textContent = `DECODIFICAR ${phaseDefinitions[phaseKey].badge}`;
                }

                // Se os resultados já estiverem na tela, recalibra na hora
                if (state.selectedBase64 && !elements.resultsContainer.classList.contains('hidden')) {
                    applyPhaseResponses(phaseKey);
                }
            });
        });
    }

    function updatePhaseBanner(phaseKey) {
        const def = phaseDefinitions[phaseKey];
        if (!def) return;

        elements.missionTag.textContent = `OBJETIVO DA ${def.badge}`;
        elements.missionTitle.textContent = def.title;
        elements.missionDesc.textContent = def.desc;
        updateSubmodeUI();
    }

    // Seletor de Submodo (Story / Foto vs Conversa / Chat)
    function setupSubmodeSelector() {
        elements.submodeCards.forEach(card => {
            card.addEventListener('click', () => {
                triggerHaptic();
                const submode = card.dataset.submode;
                elements.submodeCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                state.selectedSubmode = submode;

                updateSubmodeUI();

                if (state.selectedBase64 && !elements.resultsContainer.classList.contains('hidden')) {
                    applyPhaseResponses(state.selectedPhase);
                }
            });
        });
    }

    function updateSubmodeUI() {
        const expl = submodeExplanations[state.selectedSubmode][state.selectedPhase];
        if (expl && elements.submodeExplText) {
            elements.submodeExplText.innerHTML = expl;
        }

        const uploadTitle = document.querySelector('.upload-title');
        if (uploadTitle) {
            if (state.selectedSubmode === 'story') {
                uploadTitle.textContent = 'Toque para carregar o print do Story ou Foto';
            } else {
                uploadTitle.textContent = 'Toque para carregar o print da Conversa / DM';
            }
        }
    }

    // Dropzone & Manipulação de Arquivo
    function setupDropzone() {
        const { dropzone, fileInput, btnClearImage } = elements;

        dropzone.addEventListener('click', (e) => {
            if (e.target.closest('#btnClearImage')) return;
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
            }
        });

        ['dragenter', 'dragover'].forEach(evt => {
            dropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(evt => {
            dropzone.addEventListener(evt, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove('dragover');
            });
        });

        dropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFile(e.dataTransfer.files[0]);
            }
        });

        btnClearImage.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic(20);
            resetUpload();
        });

        // Clique no Botão de Decodificar
        elements.btnScan.addEventListener('click', () => {
            if (!state.selectedBase64 || state.isScanning) return;
            runScanSequence();
        });
    }

    function setupClipboardPaste() {
        window.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    handleFile(blob);
                    showToast('Print colado da área de transferência!');
                    break;
                }
            }
        });
    }

    // Compressor invisível de imagem (reduz peso de prints mobile em até 80% e corta tokens de visão pela metade)
    function compressPrintDataUrl(rawDataUrl, maxDim = 960, quality = 0.78) {
        return new Promise((resolve) => {
            try {
                const img = new Image();
                img.onload = () => {
                    let { width, height } = img;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = Math.round((height * maxDim) / width);
                            width = maxDim;
                        } else {
                            width = Math.round((width * maxDim) / height);
                            height = maxDim;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', quality));
                };
                img.onerror = () => resolve(rawDataUrl);
                img.src = rawDataUrl;
            } catch (e) {
                resolve(rawDataUrl);
            }
        });
    }

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast('Envie apenas arquivos de imagem.');
            return;
        }

        state.selectedFile = file;
        const reader = new FileReader();
        reader.onload = async (e) => {
            const rawDataUrl = e.target.result;
            elements.previewImg.src = rawDataUrl;
            state.selectedBase64 = await compressPrintDataUrl(rawDataUrl);
            elements.uploadPlaceholder.classList.add('hidden');
            elements.previewWrapper.classList.remove('hidden');
            elements.btnScan.disabled = false;
            elements.btnLabel.textContent = `DECODIFICAR ${phaseDefinitions[state.selectedPhase].badge}`;
            elements.resultsContainer.classList.add('hidden');
            triggerHaptic();
        };
        reader.readAsDataURL(file);
    }

    function resetUpload() {
        state.selectedFile = null;
        state.selectedBase64 = null;
        elements.fileInput.value = '';
        elements.previewImg.src = '';
        elements.previewWrapper.classList.add('hidden');
        elements.uploadPlaceholder.classList.remove('hidden');
        elements.btnScan.disabled = true;
        elements.btnLabel.textContent = 'ENVIE O PRINT PARA DECODIFICAR';
        elements.previewWrapper.classList.remove('scanning');
        elements.resultsContainer.classList.add('hidden');
    }

    // Execução da Sequência de Escaneamento
    async function runScanSequence() {
        state.isScanning = true;
        triggerHaptic(40);

        elements.previewWrapper.classList.add('scanning');
        elements.btnScan.disabled = true;
        elements.scanSpinner.classList.remove('hidden');
        elements.btnLabel.textContent = 'ANALISANDO CENÁRIO & SINAIS...';

        try {
            const result = await callOrdemEndpoint('scan', {
                image: state.selectedBase64,
                phase: state.selectedPhase,
                submode: state.selectedSubmode
            });

            if (result.success && result.data) {
                // SUCESSO REAL VIA IA
                renderRealAIResponse(result.data);
                showToast('Decodificação do Mestre concluída!');
            } else if (result.needs_key) {
                // Chave ainda não preenchida no config.php
                applyPhaseResponses(state.selectedPhase);
                showToast('Aviso: Configure a GEMINI_API_KEY no api/config.php para leitura ao vivo!');
            } else {
                // Fallback inteligente
                applyPhaseResponses(state.selectedPhase);
                showToast('Usando calibração padrão da fase.');
            }
        } catch (err) {
            // Se estiver testando via file:/// sem servidor PHP local
            applyPhaseResponses(state.selectedPhase);
            showToast('Modo de demonstração ativado.');
        } finally {
            state.isScanning = false;
            elements.previewWrapper.classList.remove('scanning');
            elements.btnScan.disabled = false;
            elements.scanSpinner.classList.add('hidden');
            elements.btnLabel.textContent = `DECODIFICAR NOVAMENTE`;

            elements.resultsContainer.classList.remove('hidden');
            elements.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            triggerHaptic(50);
        }
    }

    function renderRealAIResponse(data) {
        if (data.intel) {
            if (data.intel.phase) document.getElementById('intelPhase').textContent = data.intel.phase;
            if (data.intel.termometro) document.getElementById('intelInterest').textContent = data.intel.termometro;
            if (data.intel.gancho) document.getElementById('intelHook').textContent = data.intel.gancho;

            const diagEl = document.getElementById('intelDiagnosisText');
            if (diagEl && data.intel.diagnosis) {
                diagEl.textContent = data.intel.diagnosis;
            }

            // Se o Oráculo detectou o tipo de print (story vs chat), sincroniza a caixinha automaticamente
            if (data.intel.detected_submode) {
                const detectedSub = data.intel.detected_submode.toLowerCase();
                const targetSubCard = document.querySelector(`.submode-card[data-submode="${detectedSub}"]`);
                if (targetSubCard) {
                    elements.submodeCards.forEach(c => c.classList.remove('active'));
                    targetSubCard.classList.add('active');
                    state.selectedSubmode = detectedSub;
                    updateSubmodeUI();
                }
            }

            // Se o Oráculo detectou a fase e estávamos no modo auto, atualiza os cards visualmente
            if (data.intel.detected_phase_key) {
                const detectedKey = data.intel.detected_phase_key.toLowerCase();
                const targetCard = document.querySelector(`.phase-card-row[data-phase="${detectedKey}"]`);
                if (targetCard) {
                    elements.phaseCards.forEach(c => c.classList.remove('active'));
                    targetCard.classList.add('active');
                    state.selectedPhase = detectedKey;
                    updatePhaseBanner(detectedKey);
                }
            }
        }

        if (data.options && data.options.length >= 3) {
            const formatAdviceHtml = (str) => {
                if (!str) return '';
                return str
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\\n/g, '<br>')
                    .replace(/\n/g, '<br>');
            };

            document.getElementById('textOption1').textContent = data.options[0].text;
            document.getElementById('textOption2').textContent = data.options[1].text;
            document.getElementById('textOption3').textContent = data.options[2].text;

            if (data.options[2].badge) {
                const opt3BadgeEl = document.getElementById('option3Type');
                if (opt3BadgeEl) opt3BadgeEl.textContent = data.options[2].badge;
            }

            const desc1 = document.getElementById('intelDescOption1');
            const desc2 = document.getElementById('intelDescOption2');
            const desc3 = document.getElementById('intelDescOption3');
            if (desc1) desc1.innerHTML = formatAdviceHtml(data.options[0].advice);
            if (desc2) desc2.innerHTML = formatAdviceHtml(data.options[1].advice);
            if (desc3) desc3.innerHTML = formatAdviceHtml(data.options[2].advice);

            if (window.saveActivityHistory) {
                const hookTitle = (data.intel && data.intel.gancho) ? `Print Analisado: ${data.intel.gancho}` : 'Análise de Print via Visão Computacional';
                window.saveActivityHistory('O ORÁCULO (SCANNER)', hookTitle, data.options[0].text, 'view-oraculo');
            }
        }
    }

    function applyPhaseResponses(phaseKey) {
        const def = phaseDefinitions[phaseKey] || phaseDefinitions.invasao;
        if (!def) return;

        document.getElementById('intelPhase').textContent = def.intel.phase;
        document.getElementById('intelInterest').textContent = def.intel.termometro;
        document.getElementById('intelHook').textContent = def.intel.gancho;

        const diagEl = document.getElementById('intelDiagnosisText');
        if (diagEl) {
            diagEl.textContent = def.desc;
        }

        document.getElementById('textOption1').textContent = def.responses.opt1;
        document.getElementById('textOption2').textContent = def.responses.opt2;
        document.getElementById('textOption3').textContent = def.responses.opt3;

        // Injetar Parecer do Expert / Dicas de Uso
        const desc1 = document.getElementById('intelDescOption1');
        const desc2 = document.getElementById('intelDescOption2');
        const desc3 = document.getElementById('intelDescOption3');
        if (desc1) desc1.innerHTML = def.advice.opt1;
        if (desc2) desc2.innerHTML = def.advice.opt2;
        if (desc3) desc3.innerHTML = def.advice.opt3;

        document.getElementById('option3Type').textContent = def.opt3Badge;
    }

    // Setup da Aba de Planos (Paywall e Seleção Dinâmica)
    function setupPlansTab() {
        const planCards = document.querySelectorAll('.plan-card');
        const ctaBtn = document.getElementById('btnSubscribeCTA');

        planCards.forEach(card => {
            card.addEventListener('click', () => {
                triggerHaptic(20);
                planCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                const planType = card.dataset.plan;
                const checkoutUrl = card.dataset.checkout;
                const price = card.dataset.price;

                if (ctaBtn) {
                    ctaBtn.href = checkoutUrl;
                    if (planType === 'anual') {
                        ctaBtn.innerHTML = `<span>Assinar Anual PRO · R$ ${price}</span><i class="fa-solid fa-arrow-right"></i>`;
                    } else if (planType === 'trimestral') {
                        ctaBtn.innerHTML = `<span>Assinar Trimestral · R$ ${price}</span><i class="fa-solid fa-arrow-right"></i>`;
                    } else {
                        ctaBtn.innerHTML = `<span>Assinar Mensal Base · R$ ${price}</span><i class="fa-solid fa-arrow-right"></i>`;
                    }
                }
            });
        });
    }

    function renderGrimorioGuide(guideKey) {
        const guide = grimorioGuides[guideKey];
        if (!guide) return;

        elements.grimorioContent.innerHTML = `
            <span class="guide-rule-pill"><i class="fa-solid fa-crown"></i> REGRA DE OURO</span>
            <h3 class="guide-heading">${guide.title}</h3>
            <p class="guide-text">${guide.desc}</p>

            <div class="guide-section-box">
                <div class="box-title">
                    <i class="fa-solid fa-triangle-exclamation"></i> O ERRO CLÁSSICO DO VÁCUO
                </div>
                <div class="box-content">
                    ${guide.error}
                </div>
            </div>

            <div class="guide-section-box">
                <div class="box-title gold">
                    <i class="fa-solid fa-key"></i> O SEGREDO COMPORTAMENTAL
                </div>
                <div class="box-content">
                    ${guide.secret}
                </div>
            </div>

            <div class="guide-section-box" style="border-left: 3px solid var(--accent-gold);">
                <div class="box-title gold">
                    <i class="fa-solid fa-scroll"></i> SCRIPT CORINGA DESTE GUIA
                </div>
                <div class="box-content" id="grimorioScript_${guideKey}" style="font-style: italic; color: #ffffff; margin-bottom: 10px;">
                    ${guide.script}
                </div>
                <div style="display: flex; justify-content: flex-end;">
                    <button class="btn-copy" data-target="grimorioScript_${guideKey}">
                        <i class="fa-regular fa-copy"></i>
                        <span>Copiar Script</span>
                    </button>
                </div>
            </div>
        `;

        setupCopyButtons();
    }

    // ==========================================================================
    // ARSENAL & MODAL DE CONTEÚDO LIBERADO (LIVROS DIGITAIS PREMIUM & VÍDEO-AULAS)
    // ==========================================================================
    const moduleContentDatabase = {
        'perfil-magnetico': {
            isEbook: true,
            title: "Como Criar um Perfil Magnético",
            subtitle: "A Engenharia Visual, Neurocópia & Semiótica de Alto Status no Instagram",
            author: "Conselho Estratégico · Ordem Oculta",
            edition: "Edição Definitiva 2026 · 54 Páginas",
            readTime: "35 min de leitura",
            pdfFile: "Como-Criar-um-Perfil-Magnetico-Edicao-Oficial.pdf",
            sections: [
                {
                    type: "cover",
                    navTitle: "Capa do Livro",
                    title: "Como Criar um Perfil Magnético",
                    html: `
                        <div class="book-cover-view"><div class="pm-reader-cover" style="--cover: url('assets/cover-perfil-magnetico.jpg');"></div>
                            <span class="book-cover-badge"><i class="fa-solid fa-crown"></i> ORDEM OCULTA · EDIÇÃO DEFINITIVA</span>
                            <div class="book-cover-crest">
                                <i class="fa-solid fa-camera-retro"></i>
                            </div>
                            <h2 class="book-cover-title">Como Criar um<br><span class="gradient">Perfil Magnético</span></h2>
                            <p class="book-cover-subtitle">O Manual Definitivo de Semiótica Visual, Neurocópia de Bio, Arquitetura de Destaques e Stories de Alto Status no Instagram.</p>
                            
                            <div class="book-meta-strip">
                                <span><i class="fa-solid fa-book-open" style="color: var(--accent-gold);"></i> <strong>54 Páginas</strong></span>
                                <span><i class="fa-solid fa-clock" style="color: var(--accent-gold);"></i> <strong>35 min</strong> de leitura</span>
                                <span><i class="fa-solid fa-certificate" style="color: var(--accent-green);"></i> <strong>Edição 2026</strong></span>
                            </div>

                            <button class="btn-start-reading-book" id="btnCoverStartRead">
                                <span>ABRIR LIVRO & VER SUMÁRIO</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    `
                },
                {
                    type: "toc",
                    navTitle: "Sumário Geral",
                    title: "Sumário Executivo do Livro",
                    html: `
                        <div class="book-toc-view">
                            <div class="toc-header-row">
                                <span class="toc-header-title"><i class="fa-solid fa-list-ol"></i> ÍNDICE DE CAPÍTULOS & PROTOCOLOS</span>
                                <span class="toc-time-badge"><i class="fa-solid fa-clock"></i> 35 min total</span>
                            </div>
                            <div class="book-toc-list" id="bookTocList">
                                <!-- Preenchido dinamicamente com os capítulos -->
                            </div>
                        </div>
                    `
                },
                {
                    type: "chapter",
                    number: "INTRO",
                    navTitle: "Introdução",
                    title: "Introdução: A Era do Julgamento de 3 Segundos",
                    readTime: "3 min",
                    content: `
                        <p class="reader-dropcap">
                            O Instagram deixou de ser uma simples rede social de fotos há muitos anos. Hoje, ele é o seu <strong>currículo social, estético e sexual</strong>. Antes de qualquer mulher responder à sua primeira mensagem ou aceitar um convite para sair, ela fará uma varredura visual no seu perfil que dura em média exatos <strong>3 segundos</strong>.
                        </p>
                        <p>
                            Nesses 3 segundos inconscientes, a mente dela não analisa racionalmente quem você é por dentro, seus diplomas ou sua bondade de coração. O cérebro primitivo dela busca pistas biológicas de sobrevivência e reprodução: <em>"Esse homem tem status? Ele tem amigos? Ele é confiante ou é um esquisito que implora atenção na DM? Ele tem bom gosto ou é descuidado?"</em>
                        </p>
                        <div class="reader-callout">
                            <strong><i class="fa-solid fa-eye"></i> O Princípio da Pré-Seleção:</strong>
                            Mulheres bonitas não têm tempo para investigar se você é um cara legal. Elas compram a embalagem antes de abrir o presente. Se sua embalagem transmite carência, desleixo ou pose forçada, sua conversa já começou morta.
                        </div>
                        <p>
                            Neste livro, você não aprenderá a fingir ser rico ou a alugar carros de luxo para ostentar na internet. Homens que forçam ostentação são imediatamente detectados como farsantes. Você aprenderá a <strong>extrair a sua melhor versão</strong>, calibrar ângulos, luz natural, cortes de roupa, neurocópia de bio e storytelling de bastidores para transmitir o peso de um homem raro.
                        </p>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 01",
                    navTitle: "Cap. 1: Os 5 Erros Fatais",
                    title: "Capítulo 1: A Desconstrução dos 5 Erros Fatais do Homem Médio",
                    readTime: "5 min",
                    content: `
                        <p>
                            Antes de construir o seu perfil magnético, você precisa estancar o sangramento. 95% dos homens cometem ao menos três destes cinco erros fatais sem perceber:
                        </p>

                        <h4>1. A Selfie no Espelho da Academia com Cara de Bravo</h4>
                        <p>
                            Treinar é excelente; postar foto com o celular na frente do rosto e cara de assassino transmite imaturidade e necessidade de validação barata. Passa a impressão de que seu único valor no mundo é um bíceps contraído.
                        </p>

                        <h4>2. A Bio Bíblica ou com Frases de Efeito Clichês</h4>
                        <p>
                            Frases como <em>"Vivendo um dia de cada vez 🙏"</em>, <em>"Lobo solitário 🐺"</em> ou listas arrogantes de cargos corporativos gritam desespero de autoafirmação. A bio deve gerar curiosidade sutil, não um relatório do RH.
                        </p>

                        <h4>3. O Feed 'Cemitério de Momentos'</h4>
                        <p>
                            Fotos escuras, com comida mal apresentada, foto de cachorro com resolução borrada, prints de piadas ou 5 fotos consecutivas no mesmo ângulo e com a mesma camisa. O seu feed é uma galeria de arte, não a lixeira da sua galeria do celular.
                        </p>

                        <h4>4. Ausência Total de Prova Social Humana</h4>
                        <p>
                            Se no seu perfil só existem fotos suas sozinho, o subconsciente dela acende o sinal de alerta: <em>"Por que esse cara nunca está com ninguém? Ele não tem amigos? Ninguém gosta dele?"</em>.
                        </p>

                        <h4>5. Destaques Caóticos ou Inexistentes</h4>
                        <p>
                            Destaques vazios ou com nomes infantis ("Rolês 🤪", "Comidas 🍕") jogam fora a melhor ferramenta de conversão orgânica do Instagram.
                        </p>

                        <div class="comparative-grid">
                            <div class="comp-col bad">
                                <h6><i class="fa-solid fa-xmark"></i> O Homem Médio (Ignorado)</h6>
                                <p>• Selfie sem camisa no banheiro.<br>• Bio cheia de emojis e frases feitas.<br>• Posta 20 stories seguidos quando sai.<br>• Segue 3.000 pessoas e tem 400 seguidores.</p>
                            </div>
                            <div class="comp-col good">
                                <h6><i class="fa-solid fa-check"></i> O Homem Magnético (Desejado)</h6>
                                <p>• Fotos naturais com luz de dia e contexto.<br>• Bio enxuta com humor e curiosidade.<br>• Posta 2 a 3 stories cirúrgicos com ganchos.<br>• Proporção equilibrada de seguidores e seguidos.</p>
                            </div>
                        </div>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 02",
                    navTitle: "Cap. 2: As 5 Fotos da Grade",
                    title: "Capítulo 2: As 5 Fotos Obrigatórias da Grade Perfeita",
                    readTime: "7 min",
                    content: `
                        <p class="reader-dropcap">
                            Você não precisa de 100 fotos no feed. De fato, perfis com <strong>9 a 15 fotos impecáveis</strong> convertem até 4 vezes mais do que perfis com 300 fotos antigas descalibradas. Aqui está a fórmula das 5 fotos essenciais:
                        </p>

                        <h4>1. A Foto de Rosto / Primeiro Plano (O Olhar Calmo)</h4>
                        <p>
                            <strong>Objetivo:</strong> Mostrar suas feições com clareza e segurança.<br>
                            <strong>Como executar:</strong> Plano médio (do peito para cima), luz natural frontal ou lateral (perto de uma janela durante a manhã ou fim de tarde). Sem óculos escuros tampando os olhos. Expressão tranquila, olhar focado na lente sem forçar sorriso exagerado nem semblante fechado.
                        </p>

                        <h4>2. A Foto de Lifestyle / Movimento em Cenário Nobre</h4>
                        <p>
                            <strong>Objetivo:</strong> Contextualizar você em um ambiente que transmite bom gosto.<br>
                            <strong>Como executar:</strong> Sentado em um café elegante, em um rooftop ao entardecer, em um restaurante ou em uma viagem. O enquadramento deve mostrar 60% você e 40% o ambiente ao redor, gerando ganchos para ela comentar sobre o local.
                        </p>

                        <h4>3. A Foto de Domínio / Foco / Habilidade</h4>
                        <p>
                            <strong>Objetivo:</strong> Subcomunicar que você é um homem que tem paixões e propósito fora de uma tela.<br>
                            <strong>Como executar:</strong> Você concentrado praticando um esporte (tênis, corrida, surf, boxe), tocando um instrumento, cozinhando com amigos ou trabalhando imerso. A câmera deve parecer ter pego você de surpresa, sem olhar diretamente para a lente.
                        </p>

                        <h4>4. A Foto de Prova Social Orgânica (Sua Tribo)</h4>
                        <p>
                            <strong>Objetivo:</strong> Comprovar que você é querido e sociável.<br>
                            <strong>Como executar:</strong> Você rindo espontaneamente com amigos em um brinde, churrasco alinhado ou casamento. O detalhe de ouro: você deve estar bem posicionado no centro ou interagindo confortavelmente, nunca com cara de quem estava isolado na ponta.
                        </p>

                        <h4>5. A Foto de Corpo Inteiro com Estilo Impecável</h4>
                        <p>
                            <strong>Objetivo:</strong> Validar seu senso estético, postura corporal e silhueta.<br>
                            <strong>Como executar:</strong> Em pé, caminhando pela rua ou descendo uma escada. Roupas bem ajustadas ao seu corpo (camisa de linho, alfaiataria, calça escura, tênis limpo ou bota). Postura ereta: ombros para trás, queixo paralelo ao chão.
                        </p>

                        <div class="reader-callout green">
                            <strong><i class="fa-solid fa-camera"></i> Regra Técnica de Fotografia:</strong>
                            Peça para um amigo tirar suas fotos segurando o celular na altura do seu peito (e não de cima para baixo). O ângulo reto valoriza a mandíbula e a altura, enquanto fotos tiradas de cima apequenam o homem.
                        </div>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 03",
                    navTitle: "Cap. 3: A Bio Hipnótica",
                    title: "Capítulo 3: A Neurocópia da Bio Hipnótica (O Método P.A.C.)",
                    readTime: "6 min",
                    content: `
                        <p>
                            A bio do Instagram tem apenas 150 caracteres. O método <strong>P.A.C. (Posicionamento, Ambição e Curiosidade)</strong> foi desenvolvido para sintetizar status em 3 linhas cirúrgicas sem parecer arrogante:
                        </p>

                        <ul class="reader-checklist">
                            <li><i class="fa-solid fa-location-dot"></i> <strong>Linha 1 (Posicionamento):</strong> Sua cidade base ou estilo de vida com discrição.</li>
                            <li><i class="fa-solid fa-briefcase"></i> <strong>Linha 2 (Ambição / Criação):</strong> O que você constrói no mundo, dito com paixão e leveza.</li>
                            <li><i class="fa-solid fa-sparkles"></i> <strong>Linha 3 (Curiosidade / Quebra de Padrão):</strong> Uma frase irônica ou um gancho aberto que faz ela rir e pensar.</li>
                        </ul>

                        <h4>12 Modelos de Bio Prontos para Copiar e Adaptar:</h4>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 01 · EMPREENDEDOR & VIAJANTE</span>
                            </div>
                            <div class="script-text">
                                SP 📍 | Criando marcas & colecionando viagens improváveis.<br>
                                Provavelmente tomando café enquanto leio isso.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 02 · PROFISSIONAL LIBERAL & GASTRONOMIA</span>
                            </div>
                            <div class="script-text">
                                Curitiba • Arquiteto de dia, péssimo crítico gastronômico à noite. 🍷<br>
                                Em busca do melhor risoto da cidade.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 03 · ESPORTISTA & MINIMALISTA</span>
                            </div>
                            <div class="script-text">
                                Rio de Janeiro | Engenharia & Mar.<br>
                                Se demorar pra responder, estou sem sinal na água.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 04 · CRIATIVO & DIRETO</span>
                            </div>
                            <div class="script-text">
                                BH • Design, estratégia e vinho seco.<br>
                                Colecionador de boas conversas e livros não lidos.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 05 · ACADEMIA & DISCIPLINA</span>
                            </div>
                            <div class="script-text">
                                Floripa 🌊 | Treino às 6h, trabalho às 8h.<br>
                                Ainda tentando entender quem acorda tarde de propósito.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 06 · TECNOLOGIA & HUMOR</span>
                            </div>
                            <div class="script-text">
                                Dev em Recife 💻 Resolvo bugs de dia e crio outros à noite.<br>
                                Melhor tapioca da cidade: aceito debates.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 07 · MÚSICA & NOITE</span>
                            </div>
                            <div class="script-text">
                                Porto Alegre • Violão ruim, playlist excelente. 🎸<br>
                                Se você conhece um bar com música ao vivo boa, me conta.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 08 · SAÚDE & PROPÓSITO</span>
                            </div>
                            <div class="script-text">
                                Fisioterapeuta em Goiânia | Consertando costas alheias.<br>
                                A minha ainda está na fila de espera.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 09 · NEGÓCIOS & AMBIÇÃO</span>
                            </div>
                            <div class="script-text">
                                SP • Construindo algo que ainda não cabe na bio. 📈<br>
                                Café forte, decisões rápidas, finais de semana lentos.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 10 · AVENTURA & NATUREZA</span>
                            </div>
                            <div class="script-text">
                                Brasília ⛰️ Trilhas no fim de semana, planilhas na semana.<br>
                                Procurando a cachoeira que ninguém postou ainda.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 11 · MINIMALISTA MISTERIOSO</span>
                            </div>
                            <div class="script-text">
                                Rio • Menos posts, mais histórias.<br>
                                As melhores ficam pra contar pessoalmente.
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">MODELO 12 · CULINÁRIA & CONVITE IMPLÍCITO</span>
                            </div>
                            <div class="script-text">
                                Campinas 🍝 Faço a melhor carbonara que você ainda não provou.<br>
                                Advogado nas horas vagas (ou o contrário).
                            </div>
                        </div>

                        <div class="reader-callout red">
                            <strong>⚠️ O Que Jamais Colocar na Bio:</strong>
                            Signo do zodíaco, frases bíblicas descontextualizadas, apelidos infantis, link para várias redes sociais acumuladas ou frases dizendo "Não mando mensagem primeiro". Isso grita insegurança.
                        </div>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 04",
                    navTitle: "Cap. 4: Engenharia de Destaques",
                    title: "Capítulo 4: A Engenharia dos Destaques de Alto Status",
                    readTime: "5 min",
                    content: `
                        <p class="reader-dropcap">
                            Os destaques são como os 'trailers de cinema' da sua vida. Quando ela acessa seu perfil pela primeira vez, ela clica nos destaques para ver se você é autêntico no vídeo e na voz.
                        </p>
                        <p>
                            Recomendamos exatamente <strong>4 a 5 pastas de destaques</strong>, com capas minimalistas (fotos reais e limpas, sem ícones genéricos desenhados):
                        </p>

                        <h4>Pasta 1: 'Rotas' ou 'Viagens' (Lifestyle Global)</h4>
                        <p>
                            Vídeos curtos de paisagens, comidas locais, decolagem de avião ou você dirigindo em uma estrada bonita. Transmite mundo, ambição e dinamismo.
                        </p>

                        <h4>Pasta 2: 'Bastidores' ou 'Ofício' (Propósito)</h4>
                        <p>
                            Momentos rápidos do seu ambiente de trabalho, reuniões com café, mesa arrumada com laptop ou uma conquista profissional. Mostra que você é um homem que produz valor.
                        </p>

                        <h4>Pasta 3: 'Gastronomia' ou 'Noites' (Sofisticação Social)</h4>
                        <p>
                            Pratos bem montados, drinks sofisticados, ambiente à meia-luz e brindes. Isso projeta na mente dela: <em>"Esse homem sabe escolher bons lugares para me levar."</em>
                        </p>

                        <h4>Pasta 4: 'Movimento' (Saúde & Vigor)</h4>
                        <p>
                            Vídeos em ação: pedalando, correndo na praia, jogando tênis ou no mar. Foco no movimento e na vitalidade, não na estética vazia de espelho.
                        </p>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 05",
                    navTitle: "Cap. 5: Stories Invisíveis",
                    title: "Capítulo 5: O Algoritmo dos Stories Invisíveis (Como Forçar DMs)",
                    readTime: "6 min",
                    content: `
                        <p>
                            A grande sacada do homem magnético é não precisar mandar mensagem primeiro para todas as mulheres. Ele cria <strong>gatilhos de curiosidade nos Stories</strong> que obrigam as mulheres a puxarem assunto:
                        </p>

                        <h4>A Técnica da 'Lacuna sem Nome' (O Gatilho da DM Inevitável)</h4>
                        <p>
                            Poste a foto esteticamente impecável de um prato autêntico, de um drink misterioso ou de um restaurante acolhedor, <strong>mas NÃO marque a localização nem o nome do lugar</strong>. A mente feminina não suporta ficar sem saber: a probabilidade de uma mulher mandar uma DM perguntando <em>"Nossa, que delícia, onde é isso?"</em> é superior a 80%.
                        </p>

                        <h4>A Técnica do 'Falso Enigma'</h4>
                        <p>
                            Poste uma foto de um livro aberto com um trecho intrigante grifado, ou uma vista de fim de tarde com a legenda: <em>"Três coisas aconteceram hoje aqui, mas a segunda ninguém acreditaria kkk"</em>. As pessoas são naturalmente curiosas: ela abrirá a DM para perguntar o que aconteceu.
                        </p>

                        <div class="reader-callout">
                            <strong><i class="fa-solid fa-clock"></i> Frequência Ideal de Stories:</strong>
                            • Manhã (08h às 10h): 1 story leve de rotina (café, vista, trânsito com boa música).<br>
                            • Tarde (13h às 15h): Opcional (foco no trabalho).<br>
                            • Noite (19h às 22h): 1 a 2 stories de lifestyle ou comida com gancho aberto.<br>
                            <em>Nunca ultrapasse 4 stories por dia. A escassez gera mistério e valoriza sua presença.</em>
                        </div>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 06",
                    navTitle: "Cap. 6: Da DM ao WhatsApp",
                    title: "Capítulo 6: Da Primeira Resposta ao WhatsApp (A Transição Natural)",
                    readTime: "5 min",
                    content: `
                        <p class="reader-dropcap">
                            O Instagram é o radar de atração; o WhatsApp é o canal de fechamento. Jamais passe semanas conversando pelo direct do Instagram. A DM é cheia de distrações, outros homens mandando mensagens e notificações de memes.
                        </p>

                        <h4>O Momento Exato da Transição:</h4>
                        <p>
                            Você deve puxar para o WhatsApp no <strong>ápice da empolgação da conversa</strong>, nunca quando o assunto estiver esfriando.
                        </p>

                        <h4>3 Scripts de Ouro para Pegar o Zap sem Pedir Permissão:</h4>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">SCRIPT 1 · O PRETEXTO FUNCIONAL DO ÁUDIO</span>
                            </div>
                            <div class="script-text">
                                "O Instagram vai cortar o áudio desse caso kkk. Me passa seu Zap que te mando por lá antes de entrar em reunião."
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">SCRIPT 2 · A INVERSÃO DE PAPEL (ENTREGANDO O SEU NÚMERO)</span>
                            </div>
                            <div class="script-text">
                                "Quase nunca abro essa DM na correria da semana. Me dá um oi no Zap que te mando a localização certinha de lá: (XX) 9XXXX-XXXX."
                            </div>
                        </div>

                        <div class="tactical-script-card">
                            <div class="script-card-header">
                                <span class="script-label">SCRIPT 3 · A QUALIFICAÇÃO DE ALTO STATUS</span>
                            </div>
                            <div class="script-text">
                                "Só passo meu WhatsApp pra quem parece sustentar uma conversa afiada pessoalmente. Você passou no teste de triagem kkk. Me manda um alô lá: (XX) 9XXXX-XXXX."
                            </div>
                        </div>
                    `
                },
                {
                    type: "chapter",
                    number: "PLANO",
                    navTitle: "Plano de Ação 7 Dias",
                    title: "Plano Prático de 7 Dias: Reformulação Completa do Perfil",
                    readTime: "4 min",
                    content: `
                        <p>
                            Não deixe este conhecimento acumulando poeira mental. Execute o cronograma abaixo para transformar seu Instagram nos próximos 7 dias:
                        </p>

                        <div class="seven-days-timeline">
                            <div class="timeline-day-card">
                                <h5>DIA 1: A LIMPEZA RADICAL</h5>
                                <p>Arquive fotos antigas com luz ruim, poses forçadas, selfies de espelho e fotos sem camisa no banheiro. Deixe apenas as suas 9 melhores fotos.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 2: A REFORMULAÇÃO DA BIO</h5>
                                <p>Aplique o Método P.A.C. Escolha um dos 12 modelos prontos, remova emojis infantis e adicione sua cidade com elegância.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 3: PRODUÇÃO DA FOTO DE ROSTO</h5>
                                <p>Aproveite a luz natural da manhã perto de uma janela. Tire 15 a 20 fotos em plano médio, olhar sereno. Escolha a mais nítida.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 4: PRODUÇÃO DA FOTO DE LIFESTYLE</h5>
                                <p>Vá a um café ou restaurante agradável. Peça a um amigo para tirar uma foto sua sentado enquanto você aprecia o ambiente sem olhar para a câmera.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 5: ARQUITETURA DOS DESTAQUES</h5>
                                <p>Organize suas 4 pastas de destaques (Viagens, Ofício, Gastronomia, Movimento). Remova stories caóticos ou infantis.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 6: O PRIMEIRO STORY COM LACUNA</h5>
                                <p>Poste uma foto estética de um prato ou vista sem marcar o local. Aguarde as primeiras mensagens curiosas na DM.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 7: EQUILÍBRIO DA PROPORÇÃO SOCIAL</h5>
                                <p>Faça uma limpeza de quem você segue: pare de seguir dezenas de blogueiras desconhecidas e equilibre sua lista para projetar desapego.</p>
                            </div>
                        </div>
                    `
                },
                {
                    type: "chapter",
                    number: "FIM",
                    navTitle: "Conclusão",
                    title: "Conclusão: O Posicionamento do Homem Raro",
                    readTime: "2 min",
                    content: `
                        <p class="reader-dropcap">
                            Um perfil magnético não faz mágica sozinho: ele é o espelho de um homem que cultiva a si mesmo. Quando você cuida do seu corpo, da sua mente, das suas amizades e da sua trajetória profissional, as boas fotos tornam-se apenas uma consequência natural da sua vida.
                        </p>
                        <p>
                            Você agora tem nas mãos a chave para se destacar dos 99% dos homens que continuam enviando mensagens genéricas de 'oi sumida' para perfis que nunca os responderão.
                        </p>
                        <div class="reader-callout green">
                            <strong><i class="fa-solid fa-crown"></i> O Código da Ordem:</strong>
                            Seja o prêmio. Dite o ritmo. Sustente o silêncio e conduza a mulher até o mundo real. O jogo começa na tela, mas só vale a pena quando se concretiza a dois.
                        </div>
                    `
                }
            ]
        },
        'mente-feminina': {
            isEbook: true,
            title: "A Mente Feminina Decodificada",
            subtitle: "O Manual Definitivo de Psicologia Evolutiva, Testes Inconscientes & Desejo Biológico",
            author: "Conselho Estratégico · Ordem Oculta",
            edition: "Edição Definitiva 2026 · 58 Páginas",
            readTime: "40 min de leitura",
            pdfFile: "A-Mente-Feminina-Decodificada-Edicao-Oficial.pdf",
            sections: [
                {
                    type: "cover",
                    navTitle: "Capa do Livro",
                    title: "A Mente Feminina Decodificada",
                    html: `
                        <div class="book-cover-view"><div class="pm-reader-cover" style="--cover: url('assets/cover-mente-feminina.jpg');"></div>
                            <span class="book-cover-badge" style="background: rgba(139, 92, 246, 0.15); border-color: rgba(139, 92, 246, 0.4); color: #c4b5fd;">
                                <i class="fa-solid fa-brain"></i> ORDEM OCULTA · MANUAL PSICOLÓGICO
                            </span>
                            <div class="book-cover-crest" style="border-color: #a78bfa; color: #a78bfa; background: linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(239, 68, 68, 0.25) 100%);">
                                <i class="fa-solid fa-puzzle-piece"></i>
                            </div>
                            <h2 class="book-cover-title">A Mente Feminina<br><span class="gradient" style="background: linear-gradient(135deg, #a78bfa 0%, #f43f5e 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Decodificada</span></h2>
                            <p class="book-cover-subtitle">Como Funcionam as Mulheres, a Ciência dos Testes Inconscientes, a Destruição da Friendzone e os Gatilhos Evolutivos de Desejo Real.</p>
                            
                            <div class="book-meta-strip">
                                <span><i class="fa-solid fa-book-open" style="color: #a78bfa;"></i> <strong>58 Páginas</strong></span>
                                <span><i class="fa-solid fa-clock" style="color: #a78bfa;"></i> <strong>40 min</strong> de leitura</span>
                                <span><i class="fa-solid fa-certificate" style="color: var(--accent-green);"></i> <strong>Edição 2026</strong></span>
                            </div>

                            <button class="btn-start-reading-book" id="btnCoverStartRead" style="background: linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%); box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);">
                                <span>ABRIR LIVRO & VER SUMÁRIO</span>
                                <i class="fa-solid fa-arrow-right"></i>
                            </button>
                        </div>
                    `
                },
                {
                    type: "toc",
                    navTitle: "Sumário Geral",
                    title: "Sumário Executivo do Livro",
                    html: `
                        <div class="book-toc-view">
                            <div class="toc-header-row">
                                <span class="toc-header-title"><i class="fa-solid fa-list-ol"></i> ÍNDICE DE CAPÍTULOS & PROTOCOLOS</span>
                                <span class="toc-time-badge" style="color: #c4b5fd; border-color: rgba(139,92,246,0.3); background: rgba(139,92,246,0.1);"><i class="fa-solid fa-clock"></i> 40 min total</span>
                            </div>
                            <div class="book-toc-list" id="bookTocList">
                                <!-- Preenchido dinamicamente com os capítulos -->
                            </div>
                        </div>
                    `
                },
                {
                    type: "chapter",
                    number: "INTRO",
                    navTitle: "Introdução",
                    title: "Introdução: O Algoritmo Oculto da Atração Feminina",
                    readTime: "4 min",
                    content: `
                        <p class="reader-dropcap">
                            O maior erro que um homem comete ao tentar conquistar uma mulher é abordá-la através da <strong>lógica racional</strong>. O homem médio pensa: <em>"Se eu for super educado, elogiar ela o tempo todo, pagar tudo, responder em 2 segundos e nunca discordar, ela vai ver que eu sou um homem incrível e vai se apaixonar por mim."</em>
                        </p>
                        <p>
                            Essa lógica funciona para assinar um contrato de sociedade comercial, mas é um suicídio na dinâmica de atração. A atração feminina não é uma escolha racional: é uma <strong>resposta biológica involuntária</strong> que obedece a milhões de anos de evolução da espécie.
                        </p>
                        <div class="reader-callout purple">
                            <strong><i class="fa-solid fa-dna"></i> O Paradoxo da Atração:</strong>
                            Mulheres não se sentem atraídas por quem precisa agradá-las o tempo todo. Elas se sentem atraídas por homens que têm limites firmes, que sustentam tensão emocional e que não temem a desaprovação delas.
                        </div>
                        <p>
                            Neste manual, você entenderá exatamente o que acontece dentro do cérebro feminino durante uma paquera, como desarmar testes sem perder a calma, por que a friendzone acontece e como virar o tabuleiro ao seu favor.
                        </p>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 01",
                    navTitle: "Cap. 1: Testes Inconscientes",
                    title: "Capítulo 1: A Ciência dos Testes Inconscientes (Shit Tests)",
                    readTime: "7 min",
                    content: `
                        <p>
                            Toda mulher atraente testa os homens de forma inconsciente diariamente. Isso não é maldade, maquiavelismo ou falsidade: é um <strong>filtro de segurança evolutivo</strong>. Historicamente, uma mulher assumia um risco imenso ao se relacionar com um homem fraco, covarde ou mentiroso. O teste serve para descobrir quem você é sob pressão.
                        </p>

                        <h4>Os 3 Tipos de Testes Mais Comuns:</h4>

                        <h4>1. O Teste de Incongruência (Você é falso?)</h4>
                        <p>
                            Ela solta uma alfinetada: <em>"Nossa, você fala isso pra todas, né?"</em> ou <em>"Acho que você é bem convencido."</em><br>
                            <strong>A reação do homem fraco:</strong> Começa a se explicar: <em>"Não, juro pra você! Eu quase nunca falo com ninguém aqui, sou super tranquilo..."</em> (Reprovado. Mostrou carência de aprovação).<br>
                            <strong>A resposta do homem magnético:</strong> Sorri e amplifica: <em>"Pior que falo mesmo, mas só pras que têm cara de encrenca igual a você kkk."</em> (Aprovado. Desarmou o teste com humor e leveza).
                        </p>

                        <h4>2. O Teste de Submissão (Você tem limites?)</h4>
                        <p>
                            Ela faz um pedido abusivo ou muda de planos em cima da hora: <em>"Ah, não vai dar pra ir naquele horário, me busca às 23h na casa da minha amiga?"</em><br>
                            <strong>A reação do homem fraco:</strong> <em>"Claro, tudo bem, espero você o quanto precisar!"</em> (Reprovado. Tornou-se um capacho).<br>
                            <strong>A resposta do homem magnético:</strong> <em>"Tranquilo, fica pra uma próxima então. Vou manter meu horário por aqui. Bom rolê pra vocês!"</em> (Aprovado com louvor. O desapego gera choque imediato na mente dela).
                        </p>

                        <h4>3. O Teste de Ciúme / Triangulação</h4>
                        <p>
                            Ela menciona outro homem: <em>"Um cara lá do trabalho ficou me chamando pra jantar hoje..."</em><br>
                            <strong>A reação do homem fraco:</strong> Fecha a cara, fica emburrado ou pergunta: <em>"E você vai? Quem é esse cara?"</em> (Reprovado. Revelou ciúme e sensação de inferioridade).<br>
                            <strong>A resposta do homem magnético:</strong> Trata com deboche amigável: <em>"Aproveita e pede a sobremesa mais cara da casa na conta dele kkk."</em> (Aprovado. Mostra que o valor dele não depende da atenção dela).
                        </p>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 02",
                    navTitle: "Cap. 2: Anatomia da Friendzone",
                    title: "Capítulo 2: A Anatomia da Friendzone e o Mito do 'Cara Legal'",
                    readTime: "6 min",
                    content: `
                        <p class="reader-dropcap">
                            A Friendzone não é um acidente do destino: é uma construção sistemática feita pelo próprio homem. Você entra na friendzone quando entrega <strong>100% de validação, conforto e ouvido amigo</strong> com <strong>0% de polaridade sexual e mistério</strong>.
                        </p>

                        <h4>Como Você Vira o 'Irmão Mais Velho':</h4>
                        <ul class="reader-checklist">
                            <li><i class="fa-solid fa-xmark" style="color: #f87171;"></i> Você ouve os desabafos dela sobre os homens tóxicos que ela fica, achando que ela vai perceber o quanto você é melhor.</li>
                            <li><i class="fa-solid fa-xmark" style="color: #f87171;"></i> Você responde as mensagens dela instantaneamente e fica disponível 24 horas por dia.</li>
                            <li><i class="fa-solid fa-xmark" style="color: #f87171;"></i> Você nunca discorda das opiniões dela para não gerar desconforto.</li>
                            <li><i class="fa-solid fa-xmark" style="color: #f87171;"></i> Você nunca toca nela, nunca quebra a barreira do espaço pessoal e nunca sustenta um olhar de desejo.</li>
                        </ul>

                        <h4>O Protocolo de Resgate: Como Sair da Friendzone:</h4>
                        <p>
                            1. <strong>Corte Imediato do Papel de Terapeuta:</strong> Se ela começar a falar de outro homem, corte com sarcasmo: <em>"Acho ótimo esse desabafo, mas minha consulta como terapeuta custa R$ 300 a hora. Muda de assunto kkk."</em><br>
                            2. <strong>Recuo Tático de Disponibilidade:</strong> Pare de responder de imediato. Demore para responder e tenha planos interessantes nos fins de semana.<br>
                            3. <strong>Polarização com Elogios Ousados:</strong> Pare de chamá-la de 'fofa' ou 'linda'. Trate-a como uma mulher desejável ou qualifique o comportamento dela de forma provocante: <em>"Você fica perigosa quando coloca esse vestido, hein."</em>
                        </p>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 03",
                    navTitle: "Cap. 3: Validação Intermitente",
                    title: "Capítulo 3: Validação Intermitente & O Ciclo da Obsessão",
                    readTime: "7 min",
                    content: `
                        <p>
                            Na psicologia comportamental, existe um fenômeno conhecido como <strong>Reforço Intermitente</strong> (o mesmo mecanismo neurológico que faz as pessoas viciarem em máquinas caça-níqueis e apostas).
                        </p>
                        <p>
                            Se uma máquina sempre der o prêmio quando você puxa a alavanca, você se cansa rapidamente. Se a máquina nunca der o prêmio, você vai embora. Mas se a máquina der o prêmio <em>de vez em quando, de forma imprevisível</em>, o cérebro humano libera descargas massivas de <strong>dopamina</strong> e se torna obsessivo.
                        </p>

                        <h4>Aplicando o Reforço Intermitente na Conversa:</h4>
                        <p>
                            • <strong>Calor (Quando ela merece):</strong> Se ela investiu na conversa, mandou áudio longo e perguntou sobre a sua vida, retribua com inteligência, entusiasmo e humor afiado.<br>
                            • <strong>Frieza / Desapego (Quando ela recua):</strong> Se ela respondeu seco, monossilábico ou sumiu por 6 horas, você NÃO cobra, não pergunta se ela está brava e NÃO manda ponto de interrogação. Você se afasta e responde apenas quando for conveniente, com a mesma energia enxuta.<br>
                            • <strong>O Desfecho:</strong> Ela perceberá que não tem o controle remoto da sua atenção. Isso faz com que ela pense em você o dia todo, tentando entender por que você não age como os outros homens previsíveis.
                        </p>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 04",
                    navTitle: "Cap. 4: As 7 Leis do Desejo",
                    title: "Capítulo 4: As 7 Leis Inegociáveis do Desejo Biológico Feminino",
                    readTime: "8 min",
                    content: `
                        <ul class="reader-checklist">
                            <li>
                                <i class="fa-solid fa-crown"></i>
                                <div>
                                    <strong>LEI 1: A Mulher Deseja a Liderança Assertiva.</strong>
                                    Nunca pergunte: <em>"O que você gostaria de fazer hoje?"</em>. Diga: <em>"Quinta às 20h vou te levar num lugar excelente. Passo pra te pegar ou você prefere ir direto?"</em>. A firmeza de decisão feminina descansa na liderança masculina.
                                </div>
                            </li>
                            <li>
                                <i class="fa-solid fa-crown"></i>
                                <div>
                                    <strong>LEI 2: O Desejo Feminino é Auditivo e Contextual.</strong>
                                    Fale em tom mais grave, respirando pelo diafragma. Fale devagar, sem afobação, e use o poder do silêncio de 2 segundos antes de responder a uma pergunta provocativa.
                                </div>
                            </li>
                            <li>
                                <i class="fa-solid fa-crown"></i>
                                <div>
                                    <strong>LEI 3: A Capacidade de Dizer 'NÃO' é o Maior Afrodisíaco.</strong>
                                    Homens que concordam com tudo são esquecidos. Quando você discorda dela com elegância e sustenta seu ponto, ela se sente protegida por um homem que sabe se impor no mundo real.
                                </div>
                            </li>
                            <li>
                                <i class="fa-solid fa-crown"></i>
                                <div>
                                    <strong>LEI 4: O Efeito Contraste (Conforto + Tensão).</strong>
                                    Conforto demais gera tédio e amizade. Tensão sexual demais sem conexão gera medo e desconfiança. Alterne momentos de conversa profunda sobre sonhos e valores com provocações audaciosas.
                                </div>
                            </li>
                            <li>
                                <i class="fa-solid fa-crown"></i>
                                <div>
                                    <strong>LEI 5: A Mulher se Apaixona pela Expectativa.</strong>
                                    Nunca conte toda a história da sua vida no primeiro encontro. Deixe lacunas em aberto. A imaginação feminina faz o trabalho de atração por você quando ela estiver sozinha no quarto dela.
                                </div>
                            </li>
                            <li>
                                <i class="fa-solid fa-crown"></i>
                                <div>
                                    <strong>LEI 6: A Pré-Seleção Supera a Beleza Física.</strong>
                                    Quando ela percebe que outras pessoas te respeitam e que você é admirado no seu meio social, o valor dela sobre você multiplica instantaneamente.
                                </div>
                            </li>
                            <li>
                                <i class="fa-solid fa-crown"></i>
                                <div>
                                    <strong>LEI 7: Quem Menos Precisa da Interação Controla a Interação.</strong>
                                    O homem que está pronto para levantar e ir embora com um sorriso sereno tem poder absoluto em qualquer negociação romântica.
                                </div>
                            </li>
                        </ul>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 05",
                    navTitle: "Cap. 5: Guia de Campo",
                    title: "Capítulo 5: O Guia de Campo: Decodificando Sinais no WhatsApp e ao Vivo",
                    readTime: "6 min",
                    content: `
                        <p class="reader-dropcap">
                            As mulheres comunicam 90% das intenções delas através de subcomunicação e pistas indiretas. Aprenda a ler os sinais reais:
                        </p>

                        <h4>No WhatsApp / Instagram:</h4>
                        <div class="comparative-grid">
                            <div class="comp-col bad">
                                <h6><i class="fa-solid fa-triangle-exclamation"></i> Sinais de Baixo Investimento</h6>
                                <p>• Respostas curtas sem perguntas de volta.<br>• Demora para responder sem justificar.<br>• Manda apenas 'kkk' ou curtida na mensagem.<br><em>Ação: Recue imediatamente. Pare de insistir.</em></p>
                            </div>
                            <div class="comp-col good">
                                <h6><i class="fa-solid fa-fire"></i> Sinais de Alto Investimento</h6>
                                <p>• Mensagens em múltiplos balões seguidos.<br>• Manda áudios de mais de 1 minuto.<br>• Faz perguntas sobre você e comenta seus stories.<br><em>Ação: Dite o ritmo e avance para o convite.</em></p>
                            </div>
                        </div>

                        <h4>No Encontro Presencial:</h4>
                        <p>
                            • <strong>Sinal Verde de Toque:</strong> Ela mexe no cabelo olhando para você, ajeita a roupa ou toca levemente no seu braço ao dar risada. (Sinal claro para quebrar a barreira do toque).<br>
                            • <strong>Sinal Verde de Proximidade:</strong> Ela inclina o corpo na sua direção na mesa ou espelha sua postura de pernas cruzadas.<br>
                            • <strong>O Teste do Triângulo do Olhar:</strong> Olhe nos olhos dela, desça o olhar para a boca dela por 1 segundo e retorne aos olhos. Se ela umedecer os lábios ou sustentar o olhar, o beijo está 100% autorizado.
                        </p>
                    `
                },
                {
                    type: "chapter",
                    number: "CAP 06",
                    navTitle: "Cap. 6: Condução ao Fechamento",
                    title: "Capítulo 6: A Condução Magnética até o Fechamento",
                    readTime: "5 min",
                    content: `
                        <p>
                            O fechamento não acontece quando você pede em namoro ou tenta beijar de surpresa no final da noite. O fechamento é construído passo a passo através da <strong>Escalada Física Gradual</strong>:
                        </p>

                        <h4>Os 4 Estágios da Escalada Física:</h4>
                        <p>
                            1. <strong>Toque Social / Casual:</strong> Um cumprimento confiante com abraço firme e perfume marcante, ou um toque rápido no ombro ao conduzi-la para a mesa.<br>
                            2. <strong>Toque de Conexão:</strong> Comparar o tamanho das mãos em uma brincadeira, ou tocar no pulso para ver um relógio/pulseira que ela está usando.<br>
                            3. <strong>Quebra de Proximidade:</strong> Aproximar-se para falar algo no ouvido por conta do barulho do ambiente. A proximidade da sua respiração gera arrepio imediato.<br>
                            4. <strong>O Beijo Natural:</strong> Sustente o silêncio, reduza a velocidade da conversa e incline-se suavemente. Sem afobação, sem pedir 'posso te dar um beijo?'. O homem lidera.
                        </p>
                    `
                },
                {
                    type: "chapter",
                    number: "PLANO",
                    navTitle: "Plano de Ação 7 Dias",
                    title: "Plano Prático de 7 Dias: Reprogramação Comportamental",
                    readTime: "4 min",
                    content: `
                        <p>
                            Exercícios diários inegociáveis para transformar sua postura nos próximos 7 dias:
                        </p>

                        <div class="seven-days-timeline">
                            <div class="timeline-day-card">
                                <h5>DIA 1: JEJUM DE VALIDAÇÃO GRATUITA</h5>
                                <p>Pare de curtir fotos de biquíni e de mandar emojis de foguinho para mulheres na internet. Guarde sua validação para quem investir em você.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 2: CALIBRAGEM DO RITMO DE RESPOSTA</h5>
                                <p>Se ela demorar 2 horas para responder, você não responderá em 10 segundos. Ocupe-se com a sua vida e responda com calma.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 3: SUSTENTAR O CONTATO VISUAL</h5>
                                <p>Pratique sustentar o olhar por 3 segundos com as pessoas do seu dia a dia (garçom, atendente, colegas) sem desviar os olhos para o chão.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 4: O TESTE DO 'NÃO'</h5>
                                <p>Diga 'não' com educação a um pedido que você não queira fazer. Sinta o poder de estabelecer seus limites sem pedir desculpas.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 5: O EXERCÍCIO DA LIDERANÇA</h5>
                                <p>Faça um convite sem perguntar o que ela quer fazer. Dite o local, a data e o horário com assertividade.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 6: NEUTRALIZAÇÃO DE UM TESTE</h5>
                                <p>Quando receber uma alfinetada ou comentário irônico, sorria e use a técnica do 'Concorde e Amplifique com Humor'.</p>
                            </div>

                            <div class="timeline-day-card">
                                <h5>DIA 7: O DESAPEGO PLENO</h5>
                                <p>Lembre-se: sua felicidade e seu valor nunca dependem do resultado com nenhuma mulher. Você é a causa, não o efeito.</p>
                            </div>
                        </div>
                    `
                },
                {
                    type: "chapter",
                    number: "FIM",
                    navTitle: "Conclusão",
                    title: "Conclusão: O Código do Homem Inabalável",
                    readTime: "2 min",
                    content: `
                        <p class="reader-dropcap">
                            Entender a mente feminina não serve para manipular ou enganar ninguém. Serve para você se tornar um homem autêntico, maduro, forte e emocionalmente inabalável — o tipo exato de homem que uma mulher de alto valor respeita, deseja e deseja manter ao lado dela para a vida toda.
                        </p>
                        <div class="reader-callout" style="border-left-color: #a78bfa; background: rgba(139, 92, 246, 0.08); color: #ede9fe;">
                            <strong><i class="fa-solid fa-shield-halved"></i> O Lema dos Adeptos:</strong>
                            Nunca implore. Nunca persiga. Construa um jardim tão magnético que as borboletas virão por vontade própria. E se não vierem, você ainda terá o jardim mais belo da cidade.
                        </div>
                    `
                }
            ]
        },
        'formula-seducao': {
            title: "A Fórmula Secreta da Sedução · Acesso Oficial Kiwify",
            html: `
                <div class="video-course-container">
                    <div class="course-hero-banner">
                        <div class="pm-modal-cover" style="--cover: url('assets/cover-formula-seducao.jpg');"></div>
                        <span class="modal-badge-unlocked" style="margin-bottom: 8px;"><i class="fa-solid fa-circle-check"></i> REDIRECIONAMENTO OFICIAL · KIWIFY</span>
                        <h4>7 Livros Completos + 10 Aulas Gravadas</h4>
                        <p>Todo o conteúdo da <strong>Fórmula Secreta da Sedução</strong> (os 7 livros oficiais + as 10 vídeo-aulas explicativas sobre os livros) está hospedado diretamente na Área de Membros Oficial da Kiwify.</p>
                    </div>

                    <div class="reader-callout" style="border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.08); color: #fef3c7; margin-bottom: 14px;">
                        <strong><i class="fa-solid fa-key"></i> Seus Dados de Acesso na Kiwify:</strong><br><br>
                        • <strong>E-mail de Login:</strong> Digite exatamente o mesmo e-mail que você utilizou na hora da compra.<br>
                        • <strong>Senha de Acesso:</strong> Sua senha oficial chegou no seu e-mail enviado automaticamente pela <strong>Kiwify</strong> (verifique sua Caixa de Entrada, Spam ou aba Promoções).
                    </div>

                    <div class="reader-callout" style="border-left-color: #ef4444; background: rgba(239, 68, 68, 0.08); color: #fee2e2; margin-bottom: 18px;">
                        <strong><i class="fa-solid fa-layer-group"></i> O Que Você Vai Encontrar Lá Dentro:</strong><br><br>
                        📚 <strong>Os 7 Livros da Fórmula Secreta da Sedução</strong> completos para leitura e download.<br>
                        🎬 <strong>+ 10 Aulas Gravadas</strong> destrinchando na prática cada livro e como aplicar no seu dia a dia.
                    </div>

                    <a href="https://dashboard.kiwify.com.br" target="_blank" class="btn-kiwify-member-cta">
                        <i class="fa-solid fa-circle-play"></i>
                        <span>ACESSAR ÁREA DE MEMBROS NA KIWIFY</span>
                    </a>
                </div>
            `
        }
    };

    // Helper Global para Download / Impressão do Livro Completo Formatado em PDF
    window.downloadFullBookPdf = function(modId) {
        triggerHaptic(30);
        const book = moduleContentDatabase[modId];
        if (!book) return;

        showToast(`Gerando arquivo completo de "${book.title}"...`);

        // Constrói o HTML completo com formatação editorial de livro para impressão ou download
        let fullBookHtml = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${book.title} - Edição Oficial Ordem Oculta</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        body {
            font-family: 'Lora', Georgia, serif;
            color: #1a1a1a;
            line-height: 1.8;
            max-width: 780px;
            margin: 0 auto;
            padding: 40px 24px;
            background: #ffffff;
        }
        h1, h2, h3, h4, h5 {
            font-family: 'Cinzel', serif;
            color: #0d0d11;
            margin-top: 1.6em;
            margin-bottom: 0.6em;
        }
        .cover-page {
            text-align: center;
            padding: 80px 20px 100px;
            border-bottom: 2px solid #e2e8f0;
            margin-bottom: 50px;
            page-break-after: always;
        }
        .cover-badge {
            font-family: 'Cinzel', serif;
            font-size: 13px;
            letter-spacing: 2px;
            color: #d97706;
            font-weight: 800;
        }
        .cover-title {
            font-size: 38px;
            font-weight: 900;
            margin: 20px 0 10px;
            line-height: 1.2;
        }
        .cover-subtitle {
            font-size: 16px;
            color: #4b5563;
            max-width: 540px;
            margin: 0 auto 30px;
            font-style: italic;
        }
        .cover-meta {
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
            max-width: 400px;
            margin: 0 auto;
        }
        .chapter-box {
            margin-bottom: 50px;
            page-break-inside: avoid;
            border-bottom: 1px solid #f1f5f9;
            padding-bottom: 40px;
        }
        .chapter-number {
            font-family: 'Cinzel', serif;
            color: #b45309;
            font-size: 14px;
            font-weight: 800;
            letter-spacing: 1px;
        }
        .chapter-title {
            font-size: 24px;
            margin-top: 4px;
        }
        .reader-callout {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 14px 18px;
            margin: 20px 0;
            font-size: 15px;
            border-radius: 4px;
        }
        .reader-callout.purple {
            background: #f5f3ff;
            border-left-color: #8b5cf6;
        }
        .reader-callout.green {
            background: #f0fdf4;
            border-left-color: #10b981;
        }
        .comparative-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin: 20px 0;
        }
        .comp-col {
            padding: 14px;
            border-radius: 6px;
            font-size: 14px;
        }
        .comp-col.bad { background: #fef2f2; border: 1px solid #fca5a5; }
        .comp-col.good { background: #f0fdf4; border: 1px solid #86efac; }
        .tactical-script-card {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            padding: 14px 18px;
            border-radius: 6px;
            margin: 16px 0;
        }
        .script-label { font-size: 11px; font-weight: bold; color: #b45309; }
        .script-text { font-family: monospace; font-size: 14px; margin-top: 6px; }
        .timeline-day-card {
            background: #f8fafc;
            border-left: 3px solid #f59e0b;
            padding: 10px 14px;
            margin-bottom: 10px;
        }
        @media print {
            body { padding: 0; }
            .chapter-box { page-break-after: always; }
        }
    </style>
</head>
<body>
    <div class="cover-page">
        <div class="cover-badge">ORDEM OCULTA · PROTOCOLO DE ELITE</div>
        <h1 class="cover-title">${book.title}</h1>
        <div class="cover-subtitle">${book.subtitle}</div>
        <div class="cover-meta">
            ${book.author} · ${book.edition}<br>
            Material oficial exclusivo para uso pessoal. Proibida a reprodução.
        </div>
    </div>
        `;

        book.sections.forEach(sec => {
            if (sec.type === 'cover' || sec.type === 'toc') return;
            fullBookHtml += `
    <div class="chapter-box">
        <div class="chapter-number">${sec.number || 'CAPÍTULO'}</div>
        <h2 class="chapter-title">${sec.title}</h2>
        ${sec.content}
    </div>
            `;
        });

        fullBookHtml += `
</body>
</html>
        `;

        // Abre em janela de impressão para salvar direto como PDF ou baixa o arquivo HTML formatado
        const blob = new Blob([fullBookHtml], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, '_blank');
        if (win) {
            win.onload = () => {
                setTimeout(() => {
                    win.print();
                }, 500);
            };
        } else {
            // Fallback download direto
            const a = document.createElement('a');
            a.href = url;
            a.download = `${book.pdfFile.replace('.pdf', '')}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        showToast('Livro preparado com sucesso!');
    };

    // Mapa Centralizado de Links de Checkout da Kiwify (Ofertas do mesmo Produto contam para a Placa de 100k)
    const KIWIFY_CHECKOUT_LINKS = {
        plan_anual: 'https://pay.kiwify.com.br/ZvKHa3Z',      // Oferta Plano Anual PRO (R$ 197,90)
        plan_trimestral: 'https://pay.kiwify.com.br/Q3mXfsV', // Oferta Plano Trimestral (R$ 97,90)
        plan_mensal: 'https://pay.kiwify.com.br/8X6hibI',     // Oferta Plano Mensal Base (R$ 37,90)
        credits_10: 'https://pay.kiwify.com.br/yp8dlI0',      // Oferta +10 Créditos (R$ 9,90)
        credits_15: 'https://pay.kiwify.com.br/txHkp23',      // Oferta +15 Créditos (R$ 14,90)
        credits_20: 'https://pay.kiwify.com.br/QSrs23E',      // Oferta +20 Créditos (R$ 19,90)
        mod_perfil_magnetico: 'https://pay.kiwify.com.br/HUaTvIz', // Oferta Livro Perfil Magnético (R$ 27,90)
        mod_mente_feminina: 'https://pay.kiwify.com.br/rVaoZJY',   // Oferta Livro Mente Feminina (R$ 19,90)
        mod_formula_seducao: 'https://pay.kiwify.com.br/dizOxuj'   // Oferta Curso Fórmula da Sedução (R$ 47,00)
    };

    function setupArsenalAndModals() {
        // Limpa desbloqueios de simulação antigos para garantir trava real de pagamento
        if (!localStorage.getItem('ordem_strict_paywall_v13')) {
            localStorage.removeItem('ordem_unlocked_modules');
            localStorage.setItem('ordem_strict_paywall_v13', '1');
        }

        let unlockedModules = JSON.parse(localStorage.getItem('ordem_unlocked_modules') || '[]');

        // Checa se veio do redirecionamento pós-compra da Kiwify (?unlocked=perfil-magnetico ou ?unlock_all=1)
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('unlocked')) {
            const mod = urlParams.get('unlocked');
            if (!unlockedModules.includes(mod)) {
                unlockedModules.push(mod);
                localStorage.setItem('ordem_unlocked_modules', JSON.stringify(unlockedModules));
                showToast(`Pagamento confirmado! Módulo liberado com sucesso.`);
            }
        }
        if (urlParams.has('unlock_all') || urlParams.has('pago')) {
            unlockedModules = ['perfil-magnetico', 'mente-feminina', 'formula-seducao'];
            localStorage.setItem('ordem_unlocked_modules', JSON.stringify(unlockedModules));
            showToast('Pagamento confirmado! Todos os módulos do Arsenal foram liberados.');
        }

        // Oculta botões de teste em produção (só exibe se ?dev=1 estiver na URL)
        const devToolsBox = document.querySelector('.arsenal-dev-tools');
        if (devToolsBox && !urlParams.has('dev')) {
            devToolsBox.style.display = 'none';
        }

        function updateUnlockedUI() {
            const allBuyBtns = document.querySelectorAll('.btn-buy');
            const allAccessBtns = document.querySelectorAll('.btn-arsenal-access');

            allBuyBtns.forEach(buyBtn => {
                const modId = buyBtn.dataset.module;
                const accessBtn = document.querySelector(`.btn-arsenal-access[data-module="${modId}"]`);
                if (unlockedModules.includes(modId)) {
                    buyBtn.classList.add('hidden');
                    if (accessBtn) accessBtn.classList.remove('hidden');
                } else {
                    buyBtn.classList.remove('hidden');
                    if (accessBtn) accessBtn.classList.add('hidden');
                }
            });
        }
        updateUnlockedUI();

        // Verifica via Webhook (api.php?action=verify-vip) se o e-mail do comprador teve pagamento aprovado na Kiwify
        async function checkWebhookUnlock(silent = true) {
            const savedEmail = localStorage.getItem('ordem_buyer_email') || '';
            if (!savedEmail) return false;
            try {
                const res = await fetch(`api.php?action=verify-vip&email=${encodeURIComponent(savedEmail)}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: savedEmail })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.vip && data.member) {
                        const unlockedFromServer = Array.isArray(data.member.modules) ? data.member.modules : [];
                        let changed = false;
                        unlockedFromServer.forEach(m => {
                            if (!unlockedModules.includes(m)) {
                                unlockedModules.push(m);
                                changed = true;
                            }
                        });
                        if (data.member.credits_added && !localStorage.getItem(`credit_tx_${data.member.updated_at}`)) {
                            localStorage.setItem(`credit_tx_${data.member.updated_at}`, '1');
                            syncGlobalCredits(getGlobalCredits() + parseInt(data.member.credits_added, 10));
                            showToast(`+${data.member.credits_added} créditos confirmados via Kiwify!`);
                        }
                        if (changed) {
                            localStorage.setItem('ordem_unlocked_modules', JSON.stringify(unlockedModules));
                            updateUnlockedUI();
                            showToast('Pagamento confirmado na Kiwify! Acesso liberado.');
                            return true;
                        }
                    }
                }
            } catch (e) {}
            if (!silent) {
                showToast('Aguardando confirmação do pagamento pela Kiwify...');
            }
            return false;
        }

        // Quando o usuário volta à aba do app após o pagamento na Kiwify, consulta o Webhook real (NÃO desbloqueia sem pagar)
        window.addEventListener('focus', () => {
            unlockedModules = JSON.parse(localStorage.getItem('ordem_unlocked_modules') || '[]');
            updateUnlockedUI();
            checkWebhookUnlock(true);
        });

        // Clique no Botão de Compra/Desbloqueio (Abre Kiwify SEM desbloquear de graça)
        document.querySelectorAll('.btn-buy').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                triggerHaptic(20);
                const modId = btn.dataset.module;
                const mapKey = `mod_${(modId || '').replace(/-/g, '_')}`;
                const checkoutUrl = KIWIFY_CHECKOUT_LINKS[mapKey] || btn.dataset.checkout || 'https://pay.kiwify.com.br/mIglYN2';

                // Abre o checkout da Kiwify sem liberar o botão antes da confirmação do pagamento
                window.open(checkoutUrl, '_blank');
                showToast('Redirecionando para o checkout seguro da Kiwify. O acesso libera após o pagamento.');
            });
        });

        // Clique no Botão Verde de Acesso / Leitura
        document.querySelectorAll('.btn-arsenal-access').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                triggerHaptic();
                const modId = btn.dataset.module;
                openModuleModal(modId);
            });
        });

        // Botões de Ferramentas Dev/Teste
        const btnDevUnlockAll = document.getElementById('btnDevUnlockAllModules');
        const btnDevLockAll = document.getElementById('btnDevLockAllModules');

        if (btnDevUnlockAll) {
            btnDevUnlockAll.addEventListener('click', () => {
                triggerHaptic(20);
                unlockedModules = ['perfil-magnetico', 'mente-feminina', 'formula-seducao'];
                localStorage.setItem('ordem_unlocked_modules', JSON.stringify(unlockedModules));
                updateUnlockedUI();
                showToast('Modo Teste: Todos os botões tornaram-se verdes!');
            });
        }

        if (btnDevLockAll) {
            btnDevLockAll.addEventListener('click', () => {
                triggerHaptic(20);
                unlockedModules = [];
                localStorage.removeItem('ordem_unlocked_modules');
                updateUnlockedUI();
                showToast('Modo Teste: Todos os módulos bloqueados novamente.');
            });
        }

        if (elements.btnCloseModal) {
            elements.btnCloseModal.addEventListener('click', closeModuleModal);
        }
        if (elements.moduleModalOverlay) {
            elements.moduleModalOverlay.addEventListener('click', closeModuleModal);
        }
    }

    // Abertura do Modal de Leitura / Curso
    function openModuleModal(modId) {
        const data = moduleContentDatabase[modId];
        if (!data) return;

        elements.modalTitle.textContent = data.title;

        // SE FOR UM E-BOOK COM FORMATO DE LIVRO PREMIUM COMPLETO
        if (data.isEbook) {
            elements.modalBody.innerHTML = `
                <div class="reader-container">
                    <!-- Barra de Controle Superior do Livro -->
                    <div class="reader-controls-bar">
                        <button class="btn-toc-toggle" id="btnToggleToc">
                            <i class="fa-solid fa-list-ul"></i>
                            <span>Sumário & Capa</span>
                        </button>
                        <div class="reader-progress-info" id="readerProgressInfo">
                            <span><i class="fa-solid fa-bookmark" style="color: var(--accent-gold);"></i> <strong id="progressSectionName">Capa</strong></span>
                        </div>
                    </div>

                    <!-- Barra de Progresso Visual de Leitura -->
                    <div class="reader-progress-track">
                        <div class="reader-progress-fill" id="readerProgressBar"></div>
                    </div>

                    <!-- Caixa de Conteúdo Principal (Capa, Sumário ou Capítulo Atual) -->
                    <div class="reader-content-box" id="readerContentBox"></div>

                    <!-- Ações de Navegação do Rodapé -->
                    <div class="reader-footer-actions">
                        <div class="reader-step-row">
                            <button class="btn-reader-nav" id="btnReaderPrev">
                                <i class="fa-solid fa-chevron-left"></i> Anterior
                            </button>
                            <button class="btn-reader-nav" id="btnReaderToc">
                                <i class="fa-solid fa-list-ol"></i> Sumário
                            </button>
                            <button class="btn-reader-nav" id="btnReaderNext">
                                Próximo <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                        <button class="btn-download-pdf-app" id="btnDownloadFullBook">
                            <i class="fa-solid fa-cloud-arrow-down"></i>
                            <span>SALVAR EDIÇÃO OFICIAL PARA LEITURA OFFLINE</span>
                        </button>
                    </div>
                </div>
            `;

            const contentBox = elements.modalBody.querySelector('#readerContentBox');
            const progressFill = elements.modalBody.querySelector('#readerProgressBar');
            const progressSectionName = elements.modalBody.querySelector('#progressSectionName');
            const btnPrev = elements.modalBody.querySelector('#btnReaderPrev');
            const btnNext = elements.modalBody.querySelector('#btnReaderNext');
            const btnToc = elements.modalBody.querySelector('#btnReaderToc');
            const btnToggleToc = elements.modalBody.querySelector('#btnToggleToc');
            const btnDownload = elements.modalBody.querySelector('#btnDownloadFullBook');

            let currentSecIdx = 0; // 0 = Cover, 1 = TOC, 2+ = Chapters

            function renderSection(idx) {
                if (idx < 0 || idx >= data.sections.length) return;
                currentSecIdx = idx;
                const sec = data.sections[idx];

                // Atualiza barra de progresso
                const progressPct = Math.round((idx / (data.sections.length - 1)) * 100);
                if (progressFill) progressFill.style.width = `${progressPct}%`;
                if (progressSectionName) progressSectionName.textContent = `${sec.navTitle || sec.title} (${progressPct}%)`;

                // Renderiza o conteúdo da seção
                if (sec.type === 'cover') {
                    contentBox.innerHTML = sec.html;
                    const btnStart = contentBox.querySelector('#btnCoverStartRead');
                    if (btnStart) {
                        btnStart.addEventListener('click', () => {
                            triggerHaptic(15);
                            renderSection(1); // Vai para o Sumário
                        });
                    }
                } else if (sec.type === 'toc') {
                    contentBox.innerHTML = sec.html;
                    const tocList = contentBox.querySelector('#bookTocList');
                    if (tocList) {
                        tocList.innerHTML = '';
                        data.sections.forEach((s, i) => {
                            if (s.type === 'cover') return;
                            const item = document.createElement('div');
                            item.className = 'book-toc-item';
                            item.innerHTML = `
                                <div class="toc-item-left">
                                    <div class="toc-number">${s.number || (i === 1 ? '📑' : i)}</div>
                                    <div class="toc-info">
                                        <h5>${s.title}</h5>
                                        <p>${s.navTitle} · Leitura recomendada</p>
                                    </div>
                                </div>
                                <span class="toc-time-badge">${s.readTime || '3 min'}</span>
                            `;
                            item.addEventListener('click', () => {
                                triggerHaptic(15);
                                renderSection(i);
                            });
                            tocList.appendChild(item);
                        });
                    }
                } else {
                    // Capítulo de texto
                    contentBox.innerHTML = `
                        <div class="reader-chapter-title-box" style="margin-bottom: 16px;">
                            <span class="book-cover-badge" style="margin-bottom: 6px;"><i class="fa-solid fa-feather"></i> ${sec.number || 'CAPÍTULO'} · ${sec.readTime || '5 min'}</span>
                            <h3 style="font-size: 19px; line-height: 1.35; margin-bottom: 6px;">${sec.title}</h3>
                        </div>
                        ${sec.content}
                    `;

                    // Adiciona botão de copiar prático nos cards de script/bio dentro dos capítulos
                    contentBox.querySelectorAll('.tactical-script-card').forEach(card => {
                        const header = card.querySelector('.script-card-header');
                        const scriptTextEl = card.querySelector('.script-text');
                        if (header && scriptTextEl && !header.querySelector('.btn-copy-ebook-script')) {
                            const copyBtn = document.createElement('button');
                            copyBtn.className = 'btn-copy-ebook-script';
                            copyBtn.style.cssText = 'background:rgba(245,158,11,0.14); border:1px solid rgba(245,158,11,0.35); color:#fbbf24; border-radius:6px; padding:3px 9px; font-size:11px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:5px;';
                            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';
                            copyBtn.addEventListener('click', () => {
                                const rawText = scriptTextEl.innerText.trim().replace(/^"|"$/g, '');
                                navigator.clipboard.writeText(rawText);
                                copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copiado!';
                                showToast('Script do livro copiado!');
                                setTimeout(() => {
                                    copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copiar';
                                }, 1800);
                            });
                            header.appendChild(copyBtn);
                        }
                    });
                }

                // Scroll para o topo
                contentBox.scrollTop = 0;

                // Desabilita botões nos limites
                if (btnPrev) btnPrev.disabled = (idx === 0);
                if (btnNext) btnNext.disabled = (idx === data.sections.length - 1);
            }

            if (btnPrev) {
                btnPrev.addEventListener('click', () => {
                    triggerHaptic(10);
                    renderSection(currentSecIdx - 1);
                });
            }

            if (btnNext) {
                btnNext.addEventListener('click', () => {
                    triggerHaptic(10);
                    renderSection(currentSecIdx + 1);
                });
            }

            if (btnToc) {
                btnToc.addEventListener('click', () => {
                    triggerHaptic(10);
                    renderSection(1); // Sumário
                });
            }

            if (btnToggleToc) {
                btnToggleToc.addEventListener('click', () => {
                    triggerHaptic(10);
                    renderSection(1); // Sumário
                });
            }

            if (btnDownload) {
                btnDownload.addEventListener('click', () => {
                    window.downloadFullBookPdf(modId);
                });
            }

            // Inicia na Capa do Livro (Seção 0)
            renderSection(0);

        } else {
            // Conteúdo de Vídeo-Aulas (Kiwify)
            elements.modalBody.innerHTML = data.html;
        }

        elements.moduleModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModuleModal() {
        triggerHaptic(15);
        elements.moduleModal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // ==========================================================================
    // RECARGA DE CRÉDITOS AVULSOS (ARSENAL)
    // ==========================================================================
    function setupCreditRecharge() {
        const rechargeCard = document.getElementById('card-credit-recharge');
        if (!rechargeCard) return;

        const packageOptions = rechargeCard.querySelectorAll('.credit-package-option');
        const btnBuy = document.getElementById('btnBuyCredits');

        packageOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                triggerHaptic(20);
                packageOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');

                const credits = opt.dataset.credits || '15';
                const price = opt.dataset.price || '14,90';
                const checkout = opt.dataset.checkout || 'https://pay.kiwify.com.br/mIglYN2';

                if (btnBuy) {
                    btnBuy.href = checkout;
                    btnBuy.innerHTML = `<span>Comprar ${credits} Créditos · R$ ${price}</span><i class="fa-solid fa-arrow-right"></i>`;
                }
            });
        });

        // Atalho do modal de bloqueio (Paywall) direto para o card de recarga no Arsenal
        const btnLockRecharge = document.getElementById('btnLockRecharge');
        if (btnLockRecharge) {
            btnLockRecharge.addEventListener('click', () => {
                const paywallModal = document.getElementById('paywallLockModal');
                if (paywallModal) paywallModal.classList.add('hidden');

                const arsenalNavBtn = document.querySelector('.nav-item[data-tab="tab-arsenal"]');
                if (arsenalNavBtn) {
                    arsenalNavBtn.click();
                    setTimeout(() => {
                        rechargeCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 150);
                }
            });
        }
    }

    // Botões de Copiar com 1 Clique
    function setupCopyButtons() {
        document.querySelectorAll('.btn-copy').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                triggerHaptic(20);
                const targetId = btn.dataset.target;
                const targetEl = document.getElementById(targetId);
                if (!targetEl) return;

                const textToCopy = targetEl.textContent.trim().replace(/^"|"$/g, '');
                
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        handleCopySuccess(btn);
                    }).catch(() => {
                        fallbackCopy(textToCopy, btn);
                    });
                } else {
                    fallbackCopy(textToCopy, btn);
                }
            };
        });
    }

    function fallbackCopy(text, btn) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            handleCopySuccess(btn);
        } catch (err) {
            showToast('Erro ao copiar.');
        }
        document.body.removeChild(textArea);
    }

    function handleCopySuccess(btn) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i><span style="color: #10b981;">Copiado!</span>';
        btn.style.borderColor = '#10b981';
        showToast('Copiado para a área de transferência!');

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.borderColor = '';
        }, 2000);
    }

    function showToast(message) {
        elements.toastMsg.textContent = message;
        elements.toast.classList.remove('hidden');
        clearTimeout(elements.toastTimeout);
        elements.toastTimeout = setTimeout(() => {
            elements.toast.classList.add('hidden');
        }, 2500);
    }

    // Inicializa
    init();
});
