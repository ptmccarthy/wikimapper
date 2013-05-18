	// Simple one-time messaging script for getting document.referer
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.greeting == "wikimapper") {

		var cleanedTitle = document.title.replace(' - Wikipedia, the free encyclopedia', '');

			data = { 	title: cleanedTitle,
								url: document.URL,
								ref: document.referrer,
								date: Date.now()
							};
			sendResponse(data);
		}
		if (request.greeting == "opener") {
			sendResponse(tab.openerTabId);
		}
	});