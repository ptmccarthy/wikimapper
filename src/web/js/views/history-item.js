/**
 * History Item View
 */

'use strict';

// External
var Backbone = require('backbone');
var saveSvgAsPng = require('save-svg-as-png');
var svgCrowbar = require('../../lib/svg-crowbar');

// Internal
var enums = require('wikimapper/enums');
var templates = require('wikimapper/templates');
var ViewState = require('wikimapper/viewstate');
var TreeView = require('./tree');

module.exports = Backbone.View.extend({

  template: templates.get('historyItem'),

  events: {
    'click #back-to-history': 'onGoBack',
    'click #export-to-svg': 'exportSVG',
    'click #export-to-png': 'exportPNG'
  },

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
  },

  onGoBack: function() {
    Backbone.history.history.back();
  },

  exportSVG: function() {
    svgCrowbar();
  },

  exportPNG: function() {
    saveSvgAsPng.saveSvgAsPng(document.getElementById('wikimapper-svg'), 'wikimapper.png', {
      backgroundColor: 'white',
      scale: 1.5
    });
  }

});
