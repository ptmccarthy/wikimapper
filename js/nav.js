// load default on document ready event and start nav function
$(document).ready(function() {
	$('#viz-body').load('cluster.html');
	nav();
});

// load different visualization when user switches view radio button
function nav() {
	$('input:radio').change(function() {
		
		if ( $(this).val() == 'cluster' ) {
			$('#viz-body').load('cluster.html');
		}

		if ( $(this).val() == 'spacetree' ) {
			$('#viz-body').load('spacetree.html');
		}

		if ( $(this).val() == 'hypertree' ) {
			$('#viz-body').load('hypertree.html');
		}
	})
}