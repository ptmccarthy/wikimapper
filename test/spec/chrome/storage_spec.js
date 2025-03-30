'use strict';

var sinon = require('sinon');
var Storage = require('../../../src/chrome/storage');
var mockSession = require('../../resources/mock_session');
var commitData = require('../../resources/commit_data');

describe('Storage API', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    sandbox.spy(window.localStorage, 'getItem');
    sandbox.spy(window.localStorage, 'setItem');
    sandbox.spy(window.localStorage, 'removeItem');
    sandbox.spy(window.localStorage, 'clear');
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should be able to detect a search results page and name it appropriately', function() {
    var searchURL = 'https://en.wikipedia.org/wiki/Special:Search?search=_&go=Go';
    var trimmedURL = Storage.shortenURL(searchURL);

    expect(trimmedURL).toEqual('Search Results: _');
  });

  it('should be able to derive the page name from Wikipedia URLs accurately', function() {
    var untrimmedURL = 'http://en.wikipedia.org/wiki/JavaScript%27s_Foo_bar';
    var trimmedURL = Storage.shortenURL(untrimmedURL);

    expect(trimmedURL).toEqual('JavaScript\'s Foo bar');
  });

  it('should be able to search children nodes by their ID', function() {
    var node = Storage.findNode(mockSession, 8);
    expect(node.name).toEqual('Dutch language');
    node = Storage.findNode(mockSession, 19);
    expect(node.name).toEqual('Chamber of Regions');
    node = Storage.findNode(mockSession, 57);
    expect(node).toBeUndefined();
    node = Storage.findNode(mockSession, -5);
    expect(node).toBeUndefined();
  });

  it('should be able to create page objects', function() {
    var session = {
      id: 123456789,
      nodeIndex: 24,
      parentNode: 22
    };

    var page = Storage.createPageObject(session, commitData);

    expect(page.id).toEqual(session.nodeIndex);
    expect(page.name).toEqual('Sooners');
    expect(page.children).toEqual([]);
    expect(page.data).toBeDefined();
    expect(page.data.url).toEqual(commitData.url);
  });
});
