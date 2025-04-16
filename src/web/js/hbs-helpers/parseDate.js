import dayjs from 'dayjs';
import Handlebars from 'handlebars/runtime';

export default function(value) {
  // Note: In this format, we're not using options.fn
  // The value is passed directly to the helper
  const timestamp = parseInt(value, 10);
  const date = dayjs.unix(timestamp / 1000);
  return date.format('YYYY/MM/DD') + ' at ' + date.format('HH:mm');
};

// Register the helper with Handlebars
Handlebars.registerHelper('parseDate', function(value) {
  const timestamp = parseInt(value, 10);
  const date = dayjs.unix(timestamp / 1000);
  return date.format('YYYY/MM/DD') + ' at ' + date.format('HH:mm');
});
