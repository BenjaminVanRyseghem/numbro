/*!
 * numbro.js language configuration
 * language : Swedish
 * locale : Sweden
 * author : Benjamin Van Ryseghem (benjamin.vanryseghem.com)
 */

module.exports = {
    languageTag: "sv-SE",
    delimiters: {
        thousands: " ",
        decimal: ","
    },
    abbreviations: {
        thousand: "t",
        million: "M",
        billion: "md",
        trillion: "tmd"
    },
    ordinal: () => "",
    currency: {
        symbol: "kr",
        position: "postfix",
        code: "SEK"
    },
    currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true,
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
