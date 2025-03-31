/**
 * History Item View
 */

// External
import Backbone from 'backbone';
import svgCrowbar from '../../lib/svg-crowbar';

// Internal
import enums from '../enums';
import templates from '../templates';
import ViewState from '../models/view-state';
import TreeView from './tree';

export default Backbone.View.extend({

  template: templates.get('historyItem'),

  events: {
    'click #back-to-history': 'onGoBack',
    'click #export-to-svg': 'exportSVG',
    'click #export-to-png': 'exportPNG'
  },

  initialize: function(options) {
    if (options && options.session) {
      this.session = options.session;
    } else {
      console.error('History Item View initialized without a session object!');
    }

    ViewState.setNavState('history', enums.nav.active);
  },

  render: function() {
    this.$el.html(this.template({
      tree: this.session.get('tree')
    }));

    this.d3View = new TreeView({
      el: this.$('#viz'),
      data: this.session.get('tree')
    });

    this.d3View.render();
  },

  onGoBack: function() {
    Backbone.history.history.back();
  },

  exportSVG: function() {
    svgCrowbar();
  },

  exportPNG: function() {
    const svg = document.getElementById('wikimapper-svg');
    const scale = 1.5;

    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = svg.clientWidth * scale;
    canvas.height = svg.clientHeight * scale;

    // Create a new Image object
    const img = new Image();
    img.crossOrigin = 'anonymous';

    // Clone the SVG to avoid modifying the original
    const svgClone = svg.cloneNode(true);

    // Get all stylesheets from the document
    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          // Skip stylesheets we can't access (cross-origin)
          return '';
        }
      })
      .filter(Boolean)
      .join('\n');

    // Create a style element with all the styles
    const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    styleElement.textContent = styles;

    // Add the style element to the SVG
    svgClone.insertBefore(styleElement, svgClone.firstChild);

    // Add necessary attributes to the SVG
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    svgClone.setAttribute('version', '1.1');

    // Convert SVG to data URL with proper encoding
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const encodedSvg = encodeURIComponent(svgData);
    const url = `data:image/svg+xml;charset=utf-8,${encodedSvg}`;

    img.onload = function() {
      // Draw white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the SVG
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      try {
        // Create download link
        const link = document.createElement('a');
        link.download = 'wikimapper.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (e) {
        console.error('Error creating PNG:', e);
        // Fallback: try to save as SVG if PNG export fails
        const svgLink = document.createElement('a');
        svgLink.download = 'wikimapper.svg';
        svgLink.href = url;
        svgLink.click();
      }
    };

    img.onerror = function(error) {
      console.error('Error generating PNG:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        svg: svg
          ? {
              tagName: svg.tagName,
              id: svg.id,
              className: svg.className,
              dimensions: {
                width: svg.clientWidth,
                height: svg.clientHeight
              }
            }
          : null
      });
    };

    img.src = url;
  }

});
