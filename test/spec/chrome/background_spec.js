import sinon from 'sinon';
import { initialize } from '../../../src/chrome/background.js';
import browser from 'webextension-polyfill';
import Sessions from '../../../src/chrome/session-handler.js';

describe('Background Script', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    // Create spies for all the methods we want to test
    browser.webNavigation.onCommitted.addListener = sandbox.spy();
    browser.runtime.onMessage.addListener = sandbox.spy();
    browser.runtime.onInstalled.addListener = sandbox.spy();
    browser.action.onClicked.addListener = sandbox.spy();

    // Mock Sessions.initialize
    sandbox.stub(Sessions, 'initialize').resolves();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should set up all event listeners', async() => {
    await initialize();

    // Check that all event listeners are set up
    expect(browser.webNavigation.onCommitted.addListener.called).toBe(true);
    expect(browser.runtime.onMessage.addListener.called).toBe(true);
    expect(browser.runtime.onInstalled.addListener.called).toBe(true);
    expect(browser.action.onClicked.addListener.called).toBe(true);
    expect(Sessions.initialize.called).toBe(true);
  });

  // TODO: test event filter
});
