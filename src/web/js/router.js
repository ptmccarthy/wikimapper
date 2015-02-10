'use strict';

var Backbone = require('backbone'),
    $ =        require('jquery');

var App = require('./app');

Backbone.$ = $;

// Views
var indexView = require('./views/index');

module.exports = Backbone.Router.extend({

  routes: {
    '': 'index'
  },

  index: function() {
    App.showBody(new indexView({}));
  }

});
