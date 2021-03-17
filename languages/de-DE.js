/*!
 * numbro.js language configuration
 * language : German
 * locale: Germany
 * author : Marco Krage : https://github.com/sinky
 *
 * Generally useful in Germany, Austria, Luxembourg, Belgium
 */

module.exports = {
    languageTag: "de-DE",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "k",
        million: "Mi",
        billion: "Ma",
        trillion: "Bi"
    },
    ordinal: function() {
        return ".";
    },
    spaceSeparated: true,
    currency: {
        symbol: "€",
        position: "postfix",
        code: "EUR"
    },
    currencyFormat: {
        totalLength: 4,
        thousandSeparated: true
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
