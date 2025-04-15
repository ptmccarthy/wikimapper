/**
 * Tree Rendering View
 */

// External
import Backbone from 'backbone';
import d3 from 'd3';
import $ from 'jquery';

export default Backbone.View.extend({

  margin: {
    top: 35,
    bottom: 0,
    left: 100,
    right: 0
  },

  initialize: function(options) {
    if (options && options.data) {
      this.data = options.data;
    } else {
      console.error('D3 Tree View initialized without a data object!');
    }

    this.initd3();
  },

  render: function() {
    this.draw();
    return this;
  },

  /**
   * Initialize the d3 tree graph, storing it on the instance of this View.
   */
  initd3: function() {
    const self = this;
    this.width = $(window).width();
    this.height = $(window).height() - this.margin.top;
    this.data.x0 = this.height / 2;
    this.data.y0 = 0;
    this.tree = d3.layout.tree().size([self.height, self.width]);

    this.svg = d3.select(this.el).append('svg')
      .attr('id', 'wikimapper-svg')
      .attr('width', this.width)
      .attr('height', this.height)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',0)');

    // then draw the data
    this.draw(this.data);
  },

  /**
   * (Re)draws the d3 tree graph.
   * @param data - JSON data of the tree or sub-tree to be drawn
   */
  draw: function(data) {
    const self = this;
    const diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
    let i = 0;
    const duration = 500;
    this.lastDepth = this.depth ? this.depth : 0;
    this.depth = 0;

    // Compute the tree layout
    const nodes = this.tree.nodes(this.data).reverse();
    const links = this.tree.links(nodes);

    // Normalize for fixed-depth
    nodes.forEach(function(d) {
      d.y = d.depth * 250;
      if (d.depth > self.depth) {
        self.depth = d.depth;
      }
    });

    // if our new depth is greater, we're growing, resize immediately
    if (this.depth > this.lastDepth) {
      this.resize();
    // otherwise we're shrinking, wait for transition duration to complete before resize
    } else {
      setTimeout(() => this.resize(), duration);
    }

    // Update the nodes
    const node = this.svg.selectAll('g.node')
      .data(nodes, function(d) {
        return d.id || (d.id = ++i);
      });

    // Enter any new nodes at the parent's previous position
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', function() {
        return 'translate(' + data.y0 + ',' + data.x0 + ')';
      });

    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .style('fill', function(d) {
        return !self.isEmpty(d._children) ? 'lightsteelblue' : '#ffffff';
      })
      .on('click', (d) => this.click(d));

    nodeEnter.append('foreignObject')
      .attr('transform', 'translate(-100, 5)')
      .attr('height', 60)
      .attr('width', 200)
      .each(function(d) {
        const div = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
        div.className = 'label';

        const a = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        a.className = 'node';
        a.target = '_blank';
        a.href = d.data.url;
        a.textContent = d.name;

        div.appendChild(a);
        this.appendChild(div);
      });

    // Transition nodes to their new position
    const nodeUpdate = node.transition()
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
    const nodeExit = node.exit().transition()
      .duration(duration)
      .attr('transform', function() {
        return 'translate(' + data.y + ',' + data.x + ')';
      })
      .remove();

    nodeExit.select('circle')
      .attr('r', 1e-6);

    // Update the links
    const link = this.svg.selectAll('path.link')
      .data(links, function(d) {
        return d.target.id;
      });

    // Enter any new links at the parent's previous position
    link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', function() {
        const o = { x: data.x0, y: data.y0 };
        return diagonal({ source: o, target: o });
      });

    // Transition links to their new position
    link.transition()
      .duration(duration)
      .attr('d', diagonal);

    // Transition exiting links to their parent's new position
    link.exit().transition()
      .duration(duration)
      .attr('d', function() {
        const o = { x: data.x, y: data.y };
        return diagonal({ source: o, target: o });
      })
      .remove();

    // Stash the old positions for transition
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  },

  /**
   * Resize the svg element size based on the deepest node currently displayed,
   * Plus any defined right margin.
   */
  resize: function() {
    this.width = 250 + (this.depth * 250) + this.margin.right;
    d3.select(this.el).select('svg').attr('width', this.width);
  },

  /**
   * Handler for clicks on individual nodes, collapses/expands their children.
   * @param d - d3 tree node
   */
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

  /**
   * Test if node.children is undefined or null (i.e., empty)
   * @param d - node.children array
   * @returns {boolean}
   */
  isEmpty: function(d) {
    if (d === undefined || d === null) {
      return true;
    } else {
      return d.length === 0;
    }
  }
});
