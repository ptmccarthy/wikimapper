/**
 * History Item View
 */

'use strict';

// External
var Backbone = require('backbone');

// Internal
var enums =     require('wikimapper/enums');
var templates = require('wikimapper/templates');
var ViewState = require('wikimapper/viewstate');
var TreeView =  require('./tree');

module.exports = Backbone.View.extend({

  template: templates.get('historyItem'),

  initialize: function(options) {
    if (options && options.session) {
      this.session = options.session;
    } else {
      console.error('History Item View initialized without a session object!');
    }

    ViewState.setNavState('history', enums.nav.active);
  },

  render: function() {
    this.$el.html(this.template({
      tree: this.session.get('tree')
    }));

    this.d3View = new TreeView({
      el: this.$('#viz'),
      data: this.session.get('tree')
    });

    this.d3View.render();
  }

});
