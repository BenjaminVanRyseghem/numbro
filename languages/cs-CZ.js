/*!
 * numbro.js language configuration
 * language : Czech
 * locale: Czech Republic
 * author : Jan Pesa : https://github.com/smajl (based on work from Anatoli Papirovski : https://github.com/apapirovski)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'cs-CZ',
        cultureCode: 'cs-CZ',
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
            symbol: 'Kč',
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
