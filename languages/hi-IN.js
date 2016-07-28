/*!
 * numbro.js language configuration
 * language : Hindi
 * locale : India
 * author : Herinson Rodrigues : https://github.com/herodrigues
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'hi-IN',
        cultureCode: 'hi-IN',
        delimiters: {
            thousands: ',',
            decimal: ','
        },
        abbreviations: {
            thousand: 'हज़ारार',
            million: 'लाख',
            billion: 'अरब',
            trillion: 'खरब'
        },
        ordinal: function () {
            return '';
        },
        currency: {
            symbol: '₹',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '₹ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '₹ ,0'
        }
    };

    // CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));

numbro.language('hi-IN');

var ret = numbro(15222232).formatCurrency();

document.getElementById('result').innerHTML = ret;
