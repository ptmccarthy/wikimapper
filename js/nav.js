// load default on document ready event and start nav function
$(document).ready(function() {
	$('#viz-body').load('cluster.html');
	chrome.runtime.sendMessage({ payload: "set" }, function() {
		nav();
	})
});

// load different visualization when user switches view radio button
function nav() {
	$('input:radio').change(function() {
		
		if ( $(this).val() == 'cluster' ) {
			chrome.runtime.sendMessage({ payload: "set" }, function() {
				$('#history').hide();
				$('#viz-body').load('cluster.html');
				$('#viz-body').show();
			});
		}

		if ( $(this).val() == 'show-history' ) {
			$('#viz-body').hide();
			$('#history').load('history.html');
			$('#history').show();
		}
	})
}