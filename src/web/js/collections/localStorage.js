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
    for (var i = 0, len = this.localStorage.length; i < len; i++) {
      history.push(JSON.parse(this.localStorage.getItem(this.localStorage.key(i))));
    }

    this.parse({ body: history });
    this.trigger('sync');
  },

  parse: function(history) {
    _.each(history, _.bind(function(session) {
      this.add(session);
    }, this));
  }

});
