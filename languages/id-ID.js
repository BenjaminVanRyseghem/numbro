/*!
 * numbro.js language configuration
 * language : Indonesian
 * author : Tim McIntosh (StayinFront NZ)
 * contributor : Gwyn Judd (gwynjudd), Kukuh Yoniatmoko (kukuhyoniatmoko), Ryan Faiz Sanie (ryanfaiz)
 */

module.exports = {
    languageTag: "id-ID",
    delimiters: {
        thousands: ".",
        decimal: ","
    },
    abbreviations: {
        thousand: "rb",
        million: "jt",
        billion: "M",
        trillion: "T"
    },
    ordinal: function() {
        return ".";
    },
    currency: {
        symbol: "Rp",
        position: "prefix",
        code: "IDR"
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
            thousandSeparated: true,
            mantissa: 2
        },
        fullWithTwoDecimalsNoCurrency: {
            mantissa: 2,
            thousandSeparated: true
        },
        fullWithNoDecimals: {
            output: "currency",
            thousandSeparated: true,
            mantissa: 0
        }
    }
};
