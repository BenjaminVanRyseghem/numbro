/*!
 * to be compatible with numbro.js language configuration
 * language : Swedish (sv)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'sv',
        cultureCode: 'sv',
        delimiters: {
            thousands: ' ',
            decimal: ','
        },
        abbreviations: {
            thousand: 't',
            million: 'mln',
            billion: 'mld',
            trillion: 'b'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'kr'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('sv', language);
    }
}.call(typeof window === 'undefined' ? this : window));
