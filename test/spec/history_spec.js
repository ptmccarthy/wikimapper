describe("history", function() {
  beforeEach(function(done) {
    done();
  });

  it("expects to send a message requesting localStorage", function(done) {
    spyOn(chrome.runtime, "sendMessage").and.callThrough();
    require(['../js/history'], function() {
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({payload: "localStorage"}, jasmine.any(Function));
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

  it("expects to format the unix timestamp to a human readable date", function(done) {
    require(['../js/history'], function() {
        var d = new Date();
        d.setTime(1388563740000);
        expect(formatDate(d)).toBe("1/1/2014 at 00:09");
        done();
    });
  });

  it("expects clear history to send 'clear' message", function(done) {
    spyOn(chrome.runtime, "sendMessage");
    require(['../js/history'], function() {
      clearHistory();
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({payload: "clear"}, jasmine.any(Function));
      done();
    });
  });

});