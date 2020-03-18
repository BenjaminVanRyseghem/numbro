/*!
 * numbro.js language configuration
 * language: Norwegian Bokmål
 * locale: Norway
 * author : Benjamin Van Ryseghem
 */

module.exports = {
    languageTag: "nb-NO",
    delimiters: {
        thousands: " ",
        decimal: ","
    },
    abbreviations: {
        thousand: "t",
        million: "M",
        billion: "md",
        trillion: "b"
    },
    ordinal: () => "",
    currency: {
        symbol: "kr",
        position: "postfix",
        code: "NOK"
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
