// Globals to hide warnings
/* global XMLHttpRequest */
/* global io */
/* global localStorage */

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
		let coinValues = {};
		coinBlocks.forEach((coinBlock, i) => {
			const coin = coinBlock.querySelector('p.name').innerHTML;
			const coinValue = Number(coinBlock.querySelector('p.value span.value').innerHTML.substring(1));
			const coinTotal = Number(coinBlock.querySelector('p.total-value').innerHTML.substring(1));
			total += coinTotal;
			coinValues[coin] = coinValue;
			if (i === coinBlocks.length - 1) {
				totalBlock.innerHTML = '$' + total.toFixed(0);
				localStorage.setItem('coinValues', JSON.stringify(coinValues));
			}
		});
	};

	// Get and populate the initial data
	const populateInitialData = () => {
		// Attempt to get cached data from localstorage
		const coinValues = JSON.parse(localStorage.getItem('coinValues'));
		coinBlocks.forEach((coinBlock, i) => {
			const coin = coinBlock.querySelector('p.name').innerHTML;
			const balance = Number(coinBlock.querySelector('p.balance span.value').innerHTML);
			const valueSpan = coinBlock.querySelector('p.value span.value');
			const totalValue = coinBlock.querySelector('p.total-value');
			if (coinValues && coinValues[coin]) {
				valueSpan.innerHTML = '$' + coinValues[coin].toFixed(2);
				totalValue.innerHTML = '$' + (coinValues[coin] * balance).toFixed(2);
				coinBlock.classList.remove('yellow-text');
			}
			getJSON('http://coincap.io/page/' + coin, (err, data) => {
				if (err) {
					console.error(err);
				} else {
					valueSpan.innerHTML = '$' + Number(Math.round(data.price + 'e2') + 'e-2').toFixed(2);
					totalValue.innerHTML = '$' + (Number(valueSpan.innerHTML.substring(1)) * balance).toFixed(2);
					coinBlock.classList.remove('yellow-text');
					updateTotal();
				}
			});
			if (i === coinBlocks.length - 1) updateTotal();
		});
	};

	// Our socket plugger
	const connectSocket = () => {
		const socket = io.connect('http://socket.coincap.io');
		socket.on('trades', (tradeMsg) => {
			const coinBlock = coinBlockContainer.querySelector('div.coin.' + (isNaN(tradeMsg.coin.charAt(0)) ? '' : '\\3') + tradeMsg.coin);
			if (coinBlock !== null) {
				const balanceBlock = coinBlock.querySelector('p.balance span.value');
				const valueBlock = coinBlock.querySelector('p.value span.value');
				const totalValueBlock = coinBlock.querySelector('p.total-value');
				const balance = Number(balanceBlock.innerHTML);
				const oldValue = Number(valueBlock.innerHTML.substring(1));
				const newValue = Number(Math.round(tradeMsg.message.msg.price + 'e2') + 'e-2');
				if (oldValue !== newValue) {
					coinBlock.classList.remove('yellow-text');
					coinBlock.style.transition = 'color 250ms linear';
					setTimeout(() => {
						valueBlock.innerHTML = '$' + newValue.toFixed(2);
						totalValueBlock.innerHTML = '$' + (newValue * balance).toFixed(2);
						updateTotal();
					}, 200);
					coinBlock.classList.add(oldValue < newValue ? 'green-text' : 'red-text');
					setTimeout(() => {
						coinBlock.style.transition = 'color 1000ms linear';
						coinBlock.classList.remove('green-text');
						coinBlock.classList.remove('red-text');
					}, 1000);
				}
			}
		});
	};

	// The functions we actually want to run
	populateInitialData();
	connectSocket();
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
