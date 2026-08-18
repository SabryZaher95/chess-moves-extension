/**
 * Background service worker.
 *
 * Configures side panel behavior and relays position messages.
 */

const ALLOWED_HOSTS = ['chess.com', 'lichess.org'];

function isAllowedSender(sender: chrome.runtime.MessageSender): boolean {
  const url = sender.url || sender.tab?.url;
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h));
  } catch (_) {
    return false;
  }
}

// Open side panel on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => {});

// Relay position updates from content script to side panel
chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (!isAllowedSender(sender)) return;
  if (message && message.type === 'POSITION_UPDATE') {
    chrome.runtime.sendMessage(message).catch(() => {});
  }
});
