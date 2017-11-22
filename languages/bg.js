/*!
 * numbro.js language configuration
 * language : Bulgarian
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    languageTag: "bg",
    delimiters: {
        thousands: " ",
        decimal: ","
    },
    abbreviations: {
        thousand: "И",
        million: "А",
        billion: "M",
        trillion: "T"
    },
    ordinal: () => ".",
    currency: {
        symbol: "лв.",
        code: "BGN"
    }
};
