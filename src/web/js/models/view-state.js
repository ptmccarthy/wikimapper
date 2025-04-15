// External
import Backbone from 'backbone';

// Internal
import enums from '../enums.js';

const ViewState = Backbone.Model.extend({

  /**
   * Initialize the header with a new model to keep track of state.
   */
  initializeHeader: function() {
    this.set('nav', new Backbone.Model({
      title: enums.nav.active,
      latest: enums.nav.enabled,
      history: enums.nav.enabled
    }));
  },

  /**
   * Set header state of given nav element id.
   * Resets state of all other nav elements.
   * @param id - id (within nav model) of element
   * @param state - state to set on the model
   */
  setNavState: function(id, state) {
    const navModel = this.get('nav');
    const navItemState = navModel.get(id);

    if (navItemState !== state) {
      this.resetHeaderState();
      navModel.set(id, state);
    }
  },

  /**
   * Reset the state of all header elements to 'enabled'
   */
  resetHeaderState: function() {
    const navModel = this.get('nav');

    Object.entries(navModel.attributes).forEach(([key, value]) => {
      navModel.set(key, enums.nav.enabled);
    });
  }

});

export default new ViewState();
