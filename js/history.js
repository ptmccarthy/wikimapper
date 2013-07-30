var localStorage;
var date = new Date();

chrome.runtime.sendMessage({payload: "localStorage"}, function(response) {
	localStorage = response;
})

function displayHistory() {
	for (var key in localStorage) {
		var session = JSON.parse(localStorage[key]);
		date.setTime(key);

		$("#history").prepend(	'<div class="history-item">' + date + ' '
								+ session.name + '</div><div class="load-button" id='+key+'>View</div>');
	}
	// once all items are populated, begin load-button listener
	viewHistoryItem();
}

function clearHistory() {
	$("#clear").click(function() {
		chrome.runtime.sendMessage({payload: "clear"}, function(response) {
			$("#clear").html(response);
			$("#history").html("");
		})
	})
}

function viewHistoryItem() {
	$(".load-button").click(function() {
		chrome.runtime.sendMessage({payload: "load", key: $(this).attr('id')}, function(response) {
			alert(response);
		})
	})
}

$(document).ready(function() {
	displayHistory();
	clearHistory();
})