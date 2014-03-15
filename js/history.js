var storage = {};
var date = new Date();

chrome.runtime.sendMessage({payload: "localStorage"}, function(response) {
  storage = response;
  displayHistory();
  clearHistory();
  goBack(); 
})

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

function clearHistory() {
  $("#clear-all").show().click(function() {
    $("clear-all").off('click')
    $("#clear-span").text("Are you sure?")
    $(".button-yes").show().click(function() {
      chrome.runtime.sendMessage({payload: "clear"}, function(response) {
        $("#clear-all").html(response);
      });
    });
    $(".button-no").show().click(function() {
      $("#content").load("history.html");
    })

    $(".button-no").click(function() {
      $("#clear-all-confirm").hide();
    })
  })
}

function clearCurrent(key) {
  $("#clear-current").click(function() {
    $("#clear-current-confirm").show();
    $("#current-yes").click(function() {
      chrome.runtime.sendMessage({payload: "delete", key: key}, function(response) {
        $("#clear-current").html(response);
        $("#clear-current-confirm").hide();
    
      });
    })
    $("#current-no").click(function() {
      $("#clear-current-confirm").hide();
    })
  })
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
      clearCurrent(key);

      $("#clear-all").hide();
      $("#history-content").load("tree.html");
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
