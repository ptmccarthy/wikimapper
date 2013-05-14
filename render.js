// Script that does the querying and rendering of data

var storage = chrome.storage.local;

storage.get(['title', 'url', 'ref'], function(items) {
	console.log(items.title, items.url, items.ref);
})