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

// A handy little each function
const mysync = {
	each: (arr, fn, cb) => {
		arr.forEach((item, i) => {
			fn(item);
			if (i === arr.length - 1) cb();
		});
	}
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
			// If we have values cached in browser storage, throw those up first
			if (coinValues && coinValues[coin]) {
				valueSpan.innerHTML = '$' + coinValues[coin].toFixed(2);
				totalValue.innerHTML = '$' + (coinValues[coin] * balance).toFixed(2);
				coinBlock.classList.remove('yellow-text');
			}
			// While we wait for the current data from cryptocompare
			getJSON('https://min-api.cryptocompare.com/data/price?tsyms=USD&fsym=' + coin, (err, data) => {
				if (err) {
					console.error(err);
				} else {
					// Values
					valueSpan.innerHTML = '$' + Number(Math.round(data.USD + 'e2') + 'e-2').toFixed(2);
					totalValue.innerHTML = '$' + (Number(valueSpan.innerHTML.substring(1)) * balance).toFixed(2);
					coinBlock.classList.remove('yellow-text');
					updateTotal();
				}
			});
			if (i === coinBlocks.length - 1) updateTotal();
		});
	};

	// CoinBlock updater
	const updateCoinBlock = (coin, value) => {
		const coinBlock = coinBlockContainer.querySelector('div.coin.' + coin);
		const balanceBlock = coinBlock.querySelector('p.balance span.value');
		const valueBlock = coinBlock.querySelector('p.value span.value');
		const totalValueBlock = coinBlock.querySelector('p.total-value');
		const balance = Number(balanceBlock.innerHTML);
		const oldValue = Number(valueBlock.innerHTML.substring(1));
		const totalValue = Number(totalValueBlock.innerHTML.substring(1));
		if ((value * balance).toFixed(0) !== totalValue) {
			coinBlock.classList.remove('yellow-text');
			coinBlock.style.transition = 'color 250ms linear';
			setTimeout(() => {
				valueBlock.innerHTML = '$' + value.toFixed(2);
				totalValueBlock.innerHTML = '$' + (value * balance).toFixed(2);
				updateTotal();
			}, 200);
			coinBlock.classList.add(oldValue < value ? 'green-text' : 'red-text');
			setTimeout(() => {
				coinBlock.style.transition = 'color 1000ms linear';
				coinBlock.classList.remove('green-text');
				coinBlock.classList.remove('red-text');
			}, 1000);
		}
	};

	// Our socket plugger
	const connectSocket = () => {
		const socket = io.connect('https://streamer.cryptocompare.com');
		// Create an array to hold our coin subscriptions
		const subscription = [];
		mysync.each(coinBlocks, (coinBlock) => {
			const coin = coinBlock.querySelector('p.name').innerHTML;
			subscription.push('5~CCCAGG~' + coin + '~USD');
		}, () => {
			socket.emit('SubAdd', { subs: subscription });
			socket.on('m', (message) => {
				message = message.split('~');
				// Must match sub, , include price data and change
				if (message[0] === '5' && message.length >= 5 && message[4] !== '4') {
					const coin = message[2];
					const value = Number(message[5]);
					if (!isNaN(value)) updateCoinBlock(coin, value);
				}
			});
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
