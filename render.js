// Script that does the querying and rendering of data
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
		var msg = '';
		for(i=0; i<len; i++) {
			msg += '<p><a href="' + results.rows.item(i).url + '">' +
										results.rows.item(i).title + '</a><br>' +
										'Referred From: <a href="' +
										results.rows.item(i).ref + '">' +
										results.rows.item(i).ref +
										'</a></p>';
		}
		console.log(msg);
		document.getElementById('results').innerHTML=msg;
	})
})

//var storage = chrome.storage.local;
//
//storage.get(['title', 'url', 'ref', 'date'], function(items) {
//	console.log(items.title, items.url, items.ref, items.date);
//})