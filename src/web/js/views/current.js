'use strict';

// External
var Backbone = require('backbone');

// Internal
var enums =     require('wikimapper/enums');
var templates = require('wikimapper/templates');
var ViewState = require('wikimapper/viewstate');

module.exports = Backbone.View.extend({

  template: templates.get('current'),

  initialize: function() {
    ViewState.setNavState('current', enums.nav.active);
  },

  render: function() {
    this.$el.html(this.template({}));
  }

});
