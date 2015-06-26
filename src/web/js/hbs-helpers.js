/**
 * Handlebars Helpers
 */

'use strict';

var Handlebars = require('hbsfy/runtime');
var moment =     require('moment');

Handlebars.registerHelper('parseDate', function(options) {
  var date = moment.unix(options.fn(this)/1000);

  return date.format('YYYY-MM-DD HH:mm');
});
