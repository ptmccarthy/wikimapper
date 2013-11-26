function init() {

	chrome.runtime.sendMessage({"payload": "load"}, function(response) {
		if (typeof(response.data) != 'undefined') {
			initGraph(response);
		} else {
			$("#null-message").load("../html/intro.html");
		}
	});

}

function initGraph(json) {

	var width = 1000,
		height = 800;

	var tree = d3.layout.tree()
		.size([height, width - 200]);

	var diagonal = d3.svg.diagonal()
		.projection(function(d) { return [d.y, d.x]; });

	var svg = d3.select("#viz-body").append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(40,0)");

	var nodes = tree.nodes(json),
		links = tree.links(nodes);

	var link = svg.selectAll("path.link")
		.data(links)
		.enter().append("path")
		.attr("class", "link")
		.attr("d", diagonal);

	var node = svg.selectAll("g.node")
		.data(nodes)
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

	node.append("circle")
		.attr("r", 4.5);

	node.append("text")
		.attr("dx", -5)
		.attr("dy", 14)
		.attr("text-anchor", "start")
		.text(function(d) { return d.name; });

	d3.select(self.frameElement).style("height", height + "px");

}

function calculateSizes(json) {
	// To do
}

init();
