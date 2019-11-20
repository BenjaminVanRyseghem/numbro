/*!
 * numbro.js language configuration
 * language : Chinese (Hong Kong)
 * author : Ryan Au : https://github.com/ryanau
 */

module.exports = {
    languageTag: "zh-HK",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "千",
        million: "百萬",
        billion: "十億",
        trillion: "萬億"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "$",
        position: "prefix",
        code: "HKD"
    }
};
