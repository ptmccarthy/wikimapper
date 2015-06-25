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
    '': 'index',
    title: 'title',
    current: 'current',
    history: 'history'
  },

  index: function() {
    if (!App.nav) {
      App.nav = new NavView({});
      App.showNavigation(App.nav);
    }
  },

  title: function() {
    App.showBody(new TitleView({}));
  },

  current: function() {
    App.showBody(new CurrentView({}));
  },

  history: function() {
    App.showBody(new HistoryView({}));
  }

});
