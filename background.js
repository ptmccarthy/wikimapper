// Listens for URL changes of any tabs and if wikipedia gathers info from them.

// store wikipedia title tag to strip out later
var titleTag = ' - Wikipedia, the free encyclopedia';
var prevPK;

// create database if does not already exist
var db = window.openDatabase(
	'WikiMapper',			// db name
	'0.1',						// version
	'wikimapper',			// description
	5*1024*1024			// db size in bytes
);

// create table if does not already exist
db.transaction(function (tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS PAGES (id INTEGER NOT NULL PRIMARY KEY, title, url, ref, date)');
});


function checkIsWikiRoot(details) {
	requestPageData(details.tabId, function(response) {
		recordPageData(response);
	});
}


function requestPageData(tabId, callback) {
	chrome.tabs.sendMessage(tabId, {greeting: "wikimapper"}, function(response) {
			callback(response);
	})
}

function recordPageData(response) {
	var page = response;
	page.title = page.title.replace(titleTag, "");
	db.transaction(function (tx, results) {
		tx.executeSql('INSERT INTO PAGES (title,url,ref,date) VALUES (?,?,?,?)',
									[page.title, page.url, page.ref, page.date], function(tx, results) {
										prevPK = results.insertId;
										console.log(prevPK);
		})
	})	
}

// When a new page loads, check to see if it is Wikipedia, and if so, record page data
chrome.webNavigation.onCompleted.addListener(function(details) {
	checkIsWikiRoot(details);
	console.log('onCOmpleted event fired');
}, {url: [{ hostSuffix: 'wikipedia.org'}]});
