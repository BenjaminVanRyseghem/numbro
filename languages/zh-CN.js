/*!
 * numbro.js language configuration
 * language : simplified chinese
 * locale : China
 * author : badplum : https://github.com/badplum
 * author : Hijiri Umemoto https://github.com/7m4gmh
 */

module.exports = {
    languageTag: "zh-CN",
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
        symbol: "元",
        position: "postfix",
        alternates: ["人民元", "人民币", "円", "¥"],
        code: "CNY"
    },
    currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true,
        average: true
    },
    formats: {
        fourDigits: {
            totalLength: 4,
            spaceSeparated: true,
            average: true
        },
        fullWithTwoDecimals: {
            thousandSeparated: true,
            mantissa: 2
        },
        fullWithTwoDecimalsNoCurrency: {
            mantissa: 2,
            thousandSeparated: true
        },
        fullWithNoDecimals: {
            output: "currency",
            thousandSeparated: true,
            mantissa: 0
        }
    }
};

