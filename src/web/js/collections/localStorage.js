/**
 * Collection for interfacing with localStorage.
 */

'use strict';

var Backbone = require('backbone');
var _ =        require('lodash');

module.exports = Backbone.Collection.extend({

  model: Backbone.Model,

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
    var len = this.models.length;
    return this.models[len-1];
  },

  deleteChecked: function() {
    var self = this;

    this.each(function(session) {
      var sessionId = session.get('id');
      if (session.get('checked')) {
        console.log('Deleting session ' + sessionId);
        self.remove(sessionId);
        self.localStorage.removeItem(sessionId);
      }
    });

    this.trigger('sync');
  },

  filterSearch: function(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    this.each(function(session) {
      var name = session.get('tree').name.toLowerCase();
      if (name.indexOf(searchTerm) < 0) {
        session.set('hidden', true);
      }
    });

    this.trigger('sync');
  }
});
