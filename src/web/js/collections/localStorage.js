/**
 * Collection for interfacing with localStorage.
 */

'use strict';

var Backbone = require('backbone');
var _ =        require('lodash');

module.exports = Backbone.Collection.extend({

  model: Backbone.Model,
  sortingField: 'id',
  sortAscending: false,

  comparator: function(model) {
    // default comparator is id (date) descending
    return -model.get('id');
  },

  initialize: function() {
    this.localStorage = window.localStorage;
  },

  /**
   * Custom Fetch
   * Retrieves localStorage and converts it to a Backbone.Collection
   */
  fetch: function() {
    var history = [];
    var session = {};
    var keys = Object.keys(this.localStorage);

    for (var i = 0; i < keys.length; i++) {
      session = {};
      session.id = keys[i];
      session.tree = JSON.parse(this.localStorage.getItem(this.localStorage.key(i)));
      history.push(session);
    }

    this.parse(history);
    this.trigger('sync');
  },

  /**
   * Custom Parse
   * Add localStorage objects into the collection
   * @param history - localStorage parsed into an Array of objects
   */
  parse: function(history) {
    _.each(history, _.bind(function(session) {
      session.checked = false;
      this.add(session);
    }, this));
  },

  /**
   * Return the most recent session model.
   * @returns {Backbone.Model}
   */
  getLatest: function() {
    this.fetch();

    return _.max(this.models, function(model) {
      return model.id;
    });
  },

  /**
   * Set the sorting on the collection by assigning a new comparator function.
   * @param sortBy
   */
  setSortBy: function(sortBy) {
    var direction;

    // if the field is not changing, just toggle the direction
    if (sortBy === this.sortingField) {
      this.sortAscending = !this.sortAscending;
    // otherwise, reset to the default of descending
    } else {
      this.sortAscending = false;
      this.sortingField = sortBy;
    }

    // convert boolean value to pos/neg integer for use in the comparator function
    if (this.sortAscending) {
      direction = 1;
    } else {
      direction = -1;
    }

    // each field needs to be sorted a little differently... ugly
    if (sortBy === 'id') {
      this.comparator = function(model) {
        return direction * model.get('id');
      };
    } else if (sortBy === 'name') {
      this.comparator = function(a, b) {
        // JS/Backbone can't simply sort strings alphabetically in reverse, have to hack it a little bit...
        return direction * a.get('tree').name.localeCompare(b.get('tree').name);
      };
    } else {
      this.comparator = function(model) {
        return direction * model.get('tree')[sortBy];
      };
    }

    this.sort();
  },

  /**
   * Remove selected sessions from the collection and from localStorage.
   * BEWARE: do not modify the collection during the .each() iteration!!!
   * Doing so breaks the iteration! Instead, remove it from localStorage and
   * keep a reference to the model in toRemove for bulk removal at the end.
   */
  deleteChecked: function() {
    var self = this;
    var toRemove = [];

    self.each(function(session) {
      var sessionId = session.get('id');
      if (session.get('checked')) {
        toRemove.push(session);
        self.localStorage.removeItem(sessionId);
      }
    });

    self.remove(toRemove);

    this.trigger('delete');
  },

  /**
   * Filter sessions based on search input (case insensitive).
   * Recursively look through the parent node and all its children for the search term.
   * If the search term is not found in any of the session's node names, flag it as hidden.
   * When searching, if a match is found, stop recursing.
   * @param {string} searchTerm
   */
  filterSearch: function(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    this.searchTerm = searchTerm;

    // recursive children search for search term
    var searchChildren = function(children, searchTerm) {
      if (!children) {
        return false;
      }

      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        var name = child.name.toLowerCase();

        if (name.includes(searchTerm)) {
          return true;
        } else if (child.children) {
          if (searchChildren(child.children, searchTerm)) {
            return true;
          }
        }
      }
    };

    // search through each session in the collection
    this.each(function(session) {
      var containsTerm = false;
      var tree = session.get('tree');
      var name = tree.name.toLowerCase();

      if (name.includes(searchTerm)) {
        containsTerm = true;
      } else {
        containsTerm = searchChildren(tree.children, searchTerm);
      }

      // hide the session if it does not contain the search term
      session.set('hidden', (containsTerm !== true));
    });

    // we're done searching, trigger the filter event to re-render the view
    this.trigger('filter');
  }
});
