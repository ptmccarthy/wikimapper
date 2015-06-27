/**
 * Tree Rendering View
 */

'use strict';

// External
var Backbone = require('backbone');
var d3 =       require('d3');

module.exports = Backbone.View.extend({

  defaults: {
    margin: {
      top: 20,
      right: 20,
      bottom: 20,
      left: 20
    }
  },

  render: function() {
    console.log('Rendering d3 child view.');
    this.draw();
    
    return this;
  },

  draw: function() {
    var margin = this.defaults.margin;
    this.width = this.$el.width() - margin.left - margin.right;
    this.height = this.$el.height() - margin.top - margin.bottom;

    d3.select(this.el).append('p').text('hello world');
  }

});
