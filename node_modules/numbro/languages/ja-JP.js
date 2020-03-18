/*!
 * numbro.js language configuration
 * language : Japanese
 * locale: Japan
 * author : teppeis : https://github.com/teppeis
 */

module.exports = {
    languageTag: "ja-JP",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "千",
        million: "百万",
        billion: "十億",
        trillion: "兆"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "¥",
        position: "prefix",
        code: "JPY"
    },
    currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true,
        spaceSeparatedCurrency: true,
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
