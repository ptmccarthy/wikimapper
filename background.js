
var tabStatus = {};
var data = {};
var nodeIndex = 1;

/* 
JSON object format:

json = {
	"id" : , "node00"
	"name" : "name",
	"data" : {},
	"children" : [ array of child nodes ]
	}
}
*/

function getPageData(tabId, openerId) {
	var referrerTabId = tabId;
	if (typeof openerId != 'undefined' && openerId != tabId) {
		referrerTabId = openerId;
	}
	console.log('referring tab: ' + referrerTabId);

	chrome.tabs.sendMessage(tabId, {greeting: "wikimapper"}, function(response) {
		var page = { data: {} };
		page.name = response.title;
		page.data.url = response.url;
		page.data.ref = response.ref;
		page.data.date = response.date;
		page.children = [];

		if (page.data.ref.indexOf('wikipedia.org') > -1) {
			recordChildNode(page, tabId, referrerTabId);
		} else {
			recordRootNode(page, tabId);
		}
	})
}

function recordRootNode(page, tabId) {
	console.log('recording root node');
	setTabStatus(tabId, page);

	data = page;
	console.log(data);
	tabStatus[tabId].nodeId = nodeIndex;
	console.log(tabStatus);
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
	tabStatus[tabId] = page;
	console.log(tabStatus);
}

function setTabStatus(tabId, page) {
	tabStatus[tabId] = page;
	console.log(tabStatus);
}

function findNode(tree, nodeId) {
	console.log('tree.nodeId ' + tree.nodeId + ', passed nodeId ' + nodeId);
   if (tree.nodeId === nodeId) return tree;

   var result;
   for (var i = 0; i < tree.children.length; i++) {
      result = findNode(tree.children[i], nodeId);
      if (result !== undefined) return result;
   }
}




chrome.webNavigation.onCompleted.addListener(function(details) {
	var openerId;
	console.log('onCommitted');
	console.log('newtab' + details.tabId);
	chrome.tabs.get(details.tabId, function(tab) {
		console.log('opener' + tab.openerTabId);
		openerId = tab.openerTabId;
		getPageData(details.tabId, openerId);
	})

	//tabStatus[details.tabId] = details.url;
	//console.log(tabStatus);

	

}, {url: [{ hostSuffix: 'wikipedia.org' }]})