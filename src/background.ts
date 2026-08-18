/**
 * Background service worker.
 * 
 * Configures side panel behavior and relays position messages.
 */

// Open side panel on action click
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(() => {});

// Relay position updates from content script to side panel
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.type === 'POSITION_UPDATE') {
    chrome.runtime.sendMessage(message).catch(() => {});
  }
});
