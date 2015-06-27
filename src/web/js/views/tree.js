/**
 * Tree Rendering View
 */

'use strict';

// External
var Backbone = require('backbone');
var d3 =       require('d3');

module.exports = Backbone.View.extend({

  initialize: function(options) {
    if (options && options.data) {
      this.data = options.data;
    } else {
      console.error('D3 Tree View initialized without a data object!');
    }
  },

  render: function() {
    console.log('Rendering d3 child view.');
    this.draw();

    return this;
  },

  draw: function() {
    d3.select(this.el).append('p').text('hello world');


  }

});
