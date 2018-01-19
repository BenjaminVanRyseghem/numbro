(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.numbro = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*! bignumber.js v4.0.4 https://github.com/MikeMcl/bignumber.js/LICENCE */

;(function (globalObj) {
    'use strict';

    /*
      bignumber.js v4.0.4
      A JavaScript library for arbitrary-precision arithmetic.
      https://github.com/MikeMcl/bignumber.js
      Copyright (c) 2017 Michael Mclaughlin <M8ch88l@gmail.com>
      MIT Expat Licence
    */


    var BigNumber,
        isNumeric = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i,
        mathceil = Math.ceil,
        mathfloor = Math.floor,
        notBool = ' not a boolean or binary digit',
        roundingMode = 'rounding mode',
        tooManyDigits = 'number type has more than 15 significant digits',
        ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_',
        BASE = 1e14,
        LOG_BASE = 14,
        MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
        // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
        POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
        SQRT_BASE = 1e7,

        /*
         * The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
         * the arguments to toExponential, toFixed, toFormat, and toPrecision, beyond which an
         * exception is thrown (if ERRORS is true).
         */
        MAX = 1E9;                                   // 0 to MAX_INT32


    /*
     * Create and return a BigNumber constructor.
     */
    function constructorFactory(config) {
        var div, parseNumeric,

            // id tracks the caller function, so its name can be included in error messages.
            id = 0,
            P = BigNumber.prototype,
            ONE = new BigNumber(1),


            /********************************* EDITABLE DEFAULTS **********************************/


            /*
             * The default values below must be integers within the inclusive ranges stated.
             * The values can also be changed at run-time using BigNumber.config.
             */

            // The maximum number of decimal places for operations involving division.
            DECIMAL_PLACES = 20,                     // 0 to MAX

            /*
             * The rounding mode used when rounding to the above decimal places, and when using
             * toExponential, toFixed, toFormat and toPrecision, and round (default value).
             * UP         0 Away from zero.
             * DOWN       1 Towards zero.
             * CEIL       2 Towards +Infinity.
             * FLOOR      3 Towards -Infinity.
             * HALF_UP    4 Towards nearest neighbour. If equidistant, up.
             * HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
             * HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
             * HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
             * HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
             */
            ROUNDING_MODE = 4,                       // 0 to 8

            // EXPONENTIAL_AT : [TO_EXP_NEG , TO_EXP_POS]

            // The exponent value at and beneath which toString returns exponential notation.
            // Number type: -7
            TO_EXP_NEG = -7,                         // 0 to -MAX

            // The exponent value at and above which toString returns exponential notation.
            // Number type: 21
            TO_EXP_POS = 21,                         // 0 to MAX

            // RANGE : [MIN_EXP, MAX_EXP]

            // The minimum exponent value, beneath which underflow to zero occurs.
            // Number type: -324  (5e-324)
            MIN_EXP = -1e7,                          // -1 to -MAX

            // The maximum exponent value, above which overflow to Infinity occurs.
            // Number type:  308  (1.7976931348623157e+308)
            // For MAX_EXP > 1e7, e.g. new BigNumber('1e100000000').plus(1) may be slow.
            MAX_EXP = 1e7,                           // 1 to MAX

            // Whether BigNumber Errors are ever thrown.
            ERRORS = true,                           // true or false

            // Change to intValidatorNoErrors if ERRORS is false.
            isValidInt = intValidatorWithErrors,     // intValidatorWithErrors/intValidatorNoErrors

            // Whether to use cryptographically-secure random number generation, if available.
            CRYPTO = false,                          // true or false

            /*
             * The modulo mode used when calculating the modulus: a mod n.
             * The quotient (q = a / n) is calculated according to the corresponding rounding mode.
             * The remainder (r) is calculated as: r = a - n * q.
             *
             * UP        0 The remainder is positive if the dividend is negative, else is negative.
             * DOWN      1 The remainder has the same sign as the dividend.
             *             This modulo mode is commonly known as 'truncated division' and is
             *             equivalent to (a % n) in JavaScript.
             * FLOOR     3 The remainder has the same sign as the divisor (Python %).
             * HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
             * EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
             *             The remainder is always positive.
             *
             * The truncated division, floored division, Euclidian division and IEEE 754 remainder
             * modes are commonly used for the modulus operation.
             * Although the other rounding modes can also be used, they may not give useful results.
             */
            MODULO_MODE = 1,                         // 0 to 9

            // The maximum number of significant digits of the result of the toPower operation.
            // If POW_PRECISION is 0, there will be unlimited significant digits.
            POW_PRECISION = 0,                       // 0 to MAX

            // The format specification used by the BigNumber.prototype.toFormat method.
            FORMAT = {
                decimalSeparator: '.',
                groupSeparator: ',',
                groupSize: 3,
                secondaryGroupSize: 0,
                fractionGroupSeparator: '\xA0',      // non-breaking space
                fractionGroupSize: 0
            };


        /******************************************************************************************/


        // CONSTRUCTOR


        /*
         * The BigNumber constructor and exported function.
         * Create and return a new instance of a BigNumber object.
         *
         * n {number|string|BigNumber} A numeric value.
         * [b] {number} The base of n. Integer, 2 to 64 inclusive.
         */
        function BigNumber( n, b ) {
            var c, e, i, num, len, str,
                x = this;

            // Enable constructor usage without new.
            if ( !( x instanceof BigNumber ) ) {

                // 'BigNumber() constructor call without new: {n}'
                if (ERRORS) raise( 26, 'constructor call without new', n );
                return new BigNumber( n, b );
            }

            // 'new BigNumber() base not an integer: {b}'
            // 'new BigNumber() base out of range: {b}'
            if ( b == null || !isValidInt( b, 2, 64, id, 'base' ) ) {

                // Duplicate.
                if ( n instanceof BigNumber ) {
                    x.s = n.s;
                    x.e = n.e;
                    x.c = ( n = n.c ) ? n.slice() : n;
                    id = 0;
                    return;
                }

                if ( ( num = typeof n == 'number' ) && n * 0 == 0 ) {
                    x.s = 1 / n < 0 ? ( n = -n, -1 ) : 1;

                    // Fast path for integers.
                    if ( n === ~~n ) {
                        for ( e = 0, i = n; i >= 10; i /= 10, e++ );
                        x.e = e;
                        x.c = [n];
                        id = 0;
                        return;
                    }

                    str = n + '';
                } else {
                    if ( !isNumeric.test( str = n + '' ) ) return parseNumeric( x, str, num );
                    x.s = str.charCodeAt(0) === 45 ? ( str = str.slice(1), -1 ) : 1;
                }
            } else {
                b = b | 0;
                str = n + '';

                // Ensure return value is rounded to DECIMAL_PLACES as with other bases.
                // Allow exponential notation to be used with base 10 argument.
                if ( b == 10 ) {
                    x = new BigNumber( n instanceof BigNumber ? n : str );
                    return round( x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE );
                }

                // Avoid potential interpretation of Infinity and NaN as base 44+ values.
                // Any number in exponential form will fail due to the [Ee][+-].
                if ( ( num = typeof n == 'number' ) && n * 0 != 0 ||
                  !( new RegExp( '^-?' + ( c = '[' + ALPHABET.slice( 0, b ) + ']+' ) +
                    '(?:\\.' + c + ')?$',b < 37 ? 'i' : '' ) ).test(str) ) {
                    return parseNumeric( x, str, num, b );
                }

                if (num) {
                    x.s = 1 / n < 0 ? ( str = str.slice(1), -1 ) : 1;

                    if ( ERRORS && str.replace( /^0\.0*|\./, '' ).length > 15 ) {

                        // 'new BigNumber() number type has more than 15 significant digits: {n}'
                        raise( id, tooManyDigits, n );
                    }

                    // Prevent later check for length on converted number.
                    num = false;
                } else {
                    x.s = str.charCodeAt(0) === 45 ? ( str = str.slice(1), -1 ) : 1;
                }

                str = convertBase( str, 10, b, x.s );
            }

            // Decimal point?
            if ( ( e = str.indexOf('.') ) > -1 ) str = str.replace( '.', '' );

            // Exponential form?
            if ( ( i = str.search( /e/i ) ) > 0 ) {

                // Determine exponent.
                if ( e < 0 ) e = i;
                e += +str.slice( i + 1 );
                str = str.substring( 0, i );
            } else if ( e < 0 ) {

                // Integer.
                e = str.length;
            }

            // Determine leading zeros.
            for ( i = 0; str.charCodeAt(i) === 48; i++ );

            // Determine trailing zeros.
            for ( len = str.length; str.charCodeAt(--len) === 48; );
            str = str.slice( i, len + 1 );

            if (str) {
                len = str.length;

                // Disallow numbers with over 15 significant digits if number type.
                // 'new BigNumber() number type has more than 15 significant digits: {n}'
                if ( num && ERRORS && len > 15 && ( n > MAX_SAFE_INTEGER || n !== mathfloor(n) ) ) {
                    raise( id, tooManyDigits, x.s * n );
                }

                e = e - i - 1;

                 // Overflow?
                if ( e > MAX_EXP ) {

                    // Infinity.
                    x.c = x.e = null;

                // Underflow?
                } else if ( e < MIN_EXP ) {

                    // Zero.
                    x.c = [ x.e = 0 ];
                } else {
                    x.e = e;
                    x.c = [];

                    // Transform base

                    // e is the base 10 exponent.
                    // i is where to slice str to get the first element of the coefficient array.
                    i = ( e + 1 ) % LOG_BASE;
                    if ( e < 0 ) i += LOG_BASE;

                    if ( i < len ) {
                        if (i) x.c.push( +str.slice( 0, i ) );

                        for ( len -= LOG_BASE; i < len; ) {
                            x.c.push( +str.slice( i, i += LOG_BASE ) );
                        }

                        str = str.slice(i);
                        i = LOG_BASE - str.length;
                    } else {
                        i -= len;
                    }

                    for ( ; i--; str += '0' );
                    x.c.push( +str );
                }
            } else {

                // Zero.
                x.c = [ x.e = 0 ];
            }

            id = 0;
        }


        // CONSTRUCTOR PROPERTIES


        BigNumber.another = constructorFactory;

        BigNumber.ROUND_UP = 0;
        BigNumber.ROUND_DOWN = 1;
        BigNumber.ROUND_CEIL = 2;
        BigNumber.ROUND_FLOOR = 3;
        BigNumber.ROUND_HALF_UP = 4;
        BigNumber.ROUND_HALF_DOWN = 5;
        BigNumber.ROUND_HALF_EVEN = 6;
        BigNumber.ROUND_HALF_CEIL = 7;
        BigNumber.ROUND_HALF_FLOOR = 8;
        BigNumber.EUCLID = 9;


        /*
         * Configure infrequently-changing library-wide settings.
         *
         * Accept an object or an argument list, with one or many of the following properties or
         * parameters respectively:
         *
         *   DECIMAL_PLACES  {number}  Integer, 0 to MAX inclusive
         *   ROUNDING_MODE   {number}  Integer, 0 to 8 inclusive
         *   EXPONENTIAL_AT  {number|number[]}  Integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to 0 incl., 0 to MAX incl.]
         *   RANGE           {number|number[]}  Non-zero integer, -MAX to MAX inclusive or
         *                                      [integer -MAX to -1 incl., integer 1 to MAX incl.]
         *   ERRORS          {boolean|number}   true, false, 1 or 0
         *   CRYPTO          {boolean|number}   true, false, 1 or 0
         *   MODULO_MODE     {number}           0 to 9 inclusive
         *   POW_PRECISION   {number}           0 to MAX inclusive
         *   FORMAT          {object}           See BigNumber.prototype.toFormat
         *      decimalSeparator       {string}
         *      groupSeparator         {string}
         *      groupSize              {number}
         *      secondaryGroupSize     {number}
         *      fractionGroupSeparator {string}
         *      fractionGroupSize      {number}
         *
         * (The values assigned to the above FORMAT object properties are not checked for validity.)
         *
         * E.g.
         * BigNumber.config(20, 4) is equivalent to
         * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
         *
         * Ignore properties/parameters set to null or undefined.
         * Return an object with the properties current values.
         */
        BigNumber.config = BigNumber.set = function () {
            var v, p,
                i = 0,
                r = {},
                a = arguments,
                o = a[0],
                has = o && typeof o == 'object'
                  ? function () { if ( o.hasOwnProperty(p) ) return ( v = o[p] ) != null; }
                  : function () { if ( a.length > i ) return ( v = a[i++] ) != null; };

            // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
            // 'config() DECIMAL_PLACES not an integer: {v}'
            // 'config() DECIMAL_PLACES out of range: {v}'
            if ( has( p = 'DECIMAL_PLACES' ) && isValidInt( v, 0, MAX, 2, p ) ) {
                DECIMAL_PLACES = v | 0;
            }
            r[p] = DECIMAL_PLACES;

            // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
            // 'config() ROUNDING_MODE not an integer: {v}'
            // 'config() ROUNDING_MODE out of range: {v}'
            if ( has( p = 'ROUNDING_MODE' ) && isValidInt( v, 0, 8, 2, p ) ) {
                ROUNDING_MODE = v | 0;
            }
            r[p] = ROUNDING_MODE;

            // EXPONENTIAL_AT {number|number[]}
            // Integer, -MAX to MAX inclusive or [integer -MAX to 0 inclusive, 0 to MAX inclusive].
            // 'config() EXPONENTIAL_AT not an integer: {v}'
            // 'config() EXPONENTIAL_AT out of range: {v}'
            if ( has( p = 'EXPONENTIAL_AT' ) ) {

                if ( isArray(v) ) {
                    if ( isValidInt( v[0], -MAX, 0, 2, p ) && isValidInt( v[1], 0, MAX, 2, p ) ) {
                        TO_EXP_NEG = v[0] | 0;
                        TO_EXP_POS = v[1] | 0;
                    }
                } else if ( isValidInt( v, -MAX, MAX, 2, p ) ) {
                    TO_EXP_NEG = -( TO_EXP_POS = ( v < 0 ? -v : v ) | 0 );
                }
            }
            r[p] = [ TO_EXP_NEG, TO_EXP_POS ];

            // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
            // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
            // 'config() RANGE not an integer: {v}'
            // 'config() RANGE cannot be zero: {v}'
            // 'config() RANGE out of range: {v}'
            if ( has( p = 'RANGE' ) ) {

                if ( isArray(v) ) {
                    if ( isValidInt( v[0], -MAX, -1, 2, p ) && isValidInt( v[1], 1, MAX, 2, p ) ) {
                        MIN_EXP = v[0] | 0;
                        MAX_EXP = v[1] | 0;
                    }
                } else if ( isValidInt( v, -MAX, MAX, 2, p ) ) {
                    if ( v | 0 ) MIN_EXP = -( MAX_EXP = ( v < 0 ? -v : v ) | 0 );
                    else if (ERRORS) raise( 2, p + ' cannot be zero', v );
                }
            }
            r[p] = [ MIN_EXP, MAX_EXP ];

            // ERRORS {boolean|number} true, false, 1 or 0.
            // 'config() ERRORS not a boolean or binary digit: {v}'
            if ( has( p = 'ERRORS' ) ) {

                if ( v === !!v || v === 1 || v === 0 ) {
                    id = 0;
                    isValidInt = ( ERRORS = !!v ) ? intValidatorWithErrors : intValidatorNoErrors;
                } else if (ERRORS) {
                    raise( 2, p + notBool, v );
                }
            }
            r[p] = ERRORS;

            // CRYPTO {boolean|number} true, false, 1 or 0.
            // 'config() CRYPTO not a boolean or binary digit: {v}'
            // 'config() crypto unavailable: {crypto}'
            if ( has( p = 'CRYPTO' ) ) {

                if ( v === true || v === false || v === 1 || v === 0 ) {
                    if (v) {
                        v = typeof crypto == 'undefined';
                        if ( !v && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
                            CRYPTO = true;
                        } else if (ERRORS) {
                            raise( 2, 'crypto unavailable', v ? void 0 : crypto );
                        } else {
                            CRYPTO = false;
                        }
                    } else {
                        CRYPTO = false;
                    }
                } else if (ERRORS) {
                    raise( 2, p + notBool, v );
                }
            }
            r[p] = CRYPTO;

            // MODULO_MODE {number} Integer, 0 to 9 inclusive.
            // 'config() MODULO_MODE not an integer: {v}'
            // 'config() MODULO_MODE out of range: {v}'
            if ( has( p = 'MODULO_MODE' ) && isValidInt( v, 0, 9, 2, p ) ) {
                MODULO_MODE = v | 0;
            }
            r[p] = MODULO_MODE;

            // POW_PRECISION {number} Integer, 0 to MAX inclusive.
            // 'config() POW_PRECISION not an integer: {v}'
            // 'config() POW_PRECISION out of range: {v}'
            if ( has( p = 'POW_PRECISION' ) && isValidInt( v, 0, MAX, 2, p ) ) {
                POW_PRECISION = v | 0;
            }
            r[p] = POW_PRECISION;

            // FORMAT {object}
            // 'config() FORMAT not an object: {v}'
            if ( has( p = 'FORMAT' ) ) {

                if ( typeof v == 'object' ) {
                    FORMAT = v;
                } else if (ERRORS) {
                    raise( 2, p + ' not an object', v );
                }
            }
            r[p] = FORMAT;

            return r;
        };


        /*
         * Return a new BigNumber whose value is the maximum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.max = function () { return maxOrMin( arguments, P.lt ); };


        /*
         * Return a new BigNumber whose value is the minimum of the arguments.
         *
         * arguments {number|string|BigNumber}
         */
        BigNumber.min = function () { return maxOrMin( arguments, P.gt ); };


        /*
         * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
         * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
         * zeros are produced).
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         *
         * 'random() decimal places not an integer: {dp}'
         * 'random() decimal places out of range: {dp}'
         * 'random() crypto unavailable: {crypto}'
         */
        BigNumber.random = (function () {
            var pow2_53 = 0x20000000000000;

            // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
            // Check if Math.random() produces more than 32 bits of randomness.
            // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
            // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
            var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
              ? function () { return mathfloor( Math.random() * pow2_53 ); }
              : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
                  (Math.random() * 0x800000 | 0); };

            return function (dp) {
                var a, b, e, k, v,
                    i = 0,
                    c = [],
                    rand = new BigNumber(ONE);

                dp = dp == null || !isValidInt( dp, 0, MAX, 14 ) ? DECIMAL_PLACES : dp | 0;
                k = mathceil( dp / LOG_BASE );

                if (CRYPTO) {

                    // Browsers supporting crypto.getRandomValues.
                    if (crypto.getRandomValues) {

                        a = crypto.getRandomValues( new Uint32Array( k *= 2 ) );

                        for ( ; i < k; ) {

                            // 53 bits:
                            // ((Math.pow(2, 32) - 1) * Math.pow(2, 21)).toString(2)
                            // 11111 11111111 11111111 11111111 11100000 00000000 00000000
                            // ((Math.pow(2, 32) - 1) >>> 11).toString(2)
                            //                                     11111 11111111 11111111
                            // 0x20000 is 2^21.
                            v = a[i] * 0x20000 + (a[i + 1] >>> 11);

                            // Rejection sampling:
                            // 0 <= v < 9007199254740992
                            // Probability that v >= 9e15, is
                            // 7199254740992 / 9007199254740992 ~= 0.0008, i.e. 1 in 1251
                            if ( v >= 9e15 ) {
                                b = crypto.getRandomValues( new Uint32Array(2) );
                                a[i] = b[0];
                                a[i + 1] = b[1];
                            } else {

                                // 0 <= v <= 8999999999999999
                                // 0 <= (v % 1e14) <= 99999999999999
                                c.push( v % 1e14 );
                                i += 2;
                            }
                        }
                        i = k / 2;

                    // Node.js supporting crypto.randomBytes.
                    } else if (crypto.randomBytes) {

                        // buffer
                        a = crypto.randomBytes( k *= 7 );

                        for ( ; i < k; ) {

                            // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
                            // 0x100000000 is 2^32, 0x1000000 is 2^24
                            // 11111 11111111 11111111 11111111 11111111 11111111 11111111
                            // 0 <= v < 9007199254740992
                            v = ( ( a[i] & 31 ) * 0x1000000000000 ) + ( a[i + 1] * 0x10000000000 ) +
                                  ( a[i + 2] * 0x100000000 ) + ( a[i + 3] * 0x1000000 ) +
                                  ( a[i + 4] << 16 ) + ( a[i + 5] << 8 ) + a[i + 6];

                            if ( v >= 9e15 ) {
                                crypto.randomBytes(7).copy( a, i );
                            } else {

                                // 0 <= (v % 1e14) <= 99999999999999
                                c.push( v % 1e14 );
                                i += 7;
                            }
                        }
                        i = k / 7;
                    } else {
                        CRYPTO = false;
                        if (ERRORS) raise( 14, 'crypto unavailable', crypto );
                    }
                }

                // Use Math.random.
                if (!CRYPTO) {

                    for ( ; i < k; ) {
                        v = random53bitInt();
                        if ( v < 9e15 ) c[i++] = v % 1e14;
                    }
                }

                k = c[--i];
                dp %= LOG_BASE;

                // Convert trailing digits to zeros according to dp.
                if ( k && dp ) {
                    v = POWS_TEN[LOG_BASE - dp];
                    c[i] = mathfloor( k / v ) * v;
                }

                // Remove trailing elements which are zero.
                for ( ; c[i] === 0; c.pop(), i-- );

                // Zero?
                if ( i < 0 ) {
                    c = [ e = 0 ];
                } else {

                    // Remove leading elements which are zero and adjust exponent accordingly.
                    for ( e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

                    // Count the digits of the first element of c to determine leading zeros, and...
                    for ( i = 1, v = c[0]; v >= 10; v /= 10, i++);

                    // adjust the exponent accordingly.
                    if ( i < LOG_BASE ) e -= LOG_BASE - i;
                }

                rand.e = e;
                rand.c = c;
                return rand;
            };
        })();


        // PRIVATE FUNCTIONS


        // Convert a numeric string of baseIn to a numeric string of baseOut.
        function convertBase( str, baseOut, baseIn, sign ) {
            var d, e, k, r, x, xc, y,
                i = str.indexOf( '.' ),
                dp = DECIMAL_PLACES,
                rm = ROUNDING_MODE;

            if ( baseIn < 37 ) str = str.toLowerCase();

            // Non-integer.
            if ( i >= 0 ) {
                k = POW_PRECISION;

                // Unlimited precision.
                POW_PRECISION = 0;
                str = str.replace( '.', '' );
                y = new BigNumber(baseIn);
                x = y.pow( str.length - i );
                POW_PRECISION = k;

                // Convert str as if an integer, then restore the fraction part by dividing the
                // result by its base raised to a power.
                y.c = toBaseOut( toFixedPoint( coeffToString( x.c ), x.e ), 10, baseOut );
                y.e = y.c.length;
            }

            // Convert the number as integer.
            xc = toBaseOut( str, baseIn, baseOut );
            e = k = xc.length;

            // Remove trailing zeros.
            for ( ; xc[--k] == 0; xc.pop() );
            if ( !xc[0] ) return '0';

            if ( i < 0 ) {
                --e;
            } else {
                x.c = xc;
                x.e = e;

                // sign is needed for correct rounding.
                x.s = sign;
                x = div( x, y, dp, rm, baseOut );
                xc = x.c;
                r = x.r;
                e = x.e;
            }

            d = e + dp + 1;

            // The rounding digit, i.e. the digit to the right of the digit that may be rounded up.
            i = xc[d];
            k = baseOut / 2;
            r = r || d < 0 || xc[d + 1] != null;

            r = rm < 4 ? ( i != null || r ) && ( rm == 0 || rm == ( x.s < 0 ? 3 : 2 ) )
                       : i > k || i == k &&( rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
                         rm == ( x.s < 0 ? 8 : 7 ) );

            if ( d < 1 || !xc[0] ) {

                // 1^-dp or 0.
                str = r ? toFixedPoint( '1', -dp ) : '0';
            } else {
                xc.length = d;

                if (r) {

                    // Rounding up may mean the previous digit has to be rounded up and so on.
                    for ( --baseOut; ++xc[--d] > baseOut; ) {
                        xc[d] = 0;

                        if ( !d ) {
                            ++e;
                            xc = [1].concat(xc);
                        }
                    }
                }

                // Determine trailing zeros.
                for ( k = xc.length; !xc[--k]; );

                // E.g. [4, 11, 15] becomes 4bf.
                for ( i = 0, str = ''; i <= k; str += ALPHABET.charAt( xc[i++] ) );
                str = toFixedPoint( str, e );
            }

            // The caller will add the sign.
            return str;
        }


        // Perform division in the specified base. Called by div and convertBase.
        div = (function () {

            // Assume non-zero x and k.
            function multiply( x, k, base ) {
                var m, temp, xlo, xhi,
                    carry = 0,
                    i = x.length,
                    klo = k % SQRT_BASE,
                    khi = k / SQRT_BASE | 0;

                for ( x = x.slice(); i--; ) {
                    xlo = x[i] % SQRT_BASE;
                    xhi = x[i] / SQRT_BASE | 0;
                    m = khi * xlo + xhi * klo;
                    temp = klo * xlo + ( ( m % SQRT_BASE ) * SQRT_BASE ) + carry;
                    carry = ( temp / base | 0 ) + ( m / SQRT_BASE | 0 ) + khi * xhi;
                    x[i] = temp % base;
                }

                if (carry) x = [carry].concat(x);

                return x;
            }

            function compare( a, b, aL, bL ) {
                var i, cmp;

                if ( aL != bL ) {
                    cmp = aL > bL ? 1 : -1;
                } else {

                    for ( i = cmp = 0; i < aL; i++ ) {

                        if ( a[i] != b[i] ) {
                            cmp = a[i] > b[i] ? 1 : -1;
                            break;
                        }
                    }
                }
                return cmp;
            }

            function subtract( a, b, aL, base ) {
                var i = 0;

                // Subtract b from a.
                for ( ; aL--; ) {
                    a[aL] -= i;
                    i = a[aL] < b[aL] ? 1 : 0;
                    a[aL] = i * base + a[aL] - b[aL];
                }

                // Remove leading zeros.
                for ( ; !a[0] && a.length > 1; a.splice(0, 1) );
            }

            // x: dividend, y: divisor.
            return function ( x, y, dp, rm, base ) {
                var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
                    yL, yz,
                    s = x.s == y.s ? 1 : -1,
                    xc = x.c,
                    yc = y.c;

                // Either NaN, Infinity or 0?
                if ( !xc || !xc[0] || !yc || !yc[0] ) {

                    return new BigNumber(

                      // Return NaN if either NaN, or both Infinity or 0.
                      !x.s || !y.s || ( xc ? yc && xc[0] == yc[0] : !yc ) ? NaN :

                        // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
                        xc && xc[0] == 0 || !yc ? s * 0 : s / 0
                    );
                }

                q = new BigNumber(s);
                qc = q.c = [];
                e = x.e - y.e;
                s = dp + e + 1;

                if ( !base ) {
                    base = BASE;
                    e = bitFloor( x.e / LOG_BASE ) - bitFloor( y.e / LOG_BASE );
                    s = s / LOG_BASE | 0;
                }

                // Result exponent may be one less then the current value of e.
                // The coefficients of the BigNumbers from convertBase may have trailing zeros.
                for ( i = 0; yc[i] == ( xc[i] || 0 ); i++ );
                if ( yc[i] > ( xc[i] || 0 ) ) e--;

                if ( s < 0 ) {
                    qc.push(1);
                    more = true;
                } else {
                    xL = xc.length;
                    yL = yc.length;
                    i = 0;
                    s += 2;

                    // Normalise xc and yc so highest order digit of yc is >= base / 2.

                    n = mathfloor( base / ( yc[0] + 1 ) );

                    // Not necessary, but to handle odd bases where yc[0] == ( base / 2 ) - 1.
                    // if ( n > 1 || n++ == 1 && yc[0] < base / 2 ) {
                    if ( n > 1 ) {
                        yc = multiply( yc, n, base );
                        xc = multiply( xc, n, base );
                        yL = yc.length;
                        xL = xc.length;
                    }

                    xi = yL;
                    rem = xc.slice( 0, yL );
                    remL = rem.length;

                    // Add zeros to make remainder as long as divisor.
                    for ( ; remL < yL; rem[remL++] = 0 );
                    yz = yc.slice();
                    yz = [0].concat(yz);
                    yc0 = yc[0];
                    if ( yc[1] >= base / 2 ) yc0++;
                    // Not necessary, but to prevent trial digit n > base, when using base 3.
                    // else if ( base == 3 && yc0 == 1 ) yc0 = 1 + 1e-15;

                    do {
                        n = 0;

                        // Compare divisor and remainder.
                        cmp = compare( yc, rem, yL, remL );

                        // If divisor < remainder.
                        if ( cmp < 0 ) {

                            // Calculate trial digit, n.

                            rem0 = rem[0];
                            if ( yL != remL ) rem0 = rem0 * base + ( rem[1] || 0 );

                            // n is how many times the divisor goes into the current remainder.
                            n = mathfloor( rem0 / yc0 );

                            //  Algorithm:
                            //  1. product = divisor * trial digit (n)
                            //  2. if product > remainder: product -= divisor, n--
                            //  3. remainder -= product
                            //  4. if product was < remainder at 2:
                            //    5. compare new remainder and divisor
                            //    6. If remainder > divisor: remainder -= divisor, n++

                            if ( n > 1 ) {

                                // n may be > base only when base is 3.
                                if (n >= base) n = base - 1;

                                // product = divisor * trial digit.
                                prod = multiply( yc, n, base );
                                prodL = prod.length;
                                remL = rem.length;

                                // Compare product and remainder.
                                // If product > remainder.
                                // Trial digit n too high.
                                // n is 1 too high about 5% of the time, and is not known to have
                                // ever been more than 1 too high.
                                while ( compare( prod, rem, prodL, remL ) == 1 ) {
                                    n--;

                                    // Subtract divisor from product.
                                    subtract( prod, yL < prodL ? yz : yc, prodL, base );
                                    prodL = prod.length;
                                    cmp = 1;
                                }
                            } else {

                                // n is 0 or 1, cmp is -1.
                                // If n is 0, there is no need to compare yc and rem again below,
                                // so change cmp to 1 to avoid it.
                                // If n is 1, leave cmp as -1, so yc and rem are compared again.
                                if ( n == 0 ) {

                                    // divisor < remainder, so n must be at least 1.
                                    cmp = n = 1;
                                }

                                // product = divisor
                                prod = yc.slice();
                                prodL = prod.length;
                            }

                            if ( prodL < remL ) prod = [0].concat(prod);

                            // Subtract product from remainder.
                            subtract( rem, prod, remL, base );
                            remL = rem.length;

                             // If product was < remainder.
                            if ( cmp == -1 ) {

                                // Compare divisor and new remainder.
                                // If divisor < new remainder, subtract divisor from remainder.
                                // Trial digit n too low.
                                // n is 1 too low about 5% of the time, and very rarely 2 too low.
                                while ( compare( yc, rem, yL, remL ) < 1 ) {
                                    n++;

                                    // Subtract divisor from remainder.
                                    subtract( rem, yL < remL ? yz : yc, remL, base );
                                    remL = rem.length;
                                }
                            }
                        } else if ( cmp === 0 ) {
                            n++;
                            rem = [0];
                        } // else cmp === 1 and n will be 0

                        // Add the next digit, n, to the result array.
                        qc[i++] = n;

                        // Update the remainder.
                        if ( rem[0] ) {
                            rem[remL++] = xc[xi] || 0;
                        } else {
                            rem = [ xc[xi] ];
                            remL = 1;
                        }
                    } while ( ( xi++ < xL || rem[0] != null ) && s-- );

                    more = rem[0] != null;

                    // Leading zero?
                    if ( !qc[0] ) qc.splice(0, 1);
                }

                if ( base == BASE ) {

                    // To calculate q.e, first get the number of digits of qc[0].
                    for ( i = 1, s = qc[0]; s >= 10; s /= 10, i++ );
                    round( q, dp + ( q.e = i + e * LOG_BASE - 1 ) + 1, rm, more );

                // Caller is convertBase.
                } else {
                    q.e = e;
                    q.r = +more;
                }

                return q;
            };
        })();


        /*
         * Return a string representing the value of BigNumber n in fixed-point or exponential
         * notation rounded to the specified decimal places or significant digits.
         *
         * n is a BigNumber.
         * i is the index of the last digit required (i.e. the digit that may be rounded up).
         * rm is the rounding mode.
         * caller is caller id: toExponential 19, toFixed 20, toFormat 21, toPrecision 24.
         */
        function format( n, i, rm, caller ) {
            var c0, e, ne, len, str;

            rm = rm != null && isValidInt( rm, 0, 8, caller, roundingMode )
              ? rm | 0 : ROUNDING_MODE;

            if ( !n.c ) return n.toString();
            c0 = n.c[0];
            ne = n.e;

            if ( i == null ) {
                str = coeffToString( n.c );
                str = caller == 19 || caller == 24 && ne <= TO_EXP_NEG
                  ? toExponential( str, ne )
                  : toFixedPoint( str, ne );
            } else {
                n = round( new BigNumber(n), i, rm );

                // n.e may have changed if the value was rounded up.
                e = n.e;

                str = coeffToString( n.c );
                len = str.length;

                // toPrecision returns exponential notation if the number of significant digits
                // specified is less than the number of digits necessary to represent the integer
                // part of the value in fixed-point notation.

                // Exponential notation.
                if ( caller == 19 || caller == 24 && ( i <= e || e <= TO_EXP_NEG ) ) {

                    // Append zeros?
                    for ( ; len < i; str += '0', len++ );
                    str = toExponential( str, e );

                // Fixed-point notation.
                } else {
                    i -= ne;
                    str = toFixedPoint( str, e );

                    // Append zeros?
                    if ( e + 1 > len ) {
                        if ( --i > 0 ) for ( str += '.'; i--; str += '0' );
                    } else {
                        i += e - len;
                        if ( i > 0 ) {
                            if ( e + 1 == len ) str += '.';
                            for ( ; i--; str += '0' );
                        }
                    }
                }
            }

            return n.s < 0 && c0 ? '-' + str : str;
        }


        // Handle BigNumber.max and BigNumber.min.
        function maxOrMin( args, method ) {
            var m, n,
                i = 0;

            if ( isArray( args[0] ) ) args = args[0];
            m = new BigNumber( args[0] );

            for ( ; ++i < args.length; ) {
                n = new BigNumber( args[i] );

                // If any number is NaN, return NaN.
                if ( !n.s ) {
                    m = n;
                    break;
                } else if ( method.call( m, n ) ) {
                    m = n;
                }
            }

            return m;
        }


        /*
         * Return true if n is an integer in range, otherwise throw.
         * Use for argument validation when ERRORS is true.
         */
        function intValidatorWithErrors( n, min, max, caller, name ) {
            if ( n < min || n > max || n != truncate(n) ) {
                raise( caller, ( name || 'decimal places' ) +
                  ( n < min || n > max ? ' out of range' : ' not an integer' ), n );
            }

            return true;
        }


        /*
         * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
         * Called by minus, plus and times.
         */
        function normalise( n, c, e ) {
            var i = 1,
                j = c.length;

             // Remove trailing zeros.
            for ( ; !c[--j]; c.pop() );

            // Calculate the base 10 exponent. First get the number of digits of c[0].
            for ( j = c[0]; j >= 10; j /= 10, i++ );

            // Overflow?
            if ( ( e = i + e * LOG_BASE - 1 ) > MAX_EXP ) {

                // Infinity.
                n.c = n.e = null;

            // Underflow?
            } else if ( e < MIN_EXP ) {

                // Zero.
                n.c = [ n.e = 0 ];
            } else {
                n.e = e;
                n.c = c;
            }

            return n;
        }


        // Handle values that fail the validity test in BigNumber.
        parseNumeric = (function () {
            var basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i,
                dotAfter = /^([^.]+)\.$/,
                dotBefore = /^\.([^.]+)$/,
                isInfinityOrNaN = /^-?(Infinity|NaN)$/,
                whitespaceOrPlus = /^\s*\+(?=[\w.])|^\s+|\s+$/g;

            return function ( x, str, num, b ) {
                var base,
                    s = num ? str : str.replace( whitespaceOrPlus, '' );

                // No exception on ±Infinity or NaN.
                if ( isInfinityOrNaN.test(s) ) {
                    x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
                } else {
                    if ( !num ) {

                        // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
                        s = s.replace( basePrefix, function ( m, p1, p2 ) {
                            base = ( p2 = p2.toLowerCase() ) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
                            return !b || b == base ? p1 : m;
                        });

                        if (b) {
                            base = b;

                            // E.g. '1.' to '1', '.1' to '0.1'
                            s = s.replace( dotAfter, '$1' ).replace( dotBefore, '0.$1' );
                        }

                        if ( str != s ) return new BigNumber( s, base );
                    }

                    // 'new BigNumber() not a number: {n}'
                    // 'new BigNumber() not a base {b} number: {n}'
                    if (ERRORS) raise( id, 'not a' + ( b ? ' base ' + b : '' ) + ' number', str );
                    x.s = null;
                }

                x.c = x.e = null;
                id = 0;
            }
        })();


        // Throw a BigNumber Error.
        function raise( caller, msg, val ) {
            var error = new Error( [
                'new BigNumber',     // 0
                'cmp',               // 1
                'config',            // 2
                'div',               // 3
                'divToInt',          // 4
                'eq',                // 5
                'gt',                // 6
                'gte',               // 7
                'lt',                // 8
                'lte',               // 9
                'minus',             // 10
                'mod',               // 11
                'plus',              // 12
                'precision',         // 13
                'random',            // 14
                'round',             // 15
                'shift',             // 16
                'times',             // 17
                'toDigits',          // 18
                'toExponential',     // 19
                'toFixed',           // 20
                'toFormat',          // 21
                'toFraction',        // 22
                'pow',               // 23
                'toPrecision',       // 24
                'toString',          // 25
                'BigNumber'          // 26
            ][caller] + '() ' + msg + ': ' + val );

            error.name = 'BigNumber Error';
            id = 0;
            throw error;
        }


        /*
         * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
         * If r is truthy, it is known that there are more digits after the rounding digit.
         */
        function round( x, sd, rm, r ) {
            var d, i, j, k, n, ni, rd,
                xc = x.c,
                pows10 = POWS_TEN;

            // if x is not Infinity or NaN...
            if (xc) {

                // rd is the rounding digit, i.e. the digit after the digit that may be rounded up.
                // n is a base 1e14 number, the value of the element of array x.c containing rd.
                // ni is the index of n within x.c.
                // d is the number of digits of n.
                // i is the index of rd within n including leading zeros.
                // j is the actual index of rd within n (if < 0, rd is a leading zero).
                out: {

                    // Get the number of digits of the first element of xc.
                    for ( d = 1, k = xc[0]; k >= 10; k /= 10, d++ );
                    i = sd - d;

                    // If the rounding digit is in the first element of xc...
                    if ( i < 0 ) {
                        i += LOG_BASE;
                        j = sd;
                        n = xc[ ni = 0 ];

                        // Get the rounding digit at index j of n.
                        rd = n / pows10[ d - j - 1 ] % 10 | 0;
                    } else {
                        ni = mathceil( ( i + 1 ) / LOG_BASE );

                        if ( ni >= xc.length ) {

                            if (r) {

                                // Needed by sqrt.
                                for ( ; xc.length <= ni; xc.push(0) );
                                n = rd = 0;
                                d = 1;
                                i %= LOG_BASE;
                                j = i - LOG_BASE + 1;
                            } else {
                                break out;
                            }
                        } else {
                            n = k = xc[ni];

                            // Get the number of digits of n.
                            for ( d = 1; k >= 10; k /= 10, d++ );

                            // Get the index of rd within n.
                            i %= LOG_BASE;

                            // Get the index of rd within n, adjusted for leading zeros.
                            // The number of leading zeros of n is given by LOG_BASE - d.
                            j = i - LOG_BASE + d;

                            // Get the rounding digit at index j of n.
                            rd = j < 0 ? 0 : n / pows10[ d - j - 1 ] % 10 | 0;
                        }
                    }

                    r = r || sd < 0 ||

                    // Are there any non-zero digits after the rounding digit?
                    // The expression  n % pows10[ d - j - 1 ]  returns all digits of n to the right
                    // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
                      xc[ni + 1] != null || ( j < 0 ? n : n % pows10[ d - j - 1 ] );

                    r = rm < 4
                      ? ( rd || r ) && ( rm == 0 || rm == ( x.s < 0 ? 3 : 2 ) )
                      : rd > 5 || rd == 5 && ( rm == 4 || r || rm == 6 &&

                        // Check whether the digit to the left of the rounding digit is odd.
                        ( ( i > 0 ? j > 0 ? n / pows10[ d - j ] : 0 : xc[ni - 1] ) % 10 ) & 1 ||
                          rm == ( x.s < 0 ? 8 : 7 ) );

                    if ( sd < 1 || !xc[0] ) {
                        xc.length = 0;

                        if (r) {

                            // Convert sd to decimal places.
                            sd -= x.e + 1;

                            // 1, 0.1, 0.01, 0.001, 0.0001 etc.
                            xc[0] = pows10[ ( LOG_BASE - sd % LOG_BASE ) % LOG_BASE ];
                            x.e = -sd || 0;
                        } else {

                            // Zero.
                            xc[0] = x.e = 0;
                        }

                        return x;
                    }

                    // Remove excess digits.
                    if ( i == 0 ) {
                        xc.length = ni;
                        k = 1;
                        ni--;
                    } else {
                        xc.length = ni + 1;
                        k = pows10[ LOG_BASE - i ];

                        // E.g. 56700 becomes 56000 if 7 is the rounding digit.
                        // j > 0 means i > number of leading zeros of n.
                        xc[ni] = j > 0 ? mathfloor( n / pows10[ d - j ] % pows10[j] ) * k : 0;
                    }

                    // Round up?
                    if (r) {

                        for ( ; ; ) {

                            // If the digit to be rounded up is in the first element of xc...
                            if ( ni == 0 ) {

                                // i will be the length of xc[0] before k is added.
                                for ( i = 1, j = xc[0]; j >= 10; j /= 10, i++ );
                                j = xc[0] += k;
                                for ( k = 1; j >= 10; j /= 10, k++ );

                                // if i != k the length has increased.
                                if ( i != k ) {
                                    x.e++;
                                    if ( xc[0] == BASE ) xc[0] = 1;
                                }

                                break;
                            } else {
                                xc[ni] += k;
                                if ( xc[ni] != BASE ) break;
                                xc[ni--] = 0;
                                k = 1;
                            }
                        }
                    }

                    // Remove trailing zeros.
                    for ( i = xc.length; xc[--i] === 0; xc.pop() );
                }

                // Overflow? Infinity.
                if ( x.e > MAX_EXP ) {
                    x.c = x.e = null;

                // Underflow? Zero.
                } else if ( x.e < MIN_EXP ) {
                    x.c = [ x.e = 0 ];
                }
            }

            return x;
        }


        // PROTOTYPE/INSTANCE METHODS


        /*
         * Return a new BigNumber whose value is the absolute value of this BigNumber.
         */
        P.absoluteValue = P.abs = function () {
            var x = new BigNumber(this);
            if ( x.s < 0 ) x.s = 1;
            return x;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of Infinity.
         */
        P.ceil = function () {
            return round( new BigNumber(this), this.e + 1, 2 );
        };


        /*
         * Return
         * 1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
         * 0 if they have the same value,
         * or null if the value of either is NaN.
         */
        P.comparedTo = P.cmp = function ( y, b ) {
            id = 1;
            return compare( this, new BigNumber( y, b ) );
        };


        /*
         * Return the number of decimal places of the value of this BigNumber, or null if the value
         * of this BigNumber is ±Infinity or NaN.
         */
        P.decimalPlaces = P.dp = function () {
            var n, v,
                c = this.c;

            if ( !c ) return null;
            n = ( ( v = c.length - 1 ) - bitFloor( this.e / LOG_BASE ) ) * LOG_BASE;

            // Subtract the number of trailing zeros of the last number.
            if ( v = c[v] ) for ( ; v % 10 == 0; v /= 10, n-- );
            if ( n < 0 ) n = 0;

            return n;
        };


        /*
         *  n / 0 = I
         *  n / N = N
         *  n / I = 0
         *  0 / n = 0
         *  0 / 0 = N
         *  0 / N = N
         *  0 / I = 0
         *  N / n = N
         *  N / 0 = N
         *  N / N = N
         *  N / I = N
         *  I / n = I
         *  I / 0 = I
         *  I / N = N
         *  I / I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber divided by the value of
         * BigNumber(y, b), rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.dividedBy = P.div = function ( y, b ) {
            id = 3;
            return div( this, new BigNumber( y, b ), DECIMAL_PLACES, ROUNDING_MODE );
        };


        /*
         * Return a new BigNumber whose value is the integer part of dividing the value of this
         * BigNumber by the value of BigNumber(y, b).
         */
        P.dividedToIntegerBy = P.divToInt = function ( y, b ) {
            id = 4;
            return div( this, new BigNumber( y, b ), 0, 1 );
        };


        /*
         * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.equals = P.eq = function ( y, b ) {
            id = 5;
            return compare( this, new BigNumber( y, b ) ) === 0;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a whole
         * number in the direction of -Infinity.
         */
        P.floor = function () {
            return round( new BigNumber(this), this.e + 1, 3 );
        };


        /*
         * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.greaterThan = P.gt = function ( y, b ) {
            id = 6;
            return compare( this, new BigNumber( y, b ) ) > 0;
        };


        /*
         * Return true if the value of this BigNumber is greater than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */
        P.greaterThanOrEqualTo = P.gte = function ( y, b ) {
            id = 7;
            return ( b = compare( this, new BigNumber( y, b ) ) ) === 1 || b === 0;

        };


        /*
         * Return true if the value of this BigNumber is a finite number, otherwise returns false.
         */
        P.isFinite = function () {
            return !!this.c;
        };


        /*
         * Return true if the value of this BigNumber is an integer, otherwise return false.
         */
        P.isInteger = P.isInt = function () {
            return !!this.c && bitFloor( this.e / LOG_BASE ) > this.c.length - 2;
        };


        /*
         * Return true if the value of this BigNumber is NaN, otherwise returns false.
         */
        P.isNaN = function () {
            return !this.s;
        };


        /*
         * Return true if the value of this BigNumber is negative, otherwise returns false.
         */
        P.isNegative = P.isNeg = function () {
            return this.s < 0;
        };


        /*
         * Return true if the value of this BigNumber is 0 or -0, otherwise returns false.
         */
        P.isZero = function () {
            return !!this.c && this.c[0] == 0;
        };


        /*
         * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
         * otherwise returns false.
         */
        P.lessThan = P.lt = function ( y, b ) {
            id = 8;
            return compare( this, new BigNumber( y, b ) ) < 0;
        };


        /*
         * Return true if the value of this BigNumber is less than or equal to the value of
         * BigNumber(y, b), otherwise returns false.
         */
        P.lessThanOrEqualTo = P.lte = function ( y, b ) {
            id = 9;
            return ( b = compare( this, new BigNumber( y, b ) ) ) === -1 || b === 0;
        };


        /*
         *  n - 0 = n
         *  n - N = N
         *  n - I = -I
         *  0 - n = -n
         *  0 - 0 = 0
         *  0 - N = N
         *  0 - I = -I
         *  N - n = N
         *  N - 0 = N
         *  N - N = N
         *  N - I = N
         *  I - n = I
         *  I - 0 = I
         *  I - N = N
         *  I - I = N
         *
         * Return a new BigNumber whose value is the value of this BigNumber minus the value of
         * BigNumber(y, b).
         */
        P.minus = P.sub = function ( y, b ) {
            var i, j, t, xLTy,
                x = this,
                a = x.s;

            id = 10;
            y = new BigNumber( y, b );
            b = y.s;

            // Either NaN?
            if ( !a || !b ) return new BigNumber(NaN);

            // Signs differ?
            if ( a != b ) {
                y.s = -b;
                return x.plus(y);
            }

            var xe = x.e / LOG_BASE,
                ye = y.e / LOG_BASE,
                xc = x.c,
                yc = y.c;

            if ( !xe || !ye ) {

                // Either Infinity?
                if ( !xc || !yc ) return xc ? ( y.s = -b, y ) : new BigNumber( yc ? x : NaN );

                // Either zero?
                if ( !xc[0] || !yc[0] ) {

                    // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
                    return yc[0] ? ( y.s = -b, y ) : new BigNumber( xc[0] ? x :

                      // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
                      ROUNDING_MODE == 3 ? -0 : 0 );
                }
            }

            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();

            // Determine which is the bigger number.
            if ( a = xe - ye ) {

                if ( xLTy = a < 0 ) {
                    a = -a;
                    t = xc;
                } else {
                    ye = xe;
                    t = yc;
                }

                t.reverse();

                // Prepend zeros to equalise exponents.
                for ( b = a; b--; t.push(0) );
                t.reverse();
            } else {

                // Exponents equal. Check digit by digit.
                j = ( xLTy = ( a = xc.length ) < ( b = yc.length ) ) ? a : b;

                for ( a = b = 0; b < j; b++ ) {

                    if ( xc[b] != yc[b] ) {
                        xLTy = xc[b] < yc[b];
                        break;
                    }
                }
            }

            // x < y? Point xc to the array of the bigger number.
            if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

            b = ( j = yc.length ) - ( i = xc.length );

            // Append zeros to xc if shorter.
            // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
            if ( b > 0 ) for ( ; b--; xc[i++] = 0 );
            b = BASE - 1;

            // Subtract yc from xc.
            for ( ; j > a; ) {

                if ( xc[--j] < yc[j] ) {
                    for ( i = j; i && !xc[--i]; xc[i] = b );
                    --xc[i];
                    xc[j] += BASE;
                }

                xc[j] -= yc[j];
            }

            // Remove leading zeros and adjust exponent accordingly.
            for ( ; xc[0] == 0; xc.splice(0, 1), --ye );

            // Zero?
            if ( !xc[0] ) {

                // Following IEEE 754 (2008) 6.3,
                // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
                y.s = ROUNDING_MODE == 3 ? -1 : 1;
                y.c = [ y.e = 0 ];
                return y;
            }

            // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
            // for finite x and y.
            return normalise( y, xc, ye );
        };


        /*
         *   n % 0 =  N
         *   n % N =  N
         *   n % I =  n
         *   0 % n =  0
         *  -0 % n = -0
         *   0 % 0 =  N
         *   0 % N =  N
         *   0 % I =  0
         *   N % n =  N
         *   N % 0 =  N
         *   N % N =  N
         *   N % I =  N
         *   I % n =  N
         *   I % 0 =  N
         *   I % N =  N
         *   I % I =  N
         *
         * Return a new BigNumber whose value is the value of this BigNumber modulo the value of
         * BigNumber(y, b). The result depends on the value of MODULO_MODE.
         */
        P.modulo = P.mod = function ( y, b ) {
            var q, s,
                x = this;

            id = 11;
            y = new BigNumber( y, b );

            // Return NaN if x is Infinity or NaN, or y is NaN or zero.
            if ( !x.c || !y.s || y.c && !y.c[0] ) {
                return new BigNumber(NaN);

            // Return x if y is Infinity or x is zero.
            } else if ( !y.c || x.c && !x.c[0] ) {
                return new BigNumber(x);
            }

            if ( MODULO_MODE == 9 ) {

                // Euclidian division: q = sign(y) * floor(x / abs(y))
                // r = x - qy    where  0 <= r < abs(y)
                s = y.s;
                y.s = 1;
                q = div( x, y, 0, 3 );
                y.s = s;
                q.s *= s;
            } else {
                q = div( x, y, 0, MODULO_MODE );
            }

            return x.minus( q.times(y) );
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber negated,
         * i.e. multiplied by -1.
         */
        P.negated = P.neg = function () {
            var x = new BigNumber(this);
            x.s = -x.s || null;
            return x;
        };


        /*
         *  n + 0 = n
         *  n + N = N
         *  n + I = I
         *  0 + n = n
         *  0 + 0 = 0
         *  0 + N = N
         *  0 + I = I
         *  N + n = N
         *  N + 0 = N
         *  N + N = N
         *  N + I = N
         *  I + n = I
         *  I + 0 = I
         *  I + N = N
         *  I + I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber plus the value of
         * BigNumber(y, b).
         */
        P.plus = P.add = function ( y, b ) {
            var t,
                x = this,
                a = x.s;

            id = 12;
            y = new BigNumber( y, b );
            b = y.s;

            // Either NaN?
            if ( !a || !b ) return new BigNumber(NaN);

            // Signs differ?
             if ( a != b ) {
                y.s = -b;
                return x.minus(y);
            }

            var xe = x.e / LOG_BASE,
                ye = y.e / LOG_BASE,
                xc = x.c,
                yc = y.c;

            if ( !xe || !ye ) {

                // Return ±Infinity if either ±Infinity.
                if ( !xc || !yc ) return new BigNumber( a / 0 );

                // Either zero?
                // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
                if ( !xc[0] || !yc[0] ) return yc[0] ? y : new BigNumber( xc[0] ? x : a * 0 );
            }

            xe = bitFloor(xe);
            ye = bitFloor(ye);
            xc = xc.slice();

            // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
            if ( a = xe - ye ) {
                if ( a > 0 ) {
                    ye = xe;
                    t = yc;
                } else {
                    a = -a;
                    t = xc;
                }

                t.reverse();
                for ( ; a--; t.push(0) );
                t.reverse();
            }

            a = xc.length;
            b = yc.length;

            // Point xc to the longer array, and b to the shorter length.
            if ( a - b < 0 ) t = yc, yc = xc, xc = t, b = a;

            // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
            for ( a = 0; b; ) {
                a = ( xc[--b] = xc[b] + yc[b] + a ) / BASE | 0;
                xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
            }

            if (a) {
                xc = [a].concat(xc);
                ++ye;
            }

            // No need to check for zero, as +x + +y != 0 && -x + -y != 0
            // ye = MAX_EXP + 1 possible
            return normalise( y, xc, ye );
        };


        /*
         * Return the number of significant digits of the value of this BigNumber.
         *
         * [z] {boolean|number} Whether to count integer-part trailing zeros: true, false, 1 or 0.
         */
        P.precision = P.sd = function (z) {
            var n, v,
                x = this,
                c = x.c;

            // 'precision() argument not a boolean or binary digit: {z}'
            if ( z != null && z !== !!z && z !== 1 && z !== 0 ) {
                if (ERRORS) raise( 13, 'argument' + notBool, z );
                if ( z != !!z ) z = null;
            }

            if ( !c ) return null;
            v = c.length - 1;
            n = v * LOG_BASE + 1;

            if ( v = c[v] ) {

                // Subtract the number of trailing zeros of the last element.
                for ( ; v % 10 == 0; v /= 10, n-- );

                // Add the number of digits of the first element.
                for ( v = c[0]; v >= 10; v /= 10, n++ );
            }

            if ( z && x.e + 1 > n ) n = x.e + 1;

            return n;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * dp decimal places using rounding mode rm, or to 0 and ROUNDING_MODE respectively if
         * omitted.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'round() decimal places out of range: {dp}'
         * 'round() decimal places not an integer: {dp}'
         * 'round() rounding mode not an integer: {rm}'
         * 'round() rounding mode out of range: {rm}'
         */
        P.round = function ( dp, rm ) {
            var n = new BigNumber(this);

            if ( dp == null || isValidInt( dp, 0, MAX, 15 ) ) {
                round( n, ~~dp + this.e + 1, rm == null ||
                  !isValidInt( rm, 0, 8, 15, roundingMode ) ? ROUNDING_MODE : rm | 0 );
            }

            return n;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
         * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
         *
         * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         *
         * If k is out of range and ERRORS is false, the result will be ±0 if k < 0, or ±Infinity
         * otherwise.
         *
         * 'shift() argument not an integer: {k}'
         * 'shift() argument out of range: {k}'
         */
        P.shift = function (k) {
            var n = this;
            return isValidInt( k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER, 16, 'argument' )

              // k < 1e+21, or truncate(k) will produce exponential notation.
              ? n.times( '1e' + truncate(k) )
              : new BigNumber( n.c && n.c[0] && ( k < -MAX_SAFE_INTEGER || k > MAX_SAFE_INTEGER )
                ? n.s * ( k < 0 ? 0 : 1 / 0 )
                : n );
        };


        /*
         *  sqrt(-n) =  N
         *  sqrt( N) =  N
         *  sqrt(-I) =  N
         *  sqrt( I) =  I
         *  sqrt( 0) =  0
         *  sqrt(-0) = -0
         *
         * Return a new BigNumber whose value is the square root of the value of this BigNumber,
         * rounded according to DECIMAL_PLACES and ROUNDING_MODE.
         */
        P.squareRoot = P.sqrt = function () {
            var m, n, r, rep, t,
                x = this,
                c = x.c,
                s = x.s,
                e = x.e,
                dp = DECIMAL_PLACES + 4,
                half = new BigNumber('0.5');

            // Negative/NaN/Infinity/zero?
            if ( s !== 1 || !c || !c[0] ) {
                return new BigNumber( !s || s < 0 && ( !c || c[0] ) ? NaN : c ? x : 1 / 0 );
            }

            // Initial estimate.
            s = Math.sqrt( +x );

            // Math.sqrt underflow/overflow?
            // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
            if ( s == 0 || s == 1 / 0 ) {
                n = coeffToString(c);
                if ( ( n.length + e ) % 2 == 0 ) n += '0';
                s = Math.sqrt(n);
                e = bitFloor( ( e + 1 ) / 2 ) - ( e < 0 || e % 2 );

                if ( s == 1 / 0 ) {
                    n = '1e' + e;
                } else {
                    n = s.toExponential();
                    n = n.slice( 0, n.indexOf('e') + 1 ) + e;
                }

                r = new BigNumber(n);
            } else {
                r = new BigNumber( s + '' );
            }

            // Check for zero.
            // r could be zero if MIN_EXP is changed after the this value was created.
            // This would cause a division by zero (x/t) and hence Infinity below, which would cause
            // coeffToString to throw.
            if ( r.c[0] ) {
                e = r.e;
                s = e + dp;
                if ( s < 3 ) s = 0;

                // Newton-Raphson iteration.
                for ( ; ; ) {
                    t = r;
                    r = half.times( t.plus( div( x, t, dp, 1 ) ) );

                    if ( coeffToString( t.c   ).slice( 0, s ) === ( n =
                         coeffToString( r.c ) ).slice( 0, s ) ) {

                        // The exponent of r may here be one less than the final result exponent,
                        // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
                        // are indexed correctly.
                        if ( r.e < e ) --s;
                        n = n.slice( s - 3, s + 1 );

                        // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
                        // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
                        // iteration.
                        if ( n == '9999' || !rep && n == '4999' ) {

                            // On the first iteration only, check to see if rounding up gives the
                            // exact result as the nines may infinitely repeat.
                            if ( !rep ) {
                                round( t, t.e + DECIMAL_PLACES + 2, 0 );

                                if ( t.times(t).eq(x) ) {
                                    r = t;
                                    break;
                                }
                            }

                            dp += 4;
                            s += 4;
                            rep = 1;
                        } else {

                            // If rounding digits are null, 0{0,4} or 50{0,3}, check for exact
                            // result. If not, then there are further digits and m will be truthy.
                            if ( !+n || !+n.slice(1) && n.charAt(0) == '5' ) {

                                // Truncate to the first rounding digit.
                                round( r, r.e + DECIMAL_PLACES + 2, 1 );
                                m = !r.times(r).eq(x);
                            }

                            break;
                        }
                    }
                }
            }

            return round( r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m );
        };


        /*
         *  n * 0 = 0
         *  n * N = N
         *  n * I = I
         *  0 * n = 0
         *  0 * 0 = 0
         *  0 * N = N
         *  0 * I = N
         *  N * n = N
         *  N * 0 = N
         *  N * N = N
         *  N * I = N
         *  I * n = I
         *  I * 0 = N
         *  I * N = N
         *  I * I = I
         *
         * Return a new BigNumber whose value is the value of this BigNumber times the value of
         * BigNumber(y, b).
         */
        P.times = P.mul = function ( y, b ) {
            var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
                base, sqrtBase,
                x = this,
                xc = x.c,
                yc = ( id = 17, y = new BigNumber( y, b ) ).c;

            // Either NaN, ±Infinity or ±0?
            if ( !xc || !yc || !xc[0] || !yc[0] ) {

                // Return NaN if either is NaN, or one is 0 and the other is Infinity.
                if ( !x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc ) {
                    y.c = y.e = y.s = null;
                } else {
                    y.s *= x.s;

                    // Return ±Infinity if either is ±Infinity.
                    if ( !xc || !yc ) {
                        y.c = y.e = null;

                    // Return ±0 if either is ±0.
                    } else {
                        y.c = [0];
                        y.e = 0;
                    }
                }

                return y;
            }

            e = bitFloor( x.e / LOG_BASE ) + bitFloor( y.e / LOG_BASE );
            y.s *= x.s;
            xcL = xc.length;
            ycL = yc.length;

            // Ensure xc points to longer array and xcL to its length.
            if ( xcL < ycL ) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

            // Initialise the result array with zeros.
            for ( i = xcL + ycL, zc = []; i--; zc.push(0) );

            base = BASE;
            sqrtBase = SQRT_BASE;

            for ( i = ycL; --i >= 0; ) {
                c = 0;
                ylo = yc[i] % sqrtBase;
                yhi = yc[i] / sqrtBase | 0;

                for ( k = xcL, j = i + k; j > i; ) {
                    xlo = xc[--k] % sqrtBase;
                    xhi = xc[k] / sqrtBase | 0;
                    m = yhi * xlo + xhi * ylo;
                    xlo = ylo * xlo + ( ( m % sqrtBase ) * sqrtBase ) + zc[j] + c;
                    c = ( xlo / base | 0 ) + ( m / sqrtBase | 0 ) + yhi * xhi;
                    zc[j--] = xlo % base;
                }

                zc[j] = c;
            }

            if (c) {
                ++e;
            } else {
                zc.splice(0, 1);
            }

            return normalise( y, zc, e );
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber rounded to a maximum of
         * sd significant digits using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toDigits() precision out of range: {sd}'
         * 'toDigits() precision not an integer: {sd}'
         * 'toDigits() rounding mode not an integer: {rm}'
         * 'toDigits() rounding mode out of range: {rm}'
         */
        P.toDigits = function ( sd, rm ) {
            var n = new BigNumber(this);
            sd = sd == null || !isValidInt( sd, 1, MAX, 18, 'precision' ) ? null : sd | 0;
            rm = rm == null || !isValidInt( rm, 0, 8, 18, roundingMode ) ? ROUNDING_MODE : rm | 0;
            return sd ? round( n, sd, rm ) : n;
        };


        /*
         * Return a string representing the value of this BigNumber in exponential notation and
         * rounded using ROUNDING_MODE to dp fixed decimal places.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toExponential() decimal places not an integer: {dp}'
         * 'toExponential() decimal places out of range: {dp}'
         * 'toExponential() rounding mode not an integer: {rm}'
         * 'toExponential() rounding mode out of range: {rm}'
         */
        P.toExponential = function ( dp, rm ) {
            return format( this,
              dp != null && isValidInt( dp, 0, MAX, 19 ) ? ~~dp + 1 : null, rm, 19 );
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounding
         * to dp fixed decimal places using rounding mode rm, or ROUNDING_MODE if rm is omitted.
         *
         * Note: as with JavaScript's number type, (-0).toFixed(0) is '0',
         * but e.g. (-0.00001).toFixed(0) is '-0'.
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFixed() decimal places not an integer: {dp}'
         * 'toFixed() decimal places out of range: {dp}'
         * 'toFixed() rounding mode not an integer: {rm}'
         * 'toFixed() rounding mode out of range: {rm}'
         */
        P.toFixed = function ( dp, rm ) {
            return format( this, dp != null && isValidInt( dp, 0, MAX, 20 )
              ? ~~dp + this.e + 1 : null, rm, 20 );
        };


        /*
         * Return a string representing the value of this BigNumber in fixed-point notation rounded
         * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
         * of the FORMAT object (see BigNumber.config).
         *
         * FORMAT = {
         *      decimalSeparator : '.',
         *      groupSeparator : ',',
         *      groupSize : 3,
         *      secondaryGroupSize : 0,
         *      fractionGroupSeparator : '\xA0',    // non-breaking space
         *      fractionGroupSize : 0
         * };
         *
         * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toFormat() decimal places not an integer: {dp}'
         * 'toFormat() decimal places out of range: {dp}'
         * 'toFormat() rounding mode not an integer: {rm}'
         * 'toFormat() rounding mode out of range: {rm}'
         */
        P.toFormat = function ( dp, rm ) {
            var str = format( this, dp != null && isValidInt( dp, 0, MAX, 21 )
              ? ~~dp + this.e + 1 : null, rm, 21 );

            if ( this.c ) {
                var i,
                    arr = str.split('.'),
                    g1 = +FORMAT.groupSize,
                    g2 = +FORMAT.secondaryGroupSize,
                    groupSeparator = FORMAT.groupSeparator,
                    intPart = arr[0],
                    fractionPart = arr[1],
                    isNeg = this.s < 0,
                    intDigits = isNeg ? intPart.slice(1) : intPart,
                    len = intDigits.length;

                if (g2) i = g1, g1 = g2, g2 = i, len -= i;

                if ( g1 > 0 && len > 0 ) {
                    i = len % g1 || g1;
                    intPart = intDigits.substr( 0, i );

                    for ( ; i < len; i += g1 ) {
                        intPart += groupSeparator + intDigits.substr( i, g1 );
                    }

                    if ( g2 > 0 ) intPart += groupSeparator + intDigits.slice(i);
                    if (isNeg) intPart = '-' + intPart;
                }

                str = fractionPart
                  ? intPart + FORMAT.decimalSeparator + ( ( g2 = +FORMAT.fractionGroupSize )
                    ? fractionPart.replace( new RegExp( '\\d{' + g2 + '}\\B', 'g' ),
                      '$&' + FORMAT.fractionGroupSeparator )
                    : fractionPart )
                  : intPart;
            }

            return str;
        };


        /*
         * Return a string array representing the value of this BigNumber as a simple fraction with
         * an integer numerator and an integer denominator. The denominator will be a positive
         * non-zero value less than or equal to the specified maximum denominator. If a maximum
         * denominator is not specified, the denominator will be the lowest value necessary to
         * represent the number exactly.
         *
         * [md] {number|string|BigNumber} Integer >= 1 and < Infinity. The maximum denominator.
         *
         * 'toFraction() max denominator not an integer: {md}'
         * 'toFraction() max denominator out of range: {md}'
         */
        P.toFraction = function (md) {
            var arr, d0, d2, e, exp, n, n0, q, s,
                k = ERRORS,
                x = this,
                xc = x.c,
                d = new BigNumber(ONE),
                n1 = d0 = new BigNumber(ONE),
                d1 = n0 = new BigNumber(ONE);

            if ( md != null ) {
                ERRORS = false;
                n = new BigNumber(md);
                ERRORS = k;

                if ( !( k = n.isInt() ) || n.lt(ONE) ) {

                    if (ERRORS) {
                        raise( 22,
                          'max denominator ' + ( k ? 'out of range' : 'not an integer' ), md );
                    }

                    // ERRORS is false:
                    // If md is a finite non-integer >= 1, round it to an integer and use it.
                    md = !k && n.c && round( n, n.e + 1, 1 ).gte(ONE) ? n : null;
                }
            }

            if ( !xc ) return x.toString();
            s = coeffToString(xc);

            // Determine initial denominator.
            // d is a power of 10 and the minimum max denominator that specifies the value exactly.
            e = d.e = s.length - x.e - 1;
            d.c[0] = POWS_TEN[ ( exp = e % LOG_BASE ) < 0 ? LOG_BASE + exp : exp ];
            md = !md || n.cmp(d) > 0 ? ( e > 0 ? d : n1 ) : n;

            exp = MAX_EXP;
            MAX_EXP = 1 / 0;
            n = new BigNumber(s);

            // n0 = d1 = 0
            n0.c[0] = 0;

            for ( ; ; )  {
                q = div( n, d, 0, 1 );
                d2 = d0.plus( q.times(d1) );
                if ( d2.cmp(md) == 1 ) break;
                d0 = d1;
                d1 = d2;
                n1 = n0.plus( q.times( d2 = n1 ) );
                n0 = d2;
                d = n.minus( q.times( d2 = d ) );
                n = d2;
            }

            d2 = div( md.minus(d0), d1, 0, 1 );
            n0 = n0.plus( d2.times(n1) );
            d0 = d0.plus( d2.times(d1) );
            n0.s = n1.s = x.s;
            e *= 2;

            // Determine which fraction is closer to x, n0/d0 or n1/d1
            arr = div( n1, d1, e, ROUNDING_MODE ).minus(x).abs().cmp(
                  div( n0, d0, e, ROUNDING_MODE ).minus(x).abs() ) < 1
                    ? [ n1.toString(), d1.toString() ]
                    : [ n0.toString(), d0.toString() ];

            MAX_EXP = exp;
            return arr;
        };


        /*
         * Return the value of this BigNumber converted to a number primitive.
         */
        P.toNumber = function () {
            return +this;
        };


        /*
         * Return a BigNumber whose value is the value of this BigNumber raised to the power n.
         * If m is present, return the result modulo m.
         * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
         * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using
         * ROUNDING_MODE.
         *
         * The modular power operation works efficiently when x, n, and m are positive integers,
         * otherwise it is equivalent to calculating x.toPower(n).modulo(m) (with POW_PRECISION 0).
         *
         * n {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
         * [m] {number|string|BigNumber} The modulus.
         *
         * 'pow() exponent not an integer: {n}'
         * 'pow() exponent out of range: {n}'
         *
         * Performs 54 loop iterations for n of 9007199254740991.
         */
        P.toPower = P.pow = function ( n, m ) {
            var k, y, z,
                i = mathfloor( n < 0 ? -n : +n ),
                x = this;

            if ( m != null ) {
                id = 23;
                m = new BigNumber(m);
            }

            // Pass ±Infinity to Math.pow if exponent is out of range.
            if ( !isValidInt( n, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER, 23, 'exponent' ) &&
              ( !isFinite(n) || i > MAX_SAFE_INTEGER && ( n /= 0 ) ||
                parseFloat(n) != n && !( n = NaN ) ) || n == 0 ) {
                k = Math.pow( +x, n );
                return new BigNumber( m ? k % m : k );
            }

            if (m) {
                if ( n > 1 && x.gt(ONE) && x.isInt() && m.gt(ONE) && m.isInt() ) {
                    x = x.mod(m);
                } else {
                    z = m;

                    // Nullify m so only a single mod operation is performed at the end.
                    m = null;
                }
            } else if (POW_PRECISION) {

                // Truncating each coefficient array to a length of k after each multiplication
                // equates to truncating significant digits to POW_PRECISION + [28, 41],
                // i.e. there will be a minimum of 28 guard digits retained.
                // (Using + 1.5 would give [9, 21] guard digits.)
                k = mathceil( POW_PRECISION / LOG_BASE + 2 );
            }

            y = new BigNumber(ONE);

            for ( ; ; ) {
                if ( i % 2 ) {
                    y = y.times(x);
                    if ( !y.c ) break;
                    if (k) {
                        if ( y.c.length > k ) y.c.length = k;
                    } else if (m) {
                        y = y.mod(m);
                    }
                }

                i = mathfloor( i / 2 );
                if ( !i ) break;
                x = x.times(x);
                if (k) {
                    if ( x.c && x.c.length > k ) x.c.length = k;
                } else if (m) {
                    x = x.mod(m);
                }
            }

            if (m) return y;
            if ( n < 0 ) y = ONE.div(y);

            return z ? y.mod(z) : k ? round( y, POW_PRECISION, ROUNDING_MODE ) : y;
        };


        /*
         * Return a string representing the value of this BigNumber rounded to sd significant digits
         * using rounding mode rm or ROUNDING_MODE. If sd is less than the number of digits
         * necessary to represent the integer part of the value in fixed-point notation, then use
         * exponential notation.
         *
         * [sd] {number} Significant digits. Integer, 1 to MAX inclusive.
         * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
         *
         * 'toPrecision() precision not an integer: {sd}'
         * 'toPrecision() precision out of range: {sd}'
         * 'toPrecision() rounding mode not an integer: {rm}'
         * 'toPrecision() rounding mode out of range: {rm}'
         */
        P.toPrecision = function ( sd, rm ) {
            return format( this, sd != null && isValidInt( sd, 1, MAX, 24, 'precision' )
              ? sd | 0 : null, rm, 24 );
        };


        /*
         * Return a string representing the value of this BigNumber in base b, or base 10 if b is
         * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
         * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
         * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
         * TO_EXP_NEG, return exponential notation.
         *
         * [b] {number} Integer, 2 to 64 inclusive.
         *
         * 'toString() base not an integer: {b}'
         * 'toString() base out of range: {b}'
         */
        P.toString = function (b) {
            var str,
                n = this,
                s = n.s,
                e = n.e;

            // Infinity or NaN?
            if ( e === null ) {

                if (s) {
                    str = 'Infinity';
                    if ( s < 0 ) str = '-' + str;
                } else {
                    str = 'NaN';
                }
            } else {
                str = coeffToString( n.c );

                if ( b == null || !isValidInt( b, 2, 64, 25, 'base' ) ) {
                    str = e <= TO_EXP_NEG || e >= TO_EXP_POS
                      ? toExponential( str, e )
                      : toFixedPoint( str, e );
                } else {
                    str = convertBase( toFixedPoint( str, e ), b | 0, 10, s );
                }

                if ( s < 0 && n.c[0] ) str = '-' + str;
            }

            return str;
        };


        /*
         * Return a new BigNumber whose value is the value of this BigNumber truncated to a whole
         * number.
         */
        P.truncated = P.trunc = function () {
            return round( new BigNumber(this), this.e + 1, 1 );
        };


        /*
         * Return as toString, but do not accept a base argument, and include the minus sign for
         * negative zero.
         */
        P.valueOf = P.toJSON = function () {
            var str,
                n = this,
                e = n.e;

            if ( e === null ) return n.toString();

            str = coeffToString( n.c );

            str = e <= TO_EXP_NEG || e >= TO_EXP_POS
                ? toExponential( str, e )
                : toFixedPoint( str, e );

            return n.s < 0 ? '-' + str : str;
        };


        P.isBigNumber = true;

        if ( config != null ) BigNumber.config(config);

        return BigNumber;
    }


    // PRIVATE HELPER FUNCTIONS


    function bitFloor(n) {
        var i = n | 0;
        return n > 0 || n === i ? i : i - 1;
    }


    // Return a coefficient array as a string of base 10 digits.
    function coeffToString(a) {
        var s, z,
            i = 1,
            j = a.length,
            r = a[0] + '';

        for ( ; i < j; ) {
            s = a[i++] + '';
            z = LOG_BASE - s.length;
            for ( ; z--; s = '0' + s );
            r += s;
        }

        // Determine trailing zeros.
        for ( j = r.length; r.charCodeAt(--j) === 48; );
        return r.slice( 0, j + 1 || 1 );
    }


    // Compare the value of BigNumbers x and y.
    function compare( x, y ) {
        var a, b,
            xc = x.c,
            yc = y.c,
            i = x.s,
            j = y.s,
            k = x.e,
            l = y.e;

        // Either NaN?
        if ( !i || !j ) return null;

        a = xc && !xc[0];
        b = yc && !yc[0];

        // Either zero?
        if ( a || b ) return a ? b ? 0 : -j : i;

        // Signs differ?
        if ( i != j ) return i;

        a = i < 0;
        b = k == l;

        // Either Infinity?
        if ( !xc || !yc ) return b ? 0 : !xc ^ a ? 1 : -1;

        // Compare exponents.
        if ( !b ) return k > l ^ a ? 1 : -1;

        j = ( k = xc.length ) < ( l = yc.length ) ? k : l;

        // Compare digit by digit.
        for ( i = 0; i < j; i++ ) if ( xc[i] != yc[i] ) return xc[i] > yc[i] ^ a ? 1 : -1;

        // Compare lengths.
        return k == l ? 0 : k > l ^ a ? 1 : -1;
    }


    /*
     * Return true if n is a valid number in range, otherwise false.
     * Use for argument validation when ERRORS is false.
     * Note: parseInt('1e+1') == 1 but parseFloat('1e+1') == 10.
     */
    function intValidatorNoErrors( n, min, max ) {
        return ( n = truncate(n) ) >= min && n <= max;
    }


    function isArray(obj) {
        return Object.prototype.toString.call(obj) == '[object Array]';
    }


    /*
     * Convert string of baseIn to an array of numbers of baseOut.
     * Eg. convertBase('255', 10, 16) returns [15, 15].
     * Eg. convertBase('ff', 16, 10) returns [2, 5, 5].
     */
    function toBaseOut( str, baseIn, baseOut ) {
        var j,
            arr = [0],
            arrL,
            i = 0,
            len = str.length;

        for ( ; i < len; ) {
            for ( arrL = arr.length; arrL--; arr[arrL] *= baseIn );
            arr[ j = 0 ] += ALPHABET.indexOf( str.charAt( i++ ) );

            for ( ; j < arr.length; j++ ) {

                if ( arr[j] > baseOut - 1 ) {
                    if ( arr[j + 1] == null ) arr[j + 1] = 0;
                    arr[j + 1] += arr[j] / baseOut | 0;
                    arr[j] %= baseOut;
                }
            }
        }

        return arr.reverse();
    }


    function toExponential( str, e ) {
        return ( str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str ) +
          ( e < 0 ? 'e' : 'e+' ) + e;
    }


    function toFixedPoint( str, e ) {
        var len, z;

        // Negative exponent?
        if ( e < 0 ) {

            // Prepend zeros.
            for ( z = '0.'; ++e; z += '0' );
            str = z + str;

        // Positive exponent
        } else {
            len = str.length;

            // Append zeros.
            if ( ++e > len ) {
                for ( z = '0', e -= len; --e; z += '0' );
                str += z;
            } else if ( e < len ) {
                str = str.slice( 0, e ) + '.' + str.slice(e);
            }
        }

        return str;
    }


    function truncate(n) {
        n = parseFloat(n);
        return n < 0 ? mathceil(n) : mathfloor(n);
    }


    // EXPORT


    BigNumber = constructorFactory();
    BigNumber['default'] = BigNumber.BigNumber = BigNumber;


    // AMD.
    if ( typeof define == 'function' && define.amd ) {
        define( function () { return BigNumber; } );

    // Node.js and other environments that support module.exports.
    } else if ( typeof module != 'undefined' && module.exports ) {
        module.exports = BigNumber;

    // Browser.
    } else {
        if ( !globalObj ) globalObj = typeof self != 'undefined' ? self : Function('return this')();
        globalObj.BigNumber = BigNumber;
    }
})(this);

},{}],2:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

module.exports = {
    languageTag: "en-US",
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
    spaceSeparated: false,
    ordinal: function ordinal(number) {
        var b = number % 10;
        return ~~(number % 100 / 10) === 1 ? "th" : b === 1 ? "st" : b === 2 ? "nd" : b === 3 ? "rd" : "th";
    },
    currency: {
        symbol: "$",
        position: "prefix",
        code: "USD"
    },
    currencyFormat: {
        thousandSeparated: true,
        totalLength: 4,
        spaceSeparated: true
    },
    formats: {
        fourDigits: {
            totalLength: 4,
            spaceSeparated: true
        },
        fullWithTwoDecimals: {
            output: "currency",
            thousandSeparated: true,
            mantissa: 2
        },
        fullWithTwoDecimalsNoCurrency: {
            thousandSeparated: true,
            mantissa: 2
        },
        fullWithNoDecimals: {
            output: "currency",
            thousandSeparated: true,
            mantissa: 0
        }
    }
};

},{}],3:[function(require,module,exports){
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var globalState = require("./globalState");
var validating = require("./validating");
var parsing = require("./parsing");

var binarySuffixes = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
var decimalSuffixes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
var bytes = {
    general: { scale: 1024, suffixes: decimalSuffixes, marker: "bd" },
    binary: { scale: 1024, suffixes: binarySuffixes, marker: "b" },
    decimal: { scale: 1000, suffixes: decimalSuffixes, marker: "d" }
};

var defaultOptions = {
    totalLength: 0,
    characteristic: 0,
    forceAverage: false,
    average: false,
    mantissa: -1,
    optionalMantissa: true,
    thousandSeparated: false,
    spaceSeparated: false,
    negative: "sign",
    forceSign: false
};

/**
 * Entry point. Format the provided INSTANCE according to the PROVIDEDFORMAT.
 * This method ensure the prefix and postfix are added as the last step.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {NumbroFormat|string} [providedFormat] - specification for formatting
 * @param numbro - the numbro singleton
 * @return {string}
 */
function _format(instance) {
    var providedFormat = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var numbro = arguments[2];

    if (typeof providedFormat === "string") {
        providedFormat = parsing.parseFormat(providedFormat);
    }

    var valid = validating.validateFormat(providedFormat);

    if (!valid) {
        return "ERROR: invalid format";
    }

    var prefix = providedFormat.prefix || "";
    var postfix = providedFormat.postfix || "";

    var output = formatNumbro(instance, providedFormat, numbro);
    output = insertPrefix(output, prefix);
    output = insertPostfix(output, postfix);
    return output;
}

/**
 * Format the provided INSTANCE according to the PROVIDEDFORMAT.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param numbro - the numbro singleton
 * @return {string}
 */
function formatNumbro(instance, providedFormat, numbro) {
    switch (providedFormat.output) {
        case "currency":
            {
                providedFormat = formatOrDefault(providedFormat, globalState.currentCurrencyDefaultFormat());
                return formatCurrency(instance, providedFormat, globalState, numbro);
            }
        case "percent":
            {
                providedFormat = formatOrDefault(providedFormat, globalState.currentPercentageDefaultFormat());
                return formatPercentage(instance, providedFormat, globalState, numbro);
            }
        case "byte":
            providedFormat = formatOrDefault(providedFormat, globalState.currentByteDefaultFormat());
            return formatByte(instance, providedFormat, globalState, numbro);
        case "time":
            providedFormat = formatOrDefault(providedFormat, globalState.currentTimeDefaultFormat());
            return formatTime(instance, providedFormat, globalState, numbro);
        case "ordinal":
            providedFormat = formatOrDefault(providedFormat, globalState.currentOrdinalDefaultFormat());
            return formatOrdinal(instance, providedFormat, globalState, numbro);
        case "number":
        default:
            return formatNumber({
                instance: instance,
                providedFormat: providedFormat,
                numbro: numbro
            });
    }
}

/**
 * Get the decimal byte unit (MB) for the provided numbro INSTANCE.
 * We go from one unit to another using the decimal system (1000).
 *
 * @param {Numbro} instance - numbro instance to compute
 * @return {String}
 */
function _getDecimalByteUnit(instance) {
    var data = bytes.decimal;
    return getFormatByteUnits(instance._value, data.suffixes, data.scale).suffix;
}

/**
 * Get the binary byte unit (MiB) for the provided numbro INSTANCE.
 * We go from one unit to another using the decimal system (1024).
 *
 * @param {Numbro} instance - numbro instance to compute
 * @return {String}
 */
function _getBinaryByteUnit(instance) {
    var data = bytes.binary;
    return getFormatByteUnits(instance._value, data.suffixes, data.scale).suffix;
}

/**
 * Get the decimal byte unit (MB) for the provided numbro INSTANCE.
 * We go from one unit to another using the decimal system (1024).
 *
 * @param {Numbro} instance - numbro instance to compute
 * @return {String}
 */
function _getByteUnit(instance) {
    var data = bytes.general;
    return getFormatByteUnits(instance._value, data.suffixes, data.scale).suffix;
}

/**
 * Return the value and the suffix computed in byte.
 * It uses the SUFFIXES and the SCALE provided.
 *
 * @param {number} value - Number to format
 * @param {[String]} suffixes - List of suffixes
 * @param {number} scale - Number in-between two units
 * @return {{value: Number, suffix: String}}
 */
function getFormatByteUnits(value, suffixes, scale) {
    var suffix = suffixes[0];
    var abs = Math.abs(value);

    if (abs >= scale) {
        for (var power = 1; power < suffixes.length; ++power) {
            var min = Math.pow(scale, power);
            var max = Math.pow(scale, power + 1);

            if (abs >= min && abs < max) {
                suffix = suffixes[power];
                value = value / min;
                break;
            }
        }

        // values greater than or equal to [scale] YB never set the suffix
        if (suffix === suffixes[0]) {
            value = value / Math.pow(scale, suffixes.length - 1);
            suffix = suffixes[suffixes.length - 1];
        }
    }

    return { value: value, suffix: suffix };
}

/**
 * Format the provided INSTANCE as bytes using the PROVIDEDFORMAT, and STATE.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param {globalState} state - shared state of the library
 * @param numbro - the numbro singleton
 * @return {string}
 */
function formatByte(instance, providedFormat, state, numbro) {
    var base = providedFormat.base || "binary";
    var baseInfo = bytes[base];

    var _getFormatByteUnits = getFormatByteUnits(instance._value, baseInfo.suffixes, baseInfo.scale),
        value = _getFormatByteUnits.value,
        suffix = _getFormatByteUnits.suffix;

    var output = formatNumber({
        instance: numbro(value),
        providedFormat: providedFormat,
        state: state,
        defaults: state.currentByteDefaultFormat()
    });
    var abbreviations = state.currentAbbreviations();
    return "" + output + (abbreviations.spaced ? " " : "") + suffix;
}

/**
 * Format the provided INSTANCE as an ordinal using the PROVIDEDFORMAT,
 * and the STATE.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param {globalState} state - shared state of the library
 * @return {string}
 */
function formatOrdinal(instance, providedFormat, state) {
    var ordinalFn = state.currentOrdinal();
    var options = Object.assign({}, defaultOptions, providedFormat);

    var output = formatNumber({
        instance: instance,
        providedFormat: providedFormat,
        state: state
    });
    var ordinal = ordinalFn(instance._value);

    return "" + output + (options.spaceSeparated ? " " : "") + ordinal;
}

/**
 * Format the provided INSTANCE as a time HH:MM:SS.
 *
 * @param {Numbro} instance - numbro instance to format
 * @return {string}
 */
function formatTime(instance) {
    var hours = Math.floor(instance._value / 60 / 60);
    var minutes = Math.floor((instance._value - hours * 60 * 60) / 60);
    var seconds = Math.round(instance._value - hours * 60 * 60 - minutes * 60);
    return hours + ":" + (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

/**
 * Format the provided INSTANCE as a percentage using the PROVIDEDFORMAT,
 * and the STATE.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param {globalState} state - shared state of the library
 * @param numbro - the numbro singleton
 * @return {string}
 */
function formatPercentage(instance, providedFormat, state, numbro) {
    var prefixSymbol = providedFormat.prefixSymbol;

    var output = formatNumber({
        instance: numbro(instance._value * 100),
        providedFormat: providedFormat,
        state: state
    });
    var options = Object.assign({}, defaultOptions, providedFormat);

    if (prefixSymbol) {
        return "%" + (options.spaceSeparated ? " " : "") + output;
    }

    return "" + output + (options.spaceSeparated ? " " : "") + "%";
}

/**
 * Format the provided INSTANCE as a percentage using the PROVIDEDFORMAT,
 * and the STATE.
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} providedFormat - specification for formatting
 * @param {globalState} state - shared state of the library
 * @return {string}
 */
function formatCurrency(instance, providedFormat, state) {
    var currentCurrency = state.currentCurrency();
    var options = Object.assign({}, defaultOptions, providedFormat);
    var decimalSeparator = undefined;
    var space = "";
    var average = !!options.totalLength || !!options.forceAverage || options.average;

    if (options.spaceSeparated) {
        space = " ";
    }

    if (currentCurrency.position === "infix") {
        decimalSeparator = space + currentCurrency.symbol + space;
    }

    var output = formatNumber({
        instance: instance,
        providedFormat: providedFormat,
        state: state,
        decimalSeparator: decimalSeparator
    });

    if (currentCurrency.position === "prefix") {
        if (instance._value < 0 && options.negative === "sign") {
            output = "-" + space + currentCurrency.symbol + output.slice(1);
        } else {
            output = currentCurrency.symbol + space + output;
        }
    }

    if (!currentCurrency.position || currentCurrency.position === "postfix") {
        space = average ? "" : space;
        output = output + space + currentCurrency.symbol;
    }

    return output;
}

/**
 * Compute the average value out of VALUE.
 * The other parameters are computation options.
 *
 * @param {number} value - value to compute
 * @param {string} [forceAverage] - forced unit used to compute
 * @param {{}} abbreviations - part of the language specification
 * @param {boolean} spaceSeparated - `true` if a space must be inserted between the value and the abbreviation
 * @param {number} [totalLength] - total length of the output including the characteristic and the mantissa
 * @return {{value: number, abbreviation: string, mantissaPrecision: number}}
 */
function computeAverage(_ref) {
    var value = _ref.value,
        forceAverage = _ref.forceAverage,
        abbreviations = _ref.abbreviations,
        _ref$spaceSeparated = _ref.spaceSeparated,
        spaceSeparated = _ref$spaceSeparated === undefined ? false : _ref$spaceSeparated,
        _ref$totalLength = _ref.totalLength,
        totalLength = _ref$totalLength === undefined ? 0 : _ref$totalLength;

    var abbreviation = "";
    var abs = Math.abs(value);
    var mantissaPrecision = -1;

    if (abs >= Math.pow(10, 12) && !forceAverage || forceAverage === "trillion") {
        // trillion
        abbreviation = abbreviations.trillion;
        value = value / Math.pow(10, 12);
    } else if (abs < Math.pow(10, 12) && abs >= Math.pow(10, 9) && !forceAverage || forceAverage === "billion") {
        // billion
        abbreviation = abbreviations.billion;
        value = value / Math.pow(10, 9);
    } else if (abs < Math.pow(10, 9) && abs >= Math.pow(10, 6) && !forceAverage || forceAverage === "million") {
        // million
        abbreviation = abbreviations.million;
        value = value / Math.pow(10, 6);
    } else if (abs < Math.pow(10, 6) && abs >= Math.pow(10, 3) && !forceAverage || forceAverage === "thousand") {
        // thousand
        abbreviation = abbreviations.thousand;
        value = value / Math.pow(10, 3);
    }

    var optionalSpace = spaceSeparated ? " " : "";

    if (abbreviation) {
        abbreviation = optionalSpace + abbreviation;
    }

    if (totalLength) {
        var characteristic = value.toString().split(".")[0];
        mantissaPrecision = Math.max(totalLength - characteristic.length, 0);
    }

    return { value: value, abbreviation: abbreviation, mantissaPrecision: mantissaPrecision };
}

/**
 * Compute an exponential form for VALUE, taking into account CHARACTERISTIC
 * if provided.
 * @param {number} value - value to compute
 * @param {number} [characteristicPrecision] - optional characteristic length
 * @return {{value: number, abbreviation: string}}
 */
function computeExponential(_ref2) {
    var value = _ref2.value,
        _ref2$characteristicP = _ref2.characteristicPrecision,
        characteristicPrecision = _ref2$characteristicP === undefined ? 0 : _ref2$characteristicP;

    var _value$toExponential$ = value.toExponential().split("e"),
        _value$toExponential$2 = _slicedToArray(_value$toExponential$, 2),
        numberString = _value$toExponential$2[0],
        exponential = _value$toExponential$2[1];

    var number = +numberString;

    if (!characteristicPrecision) {
        return {
            value: number,
            abbreviation: "e" + exponential
        };
    }

    var characteristicLength = 1; // see `toExponential`

    if (characteristicLength < characteristicPrecision) {
        number = number * Math.pow(10, characteristicPrecision - characteristicLength);
        exponential = +exponential - (characteristicPrecision - characteristicLength);
        exponential = exponential >= 0 ? "+" + exponential : exponential;
    }

    return {
        value: number,
        abbreviation: "e" + exponential
    };
}

/**
 * Return a string of NUMBER zero.
 *
 * @param {number} number - Length of the output
 * @return {string}
 */
function zeroes(number) {
    var result = "";
    for (var i = 0; i < number; i++) {
        result += "0";
    }

    return result;
}

/**
 * Return a string representing VALUE with a PRECISION-long mantissa.
 * This method is for large/small numbers only (a.k.a. including a "e").
 *
 * @param {number} value - number to precise
 * @param {number} precision - desired length for the mantissa
 * @return {string}
 */
function toFixedLarge(value, precision) {
    var result = value.toString();

    var _result$split = result.split("e"),
        _result$split2 = _slicedToArray(_result$split, 2),
        base = _result$split2[0],
        exp = _result$split2[1];

    var _base$split = base.split("."),
        _base$split2 = _slicedToArray(_base$split, 2),
        characteristic = _base$split2[0],
        _base$split2$ = _base$split2[1],
        mantissa = _base$split2$ === undefined ? "" : _base$split2$;

    if (+exp > 0) {
        result = characteristic + mantissa + zeroes(exp - mantissa.length);
    } else {
        var prefix = ".";

        if (+characteristic < 0) {
            prefix = "-0" + prefix;
        } else {
            prefix = "0" + prefix;
        }

        var suffix = (zeroes(-exp - 1) + Math.abs(characteristic) + mantissa).substr(0, precision);
        if (suffix.length < precision) {
            suffix += zeroes(precision - suffix.length);
        }
        result = prefix + suffix;
    }

    if (+exp > 0 && precision > 0) {
        result += "." + zeroes(precision);
    }

    return result;
}

/**
 * Return a string representing VALUE with a PRECISION-long mantissa.
 *
 * @param {number} value - number to precise
 * @param {number} precision - desired length for the mantissa
 * @return {string}
 */
function toFixed(value, precision) {
    if (value.toString().indexOf("e") !== -1) {
        return toFixedLarge(value, precision);
    }

    return (Math.round(+(value + "e+" + precision)) / Math.pow(10, precision)).toFixed(precision);
}

/**
 * Return the current OUTPUT with a mantissa precions of PRECISION.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {number} value - number being currently formatted
 * @param {boolean} optionalMantissa - `true` if the mantissa is omitted when it's only zeroes
 * @param {number} precision - desired precision of the mantissa
 * @return {string}
 */
function setMantissaPrecision(output, value, optionalMantissa, precision) {
    if (precision === -1) {
        return output;
    }

    var result = toFixed(value, precision);

    var _result$toString$spli = result.toString().split("."),
        _result$toString$spli2 = _slicedToArray(_result$toString$spli, 2),
        currentCharacteristic = _result$toString$spli2[0],
        _result$toString$spli3 = _result$toString$spli2[1],
        currentMantissa = _result$toString$spli3 === undefined ? "" : _result$toString$spli3;

    if (currentMantissa.match(/^0+$/) && optionalMantissa) {
        return currentCharacteristic;
    }

    return result.toString();
}

/**
 * Return the current OUTPUT with a characteristic precions of PRECISION.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {number} value - number being currently formatted
 * @param {boolean} optionalCharacteristic - `true` if the characteristic is omitted when it's only zeroes
 * @param {number} precision - desired precision of the characteristic
 * @return {string}
 */
function setCharacteristicPrecision(output, value, optionalCharacteristic, precision) {
    var result = output;

    var _result$toString$spli4 = result.toString().split("."),
        _result$toString$spli5 = _slicedToArray(_result$toString$spli4, 2),
        currentCharacteristic = _result$toString$spli5[0],
        currentMantissa = _result$toString$spli5[1];

    if (currentCharacteristic.match(/^-?0$/) && optionalCharacteristic) {
        if (!currentMantissa) {
            return currentCharacteristic.replace("0", "");
        }

        return currentCharacteristic.replace("0", "") + "." + currentMantissa;
    }

    if (currentCharacteristic.length < precision) {
        var missingZeros = precision - currentCharacteristic.length;
        for (var i = 0; i < missingZeros; i++) {
            result = "0" + result;
        }
    }

    return result.toString();
}

/**
 * Return the indexes where are the group separations after splitting
 * `totalLength` in group of `groupSize` size.
 * Important: we start grouping from the right hand side.
 *
 * @param {number} totalLength - total length of the characteristic to split
 * @param {number} groupSize - length of each group
 * @return {[number]}
 */
function indexesOfGroupSpaces(totalLength, groupSize) {
    var result = [];
    var counter = 0;
    for (var i = totalLength; i > 0; i--) {
        if (counter === groupSize) {
            result.unshift(i);
            counter = 0;
        }
        counter++;
    }

    return result;
}

/**
 * Replace the decimal separator with DECIMALSEPARATOR and insert thousand
 * separators.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {number} value - number being currently formatted
 * @param {boolean} thousandSeparated - `true` if the characteristic must be separated
 * @param {globalState} state - shared state of the library
 * @param {string} decimalSeparator - string to use as decimal separator
 * @return {string}
 */
function replaceDelimiters(output, value, thousandSeparated, state, decimalSeparator) {
    var delimiters = state.currentDelimiters();
    var thousandSeparator = delimiters.thousands;
    decimalSeparator = decimalSeparator || delimiters.decimal;
    var thousandsSize = delimiters.thousandsSize || 3;

    var result = output.toString();
    var characteristic = result.split(".")[0];
    var mantissa = result.split(".")[1];

    if (thousandSeparated) {
        if (value < 0) {
            // Remove the minus sign
            characteristic = characteristic.slice(1);
        }

        var indexesToInsertThousandDelimiters = indexesOfGroupSpaces(characteristic.length, thousandsSize);
        indexesToInsertThousandDelimiters.forEach(function (position, index) {
            characteristic = characteristic.slice(0, position + index) + thousandSeparator + characteristic.slice(position + index);
        });

        if (value < 0) {
            // Add back the minus sign
            characteristic = "-" + characteristic;
        }
    }

    if (!mantissa) {
        result = characteristic;
    } else {
        result = characteristic + decimalSeparator + mantissa;
    }
    return result;
}

/**
 * Insert the provided ABBREVIATION at the end of OUTPUT.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {string} abbreviation - abbreviation to append
 * @return {*}
 */
function insertAbbreviation(output, abbreviation) {
    return output + abbreviation;
}

/**
 * Insert the positive/negative sign according to the NEGATIVE flag.
 * If the value is negative but still output as 0, the negative sign is removed.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {number} value - number being currently formatted
 * @param {string} negative - flag for the negative form ("sign" or "parenthesis")
 * @return {*}
 */
function insertSign(output, value, negative) {
    if (value === 0) {
        return output;
    }

    if (+output === 0) {
        return output.replace("-", "");
    }

    if (value > 0) {
        return "+" + output;
    }

    if (negative === "sign") {
        return output;
    }

    return "(" + output.replace("-", "") + ")";
}

/**
 * Insert the provided PREFIX at the start of OUTPUT.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {string} prefix - abbreviation to prepend
 * @return {*}
 */
function insertPrefix(output, prefix) {
    return prefix + output;
}

/**
 * Insert the provided POSTFIX at the end of OUTPUT.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {string} postfix - abbreviation to append
 * @return {*}
 */
function insertPostfix(output, postfix) {
    return output + postfix;
}

/**
 * Format the provided INSTANCE as a number using the PROVIDEDFORMAT,
 * and the STATE.
 * This is the key method of the framework!
 *
 * @param {Numbro} instance - numbro instance to format
 * @param {{}} [providedFormat] - specification for formatting
 * @param {globalState} state - shared state of the library
 * @param {string} decimalSeparator - string to use as decimal separator
 * @param {{}} defaults - Set of default values used for formatting
 * @return {string}
 */
function formatNumber(_ref3) {
    var instance = _ref3.instance,
        providedFormat = _ref3.providedFormat,
        _ref3$state = _ref3.state,
        state = _ref3$state === undefined ? globalState : _ref3$state,
        decimalSeparator = _ref3.decimalSeparator,
        _ref3$defaults = _ref3.defaults,
        defaults = _ref3$defaults === undefined ? state.currentDefaults() : _ref3$defaults;

    var value = instance._value;

    if (value === 0 && state.hasZeroFormat()) {
        return state.getZeroFormat();
    }

    if (!isFinite(value)) {
        return value.toString();
    }

    var options = Object.assign({}, defaultOptions, defaults, providedFormat);

    var totalLength = options.totalLength;
    var characteristicPrecision = totalLength ? 0 : options.characteristic;
    var optionalCharacteristic = options.optionalCharacteristic;
    var forceAverage = options.forceAverage;
    var average = !!totalLength || !!forceAverage || options.average;

    // default when averaging is to chop off decimals
    var mantissaPrecision = totalLength ? -1 : average && providedFormat.mantissa === undefined ? 0 : options.mantissa;
    var optionalMantissa = totalLength ? false : options.optionalMantissa;
    var thousandSeparated = options.thousandSeparated;
    var spaceSeparated = options.spaceSeparated;
    var negative = options.negative;
    var forceSign = options.forceSign;
    var exponential = options.exponential;

    var abbreviation = "";

    if (average) {
        var data = computeAverage({
            value: value,
            forceAverage: forceAverage,
            abbreviations: state.currentAbbreviations(),
            spaceSeparated: spaceSeparated,
            totalLength: totalLength
        });

        value = data.value;
        abbreviation += data.abbreviation;

        if (totalLength) {
            mantissaPrecision = data.mantissaPrecision;
        }
    }

    if (exponential) {
        var _data = computeExponential({
            value: value,
            characteristicPrecision: characteristicPrecision
        });

        value = _data.value;
        abbreviation = _data.abbreviation + abbreviation;
    }

    var output = setMantissaPrecision(value.toString(), value, optionalMantissa, mantissaPrecision);
    output = setCharacteristicPrecision(output, value, optionalCharacteristic, characteristicPrecision);
    output = replaceDelimiters(output, value, thousandSeparated, state, decimalSeparator);

    if (average || exponential) {
        output = insertAbbreviation(output, abbreviation);
    }

    if (forceSign || value < 0) {
        output = insertSign(output, value, negative);
    }

    return output;
}

/**
 * If FORMAT is non-null and not just an output, return FORMAT.
 * Return DEFAULTFORMAT otherwise.
 *
 * @param providedFormat
 * @param defaultFormat
 */
function formatOrDefault(providedFormat, defaultFormat) {
    if (!providedFormat) {
        return defaultFormat;
    }

    var keys = Object.keys(providedFormat);
    if (keys.length === 1 && keys[0] === "output") {
        return defaultFormat;
    }

    return providedFormat;
}

module.exports = function (numbro) {
    return {
        format: function format() {
            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            return _format.apply(undefined, args.concat([numbro]));
        },
        getByteUnit: function getByteUnit() {
            for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                args[_key2] = arguments[_key2];
            }

            return _getByteUnit.apply(undefined, args.concat([numbro]));
        },
        getBinaryByteUnit: function getBinaryByteUnit() {
            for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
                args[_key3] = arguments[_key3];
            }

            return _getBinaryByteUnit.apply(undefined, args.concat([numbro]));
        },
        getDecimalByteUnit: function getDecimalByteUnit() {
            for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
                args[_key4] = arguments[_key4];
            }

            return _getDecimalByteUnit.apply(undefined, args.concat([numbro]));
        },
        formatOrDefault: formatOrDefault
    };
};

},{"./globalState":4,"./parsing":8,"./validating":10}],4:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var enUS = require("./en-US");
var validating = require("./validating");
var parsing = require("./parsing");

var state = {};

var currentLanguageTag = undefined;
var languages = {};

var zeroFormat = null;

var globalDefaults = {};

function chooseLanguage(tag) {
  currentLanguageTag = tag;
}

function currentLanguageData() {
  return languages[currentLanguageTag];
}

/**
 * Return all the register languages
 *
 * @return {{}}
 */
state.languages = function () {
  return Object.assign({}, languages);
};

//
// Current language accessors
//

/**
 * Return the current language tag
 *
 * @return {string}
 */
state.currentLanguage = function () {
  return currentLanguageTag;
};

/**
 * Return the current language currency data
 *
 * @return {{}}
 */
state.currentCurrency = function () {
  return currentLanguageData().currency;
};

/**
 * Return the current language abbreviations data
 *
 * @return {{}}
 */
state.currentAbbreviations = function () {
  return currentLanguageData().abbreviations;
};

/**
 * Return the current language delimiters data
 *
 * @return {{}}
 */
state.currentDelimiters = function () {
  return currentLanguageData().delimiters;
};

/**
 * Return the current language ordinal function
 *
 * @return {function}
 */
state.currentOrdinal = function () {
  return currentLanguageData().ordinal;
};

//
// Defaults
//

/**
 * Return the current formatting defaults.
 * Use first uses the current language default, then fallback to the globally defined defaults.
 *
 * @return {{}}
 */
state.currentDefaults = function () {
  return Object.assign({}, currentLanguageData().defaults, globalDefaults);
};

/**
 * Return the ordinal default-format.
 * Use first uses the current language ordinal default, then fallback to the regular defaults.
 *
 * @return {{}}
 */
state.currentOrdinalDefaultFormat = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().ordinalFormat);
};

/**
 * Return the byte default-format.
 * Use first uses the current language byte default, then fallback to the regular defaults.
 *
 * @return {{}}
 */
state.currentByteDefaultFormat = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().byteFormat);
};

/**
 * Return the percentage default-format.
 * Use first uses the current language percentage default, then fallback to the regular defaults.
 *
 * @return {{}}
 */
state.currentPercentageDefaultFormat = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().percentageFormat);
};

/**
 * Return the currency default-format.
 * Use first uses the current language currency default, then fallback to the regular defaults.
 *
 * @return {{}}
 */
state.currentCurrencyDefaultFormat = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().currencyFormat);
};

/**
 * Return the time default-format.
 * Use first uses the current language currency default, then fallback to the regular defaults.
 *
 * @return {{}}
 */
state.currentTimeDefaultFormat = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().timeFormat);
};

/**
 * Set the global formatting defaults.
 *
 * @param {{}|string} format - formatting options to use as defaults
 */
state.setDefaults = function (format) {
  format = parsing.parseFormat(format);
  if (validating.validateFormat(format)) {
    globalDefaults = format;
  }
};

//
// Zero format
//

/**
 * Return the format string for 0.
 *
 * @return {string}
 */
state.getZeroFormat = function () {
  return zeroFormat;
};

/**
 * Set a STRING to output when the value is 0.
 *
 * @param {{}|string} string - string to set
 */
state.setZeroFormat = function (string) {
  return zeroFormat = typeof string === "string" ? string : null;
};

/**
 * Return true if a format for 0 has been set already.
 *
 * @return {boolean}
 */
state.hasZeroFormat = function () {
  return zeroFormat !== null;
};

//
// Getters/Setters
//

/**
 * Return the language data for the provided TAG.
 * Return the current language data if no tag is provided.
 *
 * Throw an error if the tag doesn't match any registered language.
 *
 * @param {string} [tag] - language tag of a registered language
 * @return {{}}
 */
state.languageData = function (tag) {
  if (tag) {
    if (languages[tag]) {
      return languages[tag];
    }
    throw new Error("Unknown tag \"" + tag + "\"");
  }

  return currentLanguageData();
};

/**
 * Register the provided DATA as a language if and only if the data is valid.
 * If the data is not valid, an error is thrown.
 *
 * When USELANGUAGE is true, the registered language is then used.
 *
 * @param {{}} data - language data to register
 * @param {boolean} [useLanguage] - `true` if the provided data should become the current language
 */
state.registerLanguage = function (data) {
  var useLanguage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  if (!validating.validateLanguage(data)) {
    throw new Error("Invalid language data");
  }

  languages[data.languageTag] = data;

  if (useLanguage) {
    chooseLanguage(data.languageTag);
  }
};

/**
 * Set the current language according to TAG.
 * If TAG doesn't match a registered language, another language matching
 * the "language" part of the tag (according to BCP47: https://tools.ietf.org/rfc/bcp/bcp47.txt).
 * If none, the FALLBACKTAG is used. If the FALLBACKTAG doesn't match a register language,
 * `en-US` is finally used.
 *
 * @param tag
 * @param fallbackTag
 */
state.setLanguage = function (tag) {
  var fallbackTag = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : enUS.languageTag;

  if (!languages[tag]) {
    var suffix = tag.split("-")[0];

    var matchingLanguageTag = Object.keys(languages).find(function (each) {
      return each.split("-")[0] === suffix;
    });

    if (!languages[matchingLanguageTag]) {
      chooseLanguage(fallbackTag);
      return;
    }

    chooseLanguage(matchingLanguageTag);
  }

  chooseLanguage(tag);
};

state.registerLanguage(enUS);
currentLanguageTag = enUS.languageTag;

module.exports = state;

},{"./en-US":2,"./parsing":8,"./validating":10}],5:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Load languages matching TAGS. Silently pass over the failing load.
 *
 * We assume here that we are in a node environment, so we don't check for it.
 * @param {[String]} tags - list of tags to load
 * @param {Numbro} numbro - the numbro singleton
 */
function _loadLanguagesInNode(tags, numbro) {
    tags.forEach(function (tag) {
        var data = undefined;
        try {
            data = require("../languages/" + tag);
        } catch (e) {
            console.error("Unable to load \"" + tag + "\". No matching language file found."); // eslint-disable-line no-console
        }

        if (data) {
            numbro.registerLanguage(data);
        }
    });
}

module.exports = function (numbro) {
    return {
        loadLanguagesInNode: function loadLanguagesInNode(tags) {
            return _loadLanguagesInNode(tags, numbro);
        }
    };
};

},{}],6:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var BigNumber = require("bignumber.js");

/**
 * Add a number or a numbro to N.
 *
 * @param {Numbro} n - augend
 * @param {number|Numbro} other - addend
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function _add(n, other, numbro) {
    var value = new BigNumber(n._value);
    var otherValue = other;

    if (numbro.isNumbro(other)) {
        otherValue = other._value;
    }

    otherValue = new BigNumber(otherValue);

    n._value = value.add(otherValue).toNumber();
    return n;
}

/**
 * Subtract a number or a numbro from N.
 *
 * @param {Numbro} n - minuend
 * @param {number|Numbro} other - subtrahend
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function _subtract(n, other, numbro) {
    var value = new BigNumber(n._value);
    var otherValue = other;

    if (numbro.isNumbro(other)) {
        otherValue = other._value;
    }

    otherValue = new BigNumber(otherValue);

    n._value = value.minus(otherValue).toNumber();
    return n;
}

/**
 * Multiply N by a number or a numbro.
 *
 * @param {Numbro} n - multiplicand
 * @param {number|Numbro} other - multiplier
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function _multiply(n, other, numbro) {
    var value = new BigNumber(n._value);
    var otherValue = other;

    if (numbro.isNumbro(other)) {
        otherValue = other._value;
    }

    otherValue = new BigNumber(otherValue);

    n._value = value.times(otherValue).toNumber();
    return n;
}

/**
 * Divide N by a number or a numbro.
 *
 * @param {Numbro} n - dividend
 * @param {number|Numbro} other - divisor
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function _divide(n, other, numbro) {
    var value = new BigNumber(n._value);
    var otherValue = other;

    if (numbro.isNumbro(other)) {
        otherValue = other._value;
    }

    otherValue = new BigNumber(otherValue);

    n._value = value.dividedBy(otherValue).toNumber();
    return n;
}

/**
 * Set N to the OTHER (or the value of OTHER when it's a numbro instance).
 *
 * @param {Numbro} n - numbro instance to mutate
 * @param {number|Numbro} other - new value to assign to N
 * @param {numbro} numbro - numbro singleton
 * @return {Numbro} n
 */
function _set(n, other, numbro) {
    var value = other;

    if (numbro.isNumbro(other)) {
        value = other._value;
    }

    n._value = value;
    return n;
}

/**
 * Return the distance between N and OTHER.
 *
 * @param {Numbro} n
 * @param {number|Numbro} other
 * @param {numbro} numbro - numbro singleton
 * @return {number}
 */
function _difference(n, other, numbro) {
    var clone = numbro(n._value);
    _subtract(clone, other, numbro);

    return Math.abs(clone._value);
}

module.exports = function (numbro) {
    return {
        add: function add(n, other) {
            return _add(n, other, numbro);
        },
        subtract: function subtract(n, other) {
            return _subtract(n, other, numbro);
        },
        multiply: function multiply(n, other) {
            return _multiply(n, other, numbro);
        },
        divide: function divide(n, other) {
            return _divide(n, other, numbro);
        },
        set: function set(n, other) {
            return _set(n, other, numbro);
        },
        difference: function difference(n, other) {
            return _difference(n, other, numbro);
        }
    };
};

},{"bignumber.js":1}],7:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var VERSION = "2.0.3";

var globalState = require("./globalState");
var validator = require("./validating");
var loader = require("./loading")(numbro);
var unformatter = require("./unformatting");
var formatter = require("./formatting")(numbro);
var manipulate = require("./manipulating")(numbro);
var parsing = require("./parsing");

var Numbro = function () {
    function Numbro(number) {
        _classCallCheck(this, Numbro);

        this._value = number;
    }

    _createClass(Numbro, [{
        key: "clone",
        value: function clone() {
            return numbro(this._value);
        }
    }, {
        key: "format",
        value: function format() {
            var _format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            return formatter.format(this, _format);
        }
    }, {
        key: "formatCurrency",
        value: function formatCurrency(format) {
            if (typeof format === "string") {
                format = parsing.parseFormat(format);
                debugger;
            }
            format = formatter.formatOrDefault(format, globalState.currentCurrencyDefaultFormat());
            format.output = "currency";
            return formatter.format(this, format);
        }
    }, {
        key: "formatTime",
        value: function formatTime() {
            var format = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            format.output = "time";
            return formatter.format(this, format);
        }
    }, {
        key: "binaryByteUnits",
        value: function binaryByteUnits() {
            return formatter.getBinaryByteUnit(this);
        }
    }, {
        key: "decimalByteUnits",
        value: function decimalByteUnits() {
            return formatter.getDecimalByteUnit(this);
        }
    }, {
        key: "byteUnits",
        value: function byteUnits() {
            return formatter.getByteUnit(this);
        }
    }, {
        key: "difference",
        value: function difference(other) {
            return manipulate.difference(this, other);
        }
    }, {
        key: "add",
        value: function add(other) {
            return manipulate.add(this, other);
        }
    }, {
        key: "subtract",
        value: function subtract(other) {
            return manipulate.subtract(this, other);
        }
    }, {
        key: "multiply",
        value: function multiply(other) {
            return manipulate.multiply(this, other);
        }
    }, {
        key: "divide",
        value: function divide(other) {
            return manipulate.divide(this, other);
        }
    }, {
        key: "set",
        value: function set(input) {
            return manipulate.set(this, normalizeInput(input));
        }
    }, {
        key: "value",
        value: function value() {
            return this._value;
        }
    }, {
        key: "valueOf",
        value: function valueOf() {
            return this._value;
        }
    }]);

    return Numbro;
}();

/**
 * Make its best to convert input into a number.
 *
 * @param {numbro|string|number} input - Input to convert
 * @return {number}
 */


function normalizeInput(input) {
    var result = input;
    if (numbro.isNumbro(input)) {
        result = input._value;
    } else if (typeof input === "string") {
        result = numbro.unformat(input);
    } else if (isNaN(input)) {
        result = NaN;
    }

    return result;
}

function numbro(input) {
    return new Numbro(normalizeInput(input));
}

numbro.version = VERSION;

numbro.isNumbro = function (object) {
    return object instanceof Numbro;
};

//
// `numbro` static methods
//

numbro.language = globalState.currentLanguage;
numbro.registerLanguage = globalState.registerLanguage;
numbro.setLanguage = globalState.setLanguage;
numbro.languages = globalState.languages;
numbro.languageData = globalState.languageData;
numbro.zeroFormat = globalState.setZeroFormat;
numbro.defaultFormat = globalState.currentDefaults;
numbro.setDefaults = globalState.setDefaults;
numbro.defaultCurrencyFormat = globalState.currentCurrencyDefaultFormat;
numbro.validate = validator.validate;
numbro.loadLanguagesInNode = loader.loadLanguagesInNode;
numbro.unformat = unformatter.unformat;

module.exports = numbro;

},{"./formatting":3,"./globalState":4,"./loading":5,"./manipulating":6,"./parsing":8,"./unformatting":9,"./validating":10}],8:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Parse the format STRING looking for a prefix. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parsePrefix(string, result) {
    var match = string.match(/^{([^}]*)}/);
    if (match) {
        result.prefix = match[1];
        return string.slice(match[0].length);
    }

    return string;
}

/**
 * Parse the format STRING looking for a postfix. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parsePostfix(string, result) {
    var match = string.match(/{([^}]*)}$/);
    if (match) {
        result.postfix = match[1];

        return string.slice(0, -match[0].length);
    }

    return string;
}

/**
 * Parse the format STRING looking for the output value. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 */
function parseOutput(string, result) {
    if (string.indexOf("$") !== -1) {
        result.output = "currency";
        return;
    }

    if (string.indexOf("%") !== -1) {
        result.output = "percent";
        return;
    }

    if (string.indexOf("bd") !== -1) {
        result.output = "byte";
        result.base = "general";
        return;
    }

    if (string.indexOf("b") !== -1) {
        result.output = "byte";
        result.base = "binary";
        return;
    }

    if (string.indexOf("d") !== -1) {
        result.output = "byte";
        result.base = "decimal";
        return;
    }

    if (string.indexOf(":") !== -1) {
        result.output = "time";
        return;
    }

    if (string.indexOf("o") !== -1) {
        result.output = "ordinal";
    }
}

/**
 * Parse the format STRING looking for the thousand separated value. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseThousandSeparated(string, result) {
    if (string.indexOf(",") !== -1) {
        result.thousandSeparated = true;
    }
}

/**
 * Parse the format STRING looking for the space separated value. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseSpaceSeparated(string, result) {
    if (string.indexOf(" ") !== -1) {
        result.spaceSeparated = true;
    }
}

/**
 * Parse the format STRING looking for the total length. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseTotalLength(string, result) {
    var match = string.match(/[1-9]+[0-9]*/);

    if (match) {
        result.totalLength = +match[0];
    }
}

/**
 * Parse the format STRING looking for the characteristic length. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseCharacteristic(string, result) {
    var characteristic = string.split(".")[0];
    var match = characteristic.match(/0+/);
    if (match) {
        result.characteristic = match[0].length;
    }
}

/**
 * Parse the format STRING looking for the mantissa length. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseMantissa(string, result) {
    var mantissa = string.split(".")[1];
    if (mantissa) {
        var match = mantissa.match(/0+/);
        if (match) {
            result.mantissa = match[0].length;
        }
    }
}

/**
 * Parse the format STRING looking for the average value. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseAverage(string, result) {
    if (string.indexOf("a") !== -1) {
        result.average = true;
    }
}

/**
 * Parse the format STRING looking for a forced average precision. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseForceAverage(string, result) {
    if (string.indexOf("K") !== -1) {
        result.forceAverage = "thousand";
    } else if (string.indexOf("M") !== -1) {
        result.forceAverage = "million";
    } else if (string.indexOf("B") !== -1) {
        result.forceAverage = "billion";
    } else if (string.indexOf("T") !== -1) {
        result.forceAverage = "trillion";
    }
}

/**
 * Parse the format STRING finding if the mantissa is optional. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseOptionalMantissa(string, result) {
    if (string.match(/\[\.]/)) {
        result.optionalMantissa = true;
    } else if (string.match(/\./)) {
        result.optionalMantissa = false;
    }
}

/**
 * Parse the format STRING finding if the characteristic is optional. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseOptionalCharacteristic(string, result) {
    if (string.indexOf(".") !== -1) {
        var characteristic = string.split(".")[0];
        result.optionalCharacteristic = characteristic.indexOf("0") === -1;
    }
}

/**
 * Parse the format STRING looking for the negative format. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {string} - format
 */
function parseNegative(string, result) {
    if (string.match(/^\+?\([^)]*\)$/)) {
        result.negative = "parenthesis";
    }
    if (string.match(/^\+?-/)) {
        result.negative = "sign";
    }
}

/**
 * Parse the format STRING finding if the sign is mandatory. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 */
function parseForceSign(string, result) {
    if (string.match(/^\+/)) {
        result.forceSign = true;
    }
}

/**
 * Parse the format STRING and accumulating the values ie RESULT.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 * @return {NumbroFormat} - format
 */
function parseFormat(string) {
    var result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (typeof string !== "string") {
        return string;
    }

    string = parsePrefix(string, result);
    string = parsePostfix(string, result);
    parseOutput(string, result);
    parseTotalLength(string, result);
    parseCharacteristic(string, result);
    parseOptionalCharacteristic(string, result);
    parseAverage(string, result);
    parseForceAverage(string, result);
    parseMantissa(string, result);
    parseOptionalMantissa(string, result);
    parseThousandSeparated(string, result);
    parseSpaceSeparated(string, result);
    parseNegative(string, result);
    parseForceSign(string, result);

    return result;
}

module.exports = {
    parseFormat: parseFormat
};

},{}],9:[function(require,module,exports){
"use strict";

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var allSuffixes = [{ key: "ZiB", factor: Math.pow(1024, 7) }, { key: "ZB", factor: Math.pow(1000, 7) }, { key: "YiB", factor: Math.pow(1024, 8) }, { key: "YB", factor: Math.pow(1000, 8) }, { key: "TiB", factor: Math.pow(1024, 4) }, { key: "TB", factor: Math.pow(1000, 4) }, { key: "PiB", factor: Math.pow(1024, 5) }, { key: "PB", factor: Math.pow(1000, 5) }, { key: "MiB", factor: Math.pow(1024, 2) }, { key: "MB", factor: Math.pow(1000, 2) }, { key: "KiB", factor: Math.pow(1024, 1) }, { key: "KB", factor: Math.pow(1000, 1) }, { key: "GiB", factor: Math.pow(1024, 3) }, { key: "GB", factor: Math.pow(1000, 3) }, { key: "EiB", factor: Math.pow(1024, 6) }, { key: "EB", factor: Math.pow(1000, 6) }, { key: "B", factor: 1 }];

/**
 * Generate a RegExp where S get all RegExp specific characters escaped.
 *
 * @param {string} s - string representing a RegExp
 * @return {string}
 */
function escapeRegExp(s) {
    return s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * Recursively compute the unformatted value.
 *
 * @param {string} inputString - string to unformat
 * @param {*} delimiters - Delimiters used to generate the inputString
 * @param {string} [currencySymbol] - symbol used for currency while generating the inputString
 * @param {function} ordinal - function used to generate an ordinal out of a number
 * @param {string} zeroFormat - string representing zero
 * @param {*} abbreviations - abbreviations used while generating the inputString
 * @param {NumbroFormat} format - format used while generating the inputString
 * @return {number|undefined}
 */
function computeUnformattedValue(inputString, delimiters) {
    var currencySymbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    var ordinal = arguments[3];
    var zeroFormat = arguments[4];
    var abbreviations = arguments[5];
    var format = arguments[6];

    if (!isNaN(+inputString)) {
        return +inputString;
    }

    var stripped = "";
    // Negative

    var newInput = inputString.replace(/(^[^(]*)\((.*)\)([^)]*$)/, "$1$2$3");

    if (newInput !== inputString) {
        return -1 * computeUnformattedValue(newInput, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
    }

    // Byte

    for (var i = 0; i < allSuffixes.length; i++) {
        var suffix = allSuffixes[i];
        stripped = inputString.replace(suffix.key, "");

        if (stripped !== inputString) {
            return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format) * suffix.factor;
        }
    }

    // Percent

    stripped = inputString.replace("%", "");

    if (stripped !== inputString) {
        return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format) / 100;
    }

    // Ordinal

    var possibleOrdinalValue = parseFloat(inputString);

    if (isNaN(possibleOrdinalValue)) {
        return undefined;
    }

    var ordinalString = ordinal(possibleOrdinalValue);
    if (ordinalString && ordinalString !== ".") {
        // if ordinal is "." it will be caught next round in the +inputString
        stripped = inputString.replace(new RegExp(escapeRegExp(ordinalString) + "$"), "");

        if (stripped !== inputString) {
            return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
        }
    }

    // Average

    var inversedAbbreviations = {};
    Object.keys(abbreviations).forEach(function (key) {
        inversedAbbreviations[abbreviations[key]] = key;
    });

    var abbreviationValues = Object.keys(inversedAbbreviations).sort().reverse();
    var numberOfAbbreviations = abbreviationValues.length;

    for (var _i = 0; _i < numberOfAbbreviations; _i++) {
        var value = abbreviationValues[_i];
        var key = inversedAbbreviations[value];

        stripped = inputString.replace(value, "");
        if (stripped !== inputString) {
            var factor = undefined;
            switch (key) {// eslint-disable-line default-case
                case "thousand":
                    factor = Math.pow(10, 3);
                    break;
                case "million":
                    factor = Math.pow(10, 6);
                    break;
                case "billion":
                    factor = Math.pow(10, 9);
                    break;
                case "trillion":
                    factor = Math.pow(10, 12);
                    break;
            }
            return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format) * factor;
        }
    }

    return undefined;
}

/**
 * Removes in one pass all formatting symbols.
 *
 * @param {string} inputString - string to unformat
 * @param {*} delimiters - Delimiters used to generate the inputString
 * @param {string} [currencySymbol] - symbol used for currency while generating the inputString
 * @return {string}
 */
function removeFormattingSymbols(inputString, delimiters) {
    var currencySymbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";

    // Currency

    var stripped = inputString.replace(currencySymbol, "");

    // Thousand separators

    stripped = stripped.replace(new RegExp("([0-9])" + escapeRegExp(delimiters.thousands) + "([0-9])", "g"), "$1$2");

    // Decimal

    stripped = stripped.replace(delimiters.decimal, ".");

    return stripped;
}

/**
 * Unformat a numbro-generated string to retrieve the original value.
 *
 * @param {string} inputString - string to unformat
 * @param {*} delimiters - Delimiters used to generate the inputString
 * @param {string} [currencySymbol] - symbol used for currency while generating the inputString
 * @param {function} ordinal - function used to generate an ordinal out of a number
 * @param {string} zeroFormat - string representing zero
 * @param {*} abbreviations - abbreviations used while generating the inputString
 * @param {NumbroFormat} format - format used while generating the inputString
 * @return {number|undefined}
 */
function unformatValue(inputString, delimiters) {
    var currencySymbol = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    var ordinal = arguments[3];
    var zeroFormat = arguments[4];
    var abbreviations = arguments[5];
    var format = arguments[6];

    if (inputString === "") {
        return undefined;
    }

    if (!isNaN(+inputString)) {
        return +inputString;
    }

    // Zero Format

    if (inputString === zeroFormat) {
        return 0;
    }

    var value = removeFormattingSymbols(inputString, delimiters, currencySymbol);
    return computeUnformattedValue(value, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
}

/**
 * Check if the INPUTSTRING represents a time.
 *
 * @param {string} inputString - string to check
 * @param {*} delimiters - Delimiters used while generating the inputString
 * @return {boolean}
 */
function matchesTime(inputString, delimiters) {
    var separators = inputString.indexOf(":") && delimiters.thousands !== ":";

    if (!separators) {
        return false;
    }

    var segments = inputString.split(":");
    if (segments.length !== 3) {
        return false;
    }

    var hours = +segments[0];
    var minutes = +segments[1];
    var seconds = +segments[2];

    return !isNaN(hours) && !isNaN(minutes) && !isNaN(seconds);
}

/**
 * Unformat a numbro-generated string representing a time to retrieve the original value.
 *
 * @param {string} inputString - string to unformat
 * @return {number}
 */
function unformatTime(inputString) {
    var segments = inputString.split(":");

    var hours = +segments[0];
    var minutes = +segments[1];
    var seconds = +segments[2];

    return seconds + 60 * minutes + 3600 * hours;
}

/**
 * Unformat a numbro-generated string to retrieve the original value.
 *
 * @param {string} inputString - string to unformat
 * @param {NumbroFormat} format - format used  while generating the inputString
 * @return {number}
 */
function unformat(inputString, format) {
    // Avoid circular references
    var globalState = require("./globalState");

    var delimiters = globalState.currentDelimiters();
    var currencySymbol = globalState.currentCurrency().symbol;
    var ordinal = globalState.currentOrdinal();
    var zeroFormat = globalState.getZeroFormat();
    var abbreviations = globalState.currentAbbreviations();

    var value = undefined;

    if (typeof inputString === "string") {
        if (matchesTime(inputString, delimiters)) {
            value = unformatTime(inputString);
        } else {
            value = unformatValue(inputString, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
        }
    } else if (typeof inputString === "number") {
        value = inputString;
    } else {
        return undefined;
    }

    if (value === undefined) {
        return undefined;
    }

    return value;
}

module.exports = {
    unformat: unformat
};

},{"./globalState":4}],10:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var unformatter = require("./unformatting");

// Simplified regexp supporting only `language`, `script`, and `region`
var bcp47RegExp = /^[a-z]{2,3}(-[a-zA-Z]{4})?(-([A-Z]{2}|[0-9]{3}))?$/;

var validOutputValues = ["currency", "percent", "byte", "time", "ordinal", "number"];

var validForceAverageValues = ["trillion", "billion", "million", "thousand"];

var validNegativeValues = ["sign", "parenthesis"];

var validMandatoryAbbreviations = {
    type: "object",
    children: {
        thousand: {
            type: "string",
            mandatory: true
        },
        million: {
            type: "string",
            mandatory: true
        },
        billion: {
            type: "string",
            mandatory: true
        },
        trillion: {
            type: "string",
            mandatory: true
        }
    },
    mandatory: true
};

var validAbbreviations = {
    type: "object",
    children: {
        thousand: "string",
        million: "string",
        billion: "string",
        trillion: "string"
    }
};

var validBaseValues = ["decimal", "binary", "general"];

var validFormat = {
    output: {
        type: "string",
        validValues: validOutputValues
    },
    base: {
        type: "string",
        validValues: validBaseValues,
        restriction: function restriction(number, format) {
            return format.output === "byte";
        },
        message: "`base` must be provided only when the output is `byte`",
        mandatory: function mandatory(format) {
            return format.output === "byte";
        }
    },
    characteristic: {
        type: "number",
        restriction: function restriction(number) {
            return number >= 0;
        },
        message: "value must be positive"
    },
    prefix: "string",
    postfix: "string",
    forceAverage: {
        type: "string",
        validValues: validForceAverageValues
    },
    average: "boolean",
    totalLength: {
        type: "number",
        restrictions: [{
            restriction: function restriction(number) {
                return number >= 0;
            },
            message: "value must be positive"
        }, {
            restriction: function restriction(number, format) {
                return !format.exponential;
            },
            message: "`totalLength` is incompatible with `exponential`"
        }]
    },
    mantissa: {
        type: "number",
        restriction: function restriction(number) {
            return number >= 0;
        },
        message: "value must be positive"
    },
    optionalMantissa: "boolean",
    optionalCharacteristic: "boolean",
    thousandSeparated: "boolean",
    spaceSeparated: "boolean",
    abbreviations: validAbbreviations,
    negative: {
        type: "string",
        validValues: validNegativeValues
    },
    forceSign: "boolean",
    exponential: {
        type: "boolean"
    },
    prefixSymbol: {
        type: "boolean",
        restriction: function restriction(number, format) {
            return format.output === "percent";
        },
        message: "`prefixSymbol` can be provided only when the output is `percent`"
    }
};

var validLanguage = {
    languageTag: {
        type: "string",
        mandatory: true,
        restriction: function restriction(tag) {
            return tag.match(bcp47RegExp);
        },
        message: "the language tag must follow the BCP 47 specification (see https://tools.ieft.org/html/bcp47)"
    },
    delimiters: {
        type: "object",
        children: {
            thousands: "string",
            decimal: "string"
        },
        mandatory: true
    },
    abbreviations: validMandatoryAbbreviations,
    spaceSeparated: "boolean",
    ordinal: {
        type: "function",
        mandatory: true
    },
    currency: {
        type: "object",
        children: {
            symbol: "string",
            position: "string",
            code: "string"
        },
        mandatory: true
    },
    defaults: "format",
    ordinalFormat: "format",
    byteFormat: "format",
    percentageFormat: "format",
    currencyFormat: "format",
    timeDefaults: "format",
    formats: {
        type: "object",
        children: {
            fourDigits: {
                type: "format",
                mandatory: true
            },
            fullWithTwoDecimals: {
                type: "format",
                mandatory: true
            },
            fullWithTwoDecimalsNoCurrency: {
                type: "format",
                mandatory: true
            },
            fullWithNoDecimals: {
                type: "format",
                mandatory: true
            }
        }
    }
};

/**
 * Check the validity of the provided input and format.
 * The check is NOT lazy.
 *
 * @param {string|number|Numbro} input - input to check
 * @param {NumbroFormat} format - format to check
 * @return {boolean} True when everything is correct
 */
function validate(input, format) {
    var validInput = validateInput(input);
    var isFormatValid = validateFormat(format);

    return validInput && isFormatValid;
}

/**
 * Check the validity of the numbro input.
 *
 * @param {string|number|Numbro} input - input to check
 * @return {boolean} True when everything is correct
 */
function validateInput(input) {
    var value = unformatter.unformat(input);

    return !!value;
}

/**
 * Check the validity of the provided format TOVALIDATE against SPEC.
 *
 * @param {NumbroFormat} toValidate - format to check
 * @param {*} spec - specification against which to check
 * @param {string} prefix - prefix use for error messages
 * @param {boolean} skipMandatoryCheck - `true` when the check for mandatory key must be skipped
 * @return {boolean} True when everything is correct
 */
function validateSpec(toValidate, spec, prefix) {
    var skipMandatoryCheck = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

    var results = Object.keys(toValidate).map(function (key) {
        if (!spec[key]) {
            console.error(prefix + " Invalid key: " + key); // eslint-disable-line no-console
            return false;
        }

        var value = toValidate[key];
        var data = spec[key];

        if (typeof data === "string") {
            data = { type: data };
        }

        if (data.type === "format") {
            // all formats are partial (a.k.a will be merged with some default values) thus no need to check mandatory values
            var valid = validateSpec(value, validFormat, "[Validate " + key + "]", true);

            if (!valid) {
                return false;
            }
        } else if ((typeof value === "undefined" ? "undefined" : _typeof(value)) !== data.type) {
            console.error(prefix + " " + key + " type mismatched: \"" + data.type + "\" expected, \"" + (typeof value === "undefined" ? "undefined" : _typeof(value)) + "\" provided"); // eslint-disable-line no-console
            return false;
        }

        if (data.restrictions && data.restrictions.length) {
            var length = data.restrictions.length;
            for (var i = 0; i < length; i++) {
                var _data$restrictions$i = data.restrictions[i],
                    restriction = _data$restrictions$i.restriction,
                    message = _data$restrictions$i.message;

                if (!restriction(value, toValidate)) {
                    console.error(prefix + " " + key + " invalid value: " + message); // eslint-disable-line no-console
                    return false;
                }
            }
        }

        if (data.restriction && !data.restriction(value, toValidate)) {
            console.error(prefix + " " + key + " invalid value: " + data.message); // eslint-disable-line no-console
            return false;
        }

        if (data.validValues && data.validValues.indexOf(value) === -1) {
            console.error(prefix + " " + key + " invalid value: must be among " + JSON.stringify(data.validValues) + ", \"" + value + "\" provided"); // eslint-disable-line no-console
            return false;
        }

        if (data.children) {
            var _valid = validateSpec(value, data.children, "[Validate " + key + "]");

            if (!_valid) {
                return false;
            }
        }

        return true;
    });

    if (!skipMandatoryCheck) {
        results.push.apply(results, _toConsumableArray(Object.keys(spec).map(function (key) {
            var data = spec[key];
            if (typeof data === "string") {
                data = { type: data };
            }

            if (data.mandatory) {
                var mandatory = data.mandatory;
                if (typeof mandatory === "function") {
                    mandatory = mandatory(toValidate);
                }

                if (mandatory && toValidate[key] === undefined) {
                    console.error(prefix + " Missing mandatory key \"" + key + "\""); // eslint-disable-line no-console
                    return false;
                }
            }

            return true;
        })));
    }

    return results.reduce(function (acc, current) {
        return acc && current;
    }, true);
}

/**
 * Check the provided FORMAT.
 *
 * @param {NumbroFormat} format - format to check
 * @return {boolean}
 */
function validateFormat(format) {
    return validateSpec(format, validFormat, "[Validate format]");
}

/**
 * Check the provided LANGUAGE.
 *
 * @param {NumbroLanguage} language - language to check
 * @return {boolean}
 */
function validateLanguage(language) {
    return validateSpec(language, validLanguage, "[Validate language]");
}

module.exports = {
    validate: validate,
    validateFormat: validateFormat,
    validateInput: validateInput,
    validateLanguage: validateLanguage
};

},{"./unformatting":9}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnbnVtYmVyLmpzL2JpZ251bWJlci5qcyIsInNyYy9lbi1VUy5qcyIsInNyYy9mb3JtYXR0aW5nLmpzIiwic3JjL2dsb2JhbFN0YXRlLmpzIiwic3JjL2xvYWRpbmcuanMiLCJzcmMvbWFuaXB1bGF0aW5nLmpzIiwic3JjL251bWJyby5qcyIsInNyYy9wYXJzaW5nLmpzIiwic3JjL3VuZm9ybWF0dGluZy5qcyIsInNyYy92YWxpZGF0aW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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aEMsV0FBTyxhQUFhLFFBQWIsRUFBdUIsYUFBdkIsRUFBc0MscUJBQXRDLENBQVA7QUFDSDs7QUFFRCxPQUFPLE9BQVAsR0FBaUI7QUFDYixzQkFEYTtBQUViLGtDQUZhO0FBR2IsZ0NBSGE7QUFJYjtBQUphLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qISBiaWdudW1iZXIuanMgdjQuMC40IGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZ251bWJlci5qcy9MSUNFTkNFICovXHJcblxyXG47KGZ1bmN0aW9uIChnbG9iYWxPYmopIHtcclxuICAgICd1c2Ugc3RyaWN0JztcclxuXHJcbiAgICAvKlxyXG4gICAgICBiaWdudW1iZXIuanMgdjQuMC40XHJcbiAgICAgIEEgSmF2YVNjcmlwdCBsaWJyYXJ5IGZvciBhcmJpdHJhcnktcHJlY2lzaW9uIGFyaXRobWV0aWMuXHJcbiAgICAgIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWtlTWNsL2JpZ251bWJlci5qc1xyXG4gICAgICBDb3B5cmlnaHQgKGMpIDIwMTcgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICAgICAgTUlUIEV4cGF0IExpY2VuY2VcclxuICAgICovXHJcblxyXG5cclxuICAgIHZhciBCaWdOdW1iZXIsXHJcbiAgICAgICAgaXNOdW1lcmljID0gL14tPyhcXGQrKFxcLlxcZCopP3xcXC5cXGQrKShlWystXT9cXGQrKT8kL2ksXHJcbiAgICAgICAgbWF0aGNlaWwgPSBNYXRoLmNlaWwsXHJcbiAgICAgICAgbWF0aGZsb29yID0gTWF0aC5mbG9vcixcclxuICAgICAgICBub3RCb29sID0gJyBub3QgYSBib29sZWFuIG9yIGJpbmFyeSBkaWdpdCcsXHJcbiAgICAgICAgcm91bmRpbmdNb2RlID0gJ3JvdW5kaW5nIG1vZGUnLFxyXG4gICAgICAgIHRvb01hbnlEaWdpdHMgPSAnbnVtYmVyIHR5cGUgaGFzIG1vcmUgdGhhbiAxNSBzaWduaWZpY2FudCBkaWdpdHMnLFxyXG4gICAgICAgIEFMUEhBQkVUID0gJzAxMjM0NTY3ODlhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaJF8nLFxyXG4gICAgICAgIEJBU0UgPSAxZTE0LFxyXG4gICAgICAgIExPR19CQVNFID0gMTQsXHJcbiAgICAgICAgTUFYX1NBRkVfSU5URUdFUiA9IDB4MWZmZmZmZmZmZmZmZmYsICAgICAgICAgLy8gMl41MyAtIDFcclxuICAgICAgICAvLyBNQVhfSU5UMzIgPSAweDdmZmZmZmZmLCAgICAgICAgICAgICAgICAgICAvLyAyXjMxIC0gMVxyXG4gICAgICAgIFBPV1NfVEVOID0gWzEsIDEwLCAxMDAsIDFlMywgMWU0LCAxZTUsIDFlNiwgMWU3LCAxZTgsIDFlOSwgMWUxMCwgMWUxMSwgMWUxMiwgMWUxM10sXHJcbiAgICAgICAgU1FSVF9CQVNFID0gMWU3LFxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFRoZSBsaW1pdCBvbiB0aGUgdmFsdWUgb2YgREVDSU1BTF9QTEFDRVMsIFRPX0VYUF9ORUcsIFRPX0VYUF9QT1MsIE1JTl9FWFAsIE1BWF9FWFAsIGFuZFxyXG4gICAgICAgICAqIHRoZSBhcmd1bWVudHMgdG8gdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9Gb3JtYXQsIGFuZCB0b1ByZWNpc2lvbiwgYmV5b25kIHdoaWNoIGFuXHJcbiAgICAgICAgICogZXhjZXB0aW9uIGlzIHRocm93biAoaWYgRVJST1JTIGlzIHRydWUpLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIE1BWCA9IDFFOTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0lOVDMyXHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBDcmVhdGUgYW5kIHJldHVybiBhIEJpZ051bWJlciBjb25zdHJ1Y3Rvci5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gY29uc3RydWN0b3JGYWN0b3J5KGNvbmZpZykge1xyXG4gICAgICAgIHZhciBkaXYsIHBhcnNlTnVtZXJpYyxcclxuXHJcbiAgICAgICAgICAgIC8vIGlkIHRyYWNrcyB0aGUgY2FsbGVyIGZ1bmN0aW9uLCBzbyBpdHMgbmFtZSBjYW4gYmUgaW5jbHVkZWQgaW4gZXJyb3IgbWVzc2FnZXMuXHJcbiAgICAgICAgICAgIGlkID0gMCxcclxuICAgICAgICAgICAgUCA9IEJpZ051bWJlci5wcm90b3R5cGUsXHJcbiAgICAgICAgICAgIE9ORSA9IG5ldyBCaWdOdW1iZXIoMSksXHJcblxyXG5cclxuICAgICAgICAgICAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiBFRElUQUJMRSBERUZBVUxUUyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgaW5jbHVzaXZlIHJhbmdlcyBzdGF0ZWQuXHJcbiAgICAgICAgICAgICAqIFRoZSB2YWx1ZXMgY2FuIGFsc28gYmUgY2hhbmdlZCBhdCBydW4tdGltZSB1c2luZyBCaWdOdW1iZXIuY29uZmlnLlxyXG4gICAgICAgICAgICAgKi9cclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBmb3Igb3BlcmF0aW9ucyBpbnZvbHZpbmcgZGl2aXNpb24uXHJcbiAgICAgICAgICAgIERFQ0lNQUxfUExBQ0VTID0gMjAsICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhcclxuXHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAqIFRoZSByb3VuZGluZyBtb2RlIHVzZWQgd2hlbiByb3VuZGluZyB0byB0aGUgYWJvdmUgZGVjaW1hbCBwbGFjZXMsIGFuZCB3aGVuIHVzaW5nXHJcbiAgICAgICAgICAgICAqIHRvRXhwb25lbnRpYWwsIHRvRml4ZWQsIHRvRm9ybWF0IGFuZCB0b1ByZWNpc2lvbiwgYW5kIHJvdW5kIChkZWZhdWx0IHZhbHVlKS5cclxuICAgICAgICAgICAgICogVVAgICAgICAgICAwIEF3YXkgZnJvbSB6ZXJvLlxyXG4gICAgICAgICAgICAgKiBET1dOICAgICAgIDEgVG93YXJkcyB6ZXJvLlxyXG4gICAgICAgICAgICAgKiBDRUlMICAgICAgIDIgVG93YXJkcyArSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAqIEZMT09SICAgICAgMyBUb3dhcmRzIC1JbmZpbml0eS5cclxuICAgICAgICAgICAgICogSEFMRl9VUCAgICA0IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB1cC5cclxuICAgICAgICAgICAgICogSEFMRl9ET1dOICA1IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCBkb3duLlxyXG4gICAgICAgICAgICAgKiBIQUxGX0VWRU4gIDYgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHRvd2FyZHMgZXZlbiBuZWlnaGJvdXIuXHJcbiAgICAgICAgICAgICAqIEhBTEZfQ0VJTCAgNyBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyArSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAqIEhBTEZfRkxPT1IgOCBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyAtSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgICAgICBST1VORElOR19NT0RFID0gNCwgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gOFxyXG5cclxuICAgICAgICAgICAgLy8gRVhQT05FTlRJQUxfQVQgOiBbVE9fRVhQX05FRyAsIFRPX0VYUF9QT1NdXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGJlbmVhdGggd2hpY2ggdG9TdHJpbmcgcmV0dXJucyBleHBvbmVudGlhbCBub3RhdGlvbi5cclxuICAgICAgICAgICAgLy8gTnVtYmVyIHR5cGU6IC03XHJcbiAgICAgICAgICAgIFRPX0VYUF9ORUcgPSAtNywgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byAtTUFYXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgZXhwb25lbnQgdmFsdWUgYXQgYW5kIGFib3ZlIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICAgIC8vIE51bWJlciB0eXBlOiAyMVxyXG4gICAgICAgICAgICBUT19FWFBfUE9TID0gMjEsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYXHJcblxyXG4gICAgICAgICAgICAvLyBSQU5HRSA6IFtNSU5fRVhQLCBNQVhfRVhQXVxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIG1pbmltdW0gZXhwb25lbnQgdmFsdWUsIGJlbmVhdGggd2hpY2ggdW5kZXJmbG93IHRvIHplcm8gb2NjdXJzLlxyXG4gICAgICAgICAgICAvLyBOdW1iZXIgdHlwZTogLTMyNCAgKDVlLTMyNClcclxuICAgICAgICAgICAgTUlOX0VYUCA9IC0xZTcsICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAtMSB0byAtTUFYXHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgbWF4aW11bSBleHBvbmVudCB2YWx1ZSwgYWJvdmUgd2hpY2ggb3ZlcmZsb3cgdG8gSW5maW5pdHkgb2NjdXJzLlxyXG4gICAgICAgICAgICAvLyBOdW1iZXIgdHlwZTogIDMwOCAgKDEuNzk3NjkzMTM0ODYyMzE1N2UrMzA4KVxyXG4gICAgICAgICAgICAvLyBGb3IgTUFYX0VYUCA+IDFlNywgZS5nLiBuZXcgQmlnTnVtYmVyKCcxZTEwMDAwMDAwMCcpLnBsdXMoMSkgbWF5IGJlIHNsb3cuXHJcbiAgICAgICAgICAgIE1BWF9FWFAgPSAxZTcsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMSB0byBNQVhcclxuXHJcbiAgICAgICAgICAgIC8vIFdoZXRoZXIgQmlnTnVtYmVyIEVycm9ycyBhcmUgZXZlciB0aHJvd24uXHJcbiAgICAgICAgICAgIEVSUk9SUyA9IHRydWUsICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJ1ZSBvciBmYWxzZVxyXG5cclxuICAgICAgICAgICAgLy8gQ2hhbmdlIHRvIGludFZhbGlkYXRvck5vRXJyb3JzIGlmIEVSUk9SUyBpcyBmYWxzZS5cclxuICAgICAgICAgICAgaXNWYWxpZEludCA9IGludFZhbGlkYXRvcldpdGhFcnJvcnMsICAgICAvLyBpbnRWYWxpZGF0b3JXaXRoRXJyb3JzL2ludFZhbGlkYXRvck5vRXJyb3JzXHJcblxyXG4gICAgICAgICAgICAvLyBXaGV0aGVyIHRvIHVzZSBjcnlwdG9ncmFwaGljYWxseS1zZWN1cmUgcmFuZG9tIG51bWJlciBnZW5lcmF0aW9uLCBpZiBhdmFpbGFibGUuXHJcbiAgICAgICAgICAgIENSWVBUTyA9IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJ1ZSBvciBmYWxzZVxyXG5cclxuICAgICAgICAgICAgLypcclxuICAgICAgICAgICAgICogVGhlIG1vZHVsbyBtb2RlIHVzZWQgd2hlbiBjYWxjdWxhdGluZyB0aGUgbW9kdWx1czogYSBtb2Qgbi5cclxuICAgICAgICAgICAgICogVGhlIHF1b3RpZW50IChxID0gYSAvIG4pIGlzIGNhbGN1bGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBjb3JyZXNwb25kaW5nIHJvdW5kaW5nIG1vZGUuXHJcbiAgICAgICAgICAgICAqIFRoZSByZW1haW5kZXIgKHIpIGlzIGNhbGN1bGF0ZWQgYXM6IHIgPSBhIC0gbiAqIHEuXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIFVQICAgICAgICAwIFRoZSByZW1haW5kZXIgaXMgcG9zaXRpdmUgaWYgdGhlIGRpdmlkZW5kIGlzIG5lZ2F0aXZlLCBlbHNlIGlzIG5lZ2F0aXZlLlxyXG4gICAgICAgICAgICAgKiBET1dOICAgICAgMSBUaGUgcmVtYWluZGVyIGhhcyB0aGUgc2FtZSBzaWduIGFzIHRoZSBkaXZpZGVuZC5cclxuICAgICAgICAgICAgICogICAgICAgICAgICAgVGhpcyBtb2R1bG8gbW9kZSBpcyBjb21tb25seSBrbm93biBhcyAndHJ1bmNhdGVkIGRpdmlzaW9uJyBhbmQgaXNcclxuICAgICAgICAgICAgICogICAgICAgICAgICAgZXF1aXZhbGVudCB0byAoYSAlIG4pIGluIEphdmFTY3JpcHQuXHJcbiAgICAgICAgICAgICAqIEZMT09SICAgICAzIFRoZSByZW1haW5kZXIgaGFzIHRoZSBzYW1lIHNpZ24gYXMgdGhlIGRpdmlzb3IgKFB5dGhvbiAlKS5cclxuICAgICAgICAgICAgICogSEFMRl9FVkVOIDYgVGhpcyBtb2R1bG8gbW9kZSBpbXBsZW1lbnRzIHRoZSBJRUVFIDc1NCByZW1haW5kZXIgZnVuY3Rpb24uXHJcbiAgICAgICAgICAgICAqIEVVQ0xJRCAgICA5IEV1Y2xpZGlhbiBkaXZpc2lvbi4gcSA9IHNpZ24obikgKiBmbG9vcihhIC8gYWJzKG4pKS5cclxuICAgICAgICAgICAgICogICAgICAgICAgICAgVGhlIHJlbWFpbmRlciBpcyBhbHdheXMgcG9zaXRpdmUuXHJcbiAgICAgICAgICAgICAqXHJcbiAgICAgICAgICAgICAqIFRoZSB0cnVuY2F0ZWQgZGl2aXNpb24sIGZsb29yZWQgZGl2aXNpb24sIEV1Y2xpZGlhbiBkaXZpc2lvbiBhbmQgSUVFRSA3NTQgcmVtYWluZGVyXHJcbiAgICAgICAgICAgICAqIG1vZGVzIGFyZSBjb21tb25seSB1c2VkIGZvciB0aGUgbW9kdWx1cyBvcGVyYXRpb24uXHJcbiAgICAgICAgICAgICAqIEFsdGhvdWdoIHRoZSBvdGhlciByb3VuZGluZyBtb2RlcyBjYW4gYWxzbyBiZSB1c2VkLCB0aGV5IG1heSBub3QgZ2l2ZSB1c2VmdWwgcmVzdWx0cy5cclxuICAgICAgICAgICAgICovXHJcbiAgICAgICAgICAgIE1PRFVMT19NT0RFID0gMSwgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCB0byA5XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgbWF4aW11bSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZGlnaXRzIG9mIHRoZSByZXN1bHQgb2YgdGhlIHRvUG93ZXIgb3BlcmF0aW9uLlxyXG4gICAgICAgICAgICAvLyBJZiBQT1dfUFJFQ0lTSU9OIGlzIDAsIHRoZXJlIHdpbGwgYmUgdW5saW1pdGVkIHNpZ25pZmljYW50IGRpZ2l0cy5cclxuICAgICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IDAsICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWFxyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGZvcm1hdCBzcGVjaWZpY2F0aW9uIHVzZWQgYnkgdGhlIEJpZ051bWJlci5wcm90b3R5cGUudG9Gb3JtYXQgbWV0aG9kLlxyXG4gICAgICAgICAgICBGT1JNQVQgPSB7XHJcbiAgICAgICAgICAgICAgICBkZWNpbWFsU2VwYXJhdG9yOiAnLicsXHJcbiAgICAgICAgICAgICAgICBncm91cFNlcGFyYXRvcjogJywnLFxyXG4gICAgICAgICAgICAgICAgZ3JvdXBTaXplOiAzLFxyXG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5R3JvdXBTaXplOiAwLFxyXG4gICAgICAgICAgICAgICAgZnJhY3Rpb25Hcm91cFNlcGFyYXRvcjogJ1xceEEwJywgICAgICAvLyBub24tYnJlYWtpbmcgc3BhY2VcclxuICAgICAgICAgICAgICAgIGZyYWN0aW9uR3JvdXBTaXplOiAwXHJcbiAgICAgICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xyXG5cclxuXHJcbiAgICAgICAgLy8gQ09OU1RSVUNUT1JcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogVGhlIEJpZ051bWJlciBjb25zdHJ1Y3RvciBhbmQgZXhwb3J0ZWQgZnVuY3Rpb24uXHJcbiAgICAgICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWdOdW1iZXIgb2JqZWN0LlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogbiB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9IEEgbnVtZXJpYyB2YWx1ZS5cclxuICAgICAgICAgKiBbYl0ge251bWJlcn0gVGhlIGJhc2Ugb2Ygbi4gSW50ZWdlciwgMiB0byA2NCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gQmlnTnVtYmVyKCBuLCBiICkge1xyXG4gICAgICAgICAgICB2YXIgYywgZSwgaSwgbnVtLCBsZW4sIHN0cixcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5hYmxlIGNvbnN0cnVjdG9yIHVzYWdlIHdpdGhvdXQgbmV3LlxyXG4gICAgICAgICAgICBpZiAoICEoIHggaW5zdGFuY2VvZiBCaWdOdW1iZXIgKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyAnQmlnTnVtYmVyKCkgY29uc3RydWN0b3IgY2FsbCB3aXRob3V0IG5ldzoge259J1xyXG4gICAgICAgICAgICAgICAgaWYgKEVSUk9SUykgcmFpc2UoIDI2LCAnY29uc3RydWN0b3IgY2FsbCB3aXRob3V0IG5ldycsIG4gKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKCBuLCBiICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vICduZXcgQmlnTnVtYmVyKCkgYmFzZSBub3QgYW4gaW50ZWdlcjoge2J9J1xyXG4gICAgICAgICAgICAvLyAnbmV3IEJpZ051bWJlcigpIGJhc2Ugb3V0IG9mIHJhbmdlOiB7Yn0nXHJcbiAgICAgICAgICAgIGlmICggYiA9PSBudWxsIHx8ICFpc1ZhbGlkSW50KCBiLCAyLCA2NCwgaWQsICdiYXNlJyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIER1cGxpY2F0ZS5cclxuICAgICAgICAgICAgICAgIGlmICggbiBpbnN0YW5jZW9mIEJpZ051bWJlciApIHtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSBuLnM7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5lID0gbi5lO1xyXG4gICAgICAgICAgICAgICAgICAgIHguYyA9ICggbiA9IG4uYyApID8gbi5zbGljZSgpIDogbjtcclxuICAgICAgICAgICAgICAgICAgICBpZCA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmICggKCBudW0gPSB0eXBlb2YgbiA9PSAnbnVtYmVyJyApICYmIG4gKiAwID09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5zID0gMSAvIG4gPCAwID8gKCBuID0gLW4sIC0xICkgOiAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBGYXN0IHBhdGggZm9yIGludGVnZXJzLlxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggbiA9PT0gfn5uICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBlID0gMCwgaSA9IG47IGkgPj0gMTA7IGkgLz0gMTAsIGUrKyApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4LmUgPSBlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4LmMgPSBbbl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gbiArICcnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoICFpc051bWVyaWMudGVzdCggc3RyID0gbiArICcnICkgKSByZXR1cm4gcGFyc2VOdW1lcmljKCB4LCBzdHIsIG51bSApO1xyXG4gICAgICAgICAgICAgICAgICAgIHgucyA9IHN0ci5jaGFyQ29kZUF0KDApID09PSA0NSA/ICggc3RyID0gc3RyLnNsaWNlKDEpLCAtMSApIDogMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGIgPSBiIHwgMDtcclxuICAgICAgICAgICAgICAgIHN0ciA9IG4gKyAnJztcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBFbnN1cmUgcmV0dXJuIHZhbHVlIGlzIHJvdW5kZWQgdG8gREVDSU1BTF9QTEFDRVMgYXMgd2l0aCBvdGhlciBiYXNlcy5cclxuICAgICAgICAgICAgICAgIC8vIEFsbG93IGV4cG9uZW50aWFsIG5vdGF0aW9uIHRvIGJlIHVzZWQgd2l0aCBiYXNlIDEwIGFyZ3VtZW50LlxyXG4gICAgICAgICAgICAgICAgaWYgKCBiID09IDEwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHggPSBuZXcgQmlnTnVtYmVyKCBuIGluc3RhbmNlb2YgQmlnTnVtYmVyID8gbiA6IHN0ciApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiByb3VuZCggeCwgREVDSU1BTF9QTEFDRVMgKyB4LmUgKyAxLCBST1VORElOR19NT0RFICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQXZvaWQgcG90ZW50aWFsIGludGVycHJldGF0aW9uIG9mIEluZmluaXR5IGFuZCBOYU4gYXMgYmFzZSA0NCsgdmFsdWVzLlxyXG4gICAgICAgICAgICAgICAgLy8gQW55IG51bWJlciBpbiBleHBvbmVudGlhbCBmb3JtIHdpbGwgZmFpbCBkdWUgdG8gdGhlIFtFZV1bKy1dLlxyXG4gICAgICAgICAgICAgICAgaWYgKCAoIG51bSA9IHR5cGVvZiBuID09ICdudW1iZXInICkgJiYgbiAqIDAgIT0gMCB8fFxyXG4gICAgICAgICAgICAgICAgICAhKCBuZXcgUmVnRXhwKCAnXi0/JyArICggYyA9ICdbJyArIEFMUEhBQkVULnNsaWNlKCAwLCBiICkgKyAnXSsnICkgK1xyXG4gICAgICAgICAgICAgICAgICAgICcoPzpcXFxcLicgKyBjICsgJyk/JCcsYiA8IDM3ID8gJ2knIDogJycgKSApLnRlc3Qoc3RyKSApIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VOdW1lcmljKCB4LCBzdHIsIG51bSwgYiApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChudW0pIHtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSAxIC8gbiA8IDAgPyAoIHN0ciA9IHN0ci5zbGljZSgxKSwgLTEgKSA6IDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggRVJST1JTICYmIHN0ci5yZXBsYWNlKCAvXjBcXC4wKnxcXC4vLCAnJyApLmxlbmd0aCA+IDE1ICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gJ25ldyBCaWdOdW1iZXIoKSBudW1iZXIgdHlwZSBoYXMgbW9yZSB0aGFuIDE1IHNpZ25pZmljYW50IGRpZ2l0czoge259J1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByYWlzZSggaWQsIHRvb01hbnlEaWdpdHMsIG4gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFByZXZlbnQgbGF0ZXIgY2hlY2sgZm9yIGxlbmd0aCBvbiBjb252ZXJ0ZWQgbnVtYmVyLlxyXG4gICAgICAgICAgICAgICAgICAgIG51bSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSBzdHIuY2hhckNvZGVBdCgwKSA9PT0gNDUgPyAoIHN0ciA9IHN0ci5zbGljZSgxKSwgLTEgKSA6IDE7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgc3RyID0gY29udmVydEJhc2UoIHN0ciwgMTAsIGIsIHgucyApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEZWNpbWFsIHBvaW50P1xyXG4gICAgICAgICAgICBpZiAoICggZSA9IHN0ci5pbmRleE9mKCcuJykgKSA+IC0xICkgc3RyID0gc3RyLnJlcGxhY2UoICcuJywgJycgKTtcclxuXHJcbiAgICAgICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgICAgIGlmICggKCBpID0gc3RyLnNlYXJjaCggL2UvaSApICkgPiAwICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIERldGVybWluZSBleHBvbmVudC5cclxuICAgICAgICAgICAgICAgIGlmICggZSA8IDAgKSBlID0gaTtcclxuICAgICAgICAgICAgICAgIGUgKz0gK3N0ci5zbGljZSggaSArIDEgKTtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoIDAsIGkgKTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICggZSA8IDAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gSW50ZWdlci5cclxuICAgICAgICAgICAgICAgIGUgPSBzdHIubGVuZ3RoO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICggaSA9IDA7IHN0ci5jaGFyQ29kZUF0KGkpID09PSA0ODsgaSsrICk7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgdHJhaWxpbmcgemVyb3MuXHJcbiAgICAgICAgICAgIGZvciAoIGxlbiA9IHN0ci5sZW5ndGg7IHN0ci5jaGFyQ29kZUF0KC0tbGVuKSA9PT0gNDg7ICk7XHJcbiAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZSggaSwgbGVuICsgMSApO1xyXG5cclxuICAgICAgICAgICAgaWYgKHN0cikge1xyXG4gICAgICAgICAgICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBEaXNhbGxvdyBudW1iZXJzIHdpdGggb3ZlciAxNSBzaWduaWZpY2FudCBkaWdpdHMgaWYgbnVtYmVyIHR5cGUuXHJcbiAgICAgICAgICAgICAgICAvLyAnbmV3IEJpZ051bWJlcigpIG51bWJlciB0eXBlIGhhcyBtb3JlIHRoYW4gMTUgc2lnbmlmaWNhbnQgZGlnaXRzOiB7bn0nXHJcbiAgICAgICAgICAgICAgICBpZiAoIG51bSAmJiBFUlJPUlMgJiYgbGVuID4gMTUgJiYgKCBuID4gTUFYX1NBRkVfSU5URUdFUiB8fCBuICE9PSBtYXRoZmxvb3IobikgKSApIHtcclxuICAgICAgICAgICAgICAgICAgICByYWlzZSggaWQsIHRvb01hbnlEaWdpdHMsIHgucyAqIG4gKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBlID0gZSAtIGkgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAvLyBPdmVyZmxvdz9cclxuICAgICAgICAgICAgICAgIGlmICggZSA+IE1BWF9FWFAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEluZmluaXR5LlxyXG4gICAgICAgICAgICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVW5kZXJmbG93P1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggZSA8IE1JTl9FWFAgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHguZSA9IGU7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5jID0gW107XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyYW5zZm9ybSBiYXNlXHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGUgaXMgdGhlIGJhc2UgMTAgZXhwb25lbnQuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gaSBpcyB3aGVyZSB0byBzbGljZSBzdHIgdG8gZ2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIHRoZSBjb2VmZmljaWVudCBhcnJheS5cclxuICAgICAgICAgICAgICAgICAgICBpID0gKCBlICsgMSApICUgTE9HX0JBU0U7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBlIDwgMCApIGkgKz0gTE9HX0JBU0U7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggaSA8IGxlbiApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGkpIHguYy5wdXNoKCArc3RyLnNsaWNlKCAwLCBpICkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGxlbiAtPSBMT0dfQkFTRTsgaSA8IGxlbjsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4LmMucHVzaCggK3N0ci5zbGljZSggaSwgaSArPSBMT0dfQkFTRSApICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZShpKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IExPR19CQVNFIC0gc3RyLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpIC09IGxlbjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIDsgaS0tOyBzdHIgKz0gJzAnICk7XHJcbiAgICAgICAgICAgICAgICAgICAgeC5jLnB1c2goICtzdHIgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgeC5jID0gWyB4LmUgPSAwIF07XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlkID0gMDtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBDT05TVFJVQ1RPUiBQUk9QRVJUSUVTXHJcblxyXG5cclxuICAgICAgICBCaWdOdW1iZXIuYW5vdGhlciA9IGNvbnN0cnVjdG9yRmFjdG9yeTtcclxuXHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX1VQID0gMDtcclxuICAgICAgICBCaWdOdW1iZXIuUk9VTkRfRE9XTiA9IDE7XHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX0NFSUwgPSAyO1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9GTE9PUiA9IDM7XHJcbiAgICAgICAgQmlnTnVtYmVyLlJPVU5EX0hBTEZfVVAgPSA0O1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0RPV04gPSA1O1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0VWRU4gPSA2O1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0NFSUwgPSA3O1xyXG4gICAgICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0ZMT09SID0gODtcclxuICAgICAgICBCaWdOdW1iZXIuRVVDTElEID0gOTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogQ29uZmlndXJlIGluZnJlcXVlbnRseS1jaGFuZ2luZyBsaWJyYXJ5LXdpZGUgc2V0dGluZ3MuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBBY2NlcHQgYW4gb2JqZWN0IG9yIGFuIGFyZ3VtZW50IGxpc3QsIHdpdGggb25lIG9yIG1hbnkgb2YgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzIG9yXHJcbiAgICAgICAgICogcGFyYW1ldGVycyByZXNwZWN0aXZlbHk6XHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAgIERFQ0lNQUxfUExBQ0VTICB7bnVtYmVyfSAgSW50ZWdlciwgMCB0byBNQVggaW5jbHVzaXZlXHJcbiAgICAgICAgICogICBST1VORElOR19NT0RFICAge251bWJlcn0gIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmVcclxuICAgICAgICAgKiAgIEVYUE9ORU5USUFMX0FUICB7bnVtYmVyfG51bWJlcltdfSAgSW50ZWdlciwgLU1BWCB0byBNQVggaW5jbHVzaXZlIG9yXHJcbiAgICAgICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtpbnRlZ2VyIC1NQVggdG8gMCBpbmNsLiwgMCB0byBNQVggaW5jbC5dXHJcbiAgICAgICAgICogICBSQU5HRSAgICAgICAgICAge251bWJlcnxudW1iZXJbXX0gIE5vbi16ZXJvIGludGVnZXIsIC1NQVggdG8gTUFYIGluY2x1c2l2ZSBvclxyXG4gICAgICAgICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbaW50ZWdlciAtTUFYIHRvIC0xIGluY2wuLCBpbnRlZ2VyIDEgdG8gTUFYIGluY2wuXVxyXG4gICAgICAgICAqICAgRVJST1JTICAgICAgICAgIHtib29sZWFufG51bWJlcn0gICB0cnVlLCBmYWxzZSwgMSBvciAwXHJcbiAgICAgICAgICogICBDUllQVE8gICAgICAgICAge2Jvb2xlYW58bnVtYmVyfSAgIHRydWUsIGZhbHNlLCAxIG9yIDBcclxuICAgICAgICAgKiAgIE1PRFVMT19NT0RFICAgICB7bnVtYmVyfSAgICAgICAgICAgMCB0byA5IGluY2x1c2l2ZVxyXG4gICAgICAgICAqICAgUE9XX1BSRUNJU0lPTiAgIHtudW1iZXJ9ICAgICAgICAgICAwIHRvIE1BWCBpbmNsdXNpdmVcclxuICAgICAgICAgKiAgIEZPUk1BVCAgICAgICAgICB7b2JqZWN0fSAgICAgICAgICAgU2VlIEJpZ051bWJlci5wcm90b3R5cGUudG9Gb3JtYXRcclxuICAgICAgICAgKiAgICAgIGRlY2ltYWxTZXBhcmF0b3IgICAgICAge3N0cmluZ31cclxuICAgICAgICAgKiAgICAgIGdyb3VwU2VwYXJhdG9yICAgICAgICAge3N0cmluZ31cclxuICAgICAgICAgKiAgICAgIGdyb3VwU2l6ZSAgICAgICAgICAgICAge251bWJlcn1cclxuICAgICAgICAgKiAgICAgIHNlY29uZGFyeUdyb3VwU2l6ZSAgICAge251bWJlcn1cclxuICAgICAgICAgKiAgICAgIGZyYWN0aW9uR3JvdXBTZXBhcmF0b3Ige3N0cmluZ31cclxuICAgICAgICAgKiAgICAgIGZyYWN0aW9uR3JvdXBTaXplICAgICAge251bWJlcn1cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIChUaGUgdmFsdWVzIGFzc2lnbmVkIHRvIHRoZSBhYm92ZSBGT1JNQVQgb2JqZWN0IHByb3BlcnRpZXMgYXJlIG5vdCBjaGVja2VkIGZvciB2YWxpZGl0eS4pXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBFLmcuXHJcbiAgICAgICAgICogQmlnTnVtYmVyLmNvbmZpZygyMCwgNCkgaXMgZXF1aXZhbGVudCB0b1xyXG4gICAgICAgICAqIEJpZ051bWJlci5jb25maWcoeyBERUNJTUFMX1BMQUNFUyA6IDIwLCBST1VORElOR19NT0RFIDogNCB9KVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogSWdub3JlIHByb3BlcnRpZXMvcGFyYW1ldGVycyBzZXQgdG8gbnVsbCBvciB1bmRlZmluZWQuXHJcbiAgICAgICAgICogUmV0dXJuIGFuIG9iamVjdCB3aXRoIHRoZSBwcm9wZXJ0aWVzIGN1cnJlbnQgdmFsdWVzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJpZ051bWJlci5jb25maWcgPSBCaWdOdW1iZXIuc2V0ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICB2YXIgdiwgcCxcclxuICAgICAgICAgICAgICAgIGkgPSAwLFxyXG4gICAgICAgICAgICAgICAgciA9IHt9LFxyXG4gICAgICAgICAgICAgICAgYSA9IGFyZ3VtZW50cyxcclxuICAgICAgICAgICAgICAgIG8gPSBhWzBdLFxyXG4gICAgICAgICAgICAgICAgaGFzID0gbyAmJiB0eXBlb2YgbyA9PSAnb2JqZWN0J1xyXG4gICAgICAgICAgICAgICAgICA/IGZ1bmN0aW9uICgpIHsgaWYgKCBvLmhhc093blByb3BlcnR5KHApICkgcmV0dXJuICggdiA9IG9bcF0gKSAhPSBudWxsOyB9XHJcbiAgICAgICAgICAgICAgICAgIDogZnVuY3Rpb24gKCkgeyBpZiAoIGEubGVuZ3RoID4gaSApIHJldHVybiAoIHYgPSBhW2krK10gKSAhPSBudWxsOyB9O1xyXG5cclxuICAgICAgICAgICAgLy8gREVDSU1BTF9QTEFDRVMge251bWJlcn0gSW50ZWdlciwgMCB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgREVDSU1BTF9QTEFDRVMgbm90IGFuIGludGVnZXI6IHt2fSdcclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIERFQ0lNQUxfUExBQ0VTIG91dCBvZiByYW5nZToge3Z9J1xyXG4gICAgICAgICAgICBpZiAoIGhhcyggcCA9ICdERUNJTUFMX1BMQUNFUycgKSAmJiBpc1ZhbGlkSW50KCB2LCAwLCBNQVgsIDIsIHAgKSApIHtcclxuICAgICAgICAgICAgICAgIERFQ0lNQUxfUExBQ0VTID0gdiB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltwXSA9IERFQ0lNQUxfUExBQ0VTO1xyXG5cclxuICAgICAgICAgICAgLy8gUk9VTkRJTkdfTU9ERSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgUk9VTkRJTkdfTU9ERSBub3QgYW4gaW50ZWdlcjoge3Z9J1xyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgUk9VTkRJTkdfTU9ERSBvdXQgb2YgcmFuZ2U6IHt2fSdcclxuICAgICAgICAgICAgaWYgKCBoYXMoIHAgPSAnUk9VTkRJTkdfTU9ERScgKSAmJiBpc1ZhbGlkSW50KCB2LCAwLCA4LCAyLCBwICkgKSB7XHJcbiAgICAgICAgICAgICAgICBST1VORElOR19NT0RFID0gdiB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltwXSA9IFJPVU5ESU5HX01PREU7XHJcblxyXG4gICAgICAgICAgICAvLyBFWFBPTkVOVElBTF9BVCB7bnVtYmVyfG51bWJlcltdfVxyXG4gICAgICAgICAgICAvLyBJbnRlZ2VyLCAtTUFYIHRvIE1BWCBpbmNsdXNpdmUgb3IgW2ludGVnZXIgLU1BWCB0byAwIGluY2x1c2l2ZSwgMCB0byBNQVggaW5jbHVzaXZlXS5cclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIEVYUE9ORU5USUFMX0FUIG5vdCBhbiBpbnRlZ2VyOiB7dn0nXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBFWFBPTkVOVElBTF9BVCBvdXQgb2YgcmFuZ2U6IHt2fSdcclxuICAgICAgICAgICAgaWYgKCBoYXMoIHAgPSAnRVhQT05FTlRJQUxfQVQnICkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBpc0FycmF5KHYpICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggaXNWYWxpZEludCggdlswXSwgLU1BWCwgMCwgMiwgcCApICYmIGlzVmFsaWRJbnQoIHZbMV0sIDAsIE1BWCwgMiwgcCApICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBUT19FWFBfTkVHID0gdlswXSB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIFRPX0VYUF9QT1MgPSB2WzFdIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCBpc1ZhbGlkSW50KCB2LCAtTUFYLCBNQVgsIDIsIHAgKSApIHtcclxuICAgICAgICAgICAgICAgICAgICBUT19FWFBfTkVHID0gLSggVE9fRVhQX1BPUyA9ICggdiA8IDAgPyAtdiA6IHYgKSB8IDAgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW3BdID0gWyBUT19FWFBfTkVHLCBUT19FWFBfUE9TIF07XHJcblxyXG4gICAgICAgICAgICAvLyBSQU5HRSB7bnVtYmVyfG51bWJlcltdfSBOb24temVybyBpbnRlZ2VyLCAtTUFYIHRvIE1BWCBpbmNsdXNpdmUgb3JcclxuICAgICAgICAgICAgLy8gW2ludGVnZXIgLU1BWCB0byAtMSBpbmNsdXNpdmUsIGludGVnZXIgMSB0byBNQVggaW5jbHVzaXZlXS5cclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIFJBTkdFIG5vdCBhbiBpbnRlZ2VyOiB7dn0nXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBSQU5HRSBjYW5ub3QgYmUgemVybzoge3Z9J1xyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgUkFOR0Ugb3V0IG9mIHJhbmdlOiB7dn0nXHJcbiAgICAgICAgICAgIGlmICggaGFzKCBwID0gJ1JBTkdFJyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggaXNBcnJheSh2KSApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGlzVmFsaWRJbnQoIHZbMF0sIC1NQVgsIC0xLCAyLCBwICkgJiYgaXNWYWxpZEludCggdlsxXSwgMSwgTUFYLCAyLCBwICkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIE1JTl9FWFAgPSB2WzBdIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgTUFYX0VYUCA9IHZbMV0gfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIGlzVmFsaWRJbnQoIHYsIC1NQVgsIE1BWCwgMiwgcCApICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggdiB8IDAgKSBNSU5fRVhQID0gLSggTUFYX0VYUCA9ICggdiA8IDAgPyAtdiA6IHYgKSB8IDAgKTtcclxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmIChFUlJPUlMpIHJhaXNlKCAyLCBwICsgJyBjYW5ub3QgYmUgemVybycsIHYgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW3BdID0gWyBNSU5fRVhQLCBNQVhfRVhQIF07XHJcblxyXG4gICAgICAgICAgICAvLyBFUlJPUlMge2Jvb2xlYW58bnVtYmVyfSB0cnVlLCBmYWxzZSwgMSBvciAwLlxyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgRVJST1JTIG5vdCBhIGJvb2xlYW4gb3IgYmluYXJ5IGRpZ2l0OiB7dn0nXHJcbiAgICAgICAgICAgIGlmICggaGFzKCBwID0gJ0VSUk9SUycgKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHYgPT09ICEhdiB8fCB2ID09PSAxIHx8IHYgPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWQgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGlzVmFsaWRJbnQgPSAoIEVSUk9SUyA9ICEhdiApID8gaW50VmFsaWRhdG9yV2l0aEVycm9ycyA6IGludFZhbGlkYXRvck5vRXJyb3JzO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChFUlJPUlMpIHtcclxuICAgICAgICAgICAgICAgICAgICByYWlzZSggMiwgcCArIG5vdEJvb2wsIHYgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW3BdID0gRVJST1JTO1xyXG5cclxuICAgICAgICAgICAgLy8gQ1JZUFRPIHtib29sZWFufG51bWJlcn0gdHJ1ZSwgZmFsc2UsIDEgb3IgMC5cclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIENSWVBUTyBub3QgYSBib29sZWFuIG9yIGJpbmFyeSBkaWdpdDoge3Z9J1xyXG4gICAgICAgICAgICAvLyAnY29uZmlnKCkgY3J5cHRvIHVuYXZhaWxhYmxlOiB7Y3J5cHRvfSdcclxuICAgICAgICAgICAgaWYgKCBoYXMoIHAgPSAnQ1JZUFRPJyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggdiA9PT0gdHJ1ZSB8fCB2ID09PSBmYWxzZSB8fCB2ID09PSAxIHx8IHYgPT09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHYpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdiA9IHR5cGVvZiBjcnlwdG8gPT0gJ3VuZGVmaW5lZCc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggIXYgJiYgY3J5cHRvICYmIChjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzIHx8IGNyeXB0by5yYW5kb21CeXRlcykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENSWVBUTyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoRVJST1JTKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYWlzZSggMiwgJ2NyeXB0byB1bmF2YWlsYWJsZScsIHYgPyB2b2lkIDAgOiBjcnlwdG8gKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENSWVBUTyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgQ1JZUFRPID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChFUlJPUlMpIHtcclxuICAgICAgICAgICAgICAgICAgICByYWlzZSggMiwgcCArIG5vdEJvb2wsIHYgKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW3BdID0gQ1JZUFRPO1xyXG5cclxuICAgICAgICAgICAgLy8gTU9EVUxPX01PREUge251bWJlcn0gSW50ZWdlciwgMCB0byA5IGluY2x1c2l2ZS5cclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIE1PRFVMT19NT0RFIG5vdCBhbiBpbnRlZ2VyOiB7dn0nXHJcbiAgICAgICAgICAgIC8vICdjb25maWcoKSBNT0RVTE9fTU9ERSBvdXQgb2YgcmFuZ2U6IHt2fSdcclxuICAgICAgICAgICAgaWYgKCBoYXMoIHAgPSAnTU9EVUxPX01PREUnICkgJiYgaXNWYWxpZEludCggdiwgMCwgOSwgMiwgcCApICkge1xyXG4gICAgICAgICAgICAgICAgTU9EVUxPX01PREUgPSB2IHwgMDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByW3BdID0gTU9EVUxPX01PREU7XHJcblxyXG4gICAgICAgICAgICAvLyBQT1dfUFJFQ0lTSU9OIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIFBPV19QUkVDSVNJT04gbm90IGFuIGludGVnZXI6IHt2fSdcclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIFBPV19QUkVDSVNJT04gb3V0IG9mIHJhbmdlOiB7dn0nXHJcbiAgICAgICAgICAgIGlmICggaGFzKCBwID0gJ1BPV19QUkVDSVNJT04nICkgJiYgaXNWYWxpZEludCggdiwgMCwgTUFYLCAyLCBwICkgKSB7XHJcbiAgICAgICAgICAgICAgICBQT1dfUFJFQ0lTSU9OID0gdiB8IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcltwXSA9IFBPV19QUkVDSVNJT047XHJcblxyXG4gICAgICAgICAgICAvLyBGT1JNQVQge29iamVjdH1cclxuICAgICAgICAgICAgLy8gJ2NvbmZpZygpIEZPUk1BVCBub3QgYW4gb2JqZWN0OiB7dn0nXHJcbiAgICAgICAgICAgIGlmICggaGFzKCBwID0gJ0ZPUk1BVCcgKSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHR5cGVvZiB2ID09ICdvYmplY3QnICkge1xyXG4gICAgICAgICAgICAgICAgICAgIEZPUk1BVCA9IHY7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKEVSUk9SUykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhaXNlKCAyLCBwICsgJyBub3QgYW4gb2JqZWN0JywgdiApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJbcF0gPSBGT1JNQVQ7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcjtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSBtYXhpbXVtIG9mIHRoZSBhcmd1bWVudHMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBhcmd1bWVudHMge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIEJpZ051bWJlci5tYXggPSBmdW5jdGlvbiAoKSB7IHJldHVybiBtYXhPck1pbiggYXJndW1lbnRzLCBQLmx0ICk7IH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIG1pbmltdW0gb2YgdGhlIGFyZ3VtZW50cy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9XHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQmlnTnVtYmVyLm1pbiA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1heE9yTWluKCBhcmd1bWVudHMsIFAuZ3QgKTsgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aXRoIGEgcmFuZG9tIHZhbHVlIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiAwIGFuZCBsZXNzIHRoYW4gMSxcclxuICAgICAgICAgKiBhbmQgd2l0aCBkcCwgb3IgREVDSU1BTF9QTEFDRVMgaWYgZHAgaXMgb21pdHRlZCwgZGVjaW1hbCBwbGFjZXMgKG9yIGxlc3MgaWYgdHJhaWxpbmdcclxuICAgICAgICAgKiB6ZXJvcyBhcmUgcHJvZHVjZWQpLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3JhbmRvbSgpIGRlY2ltYWwgcGxhY2VzIG5vdCBhbiBpbnRlZ2VyOiB7ZHB9J1xyXG4gICAgICAgICAqICdyYW5kb20oKSBkZWNpbWFsIHBsYWNlcyBvdXQgb2YgcmFuZ2U6IHtkcH0nXHJcbiAgICAgICAgICogJ3JhbmRvbSgpIGNyeXB0byB1bmF2YWlsYWJsZToge2NyeXB0b30nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgQmlnTnVtYmVyLnJhbmRvbSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBwb3cyXzUzID0gMHgyMDAwMDAwMDAwMDAwMDtcclxuXHJcbiAgICAgICAgICAgIC8vIFJldHVybiBhIDUzIGJpdCBpbnRlZ2VyIG4sIHdoZXJlIDAgPD0gbiA8IDkwMDcxOTkyNTQ3NDA5OTIuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIE1hdGgucmFuZG9tKCkgcHJvZHVjZXMgbW9yZSB0aGFuIDMyIGJpdHMgb2YgcmFuZG9tbmVzcy5cclxuICAgICAgICAgICAgLy8gSWYgaXQgZG9lcywgYXNzdW1lIGF0IGxlYXN0IDUzIGJpdHMgYXJlIHByb2R1Y2VkLCBvdGhlcndpc2UgYXNzdW1lIGF0IGxlYXN0IDMwIGJpdHMuXHJcbiAgICAgICAgICAgIC8vIDB4NDAwMDAwMDAgaXMgMl4zMCwgMHg4MDAwMDAgaXMgMl4yMywgMHgxZmZmZmYgaXMgMl4yMSAtIDEuXHJcbiAgICAgICAgICAgIHZhciByYW5kb201M2JpdEludCA9IChNYXRoLnJhbmRvbSgpICogcG93Ml81MykgJiAweDFmZmZmZlxyXG4gICAgICAgICAgICAgID8gZnVuY3Rpb24gKCkgeyByZXR1cm4gbWF0aGZsb29yKCBNYXRoLnJhbmRvbSgpICogcG93Ml81MyApOyB9XHJcbiAgICAgICAgICAgICAgOiBmdW5jdGlvbiAoKSB7IHJldHVybiAoKE1hdGgucmFuZG9tKCkgKiAweDQwMDAwMDAwIHwgMCkgKiAweDgwMDAwMCkgK1xyXG4gICAgICAgICAgICAgICAgICAoTWF0aC5yYW5kb20oKSAqIDB4ODAwMDAwIHwgMCk7IH07XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGRwKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYSwgYiwgZSwgaywgdixcclxuICAgICAgICAgICAgICAgICAgICBpID0gMCxcclxuICAgICAgICAgICAgICAgICAgICBjID0gW10sXHJcbiAgICAgICAgICAgICAgICAgICAgcmFuZCA9IG5ldyBCaWdOdW1iZXIoT05FKTtcclxuXHJcbiAgICAgICAgICAgICAgICBkcCA9IGRwID09IG51bGwgfHwgIWlzVmFsaWRJbnQoIGRwLCAwLCBNQVgsIDE0ICkgPyBERUNJTUFMX1BMQUNFUyA6IGRwIHwgMDtcclxuICAgICAgICAgICAgICAgIGsgPSBtYXRoY2VpbCggZHAgLyBMT0dfQkFTRSApO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChDUllQVE8pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gQnJvd3NlcnMgc3VwcG9ydGluZyBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzLlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyggbmV3IFVpbnQzMkFycmF5KCBrICo9IDIgKSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggOyBpIDwgazsgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gNTMgYml0czpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICgoTWF0aC5wb3coMiwgMzIpIC0gMSkgKiBNYXRoLnBvdygyLCAyMSkpLnRvU3RyaW5nKDIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAxMTExMSAxMTExMTExMSAxMTExMTExMSAxMTExMTExMSAxMTEwMDAwMCAwMDAwMDAwMCAwMDAwMDAwMFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKChNYXRoLnBvdygyLCAzMikgLSAxKSA+Pj4gMTEpLnRvU3RyaW5nKDIpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxMTExMSAxMTExMTExMSAxMTExMTExMVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMHgyMDAwMCBpcyAyXjIxLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdiA9IGFbaV0gKiAweDIwMDAwICsgKGFbaSArIDFdID4+PiAxMSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmVqZWN0aW9uIHNhbXBsaW5nOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCA8PSB2IDwgOTAwNzE5OTI1NDc0MDk5MlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gUHJvYmFiaWxpdHkgdGhhdCB2ID49IDllMTUsIGlzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyA3MTk5MjU0NzQwOTkyIC8gOTAwNzE5OTI1NDc0MDk5MiB+PSAwLjAwMDgsIGkuZS4gMSBpbiAxMjUxXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHYgPj0gOWUxNSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiID0gY3J5cHRvLmdldFJhbmRvbVZhbHVlcyggbmV3IFVpbnQzMkFycmF5KDIpICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYVtpXSA9IGJbMF07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYVtpICsgMV0gPSBiWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMCA8PSB2IDw9IDg5OTk5OTk5OTk5OTk5OTlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIDw9ICh2ICUgMWUxNCkgPD0gOTk5OTk5OTk5OTk5OTlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjLnB1c2goIHYgJSAxZTE0ICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaSArPSAyO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGkgPSBrIC8gMjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm9kZS5qcyBzdXBwb3J0aW5nIGNyeXB0by5yYW5kb21CeXRlcy5cclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNyeXB0by5yYW5kb21CeXRlcykge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYnVmZmVyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGEgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoIGsgKj0gNyApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9yICggOyBpIDwgazsgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMHgxMDAwMDAwMDAwMDAwIGlzIDJeNDgsIDB4MTAwMDAwMDAwMDAgaXMgMl40MFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMHgxMDAwMDAwMDAgaXMgMl4zMiwgMHgxMDAwMDAwIGlzIDJeMjRcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDExMTExIDExMTExMTExIDExMTExMTExIDExMTExMTExIDExMTExMTExIDExMTExMTExIDExMTExMTExXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIDw9IHYgPCA5MDA3MTk5MjU0NzQwOTkyXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ID0gKCAoIGFbaV0gJiAzMSApICogMHgxMDAwMDAwMDAwMDAwICkgKyAoIGFbaSArIDFdICogMHgxMDAwMDAwMDAwMCApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggYVtpICsgMl0gKiAweDEwMDAwMDAwMCApICsgKCBhW2kgKyAzXSAqIDB4MTAwMDAwMCApICtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICggYVtpICsgNF0gPDwgMTYgKSArICggYVtpICsgNV0gPDwgOCApICsgYVtpICsgNl07XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB2ID49IDllMTUgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3J5cHRvLnJhbmRvbUJ5dGVzKDcpLmNvcHkoIGEsIGkgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgPD0gKHYgJSAxZTE0KSA8PSA5OTk5OTk5OTk5OTk5OVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGMucHVzaCggdiAlIDFlMTQgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICs9IDc7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaSA9IGsgLyA3O1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIENSWVBUTyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoRVJST1JTKSByYWlzZSggMTQsICdjcnlwdG8gdW5hdmFpbGFibGUnLCBjcnlwdG8gKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVXNlIE1hdGgucmFuZG9tLlxyXG4gICAgICAgICAgICAgICAgaWYgKCFDUllQVE8pIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggOyBpIDwgazsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHYgPSByYW5kb201M2JpdEludCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHYgPCA5ZTE1ICkgY1tpKytdID0gdiAlIDFlMTQ7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGsgPSBjWy0taV07XHJcbiAgICAgICAgICAgICAgICBkcCAlPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHRyYWlsaW5nIGRpZ2l0cyB0byB6ZXJvcyBhY2NvcmRpbmcgdG8gZHAuXHJcbiAgICAgICAgICAgICAgICBpZiAoIGsgJiYgZHAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdiA9IFBPV1NfVEVOW0xPR19CQVNFIC0gZHBdO1xyXG4gICAgICAgICAgICAgICAgICAgIGNbaV0gPSBtYXRoZmxvb3IoIGsgLyB2ICkgKiB2O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyBlbGVtZW50cyB3aGljaCBhcmUgemVyby5cclxuICAgICAgICAgICAgICAgIGZvciAoIDsgY1tpXSA9PT0gMDsgYy5wb3AoKSwgaS0tICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gWmVybz9cclxuICAgICAgICAgICAgICAgIGlmICggaSA8IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYyA9IFsgZSA9IDAgXTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIGVsZW1lbnRzIHdoaWNoIGFyZSB6ZXJvIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggZSA9IC0xIDsgY1swXSA9PT0gMDsgYy5zcGxpY2UoMCwgMSksIGUgLT0gTE9HX0JBU0UpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBDb3VudCB0aGUgZGlnaXRzIG9mIHRoZSBmaXJzdCBlbGVtZW50IG9mIGMgdG8gZGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MsIGFuZC4uLlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSAxLCB2ID0gY1swXTsgdiA+PSAxMDsgdiAvPSAxMCwgaSsrKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gYWRqdXN0IHRoZSBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGkgPCBMT0dfQkFTRSApIGUgLT0gTE9HX0JBU0UgLSBpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHJhbmQuZSA9IGU7XHJcbiAgICAgICAgICAgICAgICByYW5kLmMgPSBjO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJhbmQ7XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfSkoKTtcclxuXHJcblxyXG4gICAgICAgIC8vIFBSSVZBVEUgRlVOQ1RJT05TXHJcblxyXG5cclxuICAgICAgICAvLyBDb252ZXJ0IGEgbnVtZXJpYyBzdHJpbmcgb2YgYmFzZUluIHRvIGEgbnVtZXJpYyBzdHJpbmcgb2YgYmFzZU91dC5cclxuICAgICAgICBmdW5jdGlvbiBjb252ZXJ0QmFzZSggc3RyLCBiYXNlT3V0LCBiYXNlSW4sIHNpZ24gKSB7XHJcbiAgICAgICAgICAgIHZhciBkLCBlLCBrLCByLCB4LCB4YywgeSxcclxuICAgICAgICAgICAgICAgIGkgPSBzdHIuaW5kZXhPZiggJy4nICksXHJcbiAgICAgICAgICAgICAgICBkcCA9IERFQ0lNQUxfUExBQ0VTLFxyXG4gICAgICAgICAgICAgICAgcm0gPSBST1VORElOR19NT0RFO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBiYXNlSW4gPCAzNyApIHN0ciA9IHN0ci50b0xvd2VyQ2FzZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gTm9uLWludGVnZXIuXHJcbiAgICAgICAgICAgIGlmICggaSA+PSAwICkge1xyXG4gICAgICAgICAgICAgICAgayA9IFBPV19QUkVDSVNJT047XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVW5saW1pdGVkIHByZWNpc2lvbi5cclxuICAgICAgICAgICAgICAgIFBPV19QUkVDSVNJT04gPSAwO1xyXG4gICAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoICcuJywgJycgKTtcclxuICAgICAgICAgICAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKGJhc2VJbik7XHJcbiAgICAgICAgICAgICAgICB4ID0geS5wb3coIHN0ci5sZW5ndGggLSBpICk7XHJcbiAgICAgICAgICAgICAgICBQT1dfUFJFQ0lTSU9OID0gaztcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBDb252ZXJ0IHN0ciBhcyBpZiBhbiBpbnRlZ2VyLCB0aGVuIHJlc3RvcmUgdGhlIGZyYWN0aW9uIHBhcnQgYnkgZGl2aWRpbmcgdGhlXHJcbiAgICAgICAgICAgICAgICAvLyByZXN1bHQgYnkgaXRzIGJhc2UgcmFpc2VkIHRvIGEgcG93ZXIuXHJcbiAgICAgICAgICAgICAgICB5LmMgPSB0b0Jhc2VPdXQoIHRvRml4ZWRQb2ludCggY29lZmZUb1N0cmluZyggeC5jICksIHguZSApLCAxMCwgYmFzZU91dCApO1xyXG4gICAgICAgICAgICAgICAgeS5lID0geS5jLmxlbmd0aDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gQ29udmVydCB0aGUgbnVtYmVyIGFzIGludGVnZXIuXHJcbiAgICAgICAgICAgIHhjID0gdG9CYXNlT3V0KCBzdHIsIGJhc2VJbiwgYmFzZU91dCApO1xyXG4gICAgICAgICAgICBlID0gayA9IHhjLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICggOyB4Y1stLWtdID09IDA7IHhjLnBvcCgpICk7XHJcbiAgICAgICAgICAgIGlmICggIXhjWzBdICkgcmV0dXJuICcwJztcclxuXHJcbiAgICAgICAgICAgIGlmICggaSA8IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAtLWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB4LmMgPSB4YztcclxuICAgICAgICAgICAgICAgIHguZSA9IGU7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gc2lnbiBpcyBuZWVkZWQgZm9yIGNvcnJlY3Qgcm91bmRpbmcuXHJcbiAgICAgICAgICAgICAgICB4LnMgPSBzaWduO1xyXG4gICAgICAgICAgICAgICAgeCA9IGRpdiggeCwgeSwgZHAsIHJtLCBiYXNlT3V0ICk7XHJcbiAgICAgICAgICAgICAgICB4YyA9IHguYztcclxuICAgICAgICAgICAgICAgIHIgPSB4LnI7XHJcbiAgICAgICAgICAgICAgICBlID0geC5lO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBkID0gZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSByb3VuZGluZyBkaWdpdCwgaS5lLiB0aGUgZGlnaXQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgICAgICBpID0geGNbZF07XHJcbiAgICAgICAgICAgIGsgPSBiYXNlT3V0IC8gMjtcclxuICAgICAgICAgICAgciA9IHIgfHwgZCA8IDAgfHwgeGNbZCArIDFdICE9IG51bGw7XHJcblxyXG4gICAgICAgICAgICByID0gcm0gPCA0ID8gKCBpICE9IG51bGwgfHwgciApICYmICggcm0gPT0gMCB8fCBybSA9PSAoIHgucyA8IDAgPyAzIDogMiApIClcclxuICAgICAgICAgICAgICAgICAgICAgICA6IGkgPiBrIHx8IGkgPT0gayAmJiggcm0gPT0gNCB8fCByIHx8IHJtID09IDYgJiYgeGNbZCAtIDFdICYgMSB8fFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgcm0gPT0gKCB4LnMgPCAwID8gOCA6IDcgKSApO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBkIDwgMSB8fCAheGNbMF0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMV4tZHAgb3IgMC5cclxuICAgICAgICAgICAgICAgIHN0ciA9IHIgPyB0b0ZpeGVkUG9pbnQoICcxJywgLWRwICkgOiAnMCc7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB4Yy5sZW5ndGggPSBkO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmIChyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJvdW5kaW5nIHVwIG1heSBtZWFuIHRoZSBwcmV2aW91cyBkaWdpdCBoYXMgdG8gYmUgcm91bmRlZCB1cCBhbmQgc28gb24uXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggLS1iYXNlT3V0OyArK3hjWy0tZF0gPiBiYXNlT3V0OyApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGNbZF0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCAhZCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICsrZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhjID0gWzFdLmNvbmNhdCh4Yyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yICggayA9IHhjLmxlbmd0aDsgIXhjWy0ta107ICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRS5nLiBbNCwgMTEsIDE1XSBiZWNvbWVzIDRiZi5cclxuICAgICAgICAgICAgICAgIGZvciAoIGkgPSAwLCBzdHIgPSAnJzsgaSA8PSBrOyBzdHIgKz0gQUxQSEFCRVQuY2hhckF0KCB4Y1tpKytdICkgKTtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHRvRml4ZWRQb2ludCggc3RyLCBlICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIFRoZSBjYWxsZXIgd2lsbCBhZGQgdGhlIHNpZ24uXHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gUGVyZm9ybSBkaXZpc2lvbiBpbiB0aGUgc3BlY2lmaWVkIGJhc2UuIENhbGxlZCBieSBkaXYgYW5kIGNvbnZlcnRCYXNlLlxyXG4gICAgICAgIGRpdiA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gICAgICAgICAgICAvLyBBc3N1bWUgbm9uLXplcm8geCBhbmQgay5cclxuICAgICAgICAgICAgZnVuY3Rpb24gbXVsdGlwbHkoIHgsIGssIGJhc2UgKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbSwgdGVtcCwgeGxvLCB4aGksXHJcbiAgICAgICAgICAgICAgICAgICAgY2FycnkgPSAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGkgPSB4Lmxlbmd0aCxcclxuICAgICAgICAgICAgICAgICAgICBrbG8gPSBrICUgU1FSVF9CQVNFLFxyXG4gICAgICAgICAgICAgICAgICAgIGtoaSA9IGsgLyBTUVJUX0JBU0UgfCAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoIHggPSB4LnNsaWNlKCk7IGktLTsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeGxvID0geFtpXSAlIFNRUlRfQkFTRTtcclxuICAgICAgICAgICAgICAgICAgICB4aGkgPSB4W2ldIC8gU1FSVF9CQVNFIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICBtID0ga2hpICogeGxvICsgeGhpICoga2xvO1xyXG4gICAgICAgICAgICAgICAgICAgIHRlbXAgPSBrbG8gKiB4bG8gKyAoICggbSAlIFNRUlRfQkFTRSApICogU1FSVF9CQVNFICkgKyBjYXJyeTtcclxuICAgICAgICAgICAgICAgICAgICBjYXJyeSA9ICggdGVtcCAvIGJhc2UgfCAwICkgKyAoIG0gLyBTUVJUX0JBU0UgfCAwICkgKyBraGkgKiB4aGk7XHJcbiAgICAgICAgICAgICAgICAgICAgeFtpXSA9IHRlbXAgJSBiYXNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIGlmIChjYXJyeSkgeCA9IFtjYXJyeV0uY29uY2F0KHgpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiB4O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBjb21wYXJlKCBhLCBiLCBhTCwgYkwgKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgaSwgY21wO1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggYUwgIT0gYkwgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY21wID0gYUwgPiBiTCA/IDEgOiAtMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSBjbXAgPSAwOyBpIDwgYUw7IGkrKyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggYVtpXSAhPSBiW2ldICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gYVtpXSA+IGJbaV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBjbXA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIHN1YnRyYWN0KCBhLCBiLCBhTCwgYmFzZSApIHtcclxuICAgICAgICAgICAgICAgIHZhciBpID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCBiIGZyb20gYS5cclxuICAgICAgICAgICAgICAgIGZvciAoIDsgYUwtLTsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYVthTF0gLT0gaTtcclxuICAgICAgICAgICAgICAgICAgICBpID0gYVthTF0gPCBiW2FMXSA/IDEgOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGFbYUxdID0gaSAqIGJhc2UgKyBhW2FMXSAtIGJbYUxdO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yICggOyAhYVswXSAmJiBhLmxlbmd0aCA+IDE7IGEuc3BsaWNlKDAsIDEpICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIHg6IGRpdmlkZW5kLCB5OiBkaXZpc29yLlxyXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCB4LCB5LCBkcCwgcm0sIGJhc2UgKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgY21wLCBlLCBpLCBtb3JlLCBuLCBwcm9kLCBwcm9kTCwgcSwgcWMsIHJlbSwgcmVtTCwgcmVtMCwgeGksIHhMLCB5YzAsXHJcbiAgICAgICAgICAgICAgICAgICAgeUwsIHl6LFxyXG4gICAgICAgICAgICAgICAgICAgIHMgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxyXG4gICAgICAgICAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEVpdGhlciBOYU4sIEluZmluaXR5IG9yIDA/XHJcbiAgICAgICAgICAgICAgICBpZiAoICF4YyB8fCAheGNbMF0gfHwgIXljIHx8ICF5Y1swXSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJuIE5hTiBpZiBlaXRoZXIgTmFOLCBvciBib3RoIEluZmluaXR5IG9yIDAuXHJcbiAgICAgICAgICAgICAgICAgICAgICAheC5zIHx8ICF5LnMgfHwgKCB4YyA/IHljICYmIHhjWzBdID09IHljWzBdIDogIXljICkgPyBOYU4gOlxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJuIMKxMCBpZiB4IGlzIMKxMCBvciB5IGlzIMKxSW5maW5pdHksIG9yIHJldHVybiDCsUluZmluaXR5IGFzIHkgaXMgwrEwLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB4YyAmJiB4Y1swXSA9PSAwIHx8ICF5YyA/IHMgKiAwIDogcyAvIDBcclxuICAgICAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHEgPSBuZXcgQmlnTnVtYmVyKHMpO1xyXG4gICAgICAgICAgICAgICAgcWMgPSBxLmMgPSBbXTtcclxuICAgICAgICAgICAgICAgIGUgPSB4LmUgLSB5LmU7XHJcbiAgICAgICAgICAgICAgICBzID0gZHAgKyBlICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoICFiYXNlICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGJhc2UgPSBCQVNFO1xyXG4gICAgICAgICAgICAgICAgICAgIGUgPSBiaXRGbG9vciggeC5lIC8gTE9HX0JBU0UgKSAtIGJpdEZsb29yKCB5LmUgLyBMT0dfQkFTRSApO1xyXG4gICAgICAgICAgICAgICAgICAgIHMgPSBzIC8gTE9HX0JBU0UgfCAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJlc3VsdCBleHBvbmVudCBtYXkgYmUgb25lIGxlc3MgdGhlbiB0aGUgY3VycmVudCB2YWx1ZSBvZiBlLlxyXG4gICAgICAgICAgICAgICAgLy8gVGhlIGNvZWZmaWNpZW50cyBvZiB0aGUgQmlnTnVtYmVycyBmcm9tIGNvbnZlcnRCYXNlIG1heSBoYXZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgZm9yICggaSA9IDA7IHljW2ldID09ICggeGNbaV0gfHwgMCApOyBpKysgKTtcclxuICAgICAgICAgICAgICAgIGlmICggeWNbaV0gPiAoIHhjW2ldIHx8IDAgKSApIGUtLTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHMgPCAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHFjLnB1c2goMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgbW9yZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHhMID0geGMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIHlMID0geWMubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIHMgKz0gMjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm9ybWFsaXNlIHhjIGFuZCB5YyBzbyBoaWdoZXN0IG9yZGVyIGRpZ2l0IG9mIHljIGlzID49IGJhc2UgLyAyLlxyXG5cclxuICAgICAgICAgICAgICAgICAgICBuID0gbWF0aGZsb29yKCBiYXNlIC8gKCB5Y1swXSArIDEgKSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBOb3QgbmVjZXNzYXJ5LCBidXQgdG8gaGFuZGxlIG9kZCBiYXNlcyB3aGVyZSB5Y1swXSA9PSAoIGJhc2UgLyAyICkgLSAxLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGlmICggbiA+IDEgfHwgbisrID09IDEgJiYgeWNbMF0gPCBiYXNlIC8gMiApIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIG4gPiAxICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5YyA9IG11bHRpcGx5KCB5YywgbiwgYmFzZSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4YyA9IG11bHRpcGx5KCB4YywgbiwgYmFzZSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5TCA9IHljLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeEwgPSB4Yy5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICB4aSA9IHlMO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbSA9IHhjLnNsaWNlKCAwLCB5TCApO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIDsgcmVtTCA8IHlMOyByZW1bcmVtTCsrXSA9IDAgKTtcclxuICAgICAgICAgICAgICAgICAgICB5eiA9IHljLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgeXogPSBbMF0uY29uY2F0KHl6KTtcclxuICAgICAgICAgICAgICAgICAgICB5YzAgPSB5Y1swXTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIHljWzFdID49IGJhc2UgLyAyICkgeWMwKys7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTm90IG5lY2Vzc2FyeSwgYnV0IHRvIHByZXZlbnQgdHJpYWwgZGlnaXQgbiA+IGJhc2UsIHdoZW4gdXNpbmcgYmFzZSAzLlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIGVsc2UgaWYgKCBiYXNlID09IDMgJiYgeWMwID09IDEgKSB5YzAgPSAxICsgMWUtMTU7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGRvIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbiA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21wYXJlIGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gY29tcGFyZSggeWMsIHJlbSwgeUwsIHJlbUwgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggY21wIDwgMCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDYWxjdWxhdGUgdHJpYWwgZGlnaXQsIG4uXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtMCA9IHJlbVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICggeUwgIT0gcmVtTCApIHJlbTAgPSByZW0wICogYmFzZSArICggcmVtWzFdIHx8IDAgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBuIGlzIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byB0aGUgY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0gbWF0aGZsb29yKCByZW0wIC8geWMwICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIEFsZ29yaXRobTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICAxLiBwcm9kdWN0ID0gZGl2aXNvciAqIHRyaWFsIGRpZ2l0IChuKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gIDIuIGlmIHByb2R1Y3QgPiByZW1haW5kZXI6IHByb2R1Y3QgLT0gZGl2aXNvciwgbi0tXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgMy4gcmVtYWluZGVyIC09IHByb2R1Y3RcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vICA0LiBpZiBwcm9kdWN0IHdhcyA8IHJlbWFpbmRlciBhdCAyOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gICAgNS4gY29tcGFyZSBuZXcgcmVtYWluZGVyIGFuZCBkaXZpc29yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyAgICA2LiBJZiByZW1haW5kZXIgPiBkaXZpc29yOiByZW1haW5kZXIgLT0gZGl2aXNvciwgbisrXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuID4gMSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbiBtYXkgYmUgPiBiYXNlIG9ubHkgd2hlbiBiYXNlIGlzIDMuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG4gPj0gYmFzZSkgbiA9IGJhc2UgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBwcm9kdWN0ID0gZGl2aXNvciAqIHRyaWFsIGRpZ2l0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb2QgPSBtdWx0aXBseSggeWMsIG4sIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcm9kTCA9IHByb2QubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBDb21wYXJlIHByb2R1Y3QgYW5kIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiBwcm9kdWN0ID4gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWFsIGRpZ2l0IG4gdG9vIGhpZ2guXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gbiBpcyAxIHRvbyBoaWdoIGFib3V0IDUlIG9mIHRoZSB0aW1lLCBhbmQgaXMgbm90IGtub3duIHRvIGhhdmVcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBldmVyIGJlZW4gbW9yZSB0aGFuIDEgdG9vIGhpZ2guXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2hpbGUgKCBjb21wYXJlKCBwcm9kLCByZW0sIHByb2RMLCByZW1MICkgPT0gMSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbi0tO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gU3VidHJhY3QgZGl2aXNvciBmcm9tIHByb2R1Y3QuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN1YnRyYWN0KCBwcm9kLCB5TCA8IHByb2RMID8geXogOiB5YywgcHJvZEwsIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY21wID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBuIGlzIDAgb3IgMSwgY21wIGlzIC0xLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIG4gaXMgMCwgdGhlcmUgaXMgbm8gbmVlZCB0byBjb21wYXJlIHljIGFuZCByZW0gYWdhaW4gYmVsb3csXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gc28gY2hhbmdlIGNtcCB0byAxIHRvIGF2b2lkIGl0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIG4gaXMgMSwgbGVhdmUgY21wIGFzIC0xLCBzbyB5YyBhbmQgcmVtIGFyZSBjb21wYXJlZCBhZ2Fpbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIG4gPT0gMCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGRpdmlzb3IgPCByZW1haW5kZXIsIHNvIG4gbXVzdCBiZSBhdCBsZWFzdCAxLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbXAgPSBuID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHByb2R1Y3QgPSBkaXZpc29yXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZCA9IHljLnNsaWNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHByb2RMIDwgcmVtTCApIHByb2QgPSBbMF0uY29uY2F0KHByb2QpO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFN1YnRyYWN0IHByb2R1Y3QgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0cmFjdCggcmVtLCBwcm9kLCByZW1MLCBiYXNlICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgcHJvZHVjdCB3YXMgPCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGNtcCA9PSAtMSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCBuZXcgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCBuZXcgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRyaWFsIGRpZ2l0IG4gdG9vIGxvdy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBuIGlzIDEgdG9vIGxvdyBhYm91dCA1JSBvZiB0aGUgdGltZSwgYW5kIHZlcnkgcmFyZWx5IDIgdG9vIGxvdy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aGlsZSAoIGNvbXBhcmUoIHljLCByZW0sIHlMLCByZW1MICkgPCAxICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuKys7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdWJ0cmFjdCggcmVtLCB5TCA8IHJlbUwgPyB5eiA6IHljLCByZW1MLCBiYXNlICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICggY21wID09PSAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbisrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtID0gWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IC8vIGVsc2UgY21wID09PSAxIGFuZCBuIHdpbGwgYmUgMFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBuZXh0IGRpZ2l0LCBuLCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBxY1tpKytdID0gbjtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHJlbVswXSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbVtyZW1MKytdID0geGNbeGldIHx8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW0gPSBbIHhjW3hpXSBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtTCA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9IHdoaWxlICggKCB4aSsrIDwgeEwgfHwgcmVtWzBdICE9IG51bGwgKSAmJiBzLS0gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgbW9yZSA9IHJlbVswXSAhPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBMZWFkaW5nIHplcm8/XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCAhcWNbMF0gKSBxYy5zcGxpY2UoMCwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBiYXNlID09IEJBU0UgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFRvIGNhbGN1bGF0ZSBxLmUsIGZpcnN0IGdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBxY1swXS5cclxuICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMSwgcyA9IHFjWzBdOyBzID49IDEwOyBzIC89IDEwLCBpKysgKTtcclxuICAgICAgICAgICAgICAgICAgICByb3VuZCggcSwgZHAgKyAoIHEuZSA9IGkgKyBlICogTE9HX0JBU0UgLSAxICkgKyAxLCBybSwgbW9yZSApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENhbGxlciBpcyBjb252ZXJ0QmFzZS5cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcS5lID0gZTtcclxuICAgICAgICAgICAgICAgICAgICBxLnIgPSArbW9yZTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcTtcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIgbiBpbiBmaXhlZC1wb2ludCBvciBleHBvbmVudGlhbFxyXG4gICAgICAgICAqIG5vdGF0aW9uIHJvdW5kZWQgdG8gdGhlIHNwZWNpZmllZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIGlzIGEgQmlnTnVtYmVyLlxyXG4gICAgICAgICAqIGkgaXMgdGhlIGluZGV4IG9mIHRoZSBsYXN0IGRpZ2l0IHJlcXVpcmVkIChpLmUuIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwKS5cclxuICAgICAgICAgKiBybSBpcyB0aGUgcm91bmRpbmcgbW9kZS5cclxuICAgICAgICAgKiBjYWxsZXIgaXMgY2FsbGVyIGlkOiB0b0V4cG9uZW50aWFsIDE5LCB0b0ZpeGVkIDIwLCB0b0Zvcm1hdCAyMSwgdG9QcmVjaXNpb24gMjQuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gZm9ybWF0KCBuLCBpLCBybSwgY2FsbGVyICkge1xyXG4gICAgICAgICAgICB2YXIgYzAsIGUsIG5lLCBsZW4sIHN0cjtcclxuXHJcbiAgICAgICAgICAgIHJtID0gcm0gIT0gbnVsbCAmJiBpc1ZhbGlkSW50KCBybSwgMCwgOCwgY2FsbGVyLCByb3VuZGluZ01vZGUgKVxyXG4gICAgICAgICAgICAgID8gcm0gfCAwIDogUk9VTkRJTkdfTU9ERTtcclxuXHJcbiAgICAgICAgICAgIGlmICggIW4uYyApIHJldHVybiBuLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGMwID0gbi5jWzBdO1xyXG4gICAgICAgICAgICBuZSA9IG4uZTtcclxuXHJcbiAgICAgICAgICAgIGlmICggaSA9PSBudWxsICkge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyggbi5jICk7XHJcbiAgICAgICAgICAgICAgICBzdHIgPSBjYWxsZXIgPT0gMTkgfHwgY2FsbGVyID09IDI0ICYmIG5lIDw9IFRPX0VYUF9ORUdcclxuICAgICAgICAgICAgICAgICAgPyB0b0V4cG9uZW50aWFsKCBzdHIsIG5lIClcclxuICAgICAgICAgICAgICAgICAgOiB0b0ZpeGVkUG9pbnQoIHN0ciwgbmUgKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG4gPSByb3VuZCggbmV3IEJpZ051bWJlcihuKSwgaSwgcm0gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBuLmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB0aGUgdmFsdWUgd2FzIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICBlID0gbi5lO1xyXG5cclxuICAgICAgICAgICAgICAgIHN0ciA9IGNvZWZmVG9TdHJpbmcoIG4uYyApO1xyXG4gICAgICAgICAgICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB0b1ByZWNpc2lvbiByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uIGlmIHRoZSBudW1iZXIgb2Ygc2lnbmlmaWNhbnQgZGlnaXRzXHJcbiAgICAgICAgICAgICAgICAvLyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXJcclxuICAgICAgICAgICAgICAgIC8vIHBhcnQgb2YgdGhlIHZhbHVlIGluIGZpeGVkLXBvaW50IG5vdGF0aW9uLlxyXG5cclxuICAgICAgICAgICAgICAgIC8vIEV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgICAgICAgaWYgKCBjYWxsZXIgPT0gMTkgfHwgY2FsbGVyID09IDI0ICYmICggaSA8PSBlIHx8IGUgPD0gVE9fRVhQX05FRyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggOyBsZW4gPCBpOyBzdHIgKz0gJzAnLCBsZW4rKyApO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IHRvRXhwb25lbnRpYWwoIHN0ciwgZSApO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZpeGVkLXBvaW50IG5vdGF0aW9uLlxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpIC09IG5lO1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9IHRvRml4ZWRQb2ludCggc3RyLCBlICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFwcGVuZCB6ZXJvcz9cclxuICAgICAgICAgICAgICAgICAgICBpZiAoIGUgKyAxID4gbGVuICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIC0taSA+IDAgKSBmb3IgKCBzdHIgKz0gJy4nOyBpLS07IHN0ciArPSAnMCcgKTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpICs9IGUgLSBsZW47XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggaSA+IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIGUgKyAxID09IGxlbiApIHN0ciArPSAnLic7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCA7IGktLTsgc3RyICs9ICcwJyApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbi5zIDwgMCAmJiBjMCA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBIYW5kbGUgQmlnTnVtYmVyLm1heCBhbmQgQmlnTnVtYmVyLm1pbi5cclxuICAgICAgICBmdW5jdGlvbiBtYXhPck1pbiggYXJncywgbWV0aG9kICkge1xyXG4gICAgICAgICAgICB2YXIgbSwgbixcclxuICAgICAgICAgICAgICAgIGkgPSAwO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBpc0FycmF5KCBhcmdzWzBdICkgKSBhcmdzID0gYXJnc1swXTtcclxuICAgICAgICAgICAgbSA9IG5ldyBCaWdOdW1iZXIoIGFyZ3NbMF0gKTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoIDsgKytpIDwgYXJncy5sZW5ndGg7ICkge1xyXG4gICAgICAgICAgICAgICAgbiA9IG5ldyBCaWdOdW1iZXIoIGFyZ3NbaV0gKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBhbnkgbnVtYmVyIGlzIE5hTiwgcmV0dXJuIE5hTi5cclxuICAgICAgICAgICAgICAgIGlmICggIW4ucyApIHtcclxuICAgICAgICAgICAgICAgICAgICBtID0gbjtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIG1ldGhvZC5jYWxsKCBtLCBuICkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbSA9IG47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBtO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgbiBpcyBhbiBpbnRlZ2VyIGluIHJhbmdlLCBvdGhlcndpc2UgdGhyb3cuXHJcbiAgICAgICAgICogVXNlIGZvciBhcmd1bWVudCB2YWxpZGF0aW9uIHdoZW4gRVJST1JTIGlzIHRydWUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgZnVuY3Rpb24gaW50VmFsaWRhdG9yV2l0aEVycm9ycyggbiwgbWluLCBtYXgsIGNhbGxlciwgbmFtZSApIHtcclxuICAgICAgICAgICAgaWYgKCBuIDwgbWluIHx8IG4gPiBtYXggfHwgbiAhPSB0cnVuY2F0ZShuKSApIHtcclxuICAgICAgICAgICAgICAgIHJhaXNlKCBjYWxsZXIsICggbmFtZSB8fCAnZGVjaW1hbCBwbGFjZXMnICkgK1xyXG4gICAgICAgICAgICAgICAgICAoIG4gPCBtaW4gfHwgbiA+IG1heCA/ICcgb3V0IG9mIHJhbmdlJyA6ICcgbm90IGFuIGludGVnZXInICksIG4gKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBTdHJpcCB0cmFpbGluZyB6ZXJvcywgY2FsY3VsYXRlIGJhc2UgMTAgZXhwb25lbnQgYW5kIGNoZWNrIGFnYWluc3QgTUlOX0VYUCBhbmQgTUFYX0VYUC5cclxuICAgICAgICAgKiBDYWxsZWQgYnkgbWludXMsIHBsdXMgYW5kIHRpbWVzLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIG5vcm1hbGlzZSggbiwgYywgZSApIHtcclxuICAgICAgICAgICAgdmFyIGkgPSAxLFxyXG4gICAgICAgICAgICAgICAgaiA9IGMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICggOyAhY1stLWpdOyBjLnBvcCgpICk7XHJcblxyXG4gICAgICAgICAgICAvLyBDYWxjdWxhdGUgdGhlIGJhc2UgMTAgZXhwb25lbnQuIEZpcnN0IGdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBjWzBdLlxyXG4gICAgICAgICAgICBmb3IgKCBqID0gY1swXTsgaiA+PSAxMDsgaiAvPSAxMCwgaSsrICk7XHJcblxyXG4gICAgICAgICAgICAvLyBPdmVyZmxvdz9cclxuICAgICAgICAgICAgaWYgKCAoIGUgPSBpICsgZSAqIExPR19CQVNFIC0gMSApID4gTUFYX0VYUCApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBJbmZpbml0eS5cclxuICAgICAgICAgICAgICAgIG4uYyA9IG4uZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAvLyBVbmRlcmZsb3c/XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIGUgPCBNSU5fRVhQICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICBuLmMgPSBbIG4uZSA9IDAgXTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIG4uZSA9IGU7XHJcbiAgICAgICAgICAgICAgICBuLmMgPSBjO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbjtcclxuICAgICAgICB9XHJcblxyXG5cclxuICAgICAgICAvLyBIYW5kbGUgdmFsdWVzIHRoYXQgZmFpbCB0aGUgdmFsaWRpdHkgdGVzdCBpbiBCaWdOdW1iZXIuXHJcbiAgICAgICAgcGFyc2VOdW1lcmljID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIGJhc2VQcmVmaXggPSAvXigtPykwKFt4Ym9dKSg/PVxcd1tcXHcuXSokKS9pLFxyXG4gICAgICAgICAgICAgICAgZG90QWZ0ZXIgPSAvXihbXi5dKylcXC4kLyxcclxuICAgICAgICAgICAgICAgIGRvdEJlZm9yZSA9IC9eXFwuKFteLl0rKSQvLFxyXG4gICAgICAgICAgICAgICAgaXNJbmZpbml0eU9yTmFOID0gL14tPyhJbmZpbml0eXxOYU4pJC8sXHJcbiAgICAgICAgICAgICAgICB3aGl0ZXNwYWNlT3JQbHVzID0gL15cXHMqXFwrKD89W1xcdy5dKXxeXFxzK3xcXHMrJC9nO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICggeCwgc3RyLCBudW0sIGIgKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgYmFzZSxcclxuICAgICAgICAgICAgICAgICAgICBzID0gbnVtID8gc3RyIDogc3RyLnJlcGxhY2UoIHdoaXRlc3BhY2VPclBsdXMsICcnICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTm8gZXhjZXB0aW9uIG9uIMKxSW5maW5pdHkgb3IgTmFOLlxyXG4gICAgICAgICAgICAgICAgaWYgKCBpc0luZmluaXR5T3JOYU4udGVzdChzKSApIHtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSBpc05hTihzKSA/IG51bGwgOiBzIDwgMCA/IC0xIDogMTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCAhbnVtICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gYmFzZVByZWZpeCA9IC9eKC0/KTAoW3hib10pKD89XFx3W1xcdy5dKiQpL2lcclxuICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZSggYmFzZVByZWZpeCwgZnVuY3Rpb24gKCBtLCBwMSwgcDIgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiYXNlID0gKCBwMiA9IHAyLnRvTG93ZXJDYXNlKCkgKSA9PSAneCcgPyAxNiA6IHAyID09ICdiJyA/IDIgOiA4O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICFiIHx8IGIgPT0gYmFzZSA/IHAxIDogbTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmFzZSA9IGI7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gRS5nLiAnMS4nIHRvICcxJywgJy4xJyB0byAnMC4xJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZSggZG90QWZ0ZXIsICckMScgKS5yZXBsYWNlKCBkb3RCZWZvcmUsICcwLiQxJyApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHN0ciAhPSBzICkgcmV0dXJuIG5ldyBCaWdOdW1iZXIoIHMsIGJhc2UgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vICduZXcgQmlnTnVtYmVyKCkgbm90IGEgbnVtYmVyOiB7bn0nXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJ25ldyBCaWdOdW1iZXIoKSBub3QgYSBiYXNlIHtifSBudW1iZXI6IHtufSdcclxuICAgICAgICAgICAgICAgICAgICBpZiAoRVJST1JTKSByYWlzZSggaWQsICdub3QgYScgKyAoIGIgPyAnIGJhc2UgJyArIGIgOiAnJyApICsgJyBudW1iZXInLCBzdHIgKTtcclxuICAgICAgICAgICAgICAgICAgICB4LnMgPSBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBpZCA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAgICAgLy8gVGhyb3cgYSBCaWdOdW1iZXIgRXJyb3IuXHJcbiAgICAgICAgZnVuY3Rpb24gcmFpc2UoIGNhbGxlciwgbXNnLCB2YWwgKSB7XHJcbiAgICAgICAgICAgIHZhciBlcnJvciA9IG5ldyBFcnJvciggW1xyXG4gICAgICAgICAgICAgICAgJ25ldyBCaWdOdW1iZXInLCAgICAgLy8gMFxyXG4gICAgICAgICAgICAgICAgJ2NtcCcsICAgICAgICAgICAgICAgLy8gMVxyXG4gICAgICAgICAgICAgICAgJ2NvbmZpZycsICAgICAgICAgICAgLy8gMlxyXG4gICAgICAgICAgICAgICAgJ2RpdicsICAgICAgICAgICAgICAgLy8gM1xyXG4gICAgICAgICAgICAgICAgJ2RpdlRvSW50JywgICAgICAgICAgLy8gNFxyXG4gICAgICAgICAgICAgICAgJ2VxJywgICAgICAgICAgICAgICAgLy8gNVxyXG4gICAgICAgICAgICAgICAgJ2d0JywgICAgICAgICAgICAgICAgLy8gNlxyXG4gICAgICAgICAgICAgICAgJ2d0ZScsICAgICAgICAgICAgICAgLy8gN1xyXG4gICAgICAgICAgICAgICAgJ2x0JywgICAgICAgICAgICAgICAgLy8gOFxyXG4gICAgICAgICAgICAgICAgJ2x0ZScsICAgICAgICAgICAgICAgLy8gOVxyXG4gICAgICAgICAgICAgICAgJ21pbnVzJywgICAgICAgICAgICAgLy8gMTBcclxuICAgICAgICAgICAgICAgICdtb2QnLCAgICAgICAgICAgICAgIC8vIDExXHJcbiAgICAgICAgICAgICAgICAncGx1cycsICAgICAgICAgICAgICAvLyAxMlxyXG4gICAgICAgICAgICAgICAgJ3ByZWNpc2lvbicsICAgICAgICAgLy8gMTNcclxuICAgICAgICAgICAgICAgICdyYW5kb20nLCAgICAgICAgICAgIC8vIDE0XHJcbiAgICAgICAgICAgICAgICAncm91bmQnLCAgICAgICAgICAgICAvLyAxNVxyXG4gICAgICAgICAgICAgICAgJ3NoaWZ0JywgICAgICAgICAgICAgLy8gMTZcclxuICAgICAgICAgICAgICAgICd0aW1lcycsICAgICAgICAgICAgIC8vIDE3XHJcbiAgICAgICAgICAgICAgICAndG9EaWdpdHMnLCAgICAgICAgICAvLyAxOFxyXG4gICAgICAgICAgICAgICAgJ3RvRXhwb25lbnRpYWwnLCAgICAgLy8gMTlcclxuICAgICAgICAgICAgICAgICd0b0ZpeGVkJywgICAgICAgICAgIC8vIDIwXHJcbiAgICAgICAgICAgICAgICAndG9Gb3JtYXQnLCAgICAgICAgICAvLyAyMVxyXG4gICAgICAgICAgICAgICAgJ3RvRnJhY3Rpb24nLCAgICAgICAgLy8gMjJcclxuICAgICAgICAgICAgICAgICdwb3cnLCAgICAgICAgICAgICAgIC8vIDIzXHJcbiAgICAgICAgICAgICAgICAndG9QcmVjaXNpb24nLCAgICAgICAvLyAyNFxyXG4gICAgICAgICAgICAgICAgJ3RvU3RyaW5nJywgICAgICAgICAgLy8gMjVcclxuICAgICAgICAgICAgICAgICdCaWdOdW1iZXInICAgICAgICAgIC8vIDI2XHJcbiAgICAgICAgICAgIF1bY2FsbGVyXSArICcoKSAnICsgbXNnICsgJzogJyArIHZhbCApO1xyXG5cclxuICAgICAgICAgICAgZXJyb3IubmFtZSA9ICdCaWdOdW1iZXIgRXJyb3InO1xyXG4gICAgICAgICAgICBpZCA9IDA7XHJcbiAgICAgICAgICAgIHRocm93IGVycm9yO1xyXG4gICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUm91bmQgeCB0byBzZCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS4gQ2hlY2sgZm9yIG92ZXIvdW5kZXItZmxvdy5cclxuICAgICAgICAgKiBJZiByIGlzIHRydXRoeSwgaXQgaXMga25vd24gdGhhdCB0aGVyZSBhcmUgbW9yZSBkaWdpdHMgYWZ0ZXIgdGhlIHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIGZ1bmN0aW9uIHJvdW5kKCB4LCBzZCwgcm0sIHIgKSB7XHJcbiAgICAgICAgICAgIHZhciBkLCBpLCBqLCBrLCBuLCBuaSwgcmQsXHJcbiAgICAgICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgICAgIHBvd3MxMCA9IFBPV1NfVEVOO1xyXG5cclxuICAgICAgICAgICAgLy8gaWYgeCBpcyBub3QgSW5maW5pdHkgb3IgTmFOLi4uXHJcbiAgICAgICAgICAgIGlmICh4Yykge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHJkIGlzIHRoZSByb3VuZGluZyBkaWdpdCwgaS5lLiB0aGUgZGlnaXQgYWZ0ZXIgdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgICAgICAgICAvLyBuIGlzIGEgYmFzZSAxZTE0IG51bWJlciwgdGhlIHZhbHVlIG9mIHRoZSBlbGVtZW50IG9mIGFycmF5IHguYyBjb250YWluaW5nIHJkLlxyXG4gICAgICAgICAgICAgICAgLy8gbmkgaXMgdGhlIGluZGV4IG9mIG4gd2l0aGluIHguYy5cclxuICAgICAgICAgICAgICAgIC8vIGQgaXMgdGhlIG51bWJlciBvZiBkaWdpdHMgb2Ygbi5cclxuICAgICAgICAgICAgICAgIC8vIGkgaXMgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiBuIGluY2x1ZGluZyBsZWFkaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgLy8gaiBpcyB0aGUgYWN0dWFsIGluZGV4IG9mIHJkIHdpdGhpbiBuIChpZiA8IDAsIHJkIGlzIGEgbGVhZGluZyB6ZXJvKS5cclxuICAgICAgICAgICAgICAgIG91dDoge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIGZpcnN0IGVsZW1lbnQgb2YgeGMuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggZCA9IDEsIGsgPSB4Y1swXTsgayA+PSAxMDsgayAvPSAxMCwgZCsrICk7XHJcbiAgICAgICAgICAgICAgICAgICAgaSA9IHNkIC0gZDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHJvdW5kaW5nIGRpZ2l0IGlzIGluIHRoZSBmaXJzdCBlbGVtZW50IG9mIHhjLi4uXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpIDwgMCApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaSArPSBMT0dfQkFTRTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaiA9IHNkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBuID0geGNbIG5pID0gMCBdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSByb3VuZGluZyBkaWdpdCBhdCBpbmRleCBqIG9mIG4uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJkID0gbiAvIHBvd3MxMFsgZCAtIGogLSAxIF0gJSAxMCB8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmkgPSBtYXRoY2VpbCggKCBpICsgMSApIC8gTE9HX0JBU0UgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggbmkgPj0geGMubGVuZ3RoICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE5lZWRlZCBieSBzcXJ0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIDsgeGMubGVuZ3RoIDw9IG5pOyB4Yy5wdXNoKDApICk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbiA9IHJkID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpICU9IExPR19CQVNFO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGogPSBpIC0gTE9HX0JBU0UgKyAxO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhayBvdXQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuID0gayA9IHhjW25pXTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2Ygbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIGQgPSAxOyBrID49IDEwOyBrIC89IDEwLCBkKysgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiBuLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaSAlPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiBuLCBhZGp1c3RlZCBmb3IgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBudW1iZXIgb2YgbGVhZGluZyB6ZXJvcyBvZiBuIGlzIGdpdmVuIGJ5IExPR19CQVNFIC0gZC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGogPSBpIC0gTE9HX0JBU0UgKyBkO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIEdldCB0aGUgcm91bmRpbmcgZGlnaXQgYXQgaW5kZXggaiBvZiBuLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmQgPSBqIDwgMCA/IDAgOiBuIC8gcG93czEwWyBkIC0gaiAtIDEgXSAlIDEwIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgciA9IHIgfHwgc2QgPCAwIHx8XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIEFyZSB0aGVyZSBhbnkgbm9uLXplcm8gZGlnaXRzIGFmdGVyIHRoZSByb3VuZGluZyBkaWdpdD9cclxuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZXhwcmVzc2lvbiAgbiAlIHBvd3MxMFsgZCAtIGogLSAxIF0gIHJldHVybnMgYWxsIGRpZ2l0cyBvZiBuIHRvIHRoZSByaWdodFxyXG4gICAgICAgICAgICAgICAgICAgIC8vIG9mIHRoZSBkaWdpdCBhdCBqLCBlLmcuIGlmIG4gaXMgOTA4NzE0IGFuZCBqIGlzIDIsIHRoZSBleHByZXNzaW9uIGdpdmVzIDcxNC5cclxuICAgICAgICAgICAgICAgICAgICAgIHhjW25pICsgMV0gIT0gbnVsbCB8fCAoIGogPCAwID8gbiA6IG4gJSBwb3dzMTBbIGQgLSBqIC0gMSBdICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHIgPSBybSA8IDRcclxuICAgICAgICAgICAgICAgICAgICAgID8gKCByZCB8fCByICkgJiYgKCBybSA9PSAwIHx8IHJtID09ICggeC5zIDwgMCA/IDMgOiAyICkgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiByZCA+IDUgfHwgcmQgPT0gNSAmJiAoIHJtID09IDQgfHwgciB8fCBybSA9PSA2ICYmXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBkaWdpdCB0byB0aGUgbGVmdCBvZiB0aGUgcm91bmRpbmcgZGlnaXQgaXMgb2RkLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAoICggaSA+IDAgPyBqID4gMCA/IG4gLyBwb3dzMTBbIGQgLSBqIF0gOiAwIDogeGNbbmkgLSAxXSApICUgMTAgKSAmIDEgfHxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBybSA9PSAoIHgucyA8IDAgPyA4IDogNyApICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggc2QgPCAxIHx8ICF4Y1swXSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeGMubGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gQ29udmVydCBzZCB0byBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNkIC09IHguZSArIDE7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhjWzBdID0gcG93czEwWyAoIExPR19CQVNFIC0gc2QgJSBMT0dfQkFTRSApICUgTE9HX0JBU0UgXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHguZSA9IC1zZCB8fCAwO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4Y1swXSA9IHguZSA9IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB4O1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIGV4Y2VzcyBkaWdpdHMuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBpID09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHhjLmxlbmd0aCA9IG5pO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmktLTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB4Yy5sZW5ndGggPSBuaSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGsgPSBwb3dzMTBbIExPR19CQVNFIC0gaSBdO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gRS5nLiA1NjcwMCBiZWNvbWVzIDU2MDAwIGlmIDcgaXMgdGhlIHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBqID4gMCBtZWFucyBpID4gbnVtYmVyIG9mIGxlYWRpbmcgemVyb3Mgb2Ygbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgeGNbbmldID0gaiA+IDAgPyBtYXRoZmxvb3IoIG4gLyBwb3dzMTBbIGQgLSBqIF0gJSBwb3dzMTBbal0gKSAqIGsgOiAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAoIDsgOyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZGlnaXQgdG8gYmUgcm91bmRlZCB1cCBpcyBpbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB4Yy4uLlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuaSA9PSAwICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBpIHdpbGwgYmUgdGhlIGxlbmd0aCBvZiB4Y1swXSBiZWZvcmUgayBpcyBhZGRlZC5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gMSwgaiA9IHhjWzBdOyBqID49IDEwOyBqIC89IDEwLCBpKysgKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBqID0geGNbMF0gKz0gaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKCBrID0gMTsgaiA+PSAxMDsgaiAvPSAxMCwgaysrICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGkgIT0gayB0aGUgbGVuZ3RoIGhhcyBpbmNyZWFzZWQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBpICE9IGsgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHguZSsrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHhjWzBdID09IEJBU0UgKSB4Y1swXSA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgeGNbbmldICs9IGs7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCB4Y1tuaV0gIT0gQkFTRSApIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHhjW25pLS1dID0gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBrID0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgICAgICAgICAgIGZvciAoIGkgPSB4Yy5sZW5ndGg7IHhjWy0taV0gPT09IDA7IHhjLnBvcCgpICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gT3ZlcmZsb3c/IEluZmluaXR5LlxyXG4gICAgICAgICAgICAgICAgaWYgKCB4LmUgPiBNQVhfRVhQICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVW5kZXJmbG93PyBaZXJvLlxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICggeC5lIDwgTUlOX0VYUCApIHtcclxuICAgICAgICAgICAgICAgICAgICB4LmMgPSBbIHguZSA9IDAgXTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHg7XHJcbiAgICAgICAgfVxyXG5cclxuXHJcbiAgICAgICAgLy8gUFJPVE9UWVBFL0lOU1RBTkNFIE1FVEhPRFNcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgYWJzb2x1dGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5hYnNvbHV0ZVZhbHVlID0gUC5hYnMgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciB4ID0gbmV3IEJpZ051bWJlcih0aGlzKTtcclxuICAgICAgICAgICAgaWYgKCB4LnMgPCAwICkgeC5zID0gMTtcclxuICAgICAgICAgICAgcmV0dXJuIHg7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBhIHdob2xlXHJcbiAgICAgICAgICogbnVtYmVyIGluIHRoZSBkaXJlY3Rpb24gb2YgSW5maW5pdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5jZWlsID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcm91bmQoIG5ldyBCaWdOdW1iZXIodGhpcyksIHRoaXMuZSArIDEsIDIgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm5cclxuICAgICAgICAgKiAxIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKSxcclxuICAgICAgICAgKiAtMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIoeSwgYiksXHJcbiAgICAgICAgICogMCBpZiB0aGV5IGhhdmUgdGhlIHNhbWUgdmFsdWUsXHJcbiAgICAgICAgICogb3IgbnVsbCBpZiB0aGUgdmFsdWUgb2YgZWl0aGVyIGlzIE5hTi5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmNvbXBhcmVkVG8gPSBQLmNtcCA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgaWQgPSAxO1xyXG4gICAgICAgICAgICByZXR1cm4gY29tcGFyZSggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRoZSBudW1iZXIgb2YgZGVjaW1hbCBwbGFjZXMgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLCBvciBudWxsIGlmIHRoZSB2YWx1ZVxyXG4gICAgICAgICAqIG9mIHRoaXMgQmlnTnVtYmVyIGlzIMKxSW5maW5pdHkgb3IgTmFOLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuZGVjaW1hbFBsYWNlcyA9IFAuZHAgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHZhciBuLCB2LFxyXG4gICAgICAgICAgICAgICAgYyA9IHRoaXMuYztcclxuXHJcbiAgICAgICAgICAgIGlmICggIWMgKSByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgbiA9ICggKCB2ID0gYy5sZW5ndGggLSAxICkgLSBiaXRGbG9vciggdGhpcy5lIC8gTE9HX0JBU0UgKSApICogTE9HX0JBU0U7XHJcblxyXG4gICAgICAgICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IG51bWJlci5cclxuICAgICAgICAgICAgaWYgKCB2ID0gY1t2XSApIGZvciAoIDsgdiAlIDEwID09IDA7IHYgLz0gMTAsIG4tLSApO1xyXG4gICAgICAgICAgICBpZiAoIG4gPCAwICkgbiA9IDA7XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gbjtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgbiAvIDAgPSBJXHJcbiAgICAgICAgICogIG4gLyBOID0gTlxyXG4gICAgICAgICAqICBuIC8gSSA9IDBcclxuICAgICAgICAgKiAgMCAvIG4gPSAwXHJcbiAgICAgICAgICogIDAgLyAwID0gTlxyXG4gICAgICAgICAqICAwIC8gTiA9IE5cclxuICAgICAgICAgKiAgMCAvIEkgPSAwXHJcbiAgICAgICAgICogIE4gLyBuID0gTlxyXG4gICAgICAgICAqICBOIC8gMCA9IE5cclxuICAgICAgICAgKiAgTiAvIE4gPSBOXHJcbiAgICAgICAgICogIE4gLyBJID0gTlxyXG4gICAgICAgICAqICBJIC8gbiA9IElcclxuICAgICAgICAgKiAgSSAvIDAgPSBJXHJcbiAgICAgICAgICogIEkgLyBOID0gTlxyXG4gICAgICAgICAqICBJIC8gSSA9IE5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGRpdmlkZWQgYnkgdGhlIHZhbHVlIG9mXHJcbiAgICAgICAgICogQmlnTnVtYmVyKHksIGIpLCByb3VuZGVkIGFjY29yZGluZyB0byBERUNJTUFMX1BMQUNFUyBhbmQgUk9VTkRJTkdfTU9ERS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmRpdmlkZWRCeSA9IFAuZGl2ID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICBpZCA9IDM7XHJcbiAgICAgICAgICAgIHJldHVybiBkaXYoIHRoaXMsIG5ldyBCaWdOdW1iZXIoIHksIGIgKSwgREVDSU1BTF9QTEFDRVMsIFJPVU5ESU5HX01PREUgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSBpbnRlZ2VyIHBhcnQgb2YgZGl2aWRpbmcgdGhlIHZhbHVlIG9mIHRoaXNcclxuICAgICAgICAgKiBCaWdOdW1iZXIgYnkgdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmRpdmlkZWRUb0ludGVnZXJCeSA9IFAuZGl2VG9JbnQgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIGlkID0gNDtcclxuICAgICAgICAgICAgcmV0dXJuIGRpdiggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApLCAwLCAxICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGVxdWFsIHRvIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIoeSwgYiksXHJcbiAgICAgICAgICogb3RoZXJ3aXNlIHJldHVybnMgZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5lcXVhbHMgPSBQLmVxID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICBpZCA9IDU7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlKCB0aGlzLCBuZXcgQmlnTnVtYmVyKCB5LCBiICkgKSA9PT0gMDtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciByb3VuZGVkIHRvIGEgd2hvbGVcclxuICAgICAgICAgKiBudW1iZXIgaW4gdGhlIGRpcmVjdGlvbiBvZiAtSW5maW5pdHkuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5mbG9vciA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJvdW5kKCBuZXcgQmlnTnVtYmVyKHRoaXMpLCB0aGlzLmUgKyAxLCAzICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLFxyXG4gICAgICAgICAqIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuZ3JlYXRlclRoYW4gPSBQLmd0ID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICBpZCA9IDY7XHJcbiAgICAgICAgICAgIHJldHVybiBjb21wYXJlKCB0aGlzLCBuZXcgQmlnTnVtYmVyKCB5LCBiICkgKSA+IDA7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYiksIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuZ3JlYXRlclRoYW5PckVxdWFsVG8gPSBQLmd0ZSA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgaWQgPSA3O1xyXG4gICAgICAgICAgICByZXR1cm4gKCBiID0gY29tcGFyZSggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApICkgKSA9PT0gMSB8fCBiID09PSAwO1xyXG5cclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgYSBmaW5pdGUgbnVtYmVyLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmlzRmluaXRlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISF0aGlzLmM7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGFuIGludGVnZXIsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5pc0ludGVnZXIgPSBQLmlzSW50ID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gISF0aGlzLmMgJiYgYml0Rmxvb3IoIHRoaXMuZSAvIExPR19CQVNFICkgPiB0aGlzLmMubGVuZ3RoIC0gMjtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgTmFOLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmlzTmFOID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gIXRoaXMucztcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgbmVnYXRpdmUsIG90aGVyd2lzZSByZXR1cm5zIGZhbHNlLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuaXNOZWdhdGl2ZSA9IFAuaXNOZWcgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnMgPCAwO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyAwIG9yIC0wLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmlzWmVybyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgcmV0dXJuICEhdGhpcy5jICYmIHRoaXMuY1swXSA9PSAwO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBsZXNzIHRoYW4gdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKSxcclxuICAgICAgICAgKiBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmxlc3NUaGFuID0gUC5sdCA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgaWQgPSA4O1xyXG4gICAgICAgICAgICByZXR1cm4gY29tcGFyZSggdGhpcywgbmV3IEJpZ051bWJlciggeSwgYiApICkgPCAwO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlIG9mXHJcbiAgICAgICAgICogQmlnTnVtYmVyKHksIGIpLCBvdGhlcndpc2UgcmV0dXJucyBmYWxzZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLmxlc3NUaGFuT3JFcXVhbFRvID0gUC5sdGUgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIGlkID0gOTtcclxuICAgICAgICAgICAgcmV0dXJuICggYiA9IGNvbXBhcmUoIHRoaXMsIG5ldyBCaWdOdW1iZXIoIHksIGIgKSApICkgPT09IC0xIHx8IGIgPT09IDA7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogIG4gLSAwID0gblxyXG4gICAgICAgICAqICBuIC0gTiA9IE5cclxuICAgICAgICAgKiAgbiAtIEkgPSAtSVxyXG4gICAgICAgICAqICAwIC0gbiA9IC1uXHJcbiAgICAgICAgICogIDAgLSAwID0gMFxyXG4gICAgICAgICAqICAwIC0gTiA9IE5cclxuICAgICAgICAgKiAgMCAtIEkgPSAtSVxyXG4gICAgICAgICAqICBOIC0gbiA9IE5cclxuICAgICAgICAgKiAgTiAtIDAgPSBOXHJcbiAgICAgICAgICogIE4gLSBOID0gTlxyXG4gICAgICAgICAqICBOIC0gSSA9IE5cclxuICAgICAgICAgKiAgSSAtIG4gPSBJXHJcbiAgICAgICAgICogIEkgLSAwID0gSVxyXG4gICAgICAgICAqICBJIC0gTiA9IE5cclxuICAgICAgICAgKiAgSSAtIEkgPSBOXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBtaW51cyB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYikuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5taW51cyA9IFAuc3ViID0gZnVuY3Rpb24gKCB5LCBiICkge1xyXG4gICAgICAgICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYSA9IHgucztcclxuXHJcbiAgICAgICAgICAgIGlkID0gMTA7XHJcbiAgICAgICAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKCB5LCBiICk7XHJcbiAgICAgICAgICAgIGIgPSB5LnM7XHJcblxyXG4gICAgICAgICAgICAvLyBFaXRoZXIgTmFOP1xyXG4gICAgICAgICAgICBpZiAoICFhIHx8ICFiICkgcmV0dXJuIG5ldyBCaWdOdW1iZXIoTmFOKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFNpZ25zIGRpZmZlcj9cclxuICAgICAgICAgICAgaWYgKCBhICE9IGIgKSB7XHJcbiAgICAgICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4LnBsdXMoeSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciB4ZSA9IHguZSAvIExPR19CQVNFLFxyXG4gICAgICAgICAgICAgICAgeWUgPSB5LmUgLyBMT0dfQkFTRSxcclxuICAgICAgICAgICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgICAgICAgICAgeWMgPSB5LmM7XHJcblxyXG4gICAgICAgICAgICBpZiAoICF4ZSB8fCAheWUgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRWl0aGVyIEluZmluaXR5P1xyXG4gICAgICAgICAgICAgICAgaWYgKCAheGMgfHwgIXljICkgcmV0dXJuIHhjID8gKCB5LnMgPSAtYiwgeSApIDogbmV3IEJpZ051bWJlciggeWMgPyB4IDogTmFOICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgICAgICAgICBpZiAoICF4Y1swXSB8fCAheWNbMF0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIC8vIFJldHVybiB5IGlmIHkgaXMgbm9uLXplcm8sIHggaWYgeCBpcyBub24temVybywgb3IgemVybyBpZiBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB5Y1swXSA/ICggeS5zID0gLWIsIHkgKSA6IG5ldyBCaWdOdW1iZXIoIHhjWzBdID8geCA6XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgLy8gSUVFRSA3NTQgKDIwMDgpIDYuMzogbiAtIG4gPSAtMCB3aGVuIHJvdW5kaW5nIHRvIC1JbmZpbml0eVxyXG4gICAgICAgICAgICAgICAgICAgICAgUk9VTkRJTkdfTU9ERSA9PSAzID8gLTAgOiAwICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHhlID0gYml0Rmxvb3IoeGUpO1xyXG4gICAgICAgICAgICB5ZSA9IGJpdEZsb29yKHllKTtcclxuICAgICAgICAgICAgeGMgPSB4Yy5zbGljZSgpO1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIHdoaWNoIGlzIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICAgICAgICBpZiAoIGEgPSB4ZSAtIHllICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggeExUeSA9IGEgPCAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHllID0geGU7XHJcbiAgICAgICAgICAgICAgICAgICAgdCA9IHljO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHQucmV2ZXJzZSgpO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLlxyXG4gICAgICAgICAgICAgICAgZm9yICggYiA9IGE7IGItLTsgdC5wdXNoKDApICk7XHJcbiAgICAgICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBFeHBvbmVudHMgZXF1YWwuIENoZWNrIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgICAgICAgICAgICAgaiA9ICggeExUeSA9ICggYSA9IHhjLmxlbmd0aCApIDwgKCBiID0geWMubGVuZ3RoICkgKSA/IGEgOiBiO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoIGEgPSBiID0gMDsgYiA8IGo7IGIrKyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCB4Y1tiXSAhPSB5Y1tiXSApIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeExUeSA9IHhjW2JdIDwgeWNbYl07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8geCA8IHk/IFBvaW50IHhjIHRvIHRoZSBhcnJheSBvZiB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgICAgICAgaWYgKHhMVHkpIHQgPSB4YywgeGMgPSB5YywgeWMgPSB0LCB5LnMgPSAteS5zO1xyXG5cclxuICAgICAgICAgICAgYiA9ICggaiA9IHljLmxlbmd0aCApIC0gKCBpID0geGMubGVuZ3RoICk7XHJcblxyXG4gICAgICAgICAgICAvLyBBcHBlbmQgemVyb3MgdG8geGMgaWYgc2hvcnRlci5cclxuICAgICAgICAgICAgLy8gTm8gbmVlZCB0byBhZGQgemVyb3MgdG8geWMgaWYgc2hvcnRlciBhcyBzdWJ0cmFjdCBvbmx5IG5lZWRzIHRvIHN0YXJ0IGF0IHljLmxlbmd0aC5cclxuICAgICAgICAgICAgaWYgKCBiID4gMCApIGZvciAoIDsgYi0tOyB4Y1tpKytdID0gMCApO1xyXG4gICAgICAgICAgICBiID0gQkFTRSAtIDE7XHJcblxyXG4gICAgICAgICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICAgICAgICBmb3IgKCA7IGogPiBhOyApIHtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIHhjWy0tal0gPCB5Y1tqXSApIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKCBpID0gajsgaSAmJiAheGNbLS1pXTsgeGNbaV0gPSBiICk7XHJcbiAgICAgICAgICAgICAgICAgICAgLS14Y1tpXTtcclxuICAgICAgICAgICAgICAgICAgICB4Y1tqXSArPSBCQVNFO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICAgICAgICBmb3IgKCA7IHhjWzBdID09IDA7IHhjLnNwbGljZSgwLCAxKSwgLS15ZSApO1xyXG5cclxuICAgICAgICAgICAgLy8gWmVybz9cclxuICAgICAgICAgICAgaWYgKCAheGNbMF0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRm9sbG93aW5nIElFRUUgNzU0ICgyMDA4KSA2LjMsXHJcbiAgICAgICAgICAgICAgICAvLyBuIC0gbiA9ICswICBidXQgIG4gLSBuID0gLTAgIHdoZW4gcm91bmRpbmcgdG93YXJkcyAtSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAgICB5LnMgPSBST1VORElOR19NT0RFID09IDMgPyAtMSA6IDE7XHJcbiAgICAgICAgICAgICAgICB5LmMgPSBbIHkuZSA9IDAgXTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB5O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciBJbmZpbml0eSBhcyAreCAtICt5ICE9IEluZmluaXR5ICYmIC14IC0gLXkgIT0gSW5maW5pdHlcclxuICAgICAgICAgICAgLy8gZm9yIGZpbml0ZSB4IGFuZCB5LlxyXG4gICAgICAgICAgICByZXR1cm4gbm9ybWFsaXNlKCB5LCB4YywgeWUgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgIG4gJSAwID0gIE5cclxuICAgICAgICAgKiAgIG4gJSBOID0gIE5cclxuICAgICAgICAgKiAgIG4gJSBJID0gIG5cclxuICAgICAgICAgKiAgIDAgJSBuID0gIDBcclxuICAgICAgICAgKiAgLTAgJSBuID0gLTBcclxuICAgICAgICAgKiAgIDAgJSAwID0gIE5cclxuICAgICAgICAgKiAgIDAgJSBOID0gIE5cclxuICAgICAgICAgKiAgIDAgJSBJID0gIDBcclxuICAgICAgICAgKiAgIE4gJSBuID0gIE5cclxuICAgICAgICAgKiAgIE4gJSAwID0gIE5cclxuICAgICAgICAgKiAgIE4gJSBOID0gIE5cclxuICAgICAgICAgKiAgIE4gJSBJID0gIE5cclxuICAgICAgICAgKiAgIEkgJSBuID0gIE5cclxuICAgICAgICAgKiAgIEkgJSAwID0gIE5cclxuICAgICAgICAgKiAgIEkgJSBOID0gIE5cclxuICAgICAgICAgKiAgIEkgJSBJID0gIE5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIG1vZHVsbyB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYikuIFRoZSByZXN1bHQgZGVwZW5kcyBvbiB0aGUgdmFsdWUgb2YgTU9EVUxPX01PREUuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5tb2R1bG8gPSBQLm1vZCA9IGZ1bmN0aW9uICggeSwgYiApIHtcclxuICAgICAgICAgICAgdmFyIHEsIHMsXHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlkID0gMTE7XHJcbiAgICAgICAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKCB5LCBiICk7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXR1cm4gTmFOIGlmIHggaXMgSW5maW5pdHkgb3IgTmFOLCBvciB5IGlzIE5hTiBvciB6ZXJvLlxyXG4gICAgICAgICAgICBpZiAoICF4LmMgfHwgIXkucyB8fCB5LmMgJiYgIXkuY1swXSApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKE5hTik7XHJcblxyXG4gICAgICAgICAgICAvLyBSZXR1cm4geCBpZiB5IGlzIEluZmluaXR5IG9yIHggaXMgemVyby5cclxuICAgICAgICAgICAgfSBlbHNlIGlmICggIXkuYyB8fCB4LmMgJiYgIXguY1swXSApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKHgpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIE1PRFVMT19NT0RFID09IDkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRXVjbGlkaWFuIGRpdmlzaW9uOiBxID0gc2lnbih5KSAqIGZsb29yKHggLyBhYnMoeSkpXHJcbiAgICAgICAgICAgICAgICAvLyByID0geCAtIHF5ICAgIHdoZXJlICAwIDw9IHIgPCBhYnMoeSlcclxuICAgICAgICAgICAgICAgIHMgPSB5LnM7XHJcbiAgICAgICAgICAgICAgICB5LnMgPSAxO1xyXG4gICAgICAgICAgICAgICAgcSA9IGRpdiggeCwgeSwgMCwgMyApO1xyXG4gICAgICAgICAgICAgICAgeS5zID0gcztcclxuICAgICAgICAgICAgICAgIHEucyAqPSBzO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgcSA9IGRpdiggeCwgeSwgMCwgTU9EVUxPX01PREUgKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHgubWludXMoIHEudGltZXMoeSkgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBuZWdhdGVkLFxyXG4gICAgICAgICAqIGkuZS4gbXVsdGlwbGllZCBieSAtMS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLm5lZ2F0ZWQgPSBQLm5lZyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHggPSBuZXcgQmlnTnVtYmVyKHRoaXMpO1xyXG4gICAgICAgICAgICB4LnMgPSAteC5zIHx8IG51bGw7XHJcbiAgICAgICAgICAgIHJldHVybiB4O1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqICBuICsgMCA9IG5cclxuICAgICAgICAgKiAgbiArIE4gPSBOXHJcbiAgICAgICAgICogIG4gKyBJID0gSVxyXG4gICAgICAgICAqICAwICsgbiA9IG5cclxuICAgICAgICAgKiAgMCArIDAgPSAwXHJcbiAgICAgICAgICogIDAgKyBOID0gTlxyXG4gICAgICAgICAqICAwICsgSSA9IElcclxuICAgICAgICAgKiAgTiArIG4gPSBOXHJcbiAgICAgICAgICogIE4gKyAwID0gTlxyXG4gICAgICAgICAqICBOICsgTiA9IE5cclxuICAgICAgICAgKiAgTiArIEkgPSBOXHJcbiAgICAgICAgICogIEkgKyBuID0gSVxyXG4gICAgICAgICAqICBJICsgMCA9IElcclxuICAgICAgICAgKiAgSSArIE4gPSBOXHJcbiAgICAgICAgICogIEkgKyBJID0gSVxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcGx1cyB0aGUgdmFsdWUgb2ZcclxuICAgICAgICAgKiBCaWdOdW1iZXIoeSwgYikuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5wbHVzID0gUC5hZGQgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIHZhciB0LFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICBhID0geC5zO1xyXG5cclxuICAgICAgICAgICAgaWQgPSAxMjtcclxuICAgICAgICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoIHksIGIgKTtcclxuICAgICAgICAgICAgYiA9IHkucztcclxuXHJcbiAgICAgICAgICAgIC8vIEVpdGhlciBOYU4/XHJcbiAgICAgICAgICAgIGlmICggIWEgfHwgIWIgKSByZXR1cm4gbmV3IEJpZ051bWJlcihOYU4pO1xyXG5cclxuICAgICAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgICAgICAgaWYgKCBhICE9IGIgKSB7XHJcbiAgICAgICAgICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICAgICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB2YXIgeGUgPSB4LmUgLyBMT0dfQkFTRSxcclxuICAgICAgICAgICAgICAgIHllID0geS5lIC8gTE9HX0JBU0UsXHJcbiAgICAgICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgICAgICAgaWYgKCAheGUgfHwgIXllICkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIFJldHVybiDCsUluZmluaXR5IGlmIGVpdGhlciDCsUluZmluaXR5LlxyXG4gICAgICAgICAgICAgICAgaWYgKCAheGMgfHwgIXljICkgcmV0dXJuIG5ldyBCaWdOdW1iZXIoIGEgLyAwICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4geSBpZiB5IGlzIG5vbi16ZXJvLCB4IGlmIHggaXMgbm9uLXplcm8sIG9yIHplcm8gaWYgYm90aCBhcmUgemVyby5cclxuICAgICAgICAgICAgICAgIGlmICggIXhjWzBdIHx8ICF5Y1swXSApIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnTnVtYmVyKCB4Y1swXSA/IHggOiBhICogMCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB4ZSA9IGJpdEZsb29yKHhlKTtcclxuICAgICAgICAgICAgeWUgPSBiaXRGbG9vcih5ZSk7XHJcbiAgICAgICAgICAgIHhjID0geGMuc2xpY2UoKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFByZXBlbmQgemVyb3MgdG8gZXF1YWxpc2UgZXhwb25lbnRzLiBGYXN0ZXIgdG8gdXNlIHJldmVyc2UgdGhlbiBkbyB1bnNoaWZ0cy5cclxuICAgICAgICAgICAgaWYgKCBhID0geGUgLSB5ZSApIHtcclxuICAgICAgICAgICAgICAgIGlmICggYSA+IDAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgICAgICAgICAgICB0ID0geWM7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgICAgICAgICAgICB0ID0geGM7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKCA7IGEtLTsgdC5wdXNoKDApICk7XHJcbiAgICAgICAgICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgYSA9IHhjLmxlbmd0aDtcclxuICAgICAgICAgICAgYiA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAgIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXksIGFuZCBiIHRvIHRoZSBzaG9ydGVyIGxlbmd0aC5cclxuICAgICAgICAgICAgaWYgKCBhIC0gYiA8IDAgKSB0ID0geWMsIHljID0geGMsIHhjID0gdCwgYiA9IGE7XHJcblxyXG4gICAgICAgICAgICAvLyBPbmx5IHN0YXJ0IGFkZGluZyBhdCB5Yy5sZW5ndGggLSAxIGFzIHRoZSBmdXJ0aGVyIGRpZ2l0cyBvZiB4YyBjYW4gYmUgaWdub3JlZC5cclxuICAgICAgICAgICAgZm9yICggYSA9IDA7IGI7ICkge1xyXG4gICAgICAgICAgICAgICAgYSA9ICggeGNbLS1iXSA9IHhjW2JdICsgeWNbYl0gKyBhICkgLyBCQVNFIHwgMDtcclxuICAgICAgICAgICAgICAgIHhjW2JdID0gQkFTRSA9PT0geGNbYl0gPyAwIDogeGNbYl0gJSBCQVNFO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoYSkge1xyXG4gICAgICAgICAgICAgICAgeGMgPSBbYV0uY29uY2F0KHhjKTtcclxuICAgICAgICAgICAgICAgICsreWU7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIHplcm8sIGFzICt4ICsgK3kgIT0gMCAmJiAteCArIC15ICE9IDBcclxuICAgICAgICAgICAgLy8geWUgPSBNQVhfRVhQICsgMSBwb3NzaWJsZVxyXG4gICAgICAgICAgICByZXR1cm4gbm9ybWFsaXNlKCB5LCB4YywgeWUgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gdGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHMgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogW3pdIHtib29sZWFufG51bWJlcn0gV2hldGhlciB0byBjb3VudCBpbnRlZ2VyLXBhcnQgdHJhaWxpbmcgemVyb3M6IHRydWUsIGZhbHNlLCAxIG9yIDAuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5wcmVjaXNpb24gPSBQLnNkID0gZnVuY3Rpb24gKHopIHtcclxuICAgICAgICAgICAgdmFyIG4sIHYsXHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIGMgPSB4LmM7XHJcblxyXG4gICAgICAgICAgICAvLyAncHJlY2lzaW9uKCkgYXJndW1lbnQgbm90IGEgYm9vbGVhbiBvciBiaW5hcnkgZGlnaXQ6IHt6fSdcclxuICAgICAgICAgICAgaWYgKCB6ICE9IG51bGwgJiYgeiAhPT0gISF6ICYmIHogIT09IDEgJiYgeiAhPT0gMCApIHtcclxuICAgICAgICAgICAgICAgIGlmIChFUlJPUlMpIHJhaXNlKCAxMywgJ2FyZ3VtZW50JyArIG5vdEJvb2wsIHogKTtcclxuICAgICAgICAgICAgICAgIGlmICggeiAhPSAhIXogKSB6ID0gbnVsbDtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKCAhYyApIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICB2ID0gYy5sZW5ndGggLSAxO1xyXG4gICAgICAgICAgICBuID0gdiAqIExPR19CQVNFICsgMTtcclxuXHJcbiAgICAgICAgICAgIGlmICggdiA9IGNbdl0gKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gU3VidHJhY3QgdGhlIG51bWJlciBvZiB0cmFpbGluZyB6ZXJvcyBvZiB0aGUgbGFzdCBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAgZm9yICggOyB2ICUgMTAgPT0gMDsgdiAvPSAxMCwgbi0tICk7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gQWRkIHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIHRoZSBmaXJzdCBlbGVtZW50LlxyXG4gICAgICAgICAgICAgICAgZm9yICggdiA9IGNbMF07IHYgPj0gMTA7IHYgLz0gMTAsIG4rKyApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAoIHogJiYgeC5lICsgMSA+IG4gKSBuID0geC5lICsgMTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHJvdW5kZWQgdG8gYSBtYXhpbXVtIG9mXHJcbiAgICAgICAgICogZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3IgdG8gMCBhbmQgUk9VTkRJTkdfTU9ERSByZXNwZWN0aXZlbHkgaWZcclxuICAgICAgICAgKiBvbWl0dGVkLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICdyb3VuZCgpIGRlY2ltYWwgcGxhY2VzIG91dCBvZiByYW5nZToge2RwfSdcclxuICAgICAgICAgKiAncm91bmQoKSBkZWNpbWFsIHBsYWNlcyBub3QgYW4gaW50ZWdlcjoge2RwfSdcclxuICAgICAgICAgKiAncm91bmQoKSByb3VuZGluZyBtb2RlIG5vdCBhbiBpbnRlZ2VyOiB7cm19J1xyXG4gICAgICAgICAqICdyb3VuZCgpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAucm91bmQgPSBmdW5jdGlvbiAoIGRwLCBybSApIHtcclxuICAgICAgICAgICAgdmFyIG4gPSBuZXcgQmlnTnVtYmVyKHRoaXMpO1xyXG5cclxuICAgICAgICAgICAgaWYgKCBkcCA9PSBudWxsIHx8IGlzVmFsaWRJbnQoIGRwLCAwLCBNQVgsIDE1ICkgKSB7XHJcbiAgICAgICAgICAgICAgICByb3VuZCggbiwgfn5kcCArIHRoaXMuZSArIDEsIHJtID09IG51bGwgfHxcclxuICAgICAgICAgICAgICAgICAgIWlzVmFsaWRJbnQoIHJtLCAwLCA4LCAxNSwgcm91bmRpbmdNb2RlICkgPyBST1VORElOR19NT0RFIDogcm0gfCAwICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHNoaWZ0ZWQgYnkgayBwbGFjZXNcclxuICAgICAgICAgKiAocG93ZXJzIG9mIDEwKS4gU2hpZnQgdG8gdGhlIHJpZ2h0IGlmIG4gPiAwLCBhbmQgdG8gdGhlIGxlZnQgaWYgbiA8IDAuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBrIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfU0FGRV9JTlRFR0VSIHRvIE1BWF9TQUZFX0lOVEVHRVIgaW5jbHVzaXZlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogSWYgayBpcyBvdXQgb2YgcmFuZ2UgYW5kIEVSUk9SUyBpcyBmYWxzZSwgdGhlIHJlc3VsdCB3aWxsIGJlIMKxMCBpZiBrIDwgMCwgb3IgwrFJbmZpbml0eVxyXG4gICAgICAgICAqIG90aGVyd2lzZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICdzaGlmdCgpIGFyZ3VtZW50IG5vdCBhbiBpbnRlZ2VyOiB7a30nXHJcbiAgICAgICAgICogJ3NoaWZ0KCkgYXJndW1lbnQgb3V0IG9mIHJhbmdlOiB7a30nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC5zaGlmdCA9IGZ1bmN0aW9uIChrKSB7XHJcbiAgICAgICAgICAgIHZhciBuID0gdGhpcztcclxuICAgICAgICAgICAgcmV0dXJuIGlzVmFsaWRJbnQoIGssIC1NQVhfU0FGRV9JTlRFR0VSLCBNQVhfU0FGRV9JTlRFR0VSLCAxNiwgJ2FyZ3VtZW50JyApXHJcblxyXG4gICAgICAgICAgICAgIC8vIGsgPCAxZSsyMSwgb3IgdHJ1bmNhdGUoaykgd2lsbCBwcm9kdWNlIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAgICAgID8gbi50aW1lcyggJzFlJyArIHRydW5jYXRlKGspIClcclxuICAgICAgICAgICAgICA6IG5ldyBCaWdOdW1iZXIoIG4uYyAmJiBuLmNbMF0gJiYgKCBrIDwgLU1BWF9TQUZFX0lOVEVHRVIgfHwgayA+IE1BWF9TQUZFX0lOVEVHRVIgKVxyXG4gICAgICAgICAgICAgICAgPyBuLnMgKiAoIGsgPCAwID8gMCA6IDEgLyAwIClcclxuICAgICAgICAgICAgICAgIDogbiApO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqICBzcXJ0KC1uKSA9ICBOXHJcbiAgICAgICAgICogIHNxcnQoIE4pID0gIE5cclxuICAgICAgICAgKiAgc3FydCgtSSkgPSAgTlxyXG4gICAgICAgICAqICBzcXJ0KCBJKSA9ICBJXHJcbiAgICAgICAgICogIHNxcnQoIDApID0gIDBcclxuICAgICAgICAgKiAgc3FydCgtMCkgPSAtMFxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgc3F1YXJlIHJvb3Qgb2YgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLFxyXG4gICAgICAgICAqIHJvdW5kZWQgYWNjb3JkaW5nIHRvIERFQ0lNQUxfUExBQ0VTIGFuZCBST1VORElOR19NT0RFLlxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAuc3F1YXJlUm9vdCA9IFAuc3FydCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIG0sIG4sIHIsIHJlcCwgdCxcclxuICAgICAgICAgICAgICAgIHggPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgYyA9IHguYyxcclxuICAgICAgICAgICAgICAgIHMgPSB4LnMsXHJcbiAgICAgICAgICAgICAgICBlID0geC5lLFxyXG4gICAgICAgICAgICAgICAgZHAgPSBERUNJTUFMX1BMQUNFUyArIDQsXHJcbiAgICAgICAgICAgICAgICBoYWxmID0gbmV3IEJpZ051bWJlcignMC41Jyk7XHJcblxyXG4gICAgICAgICAgICAvLyBOZWdhdGl2ZS9OYU4vSW5maW5pdHkvemVybz9cclxuICAgICAgICAgICAgaWYgKCBzICE9PSAxIHx8ICFjIHx8ICFjWzBdICkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoICFzIHx8IHMgPCAwICYmICggIWMgfHwgY1swXSApID8gTmFOIDogYyA/IHggOiAxIC8gMCApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBJbml0aWFsIGVzdGltYXRlLlxyXG4gICAgICAgICAgICBzID0gTWF0aC5zcXJ0KCAreCApO1xyXG5cclxuICAgICAgICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgZXhwb25lbnQgb2YgdGhlIHJlc3VsdC5cclxuICAgICAgICAgICAgaWYgKCBzID09IDAgfHwgcyA9PSAxIC8gMCApIHtcclxuICAgICAgICAgICAgICAgIG4gPSBjb2VmZlRvU3RyaW5nKGMpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCAoIG4ubGVuZ3RoICsgZSApICUgMiA9PSAwICkgbiArPSAnMCc7XHJcbiAgICAgICAgICAgICAgICBzID0gTWF0aC5zcXJ0KG4pO1xyXG4gICAgICAgICAgICAgICAgZSA9IGJpdEZsb29yKCAoIGUgKyAxICkgLyAyICkgLSAoIGUgPCAwIHx8IGUgJSAyICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBzID09IDEgLyAwICkge1xyXG4gICAgICAgICAgICAgICAgICAgIG4gPSAnMWUnICsgZTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbiA9IHMudG9FeHBvbmVudGlhbCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIG4gPSBuLnNsaWNlKCAwLCBuLmluZGV4T2YoJ2UnKSArIDEgKSArIGU7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgciA9IG5ldyBCaWdOdW1iZXIobik7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByID0gbmV3IEJpZ051bWJlciggcyArICcnICk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIENoZWNrIGZvciB6ZXJvLlxyXG4gICAgICAgICAgICAvLyByIGNvdWxkIGJlIHplcm8gaWYgTUlOX0VYUCBpcyBjaGFuZ2VkIGFmdGVyIHRoZSB0aGlzIHZhbHVlIHdhcyBjcmVhdGVkLlxyXG4gICAgICAgICAgICAvLyBUaGlzIHdvdWxkIGNhdXNlIGEgZGl2aXNpb24gYnkgemVybyAoeC90KSBhbmQgaGVuY2UgSW5maW5pdHkgYmVsb3csIHdoaWNoIHdvdWxkIGNhdXNlXHJcbiAgICAgICAgICAgIC8vIGNvZWZmVG9TdHJpbmcgdG8gdGhyb3cuXHJcbiAgICAgICAgICAgIGlmICggci5jWzBdICkge1xyXG4gICAgICAgICAgICAgICAgZSA9IHIuZTtcclxuICAgICAgICAgICAgICAgIHMgPSBlICsgZHA7XHJcbiAgICAgICAgICAgICAgICBpZiAoIHMgPCAzICkgcyA9IDA7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTmV3dG9uLVJhcGhzb24gaXRlcmF0aW9uLlxyXG4gICAgICAgICAgICAgICAgZm9yICggOyA7ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHQgPSByO1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSBoYWxmLnRpbWVzKCB0LnBsdXMoIGRpdiggeCwgdCwgZHAsIDEgKSApICk7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggY29lZmZUb1N0cmluZyggdC5jICAgKS5zbGljZSggMCwgcyApID09PSAoIG4gPVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgY29lZmZUb1N0cmluZyggci5jICkgKS5zbGljZSggMCwgcyApICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGV4cG9uZW50IG9mIHIgbWF5IGhlcmUgYmUgb25lIGxlc3MgdGhhbiB0aGUgZmluYWwgcmVzdWx0IGV4cG9uZW50LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBlLmcgMC4wMDA5OTk5IChlLTQpIC0tPiAwLjAwMSAoZS0zKSwgc28gYWRqdXN0IHMgc28gdGhlIHJvdW5kaW5nIGRpZ2l0c1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBhcmUgaW5kZXhlZCBjb3JyZWN0bHkuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICggci5lIDwgZSApIC0tcztcclxuICAgICAgICAgICAgICAgICAgICAgICAgbiA9IG4uc2xpY2UoIHMgLSAzLCBzICsgMSApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVGhlIDR0aCByb3VuZGluZyBkaWdpdCBtYXkgYmUgaW4gZXJyb3IgYnkgLTEgc28gaWYgdGhlIDQgcm91bmRpbmcgZGlnaXRzXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGFyZSA5OTk5IG9yIDQ5OTkgKGkuZS4gYXBwcm9hY2hpbmcgYSByb3VuZGluZyBib3VuZGFyeSkgY29udGludWUgdGhlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGl0ZXJhdGlvbi5cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCBuID09ICc5OTk5JyB8fCAhcmVwICYmIG4gPT0gJzQ5OTknICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIE9uIHRoZSBmaXJzdCBpdGVyYXRpb24gb25seSwgY2hlY2sgdG8gc2VlIGlmIHJvdW5kaW5nIHVwIGdpdmVzIHRoZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZXhhY3QgcmVzdWx0IGFzIHRoZSBuaW5lcyBtYXkgaW5maW5pdGVseSByZXBlYXQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoICFyZXAgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91bmQoIHQsIHQuZSArIERFQ0lNQUxfUExBQ0VTICsgMiwgMCApO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHQudGltZXModCkuZXEoeCkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHIgPSB0O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZHAgKz0gNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHMgKz0gNDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcCA9IDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgcm91bmRpbmcgZGlnaXRzIGFyZSBudWxsLCAwezAsNH0gb3IgNTB7MCwzfSwgY2hlY2sgZm9yIGV4YWN0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyByZXN1bHQuIElmIG5vdCwgdGhlbiB0aGVyZSBhcmUgZnVydGhlciBkaWdpdHMgYW5kIG0gd2lsbCBiZSB0cnV0aHkuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoICErbiB8fCAhK24uc2xpY2UoMSkgJiYgbi5jaGFyQXQoMCkgPT0gJzUnICkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUcnVuY2F0ZSB0byB0aGUgZmlyc3Qgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm91bmQoIHIsIHIuZSArIERFQ0lNQUxfUExBQ0VTICsgMiwgMSApO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0gPSAhci50aW1lcyhyKS5lcSh4KTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHJvdW5kKCByLCByLmUgKyBERUNJTUFMX1BMQUNFUyArIDEsIFJPVU5ESU5HX01PREUsIG0gKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiAgbiAqIDAgPSAwXHJcbiAgICAgICAgICogIG4gKiBOID0gTlxyXG4gICAgICAgICAqICBuICogSSA9IElcclxuICAgICAgICAgKiAgMCAqIG4gPSAwXHJcbiAgICAgICAgICogIDAgKiAwID0gMFxyXG4gICAgICAgICAqICAwICogTiA9IE5cclxuICAgICAgICAgKiAgMCAqIEkgPSBOXHJcbiAgICAgICAgICogIE4gKiBuID0gTlxyXG4gICAgICAgICAqICBOICogMCA9IE5cclxuICAgICAgICAgKiAgTiAqIE4gPSBOXHJcbiAgICAgICAgICogIE4gKiBJID0gTlxyXG4gICAgICAgICAqICBJICogbiA9IElcclxuICAgICAgICAgKiAgSSAqIDAgPSBOXHJcbiAgICAgICAgICogIEkgKiBOID0gTlxyXG4gICAgICAgICAqICBJICogSSA9IElcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHRpbWVzIHRoZSB2YWx1ZSBvZlxyXG4gICAgICAgICAqIEJpZ051bWJlcih5LCBiKS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnRpbWVzID0gUC5tdWwgPSBmdW5jdGlvbiAoIHksIGIgKSB7XHJcbiAgICAgICAgICAgIHZhciBjLCBlLCBpLCBqLCBrLCBtLCB4Y0wsIHhsbywgeGhpLCB5Y0wsIHlsbywgeWhpLCB6YyxcclxuICAgICAgICAgICAgICAgIGJhc2UsIHNxcnRCYXNlLFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgICAgIHljID0gKCBpZCA9IDE3LCB5ID0gbmV3IEJpZ051bWJlciggeSwgYiApICkuYztcclxuXHJcbiAgICAgICAgICAgIC8vIEVpdGhlciBOYU4sIMKxSW5maW5pdHkgb3IgwrEwP1xyXG4gICAgICAgICAgICBpZiAoICF4YyB8fCAheWMgfHwgIXhjWzBdIHx8ICF5Y1swXSApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBSZXR1cm4gTmFOIGlmIGVpdGhlciBpcyBOYU4sIG9yIG9uZSBpcyAwIGFuZCB0aGUgb3RoZXIgaXMgSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAgICBpZiAoICF4LnMgfHwgIXkucyB8fCB4YyAmJiAheGNbMF0gJiYgIXljIHx8IHljICYmICF5Y1swXSAmJiAheGMgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeS5jID0geS5lID0geS5zID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeS5zICo9IHgucztcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gUmV0dXJuIMKxSW5maW5pdHkgaWYgZWl0aGVyIGlzIMKxSW5maW5pdHkuXHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCAheGMgfHwgIXljICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5LmMgPSB5LmUgPSBudWxsO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyBSZXR1cm4gwrEwIGlmIGVpdGhlciBpcyDCsTAuXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgeS5jID0gWzBdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB5LmUgPSAwO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4geTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZSA9IGJpdEZsb29yKCB4LmUgLyBMT0dfQkFTRSApICsgYml0Rmxvb3IoIHkuZSAvIExPR19CQVNFICk7XHJcbiAgICAgICAgICAgIHkucyAqPSB4LnM7XHJcbiAgICAgICAgICAgIHhjTCA9IHhjLmxlbmd0aDtcclxuICAgICAgICAgICAgeWNMID0geWMubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgLy8gRW5zdXJlIHhjIHBvaW50cyB0byBsb25nZXIgYXJyYXkgYW5kIHhjTCB0byBpdHMgbGVuZ3RoLlxyXG4gICAgICAgICAgICBpZiAoIHhjTCA8IHljTCApIHpjID0geGMsIHhjID0geWMsIHljID0gemMsIGkgPSB4Y0wsIHhjTCA9IHljTCwgeWNMID0gaTtcclxuXHJcbiAgICAgICAgICAgIC8vIEluaXRpYWxpc2UgdGhlIHJlc3VsdCBhcnJheSB3aXRoIHplcm9zLlxyXG4gICAgICAgICAgICBmb3IgKCBpID0geGNMICsgeWNMLCB6YyA9IFtdOyBpLS07IHpjLnB1c2goMCkgKTtcclxuXHJcbiAgICAgICAgICAgIGJhc2UgPSBCQVNFO1xyXG4gICAgICAgICAgICBzcXJ0QmFzZSA9IFNRUlRfQkFTRTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoIGkgPSB5Y0w7IC0taSA+PSAwOyApIHtcclxuICAgICAgICAgICAgICAgIGMgPSAwO1xyXG4gICAgICAgICAgICAgICAgeWxvID0geWNbaV0gJSBzcXJ0QmFzZTtcclxuICAgICAgICAgICAgICAgIHloaSA9IHljW2ldIC8gc3FydEJhc2UgfCAwO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAoIGsgPSB4Y0wsIGogPSBpICsgazsgaiA+IGk7ICkge1xyXG4gICAgICAgICAgICAgICAgICAgIHhsbyA9IHhjWy0ta10gJSBzcXJ0QmFzZTtcclxuICAgICAgICAgICAgICAgICAgICB4aGkgPSB4Y1trXSAvIHNxcnRCYXNlIHwgMDtcclxuICAgICAgICAgICAgICAgICAgICBtID0geWhpICogeGxvICsgeGhpICogeWxvO1xyXG4gICAgICAgICAgICAgICAgICAgIHhsbyA9IHlsbyAqIHhsbyArICggKCBtICUgc3FydEJhc2UgKSAqIHNxcnRCYXNlICkgKyB6Y1tqXSArIGM7XHJcbiAgICAgICAgICAgICAgICAgICAgYyA9ICggeGxvIC8gYmFzZSB8IDAgKSArICggbSAvIHNxcnRCYXNlIHwgMCApICsgeWhpICogeGhpO1xyXG4gICAgICAgICAgICAgICAgICAgIHpjW2otLV0gPSB4bG8gJSBiYXNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHpjW2pdID0gYztcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaWYgKGMpIHtcclxuICAgICAgICAgICAgICAgICsrZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHpjLnNwbGljZSgwLCAxKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgcmV0dXJuIG5vcm1hbGlzZSggeSwgemMsIGUgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciByb3VuZGVkIHRvIGEgbWF4aW11bSBvZlxyXG4gICAgICAgICAqIHNkIHNpZ25pZmljYW50IGRpZ2l0cyB1c2luZyByb3VuZGluZyBtb2RlIHJtLCBvciBST1VORElOR19NT0RFIGlmIHJtIGlzIG9taXR0ZWQuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICd0b0RpZ2l0cygpIHByZWNpc2lvbiBvdXQgb2YgcmFuZ2U6IHtzZH0nXHJcbiAgICAgICAgICogJ3RvRGlnaXRzKCkgcHJlY2lzaW9uIG5vdCBhbiBpbnRlZ2VyOiB7c2R9J1xyXG4gICAgICAgICAqICd0b0RpZ2l0cygpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXHJcbiAgICAgICAgICogJ3RvRGlnaXRzKCkgcm91bmRpbmcgbW9kZSBvdXQgb2YgcmFuZ2U6IHtybX0nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b0RpZ2l0cyA9IGZ1bmN0aW9uICggc2QsIHJtICkge1xyXG4gICAgICAgICAgICB2YXIgbiA9IG5ldyBCaWdOdW1iZXIodGhpcyk7XHJcbiAgICAgICAgICAgIHNkID0gc2QgPT0gbnVsbCB8fCAhaXNWYWxpZEludCggc2QsIDEsIE1BWCwgMTgsICdwcmVjaXNpb24nICkgPyBudWxsIDogc2QgfCAwO1xyXG4gICAgICAgICAgICBybSA9IHJtID09IG51bGwgfHwgIWlzVmFsaWRJbnQoIHJtLCAwLCA4LCAxOCwgcm91bmRpbmdNb2RlICkgPyBST1VORElOR19NT0RFIDogcm0gfCAwO1xyXG4gICAgICAgICAgICByZXR1cm4gc2QgPyByb3VuZCggbiwgc2QsIHJtICkgOiBuO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGluIGV4cG9uZW50aWFsIG5vdGF0aW9uIGFuZFxyXG4gICAgICAgICAqIHJvdW5kZWQgdXNpbmcgUk9VTkRJTkdfTU9ERSB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAndG9FeHBvbmVudGlhbCgpIGRlY2ltYWwgcGxhY2VzIG5vdCBhbiBpbnRlZ2VyOiB7ZHB9J1xyXG4gICAgICAgICAqICd0b0V4cG9uZW50aWFsKCkgZGVjaW1hbCBwbGFjZXMgb3V0IG9mIHJhbmdlOiB7ZHB9J1xyXG4gICAgICAgICAqICd0b0V4cG9uZW50aWFsKCkgcm91bmRpbmcgbW9kZSBub3QgYW4gaW50ZWdlcjoge3JtfSdcclxuICAgICAgICAgKiAndG9FeHBvbmVudGlhbCgpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9FeHBvbmVudGlhbCA9IGZ1bmN0aW9uICggZHAsIHJtICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0KCB0aGlzLFxyXG4gICAgICAgICAgICAgIGRwICE9IG51bGwgJiYgaXNWYWxpZEludCggZHAsIDAsIE1BWCwgMTkgKSA/IH5+ZHAgKyAxIDogbnVsbCwgcm0sIDE5ICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaW4gZml4ZWQtcG9pbnQgbm90YXRpb24gcm91bmRpbmdcclxuICAgICAgICAgKiB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcyB1c2luZyByb3VuZGluZyBtb2RlIHJtLCBvciBST1VORElOR19NT0RFIGlmIHJtIGlzIG9taXR0ZWQuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBOb3RlOiBhcyB3aXRoIEphdmFTY3JpcHQncyBudW1iZXIgdHlwZSwgKC0wKS50b0ZpeGVkKDApIGlzICcwJyxcclxuICAgICAgICAgKiBidXQgZS5nLiAoLTAuMDAwMDEpLnRvRml4ZWQoMCkgaXMgJy0wJy5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAndG9GaXhlZCgpIGRlY2ltYWwgcGxhY2VzIG5vdCBhbiBpbnRlZ2VyOiB7ZHB9J1xyXG4gICAgICAgICAqICd0b0ZpeGVkKCkgZGVjaW1hbCBwbGFjZXMgb3V0IG9mIHJhbmdlOiB7ZHB9J1xyXG4gICAgICAgICAqICd0b0ZpeGVkKCkgcm91bmRpbmcgbW9kZSBub3QgYW4gaW50ZWdlcjoge3JtfSdcclxuICAgICAgICAgKiAndG9GaXhlZCgpIHJvdW5kaW5nIG1vZGUgb3V0IG9mIHJhbmdlOiB7cm19J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9GaXhlZCA9IGZ1bmN0aW9uICggZHAsIHJtICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0KCB0aGlzLCBkcCAhPSBudWxsICYmIGlzVmFsaWRJbnQoIGRwLCAwLCBNQVgsIDIwIClcclxuICAgICAgICAgICAgICA/IH5+ZHAgKyB0aGlzLmUgKyAxIDogbnVsbCwgcm0sIDIwICk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaW4gZml4ZWQtcG9pbnQgbm90YXRpb24gcm91bmRlZFxyXG4gICAgICAgICAqIHVzaW5nIHJtIG9yIFJPVU5ESU5HX01PREUgdG8gZHAgZGVjaW1hbCBwbGFjZXMsIGFuZCBmb3JtYXR0ZWQgYWNjb3JkaW5nIHRvIHRoZSBwcm9wZXJ0aWVzXHJcbiAgICAgICAgICogb2YgdGhlIEZPUk1BVCBvYmplY3QgKHNlZSBCaWdOdW1iZXIuY29uZmlnKS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIEZPUk1BVCA9IHtcclxuICAgICAgICAgKiAgICAgIGRlY2ltYWxTZXBhcmF0b3IgOiAnLicsXHJcbiAgICAgICAgICogICAgICBncm91cFNlcGFyYXRvciA6ICcsJyxcclxuICAgICAgICAgKiAgICAgIGdyb3VwU2l6ZSA6IDMsXHJcbiAgICAgICAgICogICAgICBzZWNvbmRhcnlHcm91cFNpemUgOiAwLFxyXG4gICAgICAgICAqICAgICAgZnJhY3Rpb25Hcm91cFNlcGFyYXRvciA6ICdcXHhBMCcsICAgIC8vIG5vbi1icmVha2luZyBzcGFjZVxyXG4gICAgICAgICAqICAgICAgZnJhY3Rpb25Hcm91cFNpemUgOiAwXHJcbiAgICAgICAgICogfTtcclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFtkcF0ge251bWJlcn0gRGVjaW1hbCBwbGFjZXMuIEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiAndG9Gb3JtYXQoKSBkZWNpbWFsIHBsYWNlcyBub3QgYW4gaW50ZWdlcjoge2RwfSdcclxuICAgICAgICAgKiAndG9Gb3JtYXQoKSBkZWNpbWFsIHBsYWNlcyBvdXQgb2YgcmFuZ2U6IHtkcH0nXHJcbiAgICAgICAgICogJ3RvRm9ybWF0KCkgcm91bmRpbmcgbW9kZSBub3QgYW4gaW50ZWdlcjoge3JtfSdcclxuICAgICAgICAgKiAndG9Gb3JtYXQoKSByb3VuZGluZyBtb2RlIG91dCBvZiByYW5nZToge3JtfSdcclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnRvRm9ybWF0ID0gZnVuY3Rpb24gKCBkcCwgcm0gKSB7XHJcbiAgICAgICAgICAgIHZhciBzdHIgPSBmb3JtYXQoIHRoaXMsIGRwICE9IG51bGwgJiYgaXNWYWxpZEludCggZHAsIDAsIE1BWCwgMjEgKVxyXG4gICAgICAgICAgICAgID8gfn5kcCArIHRoaXMuZSArIDEgOiBudWxsLCBybSwgMjEgKTtcclxuXHJcbiAgICAgICAgICAgIGlmICggdGhpcy5jICkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGksXHJcbiAgICAgICAgICAgICAgICAgICAgYXJyID0gc3RyLnNwbGl0KCcuJyksXHJcbiAgICAgICAgICAgICAgICAgICAgZzEgPSArRk9STUFULmdyb3VwU2l6ZSxcclxuICAgICAgICAgICAgICAgICAgICBnMiA9ICtGT1JNQVQuc2Vjb25kYXJ5R3JvdXBTaXplLFxyXG4gICAgICAgICAgICAgICAgICAgIGdyb3VwU2VwYXJhdG9yID0gRk9STUFULmdyb3VwU2VwYXJhdG9yLFxyXG4gICAgICAgICAgICAgICAgICAgIGludFBhcnQgPSBhcnJbMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25QYXJ0ID0gYXJyWzFdLFxyXG4gICAgICAgICAgICAgICAgICAgIGlzTmVnID0gdGhpcy5zIDwgMCxcclxuICAgICAgICAgICAgICAgICAgICBpbnREaWdpdHMgPSBpc05lZyA/IGludFBhcnQuc2xpY2UoMSkgOiBpbnRQYXJ0LFxyXG4gICAgICAgICAgICAgICAgICAgIGxlbiA9IGludERpZ2l0cy5sZW5ndGg7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKGcyKSBpID0gZzEsIGcxID0gZzIsIGcyID0gaSwgbGVuIC09IGk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBnMSA+IDAgJiYgbGVuID4gMCApIHtcclxuICAgICAgICAgICAgICAgICAgICBpID0gbGVuICUgZzEgfHwgZzE7XHJcbiAgICAgICAgICAgICAgICAgICAgaW50UGFydCA9IGludERpZ2l0cy5zdWJzdHIoIDAsIGkgKTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgZm9yICggOyBpIDwgbGVuOyBpICs9IGcxICkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbnRQYXJ0ICs9IGdyb3VwU2VwYXJhdG9yICsgaW50RGlnaXRzLnN1YnN0ciggaSwgZzEgKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmICggZzIgPiAwICkgaW50UGFydCArPSBncm91cFNlcGFyYXRvciArIGludERpZ2l0cy5zbGljZShpKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXNOZWcpIGludFBhcnQgPSAnLScgKyBpbnRQYXJ0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIHN0ciA9IGZyYWN0aW9uUGFydFxyXG4gICAgICAgICAgICAgICAgICA/IGludFBhcnQgKyBGT1JNQVQuZGVjaW1hbFNlcGFyYXRvciArICggKCBnMiA9ICtGT1JNQVQuZnJhY3Rpb25Hcm91cFNpemUgKVxyXG4gICAgICAgICAgICAgICAgICAgID8gZnJhY3Rpb25QYXJ0LnJlcGxhY2UoIG5ldyBSZWdFeHAoICdcXFxcZHsnICsgZzIgKyAnfVxcXFxCJywgJ2cnICksXHJcbiAgICAgICAgICAgICAgICAgICAgICAnJCYnICsgRk9STUFULmZyYWN0aW9uR3JvdXBTZXBhcmF0b3IgKVxyXG4gICAgICAgICAgICAgICAgICAgIDogZnJhY3Rpb25QYXJ0IClcclxuICAgICAgICAgICAgICAgICAgOiBpbnRQYXJ0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiBhIHN0cmluZyBhcnJheSByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGFzIGEgc2ltcGxlIGZyYWN0aW9uIHdpdGhcclxuICAgICAgICAgKiBhbiBpbnRlZ2VyIG51bWVyYXRvciBhbmQgYW4gaW50ZWdlciBkZW5vbWluYXRvci4gVGhlIGRlbm9taW5hdG9yIHdpbGwgYmUgYSBwb3NpdGl2ZVxyXG4gICAgICAgICAqIG5vbi16ZXJvIHZhbHVlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgc3BlY2lmaWVkIG1heGltdW0gZGVub21pbmF0b3IuIElmIGEgbWF4aW11bVxyXG4gICAgICAgICAqIGRlbm9taW5hdG9yIGlzIG5vdCBzcGVjaWZpZWQsIHRoZSBkZW5vbWluYXRvciB3aWxsIGJlIHRoZSBsb3dlc3QgdmFsdWUgbmVjZXNzYXJ5IHRvXHJcbiAgICAgICAgICogcmVwcmVzZW50IHRoZSBudW1iZXIgZXhhY3RseS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFttZF0ge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfSBJbnRlZ2VyID49IDEgYW5kIDwgSW5maW5pdHkuIFRoZSBtYXhpbXVtIGRlbm9taW5hdG9yLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3RvRnJhY3Rpb24oKSBtYXggZGVub21pbmF0b3Igbm90IGFuIGludGVnZXI6IHttZH0nXHJcbiAgICAgICAgICogJ3RvRnJhY3Rpb24oKSBtYXggZGVub21pbmF0b3Igb3V0IG9mIHJhbmdlOiB7bWR9J1xyXG4gICAgICAgICAqL1xyXG4gICAgICAgIFAudG9GcmFjdGlvbiA9IGZ1bmN0aW9uIChtZCkge1xyXG4gICAgICAgICAgICB2YXIgYXJyLCBkMCwgZDIsIGUsIGV4cCwgbiwgbjAsIHEsIHMsXHJcbiAgICAgICAgICAgICAgICBrID0gRVJST1JTLFxyXG4gICAgICAgICAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgICAgIGQgPSBuZXcgQmlnTnVtYmVyKE9ORSksXHJcbiAgICAgICAgICAgICAgICBuMSA9IGQwID0gbmV3IEJpZ051bWJlcihPTkUpLFxyXG4gICAgICAgICAgICAgICAgZDEgPSBuMCA9IG5ldyBCaWdOdW1iZXIoT05FKTtcclxuXHJcbiAgICAgICAgICAgIGlmICggbWQgIT0gbnVsbCApIHtcclxuICAgICAgICAgICAgICAgIEVSUk9SUyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgbiA9IG5ldyBCaWdOdW1iZXIobWQpO1xyXG4gICAgICAgICAgICAgICAgRVJST1JTID0gaztcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoICEoIGsgPSBuLmlzSW50KCkgKSB8fCBuLmx0KE9ORSkgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChFUlJPUlMpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmFpc2UoIDIyLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICdtYXggZGVub21pbmF0b3IgJyArICggayA/ICdvdXQgb2YgcmFuZ2UnIDogJ25vdCBhbiBpbnRlZ2VyJyApLCBtZCApO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gRVJST1JTIGlzIGZhbHNlOlxyXG4gICAgICAgICAgICAgICAgICAgIC8vIElmIG1kIGlzIGEgZmluaXRlIG5vbi1pbnRlZ2VyID49IDEsIHJvdW5kIGl0IHRvIGFuIGludGVnZXIgYW5kIHVzZSBpdC5cclxuICAgICAgICAgICAgICAgICAgICBtZCA9ICFrICYmIG4uYyAmJiByb3VuZCggbiwgbi5lICsgMSwgMSApLmd0ZShPTkUpID8gbiA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmICggIXhjICkgcmV0dXJuIHgudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgcyA9IGNvZWZmVG9TdHJpbmcoeGMpO1xyXG5cclxuICAgICAgICAgICAgLy8gRGV0ZXJtaW5lIGluaXRpYWwgZGVub21pbmF0b3IuXHJcbiAgICAgICAgICAgIC8vIGQgaXMgYSBwb3dlciBvZiAxMCBhbmQgdGhlIG1pbmltdW0gbWF4IGRlbm9taW5hdG9yIHRoYXQgc3BlY2lmaWVzIHRoZSB2YWx1ZSBleGFjdGx5LlxyXG4gICAgICAgICAgICBlID0gZC5lID0gcy5sZW5ndGggLSB4LmUgLSAxO1xyXG4gICAgICAgICAgICBkLmNbMF0gPSBQT1dTX1RFTlsgKCBleHAgPSBlICUgTE9HX0JBU0UgKSA8IDAgPyBMT0dfQkFTRSArIGV4cCA6IGV4cCBdO1xyXG4gICAgICAgICAgICBtZCA9ICFtZCB8fCBuLmNtcChkKSA+IDAgPyAoIGUgPiAwID8gZCA6IG4xICkgOiBuO1xyXG5cclxuICAgICAgICAgICAgZXhwID0gTUFYX0VYUDtcclxuICAgICAgICAgICAgTUFYX0VYUCA9IDEgLyAwO1xyXG4gICAgICAgICAgICBuID0gbmV3IEJpZ051bWJlcihzKTtcclxuXHJcbiAgICAgICAgICAgIC8vIG4wID0gZDEgPSAwXHJcbiAgICAgICAgICAgIG4wLmNbMF0gPSAwO1xyXG5cclxuICAgICAgICAgICAgZm9yICggOyA7ICkgIHtcclxuICAgICAgICAgICAgICAgIHEgPSBkaXYoIG4sIGQsIDAsIDEgKTtcclxuICAgICAgICAgICAgICAgIGQyID0gZDAucGx1cyggcS50aW1lcyhkMSkgKTtcclxuICAgICAgICAgICAgICAgIGlmICggZDIuY21wKG1kKSA9PSAxICkgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBkMCA9IGQxO1xyXG4gICAgICAgICAgICAgICAgZDEgPSBkMjtcclxuICAgICAgICAgICAgICAgIG4xID0gbjAucGx1cyggcS50aW1lcyggZDIgPSBuMSApICk7XHJcbiAgICAgICAgICAgICAgICBuMCA9IGQyO1xyXG4gICAgICAgICAgICAgICAgZCA9IG4ubWludXMoIHEudGltZXMoIGQyID0gZCApICk7XHJcbiAgICAgICAgICAgICAgICBuID0gZDI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGQyID0gZGl2KCBtZC5taW51cyhkMCksIGQxLCAwLCAxICk7XHJcbiAgICAgICAgICAgIG4wID0gbjAucGx1cyggZDIudGltZXMobjEpICk7XHJcbiAgICAgICAgICAgIGQwID0gZDAucGx1cyggZDIudGltZXMoZDEpICk7XHJcbiAgICAgICAgICAgIG4wLnMgPSBuMS5zID0geC5zO1xyXG4gICAgICAgICAgICBlICo9IDI7XHJcblxyXG4gICAgICAgICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggZnJhY3Rpb24gaXMgY2xvc2VyIHRvIHgsIG4wL2QwIG9yIG4xL2QxXHJcbiAgICAgICAgICAgIGFyciA9IGRpdiggbjEsIGQxLCBlLCBST1VORElOR19NT0RFICkubWludXMoeCkuYWJzKCkuY21wKFxyXG4gICAgICAgICAgICAgICAgICBkaXYoIG4wLCBkMCwgZSwgUk9VTkRJTkdfTU9ERSApLm1pbnVzKHgpLmFicygpICkgPCAxXHJcbiAgICAgICAgICAgICAgICAgICAgPyBbIG4xLnRvU3RyaW5nKCksIGQxLnRvU3RyaW5nKCkgXVxyXG4gICAgICAgICAgICAgICAgICAgIDogWyBuMC50b1N0cmluZygpLCBkMC50b1N0cmluZygpIF07XHJcblxyXG4gICAgICAgICAgICBNQVhfRVhQID0gZXhwO1xyXG4gICAgICAgICAgICByZXR1cm4gYXJyO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICAvKlxyXG4gICAgICAgICAqIFJldHVybiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgY29udmVydGVkIHRvIGEgbnVtYmVyIHByaW1pdGl2ZS5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnRvTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gK3RoaXM7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciByYWlzZWQgdG8gdGhlIHBvd2VyIG4uXHJcbiAgICAgICAgICogSWYgbSBpcyBwcmVzZW50LCByZXR1cm4gdGhlIHJlc3VsdCBtb2R1bG8gbS5cclxuICAgICAgICAgKiBJZiBuIGlzIG5lZ2F0aXZlIHJvdW5kIGFjY29yZGluZyB0byBERUNJTUFMX1BMQUNFUyBhbmQgUk9VTkRJTkdfTU9ERS5cclxuICAgICAgICAgKiBJZiBQT1dfUFJFQ0lTSU9OIGlzIG5vbi16ZXJvIGFuZCBtIGlzIG5vdCBwcmVzZW50LCByb3VuZCB0byBQT1dfUFJFQ0lTSU9OIHVzaW5nXHJcbiAgICAgICAgICogUk9VTkRJTkdfTU9ERS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqIFRoZSBtb2R1bGFyIHBvd2VyIG9wZXJhdGlvbiB3b3JrcyBlZmZpY2llbnRseSB3aGVuIHgsIG4sIGFuZCBtIGFyZSBwb3NpdGl2ZSBpbnRlZ2VycyxcclxuICAgICAgICAgKiBvdGhlcndpc2UgaXQgaXMgZXF1aXZhbGVudCB0byBjYWxjdWxhdGluZyB4LnRvUG93ZXIobikubW9kdWxvKG0pICh3aXRoIFBPV19QUkVDSVNJT04gMCkuXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBuIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfU0FGRV9JTlRFR0VSIHRvIE1BWF9TQUZFX0lOVEVHRVIgaW5jbHVzaXZlLlxyXG4gICAgICAgICAqIFttXSB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9IFRoZSBtb2R1bHVzLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3BvdygpIGV4cG9uZW50IG5vdCBhbiBpbnRlZ2VyOiB7bn0nXHJcbiAgICAgICAgICogJ3BvdygpIGV4cG9uZW50IG91dCBvZiByYW5nZToge259J1xyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogUGVyZm9ybXMgNTQgbG9vcCBpdGVyYXRpb25zIGZvciBuIG9mIDkwMDcxOTkyNTQ3NDA5OTEuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b1Bvd2VyID0gUC5wb3cgPSBmdW5jdGlvbiAoIG4sIG0gKSB7XHJcbiAgICAgICAgICAgIHZhciBrLCB5LCB6LFxyXG4gICAgICAgICAgICAgICAgaSA9IG1hdGhmbG9vciggbiA8IDAgPyAtbiA6ICtuICksXHJcbiAgICAgICAgICAgICAgICB4ID0gdGhpcztcclxuXHJcbiAgICAgICAgICAgIGlmICggbSAhPSBudWxsICkge1xyXG4gICAgICAgICAgICAgICAgaWQgPSAyMztcclxuICAgICAgICAgICAgICAgIG0gPSBuZXcgQmlnTnVtYmVyKG0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBQYXNzIMKxSW5maW5pdHkgdG8gTWF0aC5wb3cgaWYgZXhwb25lbnQgaXMgb3V0IG9mIHJhbmdlLlxyXG4gICAgICAgICAgICBpZiAoICFpc1ZhbGlkSW50KCBuLCAtTUFYX1NBRkVfSU5URUdFUiwgTUFYX1NBRkVfSU5URUdFUiwgMjMsICdleHBvbmVudCcgKSAmJlxyXG4gICAgICAgICAgICAgICggIWlzRmluaXRlKG4pIHx8IGkgPiBNQVhfU0FGRV9JTlRFR0VSICYmICggbiAvPSAwICkgfHxcclxuICAgICAgICAgICAgICAgIHBhcnNlRmxvYXQobikgIT0gbiAmJiAhKCBuID0gTmFOICkgKSB8fCBuID09IDAgKSB7XHJcbiAgICAgICAgICAgICAgICBrID0gTWF0aC5wb3coICt4LCBuICk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJpZ051bWJlciggbSA/IGsgJSBtIDogayApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBuID4gMSAmJiB4Lmd0KE9ORSkgJiYgeC5pc0ludCgpICYmIG0uZ3QoT05FKSAmJiBtLmlzSW50KCkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHgubW9kKG0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB6ID0gbTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8gTnVsbGlmeSBtIHNvIG9ubHkgYSBzaW5nbGUgbW9kIG9wZXJhdGlvbiBpcyBwZXJmb3JtZWQgYXQgdGhlIGVuZC5cclxuICAgICAgICAgICAgICAgICAgICBtID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChQT1dfUFJFQ0lTSU9OKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVHJ1bmNhdGluZyBlYWNoIGNvZWZmaWNpZW50IGFycmF5IHRvIGEgbGVuZ3RoIG9mIGsgYWZ0ZXIgZWFjaCBtdWx0aXBsaWNhdGlvblxyXG4gICAgICAgICAgICAgICAgLy8gZXF1YXRlcyB0byB0cnVuY2F0aW5nIHNpZ25pZmljYW50IGRpZ2l0cyB0byBQT1dfUFJFQ0lTSU9OICsgWzI4LCA0MV0sXHJcbiAgICAgICAgICAgICAgICAvLyBpLmUuIHRoZXJlIHdpbGwgYmUgYSBtaW5pbXVtIG9mIDI4IGd1YXJkIGRpZ2l0cyByZXRhaW5lZC5cclxuICAgICAgICAgICAgICAgIC8vIChVc2luZyArIDEuNSB3b3VsZCBnaXZlIFs5LCAyMV0gZ3VhcmQgZGlnaXRzLilcclxuICAgICAgICAgICAgICAgIGsgPSBtYXRoY2VpbCggUE9XX1BSRUNJU0lPTiAvIExPR19CQVNFICsgMiApO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICB5ID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG5cclxuICAgICAgICAgICAgZm9yICggOyA7ICkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCBpICUgMiApIHtcclxuICAgICAgICAgICAgICAgICAgICB5ID0geS50aW1lcyh4KTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoICF5LmMgKSBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIHkuYy5sZW5ndGggPiBrICkgeS5jLmxlbmd0aCA9IGs7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHkgPSB5Lm1vZChtKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaSA9IG1hdGhmbG9vciggaSAvIDIgKTtcclxuICAgICAgICAgICAgICAgIGlmICggIWkgKSBicmVhaztcclxuICAgICAgICAgICAgICAgIHggPSB4LnRpbWVzKHgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGspIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIHguYyAmJiB4LmMubGVuZ3RoID4gayApIHguYy5sZW5ndGggPSBrO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgeCA9IHgubW9kKG0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBpZiAobSkgcmV0dXJuIHk7XHJcbiAgICAgICAgICAgIGlmICggbiA8IDAgKSB5ID0gT05FLmRpdih5KTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiB6ID8geS5tb2QoeikgOiBrID8gcm91bmQoIHksIFBPV19QUkVDSVNJT04sIFJPVU5ESU5HX01PREUgKSA6IHk7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBzZCBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgICAgICAgKiB1c2luZyByb3VuZGluZyBtb2RlIHJtIG9yIFJPVU5ESU5HX01PREUuIElmIHNkIGlzIGxlc3MgdGhhbiB0aGUgbnVtYmVyIG9mIGRpZ2l0c1xyXG4gICAgICAgICAqIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXIgcGFydCBvZiB0aGUgdmFsdWUgaW4gZml4ZWQtcG9pbnQgbm90YXRpb24sIHRoZW4gdXNlXHJcbiAgICAgICAgICogZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgICpcclxuICAgICAgICAgKiBbc2RdIHtudW1iZXJ9IFNpZ25pZmljYW50IGRpZ2l0cy4gSW50ZWdlciwgMSB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICAgICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgICAgICAgKlxyXG4gICAgICAgICAqICd0b1ByZWNpc2lvbigpIHByZWNpc2lvbiBub3QgYW4gaW50ZWdlcjoge3NkfSdcclxuICAgICAgICAgKiAndG9QcmVjaXNpb24oKSBwcmVjaXNpb24gb3V0IG9mIHJhbmdlOiB7c2R9J1xyXG4gICAgICAgICAqICd0b1ByZWNpc2lvbigpIHJvdW5kaW5nIG1vZGUgbm90IGFuIGludGVnZXI6IHtybX0nXHJcbiAgICAgICAgICogJ3RvUHJlY2lzaW9uKCkgcm91bmRpbmcgbW9kZSBvdXQgb2YgcmFuZ2U6IHtybX0nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b1ByZWNpc2lvbiA9IGZ1bmN0aW9uICggc2QsIHJtICkge1xyXG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0KCB0aGlzLCBzZCAhPSBudWxsICYmIGlzVmFsaWRJbnQoIHNkLCAxLCBNQVgsIDI0LCAncHJlY2lzaW9uJyApXHJcbiAgICAgICAgICAgICAgPyBzZCB8IDAgOiBudWxsLCBybSwgMjQgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpbiBiYXNlIGIsIG9yIGJhc2UgMTAgaWYgYiBpc1xyXG4gICAgICAgICAqIG9taXR0ZWQuIElmIGEgYmFzZSBpcyBzcGVjaWZpZWQsIGluY2x1ZGluZyBiYXNlIDEwLCByb3VuZCBhY2NvcmRpbmcgdG8gREVDSU1BTF9QTEFDRVMgYW5kXHJcbiAgICAgICAgICogUk9VTkRJTkdfTU9ERS4gSWYgYSBiYXNlIGlzIG5vdCBzcGVjaWZpZWQsIGFuZCB0aGlzIEJpZ051bWJlciBoYXMgYSBwb3NpdGl2ZSBleHBvbmVudFxyXG4gICAgICAgICAqIHRoYXQgaXMgZXF1YWwgdG8gb3IgZ3JlYXRlciB0aGFuIFRPX0VYUF9QT1MsIG9yIGEgbmVnYXRpdmUgZXhwb25lbnQgZXF1YWwgdG8gb3IgbGVzcyB0aGFuXHJcbiAgICAgICAgICogVE9fRVhQX05FRywgcmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogW2JdIHtudW1iZXJ9IEludGVnZXIsIDIgdG8gNjQgaW5jbHVzaXZlLlxyXG4gICAgICAgICAqXHJcbiAgICAgICAgICogJ3RvU3RyaW5nKCkgYmFzZSBub3QgYW4gaW50ZWdlcjoge2J9J1xyXG4gICAgICAgICAqICd0b1N0cmluZygpIGJhc2Ugb3V0IG9mIHJhbmdlOiB7Yn0nXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50b1N0cmluZyA9IGZ1bmN0aW9uIChiKSB7XHJcbiAgICAgICAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgICAgICAgICBuID0gdGhpcyxcclxuICAgICAgICAgICAgICAgIHMgPSBuLnMsXHJcbiAgICAgICAgICAgICAgICBlID0gbi5lO1xyXG5cclxuICAgICAgICAgICAgLy8gSW5maW5pdHkgb3IgTmFOP1xyXG4gICAgICAgICAgICBpZiAoIGUgPT09IG51bGwgKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKHMpIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSAnSW5maW5pdHknO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICggcyA8IDAgKSBzdHIgPSAnLScgKyBzdHI7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHN0ciA9ICdOYU4nO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyggbi5jICk7XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBiID09IG51bGwgfHwgIWlzVmFsaWRJbnQoIGIsIDIsIDY0LCAyNSwgJ2Jhc2UnICkgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3RyID0gZSA8PSBUT19FWFBfTkVHIHx8IGUgPj0gVE9fRVhQX1BPU1xyXG4gICAgICAgICAgICAgICAgICAgICAgPyB0b0V4cG9uZW50aWFsKCBzdHIsIGUgKVxyXG4gICAgICAgICAgICAgICAgICAgICAgOiB0b0ZpeGVkUG9pbnQoIHN0ciwgZSApO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzdHIgPSBjb252ZXJ0QmFzZSggdG9GaXhlZFBvaW50KCBzdHIsIGUgKSwgYiB8IDAsIDEwLCBzICk7XHJcbiAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgaWYgKCBzIDwgMCAmJiBuLmNbMF0gKSBzdHIgPSAnLScgKyBzdHI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBzdHI7XHJcbiAgICAgICAgfTtcclxuXHJcblxyXG4gICAgICAgIC8qXHJcbiAgICAgICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgdHJ1bmNhdGVkIHRvIGEgd2hvbGVcclxuICAgICAgICAgKiBudW1iZXIuXHJcbiAgICAgICAgICovXHJcbiAgICAgICAgUC50cnVuY2F0ZWQgPSBQLnRydW5jID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gcm91bmQoIG5ldyBCaWdOdW1iZXIodGhpcyksIHRoaXMuZSArIDEsIDEgKTtcclxuICAgICAgICB9O1xyXG5cclxuXHJcbiAgICAgICAgLypcclxuICAgICAgICAgKiBSZXR1cm4gYXMgdG9TdHJpbmcsIGJ1dCBkbyBub3QgYWNjZXB0IGEgYmFzZSBhcmd1bWVudCwgYW5kIGluY2x1ZGUgdGhlIG1pbnVzIHNpZ24gZm9yXHJcbiAgICAgICAgICogbmVnYXRpdmUgemVyby5cclxuICAgICAgICAgKi9cclxuICAgICAgICBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgdmFyIHN0cixcclxuICAgICAgICAgICAgICAgIG4gPSB0aGlzLFxyXG4gICAgICAgICAgICAgICAgZSA9IG4uZTtcclxuXHJcbiAgICAgICAgICAgIGlmICggZSA9PT0gbnVsbCApIHJldHVybiBuLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgICAgICBzdHIgPSBjb2VmZlRvU3RyaW5nKCBuLmMgKTtcclxuXHJcbiAgICAgICAgICAgIHN0ciA9IGUgPD0gVE9fRVhQX05FRyB8fCBlID49IFRPX0VYUF9QT1NcclxuICAgICAgICAgICAgICAgID8gdG9FeHBvbmVudGlhbCggc3RyLCBlIClcclxuICAgICAgICAgICAgICAgIDogdG9GaXhlZFBvaW50KCBzdHIsIGUgKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiBuLnMgPCAwID8gJy0nICsgc3RyIDogc3RyO1xyXG4gICAgICAgIH07XHJcblxyXG5cclxuICAgICAgICBQLmlzQmlnTnVtYmVyID0gdHJ1ZTtcclxuXHJcbiAgICAgICAgaWYgKCBjb25maWcgIT0gbnVsbCApIEJpZ051bWJlci5jb25maWcoY29uZmlnKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIEJpZ051bWJlcjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUFJJVkFURSBIRUxQRVIgRlVOQ1RJT05TXHJcblxyXG5cclxuICAgIGZ1bmN0aW9uIGJpdEZsb29yKG4pIHtcclxuICAgICAgICB2YXIgaSA9IG4gfCAwO1xyXG4gICAgICAgIHJldHVybiBuID4gMCB8fCBuID09PSBpID8gaSA6IGkgLSAxO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBSZXR1cm4gYSBjb2VmZmljaWVudCBhcnJheSBhcyBhIHN0cmluZyBvZiBiYXNlIDEwIGRpZ2l0cy5cclxuICAgIGZ1bmN0aW9uIGNvZWZmVG9TdHJpbmcoYSkge1xyXG4gICAgICAgIHZhciBzLCB6LFxyXG4gICAgICAgICAgICBpID0gMSxcclxuICAgICAgICAgICAgaiA9IGEubGVuZ3RoLFxyXG4gICAgICAgICAgICByID0gYVswXSArICcnO1xyXG5cclxuICAgICAgICBmb3IgKCA7IGkgPCBqOyApIHtcclxuICAgICAgICAgICAgcyA9IGFbaSsrXSArICcnO1xyXG4gICAgICAgICAgICB6ID0gTE9HX0JBU0UgLSBzLmxlbmd0aDtcclxuICAgICAgICAgICAgZm9yICggOyB6LS07IHMgPSAnMCcgKyBzICk7XHJcbiAgICAgICAgICAgIHIgKz0gcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKCBqID0gci5sZW5ndGg7IHIuY2hhckNvZGVBdCgtLWopID09PSA0ODsgKTtcclxuICAgICAgICByZXR1cm4gci5zbGljZSggMCwgaiArIDEgfHwgMSApO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBDb21wYXJlIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXJzIHggYW5kIHkuXHJcbiAgICBmdW5jdGlvbiBjb21wYXJlKCB4LCB5ICkge1xyXG4gICAgICAgIHZhciBhLCBiLFxyXG4gICAgICAgICAgICB4YyA9IHguYyxcclxuICAgICAgICAgICAgeWMgPSB5LmMsXHJcbiAgICAgICAgICAgIGkgPSB4LnMsXHJcbiAgICAgICAgICAgIGogPSB5LnMsXHJcbiAgICAgICAgICAgIGsgPSB4LmUsXHJcbiAgICAgICAgICAgIGwgPSB5LmU7XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciBOYU4/XHJcbiAgICAgICAgaWYgKCAhaSB8fCAhaiApIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICBhID0geGMgJiYgIXhjWzBdO1xyXG4gICAgICAgIGIgPSB5YyAmJiAheWNbMF07XHJcblxyXG4gICAgICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgICAgIGlmICggYSB8fCBiICkgcmV0dXJuIGEgPyBiID8gMCA6IC1qIDogaTtcclxuXHJcbiAgICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgIGlmICggaSAhPSBqICkgcmV0dXJuIGk7XHJcblxyXG4gICAgICAgIGEgPSBpIDwgMDtcclxuICAgICAgICBiID0gayA9PSBsO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgSW5maW5pdHk/XHJcbiAgICAgICAgaWYgKCAheGMgfHwgIXljICkgcmV0dXJuIGIgPyAwIDogIXhjIF4gYSA/IDEgOiAtMTtcclxuXHJcbiAgICAgICAgLy8gQ29tcGFyZSBleHBvbmVudHMuXHJcbiAgICAgICAgaWYgKCAhYiApIHJldHVybiBrID4gbCBeIGEgPyAxIDogLTE7XHJcblxyXG4gICAgICAgIGogPSAoIGsgPSB4Yy5sZW5ndGggKSA8ICggbCA9IHljLmxlbmd0aCApID8gayA6IGw7XHJcblxyXG4gICAgICAgIC8vIENvbXBhcmUgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgZm9yICggaSA9IDA7IGkgPCBqOyBpKysgKSBpZiAoIHhjW2ldICE9IHljW2ldICkgcmV0dXJuIHhjW2ldID4geWNbaV0gXiBhID8gMSA6IC0xO1xyXG5cclxuICAgICAgICAvLyBDb21wYXJlIGxlbmd0aHMuXHJcbiAgICAgICAgcmV0dXJuIGsgPT0gbCA/IDAgOiBrID4gbCBeIGEgPyAxIDogLTE7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiBuIGlzIGEgdmFsaWQgbnVtYmVyIGluIHJhbmdlLCBvdGhlcndpc2UgZmFsc2UuXHJcbiAgICAgKiBVc2UgZm9yIGFyZ3VtZW50IHZhbGlkYXRpb24gd2hlbiBFUlJPUlMgaXMgZmFsc2UuXHJcbiAgICAgKiBOb3RlOiBwYXJzZUludCgnMWUrMScpID09IDEgYnV0IHBhcnNlRmxvYXQoJzFlKzEnKSA9PSAxMC5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gaW50VmFsaWRhdG9yTm9FcnJvcnMoIG4sIG1pbiwgbWF4ICkge1xyXG4gICAgICAgIHJldHVybiAoIG4gPSB0cnVuY2F0ZShuKSApID49IG1pbiAmJiBuIDw9IG1heDtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gaXNBcnJheShvYmopIHtcclxuICAgICAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT0gJ1tvYmplY3QgQXJyYXldJztcclxuICAgIH1cclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENvbnZlcnQgc3RyaW5nIG9mIGJhc2VJbiB0byBhbiBhcnJheSBvZiBudW1iZXJzIG9mIGJhc2VPdXQuXHJcbiAgICAgKiBFZy4gY29udmVydEJhc2UoJzI1NScsIDEwLCAxNikgcmV0dXJucyBbMTUsIDE1XS5cclxuICAgICAqIEVnLiBjb252ZXJ0QmFzZSgnZmYnLCAxNiwgMTApIHJldHVybnMgWzIsIDUsIDVdLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiB0b0Jhc2VPdXQoIHN0ciwgYmFzZUluLCBiYXNlT3V0ICkge1xyXG4gICAgICAgIHZhciBqLFxyXG4gICAgICAgICAgICBhcnIgPSBbMF0sXHJcbiAgICAgICAgICAgIGFyckwsXHJcbiAgICAgICAgICAgIGkgPSAwLFxyXG4gICAgICAgICAgICBsZW4gPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICBmb3IgKCA7IGkgPCBsZW47ICkge1xyXG4gICAgICAgICAgICBmb3IgKCBhcnJMID0gYXJyLmxlbmd0aDsgYXJyTC0tOyBhcnJbYXJyTF0gKj0gYmFzZUluICk7XHJcbiAgICAgICAgICAgIGFyclsgaiA9IDAgXSArPSBBTFBIQUJFVC5pbmRleE9mKCBzdHIuY2hhckF0KCBpKysgKSApO1xyXG5cclxuICAgICAgICAgICAgZm9yICggOyBqIDwgYXJyLmxlbmd0aDsgaisrICkge1xyXG5cclxuICAgICAgICAgICAgICAgIGlmICggYXJyW2pdID4gYmFzZU91dCAtIDEgKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCBhcnJbaiArIDFdID09IG51bGwgKSBhcnJbaiArIDFdID0gMDtcclxuICAgICAgICAgICAgICAgICAgICBhcnJbaiArIDFdICs9IGFycltqXSAvIGJhc2VPdXQgfCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIGFycltqXSAlPSBiYXNlT3V0O1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gYXJyLnJldmVyc2UoKTtcclxuICAgIH1cclxuXHJcblxyXG4gICAgZnVuY3Rpb24gdG9FeHBvbmVudGlhbCggc3RyLCBlICkge1xyXG4gICAgICAgIHJldHVybiAoIHN0ci5sZW5ndGggPiAxID8gc3RyLmNoYXJBdCgwKSArICcuJyArIHN0ci5zbGljZSgxKSA6IHN0ciApICtcclxuICAgICAgICAgICggZSA8IDAgPyAnZScgOiAnZSsnICkgKyBlO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiB0b0ZpeGVkUG9pbnQoIHN0ciwgZSApIHtcclxuICAgICAgICB2YXIgbGVuLCB6O1xyXG5cclxuICAgICAgICAvLyBOZWdhdGl2ZSBleHBvbmVudD9cclxuICAgICAgICBpZiAoIGUgPCAwICkge1xyXG5cclxuICAgICAgICAgICAgLy8gUHJlcGVuZCB6ZXJvcy5cclxuICAgICAgICAgICAgZm9yICggeiA9ICcwLic7ICsrZTsgeiArPSAnMCcgKTtcclxuICAgICAgICAgICAgc3RyID0geiArIHN0cjtcclxuXHJcbiAgICAgICAgLy8gUG9zaXRpdmUgZXhwb25lbnRcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsZW4gPSBzdHIubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgLy8gQXBwZW5kIHplcm9zLlxyXG4gICAgICAgICAgICBpZiAoICsrZSA+IGxlbiApIHtcclxuICAgICAgICAgICAgICAgIGZvciAoIHogPSAnMCcsIGUgLT0gbGVuOyAtLWU7IHogKz0gJzAnICk7XHJcbiAgICAgICAgICAgICAgICBzdHIgKz0gejtcclxuICAgICAgICAgICAgfSBlbHNlIGlmICggZSA8IGxlbiApIHtcclxuICAgICAgICAgICAgICAgIHN0ciA9IHN0ci5zbGljZSggMCwgZSApICsgJy4nICsgc3RyLnNsaWNlKGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiB0cnVuY2F0ZShuKSB7XHJcbiAgICAgICAgbiA9IHBhcnNlRmxvYXQobik7XHJcbiAgICAgICAgcmV0dXJuIG4gPCAwID8gbWF0aGNlaWwobikgOiBtYXRoZmxvb3Iobik7XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIEVYUE9SVFxyXG5cclxuXHJcbiAgICBCaWdOdW1iZXIgPSBjb25zdHJ1Y3RvckZhY3RvcnkoKTtcclxuICAgIEJpZ051bWJlclsnZGVmYXVsdCddID0gQmlnTnVtYmVyLkJpZ051bWJlciA9IEJpZ051bWJlcjtcclxuXHJcblxyXG4gICAgLy8gQU1ELlxyXG4gICAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcclxuICAgICAgICBkZWZpbmUoIGZ1bmN0aW9uICgpIHsgcmV0dXJuIEJpZ051bWJlcjsgfSApO1xyXG5cclxuICAgIC8vIE5vZGUuanMgYW5kIG90aGVyIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzICkge1xyXG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gQmlnTnVtYmVyO1xyXG5cclxuICAgIC8vIEJyb3dzZXIuXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmICggIWdsb2JhbE9iaiApIGdsb2JhbE9iaiA9IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XHJcbiAgICAgICAgZ2xvYmFsT2JqLkJpZ051bWJlciA9IEJpZ051bWJlcjtcclxuICAgIH1cclxufSkodGhpcyk7XHJcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBsYW5ndWFnZVRhZzogXCJlbi1VU1wiLFxuICAgIGRlbGltaXRlcnM6IHtcbiAgICAgICAgdGhvdXNhbmRzOiBcIixcIixcbiAgICAgICAgZGVjaW1hbDogXCIuXCJcbiAgICB9LFxuICAgIGFiYnJldmlhdGlvbnM6IHtcbiAgICAgICAgdGhvdXNhbmQ6IFwia1wiLFxuICAgICAgICBtaWxsaW9uOiBcIm1cIixcbiAgICAgICAgYmlsbGlvbjogXCJiXCIsXG4gICAgICAgIHRyaWxsaW9uOiBcInRcIlxuICAgIH0sXG4gICAgc3BhY2VTZXBhcmF0ZWQ6IGZhbHNlLFxuICAgIG9yZGluYWw6IGZ1bmN0aW9uKG51bWJlcikge1xuICAgICAgICBsZXQgYiA9IG51bWJlciAlIDEwO1xuICAgICAgICByZXR1cm4gKH5+KG51bWJlciAlIDEwMCAvIDEwKSA9PT0gMSkgPyBcInRoXCIgOiAoYiA9PT0gMSkgPyBcInN0XCIgOiAoYiA9PT0gMikgPyBcIm5kXCIgOiAoYiA9PT0gMykgPyBcInJkXCIgOiBcInRoXCI7XG4gICAgfSxcbiAgICBjdXJyZW5jeToge1xuICAgICAgICBzeW1ib2w6IFwiJFwiLFxuICAgICAgICBwb3NpdGlvbjogXCJwcmVmaXhcIixcbiAgICAgICAgY29kZTogXCJVU0RcIlxuICAgIH0sXG4gICAgY3VycmVuY3lGb3JtYXQ6IHtcbiAgICAgICAgdGhvdXNhbmRTZXBhcmF0ZWQ6IHRydWUsXG4gICAgICAgIHRvdGFsTGVuZ3RoOiA0LFxuICAgICAgICBzcGFjZVNlcGFyYXRlZDogdHJ1ZVxuICAgIH0sXG4gICAgZm9ybWF0czoge1xuICAgICAgICBmb3VyRGlnaXRzOiB7XG4gICAgICAgICAgICB0b3RhbExlbmd0aDogNCxcbiAgICAgICAgICAgIHNwYWNlU2VwYXJhdGVkOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bGxXaXRoVHdvRGVjaW1hbHM6IHtcbiAgICAgICAgICAgIG91dHB1dDogXCJjdXJyZW5jeVwiLFxuICAgICAgICAgICAgdGhvdXNhbmRTZXBhcmF0ZWQ6IHRydWUsXG4gICAgICAgICAgICBtYW50aXNzYTogMlxuICAgICAgICB9LFxuICAgICAgICBmdWxsV2l0aFR3b0RlY2ltYWxzTm9DdXJyZW5jeToge1xuICAgICAgICAgICAgdGhvdXNhbmRTZXBhcmF0ZWQ6IHRydWUsXG4gICAgICAgICAgICBtYW50aXNzYTogMlxuICAgICAgICB9LFxuICAgICAgICBmdWxsV2l0aE5vRGVjaW1hbHM6IHtcbiAgICAgICAgICAgIG91dHB1dDogXCJjdXJyZW5jeVwiLFxuICAgICAgICAgICAgdGhvdXNhbmRTZXBhcmF0ZWQ6IHRydWUsXG4gICAgICAgICAgICBtYW50aXNzYTogMFxuICAgICAgICB9XG4gICAgfVxufTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBnbG9iYWxTdGF0ZSA9IHJlcXVpcmUoXCIuL2dsb2JhbFN0YXRlXCIpO1xuY29uc3QgdmFsaWRhdGluZyA9IHJlcXVpcmUoXCIuL3ZhbGlkYXRpbmdcIik7XG5jb25zdCBwYXJzaW5nID0gcmVxdWlyZShcIi4vcGFyc2luZ1wiKTtcblxuY29uc3QgYmluYXJ5U3VmZml4ZXMgPSBbXCJCXCIsIFwiS2lCXCIsIFwiTWlCXCIsIFwiR2lCXCIsIFwiVGlCXCIsIFwiUGlCXCIsIFwiRWlCXCIsIFwiWmlCXCIsIFwiWWlCXCJdO1xuY29uc3QgZGVjaW1hbFN1ZmZpeGVzID0gW1wiQlwiLCBcIktCXCIsIFwiTUJcIiwgXCJHQlwiLCBcIlRCXCIsIFwiUEJcIiwgXCJFQlwiLCBcIlpCXCIsIFwiWUJcIl07XG5jb25zdCBieXRlcyA9IHtcbiAgICBnZW5lcmFsOiB7c2NhbGU6IDEwMjQsIHN1ZmZpeGVzOiBkZWNpbWFsU3VmZml4ZXMsIG1hcmtlcjogXCJiZFwifSxcbiAgICBiaW5hcnk6IHtzY2FsZTogMTAyNCwgc3VmZml4ZXM6IGJpbmFyeVN1ZmZpeGVzLCBtYXJrZXI6IFwiYlwifSxcbiAgICBkZWNpbWFsOiB7c2NhbGU6IDEwMDAsIHN1ZmZpeGVzOiBkZWNpbWFsU3VmZml4ZXMsIG1hcmtlcjogXCJkXCJ9XG59O1xuXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgICB0b3RhbExlbmd0aDogMCxcbiAgICBjaGFyYWN0ZXJpc3RpYzogMCxcbiAgICBmb3JjZUF2ZXJhZ2U6IGZhbHNlLFxuICAgIGF2ZXJhZ2U6IGZhbHNlLFxuICAgIG1hbnRpc3NhOiAtMSxcbiAgICBvcHRpb25hbE1hbnRpc3NhOiB0cnVlLFxuICAgIHRob3VzYW5kU2VwYXJhdGVkOiBmYWxzZSxcbiAgICBzcGFjZVNlcGFyYXRlZDogZmFsc2UsXG4gICAgbmVnYXRpdmU6IFwic2lnblwiLFxuICAgIGZvcmNlU2lnbjogZmFsc2Vcbn07XG5cbi8qKlxuICogRW50cnkgcG9pbnQuIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYWNjb3JkaW5nIHRvIHRoZSBQUk9WSURFREZPUk1BVC5cbiAqIFRoaXMgbWV0aG9kIGVuc3VyZSB0aGUgcHJlZml4IGFuZCBwb3N0Zml4IGFyZSBhZGRlZCBhcyB0aGUgbGFzdCBzdGVwLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fHN0cmluZ30gW3Byb3ZpZGVkRm9ybWF0XSAtIHNwZWNpZmljYXRpb24gZm9yIGZvcm1hdHRpbmdcbiAqIEBwYXJhbSBudW1icm8gLSB0aGUgbnVtYnJvIHNpbmdsZXRvblxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXQoaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0ID0ge30sIG51bWJybykge1xuICAgIGlmICh0eXBlb2YgcHJvdmlkZWRGb3JtYXQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcHJvdmlkZWRGb3JtYXQgPSBwYXJzaW5nLnBhcnNlRm9ybWF0KHByb3ZpZGVkRm9ybWF0KTtcbiAgICB9XG5cbiAgICBsZXQgdmFsaWQgPSB2YWxpZGF0aW5nLnZhbGlkYXRlRm9ybWF0KHByb3ZpZGVkRm9ybWF0KTtcblxuICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgcmV0dXJuIFwiRVJST1I6IGludmFsaWQgZm9ybWF0XCI7XG4gICAgfVxuXG4gICAgbGV0IHByZWZpeCA9IHByb3ZpZGVkRm9ybWF0LnByZWZpeCB8fCBcIlwiO1xuICAgIGxldCBwb3N0Zml4ID0gcHJvdmlkZWRGb3JtYXQucG9zdGZpeCB8fCBcIlwiO1xuXG4gICAgbGV0IG91dHB1dCA9IGZvcm1hdE51bWJybyhpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIG51bWJybyk7XG4gICAgb3V0cHV0ID0gaW5zZXJ0UHJlZml4KG91dHB1dCwgcHJlZml4KTtcbiAgICBvdXRwdXQgPSBpbnNlcnRQb3N0Zml4KG91dHB1dCwgcG9zdGZpeCk7XG4gICAgcmV0dXJuIG91dHB1dDtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHByb3ZpZGVkIElOU1RBTkNFIGFjY29yZGluZyB0byB0aGUgUFJPVklERURGT1JNQVQuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGZvcm1hdFxuICogQHBhcmFtIHt7fX0gcHJvdmlkZWRGb3JtYXQgLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0gbnVtYnJvIC0gdGhlIG51bWJybyBzaW5nbGV0b25cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybWF0TnVtYnJvKGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgbnVtYnJvKSB7XG4gICAgc3dpdGNoIChwcm92aWRlZEZvcm1hdC5vdXRwdXQpIHtcbiAgICAgICAgY2FzZSBcImN1cnJlbmN5XCI6IHtcbiAgICAgICAgICAgIHByb3ZpZGVkRm9ybWF0ID0gZm9ybWF0T3JEZWZhdWx0KHByb3ZpZGVkRm9ybWF0LCBnbG9iYWxTdGF0ZS5jdXJyZW50Q3VycmVuY3lEZWZhdWx0Rm9ybWF0KCkpO1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdEN1cnJlbmN5KGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgZ2xvYmFsU3RhdGUsIG51bWJybyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcInBlcmNlbnRcIjoge1xuICAgICAgICAgICAgcHJvdmlkZWRGb3JtYXQgPSBmb3JtYXRPckRlZmF1bHQocHJvdmlkZWRGb3JtYXQsIGdsb2JhbFN0YXRlLmN1cnJlbnRQZXJjZW50YWdlRGVmYXVsdEZvcm1hdCgpKTtcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRQZXJjZW50YWdlKGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgZ2xvYmFsU3RhdGUsIG51bWJybyk7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBcImJ5dGVcIjpcbiAgICAgICAgICAgIHByb3ZpZGVkRm9ybWF0ID0gZm9ybWF0T3JEZWZhdWx0KHByb3ZpZGVkRm9ybWF0LCBnbG9iYWxTdGF0ZS5jdXJyZW50Qnl0ZURlZmF1bHRGb3JtYXQoKSk7XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0Qnl0ZShpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIGdsb2JhbFN0YXRlLCBudW1icm8pO1xuICAgICAgICBjYXNlIFwidGltZVwiOlxuICAgICAgICAgICAgcHJvdmlkZWRGb3JtYXQgPSBmb3JtYXRPckRlZmF1bHQocHJvdmlkZWRGb3JtYXQsIGdsb2JhbFN0YXRlLmN1cnJlbnRUaW1lRGVmYXVsdEZvcm1hdCgpKTtcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRUaW1lKGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgZ2xvYmFsU3RhdGUsIG51bWJybyk7XG4gICAgICAgIGNhc2UgXCJvcmRpbmFsXCI6XG4gICAgICAgICAgICBwcm92aWRlZEZvcm1hdCA9IGZvcm1hdE9yRGVmYXVsdChwcm92aWRlZEZvcm1hdCwgZ2xvYmFsU3RhdGUuY3VycmVudE9yZGluYWxEZWZhdWx0Rm9ybWF0KCkpO1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE9yZGluYWwoaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBnbG9iYWxTdGF0ZSwgbnVtYnJvKTtcbiAgICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdE51bWJlcih7XG4gICAgICAgICAgICAgICAgaW5zdGFuY2UsXG4gICAgICAgICAgICAgICAgcHJvdmlkZWRGb3JtYXQsXG4gICAgICAgICAgICAgICAgbnVtYnJvXG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qKlxuICogR2V0IHRoZSBkZWNpbWFsIGJ5dGUgdW5pdCAoTUIpIGZvciB0aGUgcHJvdmlkZWQgbnVtYnJvIElOU1RBTkNFLlxuICogV2UgZ28gZnJvbSBvbmUgdW5pdCB0byBhbm90aGVyIHVzaW5nIHRoZSBkZWNpbWFsIHN5c3RlbSAoMTAwMCkuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGNvbXB1dGVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0RGVjaW1hbEJ5dGVVbml0KGluc3RhbmNlKSB7XG4gICAgbGV0IGRhdGEgPSBieXRlcy5kZWNpbWFsO1xuICAgIHJldHVybiBnZXRGb3JtYXRCeXRlVW5pdHMoaW5zdGFuY2UuX3ZhbHVlLCBkYXRhLnN1ZmZpeGVzLCBkYXRhLnNjYWxlKS5zdWZmaXg7XG59XG5cbi8qKlxuICogR2V0IHRoZSBiaW5hcnkgYnl0ZSB1bml0IChNaUIpIGZvciB0aGUgcHJvdmlkZWQgbnVtYnJvIElOU1RBTkNFLlxuICogV2UgZ28gZnJvbSBvbmUgdW5pdCB0byBhbm90aGVyIHVzaW5nIHRoZSBkZWNpbWFsIHN5c3RlbSAoMTAyNCkuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGNvbXB1dGVcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0QmluYXJ5Qnl0ZVVuaXQoaW5zdGFuY2UpIHtcbiAgICBsZXQgZGF0YSA9IGJ5dGVzLmJpbmFyeTtcbiAgICByZXR1cm4gZ2V0Rm9ybWF0Qnl0ZVVuaXRzKGluc3RhbmNlLl92YWx1ZSwgZGF0YS5zdWZmaXhlcywgZGF0YS5zY2FsZSkuc3VmZml4O1xufVxuXG4vKipcbiAqIEdldCB0aGUgZGVjaW1hbCBieXRlIHVuaXQgKE1CKSBmb3IgdGhlIHByb3ZpZGVkIG51bWJybyBJTlNUQU5DRS5cbiAqIFdlIGdvIGZyb20gb25lIHVuaXQgdG8gYW5vdGhlciB1c2luZyB0aGUgZGVjaW1hbCBzeXN0ZW0gKDEwMjQpLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBjb21wdXRlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldEJ5dGVVbml0KGluc3RhbmNlKSB7XG4gICAgbGV0IGRhdGEgPSBieXRlcy5nZW5lcmFsO1xuICAgIHJldHVybiBnZXRGb3JtYXRCeXRlVW5pdHMoaW5zdGFuY2UuX3ZhbHVlLCBkYXRhLnN1ZmZpeGVzLCBkYXRhLnNjYWxlKS5zdWZmaXg7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSB2YWx1ZSBhbmQgdGhlIHN1ZmZpeCBjb21wdXRlZCBpbiBieXRlLlxuICogSXQgdXNlcyB0aGUgU1VGRklYRVMgYW5kIHRoZSBTQ0FMRSBwcm92aWRlZC5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBOdW1iZXIgdG8gZm9ybWF0XG4gKiBAcGFyYW0ge1tTdHJpbmddfSBzdWZmaXhlcyAtIExpc3Qgb2Ygc3VmZml4ZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBzY2FsZSAtIE51bWJlciBpbi1iZXR3ZWVuIHR3byB1bml0c1xuICogQHJldHVybiB7e3ZhbHVlOiBOdW1iZXIsIHN1ZmZpeDogU3RyaW5nfX1cbiAqL1xuZnVuY3Rpb24gZ2V0Rm9ybWF0Qnl0ZVVuaXRzKHZhbHVlLCBzdWZmaXhlcywgc2NhbGUpIHtcbiAgICBsZXQgc3VmZml4ID0gc3VmZml4ZXNbMF07XG4gICAgbGV0IGFicyA9IE1hdGguYWJzKHZhbHVlKTtcblxuICAgIGlmIChhYnMgPj0gc2NhbGUpIHtcbiAgICAgICAgZm9yIChsZXQgcG93ZXIgPSAxOyBwb3dlciA8IHN1ZmZpeGVzLmxlbmd0aDsgKytwb3dlcikge1xuICAgICAgICAgICAgbGV0IG1pbiA9IE1hdGgucG93KHNjYWxlLCBwb3dlcik7XG4gICAgICAgICAgICBsZXQgbWF4ID0gTWF0aC5wb3coc2NhbGUsIHBvd2VyICsgMSk7XG5cbiAgICAgICAgICAgIGlmIChhYnMgPj0gbWluICYmIGFicyA8IG1heCkge1xuICAgICAgICAgICAgICAgIHN1ZmZpeCA9IHN1ZmZpeGVzW3Bvd2VyXTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHZhbHVlIC8gbWluO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsdWVzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBbc2NhbGVdIFlCIG5ldmVyIHNldCB0aGUgc3VmZml4XG4gICAgICAgIGlmIChzdWZmaXggPT09IHN1ZmZpeGVzWzBdKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlIC8gTWF0aC5wb3coc2NhbGUsIHN1ZmZpeGVzLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgc3VmZml4ID0gc3VmZml4ZXNbc3VmZml4ZXMubGVuZ3RoIC0gMV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge3ZhbHVlLCBzdWZmaXh9O1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYXMgYnl0ZXMgdXNpbmcgdGhlIFBST1ZJREVERk9STUFULCBhbmQgU1RBVEUuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGZvcm1hdFxuICogQHBhcmFtIHt7fX0gcHJvdmlkZWRGb3JtYXQgLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge2dsb2JhbFN0YXRlfSBzdGF0ZSAtIHNoYXJlZCBzdGF0ZSBvZiB0aGUgbGlicmFyeVxuICogQHBhcmFtIG51bWJybyAtIHRoZSBudW1icm8gc2luZ2xldG9uXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdEJ5dGUoaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBzdGF0ZSwgbnVtYnJvKSB7XG4gICAgbGV0IGJhc2UgPSBwcm92aWRlZEZvcm1hdC5iYXNlIHx8IFwiYmluYXJ5XCI7XG4gICAgbGV0IGJhc2VJbmZvID0gYnl0ZXNbYmFzZV07XG5cbiAgICBsZXQge3ZhbHVlLCBzdWZmaXh9ID0gZ2V0Rm9ybWF0Qnl0ZVVuaXRzKGluc3RhbmNlLl92YWx1ZSwgYmFzZUluZm8uc3VmZml4ZXMsIGJhc2VJbmZvLnNjYWxlKTtcbiAgICBsZXQgb3V0cHV0ID0gZm9ybWF0TnVtYmVyKHtcbiAgICAgICAgaW5zdGFuY2U6IG51bWJybyh2YWx1ZSksXG4gICAgICAgIHByb3ZpZGVkRm9ybWF0LFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgZGVmYXVsdHM6IHN0YXRlLmN1cnJlbnRCeXRlRGVmYXVsdEZvcm1hdCgpXG4gICAgfSk7XG4gICAgbGV0IGFiYnJldmlhdGlvbnMgPSBzdGF0ZS5jdXJyZW50QWJicmV2aWF0aW9ucygpO1xuICAgIHJldHVybiBgJHtvdXRwdXR9JHthYmJyZXZpYXRpb25zLnNwYWNlZCA/IFwiIFwiIDogXCJcIn0ke3N1ZmZpeH1gO1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYXMgYW4gb3JkaW5hbCB1c2luZyB0aGUgUFJPVklERURGT1JNQVQsXG4gKiBhbmQgdGhlIFNUQVRFLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IHByb3ZpZGVkRm9ybWF0IC0gc3BlY2lmaWNhdGlvbiBmb3IgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtnbG9iYWxTdGF0ZX0gc3RhdGUgLSBzaGFyZWQgc3RhdGUgb2YgdGhlIGxpYnJhcnlcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybWF0T3JkaW5hbChpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIHN0YXRlKSB7XG4gICAgbGV0IG9yZGluYWxGbiA9IHN0YXRlLmN1cnJlbnRPcmRpbmFsKCk7XG4gICAgbGV0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgcHJvdmlkZWRGb3JtYXQpO1xuXG4gICAgbGV0IG91dHB1dCA9IGZvcm1hdE51bWJlcih7XG4gICAgICAgIGluc3RhbmNlLFxuICAgICAgICBwcm92aWRlZEZvcm1hdCxcbiAgICAgICAgc3RhdGVcbiAgICB9KTtcbiAgICBsZXQgb3JkaW5hbCA9IG9yZGluYWxGbihpbnN0YW5jZS5fdmFsdWUpO1xuXG4gICAgcmV0dXJuIGAke291dHB1dH0ke29wdGlvbnMuc3BhY2VTZXBhcmF0ZWQgPyBcIiBcIiA6IFwiXCJ9JHtvcmRpbmFsfWA7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBwcm92aWRlZCBJTlNUQU5DRSBhcyBhIHRpbWUgSEg6TU06U1MuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGZvcm1hdFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXRUaW1lKGluc3RhbmNlKSB7XG4gICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcihpbnN0YW5jZS5fdmFsdWUgLyA2MCAvIDYwKTtcbiAgICBsZXQgbWludXRlcyA9IE1hdGguZmxvb3IoKGluc3RhbmNlLl92YWx1ZSAtIChob3VycyAqIDYwICogNjApKSAvIDYwKTtcbiAgICBsZXQgc2Vjb25kcyA9IE1hdGgucm91bmQoaW5zdGFuY2UuX3ZhbHVlIC0gKGhvdXJzICogNjAgKiA2MCkgLSAobWludXRlcyAqIDYwKSk7XG4gICAgcmV0dXJuIGAke2hvdXJzfTokeyhtaW51dGVzIDwgMTApID8gXCIwXCIgOiBcIlwifSR7bWludXRlc306JHsoc2Vjb25kcyA8IDEwKSA/IFwiMFwiIDogXCJcIn0ke3NlY29uZHN9YDtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHByb3ZpZGVkIElOU1RBTkNFIGFzIGEgcGVyY2VudGFnZSB1c2luZyB0aGUgUFJPVklERURGT1JNQVQsXG4gKiBhbmQgdGhlIFNUQVRFLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IHByb3ZpZGVkRm9ybWF0IC0gc3BlY2lmaWNhdGlvbiBmb3IgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtnbG9iYWxTdGF0ZX0gc3RhdGUgLSBzaGFyZWQgc3RhdGUgb2YgdGhlIGxpYnJhcnlcbiAqIEBwYXJhbSBudW1icm8gLSB0aGUgbnVtYnJvIHNpbmdsZXRvblxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXRQZXJjZW50YWdlKGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgc3RhdGUsIG51bWJybykge1xuICAgIGxldCBwcmVmaXhTeW1ib2wgPSBwcm92aWRlZEZvcm1hdC5wcmVmaXhTeW1ib2w7XG5cbiAgICBsZXQgb3V0cHV0ID0gZm9ybWF0TnVtYmVyKHtcbiAgICAgICAgaW5zdGFuY2U6IG51bWJybyhpbnN0YW5jZS5fdmFsdWUgKiAxMDApLFxuICAgICAgICBwcm92aWRlZEZvcm1hdCxcbiAgICAgICAgc3RhdGVcbiAgICB9KTtcbiAgICBsZXQgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBwcm92aWRlZEZvcm1hdCk7XG5cbiAgICBpZiAocHJlZml4U3ltYm9sKSB7XG4gICAgICAgIHJldHVybiBgJSR7b3B0aW9ucy5zcGFjZVNlcGFyYXRlZCA/IFwiIFwiIDogXCJcIn0ke291dHB1dH1gO1xuICAgIH1cblxuICAgIHJldHVybiBgJHtvdXRwdXR9JHtvcHRpb25zLnNwYWNlU2VwYXJhdGVkID8gXCIgXCIgOiBcIlwifSVgO1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYXMgYSBwZXJjZW50YWdlIHVzaW5nIHRoZSBQUk9WSURFREZPUk1BVCxcbiAqIGFuZCB0aGUgU1RBVEUuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGZvcm1hdFxuICogQHBhcmFtIHt7fX0gcHJvdmlkZWRGb3JtYXQgLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge2dsb2JhbFN0YXRlfSBzdGF0ZSAtIHNoYXJlZCBzdGF0ZSBvZiB0aGUgbGlicmFyeVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXRDdXJyZW5jeShpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIHN0YXRlKSB7XG4gICAgY29uc3QgY3VycmVudEN1cnJlbmN5ID0gc3RhdGUuY3VycmVudEN1cnJlbmN5KCk7XG4gICAgbGV0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgcHJvdmlkZWRGb3JtYXQpO1xuICAgIGxldCBkZWNpbWFsU2VwYXJhdG9yID0gdW5kZWZpbmVkO1xuICAgIGxldCBzcGFjZSA9IFwiXCI7XG4gICAgbGV0IGF2ZXJhZ2UgPSAhIW9wdGlvbnMudG90YWxMZW5ndGggfHwgISFvcHRpb25zLmZvcmNlQXZlcmFnZSB8fCBvcHRpb25zLmF2ZXJhZ2U7XG5cbiAgICBpZiAob3B0aW9ucy5zcGFjZVNlcGFyYXRlZCkge1xuICAgICAgICBzcGFjZSA9IFwiIFwiO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50Q3VycmVuY3kucG9zaXRpb24gPT09IFwiaW5maXhcIikge1xuICAgICAgICBkZWNpbWFsU2VwYXJhdG9yID0gc3BhY2UgKyBjdXJyZW50Q3VycmVuY3kuc3ltYm9sICsgc3BhY2U7XG4gICAgfVxuXG4gICAgbGV0IG91dHB1dCA9IGZvcm1hdE51bWJlcih7XG4gICAgICAgIGluc3RhbmNlLFxuICAgICAgICBwcm92aWRlZEZvcm1hdCxcbiAgICAgICAgc3RhdGUsXG4gICAgICAgIGRlY2ltYWxTZXBhcmF0b3JcbiAgICB9KTtcblxuICAgIGlmIChjdXJyZW50Q3VycmVuY3kucG9zaXRpb24gPT09IFwicHJlZml4XCIpIHtcbiAgICAgICAgaWYgKGluc3RhbmNlLl92YWx1ZSA8IDAgJiYgb3B0aW9ucy5uZWdhdGl2ZSA9PT0gXCJzaWduXCIpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IGAtJHtzcGFjZX0ke2N1cnJlbnRDdXJyZW5jeS5zeW1ib2x9JHtvdXRwdXQuc2xpY2UoMSl9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dHB1dCA9IGN1cnJlbnRDdXJyZW5jeS5zeW1ib2wgKyBzcGFjZSArIG91dHB1dDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmICghY3VycmVudEN1cnJlbmN5LnBvc2l0aW9uIHx8IGN1cnJlbnRDdXJyZW5jeS5wb3NpdGlvbiA9PT0gXCJwb3N0Zml4XCIpIHtcbiAgICAgICAgc3BhY2UgPSBhdmVyYWdlID8gXCJcIiA6IHNwYWNlO1xuICAgICAgICBvdXRwdXQgPSBvdXRwdXQgKyBzcGFjZSArIGN1cnJlbnRDdXJyZW5jeS5zeW1ib2w7XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dDtcbn1cblxuLyoqXG4gKiBDb21wdXRlIHRoZSBhdmVyYWdlIHZhbHVlIG91dCBvZiBWQUxVRS5cbiAqIFRoZSBvdGhlciBwYXJhbWV0ZXJzIGFyZSBjb21wdXRhdGlvbiBvcHRpb25zLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIHZhbHVlIHRvIGNvbXB1dGVcbiAqIEBwYXJhbSB7c3RyaW5nfSBbZm9yY2VBdmVyYWdlXSAtIGZvcmNlZCB1bml0IHVzZWQgdG8gY29tcHV0ZVxuICogQHBhcmFtIHt7fX0gYWJicmV2aWF0aW9ucyAtIHBhcnQgb2YgdGhlIGxhbmd1YWdlIHNwZWNpZmljYXRpb25cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc3BhY2VTZXBhcmF0ZWQgLSBgdHJ1ZWAgaWYgYSBzcGFjZSBtdXN0IGJlIGluc2VydGVkIGJldHdlZW4gdGhlIHZhbHVlIGFuZCB0aGUgYWJicmV2aWF0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gW3RvdGFsTGVuZ3RoXSAtIHRvdGFsIGxlbmd0aCBvZiB0aGUgb3V0cHV0IGluY2x1ZGluZyB0aGUgY2hhcmFjdGVyaXN0aWMgYW5kIHRoZSBtYW50aXNzYVxuICogQHJldHVybiB7e3ZhbHVlOiBudW1iZXIsIGFiYnJldmlhdGlvbjogc3RyaW5nLCBtYW50aXNzYVByZWNpc2lvbjogbnVtYmVyfX1cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUF2ZXJhZ2Uoe3ZhbHVlLCBmb3JjZUF2ZXJhZ2UsIGFiYnJldmlhdGlvbnMsIHNwYWNlU2VwYXJhdGVkID0gZmFsc2UsIHRvdGFsTGVuZ3RoID0gMH0pIHtcbiAgICBsZXQgYWJicmV2aWF0aW9uID0gXCJcIjtcbiAgICBsZXQgYWJzID0gTWF0aC5hYnModmFsdWUpO1xuICAgIGxldCBtYW50aXNzYVByZWNpc2lvbiA9IC0xO1xuXG4gICAgaWYgKChhYnMgPj0gTWF0aC5wb3coMTAsIDEyKSAmJiAhZm9yY2VBdmVyYWdlKSB8fCAoZm9yY2VBdmVyYWdlID09PSBcInRyaWxsaW9uXCIpKSB7XG4gICAgICAgIC8vIHRyaWxsaW9uXG4gICAgICAgIGFiYnJldmlhdGlvbiA9IGFiYnJldmlhdGlvbnMudHJpbGxpb247XG4gICAgICAgIHZhbHVlID0gdmFsdWUgLyBNYXRoLnBvdygxMCwgMTIpO1xuICAgIH0gZWxzZSBpZiAoKGFicyA8IE1hdGgucG93KDEwLCAxMikgJiYgYWJzID49IE1hdGgucG93KDEwLCA5KSAmJiAhZm9yY2VBdmVyYWdlKSB8fCAoZm9yY2VBdmVyYWdlID09PSBcImJpbGxpb25cIikpIHtcbiAgICAgICAgLy8gYmlsbGlvblxuICAgICAgICBhYmJyZXZpYXRpb24gPSBhYmJyZXZpYXRpb25zLmJpbGxpb247XG4gICAgICAgIHZhbHVlID0gdmFsdWUgLyBNYXRoLnBvdygxMCwgOSk7XG4gICAgfSBlbHNlIGlmICgoYWJzIDwgTWF0aC5wb3coMTAsIDkpICYmIGFicyA+PSBNYXRoLnBvdygxMCwgNikgJiYgIWZvcmNlQXZlcmFnZSkgfHwgKGZvcmNlQXZlcmFnZSA9PT0gXCJtaWxsaW9uXCIpKSB7XG4gICAgICAgIC8vIG1pbGxpb25cbiAgICAgICAgYWJicmV2aWF0aW9uID0gYWJicmV2aWF0aW9ucy5taWxsaW9uO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlIC8gTWF0aC5wb3coMTAsIDYpO1xuICAgIH0gZWxzZSBpZiAoKGFicyA8IE1hdGgucG93KDEwLCA2KSAmJiBhYnMgPj0gTWF0aC5wb3coMTAsIDMpICYmICFmb3JjZUF2ZXJhZ2UpIHx8IChmb3JjZUF2ZXJhZ2UgPT09IFwidGhvdXNhbmRcIikpIHtcbiAgICAgICAgLy8gdGhvdXNhbmRcbiAgICAgICAgYWJicmV2aWF0aW9uID0gYWJicmV2aWF0aW9ucy50aG91c2FuZDtcbiAgICAgICAgdmFsdWUgPSB2YWx1ZSAvIE1hdGgucG93KDEwLCAzKTtcbiAgICB9XG5cbiAgICBsZXQgb3B0aW9uYWxTcGFjZSA9IHNwYWNlU2VwYXJhdGVkID8gXCIgXCIgOiBcIlwiO1xuXG4gICAgaWYgKGFiYnJldmlhdGlvbikge1xuICAgICAgICBhYmJyZXZpYXRpb24gPSBvcHRpb25hbFNwYWNlICsgYWJicmV2aWF0aW9uO1xuICAgIH1cblxuICAgIGlmICh0b3RhbExlbmd0aCkge1xuICAgICAgICBsZXQgY2hhcmFjdGVyaXN0aWMgPSB2YWx1ZS50b1N0cmluZygpLnNwbGl0KFwiLlwiKVswXTtcbiAgICAgICAgbWFudGlzc2FQcmVjaXNpb24gPSBNYXRoLm1heCh0b3RhbExlbmd0aCAtIGNoYXJhY3RlcmlzdGljLmxlbmd0aCwgMCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHt2YWx1ZSwgYWJicmV2aWF0aW9uLCBtYW50aXNzYVByZWNpc2lvbn07XG59XG5cbi8qKlxuICogQ29tcHV0ZSBhbiBleHBvbmVudGlhbCBmb3JtIGZvciBWQUxVRSwgdGFraW5nIGludG8gYWNjb3VudCBDSEFSQUNURVJJU1RJQ1xuICogaWYgcHJvdmlkZWQuXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSB2YWx1ZSB0byBjb21wdXRlXG4gKiBAcGFyYW0ge251bWJlcn0gW2NoYXJhY3RlcmlzdGljUHJlY2lzaW9uXSAtIG9wdGlvbmFsIGNoYXJhY3RlcmlzdGljIGxlbmd0aFxuICogQHJldHVybiB7e3ZhbHVlOiBudW1iZXIsIGFiYnJldmlhdGlvbjogc3RyaW5nfX1cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUV4cG9uZW50aWFsKHt2YWx1ZSwgY2hhcmFjdGVyaXN0aWNQcmVjaXNpb24gPSAwfSkge1xuICAgIGxldCBbbnVtYmVyU3RyaW5nLCBleHBvbmVudGlhbF0gPSB2YWx1ZS50b0V4cG9uZW50aWFsKCkuc3BsaXQoXCJlXCIpO1xuICAgIGxldCBudW1iZXIgPSArbnVtYmVyU3RyaW5nO1xuXG4gICAgaWYgKCFjaGFyYWN0ZXJpc3RpY1ByZWNpc2lvbikge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmFsdWU6IG51bWJlcixcbiAgICAgICAgICAgIGFiYnJldmlhdGlvbjogYGUke2V4cG9uZW50aWFsfWBcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBsZXQgY2hhcmFjdGVyaXN0aWNMZW5ndGggPSAxOyAvLyBzZWUgYHRvRXhwb25lbnRpYWxgXG5cbiAgICBpZiAoY2hhcmFjdGVyaXN0aWNMZW5ndGggPCBjaGFyYWN0ZXJpc3RpY1ByZWNpc2lvbikge1xuICAgICAgICBudW1iZXIgPSBudW1iZXIgKiBNYXRoLnBvdygxMCwgY2hhcmFjdGVyaXN0aWNQcmVjaXNpb24gLSBjaGFyYWN0ZXJpc3RpY0xlbmd0aCk7XG4gICAgICAgIGV4cG9uZW50aWFsID0gK2V4cG9uZW50aWFsIC0gKGNoYXJhY3RlcmlzdGljUHJlY2lzaW9uIC0gY2hhcmFjdGVyaXN0aWNMZW5ndGgpO1xuICAgICAgICBleHBvbmVudGlhbCA9IGV4cG9uZW50aWFsID49IDAgPyBgKyR7ZXhwb25lbnRpYWx9YCA6IGV4cG9uZW50aWFsO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiBudW1iZXIsXG4gICAgICAgIGFiYnJldmlhdGlvbjogYGUke2V4cG9uZW50aWFsfWBcbiAgICB9O1xufVxuXG4vKipcbiAqIFJldHVybiBhIHN0cmluZyBvZiBOVU1CRVIgemVyby5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gbnVtYmVyIC0gTGVuZ3RoIG9mIHRoZSBvdXRwdXRcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gemVyb2VzKG51bWJlcikge1xuICAgIGxldCByZXN1bHQgPSBcIlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbnVtYmVyOyBpKyspIHtcbiAgICAgICAgcmVzdWx0ICs9IFwiMFwiO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyBWQUxVRSB3aXRoIGEgUFJFQ0lTSU9OLWxvbmcgbWFudGlzc2EuXG4gKiBUaGlzIG1ldGhvZCBpcyBmb3IgbGFyZ2Uvc21hbGwgbnVtYmVycyBvbmx5IChhLmsuYS4gaW5jbHVkaW5nIGEgXCJlXCIpLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIG51bWJlciB0byBwcmVjaXNlXG4gKiBAcGFyYW0ge251bWJlcn0gcHJlY2lzaW9uIC0gZGVzaXJlZCBsZW5ndGggZm9yIHRoZSBtYW50aXNzYVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiB0b0ZpeGVkTGFyZ2UodmFsdWUsIHByZWNpc2lvbikge1xuICAgIGxldCByZXN1bHQgPSB2YWx1ZS50b1N0cmluZygpO1xuXG4gICAgbGV0IFtiYXNlLCBleHBdID0gcmVzdWx0LnNwbGl0KFwiZVwiKTtcblxuICAgIGxldCBbY2hhcmFjdGVyaXN0aWMsIG1hbnRpc3NhID0gXCJcIl0gPSBiYXNlLnNwbGl0KFwiLlwiKTtcblxuICAgIGlmICgrZXhwID4gMCkge1xuICAgICAgICByZXN1bHQgPSBjaGFyYWN0ZXJpc3RpYyArIG1hbnRpc3NhICsgemVyb2VzKGV4cCAtIG1hbnRpc3NhLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IHByZWZpeCA9IFwiLlwiO1xuXG4gICAgICAgIGlmICgrY2hhcmFjdGVyaXN0aWMgPCAwKSB7XG4gICAgICAgICAgICBwcmVmaXggPSBgLTAke3ByZWZpeH1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJlZml4ID0gYDAke3ByZWZpeH1gO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHN1ZmZpeCA9ICh6ZXJvZXMoLWV4cCAtIDEpICsgTWF0aC5hYnMoY2hhcmFjdGVyaXN0aWMpICsgbWFudGlzc2EpLnN1YnN0cigwLCBwcmVjaXNpb24pO1xuICAgICAgICBpZiAoc3VmZml4Lmxlbmd0aCA8IHByZWNpc2lvbikge1xuICAgICAgICAgICAgc3VmZml4ICs9IHplcm9lcyhwcmVjaXNpb24gLSBzdWZmaXgubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgICAgICByZXN1bHQgPSBwcmVmaXggKyBzdWZmaXg7XG4gICAgfVxuXG4gICAgaWYgKCtleHAgPiAwICYmIHByZWNpc2lvbiA+IDApIHtcbiAgICAgICAgcmVzdWx0ICs9IGAuJHt6ZXJvZXMocHJlY2lzaW9uKX1gO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbi8qKlxuICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyBWQUxVRSB3aXRoIGEgUFJFQ0lTSU9OLWxvbmcgbWFudGlzc2EuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gbnVtYmVyIHRvIHByZWNpc2VcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcmVjaXNpb24gLSBkZXNpcmVkIGxlbmd0aCBmb3IgdGhlIG1hbnRpc3NhXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHRvRml4ZWQodmFsdWUsIHByZWNpc2lvbikge1xuICAgIGlmICh2YWx1ZS50b1N0cmluZygpLmluZGV4T2YoXCJlXCIpICE9PSAtMSkge1xuICAgICAgICByZXR1cm4gdG9GaXhlZExhcmdlKHZhbHVlLCBwcmVjaXNpb24pO1xuICAgIH1cblxuICAgIHJldHVybiAoTWF0aC5yb3VuZCgrYCR7dmFsdWV9ZSske3ByZWNpc2lvbn1gKSAvIChNYXRoLnBvdygxMCwgcHJlY2lzaW9uKSkpLnRvRml4ZWQocHJlY2lzaW9uKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgT1VUUFVUIHdpdGggYSBtYW50aXNzYSBwcmVjaW9ucyBvZiBQUkVDSVNJT04uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAtIG91dHB1dCBiZWluZyBidWlsZCBpbiB0aGUgcHJvY2VzcyBvZiBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBudW1iZXIgYmVpbmcgY3VycmVudGx5IGZvcm1hdHRlZFxuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25hbE1hbnRpc3NhIC0gYHRydWVgIGlmIHRoZSBtYW50aXNzYSBpcyBvbWl0dGVkIHdoZW4gaXQncyBvbmx5IHplcm9lc1xuICogQHBhcmFtIHtudW1iZXJ9IHByZWNpc2lvbiAtIGRlc2lyZWQgcHJlY2lzaW9uIG9mIHRoZSBtYW50aXNzYVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBzZXRNYW50aXNzYVByZWNpc2lvbihvdXRwdXQsIHZhbHVlLCBvcHRpb25hbE1hbnRpc3NhLCBwcmVjaXNpb24pIHtcbiAgICBpZiAocHJlY2lzaW9uID09PSAtMSkge1xuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH1cblxuICAgIGxldCByZXN1bHQgPSB0b0ZpeGVkKHZhbHVlLCBwcmVjaXNpb24pO1xuICAgIGxldCBbY3VycmVudENoYXJhY3RlcmlzdGljLCBjdXJyZW50TWFudGlzc2EgPSBcIlwiXSA9IHJlc3VsdC50b1N0cmluZygpLnNwbGl0KFwiLlwiKTtcblxuICAgIGlmIChjdXJyZW50TWFudGlzc2EubWF0Y2goL14wKyQvKSAmJiBvcHRpb25hbE1hbnRpc3NhKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50Q2hhcmFjdGVyaXN0aWM7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdC50b1N0cmluZygpO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBPVVRQVVQgd2l0aCBhIGNoYXJhY3RlcmlzdGljIHByZWNpb25zIG9mIFBSRUNJU0lPTi5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gb3V0cHV0IC0gb3V0cHV0IGJlaW5nIGJ1aWxkIGluIHRoZSBwcm9jZXNzIG9mIGZvcm1hdHRpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIG51bWJlciBiZWluZyBjdXJyZW50bHkgZm9ybWF0dGVkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IG9wdGlvbmFsQ2hhcmFjdGVyaXN0aWMgLSBgdHJ1ZWAgaWYgdGhlIGNoYXJhY3RlcmlzdGljIGlzIG9taXR0ZWQgd2hlbiBpdCdzIG9ubHkgemVyb2VzXG4gKiBAcGFyYW0ge251bWJlcn0gcHJlY2lzaW9uIC0gZGVzaXJlZCBwcmVjaXNpb24gb2YgdGhlIGNoYXJhY3RlcmlzdGljXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHNldENoYXJhY3RlcmlzdGljUHJlY2lzaW9uKG91dHB1dCwgdmFsdWUsIG9wdGlvbmFsQ2hhcmFjdGVyaXN0aWMsIHByZWNpc2lvbikge1xuICAgIGxldCByZXN1bHQgPSBvdXRwdXQ7XG4gICAgbGV0IFtjdXJyZW50Q2hhcmFjdGVyaXN0aWMsIGN1cnJlbnRNYW50aXNzYV0gPSByZXN1bHQudG9TdHJpbmcoKS5zcGxpdChcIi5cIik7XG5cbiAgICBpZiAoY3VycmVudENoYXJhY3RlcmlzdGljLm1hdGNoKC9eLT8wJC8pICYmIG9wdGlvbmFsQ2hhcmFjdGVyaXN0aWMpIHtcbiAgICAgICAgaWYgKCFjdXJyZW50TWFudGlzc2EpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50Q2hhcmFjdGVyaXN0aWMucmVwbGFjZShcIjBcIiwgXCJcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYCR7Y3VycmVudENoYXJhY3RlcmlzdGljLnJlcGxhY2UoXCIwXCIsIFwiXCIpfS4ke2N1cnJlbnRNYW50aXNzYX1gO1xuICAgIH1cblxuICAgIGlmIChjdXJyZW50Q2hhcmFjdGVyaXN0aWMubGVuZ3RoIDwgcHJlY2lzaW9uKSB7XG4gICAgICAgIGxldCBtaXNzaW5nWmVyb3MgPSBwcmVjaXNpb24gLSBjdXJyZW50Q2hhcmFjdGVyaXN0aWMubGVuZ3RoO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG1pc3NpbmdaZXJvczsgaSsrKSB7XG4gICAgICAgICAgICByZXN1bHQgPSBgMCR7cmVzdWx0fWA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0LnRvU3RyaW5nKCk7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBpbmRleGVzIHdoZXJlIGFyZSB0aGUgZ3JvdXAgc2VwYXJhdGlvbnMgYWZ0ZXIgc3BsaXR0aW5nXG4gKiBgdG90YWxMZW5ndGhgIGluIGdyb3VwIG9mIGBncm91cFNpemVgIHNpemUuXG4gKiBJbXBvcnRhbnQ6IHdlIHN0YXJ0IGdyb3VwaW5nIGZyb20gdGhlIHJpZ2h0IGhhbmQgc2lkZS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdG90YWxMZW5ndGggLSB0b3RhbCBsZW5ndGggb2YgdGhlIGNoYXJhY3RlcmlzdGljIHRvIHNwbGl0XG4gKiBAcGFyYW0ge251bWJlcn0gZ3JvdXBTaXplIC0gbGVuZ3RoIG9mIGVhY2ggZ3JvdXBcbiAqIEByZXR1cm4ge1tudW1iZXJdfVxuICovXG5mdW5jdGlvbiBpbmRleGVzT2ZHcm91cFNwYWNlcyh0b3RhbExlbmd0aCwgZ3JvdXBTaXplKSB7XG4gICAgbGV0IHJlc3VsdCA9IFtdO1xuICAgIGxldCBjb3VudGVyID0gMDtcbiAgICBmb3IgKGxldCBpID0gdG90YWxMZW5ndGg7IGkgPiAwOyBpLS0pIHtcbiAgICAgICAgaWYgKGNvdW50ZXIgPT09IGdyb3VwU2l6ZSkge1xuICAgICAgICAgICAgcmVzdWx0LnVuc2hpZnQoaSk7XG4gICAgICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgfVxuICAgICAgICBjb3VudGVyKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBSZXBsYWNlIHRoZSBkZWNpbWFsIHNlcGFyYXRvciB3aXRoIERFQ0lNQUxTRVBBUkFUT1IgYW5kIGluc2VydCB0aG91c2FuZFxuICogc2VwYXJhdG9ycy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gb3V0cHV0IC0gb3V0cHV0IGJlaW5nIGJ1aWxkIGluIHRoZSBwcm9jZXNzIG9mIGZvcm1hdHRpbmdcbiAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSAtIG51bWJlciBiZWluZyBjdXJyZW50bHkgZm9ybWF0dGVkXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHRob3VzYW5kU2VwYXJhdGVkIC0gYHRydWVgIGlmIHRoZSBjaGFyYWN0ZXJpc3RpYyBtdXN0IGJlIHNlcGFyYXRlZFxuICogQHBhcmFtIHtnbG9iYWxTdGF0ZX0gc3RhdGUgLSBzaGFyZWQgc3RhdGUgb2YgdGhlIGxpYnJhcnlcbiAqIEBwYXJhbSB7c3RyaW5nfSBkZWNpbWFsU2VwYXJhdG9yIC0gc3RyaW5nIHRvIHVzZSBhcyBkZWNpbWFsIHNlcGFyYXRvclxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZXBsYWNlRGVsaW1pdGVycyhvdXRwdXQsIHZhbHVlLCB0aG91c2FuZFNlcGFyYXRlZCwgc3RhdGUsIGRlY2ltYWxTZXBhcmF0b3IpIHtcbiAgICBsZXQgZGVsaW1pdGVycyA9IHN0YXRlLmN1cnJlbnREZWxpbWl0ZXJzKCk7XG4gICAgbGV0IHRob3VzYW5kU2VwYXJhdG9yID0gZGVsaW1pdGVycy50aG91c2FuZHM7XG4gICAgZGVjaW1hbFNlcGFyYXRvciA9IGRlY2ltYWxTZXBhcmF0b3IgfHwgZGVsaW1pdGVycy5kZWNpbWFsO1xuICAgIGxldCB0aG91c2FuZHNTaXplID0gZGVsaW1pdGVycy50aG91c2FuZHNTaXplIHx8IDM7XG5cbiAgICBsZXQgcmVzdWx0ID0gb3V0cHV0LnRvU3RyaW5nKCk7XG4gICAgbGV0IGNoYXJhY3RlcmlzdGljID0gcmVzdWx0LnNwbGl0KFwiLlwiKVswXTtcbiAgICBsZXQgbWFudGlzc2EgPSByZXN1bHQuc3BsaXQoXCIuXCIpWzFdO1xuXG4gICAgaWYgKHRob3VzYW5kU2VwYXJhdGVkKSB7XG4gICAgICAgIGlmICh2YWx1ZSA8IDApIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgbWludXMgc2lnblxuICAgICAgICAgICAgY2hhcmFjdGVyaXN0aWMgPSBjaGFyYWN0ZXJpc3RpYy5zbGljZSgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbmRleGVzVG9JbnNlcnRUaG91c2FuZERlbGltaXRlcnMgPSBpbmRleGVzT2ZHcm91cFNwYWNlcyhjaGFyYWN0ZXJpc3RpYy5sZW5ndGgsIHRob3VzYW5kc1NpemUpO1xuICAgICAgICBpbmRleGVzVG9JbnNlcnRUaG91c2FuZERlbGltaXRlcnMuZm9yRWFjaCgocG9zaXRpb24sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjaGFyYWN0ZXJpc3RpYyA9IGNoYXJhY3RlcmlzdGljLnNsaWNlKDAsIHBvc2l0aW9uICsgaW5kZXgpICsgdGhvdXNhbmRTZXBhcmF0b3IgKyBjaGFyYWN0ZXJpc3RpYy5zbGljZShwb3NpdGlvbiArIGluZGV4KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHZhbHVlIDwgMCkge1xuICAgICAgICAgICAgLy8gQWRkIGJhY2sgdGhlIG1pbnVzIHNpZ25cbiAgICAgICAgICAgIGNoYXJhY3RlcmlzdGljID0gYC0ke2NoYXJhY3RlcmlzdGljfWA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIW1hbnRpc3NhKSB7XG4gICAgICAgIHJlc3VsdCA9IGNoYXJhY3RlcmlzdGljO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGNoYXJhY3RlcmlzdGljICsgZGVjaW1hbFNlcGFyYXRvciArIG1hbnRpc3NhO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEluc2VydCB0aGUgcHJvdmlkZWQgQUJCUkVWSUFUSU9OIGF0IHRoZSBlbmQgb2YgT1VUUFVULlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBvdXRwdXQgLSBvdXRwdXQgYmVpbmcgYnVpbGQgaW4gdGhlIHByb2Nlc3Mgb2YgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtzdHJpbmd9IGFiYnJldmlhdGlvbiAtIGFiYnJldmlhdGlvbiB0byBhcHBlbmRcbiAqIEByZXR1cm4geyp9XG4gKi9cbmZ1bmN0aW9uIGluc2VydEFiYnJldmlhdGlvbihvdXRwdXQsIGFiYnJldmlhdGlvbikge1xuICAgIHJldHVybiBvdXRwdXQgKyBhYmJyZXZpYXRpb247XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSBwb3NpdGl2ZS9uZWdhdGl2ZSBzaWduIGFjY29yZGluZyB0byB0aGUgTkVHQVRJVkUgZmxhZy5cbiAqIElmIHRoZSB2YWx1ZSBpcyBuZWdhdGl2ZSBidXQgc3RpbGwgb3V0cHV0IGFzIDAsIHRoZSBuZWdhdGl2ZSBzaWduIGlzIHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAtIG91dHB1dCBiZWluZyBidWlsZCBpbiB0aGUgcHJvY2VzcyBvZiBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBudW1iZXIgYmVpbmcgY3VycmVudGx5IGZvcm1hdHRlZFxuICogQHBhcmFtIHtzdHJpbmd9IG5lZ2F0aXZlIC0gZmxhZyBmb3IgdGhlIG5lZ2F0aXZlIGZvcm0gKFwic2lnblwiIG9yIFwicGFyZW50aGVzaXNcIilcbiAqIEByZXR1cm4geyp9XG4gKi9cbmZ1bmN0aW9uIGluc2VydFNpZ24ob3V0cHV0LCB2YWx1ZSwgbmVnYXRpdmUpIHtcbiAgICBpZiAodmFsdWUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICBpZiAoK291dHB1dCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb3V0cHV0LnJlcGxhY2UoXCItXCIsIFwiXCIpO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgICAgcmV0dXJuIGArJHtvdXRwdXR9YDtcbiAgICB9XG5cbiAgICBpZiAobmVnYXRpdmUgPT09IFwic2lnblwiKSB7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAoJHtvdXRwdXQucmVwbGFjZShcIi1cIiwgXCJcIil9KWA7XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSBwcm92aWRlZCBQUkVGSVggYXQgdGhlIHN0YXJ0IG9mIE9VVFBVVC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gb3V0cHV0IC0gb3V0cHV0IGJlaW5nIGJ1aWxkIGluIHRoZSBwcm9jZXNzIG9mIGZvcm1hdHRpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggLSBhYmJyZXZpYXRpb24gdG8gcHJlcGVuZFxuICogQHJldHVybiB7Kn1cbiAqL1xuZnVuY3Rpb24gaW5zZXJ0UHJlZml4KG91dHB1dCwgcHJlZml4KSB7XG4gICAgcmV0dXJuIHByZWZpeCArIG91dHB1dDtcbn1cblxuLyoqXG4gKiBJbnNlcnQgdGhlIHByb3ZpZGVkIFBPU1RGSVggYXQgdGhlIGVuZCBvZiBPVVRQVVQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAtIG91dHB1dCBiZWluZyBidWlsZCBpbiB0aGUgcHJvY2VzcyBvZiBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9zdGZpeCAtIGFiYnJldmlhdGlvbiB0byBhcHBlbmRcbiAqIEByZXR1cm4geyp9XG4gKi9cbmZ1bmN0aW9uIGluc2VydFBvc3RmaXgob3V0cHV0LCBwb3N0Zml4KSB7XG4gICAgcmV0dXJuIG91dHB1dCArIHBvc3RmaXg7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBwcm92aWRlZCBJTlNUQU5DRSBhcyBhIG51bWJlciB1c2luZyB0aGUgUFJPVklERURGT1JNQVQsXG4gKiBhbmQgdGhlIFNUQVRFLlxuICogVGhpcyBpcyB0aGUga2V5IG1ldGhvZCBvZiB0aGUgZnJhbWV3b3JrIVxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IFtwcm92aWRlZEZvcm1hdF0gLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge2dsb2JhbFN0YXRlfSBzdGF0ZSAtIHNoYXJlZCBzdGF0ZSBvZiB0aGUgbGlicmFyeVxuICogQHBhcmFtIHtzdHJpbmd9IGRlY2ltYWxTZXBhcmF0b3IgLSBzdHJpbmcgdG8gdXNlIGFzIGRlY2ltYWwgc2VwYXJhdG9yXG4gKiBAcGFyYW0ge3t9fSBkZWZhdWx0cyAtIFNldCBvZiBkZWZhdWx0IHZhbHVlcyB1c2VkIGZvciBmb3JtYXR0aW5nXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdE51bWJlcih7aW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBzdGF0ZSA9IGdsb2JhbFN0YXRlLCBkZWNpbWFsU2VwYXJhdG9yLCBkZWZhdWx0cyA9IHN0YXRlLmN1cnJlbnREZWZhdWx0cygpfSkge1xuICAgIGxldCB2YWx1ZSA9IGluc3RhbmNlLl92YWx1ZTtcblxuICAgIGlmICh2YWx1ZSA9PT0gMCAmJiBzdGF0ZS5oYXNaZXJvRm9ybWF0KCkpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmdldFplcm9Gb3JtYXQoKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzRmluaXRlKHZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG5cbiAgICBsZXQgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBkZWZhdWx0cywgcHJvdmlkZWRGb3JtYXQpO1xuXG4gICAgbGV0IHRvdGFsTGVuZ3RoID0gb3B0aW9ucy50b3RhbExlbmd0aDtcbiAgICBsZXQgY2hhcmFjdGVyaXN0aWNQcmVjaXNpb24gPSB0b3RhbExlbmd0aCA/IDAgOiBvcHRpb25zLmNoYXJhY3RlcmlzdGljO1xuICAgIGxldCBvcHRpb25hbENoYXJhY3RlcmlzdGljID0gb3B0aW9ucy5vcHRpb25hbENoYXJhY3RlcmlzdGljO1xuICAgIGxldCBmb3JjZUF2ZXJhZ2UgPSBvcHRpb25zLmZvcmNlQXZlcmFnZTtcbiAgICBsZXQgYXZlcmFnZSA9ICEhdG90YWxMZW5ndGggfHwgISFmb3JjZUF2ZXJhZ2UgfHwgb3B0aW9ucy5hdmVyYWdlO1xuXG4gICAgLy8gZGVmYXVsdCB3aGVuIGF2ZXJhZ2luZyBpcyB0byBjaG9wIG9mZiBkZWNpbWFsc1xuICAgIGxldCBtYW50aXNzYVByZWNpc2lvbiA9IHRvdGFsTGVuZ3RoID8gLTEgOiAoYXZlcmFnZSAmJiBwcm92aWRlZEZvcm1hdC5tYW50aXNzYSA9PT0gdW5kZWZpbmVkID8gMCA6IG9wdGlvbnMubWFudGlzc2EpO1xuICAgIGxldCBvcHRpb25hbE1hbnRpc3NhID0gdG90YWxMZW5ndGggPyBmYWxzZSA6IG9wdGlvbnMub3B0aW9uYWxNYW50aXNzYTtcbiAgICBsZXQgdGhvdXNhbmRTZXBhcmF0ZWQgPSBvcHRpb25zLnRob3VzYW5kU2VwYXJhdGVkO1xuICAgIGxldCBzcGFjZVNlcGFyYXRlZCA9IG9wdGlvbnMuc3BhY2VTZXBhcmF0ZWQ7XG4gICAgbGV0IG5lZ2F0aXZlID0gb3B0aW9ucy5uZWdhdGl2ZTtcbiAgICBsZXQgZm9yY2VTaWduID0gb3B0aW9ucy5mb3JjZVNpZ247XG4gICAgbGV0IGV4cG9uZW50aWFsID0gb3B0aW9ucy5leHBvbmVudGlhbDtcblxuICAgIGxldCBhYmJyZXZpYXRpb24gPSBcIlwiO1xuXG4gICAgaWYgKGF2ZXJhZ2UpIHtcbiAgICAgICAgbGV0IGRhdGEgPSBjb21wdXRlQXZlcmFnZSh7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGZvcmNlQXZlcmFnZSxcbiAgICAgICAgICAgIGFiYnJldmlhdGlvbnM6IHN0YXRlLmN1cnJlbnRBYmJyZXZpYXRpb25zKCksXG4gICAgICAgICAgICBzcGFjZVNlcGFyYXRlZDogc3BhY2VTZXBhcmF0ZWQsXG4gICAgICAgICAgICB0b3RhbExlbmd0aFxuICAgICAgICB9KTtcblxuICAgICAgICB2YWx1ZSA9IGRhdGEudmFsdWU7XG4gICAgICAgIGFiYnJldmlhdGlvbiArPSBkYXRhLmFiYnJldmlhdGlvbjtcblxuICAgICAgICBpZiAodG90YWxMZW5ndGgpIHtcbiAgICAgICAgICAgIG1hbnRpc3NhUHJlY2lzaW9uID0gZGF0YS5tYW50aXNzYVByZWNpc2lvbjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGlmIChleHBvbmVudGlhbCkge1xuICAgICAgICBsZXQgZGF0YSA9IGNvbXB1dGVFeHBvbmVudGlhbCh7XG4gICAgICAgICAgICB2YWx1ZSxcbiAgICAgICAgICAgIGNoYXJhY3RlcmlzdGljUHJlY2lzaW9uXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhbHVlID0gZGF0YS52YWx1ZTtcbiAgICAgICAgYWJicmV2aWF0aW9uID0gZGF0YS5hYmJyZXZpYXRpb24gKyBhYmJyZXZpYXRpb247XG4gICAgfVxuXG4gICAgbGV0IG91dHB1dCA9IHNldE1hbnRpc3NhUHJlY2lzaW9uKHZhbHVlLnRvU3RyaW5nKCksIHZhbHVlLCBvcHRpb25hbE1hbnRpc3NhLCBtYW50aXNzYVByZWNpc2lvbik7XG4gICAgb3V0cHV0ID0gc2V0Q2hhcmFjdGVyaXN0aWNQcmVjaXNpb24ob3V0cHV0LCB2YWx1ZSwgb3B0aW9uYWxDaGFyYWN0ZXJpc3RpYywgY2hhcmFjdGVyaXN0aWNQcmVjaXNpb24pO1xuICAgIG91dHB1dCA9IHJlcGxhY2VEZWxpbWl0ZXJzKG91dHB1dCwgdmFsdWUsIHRob3VzYW5kU2VwYXJhdGVkLCBzdGF0ZSwgZGVjaW1hbFNlcGFyYXRvcik7XG5cbiAgICBpZiAoYXZlcmFnZSB8fCBleHBvbmVudGlhbCkge1xuICAgICAgICBvdXRwdXQgPSBpbnNlcnRBYmJyZXZpYXRpb24ob3V0cHV0LCBhYmJyZXZpYXRpb24pO1xuICAgIH1cblxuICAgIGlmIChmb3JjZVNpZ24gfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgIG91dHB1dCA9IGluc2VydFNpZ24ob3V0cHV0LCB2YWx1ZSwgbmVnYXRpdmUpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbi8qKlxuICogSWYgRk9STUFUIGlzIG5vbi1udWxsIGFuZCBub3QganVzdCBhbiBvdXRwdXQsIHJldHVybiBGT1JNQVQuXG4gKiBSZXR1cm4gREVGQVVMVEZPUk1BVCBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHByb3ZpZGVkRm9ybWF0XG4gKiBAcGFyYW0gZGVmYXVsdEZvcm1hdFxuICovXG5mdW5jdGlvbiBmb3JtYXRPckRlZmF1bHQocHJvdmlkZWRGb3JtYXQsIGRlZmF1bHRGb3JtYXQpIHtcbiAgICBpZiAoIXByb3ZpZGVkRm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0Rm9ybWF0O1xuICAgIH1cblxuICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMocHJvdmlkZWRGb3JtYXQpO1xuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMSAmJiBrZXlzWzBdID09PSBcIm91dHB1dFwiKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0Rm9ybWF0O1xuICAgIH1cblxuICAgIHJldHVybiBwcm92aWRlZEZvcm1hdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAobnVtYnJvKSA9PiAoe1xuICAgIGZvcm1hdDogKC4uLmFyZ3MpID0+IGZvcm1hdCguLi5hcmdzLCBudW1icm8pLFxuICAgIGdldEJ5dGVVbml0OiAoLi4uYXJncykgPT4gZ2V0Qnl0ZVVuaXQoLi4uYXJncywgbnVtYnJvKSxcbiAgICBnZXRCaW5hcnlCeXRlVW5pdDogKC4uLmFyZ3MpID0+IGdldEJpbmFyeUJ5dGVVbml0KC4uLmFyZ3MsIG51bWJybyksXG4gICAgZ2V0RGVjaW1hbEJ5dGVVbml0OiAoLi4uYXJncykgPT4gZ2V0RGVjaW1hbEJ5dGVVbml0KC4uLmFyZ3MsIG51bWJybyksXG4gICAgZm9ybWF0T3JEZWZhdWx0XG59KTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBlblVTID0gcmVxdWlyZShcIi4vZW4tVVNcIik7XG5jb25zdCB2YWxpZGF0aW5nID0gcmVxdWlyZShcIi4vdmFsaWRhdGluZ1wiKTtcbmNvbnN0IHBhcnNpbmcgPSByZXF1aXJlKFwiLi9wYXJzaW5nXCIpO1xuXG5sZXQgc3RhdGUgPSB7fTtcblxubGV0IGN1cnJlbnRMYW5ndWFnZVRhZyA9IHVuZGVmaW5lZDtcbmxldCBsYW5ndWFnZXMgPSB7fTtcblxubGV0IHplcm9Gb3JtYXQgPSBudWxsO1xuXG5sZXQgZ2xvYmFsRGVmYXVsdHMgPSB7fTtcblxuZnVuY3Rpb24gY2hvb3NlTGFuZ3VhZ2UodGFnKSB7IGN1cnJlbnRMYW5ndWFnZVRhZyA9IHRhZzsgfVxuXG5mdW5jdGlvbiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkgeyByZXR1cm4gbGFuZ3VhZ2VzW2N1cnJlbnRMYW5ndWFnZVRhZ107IH1cblxuLyoqXG4gKiBSZXR1cm4gYWxsIHRoZSByZWdpc3RlciBsYW5ndWFnZXNcbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUubGFuZ3VhZ2VzID0gKCkgPT4gT2JqZWN0LmFzc2lnbih7fSwgbGFuZ3VhZ2VzKTtcblxuLy9cbi8vIEN1cnJlbnQgbGFuZ3VhZ2UgYWNjZXNzb3JzXG4vL1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBsYW5ndWFnZSB0YWdcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnN0YXRlLmN1cnJlbnRMYW5ndWFnZSA9ICgpID0+IGN1cnJlbnRMYW5ndWFnZVRhZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgY3VycmVuY3kgZGF0YVxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50Q3VycmVuY3kgPSAoKSA9PiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkuY3VycmVuY3k7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGxhbmd1YWdlIGFiYnJldmlhdGlvbnMgZGF0YVxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50QWJicmV2aWF0aW9ucyA9ICgpID0+IGN1cnJlbnRMYW5ndWFnZURhdGEoKS5hYmJyZXZpYXRpb25zO1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBsYW5ndWFnZSBkZWxpbWl0ZXJzIGRhdGFcbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUuY3VycmVudERlbGltaXRlcnMgPSAoKSA9PiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkuZGVsaW1pdGVycztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgbGFuZ3VhZ2Ugb3JkaW5hbCBmdW5jdGlvblxuICpcbiAqIEByZXR1cm4ge2Z1bmN0aW9ufVxuICovXG5zdGF0ZS5jdXJyZW50T3JkaW5hbCA9ICgpID0+IGN1cnJlbnRMYW5ndWFnZURhdGEoKS5vcmRpbmFsO1xuXG4vL1xuLy8gRGVmYXVsdHNcbi8vXG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGZvcm1hdHRpbmcgZGVmYXVsdHMuXG4gKiBVc2UgZmlyc3QgdXNlcyB0aGUgY3VycmVudCBsYW5ndWFnZSBkZWZhdWx0LCB0aGVuIGZhbGxiYWNrIHRvIHRoZSBnbG9iYWxseSBkZWZpbmVkIGRlZmF1bHRzLlxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50RGVmYXVsdHMgPSAoKSA9PiBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkuZGVmYXVsdHMsIGdsb2JhbERlZmF1bHRzKTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIG9yZGluYWwgZGVmYXVsdC1mb3JtYXQuXG4gKiBVc2UgZmlyc3QgdXNlcyB0aGUgY3VycmVudCBsYW5ndWFnZSBvcmRpbmFsIGRlZmF1bHQsIHRoZW4gZmFsbGJhY2sgdG8gdGhlIHJlZ3VsYXIgZGVmYXVsdHMuXG4gKlxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmN1cnJlbnRPcmRpbmFsRGVmYXVsdEZvcm1hdCA9ICgpID0+IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmN1cnJlbnREZWZhdWx0cygpLCBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkub3JkaW5hbEZvcm1hdCk7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBieXRlIGRlZmF1bHQtZm9ybWF0LlxuICogVXNlIGZpcnN0IHVzZXMgdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgYnl0ZSBkZWZhdWx0LCB0aGVuIGZhbGxiYWNrIHRvIHRoZSByZWd1bGFyIGRlZmF1bHRzLlxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50Qnl0ZURlZmF1bHRGb3JtYXQgPSAoKSA9PiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5jdXJyZW50RGVmYXVsdHMoKSwgY3VycmVudExhbmd1YWdlRGF0YSgpLmJ5dGVGb3JtYXQpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgcGVyY2VudGFnZSBkZWZhdWx0LWZvcm1hdC5cbiAqIFVzZSBmaXJzdCB1c2VzIHRoZSBjdXJyZW50IGxhbmd1YWdlIHBlcmNlbnRhZ2UgZGVmYXVsdCwgdGhlbiBmYWxsYmFjayB0byB0aGUgcmVndWxhciBkZWZhdWx0cy5cbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUuY3VycmVudFBlcmNlbnRhZ2VEZWZhdWx0Rm9ybWF0ID0gKCkgPT4gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuY3VycmVudERlZmF1bHRzKCksIGN1cnJlbnRMYW5ndWFnZURhdGEoKS5wZXJjZW50YWdlRm9ybWF0KTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbmN5IGRlZmF1bHQtZm9ybWF0LlxuICogVXNlIGZpcnN0IHVzZXMgdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgY3VycmVuY3kgZGVmYXVsdCwgdGhlbiBmYWxsYmFjayB0byB0aGUgcmVndWxhciBkZWZhdWx0cy5cbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUuY3VycmVudEN1cnJlbmN5RGVmYXVsdEZvcm1hdCA9ICgpID0+IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmN1cnJlbnREZWZhdWx0cygpLCBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkuY3VycmVuY3lGb3JtYXQpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgdGltZSBkZWZhdWx0LWZvcm1hdC5cbiAqIFVzZSBmaXJzdCB1c2VzIHRoZSBjdXJyZW50IGxhbmd1YWdlIGN1cnJlbmN5IGRlZmF1bHQsIHRoZW4gZmFsbGJhY2sgdG8gdGhlIHJlZ3VsYXIgZGVmYXVsdHMuXG4gKlxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmN1cnJlbnRUaW1lRGVmYXVsdEZvcm1hdCA9ICgpID0+IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmN1cnJlbnREZWZhdWx0cygpLCBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkudGltZUZvcm1hdCk7XG5cbi8qKlxuICogU2V0IHRoZSBnbG9iYWwgZm9ybWF0dGluZyBkZWZhdWx0cy5cbiAqXG4gKiBAcGFyYW0ge3t9fHN0cmluZ30gZm9ybWF0IC0gZm9ybWF0dGluZyBvcHRpb25zIHRvIHVzZSBhcyBkZWZhdWx0c1xuICovXG5zdGF0ZS5zZXREZWZhdWx0cyA9IChmb3JtYXQpID0+IHtcbiAgICBmb3JtYXQgPSBwYXJzaW5nLnBhcnNlRm9ybWF0KGZvcm1hdCk7XG4gICAgaWYgKHZhbGlkYXRpbmcudmFsaWRhdGVGb3JtYXQoZm9ybWF0KSkge1xuICAgICAgICBnbG9iYWxEZWZhdWx0cyA9IGZvcm1hdDtcbiAgICB9XG59O1xuXG4vL1xuLy8gWmVybyBmb3JtYXRcbi8vXG5cbi8qKlxuICogUmV0dXJuIHRoZSBmb3JtYXQgc3RyaW5nIGZvciAwLlxuICpcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuc3RhdGUuZ2V0WmVyb0Zvcm1hdCA9ICgpID0+IHplcm9Gb3JtYXQ7XG5cbi8qKlxuICogU2V0IGEgU1RSSU5HIHRvIG91dHB1dCB3aGVuIHRoZSB2YWx1ZSBpcyAwLlxuICpcbiAqIEBwYXJhbSB7e318c3RyaW5nfSBzdHJpbmcgLSBzdHJpbmcgdG8gc2V0XG4gKi9cbnN0YXRlLnNldFplcm9Gb3JtYXQgPSAoc3RyaW5nKSA9PiB6ZXJvRm9ybWF0ID0gdHlwZW9mKHN0cmluZykgPT09IFwic3RyaW5nXCIgPyBzdHJpbmcgOiBudWxsO1xuXG4vKipcbiAqIFJldHVybiB0cnVlIGlmIGEgZm9ybWF0IGZvciAwIGhhcyBiZWVuIHNldCBhbHJlYWR5LlxuICpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbnN0YXRlLmhhc1plcm9Gb3JtYXQgPSAoKSA9PiB6ZXJvRm9ybWF0ICE9PSBudWxsO1xuXG4vL1xuLy8gR2V0dGVycy9TZXR0ZXJzXG4vL1xuXG4vKipcbiAqIFJldHVybiB0aGUgbGFuZ3VhZ2UgZGF0YSBmb3IgdGhlIHByb3ZpZGVkIFRBRy5cbiAqIFJldHVybiB0aGUgY3VycmVudCBsYW5ndWFnZSBkYXRhIGlmIG5vIHRhZyBpcyBwcm92aWRlZC5cbiAqXG4gKiBUaHJvdyBhbiBlcnJvciBpZiB0aGUgdGFnIGRvZXNuJ3QgbWF0Y2ggYW55IHJlZ2lzdGVyZWQgbGFuZ3VhZ2UuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IFt0YWddIC0gbGFuZ3VhZ2UgdGFnIG9mIGEgcmVnaXN0ZXJlZCBsYW5ndWFnZVxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmxhbmd1YWdlRGF0YSA9ICh0YWcpID0+IHtcbiAgICBpZiAodGFnKSB7XG4gICAgICAgIGlmIChsYW5ndWFnZXNbdGFnXSkge1xuICAgICAgICAgICAgcmV0dXJuIGxhbmd1YWdlc1t0YWddO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB0YWcgXCIke3RhZ31cImApO1xuICAgIH1cblxuICAgIHJldHVybiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCk7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIHRoZSBwcm92aWRlZCBEQVRBIGFzIGEgbGFuZ3VhZ2UgaWYgYW5kIG9ubHkgaWYgdGhlIGRhdGEgaXMgdmFsaWQuXG4gKiBJZiB0aGUgZGF0YSBpcyBub3QgdmFsaWQsIGFuIGVycm9yIGlzIHRocm93bi5cbiAqXG4gKiBXaGVuIFVTRUxBTkdVQUdFIGlzIHRydWUsIHRoZSByZWdpc3RlcmVkIGxhbmd1YWdlIGlzIHRoZW4gdXNlZC5cbiAqXG4gKiBAcGFyYW0ge3t9fSBkYXRhIC0gbGFuZ3VhZ2UgZGF0YSB0byByZWdpc3RlclxuICogQHBhcmFtIHtib29sZWFufSBbdXNlTGFuZ3VhZ2VdIC0gYHRydWVgIGlmIHRoZSBwcm92aWRlZCBkYXRhIHNob3VsZCBiZWNvbWUgdGhlIGN1cnJlbnQgbGFuZ3VhZ2VcbiAqL1xuc3RhdGUucmVnaXN0ZXJMYW5ndWFnZSA9IChkYXRhLCB1c2VMYW5ndWFnZSA9IGZhbHNlKSA9PiB7XG4gICAgaWYgKCF2YWxpZGF0aW5nLnZhbGlkYXRlTGFuZ3VhZ2UoZGF0YSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBsYW5ndWFnZSBkYXRhXCIpO1xuICAgIH1cblxuICAgIGxhbmd1YWdlc1tkYXRhLmxhbmd1YWdlVGFnXSA9IGRhdGE7XG5cbiAgICBpZiAodXNlTGFuZ3VhZ2UpIHtcbiAgICAgICAgY2hvb3NlTGFuZ3VhZ2UoZGF0YS5sYW5ndWFnZVRhZyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBTZXQgdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgYWNjb3JkaW5nIHRvIFRBRy5cbiAqIElmIFRBRyBkb2Vzbid0IG1hdGNoIGEgcmVnaXN0ZXJlZCBsYW5ndWFnZSwgYW5vdGhlciBsYW5ndWFnZSBtYXRjaGluZ1xuICogdGhlIFwibGFuZ3VhZ2VcIiBwYXJ0IG9mIHRoZSB0YWcgKGFjY29yZGluZyB0byBCQ1A0NzogaHR0cHM6Ly90b29scy5pZXRmLm9yZy9yZmMvYmNwL2JjcDQ3LnR4dCkuXG4gKiBJZiBub25lLCB0aGUgRkFMTEJBQ0tUQUcgaXMgdXNlZC4gSWYgdGhlIEZBTExCQUNLVEFHIGRvZXNuJ3QgbWF0Y2ggYSByZWdpc3RlciBsYW5ndWFnZSxcbiAqIGBlbi1VU2AgaXMgZmluYWxseSB1c2VkLlxuICpcbiAqIEBwYXJhbSB0YWdcbiAqIEBwYXJhbSBmYWxsYmFja1RhZ1xuICovXG5zdGF0ZS5zZXRMYW5ndWFnZSA9ICh0YWcsIGZhbGxiYWNrVGFnID0gZW5VUy5sYW5ndWFnZVRhZykgPT4ge1xuICAgIGlmICghbGFuZ3VhZ2VzW3RhZ10pIHtcbiAgICAgICAgbGV0IHN1ZmZpeCA9IHRhZy5zcGxpdChcIi1cIilbMF07XG5cbiAgICAgICAgbGV0IG1hdGNoaW5nTGFuZ3VhZ2VUYWcgPSBPYmplY3Qua2V5cyhsYW5ndWFnZXMpLmZpbmQoZWFjaCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZWFjaC5zcGxpdChcIi1cIilbMF0gPT09IHN1ZmZpeDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKCFsYW5ndWFnZXNbbWF0Y2hpbmdMYW5ndWFnZVRhZ10pIHtcbiAgICAgICAgICAgIGNob29zZUxhbmd1YWdlKGZhbGxiYWNrVGFnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNob29zZUxhbmd1YWdlKG1hdGNoaW5nTGFuZ3VhZ2VUYWcpO1xuICAgIH1cblxuICAgIGNob29zZUxhbmd1YWdlKHRhZyk7XG59O1xuXG5zdGF0ZS5yZWdpc3Rlckxhbmd1YWdlKGVuVVMpO1xuY3VycmVudExhbmd1YWdlVGFnID0gZW5VUy5sYW5ndWFnZVRhZztcblxubW9kdWxlLmV4cG9ydHMgPSBzdGF0ZTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG4vKipcbiAqIExvYWQgbGFuZ3VhZ2VzIG1hdGNoaW5nIFRBR1MuIFNpbGVudGx5IHBhc3Mgb3ZlciB0aGUgZmFpbGluZyBsb2FkLlxuICpcbiAqIFdlIGFzc3VtZSBoZXJlIHRoYXQgd2UgYXJlIGluIGEgbm9kZSBlbnZpcm9ubWVudCwgc28gd2UgZG9uJ3QgY2hlY2sgZm9yIGl0LlxuICogQHBhcmFtIHtbU3RyaW5nXX0gdGFncyAtIGxpc3Qgb2YgdGFncyB0byBsb2FkXG4gKiBAcGFyYW0ge051bWJyb30gbnVtYnJvIC0gdGhlIG51bWJybyBzaW5nbGV0b25cbiAqL1xuZnVuY3Rpb24gbG9hZExhbmd1YWdlc0luTm9kZSh0YWdzLCBudW1icm8pIHtcbiAgICB0YWdzLmZvckVhY2goKHRhZykgPT4ge1xuICAgICAgICBsZXQgZGF0YSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRhdGEgPSByZXF1aXJlKGAuLi9sYW5ndWFnZXMvJHt0YWd9YCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byBsb2FkIFwiJHt0YWd9XCIuIE5vIG1hdGNoaW5nIGxhbmd1YWdlIGZpbGUgZm91bmQuYCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIG51bWJyby5yZWdpc3Rlckxhbmd1YWdlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKG51bWJybykgPT4gKHtcbiAgICBsb2FkTGFuZ3VhZ2VzSW5Ob2RlOiAodGFncykgPT4gbG9hZExhbmd1YWdlc0luTm9kZSh0YWdzLCBudW1icm8pXG59KTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBCaWdOdW1iZXIgPSByZXF1aXJlKFwiYmlnbnVtYmVyLmpzXCIpO1xuXG4vKipcbiAqIEFkZCBhIG51bWJlciBvciBhIG51bWJybyB0byBOLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBuIC0gYXVnZW5kXG4gKiBAcGFyYW0ge251bWJlcnxOdW1icm99IG90aGVyIC0gYWRkZW5kXG4gKiBAcGFyYW0ge251bWJyb30gbnVtYnJvIC0gbnVtYnJvIHNpbmdsZXRvblxuICogQHJldHVybiB7TnVtYnJvfSBuXG4gKi9cbmZ1bmN0aW9uIGFkZChuLCBvdGhlciwgbnVtYnJvKSB7XG4gICAgbGV0IHZhbHVlID0gbmV3IEJpZ051bWJlcihuLl92YWx1ZSk7XG4gICAgbGV0IG90aGVyVmFsdWUgPSBvdGhlcjtcblxuICAgIGlmIChudW1icm8uaXNOdW1icm8ob3RoZXIpKSB7XG4gICAgICAgIG90aGVyVmFsdWUgPSBvdGhlci5fdmFsdWU7XG4gICAgfVxuXG4gICAgb3RoZXJWYWx1ZSA9IG5ldyBCaWdOdW1iZXIob3RoZXJWYWx1ZSk7XG5cbiAgICBuLl92YWx1ZSA9IHZhbHVlLmFkZChvdGhlclZhbHVlKS50b051bWJlcigpO1xuICAgIHJldHVybiBuO1xufVxuXG4vKipcbiAqIFN1YnRyYWN0IGEgbnVtYmVyIG9yIGEgbnVtYnJvIGZyb20gTi5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gbiAtIG1pbnVlbmRcbiAqIEBwYXJhbSB7bnVtYmVyfE51bWJyb30gb3RoZXIgLSBzdWJ0cmFoZW5kXG4gKiBAcGFyYW0ge251bWJyb30gbnVtYnJvIC0gbnVtYnJvIHNpbmdsZXRvblxuICogQHJldHVybiB7TnVtYnJvfSBuXG4gKi9cbmZ1bmN0aW9uIHN1YnRyYWN0KG4sIG90aGVyLCBudW1icm8pIHtcbiAgICBsZXQgdmFsdWUgPSBuZXcgQmlnTnVtYmVyKG4uX3ZhbHVlKTtcbiAgICBsZXQgb3RoZXJWYWx1ZSA9IG90aGVyO1xuXG4gICAgaWYgKG51bWJyby5pc051bWJybyhvdGhlcikpIHtcbiAgICAgICAgb3RoZXJWYWx1ZSA9IG90aGVyLl92YWx1ZTtcbiAgICB9XG5cbiAgICBvdGhlclZhbHVlID0gbmV3IEJpZ051bWJlcihvdGhlclZhbHVlKTtcblxuICAgIG4uX3ZhbHVlID0gdmFsdWUubWludXMob3RoZXJWYWx1ZSkudG9OdW1iZXIoKTtcbiAgICByZXR1cm4gbjtcbn1cblxuLyoqXG4gKiBNdWx0aXBseSBOIGJ5IGEgbnVtYmVyIG9yIGEgbnVtYnJvLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBuIC0gbXVsdGlwbGljYW5kXG4gKiBAcGFyYW0ge251bWJlcnxOdW1icm99IG90aGVyIC0gbXVsdGlwbGllclxuICogQHBhcmFtIHtudW1icm99IG51bWJybyAtIG51bWJybyBzaW5nbGV0b25cbiAqIEByZXR1cm4ge051bWJyb30gblxuICovXG5mdW5jdGlvbiBtdWx0aXBseShuLCBvdGhlciwgbnVtYnJvKSB7XG4gICAgbGV0IHZhbHVlID0gbmV3IEJpZ051bWJlcihuLl92YWx1ZSk7XG4gICAgbGV0IG90aGVyVmFsdWUgPSBvdGhlcjtcblxuICAgIGlmIChudW1icm8uaXNOdW1icm8ob3RoZXIpKSB7XG4gICAgICAgIG90aGVyVmFsdWUgPSBvdGhlci5fdmFsdWU7XG4gICAgfVxuXG4gICAgb3RoZXJWYWx1ZSA9IG5ldyBCaWdOdW1iZXIob3RoZXJWYWx1ZSk7XG5cbiAgICBuLl92YWx1ZSA9IHZhbHVlLnRpbWVzKG90aGVyVmFsdWUpLnRvTnVtYmVyKCk7XG4gICAgcmV0dXJuIG47XG59XG5cbi8qKlxuICogRGl2aWRlIE4gYnkgYSBudW1iZXIgb3IgYSBudW1icm8uXG4gKlxuICogQHBhcmFtIHtOdW1icm99IG4gLSBkaXZpZGVuZFxuICogQHBhcmFtIHtudW1iZXJ8TnVtYnJvfSBvdGhlciAtIGRpdmlzb3JcbiAqIEBwYXJhbSB7bnVtYnJvfSBudW1icm8gLSBudW1icm8gc2luZ2xldG9uXG4gKiBAcmV0dXJuIHtOdW1icm99IG5cbiAqL1xuZnVuY3Rpb24gZGl2aWRlKG4sIG90aGVyLCBudW1icm8pIHtcbiAgICBsZXQgdmFsdWUgPSBuZXcgQmlnTnVtYmVyKG4uX3ZhbHVlKTtcbiAgICBsZXQgb3RoZXJWYWx1ZSA9IG90aGVyO1xuXG4gICAgaWYgKG51bWJyby5pc051bWJybyhvdGhlcikpIHtcbiAgICAgICAgb3RoZXJWYWx1ZSA9IG90aGVyLl92YWx1ZTtcbiAgICB9XG5cbiAgICBvdGhlclZhbHVlID0gbmV3IEJpZ051bWJlcihvdGhlclZhbHVlKTtcblxuICAgIG4uX3ZhbHVlID0gdmFsdWUuZGl2aWRlZEJ5KG90aGVyVmFsdWUpLnRvTnVtYmVyKCk7XG4gICAgcmV0dXJuIG47XG59XG5cbi8qKlxuICogU2V0IE4gdG8gdGhlIE9USEVSIChvciB0aGUgdmFsdWUgb2YgT1RIRVIgd2hlbiBpdCdzIGEgbnVtYnJvIGluc3RhbmNlKS5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gbiAtIG51bWJybyBpbnN0YW5jZSB0byBtdXRhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfE51bWJyb30gb3RoZXIgLSBuZXcgdmFsdWUgdG8gYXNzaWduIHRvIE5cbiAqIEBwYXJhbSB7bnVtYnJvfSBudW1icm8gLSBudW1icm8gc2luZ2xldG9uXG4gKiBAcmV0dXJuIHtOdW1icm99IG5cbiAqL1xuZnVuY3Rpb24gc2V0IChuLCBvdGhlciwgbnVtYnJvKSB7XG4gICAgbGV0IHZhbHVlID0gb3RoZXI7XG5cbiAgICBpZiAobnVtYnJvLmlzTnVtYnJvKG90aGVyKSkge1xuICAgICAgICB2YWx1ZSA9IG90aGVyLl92YWx1ZTtcbiAgICB9XG5cbiAgICBuLl92YWx1ZSA9IHZhbHVlO1xuICAgIHJldHVybiBuO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgZGlzdGFuY2UgYmV0d2VlbiBOIGFuZCBPVEhFUi5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gblxuICogQHBhcmFtIHtudW1iZXJ8TnVtYnJvfSBvdGhlclxuICogQHBhcmFtIHtudW1icm99IG51bWJybyAtIG51bWJybyBzaW5nbGV0b25cbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gZGlmZmVyZW5jZShuLCBvdGhlciwgbnVtYnJvKSB7XG4gICAgbGV0IGNsb25lID0gbnVtYnJvKG4uX3ZhbHVlKTtcbiAgICBzdWJ0cmFjdChjbG9uZSwgb3RoZXIsIG51bWJybyk7XG5cbiAgICByZXR1cm4gTWF0aC5hYnMoY2xvbmUuX3ZhbHVlKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBudW1icm8gPT4gKHtcbiAgICBhZGQ6IChuLCBvdGhlcikgPT4gYWRkKG4sIG90aGVyLCBudW1icm8pLFxuICAgIHN1YnRyYWN0OiAobiwgb3RoZXIpID0+IHN1YnRyYWN0KG4sIG90aGVyLCBudW1icm8pLFxuICAgIG11bHRpcGx5OiAobiwgb3RoZXIpID0+IG11bHRpcGx5KG4sIG90aGVyLCBudW1icm8pLFxuICAgIGRpdmlkZTogKG4sIG90aGVyKSA9PiBkaXZpZGUobiwgb3RoZXIsIG51bWJybyksXG4gICAgc2V0OiAobiwgb3RoZXIpID0+IHNldChuLCBvdGhlciwgbnVtYnJvKSxcbiAgICBkaWZmZXJlbmNlOiAobiwgb3RoZXIpID0+IGRpZmZlcmVuY2Uobiwgb3RoZXIsIG51bWJybylcbn0pO1xuIiwiLyohXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgQmVuamFtaW4gVmFuIFJ5c2VnaGVtPGJlbmphbWluQHZhbnJ5c2VnaGVtLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICovXG5cbmNvbnN0IFZFUlNJT04gPSBcIjIuMC4zXCI7XG5cbmNvbnN0IGdsb2JhbFN0YXRlID0gcmVxdWlyZShcIi4vZ2xvYmFsU3RhdGVcIik7XG5jb25zdCB2YWxpZGF0b3IgPSByZXF1aXJlKFwiLi92YWxpZGF0aW5nXCIpO1xuY29uc3QgbG9hZGVyID0gcmVxdWlyZShcIi4vbG9hZGluZ1wiKShudW1icm8pO1xuY29uc3QgdW5mb3JtYXR0ZXIgPSByZXF1aXJlKFwiLi91bmZvcm1hdHRpbmdcIik7XG5sZXQgZm9ybWF0dGVyID0gcmVxdWlyZShcIi4vZm9ybWF0dGluZ1wiKShudW1icm8pO1xubGV0IG1hbmlwdWxhdGUgPSByZXF1aXJlKFwiLi9tYW5pcHVsYXRpbmdcIikobnVtYnJvKTtcbmNvbnN0IHBhcnNpbmcgPSByZXF1aXJlKFwiLi9wYXJzaW5nXCIpO1xuXG5jbGFzcyBOdW1icm8ge1xuICAgIGNvbnN0cnVjdG9yKG51bWJlcikge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IG51bWJlcjtcbiAgICB9XG5cbiAgICBjbG9uZSgpIHsgcmV0dXJuIG51bWJybyh0aGlzLl92YWx1ZSk7IH1cblxuICAgIGZvcm1hdChmb3JtYXQgPSB7fSkgeyByZXR1cm4gZm9ybWF0dGVyLmZvcm1hdCh0aGlzLCBmb3JtYXQpOyB9XG5cbiAgICBmb3JtYXRDdXJyZW5jeShmb3JtYXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBmb3JtYXQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGZvcm1hdCA9IHBhcnNpbmcucGFyc2VGb3JtYXQoZm9ybWF0KTtcbiAgICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICB9XG4gICAgICAgIGZvcm1hdCA9IGZvcm1hdHRlci5mb3JtYXRPckRlZmF1bHQoZm9ybWF0LCBnbG9iYWxTdGF0ZS5jdXJyZW50Q3VycmVuY3lEZWZhdWx0Rm9ybWF0KCkpO1xuICAgICAgICBmb3JtYXQub3V0cHV0ID0gXCJjdXJyZW5jeVwiO1xuICAgICAgICByZXR1cm4gZm9ybWF0dGVyLmZvcm1hdCh0aGlzLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIGZvcm1hdFRpbWUoZm9ybWF0ID0ge30pIHtcbiAgICAgICAgZm9ybWF0Lm91dHB1dCA9IFwidGltZVwiO1xuICAgICAgICByZXR1cm4gZm9ybWF0dGVyLmZvcm1hdCh0aGlzLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIGJpbmFyeUJ5dGVVbml0cygpIHsgcmV0dXJuIGZvcm1hdHRlci5nZXRCaW5hcnlCeXRlVW5pdCh0aGlzKTt9XG5cbiAgICBkZWNpbWFsQnl0ZVVuaXRzKCkgeyByZXR1cm4gZm9ybWF0dGVyLmdldERlY2ltYWxCeXRlVW5pdCh0aGlzKTt9XG5cbiAgICBieXRlVW5pdHMoKSB7IHJldHVybiBmb3JtYXR0ZXIuZ2V0Qnl0ZVVuaXQodGhpcyk7fVxuXG4gICAgZGlmZmVyZW5jZShvdGhlcikgeyByZXR1cm4gbWFuaXB1bGF0ZS5kaWZmZXJlbmNlKHRoaXMsIG90aGVyKTsgfVxuXG4gICAgYWRkKG90aGVyKSB7IHJldHVybiBtYW5pcHVsYXRlLmFkZCh0aGlzLCBvdGhlcik7IH1cblxuICAgIHN1YnRyYWN0KG90aGVyKSB7IHJldHVybiBtYW5pcHVsYXRlLnN1YnRyYWN0KHRoaXMsIG90aGVyKTsgfVxuXG4gICAgbXVsdGlwbHkob3RoZXIpIHsgcmV0dXJuIG1hbmlwdWxhdGUubXVsdGlwbHkodGhpcywgb3RoZXIpOyB9XG5cbiAgICBkaXZpZGUob3RoZXIpIHsgcmV0dXJuIG1hbmlwdWxhdGUuZGl2aWRlKHRoaXMsIG90aGVyKTsgfVxuXG4gICAgc2V0KGlucHV0KSB7IHJldHVybiBtYW5pcHVsYXRlLnNldCh0aGlzLCBub3JtYWxpemVJbnB1dChpbnB1dCkpOyB9XG5cbiAgICB2YWx1ZSgpIHsgcmV0dXJuIHRoaXMuX3ZhbHVlOyB9XG5cbiAgICB2YWx1ZU9mKCkgeyByZXR1cm4gdGhpcy5fdmFsdWU7IH1cbn1cblxuLyoqXG4gKiBNYWtlIGl0cyBiZXN0IHRvIGNvbnZlcnQgaW5wdXQgaW50byBhIG51bWJlci5cbiAqXG4gKiBAcGFyYW0ge251bWJyb3xzdHJpbmd8bnVtYmVyfSBpbnB1dCAtIElucHV0IHRvIGNvbnZlcnRcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gbm9ybWFsaXplSW5wdXQoaW5wdXQpIHtcbiAgICBsZXQgcmVzdWx0ID0gaW5wdXQ7XG4gICAgaWYgKG51bWJyby5pc051bWJybyhpbnB1dCkpIHtcbiAgICAgICAgcmVzdWx0ID0gaW5wdXQuX3ZhbHVlO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGlucHV0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJlc3VsdCA9IG51bWJyby51bmZvcm1hdChpbnB1dCk7XG4gICAgfSBlbHNlIGlmIChpc05hTihpbnB1dCkpIHtcbiAgICAgICAgcmVzdWx0ID0gTmFOO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG51bWJybyhpbnB1dCkge1xuICAgIHJldHVybiBuZXcgTnVtYnJvKG5vcm1hbGl6ZUlucHV0KGlucHV0KSk7XG59XG5cbm51bWJyby52ZXJzaW9uID0gVkVSU0lPTjtcblxubnVtYnJvLmlzTnVtYnJvID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIE51bWJybztcbn07XG5cbi8vXG4vLyBgbnVtYnJvYCBzdGF0aWMgbWV0aG9kc1xuLy9cblxubnVtYnJvLmxhbmd1YWdlID0gZ2xvYmFsU3RhdGUuY3VycmVudExhbmd1YWdlO1xubnVtYnJvLnJlZ2lzdGVyTGFuZ3VhZ2UgPSBnbG9iYWxTdGF0ZS5yZWdpc3Rlckxhbmd1YWdlO1xubnVtYnJvLnNldExhbmd1YWdlID0gZ2xvYmFsU3RhdGUuc2V0TGFuZ3VhZ2U7XG5udW1icm8ubGFuZ3VhZ2VzID0gZ2xvYmFsU3RhdGUubGFuZ3VhZ2VzO1xubnVtYnJvLmxhbmd1YWdlRGF0YSA9IGdsb2JhbFN0YXRlLmxhbmd1YWdlRGF0YTtcbm51bWJyby56ZXJvRm9ybWF0ID0gZ2xvYmFsU3RhdGUuc2V0WmVyb0Zvcm1hdDtcbm51bWJyby5kZWZhdWx0Rm9ybWF0ID0gZ2xvYmFsU3RhdGUuY3VycmVudERlZmF1bHRzO1xubnVtYnJvLnNldERlZmF1bHRzID0gZ2xvYmFsU3RhdGUuc2V0RGVmYXVsdHM7XG5udW1icm8uZGVmYXVsdEN1cnJlbmN5Rm9ybWF0ID0gZ2xvYmFsU3RhdGUuY3VycmVudEN1cnJlbmN5RGVmYXVsdEZvcm1hdDtcbm51bWJyby52YWxpZGF0ZSA9IHZhbGlkYXRvci52YWxpZGF0ZTtcbm51bWJyby5sb2FkTGFuZ3VhZ2VzSW5Ob2RlID0gbG9hZGVyLmxvYWRMYW5ndWFnZXNJbk5vZGU7XG5udW1icm8udW5mb3JtYXQgPSB1bmZvcm1hdHRlci51bmZvcm1hdDtcblxubW9kdWxlLmV4cG9ydHMgPSBudW1icm87XG4iLCIvKiFcbiAqIENvcHlyaWdodCAoYykgMjAxNyBCZW5qYW1pbiBWYW4gUnlzZWdoZW08YmVuamFtaW5AdmFucnlzZWdoZW0uY29tPlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKi9cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciBhIHByZWZpeC4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VQcmVmaXgoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBsZXQgbWF0Y2ggPSBzdHJpbmcubWF0Y2goL157KFtefV0qKX0vKTtcbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgcmVzdWx0LnByZWZpeCA9IG1hdGNoWzFdO1xuICAgICAgICByZXR1cm4gc3RyaW5nLnNsaWNlKG1hdGNoWzBdLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZztcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciBhIHBvc3RmaXguIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gZm9ybWF0XG4gKi9cbmZ1bmN0aW9uIHBhcnNlUG9zdGZpeChzdHJpbmcsIHJlc3VsdCkge1xuICAgIGxldCBtYXRjaCA9IHN0cmluZy5tYXRjaCgveyhbXn1dKil9JC8pO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgICByZXN1bHQucG9zdGZpeCA9IG1hdGNoWzFdO1xuXG4gICAgICAgIHJldHVybiBzdHJpbmcuc2xpY2UoMCwgLW1hdGNoWzBdLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHN0cmluZztcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciB0aGUgb3V0cHV0IHZhbHVlLiBBcHBlbmQgaXQgdG8gUkVTVUxUIHdoZW4gZm91bmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIGZvcm1hdFxuICogQHBhcmFtIHtOdW1icm9Gb3JtYXR9IHJlc3VsdCAtIFJlc3VsdCBhY2N1bXVsYXRvclxuICovXG5mdW5jdGlvbiBwYXJzZU91dHB1dChzdHJpbmcsIHJlc3VsdCkge1xuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcIiRcIikgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5vdXRwdXQgPSBcImN1cnJlbmN5XCI7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCIlXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQub3V0cHV0ID0gXCJwZXJjZW50XCI7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCJiZFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0Lm91dHB1dCA9IFwiYnl0ZVwiO1xuICAgICAgICByZXN1bHQuYmFzZSA9IFwiZ2VuZXJhbFwiO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiYlwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0Lm91dHB1dCA9IFwiYnl0ZVwiO1xuICAgICAgICByZXN1bHQuYmFzZSA9IFwiYmluYXJ5XCI7XG4gICAgICAgIHJldHVybjtcblxuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcImRcIikgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5vdXRwdXQgPSBcImJ5dGVcIjtcbiAgICAgICAgcmVzdWx0LmJhc2UgPSBcImRlY2ltYWxcIjtcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiOlwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0Lm91dHB1dCA9IFwidGltZVwiO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwib1wiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0Lm91dHB1dCA9IFwib3JkaW5hbFwiO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciB0aGUgdGhvdXNhbmQgc2VwYXJhdGVkIHZhbHVlLiBBcHBlbmQgaXQgdG8gUkVTVUxUIHdoZW4gZm91bmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIGZvcm1hdFxuICogQHBhcmFtIHtOdW1icm9Gb3JtYXR9IHJlc3VsdCAtIFJlc3VsdCBhY2N1bXVsYXRvclxuICogQHJldHVybiB7c3RyaW5nfSAtIGZvcm1hdFxuICovXG5mdW5jdGlvbiBwYXJzZVRob3VzYW5kU2VwYXJhdGVkKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiLFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LnRob3VzYW5kU2VwYXJhdGVkID0gdHJ1ZTtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgbG9va2luZyBmb3IgdGhlIHNwYWNlIHNlcGFyYXRlZCB2YWx1ZS4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VTcGFjZVNlcGFyYXRlZChzdHJpbmcsIHJlc3VsdCkge1xuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcIiBcIikgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5zcGFjZVNlcGFyYXRlZCA9IHRydWU7XG4gICAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBmb3JtYXQgU1RSSU5HIGxvb2tpbmcgZm9yIHRoZSB0b3RhbCBsZW5ndGguIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gZm9ybWF0XG4gKi9cbmZ1bmN0aW9uIHBhcnNlVG90YWxMZW5ndGgoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBsZXQgbWF0Y2ggPSBzdHJpbmcubWF0Y2goL1sxLTldK1swLTldKi8pO1xuXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHJlc3VsdC50b3RhbExlbmd0aCA9ICttYXRjaFswXTtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgbG9va2luZyBmb3IgdGhlIGNoYXJhY3RlcmlzdGljIGxlbmd0aC4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VDaGFyYWN0ZXJpc3RpYyhzdHJpbmcsIHJlc3VsdCkge1xuICAgIGxldCBjaGFyYWN0ZXJpc3RpYyA9IHN0cmluZy5zcGxpdChcIi5cIilbMF07XG4gICAgbGV0IG1hdGNoID0gY2hhcmFjdGVyaXN0aWMubWF0Y2goLzArLyk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHJlc3VsdC5jaGFyYWN0ZXJpc3RpYyA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgbG9va2luZyBmb3IgdGhlIG1hbnRpc3NhIGxlbmd0aC4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VNYW50aXNzYShzdHJpbmcsIHJlc3VsdCkge1xuICAgIGxldCBtYW50aXNzYSA9IHN0cmluZy5zcGxpdChcIi5cIilbMV07XG4gICAgaWYgKG1hbnRpc3NhKSB7XG4gICAgICAgIGxldCBtYXRjaCA9IG1hbnRpc3NhLm1hdGNoKC8wKy8pO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHJlc3VsdC5tYW50aXNzYSA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciB0aGUgYXZlcmFnZSB2YWx1ZS4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VBdmVyYWdlKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiYVwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LmF2ZXJhZ2UgPSB0cnVlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciBhIGZvcmNlZCBhdmVyYWdlIHByZWNpc2lvbi4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VGb3JjZUF2ZXJhZ2Uoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCJLXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQuZm9yY2VBdmVyYWdlID0gXCJ0aG91c2FuZFwiO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nLmluZGV4T2YoXCJNXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQuZm9yY2VBdmVyYWdlID0gXCJtaWxsaW9uXCI7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcuaW5kZXhPZihcIkJcIikgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5mb3JjZUF2ZXJhZ2UgPSBcImJpbGxpb25cIjtcbiAgICB9IGVsc2UgaWYgKHN0cmluZy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LmZvcmNlQXZlcmFnZSA9IFwidHJpbGxpb25cIjtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgZmluZGluZyBpZiB0aGUgbWFudGlzc2EgaXMgb3B0aW9uYWwuIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gZm9ybWF0XG4gKi9cbmZ1bmN0aW9uIHBhcnNlT3B0aW9uYWxNYW50aXNzYShzdHJpbmcsIHJlc3VsdCkge1xuICAgIGlmIChzdHJpbmcubWF0Y2goL1xcW1xcLl0vKSkge1xuICAgICAgICByZXN1bHQub3B0aW9uYWxNYW50aXNzYSA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcubWF0Y2goL1xcLi8pKSB7XG4gICAgICAgIHJlc3VsdC5vcHRpb25hbE1hbnRpc3NhID0gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBmb3JtYXQgU1RSSU5HIGZpbmRpbmcgaWYgdGhlIGNoYXJhY3RlcmlzdGljIGlzIG9wdGlvbmFsLiBBcHBlbmQgaXQgdG8gUkVTVUxUIHdoZW4gZm91bmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIGZvcm1hdFxuICogQHBhcmFtIHtOdW1icm9Gb3JtYXR9IHJlc3VsdCAtIFJlc3VsdCBhY2N1bXVsYXRvclxuICogQHJldHVybiB7c3RyaW5nfSAtIGZvcm1hdFxuICovXG5mdW5jdGlvbiBwYXJzZU9wdGlvbmFsQ2hhcmFjdGVyaXN0aWMoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCIuXCIpICE9PSAtMSkge1xuICAgICAgICBsZXQgY2hhcmFjdGVyaXN0aWMgPSBzdHJpbmcuc3BsaXQoXCIuXCIpWzBdO1xuICAgICAgICByZXN1bHQub3B0aW9uYWxDaGFyYWN0ZXJpc3RpYyA9IGNoYXJhY3RlcmlzdGljLmluZGV4T2YoXCIwXCIpID09PSAtMTtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgbG9va2luZyBmb3IgdGhlIG5lZ2F0aXZlIGZvcm1hdC4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VOZWdhdGl2ZShzdHJpbmcsIHJlc3VsdCkge1xuICAgIGlmIChzdHJpbmcubWF0Y2goL15cXCs/XFwoW14pXSpcXCkkLykpIHtcbiAgICAgICAgcmVzdWx0Lm5lZ2F0aXZlID0gXCJwYXJlbnRoZXNpc1wiO1xuICAgIH1cbiAgICBpZiAoc3RyaW5nLm1hdGNoKC9eXFwrPy0vKSkge1xuICAgICAgICByZXN1bHQubmVnYXRpdmUgPSBcInNpZ25cIjtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgZmluZGluZyBpZiB0aGUgc2lnbiBpcyBtYW5kYXRvcnkuIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKi9cbmZ1bmN0aW9uIHBhcnNlRm9yY2VTaWduKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5tYXRjaCgvXlxcKy8pKSB7XG4gICAgICAgIHJlc3VsdC5mb3JjZVNpZ24gPSB0cnVlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBhbmQgYWNjdW11bGF0aW5nIHRoZSB2YWx1ZXMgaWUgUkVTVUxULlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge051bWJyb0Zvcm1hdH0gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VGb3JtYXQoc3RyaW5nLCByZXN1bHQgPSB7fSkge1xuICAgIGlmICh0eXBlb2Ygc3RyaW5nICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfVxuXG4gICAgc3RyaW5nID0gcGFyc2VQcmVmaXgoc3RyaW5nLCByZXN1bHQpO1xuICAgIHN0cmluZyA9IHBhcnNlUG9zdGZpeChzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VPdXRwdXQoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlVG90YWxMZW5ndGgoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlQ2hhcmFjdGVyaXN0aWMoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlT3B0aW9uYWxDaGFyYWN0ZXJpc3RpYyhzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VBdmVyYWdlKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZUZvcmNlQXZlcmFnZShzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VNYW50aXNzYShzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VPcHRpb25hbE1hbnRpc3NhKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZVRob3VzYW5kU2VwYXJhdGVkKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZVNwYWNlU2VwYXJhdGVkKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZU5lZ2F0aXZlKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZUZvcmNlU2lnbihzdHJpbmcsIHJlc3VsdCk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBwYXJzZUZvcm1hdFxufTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBhbGxTdWZmaXhlcyA9IFtcbiAgICB7a2V5OiBcIlppQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMjQsIDcpfSxcbiAgICB7a2V5OiBcIlpCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAwMCwgNyl9LFxuICAgIHtrZXk6IFwiWWlCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAyNCwgOCl9LFxuICAgIHtrZXk6IFwiWUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDAwLCA4KX0sXG4gICAge2tleTogXCJUaUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDI0LCA0KX0sXG4gICAge2tleTogXCJUQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMDAsIDQpfSxcbiAgICB7a2V5OiBcIlBpQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMjQsIDUpfSxcbiAgICB7a2V5OiBcIlBCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAwMCwgNSl9LFxuICAgIHtrZXk6IFwiTWlCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAyNCwgMil9LFxuICAgIHtrZXk6IFwiTUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDAwLCAyKX0sXG4gICAge2tleTogXCJLaUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDI0LCAxKX0sXG4gICAge2tleTogXCJLQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMDAsIDEpfSxcbiAgICB7a2V5OiBcIkdpQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMjQsIDMpfSxcbiAgICB7a2V5OiBcIkdCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAwMCwgMyl9LFxuICAgIHtrZXk6IFwiRWlCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAyNCwgNil9LFxuICAgIHtrZXk6IFwiRUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDAwLCA2KX0sXG4gICAge2tleTogXCJCXCIsIGZhY3RvcjogMX1cbl07XG5cbi8qKlxuICogR2VuZXJhdGUgYSBSZWdFeHAgd2hlcmUgUyBnZXQgYWxsIFJlZ0V4cCBzcGVjaWZpYyBjaGFyYWN0ZXJzIGVzY2FwZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHMgLSBzdHJpbmcgcmVwcmVzZW50aW5nIGEgUmVnRXhwXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGVzY2FwZVJlZ0V4cChzKSB7XG4gICAgcmV0dXJuIHMucmVwbGFjZSgvWy0vXFxcXF4kKis/LigpfFtcXF17fV0vZywgXCJcXFxcJCZcIik7XG59XG5cbi8qKlxuICogUmVjdXJzaXZlbHkgY29tcHV0ZSB0aGUgdW5mb3JtYXR0ZWQgdmFsdWUuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0U3RyaW5nIC0gc3RyaW5nIHRvIHVuZm9ybWF0XG4gKiBAcGFyYW0geyp9IGRlbGltaXRlcnMgLSBEZWxpbWl0ZXJzIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGlucHV0U3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW2N1cnJlbmN5U3ltYm9sXSAtIHN5bWJvbCB1c2VkIGZvciBjdXJyZW5jeSB3aGlsZSBnZW5lcmF0aW5nIHRoZSBpbnB1dFN0cmluZ1xuICogQHBhcmFtIHtmdW5jdGlvbn0gb3JkaW5hbCAtIGZ1bmN0aW9uIHVzZWQgdG8gZ2VuZXJhdGUgYW4gb3JkaW5hbCBvdXQgb2YgYSBudW1iZXJcbiAqIEBwYXJhbSB7c3RyaW5nfSB6ZXJvRm9ybWF0IC0gc3RyaW5nIHJlcHJlc2VudGluZyB6ZXJvXG4gKiBAcGFyYW0geyp9IGFiYnJldmlhdGlvbnMgLSBhYmJyZXZpYXRpb25zIHVzZWQgd2hpbGUgZ2VuZXJhdGluZyB0aGUgaW5wdXRTdHJpbmdcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSBmb3JtYXQgLSBmb3JtYXQgdXNlZCB3aGlsZSBnZW5lcmF0aW5nIHRoZSBpbnB1dFN0cmluZ1xuICogQHJldHVybiB7bnVtYmVyfHVuZGVmaW5lZH1cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZVVuZm9ybWF0dGVkVmFsdWUoaW5wdXRTdHJpbmcsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sID0gXCJcIiwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KSB7XG4gICAgaWYgKCFpc05hTigraW5wdXRTdHJpbmcpKSB7XG4gICAgICAgIHJldHVybiAraW5wdXRTdHJpbmc7XG4gICAgfVxuXG4gICAgbGV0IHN0cmlwcGVkID0gXCJcIjtcbiAgICAvLyBOZWdhdGl2ZVxuXG4gICAgbGV0IG5ld0lucHV0ID0gaW5wdXRTdHJpbmcucmVwbGFjZSgvKF5bXihdKilcXCgoLiopXFwpKFteKV0qJCkvLCBcIiQxJDIkM1wiKTtcblxuICAgIGlmIChuZXdJbnB1dCAhPT0gaW5wdXRTdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIC0xICogY29tcHV0ZVVuZm9ybWF0dGVkVmFsdWUobmV3SW5wdXQsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpO1xuICAgIH1cblxuICAgIC8vIEJ5dGVcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYWxsU3VmZml4ZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IHN1ZmZpeCA9IGFsbFN1ZmZpeGVzW2ldO1xuICAgICAgICBzdHJpcHBlZCA9IGlucHV0U3RyaW5nLnJlcGxhY2Uoc3VmZml4LmtleSwgXCJcIik7XG5cbiAgICAgICAgaWYgKHN0cmlwcGVkICE9PSBpbnB1dFN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXB1dGVVbmZvcm1hdHRlZFZhbHVlKHN0cmlwcGVkLCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KSAqIHN1ZmZpeC5mYWN0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQZXJjZW50XG5cbiAgICBzdHJpcHBlZCA9IGlucHV0U3RyaW5nLnJlcGxhY2UoXCIlXCIsIFwiXCIpO1xuXG4gICAgaWYgKHN0cmlwcGVkICE9PSBpbnB1dFN0cmluZykge1xuICAgICAgICByZXR1cm4gY29tcHV0ZVVuZm9ybWF0dGVkVmFsdWUoc3RyaXBwZWQsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpIC8gMTAwO1xuICAgIH1cblxuICAgIC8vIE9yZGluYWxcblxuICAgIGxldCBwb3NzaWJsZU9yZGluYWxWYWx1ZSA9IHBhcnNlRmxvYXQoaW5wdXRTdHJpbmcpO1xuXG4gICAgaWYgKGlzTmFOKHBvc3NpYmxlT3JkaW5hbFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBvcmRpbmFsU3RyaW5nID0gb3JkaW5hbChwb3NzaWJsZU9yZGluYWxWYWx1ZSk7XG4gICAgaWYgKG9yZGluYWxTdHJpbmcgJiYgb3JkaW5hbFN0cmluZyAhPT0gXCIuXCIpIHsgLy8gaWYgb3JkaW5hbCBpcyBcIi5cIiBpdCB3aWxsIGJlIGNhdWdodCBuZXh0IHJvdW5kIGluIHRoZSAraW5wdXRTdHJpbmdcbiAgICAgICAgc3RyaXBwZWQgPSBpbnB1dFN0cmluZy5yZXBsYWNlKG5ldyBSZWdFeHAoYCR7ZXNjYXBlUmVnRXhwKG9yZGluYWxTdHJpbmcpfSRgKSwgXCJcIik7XG5cbiAgICAgICAgaWYgKHN0cmlwcGVkICE9PSBpbnB1dFN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXB1dGVVbmZvcm1hdHRlZFZhbHVlKHN0cmlwcGVkLCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEF2ZXJhZ2VcblxuICAgIGxldCBpbnZlcnNlZEFiYnJldmlhdGlvbnMgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhhYmJyZXZpYXRpb25zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgaW52ZXJzZWRBYmJyZXZpYXRpb25zW2FiYnJldmlhdGlvbnNba2V5XV0gPSBrZXk7XG4gICAgfSk7XG5cbiAgICBsZXQgYWJicmV2aWF0aW9uVmFsdWVzID0gT2JqZWN0LmtleXMoaW52ZXJzZWRBYmJyZXZpYXRpb25zKS5zb3J0KCkucmV2ZXJzZSgpO1xuICAgIGxldCBudW1iZXJPZkFiYnJldmlhdGlvbnMgPSBhYmJyZXZpYXRpb25WYWx1ZXMubGVuZ3RoO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkFiYnJldmlhdGlvbnM7IGkrKykge1xuICAgICAgICBsZXQgdmFsdWUgPSBhYmJyZXZpYXRpb25WYWx1ZXNbaV07XG4gICAgICAgIGxldCBrZXkgPSBpbnZlcnNlZEFiYnJldmlhdGlvbnNbdmFsdWVdO1xuXG4gICAgICAgIHN0cmlwcGVkID0gaW5wdXRTdHJpbmcucmVwbGFjZSh2YWx1ZSwgXCJcIik7XG4gICAgICAgIGlmIChzdHJpcHBlZCAhPT0gaW5wdXRTdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBmYWN0b3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlZmF1bHQtY2FzZVxuICAgICAgICAgICAgICAgIGNhc2UgXCJ0aG91c2FuZFwiOlxuICAgICAgICAgICAgICAgICAgICBmYWN0b3IgPSBNYXRoLnBvdygxMCwgMyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJtaWxsaW9uXCI6XG4gICAgICAgICAgICAgICAgICAgIGZhY3RvciA9IE1hdGgucG93KDEwLCA2KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImJpbGxpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgZmFjdG9yID0gTWF0aC5wb3coMTAsIDkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwidHJpbGxpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgZmFjdG9yID0gTWF0aC5wb3coMTAsIDEyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29tcHV0ZVVuZm9ybWF0dGVkVmFsdWUoc3RyaXBwZWQsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpICogZmFjdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGluIG9uZSBwYXNzIGFsbCBmb3JtYXR0aW5nIHN5bWJvbHMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0U3RyaW5nIC0gc3RyaW5nIHRvIHVuZm9ybWF0XG4gKiBAcGFyYW0geyp9IGRlbGltaXRlcnMgLSBEZWxpbWl0ZXJzIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGlucHV0U3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW2N1cnJlbmN5U3ltYm9sXSAtIHN5bWJvbCB1c2VkIGZvciBjdXJyZW5jeSB3aGlsZSBnZW5lcmF0aW5nIHRoZSBpbnB1dFN0cmluZ1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW1vdmVGb3JtYXR0aW5nU3ltYm9scyhpbnB1dFN0cmluZywgZGVsaW1pdGVycywgY3VycmVuY3lTeW1ib2wgPSBcIlwiKSB7XG4gICAgLy8gQ3VycmVuY3lcblxuICAgIGxldCBzdHJpcHBlZCA9IGlucHV0U3RyaW5nLnJlcGxhY2UoY3VycmVuY3lTeW1ib2wsIFwiXCIpO1xuXG4gICAgLy8gVGhvdXNhbmQgc2VwYXJhdG9yc1xuXG4gICAgc3RyaXBwZWQgPSBzdHJpcHBlZC5yZXBsYWNlKG5ldyBSZWdFeHAoYChbMC05XSkke2VzY2FwZVJlZ0V4cChkZWxpbWl0ZXJzLnRob3VzYW5kcyl9KFswLTldKWAsIFwiZ1wiKSwgXCIkMSQyXCIpO1xuXG4gICAgLy8gRGVjaW1hbFxuXG4gICAgc3RyaXBwZWQgPSBzdHJpcHBlZC5yZXBsYWNlKGRlbGltaXRlcnMuZGVjaW1hbCwgXCIuXCIpO1xuXG4gICAgcmV0dXJuIHN0cmlwcGVkO1xufVxuXG4vKipcbiAqIFVuZm9ybWF0IGEgbnVtYnJvLWdlbmVyYXRlZCBzdHJpbmcgdG8gcmV0cmlldmUgdGhlIG9yaWdpbmFsIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0cmluZyAtIHN0cmluZyB0byB1bmZvcm1hdFxuICogQHBhcmFtIHsqfSBkZWxpbWl0ZXJzIC0gRGVsaW1pdGVycyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBpbnB1dFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtjdXJyZW5jeVN5bWJvbF0gLSBzeW1ib2wgdXNlZCBmb3IgY3VycmVuY3kgd2hpbGUgZ2VuZXJhdGluZyB0aGUgaW5wdXRTdHJpbmdcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG9yZGluYWwgLSBmdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIGFuIG9yZGluYWwgb3V0IG9mIGEgbnVtYmVyXG4gKiBAcGFyYW0ge3N0cmluZ30gemVyb0Zvcm1hdCAtIHN0cmluZyByZXByZXNlbnRpbmcgemVyb1xuICogQHBhcmFtIHsqfSBhYmJyZXZpYXRpb25zIC0gYWJicmV2aWF0aW9ucyB1c2VkIHdoaWxlIGdlbmVyYXRpbmcgdGhlIGlucHV0U3RyaW5nXG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gZm9ybWF0IC0gZm9ybWF0IHVzZWQgd2hpbGUgZ2VuZXJhdGluZyB0aGUgaW5wdXRTdHJpbmdcbiAqIEByZXR1cm4ge251bWJlcnx1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIHVuZm9ybWF0VmFsdWUoaW5wdXRTdHJpbmcsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sID0gXCJcIiwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KSB7XG4gICAgaWYgKGlucHV0U3RyaW5nID09PSBcIlwiKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKCFpc05hTigraW5wdXRTdHJpbmcpKSB7XG4gICAgICAgIHJldHVybiAraW5wdXRTdHJpbmc7XG4gICAgfVxuXG4gICAgLy8gWmVybyBGb3JtYXRcblxuICAgIGlmIChpbnB1dFN0cmluZyA9PT0gemVyb0Zvcm1hdCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWUgPSByZW1vdmVGb3JtYXR0aW5nU3ltYm9scyhpbnB1dFN0cmluZywgZGVsaW1pdGVycywgY3VycmVuY3lTeW1ib2wpO1xuICAgIHJldHVybiBjb21wdXRlVW5mb3JtYXR0ZWRWYWx1ZSh2YWx1ZSwgZGVsaW1pdGVycywgY3VycmVuY3lTeW1ib2wsIG9yZGluYWwsIHplcm9Gb3JtYXQsIGFiYnJldmlhdGlvbnMsIGZvcm1hdCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIElOUFVUU1RSSU5HIHJlcHJlc2VudHMgYSB0aW1lLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0cmluZyAtIHN0cmluZyB0byBjaGVja1xuICogQHBhcmFtIHsqfSBkZWxpbWl0ZXJzIC0gRGVsaW1pdGVycyB1c2VkIHdoaWxlIGdlbmVyYXRpbmcgdGhlIGlucHV0U3RyaW5nXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBtYXRjaGVzVGltZShpbnB1dFN0cmluZywgZGVsaW1pdGVycykge1xuICAgIGxldCBzZXBhcmF0b3JzID0gaW5wdXRTdHJpbmcuaW5kZXhPZihcIjpcIikgJiYgZGVsaW1pdGVycy50aG91c2FuZHMgIT09IFwiOlwiO1xuXG4gICAgaWYgKCFzZXBhcmF0b3JzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgc2VnbWVudHMgPSBpbnB1dFN0cmluZy5zcGxpdChcIjpcIik7XG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCAhPT0gMykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IGhvdXJzID0gK3NlZ21lbnRzWzBdO1xuICAgIGxldCBtaW51dGVzID0gK3NlZ21lbnRzWzFdO1xuICAgIGxldCBzZWNvbmRzID0gK3NlZ21lbnRzWzJdO1xuXG4gICAgcmV0dXJuICFpc05hTihob3VycykgJiYgIWlzTmFOKG1pbnV0ZXMpICYmICFpc05hTihzZWNvbmRzKTtcbn1cblxuLyoqXG4gKiBVbmZvcm1hdCBhIG51bWJyby1nZW5lcmF0ZWQgc3RyaW5nIHJlcHJlc2VudGluZyBhIHRpbWUgdG8gcmV0cmlldmUgdGhlIG9yaWdpbmFsIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0cmluZyAtIHN0cmluZyB0byB1bmZvcm1hdFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiB1bmZvcm1hdFRpbWUoaW5wdXRTdHJpbmcpIHtcbiAgICBsZXQgc2VnbWVudHMgPSBpbnB1dFN0cmluZy5zcGxpdChcIjpcIik7XG5cbiAgICBsZXQgaG91cnMgPSArc2VnbWVudHNbMF07XG4gICAgbGV0IG1pbnV0ZXMgPSArc2VnbWVudHNbMV07XG4gICAgbGV0IHNlY29uZHMgPSArc2VnbWVudHNbMl07XG5cbiAgICByZXR1cm4gc2Vjb25kcyArIDYwICogbWludXRlcyArIDM2MDAgKiBob3Vycztcbn1cblxuLyoqXG4gKiBVbmZvcm1hdCBhIG51bWJyby1nZW5lcmF0ZWQgc3RyaW5nIHRvIHJldHJpZXZlIHRoZSBvcmlnaW5hbCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRTdHJpbmcgLSBzdHJpbmcgdG8gdW5mb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSBmb3JtYXQgLSBmb3JtYXQgdXNlZCAgd2hpbGUgZ2VuZXJhdGluZyB0aGUgaW5wdXRTdHJpbmdcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gdW5mb3JtYXQoaW5wdXRTdHJpbmcsIGZvcm1hdCkge1xuICAgIC8vIEF2b2lkIGNpcmN1bGFyIHJlZmVyZW5jZXNcbiAgICBjb25zdCBnbG9iYWxTdGF0ZSA9IHJlcXVpcmUoXCIuL2dsb2JhbFN0YXRlXCIpO1xuXG4gICAgbGV0IGRlbGltaXRlcnMgPSBnbG9iYWxTdGF0ZS5jdXJyZW50RGVsaW1pdGVycygpO1xuICAgIGxldCBjdXJyZW5jeVN5bWJvbCA9IGdsb2JhbFN0YXRlLmN1cnJlbnRDdXJyZW5jeSgpLnN5bWJvbDtcbiAgICBsZXQgb3JkaW5hbCA9IGdsb2JhbFN0YXRlLmN1cnJlbnRPcmRpbmFsKCk7XG4gICAgbGV0IHplcm9Gb3JtYXQgPSBnbG9iYWxTdGF0ZS5nZXRaZXJvRm9ybWF0KCk7XG4gICAgbGV0IGFiYnJldmlhdGlvbnMgPSBnbG9iYWxTdGF0ZS5jdXJyZW50QWJicmV2aWF0aW9ucygpO1xuXG4gICAgbGV0IHZhbHVlID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKHR5cGVvZiBpbnB1dFN0cmluZyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAobWF0Y2hlc1RpbWUoaW5wdXRTdHJpbmcsIGRlbGltaXRlcnMpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVuZm9ybWF0VGltZShpbnB1dFN0cmluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVuZm9ybWF0VmFsdWUoaW5wdXRTdHJpbmcsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXRTdHJpbmcgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdmFsdWUgPSBpbnB1dFN0cmluZztcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB1bmZvcm1hdFxufTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5sZXQgdW5mb3JtYXR0ZXIgPSByZXF1aXJlKFwiLi91bmZvcm1hdHRpbmdcIik7XG5cbi8vIFNpbXBsaWZpZWQgcmVnZXhwIHN1cHBvcnRpbmcgb25seSBgbGFuZ3VhZ2VgLCBgc2NyaXB0YCwgYW5kIGByZWdpb25gXG5jb25zdCBiY3A0N1JlZ0V4cCA9IC9eW2Etel17MiwzfSgtW2EtekEtWl17NH0pPygtKFtBLVpdezJ9fFswLTldezN9KSk/JC87XG5cbmNvbnN0IHZhbGlkT3V0cHV0VmFsdWVzID0gW1xuICAgIFwiY3VycmVuY3lcIixcbiAgICBcInBlcmNlbnRcIixcbiAgICBcImJ5dGVcIixcbiAgICBcInRpbWVcIixcbiAgICBcIm9yZGluYWxcIixcbiAgICBcIm51bWJlclwiXG5dO1xuXG5jb25zdCB2YWxpZEZvcmNlQXZlcmFnZVZhbHVlcyA9IFtcbiAgICBcInRyaWxsaW9uXCIsXG4gICAgXCJiaWxsaW9uXCIsXG4gICAgXCJtaWxsaW9uXCIsXG4gICAgXCJ0aG91c2FuZFwiXG5dO1xuXG5jb25zdCB2YWxpZE5lZ2F0aXZlVmFsdWVzID0gW1xuICAgIFwic2lnblwiLFxuICAgIFwicGFyZW50aGVzaXNcIlxuXTtcblxuY29uc3QgdmFsaWRNYW5kYXRvcnlBYmJyZXZpYXRpb25zID0ge1xuICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgY2hpbGRyZW46IHtcbiAgICAgICAgdGhvdXNhbmQ6IHtcbiAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgbWlsbGlvbjoge1xuICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBiaWxsaW9uOiB7XG4gICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIHRyaWxsaW9uOiB7XG4gICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgIH1cbiAgICB9LFxuICAgIG1hbmRhdG9yeTogdHJ1ZVxufTtcblxuY29uc3QgdmFsaWRBYmJyZXZpYXRpb25zID0ge1xuICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgY2hpbGRyZW46IHtcbiAgICAgICAgdGhvdXNhbmQ6IFwic3RyaW5nXCIsXG4gICAgICAgIG1pbGxpb246IFwic3RyaW5nXCIsXG4gICAgICAgIGJpbGxpb246IFwic3RyaW5nXCIsXG4gICAgICAgIHRyaWxsaW9uOiBcInN0cmluZ1wiXG4gICAgfVxufTtcblxuY29uc3QgdmFsaWRCYXNlVmFsdWVzID0gW1xuICAgIFwiZGVjaW1hbFwiLFxuICAgIFwiYmluYXJ5XCIsXG4gICAgXCJnZW5lcmFsXCJcbl07XG5cbmNvbnN0IHZhbGlkRm9ybWF0ID0ge1xuICAgIG91dHB1dDoge1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICB2YWxpZFZhbHVlczogdmFsaWRPdXRwdXRWYWx1ZXNcbiAgICB9LFxuICAgIGJhc2U6IHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgdmFsaWRWYWx1ZXM6IHZhbGlkQmFzZVZhbHVlcyxcbiAgICAgICAgcmVzdHJpY3Rpb246IChudW1iZXIsIGZvcm1hdCkgPT4gZm9ybWF0Lm91dHB1dCA9PT0gXCJieXRlXCIsXG4gICAgICAgIG1lc3NhZ2U6IFwiYGJhc2VgIG11c3QgYmUgcHJvdmlkZWQgb25seSB3aGVuIHRoZSBvdXRwdXQgaXMgYGJ5dGVgXCIsXG4gICAgICAgIG1hbmRhdG9yeTogKGZvcm1hdCkgPT4gZm9ybWF0Lm91dHB1dCA9PT0gXCJieXRlXCJcbiAgICB9LFxuICAgIGNoYXJhY3RlcmlzdGljOiB7XG4gICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICAgIHJlc3RyaWN0aW9uOiAobnVtYmVyKSA9PiBudW1iZXIgPj0gMCxcbiAgICAgICAgbWVzc2FnZTogXCJ2YWx1ZSBtdXN0IGJlIHBvc2l0aXZlXCJcbiAgICB9LFxuICAgIHByZWZpeDogXCJzdHJpbmdcIixcbiAgICBwb3N0Zml4OiBcInN0cmluZ1wiLFxuICAgIGZvcmNlQXZlcmFnZToge1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICB2YWxpZFZhbHVlczogdmFsaWRGb3JjZUF2ZXJhZ2VWYWx1ZXNcbiAgICB9LFxuICAgIGF2ZXJhZ2U6IFwiYm9vbGVhblwiLFxuICAgIHRvdGFsTGVuZ3RoOiB7XG4gICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICAgIHJlc3RyaWN0aW9uczogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJlc3RyaWN0aW9uOiAobnVtYmVyKSA9PiBudW1iZXIgPj0gMCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcInZhbHVlIG11c3QgYmUgcG9zaXRpdmVcIlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdGlvbjogKG51bWJlciwgZm9ybWF0KSA9PiAhZm9ybWF0LmV4cG9uZW50aWFsLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiYHRvdGFsTGVuZ3RoYCBpcyBpbmNvbXBhdGlibGUgd2l0aCBgZXhwb25lbnRpYWxgXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0sXG4gICAgbWFudGlzc2E6IHtcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgcmVzdHJpY3Rpb246IChudW1iZXIpID0+IG51bWJlciA+PSAwLFxuICAgICAgICBtZXNzYWdlOiBcInZhbHVlIG11c3QgYmUgcG9zaXRpdmVcIlxuICAgIH0sXG4gICAgb3B0aW9uYWxNYW50aXNzYTogXCJib29sZWFuXCIsXG4gICAgb3B0aW9uYWxDaGFyYWN0ZXJpc3RpYzogXCJib29sZWFuXCIsXG4gICAgdGhvdXNhbmRTZXBhcmF0ZWQ6IFwiYm9vbGVhblwiLFxuICAgIHNwYWNlU2VwYXJhdGVkOiBcImJvb2xlYW5cIixcbiAgICBhYmJyZXZpYXRpb25zOiB2YWxpZEFiYnJldmlhdGlvbnMsXG4gICAgbmVnYXRpdmU6IHtcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgdmFsaWRWYWx1ZXM6IHZhbGlkTmVnYXRpdmVWYWx1ZXNcbiAgICB9LFxuICAgIGZvcmNlU2lnbjogXCJib29sZWFuXCIsXG4gICAgZXhwb25lbnRpYWw6IHtcbiAgICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICB9LFxuICAgIHByZWZpeFN5bWJvbDoge1xuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIixcbiAgICAgICAgcmVzdHJpY3Rpb246IChudW1iZXIsIGZvcm1hdCkgPT4gZm9ybWF0Lm91dHB1dCA9PT0gXCJwZXJjZW50XCIsXG4gICAgICAgIG1lc3NhZ2U6IFwiYHByZWZpeFN5bWJvbGAgY2FuIGJlIHByb3ZpZGVkIG9ubHkgd2hlbiB0aGUgb3V0cHV0IGlzIGBwZXJjZW50YFwiXG4gICAgfVxufTtcblxuY29uc3QgdmFsaWRMYW5ndWFnZSA9IHtcbiAgICBsYW5ndWFnZVRhZzoge1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICBtYW5kYXRvcnk6IHRydWUsXG4gICAgICAgIHJlc3RyaWN0aW9uOiAodGFnKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGFnLm1hdGNoKGJjcDQ3UmVnRXhwKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWVzc2FnZTogXCJ0aGUgbGFuZ3VhZ2UgdGFnIG11c3QgZm9sbG93IHRoZSBCQ1AgNDcgc3BlY2lmaWNhdGlvbiAoc2VlIGh0dHBzOi8vdG9vbHMuaWVmdC5vcmcvaHRtbC9iY3A0NylcIlxuICAgIH0sXG4gICAgZGVsaW1pdGVyczoge1xuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICBjaGlsZHJlbjoge1xuICAgICAgICAgICAgdGhvdXNhbmRzOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgZGVjaW1hbDogXCJzdHJpbmdcIlxuICAgICAgICB9LFxuICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICB9LFxuICAgIGFiYnJldmlhdGlvbnM6IHZhbGlkTWFuZGF0b3J5QWJicmV2aWF0aW9ucyxcbiAgICBzcGFjZVNlcGFyYXRlZDogXCJib29sZWFuXCIsXG4gICAgb3JkaW5hbDoge1xuICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgIH0sXG4gICAgY3VycmVuY3k6IHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgY2hpbGRyZW46IHtcbiAgICAgICAgICAgIHN5bWJvbDogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIHBvc2l0aW9uOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgY29kZTogXCJzdHJpbmdcIlxuICAgICAgICB9LFxuICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICB9LFxuICAgIGRlZmF1bHRzOiBcImZvcm1hdFwiLFxuICAgIG9yZGluYWxGb3JtYXQ6IFwiZm9ybWF0XCIsXG4gICAgYnl0ZUZvcm1hdDogXCJmb3JtYXRcIixcbiAgICBwZXJjZW50YWdlRm9ybWF0OiBcImZvcm1hdFwiLFxuICAgIGN1cnJlbmN5Rm9ybWF0OiBcImZvcm1hdFwiLFxuICAgIHRpbWVEZWZhdWx0czogXCJmb3JtYXRcIixcbiAgICBmb3JtYXRzOiB7XG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgIGNoaWxkcmVuOiB7XG4gICAgICAgICAgICBmb3VyRGlnaXRzOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmb3JtYXRcIixcbiAgICAgICAgICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdWxsV2l0aFR3b0RlY2ltYWxzOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmb3JtYXRcIixcbiAgICAgICAgICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdWxsV2l0aFR3b0RlY2ltYWxzTm9DdXJyZW5jeToge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVsbFdpdGhOb0RlY2ltYWxzOiB7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJmb3JtYXRcIixcbiAgICAgICAgICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogQ2hlY2sgdGhlIHZhbGlkaXR5IG9mIHRoZSBwcm92aWRlZCBpbnB1dCBhbmQgZm9ybWF0LlxuICogVGhlIGNoZWNrIGlzIE5PVCBsYXp5LlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfG51bWJlcnxOdW1icm99IGlucHV0IC0gaW5wdXQgdG8gY2hlY2tcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSBmb3JtYXQgLSBmb3JtYXQgdG8gY2hlY2tcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgd2hlbiBldmVyeXRoaW5nIGlzIGNvcnJlY3RcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGUoaW5wdXQsIGZvcm1hdCkge1xuICAgIGxldCB2YWxpZElucHV0ID0gdmFsaWRhdGVJbnB1dChpbnB1dCk7XG4gICAgbGV0IGlzRm9ybWF0VmFsaWQgPSB2YWxpZGF0ZUZvcm1hdChmb3JtYXQpO1xuXG4gICAgcmV0dXJuIHZhbGlkSW5wdXQgJiYgaXNGb3JtYXRWYWxpZDtcbn1cblxuLyoqXG4gKiBDaGVjayB0aGUgdmFsaWRpdHkgb2YgdGhlIG51bWJybyBpbnB1dC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ8TnVtYnJvfSBpbnB1dCAtIGlucHV0IHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIHdoZW4gZXZlcnl0aGluZyBpcyBjb3JyZWN0XG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlSW5wdXQoaW5wdXQpIHtcbiAgICBsZXQgdmFsdWUgPSB1bmZvcm1hdHRlci51bmZvcm1hdChpbnB1dCk7XG5cbiAgICByZXR1cm4gISF2YWx1ZTtcbn1cblxuLyoqXG4gKiBDaGVjayB0aGUgdmFsaWRpdHkgb2YgdGhlIHByb3ZpZGVkIGZvcm1hdCBUT1ZBTElEQVRFIGFnYWluc3QgU1BFQy5cbiAqXG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gdG9WYWxpZGF0ZSAtIGZvcm1hdCB0byBjaGVja1xuICogQHBhcmFtIHsqfSBzcGVjIC0gc3BlY2lmaWNhdGlvbiBhZ2FpbnN0IHdoaWNoIHRvIGNoZWNrXG4gKiBAcGFyYW0ge3N0cmluZ30gcHJlZml4IC0gcHJlZml4IHVzZSBmb3IgZXJyb3IgbWVzc2FnZXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc2tpcE1hbmRhdG9yeUNoZWNrIC0gYHRydWVgIHdoZW4gdGhlIGNoZWNrIGZvciBtYW5kYXRvcnkga2V5IG11c3QgYmUgc2tpcHBlZFxuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSB3aGVuIGV2ZXJ5dGhpbmcgaXMgY29ycmVjdFxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZVNwZWModG9WYWxpZGF0ZSwgc3BlYywgcHJlZml4LCBza2lwTWFuZGF0b3J5Q2hlY2sgPSBmYWxzZSkge1xuICAgIGxldCByZXN1bHRzID0gT2JqZWN0LmtleXModG9WYWxpZGF0ZSkubWFwKChrZXkpID0+IHtcbiAgICAgICAgaWYgKCFzcGVjW2tleV0pIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7cHJlZml4fSBJbnZhbGlkIGtleTogJHtrZXl9YCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHZhbHVlID0gdG9WYWxpZGF0ZVtrZXldO1xuICAgICAgICBsZXQgZGF0YSA9IHNwZWNba2V5XTtcblxuICAgICAgICBpZiAodHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgIGRhdGEgPSB7dHlwZTogZGF0YX07XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS50eXBlID09PSBcImZvcm1hdFwiKSB7IC8vIGFsbCBmb3JtYXRzIGFyZSBwYXJ0aWFsIChhLmsuYSB3aWxsIGJlIG1lcmdlZCB3aXRoIHNvbWUgZGVmYXVsdCB2YWx1ZXMpIHRodXMgbm8gbmVlZCB0byBjaGVjayBtYW5kYXRvcnkgdmFsdWVzXG4gICAgICAgICAgICBsZXQgdmFsaWQgPSB2YWxpZGF0ZVNwZWModmFsdWUsIHZhbGlkRm9ybWF0LCBgW1ZhbGlkYXRlICR7a2V5fV1gLCB0cnVlKTtcblxuICAgICAgICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgIT09IGRhdGEudHlwZSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtwcmVmaXh9ICR7a2V5fSB0eXBlIG1pc21hdGNoZWQ6IFwiJHtkYXRhLnR5cGV9XCIgZXhwZWN0ZWQsIFwiJHt0eXBlb2YgdmFsdWV9XCIgcHJvdmlkZWRgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS5yZXN0cmljdGlvbnMgJiYgZGF0YS5yZXN0cmljdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgbGVuZ3RoID0gZGF0YS5yZXN0cmljdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGxldCB7cmVzdHJpY3Rpb24sIG1lc3NhZ2V9ID0gZGF0YS5yZXN0cmljdGlvbnNbaV07XG4gICAgICAgICAgICAgICAgaWYgKCFyZXN0cmljdGlvbih2YWx1ZSwgdG9WYWxpZGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtwcmVmaXh9ICR7a2V5fSBpbnZhbGlkIHZhbHVlOiAke21lc3NhZ2V9YCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEucmVzdHJpY3Rpb24gJiYgIWRhdGEucmVzdHJpY3Rpb24odmFsdWUsIHRvVmFsaWRhdGUpKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke3ByZWZpeH0gJHtrZXl9IGludmFsaWQgdmFsdWU6ICR7ZGF0YS5tZXNzYWdlfWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkYXRhLnZhbGlkVmFsdWVzICYmIGRhdGEudmFsaWRWYWx1ZXMuaW5kZXhPZih2YWx1ZSkgPT09IC0xKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke3ByZWZpeH0gJHtrZXl9IGludmFsaWQgdmFsdWU6IG11c3QgYmUgYW1vbmcgJHtKU09OLnN0cmluZ2lmeShkYXRhLnZhbGlkVmFsdWVzKX0sIFwiJHt2YWx1ZX1cIiBwcm92aWRlZGApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkYXRhLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICBsZXQgdmFsaWQgPSB2YWxpZGF0ZVNwZWModmFsdWUsIGRhdGEuY2hpbGRyZW4sIGBbVmFsaWRhdGUgJHtrZXl9XWApO1xuXG4gICAgICAgICAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAoIXNraXBNYW5kYXRvcnlDaGVjaykge1xuICAgICAgICByZXN1bHRzLnB1c2goLi4uT2JqZWN0LmtleXMoc3BlYykubWFwKChrZXkpID0+IHtcbiAgICAgICAgICAgIGxldCBkYXRhID0gc3BlY1trZXldO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHt0eXBlOiBkYXRhfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRhdGEubWFuZGF0b3J5KSB7XG4gICAgICAgICAgICAgICAgbGV0IG1hbmRhdG9yeSA9IGRhdGEubWFuZGF0b3J5O1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgbWFuZGF0b3J5ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbWFuZGF0b3J5ID0gbWFuZGF0b3J5KHRvVmFsaWRhdGUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChtYW5kYXRvcnkgJiYgdG9WYWxpZGF0ZVtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtwcmVmaXh9IE1pc3NpbmcgbWFuZGF0b3J5IGtleSBcIiR7a2V5fVwiYCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRzLnJlZHVjZSgoYWNjLCBjdXJyZW50KSA9PiB7XG4gICAgICAgIHJldHVybiBhY2MgJiYgY3VycmVudDtcbiAgICB9LCB0cnVlKTtcbn1cblxuLyoqXG4gKiBDaGVjayB0aGUgcHJvdmlkZWQgRk9STUFULlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSBmb3JtYXQgLSBmb3JtYXQgdG8gY2hlY2tcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlRm9ybWF0KGZvcm1hdCkge1xuICAgIHJldHVybiB2YWxpZGF0ZVNwZWMoZm9ybWF0LCB2YWxpZEZvcm1hdCwgXCJbVmFsaWRhdGUgZm9ybWF0XVwiKTtcbn1cblxuLyoqXG4gKiBDaGVjayB0aGUgcHJvdmlkZWQgTEFOR1VBR0UuXG4gKlxuICogQHBhcmFtIHtOdW1icm9MYW5ndWFnZX0gbGFuZ3VhZ2UgLSBsYW5ndWFnZSB0byBjaGVja1xuICogQHJldHVybiB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVMYW5ndWFnZShsYW5ndWFnZSkge1xuICAgIHJldHVybiB2YWxpZGF0ZVNwZWMobGFuZ3VhZ2UsIHZhbGlkTGFuZ3VhZ2UsIFwiW1ZhbGlkYXRlIGxhbmd1YWdlXVwiKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgdmFsaWRhdGUsXG4gICAgdmFsaWRhdGVGb3JtYXQsXG4gICAgdmFsaWRhdGVJbnB1dCxcbiAgICB2YWxpZGF0ZUxhbmd1YWdlXG59O1xuIl19
