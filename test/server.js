var app_root = __dirname,
    express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    errorHandler = require('errorhandler');

var app = express()
    .use(express.static(path.join(app_root, '../dist')))
    .use(errorHandler({ dumpExceptions: true, showStack: true }))
    .use(logger('dev'))
    .set('port', 9000);

var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d', app.get('port'));
});
