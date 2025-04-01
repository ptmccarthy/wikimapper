import navigation from '../templates/navigation.hbs';
import title from '../templates/title.hbs';
import latest from '../templates/latest.hbs';
import history from '../templates/history.hbs';
import historyItem from '../templates/history-item.hbs';
import historyTable from '../templates/history-table.hbs';

const templates = {
  navigation,
  title,
  latest,
  history,
  historyItem,
  historyTable,

  get: function(template) {
    if (template in this) {
      return this[template];
    } else {
      console.error('Failed to load template: ' + template);
    }
  }
};

export default templates;
