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

  initialize: function() {
    console.log(_.now() + ': WikiMapper started.');
    this.setupListeners();
  },

  eventFilter: function(details) {
    console.log(JSON.stringify(details));
  },

  setupListeners: function() {
    var that = this;

    // Navigation Event Listener
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
