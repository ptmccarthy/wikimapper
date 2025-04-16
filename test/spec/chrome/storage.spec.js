import Storage from '../../../src/chrome/storage.js';
import mockSession from '../../resources/mock_session.js';
import commitData from '../../resources/commit_data.js';

describe('Storage API', () => {
  let originalChrome;

  beforeAll(() => {
    // Store original Chrome object if it exists
    originalChrome = global.chrome;

    // Create Chrome API mocks for initialization
    global.chrome = {
      storage: {
        local: {
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
  });

  afterAll(() => {
    // Restore original Chrome object
    global.chrome = originalChrome;
  });

  it('should be able to detect a search results page and name it appropriately', () => {
    const searchURL = 'https://en.wikipedia.org/wiki/Special:Search?search=_&go=Go';
    const trimmedURL = Storage.shortenURL(searchURL);

    expect(trimmedURL).toBe('Search Results: _');
  });

  it('should be able to derive the page name from Wikipedia URLs accurately', () => {
    const untrimmedURL = 'http://en.wikipedia.org/wiki/JavaScript%27s_Foo_bar';
    const trimmedURL = Storage.shortenURL(untrimmedURL);

    expect(trimmedURL).toBe('JavaScript\'s Foo bar');
  });

  it('should be able to search children nodes by their ID', () => {
    let node = Storage.findNode(mockSession, 8);
    expect(node.name).toBe('Dutch language');
    node = Storage.findNode(mockSession, 19);
    expect(node.name).toBe('Chamber of Regions');
    node = Storage.findNode(mockSession, 57);
    expect(node).toBeUndefined();
    node = Storage.findNode(mockSession, -5);
    expect(node).toBeUndefined();
  });

  it('should be able to create page objects', () => {
    const session = {
      id: 123456789,
      nodeIndex: 24,
      parentNode: 22
    };

    const page = Storage.createPageObject(session, commitData);

    expect(page.id).toBe(session.nodeIndex);
    expect(page.name).toBe('Sooners');
    expect(page.children).toEqual([]);
    expect(page.data).toBeDefined();
    expect(page.data.url).toBe(commitData.url);
  });

  it('should record root node to chrome.storage.local', () => {
    const page = {
      data: {
        sessionId: 'test-session'
      }
    };

    Storage.recordRoot(page);
    expect(global.chrome.storage.local.set).toHaveBeenCalledWith({ 'test-session': page });
  });

  it('should record child node to chrome.storage.local', () => {
    const page = {
      id: 2,
      data: {
        sessionId: 'test-session',
        parentId: 1
      }
    };

    const mockTree = {
      id: 1,
      children: []
    };

    global.chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ 'test-session': mockTree });
    });

    Storage.recordChild(page);
    expect(global.chrome.storage.local.get).toHaveBeenCalledWith(
      { 'test-session': null },
      expect.any(Function)
    );
    expect(global.chrome.storage.local.set).toHaveBeenCalled();
  });
});
