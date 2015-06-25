/**
 * Main entry point for front-end app.
 *
 */

// External Dependencies
var Backbone = require('backbone');
var $ =        require('jquery');

// Internal Dependencies
var App =       require('./app');
var Router =    require('./router');
var ViewState = require('./models/view-state');

// Give jQuery to Backbone
Backbone.$ = $;

// Initialize the application
App.initialize();

// New up the application Router, keeping a reference in the ViewState
ViewState.Router = new Router();

// Kick off Backbone's history
Backbone.history.start();
