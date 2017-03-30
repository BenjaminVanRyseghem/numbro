'use strict';

var numbro = require('../../numbro'),
    cultures = require('./../../languages');

/* Tests for the format of locale codes used in numbro cultures.
 * Tested against the regex /^[a-z]{2,3}(?:-[A-Z]{2,4}(?:-[a-zA-Z]{4})?)?$/g
 * http://stackoverflow.com/a/3962578/1702775
 */

var culture = {
    langLocaleCode: 'en-ASDF',
    cultureCode: 'en-ASDF',
    delimiters: {
        thousands: ',',
        decimal: '.'
    },
    abbreviations: {
        thousand: 'k',
        million: 'm',
        billion: 'b',
        trillion: 't'
    },
    ordinal: function (number) {
        var b = number % 10;
        return (~~ (number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
            (b === 2) ? 'nd' :
            (b === 3) ? 'rd' : 'th';
    },
    currency: {
        symbol: '$',
        position: 'prefix'
    },
    defaults: {
        currencyFormat: ',4 a'
    },
    formats: {
        fourDigits: '4 a',
        fullWithTwoDecimals: '$ ,0.00',
        fullWithTwoDecimalsNoCurrency: ',0.00',
        fullWithNoDecimals: '$ ,0'
    }
};

// add a culture with a 4 character country code to verify the validation below will work
numbro.culture(culture.langLocaleCode, culture);

exports['locale-codes'] = {
    default: function (test) {
        var keys = Object.keys(cultures);
        test.expect(keys.length);
        keys.forEach(function(key) {
            var lang = cultures[key];
            test.strictEqual(true, /^[a-z]{2,3}(?:-[a-zA-Z]{2,4}(?:-[a-zA-Z]{2,4})?)?$/g.test(lang.langLocaleCode),
                "Invalid locale code '" + lang.langLocaleCode + "' in culture " + key);
        });
        test.done();
    }
};
