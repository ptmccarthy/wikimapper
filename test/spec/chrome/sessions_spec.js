'use strict';

var App =      require('../../../src/chrome/background'),
    Sessions = require('../../../src/chrome/session-handler');

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

  it('should be able to clear a session', function() {
    Sessions.activeSessions = [{ id: 123 }, { id: 543} , { id: 998} ];

    Sessions.clearSession(543);
    expect(Sessions.activeSessions).toEqual([{ id: 123}, { id: 998} ]);

    Sessions.clearSession(123);
    expect(Sessions.activeSessions).toEqual([{ id: 998 }]);

    Sessions.clearSession(998);
    expect(Sessions.activeSessions).toEqual([]);
  });

  it('should be able to clear all sessions', function() {
    Sessions.activeSessions = [{ id: 123 }, { id: 543} , { id: 998} ];

    Sessions.clearAllSessions();
    expect(Sessions.activeSessions = []);
  });

  it('should be able to create a session', function() {
    var newSession;
    var commitData = {
      tabId: 567
    };

    Sessions.createNewSession(commitData);
    newSession = Sessions.activeSessions[0];

    expect(typeof newSession.id).toBe('number');
    expect(newSession.tabs).toContain(567);
    expect(newSession.nodeIndex).toEqual(1);
  });

});
