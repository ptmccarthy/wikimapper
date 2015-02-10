'use strict';

var Backbone = require('backbone'),
    $ =        require('jquery');

var App = require('./app');

Backbone.$ = $;

// Views
var NavView =   require('./views/navigation'),
    IndexView = require('./views/index');

module.exports = Backbone.Router.extend({

  routes: {
    '': 'index'
  },

  index: function() {
    if (!App.nav) {
      App.nav = new NavView({
        title: 'WikiMapper'
      });
      App.showNavigation(App.nav);
    }

    App.showBody(new IndexView({}));
  }

});
