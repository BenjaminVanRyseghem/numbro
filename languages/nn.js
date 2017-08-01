/*!
 * numbro.js language configuration
 * language : Norwegian Nynorsk (nn)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'nn',
        cultureCode: 'nn',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 't',
            million: 'mil',
            billion: 'mia',
            trillion: 'b'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'kr',
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

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture(language.cultureCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));
