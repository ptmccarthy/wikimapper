/**
 * Main entry point for front-end app.
 *
 */

// External Dependencies
import Backbone from 'backbone';
import $ from 'jquery';

// Internal Dependencies
import App from './app';

// Give jQuery to Backbone
Backbone.$ = $;

// Initialize the application
App.initialize();
