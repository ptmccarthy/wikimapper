/**
 * Current Session View
 */

'use strict';

// External
var Backbone = require('backbone');

// Internal
var enums = require('wikimapper/enums');
var templates = require('wikimapper/templates');
var ViewState = require('wikimapper/viewstate');
var TreeView = require('./tree');

module.exports = Backbone.View.extend({

  template: templates.get('latest'),

  initialize: function(options) {
    if (options && options.session) {
      this.session = options.session;
    } else {
      console.warn('No latest session could be found.');
    }

    ViewState.setNavState('latest', enums.nav.active);
  },

  render: function() {
    var hasValidSession = false;

    // check that this.session is a Backbone model by checking if it has a get method
    if (this.session.get) {
      hasValidSession = true;
    }

    this.$el.html(this.template({
      session: hasValidSession
    }));

    if (hasValidSession) {
      this.d3View = new TreeView({
        el: this.$('#viz'),
        data: this.session.get('tree')
      });

      this.d3View.render();
    }
  }
});
