/*!
 * numbro.js language configuration
 * language : German
 * locale: Austria
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    languageTag: "de-AT",
    delimiters: {
        thousands: " ",
        decimal: ","
    },
    abbreviations: {
        thousand: "k",
        million: "m",
        billion: "b",
        trillion: "t"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "€",
        code: "EUR"
    }
};
