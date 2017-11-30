/* global XMLHttpRequest */

const getJSON = (url, callback) => {
	const request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = () => {
		if (request.status >= 200 && request.status < 400) {
			const data = JSON.parse(request.responseText);
			callback(null, data);
		} else {
			callback(new Error(request.status + ' error'));
		}
	};

	request.onerror = () => {
		callback(new Error('Request failed'));
	};

	request.send();
};

module.exports = {
	getJSON
};
