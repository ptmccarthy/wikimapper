/**
 * History View
 */

'use strict';

// External
var Backbone = require('backbone');

// Internal
var enums =     require('wikimapper/enums');
var templates = require('wikimapper/templates');
var ViewState = require('wikimapper/viewstate');

module.exports = Backbone.View.extend({

  template: templates.get('history'),

  initialize: function(options) {
    if (options && options.collection) {
      this.collection = options.collection;
      this.listenTo(this.collection, 'sync', this.render);
    } else {
      console.error('History view initialized without a collection. No history will be available.');
    }

    ViewState.setNavState('history', enums.nav.active);

    this.collection.fetch();
  },

  render: function() {
    this.$el.html(this.template({
      collection: this.collection
    }));
  }

});
