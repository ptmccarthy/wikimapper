// Simple one-time messaging script for getting document.referer
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		if (request.greeting == "wikimapper")
			data = { 	title: document.title,
								url: document.URL,
								ref: document.referrer
							};
			sendResponse(data);
	});
