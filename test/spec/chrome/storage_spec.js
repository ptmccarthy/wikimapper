'use strict';

var Storage =     require('../../../src/chrome/storage');
var mockSession = require('../../resources/mock_session');

describe('Storage API', function() {

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
});
