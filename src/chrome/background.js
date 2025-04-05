/**
 * Background application.
 * Handles initialization and listening for navigation events.
 */

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

// Track initialization state
let initializationPromise = null;

/**
 * Ensure initialization is complete before processing events
 */
async function ensureInitialized() {
  if (!initializationPromise) {
    initializationPromise = initialize();
  }
  return initializationPromise;
}

/**
 * Ingest navigation events and filter them by event type.
 * @param {object} details - webNavigation event details
 */
async function eventFilter(details) {
  try {
    console.log('WikiMapper: Navigation event received', {
      url: details.url,
      transitionType: details.transitionType,
      transitionQualifiers: details.transitionQualifiers
    });

    // Wait for initialization to complete
    await ensureInitialized();

    if (_.includes(details.transitionQualifiers, 'forward_back')) {
      await Sessions.processForwardBack(details);
    } else if (_.includes(triggers, details.transitionType)) {
      await Sessions.processNavigation(details);
    }
  } catch (error) {
    console.error('WikiMapper: Error processing navigation event:', error);
  }
}

// Initialize the application
console.log(_.now() + ': WikiMapper started.');

// Add navigation listener synchronously
try {
  browser.webNavigation.onCommitted.addListener(eventFilter, {
    url: [
      { urlContains: '.wikipedia.org/wiki' },
      { urlContains: '.wiktionary.org/wiki' }
    ]
  });
  console.log('WikiMapper: webNavigation listener added successfully');
} catch (error) {
  console.error('WikiMapper: Failed to add webNavigation listener:', error);
}

/**
 * Initialize the background script by setting up event listeners.
 * This function is exported for testing purposes.
 */
export async function initialize() {
  try {
    // Initialize SessionHandler
    await Sessions.initialize();
    console.log('WikiMapper: Initialization complete');

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

    // Add listener for service worker state changes
    browser.runtime.onStartup.addListener(() => {
      console.log('WikiMapper: Service worker started on browser startup');
      // Reset initialization promise on startup to ensure fresh initialization
      initializationPromise = null;
    });
  } catch (error) {
    console.error('WikiMapper: Error during initialization:', error);
    // Reset the promise on error to allow retry
    initializationPromise = null;
    throw error;
  }
}
