'use strict';

var App = require('../../../src/chrome/background');

describe('Background initialization', function() {

  beforeAll(function() {
    spyOn(window.chrome.runtime.onInstalled, 'addListener');
    spyOn(window.chrome.runtime.onMessage, 'addListener');
    spyOn(window.chrome.webNavigation.onCommitted, 'addListener');
    spyOn(window.chrome.browserAction.onClicked, 'addListener');

    App.initialize();
  });

  it('should set up event listeners', function() {
    expect(window.chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
    expect(window.chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    expect(window.chrome.webNavigation.onCommitted.addListener).toHaveBeenCalled();
    expect(window.chrome.browserAction.onClicked.addListener).toHaveBeenCalled();
  });

  // TODO: test event filter
});
