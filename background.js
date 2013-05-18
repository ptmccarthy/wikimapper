
var tabStatus = {};
var data = {};
var nodeIndex = 1;

/* 
json = {
	"id" : , "node00"
	"name" : "name",
	"data" : {},
	"children" : [ array of child nodes ]
	}
}
*/

function getPageData(tabId, openerId) {
	chrome.tabs.sendMessage(tabId, {greeting: "wikimapper"}, function(response) {
		var page = { data: {} };
		page.name = response.title;
		page.data.url = response.url;
		page.data.ref = response.ref;
		page.data.date = response.date;
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
	})
}

function recordRootNode(page, tabId) {
	console.log('recording root node');
	page.nodeId = nodeIndex;
	console.log(page.nodeId);
	setTabStatus(tabId, page);
	data = page;
	console.log(data);
	nodeIndex += 1;
}

function recordChildNode(page, tabId, refTabId) {
	console.log('recording child node');
	page.nodeId = nodeIndex;

	var parentNodeId = tabStatus[refTabId].nodeId;
	console.log(parentNodeId);

	parentNode = findNode(data, parentNodeId);
	console.log(parentNode);

	parentNode.children.push(page);
	console.log(JSON.stringify(data));

	nodeIndex += 1;
	setTabStatus(tabId, page);
}

function setTabStatus(tabId, page) {
	tabStatus[tabId] = page;
	console.log(tabStatus);
}

function findNode(tree, nodeId) {
   if (tree.nodeId === nodeId) return tree;

   var result;
   for (var i = 0; i < tree.children.length; i++) {
      result = findNode(tree.children[i], nodeId);
      if (result !== undefined) return result;
   }
}

chrome.webNavigation.onCompleted.addListener(function(details) {
	console.log('newtab' + details.tabId);
	chrome.tabs.get(details.tabId, function(tab) {
		console.log('opener' + tab.openerTabId);
		getPageData(details.tabId, tab.openerTabId);
	})
}, {url: [{ hostSuffix: 'wikipedia.org' }]})