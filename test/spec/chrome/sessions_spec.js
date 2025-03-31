import sinon from 'sinon';
import Sessions from '../../../src/chrome/session-handler.js';

describe('Session handler', function() {
  var sandbox;
  var originalChrome;

  beforeAll(function() {
    // Store original Chrome object if it exists
    originalChrome = window.chrome;

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

    Sessions.activeSessions = [];
    Sessions.tabStatus = {};
  });

  afterEach(function() {
    sandbox.restore();
  });

  afterAll(function() {
    // Restore original Chrome object
    window.chrome = originalChrome;
  });

  it('should have no existing tab status', function() {
    expect(Sessions.tabStatus).toEqual({});
  });

  it('should have no existing active sessions', function() {
    expect(Sessions.activeSessions).toEqual([]);
  });

  it('should be able to clear a session', function() {
    Sessions.activeSessions = [{ id: 123 }, { id: 543 }, { id: 998 }];

    Sessions.clearSession(543);
    expect(Sessions.activeSessions).toEqual([{ id: 123 }, { id: 998 }]);

    Sessions.clearSession(123);
    expect(Sessions.activeSessions).toEqual([{ id: 998 }]);

    Sessions.clearSession(998);
    expect(Sessions.activeSessions).toEqual([]);
  });

  it('should be able to clear all sessions', function() {
    Sessions.activeSessions = [{ id: 123 }, { id: 543 }, { id: 998 }];

    Sessions.clearAllSessions();
    expect(Sessions.activeSessions.length).toBe(0);
  });

  it('should be able to process navigation events', function() {
    var details = {
      tabId: 566,
      openerId: 420,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    Sessions.processNavigation(details);
    expect(window.chrome.tabs.get.calledWith(details.tabId, sinon.match.func)).toBe(true);
  });

  it('should be able to create a session', function() {
    var commitData = {
      tabId: 123,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    Sessions.createNewSession(commitData);
    var newSession = Sessions.activeSessions[0];

    expect(newSession.id).toBeDefined();
    expect(newSession.nodeIndex).toBe(1);
    expect(newSession.tabs).toEqual([123]);
  });

  it('should be able to find an existing session', function() {
    var commitData = {
      tabId: 3,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };
    var session;

    Sessions.activeSessions = [
      { id: 501, tabs: [1, 2, 3] },
      { id: 650, tabs: [4, 5] }
    ];

    Sessions.tabStatus = {
      1: { id: 3 },
      2: { id: 4 },
      3: { id: 500 },
      4: { id: 204 },
      5: { id: 7 }
    };

    // find a session in the same tab
    session = Sessions.findSessionOf(commitData);
    expect(session.id).toEqual(501);

    // find a session in a parent tab
    commitData = {
      tabId: 8,
      openerTabId: 5,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };
    session = Sessions.findSessionOf(commitData);
    expect(session.id).toEqual(650);
  });
});
