/**
 * Background service worker.
 *
 * Dynamically injects the content script via chrome.scripting (no static
 * manifest content_scripts) and relays position messages to the side panel.
 */

const ALLOWED_HOSTS = ['chess.com', 'lichess.org'];
const injectedTabs = new Set<number>();

function isAllowedHost(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return ALLOWED_HOSTS.some(h => host === h || host.endsWith('.' + h));
  } catch (_) {
    return false;
  }
}

function isAllowedSender(sender: chrome.runtime.MessageSender): boolean {
  const url = sender.url || sender.tab?.url;
  return isAllowedHost(url);
}

/**
 * Inject the content script into a tab.
 * Uses the activeTab permission granted on user gesture (action click).
 */
async function injectContentScript(tabId: number): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js'],
    });
    injectedTabs.add(tabId);
  } catch (_) {
    // Tab may not be ready or permission not granted — silent fail.
  }
}

// ── Side panel behavior ─────────────────────────────────────────────────
// Do NOT use openPanelOnActionClick — it consumes the click and prevents
// chrome.action.onClicked from firing, which we need for injection.

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: false })
  .catch(() => { });

// ── Action click: open side panel + inject content script ───────────────

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    // Open the side panel for this tab
    chrome.sidePanel.open({ tabId: tab.id }).catch(() => { });

    // Inject content script if on an allowed host
    if (isAllowedHost(tab.url)) {
      await injectContentScript(tab.id);
    }
  }
});

// ── Re-inject on page reload for already-tracked tabs ───────────────────
// activeTab permission persists for same-origin navigation, so re-injection
// works on SPA reloads without needing the `tabs` permission.

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo) => {
  if (changeInfo.status === 'complete' && injectedTabs.has(tabId)) {
    // Page fully reloaded → content script is gone, re-inject.
    injectedTabs.delete(tabId);
    await injectContentScript(tabId);
  }
});

// ── Cleanup on tab close ────────────────────────────────────────────────

chrome.tabs.onRemoved.addListener((tabId) => {
  injectedTabs.delete(tabId);
});

// ── Relay messages (obfuscated keys) ────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, _sendResponse) => {
  if (!isAllowedSender(sender)) return;

  if (message && message.type === 'pu') {
    // Relay position update from content script → side panel
    chrome.runtime.sendMessage(message).catch(() => { });
  }

  // If the content script sent a message, ensure we know the tab is injected
  if (sender.tab?.id) {
    injectedTabs.add(sender.tab.id);
  }
});

