// Script that does the querying and rendering of data
var msg;
var db = openDatabase(
	'WikiMapper',
	'0.1',
	'wikimapper',
	5*1024*1024
);

db.readTransaction(function (tx) {
	tx.executeSql('SELECT * FROM pages ORDER BY date ASC', [], function(tx, results) {
		var len = results.rows.length;
		var i;
		for(i=0; i<len; i++) {
			msg = '<p>' + results.rows.item(i).title + '<br>' +
										results.rows.item(i).url + '<br>' +
										results.rows.item(i).ref +
										'</p>';
			
			document.write(msg);
		}
	})
})

//var storage = chrome.storage.local;
//
//storage.get(['title', 'url', 'ref', 'date'], function(items) {
//	console.log(items.title, items.url, items.ref, items.date);
//})