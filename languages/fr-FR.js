/*!
 * numbro.js language configuration
 * language : French
 * locale: France
 * author : Adam Draper : https://github.com/adamwdraper
 */

module.exports = {
    languageTag: "fr-FR",
    delimiters: {
        thousands: " ",
        decimal: ","
    },
    abbreviations: {
        thousand: "k",
        million: "M",
        billion: "Mrd",
        trillion: "billion"
    },
    ordinal: (number) => {
        return number === 1 ? "er" : "ème";
    },
    bytes: {
        binarySuffixes: ["o", "Kio", "Mio", "Gio", "Tio", "Pio", "Eio", "Zio", "Yio"],
        decimalSuffixes: ["o", "Ko", "Mo", "Go", "To", "Po", "Eo", "Zo", "Yo"]
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
