/**
 * Session handler module.
 */

'use strict';

// External Dependencies
var _ = require('lodash');

// Internal Dependencies
var Background = require('./background'),
    Storage =    require('./storage');

module.exports = {

  sessions: [],

  handler: function(commitData) {
    var session = this.findSessionOf(commitData);

    Storage.createPageObject(session, commitData, function(page) {
      if (page.id === 1) {
        Storage.recordRoot(page);
      } else {
        Storage.recordChild(page);
      }
    });

  },

  findSessionOf: function(commitData) {
    var ret = {
      'id': null,
      'parentNode': ''
    };

    // look for an existing session in active sessions list
    _.each(this.sessions, function(session) {
      // this navigation happened in the same tab as its parent
      if (_.contains(session.tabs, commitData.tabId)) {
        ret.id = session.id;
        ret.parentNode = Background.tabStatus[commitData].id;
      }

      // this is a child tab of an existing parent tab
      else if (commitData.parentId !== undefined) {
        var index = session.tabs.indexOf(commitData.parentId);

        if (index >= 0) {
          ret.id = session.id;
          ret.parentNode = Background.tabStatus[commitData.parentId].id;
          session.tabs.push(commitData.tabId);
        }
      }
    });

    // if we found a an existing session return it,
    // otherwise create a new session and return it
    if (ret.id) {
      return ret;
    } else {
      return this.createNewSession(commitData);
    }

  },

  createNewSession: function(commitData) {
    var session = {
      'id': _.now(),
      'tabs': [commitData.tabId],
      'nodeIndex': 1
    };

    this.sessions.push(session);
    return { 'id': session.id, 'parentNode': null };
  }
};
