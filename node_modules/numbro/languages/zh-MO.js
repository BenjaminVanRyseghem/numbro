/*!
 * numbro.js language configuration
 * language : Chinese traditional
 * locale: Macau
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    languageTag: "zh-MO",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "千",
        million: "百萬",
        billion: "十億",
        trillion: "兆"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "MOP",
        code: "MOP"
    }
};
