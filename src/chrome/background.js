/**
 * Background application.
 * Handles initialization and listening for navigation events.
 */

// External Dependencies
import _ from 'lodash';
import browser from 'webextension-polyfill';

// Internal Dependencies
import Sessions from './session-handler.js';
import Storage from './storage.js';
import messageTypes from './enums.js';

const triggers = [
  'link',
  'typed',
  'form_submit'
];

/**
 * Ingest navigation events and filter them by event type.
 * @param {object} details - webNavigation event details
 */
async function eventFilter(details) {
  if (_.includes(details.transitionQualifiers, 'forward_back')) {
    await Sessions.processForwardBack(details);
  } else if (_.includes(triggers, details.transitionType)) {
    await Sessions.processNavigation(details);
  }
}

// Initialize the application
console.log(_.now() + ': WikiMapper started.');

/**
 * Initialize the background script by setting up event listeners.
 * This function is exported for testing purposes.
 */
export async function initialize() {
  // Initialize SessionHandler
  await Sessions.initialize();

  // Navigation Event Listeners
  browser.webNavigation.onCommitted.addListener(eventFilter, {
    url: [
      { urlContains: '.wikipedia.org/wiki' },
      { urlContains: '.wiktionary.org/wiki' }
    ]
  });

  // Listener for incoming messages
  browser.runtime.onMessage.addListener((request, sender) => {
    switch (request.type) {
      case (messageTypes.deleteItem): {
        if (request.sessionId) {
          Storage.deleteItem(request.sessionId);
          Sessions.clearSession(request.sessionId);
        } else {
          console.error('Received malformed deleteItem message: ' +
                        JSON.stringify(request) + ', ' + JSON.stringify(sender));
        }
        break;
      }

      case (messageTypes.deleteAll): {
        Storage.deleteAll();
        Sessions.clearAllSessions();
      }
    }
  });

  // Listener for when the user clicks on the Wikimapper button
  browser.action.onClicked.addListener(() => {
    browser.tabs.create({ url: browser.runtime.getURL('index.html') });
  });

  // Listener for first install
  browser.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      browser.tabs.create({ url: 'index.html' });
    }
  });
}
