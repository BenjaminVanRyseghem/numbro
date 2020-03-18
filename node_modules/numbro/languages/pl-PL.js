/*!
 * numbro.js language configuration
 * language : Polish
 * locale : Poland
 * author : Dominik Bulaj : https://github.com/dominikbulaj
 */

module.exports = {
    languageTag: "pl-PL",
    delimiters: {
        thousands: " ",
        decimal: ","
    },
    abbreviations: {
        thousand: "tys.",
        million: "mln",
        billion: "mld",
        trillion: "bln"
    },
    ordinal: () => ".",
    currency: {
        symbol: " zł",
        position: "postfix",
        code: "PLN"
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
