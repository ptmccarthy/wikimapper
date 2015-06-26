/**
 * History List View
 */

'use strict';

// External
var Backbone = require('backbone');

// Internal
var enums =     require('wikimapper/enums');
var templates = require('wikimapper/templates');
var ViewState = require('wikimapper/viewstate');

module.exports = Backbone.View.extend({

  template: templates.get('historyList'),

  events: {
    'click .table-row': 'onTableRowClick'
  },

  initialize: function(options) {
    if (options && options.collection) {
      this.collection = options.collection;
      this.listenTo(this.collection, 'sync', this.render);
    } else {
      console.error('History view initialized without a collection. No history will be available.');
    }

    ViewState.setNavState('history', enums.nav.active);
  },

  render: function() {
    this.$el.html(this.template({
      collection: this.collection.toJSON()
    }));
  },

  /**
   * Handler for table row click events. Parse the sessionId from it.
   * @param eventArgs
   */
  onTableRowClick: function(eventArgs) {
    var id = this.$(eventArgs.currentTarget).attr('sessionId');

    if (id) {
      ViewState.Router.navigate('history?=' + id, { trigger: true });
    } else {
      console.error('Table row click event, but no sessionId attribute found on row!');
    }
  }

});
