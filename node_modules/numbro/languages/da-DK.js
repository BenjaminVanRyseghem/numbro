/*!
 * numbro.js language configuration
 * language : Danish
 * locale: Denmark
 * author : Michael Storgaard : https://github.com/mstorgaard
 */

module.exports = {
    languageTag: "da-DK",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "t",
        million: "mio",
        billion: "mia",
        trillion: "b"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "kr",
        position: "postfix",
        code: "DKK"
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
            output: "currency",
            mantissa: 2,
            spaceSeparated: true,
            thousandSeparated: true
        },
        fullWithTwoDecimalsNoCurrency: {
            mantissa: 2,
            thousandSeparated: true
        },
        fullWithNoDecimals: {
            output: "currency",
            spaceSeparated: true,
            thousandSeparated: true,
            mantissa: 0
        }
    }
};
