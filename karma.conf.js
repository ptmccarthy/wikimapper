'use strict';

module.exports = function(karma) {
  karma.set({

    frameworks: [ 'browserify', 'jasmine'],

    files: [
      './test/**/*spec.js'
    ],

    // proxy the img directory to avoid 404 warnings during test runs
    proxies: {
      '/img': './src/web/img'
    },

    reporters: [ 'dots' ],

    preprocessors: {
      'test/**/*spec.js': [ 'browserify' ]
    },

    browsers: [ 'PhantomJS' ],

    logLevel: 'LOG_DEBUG',

    // browserify config
    browserify: {
      debug: true,
      // the bundle delay prevents the new bundle from triggering a second test run
      bundleDelay: 1000,
      transform: [ 'hbsfy', 'node-lessify' ]
    }

  });
};
