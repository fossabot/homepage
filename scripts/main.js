// Globals to hide warnings
/* global XMLHttpRequest */
/* global io */

// Our request function
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

// Our main function, to be run on page load
const main = () => {
	// Global variables
	const coinBlockContainer = document.querySelector('div#main div.crypto-ticker div.coins');
	const coinBlocks = coinBlockContainer.querySelectorAll('div.coin');
	const totalBlock = document.querySelector('div#main div.crypto-ticker p.total');

	// Update the total
	const updateTotal = () => {
		let total = 0;
		coinBlocks.forEach((coinBlock, i) => {
			const coinTotal = Number(coinBlock.querySelector('p.total-value').innerHTML.substring(1));
			total += coinTotal;
			console.log(i);
			if (i === coinBlocks.length - 1) {
				totalBlock.innerHTML = '$' + total;
			}
		});
	};

	// Get and populate the initial data
	const populateInitialData = () => {
		coinBlocks.forEach((coinBlock) => {
			const coin = coinBlock.querySelector('p.name').innerHTML;
			const balance = Number(coinBlock.querySelector('p.balance span.value').innerHTML);
			const valueSpan = coinBlock.querySelector('p.value span.value');
			const totalValue = coinBlock.querySelector('p.total-value');
			getJSON('https://coincap.io/page/' + coin, (err, data) => {
				if (err) {
					console.error(err);
				} else {
					valueSpan.innerHTML = '$' + Number(Math.round(data.price + 'e2') + 'e-2').toFixed(2);
					totalValue.innerHTML = '$' + (Number(valueSpan.innerHTML.substring(1)) * balance).toFixed(2);
					updateTotal();
				}
			});
		});
	};

	// Our socket plugger
	const connectSocket = () => {
		const socket = io.connect('https://socket.coincap.io');
		socket.on('trades', (tradeMsg) => {
			const coinBlock = coinBlockContainer.querySelector('div.coin.' + (isNaN(tradeMsg.coin.charAt(0)) ? '' : '\\3') + tradeMsg.coin);
			if (coinBlock !== null) {
				const balance = Number(coinBlock.querySelector('p.balance span.value').innerHTML);
				const 
			}
		});
	};

	// The functions we actually want to run
	populateInitialData();
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
