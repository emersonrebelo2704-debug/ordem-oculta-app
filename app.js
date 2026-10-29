/**
 * ORDEM OCULTA — THE OCCULT ORACLE INFO-SAAS
 * Core Application Engine & Tactile Mobile-First Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // State Management
    const state = {
        activeTab: 'tab-scanner',
        scannerMode: 'conversa', // 'conversa' | 'perfil'
        selectedFile: null,
        selectedBase64: null,
        isScanning: false,
        activeProtocolPhase: 'invasao'
    };

    // DOM Elements
    const elements = {
        // Navigation
        navItems: document.querySelectorAll('.bottom-nav .nav-item'),
        tabPanes: document.querySelectorAll('.tab-pane'),

        // Scanner Elements
        modeChips: document.querySelectorAll('.mode-chip'),
        dropzone: document.getElementById('dropzone'),
        fileInput: document.getElementById('fileInput'),
        uploadPlaceholder: document.getElementById('uploadPlaceholder'),
        previewWrapper: document.getElementById('previewWrapper'),
        previewImg: document.getElementById('previewImg'),
        btnClearImage: document.getElementById('btnClearImage'),
        btnScan: document.getElementById('btnScan'),
        scanSpinner: document.getElementById('scanSpinner'),
        resultsContainer: document.getElementById('resultsContainer'),

        // Protocol Elements
        protocolCards: document.querySelectorAll('.protocol-card'),
        protocolViewer: document.getElementById('protocolViewer'),

        // Toast
        toast: document.getElementById('toast'),
        toastMsg: document.getElementById('toastMsg')
    };

    // Protocol Scenarios Database (Skill 1 & Tactical Scripts)
    const protocolDatabase = {
        invasao: {
            title: "Fase I: A Invasão (Abertura em Stories & Quebra de Gelo)",
            scenarios: [
                {
                    scenario: "Story com Comida / Bebida / Restaurante",
                    rule: "Regra Anti-Gado: Nunca elogie a beleza dela. Ataque a escolha do prato ou insinue que ela foi influenciada.",
                    script: "Você tem cara de quem pediu isso só pela estética da foto e no final preferia uma pizza de esquina."
                },
                {
                    scenario: "Story de Viagem / Aeroporto / Praia",
                    rule: "Regra de Curiosidade: Aponte um detalhe no fundo que ninguém notou.",
                    script: "O detalhe mais curioso dessa foto não é a paisagem, é aquela cena acontecendo discretamente no fundo à esquerda."
                },
                {
                    scenario: "Selfie com Expressão Misteriosa / Olhar Sério",
                    rule: "Quebra de Padrão: Desmonte a pose de inacessível com humor confiante.",
                    script: "Essa pose de séria quase convence quem não te conhece, mas aposto que você estava rindo 2 segundos depois."
                }
            ]
        },
        conducao: {
            title: "Fase II: A Condução (Ritmo Magnético & Tensão)",
            scenarios: [
                {
                    scenario: "Ela respondeu de forma seca ('haha', 'sim', 'verdade')",
                    rule: "Regra do Espelhamento Invertido: Não force assunto. Qualifique e crie um desafio leve.",
                    script: "Geralmente quem fala pouco por mensagem ou é muito interessante pessoalmente ou não tem assunto. Qual das duas é você?"
                },
                {
                    scenario: "Ela fez uma pergunta sobre você ('E você, faz o quê?')",
                    rule: "Regra da Reserva Enigmática: Responda com gancho, nunca entregue tudo mastigado.",
                    script: "Durante o dia resolvo problemas que você não ia querer ter. À noite descubro se as pessoas têm bom gosto pra drinks."
                },
                {
                    scenario: "A conversa começou a esfriar (mais de 24h sem falar)",
                    rule: "Regra da Invasão Espontânea: Faça uma acusação descontraída baseada em imaginação.",
                    script: "Acabei de ver uma pessoa que cometeu a audácia de ser tão distraída quanto você e lembrei desse chat."
                }
            ]
        },
        extracao: {
            title: "Fase III: A Extração (Ponte Natural para o WhatsApp)",
            scenarios: [
                {
                    scenario: "O pico da conversa no Instagram (ela está rindo e respondendo rápido)",
                    rule: "Regra da Transição Orgânica: Não peça permissão. Crie uma razão situacional.",
                    script: "Eu quase nunca abro a DM daqui durante a semana. Me manda um 'oi' no WhatsApp que te conto o resto: (DDD) 9XXXX-XXXX."
                },
                {
                    scenario: "Envio de Conteúdo / Áudio / Meme específico",
                    rule: "Regra do Pretexto: O Instagram limita, o WhatsApp viabiliza.",
                    script: "O Instagram vai cortar o áudio desse caso. Me dá seu número que te mando por lá antes que eu esqueça."
                },
                {
                    scenario: "Ela hesitou ou fez piada ('você sempre pede número assim?')",
                    rule: "Regra de Frame Superior: Demonstre que seu tempo é escasso e seleto.",
                    script: "Só peço o número de quem parece que vai sustentar uma conversa interessante pessoalmente. Você passou no teste preliminar."
                }
            ]
        },
        fechamento: {
            title: "Fase IV: O Fechamento (O Convite Blindado a Dois)",
            scenarios: [
                {
                    scenario: "O Convite Espontâneo & Baixa Pressão (Barzinho / Drinks)",
                    rule: "Regra do Dia e Hora Definidos: Nunca pergunte 'quando você pode?'. Dite o ritmo com alternativas fechadas.",
                    script: "Quinta-feira eu vou tomar um drink em um lugar que você provavelmente nunca foi. Às 20h30 eu passo pra te buscar ou você prefere ir direto?"
                },
                {
                    scenario: "O Convite com Gancho Irrecusável (Baseado em preferências dela)",
                    rule: "Regra da Coerência: Use o tema favorito dela como justificativa inegociável.",
                    script: "Depois de você falar com tanta convicção daquele assunto, você me deve uma avaliação gastronômica. Sábado às 19h45 você é minha convidada."
                },
                {
                    scenario: "Ela hesitou com 'vou ver na minha agenda e te falo'",
                    rule: "Regra da Retirada Tática: Desarme a indecisão demonstrando desapego confiante.",
                    script: "Sem problemas, eu também só saio com quem tem certeza da companhia. Se você conseguir vaga na sua agenda super concorrida, me avisa até quarta."
                }
            ]
        }
    };

    // ==========================================================================
    // INITIALIZATION & TAB CONTROLLER
    // ==========================================================================
    function init() {
        setupNavigation();
        setupDropzone();
        setupScannerControls();
        setupClipboardListener();
        renderProtocolViewer('invasao');
        setupCopyButtons();
    }

    function triggerHaptic(duration = 15) {
        if ('vibrate' in navigator) {
            try { navigator.vibrate(duration); } catch (e) {}
        }
    }

    function setupNavigation() {
        elements.navItems.forEach(item => {
            item.addEventListener('click', () => {
                triggerHaptic();
                const targetTab = item.dataset.tab;
                
                // Update nav items
                elements.navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');

                // Update tab panes
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

    // ==========================================================================
    // SCANNER & DROPZONE CONTROLLER
    // ==========================================================================
    function setupDropzone() {
        const { dropzone, fileInput, btnClearImage } = elements;

        // Click to open file picker
        dropzone.addEventListener('click', (e) => {
            if (e.target.closest('#btnClearImage')) return;
            fileInput.click();
        });

        // File input changed
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleFileSelected(e.target.files[0]);
            }
        });

        // Drag & Drop
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
                handleFileSelected(e.dataTransfer.files[0]);
            }
        });

        // Clear image
        btnClearImage.addEventListener('click', (e) => {
            e.stopPropagation();
            triggerHaptic(25);
            resetImagePreview();
        });
    }

    function setupClipboardListener() {
        // Global Paste Listener (Ctrl+V / Command+V)
        window.addEventListener('paste', (e) => {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;
            for (let item of items) {
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    handleFileSelected(blob);
                    showToast('Print colado da área de transferência!');
                    break;
                }
            }
        });
    }

    function handleFileSelected(file) {
        if (!file.type.startsWith('image/')) {
            showToast('Por favor, envie apenas arquivos de imagem.');
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
            elements.resultsContainer.classList.add('hidden');
            triggerHaptic();
        };
        reader.readAsDataURL(file);
    }

    function resetImagePreview() {
        state.selectedFile = null;
        state.selectedBase64 = null;
        elements.fileInput.value = '';
        elements.previewImg.src = '';
        elements.previewWrapper.classList.add('hidden');
        elements.uploadPlaceholder.classList.remove('hidden');
        elements.btnScan.disabled = true;
        elements.previewWrapper.classList.remove('scanning');
        elements.resultsContainer.classList.add('hidden');
    }

    function setupScannerControls() {
        // Mode Selector Chips
        elements.modeChips.forEach(chip => {
            chip.addEventListener('click', () => {
                triggerHaptic();
                elements.modeChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                state.scannerMode = chip.dataset.mode;
            });
        });

        // Scan Action Trigger
        elements.btnScan.addEventListener('click', () => {
            if (!state.selectedBase64 || state.isScanning) return;
            executeScanSequence();
        });
    }

    function executeScanSequence() {
        state.isScanning = true;
        triggerHaptic(40);

        // Visual State: Scanning laser & spinner
        elements.previewWrapper.classList.add('scanning');
        elements.btnScan.disabled = true;
        elements.scanSpinner.classList.remove('hidden');
        elements.btnScan.querySelector('.btn-label').textContent = 'ANALISANDO COM VISÃO COMPUTACIONAL...';

        // Simulation / Endpoint Handshake (3 seconds duration for MVP demo)
        setTimeout(() => {
            state.isScanning = false;
            elements.previewWrapper.classList.remove('scanning');
            elements.btnScan.disabled = false;
            elements.scanSpinner.classList.add('hidden');
            elements.btnScan.querySelector('.btn-label').textContent = 'DECODIFICAR E GERAR RESPOSTA';

            // Show Results
            renderDecodedIntel();
            elements.resultsContainer.classList.remove('hidden');
            
            // Auto scroll smoothly to results
            elements.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            triggerHaptic(50);
            showToast('Decodificação concluída pelo Oráculo!');
        }, 2200);
    }

    function renderDecodedIntel() {
        const intelPhase = document.getElementById('intelPhase');
        const intelInterest = document.getElementById('intelInterest');
        const intelHook = document.getElementById('intelHook');

        if (state.scannerMode === 'perfil') {
            intelPhase.textContent = 'Fase I: A Invasão';
            intelInterest.textContent = 'Perfil / Story';
            intelHook.textContent = 'Cenário & Acessório';

            document.getElementById('textOption1').textContent = 
                '"Você tem exatamente a cara de quem finge costume com viagens assim, mas se perde na primeira esquina."';
            document.getElementById('textOption2').textContent = 
                '"Três detalhes me chamaram atenção no fundo desse story, mas o segundo com certeza você achou que ninguém ia reparar."';
            document.getElementById('textOption3').textContent = 
                '"O fotógrafo merece aumento pelo ângulo, mas o reflexo na taça entregou o verdadeiro contexto desse rolê."';
        } else {
            intelPhase.textContent = 'Fase II: A Condução';
            intelInterest.textContent = 'Receptividade Alta';
            intelHook.textContent = 'Quebra de Objeção';

            document.getElementById('textOption1').textContent = 
                '"Se você for metade do tempo tão misteriosa pessoalmente quanto é por mensagem, nosso drink vai ser perigoso."';
            document.getElementById('textOption2').textContent = 
                '"Geralmente quem demora para responder ou está fingindo desinteresse ou não aguenta 10 minutos de conversa afiada. Qual das duas é você?"';
            document.getElementById('textOption3').textContent = 
                '"Quem dita o ritmo é quem decide onde termina. Quinta-feira às 20h30 eu te mostro onde servem o melhor vinho da cidade."';
        }
    }

    // ==========================================================================
    // PROTOCOLS VIEWER (TAB 2)
    // ==========================================================================
    elements.protocolCards.forEach(card => {
        card.addEventListener('click', () => {
            triggerHaptic();
            const phase = card.dataset.phase;
            elements.protocolCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            renderProtocolViewer(phase);
        });
    });

    function renderProtocolViewer(phaseKey) {
        state.activeProtocolPhase = phaseKey;
        const data = protocolDatabase[phaseKey];
        if (!data) return;

        let html = `
            <div class="scenario-title">
                <i class="fa-solid fa-crosshairs"></i> ${data.title}
            </div>
        `;

        data.scenarios.forEach((item, index) => {
            const targetId = `protoScript_${phaseKey}_${index}`;
            html += `
                <div class="script-scenario-box">
                    <div style="font-weight: 700; font-size: 13px; color: #fff; margin-bottom: 4px;">
                        ${index + 1}. ${item.scenario}
                    </div>
                    <div class="scenario-rule">
                        ${item.rule}
                    </div>
                    <div class="scenario-script" id="${targetId}">
                        "${item.script}"
                    </div>
                    <div style="display: flex; justify-content: flex-end;">
                        <button class="btn-copy" data-target="${targetId}">
                            <i class="fa-regular fa-copy"></i>
                            <span>Copiar Script</span>
                        </button>
                    </div>
                </div>
            `;
        });

        elements.protocolViewer.innerHTML = html;
        setupCopyButtons();
    }

    // ==========================================================================
    // 1-CLICK COPY & CLIPBOARD CONTROLLER
    // ==========================================================================
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
                        fallbackCopyText(textToCopy, btn);
                    });
                } else {
                    fallbackCopyText(textToCopy, btn);
                }
            };
        });
    }

    function fallbackCopyText(text, btn) {
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
            showToast('Erro ao copiar texto.');
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
        }, 2600);
    }

    // Launch
    init();
});
