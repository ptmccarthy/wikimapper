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

module.exports = {

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
   * @param {object} details - chrome.webNavigation event details
   */
  eventFilter: function(details) {

    if (_.includes(details.transitionQualifiers, 'forward_back')) {
      this.processForwardBack(details);
    } else if (_.includes(this.triggers, details.transitionType)) {
      this.processNavigation(details);
    }

  },

  /**
   * Forward/Back button events are unfortunately the same event trigger in the
   * Chrome webNavigation API, so we have to do some deduction to figure out which
   * type each qualifying event is.
   * @param {object} details - chrome.webNavigation event details
   */
  processForwardBack: function(details) {
    var commitData = {};
    // back button
    if (details.url === this.tabStatus[details.tabId].parent.data.url) {
      console.log('back button');
      var backPage = this.tabStatus[details.tabId].parent;

      commitData = backPage;
      commitData.forwardId = this.tabStatus[details.tabId].id;
      commitData.forwardChildren = this.tabStatus[details.tabId].children;

      this.tabStatus[details.tabId] = backPage;
    }

    // forward button
    else {
      console.log('forward button');
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

  /**
   * Process 'normal' navigation events that matched this.triggers.
   * @param {object} details - chrome.webNavigation event details
   */
  processNavigation: function(details) {
    console.log('navigation');
    var commitData = details;
    console.log(details.tabId);
    chrome.tabs.get(details.tabId, function(tab) {
      commitData.parentId = tab.openerTabId;

      Sessions.handler(commitData);
    });
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
