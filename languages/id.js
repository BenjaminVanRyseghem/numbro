/*!
 * numbro.js language configuration
 * language : Indonesian
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    languageTag: "id",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "r",
        million: "j",
        billion: "m",
        trillion: "t"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "Rp",
        code: "IDR"
    }
};
