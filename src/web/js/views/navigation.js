// External Dependencies
import Backbone from 'backbone';
import $ from 'jquery';

// Internal Dependencies
import templates from '../templates';
import ViewState from '../models/view-state';

Backbone.$ = $;

// Helper function to invert object keys and values
const invertObject = (obj) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [v, k]));

export default Backbone.View.extend({

  template: templates.get('navigation'),

  domElements: {
    title: 'nav-title',
    latest: 'nav-latest',
    history: 'nav-history'
  },

  events: {
    'click .nav-header li': 'onNavClick'
  },

  initialize: function() {
    // listen to the state model for changes to know when to re-render
    this.listenTo(ViewState.get('nav'), 'change', this.render);
  },

  render: function() {
    this.$el.html(this.template({
      nav: ViewState.get('nav').toJSON()
    }));
  },

  /**
   * Set the navigation state of the given navId to the given state
   * @param navId - id (in the ViewState.nav model) to set
   * @param state - state to set
   */
  setNavState: function(navId, state) {
    const id = invertObject(this.domElements)[navId];

    if (id) {
      ViewState.setNavState(id, state);
    } else {
      console.error('Nav id ' + navId + ' not found.');
    }
  },

  /**
   * Click handler for navigation items
   * @param eventArgs - click event object
   */
  onNavClick: function(eventArgs) {
    const $target = this.$(eventArgs.currentTarget);
    const index = $target.index();

    switch (index) {
      case 0:
      {
        ViewState.Router.navigate('title', { trigger: true });
        break;
      }
      case 1:
      {
        ViewState.Router.navigate('latest', { trigger: true });
        break;
      }
      case 2:
      {
        ViewState.Router.navigate('history', { trigger: true });
        break;
      }
      default:
      {
        console.error('Unknown nav item clicked, index value: ' + index);
      }
    }
  }

});
