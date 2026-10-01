/**
 * Main History View
 */

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
    'click #export-history': 'onExportHistory',
    'click #import-history-button': 'onImportHistoryClick',
    'change #import-history-file': 'onImportHistoryFile',
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
    const id = this.$(eventArgs.currentTarget).parent().attr('sessionId');

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
    const el = this.$(eventArgs.currentTarget);
    const id = el.attr('id');
    const checkbox = el.children('input');
    // since its not a native checkbox, the to-be-set checked state
    // is the *opposite* of its previously-known state
    const checked = checkbox.is(':not(:checked)');

    const item = this.collection.findWhere({ id });
    if (item) {
      item.set('checked', checked);
      checkbox.prop('checked', checked);
    } else {
      console.error('Could not find session ID: ' + id + ' in WikiMapper history.');
    }

    // if checking, set select all if necessary
    if (checked) {
      const unselectedItem = this.collection.findWhere({ checked: false, hidden: false });
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
    const checked = this.$(eventArgs.currentTarget).children('input').is(':not(:checked)');
    this.collection.selectAll = checked;
    this.collection.each(function(item) {
      if (!item.get('hidden')) {
        item.set('checked', checked);
      }
    });

    this.render();
  },

  onExportHistory: function() {
    const defaultName = this.defaultExportFilename();
    const entered = window.prompt('Name this export:', defaultName);

    if (entered === null) {
      return;
    }

    const filename = this.buildExportFilename(entered, defaultName);

    this.collection.exportAll().then(function(data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }).catch(function(error) {
      window.alert('Could not export history: ' + error.message);
    });
  },

  defaultExportFilename: function() {
    return 'wikimapper-history-' + new Date().toISOString().slice(0, 10);
  },

  /**
   * Turn prompt input into a safe .json download name.
   * Empty input falls back to the date-based default.
   * @param {string} name
   * @param {string} fallback
   * @returns {string}
   */
  buildExportFilename: function(name, fallback) {
    let filename = (name || '').trim() || fallback;
    filename = filename.replace(/[<>:"/\\|?*]/g, '-')
      .split('')
      .filter(function(character) {
        return character.charCodeAt(0) >= 32;
      })
      .join('')
      .replace(/\.+$/, '')
      .trim();

    if (!filename) {
      filename = fallback;
    }

    if (!filename.toLowerCase().endsWith('.json')) {
      filename += '.json';
    }

    return filename;
  },

  onImportHistoryClick: function() {
    this.$('#import-history-file').trigger('click');
  },

  onImportHistoryFile: function(eventArgs) {
    const self = this;
    const file = eventArgs.currentTarget.files && eventArgs.currentTarget.files[0];

    this.$('#import-history-file').val('');

    if (!file) {
      return;
    }

    file.text().then(function(text) {
      let data;

      try {
        data = JSON.parse(text);
      } catch (error) {
        window.alert('That file is not valid JSON.');
        return;
      }

      if (!self.collection.isValidHistoryExport(data)) {
        window.alert('That file does not look like a WikiMapper history export.');
        return;
      }

      const sessionCount = Object.keys(data).length;
      const pluralString = sessionCount === 1 ? 'session' : 'sessions';
      const confirmed = window.confirm(
        'Import ' + sessionCount + ' historical ' + pluralString +
        '? Existing sessions with the same ID will be replaced.'
      );

      if (!confirmed) {
        return;
      }

      return self.collection.importAll(data);
    }).catch(function(error) {
      window.alert('Could not import history: ' + error.message);
    });
  },

  confirmDelete: function() {
    let confirmed;
    const checked = this.collection.where({ checked: true });
    const pluralString = checked.length === 1 ? 'session' : 'sessions';

    if (checked.length > 0) {
      confirmed = window.confirm('Are you sure you want to delete ' + checked.length + ' historical ' + pluralString + '?');
    }

    if (confirmed) {
      this.collection.deleteChecked().then(function() {
        return this.collection.fetch();
      }.bind(this));
    }
  },

  onSortableClick: function(eventArgs) {
    const sortableId = this.$(eventArgs.currentTarget).attr('id');
    let sortBy;

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
    const searchTerm = this.$(eventArgs.currentTarget).val();
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
