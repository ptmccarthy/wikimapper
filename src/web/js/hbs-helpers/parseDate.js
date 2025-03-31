import moment from 'moment';

export default function(value) {
  // Note: In this format, we're not using options.fn
  // The value is passed directly to the helper
  const timestamp = parseInt(value, 10);
  const date = moment.unix(timestamp / 1000);
  return date.format('YYYY/MM/DD') + ' at ' + date.format('HH:mm');
};
