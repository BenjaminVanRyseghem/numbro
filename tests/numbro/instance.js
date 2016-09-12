'use strict';

var numbro = require('../../numbro');

// Check that changes to instance settings apply to the particular instance
// and do not modify the defaults
exports.instance = {

    // Prepare the test environment
    setUp: function (callback) {
        // Register a testing culture
        numbro.culture('test-TEST', {
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
            ordinal: function(number) {
                var b = number % 10;
                return (~~(number % 100 / 10) === 1) ? 'th' :
                    (b === 1) ? 'st' :
                    (b === 2) ? 'nd' :
                    (b === 3) ? 'rd' : 'th';
            },
            currency: {
                symbol: '$',
                position: 'prefix'
            },
            defaults: {
                currencyFormat: ',0000 a'
            }
        });

        callback();
    },

    // Check that the instance language method applies only to the instance
    language: function (test) {
        test.expect(3);

        var n = numbro();
        n.language('test-TEST');
        test.strictEqual(n.language(), 'test-TEST', 'local language');
        n.setLanguage('test');
        test.strictEqual(n.language(), 'test-TEST', 'local language');

        test.strictEqual(numbro.language(), 'en-US', 'global language');

        test.done();
    },

    // Check that the instance culture method applies only to the instance
    culture: function (test) {
        test.expect(3);

        var n = numbro();
        n.culture('test-TEST');
        test.strictEqual(n.culture(), 'test-TEST', 'local culture');
        n.setCulture('test');
        test.strictEqual(n.culture(), 'test-TEST', 'local culture');

        test.strictEqual(numbro.culture(), 'en-US', 'global culture');

        test.done();
    },

    // Check that the instance zeroFormat method applies only to the instance
    zeroFormat: function (test) {
        test.expect(4);

        var n = numbro(0);
        n.zeroFormat('nothing');
        test.strictEqual(n.format(), 'nothing', 'local');
        test.strictEqual(n.formatCurrency(), '$nothing', 'local currency');

        test.strictEqual(numbro(0).format(), '0', 'global');
        test.strictEqual(numbro(0).formatCurrency(), '$0,000 ', 'global currency');

        test.done();
    },

    // Check that the instance defaultFormat method applies only to the instance
    defaultFormat: function (test) {
        test.expect(2);

        var n = numbro(1234.56);
        n.defaultFormat('0.0[0000]');
        test.strictEqual(n.format(), '1234.56', 'local');

        test.strictEqual(numbro(1234.56).format(), '1,235', 'global');

        test.done();
    },

    // Check that the instance defaultCurrencyFormat method applies only to the instance
    defaultCurrencyFormat: function (test) {
        test.expect(2);

        var n = numbro(1234.56);
        n.defaultCurrencyFormat('0.0[0000] $');
        test.strictEqual(n.formatCurrency(), '1234.56 $', 'local');

        test.strictEqual(numbro(1234.56).formatCurrency(), '$0,001 k', 'global');

        test.done();
    }

};