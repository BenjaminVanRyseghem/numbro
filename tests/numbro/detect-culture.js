'use strict';

var numbro = require('../../numbro');

exports.detectCulture = {
    detect: function (test) {
        var tests = [
                ['10Kč', ['cs-CZ']],
                ['10000kr', ['da-DK', 'nb-NO', 'sv-SE']],
                ['10000.23CHF', ['de-CH', 'fr-CH']],
                ['10000 €', ['de-DE', 'es-ES', 'et-EE', 'fi-FI', 'fr-FR', 'it-IT', 'lv-LV', 'nl-BE', 'nl-NL', 'pt-PT', 'sk-SK']],
                ['$10000.1234', ['en-AU', 'en-NZ', 'es-AR', 'fr-CA']],
                ['R10000', ['en-ZA']],
                ['£10000.1', ['en-GB']],
                ['﷼ 10000.123', ['fa-IR']],
                ['10000.123₱', ['fil-PH']],
                ['₱10000.123', ['fil-PH']],
                ['₪10000.456', ['he-IL']],
                ['10000.001 Ft', ['hu-HU']],
                ['¥10000.45', ['ja-JP', 'zh-CN']],
                ['₩10000.456', ['ko-KR']],
                ['1230 zł', ['pl-PL']],
                ['R$100.78', ['pt-BR']],
                ['500 руб.', ['ru-RU']],
                ['10028 ₴', ['ru-UA', 'uk-UA']],
                ['1,932 ฿', ['th-TH']],
                ['1.9687 ₺', ['tr-TR']],
                ['NT$1.9687', ['zh-TW']],

                // Invalid strings which don't represent a number are converted
                // to undefined.
                ['', undefined],
                ['not a number', undefined],

                // JavaScript values which are not String are converted to undefined.
                [0, undefined],
                [1, undefined],
                [1.1, undefined],
                [-0, undefined],
                [-1, undefined],
                [-1.1, undefined],
                [NaN, undefined],
                [undefined, undefined],
                [null, undefined],
                [[], undefined],
                [{}, undefined]
            ],
            val;

        test.expect(tests.length);

        for (var i = 0; i < tests.length; i++) {
            val = numbro().detectCulture(tests[i][0]);
            test.deepEqual(val, tests[i][1], tests[i][0]);
        }

        test.done();
    }
};
