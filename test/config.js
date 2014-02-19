require.config({
	baseUrl: "../",
	
	paths: {
		jquery: "../lib/jquery-2.1.0.min",
		d3: "../lib/d3.v3.min",
	}
});

require(["jquery", "d3"], function($, d3) {
	console.log("jquery version " + $().jquery);
	console.log("d3 version " + d3.version);
});
