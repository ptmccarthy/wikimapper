'use strict';

// load default on document ready event and start nav function
$(document).ready(function() {
  chrome.runtime.sendMessage({ payload: 'set' }, function(response) {
    if (response.name == null) {
      $('#about').attr('state', 'active');
      $('#content').load('about.html');
    }
    else {
      $('#tree').attr('state', 'active');
      $('#content').load('tree.html');
    }

    nav();
  });
});

function nav() {
  $('.nav li').click(function() {
    $('.nav').children('li').attr('state', 'inactive');
    $(this).attr('state', 'active');

    if ($(this).attr('id') == 'tree') {
      chrome.runtime.sendMessage({ payload: 'set' }, function(response) {});
    }

    $('#content').load($(this).attr('id') + '.html');
  });
}
