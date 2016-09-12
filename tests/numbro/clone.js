'use strict';

var numbro = require('../../numbro');
require('./test-locale');

// Check that numbro factory can be cloned and the clone maintains its own
// configuration and neither modifies the defaults, nor have the defaults
// an influence or it
exports.clone = {

    // Check that the clone starts with configuration of its source
    clone: function (test) {
        test.expect(6);

        var n1 = numbro.clone();
        test.strictEqual(n1.language(), 'en-US', 'first');
        n1.language('test-TEST');
        test.strictEqual(n1.language(), 'test-TEST', 'first changed');
        test.strictEqual(numbro.language(), 'en-US', 'global');

        var n2 = n1.clone();
        test.strictEqual(n2.language(), 'test-TEST', 'second changed');
        n2.language('en-US');
        test.strictEqual(n2.language(), 'en-US', 'second changed');
        test.strictEqual(n1.language(), 'test-TEST', 'first changed');

        test.done();
    },

    // Check that the clone language method applies only to the clone
    language: function (test) {
        test.expect(6);

        var n = numbro.clone();
        n.language('test-TEST');
        test.strictEqual(n.language(), 'test-TEST', 'clone');
        n.setLanguage('test');
        test.strictEqual(n.language(), 'test-TEST', 'clone prefix');

        var i = n();
        test.strictEqual(i.language(), 'test-TEST', 'instance');
        n.setLanguage('en-US');
        test.strictEqual(n.language(), 'en-US', 'clone changed');
        test.strictEqual(i.language(), 'test-TEST', 'instance unchanged');

        test.strictEqual(numbro.language(), 'en-US', 'global');

        test.done();
    },

    // Check that the clone culture method applies only to the clone
    culture: function (test) {
        test.expect(6);

        var n = numbro.clone();
        n.culture('test-TEST');
        test.strictEqual(n.culture(), 'test-TEST', 'clone');
        n.setCulture('test');
        test.strictEqual(n.culture(), 'test-TEST', 'clone prefix');

        var i = n();
        test.strictEqual(i.culture(), 'test-TEST', 'instance');
        n.setCulture('en-US');
        test.strictEqual(n.culture(), 'en-US', 'clone changed');
        test.strictEqual(i.culture(), 'test-TEST', 'instance unchanged');

        test.strictEqual(numbro.culture(), 'en-US', 'global');

        test.done();
    },

    // Check that the clone zeroFormat method applies only to the clone
    zeroFormat: function (test) {
        test.expect(4);

        var n = numbro.clone();
        n.zeroFormat('nothing');
        test.strictEqual(n(0).format(), 'nothing', 'clone');
        test.strictEqual(n(0).formatCurrency(), '$nothing', 'clone currency');

        test.strictEqual(numbro(0).format(), '0', 'global');
        test.strictEqual(numbro(0).formatCurrency(), '$0,000 ', 'global currency');

        test.done();
    },

    // Check that the clone defaultFormat method applies only to the clone
    defaultFormat: function (test) {
        test.expect(2);

        var n = numbro.clone();
        n.defaultFormat('0.0[0000]');
        test.strictEqual(n(1234.56).format(), '1234.56', 'clone');

        test.strictEqual(numbro(1234.56).format(), '1,235', 'global');

        test.done();
    },

    // Check that the clone defaultCurrencyFormat method applies only to the clone
    defaultCurrencyFormat: function (test) {
        test.expect(2);

        var n = numbro.clone();
        n.defaultCurrencyFormat('0.0[0000] $');
        test.strictEqual(n(1234.56).formatCurrency(), '1234.56 $', 'clone');

        test.strictEqual(numbro(1234.56).formatCurrency(), '$0,001 k', 'global');

        test.done();
    }

};