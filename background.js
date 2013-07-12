var tabStatus = {};
var data = {};
var nodeIndex = 1;

// required JSON object structure for using with JIT and d3.js
/* 
json = {
	"id" : , "node00"
	"name" : "name",
	"data" : {},
	"children" : [ array of child nodes ]
	}
}
*/

// function to request page data from a tab and record it appropriately
function savePageData(pageData) {
	var page = { data: {} };
	var tabId = pageData.tabId;
	var openerId = pageData.openerId;

	page.name = pageData.title;
	page.data.url = pageData.url;
	page.data.ref = pageData.ref;
	page.data.date = pageData.date;
	page.children = [];

	console.log('tabId' + tabStatus[tabId]);
	console.log('openerId' + tabStatus[openerId]);
	// if both tabs are not in tabStatus, it is a root page
	if (tabStatus[tabId] == undefined && tabStatus[openerId] == undefined) {
		recordRootNode(page, tabId);
	}
	// if tabId is in tabStatus, then it is the same tab
	else if (tabStatus[tabId] != undefined) {
		recordChildNode(page, tabId, tabId);
	// if openerId is in tabStatus, then it is a new tab
	}
	else if (tabStatus[openerId] != undefined) {
		recordChildNode(page, tabId, openerId);
	}
}

// function to record a new root node
function recordRootNode(page, tabId) {
	console.log('recording root node');
	page.id = nodeIndex;
	setTabStatus(tabId, page);
	data = page;
	localStorage.setItem(page.data.date, JSON.stringify(data));
	nodeIndex += 1;
}

// function to record a new child node
function recordChildNode(page, tabId, refTabId) {
	console.log('recording child node');
	// assign page an id from nodeIndex counter
	page.id = nodeIndex;
	// lookup parent node id from tabStatus, then find the parent node in the tree
	var parentNodeId = tabStatus[refTabId].id;
	parentNode = findNode(data, parentNodeId);
	// and update the children of the parent
	parentNode.children.push(page);
	localStorage.setItem(data.data.date, JSON.stringify(data));
	nodeIndex += 1;
	setTabStatus(tabId, page);
}

// function to update the tab status object with the page contents of tabId
function setTabStatus(tabId, page) {
	tabStatus[tabId] = page;
	console.log(tabStatus);
}


// recursively look through the JSON tree for the specified node and return it
function findNode(tree, nodeId) {
   if (tree.id === nodeId) return tree;

   var result;
   for (var i = 0; i < tree.children.length; i++) {
      result = findNode(tree.children[i], nodeId);
      if (result !== undefined) return result;
   }
}

function clearHistory() {
	tabStatus = {};
	data = {};
	localStorage.clear();
}

// message listener
chrome.runtime.onMessage.addListener(function(request, sender, response) {
	// wikipedia page data sent from injected content script
	if (request.payload == "pageData") {
		chrome.tabs.get(sender.tab.id, function(tab) {
			request.pageData.openerId = tab.openerTabId;
			request.pageData.tabId = sender.tab.id;
			console.log(request.pageData);
			savePageData(request.pageData);
		});
	}
	// visualization requesting json tree data
	if (request.greeting == "json")
		response(data);
	// history page requesting localStorage object
	if (request.payload == "localStorage") {
		response(localStorage);
	}
	if (request.payload == "clear") {
		clearHistory();
		response("History Cleared");
	}
})

// listener for when the user clicks on the Wikimapper button
chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.create({'url': chrome.extension.getURL('html/index.html')}, function(tab) {
  });
});