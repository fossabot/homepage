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

module.exports = {
	populateInitialData
};
