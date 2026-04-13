/*!
 * numbro.js language configuration
 * language : Chinese (Taiwan)
 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
 * author : Hijiri Umemoto https://github.com/7m4gmh
 */

module.exports = {
    languageTag: "zh-TW",
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
    abbreviationScheme: "cjk",
    abbreviationUnits: {
        man: 1e4,
        oku: 1e8,
        cho: 1e12
    },
    displayAbbreviations: {
        man: "萬",
        oku: "億",
        cho: "兆"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "圓",
        position: "postfix",
        alternates: ["新台幣", "NT$", "元"],
        code: "TWD"
    }
};
