'use strict';

var enums = require('../chrome/enums');
var redirectedFrom;

var cleanedTitle = document.title.replace(' - Wikipedia, the free encyclopedia', '');
var redirect = document.getElementById('contentSub').getElementsByClassName('mw-redirectedfrom');

// damn wikipedia why you got to change the url format here and make me
// do all this tedious string manipulation?
if (redirect.length > 0) {
  redirectedFrom = redirect[0].children[0].href;
  redirectedFrom = redirectedFrom.split('index.php?title=');

  if (redirectedFrom.length > 0) {
    redirectedFrom[0] = redirectedFrom[0].replace('wikipedia.org/w/', 'wikipedia.org/wiki/');
    redirectedFrom[1] = redirectedFrom[1].replace('&redirect=no', '');
    redirectedFrom = redirectedFrom[0] + redirectedFrom[1];
  }
}

chrome.runtime.sendMessage({
  'type': enums.messageTypes.update,
  'name': cleanedTitle,
  'redirectedFrom': redirectedFrom
});
