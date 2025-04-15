/**
 * Background application.
 * Handles initialization and listening for navigation events.
 */
import Sessions from './session-handler.js';

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
  try {
    console.log('WikiMapper: Navigation event received', {
      url: details.url,
      transitionType: details.transitionType,
      transitionQualifiers: details.transitionQualifiers
    });

    if (details.transitionQualifiers.includes('forward_back')) {
      await Sessions.processForwardBack(details);
    } else if (triggers.includes(details.transitionType)) {
      await Sessions.processNavigation(details);
    }
  } catch (error) {
    console.error('WikiMapper: Error processing navigation event:', error);
  }
}

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

/**
 * Initialize the background script by setting up event listeners.
 * This function is exported for testing purposes.
 */
export async function initialize() {
  try {
    // Initialize SessionHandler
    await Sessions.initialize();
    console.log('WikiMapper: Initialization complete');
  } catch (error) {
    console.error('WikiMapper: Error during initialization:', error);
    throw error;
  }
}
