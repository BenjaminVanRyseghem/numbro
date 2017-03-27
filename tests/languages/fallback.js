'use strict';

var numbro = require('../../numbro');

numbro.culture('en', {
    langLocaleCode: 'en',
    cultureCode: 'en',
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
        return (~~(number % 100 / 10) === 1) ? 'th' :
            (b === 1) ? 'st' :
                (b === 2) ? 'nd' :
                    (b === 3) ? 'rd' : 'th';
    },
    currency: {
        symbol: '$'
    }
});

exports.misc = {
    fallback: function (test) {
        test.expect(1);
        numbro.culture('en-foo');
        var currentCulture = numbro.culture();

        test.ok(currentCulture === 'en', 'Expect culturecode: ' + currentCulture);
        test.done();
    }
};
