const DIGISAC_URL = 'https://tek.digisac.app/';
const HOMEPAGE_PATH = 'homepage/index.html';
const POPUP_THEME_KEY = 'kuikmsgTheme';

function applyPopupTheme(theme) {
  document.body.classList.toggle('dark-popup-theme', theme === 'dark');
}

function getPopupTheme() {
  return localStorage.getItem(POPUP_THEME_KEY) || 'dark';
}

function setPopupTheme(theme) {
  localStorage.setItem(POPUP_THEME_KEY, theme);
  applyPopupTheme(theme);
}

function openOrFocusDigisac() {
  if (!chrome.tabs || !chrome.tabs.query) return;
  chrome.tabs.query({ url: DIGISAC_URL + '*' }, function(tabs) {
    if (tabs && tabs.length > 0) {
      chrome.tabs.update(tabs[0].id, { active: true });
    } else {
      chrome.tabs.create({ url: DIGISAC_URL });
    }
  });
}

function toggleFlappyOnActiveDigisac() {
  if (!chrome.tabs || !chrome.tabs.query || !chrome.tabs.sendMessage) return;
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs && tabs[0];
    if (!tab) return;
    if (!tab.url || tab.url.indexOf(DIGISAC_URL) !== 0) {
      chrome.tabs.create({ url: DIGISAC_URL });
      return;
    }
    chrome.tabs.sendMessage(tab.id, { type: 'FLAPPY_TOGGLE' });
  });
}

function openHomepage() {
  if (!chrome.tabs || !chrome.tabs.create || !chrome.runtime || !chrome.runtime.getURL) return;
  chrome.tabs.create({ url: chrome.runtime.getURL(HOMEPAGE_PATH) });
}

function resetDefaultMessages() {
  if (!chrome.tabs || !chrome.tabs.query || !chrome.tabs.sendMessage) return;
  if (!confirm('Isso substituirá as mensagens salvas pela lista padrão profissional. Deseja continuar?')) return;

  chrome.tabs.query({ url: DIGISAC_URL + '*' }, function(tabs) {
    const tab = tabs && tabs[0];
    if (!tab) {
      alert('Abra o Digisac antes de restaurar as mensagens padrão.');
      chrome.tabs.create({ url: DIGISAC_URL });
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'RESET_DEFAULT_MESSAGES' }, function(response) {
      if (chrome.runtime.lastError || !response || !response.ok) {
        alert('Não foi possível restaurar agora. Recarregue o Digisac e tente novamente.');
        return;
      }

      chrome.tabs.update(tab.id, { active: true });
      alert('Mensagens padrão restauradas com sucesso.');
    });
  });
}

function buildConversationText(conversation) {
  const lines = [
    'KuikMsg 1.2 - Conversa salva',
    `Data/Hora: ${conversation.capturedAt}`,
    `Página: ${conversation.title}`,
    `URL: ${conversation.url}`,
    '',
    'Mensagens capturadas:',
    ''
  ];

  if (!conversation.messages || conversation.messages.length === 0) {
    lines.push('Nenhuma mensagem foi encontrada automaticamente.');
  } else {
    conversation.messages.forEach((message, index) => {
      lines.push(`${index + 1}. ${message}`);
      lines.push('');
    });
  }

  return lines.join('\n');
}

function downloadTextFile(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function saveCurrentConversation() {
  if (!chrome.tabs || !chrome.tabs.query || !chrome.tabs.sendMessage) return;

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const tab = tabs && tabs[0];
    if (!tab || !tab.url || tab.url.indexOf(DIGISAC_URL) !== 0) {
      alert('Abra o atendimento do Digisac na aba atual antes de salvar a conversa.');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'CAPTURE_CURRENT_CONVERSATION' }, function(response) {
      if (chrome.runtime.lastError || !response || !response.ok) {
        alert('Não foi possível capturar a conversa agora. Recarregue o Digisac e tente novamente.');
        return;
      }

      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[:T]/g, '-');
      const filename = `kuikmsg-conversa-${timestamp}.txt`;
      downloadTextFile(filename, buildConversationText(response.conversation));
    });
  });
}

function getDigisacTab(callback) {
  chrome.tabs.query({ url: DIGISAC_URL + '*' }, function(tabs) {
    const activeTab = tabs && tabs.find((tab) => tab.active);
    callback(activeTab || (tabs && tabs[0]));
  });
}

function exportConversationLog() {
  if (!chrome.tabs || !chrome.tabs.query || !chrome.tabs.sendMessage) return;

  getDigisacTab(function(tab) {
    if (!tab) {
      alert('Abra o Digisac antes de exportar o log.');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'EXPORT_CONVERSATION_LOGS' }, function(response) {
      if (chrome.runtime.lastError || !response || !response.ok) {
        alert('Não foi possível exportar o log agora. Recarregue o Digisac e tente novamente.');
        return;
      }

      const logs = response.logs || [];
      const lines = [
        'KuikMsg 1.2 - Log automático de conversas',
        `Exportado em: ${new Date().toLocaleString('pt-BR')}`,
        `Total de registros: ${logs.length}`,
        ''
      ];

      if (logs.length === 0) {
        lines.push('Nenhum registro encontrado.');
      } else {
        logs.forEach((item, index) => {
          lines.push(`${index + 1}. [${item.capturedAt}] ${item.message}`);
          lines.push(`Página: ${item.title}`);
          lines.push(`URL: ${item.url}`);
          lines.push('');
        });
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      downloadTextFile(`kuikmsg-log-conversas-${timestamp}.txt`, lines.join('\n'));
    });
  });
}

function clearConversationLog() {
  if (!chrome.tabs || !chrome.tabs.query || !chrome.tabs.sendMessage) return;
  if (!confirm('Deseja limpar todo o log automático de conversas salvo neste navegador?')) return;

  getDigisacTab(function(tab) {
    if (!tab) {
      alert('Abra o Digisac antes de limpar o log.');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'CLEAR_CONVERSATION_LOGS' }, function(response) {
      if (chrome.runtime.lastError || !response || !response.ok) {
        alert('Não foi possível limpar o log agora. Recarregue o Digisac e tente novamente.');
        return;
      }

      alert('Log automático limpo com sucesso.');
    });
  });
}

function toggleTheme() {
  const nextTheme = getPopupTheme() === 'dark' ? 'light' : 'dark';
  setPopupTheme(nextTheme);

  if (!chrome.tabs || !chrome.tabs.query || !chrome.tabs.sendMessage) return;
  getDigisacTab(function(tab) {
    if (!tab) return;
    chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_KUIKMSG_THEME' });
  });
}

applyPopupTheme(getPopupTheme());

document.getElementById('open-digisac').addEventListener('click', openOrFocusDigisac);
document.getElementById('open-homepage').addEventListener('click', openHomepage);
document.getElementById('toggle-theme').addEventListener('click', toggleTheme);
document.getElementById('save-current-conversation').addEventListener('click', saveCurrentConversation);
document.getElementById('export-conversation-log').addEventListener('click', exportConversationLog);
document.getElementById('clear-conversation-log').addEventListener('click', clearConversationLog);
document.getElementById('reset-default-messages').addEventListener('click', resetDefaultMessages);
document.getElementById('toggle-flappy').addEventListener('click', toggleFlappyOnActiveDigisac);


