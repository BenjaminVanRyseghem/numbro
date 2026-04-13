/*!
 * numbro.js language configuration
 * language : Chinese simplified
 * locale: Singapore
 * author : Tim McIntosh (StayinFront NZ)
 * author : Hijiri Umemoto https://github.com/7m4gmh
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
    abbreviationScheme: "cjk",
    abbreviationUnits: {
        man: 1e4,
        oku: 1e8,
        cho: 1e12
    },
    displayAbbreviations: {
        man: "万",
        oku: "亿",
        cho: "兆"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "$",
        position: "prefix",
        alternates: ["新加坡元", "S$", "SG$", "SGD", "元"],
        code: "SGD"
    }
};
