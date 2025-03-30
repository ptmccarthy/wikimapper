'use strict';

var Backbone = require('backbone');
var $ = require('jquery');

var App = require('./app');

Backbone.$ = $;

// Views
var NavView = require('./views/navigation');
var TitleView = require('./views/title');
var LatestView = require('./views/latest');
var HistoryItemView = require('./views/history-item');
var HistoryListView = require('./views/history');

module.exports = Backbone.Router.extend({

  routes: {
    '': 'checkForLatest',
    title: 'title',
    latest: 'latest',
    'history?=:sessionId': 'historyParser',
    history: 'historyList'
  },

  checkForLatest: function() {
    if (App.StorageCollection.getLatest()) {
      this.latest();
    } else {
      this.title();
    }
  },

  title: function() {
    this.ensureNav();
    App.showBody(new TitleView({}));
  },

  latest: function() {
    this.ensureNav();
    App.showBody(new LatestView({
      session: App.StorageCollection.getLatest()
    }));
  },

  historyParser: function(sessionId) {
    var session = App.StorageCollection.findWhere({ id: sessionId });

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
      session
    }));
  },

  historyList: function() {
    this.ensureNav();

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
