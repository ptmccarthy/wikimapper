/**
 * Current Session View
 */

// External
import Backbone from 'backbone';

// Internal
import enums from '../enums';
import templates from '../templates';
import ViewState from '../models/view-state';
import TreeView from './tree';

export default Backbone.View.extend({

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
    let hasValidSession = false;

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
