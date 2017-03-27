/*!
 * numeral.js language configuration
 * language : Romanian
 * author : Andrei Alecu https://github.com/andreialecu
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'ro-RO',
        cultureCode: 'ro-RO',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'mii',
            million: 'mil',
            billion: 'mld',
            trillion: 'bln'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: ' lei',
            position: 'postfix'
        },
        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: ',0.00 $',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: ',0 $'
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
