/**
 * History View
 */

'use strict';

// External
var Backbone = require('backbone');

// Internal
var enums =     require('wikimapper/enums');
var templates = require('wikimapper/templates');
var ViewState = require('wikimapper/viewstate');

module.exports = Backbone.View.extend({

  template: templates.get('history'),

  initialize: function() {
    ViewState.setNavState('history', enums.nav.active);
  },

  render: function() {
    this.$el.html(this.template({}));
  }

});
