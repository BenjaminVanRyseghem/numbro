/*!
 * numbro.js language configuration
 * language : Vietnamese
 * locale: Vietnam
 * author : Pepijn Olivier : https://github.com/pepijnolivier
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'vi-VI',
        cultureCode: 'vi-VI',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: ' nghìn',
            million: ' triệu',
            billion: ' tỷ',
            trillion: ' nghìn tỷ'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '₫'
        },


        defaults: {
            currencyFormat: ',4 a'
        },
        formats: {
            fourDigits: '4 a',
            fullWithTwoDecimals: '$ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '$ ,0'
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
