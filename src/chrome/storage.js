/**
 * Data storage and access module.
 */

const Storage = {

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
        parentId: session.parentNode
      },
      children: []
    };

    return page;
  },

  /**
   * Record a root node to chrome.storage.local
   * @param page - page object to store
   */
  recordRoot: function(page) {
    if (!page || !page.data || !page.data.sessionId) {
      console.error('Invalid page object for recordRoot:', page);
      return;
    }
    chrome.storage.local.set({ [page.data.sessionId]: page });
  },

  /**
   * Record a new child node to an existing tree in chrome.storage.local
   * @param page - page object to store
   */
  recordChild: function(page) {
    if (!page || !page.data || !page.data.sessionId) {
      console.error('Invalid page object for recordChild:', page);
      return;
    }

    chrome.storage.local.get({ [page.data.sessionId]: null }, function(result) {
      var tree = result[page.data.sessionId];
      if (!tree) {
        console.error('No tree found for session:', page.data.sessionId);
        return;
      }
      var parent = this.findNode(tree, page.data.parentId);
      if (!parent) {
        console.error('No parent found for node:', page.data.parentId);
        return;
      }

      tree.lastNodeIndex = page.id;
      parent.children.push(page);

      chrome.storage.local.set({ [page.data.sessionId]: tree });
    }.bind(this));
  },

  /**
   * Recursively search through a tree to find a node by its id
   * @param tree - JSON tree of WikiMapper data
   * @param nodeId - nodeId to find
   * @returns {*}
   */
  findNode: function(tree, nodeId) {
    if (!tree || !nodeId) return null;
    if (tree.id === nodeId) { return tree; }

    var result;
    var len = tree.children.length;
    for (var i = 0; i < len; i++) {
      result = this.findNode(tree.children[i], nodeId);
      if (result) { return result; }
    }
  },

  /**
   * Recursively search through a tree to find a node by its URL.
   * Will only return the first matching node that it finds.
   * @param tree - JSON tree of WikiMapper data
   * @param url - URL to find
   * @param {boolean} ignoreUpdated - if true, ignore nodes that have already been marked as updated
   * @returns {*}
   */
  findNodeByURL: function(tree, url, ignoreUpdated) {
    if (!tree || !url) return null;
    if (tree.data.url === url) {
      var ignored = tree.updated === ignoreUpdated;
      if (!ignored) {
        return tree;
      }
    }

    var result;
    var len = tree.children.length;
    for (var i = 0; i < len; i++) {
      result = this.findNodeByURL(tree.children[i], url, ignoreUpdated);
      if (result) { return result; }
    }
  },

  /**
   * Trim a wikipedia url to just the page name in the url, then URI decode
   * it and replace the underscores with spaces to end up with the page title.
   * @param url - url string
   * @return {string} URL-derived Page Name
   */
  shortenURL: function(url) {
    if (!url) return '';
    // handle the special case of a search results page
    if (url.indexOf('Special:Search?search=') >= 0) {
      var split = url.split('Search?search=');
      var searchTerm = split[1].split('&')[0];
      return 'Search Results: ' + searchTerm;
    // otherwise, derive the name from the page url
    } else {
      return decodeURIComponent(/[^/]*$/.exec(url)[0].replace(/_/g, ' '));
    }
  },

  /**
   * Delete the given sessionId from the chrome.storage.local history.
   * @param sessionId
   */
  deleteItem: function(sessionId) {
    if (!sessionId) {
      console.error('Invalid sessionId for deleteItem:', sessionId);
      return;
    }
    chrome.storage.local.remove(sessionId);
  },

  /**
   * Delete all chrome.storage.local history.
   */
  deleteAll: function() {
    chrome.storage.local.clear();
  }
};

export default Storage;
