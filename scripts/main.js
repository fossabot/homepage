// An array to hold functions to be run on page load
let functionsToRun = [];

// Our main function
const main = () => {
	functionsToRun.forEach((fn) => {
		fn();
	});
};

// Our ready function
const ready = (fn) => {
	if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
		fn();
	} else {
		document.addEventListener('DOMContentLoaded', fn);
	}
};

// GO!
ready(main);
