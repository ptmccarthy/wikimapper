/**
 * Front-end Application Object
 */

'use strict';

// External Dependencies
var $ = require('jquery');

// Internal Dependencies
var ViewState = require('wikimapper/viewstate');

module.exports = {

  domElements: {
    nav: '#navigation-view',
    body: '#body-view'
  },

  initialize: function() {
    ViewState.initializeHeader();
  },

  showBody: function(view) {

    if (this.currentView) {
      if (this.currentView.close) {
        this.currentView.close();
      } else {
        this.currentView.remove();
      }
    }

    this.currentView = view;
    this.currentView.render();
    $(this.domElements.body).html(this.currentView.el);
  },

  showNavigation: function(nav) {
    this.nav = nav;
    this.nav.render();
    $(this.domElements.nav).html(this.nav.el);
  }

};
