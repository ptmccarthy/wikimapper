var cleanedTitle = document.title.replace(' - Wikipedia, the free encyclopedia', '');

var data = { 	title: cleanedTitle,
				url: document.URL,
				ref: document.referrer,
				date: Date.now(),
		};

chrome.runtime.sendMessage({payload: "pageData", pageData: data}, function(response) {
	console.log(response);
});