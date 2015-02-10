var Backbone = require('backbone'),
    $ =        require('jquery');

Backbone.$ = $;

var App = require('./app'),
    Router = require('./router');

App.initialize();
App.Router = new Router();
Backbone.history.start();
