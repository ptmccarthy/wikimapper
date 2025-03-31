/**
 * History Item View
 */

'use strict';

// External
import Backbone from 'backbone';
import saveSvgAsPng from 'save-svg-as-png';
import svgCrowbar from '../../lib/svg-crowbar';

// Internal
import enums from '../enums';
import templates from '../templates';
import ViewState from '../models/view-state';
import TreeView from './tree';

export default Backbone.View.extend({

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
