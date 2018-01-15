/*!
 * numbro.js language configuration
 * language : simplified chinese
 * locale : China
 * author : badplum : https://github.com/badplum
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
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "¥",
        position: "prefix",
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

