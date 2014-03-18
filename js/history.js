var storage = {};
var date = new Date();

alertify.set({ labels: { ok: "Yes", cancel: "No" }, buttonFocus: "cancel" });

$(document).ready(function() {
  chrome.runtime.sendMessage({payload: "localStorage"}, function(response) {
    storage = response;
    displayHistory();
    $("#content").show();

    viewHistoryItem();
    deleteHistoryItem();  
    clearHistoryButton();
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
          + '</div><div class="del-list-item" id=' + key + '><img class="list-x" src="../resources/redx.png"></div>');
  }
}

function clearHistoryButton() {
  $("#clear-all").show().click(function() {
    alertify.confirm("Are you sure you want to clear ALL WikiMapper history?", function(yes) {
      if (yes) { clearHistory(); }
    });
  });
}

function clearHistory() {
  chrome.runtime.sendMessage({ payload: "clear" }, function(response) {
    $("#content").load("history.html");
    alertify.error(response);
  });
}

function deleteThisTreeButton(key) {
  $("#clear-this").show().click(function() {
    alertify.confirm("Are you sure you want to delete this tree?", function(yes) {
      if (yes) {
        chrome.runtime.sendMessage({ payload: "delete", key: key }, function(response) {
          $("#content").load("history.html");
          alertify.error(response);
        });
      }
    });
  });
}

function goBackButton() {
  $("#go-back").show().click(function() {
    $("#content").load("history.html");
    $("#back").hide();
  });
}

function viewHistoryItem() {
  $(".history-item").click(function() {
    $("#clear-all").hide();
    var key = $(this).attr('id');
    chrome.runtime.sendMessage({payload: "set", key: key}, function(response) {
      $("#history-content").load("tree.html");
      goBackButton();  
      deleteThisTreeButton(key);    
    });
  });
}

function deleteHistoryItem() {
  $(".del-list-item").click(function() {
    var key = $(this).attr('id');
    alertify.confirm("Are you sure you want to delete this item?", function(yes) {
      if (yes) { 
        chrome.runtime.sendMessage({ payload: "delete", key: key }, function(response) {
          $("#content").load("history.html");
          alertify.error(response);
        });
      }
    });
  });
}

// take date object and return it as a string of format "MM/DD/YYYY at HH:MM"
function formatDate(date) {
  // getMonth returns zero-based index of month, so need +1
  month = date.getMonth();
  month += 1;

  return month + '/' + date.getDate()  + '/' + date.getFullYear() + ' at ' +
    (date.getHours()<10?'0':'') + date.getHours() + ':' +
    (date.getMinutes()<10?'0':'') + date.getMinutes();
}
