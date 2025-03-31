/**
 * Main entry point for front-end app.
 *
 */

// External Dependencies
import Backbone from 'backbone';
import $ from 'jquery';

// Internal Dependencies
import App from './app';
import Router from './router';
import ViewState from './models/view-state';

// Give jQuery to Backbone
Backbone.$ = $;

// Initialize the application
App.initialize();

// New up the application Router, keeping a reference in the ViewState
ViewState.Router = new Router();

// Kick off Backbone's history
Backbone.history.start();
