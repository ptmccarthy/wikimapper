'use strict';

module.exports = function(karma) {
  karma.set({
    frameworks: ['browserify', 'jasmine'],

    files: [
      {
        pattern: './test/spec/chrome/chrome-mock.js',
        watched: false,
        included: true,
        served: true
      },
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

    reporters: ['dots', 'kjhtml'],

    preprocessors: {
      'test/**/*spec.js': ['browserify'],
      'test/stubs/**/*.js': ['browserify']
    },

    browsers: ['ChromeHeadless'],

    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: [
          '--no-sandbox',
          '--headless',
          '--disable-gpu',
          '--remote-debugging-port=9222'
        ]
      }
    },

    logLevel: karma.LOG_INFO,

    // browserify config
    browserify: {
      debug: true,
      transform: ['hbsfy']
    },

    // Continuous Integration mode
    singleRun: true,

    // How long will Karma wait for a message from a browser before disconnecting from it (in ms)
    browserNoActivityTimeout: 60000,

    // Disable the deprecated preprocessor API warning
    client: {
      clearContext: false
    }
  });
};
