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
// returns guid and parentNode of session object
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
// make a new session object and assign it a GUID
// return the id of the created session
function createNewSession(commitData) {
	var session = {		"id": Date.now(),
						"tabs": [ commitData.tabId ],
						"nodeIndex": 1,
				}
	sessions.push(session);
	return { "id": session.id, "parentNode": "" };
}


function createPageObject(session, commitData, callback) {
	sessions.forEach(function(activeSession) {
		if (activeSession.id == session.id) {
			var page = { 	"id": activeSession.nodeIndex,
							// to do: retrieve name from content.js
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
)

// Find Node
// recursively look through a JSON tree for the specified node and return it
function findNode(tree, nodeId) {
   console.log('looking for ' + nodeId + ' in ' + JSON.stringify(tree));
   if (tree.id === nodeId) return tree;

   var result;
   for (var i = 0; i < tree.children.length; i++) {
	  result = findNode(tree.children[i], nodeId);
	  if (result !== undefined) return result;
   }
}

// Set TabStatus
// function to update the tab status object with the page contents of tabId
function setTabStatus(tabId, page) {
	tabStatus[tabId] = page;
}

function deleteHistoryItem(key) {
	localStorage.removeItem(key);
}

// clears all history including current in-memory tree
function clearHistory() {
	tabStatus = {};
	data = {};
	localStorage.clear();
}

// trim url to just the page name from the url
// this returns a placeholder value for node.name until the
// loaded page DOM can be queried for its real name
function shortenURL(url) {
	return /[^/]*$/.exec(url)[0];
}

// GUID generator pulled from StackOverflow
var createGUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}

// message listener
chrome.runtime.onMessage.addListener(function(request, sender, response) {
	switch (request.payload) {
		case "set":
			if (request.key) {
				selectedTree = JSON.parse(localStorage.getItem(request.key));
			}
			else {
				var recent = sessions.length - 1;
				recent = sessions[recent].id;
				selectedTree = JSON.parse(localStorage.getItem(recent));
			}
			response();
		break;

		// tree page requesting json tree object
		case "load":
			response(selectedTree);
		break;

		// history page requesting localStorage object
		case "localStorage":
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
		details.transitionType == "typed") {

		// get the parent tab id of the tab that the nav event occurs in
		// and add it as an additional key in commitData
		var commitData = details;
		chrome.tabs.get(details.tabId, function(tab) {
			commitData.parentId = tab.openerTabId;
			sessionHandler(commitData);
		});
	}
}, { url: [{ urlContains: ".wikipedia.org/wiki" }]});

// Listener for when the user clicks on the Wikimapper button
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({'url': chrome.extension.getURL('html/index.html')}, function(tab) {
	});
});
