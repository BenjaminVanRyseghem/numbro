/*!
 * numeral.js language configuration
 * language : swedish - Sweden
 * author : Benjamin Van Ryseghem (benjamin.vanryseghem.com)
 */
(function() {
	var language = {
		delimiters: {
			thousands: ' ',
			decimal: ','
		},
		abbreviations: {
			thousand: 't',
			million: 'M',
			billion: 'md',
			trillion: 't'
		},
		currency: {
			symbol: 'kr',
			position: 'postfix'
		},
		defaults: {
			currencyFormat: ',0000 a'
		},
		formats: {
			fourDigits: '0000 a',
			fullWithTwoDecimals: ',0.00 $',
			fullWithTwoDecimalsNoCurrency: ',0.00',
			fullWithNoDecimals: ',0 $'
		}
	};

	// Node
	if (typeof module !== 'undefined' && module.exports) {
		module.exports = language;
	}
	// Browser
	if (typeof window !== 'undefined' && this.numeral && this.numeral.language) {
		this.numeral.language('sv-SE', language);
	}
}());