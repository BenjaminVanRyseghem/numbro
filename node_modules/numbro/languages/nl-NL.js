/*!
 * numbro.js language configuration
 * language : Dutch
 * locale: Netherlands
 * author : Dave Clayton : https://github.com/davedx
 */

module.exports = {
    languageTag: "nl-NL",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "k",
        million: "mln",
        billion: "mrd",
        trillion: "bln"
    },
    ordinal: (number) => {
        let remainder = number % 100;
        return (number !== 0 && remainder <= 1 || remainder === 8 || remainder >= 20) ? "ste" : "de";
    },
    currency: {
        symbol: "€",
        position: "prefix",
        code: "EUR"
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
