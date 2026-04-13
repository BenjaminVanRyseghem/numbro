/*!
 * numbro.js language configuration
 * language : Korean
 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
 * author : Hijiri Umemoto https://github.com/7m4gmh
 */

module.exports = {
    languageTag: "ko-KR",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "천",
        million: "백만",
        billion: "십억",
        trillion: "일조"
    },
    abbreviationScheme: "cjk",
    abbreviationUnits: {
        man: 1e4,
        oku: 1e8,
        cho: 1e12
    },
    displayAbbreviations: {
        man: "만",
        oku: "억",
        cho: "조"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "원",
        position: "postfix",
        alternates: ["Won", "₩"],
        code: "KRW"
    }
};
