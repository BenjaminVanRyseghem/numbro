/*!
+ * numbro.js language configuration
 * language : English
 * locale: Ireland
 * author : Tim McIntosh (StayinFront NZ)
 */

module.exports = {
    languageTag: "en-IE",
    delimiters: {
        thousands: ",",
        decimal: "."
    },
    abbreviations: {
        thousand: "k",
        million: "m",
        billion: "b",
        trillion: "t"
    },
    ordinal: number => {
        let b = number % 10;
        return (~~(number % 100 / 10) === 1) ? "th" : (b === 1) ? "st" : (b === 2) ? "nd" : (b === 3) ? "rd" : "th";
    },
    currency: {
        symbol: "€",
        code: "EUR"
    }
};
