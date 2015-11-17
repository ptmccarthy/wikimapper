'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'browserify', 'jasmine'],

    files: [
      {
        pattern: './test/**/*spec.js',
        watched: false,
        included: true,
        served: true
      },
      {
        pattern: './src/**/*.js',
        watched: true,
        included: false,
        served: false
      }
    ],

    // proxy the img directory to avoid 404 warnings during test runs
    proxies: {
      '/img': './src/web/img'
    },

    reporters: [ 'dots' ],

    preprocessors: {
      'test/**/*spec.js': [ 'browserify' ],
      'test/stubs/**/*.js': [ 'browserify' ]
    },

    browsers: [ 'PhantomJS' ],

    logLevel: 'LOG_DEBUG',

    // browserify config
    browserify: {
      debug: true,
      transform: [ 'hbsfy' ]
    }

  });
};
