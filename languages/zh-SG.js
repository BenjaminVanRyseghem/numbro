/*!
 * numbro.js language configuration
 * language : Chinese simplified
 * locale: Singapore
 * author : Tim McIntosh (StayinFront NZ)
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
            symbol: '$'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && window.numbro && window.numbro.culture) {
        window.numbro.culture('zh-SG', language);
    }
}.call(typeof window === 'undefined' ? this : window));
