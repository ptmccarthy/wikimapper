
describe("tree visualization", function() {
  it("expects d3 to be available", function(done) {
    require(['../js/tree'], function(tree) {
      expect(d3.version).toBe('3.4.1');
      done();
    });
  });
});