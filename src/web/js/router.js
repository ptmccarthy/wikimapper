'use strict';

var Backbone = require('backbone');
var $ =        require('jquery');

var App = require('./app');

Backbone.$ = $;

// Views
var NavView =         require('./views/navigation');
var TitleView =       require('./views/title');
var CurrentView =     require('./views/current');
var HistoryItemView = require('./views/history-item');
var HistoryListView = require('./views/history-list');

// Collections
var StorageCollection = require('./collections/localStorage');

module.exports = Backbone.Router.extend({

  routes: {
    '': 'title',
    title: 'title',
    current: 'current',
    'history?=:sessionId': 'historyParser',
    history: 'historyList'
  },

  title: function() {
    this.ensureNav();
    App.showBody(new TitleView({}));
  },

  current: function() {
    this.ensureNav();
    App.showBody(new CurrentView({}));
  },

  historyParser: function(sessionId) {
    var session;

    if (!App.StorageCollection) {
      App.StorageCollection = new StorageCollection();
      App.StorageCollection.fetch();
    }

    session = App.StorageCollection.findWhere({ id: sessionId });

    if (session) {
      this.historyItem(session);
    } else {
      console.error('History was given parameter sessionId: ' + sessionId +
                    ', but it could not be found.');
    }
  },

  historyItem: function(session) {
    this.ensureNav();

    App.showBody(new HistoryItemView({
      session: session
    }))
  },

  historyList: function(sessionId) {
    this.ensureNav();

    if (!App.StorageCollection) {
      App.StorageCollection = new StorageCollection();
    }

    App.showBody(new HistoryListView({
      collection: App.StorageCollection
    }));

    App.StorageCollection.fetch();
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
