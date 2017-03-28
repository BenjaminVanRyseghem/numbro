/*!
 * numbro.js language configuration
 * language : Serbian (sr)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'sr',
        cultureCode: 'sr',
        delimiters: {
            thousands: '.',
            decimal: ','
        },
        abbreviations: {
            thousand: 'тыс.',
            million: 'млн',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'RSD'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('sr', language);
    }
}());
