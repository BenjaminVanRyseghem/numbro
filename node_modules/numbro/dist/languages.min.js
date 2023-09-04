!function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):((e="undefined"!=typeof globalThis?globalThis:e||self).numbro=e.numbro||{},e.numbro.allLanguages=t())}(this,(function(){"use strict";"undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self&&self;function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}var t={},a={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Bulgarian
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"bg",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"И",million:"А",billion:"M",trillion:"T"},ordinal:()=>".",currency:{symbol:"лв.",code:"BGN"}})}()}(a);var r=a.exports,o={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Czech
			 * locale: Czech Republic
			 * author : Jan Pesa : https://github.com/smajl (based on work from Anatoli Papirovski : https://github.com/apapirovski)
			 */return e({languageTag:"cs-CZ",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"tis.",million:"mil.",billion:"mld.",trillion:"bil."},ordinal:function(){return"."},spaceSeparated:!0,currency:{symbol:"Kč",position:"postfix",code:"CZK"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,spaceSeparatedAbbreviation:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(o);var n=o.exports,s={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Danish
			 * locale: Denmark
			 * author : Michael Storgaard : https://github.com/mstorgaard
			 */return e({languageTag:"da-DK",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"t",million:"mio",billion:"mia",trillion:"b"},ordinal:function(){return"."},currency:{symbol:"kr",position:"postfix",code:"DKK"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(s);var i=s.exports,u={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : German
			 * locale: Austria
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"de-AT",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"€",code:"EUR"}})}()}(u);var l=u.exports,c={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : German
			 * locale: Switzerland
			 * author : Michael Piefel : https://github.com/piefel (based on work from Marco Krage : https://github.com/sinky)
			 */return e({languageTag:"de-CH",delimiters:{thousands:"’",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"CHF",position:"postfix",code:"CHF"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(c);var d=c.exports,p={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : German
			 * locale: Germany
			 * author : Marco Krage : https://github.com/sinky
			 *
			 * Generally useful in Germany, Austria, Luxembourg, Belgium
			 */return e({languageTag:"de-DE",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"k",million:"Mi",billion:"Ma",trillion:"Bi"},ordinal:function(){return"."},spaceSeparated:!0,currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{totalLength:4,thousandSeparated:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(p);var m=p.exports,f={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : German
			 * locale: Liechtenstein
			 * author : Michael Piefel : https://github.com/piefel (based on work from Marco Krage : https://github.com/sinky)
			 */return e({languageTag:"de-LI",delimiters:{thousands:"'",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"CHF",position:"postfix",code:"CHF"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(f);var h=f.exports,y={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Greek (el)
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"el",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"χ",million:"ε",billion:"δ",trillion:"τ"},ordinal:function(){return"."},currency:{symbol:"€",code:"EUR"}})}()}(y);var g=y.exports,S={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : English
			 * locale: Australia
			 * author : Benedikt Huss : https://github.com/ben305
			 */return e({languageTag:"en-AU",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1==~~(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th"},currency:{symbol:"$",position:"prefix",code:"AUD"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{thousandSeparated:!0,mantissa:2},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",thousandSeparated:!0,mantissa:0}}})}()}(S);var b=S.exports,x={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : English
			 * locale: United Kingdom of Great Britain and Northern Ireland
			 * author : Dan Ristic : https://github.com/dristic
			 */return e({languageTag:"en-GB",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1==~~(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th"},currency:{symbol:"£",position:"prefix",code:"GBP"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!1,spaceSeparatedCurrency:!1,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!1,average:!0},fullWithTwoDecimals:{output:"currency",thousandSeparated:!0,spaceSeparated:!1,mantissa:2},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",thousandSeparated:!0,spaceSeparated:!1,mantissa:0}}})}()}(x);var v=x.exports,D={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			+ * numbro.js language configuration
			 * language : English
			 * locale: Ireland
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"en-IE",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1==~~(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th"},currency:{symbol:"€",position:"prefix",code:"EUR"}})}()}(D);var T=D.exports,w={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : English
			 * locale: New Zealand
			 * author : Benedikt Huss : https://github.com/ben305
			 */return e({languageTag:"en-NZ",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1==~~(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th"},currency:{symbol:"$",position:"prefix",code:"NZD"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{thousandSeparated:!0,mantissa:2},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",thousandSeparated:!0,mantissa:0}}})}()}(w);var O=w.exports,W={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : English
			 * locale: South Africa
			 * author : Stewart Scott https://github.com/stewart42
			 */return e({languageTag:"en-ZA",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1==~~(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th"},currency:{symbol:"R",position:"prefix",code:"ZAR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{thousandSeparated:!0,mantissa:2},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",thousandSeparated:!0,mantissa:0}}})}()}(W);var _=W.exports,N={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: Argentina
			 * author : Hernan Garcia : https://github.com/hgarcia
			 */return e({languageTag:"es-AR",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"$",position:"postfix",code:"ARS"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(N);var C=N.exports,L={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: Chile
			 * author : Gwyn Judd : https://github.com/gwynjudd
			 */return e({languageTag:"es-CL",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"$",position:"prefix",code:"CLP"},currencyFormat:{output:"currency",thousandSeparated:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(L);var P=L.exports,M={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: Colombia
			 * author : Gwyn Judd : https://github.com/gwynjudd
			 */return e({languageTag:"es-CO",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(M);var j=M.exports,F={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: Costa Rica
			 * author : Gwyn Judd : https://github.com/gwynjudd
			 */return e({languageTag:"es-CR",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"₡",position:"postfix",code:"CRC"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(F);var R=F.exports,k={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: Spain
			 * author : Hernan Garcia : https://github.com/hgarcia
			 */return e({languageTag:"es-ES",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(k);var E=k.exports,U={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: Mexico
			 * author : Joe Bordes : https://github.com/joebordes
			 */return e({languageTag:"es-MX",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:function(e){let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"$",position:"postfix",code:"MXN"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(U);var H=U.exports,A={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: Nicaragua
			 * author : Gwyn Judd : https://github.com/gwynjudd
			 */return e({languageTag:"es-NI",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"C$",position:"prefix",code:"NIO"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(A);var I=A.exports,K={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: Peru
			 * author : Gwyn Judd : https://github.com/gwynjudd
			 */return e({languageTag:"es-PE",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"S/.",position:"prefix",code:"PEN"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(K);var B=K.exports,$={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: Puerto Rico
			 * author : Gwyn Judd : https://github.com/gwynjudd
			 */return e({languageTag:"es-PR",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"$",position:"prefix",code:"USD"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}($);var G=$.exports,Z={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Spanish
			 * locale: El Salvador
			 * author : Gwyn Judd : https://github.com/gwynjudd
			 */return e({languageTag:"es-SV",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"mm",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1===t||3===t?"er":2===t?"do":7===t||0===t?"mo":8===t?"vo":9===t?"no":"to"},currency:{symbol:"$",position:"prefix",code:"SVC"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(Z);var z=Z.exports,V={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Estonian
			 * locale: Estonia
			 * author : Illimar Tambek : https://github.com/ragulka
			 *
			 * Note: in Estonian, abbreviations are always separated
			 * from numbers with a space
			 */return e({languageTag:"et-EE",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"tuh",million:"mln",billion:"mld",trillion:"trl"},ordinal:function(){return"."},currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(V);var Y=V.exports,J={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Farsi
			 * locale: Iran
			 * author : neo13 : https://github.com/neo13
			 */return e({languageTag:"fa-IR",delimiters:{thousands:"،",decimal:"."},abbreviations:{thousand:"هزار",million:"میلیون",billion:"میلیارد",trillion:"تریلیون"},ordinal:function(){return"ام"},currency:{symbol:"﷼",code:"IRR"}})}()}(J);var X=J.exports,q={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Finnish
			 * locale: Finland
			 * author : Sami Saada : https://github.com/samitheberber
			 */return e({languageTag:"fi-FI",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"M",billion:"G",trillion:"T"},ordinal:function(){return"."},currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(q);var Q=q.exports,ee={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Filipino (Pilipino)
			 * locale: Philippines
			 * author : Michael Abadilla : https://github.com/mjmaix
			 */return e({languageTag:"fil-PH",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:e=>{let t=e%10;return 1==~~(e%100/10)?"th":1===t?"st":2===t?"nd":3===t?"rd":"th"},currency:{symbol:"₱",code:"PHP"}})}()}(ee);var te=ee.exports,ae={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : French
			 * locale: Canada
			 * author : Léo Renaud-Allaire : https://github.com/renaudleo
			 */return e({languageTag:"fr-CA",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"M",billion:"G",trillion:"T"},ordinal:e=>1===e?"er":"ème",spaceSeparated:!0,currency:{symbol:"$",position:"postfix",code:"USD"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{thousandSeparated:!0,mantissa:2},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",thousandSeparated:!0,mantissa:0}}})}()}(ae);var re=ae.exports,oe={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : French
			 * locale: Switzerland
			 * author : Adam Draper : https://github.com/adamwdraper
			 */return e({languageTag:"fr-CH",delimiters:{thousands:" ",decimal:"."},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:e=>1===e?"er":"ème",currency:{symbol:"CHF",position:"postfix",code:"CHF"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(oe);var ne=oe.exports,se={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : French
			 * locale: France
			 * author : Adam Draper : https://github.com/adamwdraper
			 */return e({languageTag:"fr-FR",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"M",billion:"Mrd",trillion:"billion"},ordinal:e=>1===e?"er":"ème",bytes:{binarySuffixes:["o","Kio","Mio","Gio","Tio","Pio","Eio","Zio","Yio"],decimalSuffixes:["o","Ko","Mo","Go","To","Po","Eo","Zo","Yo"]},currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(se);var ie=se.exports,ue={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Hebrew
			 * locale : IL
			 * author : Eli Zehavi : https://github.com/eli-zehavi
			 */return e({languageTag:"he-IL",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"אלף",million:"מיליון",billion:"מיליארד",trillion:"טריליון"},currency:{symbol:"₪",position:"prefix",code:"ILS"},ordinal:()=>"",currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(ue);var le=ue.exports,ce={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Hungarian
			 * locale: Hungary
			 * author : Peter Bakondy : https://github.com/pbakondy
			 */return e({languageTag:"hu-HU",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"E",million:"M",billion:"Mrd",trillion:"T"},ordinal:function(){return"."},currency:{symbol:"Ft",position:"postfix",code:"HUF"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(ce);var de=ce.exports,pe={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Indonesian
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"id",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"r",million:"j",billion:"m",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"Rp",code:"IDR"}})}()}(pe);var me=pe.exports,fe={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Italian
			 * locale: Switzerland
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"it-CH",delimiters:{thousands:"'",decimal:"."},abbreviations:{thousand:"mila",million:"mil",billion:"b",trillion:"t"},ordinal:function(){return"°"},currency:{symbol:"CHF",code:"CHF"}})}()}(fe);var he=fe.exports,ye={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Italian
			 * locale: Italy
			 * author : Giacomo Trombi : http://cinquepunti.it
			 */return e({languageTag:"it-IT",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"mila",million:"mil",billion:"b",trillion:"t"},ordinal:function(){return"º"},currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(ye);var ge=ye.exports,Se={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Japanese
			 * locale: Japan
			 * author : teppeis : https://github.com/teppeis
			 */return e({languageTag:"ja-JP",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"千",million:"百万",billion:"十億",trillion:"兆"},ordinal:function(){return"."},currency:{symbol:"¥",position:"prefix",code:"JPY"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{thousandSeparated:!0,mantissa:2},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",thousandSeparated:!0,mantissa:0}}})}()}(Se);var be=Se.exports,xe={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Korean
			 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
			 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
			 */return e({languageTag:"ko-KR",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"천",million:"백만",billion:"십억",trillion:"일조"},ordinal:function(){return"."},currency:{symbol:"₩",code:"KPW"}})}()}(xe);var ve=xe.exports,De={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Latvian
			 * locale: Latvia
			 * author : Lauris Bukšis-Haberkorns : https://github.com/Lafriks
			 */return e({languageTag:"lv-LV",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"tūkst.",million:"milj.",billion:"mljrd.",trillion:"trilj."},ordinal:function(){return"."},currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(De);var Te=De.exports,we={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language: Norwegian Bokmål
			 * locale: Norway
			 * author : Benjamin Van Ryseghem
			 */return e({languageTag:"nb-NO",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"t",million:"M",billion:"md",trillion:"b"},ordinal:()=>"",currency:{symbol:"kr",position:"postfix",code:"NOK"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(we);var Oe=we.exports,We={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Norwegian Bokmål (nb)
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"nb",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"t",million:"mil",billion:"mia",trillion:"b"},ordinal:function(){return"."},currency:{symbol:"kr",code:"NOK"}})}()}(We);var _e=We.exports,Ne={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Dutch
			 * locale: Belgium
			 * author : Dieter Luypaert : https://github.com/moeriki
			 */return e({languageTag:"nl-BE",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"mln",billion:"mld",trillion:"bln"},ordinal:e=>{let t=e%100;return 0!==e&&t<=1||8===t||t>=20?"ste":"de"},currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(Ne);var Ce=Ne.exports,Le={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Dutch
			 * locale: Netherlands
			 * author : Dave Clayton : https://github.com/davedx
			 */return e({languageTag:"nl-NL",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"k",million:"mln",billion:"mrd",trillion:"bln"},ordinal:e=>{let t=e%100;return 0!==e&&t<=1||8===t||t>=20?"ste":"de"},currency:{symbol:"€",position:"prefix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(Le);var Pe=Le.exports,Me={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Norwegian Nynorsk (nn)
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"nn",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"t",million:"mil",billion:"mia",trillion:"b"},ordinal:function(){return"."},currency:{symbol:"kr",code:"NOK"}})}()}(Me);var je=Me.exports,Fe={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Polish
			 * locale : Poland
			 * author : Dominik Bulaj : https://github.com/dominikbulaj
			 */return e({languageTag:"pl-PL",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"tys.",million:"mln",billion:"mld",trillion:"bln"},ordinal:()=>".",currency:{symbol:" zł",position:"postfix",code:"PLN"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(Fe);var Re=Fe.exports,ke={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Portuguese
			 * locale : Brazil
			 * author : Ramiro letandas Jr : https://github.com/ramirovjr
			 */return e({languageTag:"pt-BR",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"mil",million:"milhões",billion:"b",trillion:"t"},ordinal:function(){return"º"},currency:{symbol:"R$",position:"prefix",code:"BRL"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(ke);var Ee=ke.exports,Ue={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Portuguese
			 * locale : Portugal
			 * author : Diogo Resende : https://github.com/dresende
			 */return e({languageTag:"pt-PT",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"k",million:"m",billion:"b",trillion:"t"},ordinal:function(){return"º"},currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(Ue);var He=Ue.exports,Ae={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numeral.js language configuration
			 * language : Romanian
			 * author : Andrei Alecu https://github.com/andreialecu
			 */return e({languageTag:"ro-RO",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"mii",million:"mil",billion:"mld",trillion:"bln"},ordinal:function(){return"."},currency:{symbol:" lei",position:"postfix",code:"RON"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(Ae);var Ie=Ae.exports,Ke={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numeral.js language configuration
			 * language : Romanian
			 * author : Andrei Alecu https://github.com/andreialecu
			 */return e({languageTag:"ro-RO",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"mii",million:"mil",billion:"mld",trillion:"bln"},ordinal:function(){return"."},currency:{symbol:" lei",position:"postfix",code:"RON"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(Ke);var Be=Ke.exports,$e={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Russian
			 * locale : Russsia
			 * author : Anatoli Papirovski : https://github.com/apapirovski
			 */return e({languageTag:"ru-RU",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"тыс.",million:"млн",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"руб.",position:"postfix",code:"RUB"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}($e);var Ge=$e.exports,Ze={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Russian
			 * locale : Ukraine
			 * author : Anatoli Papirovski : https://github.com/apapirovski
			 */return e({languageTag:"ru-UA",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"тыс.",million:"млн",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"₴",position:"postfix",code:"UAH"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(Ze);var ze=Ze.exports,Ve={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Slovak
			 * locale : Slovakia
			 * author : Jan Pesa : https://github.com/smajl (based on work from Ahmed Al Hafoudh : http://www.freevision.sk)
			 */return e({languageTag:"sk-SK",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"tis.",million:"mil.",billion:"mld.",trillion:"bil."},ordinal:function(){return"."},spaceSeparated:!0,currency:{symbol:"€",position:"postfix",code:"EUR"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(Ve);var Ye=Ve.exports,Je={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Slovene
			 * locale: Slovenia
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"sl",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"tis.",million:"mil.",billion:"b",trillion:"t"},ordinal:function(){return"."},currency:{symbol:"€",code:"EUR"}})}()}(Je);var Xe=Je.exports,qe={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Serbian (sr)
			 * country : Serbia (Cyrillic)
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"sr-Cyrl-RS",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"тыс.",million:"млн",billion:"b",trillion:"t"},ordinal:()=>".",currency:{symbol:"RSD",code:"RSD"}})}()}(qe);var Qe=qe.exports,et={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Swedish
			 * locale : Sweden
			 * author : Benjamin Van Ryseghem (benjamin.vanryseghem.com)
			 */return e({languageTag:"sv-SE",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"t",million:"M",billion:"md",trillion:"tmd"},ordinal:()=>"",currency:{symbol:"kr",position:"postfix",code:"SEK"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(et);var tt=et.exports,at={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Thai
			 * locale : Thailand
			 * author : Sathit Jittanupat : https://github.com/jojosati
			 */return e({languageTag:"th-TH",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"พัน",million:"ล้าน",billion:"พันล้าน",trillion:"ล้านล้าน"},ordinal:function(){return"."},currency:{symbol:"฿",position:"postfix",code:"THB"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(at);var rt=at.exports,ot={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Turkish
			 * locale : Turkey
			 * author : Ecmel Ercan : https://github.com/ecmel,
			 *          Erhan Gundogan : https://github.com/erhangundogan,
			 *          Burak Yiğit Kaya: https://github.com/BYK
			 */const t={1:"'inci",5:"'inci",8:"'inci",70:"'inci",80:"'inci",2:"'nci",7:"'nci",20:"'nci",50:"'nci",3:"'üncü",4:"'üncü",100:"'üncü",6:"'ncı",9:"'uncu",10:"'uncu",30:"'uncu",40:"'ıncı",60:"'ıncı",90:"'ıncı"};return e({languageTag:"tr-TR",delimiters:{thousands:".",decimal:","},abbreviations:{thousand:"bin",million:"milyon",billion:"milyar",trillion:"trilyon"},ordinal:e=>{if(0===e)return"'ıncı";let a=e%10;return t[a]||t[e%100-a]||t[e>=100?100:null]},currency:{symbol:"₺",position:"postfix",code:"TRY"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,spaceSeparatedCurrency:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(ot);var nt=ot.exports,st={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Ukrainian
			 * locale : Ukraine
			 * author : Michael Piefel : https://github.com/piefel (with help from Tetyana Kuzmenko)
			 */return e({languageTag:"uk-UA",delimiters:{thousands:" ",decimal:","},abbreviations:{thousand:"тис.",million:"млн",billion:"млрд",trillion:"блн"},ordinal:()=>"",currency:{symbol:"₴",position:"postfix",code:"UAH"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{output:"currency",mantissa:2,spaceSeparated:!0,thousandSeparated:!0},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",spaceSeparated:!0,thousandSeparated:!0,mantissa:0}}})}()}(st);var it=st.exports,ut={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : simplified chinese
			 * locale : China
			 * author : badplum : https://github.com/badplum
			 */return e({languageTag:"zh-CN",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"千",million:"百万",billion:"十亿",trillion:"兆"},ordinal:function(){return"."},currency:{symbol:"¥",position:"prefix",code:"CNY"},currencyFormat:{thousandSeparated:!0,totalLength:4,spaceSeparated:!0,average:!0},formats:{fourDigits:{totalLength:4,spaceSeparated:!0,average:!0},fullWithTwoDecimals:{thousandSeparated:!0,mantissa:2},fullWithTwoDecimalsNoCurrency:{mantissa:2,thousandSeparated:!0},fullWithNoDecimals:{output:"currency",thousandSeparated:!0,mantissa:0}}})}()}(ut);var lt=ut.exports,ct={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Chinese traditional
			 * locale: Macau
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"zh-MO",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"千",million:"百萬",billion:"十億",trillion:"兆"},ordinal:function(){return"."},currency:{symbol:"MOP",code:"MOP"}})}()}(ct);var dt=ct.exports,pt={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Chinese simplified
			 * locale: Singapore
			 * author : Tim McIntosh (StayinFront NZ)
			 */return e({languageTag:"zh-SG",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"千",million:"百万",billion:"十亿",trillion:"兆"},ordinal:function(){return"."},currency:{symbol:"$",code:"SGD"}})}()}(pt);var mt=pt.exports,ft={exports:{}};!function(e,t){e.exports=function(){function e(e){return e&&e.__esModule&&Object.prototype.hasOwnProperty.call(e,"default")?e.default:e}
/*!
			 * numbro.js language configuration
			 * language : Chinese (Taiwan)
			 * author (numbro.js Version): Randy Wilander : https://github.com/rocketedaway
			 * author (numeral.js Version) : Rich Daley : https://github.com/pedantic-git
			 */return e({languageTag:"zh-TW",delimiters:{thousands:",",decimal:"."},abbreviations:{thousand:"千",million:"百萬",billion:"十億",trillion:"兆"},ordinal:function(){return"第"},currency:{symbol:"NT$",code:"TWD"}})}()}(ft);var ht=ft.exports;return function(e){e.bg=r,e["cs-CZ"]=n,e["da-DK"]=i,e["de-AT"]=l,e["de-CH"]=d,e["de-DE"]=m,e["de-LI"]=h,e.el=g,e["en-AU"]=b,e["en-GB"]=v,e["en-IE"]=T,e["en-NZ"]=O,e["en-ZA"]=_,e["es-AR"]=C,e["es-CL"]=P,e["es-CO"]=j,e["es-CR"]=R,e["es-ES"]=E,e["es-MX"]=H,e["es-NI"]=I,e["es-PE"]=B,e["es-PR"]=G,e["es-SV"]=z,e["et-EE"]=Y,e["fa-IR"]=X,e["fi-FI"]=Q,e["fil-PH"]=te,e["fr-CA"]=re,e["fr-CH"]=ne,e["fr-FR"]=ie,e["he-IL"]=le,e["hu-HU"]=de,e.id=me,e["it-CH"]=he,e["it-IT"]=ge,e["ja-JP"]=be,e["ko-KR"]=ve,e["lv-LV"]=Te,e["nb-NO"]=Oe,e.nb=_e,e["nl-BE"]=Ce,e["nl-NL"]=Pe,e.nn=je,e["pl-PL"]=Re,e["pt-BR"]=Ee,e["pt-PT"]=He,e["ro-RO"]=Ie,e.ro=Be,e["ru-RU"]=Ge,e["ru-UA"]=ze,e["sk-SK"]=Ye,e.sl=Xe,e["sr-Cyrl-RS"]=Qe,e["sv-SE"]=tt,e["th-TH"]=rt,e["tr-TR"]=nt,e["uk-UA"]=it,e["zh-CN"]=lt,e["zh-MO"]=dt,e["zh-SG"]=mt,e["zh-TW"]=ht}(t),e(t)}));
//# sourceMappingURL=languages.min.js.map
