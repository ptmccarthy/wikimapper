'use strict';

var enums = require('../chrome/enums');

var cleanedTitle = document.title.replace(' - Wikipedia, the free encyclopedia', '');

chrome.runtime.sendMessage({
  'type': enums.messageTypes.update,
  'name': cleanedTitle
});
