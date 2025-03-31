import sinon from 'sinon';
import { initialize } from '../../../src/chrome/background.js';

describe('Background Script', () => {
  let originalChrome;
  let sandbox;

  beforeAll(() => {
    // Store original chrome object
    originalChrome = window.chrome;

    // Create initial chrome stubs
    window.chrome = {
      webNavigation: {
        onCommitted: {
          addListener: sinon.stub()
        }
      },
      runtime: {
        onMessage: {
          addListener: sinon.stub()
        },
        onInstalled: {
          addListener: sinon.stub()
        }
      },
      action: {
        onClicked: {
          addListener: sinon.stub()
        }
      }
    };
  });

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create new stubs for each test
    window.chrome.webNavigation.onCommitted.addListener = sandbox.stub();
    window.chrome.runtime.onMessage.addListener = sandbox.stub();
    window.chrome.runtime.onInstalled.addListener = sandbox.stub();
    window.chrome.action.onClicked.addListener = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  afterAll(() => {
    // Restore original chrome object
    window.chrome = originalChrome;
  });

  it('should set up all event listeners', () => {
    initialize();

    // Check that all event listeners are set up
    expect(window.chrome.webNavigation.onCommitted.addListener.called).toBe(true);
    expect(window.chrome.runtime.onMessage.addListener.called).toBe(true);
    expect(window.chrome.runtime.onInstalled.addListener.called).toBe(true);
    expect(window.chrome.action.onClicked.addListener.called).toBe(true);
  });

  // TODO: test event filter
});
