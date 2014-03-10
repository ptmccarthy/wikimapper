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
    $(this).attr("state", "active");
    $('#show-history').attr("state", "inactive");

    chrome.runtime.sendMessage({ payload: "set"}, function() {
      $('#viz-body').load('tree.html');
      $('#history').hide();
      $('#viz-body').show();
    })
  });

  $('#show-history').click(function() {
    $(this).attr("state", "active");
    $('#current').attr("state", "inactive");
    $('#history').load('history.html');
    $('#viz-body').hide();
    $('#history').show();   
  })
}