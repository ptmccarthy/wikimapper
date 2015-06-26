'use strict';

module.exports = {

  navigation:  require('../templates/navigation.hbs'),
  title:       require('../templates/title.hbs'),
  current:     require('../templates/current.hbs'),
  historyItem: require('../templates/history-item.hbs'),
  historyList: require('../templates/history-list.hbs'),

  get: function(template) {
    if (template in this) {
      return this[template];
    } else {
      console.error('Failed to load template: ' + template);
    }
  }

};
