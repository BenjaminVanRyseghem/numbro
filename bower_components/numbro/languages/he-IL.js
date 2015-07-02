/*!
 * numbro.js language configuration
 * language : Hebrew
 * locale : IL
 * author : Eli Zehavi : https://github.com/eli-zehavi
 */
(function () {
    'use strict';

    var language = {
        langLocaleCode: 'he-IL',
        delimiters: {
            thousands: ',',
            decimal: '.'
        },
        abbreviations: {
            thousand: 'אלף',
            million: 'מליון',
            billion: 'בליון',
            trillion: 'טריליון'
        },
        currency: {
            symbol: '₪',
            position: 'prefix'
        },
        defaults: {
            currencyFormat: ',0000 a'
        },
        formats: {
            fourDigits: '0000 a',
            fullWithTwoDecimals: '₪ ,0.00',
            fullWithTwoDecimalsNoCurrency: ',0.00',
            fullWithNoDecimals: '₪ ,0'
        }
    };

    // Node
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = language;
    }
    // Browser
    if (typeof window !== 'undefined' && this.numbro && this.numbro.language) {
        this.numbro.language(language.langLocaleCode, language);
    }
}());

