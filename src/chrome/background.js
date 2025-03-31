/**
 * Background application.
 * Handles initialization and listening for navigation events.
 */

'use strict';

// External Dependencies
import _ from 'lodash';

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
 * @param {object} details - chrome.webNavigation event details
 */
function eventFilter(details) {
  if (_.includes(details.transitionQualifiers, 'forward_back')) {
    Sessions.processForwardBack(details);
  } else if (_.includes(triggers, details.transitionType)) {
    Sessions.processNavigation(details);
  }
}

// Initialize the application
console.log(_.now() + ': WikiMapper started.');

/**
 * Initialize the background script by setting up event listeners.
 * This function is exported for testing purposes.
 */
export function initialize() {
  // Navigation Event Listeners
  chrome.webNavigation.onCommitted.addListener(eventFilter, {
    url: [
      { urlContains: '.wikipedia.org/wiki' },
      { urlContains: '.wiktionary.org/wiki' },
      { urlMatches: '.wikiwand.com/[A-Za-z]{2}/' }
    ]
  });

  // Listener for incoming messages
  chrome.runtime.onMessage.addListener((request, sender) => {
    switch (request.type) {
      case (messageTypes.deleteItem): {
        if (request.sessionId) {
          Storage.deleteItem(request.sessionId);
        } else {
          console.error('Received malformed deleteItem message: ' +
                        JSON.stringify(request) + ', ' + JSON.stringify(sender));
        }
        break;
      }

      case (messageTypes.deleteAll): {
        Storage.deleteAll();
      }
    }
  });

  // Listener for when the user clicks on the Wikimapper button
  chrome.action.onClicked.addListener(() => {
    chrome.tabs.create({ url: chrome.runtime.getURL('index.html') });
  });

  // Listener for first install
  chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
      chrome.tabs.create({ url: 'index.html' });
    }
  });
}

// Initialize in production
if (typeof chrome !== 'undefined' && chrome.webNavigation) {
  initialize();
}
