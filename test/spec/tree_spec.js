
describe("tree visualization", function() {
	it("expects d3 to be available", function(done) {
		require(['../js/tree', 'lib/d3.v3.min'], function(tree, d3) {
			expect(d3.version).toBe('3.4.1');
			done();
		});
	});
});