// Listens for URL changes of any tabs and if wikipedia gathers info from them.

// store wikipedia title tag to strip out later
var titleTag = ' - Wikipedia, the free encyclopedia';

function checkForWikiUrl(tabId, changeInfo, tab) {
	if (tab.url.indexOf('wikipedia.org') > -1 && tab.status == 'complete') {
		requestPageData();
	}
}

function requestPageData() {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {greeting: "wikimapper"}, function(response) {
			console.log(response.title);
			console.log(response.url);
			console.log(response.ref);

		})
	})
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForWikiUrl);