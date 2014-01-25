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
							+ session.name + '<div class="load-button" id='+key+'>View</div>' + '</div>');
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
				$("#history").load("history.html");
				$("#viz-body").hide();				
			});
		})
		$("#current-no").click(function() {
			$("#clear-current-confirm").hide();
		})
	})
}

function goBack() {
	$("#back").click(function() {
		$("#history").load("history.html");
		$("#viz-body").hide();
		$("#back").hide();
	})
}

function viewHistoryItem() {
	$(".load-button").click(function() {
		var key = $(this).attr('id');
		chrome.runtime.sendMessage({payload: "set", key: key}, function(response) {
			$("#clear-current").show();
			clearCurrent(key);
			$("#viz-body").load("tree.html");
			$("#history-content").hide();
			$("#viz-body").show();
			$("#back").show();
		})
	})
}

// take date object and return it as a string of format "MM/DD/YYYY at HH:MM"
function formatDate(date) {
	// getMonth returns zero-based index of month, so need +1
	month = date.getMonth()
	month += 1;

	return month + '/' + date.getDate()  + '/' + date.getFullYear() + ' at ' +
		date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes();
}

$(document).ready(function() {
	displayHistory();
	clearHistory();
	goBack();
})
