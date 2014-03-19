(function() {
  'use strict';


require.config({
    baseUrl: "..",
    
    paths: {
      'jasmine': 'test/lib/jasmine-2.0.0/jasmine',
      'jasmine-html': 'test/lib/jasmine-2.0.0/jasmine-html',
      'boot': 'test/lib/jasmine-2.0.0/boot',
      'jquery': 'lib/jquery-2.1.0.min',
      'd3': 'lib/d3.v3.min',
      'alertify': 'lib/alertify.min'
    },

    shim: {
      'jasmine': {
        exports: 'jasmine'
      },
      'jasmine-html': {
        deps: ['jasmine'],
        exports: 'jasmine'
      },
      'boot': {
        deps: ['jasmine-html'],
        exports: 'jasmine'
      }
    }
  });

  var specs = [
    'test/spec/background_spec',
    'test/spec/content_spec',
    'test/spec/history_spec',
    'test/spec/tree_spec'
  ];

  require(['boot'], function() {

    require(specs, function() {
      window.onload();
    });
  });


})();
