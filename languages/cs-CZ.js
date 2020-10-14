/*!
 * numbro.js language configuration
 * language : Czech
 * locale: Czech Republic
 * author : Jan Pesa : https://github.com/smajl (based on work from Anatoli Papirovski : https://github.com/apapirovski)
 */

module.exports = {
    languageTag: "cs-CZ",
    delimiters: {
        thousands: "\u00a0",
        decimal: ","
    },
    abbreviations: {
        thousand: "tis.",
        million: "mil.",
        billion: "mld.",
        trillion: "bil."
    },
    ordinal: function() {
        return ".";
    },
    spaceSeparated: true,
    currency: {
        symbol: "Kč",
        position: "postfix",
        code: "CZK"
    },
    currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true,
        spaceSeparatedCurrency: true,
        spaceSeparatedAbbreviation: true,
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
