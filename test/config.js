require.config({
	baseUrl: "../",
	paths: {
		d3: "../lib/d3.v3.min",
	}
});

require(["d3"], function(d3) {
	console.log("d3 version " + d3.version);
});

console.log('config.js loaded');
