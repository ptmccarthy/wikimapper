/**
 * Data storage and access module.
 */

'use strict';

module.exports = {

  /**
   * Create a page object in the format necessary for storing and inserting into a JSON tree
   * @param session - the session this page belongs to
   * @param commitData - commitData from chrome.webNavigation
   * @returns {object} - page object
   */
  createPageObject: function(session, commitData) {
    var page = {
      id: session.nodeIndex,
      name: this.shortenURL(commitData.url),
      data: {
        url: commitData.url,
        date: commitData.timeStamp,
        sessionId: session.id,
        tabId: commitData.id,
        parentId: session.parentNode
      },
      children: []
    };

    return page;
  },

  /**
   * Record a root node to localStorage
   * @param page - page object to store
   */
  recordRoot: function(page) {
    localStorage.setItem(page.data.sessionId, JSON.stringify(page));
  },

  /**
   * Record a new child node to an existing tree in localStorage
   * @param page - page object to store
   */
  recordChild: function(page) {
    var tree = JSON.parse(localStorage.getItem(page.data.sessionId));
    var parent = this.findNode(tree, page.data.parentId);

    tree.lastNodeIndex = page.id;
    parent.children.push(page);

    localStorage.setItem(page.data.sessionId, JSON.stringify(tree));
  },

  /**
   * Recursively search through a tree to find a node by its id
   * @param tree - JSON tree of wikimapper data
   * @param nodeId - nodeId to find
   * @returns {*}
   */
  findNode: function(tree, nodeId) {
    if (tree.id === nodeId) { return tree; }

    var result;
    var len = tree.children.length;
    for (var i = 0; i < len; i++) {
      result = this.findNode(tree.children[i], nodeId);
      if (result !== undefined) { return result; }
    }
  },

  /**
   * Trim a wikipedia url to just the page name in the url.
   * This is a placeholder value for node.name until the real name is received
   * from the content script, which must wait until the DOM has loaded.
   * @param url - url string
   * @return {string} url with wikipedia stuff removed
   */
  shortenURL: function(url) {
    return /[^/]*$/.exec(url)[0];
  }

};
