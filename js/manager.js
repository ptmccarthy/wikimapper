document.addEventListener('DOMContentLoaded'), function() {
	document.querySelector('button').addEventListener('click', clickHandler);
}

function clickHandler() {
	localStorage.clear();
}
