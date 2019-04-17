/*!
 * numbro.js language configuration
 * language : Turkish
 * locale : Turkey
 * author : Ecmel Ercan : https://github.com/ecmel,
 *          Erhan Gundogan : https://github.com/erhangundogan,
 *          Burak Yiğit Kaya: https://github.com/BYK
 */

const suffixes = {
    1: "'inci",
    5: "'inci",
    8: "'inci",
    70: "'inci",
    80: "'inci",

    2: "'nci",
    7: "'nci",
    20: "'nci",
    50: "'nci",

    3: "'üncü",
    4: "'üncü",
    100: "'üncü",

    6: "'ncı",

    9: "'uncu",
    10: "'uncu",
    30: "'uncu",

    40: "'ıncı",
    60: "'ıncı",
    90: "'ıncı"
};

module.exports = {
    languageTag: "tr-TR",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "bin",
        million: "milyon",
        billion: "milyar",
        trillion: "trilyon"
    },
    ordinal: number => {
        // special case for zero
        if (number === 0) {
            return "'ıncı";
        }

        let a = number % 10;
        let b = number % 100 - a;
        let c = number >= 100 ? 100 : null;

        return suffixes[a] || suffixes[b] || suffixes[c];
    },
    currency: {
        symbol: "\u20BA",
        position: "postfix",
        code: "TRY"
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
