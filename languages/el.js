/*!
 * numbro.js language configuration
 * language : Greek (el)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'el',
        cultureCode: 'el',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'χ',
            million: 'ε',
            billion: 'δ',
            trillion: 'τ'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: '€'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('el', language);
    }
}.call(typeof window === 'undefined' ? this : window));
