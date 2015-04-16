'use strict';

var App =      require('../../src/chrome/background'),
    Sessions = require('../../src/chrome/session-handler');

describe('Background initialization', function() {

  beforeAll(function() {
    App.initialize();
  });

  it('should have no existing tab status', function() {
    expect(Sessions.tabStatus).toEqual([]);
  });

  it('should have no existing active sessions', function() {
    expect(Sessions.activeSessions).toEqual([]);
  });

});
