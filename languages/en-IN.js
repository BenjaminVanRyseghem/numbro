/*!
 * numbro.js language configuration
 * language : English
 * locale: India
 * author : Kathiresan Senthil : https://github.com/theY2Kbug
 */


module.exports = {
    languageTag: "en-IN",
    delimiters: {
        thousands: ",",
        decimal: ".",
        thousandsSize: 2
    },
    abbreviations: {
        thousand: "k",
        lakh: "\u004c", //L
        crore: "\u0043\u0072" //Cr
    },
    ordinal: number => {
        let b = number % 10;
        return (~~(number % 100 / 10) === 1) ? "th" : (b === 1) ? "st" : (b === 2) ? "nd" : (b === 3) ? "rd" : "th";
    },
    currency: {
        symbol: "₹",
        position: "prefix",
        code: "INR"
    },
    currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: false,
        spaceSeparatedCurrency: false,
        average: true
    },
    formats: {
        fourDigits: {
            totalLength: 4,
            spaceSeparated: false,
            average: true
        },
        fullWithTwoDecimals: {
            output: "currency",
            thousandSeparated: true,
            spaceSeparated: false,
            mantissa: 2
        },
        fullWithTwoDecimalsNoCurrency: {
            mantissa: 2,
            thousandSeparated: true
        },
        fullWithNoDecimals: {
            output: "currency",
            thousandSeparated: true,
            spaceSeparated: false,
            mantissa: 0
        }
    }
};