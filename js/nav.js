// load default on document ready event and start nav function
$(document).ready(function() {
  chrome.runtime.sendMessage({ payload: "set" }, function(response) {
    if (response.name == null) {
      deactivateAll();
      $('#about').attr("state", "active");
      $('#content').load('about.html').show();
    }
    else {
      $('#content').load('tree.html').show();
    }

    nav();
  })
});

// navigation button listener function
// changes content displayed in content div
function nav() {
  $('#about').click(function() {
    deactivateAll();
    $(this).attr("state", "active")
    $('#content').load('about.html');
  });

  $('#current').click(function() {
    deactivateAll();
    $(this).attr("state", "active");
    chrome.runtime.sendMessage({ payload: "set"}, function() {      
      $('#content').load('tree.html');
    });
  });

  $('#show-history').click(function() {
    deactivateAll();
    $(this).attr("state", "active");
    $('#content').load('history.html'); 
  });

  $('#nav').show();
}

function deactivateAll() {
  $('.header').removeAttr("state");
}
