describe("content", function() {
  beforeEach(function() {
    // stub document.title
    document.title = "Unit Test - Wikipedia, the free encyclopedia";

    spyOn(chrome.runtime, "sendMessage").and.callThrough();
  });

  afterEach(function() {
    document.title = "Jasmine Spec Runner v2.0.0";
  })

  it("expects to send a message", function(done) {
    require(['../content'], function() {
      expect(chrome.runtime.sendMessage).toHaveBeenCalled();
      done();
    });
  });

  it("expects to have a cleaned title", function(done) {
    require(['../content'], function() {
      expect(cleanedTitle).toMatch("Unit Test");
      done();
    });
  });

});

