// Script that does the querying and rendering of data

var db = openDatabase(
	'WikiMapper',
	'0.1',
	'wikimapper',
	5*1024*1024
);

db.readTransaction(function (tx) {
	tx.executeSql('SELECT * FROM pages', [], function(tx, results) {
		var len = results.rows.length;
		var i;
		for(i=0; i<len; i++) {
			console.log("Title: " + results.rows.item(i).title +
									" URL: " + results.rows.item(i).url +
									" Referer: " + results.rows.item(i).ref +
									" UTC: " + results.rows.item(i).date);
		}
	})
})

//var storage = chrome.storage.local;
//
//storage.get(['title', 'url', 'ref', 'date'], function(items) {
//	console.log(items.title, items.url, items.ref, items.date);
//})