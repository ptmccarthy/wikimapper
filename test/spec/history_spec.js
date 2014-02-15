describe("history", function() {
	beforeEach(function() {
		chrome = {
			runtime: {
				sendMessage: function(){},
			}
		}

		// retrieve fake localStorage data from support files
		// note: do this synchronously
		var localStoarge = (function () {
	    var localStorage = null;
	    $.ajax({
	        'async': false,
	        'global': false,
	        'url': 'support/localStorage.json',
	        'dataType': "json",
	        'success': function (data) {
	            localStorage = data;
	        }
	    });
	    return localStorage;
		})(); 

		spyOn(chrome.runtime, "sendMessage").and.returnValue(localStorage);
	});

	it("expects to send a message requesting localStorage", function(done) {
		require(['../js/history'], function() {
			expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({payload: "localStorage"}, jasmine.any(Function));
			done();
		});
	});

	it("expects to receive a response containing localStorage data", function(done) {
		require(['../js/history'], function() {
			expect(localStorage).toBe(localStorage);
			done();
		})
	});

});