/*!
 * numbro.js language configuration
 * language : Japanese
 * locale: Japan
 * author : teppeis : https://github.com/teppeis
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'ja-JP',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '千',
            million: '百万',
            billion: '十億',
            trillion: '兆'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '¥',
            position: 'prefix',
            spaceSeparated: true
        },
        defaults: {
            currencyFormat: ',0000 a'
        },
        formats: {
            fourDigits: '0000 a',
            fullWithTwoDecimals: '$ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '$ ,0'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.language) {
        window.numbro.language(language.langLocaleCode, language);
    }
}.call(typeof window === 'undefined' ? this : window));
