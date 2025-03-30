'use strict';

var sinon = require('sinon');
var App = require('../../../src/chrome/background');

describe('Background initialization', function() {
  var sandbox;
  var originalChrome;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    originalChrome = window.chrome;

    // Create Chrome API stubs
    window.chrome = {
      runtime: {
        onInstalled: {
          addListener: sandbox.stub()
        },
        onMessage: {
          addListener: sandbox.stub()
        }
      },
      webNavigation: {
        onCommitted: {
          addListener: sandbox.stub()
        }
      },
      browserAction: {
        onClicked: {
          addListener: sandbox.stub()
        }
      }
    };

    App.initialize();
  });

  afterEach(function() {
    sandbox.restore();
    window.chrome = originalChrome;
  });

  it('should set up event listeners', function() {
    expect(window.chrome.runtime.onInstalled.addListener.called).toBe(true);
    expect(window.chrome.runtime.onMessage.addListener.called).toBe(true);
    expect(window.chrome.webNavigation.onCommitted.addListener.called).toBe(true);
    expect(window.chrome.browserAction.onClicked.addListener.called).toBe(true);
  });

  // TODO: test event filter
});
