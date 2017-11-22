/*!
 * numbro.js language configuration
 * language : Norwegian Nynorsk (nn)
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    languageTag: "nn",
    delimiters: {
        thousands: " ",
        decimal: ","
    },
    abbreviations: {
        thousand: "t",
        million: "mil",
        billion: "mia",
        trillion: "b"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "kr",
        code: "NOK"
    }
};
