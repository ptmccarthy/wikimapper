'use strict';

var Backbone = require('backbone'),
  $ = require('jquery');

Backbone.$ = $;

module.exports = {

  domElements: {
    body: '#body-view'
  },

  initialize: function() {
    console.log('wikimapper init');
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
  }

};
