/* global functionsToRun */

functionsToRun.push(() => {
	// URL Checker and Handler
	const checkForURL = (e) => {
		let searchTerms = document.querySelector('div.search-form form input[type="text"]').value.trim();
		if (/^[^ ]+\.[^. ]+$/.test(searchTerms)) {
			// Likely a url, so send them there
			// Prevent the default form processing, if it's supported
			if (e.preventDefault) e.preventDefault();
			// If the url doesn't start with http, append it
			if (!/^https?:\/\//.test(searchTerms)) searchTerms = 'http://' + searchTerms;
			// And send them away!
			window.location = searchTerms;
			return false;
		} else {
			// Else, just do the search, man
			return true;
		}
	};

	// Grab the form and attach our function
	const form = document.querySelector('form');
	if (form.attachEvent) {
		form.attachEvent('submit', checkForURL);
	} else {
		form.addEventListener('submit', checkForURL);
	}
});
