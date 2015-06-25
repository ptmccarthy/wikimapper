'use strict';

module.exports = {

  navigation: require('../templates/navigation.hbs'),
  title:      require('../templates/title.hbs'),
  current:    require('../templates/current.hbs'),
  history:    require('../templates/history.hbs'),

  get: function(template) {
    if (template in this) {
      return this[template];
    } else {
      console.error('Failed to load template: ' + template);
    }
  }

};
