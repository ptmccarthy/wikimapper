import sinon from 'sinon';
import Storage from '../../../src/chrome/storage.js';
import mockSession from '../../resources/mock_session.js';
import commitData from '../../resources/commit_data.js';

describe('Storage API', function() {
  let sandbox;
  let originalChrome;

  beforeAll(function() {
    // Store original Chrome object if it exists
    originalChrome = window.chrome;

    // Create Chrome API stubs for initialization
    window.chrome = {
      storage: {
        local: {
          get: sinon.stub(),
          set: sinon.stub(),
          remove: sinon.stub(),
          clear: sinon.stub()
        }
      }
    };
  });

  beforeEach(function() {
    sandbox = sinon.createSandbox();
  });

  afterEach(function() {
    sandbox.restore();
  });

  afterAll(function() {
    // Restore original Chrome object
    window.chrome = originalChrome;
  });

  it('should be able to detect a search results page and name it appropriately', function() {
    const searchURL = 'https://en.wikipedia.org/wiki/Special:Search?search=_&go=Go';
    const trimmedURL = Storage.shortenURL(searchURL);

    expect(trimmedURL).toEqual('Search Results: _');
  });

  it('should be able to derive the page name from Wikipedia URLs accurately', function() {
    const untrimmedURL = 'http://en.wikipedia.org/wiki/JavaScript%27s_Foo_bar';
    const trimmedURL = Storage.shortenURL(untrimmedURL);

    expect(trimmedURL).toEqual('JavaScript\'s Foo bar');
  });

  it('should be able to search children nodes by their ID', function() {
    let node = Storage.findNode(mockSession, 8);
    expect(node.name).toEqual('Dutch language');
    node = Storage.findNode(mockSession, 19);
    expect(node.name).toEqual('Chamber of Regions');
    node = Storage.findNode(mockSession, 57);
    expect(node).toBeUndefined();
    node = Storage.findNode(mockSession, -5);
    expect(node).toBeUndefined();
  });

  it('should be able to create page objects', function() {
    const session = {
      id: 123456789,
      nodeIndex: 24,
      parentNode: 22
    };

    const page = Storage.createPageObject(session, commitData);

    expect(page.id).toEqual(session.nodeIndex);
    expect(page.name).toEqual('Sooners');
    expect(page.children).toEqual([]);
    expect(page.data).toBeDefined();
    expect(page.data.url).toEqual(commitData.url);
  });

  it('should record root node to chrome.storage.local', function() {
    const page = {
      data: {
        sessionId: 'test-session'
      }
    };

    Storage.recordRoot(page);
    expect(window.chrome.storage.local.set.calledWith({ 'test-session': page })).toBe(true);
  });

  it('should record child node to chrome.storage.local', function() {
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

    window.chrome.storage.local.get.callsFake(function(keys, callback) {
      callback({ 'test-session': mockTree });
    });

    Storage.recordChild(page);
    expect(window.chrome.storage.local.get.calledWith({ 'test-session': null })).toBe(true);
    expect(window.chrome.storage.local.set.called).toBe(true);
  });

  it('should delete item from chrome.storage.local', function() {
    Storage.deleteItem('test-session');
    expect(window.chrome.storage.local.remove.calledWith('test-session')).toBe(true);
  });

  it('should clear all items from chrome.storage.local', function() {
    Storage.deleteAll();
    expect(window.chrome.storage.local.clear.called).toBe(true);
  });
});
