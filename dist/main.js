!function(a) {
    var e = {};

    function t(r) {
        if (e[r]) {
            return e[r].exports;
        }
        var o = e[r] = { i: r, l: !1, exports: {} };
        return a[r].call(o.exports, o, o.exports, t), o.l = !0, o.exports
    }

    t.m = a, t.c = e, t.d = function(a, e, r) {
        t.o(a, e) || Object.defineProperty(a, e, {
            enumerable: !0,
            get: r
        })
    }, t.r = function(a) {"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(a, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(a, "__esModule", { value: !0 })}, t.t = function(a, e) {
        if (1 & e && (a = t(a)), 8 & e) {
            return a;
        }
        if (4 & e && "object" == typeof a && a && a.__esModule) {
            return a;
        }
        var r = Object.create(null);
        if (t.r(r), Object.defineProperty(r, "default", {
            enumerable: !0,
            value: a
        }), 2 & e && "string" != typeof a) {
            for (var o in a) t.d(r, o, function(e) {return a[e]}.bind(null, o));
        }
        return r
    }, t.n = function(a) {
        var e = a && a.__esModule ? function() {return a.default} : function() {return a};
        return t.d(e, "a", e), e
    }, t.o = function(a, e) {return Object.prototype.hasOwnProperty.call(a, e)}, t.p = "", t(t.s = 1)
}([
    function(a, e) {
        /*!
 * numeral.js language configuration
 * language : Romanian
 * author : Andrei Alecu https://github.com/andreialecu
 */
        a.exports = {
            languageTag: "ro-RO",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "mii", million: "mil", billion: "mld", trillion: "bln" },
            ordinal: function() {return "."},
            currency: { symbol: " lei", position: "postfix", code: "RON" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e, t) {
        e["bg.js"] = t(2), e["cs-CZ.js"] = t(3), e["da-DK.js"] = t(4), e["de-AT.js"] = t(5), e["de-CH.js"] = t(6), e["de-DE.js"] = t(7), e["de-LI.js"] = t(8), e["el.js"] = t(9), e["en-AU.js"] = t(10), e["en-GB.js"] = t(11), e["en-IE.js"] = t(12), e["en-NZ.js"] = t(13), e["en-ZA.js"] = t(14), e["es-AR.js"] = t(15), e["es-CL.js"] = t(16), e["es-CO.js"] = t(17), e["es-CR.js"] = t(18), e["es-ES.js"] = t(19), e["es-MX.js"] = t(20), e["es-NI.js"] = t(21), e["es-PE.js"] = t(22), e["es-PR.js"] = t(23), e["es-SV.js"] = t(24), e["et-EE.js"] = t(25), e["fa-IR.js"] = t(26), e["fi-FI.js"] = t(27), e["fil-PH.js"] = t(28), e["fr-CA.js"] = t(29), e["fr-CH.js"] = t(30), e["fr-FR.js"] = t(31), e["he-IL.js"] = t(32), e["hu-HU.js"] = t(33), e["id.js"] = t(34), e["it-CH.js"] = t(35), e["it-IT.js"] = t(36), e["ja-JP.js"] = t(37), e["ko-KR.js"] = t(38), e["lv-LV.js"] = t(39), e["nb-NO.js"] = t(40), e["nb.js"] = t(41), e["nl-BE.js"] = t(42), e["nl-NL.js"] = t(43), e["nn.js"] = t(44), e["pl-PL.js"] = t(45), e["pt-BR.js"] = t(46), e["pt-PT.js"] = t(47), e["ro-RO.js"] = t(0), e["ro.js"] = t(48), e["ru-RU.js"] = t(49), e["ru-UA.js"] = t(50), e["sk-SK.js"] = t(51), e["sl.js"] = t(52), e["sr-Cyrl-RS.js"] = t(53), e["sv-SE.js"] = t(54), e["th-TH.js"] = t(55), e["tr-TR.js"] = t(56), e["uk-UA.js"] = t(57), e["zh-CN.js"] = t(58), e["zh-MO.js"] = t(59), e["zh-SG.js"] = t(60), e["zh-TW.js"] = t(61)
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Bulgarian
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "bg",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "И", million: "А", billion: "M", trillion: "T" },
            ordinal: () => ".",
            currency: { symbol: "лв.", code: "BGN" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Czech
 * locale: Czech Republic
 * author : Jan Pesa : https://github.com/smajl (based on work from Anatoli Papirovski : https://github.com/apapirovski)
 */
        a.exports = {
            languageTag: "cs-CZ",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "tis.", million: "mil.", billion: "mld.", trillion: "bil." },
            ordinal: function() {return "."},
            spaceSeparated: !0,
            currency: { symbol: "Kč", position: "postfix", code: "CZK" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Danish
 * locale: Denmark
 * author : Michael Storgaard : https://github.com/mstorgaard
 */
        a.exports = {
            languageTag: "da-DK",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "t", million: "mio", billion: "mia", trillion: "b" },
            ordinal: function() {return "."},
            currency: { symbol: "kr", position: "postfix", code: "DKK" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : German
 * locale: Austria
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "de-AT",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: function() {return "."},
            currency: { symbol: "€", code: "EUR" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : German
 * locale: Switzerland
 * author : Michael Piefel : https://github.com/piefel (based on work from Marco Krage : https://github.com/sinky)
 */
        a.exports = {
            languageTag: "de-CH",
            delimiters: { thousands: "’", decimal: "." },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: function() {return "."},
            currency: { symbol: "CHF", position: "postfix", code: "CHF" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : German
 * locale: Germany
 * author : Marco Krage : https://github.com/sinky
 *
 * Generally useful in Germany, Austria, Luxembourg, Belgium
 */
        a.exports = {
            languageTag: "de-DE",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: function() {return "."},
            spaceSeparated: !0,
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: { totalLength: 4, thousandSeparated: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : German
 * locale: Liechtenstein
 * author : Michael Piefel : https://github.com/piefel (based on work from Marco Krage : https://github.com/sinky)
 */
        a.exports = {
            languageTag: "de-LI",
            delimiters: { thousands: "'", decimal: "." },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: function() {return "."},
            currency: { symbol: "CHF", position: "postfix", code: "CHF" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Greek (el)
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "el",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "χ", million: "ε", billion: "δ", trillion: "τ" },
            ordinal: function() {return "."},
            currency: { symbol: "€", code: "EUR" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : English
 * locale: Australia
 * author : Benedikt Huss : https://github.com/ben305
 */
        a.exports = {
            languageTag: "en-AU",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 == ~~(a % 100 / 10) ? "th" : 1 === e ? "st" : 2 === e ? "nd" : 3 === e ? "rd" : "th"
            },
            currency: { symbol: "$", position: "prefix", code: "AUD" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { thousandSeparated: !0, mantissa: 2 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : English
 * locale: United Kingdom of Great Britain and Northern Ireland
 * author : Dan Ristic : https://github.com/dristic
 */
        a.exports = {
            languageTag: "en-GB",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 == ~~(a % 100 / 10) ? "th" : 1 === e ? "st" : 2 === e ? "nd" : 3 === e ? "rd" : "th"
            },
            currency: { symbol: "£", position: "prefix", code: "GBP" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", thousandSeparated: !0, spaceSeparated: !0, mantissa: 2 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", thousandSeparated: !0, spaceSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
+ * numbro.js language configuration
 * language : English
 * locale: Ireland
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "en-IE",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 == ~~(a % 100 / 10) ? "th" : 1 === e ? "st" : 2 === e ? "nd" : 3 === e ? "rd" : "th"
            },
            currency: { symbol: "€", code: "EUR" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : English
 * locale: New Zealand
 * author : Benedikt Huss : https://github.com/ben305
 */
        a.exports = {
            languageTag: "en-NZ",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 == ~~(a % 100 / 10) ? "th" : 1 === e ? "st" : 2 === e ? "nd" : 3 === e ? "rd" : "th"
            },
            currency: { symbol: "$", position: "prefix", code: "NZD" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { thousandSeparated: !0, mantissa: 2 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : English
 * locale: South Africa
 * author : Stewart Scott https://github.com/stewart42
 */
        a.exports = {
            languageTag: "en-ZA",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 == ~~(a % 100 / 10) ? "th" : 1 === e ? "st" : 2 === e ? "nd" : 3 === e ? "rd" : "th"
            },
            currency: { symbol: "R", position: "prefix", code: "ZAR" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { thousandSeparated: !0, mantissa: 2 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Argentina
 * author : Hernan Garcia : https://github.com/hgarcia
 */
        a.exports = {
            languageTag: "es-AR",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "$", position: "postfix", code: "ARS" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Chile
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
        a.exports = {
            languageTag: "es-CL",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "$", position: "prefix", code: "CLP" },
            currencyFormat: { output: "currency", thousandSeparated: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Colombia
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
        a.exports = {
            languageTag: "es-CO",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Costa Rica
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
        a.exports = {
            languageTag: "es-CR",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "₡", position: "postfix", code: "CRC" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Spain
 * author : Hernan Garcia : https://github.com/hgarcia
 */
        a.exports = {
            languageTag: "es-ES",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Mexico
 * author : Joe Bordes : https://github.com/joebordes
 */
        a.exports = {
            languageTag: "es-MX",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: function(a) {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "$", position: "postfix", code: "MXN" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Nicaragua
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
        a.exports = {
            languageTag: "es-NI",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "C$", position: "prefix", code: "NIO" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Peru
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
        a.exports = {
            languageTag: "es-PE",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "S/.", position: "prefix", code: "PEN" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: Puerto Rico
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
        a.exports = {
            languageTag: "es-PR",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "$", position: "prefix", code: "USD" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Spanish
 * locale: El Salvador
 * author : Gwyn Judd : https://github.com/gwynjudd
 */
        a.exports = {
            languageTag: "es-SV",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "mm", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 === e || 3 === e ? "er" : 2 === e ? "do" : 7 === e || 0 === e ? "mo" : 8 === e ? "vo" : 9 === e ? "no" : "to"
            },
            currency: { symbol: "$", position: "prefix", code: "SVC" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Estonian
 * locale: Estonia
 * author : Illimar Tambek : https://github.com/ragulka
 *
 * Note: in Estonian, abbreviations are always separated
 * from numbers with a space
 */
        a.exports = {
            languageTag: "et-EE",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "tuh", million: "mln", billion: "mld", trillion: "trl" },
            ordinal: function() {return "."},
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Farsi
 * locale: Iran
 * author : neo13 : https://github.com/neo13
 */
        a.exports = {
            languageTag: "fa-IR",
            delimiters: { thousands: "،", decimal: "." },
            abbreviations: { thousand: "هزار", million: "میلیون", billion: "میلیارد", trillion: "تریلیون" },
            ordinal: function() {return "ام"},
            currency: { symbol: "﷼", code: "IRR" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Finnish
 * locale: Finland
 * author : Sami Saada : https://github.com/samitheberber
 */
        a.exports = {
            languageTag: "fi-FI",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "k", million: "M", billion: "G", trillion: "T" },
            ordinal: function() {return "."},
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Filipino (Pilipino)
 * locale: Philippines
 * author : Michael Abadilla : https://github.com/mjmaix
 */
        a.exports = {
            languageTag: "fil-PH",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: a => {
                let e = a % 10;
                return 1 == ~~(a % 100 / 10) ? "th" : 1 === e ? "st" : 2 === e ? "nd" : 3 === e ? "rd" : "th"
            },
            currency: { symbol: "₱", code: "PHP" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : French
 * locale: Canada
 * author : Léo Renaud-Allaire : https://github.com/renaudleo
 */
        a.exports = {
            languageTag: "fr-CA",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "k", million: "M", billion: "G", trillion: "T" },
            ordinal: a => 1 === a ? "er" : "ème",
            spaceSeparated: !0,
            currency: { symbol: "$", position: "postfix", code: "USD" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { thousandSeparated: !0, mantissa: 2 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : French
 * locale: Switzerland
 * author : Adam Draper : https://github.com/adamwdraper
 */
        a.exports = {
            languageTag: "fr-CH",
            delimiters: { thousands: " ", decimal: "." },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: a => 1 === a ? "er" : "ème",
            currency: { symbol: "CHF", position: "postfix", code: "CHF" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : French
 * locale: France
 * author : Adam Draper : https://github.com/adamwdraper
 */
        a.exports = {
            languageTag: "fr-FR",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: a => 1 === a ? "er" : "ème",
            bytes: {
                binarySuffixes: ["o", "Kio", "Mio", "Gio", "Tio", "Pio", "Eio", "Zio", "Yio"],
                decimalSuffixes: ["o", "Ko", "Mo", "Go", "To", "Po", "Eo", "Zo", "Yo"]
            },
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Hebrew
 * locale : IL
 * author : Eli Zehavi : https://github.com/eli-zehavi
 */
        a.exports = {
            languageTag: "he-IL",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "אלף", million: "מליון", billion: "בליון", trillion: "טריליון" },
            currency: { symbol: "₪", position: "prefix", code: "ILS" },
            ordinal: () => "",
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Hungarian
 * locale: Hungary
 * author : Peter Bakondy : https://github.com/pbakondy
 */
        a.exports = {
            languageTag: "hu-HU",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "E", million: "M", billion: "Mrd", trillion: "T" },
            ordinal: function() {return "."},
            currency: { symbol: "Ft", position: "postfix", code: "HUF" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Indonesian
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "id",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "r", million: "j", billion: "m", trillion: "t" },
            ordinal: function() {return "."},
            currency: { symbol: "Rp", code: "IDR" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Italian
 * locale: Switzerland
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "it-CH",
            delimiters: { thousands: "'", decimal: "." },
            abbreviations: { thousand: "mila", million: "mil", billion: "b", trillion: "t" },
            ordinal: function() {return "°"},
            currency: { symbol: "CHF", code: "CHF" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Italian
 * locale: Italy
 * author : Giacomo Trombi : http://cinquepunti.it
 */
        a.exports = {
            languageTag: "it-IT",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "mila", million: "mil", billion: "b", trillion: "t" },
            ordinal: function() {return "º"},
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Japanese
 * locale: Japan
 * author : teppeis : https://github.com/teppeis
 */
        a.exports = {
            languageTag: "ja-JP",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "千", million: "百万", billion: "十億", trillion: "兆" },
            ordinal: function() {return "."},
            currency: { symbol: "¥", position: "prefix", code: "JPY" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { thousandSeparated: !0, mantissa: 2 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Korean
 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
 */
        a.exports = {
            languageTag: "ko-KR",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "천", million: "백만", billion: "십억", trillion: "일조" },
            ordinal: function() {return "."},
            currency: { symbol: "₩", code: "KPW" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Latvian
 * locale: Latvia
 * author : Lauris Bukšis-Haberkorns : https://github.com/Lafriks
 */
        a.exports = {
            languageTag: "lv-LV",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "tūkst.", million: "milj.", billion: "mljrd.", trillion: "trilj." },
            ordinal: function() {return "."},
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language: Norwegian Bokmål
 * locale: Norway
 * author : Benjamin Van Ryseghem
 */
        a.exports = {
            languageTag: "nb-NO",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "t", million: "M", billion: "md", trillion: "b" },
            ordinal: () => "",
            currency: { symbol: "kr", position: "postfix", code: "NOK" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Norwegian Bokmål (nb)
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "nb",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "t", million: "mil", billion: "mia", trillion: "b" },
            ordinal: function() {return "."},
            currency: { symbol: "kr", code: "NOK" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Dutch
 * locale: Belgium
 * author : Dieter Luypaert : https://github.com/moeriki
 */
        a.exports = {
            languageTag: "nl-BE",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "k", million: "mln", billion: "mld", trillion: "bln" },
            ordinal: a => {
                let e = a % 100;
                return 0 !== a && e <= 1 || 8 === e || e >= 20 ? "ste" : "de"
            },
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Dutch
 * locale: Netherlands
 * author : Dave Clayton : https://github.com/davedx
 */
        a.exports = {
            languageTag: "nl-NL",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "k", million: "mln", billion: "mrd", trillion: "bln" },
            ordinal: a => {
                let e = a % 100;
                return 0 !== a && e <= 1 || 8 === e || e >= 20 ? "ste" : "de"
            },
            currency: { symbol: "€", position: "prefix", code: "EUR" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Norwegian Nynorsk (nn)
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "nn",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "t", million: "mil", billion: "mia", trillion: "b" },
            ordinal: function() {return "."},
            currency: { symbol: "kr", code: "NOK" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Polish
 * locale : Poland
 * author : Dominik Bulaj : https://github.com/dominikbulaj
 */
        a.exports = {
            languageTag: "pl-PL",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "tys.", million: "mln", billion: "mld", trillion: "bln" },
            ordinal: () => ".",
            currency: { symbol: " zł", position: "postfix", code: "PLN" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Portuguese
 * locale : Brazil
 * author : Ramiro letandas Jr : https://github.com/ramirovjr
 */
        a.exports = {
            languageTag: "pt-BR",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "mil", million: "milhões", billion: "b", trillion: "t" },
            ordinal: function() {return "º"},
            currency: { symbol: "R$", position: "prefix", code: "BRL" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Portuguese
 * locale : Portugal
 * author : Diogo Resende : https://github.com/dresende
 */
        a.exports = {
            languageTag: "pt-PT",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "k", million: "m", billion: "b", trillion: "t" },
            ordinal: function() {return "º"},
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e, t) {
        /*!
 * numbro.js language configuration
 * language : Romanian (ro)
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = t(0)
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Russian
 * locale : Russsia
 * author : Anatoli Papirovski : https://github.com/apapirovski
 */
        a.exports = {
            languageTag: "ru-RU",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "тыс.", million: "млн", billion: "b", trillion: "t" },
            ordinal: function() {return "."},
            currency: { symbol: "руб.", position: "postfix", code: "RUB" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Russian
 * locale : Ukraine
 * author : Anatoli Papirovski : https://github.com/apapirovski
 */
        a.exports = {
            languageTag: "ru-UA",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "тыс.", million: "млн", billion: "b", trillion: "t" },
            ordinal: function() {return "."},
            currency: { symbol: "₴", position: "postfix", code: "UAH" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Slovak
 * locale : Slovakia
 * author : Jan Pesa : https://github.com/smajl (based on work from Ahmed Al Hafoudh : http://www.freevision.sk)
 */
        a.exports = {
            languageTag: "sk-SK",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "tis.", million: "mil.", billion: "mld.", trillion: "bil." },
            ordinal: function() {return "."},
            spaceSeparated: !0,
            currency: { symbol: "€", position: "postfix", code: "EUR" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Slovene
 * locale: Slovenia
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "sl",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "tis.", million: "mil.", billion: "b", trillion: "t" },
            ordinal: function() {return "."},
            currency: { symbol: "€", code: "EUR" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Serbian (sr)
 * country : Serbia (Cyrillic)
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "sr-Cyrl-RS",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "тыс.", million: "млн", billion: "b", trillion: "t" },
            ordinal: () => ".",
            currency: { symbol: "RSD", code: "RSD" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Swedish
 * locale : Sweden
 * author : Benjamin Van Ryseghem (benjamin.vanryseghem.com)
 */
        a.exports = {
            languageTag: "sv-SE",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "t", million: "M", billion: "md", trillion: "tmd" },
            ordinal: () => "",
            currency: { symbol: "kr", position: "postfix", code: "SEK" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Thai
 * locale : Thailand
 * author : Sathit Jittanupat : https://github.com/jojosati
 */
        a.exports = {
            languageTag: "th-TH",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "พัน", million: "ล้าน", billion: "พันล้าน", trillion: "ล้านล้าน" },
            ordinal: function() {return "."},
            currency: { symbol: "฿", position: "postfix", code: "THB" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Turkish
 * locale : Turkey
 * author : Ecmel Ercan : https://github.com/ecmel,
 *          Erhan Gundogan : https://github.com/erhangundogan,
 *          Burak Yiğit Kaya: https://github.com/BYK
 */
        const t = {
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
        a.exports = {
            languageTag: "tr-TR",
            delimiters: { thousands: ".", decimal: "," },
            abbreviations: { thousand: "bin", million: "milyon", billion: "milyar", trillion: "trilyon" },
            ordinal: a => {
                if (0 === a) {
                    return "'ıncı";
                }
                let e = a % 10;
                return t[e] || t[a % 100 - e] || t[a >= 100 ? 100 : null]
            },
            currency: { symbol: "₺", position: "postfix", code: "TRY" },
            currencyFormat: {
                thousandSeparated: !0,
                totalLength: 4,
                spaceSeparated: !0,
                spaceSeparatedCurrency: !0,
                average: !0
            },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Ukrainian
 * locale : Ukraine
 * author : Michael Piefel : https://github.com/piefel (with help from Tetyana Kuzmenko)
 */
        a.exports = {
            languageTag: "uk-UA",
            delimiters: { thousands: " ", decimal: "," },
            abbreviations: { thousand: "тис.", million: "млн", billion: "млрд", trillion: "блн" },
            ordinal: () => "",
            currency: { symbol: "₴", position: "postfix", code: "UAH" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { output: "currency", mantissa: 2, spaceSeparated: !0, thousandSeparated: !0 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", spaceSeparated: !0, thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : simplified chinese
 * locale : China
 * author : badplum : https://github.com/badplum
 */
        a.exports = {
            languageTag: "zh-CN",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "千", million: "百万", billion: "十亿", trillion: "兆" },
            ordinal: function() {return "."},
            currency: { symbol: "¥", position: "prefix", code: "CNY" },
            currencyFormat: { thousandSeparated: !0, totalLength: 4, spaceSeparated: !0, average: !0 },
            formats: {
                fourDigits: { totalLength: 4, spaceSeparated: !0, average: !0 },
                fullWithTwoDecimals: { thousandSeparated: !0, mantissa: 2 },
                fullWithTwoDecimalsNoCurrency: { mantissa: 2, thousandSeparated: !0 },
                fullWithNoDecimals: { output: "currency", thousandSeparated: !0, mantissa: 0 }
            }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Chinese traditional
 * locale: Macau
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "zh-MO",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "千", million: "百萬", billion: "十億", trillion: "兆" },
            ordinal: function() {return "."},
            currency: { symbol: "MOP", code: "MOP" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Chinese simplified
 * locale: Singapore
 * author : Tim McIntosh (StayinFront NZ)
 */
        a.exports = {
            languageTag: "zh-SG",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "千", million: "百万", billion: "十亿", trillion: "兆" },
            ordinal: function() {return "."},
            currency: { symbol: "$", code: "SGD" }
        }
    }, function(a, e) {
        /*!
 * numbro.js language configuration
 * language : Chinese (Taiwan)
 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
 */
        a.exports = {
            languageTag: "zh-TW",
            delimiters: { thousands: ",", decimal: "." },
            abbreviations: { thousand: "千", million: "百萬", billion: "十億", trillion: "兆" },
            ordinal: function() {return "第"},
            currency: { symbol: "NT$", code: "TWD" }
        }
    }
]);
