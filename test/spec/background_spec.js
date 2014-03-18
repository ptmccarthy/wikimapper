describe("background", function() {

  beforeEach(function() {
    spyOn(chrome.runtime.onMessage, "addListener").and.callThrough();
    spyOn(chrome.webNavigation.onCommitted, "addListener").and.callThrough();
    spyOn(chrome.browserAction.onClicked, "addListener").and.callThrough();
  });

  it("expects to set up event listeners", function(done) {
    require(['../background'], function() {
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(chrome.webNavigation.onCommitted.addListener).toHaveBeenCalled();
      expect(chrome.browserAction.onClicked.addListener).toHaveBeenCalled();
      done();
    });
  });

  it("expects to create necessary data structures", function(done) {
    require(['../background'], function() {
      expect(sessions == []);
      expect(tabStatus == {});
      expect(selectedTree == {});
      done();
    })
  });

});
