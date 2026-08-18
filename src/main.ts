import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// Buffer early messages before the app is ready
const messageBuffer: any[] = [];
const earlyMessageListener = (message: any) => {
  messageBuffer.push(message);
};

if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(earlyMessageListener);
}

// Attach buffer and listener to window for the service to consume
// Use non-descriptive keys that won't be flagged by page enumeration
(window as any)._tnBuffer = messageBuffer;
(window as any)._tnEarlyListener = earlyMessageListener;

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
