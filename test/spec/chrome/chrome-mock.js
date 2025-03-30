'use strict';

// Mock Chrome APIs for testing
window.chrome = {
  runtime: {
    onInstalled: {
      addListener: function() {}
    },
    onMessage: {
      addListener: function() {}
    }
  },
  webNavigation: {
    onCommitted: {
      addListener: function() {}
    }
  },
  browserAction: {
    onClicked: {
      addListener: function() {}
    }
  },
  tabs: {
    get: function(tabId, callback) {
      callback({
        id: tabId,
        url: 'https://example.com',
        title: 'Example Page'
      });
    }
  }
}; 