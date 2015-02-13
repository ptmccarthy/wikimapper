'use strict';

var App =      require('../../src/chrome/background'),
    Sessions = require('../../src/chrome/session-handler');

describe('Background initialization', function() {

  beforeAll(function() {
    App.initialize();
  });

  it('should have no existing sessions', function() {
    expect(Sessions.sessions).toEqual([]);
  });

});
