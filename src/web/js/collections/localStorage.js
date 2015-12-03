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

  // default comparator is id (date) descending
  comparator: function(model) {
    return -model.get('id');
  },

  initialize: function() {
    this.localStorage = window.localStorage;
  },

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

  parse: function(history) {
    _.each(history, _.bind(function(session) {
      session.checked = false;
      this.add(session);
    }, this));
  },

  getLatest: function() {
    this.fetch();

    return _.max(this.models, function(model) {
      return model.id;
    });
  },

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

  deleteChecked: function() {
    var self = this;
    var collection = this.models;

    collection.forEach(function(session) {

      var sessionId = session.get('id');
      if (session.get('checked')) {
        self.remove(sessionId);
        self.localStorage.removeItem(sessionId);
      }
    });

    this.trigger('delete');
  },

  filterSearch: function(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    this.each(function(session) {
      var name = session.get('tree').name.toLowerCase();
      if (name.indexOf(searchTerm) < 0) {
        session.set('hidden', true);
      } else {
        session.set('hidden', false);
      }
    });

    this.trigger('filter');
  }
});
