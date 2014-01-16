var sessions = [];
var data = {};

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
	var sessionId = findSessionOf(commitData);
	recordPage(sessionId, commitData);
	console.log("Sessions: " + JSON.stringify(sessions));
}

// Session Finder
// does logic to determine which wikipedia 'session' the
// navigation event's commitData belongs to.
// creates new session if needed
// returns guid of session object
function findSessionOf(commitData) {
	var id = "";
	sessions.forEach(function(session) {
		if (session.tabs.indexOf(commitData.tabId) >= 0) {
			id = session.id;
		}
		else if (session.tabs.indexOf(commitData.parentId) >= 0) {
			session.tabs.push(commitData.tabId);
			id = session.id;
		}
	})

	if (id != "") {
		return id;
	}
	else {
		return createNewSession(commitData);
	}
}

// Create New Session
// make a new session object and assign it a GUID
// return the id of the created session
function createNewSession(commitData) {
	var session = {		"id": createGUID(),
						"tabs": [ commitData.tabId ],
						"nodeIndex": 1,
				}
	console.log('creating session:' + JSON.stringify(session))
	sessions.push(session);

	return session.id;
}


function recordPage(sessionId, commitData) {
	var nodeId;
	sessions.forEach(function(session) {
		if (session.id == sessionId) {
			var page = { data: {	"nodeId": session.nodeIndex,
									"sessionId": session.id,
									"data": { 	"url": commitData.url,
												"date": commitData.date,
											},
									"children": [],
									}}
			session.nodeIndex += 1;
		}
	})


}

// GUID generator pulled from StackOverflow
var createGUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}


// Navigation Event Listener
chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
	// get the parent tab id of the tab that the nav event occurs in
	// and add it as an additional key in commitData
	var commitData = details;
	chrome.tabs.get(details.tabId, function(tab) {
		if (tab.openerTabId !== undefined) {
			commitData.parentId = tab.openerTabId;
		} else {
			commitData.parentId = 0;
		}
		sessionHandler(commitData);
	});
}, { url: [{ urlContains: ".wikipedia.org/wiki" }]});
