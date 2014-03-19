describe("history", function() {
  beforeEach(function(done) {
    spyOn(chrome.runtime, "sendMessage").and.callThrough();
    done();
  });

  it("expects to send a message requesting localStorage", function(done) {
    require(['../js/history'], function() {
      expect(chrome.runtime.sendMessage).toHaveBeenCalled();
      done();
    });
  });

  it("expects to receive a response containing localStorage data", function(done) {
    require(['../js/history'], function() {
      setTimeout(function(){
        expect(JSON.stringify(storage)).toBe(JSON.stringify(localStorage));
        done();
      }, 100);
    })
  });

});