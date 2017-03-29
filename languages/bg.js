/*!
 * numbro.js language configuration
 * language : Bulgarian
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'bg',
        cultureCode: 'bg',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 'И',
            million: 'А',
            billion: 'M',
            trillion: 'T'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'лв.'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        this.numbro.culture('bg', language);
    }
}.call(typeof window === 'undefined' ? this : window));
