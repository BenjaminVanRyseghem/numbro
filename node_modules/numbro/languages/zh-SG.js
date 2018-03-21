/*!
 * numbro.js language configuration
 * language : Chinese simplified
 * locale: Singapore
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    languageTag: "zh-SG",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "千",
        million: "百万",
        billion: "十亿",
        trillion: "兆"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "$",
        code: "SGD"
    }
};
