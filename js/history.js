var localStorage;
var date = new Date();

chrome.runtime.sendMessage({payload: "localStorage"}, function(response) {
	localStorage = response;
})

function displayHistory() {
	for (var key in localStorage) {
		date.setTime(key);
		$("#history").append("<p>" + date + "<br>" + localStorage[key] + "</p>");
	}
}

$(document).ready(function() {
	displayHistory();
})