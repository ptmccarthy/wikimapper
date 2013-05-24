function init() {

var json;
chrome.runtime.sendMessage({"greeting": "json"}, function(response) {
    initGraph(response);
});

function initGraph(root) {

	var width = 1200,
	    height = 700;

	var cluster = d3.layout.cluster()
	    .size([height, width - 160]);

	var diagonal = d3.svg.diagonal()
	    .projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select("body").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .attr("transform", "translate(40,0)");

  var nodes = cluster.nodes(root),
      links = cluster.links(nodes);

  var link = svg.selectAll(".link")
      .data(links)
    .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = svg.selectAll(".node")
      .data(nodes)
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

  node.append("circle")
      .attr("r", 4.5);

  node.append("text")
      .attr("dx", function(d) { return d.children ? 40 : 100; })
      .attr("dy", 18)
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.name; });

	d3.select(self.frameElement).style("height", height + "px");

	}
}

chrome.tabs.onUpdated.addListener(function(details) {
  init();
});