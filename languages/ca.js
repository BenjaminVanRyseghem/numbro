/*!
 * numbro.js language configuration
 * language : Catalan
 * author : David Gölzhäuser : https://github.com/idoodler
 */

module.exports = {
    languageTag: "ca",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "k",
        million: "mm",
        billion: "b",
        trillion: "t"
    },
    ordinal: (number) => {
        if (isNaN(number) || number < 1) {
            return number;
          }
          const suffix = (number === 11 || number === 12 || number === 13) ? 'è' :
            (number % 10 === 1) ? 'r' :
            (number % 10 === 2) ? 'n' :
            (number % 10 === 3) ? 'r' :
            'è';
          return number + suffix;
    },
    currency: {
        symbol: "€",
        position: "postfix",
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
