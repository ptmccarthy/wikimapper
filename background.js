// Listens for URL changes of any tabs and if wikipedia gathers info from them.

// store wikipedia title tag to strip out later
var storage = chrome.storage.local;
var titleTag = ' - Wikipedia, the free encyclopedia';


function checkForWikiUrl(tabId, changeInfo, tab) {
	if (tab.url.indexOf('wikipedia.org') > -1 && tab.status == 'complete') {
		requestPageData(tab.id, function(response) {
			recordPageData(response);
		});
	}
}

function requestPageData(tabId, callback) {
	chrome.tabs.sendMessage(tabId, {greeting: "wikimapper"}, function(response) {
			callback(response);
	})
}

function recordPageData(response) {
	var page = {};
	page.title = response.title.replace(titleTag, "");
	page.url = response.url;
	page.ref = response.ref;
	console.log(page);
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForWikiUrl);