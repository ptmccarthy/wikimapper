'use strict';

// External Dependencies
var Backbone = require('backbone'),
    $ =        require('jquery');

// Internal Dependencies
var templates = require('wikimapper/templates'),
    resources = require('wikimapper/resources');

Backbone.$ = $;

module.exports = Backbone.View.extend({

  template: templates.get('navigation'),

  initialize: function(options) {
    if (options.title) {
      this.title = options.title;
    }
  },

  render: function() {
    this.$el.html(this.template({
      title: resources.appName
    }));
  }

});
