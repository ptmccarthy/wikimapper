/**
 * Background application.
 * Handles initialization and listening for navigation events.
 */

'use strict';

// If running tests, the Chrome API won't be injected to the global scope.
// This block injects the stubbed out chrome in its place so tests can run.
if (!window.chrome) {
  window.chrome = require('../../test/stubs/chrome');
}

// External Dependencies
var _ = require('lodash');

// Internal Dependencies
var Sessions = require('./session-handler');
var Storage =  require('./storage');
var enums =    require('./enums');

module.exports = {

  /**
   * chrome.webNavigation event types to filter for
   */
  triggers: [
    'link',
    'typed',
    'form_submit'
  ],

  /**
   * Initialize the application
   */
  initialize: function() {
    console.log(_.now() + ': WikiMapper started.');
    this.setupListeners();
  },

  /**
   * Ingest navigation events and filter them by event type.
   * @param {object} details - chrome.webNavigation event details
   */
  eventFilter: function(details) {

    if (_.includes(details.transitionQualifiers, 'forward_back')) {
      Sessions.processForwardBack(details);
    } else if (_.includes(this.triggers, details.transitionType)) {
      Sessions.processNavigation(details);
    }

  },

  /**
   * Setup background event listeners.
   */
  setupListeners: function() {
    var self = this;

    // Navigation Event Listeners
    chrome.webNavigation.onCommitted.addListener(function(details) {
      self.eventFilter(details);
    },
      { url: [
        { urlContains: '.wikipedia.org/wiki' },
        { urlContains: '.wiktionary.org/wiki'}
      ]}
    );

    // Listener for incoming messages
    chrome.runtime.onMessage.addListener(function(request, sender) {
      switch(request.type) {
        case (enums.messageTypes.update): {

          if (sender.tab && sender.tab.id && sender.tab.url) {
            Sessions.updateName(sender.tab.id, sender.tab.url, request.name);
          } else {
            console.error('Received malformed update message: ' +
                          JSON.stringify(request) + ', ' + JSON.stringify(sender));
          }
          break;
        }

        case (enums.messageTypes.deleteItem): {
          if (request.sessionId) {
            Storage.deleteItem(request.sessionId);
          } else {
            console.error('Received malformed deleteItem message: ' +
                          JSON.stringify(request) + ', ' + JSON.stringify(sender));
          }
          break;
        }

        case (enums.messageTypes.deleteAll): {
          Storage.deleteAll();
        }
      }
    });

    // Listener for when the user clicks on the Wikimapper button
    chrome.browserAction.onClicked.addListener(function() {
      chrome.tabs.create({'url': chrome.extension.getURL('index.html')}, function() {
      });
    });

    // Listener for first install
    chrome.runtime.onInstalled.addListener(function(details) {
      if(details.reason === 'install') {
        chrome.tabs.create({'url': 'index.html'});
      }
    });
  }

};
