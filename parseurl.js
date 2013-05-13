// Listens for URL changes of any tabs and if wikipedia gathers info from them.

function checkForWikiUrl(tabId, changeInfo, tab)
	if (tab.url.indexOf('wikipedia.org/wiki') > -1) {
		// do some yet-undefined stuff
	}
};

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForWikiUrl);