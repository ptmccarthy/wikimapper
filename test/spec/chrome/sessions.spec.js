import Sessions from '../../../src/chrome/session-handler.js';

describe('Session handler', () => {
  let originalChrome;
  let originalBrowser;
  let getActiveSessionsStub;
  let updateActiveSessionsStub;

  beforeAll(() => {
    // Store original Chrome and Browser objects if they exist
    originalChrome = global.chrome;
    originalBrowser = global.browser;

    // Create Chrome API mocks for initialization
    global.chrome = {
      runtime: {
        onInstalled: { addListener: jest.fn() },
        onMessage: { addListener: jest.fn() }
      },
      webNavigation: {
        onCommitted: { addListener: jest.fn() }
      },
      action: {
        onClicked: { addListener: jest.fn() }
      },
      storage: {
        local: {
          get: jest.fn(),
          set: jest.fn(),
          remove: jest.fn(),
          clear: jest.fn()
        }
      },
      tabs: {
        get: jest.fn()
      }
    };

    // Create Browser API mocks for initialization
    global.browser = {
      storage: {
        session: {
          get: jest.fn(),
          set: jest.fn(),
          remove: jest.fn(),
          clear: jest.fn()
        }
      }
    };
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Create Chrome API mocks for each test
    global.chrome.tabs.get.mockImplementation((tabId, callback) => {
      callback({
        id: tabId,
        url: 'https://en.wikipedia.org/wiki/Example_Page',
        title: 'Example Page'
      });
    });

    // Mock session storage
    global.browser.storage.session.get.mockImplementation((keys, callback) => {
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

    global.browser.storage.session.set.mockImplementation((items, callback) => {
      if (callback) {
        callback();
      }
      return Promise.resolve();
    });
  });

  afterAll(() => {
    // Restore original Chrome and Browser objects
    global.chrome = originalChrome;
    global.browser = originalBrowser;
  });

  it('should be able to clear a session', async() => {
    // Setup initial state
    const initialSessions = [{ id: 123 }, { id: 543 }, { id: 998 }];
    let currentSessions = [...initialSessions];

    // Mock the getActiveSessions method
    getActiveSessionsStub = jest.spyOn(Sessions, 'getActiveSessions');
    getActiveSessionsStub.mockImplementation(async() => currentSessions);

    // Mock the updateActiveSessions method
    updateActiveSessionsStub = jest.spyOn(Sessions, 'updateActiveSessions');
    updateActiveSessionsStub.mockImplementation(async(sessions) => {
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

  it('should be able to clear all sessions', async() => {
    // Setup initial state
    const initialSessions = [{ id: 123 }, { id: 543 }, { id: 998 }];
    let currentSessions = [...initialSessions];

    // Mock the getActiveSessions method
    getActiveSessionsStub = jest.spyOn(Sessions, 'getActiveSessions');
    getActiveSessionsStub.mockImplementation(async() => currentSessions);

    // Mock the updateActiveSessions method
    updateActiveSessionsStub = jest.spyOn(Sessions, 'updateActiveSessions');
    updateActiveSessionsStub.mockImplementation(async(sessions) => {
      currentSessions = sessions;
    });

    // Clear all sessions
    await Sessions.clearAllSessions();
    expect(currentSessions).toEqual([]);
  });

  it('should be able to process navigation events', async() => {
    const details = {
      tabId: 566,
      openerId: 420,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    // Mock chrome.tabs.get to return a promise
    global.chrome.tabs.get.mockResolvedValue({
      id: details.tabId,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      title: 'Example Page'
    });

    // Mock the handler method to avoid actual processing
    jest.spyOn(Sessions, 'handler').mockResolvedValue();

    await Sessions.processNavigation(details);
    expect(global.chrome.tabs.get).toHaveBeenCalledWith(details.tabId);
  });

  it('should be able to create a session', async() => {
    const commitData = {
      tabId: 123,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    // Mock the getActiveSessions method to return empty array
    getActiveSessionsStub = jest.spyOn(Sessions, 'getActiveSessions');
    getActiveSessionsStub.mockResolvedValue([]);

    // Mock the updateActiveSessions method to track changes
    let updatedSessions = [];
    updateActiveSessionsStub = jest.spyOn(Sessions, 'updateActiveSessions');
    updateActiveSessionsStub.mockImplementation(async(sessions) => {
      updatedSessions = sessions;
    });

    const newSession = await Sessions.createNewSession(commitData);

    expect(newSession.id).toBeDefined();
    expect(newSession.nodeIndex).toBe(1);
    expect(updatedSessions.length).toBe(1);
    expect(updatedSessions[0].tabs).toEqual([123]);
  });

  it('should be able to find an existing session', async() => {
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
    getActiveSessionsStub = jest.spyOn(Sessions, 'getActiveSessions');
    getActiveSessionsStub.mockResolvedValue(initialSessions);
    jest.spyOn(Sessions, 'getTabStatus').mockResolvedValue(initialTabStatus);

    // Mock the updateActiveSessions method
    updateActiveSessionsStub = jest.spyOn(Sessions, 'updateActiveSessions');
    updateActiveSessionsStub.mockResolvedValue();

    // Find a session in the same tab
    let commitData = {
      tabId: 3,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    let session = await Sessions.findSessionOf(commitData);
    expect(session.id).toBe(501);

    // Find a session in a parent tab
    commitData = {
      tabId: 8,
      openerTabId: 5,
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      timeStamp: Date.now()
    };

    session = await Sessions.findSessionOf(commitData);
    expect(session.id).toBe(650);
  });
});
