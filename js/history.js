var localStorage;
var date = new Date();

chrome.runtime.sendMessage({payload: "localStorage"}, function(response) {
	localStorage = response;
})
/*
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
*/
function displayHistory() {
	for (var key in localStorage) {
		var session = JSON.parse(localStorage[key]);
		date.setTime(session.data.date);
		$("#history-content").prepend('<div class="history-item">' + formatDate(date) + ' - '
							+ session.data.url + '</div><div class="load-button" id='+key+'>View</div>');
	}
	// once all items are populated, begin load-button listener
	viewHistoryItem();
}

function clearHistory() {
	$("#clear-all").click(function() {
		$("#clear-all-confirm").show();
		$("#all-yes").click(function() {
			chrome.runtime.sendMessage({payload: "clear"}, function(response) {
				$("#clear-all").html(response);
				$("#history-content").html(response);
				$("#clear-all-confirm").hide();
			})
		})

		$("#all-no").click(function() {
			$("#clear-all-confirm").hide();
		})
	})
}

function clearCurrent(key) {
	$("#clear-current").click(function() {
		$("#clear-current-confirm").show();
		$("#current-yes").click(function() {
			chrome.runtime.sendMessage({payload: "delete", key: key}, function(response) {
				$("#clear-current").html(response);
				$("#viz-body").hide();
				$("#history-content").html(response);
				$("#history-content").show();
				$("#clear-current-confirm").hide();
			});
		})
		$("#current-no").click(function() {
			$("#clear-current-confirm").hide();
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
		var key = $(this).attr('id');
		chrome.runtime.sendMessage({payload: "set", key: key}, function(response) {
			$("#history-content").hide();
			$("#clear-current").show();
			clearCurrent(key);
			$("#back").show();
			$("#viz-body").load("tree.html");
			$("#viz-body").show();
		})
	})
}

// take date object and return it as a string of format "MM/DD/YYYY at HH:MM"
function formatDate(date) {
	return date.getMonth() + '/' + date.getDate()  + '/' + date.getFullYear() + ' at ' +
		date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes();
}

$(document).ready(function() {
	displayHistory();
	clearHistory();
	goBack();
})
