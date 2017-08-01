/*!
 * numbro.js language configuration
 * language : Chinese (Simplified)
 * locale : Singapore
 * author : badplum : https://github.com/badplum
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'zh-SG',
        cultureCode: 'zh-SG',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '千',
            million: '百万',
            billion: '十亿',
            trillion: '兆'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '¥',
            position: 'prefix',
            code: 'SGD'
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
