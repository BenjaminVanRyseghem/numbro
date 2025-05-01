/*!
 *Numbro.js Language Configuration
 *Language : Bangla
 *Country : Bangladesh
 * Contributor : https://github.com/samiul30
 */

module.exports = {
    languageTag: "bn-BD",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "K",
        million: "M",
        billion: "B",
        trillion: "T"
    },
    spaceSeparated: false,
    ordinal: function(number) {
        let b = number % 10;
        return (~~(number % 100 / 10) === 1) ? "th" : (b === 1) ? "st" : (b === 2) ? "nd" : (b === 3) ? "rd" : "th";
    },
    bytes: {
        binarySuffixes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"],
        decimalSuffixes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    },
    currency: {
        symbol: "৳",
        position: "prefix",
        code: "BDT"
    },
    currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true,
        spaceSeparatedCurrency: true
    },
    formats: {
        fourDigits: {
            totalLength: 4,
            spaceSeparated: true
        },
        fullWithTwoDecimals: {
            output: "currency",
            thousandSeparated: true,
            mantissa: 2
        },
        fullWithTwoDecimalsNoCurrency: {
            thousandSeparated: true,
            mantissa: 2
        },
        fullWithNoDecimals: {
            output: "currency",
            thousandSeparated: true,
            mantissa: 0
        }
    }
};
