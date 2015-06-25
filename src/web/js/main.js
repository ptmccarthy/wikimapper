var Backbone = require('backbone');
var $ =        require('jquery');

Backbone.$ = $;

var App =       require('./app');
var Router =    require('./router');
var ViewState = require('./models/view-state');

App.initialize();
ViewState.Router = new Router();
Backbone.history.start();
