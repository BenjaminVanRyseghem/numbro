/*!
 * numbro.js language configuration
 * language : Vietnamese
 * locale: Vietnam
 * author : Quoc-Anh Nguyen : https://github.com/imcvampire
 */

module.exports = {
    languageTag: "vi-VN",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "k",
        million: "m",
        billion: "b",
        trillion: "t"
    },
    ordinal: () => "",
    currency: {
        symbol: "?",
        position: "postfix",
        code: "VND"
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
            thousandSeparated: true,
            spaceSeparated: true,
            mantissa: 2
        },
        fullWithTwoDecimalsNoCurrency: {
            mantissa: 2,
            thousandSeparated: true
        },
        fullWithNoDecimals: {
            output: "currency",
            thousandSeparated: true,
            spaceSeparated: true,
            mantissa: 0
        }
    }
};
