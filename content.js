// Simple one-time messaging script for getting document.referer
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.greeting == "wikimapper") {
			var referrer = document.referrer;
			if (referrer == "") {
				referrer = 'none';
			}

		var cleanedTitle = document.title.replace(' - Wikipedia, the free encyclopedia', '');

			data = { 	title: cleanedTitle,
								url: document.URL,
								ref: referrer,
								date: Date.now()
							};
			sendResponse(data);
		}
		if (request.greeting == "opener") {
			sendResponse(tab.openerTabId);
		}
	});
