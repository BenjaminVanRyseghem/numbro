/*!
 * numbro.js language configuration
 * language : Uzbek
 * locale : Uzbekistan
 * author : Kairat Sultan : https://github.com/qayrat-sultan
 */

module.exports = {
    languageTag: "uz-UZ",
    delimiters: {
        thousands: " ",
        decimal: ","
    },
    abbreviations: {
        thousand: "ming",
        million: "mln",
        billion: "mlrd",
        trillion: "trln"
    },
    ordinal: function() {
        // not ideal, but since in Uzbek it can taken on
        // different forms (masculine, feminine, neuter)
        // this is all we can do
        return ".";
    },
    currency: {
        symbol: "soʻm.",
        position: "postfix",
        code: "UZS"
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
