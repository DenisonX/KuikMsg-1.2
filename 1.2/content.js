const DEFAULT_MESSAGES = [
  "Bom dia! Espero que esteja bem.",
  "Boa tarde! Espero que esteja bem.",
  "Iniciando conexão via *Anydesk*...",
  "Bom dia! Como posso auxiliá-lo(a)?",
  "Boa tarde! Como posso auxiliá-lo(a)?",
  "Meu nome é Denison, sou técnico de suporte da TekSoftware e darei continuidade ao seu atendimento.",
  "Como posso ajudá-lo(a) neste momento?",
  "Por gentileza, poderia me encaminhar o código de conexão do *Anydesk* quando possível?",
  "Por gentileza, aceite a solicitação de conexão assim que possível.",
  "Para prosseguirmos com o atendimento, poderia me informar o código de conexão do *Anydesk*, por favor?",
  "Há algo mais em que eu possa auxiliá-lo(a)?",
  "Posso ajudá-lo(a) com mais alguma solicitação?",
  "Agradecemos o contato. Tenha um excelente dia! 😊",
  "Agradecemos o contato. Tenha uma excelente tarde! 😊",
  "Agradecemos o contato. Tenha uma excelente semana! 😊",
  "Agradecemos o contato. Tenha um excelente final de semana! 😊",
  "Quando possível, entre em contato conosco para realizarmos a atualização do seu sistema. Agradecemos a atenção.",
  "Devido à ausência de interação, encerrarei temporariamente este atendimento. Caso necessite de algo mais, permanecemos à disposição. Obrigado!",
  "Estamos analisando sua solicitação. Por gentileza, aguarde um momento.",
  "Será necessário realizar uma atualização no seu sistema. Podemos prosseguir agora?",
  "Por gentileza, mantenha o sistema fechado nos demais computadores durante o procedimento.",
];
const CONVERSATION_LOG_KEY = "kuikmsgConversationLogs";
const MAX_CONVERSATION_LOG_ITEMS = 500;
const KUIKMSG_THEME_KEY = "kuikmsgTheme";
const ASSISTED_AGENT_RULES = [
  {
    keywords: ["anydesk", "acesso remoto", "conexao", "conexão", "codigo", "código"],
    response: "Por gentileza, poderia me encaminhar o código de conexão do *Anydesk* quando possível?"
  },
  {
    keywords: ["atualizacao", "atualização", "atualizar", "versao", "versão"],
    response: "Será necessário realizar uma atualização no seu sistema. Podemos prosseguir agora?"
  },
  {
    keywords: ["travou", "travando", "lento", "lentidao", "lentidão", "demora"],
    response: "Entendi. Estamos analisando sua solicitação. Por gentileza, aguarde um momento enquanto verificamos."
  },
  {
    keywords: ["erro", "problema", "falha", "nao abre", "não abre", "nao consigo", "não consigo"],
    response: "Certo, vou verificar isso para você. Poderia me informar em qual tela ou rotina esse problema acontece?"
  },
  {
    keywords: ["bom dia", "oi", "ola", "olá"],
    response: "Bom dia! Como posso auxiliá-lo(a)?"
  },
  {
    keywords: ["boa tarde"],
    response: "Boa tarde! Como posso auxiliá-lo(a)?"
  },
  {
    keywords: ["obrigado", "obrigada", "valeu"],
    response: "Nós que agradecemos o contato. Há algo mais em que eu possa auxiliá-lo(a)?"
  },
  {
    keywords: ["sistema aberto", "outros computadores", "fechar sistema", "fechado"],
    response: "Por gentileza, mantenha o sistema fechado nos demais computadores durante o procedimento."
  },
  {
    keywords: ["nao conecta", "não conecta", "sem internet", "conexao caiu", "conexão caiu", "desconectou"],
    response: "Entendi. Poderia me informar se o problema acontece em apenas um computador ou em todos?"
  },
  {
    keywords: ["imprimir", "impressora", "danfe", "cupom", "relatorio", "relatório"],
    response: "Certo, vou verificar a questão de impressão. Poderia me informar qual documento ou relatório está tentando imprimir?"
  },
  {
    keywords: ["senha", "usuario", "usuário", "login", "acesso"],
    response: "Certo. Poderia me informar qual usuário está apresentando dificuldade de acesso?"
  },
  {
    keywords: ["nota fiscal", "nfe", "nf-e", "xml", "sefaz"],
    response: "Entendi. Poderia me informar se aparece alguma mensagem de erro ao emitir ou transmitir a nota?"
  },
  {
    keywords: ["financeiro", "boleto", "cobranca", "cobrança", "pagamento"],
    response: "Certo. Poderia me encaminhar mais detalhes sobre a cobrança ou pagamento para verificarmos?"
  }
];

// Load messages from localStorage or use defaults
let mensagens = JSON.parse(localStorage.getItem('quickMessages') || JSON.stringify(DEFAULT_MESSAGES));

function saveMessages() {
  localStorage.setItem('quickMessages', JSON.stringify(mensagens));
}

function addMessage(newMessage) {
  if (newMessage && newMessage.trim()) {
    mensagens.push(newMessage.trim());
    saveMessages();
    refreshMenu();
  }
}

function updateMessage(index, newMessage) {
  if (newMessage && newMessage.trim() && mensagens[index] !== undefined) {
    mensagens[index] = newMessage.trim();
    saveMessages();
    refreshMenu();
  }
}

function deleteMessage(index) {
  if (mensagens[index] !== undefined && confirm("Deseja excluir esta mensagem?")) {
    mensagens.splice(index, 1);
    saveMessages();
    refreshMenu();
  }
}

function resetDefaultMessages() {
  mensagens = [...DEFAULT_MESSAGES];
  messageSearchTerm = "";
  saveMessages();
  refreshMenu();
}

function applyKuikmsgTheme(theme) {
  document.body.classList.toggle("kuikmsg-dark-theme", theme === "dark");
}

function getKuikmsgTheme() {
  return localStorage.getItem(KUIKMSG_THEME_KEY) || "dark";
}

function toggleKuikmsgTheme() {
  const nextTheme = getKuikmsgTheme() === "dark" ? "light" : "dark";
  localStorage.setItem(KUIKMSG_THEME_KEY, nextTheme);
  applyKuikmsgTheme(nextTheme);
  return nextTheme;
}

function isVisibleElement(element) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
}

function cleanConversationText(text) {
  return text
    .replace(/\s+/g, " ")
    .trim();
}

function isUsefulConversationText(text) {
  const normalizedText = normalizeSearchText(text);
  const blockedTexts = [
    "mensagens rapidas",
    "agente assistido",
    "adicionar mensagem",
    "nenhuma mensagem encontrada",
    "procurar mensagem pelo inicio de uma palavra",
    "campo de mensagem nao encontrado",
    "digite sua mensagem aqui",
    "salvar",
    "cancelar",
    "flappy bird",
    "score",
    "restart",
    "close"
  ];

  if (!normalizedText || normalizedText.length < 2 || normalizedText.length > 500) return false;
  if (blockedTexts.some((blockedText) => normalizedText.includes(blockedText))) return false;
  if (/^\d{1,2}:\d{2}$/.test(normalizedText)) return false;
  if (/^[^\wÀ-ÿ]+$/.test(text)) return false;

  return true;
}

function captureCurrentConversation() {
  const selectors = [
    '[class*="message"]',
    '[class*="Message"]',
    '[class*="chat"]',
    '[class*="Chat"]',
    '[class*="bubble"]',
    '[class*="Bubble"]',
    '[data-testid*="message"]',
    '[role="listitem"]'
  ];

  const texts = [];
  const seen = new Set();

  document.querySelectorAll(selectors.join(",")).forEach((element) => {
    if (element.closest('#menu-msg-rapida, #add-message-modal, #flappy-overlay')) return;
    if (!isVisibleElement(element)) return;

    const text = cleanConversationText(element.innerText || element.textContent || "");
    if (!isUsefulConversationText(text)) return;
    if (seen.has(text)) return;

    seen.add(text);
    texts.push(text);
  });

  if (texts.length === 0) {
    const fallbackText = cleanConversationText(window.getSelection().toString());
    if (isUsefulConversationText(fallbackText)) texts.push(fallbackText);
  }

  return {
    title: document.title || "Atendimento Digisac",
    url: window.location.href,
    capturedAt: new Date().toLocaleString("pt-BR"),
    messages: texts
  };
}

function getConversationLogs() {
  return JSON.parse(localStorage.getItem(CONVERSATION_LOG_KEY) || "[]");
}

function saveConversationLogs(logs) {
  localStorage.setItem(CONVERSATION_LOG_KEY, JSON.stringify(logs.slice(-MAX_CONVERSATION_LOG_ITEMS)));
}

function getConversationLogFingerprint(message, url) {
  return normalizeSearchText(`${url}|${message}`);
}

function addMessagesToConversationLog(messages) {
  if (!messages || messages.length === 0) return 0;

  const logs = getConversationLogs();
  const existing = new Set(logs.map((item) => item.fingerprint));
  const url = window.location.href;
  const title = document.title || "Atendimento Digisac";
  const newItems = [];

  messages.forEach((message) => {
    const cleanMessage = cleanConversationText(message);
    if (!cleanMessage) return;

    const fingerprint = getConversationLogFingerprint(cleanMessage, url);
    if (existing.has(fingerprint)) return;

    existing.add(fingerprint);
    newItems.push({
      capturedAt: new Date().toLocaleString("pt-BR"),
      title,
      url,
      message: cleanMessage,
      fingerprint
    });
  });

  if (newItems.length > 0) {
    saveConversationLogs(logs.concat(newItems));
  }

  return newItems.length;
}

function captureAndLogCurrentConversation() {
  const conversation = captureCurrentConversation();
  return addMessagesToConversationLog(conversation.messages);
}

function exportConversationLogs() {
  return getConversationLogs();
}

function clearConversationLogs() {
  localStorage.removeItem(CONVERSATION_LOG_KEY);
}

function startConversationAutoLog() {
  let timeoutId = null;

  const scheduleCapture = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      captureAndLogCurrentConversation();
    }, 1200);
  };

  const observer = new MutationObserver(scheduleCapture);
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  setTimeout(captureAndLogCurrentConversation, 2500);
}

function fillMessageInput(msg) {
  const input = document.querySelector('[contenteditable="true"]');

  if (input) {
    input.focus();
    document.getSelection().selectAllChildren(input);
    document.getSelection().deleteFromDocument();
    document.execCommand("insertText", false, msg);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  } else {
    alert("Campo de mensagem não encontrado.");
    return false;
  }
}

function sendMessage(msg) {
  if (!fillMessageInput(msg)) return;

  const input = document.querySelector('[contenteditable="true"]');
  const botaoEnviar =
    input?.closest("form")?.querySelector("button[type='submit']") ||
    document.querySelector("button[type='submit']");

  if (botaoEnviar) {
    botaoEnviar.click();
  }
}

function getLastConversationMessage() {
  const conversation = captureCurrentConversation();
  const messages = (conversation.messages || []).filter(isUsefulConversationText);
  return messages[messages.length - 1] || "";
}

function findAssistedAgentRule(message) {
  const normalizedMessage = normalizeSearchText(message);
  return ASSISTED_AGENT_RULES.find((rule) =>
    rule.keywords.some((keyword) => normalizedMessage.includes(normalizeSearchText(keyword)))
  );
}

function getAssistedAgentSuggestion() {
  const conversation = captureCurrentConversation();
  const messages = (conversation.messages || []).filter(isUsefulConversationText);

  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    const rule = findAssistedAgentRule(message);

    if (rule) {
      return {
        source: message,
        matched: true,
        response: rule.response
      };
    }
  }

  const lastMessage = messages[messages.length - 1] || "";

  return {
    source: lastMessage,
    matched: false,
    response: "Entendi. Vou verificar sua solicitação e já retorno com mais informações."
  };
}

function suggestAssistedAgentResponse() {
  const suggestion = getAssistedAgentSuggestion();
  if (!suggestion.source) {
    alert("Não encontrei uma mensagem recente do cliente para analisar.");
    return;
  }

  if (fillMessageInput(suggestion.response)) {
    if (!suggestion.matched) {
      alert("Não encontrei uma regra específica para a última mensagem. Inserindo resposta padrão para revisão.");
    }
    menu.style.display = "none";
  }
}

let messageSearchTerm = "";

function normalizeSearchText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function messageMatchesSearch(message, searchTerm) {
  const term = normalizeSearchText(searchTerm.trim());
  if (!term) return true;

  return normalizeSearchText(message)
    .split(/[^a-z0-9]+/i)
    .some((word) => word.startsWith(term));
}

function refreshMenu() {
  const menu = document.getElementById('menu-msg-rapida');
  if (!menu) return;
  
  const searchInput = menu.querySelector('#search-message-input');
  const addButton = menu.querySelector('#add-message-btn');
  const agentButton = menu.querySelector('#assisted-agent-btn');
  menu.innerHTML = '';
  if (searchInput) {
    searchInput.value = messageSearchTerm;
    menu.appendChild(searchInput);
  }
  if (agentButton) menu.appendChild(agentButton);
  if (addButton) menu.appendChild(addButton);
  
  const filteredMessages = mensagens
    .map((msg, index) => ({ msg, index }))
    .filter(({ msg }) => messageMatchesSearch(msg, messageSearchTerm));

  if (filteredMessages.length === 0) {
    const emptyMessage = document.createElement("div");
    emptyMessage.className = "empty-search-message";
    emptyMessage.innerText = "Nenhuma mensagem encontrada.";
    menu.appendChild(emptyMessage);
    return;
  }

  filteredMessages.forEach(({ msg, index }) => {
    const row = document.createElement("div");
    row.className = "message-row";

    const item = document.createElement("button");
    item.innerText = msg;
    item.className = "message-btn";
    item.onclick = () => sendMessage(msg);

    const editBtn = document.createElement("button");
    editBtn.innerText = "✏️";
    editBtn.title = "Editar mensagem";
    editBtn.className = "message-action-btn edit-message-btn";
    editBtn.onclick = () => openMessageModal(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "🗑️";
    deleteBtn.title = "Excluir mensagem";
    deleteBtn.className = "message-action-btn delete-message-btn";
    deleteBtn.onclick = () => deleteMessage(index);

    row.appendChild(item);
    row.appendChild(editBtn);
    row.appendChild(deleteBtn);
    menu.appendChild(row);
  });
}

const botao = document.createElement("div");
botao.id = "botao-msg-rapida";
botao.innerText = "🦅";
document.body.appendChild(botao);

const menu = document.createElement("div");
menu.id = "menu-msg-rapida";

const searchInput = document.createElement("input");
searchInput.id = "search-message-input";
searchInput.type = "search";
searchInput.placeholder = "🔎 Procurar mensagem pelo início de uma palavra...";
searchInput.className = "search-message-input";
searchInput.addEventListener("input", () => {
  messageSearchTerm = searchInput.value;
  refreshMenu();
  const updatedSearchInput = document.getElementById("search-message-input");
  if (updatedSearchInput) {
    updatedSearchInput.focus();
    updatedSearchInput.setSelectionRange(updatedSearchInput.value.length, updatedSearchInput.value.length);
  }
});
menu.appendChild(searchInput);

const agentButton = document.createElement("button");
agentButton.id = "assisted-agent-btn";
agentButton.innerText = "🤖 Agente Assistido";
agentButton.className = "assisted-agent-btn";
menu.appendChild(agentButton);

const addButton = document.createElement("button");
addButton.id = "add-message-btn";
addButton.innerText = "➕ Adicionar Mensagem";
addButton.className = "add-message-btn";
menu.appendChild(addButton);
document.body.appendChild(menu);

botao.onclick = () => {
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
};

// Create add message modal
const modal = document.createElement("div");
modal.id = "add-message-modal";
modal.style.display = "none";

const modalContent = document.createElement("div");
modalContent.className = "modal-content";

const modalHeader = document.createElement("div");
modalHeader.className = "modal-header";
modalHeader.innerHTML = "<h3>Adicionar Nova Mensagem</h3><span class='close'>&times;</span>";

const modalBody = document.createElement("div");
modalBody.className = "modal-body";
const textarea = document.createElement("textarea");
textarea.placeholder = "Digite sua mensagem aqui...";
textarea.rows = 4;
modalBody.appendChild(textarea);

const modalFooter = document.createElement("div");
modalFooter.className = "modal-footer";
const saveBtn = document.createElement("button");
saveBtn.textContent = "Salvar";
saveBtn.className = "save-btn";
const cancelBtn = document.createElement("button");
cancelBtn.textContent = "Cancelar";
cancelBtn.className = "cancel-btn";
modalFooter.appendChild(saveBtn);
modalFooter.appendChild(cancelBtn);

modalContent.appendChild(modalHeader);
modalContent.appendChild(modalBody);
modalContent.appendChild(modalFooter);
modal.appendChild(modalContent);
document.body.appendChild(modal);

let editingMessageIndex = null;

function openMessageModal(index = null) {
  editingMessageIndex = index;
  modalHeader.querySelector("h3").textContent = index === null ? "Adicionar Nova Mensagem" : "Editar Mensagem";
  textarea.value = index === null ? "" : mensagens[index];
  modal.style.display = "flex";
  textarea.focus();
}

function closeMessageModal() {
  modal.style.display = "none";
  textarea.value = "";
  editingMessageIndex = null;
}

// Event handlers
addButton.onclick = () => {
  openMessageModal();
};

agentButton.onclick = () => {
  suggestAssistedAgentResponse();
};

modal.querySelector('.close').onclick = () => {
  closeMessageModal();
};

cancelBtn.onclick = () => {
  closeMessageModal();
};

saveBtn.onclick = () => {
  const newMessage = textarea.value.trim();
  if (newMessage) {
    if (editingMessageIndex === null) {
      addMessage(newMessage);
    } else {
      updateMessage(editingMessageIndex, newMessage);
    }
    closeMessageModal();
  } else {
    alert("Por favor, digite uma mensagem.");
  }
};

// Close modal when clicking outside
modal.onclick = (e) => {
  if (e.target === modal) {
    closeMessageModal();
  }
};

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.style.display === 'flex') {
    closeMessageModal();
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request && request.type === 'RESET_DEFAULT_MESSAGES') {
    resetDefaultMessages();
    sendResponse({ ok: true });
  }

  if (request && request.type === 'CAPTURE_CURRENT_CONVERSATION') {
    sendResponse({ ok: true, conversation: captureCurrentConversation() });
  }

  if (request && request.type === 'EXPORT_CONVERSATION_LOGS') {
    sendResponse({ ok: true, logs: exportConversationLogs() });
  }

  if (request && request.type === 'CLEAR_CONVERSATION_LOGS') {
    clearConversationLogs();
    sendResponse({ ok: true });
  }

  if (request && request.type === 'TOGGLE_KUIKMSG_THEME') {
    sendResponse({ ok: true, theme: toggleKuikmsgTheme() });
  }
});

applyKuikmsgTheme(getKuikmsgTheme());
refreshMenu();
startConversationAutoLog();

// Flappy Bird overlay and game
(function initFlappyBird() {
  if (document.getElementById('flappy-toggle')) return;

  const toggle = document.createElement('div');
  toggle.id = 'flappy-toggle';
  toggle.innerText = '🎮';
  document.body.appendChild(toggle);

  const overlay = document.createElement('div');
  overlay.id = 'flappy-overlay';
  overlay.style.display = 'none';

  const container = document.createElement('div');
  container.id = 'flappy-container';

  const header = document.createElement('div');
  header.id = 'flappy-header';
  const title = document.createElement('div');
  title.id = 'flappy-title';
  title.textContent = 'Flappy Bird';
  const controls = document.createElement('div');
  controls.id = 'flappy-controls';
  const scoreEl = document.createElement('div');
  scoreEl.id = 'flappy-score';
  scoreEl.textContent = 'Score: 0';
  const restartBtn = document.createElement('button');
  restartBtn.id = 'flappy-restart';
  restartBtn.textContent = 'Restart';
  const closeBtn = document.createElement('button');
  closeBtn.id = 'flappy-close';
  closeBtn.textContent = 'Close';
  controls.appendChild(scoreEl);
  controls.appendChild(restartBtn);
  controls.appendChild(closeBtn);
  header.appendChild(title);
  header.appendChild(controls);

  const canvas = document.createElement('canvas');
  canvas.id = 'flappy-canvas';
  canvas.width = 360;
  canvas.height = 540;

  container.appendChild(header);
  container.appendChild(canvas);
  overlay.appendChild(container);
  document.body.appendChild(overlay);

  // Game state
  const ctx = canvas.getContext('2d');
  let animationId = null;
  let running = false;
  let score = 0;
  let highScore = 0;

  const game = {
    gravity: 0.5,
    jumpStrength: -8,
    pipeSpeed: 2.2,
    pipeGap: 140,
    pipeWidth: 60,
    pipeIntervalFrames: 110,
    frame: 0
  };

  const bird = {
    x: 80,
    y: canvas.height / 2,
    radius: 14,
    velocityY: 0,
    color: '#ffd95a'
  };

  let pipes = [];

  function resetGame() {
    score = 0;
    game.frame = 0;
    bird.y = canvas.height / 2;
    bird.velocityY = 0;
    pipes = [];
    scoreEl.textContent = 'Score: 0';
  }

  function spawnPipe() {
    const minTop = 40;
    const maxTop = canvas.height - game.pipeGap - 80;
    const topHeight = Math.floor(Math.random() * (maxTop - minTop + 1)) + minTop;
    pipes.push({
      x: canvas.width + game.pipeWidth,
      top: topHeight,
      bottom: topHeight + game.pipeGap,
      passed: false
    });
  }

  function drawBackground() {
    // sky
    ctx.fillStyle = '#70c5ce';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // ground
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, canvas.height - 80, canvas.width, 80);
  }

  function drawBird() {
    ctx.beginPath();
    ctx.arc(bird.x, bird.y, bird.radius, 0, Math.PI * 2);
    ctx.fillStyle = bird.color;
    ctx.fill();
    ctx.closePath();
    // eye
    ctx.beginPath();
    ctx.arc(bird.x + 6, bird.y - 4, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.closePath();
    // beak
    ctx.fillStyle = '#ff9f1c';
    ctx.beginPath();
    ctx.moveTo(bird.x + bird.radius, bird.y);
    ctx.lineTo(bird.x + bird.radius + 8, bird.y - 4);
    ctx.lineTo(bird.x + bird.radius + 8, bird.y + 4);
    ctx.fill();
  }

  function drawPipes() {
    ctx.fillStyle = '#2ecc71';
    pipes.forEach((p) => {
      // top pipe
      ctx.fillRect(p.x, 0, game.pipeWidth, p.top);
      // bottom pipe
      
      ctx.fillRect(p.x, p.bottom, game.pipeWidth, canvas.height - p.bottom - 80);
    });
  }

  function update() {
    game.frame += 1;

    // Bird physics
    bird.velocityY += game.gravity;
    bird.y += bird.velocityY;

    // Spawn pipes
    if (game.frame % game.pipeIntervalFrames === 0) spawnPipe();

    // Move pipes and scoring
    pipes.forEach((p) => {
      p.x -= game.pipeSpeed;
      if (!p.passed && p.x + game.pipeWidth < bird.x) {
        p.passed = true;
        score += 1;
        scoreEl.textContent = 'Score: ' + score;
      }
    });

    // Remove off-screen pipes
    pipes = pipes.filter((p) => p.x + game.pipeWidth > 0);

    // Collisions with ground/ceiling
    if (bird.y + bird.radius > canvas.height - 80 || bird.y - bird.radius < 0) {
      return gameOver();
    }

    // Collisions with pipes
    for (let i = 0; i < pipes.length; i++) {
      const p = pipes[i];
      const withinPipeX = bird.x + bird.radius > p.x && bird.x - bird.radius < p.x + game.pipeWidth;
      const hitsTop = bird.y - bird.radius < p.top;
      const hitsBottom = bird.y + bird.radius > p.bottom;
      if (withinPipeX && (hitsTop || hitsBottom)) {
        return gameOver();
      }
    }
  }

  function render() {
    drawBackground();
    drawPipes();
    drawBird();
  }

  function loop() {
    update();
    render();
    if (running) animationId = requestAnimationFrame(loop);
  }

  function flap() {
    if (!running) return;
    bird.velocityY = game.jumpStrength;
  }

  function start() {
    if (running) return;
    resetGame();
    running = true;
    animationId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (animationId) cancelAnimationFrame(animationId);
  }

  function gameOver() {
    stop();
    highScore = Math.max(highScore, score);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '16px sans-serif';
    ctx.fillText('Score: ' + score + '   Best: ' + highScore, canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Press Restart to play again', canvas.width / 2, canvas.height / 2 + 36);
  }

  // Events
  toggle.addEventListener('click', function() {
    const isOpen = overlay.style.display === 'flex';
    if (isOpen) {
      overlay.style.display = 'none';
      stop();
    } else {
      overlay.style.display = 'flex';
      start();
    }
  });

  closeBtn.addEventListener('click', function() {
    overlay.style.display = 'none';
    stop();
  });

  restartBtn.addEventListener('click', function() {
    start();
  });

  // Input handlers
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) return; // ignore backdrop click for flap
    if (e.target === canvas) flap();
  });
  window.addEventListener('keydown', function(e) {
    if (overlay.style.display !== 'flex') return;
    if (e.code === 'Space' || e.key === ' ') {
      e.preventDefault();
      if (!running) start();
      flap();
    }
    if (e.key === 'Escape') {
      overlay.style.display = 'none';
      stop();
    }
  });
})();

// Allow extension popup to toggle the game
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  try {
    chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
      if (message && message.type === 'FLAPPY_TOGGLE') {
        const t = document.getElementById('flappy-toggle');
        if (t) t.click();
        sendResponse && sendResponse({ ok: true });
      }
    });
  } catch (e) {}
}