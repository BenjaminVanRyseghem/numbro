/*!
 * numeral.js language configuration
 * language : Romanian
 * author : Andrei Alecu https://github.com/andreialecu
 */

module.exports = {
    languageTag: "ro-RO",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "mii",
        million: "mil",
        billion: "mld",
        trillion: "bln"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: " lei",
        position: "postfix",
        code: "RON"
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
