var storage = {};
var date = new Date();

alertify.set({ labels: { ok: "Yes", cancel: "No" }, buttonFocus: "cancel" });

$(document).ready(function() {
  chrome.runtime.sendMessage({payload: "localStorage"}, function(response) {
    storage = response;
    displayHistory(2);
    filterHistory();

    viewHistoryItem();
    deleteHistoryItem();  
    clearHistoryButton();
  });
});

function displayHistory(filter) {
  $("#history-title").show();
  $("#history-content").empty().append('<div id="history-item-list">');
  for (var key in storage) {    
    var session = JSON.parse(storage[key]);
    var count = nodeCount(session);

    if (count >= filter) {
      date.setTime(key);
      $("#history-item-list").prepend('<div class="history-item" id=' + key + '>'
            + formatDate(date) + ' &#8212; ' + session.name
            + ' <span class="node-count">(' + count + (count == 1 ? ' page)' : ' pages)') +'</span>' 
            + '</div><div class="del-list-item" id=' + key + '><img class="list-x" src="../resources/redx.png"></div>');
    }
  }
}

function filterHistory() {
  $("#filter-nodes").keydown(function (e) {
    // Allow: backspace, delete, tab, escape, enter and .
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
      // Allow: Ctrl+A
      (e.keyCode == 65 && e.ctrlKey === true) || 
      // Allow: Command+A
      (e.keyCode == 65 && e.metaKey === true) ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)) {
        // let it happen, don't do anything
        return;
    }
    // Ensure that it is a number and stop the keypress
    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
      e.preventDefault();
    }
  });

  $("#filter-nodes").on("change", function() {
    var filter = parseInt($(this).val());
    displayHistory(filter);
    viewHistoryItem();
  });
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
  });
}

function viewHistoryItem() {
  $(".history-item").click(function() {
    $("#history-title").hide();
    $("#history-filters").hide();
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

// if the tree already has lastNodeIndex property, return that
// otherwise count nodes, set lastNodeIndex, and return the count
//   (prior to 0.7.4 trees didn't keep a running count of their size)
function nodeCount(tree) {
  if (tree.lastNodeIndex) {
    return tree.lastNodeIndex;
  }
  else {
    var n = countNodes(tree);
    tree.lastNodeIndex = n;
    localStorage.setItem(tree.data.sessionId, JSON.stringify(tree));

    return n;
  }
}

// count how many nodes there are in a tree, recursively
function countNodes(tree) {
  return 1 + tree.children.reduce(function(count, child) {
    return count + countNodes(child);
  }, 0);
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
