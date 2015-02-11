'use strict';

// If running tests, the Chrome API won't be injected to the global scope.
// This block injects the stubbed out chrome in its place so tests can run.
if (!window.chrome) {
  window.chrome = require('../../test/stubs/chrome');
}

var _ = require('lodash');

module.exports = {

  sessions: [],
  tabStatus: [],
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
   * @param {object} details - chrome.webNavigation details object
   */
  eventFilter: function(details) {

    if (_.includes(details.transitionQualifiers, 'forward_back')) {
      this.processForwardBack(details);
    } else if (_.includes(this.triggers, details.transitionType)) {
      this.processNavigation(details);
    }

  },

  processForwardBack: function(details) {
    var commitData = {};
    // back button
    if (details.url === this.tabStatus[details.tabId].parent.data.url) {
      var backPage = this.tabStatus[details.tabId].parent;

      commitData = backPage;
      commitData.forwardId = this.tabStatus[details.tabId].id;
      commitData.forwardChildren = this.tabStatus[details.tabId].children;

      this.tabStatus[details.tabId] = backPage;
    }

    // forward button
    else {
      commitData.id = this.tabStatus[details.tabId].forwardId;
      commitData.parent = this.tabStatus[details.tabId];
      commitData.children = this.tabStatus[details.tabId].forwardChildren;
      commitData.data = {
        tabId: commitData.tabId,
        date: commitData.timeStamp,
        url: commitData.url,
        parentId: commitData.parent.id,
        sessionId: commitData.parent.data.sessionId
      };

      this.tabStatus[details.tabId] = commitData;
    }

  },

  processNavigation: function(details) {
    var that = this;
    var commitData = details;
    console.log(details.tabId);
    chrome.tabs.get(details.tabId, function(tab) {
      commitData.parentId = tab.openerTabId;

      that.sessionHandler(commitData);
    });
  },

  sessionHandler: function(details) {
    console.log(details);
  },

  /**
   * Setup background event listeners.
   */
  setupListeners: function() {
    var that = this;

    // Navigation Event Listeners
    chrome.webNavigation.onCommitted.addListener(function(details) {
      that.eventFilter(details);
    },
      { url: [
        { urlContains: '.wikipedia.org/wiki' },
        { urlContains: '.wiktionary.org/wiki'}
      ]}
    );
    
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
