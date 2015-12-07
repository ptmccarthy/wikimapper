/**
 * Session handler module.
 */

'use strict';

// External Dependencies
var _ = require('lodash');

// Internal Dependencies
var Storage =    require('./storage');

module.exports = {

  tabStatus: {},
  activeSessions: [],

  /**
   * Handle new commitData by finding its session (or creating a new one),
   * and determining whether it is a root node or not.
   * @param commitData
   */
  handler: function(commitData) {

    var session = this.findSessionOf(commitData);
    var page = Storage.createPageObject(session, commitData);

    this.setTabStatus(commitData.tabId, page);

    if (!page.data.parentId) {
      page.lastNodeIndex = 1;
      Storage.recordRoot(page);
    } else {
      Storage.recordChild(page);
    }

    this.incrementNodeIndex(session);
  },

  /**
   * Increment the nodeIndex of a session by 1.
   * This counter keeps track of how many pages (nodes) have been added to a session.
   * @param session - the session to increment
   */
  incrementNodeIndex: function(session) {
    _.find(this.activeSessions, function(activeSession) {
      if (activeSession.id === session.id) {
        activeSession.nodeIndex += 1;
      }
    });
  },

  /**
   * Find a tabId in tabStatus and update its data with the most recent page
   * @param tabId - tabId from commitData
   * @param page - page object to store
   */
  setTabStatus: function(tabId, page) {
    if (this.tabStatus[tabId]) {
      page.parent = this.tabStatus[tabId];
    }

    this.tabStatus[tabId] = page;
  },

  /**
   * Find the session that incoming commitData relates to.
   * If a session is not found, a new session is created.
   * @param commitData - commitData from chrome.webNavigation
   * @returns {object} - session object
   */
  findSessionOf: function(commitData) {
    var ret = {
      id: null,
      parentNode: '',
      nodeIndex: ''
    };
    var tabStatus = this.tabStatus;

    // Look for an existing session in active sessions list
    this.activeSessions.forEach(function(session) {

      // First check if this navigation happened in the same tab as its parent
      // by checking our existing sessions & tabs
      if (_.contains(session.tabs, commitData.tabId)) {
        ret.id = session.id;
        ret.parentNode = tabStatus[commitData.tabId].id;
        ret.nodeIndex = session.nodeIndex;
      }

      // Otherwise, this is a child tab of an existing parent tab
      // (if it has an openerTabId to use)
      else if (commitData.openerTabId) {
        if (_.contains(session.tabs, commitData.openerTabId)) {
          ret.id = session.id;
          ret.parentNode = tabStatus[commitData.openerTabId].id;
          ret.nodeIndex = session.nodeIndex;
          session.tabs.push(commitData.tabId);
        }
      }
    });

    // If we found a an existing session return it,
    // otherwise create a new session and return it
    if (ret.id) {
      return ret;
    } else {
      return this.createNewSession(commitData);
    }

  },

  /**
   * Create a new session, store it in active sessions, and return a session object
   * @param commitData
   * @returns {{id: *, parentNode: null, nodeIndex: number}}
   */
  createNewSession: function(commitData) {
    var session = {
      id: _.now(),
      tabs: [commitData.tabId],
      nodeIndex: 1
    };

    this.activeSessions.push(session);
    return { id: session.id, parentNode: null, nodeIndex: 1 };
  },

  /**
   * Forward/Back button events are unfortunately the same event trigger in the
   * Chrome webNavigation API, so we have to do some deduction to figure out which
   * type each qualifying event is.
   * @param {object} details - chrome.webNavigation event details
   */
  processForwardBack: function(details) {
    var commitData = {};
    // back button
    if (details.url === this.tabStatus[details.tabId].parent.data.url) {
      console.log('back button');
      var backPage = this.tabStatus[details.tabId].parent;

      commitData = backPage;
      commitData.forwardId = this.tabStatus[details.tabId].id;
      commitData.forwardChildren = this.tabStatus[details.tabId].children;

      this.tabStatus[details.tabId] = backPage;
    }

    // forward button
    else {
      console.log('forward button');
      commitData.id = this.tabStatus[details.tabId].forwardId;
      commitData.parent = this.tabStatus[details.tabId];
      commitData.children = this.tabStatus[details.tabId].forwardChildren;
      commitData.data = {
        tabId: commitData.tabId,
        date: commitData.timeStamp,
        url: commitData.url,
        parentId: commitData.parent.id,
        sessionId: commitData.parent.data.sessionId
      };
      this.tabStatus[details.tabId] = commitData;
    }
  },

  /**
   * Process 'normal' navigation events that matched this.triggers.
   * @param {object} details - chrome.webNavigation event details
   */
  processNavigation: function(details) {
    var self = this;
    var commitData = details;
    
    chrome.tabs.get(details.tabId, function(tab) {
      if (tab.openerTabId) {
        commitData.openerTabId = tab.openerTabId;
      }

      self.handler(commitData);
    });
  },

  /**
   * First step of updating a name with the 'cleaned' title received
   * from the content script. Find the session the tab belongs to,
   * then pass on the info to the Storage API to update localStorage.
   * @param tabId - tabID to find the session of
   * @param url - url of the page to update
   * @param name - cleaned name to update
   */
  updateName: function(tabId, url, name, redirectedFrom) {
    var session = _.find(this.activeSessions, function(s) {
      return _.contains(s.tabs, tabId);
    });

    Storage.updatePageName(session.id, url, name, redirectedFrom);
  },

  /**
   * Clear the given sessionId
   * @param sessionId
   */
  clearSession: function(sessionId) {
    this.activeSessions = _.reject(this.activeSessions, { id: sessionId });
  },

  /**
   * Clear all active sessions.
   */
  clearAllSessions: function() {
    this.tabStatus = {};
    this.activeSessions = [];
  }
};
