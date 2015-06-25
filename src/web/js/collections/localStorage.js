/**
 * Collection for interfacing with localStorage.
 */

'use strict';

var Backbone = require('backbone');
var _ =        require('lodash');

module.exports = Backbone.Collection.extend({

  initialize: function() {
    this.localStorage = window.localStorage;
  },

  fetch: function() {
    var history = [];
    for (var i = 0, len = this.localStorage.length; i < len; i++) {
      history.push(this.localStorage.getItem(this.localStorage.key(i)));
    }

    this.trigger('sync');
  }

});
