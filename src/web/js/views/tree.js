/**
 * Tree Rendering View
 */

'use strict';

// External
var Backbone = require('backbone');
var d3 =       require('d3');
var $ =        require('jquery');
var _ =        require('lodash');

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

    //this.draw();
    this.initd3();
    return this;
  },

  initd3: function() {
    this.width = $(window).width();
    this.height = $(window).height();
    this.data.x0 = this.height / 2;
    this.data.y0 = 0;
    
    this.svg = d3.select(this.el).append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g');

    this.draw();
  },

  draw: function() {
    var self = this;
    var tree = d3.layout.tree().size([self.height, self.width]);
    var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
    var i = 0;
    var duration = 750;
    var depth = 0;

    // Compute the tree layout
    var nodes = tree.nodes(this.data).reverse();
    var links = tree.links(nodes);

    // Normalize for fixed-depth
    nodes.forEach(function(d) {
      d.y = d.depth * 250;
      if (d.depth > depth) { depth = d.depth; }
    });

    // Update the nodes
    var node = this.svg.selectAll('g.node')
      .data(nodes, function(d) {
        return d.id || (d.id = ++i);
      });

    // Enter any new nodes at the parent's previous position
    var nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', function() {
        return 'translate(' + self.data.y0 + ',' + self.data.x0 + ')';
      });

    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .style('fill', function(d) {
        return !self.isEmpty(d._children) ? 'lightsteelblue' : '#ffffff';
      })
      .on('click', _.bind(self.click, self));

    nodeEnter.append('foreignObject')
      .attr('transform', 'translate(-100, 5)')
      .attr('height', 60)
      .attr('width', 200)
      .html(function(d) {
        return '<div class="label"><a class="node" target="_blank" href="' + d.data.url + '">' + d.name + '</a></div>';
      });

    // Transition nodes to their new position
    var nodeUpdate = node.transition()
      .duration(duration)
      .attr('transform', function(d) {
        return 'translate(' + d.y + ',' + d.x + ')';
      });

    nodeUpdate.select('circle')
      .attr('r', 4.5)
      .style('fill', function(d) {
        return !self.isEmpty(d._children) ? 'lightsteelblue' : '#ffffff';
      });

    // Transition exiting nodes to the parent's new position
    var nodeExit = node.exit().transition()
      .duration(duration)
      .attr('transform', function() {
        return 'translate(' + self.data.y + ',' + self.data.x + ')';
      });

    nodeExit.select('circle')
      .attr('r', 1e-6);

    // Update the links
    var link = this.svg.selectAll('path.link')
      .data(links, function(d) {
        return d.target.id;
      });

    // Enter any new links at the parent's previous position
    link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', function() {
        var o = { x: self.data.x0, y: self.data.y0 };
        return diagonal({ source: o, target: o });
      });

    // Transition links to their new position
    link.transition()
      .duration(duration)
      .attr('d', diagonal);

    // Transition exiting nodes to their parent's new position
    link.exit().transition()
      .duration(duration)
      .attr('d', function() {
        var o = { x: self.data.x0, y: self.data.y0 };
        return diagonal({ source: o, target: o });
      })
      .remove();

    // Stash the old positions for transition
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    d3.select(self.frameElement).style('height', '800px');
    d3.select('svg').attr('width', 250 + depth * 250);

  },

  click: function(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    this.draw(d);
  },

  isEmpty: function(d) {
    if (d === undefined || d === null) {
      return true;
    } else {
      return d.length === 0;
    }
  }
});
