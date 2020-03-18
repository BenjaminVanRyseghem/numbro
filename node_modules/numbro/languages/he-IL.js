/*!
 * numbro.js language configuration
 * language : Hebrew
 * locale : IL
 * author : Eli Zehavi : https://github.com/eli-zehavi
 */

module.exports = {
    languageTag: "he-IL",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "אלף",
        million: "מליון",
        billion: "בליון",
        trillion: "טריליון"
    },
    currency: {
        symbol: "₪",
        position: "prefix",
        code: "ILS"
    },
    ordinal: () => "",
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
