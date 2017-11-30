// Globals to turn off linter warnings
/* global io */

// Required modules
const request = require('./request.js');

// Global variables
const coinBlocks = document.querySelectorAll('div#crypto-ticker div.coins div.coin');
const totalBlock = document.querySelector('div#crypto-ticker p.total');

// Update the total
const updateTotal = () => {
	let total = 0;
	coinBlocks.forEach((coinBlock, i) => {
		const coinTotal = Number(coinBlock.querySelector('p.total-value').substring(1));
		total += coinTotal;
		if (i === coinBlocks.length) {
			totalBlock.innerHTML = '$' + total;
		}
	});
};

// Get and populate the initial data
const populateInitialData = () => {
	coinBlocks.forEach((coinBlock, i) => {
		const coin = coinBlock.querySelector('p.name').innerHTML;
		const balance = Number(coinBlock.querySelector('p.balance span.value').innerHTML);
		const valueSpan = coinBlock.querySelector('p.value span.value');
		const totalValue = coinBlock.querySelector('p.total-value');
		request.getJSON('https://coincap.io/page/' + coin, (err, data) => {
			if (err) {
				console.error(err);
			} else {
				valueSpan.innerHTML = '$' + Number(Math.round(data.price + 'e2') + 'e-2').toFixed(2);
				totalValue.innerHTML = '$' + (Number(valueSpan.innerHTML.substring(1)) * balance).toFixed(2);
			}
			updateTotal();
		});
	});
};

// Update blocks as data comes in
// const socket = io.connect('http://socket.coincap.io');
// socket.on('trades', (tradeMsg) => {
// 	var coinBlock = document.querySelector('div#crypto-ticker div.crypto-block.' + (isNaN(tradeMsg.coin.charAt(0)) ? '' : '\\3') + tradeMsg.coin);
// 	if (coinBlock !== null) {
// 		var priceBlock = coinBlock.querySelector('span.value');
// 		var oldPrice = Number(priceBlock.innerHTML.substring(1));
// 		var newPrice = Number(Math.round(tradeMsg.message.msg.price + 'e2') + 'e-2');
// 		if (oldPrice !== newPrice) {
// 			coinBlock.style.transition = 'color 250ms linear';
// 			setTimeout(() => {
// 				coinBlock.querySelector('span.value').innerHTML = '$' + newPrice.toFixed(2);
// 				coinBlock.querySelector('span.total-value').innerHTML = '$' + (newPrice * Number(coinBlock.querySelector('span.balance').innerHTML)).toFixed(2);
// 			}, 200);
// 			coinBlock.classList.add((newPrice >= oldPrice ? 'green-text': 'red-text'));
// 			setTimeout(() => {
// 				coinBlock.style.transition = 'color 1000ms linear';
// 				coinBlock.classList.remove('green-text');
// 				coinBlock.classList.remove('red-text');
// 			}, 1000);
// 		}
// 	}
// });

module.exports = {
	populateInitialData
};
