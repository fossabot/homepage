function getJSON(url, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.onload = function() {
		if (request.status >= 200 && request.status < 400) {
			callback(null, JSON.parse(request.responseText));
		} else {
			callback(request.status + ' error');
		}
	};
	request.onerror = function() {
		callback('error');
	};
	request.send();
}
// Set Data
const siteData = {
	searchProvider: {
		name: 'DuckDuckGo',
		url: 'https://duckduckgo.com',
		queryParameter: 'q'
	},
	favorites: [
		{
			title: 'Reddit',
			url: 'https://reddit.com',
			short: 'Rd'
		},
		{
			title: 'GitHub',
			url: 'https://github.com',
			short: 'Gh'
		}
	],
	cryptocurrencies: {
		'CVC': 44.39212745,
		'DCR': 0.44265756,
		'ETH': 0.53206250,
		'FCT': 12.28899319,
		'GNT': 50,
		'LTC': 5.00363918,
		'NEO': 3,
		'PIVX': 80.33980987,
		'PTOY': 35.20054827,
		'SC': 7091.23133123,
		'VTC': 228.78335326,
		'XEM': 108.35031742,
		'XMR': 6.16024323,
		'XVG': 3812.757151,
		'IOT': 268.032326
	}
};
document.addEventListener('DOMContentLoaded', (event) => {
	const nunjucksContainer = document.querySelector('#nunjucks-container');
	nunjucksContainer.innerHTML = nunjucks.renderString(nunjucksContainer.innerHTML, siteData);
	nunjucksContainer.style.display = '';
	document.querySelector('input[type="text"]').focus();
	Array.prototype.forEach.call(document.querySelectorAll('div.crypto-block'), (cryptoBlock, index) => {
		var coin = cryptoBlock.querySelector('span.symbol').innerHTML;
		const balance = Number(cryptoBlock.querySelector('span.balance').innerHTML);
		const valueSpan = cryptoBlock.querySelector('span.value');
		const totalValueSpan = cryptoBlock.querySelector('span.total-value');
		getJSON('https://coincap.io/page/' + coin, (err, data) => {
			valueSpan.innerHTML = '$' + Number(Math.round(data.price + 'e2') + 'e-2').toFixed(2);
			totalValueSpan.innerHTML = '$' + (Number(valueSpan.innerHTML.replace('$', '')) * balance).toFixed(2);
		});
	});
});
const socket = io.connect('http://socket.coincap.io');
socket.on('trades', (tradeMsg) => {
	var coinBlock = document.querySelector('div#crypto-ticker div.crypto-block.' + (isNaN(tradeMsg.coin.charAt(0)) ? '' : '\\3') + tradeMsg.coin);
	if (coinBlock !== null) {
		var priceBlock = coinBlock.querySelector('span.value');
		var oldPrice = Number(priceBlock.innerHTML.substring(1));
		var newPrice = Number(Math.round(tradeMsg.message.msg.price + 'e2') + 'e-2');
		if (oldPrice !== newPrice) {
			coinBlock.style.transition = 'color 250ms linear';
			setTimeout(() => {
				coinBlock.querySelector('span.value').innerHTML = '$' + newPrice.toFixed(2);
				coinBlock.querySelector('span.total-value').innerHTML = '$' + (newPrice * Number(coinBlock.querySelector('span.balance').innerHTML)).toFixed(2);
			}, 200);
			coinBlock.classList.add((newPrice >= oldPrice ? 'green-text': 'red-text'));
			setTimeout(() => {
				coinBlock.style.transition = 'color 1000ms linear';
				coinBlock.classList.remove('green-text');
				coinBlock.classList.remove('red-text');
			}, 1000);
		}
	}
});
