/**
 * History Table Child View
 */

// External
import Backbone from 'backbone';

// Internal
import templates from '../templates';

export default Backbone.View.extend({

  template: templates.get('historyTable'),

  initialize: function(options) {
    this.collection = options.collection;
  },

  render: function() {
    this.updateSortState();

    this.$el.html(this.template({
      collection: this.collection.toJSON(),
      selectAll: this.collection.selectAll,
      sortByDate: this.sortByDate,
      sortByName: this.sortByName,
      sortByNodes: this.sortByNodes,
      sortAscending: this.collection.sortAscending
    }));
  },

  // Examine the collection to determine the sorting state variables needed for
  // passing to the template on render.
  updateSortState: function() {
    this.sortByDate = false;
    this.sortByName = false;
    this.sortByNodes = false;

    switch (this.collection.sortingField) {
      case 'id':
        this.sortByDate = true;
        break;
      case 'name':
        this.sortByName = true;
        break;
      case 'lastNodeIndex':
        this.sortByNodes = true;
        break;
    }
  }
});
