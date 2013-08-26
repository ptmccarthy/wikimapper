var localStorage;
var date = new Date();

chrome.runtime.sendMessage({payload: "localStorage"}, function(response) {
	localStorage = response;
})

function displayHistory() {
	for (var key in localStorage) {
		var session = JSON.parse(localStorage[key]);
		date.setTime(key);
		$("#history-content").prepend('<div class="history-item">' + formatDate(date) + ' - '
								+ session.name + '</div><div class="load-button" id='+key+'>View</div>');
	}
	// once all items are populated, begin load-button listener
	viewHistoryItem();
}

function clearHistory() {
	$("#clear-all").click(function() {
		chrome.runtime.sendMessage({payload: "clear"}, function(response) {
			$("#clear-all").html(response);
			$("#history-content").html(response);
		})
	})
}

function goBack() {
	$("#back").click(function() {
		$("#viz-body").hide();
		$("#back").hide();
		$("#history").load("history.html");
	})
}

function viewHistoryItem() {
	$(".load-button").click(function() {
		chrome.runtime.sendMessage({payload: "set", key: $(this).attr('id')}, function(response) {
			$("#history-content").hide();
			// commented out for later implementation
			// $("#clear-current").show();
			$("#back").show();
			$("#viz-body").load("cluster.html");
			$("#viz-body").show();
		})
	})
}

function formatDate(date) {
	return date.getMonth() + '/' + date.getDate()  + '/' + date.getFullYear() + ' at ' + date.getHours() + ':' + date.getMinutes();
}

$(document).ready(function() {
	displayHistory();
	clearHistory();
	goBack();
})