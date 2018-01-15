/*!
 * numbro.js language configuration
 * language : Norwegian Bokmål (nb)
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    languageTag: "nb",
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
