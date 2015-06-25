'use strict';

// External Dependencies
var Backbone = require('backbone');
var $ =        require('jquery');

// Internal Dependencies
var enums =     require('wikimapper/enums');
var templates = require('wikimapper/templates');
var ViewState = require('wikimapper/viewstate');

Backbone.$ = $;

module.exports = Backbone.View.extend({

  template: templates.get('title'),

  initialize: function() {
    ViewState.setNavState('title', enums.nav.active);
  },

  render: function() {
    this.$el.html(this.template({}));
  }

});
