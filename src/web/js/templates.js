'use strict';

module.exports = {

  index:      require('../templates/index.hbs'),
  navigation: require('../templates/navigation.hbs'),

  get: function(template) {
    if (template in this) {
      return this[template];
    } else {
      console.error('Failed to load template: ' + template);
    }
  }

};
