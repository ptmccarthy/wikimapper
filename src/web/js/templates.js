'use strict';

export default {

  navigation: require('../templates/navigation.hbs'),
  title: require('../templates/title.hbs'),
  latest: require('../templates/latest.hbs'),
  history: require('../templates/history.hbs'),
  historyItem: require('../templates/history-item.hbs'),
  historyTable: require('../templates/history-table.hbs'),

  get: function(template) {
    if (template in this) {
      return this[template];
    } else {
      console.error('Failed to load template: ' + template);
    }
  }

};
