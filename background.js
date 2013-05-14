// Listens for URL changes of any tabs and if wikipedia gathers info from them.

// store wikipedia title tag to strip out later
var titleTag = ' - Wikipedia, the free encyclopedia';
var referrer;

function checkForWikiUrl(tabId, changeInfo, tab) {
	if (tab.url.indexOf('wikipedia.org/wiki') > -1 && tab.status == 'complete') {
		// do some stuff
		var page = {};
		page.title = tab.title.replace(titleTag, "");
		page.url = tab.url;

		askForReferer(tab.id);

		page.ref = referrer;
		localStorage.setItem( 'page', JSON.stringify(page));
		console.log( JSON.parse( localStorage.getItem('page') ) );
	}
}

function askForReferer(tabId, changeInfo, tab) {
	chrome.tabs.getSelected(null, function(tab) {
		chrome.tabs.sendMessage(tab.id, {greeting: "referrer"}, function(response) {
			referrer = response.ref;
		})
	})
}

// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(checkForWikiUrl);