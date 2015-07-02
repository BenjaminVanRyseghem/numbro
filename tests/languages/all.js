'use strict';

var numbro = require('../../numbro');

exports.misc = {
  languages: function(test) {
    if (typeof module !== 'undefined' && module.exports) {
      test.expect(1);
      var languages = numbro.languages();
      // test that languages were loaded.
      // this relies on the fact that all.js is run before any of the languages tests
      test.ok(languages['zh-CN']);
      test.done();
    } else {
      test.done();
    }
  }
};