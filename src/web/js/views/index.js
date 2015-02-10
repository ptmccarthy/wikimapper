'use strict';

// External Dependencies
var Backbone = require('backbone'),
    $ =        require('jquery'),
    _ =        require('lodash');

// Internal Dependencies
var templates = require('wikimapper/templates');

Backbone.$ = $;

module.exports = Backbone.View.extend({

  template: templates.get('index'),

  init: function() {
    console.log(_.now());
  },

  render: function() {
    this.$el.html(this.template({
      title: 'WikiMapper'
    }));
  }

});
