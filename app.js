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
            auto: "<strong>Visão no Story / Foto:</strong> A IA examina a foto ou story e determina se o melhor é uma invasão do zero, reacender a atração ou avançar.",
            invasao: "<strong>Visão no Story / Foto:</strong> A IA varre o cenário da foto (comida, taça, roupas, fundo) para criar uma quebra de padrão espontânea sem elogiar o corpo.",
            conducao: "<strong>Visão no Story:</strong> A IA analisa uma foto postada no meio da conversa para reacender a atração com um comentário desafiador.",
            extracao: "<strong>Visão no Story:</strong> A IA usa a imagem como desculpa para dizer que o Instagram corta conteúdos e pedir o WhatsApp.",
            fechamento: "<strong>Visão no Story:</strong> A IA usa o restaurante, bebida ou evento do story dela como pretexto exato para fazer o convite a dois."
        },
        chat: {
            auto: "<strong>Visão na Conversa / Chat:</strong> A IA lê a DM, avalia quem mandou a última mensagem, se houve vácuo e diagnostica o momento exato.",
            invasao: "<strong>Visão na Conversa / Vácuo:</strong> A IA lê a DM anterior onde ela parou de responder e gera uma mensagem de reativação para quebrar o gelo sem parecer carente.",
            conducao: "<strong>Visão na Conversa:</strong> A IA analisa o tom e tamanho da última mensagem dela para calibrar o ritmo e devolver uma resposta com tensão magnética.",
            extracao: "<strong>Visão na Conversa:</strong> A IA identifica o ápice do diálogo para criar a ponte orgânica para o WhatsApp no momento perfeito.",
            fechamento: "<strong>Visão na Conversa:</strong> A IA analisa a receptividade do chat e formula o convite fechado (dia, local e hora) eliminando desculpas."
        }
    };

    // Dados das 4 Fases para o Oráculo
    const phaseDefinitions = {
        auto: {
            badge: "IA AUTOMÁTICA",
            title: "Modo Inteligente: Auto-Diagnóstico de Fase",
            desc: "A visão computacional avalia todo o contexto visual e textual do print para diagnosticar em qual fase vocês estão (Invasão, Condução, Extração ou Fechamento) e aplicar a jogada cirúrgica.",
            intel: { phase: "Auto-Diagnóstico", termometro: "Calculando...", gancho: "Visão Computacional" },
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
            title: "A Invasão: Quebrar o Silêncio nos Stories & DMs",
            desc: "A visão computacional busca 2 elementos inusitados de fundo no print para gerar um abridor descontraído, confiante e sem clichês de 'oi linda'.",
            intel: { phase: "Fase I: A Invasão", termometro: "Gelo / Silêncio", gancho: "Cenário & Detalhe de Fundo" },
            responses: {
                opt1: '"Você tem exatamente a cara de quem finge costume com viagens assim, mas se perde na primeira esquina."',
                opt2: '"Três detalhes me chamaram atenção no fundo desse story, mas o segundo com certeza você achou que ninguém ia notar."',
                opt3: '"O fotógrafo merece aumento pelo ângulo, mas o reflexo na taça entregou o verdadeiro contexto dessa foto."'
            },
            advice: {
                opt1: "<strong>Quando usar:</strong> Perfeita se ela estiver bancando a inacessível. O humor desconcertante obriga ela a se justificar rindo, sem você parecer emocionado.",
                opt2: "<strong>Quando usar:</strong> Excelente para quebrar o padrão dos caras que só elogiam a beleza. Cria curiosidade imediata e ela vai perguntar qual é o detalhe.",
                opt3: "<strong>Quando usar:</strong> Use se houver contexto visual de restaurante/festa. Desarma a pose de perfeita mostrando que você é observador e audacioso."
            },
            opt3Badge: "Avanço Seguro"
        },
        conducao: {
            badge: "FASE II",
            title: "A Condução: Ritmo Magnético, Atração & Tensão",
            desc: "A IA avalia a velocidade de resposta dela e o tamanho das mensagens para ditar o ritmo exato, evitar a friendzone e criar antecipação.",
            intel: { phase: "Fase II: A Condução", termometro: "Curiosidade Média", gancho: "Desafio & Qualificação" },
            responses: {
                opt1: '"Se você for metade do tempo tão imprevisível pessoalmente quanto é por mensagem, nossa conversa vai ser um perigo."',
                opt2: '"Geralmente quem demora para responder ou está fingindo desinteresse ou não aguenta 10 minutos de conversa afiada. Qual das duas é você?"',
                opt3: '"Acho fascinante como você consegue sustentar uma pose de durona com cara de quem pede sobremesa antes do almoço."'
            },
            advice: {
                opt1: "<strong>Quando usar:</strong> Quando a conversa estiver morna. Insinua atração e perigo sem você ser vulgar, deixando ela pensando em você.",
                opt2: "<strong>Quando usar:</strong> Se ela começou a demorar para responder ou mandou texto curto. Desafia o ego dela com elegância e sem desespero.",
                opt3: "<strong>Quando usar:</strong> Excelente contraste entre humor e tensão sexual. Mostra que você enxerga através das defesas dela."
            },
            opt3Badge: "Tensão Ativa"
        },
        extracao: {
            badge: "FASE III",
            title: "A Extração: A Ponte Natural para o WhatsApp",
            desc: "Identifica o pico emocional da conversa no Instagram para transicionar para o número pessoal dela de forma fluida, sem pedir permissão.",
            intel: { phase: "Fase III: A Extração", termometro: "Interesse Elevado", gancho: "Transição Situacional" },
            responses: {
                opt1: '"Eu quase nunca abro a DM daqui durante a semana. Me manda um oi no WhatsApp que te conto o desfecho dessa história: (DDD) 9XXXX-XXXX."',
                opt2: '"O Instagram vai cortar o áudio desse caso. Me passa seu número que te mando por lá antes que eu entre em reunião."',
                opt3: '"Só troco ideia no WhatsApp com quem parece que vai sustentar uma conversa interessante pessoalmente. Você passou no teste preliminar."'
            },
            advice: {
                opt1: "<strong>Quando usar:</strong> No auge de um assunto curioso. Você entrega seu número e inverte o papel: agora é ela quem tem que ir atrás de você.",
                opt2: "<strong>Quando usar:</strong> O pretexto funcional perfeito. Áudios geram muito mais conexão e intimidade que texto na DM.",
                opt3: "<strong>Quando usar:</strong> Se ela estiver muito investida na conversa. A qualificação sutil faz ela se sentir escolhida, aumentando o valor dela para você."
            },
            opt3Badge: "Ponte WhatsApp"
        },
        fechamento: {
            badge: "FASE IV",
            title: "O Fechamento: O Convite Blindado a Dois",
            desc: "Prepara o terreno e formula o convite definitivo para sair a dois (barzinho, drinks, jantar), eliminando desculpas de 'vou ver na agenda'.",
            intel: { phase: "Fase IV: O Fechamento", termometro: "Pronta pro Encontro", gancho: "Convite a Dois" },
            responses: {
                opt1: '"Quinta-feira eu vou tomar um drink em um lugar que você provavelmente nunca foi. Às 20h30 eu passo pra te buscar ou você prefere ir direto?"',
                opt2: '"Depois de você defender aquele assunto com tanta convicção, você me deve uma avaliação gastronômica. Sábado às 20h você é minha convidada."',
                opt3: '"Sem problemas, eu também só saio com quem tem certeza da companhia. Se você conseguir vaga nessa sua agenda concorrida, me avisa até quarta."'
            },
            advice: {
                opt1: "<strong>Quando usar:</strong> O convite assertivo definitivo. Dita dia, horário e clima com falsa escolha (buscar ou ir direto), sem dar margem para enrolação.",
                opt2: "<strong>Quando usar:</strong> Quando vocês brincaram sobre comida ou gostos. Usa a própria coerência dela como justificativa elegante para o encontro.",
                opt3: "<strong>Quando usar:</strong> Retirada tática imediata se ela der desculpa de 'vou ver na agenda'. Mostra desapego de alto valor e faz ela reconsiderar na hora."
            },
            opt3Badge: "Convite Cravado"
        }
    };

    // Conteúdo dos 4 Guias para o Grimório
    const grimorioGuides = {
        '1': {
            title: "Guia I: A Invasão (Abertura de Stories)",
            rule: "Regra Anti-Gado: Nunca elogie a beleza ou o corpo dela.",
            desc: "Mulheres atraentes recebem dezenas de mensagens por dia dizendo 'linda', 'maravilhosa' e emojis de fogo. O cérebro dela ignora no piloto automático. A invasão funciona atacando o contexto ao redor dela, nunca a pose.",
            error: "Mandar 'Oi tudo bem?', reagir com palminha ou comentar 'Nossa que gata'. Ela visualiza e nunca responde.",
            secret: "Aponte algo bizarro, engraçado ou curioso no ambiente da foto (um objeto estranho, um cachorro de fundo, a comida). Isso força uma resposta de defesa ou risada.",
            script: '"Você tem cara de quem pediu esse drink só pela cor do copo e não deu 2 goles."'
        },
        '2': {
            title: "Guia II: A Condução (O Ritmo Magnético)",
            rule: "Regra do Espelhamento Invertido: Quem responde rápido demais parece desocupado; quem demora dias parece forçado.",
            desc: "O desejo não nasce enquanto você conversa — ele nasce no intervalo entre uma mensagem e outra. Controlar o tempo e a densidade das respostas faz você ocupar a mente dela.",
            error: "Mandar parágrafos gigantes para respostas monossilábicas dela. Isso entrega todo o seu valor de graça.",
            secret: "Responda sempre com 70% do tamanho da mensagem dela e adicione uma pitada de desafio leve para ela se qualificar.",
            script: '"Geralmente quem fala pouco por mensagem ou é muito interessante pessoalmente ou é monótona. Qual das duas é você?"'
        },
        '3': {
            title: "Guia III: A Extração (Transição para o WhatsApp)",
            rule: "Regra do Pretexto Orgânico: Nunca peça o número como um favor.",
            desc: "O Instagram é uma vitrine pública cheia de distrações. O WhatsApp é a sala de estar íntima. A transição deve parecer a consequência lógica de uma conversa que ficou boa demais para a DM.",
            error: "Dizer 'Me passa seu Whats pra gente conversar melhor?'. Soa como um formulário burocrático.",
            secret: "Use um gancho de mídia (um áudio que o Instagram cortaria, uma foto, uma recomendação) ou entregue seu número primeiro em tom confiante.",
            script: '"Eu odeio o teclado do Instagram. Me manda um oi no WhatsApp que te conto o resto: (DDD) 9XXXX-XXXX."'
        },
        '4': {
            title: "Guia IV: O Fechamento (O Convite a Dois)",
            rule: "Regra da Escolha Fechada: Nunca pergunte 'quando você pode sair?'. Dite o dia, o horário e o clima.",
            desc: "O objetivo final de toda interação não é ser amigo virtual. É sentar na frente dela, olho no olho, com um drink na mão. O fechamento precisa ser natural, específico e de baixa pressão.",
            error: "Ficar meses conversando sobre o tempo sem nunca propor um encontro, até virar o 'amigo fofoqueiro' dela.",
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
        setupCantadasGenerator();
        setupPhaseRows();
        setupSubmodeSelector();
        setupDropzone();
        setupClipboardPaste();
        setupPlansTab();
        setupArsenalAndModals();
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
        const viewCantadas = document.getElementById('view-cantadas');
        const toolViews = [viewHub, viewOraculo, viewCoach, viewCantadas];

        function switchToolView(activePane) {
            triggerHaptic(20);
            toolViews.forEach(v => {
                if (v) v.classList.add('hidden');
            });
            if (activePane) activePane.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Tabs Ferramentas vs Histórico na Home
        hubTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                triggerHaptic();
                hubTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const tab = btn.dataset.hubTab;
                if (tab === 'history') {
                    if (toolsList) toolsList.classList.add('hidden');
                    if (historyList) historyList.classList.remove('hidden');
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

        document.querySelectorAll('[data-action="open-cantadas"]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                switchToolView(viewCantadas);
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

    // Setup do Coach de Emergência (com Sistema de Créditos & Paywall Lock)
    function setupCoachEmergency() {
        let credits = parseInt(localStorage.getItem('ordem_user_credits') || '5', 10);
        const creditCountEl = document.getElementById('userCreditsCount');
        const coachCreditsLeftEl = document.getElementById('coachCreditsLeft');
        const situationInput = document.getElementById('coachSituationInput');
        const btnAskCoach = document.getElementById('btnAskCoach');
        const responseContainer = document.getElementById('coachResponseContainer');
        const diagnosisTextEl = document.getElementById('coachDiagnosisText');
        const scriptTextEl = document.getElementById('coachScriptText');
        const actionGuideEl = document.getElementById('coachActionGuide');
        const btnCopyCoach = document.getElementById('btnCopyCoach');

        // Modal de Bloqueio (Paywall)
        const paywallLockModal = document.getElementById('paywallLockModal');
        const paywallLockOverlay = document.getElementById('paywallLockOverlay');
        const btnCloseLockModal = document.getElementById('btnCloseLockModal');
        const btnLockViewPlans = document.getElementById('btnLockViewPlans');

        function updateCreditsDisplay() {
            if (creditCountEl) creditCountEl.textContent = credits;
            if (coachCreditsLeftEl) coachCreditsLeftEl.textContent = credits;
            localStorage.setItem('ordem_user_credits', credits.toString());
        }
        updateCreditsDisplay();

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
                // Vai direto para a aba de Planos
                const plansNavBtn = document.querySelector('.nav-item[data-tab="tab-protocolos"]');
                if (plansNavBtn) plansNavBtn.click();
            });
        }

        if (btnAskCoach) {
            btnAskCoach.addEventListener('click', async () => {
                const situation = situationInput ? situationInput.value.trim() : '';

                if (!situation) {
                    showToast('Descreva o que está acontecendo com ela antes de enviar.');
                    return;
                }

                // TRAVA DE CRÉDITOS (SE CHEGAR A ZERO)
                if (credits <= 0) {
                    showPaywallLock();
                    return;
                }

                btnAskCoach.disabled = true;
                btnAskCoach.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Consultando Coach...</span>';
                triggerHaptic(30);

                try {
                    const endpoint = window.location.protocol === 'file:' ? 'http://localhost:3000/api/coach' : '/api/coach';
                    const res = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ situation })
                    });
                    const result = await res.json();

                    if (result.success && result.data) {
                        credits--;
                        updateCreditsDisplay();

                        if (diagnosisTextEl) diagnosisTextEl.textContent = result.data.diagnosis || 'Análise da dinâmica traçada.';
                        if (scriptTextEl) scriptTextEl.textContent = result.data.script || 'Envie a resposta de contra-ataque.';
                        if (actionGuideEl) actionGuideEl.textContent = result.data.actionGuide || 'Mantenha a postura recomendada.';

                        if (responseContainer) {
                            responseContainer.classList.remove('hidden');
                            responseContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                        showToast(`Parecer pronto! Restam ${credits} créditos.`);
                    } else {
                        showToast('Erro ao consultar o Coach. Tente novamente.');
                    }
                } catch (e) {
                    // Fallback se estiver offline
                    credits--;
                    updateCreditsDisplay();
                    if (diagnosisTextEl) diagnosisTextEl.textContent = "Ela está testando o seu nível de apego e segurança. Quanto mais rápido você cobrar resposta, mais baixo fica o seu valor.";
                    if (scriptTextEl) scriptTextEl.textContent = '"Pelo visto o dia aí tá corrido. Me avisa quando desocupar pra gente continuar o papo."';
                    if (actionGuideEl) actionGuideEl.textContent = "Aguarde ela responder espontaneamente sem mandar nenhuma mensagem adicional.";
                    if (responseContainer) responseContainer.classList.remove('hidden');
                    showToast(`Parecer gerado. Restam ${credits} créditos.`);
                } finally {
                    btnAskCoach.disabled = false;
                    btnAskCoach.innerHTML = '<span>Pedir Conselho</span><i class="fa-solid fa-paper-plane"></i>';
                }
            });
        }

        if (btnCopyCoach && scriptTextEl) {
            btnCopyCoach.addEventListener('click', () => {
                navigator.clipboard.writeText(scriptTextEl.textContent);
                showToast('Resposta do Coach copiada!');
            });
        }
    }

    // Setup do Gerador de Cantadas Rápidas
    function setupCantadasGenerator() {
        const toneCards = document.querySelectorAll('.cantadas-tone-card');
        const btnGenerate = document.getElementById('btnGenerateNewCantadas');
        const text1 = document.getElementById('cantadaText1');
        const text2 = document.getElementById('cantadaText2');
        const text3 = document.getElementById('cantadaText3');

        const cantadasBank = {
            provocacao: [
                '"Você tem exatamente a cara de quem finge costume com viagens assim, mas se perde na primeira esquina."',
                '"O fotógrafo merece aumento pelo ângulo, mas o contexto entregou que você improvisou."',
                '"Geralmente quem posta foto com essa pose ou é um perigo ou é quietinha demais. Qual é o seu caso?"'
            ],
            enigma: [
                '"Eu ia te elogiar, mas esse detalhe no fundo da foto entregou seu maior segredo."',
                '"Você acredita em coincidência ou já estava planejando postar isso pra ver quem notava?"',
                '"Tem uma coisa nessa foto que fez eu mudar completamente de opinião sobre você."'
            ],
            humor: [
                '"Pelo silêncio, aposto que o sol queimou além da conta e você tá de molho no hidratante."',
                '"Seu sorriso devia vir com aviso prévio de perigo antes das 22h."',
                '"Acho fascinante como você consegue sustentar uma pose de durona com cara de quem pede sobremesa antes do almoço."'
            ]
        };

        let currentTone = 'provocacao';

        toneCards.forEach(card => {
            card.addEventListener('click', () => {
                triggerHaptic();
                toneCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                currentTone = card.dataset.tone;
                renderCantadas();
            });
        });

        function renderCantadas() {
            const list = cantadasBank[currentTone] || cantadasBank.provocacao;
            if (text1) text1.textContent = list[0];
            if (text2) text2.textContent = list[1];
            if (text3) text3.textContent = list[2];
        }

        if (btnGenerate) {
            btnGenerate.addEventListener('click', () => {
                triggerHaptic(20);
                renderCantadas();
                showToast('Novas opções geradas!');
            });
        }

        document.querySelectorAll('.btn-copy-small').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = btn.dataset.copyFrom;
                const el = document.getElementById(targetId);
                if (el) {
                    navigator.clipboard.writeText(el.textContent.replace(/"/g, ''));
                    showToast('Cantada copiada!');
                }
            });
        });
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

                // Se clicou na aba Início (tab-scanner), volta a exibir o Hub com os 3 cards
                if (targetTab === 'tab-scanner') {
                    const viewHub = document.getElementById('view-hub');
                    const toolViews = [viewHub, document.getElementById('view-oraculo'), document.getElementById('view-coach'), document.getElementById('view-cantadas')];
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

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showToast('Envie apenas arquivos de imagem.');
            return;
        }

        state.selectedFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            state.selectedBase64 = e.target.result;
            elements.previewImg.src = state.selectedBase64;
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
            // Tenta chamar o endpoint de Visão Computacional (Node ou PHP)
            const endpoint = window.location.protocol === 'file:' ? 'http://localhost:3000/api/scan' : '/api/scan';
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: state.selectedBase64,
                    phase: state.selectedPhase,
                    submode: state.selectedSubmode
                })
            });

            const result = await response.json();

            if (result.success && result.data) {
                // SUCESSO REAL VIA IA
                renderRealAIResponse(result.data);
                showToast('Decodificação REAL da IA concluída!');
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
            document.getElementById('textOption1').textContent = data.options[0].text;
            document.getElementById('textOption2').textContent = data.options[1].text;
            document.getElementById('textOption3').textContent = data.options[2].text;

            const desc1 = document.getElementById('intelDescOption1');
            const desc2 = document.getElementById('intelDescOption2');
            const desc3 = document.getElementById('intelDescOption3');
            if (desc1) desc1.innerHTML = data.options[0].advice || '';
            if (desc2) desc2.innerHTML = data.options[1].advice || '';
            if (desc3) desc3.innerHTML = data.options[2].advice || '';
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
    // ARSENAL & MODAL DE CONTEÚDO LIBERADO (LIVROS / ÁUDIOS)
    // ==========================================================================
    const moduleContentDatabase = {
        'oraculo-pro': {
            title: "Oráculo Pro · Acesso Ilimitado Ativado",
            html: `
                <div class="modal-book-box">
                    <div style="color: var(--accent-gold); font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px;">STATUS DA CONTA</div>
                    <h4 style="color: #fff; font-size: 15px; margin-bottom: 8px;">Scans Ilimitados sem Restrições</h4>
                    <p style="color: var(--text-muted); font-size: 12.5px; line-height: 1.5; margin-bottom: 12px;">
                        Sua conta foi promovida ao nível <strong>Adepto da Ordem</strong>. Agora você tem prioridade máxima nas filas de processamento da IA e pode escanear quantos prints de conversas e stories quiser por dia.
                    </p>
                    <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 10px; color: var(--accent-green); font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
                        <i class="fa-solid fa-check-circle"></i> Limite Diário Removido com Sucesso
                    </div>
                </div>
            `
        },
        'audios': {
            title: "Grimório dos Áudios Magnéticos",
            html: `
                <div class="modal-book-box">
                    <div style="color: var(--accent-gold); font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px;">TREINAMENTO TÁTICO DE VOZ</div>
                    <p style="color: var(--text-muted); font-size: 12px; line-height: 1.5; margin-bottom: 14px;">
                        Ouça as faixas abaixo com fones de ouvido para calibrar o tom grave, a ressonância do peito e as pausas magnéticas antes de mandar áudios no WhatsApp.
                    </p>
                    
                    <div class="modal-audio-track">
                        <div class="track-header">
                            <span class="track-name"><i class="fa-solid fa-play" style="color: var(--accent-gold); margin-right: 6px;"></i> 01. A Modulação Hipnótica (Tom Grave)</span>
                            <span class="track-duration">03:42</span>
                        </div>
                        <audio controls style="width: 100%; height: 36px; margin-top: 4px;">
                            <source src="#" type="audio/mpeg">
                            Seu navegador não suporta reprodução de áudio.
                        </audio>
                    </div>

                    <div class="modal-audio-track">
                        <div class="track-header">
                            <span class="track-name"><i class="fa-solid fa-play" style="color: var(--accent-gold); margin-right: 6px;"></i> 02. O Poder da Pausa & Silêncio Tático</span>
                            <span class="track-duration">04:15</span>
                        </div>
                        <audio controls style="width: 100%; height: 36px; margin-top: 4px;">
                            <source src="#" type="audio/mpeg">
                        </audio>
                    </div>

                    <div class="modal-audio-track">
                        <div class="track-header">
                            <span class="track-name"><i class="fa-solid fa-play" style="color: var(--accent-gold); margin-right: 6px;"></i> 03. O Áudio Coringa de Convite Irrecusável</span>
                            <span class="track-duration">02:50</span>
                        </div>
                        <audio controls style="width: 100%; height: 36px; margin-top: 4px;">
                            <source src="#" type="audio/mpeg">
                        </audio>
                    </div>
                </div>
            `
        },
        'fechamento-dois': {
            title: "O Fechamento Perfeito a Dois",
            html: `
                <div class="modal-book-box">
                    <div style="color: var(--accent-gold); font-size: 11px; font-weight: 800; letter-spacing: 1px; margin-bottom: 6px;">LIVRO DIGITAL & PROTOCOLO COMPLETO</div>
                    <h4 style="color: #fff; font-size: 15px; margin-bottom: 8px;">Do Barzinho ao Final a Dois</h4>
                    <p style="color: var(--text-muted); font-size: 12.5px; line-height: 1.5; margin-bottom: 12px;">
                        O passo a passo minucioso de 48 páginas sobre como sentar à mesa, posicionar sua linguagem corporal, quebrar a barreira do toque sutil e fazer a transição para a sua casa sem parecer apressado.
                    </p>
                    <button class="btn-download-book" onclick="alert('Iniciando download do Livro Digital (PDF)...')">
                        <i class="fa-solid fa-file-pdf"></i>
                        <span>BAIXAR O LIVRO DIGITAL COMPLETO (PDF)</span>
                    </button>
                </div>
            `
        }
    };

    function setupArsenalAndModals() {
        const unlockedModules = JSON.parse(localStorage.getItem('ordem_unlocked_modules') || '[]');

        function updateUnlockedUI() {
            unlockedModules.forEach(modId => {
                const buyBtn = document.querySelector(`.btn-buy[data-module="${modId}"]`);
                const accessBtn = document.querySelector(`.btn-arsenal-access[data-module="${modId}"]`);
                if (buyBtn && accessBtn) {
                    buyBtn.classList.add('hidden');
                    accessBtn.classList.remove('hidden');
                }
            });
        }
        updateUnlockedUI();

        elements.btnBuyList.forEach(btn => {
            btn.addEventListener('click', () => {
                triggerHaptic(20);
                const modId = btn.dataset.module;
                const checkoutUrl = btn.dataset.checkout;

                window.open(checkoutUrl, '_blank');

                if (!unlockedModules.includes(modId)) {
                    unlockedModules.push(modId);
                    localStorage.setItem('ordem_unlocked_modules', JSON.stringify(unlockedModules));
                }

                showToast('Acesso liberado! Clique em ACESSAR MÓDULO.');
                updateUnlockedUI();
            });
        });

        elements.btnAccessList.forEach(btn => {
            btn.addEventListener('click', () => {
                triggerHaptic();
                const modId = btn.dataset.module;
                openModuleModal(modId);
            });
        });

        if (elements.btnCloseModal) {
            elements.btnCloseModal.addEventListener('click', closeModuleModal);
        }
        if (elements.moduleModalOverlay) {
            elements.moduleModalOverlay.addEventListener('click', closeModuleModal);
        }
    }

    function openModuleModal(modId) {
        const data = moduleContentDatabase[modId];
        if (!data) return;

        elements.modalTitle.textContent = data.title;
        elements.modalBody.innerHTML = data.html;
        elements.moduleModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModuleModal() {
        triggerHaptic(15);
        elements.moduleModal.classList.add('hidden');
        document.body.style.overflow = '';
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
