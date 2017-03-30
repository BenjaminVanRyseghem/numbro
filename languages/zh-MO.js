/*!
 * numbro.js language configuration
 * language : Chinese traditional
 * locale: Macau
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'zh-MO',
        cultureCode: 'zh-MO',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: '千',
            million: '百萬',
            billion: '十億',
            trillion: '兆'
        },
        ordinal: function () {
            return '.';
        },
        currency: {
            symbol: 'MOP'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('zh-MO', language);
    }
}());
