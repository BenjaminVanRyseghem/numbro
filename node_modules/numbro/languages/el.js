/*!
 * numbro.js language configuration
 * language : Greek (el)
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    languageTag: "el",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "χ",
        million: "ε",
        billion: "δ",
        trillion: "τ"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "€",
        code: "EUR"
    }
};
