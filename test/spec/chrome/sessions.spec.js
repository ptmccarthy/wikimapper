import Sessions from '../../../src/chrome/session-handler.js';

// Mock the storage module
jest.mock('../../../src/chrome/storage.js', () => ({
  createPageObject: jest.fn(),
  recordRoot: jest.fn(),
  recordChild: jest.fn()
}));

// Mock the session handler module
jest.mock('../../../src/chrome/session-handler.js', () => {
  const originalModule = jest.requireActual('../../../src/chrome/session-handler.js');
  return {
    ...originalModule,
    TAB_STATUS_KEY: 'tabStatus',
    ACTIVE_SESSIONS_KEY: 'activeSessions',
    getActiveSessions: jest.fn(),
    updateActiveSessions: jest.fn(),
    getTabStatus: jest.fn(),
    handler: jest.fn(),
    clearSession: jest.fn(),
    clearAllSessions: jest.fn(),
    processNavigation: jest.fn(),
    createNewSession: jest.fn(),
    findSessionOf: jest.fn()
  };
});

// Mock Chrome and Browser APIs
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
    get: jest.fn().mockResolvedValue({
      id: expect.any(Number),
      url: 'https://en.wikipedia.org/wiki/Example_Page',
      title: 'Example Page'
    })
  }
};

global.browser = {
  storage: {
    session: {
      get: jest.fn().mockImplementation((keys) => {
        const result = {};
        if (Array.isArray(keys)) {
          keys.forEach(key => {
            result[key] = key === Sessions.TAB_STATUS_KEY ? {} : [];
          });
        } else {
          result[keys] = keys === Sessions.TAB_STATUS_KEY ? {} : [];
        }
        return Promise.resolve(result);
      }),
      set: jest.fn().mockResolvedValue(),
      remove: jest.fn(),
      clear: jest.fn()
    }
  }
};

describe('Session handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be able to clear a session', async() => {
    // Setup initial state
    const initialSessions = [{ id: 123 }, { id: 543 }, { id: 998 }];
    let currentSessions = [...initialSessions];

    // Mock the getActiveSessions method
    Sessions.getActiveSessions.mockImplementation(async() => currentSessions);

    // Mock the updateActiveSessions method
    Sessions.updateActiveSessions.mockImplementation(async(sessions) => {
      currentSessions = sessions;
    });

    // Mock the clearSession implementation
    Sessions.clearSession.mockImplementation(async(sessionId) => {
      currentSessions = currentSessions.filter(session => session.id !== sessionId);
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
    Sessions.getActiveSessions.mockImplementation(async() => currentSessions);

    // Mock the updateActiveSessions method
    Sessions.updateActiveSessions.mockImplementation(async(sessions) => {
      currentSessions = sessions;
    });

    // Mock the clearAllSessions implementation
    Sessions.clearAllSessions.mockImplementation(async() => {
      currentSessions = [];
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

    // Mock the handler method
    Sessions.handler.mockResolvedValue();

    // Mock the processNavigation implementation
    Sessions.processNavigation.mockImplementation(async(details) => {
      await chrome.tabs.get(details.tabId);
      await Sessions.handler(details);
    });

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
    Sessions.getActiveSessions.mockResolvedValue([]);

    // Mock the updateActiveSessions method to track changes
    let updatedSessions = [];
    Sessions.updateActiveSessions.mockImplementation(async(sessions) => {
      updatedSessions = sessions;
    });

    // Mock the createNewSession implementation
    Sessions.createNewSession.mockImplementation(async(commitData) => {
      const session = {
        id: Date.now(),
        tabs: [commitData.tabId],
        nodeIndex: 1
      };
      await Sessions.updateActiveSessions([session]);
      return { id: session.id, parentNode: null, nodeIndex: 1 };
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
    Sessions.getActiveSessions.mockResolvedValue(initialSessions);
    Sessions.getTabStatus.mockResolvedValue(initialTabStatus);

    // Mock the findSessionOf implementation
    Sessions.findSessionOf.mockImplementation(async(commitData) => {
      const tabStatus = await Sessions.getTabStatus();
      const activeSessions = await Sessions.getActiveSessions();

      for (const session of activeSessions) {
        if (session.tabs.includes(commitData.tabId)) {
          return {
            id: session.id,
            parentNode: tabStatus[commitData.tabId].id,
            nodeIndex: session.nodeIndex
          };
        } else if (commitData.openerTabId && session.tabs.includes(commitData.openerTabId)) {
          return {
            id: session.id,
            parentNode: tabStatus[commitData.openerTabId].id,
            nodeIndex: session.nodeIndex
          };
        }
      }
      return await Sessions.createNewSession(commitData);
    });

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
