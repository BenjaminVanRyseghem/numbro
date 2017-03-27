/*!
 * numbro.js language configuration
 * language : Italian
 * locale: Switzerland
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'it-CH',
        cultureCode: 'it-CH',
        delimiters: {
            thousands: '\'',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'mila',
            million: 'mil',
            billion: 'b',
            trillion: 't'
        },
        ordinal: function () {
            return '°';
        },
        currency: {
            symbol: 'CHF'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('it-CH', language);
    }
}.call(typeof window === 'undefined' ? this : window));
