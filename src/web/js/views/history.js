/**
 * Main History View
 */

'use strict';

// External
import Backbone from 'backbone';

// Internal
import enums from '../enums';
import templates from '../templates';
import ViewState from '../models/view-state';

// Child Views
import HistoryTableView from './history-table';

export default Backbone.View.extend({

  template: templates.get('history'),

  events: {
    'click td.navigable': 'onTableItemClick',
    'click th.sortable': 'onSortableClick',
    'click td.td-checkbox': 'onSelectTableItem',
    'click th.th-checkbox': 'onSelectAll',
    'click #clear-history': 'confirmDelete',
    'keyup #history-search': 'onSearchKeyup'
  },

  domElements: {
    tableContainer: '#history-table-container',
    selectAll: '#history-select-all'
  },

  initialize: function(options) {
    if (options && options.collection) {
      this.collection = options.collection;
      this.listenTo(this.collection, 'sync', this.render);
      this.listenTo(this.collection, 'delete', this.onCollectionChange);
      this.listenTo(this.collection, 'filter', this.onCollectionChange);
      this.listenTo(this.collection, 'sort', this.onCollectionChange);
    } else {
      console.error('History view initialized without a collection. No history will be available.');
    }

    this.historyTable = new HistoryTableView({
      collection: this.collection
    });

    ViewState.setNavState('history', enums.nav.active);
  },

  render: function() {
    this.$el.html(this.template({
      searchTerm: this.collection.searchTerm
    }));

    this.renderChild(this.historyTable, this.domElements.tableContainer);
  },

  onCollectionChange: function() {
    this.renderChild(this.historyTable, this.domElements.tableContainer);
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
    var el = this.$(eventArgs.currentTarget);
    var id = el.attr('id');
    var checkbox = el.children('input');
    // since its not a native checkbox, the to-be-set checked state
    // is the *opposite* of its previously-known state
    var checked = checkbox.is(':not(:checked)');

    var item = this.collection.findWhere({ id });
    if (item) {
      item.set('checked', checked);
      checkbox.prop('checked', checked);
    } else {
      console.error('Could not find session ID: ' + id + ' in WikiMapper history.');
    }

    // if checking, set select all if necessary
    if (checked) {
      var unselectedItem = this.collection.findWhere({ checked: false, hidden: false });
      if (!unselectedItem) {
        this.collection.selectAll = true;
        this.$(this.domElements.selectAll).prop('checked', true);
      }
    }

    // if unchecking, unset select all if necessary
    if (!checked && this.collection.selectAll) {
      this.collection.selectAll = false;
      this.$(this.domElements.selectAll).prop('checked', false);
    }
  },

  /**
   * Handler for select all checkbox. Update all models in collection to match.
   * @param eventArgs
   */
  onSelectAll: function(eventArgs) {
    // since its not a native checkbox, the to-be-set checked state
    // is the *opposite* of its previously-known state
    var checked = this.$(eventArgs.currentTarget).children('input').is(':not(:checked)');
    this.collection.selectAll = checked;
    this.collection.each(function(item) {
      if (!item.get('hidden')) {
        item.set('checked', checked);
      }
    });

    this.render();
  },

  confirmDelete: function() {
    var confirmed;
    var checked = this.collection.where({ checked: true });
    var pluralString = checked.length === 1 ? 'session' : 'sessions';

    if (checked.length > 0) {
      confirmed = window.confirm('Are you sure you want to delete ' + checked.length + ' historical ' + pluralString + '?');
    }

    if (confirmed) {
      this.collection.deleteChecked();
      this.collection.fetch();
    }
  },

  onSortableClick: function(eventArgs) {
    var sortableId = this.$(eventArgs.currentTarget).attr('id');
    var sortBy;

    switch (sortableId) {
      case 'header-date':
        sortBy = 'id';
        break;
      case 'header-root':
        sortBy = 'name';
        break;
      case 'header-nodes':
        sortBy = 'lastNodeIndex';
        break;
    }

    this.collection.setSortBy(sortBy);
  },

  onSearchKeyup: function(eventArgs) {
    var searchTerm = this.$(eventArgs.currentTarget).val();
    this.collection.selectAll = false;
    this.collection.filterSearch(searchTerm);
  },

  /**
   * Renders a child view, using the provided selector as the containing element.
   * @param childView The child view to render.
   * @param selector The jquery selector to the element that will contain the child view.
   */
  renderChild: function(childView, selector) {
    // NOTE: calls to this.$el.html() will remove all child event bindings (this is how jquery's html() works).
    //       using setElement (as opposed to appending the child view's this.el) rebinds all events, each time
    //       .html() is invoked (typically called on each render).
    if (childView) {
      childView.setElement(this.$(selector)).render();
    }
  }

});
