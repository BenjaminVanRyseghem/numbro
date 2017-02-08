/*!
 * numbro.js language configuration
 * language : Slovak
 * locale : Slovakia
 * author : Jan Pesa : https://github.com/smajl (based on work from Ahmed Al Hafoudh : http://www.freevision.sk)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'sk-SK',
        cultureCode: 'sk-SK',
        delimiters: {
            thousands: '\u00a0',
            decimal: ','
        },
        abbreviations: {
            thousand: 'tis.',
            million: 'mil.',
            billion: 'mld.',
            trillion: 'bil.'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€',
            position: 'postfix',
            spaceSeparated: true
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
