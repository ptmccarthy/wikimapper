var sessions = [];
var tabStatus = {};
var data = {};
var selectedTree = {};
// required JSON object structure for using with JIT and d3.js
/* 
json = {
	"id" : , "node00",
	"name" : "name",
	"data" : {},
	"children" : [ array of child nodes ]
	}
}
*/

// Session Handler
// take in event commitData, direct it to the correct session
function sessionHandler(commitData) {
	var session = findSessionOf(commitData);

	createPageObject(session, commitData, function(page) {
		if (page.id == 1) {
			recordRoot(page);
		} else {
			recordChild(page);	
		}
	});
}

// Session Finder
// does logic to determine which wikipedia 'session' the
// navigation event's commitData belongs to.
// creates new session if needed
// returns id (timestamp) and parentNode of session object
function findSessionOf(commitData) {
	var ret = {	"id": "",
				"parentNode": "",
			}
	var parentNode;
	sessions.forEach(function(session) {
		if (session.tabs.indexOf(commitData.tabId) >= 0) {
			ret.id = session.id;
			ret.parentNode = tabStatus[commitData.tabId].id;
		}
		else if(commitData.parentId !== undefined) {
			var index = session.tabs.indexOf(commitData.parentId)
			if (index >= 0) {
				ret.id = session.id;
				ret.parentNode = tabStatus[commitData.parentId].id;
				session.tabs.push(commitData.tabId);
			}
		}		
	})

	if (ret.id != "") {
		return ret;
	}
	else {
		return createNewSession(commitData);
	}
}

// Create New Session
// make a new session object and assign it an ID from its timestamp
// return the id of the created session
function createNewSession(commitData) {
	var session = {		"id": Date.now(),
						"tabs": [ commitData.tabId ],
						"nodeIndex": 1,
				}
	sessions.push(session);
	return { "id": session.id, "parentNode": "" };
}

// Create Page Object
// create a new page object that will get inserted into
// the tree data structure
function createPageObject(session, commitData, callback) {
	sessions.forEach(function(activeSession) {
		if (activeSession.id == session.id) {
			var page = { 	"id": activeSession.nodeIndex,
							"name": shortenURL(commitData.url),
							"data": { 	"url": commitData.url,
										"date": commitData.timeStamp,
										"sessionId": session.id,
										"tabId": commitData.tabId,
										"parentId": session.parentNode,
									},
							"children": [],
						}
			activeSession.nodeIndex += 1;
			callback(page);
		}
	})
}

function recordRoot(page) {
	// set the tabStatus of this tabId to the page content
	setTabStatus(page.data.tabId, page);
	// record new session and root node to localStorage
	localStorage.setItem(page.data.sessionId, JSON.stringify(page));
}

function recordChild(page) {
	// set the tabStatus of this tabId to the page content
	setTabStatus(page.data.tabId, page);
	// retrieve the tree for this session from localStorage
	var tree = JSON.parse(localStorage.getItem(page.data.sessionId));
	// find the parent node
	var parent = findNode(tree, page.data.parentId);
	// add this node as a child
	parent.children.push(page);
	// record the modified tree to localStorage
	localStorage.setItem(page.data.sessionId, JSON.stringify(tree));
}


// Find Node
// recursively look through a JSON tree for the specified node and return it
function findNode(tree, nodeId) {
   if (tree.id === nodeId) return tree;

   var result;
   var len = tree.children.length;
   for (var i = 0; i < len; i++) {
	  result = findNode(tree.children[i], nodeId);
	  if (result !== undefined) return result;
   }
}

// Find Node By URL
// recursively look through a JSON tree for first node with a matching url
// TODO: improve this by comparing URLs AND tabIds for a more precise match
function findNodeByURLAndName(tree, url, name) {
	if (tree.data.url == url && tree.name != name) return tree;

	var result;
	var len = tree.children.length;
	for (var i = 0; i < len; i++) {
		result = findNodeByURLAndName(tree.children[i], url, name);
		if (result !== undefined) return result;
	}
}

// Set TabStatus
// function to update the tab status object with the page contents of tabId
function setTabStatus(tabId, page) {
	tabStatus[tabId] = page;
}

// Update Name
// function to find the session and node of a page
// and to update the node's name with the proper document name
function updateName(tab, name) {
	sessions.forEach(function(s) {
		 if ( s.tabs.indexOf(tab.id) >= 0 ) {
			// i know the session id to go find this node in
			var tree = JSON.parse(localStorage[s.id]);
			var node = findNodeByURLAndName(tree, tab.url, name);
			if (node != undefined) {
        node.name = name;
      }
			localStorage.setItem(s.id, JSON.stringify(tree));
		}
	})
}
	
// deletes a specific key from localStorage
function deleteHistoryItem(key) {
	if (localStorage.length == 1) {
		clearHistory();
	}
	else localStorage.removeItem(key);
}

// clears all history including current in-memory tree
function clearHistory() {
	tabStatus = {};
	sessions = [];
	selectedTree = {};
	localStorage.clear();
}

// trim url to just the page name from the url
// this returns a placeholder value for node.name until the
// loaded page DOM can be queried for its real name
function shortenURL(url) {
	return /[^/]*$/.exec(url)[0];
}

// message listener
chrome.runtime.onMessage.addListener(function(request, sender, response) {
	switch (request.payload) {
		case "set":
			if (request.key) {
				selectedTree = JSON.parse(localStorage.getItem(request.key));
			}
			else if (sessions.length == 0) selectedTree = {};
			else {
				if (localStorage.length > 0) 
					var recent = 0;
					for (key in localStorage) {
						if (key > recent) recent = key;
					}
					selectedTree = JSON.parse(localStorage.getItem(recent));
			}
			response(selectedTree);
		break;

		// tree page requesting json tree object
		case "load":
			response(selectedTree);
		break;

		case "update":
			updateName(sender.tab, request.name);
		break;

		// history page requesting localStorage object
		case "localStorage":
      console.log('localStorage message received');
			response(localStorage);
		break;

		// history page requesting to remove a specific tree by key
		case "delete":
			deleteHistoryItem(request.key);
			response("Tree Deleted");
		break;

		// history page requesting to clear all history
		case "clear":
			clearHistory();
			response("History Cleared");
		break;
	}
})


// Navigation Event Listener
chrome.webNavigation.onCommitted.addListener(function(details) {
	// check that this event is a link or typed address
	// filter out back, reload, etc events
	if (details.transitionType == "link" ||
		details.transitionType == "typed" ||
		details.transitionType == "form_submit" ) {

		// get the parent tab id of the tab that the nav event occurs in
		// and add it as an additional key in commitData
		var commitData = details;
		chrome.tabs.get(details.tabId, function(tab) {
			commitData.parentId = tab.openerTabId;
			sessionHandler(commitData);
		});
	}
}, { url: [	{ urlContains: ".wikipedia.org/wiki" },
			{ urlContains: ".wiktionary.org/wiki"}]});

// Listener for when the user clicks on the Wikimapper button
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({'url': chrome.extension.getURL('html/index.html')}, function(tab) {
	});
});

// Listener for first install
chrome.runtime.onInstalled.addListener(function(details) {
	if(details.reason == "install") {
		chrome.tabs.create({'url': chrome.extension.getURL('html/index.html')});
	}
})
