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
    'click .navigable': 'onTableItemClick',
    'click .history-checkbox': 'onSelectTableItem',
    'click #history-select-all': 'onSelectAll',
    'click #clear-history': 'confirmDelete'
  },

  domElements: {
    'selectAll': '#history-select-all'
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
      collection: this.collection.toJSON(),
      selectAll: this.selectAll
    }));
  },

  /**
   * Handler for table navigable item click events. Parse the sessionId from it.
   * @param eventArgs
   */
  onTableItemClick: function(eventArgs) {
    var id = this.$(eventArgs.currentTarget).parent().attr('sessionId');

    if (id) {
      ViewState.Router.navigate('history?=' + id, { trigger: true });
    } else {
      console.error('Table navigable click event, but no sessionId attribute found on row!');
    }
  },

  /**
   * Handler for table item selection events. Set selection state on the model and update
   * select all view state if necessary.
   * @param eventArgs
   */
  onSelectTableItem: function(eventArgs) {
    var id = this.$(eventArgs.currentTarget).attr('id');
    var checked = this.$(eventArgs.currentTarget).is(':checked');

    var item = this.collection.findWhere({ id: id });
    if (item) {
      item.set('checked', checked);
    } else {
      console.error('Could not find session ID: ' + id + ' in WikiMapper history.');
    }

    // if checking, set select all if necessary
    if (checked) {
      var unselectedItem = this.collection.findWhere({checked: false});
      if (!unselectedItem) {
        this.selectAll = true;
        this.$(this.domElements.selectAll).prop('checked', true);
      }
    }

    // if unchecking, unset select all if necessary
    if (!checked && this.selectAll) {
      this.selectAll = false;
      this.$(this.domElements.selectAll).prop('checked', false);
    }
  },

  /**
   * Handler for select all checkbox. Update all models in collection to match.
   * @param eventArgs
   */
  onSelectAll: function(eventArgs) {
    var checked = this.$(eventArgs.currentTarget).is(':checked');
    this.selectAll = checked;

    this.collection.each(function(item) {
      item.set('checked', checked);
    });

    this.render();
  },

  confirmDelete: function() {
    var checked = this.collection.where({ checked: true });
    var pluralString = checked.length === 1? 'session' : 'sessions';

    var confirmed = window.confirm('Are you sure you want to delete ' + checked.length + ' historical ' + pluralString + '?');

    if (confirmed) {
      this.collection.deleteChecked();
      this.collection.fetch();
    }
  }

});
