describe("content", function() {
	beforeEach(function() {
		document.title = "Unit Test - Wikipedia, the free encyclopedia";

		chrome = {
			runtime: {
				sendMessage: function(){},
			}
		}

		spyOn(chrome.runtime, "sendMessage");
	});

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

