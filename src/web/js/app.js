'use strict';

// External Dependencies
var Backbone = require('backbone'),
    $ = require('jquery');

Backbone.$ = $;

module.exports = {

  domElements: {
    nav: '#navigation-view',
    body: '#body-view'
  },

  initialize: function() {

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
