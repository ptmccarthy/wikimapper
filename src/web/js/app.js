/**
 * Front-end Application Object
 */

// External Dependencies
import $ from 'jquery';
import Backbone from 'backbone';

// Internal Dependencies
import Router from './router.js';
import ViewState from './models/view-state.js';
import StorageCollection from './collections/localStorage.js';

const App = {
  domElements: {
    nav: '#navigation-view',
    body: '#body-view'
  },

  initialize: function() {
    ViewState.initializeHeader();

    this.StorageCollection = new StorageCollection();
    this.StorageCollection.fetch().then(function() {
      // Initialize router after data is loaded
      ViewState.Router = new Router();
      Backbone.history.start();
    });
  },

  showBody: function(view) {
    if (this.currentView) {
      if (this.currentView.close) {
        this.currentView.close();
      } else {
        this.currentView.remove();
      }
    }

    this.currentView = view;
    this.currentView.render();
    $(this.domElements.body).html(this.currentView.el);
  },

  showNavigation: function(nav) {
    this.nav = nav;
    this.nav.render();
    $(this.domElements.nav).html(this.nav.el);
  }
};

export default App;
