'use strict';

module.exports = {

  initialize: function() {
    this.setupListeners();
  },

  setupListeners: function() {
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
