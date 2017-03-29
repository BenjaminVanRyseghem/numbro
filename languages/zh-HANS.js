/*!
 * numbro.js language configuration
 * language : Chinese simplified (zh-HANS)
 * author : Tim McIntosh (StayinFront NZ)
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'zh-HANS',
        cultureCode: 'zh-HANS',
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
            symbol: '¥'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && this.numbro && this.numbro.culture) {
        this.numbro.culture('zh-HANS', language);
    }
}());
