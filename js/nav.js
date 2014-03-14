// load default on document ready event and start nav function
$(document).ready(function() {
  $('#viz-body').load('tree.html');
  chrome.runtime.sendMessage({ payload: "set" }, function() {
    nav();
  })
});

// load different visualization when user switches view radio button

function nav() {
  $('#current').click(function() {
    deactivateAll();
    $(this).attr("state", "active");
    chrome.runtime.sendMessage({ payload: "set"}, function() {      
      $('#content').load('tree.html');
    })
  });

  $('#show-history').click(function() {
    deactivateAll();
    $(this).attr("state", "active");
    $('#content').load('history.html'); 
  })

  $('#about').click(function() {
    deactivateAll();
    $(this).attr("state", "active")
    $('#content').load('about.html');
  })
}

function deactivateAll() {
  $('.header').removeAttr("state");
}
