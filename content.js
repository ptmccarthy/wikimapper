// Simple one-time messaging script for getting document.referer
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		data = { 	title: document.title,
					url: document.URL,
					ref: document.referrer
				};
		if (request.greeting == "wikimapper")
			sendResponse(data);
	});
