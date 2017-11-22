/*!
 * numbro.js language configuration
 * language : Korean
 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
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
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "₩",
        code: "KPW"
    }
};
