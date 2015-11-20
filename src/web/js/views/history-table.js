/**
 * Main History View
 */

'use strict';

// External
var Backbone = require('backbone');

// Internal
var templates = require('wikimapper/templates');

module.exports = Backbone.View.extend({

  template: templates.get('historyTable'),

  initialize: function(options) {
    this.collection = options.collection;
  },

  render: function () {
    this.$el.html(this.template({
      collection: this.collection.toJSON(),
      selectAll: this.collection.selectAll
    }));
  }
});