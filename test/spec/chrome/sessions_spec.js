import sinon from 'sinon';
import Sessions from '../../../src/chrome/session-handler.js';

describe('Session handler', function() {
  let sandbox;
  let originalChrome;
  let originalBrowser;
  let getActiveSessionsStub;
  let updateActiveSessionsStub;

  beforeAll(function() {
    // Store original Chrome and Browser objects if they exist
    originalChrome = window.chrome;
    originalBrowser = window.browser;

    // Create Chrome API stubs for initialization
    window.chrome = {
      runtime: {
        onInstalled: { addListener: function() {} },
        onMessage: { addListener: function() {} }
      },
      webNavigation: {
        onCommitted: { addListener: function() {} }
      },
      action: {
        onClicked: { addListener: function() {} }
      },
      storage: {
        local: {
          get: sinon.stub(),
          set: sinon.stub(),
          remove: sinon.stub(),
          clear: sinon.stub()
        }
      },
      tabs: {
        get: sinon.stub()
      }
    };

    // Create Browser API stubs for initialization
    window.browser = {
      storage: {
        session: {
          get: sinon.stub(),
          set: sinon.stub(),
          remove: sinon.stub(),
          clear: sinon.stub()
        }
      }
    };

    // Initialize is no longer needed as background.js auto-initializes
  });

  beforeEach(function() {
    sandbox = sinon.createSandbox();

    // Create Chrome API stubs for each test
    window.chrome.tabs = {
      get: sandbox.stub().callsFake(function(tabId, callback) {
        callback({
          id: tabId,
          url: 'https://en.wikipedia.org/wiki/Example_Page',
          title: 'Example Page'
        });
      })
    };

    // Mock session storage
    window.browser.storage.session.get = sandbox.stub().callsFake((keys, callback) => {
      const result = {};
      if (Array.isArray(keys)) {
        keys.forEach(key => {
          if (key === Sessions.TAB_STATUS_KEY) {
            result[key] = {};
          } else if (key === Sessions.ACTIVE_SESSIONS_KEY) {
            result[key] = [];
          }
        });
      } else if (typeof keys === 'string') {
        if (keys === Sessions.TAB_STATUS_KEY) {
          result[keys] = {};
        } else if (keys === Sessions.ACTIVE_SESSIONS_KEY) {
          result[keys] = [];
        }
      }
      if (callback) {
        callback(result);
      }
      return Promise.resolve(result);
    });

    window.browser.storage.session.set = sandbox.stub().callsFake((items, callback) => {
      if (callback) {
        callback();
      }
      return Promise.resolve();
    });
  });

  afterEach(function() {
    sandbox.restore();
  });

  afterAll(function() {
    // Restore original Chrome and Browser objects
    window.chrome = originalChrome;
    window.browser = originalBrowser;
  });

  it('should be able to clear a session', async function() {
    // Setup initial state
    const initialSessions = [{ id: 123 }, { id: 543 }, { id: 998 }];
    let currentSessions = [...initialSessions];

    // Mock the getActiveSessions method
    getActiveSessionsStub = sandbox.stub(Sessions, 'getActiveSessions');
    getActiveSessionsStub.callsFake(async() => currentSessions);

    // Mock the updateActiveSessions method
    updateActiveSessionsStub = sandbox.stub(Sessions, 'updateActiveSessions');
    updateActiveSessionsStub.callsFake(async(sessions) => {
      currentSessions = sessions;
    });

    // Clear session 543
    await Sessions.clearSession(543);
    expect(currentSessions).toEqual([{ id: 123 }, { id: 998 }]);

    // Clear session 123
    await Sessions.clearSession(123);
    expect(currentSessions).toEqual([{ id: 998 }]);

    // Clear session 998
    await Sessions.clearSession(998);
    expect(currentSessions).toEqual([]);
  });

  it('should be able to clear all sessions', async function() {
    // Setup initial state
    const initialSessions = [{ id: 123 }, { id: 543 }, { id: 998 }];
    let currentSessions = [...initialSessions];

    // Mock the getActiveSessions method
    getActiveSessionsStub = sandbox.stub(Sessions, 'getActiveSessions');
    getActiveSessionsStub.callsFake(async() => currentSessions);

    // Mock the updateActiveSessions method
    updateActiveSessionsStub = sandbox.stub(Sessions, 'updateActiveSessions');
    updateActiveSessionsStub.callsFake(async(sessions) => {
      currentSessions = sessions;
    });

    // Clear all sessions
    await Sessions.clearAllSessions();
    expect(currentSessions).toEqual([]);
  });

  it('should be able to process navigation events', async function() {
    const details = {
      tabId: 566,
      openerId: 420,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    // Mock chrome.tabs.get to return a promise
    window.chrome.tabs.get = sandbox.stub().returns(Promise.resolve({
      id: details.tabId,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      title: 'Example Page'
    }));

    // Mock the handler method to avoid actual processing
    sandbox.stub(Sessions, 'handler').resolves();

    await Sessions.processNavigation(details);
    expect(window.chrome.tabs.get.calledWith(details.tabId)).toBe(true);
  });

  it('should be able to create a session', async function() {
    const commitData = {
      tabId: 123,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    // Mock the getActiveSessions method to return empty array
    getActiveSessionsStub = sandbox.stub(Sessions, 'getActiveSessions');
    getActiveSessionsStub.resolves([]);

    // Mock the updateActiveSessions method to track changes
    let updatedSessions = [];
    updateActiveSessionsStub = sandbox.stub(Sessions, 'updateActiveSessions');
    updateActiveSessionsStub.callsFake(async(sessions) => {
      updatedSessions = sessions;
    });

    const newSession = await Sessions.createNewSession(commitData);

    expect(newSession.id).toBeDefined();
    expect(newSession.nodeIndex).toBe(1);
    expect(updatedSessions.length).toBe(1);
    expect(updatedSessions[0].tabs).toEqual([123]);
  });

  it('should be able to find an existing session', async function() {
    // Setup initial state
    const initialSessions = [
      { id: 501, tabs: [1, 2, 3] },
      { id: 650, tabs: [4, 5] }
    ];

    const initialTabStatus = {
      1: { id: 3 },
      2: { id: 4 },
      3: { id: 500 },
      4: { id: 204 },
      5: { id: 7 }
    };

    // Mock the getActiveSessions and getTabStatus methods
    getActiveSessionsStub = sandbox.stub(Sessions, 'getActiveSessions');
    getActiveSessionsStub.resolves(initialSessions);
    sandbox.stub(Sessions, 'getTabStatus').resolves(initialTabStatus);

    // Mock the updateActiveSessions method
    updateActiveSessionsStub = sandbox.stub(Sessions, 'updateActiveSessions');
    updateActiveSessionsStub.resolves();

    // Find a session in the same tab
    let commitData = {
      tabId: 3,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    let session = await Sessions.findSessionOf(commitData);
    expect(session.id).toEqual(501);

    // Find a session in a parent tab
    commitData = {
      tabId: 8,
      openerTabId: 5,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    session = await Sessions.findSessionOf(commitData);
    expect(session.id).toEqual(650);
  });
});
