'use strict';

// External
var Backbone = require('backbone');

// Internal
var enums =     require('wikimapper/enums');
var ViewState = require('wikimapper/viewstate');

module.exports = Backbone.View.extend({

  initialize: function() {
    ViewState.setNavState('history', enums.nav.active);
  }

});
