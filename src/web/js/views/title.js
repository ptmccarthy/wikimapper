/**
 * Index/Title View
 */

// External Dependencies
import Backbone from 'backbone';

// Internal Dependencies
import enums from '../enums';
import templates from '../templates';
import ViewState from '../models/view-state';

export default Backbone.View.extend({

  template: templates.get('title'),

  initialize: function() {
    ViewState.setNavState('title', enums.nav.active);
  },

  render: function() {
    this.$el.html(this.template({}));
  }

});
