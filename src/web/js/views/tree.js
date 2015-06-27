/**
 * Tree Rendering View
 */

'use strict';

// External
var Backbone = require('backbone');
var d3 =       require('d3');

module.exports = Backbone.View.extend({

  render: function() {
    console.log('Rendering d3 child view.');
    this.draw();

    return this;
  },

  draw: function() {
    d3.select(this.el).append('p').text('hello world');
  }

});
