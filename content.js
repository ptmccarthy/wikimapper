// Simple one-time messaging script for getting document.referer

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		console.log(sender.tab ?
					"from a content script: " + sender.tab.url :
					"from the extension");
		if (request.greeting == "referrer")
			sendResponse({ref: document.referrer});
			console.log("sent message " + document.referrer);
	});