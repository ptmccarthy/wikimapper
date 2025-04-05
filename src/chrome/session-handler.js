/**
 * Session handler module.
 */

// External Dependencies
import _ from 'lodash';

// Internal Dependencies
import Storage from './storage.js';

const SessionHandler = {
  // Keys for session storage
  TAB_STATUS_KEY: 'tabStatus',
  ACTIVE_SESSIONS_KEY: 'activeSessions',

  /**
   * Initialize the session handler by loading state from session storage
   * @returns {Promise} - Resolves when initialization is complete
   */
  initialize: async function() {
    // Load tabStatus and activeSessions from session storage
    const result = await chrome.storage.session.get([this.TAB_STATUS_KEY, this.ACTIVE_SESSIONS_KEY]);

    // Initialize with empty objects/arrays if they don't exist
    if (!result[this.TAB_STATUS_KEY]) {
      await chrome.storage.session.set({ [this.TAB_STATUS_KEY]: {} });
    }

    if (!result[this.ACTIVE_SESSIONS_KEY]) {
      await chrome.storage.session.set({ [this.ACTIVE_SESSIONS_KEY]: [] });
    }
  },

  /**
   * Get the current tabStatus from session storage
   * @returns {Promise<Object>} - The tabStatus object
   */
  getTabStatus: async function() {
    const result = await chrome.storage.session.get(this.TAB_STATUS_KEY);
    return result[this.TAB_STATUS_KEY] || {};
  },

  /**
   * Get the current activeSessions from session storage
   * @returns {Promise<Array>} - The activeSessions array
   */
  getActiveSessions: async function() {
    const result = await chrome.storage.session.get(this.ACTIVE_SESSIONS_KEY);
    return result[this.ACTIVE_SESSIONS_KEY] || [];
  },

  /**
   * Update tabStatus in session storage
   * @param {Object} tabStatus - The new tabStatus object
   * @returns {Promise} - Resolves when update is complete
   */
  updateTabStatus: async function(tabStatus) {
    await chrome.storage.session.set({ [this.TAB_STATUS_KEY]: tabStatus });
  },

  /**
   * Update activeSessions in session storage
   * @param {Array} activeSessions - The new activeSessions array
   * @returns {Promise} - Resolves when update is complete
   */
  updateActiveSessions: async function(activeSessions) {
    await chrome.storage.session.set({ [this.ACTIVE_SESSIONS_KEY]: activeSessions });
  },

  /**
   * Handle new commitData by finding its session (or creating a new one),
   * and determining whether it is a root node or not.
   * @param commitData
   */
  handler: async function(commitData) {
    const session = await this.findSessionOf(commitData);
    const page = Storage.createPageObject(session, commitData);

    await this.setTabStatus(commitData.tabId, page);

    if (!page.data.parentId) {
      page.lastNodeIndex = 1;
      Storage.recordRoot(page);
    } else {
      Storage.recordChild(page);
    }

    await this.incrementNodeIndex(session);
  },

  /**
   * Increment the nodeIndex of a session by 1.
   * This counter keeps track of how many pages (nodes) have been added to a session.
   * @param session - the session to increment
   */
  incrementNodeIndex: async function(session) {
    const activeSessions = await this.getActiveSessions();

    const updatedSessions = activeSessions.map(activeSession => {
      if (activeSession.id === session.id) {
        return { ...activeSession, nodeIndex: activeSession.nodeIndex + 1 };
      }
      return activeSession;
    });

    await this.updateActiveSessions(updatedSessions);
  },

  /**
   * Find a tabId in tabStatus and update its data with the most recent page
   * @param tabId - tabId from commitData
   * @param page - page object to store
   */
  setTabStatus: async function(tabId, page) {
    const tabStatus = await this.getTabStatus();

    if (tabStatus[tabId]) {
      page.parent = tabStatus[tabId];
    }

    tabStatus[tabId] = page;
    await this.updateTabStatus(tabStatus);
  },

  /**
   * Find the session that incoming commitData relates to.
   * If a session is not found, a new session is created.
   * @param commitData - commitData from chrome.webNavigation
   * @returns {object} - session object
   */
  findSessionOf: async function(commitData) {
    const ret = {
      id: null,
      parentNode: '',
      nodeIndex: ''
    };

    const tabStatus = await this.getTabStatus();
    const activeSessions = await this.getActiveSessions();

    // Look for an existing session in active sessions list
    for (const session of activeSessions) {
      // First check if this navigation happened in the same tab as its parent
      // by checking our existing sessions & tabs
      if (_.includes(session.tabs, commitData.tabId)) {
        ret.id = session.id;
        ret.parentNode = tabStatus[commitData.tabId].id;
        ret.nodeIndex = session.nodeIndex;
        break;
      } // eslint-disable-line brace-style

      // Otherwise, this is a child tab of an existing parent tab
      // (if it has an openerTabId to use)
      else if (commitData.openerTabId) {
        if (_.includes(session.tabs, commitData.openerTabId)) {
          ret.id = session.id;
          ret.parentNode = tabStatus[commitData.openerTabId].id;
          ret.nodeIndex = session.nodeIndex;

          // Update the session with the new tab
          session.tabs.push(commitData.tabId);
          await this.updateActiveSessions(activeSessions);
          break;
        }
      }
    }

    // If we found a an existing session return it,
    // otherwise create a new session and return it
    if (ret.id) {
      return ret;
    } else {
      return await this.createNewSession(commitData);
    }
  },

  /**
   * Create a new session, store it in active sessions, and return a session object
   * @param commitData
   * @returns {{id: *, parentNode: null, nodeIndex: number}}
   */
  createNewSession: async function(commitData) {
    const session = {
      id: _.now(),
      tabs: [commitData.tabId],
      nodeIndex: 1
    };

    const activeSessions = await this.getActiveSessions();
    activeSessions.push(session);
    await this.updateActiveSessions(activeSessions);

    return { id: session.id, parentNode: null, nodeIndex: 1 };
  },

  /**
   * Forward/Back button events are unfortunately the same event trigger in the
   * Chrome webNavigation API, so we have to do some deduction to figure out which
   * type each qualifying event is.
   * @param {object} details - chrome.webNavigation event details
   */
  processForwardBack: async function(details) {
    let commitData = {};
    const tabStatus = await this.getTabStatus();

    // back button
    if (details.url === tabStatus[details.tabId].parent.data.url) {
      console.log('back button');
      const backPage = tabStatus[details.tabId].parent;

      commitData = backPage;
      commitData.forwardId = tabStatus[details.tabId].id;
      commitData.forwardChildren = tabStatus[details.tabId].children;

      tabStatus[details.tabId] = backPage;
      await this.updateTabStatus(tabStatus);
    } // eslint-disable-line brace-style

    // forward button
    else {
      console.log('forward button');
      commitData.id = tabStatus[details.tabId].forwardId;
      commitData.parent = tabStatus[details.tabId];
      commitData.children = tabStatus[details.tabId].forwardChildren;
      commitData.data = {
        tabId: commitData.tabId,
        date: commitData.timeStamp,
        url: commitData.url,
        parentId: commitData.parent.id,
        sessionId: commitData.parent.data.sessionId
      };
      tabStatus[details.tabId] = commitData;
      await this.updateTabStatus(tabStatus);
    }
  },

  /**
   * Process 'normal' navigation events that matched this.triggers.
   * @param {object} details - chrome.webNavigation event details
   */
  processNavigation: async function(details) {
    const commitData = details;

    const tab = await chrome.tabs.get(details.tabId);
    if (tab.openerTabId) {
      commitData.openerTabId = tab.openerTabId;
    }

    await this.handler(commitData);
  },

  /**
   * First step of updating a name with the 'cleaned' title received
   * from the content script. Find the session the tab belongs to,
   * then pass on the info to the Storage API to update localStorage.
   * @param tabId - tabID to find the session of
   * @param url - url of the page to update
   * @param name - cleaned name to update
   */
  updateName: async function(tabId, url, name, redirectedFrom) {
    const activeSessions = await this.getActiveSessions();

    const session = activeSessions.find(s => _.includes(s.tabs, tabId));
    if (session) {
      Storage.updatePageName(session.id, url, name, redirectedFrom);
    }
  },

  /**
   * Clear the given sessionId
   * @param sessionId
   */
  clearSession: async function(sessionId) {
    const activeSessions = await this.getActiveSessions();
    const updatedSessions = activeSessions.filter(session => session.id !== sessionId);
    await this.updateActiveSessions(updatedSessions);
  },

  /**
   * Clear all sessions
   */
  clearAllSessions: async function() {
    await this.updateActiveSessions([]);
  }
};

export default SessionHandler;
