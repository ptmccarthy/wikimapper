'use strict';

var Storage = require('../../src/chrome/storage');

describe('Storage API', function() {

  beforeAll(function() {
    // TODO: set up spies
  });

  it('should be able to create page objects for storing', function() {
    // TODO: mock out a session and some commitdata to test the function
  });

  it('should be able to trim wikipedia URLs accurately', function() {
    var untrimmedURL = 'http://en.wikipedia.org/wiki/JavaScript';
    var trimmedURL = Storage.shortenURL(untrimmedURL);

    expect(trimmedURL).toEqual('JavaScript');
  });

});
