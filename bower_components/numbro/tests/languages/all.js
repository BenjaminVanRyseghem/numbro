'use strict';

var numbro = require('../../numbro');

exports.misc = {
    cultures: function(test) {
        if (typeof module !== 'undefined' && module.exports) {
            test.expect(1);
            var cultures = numbro.cultures();
            // test that cultures were loaded.
            // this relies on the fact that all.js is run before any of the cultures tests
            test.ok(cultures['zh-CN']);
            test.done();
        } else {
            test.done();
        }
    },

    currencies: function(test) {
      if (typeof module !== 'undefined' && module.exports) {
          var tests = [
                  [ 'bg', 'BGN' ],
                  [ 'cs-CZ', 'CZK' ],
                  [ 'da-DK', 'DKK' ],
                  [ 'de-AT', 'EUR' ],
                  [ 'de-CH', 'CHF' ],
                  [ 'de-DE', 'EUR' ],
                  [ 'de-LI', 'CHF' ],
                  [ 'el', 'EUR' ],
                  [ 'en-AU', 'AUD' ],
                  [ 'en-GB', 'GBP' ],
                  [ 'en-IE', 'EUR' ],
                  [ 'en-NZ', 'NZD' ],
                  [ 'en-ZA', 'ZAR' ],
                  [ 'es-AR', 'ARS' ],
                  [ 'es-CL', 'CLP' ],
                  [ 'es-CO', 'EUR' ],
                  [ 'es-CR', 'CRC' ],
                  [ 'es-ES', 'EUR' ],
                  [ 'es-NI', 'NIO' ],
                  [ 'es-PE', 'PEN' ],
                  [ 'es-PR', 'USD' ],
                  [ 'es-SV', 'SVC' ],
                  [ 'et-EE', 'EUR' ],
                  [ 'fa-IR', 'IRR' ],
                  [ 'fi-FI', 'EUR' ],
                  [ 'fil-PH', 'PHP' ],
                  [ 'fr-CA', 'USD' ],
                  [ 'fr-CH', 'CHF' ],
                  [ 'fr-FR', 'EUR' ],
                  [ 'he-IL', 'ILS' ],
                  [ 'hu-HU', 'HUF' ],
                  [ 'id', 'IDR' ],
                  [ 'it-CH', 'CHF' ],
                  [ 'it-IT', 'EUR' ],
                  [ 'ja-JP', 'JPY' ],
                  [ 'ko-KR', 'KPW' ],
                  [ 'lv-LV', 'EUR' ],
                  [ 'nb-NO', 'NOK' ],
                  [ 'nb', 'NOK' ],
                  [ 'nl-BE', 'EUR' ],
                  [ 'nl-NL', 'EUR' ],
                  [ 'nn', 'NOK' ],
                  [ 'pl-PL', 'PLN' ],
                  [ 'pt-BR', 'BRL' ],
                  [ 'pt-PT', 'EUR' ],
                  [ 'ro-RO', 'RON' ],
                  [ 'ro', 'RON' ],
                  [ 'ru-RU', 'RUB' ],
                  [ 'ru-UA', 'UAH' ],
                  [ 'sk-SK', 'EUR' ],
                  [ 'sl', 'EUR' ],
                  [ 'sr-Cyrl-RS', 'RSD' ],
                  [ 'sv-SE', 'SEK' ],
                  [ 'th-TH', 'THB' ],
                  [ 'tr-TR', 'TRY' ],
                  [ 'uk-UA', 'UAH' ],
                  [ 'zh-CN', 'CNY' ],
                  [ 'zh-MO', 'MOP' ],
                  [ 'zh-SG', 'SGD' ],
                  [ 'zh-TW', 'TWD' ]
              ],
              i;

          test.expect(tests.length);

          var cultures = numbro.cultures();

          for (i = 0; i < tests.length; i++) {
              numbro.setCulture(tests[i][0]);
              test.strictEqual(numbro.culture(), tests[i][0], tests[i][1]);
          }

          test.done();
      } else {
          test.done();
      }
    }
};
