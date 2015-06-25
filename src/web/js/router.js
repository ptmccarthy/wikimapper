'use strict';

var Backbone = require('backbone');
var $ =        require('jquery');

var App = require('./app');

Backbone.$ = $;

// Views
var NavView =     require('./views/navigation');
var TitleView =   require('./views/title');
var CurrentView = require('./views/current');
var HistoryView = require('./views/history');

module.exports = Backbone.Router.extend({

  routes: {
    '': 'title',
    title: 'title',
    current: 'current',
    history: 'history'
  },

  title: function() {
    this.ensureNav();
    App.showBody(new TitleView({}));
  },

  current: function() {
    this.ensureNav();
    App.showBody(new CurrentView({}));
  },

  history: function() {
    this.ensureNav();
    App.showBody(new HistoryView({}));
  },

  /**
   * Ensure that the navigation view is displayed.
   * This is mostly to ensure that navigation doesn't disappear if a page
   * is manually refreshed (with its '#page' URL)
   */
  ensureNav: function() {
    if (!App.nav) {
      App.nav = new NavView({});
      App.showNavigation(App.nav);
    }
  }

});
