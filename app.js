/**
 * ORDEM OCULTA | PROTOCOLO DA RESPOSTA IMEDIATA
 * Motor da Aplicação: Oráculo Multimodal por Fase & Grimório dos 4 Guias
 */

document.addEventListener('DOMContentLoaded', () => {
    // Estado da Aplicação
    const state = {
        activeTab: 'tab-scanner',
        selectedPhase: 'invasao', // 'invasao' | 'conducao' | 'extracao' | 'fechamento'
        selectedFile: null,
        selectedBase64: null,
        isScanning: false,
        activeGuide: '1'
    };

    // Dados das 4 Fases para o Oráculo
    const phaseDefinitions = {
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
        setupPhaseRows();
        setupDropzone();
        setupClipboardPaste();
        setupGrimorio();
        setupCopyButtons();
        updatePhaseBanner('invasao');
        renderGrimorioGuide('1');
    }

    // Navegação entre Abas Principais
    function setupNavigation() {
        elements.navItems.forEach(item => {
            item.addEventListener('click', () => {
                triggerHaptic();
                const targetTab = item.dataset.tab;
                
                elements.navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                elements.tabPanes.forEach(pane => {
                    if (pane.id === targetTab) {
                        pane.classList.add('active');
                    } else {
                        pane.classList.remove('active');
                    }
                });

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
    function runScanSequence() {
        state.isScanning = true;
        triggerHaptic(40);

        elements.previewWrapper.classList.add('scanning');
        elements.btnScan.disabled = true;
        elements.scanSpinner.classList.remove('hidden');
        elements.btnLabel.textContent = 'ANALISANDO CENÁRIO & SINAIS...';

        setTimeout(() => {
            state.isScanning = false;
            elements.previewWrapper.classList.remove('scanning');
            elements.btnScan.disabled = false;
            elements.scanSpinner.classList.add('hidden');
            elements.btnLabel.textContent = `DECODIFICAR NOVAMENTE`;

            applyPhaseResponses(state.selectedPhase);
            elements.resultsContainer.classList.remove('hidden');
            elements.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

            triggerHaptic(50);
            showToast('Decodificação da Ordem concluída!');
        }, 2200);
    }

    function applyPhaseResponses(phaseKey) {
        const def = phaseDefinitions[phaseKey];
        if (!def) return;

        document.getElementById('intelPhase').textContent = def.intel.phase;
        document.getElementById('intelInterest').textContent = def.intel.termometro;
        document.getElementById('intelHook').textContent = def.intel.gancho;

        document.getElementById('textOption1').textContent = def.responses.opt1;
        document.getElementById('textOption2').textContent = def.responses.opt2;
        document.getElementById('textOption3').textContent = def.responses.opt3;

        document.getElementById('option3Type').textContent = def.opt3Badge;
    }

    // Grimório (Aba 2)
    function setupGrimorio() {
        elements.grimorioTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                triggerHaptic();
                elements.grimorioTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                state.activeGuide = tab.dataset.guide;
                renderGrimorioGuide(state.activeGuide);
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
