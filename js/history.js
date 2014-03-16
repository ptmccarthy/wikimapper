var storage = {};
var date = new Date();

$(document).ready(function() {
  chrome.runtime.sendMessage({payload: "localStorage"}, function(response) {
    storage = response;
    displayHistory();
    clearHistoryButton();
    $("#content").show();
    $("#clear-all").show();
  });
});

function displayHistory() {
  $("#history-content").append('<div id="history-title">History Viewer</div>');
  $("#history-content").append('<div id="history-item-list">');
  for (var key in storage) {    
    var session = JSON.parse(storage[key]);
    date.setTime(key);
    $("#history-item-list").prepend('<div class="history-item" id=' + key + '>'
          + formatDate(date) + ' &#8212; ' + session.name
          + '<img class="list" src="../resources/redx.png"></div>');
  }
  // once all items are populated, begin load-button listener
  viewHistoryItem();
}

function confirmButtons(element, key) {
  $(element).css('cursor', 'default');
  var top = $(element).css("top");
  var left = $(element).css("left");
  $('.confirmation').css("top", top).css("left", left).show();
  $(element).find('.button-yes').click(function() { clearYes(this.id, key); });
  $(element).find('.button-no').click(function() { clearNo(this.id, key); });
}

function clearHistoryButton() {
  $("#clear-all").click(function() {
    confirmButtons(this);
  });
}

function clearCurrentButton(key) {
  $("#clear-current").show().click(function() {
    confirmButtons(this, key)
  });
}

function clearYes(id, key) {
  
  if (id == 'all-yes') {
    chrome.runtime.sendMessage({payload: "clear"}, function(response) {
      $("#clear-all").html(function(response) {
        $(this).hide();
        $("#content").load("history.html");
      });
    });
  }

  if (id == 'current-yes') {
    chrome.runtime.sendMessage({payload: "delete", key: key}, function(response) {
      $("#content").load("history.html");
    });
  }
}

function clearNo(id, key) {
  if (id == 'all-no') {
    $("#clear-all").hide();
    $("#content").load("history.html");
  }
  if (id == 'current-no') {
    $("#"+id).hide();
    $("#"+id).siblings('.button-yes').hide();
    $("#"+id).siblings('.clear-span').html('<img class="tree-view" src="../resources/redx.png">Delete This Tree');
  }
  
}

function goBack() {
  $("#back").click(function() {
    $("#content").load("history.html");
    $("#back").hide();
  })
}

function viewHistoryItem() {
  $(".history-item").click(function() {
    var key = $(this).attr('id');
    chrome.runtime.sendMessage({payload: "set", key: key}, function(response) {
      $("#clear-all").hide();
      $("#history-content").load("tree.html");
      clearCurrentButton(key);
    })
  })
}

// take date object and return it as a string of format "MM/DD/YYYY at HH:MM"
function formatDate(date) {
  // getMonth returns zero-based index of month, so need +1
  month = date.getMonth()
  month += 1;

  return month + '/' + date.getDate()  + '/' + date.getFullYear() + ' at ' +
    date.getHours() + ':' + (date.getMinutes()<10?'0':'') + date.getMinutes();
}
