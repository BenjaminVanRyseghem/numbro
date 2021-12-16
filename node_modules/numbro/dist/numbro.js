(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.numbro = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
;(function (globalObject) {
  'use strict';

/*
 *      bignumber.js v8.1.1
 *      A JavaScript library for arbitrary-precision arithmetic.
 *      https://github.com/MikeMcl/bignumber.js
 *      Copyright (c) 2019 Michael Mclaughlin <M8ch88l@gmail.com>
 *      MIT Licensed.
 *
 *      BigNumber.prototype methods     |  BigNumber methods
 *                                      |
 *      absoluteValue            abs    |  clone
 *      comparedTo                      |  config               set
 *      decimalPlaces            dp     |      DECIMAL_PLACES
 *      dividedBy                div    |      ROUNDING_MODE
 *      dividedToIntegerBy       idiv   |      EXPONENTIAL_AT
 *      exponentiatedBy          pow    |      RANGE
 *      integerValue                    |      CRYPTO
 *      isEqualTo                eq     |      MODULO_MODE
 *      isFinite                        |      POW_PRECISION
 *      isGreaterThan            gt     |      FORMAT
 *      isGreaterThanOrEqualTo   gte    |      ALPHABET
 *      isInteger                       |  isBigNumber
 *      isLessThan               lt     |  maximum              max
 *      isLessThanOrEqualTo      lte    |  minimum              min
 *      isNaN                           |  random
 *      isNegative                      |  sum
 *      isPositive                      |
 *      isZero                          |
 *      minus                           |
 *      modulo                   mod    |
 *      multipliedBy             times  |
 *      negated                         |
 *      plus                            |
 *      precision                sd     |
 *      shiftedBy                       |
 *      squareRoot               sqrt   |
 *      toExponential                   |
 *      toFixed                         |
 *      toFormat                        |
 *      toFraction                      |
 *      toJSON                          |
 *      toNumber                        |
 *      toPrecision                     |
 *      toString                        |
 *      valueOf                         |
 *
 */


  var BigNumber,
    isNumeric = /^-?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i,
    hasSymbol = typeof Symbol == 'function' && typeof Symbol.iterator == 'symbol',

    mathceil = Math.ceil,
    mathfloor = Math.floor,

    bignumberError = '[BigNumber Error] ',
    tooManyDigits = bignumberError + 'Number primitive has more than 15 significant digits: ',

    BASE = 1e14,
    LOG_BASE = 14,
    MAX_SAFE_INTEGER = 0x1fffffffffffff,         // 2^53 - 1
    // MAX_INT32 = 0x7fffffff,                   // 2^31 - 1
    POWS_TEN = [1, 10, 100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13],
    SQRT_BASE = 1e7,

    // EDITABLE
    // The limit on the value of DECIMAL_PLACES, TO_EXP_NEG, TO_EXP_POS, MIN_EXP, MAX_EXP, and
    // the arguments to toExponential, toFixed, toFormat, and toPrecision.
    MAX = 1E9;                                   // 0 to MAX_INT32


  /*
   * Create and return a BigNumber constructor.
   */
  function clone(configObject) {
    var div, convertBase, parseNumeric,
      P = BigNumber.prototype = { constructor: BigNumber, toString: null, valueOf: null },
      ONE = new BigNumber(1),


      //----------------------------- EDITABLE CONFIG DEFAULTS -------------------------------


      // The default values below must be integers within the inclusive ranges stated.
      // The values can also be changed at run-time using BigNumber.set.

      // The maximum number of decimal places for operations involving division.
      DECIMAL_PLACES = 20,                     // 0 to MAX

      // The rounding mode used when rounding to the above decimal places, and when using
      // toExponential, toFixed, toFormat and toPrecision, and round (default value).
      // UP         0 Away from zero.
      // DOWN       1 Towards zero.
      // CEIL       2 Towards +Infinity.
      // FLOOR      3 Towards -Infinity.
      // HALF_UP    4 Towards nearest neighbour. If equidistant, up.
      // HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
      // HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
      // HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
      // HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
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

      // Whether to use cryptographically-secure random number generation, if available.
      CRYPTO = false,                          // true or false

      // The modulo mode used when calculating the modulus: a mod n.
      // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
      // The remainder (r) is calculated as: r = a - n * q.
      //
      // UP        0 The remainder is positive if the dividend is negative, else is negative.
      // DOWN      1 The remainder has the same sign as the dividend.
      //             This modulo mode is commonly known as 'truncated division' and is
      //             equivalent to (a % n) in JavaScript.
      // FLOOR     3 The remainder has the same sign as the divisor (Python %).
      // HALF_EVEN 6 This modulo mode implements the IEEE 754 remainder function.
      // EUCLID    9 Euclidian division. q = sign(n) * floor(a / abs(n)).
      //             The remainder is always positive.
      //
      // The truncated division, floored division, Euclidian division and IEEE 754 remainder
      // modes are commonly used for the modulus operation.
      // Although the other rounding modes can also be used, they may not give useful results.
      MODULO_MODE = 1,                         // 0 to 9

      // The maximum number of significant digits of the result of the exponentiatedBy operation.
      // If POW_PRECISION is 0, there will be unlimited significant digits.
      POW_PRECISION = 0,                    // 0 to MAX

      // The format specification used by the BigNumber.prototype.toFormat method.
      FORMAT = {
        prefix: '',
        groupSize: 3,
        secondaryGroupSize: 0,
        groupSeparator: ',',
        decimalSeparator: '.',
        fractionGroupSize: 0,
        fractionGroupSeparator: '\xA0',      // non-breaking space
        suffix: ''
      },

      // The alphabet used for base conversion. It must be at least 2 characters long, with no '+',
      // '-', '.', whitespace, or repeated character.
      // '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$_'
      ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyz';


    //------------------------------------------------------------------------------------------


    // CONSTRUCTOR


    /*
     * The BigNumber constructor and exported function.
     * Create and return a new instance of a BigNumber object.
     *
     * v {number|string|BigNumber} A numeric value.
     * [b] {number} The base of v. Integer, 2 to ALPHABET.length inclusive.
     */
    function BigNumber(v, b) {
      var alphabet, c, caseChanged, e, i, isNum, len, str,
        x = this;

      // Enable constructor call without `new`.
      if (!(x instanceof BigNumber)) return new BigNumber(v, b);

      if (b == null) {

        if (v && v._isBigNumber === true) {
          x.s = v.s;

          if (!v.c || v.e > MAX_EXP) {
            x.c = x.e = null;
          } else if (v.e < MIN_EXP) {
            x.c = [x.e = 0];
          } else {
            x.e = v.e;
            x.c = v.c.slice();
          }

          return;
        }

        if ((isNum = typeof v == 'number') && v * 0 == 0) {

          // Use `1 / n` to handle minus zero also.
          x.s = 1 / v < 0 ? (v = -v, -1) : 1;

          // Fast path for integers, where n < 2147483648 (2**31).
          if (v === ~~v) {
            for (e = 0, i = v; i >= 10; i /= 10, e++);

            if (e > MAX_EXP) {
              x.c = x.e = null;
            } else {
              x.e = e;
              x.c = [v];
            }

            return;
          }

          str = String(v);
        } else {

          if (!isNumeric.test(str = String(v))) return parseNumeric(x, str, isNum);

          x.s = str.charCodeAt(0) == 45 ? (str = str.slice(1), -1) : 1;
        }

        // Decimal point?
        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');

        // Exponential form?
        if ((i = str.search(/e/i)) > 0) {

          // Determine exponent.
          if (e < 0) e = i;
          e += +str.slice(i + 1);
          str = str.substring(0, i);
        } else if (e < 0) {

          // Integer.
          e = str.length;
        }

      } else {

        // '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
        intCheck(b, 2, ALPHABET.length, 'Base');

        // Allow exponential notation to be used with base 10 argument, while
        // also rounding to DECIMAL_PLACES as with other bases.
        if (b == 10) {
          x = new BigNumber(v);
          return round(x, DECIMAL_PLACES + x.e + 1, ROUNDING_MODE);
        }

        str = String(v);

        if (isNum = typeof v == 'number') {

          // Avoid potential interpretation of Infinity and NaN as base 44+ values.
          if (v * 0 != 0) return parseNumeric(x, str, isNum, b);

          x.s = 1 / v < 0 ? (str = str.slice(1), -1) : 1;

          // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
          if (BigNumber.DEBUG && str.replace(/^0\.0*|\./, '').length > 15) {
            throw Error
             (tooManyDigits + v);
          }
        } else {
          x.s = str.charCodeAt(0) === 45 ? (str = str.slice(1), -1) : 1;
        }

        alphabet = ALPHABET.slice(0, b);
        e = i = 0;

        // Check that str is a valid base b number.
        // Don't use RegExp, so alphabet can contain special characters.
        for (len = str.length; i < len; i++) {
          if (alphabet.indexOf(c = str.charAt(i)) < 0) {
            if (c == '.') {

              // If '.' is not the first character and it has not be found before.
              if (i > e) {
                e = len;
                continue;
              }
            } else if (!caseChanged) {

              // Allow e.g. hexadecimal 'FF' as well as 'ff'.
              if (str == str.toUpperCase() && (str = str.toLowerCase()) ||
                  str == str.toLowerCase() && (str = str.toUpperCase())) {
                caseChanged = true;
                i = -1;
                e = 0;
                continue;
              }
            }

            return parseNumeric(x, String(v), isNum, b);
          }
        }

        // Prevent later check for length on converted number.
        isNum = false;
        str = convertBase(str, b, 10, x.s);

        // Decimal point?
        if ((e = str.indexOf('.')) > -1) str = str.replace('.', '');
        else e = str.length;
      }

      // Determine leading zeros.
      for (i = 0; str.charCodeAt(i) === 48; i++);

      // Determine trailing zeros.
      for (len = str.length; str.charCodeAt(--len) === 48;);

      if (str = str.slice(i, ++len)) {
        len -= i;

        // '[BigNumber Error] Number primitive has more than 15 significant digits: {n}'
        if (isNum && BigNumber.DEBUG &&
          len > 15 && (v > MAX_SAFE_INTEGER || v !== mathfloor(v))) {
            throw Error
             (tooManyDigits + (x.s * v));
        }

         // Overflow?
        if ((e = e - i - 1) > MAX_EXP) {

          // Infinity.
          x.c = x.e = null;

        // Underflow?
        } else if (e < MIN_EXP) {

          // Zero.
          x.c = [x.e = 0];
        } else {
          x.e = e;
          x.c = [];

          // Transform base

          // e is the base 10 exponent.
          // i is where to slice str to get the first element of the coefficient array.
          i = (e + 1) % LOG_BASE;
          if (e < 0) i += LOG_BASE;  // i < 1

          if (i < len) {
            if (i) x.c.push(+str.slice(0, i));

            for (len -= LOG_BASE; i < len;) {
              x.c.push(+str.slice(i, i += LOG_BASE));
            }

            i = LOG_BASE - (str = str.slice(i)).length;
          } else {
            i -= len;
          }

          for (; i--; str += '0');
          x.c.push(+str);
        }
      } else {

        // Zero.
        x.c = [x.e = 0];
      }
    }


    // CONSTRUCTOR PROPERTIES


    BigNumber.clone = clone;

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
     * Accept an object with the following optional properties (if the value of a property is
     * a number, it must be an integer within the inclusive range stated):
     *
     *   DECIMAL_PLACES   {number}           0 to MAX
     *   ROUNDING_MODE    {number}           0 to 8
     *   EXPONENTIAL_AT   {number|number[]}  -MAX to MAX  or  [-MAX to 0, 0 to MAX]
     *   RANGE            {number|number[]}  -MAX to MAX (not zero)  or  [-MAX to -1, 1 to MAX]
     *   CRYPTO           {boolean}          true or false
     *   MODULO_MODE      {number}           0 to 9
     *   POW_PRECISION       {number}           0 to MAX
     *   ALPHABET         {string}           A string of two or more unique characters which does
     *                                       not contain '.'.
     *   FORMAT           {object}           An object with some of the following properties:
     *     prefix                 {string}
     *     groupSize              {number}
     *     secondaryGroupSize     {number}
     *     groupSeparator         {string}
     *     decimalSeparator       {string}
     *     fractionGroupSize      {number}
     *     fractionGroupSeparator {string}
     *     suffix                 {string}
     *
     * (The values assigned to the above FORMAT object properties are not checked for validity.)
     *
     * E.g.
     * BigNumber.config({ DECIMAL_PLACES : 20, ROUNDING_MODE : 4 })
     *
     * Ignore properties/parameters set to null or undefined, except for ALPHABET.
     *
     * Return an object with the properties current values.
     */
    BigNumber.config = BigNumber.set = function (obj) {
      var p, v;

      if (obj != null) {

        if (typeof obj == 'object') {

          // DECIMAL_PLACES {number} Integer, 0 to MAX inclusive.
          // '[BigNumber Error] DECIMAL_PLACES {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'DECIMAL_PLACES')) {
            v = obj[p];
            intCheck(v, 0, MAX, p);
            DECIMAL_PLACES = v;
          }

          // ROUNDING_MODE {number} Integer, 0 to 8 inclusive.
          // '[BigNumber Error] ROUNDING_MODE {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'ROUNDING_MODE')) {
            v = obj[p];
            intCheck(v, 0, 8, p);
            ROUNDING_MODE = v;
          }

          // EXPONENTIAL_AT {number|number[]}
          // Integer, -MAX to MAX inclusive or
          // [integer -MAX to 0 inclusive, 0 to MAX inclusive].
          // '[BigNumber Error] EXPONENTIAL_AT {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'EXPONENTIAL_AT')) {
            v = obj[p];
            if (v && v.pop) {
              intCheck(v[0], -MAX, 0, p);
              intCheck(v[1], 0, MAX, p);
              TO_EXP_NEG = v[0];
              TO_EXP_POS = v[1];
            } else {
              intCheck(v, -MAX, MAX, p);
              TO_EXP_NEG = -(TO_EXP_POS = v < 0 ? -v : v);
            }
          }

          // RANGE {number|number[]} Non-zero integer, -MAX to MAX inclusive or
          // [integer -MAX to -1 inclusive, integer 1 to MAX inclusive].
          // '[BigNumber Error] RANGE {not a primitive number|not an integer|out of range|cannot be zero}: {v}'
          if (obj.hasOwnProperty(p = 'RANGE')) {
            v = obj[p];
            if (v && v.pop) {
              intCheck(v[0], -MAX, -1, p);
              intCheck(v[1], 1, MAX, p);
              MIN_EXP = v[0];
              MAX_EXP = v[1];
            } else {
              intCheck(v, -MAX, MAX, p);
              if (v) {
                MIN_EXP = -(MAX_EXP = v < 0 ? -v : v);
              } else {
                throw Error
                 (bignumberError + p + ' cannot be zero: ' + v);
              }
            }
          }

          // CRYPTO {boolean} true or false.
          // '[BigNumber Error] CRYPTO not true or false: {v}'
          // '[BigNumber Error] crypto unavailable'
          if (obj.hasOwnProperty(p = 'CRYPTO')) {
            v = obj[p];
            if (v === !!v) {
              if (v) {
                if (typeof crypto != 'undefined' && crypto &&
                 (crypto.getRandomValues || crypto.randomBytes)) {
                  CRYPTO = v;
                } else {
                  CRYPTO = !v;
                  throw Error
                   (bignumberError + 'crypto unavailable');
                }
              } else {
                CRYPTO = v;
              }
            } else {
              throw Error
               (bignumberError + p + ' not true or false: ' + v);
            }
          }

          // MODULO_MODE {number} Integer, 0 to 9 inclusive.
          // '[BigNumber Error] MODULO_MODE {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'MODULO_MODE')) {
            v = obj[p];
            intCheck(v, 0, 9, p);
            MODULO_MODE = v;
          }

          // POW_PRECISION {number} Integer, 0 to MAX inclusive.
          // '[BigNumber Error] POW_PRECISION {not a primitive number|not an integer|out of range}: {v}'
          if (obj.hasOwnProperty(p = 'POW_PRECISION')) {
            v = obj[p];
            intCheck(v, 0, MAX, p);
            POW_PRECISION = v;
          }

          // FORMAT {object}
          // '[BigNumber Error] FORMAT not an object: {v}'
          if (obj.hasOwnProperty(p = 'FORMAT')) {
            v = obj[p];
            if (typeof v == 'object') FORMAT = v;
            else throw Error
             (bignumberError + p + ' not an object: ' + v);
          }

          // ALPHABET {string}
          // '[BigNumber Error] ALPHABET invalid: {v}'
          if (obj.hasOwnProperty(p = 'ALPHABET')) {
            v = obj[p];

            // Disallow if only one character,
            // or if it contains '+', '-', '.', whitespace, or a repeated character.
            if (typeof v == 'string' && !/^.$|[+-.\s]|(.).*\1/.test(v)) {
              ALPHABET = v;
            } else {
              throw Error
               (bignumberError + p + ' invalid: ' + v);
            }
          }

        } else {

          // '[BigNumber Error] Object expected: {v}'
          throw Error
           (bignumberError + 'Object expected: ' + obj);
        }
      }

      return {
        DECIMAL_PLACES: DECIMAL_PLACES,
        ROUNDING_MODE: ROUNDING_MODE,
        EXPONENTIAL_AT: [TO_EXP_NEG, TO_EXP_POS],
        RANGE: [MIN_EXP, MAX_EXP],
        CRYPTO: CRYPTO,
        MODULO_MODE: MODULO_MODE,
        POW_PRECISION: POW_PRECISION,
        FORMAT: FORMAT,
        ALPHABET: ALPHABET
      };
    };


    /*
     * Return true if v is a BigNumber instance, otherwise return false.
     *
     * If BigNumber.DEBUG is true, throw if a BigNumber instance is not well-formed.
     *
     * v {any}
     *
     * '[BigNumber Error] Invalid BigNumber: {v}'
     */
    BigNumber.isBigNumber = function (v) {
      if (!v || v._isBigNumber !== true) return false;
      if (!BigNumber.DEBUG) return true;

      var i, n,
        c = v.c,
        e = v.e,
        s = v.s;

      out: if ({}.toString.call(c) == '[object Array]') {

        if ((s === 1 || s === -1) && e >= -MAX && e <= MAX && e === mathfloor(e)) {

          // If the first element is zero, the BigNumber value must be zero.
          if (c[0] === 0) {
            if (e === 0 && c.length === 1) return true;
            break out;
          }

          // Calculate number of digits that c[0] should have, based on the exponent.
          i = (e + 1) % LOG_BASE;
          if (i < 1) i += LOG_BASE;

          // Calculate number of digits of c[0].
          //if (Math.ceil(Math.log(c[0] + 1) / Math.LN10) == i) {
          if (String(c[0]).length == i) {

            for (i = 0; i < c.length; i++) {
              n = c[i];
              if (n < 0 || n >= BASE || n !== mathfloor(n)) break out;
            }

            // Last element cannot be zero, unless it is the only element.
            if (n !== 0) return true;
          }
        }

      // Infinity/NaN
      } else if (c === null && e === null && (s === null || s === 1 || s === -1)) {
        return true;
      }

      throw Error
        (bignumberError + 'Invalid BigNumber: ' + v);
    };


    /*
     * Return a new BigNumber whose value is the maximum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.maximum = BigNumber.max = function () {
      return maxOrMin(arguments, P.lt);
    };


    /*
     * Return a new BigNumber whose value is the minimum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.minimum = BigNumber.min = function () {
      return maxOrMin(arguments, P.gt);
    };


    /*
     * Return a new BigNumber with a random value equal to or greater than 0 and less than 1,
     * and with dp, or DECIMAL_PLACES if dp is omitted, decimal places (or less if trailing
     * zeros are produced).
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp}'
     * '[BigNumber Error] crypto unavailable'
     */
    BigNumber.random = (function () {
      var pow2_53 = 0x20000000000000;

      // Return a 53 bit integer n, where 0 <= n < 9007199254740992.
      // Check if Math.random() produces more than 32 bits of randomness.
      // If it does, assume at least 53 bits are produced, otherwise assume at least 30 bits.
      // 0x40000000 is 2^30, 0x800000 is 2^23, 0x1fffff is 2^21 - 1.
      var random53bitInt = (Math.random() * pow2_53) & 0x1fffff
       ? function () { return mathfloor(Math.random() * pow2_53); }
       : function () { return ((Math.random() * 0x40000000 | 0) * 0x800000) +
         (Math.random() * 0x800000 | 0); };

      return function (dp) {
        var a, b, e, k, v,
          i = 0,
          c = [],
          rand = new BigNumber(ONE);

        if (dp == null) dp = DECIMAL_PLACES;
        else intCheck(dp, 0, MAX);

        k = mathceil(dp / LOG_BASE);

        if (CRYPTO) {

          // Browsers supporting crypto.getRandomValues.
          if (crypto.getRandomValues) {

            a = crypto.getRandomValues(new Uint32Array(k *= 2));

            for (; i < k;) {

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
              if (v >= 9e15) {
                b = crypto.getRandomValues(new Uint32Array(2));
                a[i] = b[0];
                a[i + 1] = b[1];
              } else {

                // 0 <= v <= 8999999999999999
                // 0 <= (v % 1e14) <= 99999999999999
                c.push(v % 1e14);
                i += 2;
              }
            }
            i = k / 2;

          // Node.js supporting crypto.randomBytes.
          } else if (crypto.randomBytes) {

            // buffer
            a = crypto.randomBytes(k *= 7);

            for (; i < k;) {

              // 0x1000000000000 is 2^48, 0x10000000000 is 2^40
              // 0x100000000 is 2^32, 0x1000000 is 2^24
              // 11111 11111111 11111111 11111111 11111111 11111111 11111111
              // 0 <= v < 9007199254740992
              v = ((a[i] & 31) * 0x1000000000000) + (a[i + 1] * 0x10000000000) +
                 (a[i + 2] * 0x100000000) + (a[i + 3] * 0x1000000) +
                 (a[i + 4] << 16) + (a[i + 5] << 8) + a[i + 6];

              if (v >= 9e15) {
                crypto.randomBytes(7).copy(a, i);
              } else {

                // 0 <= (v % 1e14) <= 99999999999999
                c.push(v % 1e14);
                i += 7;
              }
            }
            i = k / 7;
          } else {
            CRYPTO = false;
            throw Error
             (bignumberError + 'crypto unavailable');
          }
        }

        // Use Math.random.
        if (!CRYPTO) {

          for (; i < k;) {
            v = random53bitInt();
            if (v < 9e15) c[i++] = v % 1e14;
          }
        }

        k = c[--i];
        dp %= LOG_BASE;

        // Convert trailing digits to zeros according to dp.
        if (k && dp) {
          v = POWS_TEN[LOG_BASE - dp];
          c[i] = mathfloor(k / v) * v;
        }

        // Remove trailing elements which are zero.
        for (; c[i] === 0; c.pop(), i--);

        // Zero?
        if (i < 0) {
          c = [e = 0];
        } else {

          // Remove leading elements which are zero and adjust exponent accordingly.
          for (e = -1 ; c[0] === 0; c.splice(0, 1), e -= LOG_BASE);

          // Count the digits of the first element of c to determine leading zeros, and...
          for (i = 1, v = c[0]; v >= 10; v /= 10, i++);

          // adjust the exponent accordingly.
          if (i < LOG_BASE) e -= LOG_BASE - i;
        }

        rand.e = e;
        rand.c = c;
        return rand;
      };
    })();


    /*
     * Return a BigNumber whose value is the sum of the arguments.
     *
     * arguments {number|string|BigNumber}
     */
    BigNumber.sum = function () {
      var i = 1,
        args = arguments,
        sum = new BigNumber(args[0]);
      for (; i < args.length;) sum = sum.plus(args[i++]);
      return sum;
    };


    // PRIVATE FUNCTIONS


    // Called by BigNumber and BigNumber.prototype.toString.
    convertBase = (function () {
      var decimal = '0123456789';

      /*
       * Convert string of baseIn to an array of numbers of baseOut.
       * Eg. toBaseOut('255', 10, 16) returns [15, 15].
       * Eg. toBaseOut('ff', 16, 10) returns [2, 5, 5].
       */
      function toBaseOut(str, baseIn, baseOut, alphabet) {
        var j,
          arr = [0],
          arrL,
          i = 0,
          len = str.length;

        for (; i < len;) {
          for (arrL = arr.length; arrL--; arr[arrL] *= baseIn);

          arr[0] += alphabet.indexOf(str.charAt(i++));

          for (j = 0; j < arr.length; j++) {

            if (arr[j] > baseOut - 1) {
              if (arr[j + 1] == null) arr[j + 1] = 0;
              arr[j + 1] += arr[j] / baseOut | 0;
              arr[j] %= baseOut;
            }
          }
        }

        return arr.reverse();
      }

      // Convert a numeric string of baseIn to a numeric string of baseOut.
      // If the caller is toString, we are converting from base 10 to baseOut.
      // If the caller is BigNumber, we are converting from baseIn to base 10.
      return function (str, baseIn, baseOut, sign, callerIsToString) {
        var alphabet, d, e, k, r, x, xc, y,
          i = str.indexOf('.'),
          dp = DECIMAL_PLACES,
          rm = ROUNDING_MODE;

        // Non-integer.
        if (i >= 0) {
          k = POW_PRECISION;

          // Unlimited precision.
          POW_PRECISION = 0;
          str = str.replace('.', '');
          y = new BigNumber(baseIn);
          x = y.pow(str.length - i);
          POW_PRECISION = k;

          // Convert str as if an integer, then restore the fraction part by dividing the
          // result by its base raised to a power.

          y.c = toBaseOut(toFixedPoint(coeffToString(x.c), x.e, '0'),
           10, baseOut, decimal);
          y.e = y.c.length;
        }

        // Convert the number as integer.

        xc = toBaseOut(str, baseIn, baseOut, callerIsToString
         ? (alphabet = ALPHABET, decimal)
         : (alphabet = decimal, ALPHABET));

        // xc now represents str as an integer and converted to baseOut. e is the exponent.
        e = k = xc.length;

        // Remove trailing zeros.
        for (; xc[--k] == 0; xc.pop());

        // Zero?
        if (!xc[0]) return alphabet.charAt(0);

        // Does str represent an integer? If so, no need for the division.
        if (i < 0) {
          --e;
        } else {
          x.c = xc;
          x.e = e;

          // The sign is needed for correct rounding.
          x.s = sign;
          x = div(x, y, dp, rm, baseOut);
          xc = x.c;
          r = x.r;
          e = x.e;
        }

        // xc now represents str converted to baseOut.

        // THe index of the rounding digit.
        d = e + dp + 1;

        // The rounding digit: the digit to the right of the digit that may be rounded up.
        i = xc[d];

        // Look at the rounding digits and mode to determine whether to round up.

        k = baseOut / 2;
        r = r || d < 0 || xc[d + 1] != null;

        r = rm < 4 ? (i != null || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
              : i > k || i == k &&(rm == 4 || r || rm == 6 && xc[d - 1] & 1 ||
               rm == (x.s < 0 ? 8 : 7));

        // If the index of the rounding digit is not greater than zero, or xc represents
        // zero, then the result of the base conversion is zero or, if rounding up, a value
        // such as 0.00001.
        if (d < 1 || !xc[0]) {

          // 1^-dp or 0
          str = r ? toFixedPoint(alphabet.charAt(1), -dp, alphabet.charAt(0)) : alphabet.charAt(0);
        } else {

          // Truncate xc to the required number of decimal places.
          xc.length = d;

          // Round up?
          if (r) {

            // Rounding up may mean the previous digit has to be rounded up and so on.
            for (--baseOut; ++xc[--d] > baseOut;) {
              xc[d] = 0;

              if (!d) {
                ++e;
                xc = [1].concat(xc);
              }
            }
          }

          // Determine trailing zeros.
          for (k = xc.length; !xc[--k];);

          // E.g. [4, 11, 15] becomes 4bf.
          for (i = 0, str = ''; i <= k; str += alphabet.charAt(xc[i++]));

          // Add leading zeros, decimal point and trailing zeros as required.
          str = toFixedPoint(str, e, alphabet.charAt(0));
        }

        // The caller will add the sign.
        return str;
      };
    })();


    // Perform division in the specified base. Called by div and convertBase.
    div = (function () {

      // Assume non-zero x and k.
      function multiply(x, k, base) {
        var m, temp, xlo, xhi,
          carry = 0,
          i = x.length,
          klo = k % SQRT_BASE,
          khi = k / SQRT_BASE | 0;

        for (x = x.slice(); i--;) {
          xlo = x[i] % SQRT_BASE;
          xhi = x[i] / SQRT_BASE | 0;
          m = khi * xlo + xhi * klo;
          temp = klo * xlo + ((m % SQRT_BASE) * SQRT_BASE) + carry;
          carry = (temp / base | 0) + (m / SQRT_BASE | 0) + khi * xhi;
          x[i] = temp % base;
        }

        if (carry) x = [carry].concat(x);

        return x;
      }

      function compare(a, b, aL, bL) {
        var i, cmp;

        if (aL != bL) {
          cmp = aL > bL ? 1 : -1;
        } else {

          for (i = cmp = 0; i < aL; i++) {

            if (a[i] != b[i]) {
              cmp = a[i] > b[i] ? 1 : -1;
              break;
            }
          }
        }

        return cmp;
      }

      function subtract(a, b, aL, base) {
        var i = 0;

        // Subtract b from a.
        for (; aL--;) {
          a[aL] -= i;
          i = a[aL] < b[aL] ? 1 : 0;
          a[aL] = i * base + a[aL] - b[aL];
        }

        // Remove leading zeros.
        for (; !a[0] && a.length > 1; a.splice(0, 1));
      }

      // x: dividend, y: divisor.
      return function (x, y, dp, rm, base) {
        var cmp, e, i, more, n, prod, prodL, q, qc, rem, remL, rem0, xi, xL, yc0,
          yL, yz,
          s = x.s == y.s ? 1 : -1,
          xc = x.c,
          yc = y.c;

        // Either NaN, Infinity or 0?
        if (!xc || !xc[0] || !yc || !yc[0]) {

          return new BigNumber(

           // Return NaN if either NaN, or both Infinity or 0.
           !x.s || !y.s || (xc ? yc && xc[0] == yc[0] : !yc) ? NaN :

            // Return ±0 if x is ±0 or y is ±Infinity, or return ±Infinity as y is ±0.
            xc && xc[0] == 0 || !yc ? s * 0 : s / 0
         );
        }

        q = new BigNumber(s);
        qc = q.c = [];
        e = x.e - y.e;
        s = dp + e + 1;

        if (!base) {
          base = BASE;
          e = bitFloor(x.e / LOG_BASE) - bitFloor(y.e / LOG_BASE);
          s = s / LOG_BASE | 0;
        }

        // Result exponent may be one less then the current value of e.
        // The coefficients of the BigNumbers from convertBase may have trailing zeros.
        for (i = 0; yc[i] == (xc[i] || 0); i++);

        if (yc[i] > (xc[i] || 0)) e--;

        if (s < 0) {
          qc.push(1);
          more = true;
        } else {
          xL = xc.length;
          yL = yc.length;
          i = 0;
          s += 2;

          // Normalise xc and yc so highest order digit of yc is >= base / 2.

          n = mathfloor(base / (yc[0] + 1));

          // Not necessary, but to handle odd bases where yc[0] == (base / 2) - 1.
          // if (n > 1 || n++ == 1 && yc[0] < base / 2) {
          if (n > 1) {
            yc = multiply(yc, n, base);
            xc = multiply(xc, n, base);
            yL = yc.length;
            xL = xc.length;
          }

          xi = yL;
          rem = xc.slice(0, yL);
          remL = rem.length;

          // Add zeros to make remainder as long as divisor.
          for (; remL < yL; rem[remL++] = 0);
          yz = yc.slice();
          yz = [0].concat(yz);
          yc0 = yc[0];
          if (yc[1] >= base / 2) yc0++;
          // Not necessary, but to prevent trial digit n > base, when using base 3.
          // else if (base == 3 && yc0 == 1) yc0 = 1 + 1e-15;

          do {
            n = 0;

            // Compare divisor and remainder.
            cmp = compare(yc, rem, yL, remL);

            // If divisor < remainder.
            if (cmp < 0) {

              // Calculate trial digit, n.

              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);

              // n is how many times the divisor goes into the current remainder.
              n = mathfloor(rem0 / yc0);

              //  Algorithm:
              //  product = divisor multiplied by trial digit (n).
              //  Compare product and remainder.
              //  If product is greater than remainder:
              //    Subtract divisor from product, decrement trial digit.
              //  Subtract product from remainder.
              //  If product was less than remainder at the last compare:
              //    Compare new remainder and divisor.
              //    If remainder is greater than divisor:
              //      Subtract divisor from remainder, increment trial digit.

              if (n > 1) {

                // n may be > base only when base is 3.
                if (n >= base) n = base - 1;

                // product = divisor * trial digit.
                prod = multiply(yc, n, base);
                prodL = prod.length;
                remL = rem.length;

                // Compare product and remainder.
                // If product > remainder then trial digit n too high.
                // n is 1 too high about 5% of the time, and is not known to have
                // ever been more than 1 too high.
                while (compare(prod, rem, prodL, remL) == 1) {
                  n--;

                  // Subtract divisor from product.
                  subtract(prod, yL < prodL ? yz : yc, prodL, base);
                  prodL = prod.length;
                  cmp = 1;
                }
              } else {

                // n is 0 or 1, cmp is -1.
                // If n is 0, there is no need to compare yc and rem again below,
                // so change cmp to 1 to avoid it.
                // If n is 1, leave cmp as -1, so yc and rem are compared again.
                if (n == 0) {

                  // divisor < remainder, so n must be at least 1.
                  cmp = n = 1;
                }

                // product = divisor
                prod = yc.slice();
                prodL = prod.length;
              }

              if (prodL < remL) prod = [0].concat(prod);

              // Subtract product from remainder.
              subtract(rem, prod, remL, base);
              remL = rem.length;

               // If product was < remainder.
              if (cmp == -1) {

                // Compare divisor and new remainder.
                // If divisor < new remainder, subtract divisor from remainder.
                // Trial digit n too low.
                // n is 1 too low about 5% of the time, and very rarely 2 too low.
                while (compare(yc, rem, yL, remL) < 1) {
                  n++;

                  // Subtract divisor from remainder.
                  subtract(rem, yL < remL ? yz : yc, remL, base);
                  remL = rem.length;
                }
              }
            } else if (cmp === 0) {
              n++;
              rem = [0];
            } // else cmp === 1 and n will be 0

            // Add the next digit, n, to the result array.
            qc[i++] = n;

            // Update the remainder.
            if (rem[0]) {
              rem[remL++] = xc[xi] || 0;
            } else {
              rem = [xc[xi]];
              remL = 1;
            }
          } while ((xi++ < xL || rem[0] != null) && s--);

          more = rem[0] != null;

          // Leading zero?
          if (!qc[0]) qc.splice(0, 1);
        }

        if (base == BASE) {

          // To calculate q.e, first get the number of digits of qc[0].
          for (i = 1, s = qc[0]; s >= 10; s /= 10, i++);

          round(q, dp + (q.e = i + e * LOG_BASE - 1) + 1, rm, more);

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
     * n: a BigNumber.
     * i: the index of the last digit required (i.e. the digit that may be rounded up).
     * rm: the rounding mode.
     * id: 1 (toExponential) or 2 (toPrecision).
     */
    function format(n, i, rm, id) {
      var c0, e, ne, len, str;

      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);

      if (!n.c) return n.toString();

      c0 = n.c[0];
      ne = n.e;

      if (i == null) {
        str = coeffToString(n.c);
        str = id == 1 || id == 2 && (ne <= TO_EXP_NEG || ne >= TO_EXP_POS)
         ? toExponential(str, ne)
         : toFixedPoint(str, ne, '0');
      } else {
        n = round(new BigNumber(n), i, rm);

        // n.e may have changed if the value was rounded up.
        e = n.e;

        str = coeffToString(n.c);
        len = str.length;

        // toPrecision returns exponential notation if the number of significant digits
        // specified is less than the number of digits necessary to represent the integer
        // part of the value in fixed-point notation.

        // Exponential notation.
        if (id == 1 || id == 2 && (i <= e || e <= TO_EXP_NEG)) {

          // Append zeros?
          for (; len < i; str += '0', len++);
          str = toExponential(str, e);

        // Fixed-point notation.
        } else {
          i -= ne;
          str = toFixedPoint(str, e, '0');

          // Append zeros?
          if (e + 1 > len) {
            if (--i > 0) for (str += '.'; i--; str += '0');
          } else {
            i += e - len;
            if (i > 0) {
              if (e + 1 == len) str += '.';
              for (; i--; str += '0');
            }
          }
        }
      }

      return n.s < 0 && c0 ? '-' + str : str;
    }


    // Handle BigNumber.max and BigNumber.min.
    function maxOrMin(args, method) {
      var n,
        i = 1,
        m = new BigNumber(args[0]);

      for (; i < args.length; i++) {
        n = new BigNumber(args[i]);

        // If any number is NaN, return NaN.
        if (!n.s) {
          m = n;
          break;
        } else if (method.call(m, n)) {
          m = n;
        }
      }

      return m;
    }


    /*
     * Strip trailing zeros, calculate base 10 exponent and check against MIN_EXP and MAX_EXP.
     * Called by minus, plus and times.
     */
    function normalise(n, c, e) {
      var i = 1,
        j = c.length;

       // Remove trailing zeros.
      for (; !c[--j]; c.pop());

      // Calculate the base 10 exponent. First get the number of digits of c[0].
      for (j = c[0]; j >= 10; j /= 10, i++);

      // Overflow?
      if ((e = i + e * LOG_BASE - 1) > MAX_EXP) {

        // Infinity.
        n.c = n.e = null;

      // Underflow?
      } else if (e < MIN_EXP) {

        // Zero.
        n.c = [n.e = 0];
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

      return function (x, str, isNum, b) {
        var base,
          s = isNum ? str : str.replace(whitespaceOrPlus, '');

        // No exception on ±Infinity or NaN.
        if (isInfinityOrNaN.test(s)) {
          x.s = isNaN(s) ? null : s < 0 ? -1 : 1;
        } else {
          if (!isNum) {

            // basePrefix = /^(-?)0([xbo])(?=\w[\w.]*$)/i
            s = s.replace(basePrefix, function (m, p1, p2) {
              base = (p2 = p2.toLowerCase()) == 'x' ? 16 : p2 == 'b' ? 2 : 8;
              return !b || b == base ? p1 : m;
            });

            if (b) {
              base = b;

              // E.g. '1.' to '1', '.1' to '0.1'
              s = s.replace(dotAfter, '$1').replace(dotBefore, '0.$1');
            }

            if (str != s) return new BigNumber(s, base);
          }

          // '[BigNumber Error] Not a number: {n}'
          // '[BigNumber Error] Not a base {b} number: {n}'
          if (BigNumber.DEBUG) {
            throw Error
              (bignumberError + 'Not a' + (b ? ' base ' + b : '') + ' number: ' + str);
          }

          // NaN
          x.s = null;
        }

        x.c = x.e = null;
      }
    })();


    /*
     * Round x to sd significant digits using rounding mode rm. Check for over/under-flow.
     * If r is truthy, it is known that there are more digits after the rounding digit.
     */
    function round(x, sd, rm, r) {
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
          for (d = 1, k = xc[0]; k >= 10; k /= 10, d++);
          i = sd - d;

          // If the rounding digit is in the first element of xc...
          if (i < 0) {
            i += LOG_BASE;
            j = sd;
            n = xc[ni = 0];

            // Get the rounding digit at index j of n.
            rd = n / pows10[d - j - 1] % 10 | 0;
          } else {
            ni = mathceil((i + 1) / LOG_BASE);

            if (ni >= xc.length) {

              if (r) {

                // Needed by sqrt.
                for (; xc.length <= ni; xc.push(0));
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
              for (d = 1; k >= 10; k /= 10, d++);

              // Get the index of rd within n.
              i %= LOG_BASE;

              // Get the index of rd within n, adjusted for leading zeros.
              // The number of leading zeros of n is given by LOG_BASE - d.
              j = i - LOG_BASE + d;

              // Get the rounding digit at index j of n.
              rd = j < 0 ? 0 : n / pows10[d - j - 1] % 10 | 0;
            }
          }

          r = r || sd < 0 ||

          // Are there any non-zero digits after the rounding digit?
          // The expression  n % pows10[d - j - 1]  returns all digits of n to the right
          // of the digit at j, e.g. if n is 908714 and j is 2, the expression gives 714.
           xc[ni + 1] != null || (j < 0 ? n : n % pows10[d - j - 1]);

          r = rm < 4
           ? (rd || r) && (rm == 0 || rm == (x.s < 0 ? 3 : 2))
           : rd > 5 || rd == 5 && (rm == 4 || r || rm == 6 &&

            // Check whether the digit to the left of the rounding digit is odd.
            ((i > 0 ? j > 0 ? n / pows10[d - j] : 0 : xc[ni - 1]) % 10) & 1 ||
             rm == (x.s < 0 ? 8 : 7));

          if (sd < 1 || !xc[0]) {
            xc.length = 0;

            if (r) {

              // Convert sd to decimal places.
              sd -= x.e + 1;

              // 1, 0.1, 0.01, 0.001, 0.0001 etc.
              xc[0] = pows10[(LOG_BASE - sd % LOG_BASE) % LOG_BASE];
              x.e = -sd || 0;
            } else {

              // Zero.
              xc[0] = x.e = 0;
            }

            return x;
          }

          // Remove excess digits.
          if (i == 0) {
            xc.length = ni;
            k = 1;
            ni--;
          } else {
            xc.length = ni + 1;
            k = pows10[LOG_BASE - i];

            // E.g. 56700 becomes 56000 if 7 is the rounding digit.
            // j > 0 means i > number of leading zeros of n.
            xc[ni] = j > 0 ? mathfloor(n / pows10[d - j] % pows10[j]) * k : 0;
          }

          // Round up?
          if (r) {

            for (; ;) {

              // If the digit to be rounded up is in the first element of xc...
              if (ni == 0) {

                // i will be the length of xc[0] before k is added.
                for (i = 1, j = xc[0]; j >= 10; j /= 10, i++);
                j = xc[0] += k;
                for (k = 1; j >= 10; j /= 10, k++);

                // if i != k the length has increased.
                if (i != k) {
                  x.e++;
                  if (xc[0] == BASE) xc[0] = 1;
                }

                break;
              } else {
                xc[ni] += k;
                if (xc[ni] != BASE) break;
                xc[ni--] = 0;
                k = 1;
              }
            }
          }

          // Remove trailing zeros.
          for (i = xc.length; xc[--i] === 0; xc.pop());
        }

        // Overflow? Infinity.
        if (x.e > MAX_EXP) {
          x.c = x.e = null;

        // Underflow? Zero.
        } else if (x.e < MIN_EXP) {
          x.c = [x.e = 0];
        }
      }

      return x;
    }


    function valueOf(n) {
      var str,
        e = n.e;

      if (e === null) return n.toString();

      str = coeffToString(n.c);

      str = e <= TO_EXP_NEG || e >= TO_EXP_POS
        ? toExponential(str, e)
        : toFixedPoint(str, e, '0');

      return n.s < 0 ? '-' + str : str;
    }


    // PROTOTYPE/INSTANCE METHODS


    /*
     * Return a new BigNumber whose value is the absolute value of this BigNumber.
     */
    P.absoluteValue = P.abs = function () {
      var x = new BigNumber(this);
      if (x.s < 0) x.s = 1;
      return x;
    };


    /*
     * Return
     *   1 if the value of this BigNumber is greater than the value of BigNumber(y, b),
     *   -1 if the value of this BigNumber is less than the value of BigNumber(y, b),
     *   0 if they have the same value,
     *   or null if the value of either is NaN.
     */
    P.comparedTo = function (y, b) {
      return compare(this, new BigNumber(y, b));
    };


    /*
     * If dp is undefined or null or true or false, return the number of decimal places of the
     * value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
     *
     * Otherwise, if dp is a number, return a new BigNumber whose value is the value of this
     * BigNumber rounded to a maximum of dp decimal places using rounding mode rm, or
     * ROUNDING_MODE if rm is omitted.
     *
     * [dp] {number} Decimal places: integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.decimalPlaces = P.dp = function (dp, rm) {
      var c, n, v,
        x = this;

      if (dp != null) {
        intCheck(dp, 0, MAX);
        if (rm == null) rm = ROUNDING_MODE;
        else intCheck(rm, 0, 8);

        return round(new BigNumber(x), dp + x.e + 1, rm);
      }

      if (!(c = x.c)) return null;
      n = ((v = c.length - 1) - bitFloor(this.e / LOG_BASE)) * LOG_BASE;

      // Subtract the number of trailing zeros of the last number.
      if (v = c[v]) for (; v % 10 == 0; v /= 10, n--);
      if (n < 0) n = 0;

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
    P.dividedBy = P.div = function (y, b) {
      return div(this, new BigNumber(y, b), DECIMAL_PLACES, ROUNDING_MODE);
    };


    /*
     * Return a new BigNumber whose value is the integer part of dividing the value of this
     * BigNumber by the value of BigNumber(y, b).
     */
    P.dividedToIntegerBy = P.idiv = function (y, b) {
      return div(this, new BigNumber(y, b), 0, 1);
    };


    /*
     * Return a BigNumber whose value is the value of this BigNumber exponentiated by n.
     *
     * If m is present, return the result modulo m.
     * If n is negative round according to DECIMAL_PLACES and ROUNDING_MODE.
     * If POW_PRECISION is non-zero and m is not present, round to POW_PRECISION using ROUNDING_MODE.
     *
     * The modular power operation works efficiently when x, n, and m are integers, otherwise it
     * is equivalent to calculating x.exponentiatedBy(n).modulo(m) with a POW_PRECISION of 0.
     *
     * n {number|string|BigNumber} The exponent. An integer.
     * [m] {number|string|BigNumber} The modulus.
     *
     * '[BigNumber Error] Exponent not an integer: {n}'
     */
    P.exponentiatedBy = P.pow = function (n, m) {
      var half, isModExp, i, k, more, nIsBig, nIsNeg, nIsOdd, y,
        x = this;

      n = new BigNumber(n);

      // Allow NaN and ±Infinity, but not other non-integers.
      if (n.c && !n.isInteger()) {
        throw Error
          (bignumberError + 'Exponent not an integer: ' + valueOf(n));
      }

      if (m != null) m = new BigNumber(m);

      // Exponent of MAX_SAFE_INTEGER is 15.
      nIsBig = n.e > 14;

      // If x is NaN, ±Infinity, ±0 or ±1, or n is ±Infinity, NaN or ±0.
      if (!x.c || !x.c[0] || x.c[0] == 1 && !x.e && x.c.length == 1 || !n.c || !n.c[0]) {

        // The sign of the result of pow when x is negative depends on the evenness of n.
        // If +n overflows to ±Infinity, the evenness of n would be not be known.
        y = new BigNumber(Math.pow(+valueOf(x), nIsBig ? 2 - isOdd(n) : +valueOf(n)));
        return m ? y.mod(m) : y;
      }

      nIsNeg = n.s < 0;

      if (m) {

        // x % m returns NaN if abs(m) is zero, or m is NaN.
        if (m.c ? !m.c[0] : !m.s) return new BigNumber(NaN);

        isModExp = !nIsNeg && x.isInteger() && m.isInteger();

        if (isModExp) x = x.mod(m);

      // Overflow to ±Infinity: >=2**1e10 or >=1.0000024**1e15.
      // Underflow to ±0: <=0.79**1e10 or <=0.9999975**1e15.
      } else if (n.e > 9 && (x.e > 0 || x.e < -1 || (x.e == 0
        // [1, 240000000]
        ? x.c[0] > 1 || nIsBig && x.c[1] >= 24e7
        // [80000000000000]  [99999750000000]
        : x.c[0] < 8e13 || nIsBig && x.c[0] <= 9999975e7))) {

        // If x is negative and n is odd, k = -0, else k = 0.
        k = x.s < 0 && isOdd(n) ? -0 : 0;

        // If x >= 1, k = ±Infinity.
        if (x.e > -1) k = 1 / k;

        // If n is negative return ±0, else return ±Infinity.
        return new BigNumber(nIsNeg ? 1 / k : k);

      } else if (POW_PRECISION) {

        // Truncating each coefficient array to a length of k after each multiplication
        // equates to truncating significant digits to POW_PRECISION + [28, 41],
        // i.e. there will be a minimum of 28 guard digits retained.
        k = mathceil(POW_PRECISION / LOG_BASE + 2);
      }

      if (nIsBig) {
        half = new BigNumber(0.5);
        if (nIsNeg) n.s = 1;
        nIsOdd = isOdd(n);
      } else {
        i = Math.abs(+valueOf(n));
        nIsOdd = i % 2;
      }

      y = new BigNumber(ONE);

      // Performs 54 loop iterations for n of 9007199254740991.
      for (; ;) {

        if (nIsOdd) {
          y = y.times(x);
          if (!y.c) break;

          if (k) {
            if (y.c.length > k) y.c.length = k;
          } else if (isModExp) {
            y = y.mod(m);    //y = y.minus(div(y, m, 0, MODULO_MODE).times(m));
          }
        }

        if (i) {
          i = mathfloor(i / 2);
          if (i === 0) break;
          nIsOdd = i % 2;
        } else {
          n = n.times(half);
          round(n, n.e + 1, 1);

          if (n.e > 14) {
            nIsOdd = isOdd(n);
          } else {
            i = +valueOf(n);
            if (i === 0) break;
            nIsOdd = i % 2;
          }
        }

        x = x.times(x);

        if (k) {
          if (x.c && x.c.length > k) x.c.length = k;
        } else if (isModExp) {
          x = x.mod(m);    //x = x.minus(div(x, m, 0, MODULO_MODE).times(m));
        }
      }

      if (isModExp) return y;
      if (nIsNeg) y = ONE.div(y);

      return m ? y.mod(m) : k ? round(y, POW_PRECISION, ROUNDING_MODE, more) : y;
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber rounded to an integer
     * using rounding mode rm, or ROUNDING_MODE if rm is omitted.
     *
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {rm}'
     */
    P.integerValue = function (rm) {
      var n = new BigNumber(this);
      if (rm == null) rm = ROUNDING_MODE;
      else intCheck(rm, 0, 8);
      return round(n, n.e + 1, rm);
    };


    /*
     * Return true if the value of this BigNumber is equal to the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isEqualTo = P.eq = function (y, b) {
      return compare(this, new BigNumber(y, b)) === 0;
    };


    /*
     * Return true if the value of this BigNumber is a finite number, otherwise return false.
     */
    P.isFinite = function () {
      return !!this.c;
    };


    /*
     * Return true if the value of this BigNumber is greater than the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isGreaterThan = P.gt = function (y, b) {
      return compare(this, new BigNumber(y, b)) > 0;
    };


    /*
     * Return true if the value of this BigNumber is greater than or equal to the value of
     * BigNumber(y, b), otherwise return false.
     */
    P.isGreaterThanOrEqualTo = P.gte = function (y, b) {
      return (b = compare(this, new BigNumber(y, b))) === 1 || b === 0;

    };


    /*
     * Return true if the value of this BigNumber is an integer, otherwise return false.
     */
    P.isInteger = function () {
      return !!this.c && bitFloor(this.e / LOG_BASE) > this.c.length - 2;
    };


    /*
     * Return true if the value of this BigNumber is less than the value of BigNumber(y, b),
     * otherwise return false.
     */
    P.isLessThan = P.lt = function (y, b) {
      return compare(this, new BigNumber(y, b)) < 0;
    };


    /*
     * Return true if the value of this BigNumber is less than or equal to the value of
     * BigNumber(y, b), otherwise return false.
     */
    P.isLessThanOrEqualTo = P.lte = function (y, b) {
      return (b = compare(this, new BigNumber(y, b))) === -1 || b === 0;
    };


    /*
     * Return true if the value of this BigNumber is NaN, otherwise return false.
     */
    P.isNaN = function () {
      return !this.s;
    };


    /*
     * Return true if the value of this BigNumber is negative, otherwise return false.
     */
    P.isNegative = function () {
      return this.s < 0;
    };


    /*
     * Return true if the value of this BigNumber is positive, otherwise return false.
     */
    P.isPositive = function () {
      return this.s > 0;
    };


    /*
     * Return true if the value of this BigNumber is 0 or -0, otherwise return false.
     */
    P.isZero = function () {
      return !!this.c && this.c[0] == 0;
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
    P.minus = function (y, b) {
      var i, j, t, xLTy,
        x = this,
        a = x.s;

      y = new BigNumber(y, b);
      b = y.s;

      // Either NaN?
      if (!a || !b) return new BigNumber(NaN);

      // Signs differ?
      if (a != b) {
        y.s = -b;
        return x.plus(y);
      }

      var xe = x.e / LOG_BASE,
        ye = y.e / LOG_BASE,
        xc = x.c,
        yc = y.c;

      if (!xe || !ye) {

        // Either Infinity?
        if (!xc || !yc) return xc ? (y.s = -b, y) : new BigNumber(yc ? x : NaN);

        // Either zero?
        if (!xc[0] || !yc[0]) {

          // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
          return yc[0] ? (y.s = -b, y) : new BigNumber(xc[0] ? x :

           // IEEE 754 (2008) 6.3: n - n = -0 when rounding to -Infinity
           ROUNDING_MODE == 3 ? -0 : 0);
        }
      }

      xe = bitFloor(xe);
      ye = bitFloor(ye);
      xc = xc.slice();

      // Determine which is the bigger number.
      if (a = xe - ye) {

        if (xLTy = a < 0) {
          a = -a;
          t = xc;
        } else {
          ye = xe;
          t = yc;
        }

        t.reverse();

        // Prepend zeros to equalise exponents.
        for (b = a; b--; t.push(0));
        t.reverse();
      } else {

        // Exponents equal. Check digit by digit.
        j = (xLTy = (a = xc.length) < (b = yc.length)) ? a : b;

        for (a = b = 0; b < j; b++) {

          if (xc[b] != yc[b]) {
            xLTy = xc[b] < yc[b];
            break;
          }
        }
      }

      // x < y? Point xc to the array of the bigger number.
      if (xLTy) t = xc, xc = yc, yc = t, y.s = -y.s;

      b = (j = yc.length) - (i = xc.length);

      // Append zeros to xc if shorter.
      // No need to add zeros to yc if shorter as subtract only needs to start at yc.length.
      if (b > 0) for (; b--; xc[i++] = 0);
      b = BASE - 1;

      // Subtract yc from xc.
      for (; j > a;) {

        if (xc[--j] < yc[j]) {
          for (i = j; i && !xc[--i]; xc[i] = b);
          --xc[i];
          xc[j] += BASE;
        }

        xc[j] -= yc[j];
      }

      // Remove leading zeros and adjust exponent accordingly.
      for (; xc[0] == 0; xc.splice(0, 1), --ye);

      // Zero?
      if (!xc[0]) {

        // Following IEEE 754 (2008) 6.3,
        // n - n = +0  but  n - n = -0  when rounding towards -Infinity.
        y.s = ROUNDING_MODE == 3 ? -1 : 1;
        y.c = [y.e = 0];
        return y;
      }

      // No need to check for Infinity as +x - +y != Infinity && -x - -y != Infinity
      // for finite x and y.
      return normalise(y, xc, ye);
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
    P.modulo = P.mod = function (y, b) {
      var q, s,
        x = this;

      y = new BigNumber(y, b);

      // Return NaN if x is Infinity or NaN, or y is NaN or zero.
      if (!x.c || !y.s || y.c && !y.c[0]) {
        return new BigNumber(NaN);

      // Return x if y is Infinity or x is zero.
      } else if (!y.c || x.c && !x.c[0]) {
        return new BigNumber(x);
      }

      if (MODULO_MODE == 9) {

        // Euclidian division: q = sign(y) * floor(x / abs(y))
        // r = x - qy    where  0 <= r < abs(y)
        s = y.s;
        y.s = 1;
        q = div(x, y, 0, 3);
        y.s = s;
        q.s *= s;
      } else {
        q = div(x, y, 0, MODULO_MODE);
      }

      y = x.minus(q.times(y));

      // To match JavaScript %, ensure sign of zero is sign of dividend.
      if (!y.c[0] && MODULO_MODE == 1) y.s = x.s;

      return y;
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
     * Return a new BigNumber whose value is the value of this BigNumber multiplied by the value
     * of BigNumber(y, b).
     */
    P.multipliedBy = P.times = function (y, b) {
      var c, e, i, j, k, m, xcL, xlo, xhi, ycL, ylo, yhi, zc,
        base, sqrtBase,
        x = this,
        xc = x.c,
        yc = (y = new BigNumber(y, b)).c;

      // Either NaN, ±Infinity or ±0?
      if (!xc || !yc || !xc[0] || !yc[0]) {

        // Return NaN if either is NaN, or one is 0 and the other is Infinity.
        if (!x.s || !y.s || xc && !xc[0] && !yc || yc && !yc[0] && !xc) {
          y.c = y.e = y.s = null;
        } else {
          y.s *= x.s;

          // Return ±Infinity if either is ±Infinity.
          if (!xc || !yc) {
            y.c = y.e = null;

          // Return ±0 if either is ±0.
          } else {
            y.c = [0];
            y.e = 0;
          }
        }

        return y;
      }

      e = bitFloor(x.e / LOG_BASE) + bitFloor(y.e / LOG_BASE);
      y.s *= x.s;
      xcL = xc.length;
      ycL = yc.length;

      // Ensure xc points to longer array and xcL to its length.
      if (xcL < ycL) zc = xc, xc = yc, yc = zc, i = xcL, xcL = ycL, ycL = i;

      // Initialise the result array with zeros.
      for (i = xcL + ycL, zc = []; i--; zc.push(0));

      base = BASE;
      sqrtBase = SQRT_BASE;

      for (i = ycL; --i >= 0;) {
        c = 0;
        ylo = yc[i] % sqrtBase;
        yhi = yc[i] / sqrtBase | 0;

        for (k = xcL, j = i + k; j > i;) {
          xlo = xc[--k] % sqrtBase;
          xhi = xc[k] / sqrtBase | 0;
          m = yhi * xlo + xhi * ylo;
          xlo = ylo * xlo + ((m % sqrtBase) * sqrtBase) + zc[j] + c;
          c = (xlo / base | 0) + (m / sqrtBase | 0) + yhi * xhi;
          zc[j--] = xlo % base;
        }

        zc[j] = c;
      }

      if (c) {
        ++e;
      } else {
        zc.splice(0, 1);
      }

      return normalise(y, zc, e);
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber negated,
     * i.e. multiplied by -1.
     */
    P.negated = function () {
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
    P.plus = function (y, b) {
      var t,
        x = this,
        a = x.s;

      y = new BigNumber(y, b);
      b = y.s;

      // Either NaN?
      if (!a || !b) return new BigNumber(NaN);

      // Signs differ?
       if (a != b) {
        y.s = -b;
        return x.minus(y);
      }

      var xe = x.e / LOG_BASE,
        ye = y.e / LOG_BASE,
        xc = x.c,
        yc = y.c;

      if (!xe || !ye) {

        // Return ±Infinity if either ±Infinity.
        if (!xc || !yc) return new BigNumber(a / 0);

        // Either zero?
        // Return y if y is non-zero, x if x is non-zero, or zero if both are zero.
        if (!xc[0] || !yc[0]) return yc[0] ? y : new BigNumber(xc[0] ? x : a * 0);
      }

      xe = bitFloor(xe);
      ye = bitFloor(ye);
      xc = xc.slice();

      // Prepend zeros to equalise exponents. Faster to use reverse then do unshifts.
      if (a = xe - ye) {
        if (a > 0) {
          ye = xe;
          t = yc;
        } else {
          a = -a;
          t = xc;
        }

        t.reverse();
        for (; a--; t.push(0));
        t.reverse();
      }

      a = xc.length;
      b = yc.length;

      // Point xc to the longer array, and b to the shorter length.
      if (a - b < 0) t = yc, yc = xc, xc = t, b = a;

      // Only start adding at yc.length - 1 as the further digits of xc can be ignored.
      for (a = 0; b;) {
        a = (xc[--b] = xc[b] + yc[b] + a) / BASE | 0;
        xc[b] = BASE === xc[b] ? 0 : xc[b] % BASE;
      }

      if (a) {
        xc = [a].concat(xc);
        ++ye;
      }

      // No need to check for zero, as +x + +y != 0 && -x + -y != 0
      // ye = MAX_EXP + 1 possible
      return normalise(y, xc, ye);
    };


    /*
     * If sd is undefined or null or true or false, return the number of significant digits of
     * the value of this BigNumber, or null if the value of this BigNumber is ±Infinity or NaN.
     * If sd is true include integer-part trailing zeros in the count.
     *
     * Otherwise, if sd is a number, return a new BigNumber whose value is the value of this
     * BigNumber rounded to a maximum of sd significant digits using rounding mode rm, or
     * ROUNDING_MODE if rm is omitted.
     *
     * sd {number|boolean} number: significant digits: integer, 1 to MAX inclusive.
     *                     boolean: whether to count integer-part trailing zeros: true or false.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
     */
    P.precision = P.sd = function (sd, rm) {
      var c, n, v,
        x = this;

      if (sd != null && sd !== !!sd) {
        intCheck(sd, 1, MAX);
        if (rm == null) rm = ROUNDING_MODE;
        else intCheck(rm, 0, 8);

        return round(new BigNumber(x), sd, rm);
      }

      if (!(c = x.c)) return null;
      v = c.length - 1;
      n = v * LOG_BASE + 1;

      if (v = c[v]) {

        // Subtract the number of trailing zeros of the last element.
        for (; v % 10 == 0; v /= 10, n--);

        // Add the number of digits of the first element.
        for (v = c[0]; v >= 10; v /= 10, n++);
      }

      if (sd && x.e + 1 > n) n = x.e + 1;

      return n;
    };


    /*
     * Return a new BigNumber whose value is the value of this BigNumber shifted by k places
     * (powers of 10). Shift to the right if n > 0, and to the left if n < 0.
     *
     * k {number} Integer, -MAX_SAFE_INTEGER to MAX_SAFE_INTEGER inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {k}'
     */
    P.shiftedBy = function (k) {
      intCheck(k, -MAX_SAFE_INTEGER, MAX_SAFE_INTEGER);
      return this.times('1e' + k);
    };


    /*
     *  sqrt(-n) =  N
     *  sqrt(N) =  N
     *  sqrt(-I) =  N
     *  sqrt(I) =  I
     *  sqrt(0) =  0
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
      if (s !== 1 || !c || !c[0]) {
        return new BigNumber(!s || s < 0 && (!c || c[0]) ? NaN : c ? x : 1 / 0);
      }

      // Initial estimate.
      s = Math.sqrt(+valueOf(x));

      // Math.sqrt underflow/overflow?
      // Pass x to Math.sqrt as integer, then adjust the exponent of the result.
      if (s == 0 || s == 1 / 0) {
        n = coeffToString(c);
        if ((n.length + e) % 2 == 0) n += '0';
        s = Math.sqrt(+n);
        e = bitFloor((e + 1) / 2) - (e < 0 || e % 2);

        if (s == 1 / 0) {
          n = '1e' + e;
        } else {
          n = s.toExponential();
          n = n.slice(0, n.indexOf('e') + 1) + e;
        }

        r = new BigNumber(n);
      } else {
        r = new BigNumber(s + '');
      }

      // Check for zero.
      // r could be zero if MIN_EXP is changed after the this value was created.
      // This would cause a division by zero (x/t) and hence Infinity below, which would cause
      // coeffToString to throw.
      if (r.c[0]) {
        e = r.e;
        s = e + dp;
        if (s < 3) s = 0;

        // Newton-Raphson iteration.
        for (; ;) {
          t = r;
          r = half.times(t.plus(div(x, t, dp, 1)));

          if (coeffToString(t.c).slice(0, s) === (n = coeffToString(r.c)).slice(0, s)) {

            // The exponent of r may here be one less than the final result exponent,
            // e.g 0.0009999 (e-4) --> 0.001 (e-3), so adjust s so the rounding digits
            // are indexed correctly.
            if (r.e < e) --s;
            n = n.slice(s - 3, s + 1);

            // The 4th rounding digit may be in error by -1 so if the 4 rounding digits
            // are 9999 or 4999 (i.e. approaching a rounding boundary) continue the
            // iteration.
            if (n == '9999' || !rep && n == '4999') {

              // On the first iteration only, check to see if rounding up gives the
              // exact result as the nines may infinitely repeat.
              if (!rep) {
                round(t, t.e + DECIMAL_PLACES + 2, 0);

                if (t.times(t).eq(x)) {
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
              if (!+n || !+n.slice(1) && n.charAt(0) == '5') {

                // Truncate to the first rounding digit.
                round(r, r.e + DECIMAL_PLACES + 2, 1);
                m = !r.times(r).eq(x);
              }

              break;
            }
          }
        }
      }

      return round(r, r.e + DECIMAL_PLACES + 1, ROUNDING_MODE, m);
    };


    /*
     * Return a string representing the value of this BigNumber in exponential notation and
     * rounded using ROUNDING_MODE to dp fixed decimal places.
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.toExponential = function (dp, rm) {
      if (dp != null) {
        intCheck(dp, 0, MAX);
        dp++;
      }
      return format(this, dp, rm, 1);
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
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     */
    P.toFixed = function (dp, rm) {
      if (dp != null) {
        intCheck(dp, 0, MAX);
        dp = dp + this.e + 1;
      }
      return format(this, dp, rm);
    };


    /*
     * Return a string representing the value of this BigNumber in fixed-point notation rounded
     * using rm or ROUNDING_MODE to dp decimal places, and formatted according to the properties
     * of the format or FORMAT object (see BigNumber.set).
     *
     * The formatting object may contain some or all of the properties shown below.
     *
     * FORMAT = {
     *   prefix: '',
     *   groupSize: 3,
     *   secondaryGroupSize: 0,
     *   groupSeparator: ',',
     *   decimalSeparator: '.',
     *   fractionGroupSize: 0,
     *   fractionGroupSeparator: '\xA0',      // non-breaking space
     *   suffix: ''
     * };
     *
     * [dp] {number} Decimal places. Integer, 0 to MAX inclusive.
     * [rm] {number} Rounding mode. Integer, 0 to 8 inclusive.
     * [format] {object} Formatting options. See FORMAT pbject above.
     *
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {dp|rm}'
     * '[BigNumber Error] Argument not an object: {format}'
     */
    P.toFormat = function (dp, rm, format) {
      var str,
        x = this;

      if (format == null) {
        if (dp != null && rm && typeof rm == 'object') {
          format = rm;
          rm = null;
        } else if (dp && typeof dp == 'object') {
          format = dp;
          dp = rm = null;
        } else {
          format = FORMAT;
        }
      } else if (typeof format != 'object') {
        throw Error
          (bignumberError + 'Argument not an object: ' + format);
      }

      str = x.toFixed(dp, rm);

      if (x.c) {
        var i,
          arr = str.split('.'),
          g1 = +format.groupSize,
          g2 = +format.secondaryGroupSize,
          groupSeparator = format.groupSeparator || '',
          intPart = arr[0],
          fractionPart = arr[1],
          isNeg = x.s < 0,
          intDigits = isNeg ? intPart.slice(1) : intPart,
          len = intDigits.length;

        if (g2) i = g1, g1 = g2, g2 = i, len -= i;

        if (g1 > 0 && len > 0) {
          i = len % g1 || g1;
          intPart = intDigits.substr(0, i);
          for (; i < len; i += g1) intPart += groupSeparator + intDigits.substr(i, g1);
          if (g2 > 0) intPart += groupSeparator + intDigits.slice(i);
          if (isNeg) intPart = '-' + intPart;
        }

        str = fractionPart
         ? intPart + (format.decimalSeparator || '') + ((g2 = +format.fractionGroupSize)
          ? fractionPart.replace(new RegExp('\\d{' + g2 + '}\\B', 'g'),
           '$&' + (format.fractionGroupSeparator || ''))
          : fractionPart)
         : intPart;
      }

      return (format.prefix || '') + str + (format.suffix || '');
    };


    /*
     * Return an array of two BigNumbers representing the value of this BigNumber as a simple
     * fraction with an integer numerator and an integer denominator.
     * The denominator will be a positive non-zero value less than or equal to the specified
     * maximum denominator. If a maximum denominator is not specified, the denominator will be
     * the lowest value necessary to represent the number exactly.
     *
     * [md] {number|string|BigNumber} Integer >= 1, or Infinity. The maximum denominator.
     *
     * '[BigNumber Error] Argument {not an integer|out of range} : {md}'
     */
    P.toFraction = function (md) {
      var d, d0, d1, d2, e, exp, n, n0, n1, q, r, s,
        x = this,
        xc = x.c;

      if (md != null) {
        n = new BigNumber(md);

        // Throw if md is less than one or is not an integer, unless it is Infinity.
        if (!n.isInteger() && (n.c || n.s !== 1) || n.lt(ONE)) {
          throw Error
            (bignumberError + 'Argument ' +
              (n.isInteger() ? 'out of range: ' : 'not an integer: ') + valueOf(n));
        }
      }

      if (!xc) return new BigNumber(x);

      d = new BigNumber(ONE);
      n1 = d0 = new BigNumber(ONE);
      d1 = n0 = new BigNumber(ONE);
      s = coeffToString(xc);

      // Determine initial denominator.
      // d is a power of 10 and the minimum max denominator that specifies the value exactly.
      e = d.e = s.length - x.e - 1;
      d.c[0] = POWS_TEN[(exp = e % LOG_BASE) < 0 ? LOG_BASE + exp : exp];
      md = !md || n.comparedTo(d) > 0 ? (e > 0 ? d : n1) : n;

      exp = MAX_EXP;
      MAX_EXP = 1 / 0;
      n = new BigNumber(s);

      // n0 = d1 = 0
      n0.c[0] = 0;

      for (; ;)  {
        q = div(n, d, 0, 1);
        d2 = d0.plus(q.times(d1));
        if (d2.comparedTo(md) == 1) break;
        d0 = d1;
        d1 = d2;
        n1 = n0.plus(q.times(d2 = n1));
        n0 = d2;
        d = n.minus(q.times(d2 = d));
        n = d2;
      }

      d2 = div(md.minus(d0), d1, 0, 1);
      n0 = n0.plus(d2.times(n1));
      d0 = d0.plus(d2.times(d1));
      n0.s = n1.s = x.s;
      e = e * 2;

      // Determine which fraction is closer to x, n0/d0 or n1/d1
      r = div(n1, d1, e, ROUNDING_MODE).minus(x).abs().comparedTo(
          div(n0, d0, e, ROUNDING_MODE).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];

      MAX_EXP = exp;

      return r;
    };


    /*
     * Return the value of this BigNumber converted to a number primitive.
     */
    P.toNumber = function () {
      return +valueOf(this);
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
     * '[BigNumber Error] Argument {not a primitive number|not an integer|out of range}: {sd|rm}'
     */
    P.toPrecision = function (sd, rm) {
      if (sd != null) intCheck(sd, 1, MAX);
      return format(this, sd, rm, 2);
    };


    /*
     * Return a string representing the value of this BigNumber in base b, or base 10 if b is
     * omitted. If a base is specified, including base 10, round according to DECIMAL_PLACES and
     * ROUNDING_MODE. If a base is not specified, and this BigNumber has a positive exponent
     * that is equal to or greater than TO_EXP_POS, or a negative exponent equal to or less than
     * TO_EXP_NEG, return exponential notation.
     *
     * [b] {number} Integer, 2 to ALPHABET.length inclusive.
     *
     * '[BigNumber Error] Base {not a primitive number|not an integer|out of range}: {b}'
     */
    P.toString = function (b) {
      var str,
        n = this,
        s = n.s,
        e = n.e;

      // Infinity or NaN?
      if (e === null) {
        if (s) {
          str = 'Infinity';
          if (s < 0) str = '-' + str;
        } else {
          str = 'NaN';
        }
      } else {
        if (b == null) {
          str = e <= TO_EXP_NEG || e >= TO_EXP_POS
           ? toExponential(coeffToString(n.c), e)
           : toFixedPoint(coeffToString(n.c), e, '0');
        } else if (b === 10) {
          n = round(new BigNumber(n), DECIMAL_PLACES + e + 1, ROUNDING_MODE);
          str = toFixedPoint(coeffToString(n.c), n.e, '0');
        } else {
          intCheck(b, 2, ALPHABET.length, 'Base');
          str = convertBase(toFixedPoint(coeffToString(n.c), e, '0'), 10, b, s, true);
        }

        if (s < 0 && n.c[0]) str = '-' + str;
      }

      return str;
    };


    /*
     * Return as toString, but do not accept a base argument, and include the minus sign for
     * negative zero.
     */
    P.valueOf = P.toJSON = function () {
      return valueOf(this);
    };


    P._isBigNumber = true;

    if (hasSymbol) {
      P[Symbol.toStringTag] = 'BigNumber';

      // Node.js v10.12.0+
      P[Symbol.for('nodejs.util.inspect.custom')] = P.valueOf;
    }

    if (configObject != null) BigNumber.set(configObject);

    return BigNumber;
  }


  // PRIVATE HELPER FUNCTIONS

  // These functions don't need access to variables,
  // e.g. DECIMAL_PLACES, in the scope of the `clone` function above.


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

    for (; i < j;) {
      s = a[i++] + '';
      z = LOG_BASE - s.length;
      for (; z--; s = '0' + s);
      r += s;
    }

    // Determine trailing zeros.
    for (j = r.length; r.charCodeAt(--j) === 48;);

    return r.slice(0, j + 1 || 1);
  }


  // Compare the value of BigNumbers x and y.
  function compare(x, y) {
    var a, b,
      xc = x.c,
      yc = y.c,
      i = x.s,
      j = y.s,
      k = x.e,
      l = y.e;

    // Either NaN?
    if (!i || !j) return null;

    a = xc && !xc[0];
    b = yc && !yc[0];

    // Either zero?
    if (a || b) return a ? b ? 0 : -j : i;

    // Signs differ?
    if (i != j) return i;

    a = i < 0;
    b = k == l;

    // Either Infinity?
    if (!xc || !yc) return b ? 0 : !xc ^ a ? 1 : -1;

    // Compare exponents.
    if (!b) return k > l ^ a ? 1 : -1;

    j = (k = xc.length) < (l = yc.length) ? k : l;

    // Compare digit by digit.
    for (i = 0; i < j; i++) if (xc[i] != yc[i]) return xc[i] > yc[i] ^ a ? 1 : -1;

    // Compare lengths.
    return k == l ? 0 : k > l ^ a ? 1 : -1;
  }


  /*
   * Check that n is a primitive number, an integer, and in range, otherwise throw.
   */
  function intCheck(n, min, max, name) {
    if (n < min || n > max || n !== mathfloor(n)) {
      throw Error
       (bignumberError + (name || 'Argument') + (typeof n == 'number'
         ? n < min || n > max ? ' out of range: ' : ' not an integer: '
         : ' not a primitive number: ') + String(n));
    }
  }


  // Assumes finite n.
  function isOdd(n) {
    var k = n.c.length - 1;
    return bitFloor(n.e / LOG_BASE) == k && n.c[k] % 2 != 0;
  }


  function toExponential(str, e) {
    return (str.length > 1 ? str.charAt(0) + '.' + str.slice(1) : str) +
     (e < 0 ? 'e' : 'e+') + e;
  }


  function toFixedPoint(str, e, z) {
    var len, zs;

    // Negative exponent?
    if (e < 0) {

      // Prepend zeros.
      for (zs = z + '.'; ++e; zs += z);
      str = zs + str;

    // Positive exponent
    } else {
      len = str.length;

      // Append zeros.
      if (++e > len) {
        for (zs = z, e -= len; --e; zs += z);
        str += zs;
      } else if (e < len) {
        str = str.slice(0, e) + '.' + str.slice(e);
      }
    }

    return str;
  }


  // EXPORT


  BigNumber = clone();
  BigNumber['default'] = BigNumber.BigNumber = BigNumber;

  // AMD.
  if (typeof define == 'function' && define.amd) {
    define(function () { return BigNumber; });

  // Node.js and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = BigNumber;

  // Browser.
  } else {
    if (!globalObject) {
      globalObject = typeof self != 'undefined' && self ? self : window;
    }

    globalObject.BigNumber = BigNumber;
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
  bytes: {
    binarySuffixes: ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"],
    decimalSuffixes: ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
  },
  currency: {
    symbol: "$",
    position: "prefix",
    code: "USD"
  },
  currencyFormat: {
    thousandSeparated: true,
    totalLength: 4,
    spaceSeparated: true,
    spaceSeparatedCurrency: true
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

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

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

var BigNumber = require("bignumber.js");

var powers = {
  trillion: Math.pow(10, 12),
  billion: Math.pow(10, 9),
  million: Math.pow(10, 6),
  thousand: Math.pow(10, 3)
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
  forceSign: false,
  roundingFunction: Math.round,
  spaceSeparatedAbbreviation: false
};

var _globalState$currentB = globalState.currentBytes(),
    binarySuffixes = _globalState$currentB.binarySuffixes,
    decimalSuffixes = _globalState$currentB.decimalSuffixes;

var bytes = {
  general: {
    scale: 1024,
    suffixes: decimalSuffixes,
    marker: "bd"
  },
  binary: {
    scale: 1024,
    suffixes: binarySuffixes,
    marker: "b"
  },
  decimal: {
    scale: 1000,
    suffixes: decimalSuffixes,
    marker: "d"
  }
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
  var numbro = arguments.length > 2 ? arguments[2] : undefined;

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
    } // values greater than or equal to [scale] YB never set the suffix


    if (suffix === suffixes[0]) {
      value = value / Math.pow(scale, suffixes.length - 1);
      suffix = suffixes[suffixes.length - 1];
    }
  }

  return {
    value: value,
    suffix: suffix
  };
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
  var options = Object.assign({}, defaultOptions, providedFormat);

  var _state$currentBytes = state.currentBytes(),
      localBinarySuffixes = _state$currentBytes.binarySuffixes,
      localDecimalSuffixes = _state$currentBytes.decimalSuffixes;

  var localBytes = {
    general: {
      scale: 1024,
      suffixes: localDecimalSuffixes || decimalSuffixes,
      marker: "bd"
    },
    binary: {
      scale: 1024,
      suffixes: localBinarySuffixes || binarySuffixes,
      marker: "b"
    },
    decimal: {
      scale: 1000,
      suffixes: localDecimalSuffixes || decimalSuffixes,
      marker: "d"
    }
  };
  var baseInfo = localBytes[base];

  var _getFormatByteUnits = getFormatByteUnits(instance._value, baseInfo.suffixes, baseInfo.scale),
      value = _getFormatByteUnits.value,
      suffix = _getFormatByteUnits.suffix;

  var output = formatNumber({
    instance: numbro(value),
    providedFormat: providedFormat,
    state: state,
    defaults: state.currentByteDefaultFormat()
  });
  return "".concat(output).concat(options.spaceSeparated ? " " : "").concat(suffix);
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
  return "".concat(output).concat(options.spaceSeparated ? " " : "").concat(ordinal);
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
  return "".concat(hours, ":").concat(minutes < 10 ? "0" : "").concat(minutes, ":").concat(seconds < 10 ? "0" : "").concat(seconds);
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
    return "%".concat(options.spaceSeparated ? " " : "").concat(output);
  }

  return "".concat(output).concat(options.spaceSeparated ? " " : "", "%");
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
  var clonedFormat = Object.assign({}, providedFormat);
  var options = Object.assign({}, defaultOptions, clonedFormat);
  var decimalSeparator = undefined;
  var space = "";
  var average = !!options.totalLength || !!options.forceAverage || options.average;
  var position = clonedFormat.currencyPosition || currentCurrency.position;
  var symbol = clonedFormat.currencySymbol || currentCurrency.symbol;
  var spaceSeparatedCurrency = options.spaceSeparatedCurrency !== void 0 ? options.spaceSeparatedCurrency : options.spaceSeparated;

  if (clonedFormat.lowPrecision === undefined) {
    clonedFormat.lowPrecision = false;
  }

  if (spaceSeparatedCurrency) {
    space = " ";
  }

  if (position === "infix") {
    decimalSeparator = space + symbol + space;
  }

  var output = formatNumber({
    instance: instance,
    providedFormat: clonedFormat,
    state: state,
    decimalSeparator: decimalSeparator
  });

  if (position === "prefix") {
    if (instance._value < 0 && options.negative === "sign") {
      output = "-".concat(space).concat(symbol).concat(output.slice(1));
    } else if (instance._value > 0 && options.forceSign) {
      output = "+".concat(space).concat(symbol).concat(output.slice(1));
    } else {
      output = symbol + space + output;
    }
  }

  if (!position || position === "postfix") {
    space = !options.spaceSeparatedAbbreviation && average ? "" : space;
    output = output + space + symbol;
  }

  return output;
}
/**
 * Compute the average value out of VALUE.
 * The other parameters are computation options.
 *
 * @param {number} value - value to compute
 * @param {string} [forceAverage] - forced unit used to compute
 * @param {boolean} [lowPrecision=true] - reduce average precision
 * @param {{}} abbreviations - part of the language specification
 * @param {boolean} spaceSeparated - `true` if a space must be inserted between the value and the abbreviation
 * @param {number} [totalLength] - total length of the output including the characteristic and the mantissa
 * @param {function} roundingFunction - function used to round numbers
 * @return {{value: number, abbreviation: string, mantissaPrecision: number}}
 */


function computeAverage(_ref) {
  var value = _ref.value,
      forceAverage = _ref.forceAverage,
      _ref$lowPrecision = _ref.lowPrecision,
      lowPrecision = _ref$lowPrecision === void 0 ? true : _ref$lowPrecision,
      abbreviations = _ref.abbreviations,
      _ref$spaceSeparated = _ref.spaceSeparated,
      spaceSeparated = _ref$spaceSeparated === void 0 ? false : _ref$spaceSeparated,
      _ref$totalLength = _ref.totalLength,
      totalLength = _ref$totalLength === void 0 ? 0 : _ref$totalLength,
      _ref$roundingFunction = _ref.roundingFunction,
      roundingFunction = _ref$roundingFunction === void 0 ? Math.round : _ref$roundingFunction;
  var abbreviation = "";
  var abs = Math.abs(value);
  var mantissaPrecision = -1;

  if (forceAverage && abbreviations[forceAverage] && powers[forceAverage]) {
    abbreviation = abbreviations[forceAverage];
    value = value / powers[forceAverage];
  } else {
    if (abs >= powers.trillion || lowPrecision && roundingFunction(abs / powers.trillion) === 1) {
      // trillion
      abbreviation = abbreviations.trillion;
      value = value / powers.trillion;
    } else if (abs < powers.trillion && abs >= powers.billion || lowPrecision && roundingFunction(abs / powers.billion) === 1) {
      // billion
      abbreviation = abbreviations.billion;
      value = value / powers.billion;
    } else if (abs < powers.billion && abs >= powers.million || lowPrecision && roundingFunction(abs / powers.million) === 1) {
      // million
      abbreviation = abbreviations.million;
      value = value / powers.million;
    } else if (abs < powers.million && abs >= powers.thousand || lowPrecision && roundingFunction(abs / powers.thousand) === 1) {
      // thousand
      abbreviation = abbreviations.thousand;
      value = value / powers.thousand;
    }
  }

  var optionalSpace = spaceSeparated ? " " : "";

  if (abbreviation) {
    abbreviation = optionalSpace + abbreviation;
  }

  if (totalLength) {
    var isNegative = value < 0;
    var characteristic = value.toString().split(".")[0];
    var characteristicLength = isNegative ? characteristic.length - 1 : characteristic.length;
    mantissaPrecision = Math.max(totalLength - characteristicLength, 0);
  }

  return {
    value: value,
    abbreviation: abbreviation,
    mantissaPrecision: mantissaPrecision
  };
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
      characteristicPrecision = _ref2$characteristicP === void 0 ? 0 : _ref2$characteristicP;

  var _value$toExponential$ = value.toExponential().split("e"),
      _value$toExponential$2 = _slicedToArray(_value$toExponential$, 2),
      numberString = _value$toExponential$2[0],
      exponential = _value$toExponential$2[1];

  var number = +numberString;

  if (!characteristicPrecision) {
    return {
      value: number,
      abbreviation: "e".concat(exponential)
    };
  }

  var characteristicLength = 1; // see `toExponential`

  if (characteristicLength < characteristicPrecision) {
    number = number * Math.pow(10, characteristicPrecision - characteristicLength);
    exponential = +exponential - (characteristicPrecision - characteristicLength);
    exponential = exponential >= 0 ? "+".concat(exponential) : exponential;
  }

  return {
    value: number,
    abbreviation: "e".concat(exponential)
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
      mantissa = _base$split2$ === void 0 ? "" : _base$split2$;

  if (+exp > 0) {
    result = characteristic + mantissa + zeroes(exp - mantissa.length);
  } else {
    var prefix = ".";

    if (+characteristic < 0) {
      prefix = "-0".concat(prefix);
    } else {
      prefix = "0".concat(prefix);
    }

    var suffix = (zeroes(-exp - 1) + Math.abs(characteristic) + mantissa).substr(0, precision);

    if (suffix.length < precision) {
      suffix += zeroes(precision - suffix.length);
    }

    result = prefix + suffix;
  }

  if (+exp > 0 && precision > 0) {
    result += ".".concat(zeroes(precision));
  }

  return result;
}
/**
 * Return a string representing VALUE with a PRECISION-long mantissa.
 *
 * @param {number} value - number to precise
 * @param {number} precision - desired length for the mantissa
 * @param {function} roundingFunction - rounding function to be used
 * @return {string}
 */


function toFixed(value, precision) {
  var roundingFunction = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Math.round;

  if (value.toString().indexOf("e") !== -1) {
    return toFixedLarge(value, precision);
  }

  var n = new BigNumber(roundingFunction(+"".concat(value, "e+").concat(precision)) / Math.pow(10, precision));
  return n.toFixed(precision);
}
/**
 * Return the current OUTPUT with a mantissa precision of PRECISION.
 *
 * @param {string} output - output being build in the process of formatting
 * @param {number} value - number being currently formatted
 * @param {boolean} optionalMantissa - if `true`, the mantissa is omitted when it's only zeroes
 * @param {number} precision - desired precision of the mantissa
 * @param {boolean} trim - if `true`, trailing zeroes are removed from the mantissa
 * @return {string}
 */


function setMantissaPrecision(output, value, optionalMantissa, precision, trim, roundingFunction) {
  if (precision === -1) {
    return output;
  }

  var result = toFixed(value, precision, roundingFunction);

  var _result$toString$spli = result.toString().split("."),
      _result$toString$spli2 = _slicedToArray(_result$toString$spli, 2),
      currentCharacteristic = _result$toString$spli2[0],
      _result$toString$spli3 = _result$toString$spli2[1],
      currentMantissa = _result$toString$spli3 === void 0 ? "" : _result$toString$spli3;

  if (currentMantissa.match(/^0+$/) && (optionalMantissa || trim)) {
    return currentCharacteristic;
  }

  var hasTrailingZeroes = currentMantissa.match(/0+$/);

  if (trim && hasTrailingZeroes) {
    return "".concat(currentCharacteristic, ".").concat(currentMantissa.toString().slice(0, hasTrailingZeroes.index));
  }

  return result.toString();
}
/**
 * Return the current OUTPUT with a characteristic precision of PRECISION.
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

    return "".concat(currentCharacteristic.replace("0", ""), ".").concat(currentMantissa);
  }

  var hasNegativeSign = value < 0 && currentCharacteristic.indexOf("-") === 0;

  if (hasNegativeSign) {
    // Remove the negative sign
    currentCharacteristic = currentCharacteristic.slice(1);
    result = result.slice(1);
  }

  if (currentCharacteristic.length < precision) {
    var missingZeros = precision - currentCharacteristic.length;

    for (var i = 0; i < missingZeros; i++) {
      result = "0".concat(result);
    }
  }

  if (hasNegativeSign) {
    // Add back the minus sign
    result = "-".concat(result);
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
  var hasNegativeSign = value < 0 && characteristic.indexOf("-") === 0;

  if (thousandSeparated) {
    if (hasNegativeSign) {
      // Remove the negative sign
      characteristic = characteristic.slice(1);
    }

    var indexesToInsertThousandDelimiters = indexesOfGroupSpaces(characteristic.length, thousandsSize);
    indexesToInsertThousandDelimiters.forEach(function (position, index) {
      characteristic = characteristic.slice(0, position + index) + thousandSeparator + characteristic.slice(position + index);
    });

    if (hasNegativeSign) {
      // Add back the negative sign
      characteristic = "-".concat(characteristic);
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
    return "+".concat(output);
  }

  if (negative === "sign") {
    return output;
  }

  return "(".concat(output.replace("-", ""), ")");
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
      state = _ref3$state === void 0 ? globalState : _ref3$state,
      decimalSeparator = _ref3.decimalSeparator,
      _ref3$defaults = _ref3.defaults,
      defaults = _ref3$defaults === void 0 ? state.currentDefaults() : _ref3$defaults;
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
  var lowPrecision = options.lowPrecision;
  var average = !!totalLength || !!forceAverage || options.average; // default when averaging is to chop off decimals

  var mantissaPrecision = totalLength ? -1 : average && providedFormat.mantissa === undefined ? 0 : options.mantissa;
  var optionalMantissa = totalLength ? false : providedFormat.optionalMantissa === undefined ? mantissaPrecision === -1 : options.optionalMantissa;
  var trimMantissa = options.trimMantissa;
  var thousandSeparated = options.thousandSeparated;
  var spaceSeparated = options.spaceSeparated;
  var negative = options.negative;
  var forceSign = options.forceSign;
  var exponential = options.exponential;
  var roundingFunction = options.roundingFunction;
  var abbreviation = "";

  if (average) {
    var data = computeAverage({
      value: value,
      forceAverage: forceAverage,
      lowPrecision: lowPrecision,
      abbreviations: state.currentAbbreviations(),
      spaceSeparated: spaceSeparated,
      roundingFunction: roundingFunction,
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

  var output = setMantissaPrecision(value.toString(), value, optionalMantissa, mantissaPrecision, trimMantissa, roundingFunction);
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
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return _format.apply(void 0, args.concat([numbro]));
    },
    getByteUnit: function getByteUnit() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return _getByteUnit.apply(void 0, args.concat([numbro]));
    },
    getBinaryByteUnit: function getBinaryByteUnit() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      return _getBinaryByteUnit.apply(void 0, args.concat([numbro]));
    },
    getDecimalByteUnit: function getDecimalByteUnit() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      return _getDecimalByteUnit.apply(void 0, args.concat([numbro]));
    },
    formatOrDefault: formatOrDefault
  };
};

},{"./globalState":4,"./parsing":8,"./validating":10,"bignumber.js":1}],4:[function(require,module,exports){
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
}; //
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
 * Return the current language bytes data
 *
 * @return {{}}
 */


state.currentBytes = function () {
  return currentLanguageData().bytes || {};
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
}; //
// Defaults
//

/**
 * Return the current formatting defaults.
 * First use the current language default, then fallback to the globally defined defaults.
 *
 * @return {{}}
 */


state.currentDefaults = function () {
  return Object.assign({}, currentLanguageData().defaults, globalDefaults);
};
/**
 * Return the ordinal default-format.
 * First use the current language ordinal default, then fallback to the regular defaults.
 *
 * @return {{}}
 */


state.currentOrdinalDefaultFormat = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().ordinalFormat);
};
/**
 * Return the byte default-format.
 * First use the current language byte default, then fallback to the regular defaults.
 *
 * @return {{}}
 */


state.currentByteDefaultFormat = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().byteFormat);
};
/**
 * Return the percentage default-format.
 * First use the current language percentage default, then fallback to the regular defaults.
 *
 * @return {{}}
 */


state.currentPercentageDefaultFormat = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().percentageFormat);
};
/**
 * Return the currency default-format.
 * First use the current language currency default, then fallback to the regular defaults.
 *
 * @return {{}}
 */


state.currentCurrencyDefaultFormat = function () {
  return Object.assign({}, state.currentDefaults(), currentLanguageData().currencyFormat);
};
/**
 * Return the time default-format.
 * First use the current language currency default, then fallback to the regular defaults.
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
}; //
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
}; //
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

    throw new Error("Unknown tag \"".concat(tag, "\""));
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
    return;
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
      data = require("../languages/".concat(tag));
    } catch (e) {
      console.error("Unable to load \"".concat(tag, "\". No matching language file found.")); // eslint-disable-line no-console
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
  n._value = value.plus(otherValue).toNumber();
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
    },
    BigNumber: BigNumber
  };
};

},{"bignumber.js":1}],7:[function(require,module,exports){
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
var VERSION = "2.3.6";

var globalState = require("./globalState");

var validator = require("./validating");

var loader = require("./loading")(numbro);

var unformatter = require("./unformatting");

var formatter = require("./formatting")(numbro);

var manipulate = require("./manipulating")(numbro);

var parsing = require("./parsing");

var Numbro = /*#__PURE__*/function () {
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
}; //
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
numbro.BigNumber = manipulate.BigNumber;
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
    result.spaceSeparatedCurrency = true;

    if (result.average || result.forceAverage) {
      result.spaceSeparatedAbbreviation = true;
    }
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
 * Parse the format STRING looking for a trimmed mantissa. Append it to RESULT when found.
 *
 * @param {string} string - format
 * @param {NumbroFormat} result - Result accumulator
 */


function parseTrimMantissa(string, result) {
  var mantissa = string.split(".")[1];

  if (mantissa) {
    result.trimMantissa = mantissa.indexOf("[") !== -1;
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
  parseTrimMantissa(string, result);
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
var allSuffixes = [{
  key: "ZiB",
  factor: Math.pow(1024, 7)
}, {
  key: "ZB",
  factor: Math.pow(1000, 7)
}, {
  key: "YiB",
  factor: Math.pow(1024, 8)
}, {
  key: "YB",
  factor: Math.pow(1000, 8)
}, {
  key: "TiB",
  factor: Math.pow(1024, 4)
}, {
  key: "TB",
  factor: Math.pow(1000, 4)
}, {
  key: "PiB",
  factor: Math.pow(1024, 5)
}, {
  key: "PB",
  factor: Math.pow(1000, 5)
}, {
  key: "MiB",
  factor: Math.pow(1024, 2)
}, {
  key: "MB",
  factor: Math.pow(1000, 2)
}, {
  key: "KiB",
  factor: Math.pow(1024, 1)
}, {
  key: "KB",
  factor: Math.pow(1000, 1)
}, {
  key: "GiB",
  factor: Math.pow(1024, 3)
}, {
  key: "GB",
  factor: Math.pow(1000, 3)
}, {
  key: "EiB",
  factor: Math.pow(1024, 6)
}, {
  key: "EB",
  factor: Math.pow(1000, 6)
}, {
  key: "B",
  factor: 1
}];
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
  var ordinal = arguments.length > 3 ? arguments[3] : undefined;
  var zeroFormat = arguments.length > 4 ? arguments[4] : undefined;
  var abbreviations = arguments.length > 5 ? arguments[5] : undefined;
  var format = arguments.length > 6 ? arguments[6] : undefined;

  if (!isNaN(+inputString)) {
    return +inputString;
  }

  var stripped = ""; // Negative

  var newInput = inputString.replace(/(^[^(]*)\((.*)\)([^)]*$)/, "$1$2$3");

  if (newInput !== inputString) {
    return -1 * computeUnformattedValue(newInput, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
  } // Byte


  for (var i = 0; i < allSuffixes.length; i++) {
    var suffix = allSuffixes[i];
    stripped = inputString.replace(RegExp("([0-9 ])(".concat(suffix.key, ")$")), "$1");

    if (stripped !== inputString) {
      return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format) * suffix.factor;
    }
  } // Percent


  stripped = inputString.replace("%", "");

  if (stripped !== inputString) {
    return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format) / 100;
  } // Ordinal


  var possibleOrdinalValue = parseFloat(inputString);

  if (isNaN(possibleOrdinalValue)) {
    return undefined;
  }

  var ordinalString = ordinal(possibleOrdinalValue);

  if (ordinalString && ordinalString !== ".") {
    // if ordinal is "." it will be caught next round in the +inputString
    stripped = inputString.replace(new RegExp("".concat(escapeRegExp(ordinalString), "$")), "");

    if (stripped !== inputString) {
      return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, format);
    }
  } // Average


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

      switch (key) {
        // eslint-disable-line default-case
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
  var stripped = inputString.replace(currencySymbol, ""); // Thousand separators

  stripped = stripped.replace(new RegExp("([0-9])".concat(escapeRegExp(delimiters.thousands), "([0-9])"), "g"), "$1$2"); // Decimal

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
  var ordinal = arguments.length > 3 ? arguments[3] : undefined;
  var zeroFormat = arguments.length > 4 ? arguments[4] : undefined;
  var abbreviations = arguments.length > 5 ? arguments[5] : undefined;
  var format = arguments.length > 6 ? arguments[6] : undefined;

  if (inputString === "") {
    return undefined;
  } // Zero Format


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

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

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
var unformatter = require("./unformatting"); // Simplified regexp supporting only `language`, `script`, and `region`


var bcp47RegExp = /^[a-z]{2,3}(-[a-zA-Z]{4})?(-([A-Z]{2}|[0-9]{3}))?$/;
var validOutputValues = ["currency", "percent", "byte", "time", "ordinal", "number"];
var validForceAverageValues = ["trillion", "billion", "million", "thousand"];
var validCurrencyPosition = ["prefix", "infix", "postfix"];
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
  lowPrecision: {
    type: "boolean",
    restriction: function restriction(number, format) {
      return format.average === true;
    },
    message: "`lowPrecision` must be provided only when the option `average` is set"
  },
  currencyPosition: {
    type: "string",
    validValues: validCurrencyPosition
  },
  currencySymbol: "string",
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
  trimMantissa: "boolean",
  roundingFunction: "function",
  optionalCharacteristic: "boolean",
  thousandSeparated: "boolean",
  spaceSeparated: "boolean",
  spaceSeparatedCurrency: "boolean",
  spaceSeparatedAbbreviation: "boolean",
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
      decimal: "string",
      thousandsSize: "number"
    },
    mandatory: true
  },
  abbreviations: validMandatoryAbbreviations,
  spaceSeparated: "boolean",
  spaceSeparatedCurrency: "boolean",
  ordinal: {
    type: "function",
    mandatory: true
  },
  bytes: {
    type: "object",
    children: {
      binarySuffixes: "object",
      decimalSuffixes: "object"
    }
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
  return value !== undefined;
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
      console.error("".concat(prefix, " Invalid key: ").concat(key)); // eslint-disable-line no-console

      return false;
    }

    var value = toValidate[key];
    var data = spec[key];

    if (typeof data === "string") {
      data = {
        type: data
      };
    }

    if (data.type === "format") {
      // all formats are partial (a.k.a will be merged with some default values) thus no need to check mandatory values
      var valid = validateSpec(value, validFormat, "[Validate ".concat(key, "]"), true);

      if (!valid) {
        return false;
      }
    } else if (_typeof(value) !== data.type) {
      console.error("".concat(prefix, " ").concat(key, " type mismatched: \"").concat(data.type, "\" expected, \"").concat(_typeof(value), "\" provided")); // eslint-disable-line no-console

      return false;
    }

    if (data.restrictions && data.restrictions.length) {
      var length = data.restrictions.length;

      for (var i = 0; i < length; i++) {
        var _data$restrictions$i = data.restrictions[i],
            restriction = _data$restrictions$i.restriction,
            message = _data$restrictions$i.message;

        if (!restriction(value, toValidate)) {
          console.error("".concat(prefix, " ").concat(key, " invalid value: ").concat(message)); // eslint-disable-line no-console

          return false;
        }
      }
    }

    if (data.restriction && !data.restriction(value, toValidate)) {
      console.error("".concat(prefix, " ").concat(key, " invalid value: ").concat(data.message)); // eslint-disable-line no-console

      return false;
    }

    if (data.validValues && data.validValues.indexOf(value) === -1) {
      console.error("".concat(prefix, " ").concat(key, " invalid value: must be among ").concat(JSON.stringify(data.validValues), ", \"").concat(value, "\" provided")); // eslint-disable-line no-console

      return false;
    }

    if (data.children) {
      var _valid = validateSpec(value, data.children, "[Validate ".concat(key, "]"));

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
        data = {
          type: data
        };
      }

      if (data.mandatory) {
        var mandatory = data.mandatory;

        if (typeof mandatory === "function") {
          mandatory = mandatory(toValidate);
        }

        if (mandatory && toValidate[key] === undefined) {
          console.error("".concat(prefix, " Missing mandatory key \"").concat(key, "\"")); // eslint-disable-line no-console

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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmlnbnVtYmVyLmpzL2JpZ251bWJlci5qcyIsInNyYy9lbi1VUy5qcyIsInNyYy9mb3JtYXR0aW5nLmpzIiwic3JjL2dsb2JhbFN0YXRlLmpzIiwic3JjL2xvYWRpbmcuanMiLCJzcmMvbWFuaXB1bGF0aW5nLmpzIiwic3JjL251bWJyby5qcyIsInNyYy9wYXJzaW5nLmpzIiwic3JjL3VuZm9ybWF0dGluZy5qcyIsInNyYy92YWxpZGF0aW5nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QUFHLElBQUksT0FBZDtBQUNILEdBRk0sRUFFSixJQUZJLENBQVA7QUFHSDtBQUVEOzs7Ozs7OztBQU1BLFNBQVMsY0FBVCxDQUF3QixNQUF4QixFQUFnQztBQUM1QixTQUFPLFlBQVksQ0FBQyxNQUFELEVBQVMsV0FBVCxFQUFzQixtQkFBdEIsQ0FBbkI7QUFDSDtBQUVEOzs7Ozs7OztBQU1BLFNBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsRUFBb0M7QUFDaEMsU0FBTyxZQUFZLENBQUMsUUFBRCxFQUFXLGFBQVgsRUFBMEIscUJBQTFCLENBQW5CO0FBQ0g7O0FBRUQsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUFDYixFQUFBLFFBQVEsRUFBUixRQURhO0FBRWIsRUFBQSxjQUFjLEVBQWQsY0FGYTtBQUdiLEVBQUEsYUFBYSxFQUFiLGFBSGE7QUFJYixFQUFBLGdCQUFnQixFQUFoQjtBQUphLENBQWpCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiOyhmdW5jdGlvbiAoZ2xvYmFsT2JqZWN0KSB7XHJcbiAgJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuICogICAgICBiaWdudW1iZXIuanMgdjguMS4xXHJcbiAqICAgICAgQSBKYXZhU2NyaXB0IGxpYnJhcnkgZm9yIGFyYml0cmFyeS1wcmVjaXNpb24gYXJpdGhtZXRpYy5cclxuICogICAgICBodHRwczovL2dpdGh1Yi5jb20vTWlrZU1jbC9iaWdudW1iZXIuanNcclxuICogICAgICBDb3B5cmlnaHQgKGMpIDIwMTkgTWljaGFlbCBNY2xhdWdobGluIDxNOGNoODhsQGdtYWlsLmNvbT5cclxuICogICAgICBNSVQgTGljZW5zZWQuXHJcbiAqXHJcbiAqICAgICAgQmlnTnVtYmVyLnByb3RvdHlwZSBtZXRob2RzICAgICB8ICBCaWdOdW1iZXIgbWV0aG9kc1xyXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIGFic29sdXRlVmFsdWUgICAgICAgICAgICBhYnMgICAgfCAgY2xvbmVcclxuICogICAgICBjb21wYXJlZFRvICAgICAgICAgICAgICAgICAgICAgIHwgIGNvbmZpZyAgICAgICAgICAgICAgIHNldFxyXG4gKiAgICAgIGRlY2ltYWxQbGFjZXMgICAgICAgICAgICBkcCAgICAgfCAgICAgIERFQ0lNQUxfUExBQ0VTXHJcbiAqICAgICAgZGl2aWRlZEJ5ICAgICAgICAgICAgICAgIGRpdiAgICB8ICAgICAgUk9VTkRJTkdfTU9ERVxyXG4gKiAgICAgIGRpdmlkZWRUb0ludGVnZXJCeSAgICAgICBpZGl2ICAgfCAgICAgIEVYUE9ORU5USUFMX0FUXHJcbiAqICAgICAgZXhwb25lbnRpYXRlZEJ5ICAgICAgICAgIHBvdyAgICB8ICAgICAgUkFOR0VcclxuICogICAgICBpbnRlZ2VyVmFsdWUgICAgICAgICAgICAgICAgICAgIHwgICAgICBDUllQVE9cclxuICogICAgICBpc0VxdWFsVG8gICAgICAgICAgICAgICAgZXEgICAgIHwgICAgICBNT0RVTE9fTU9ERVxyXG4gKiAgICAgIGlzRmluaXRlICAgICAgICAgICAgICAgICAgICAgICAgfCAgICAgIFBPV19QUkVDSVNJT05cclxuICogICAgICBpc0dyZWF0ZXJUaGFuICAgICAgICAgICAgZ3QgICAgIHwgICAgICBGT1JNQVRcclxuICogICAgICBpc0dyZWF0ZXJUaGFuT3JFcXVhbFRvICAgZ3RlICAgIHwgICAgICBBTFBIQUJFVFxyXG4gKiAgICAgIGlzSW50ZWdlciAgICAgICAgICAgICAgICAgICAgICAgfCAgaXNCaWdOdW1iZXJcclxuICogICAgICBpc0xlc3NUaGFuICAgICAgICAgICAgICAgbHQgICAgIHwgIG1heGltdW0gICAgICAgICAgICAgIG1heFxyXG4gKiAgICAgIGlzTGVzc1RoYW5PckVxdWFsVG8gICAgICBsdGUgICAgfCAgbWluaW11bSAgICAgICAgICAgICAgbWluXHJcbiAqICAgICAgaXNOYU4gICAgICAgICAgICAgICAgICAgICAgICAgICB8ICByYW5kb21cclxuICogICAgICBpc05lZ2F0aXZlICAgICAgICAgICAgICAgICAgICAgIHwgIHN1bVxyXG4gKiAgICAgIGlzUG9zaXRpdmUgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIGlzWmVybyAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIG1pbnVzICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIG1vZHVsbyAgICAgICAgICAgICAgICAgICBtb2QgICAgfFxyXG4gKiAgICAgIG11bHRpcGxpZWRCeSAgICAgICAgICAgICB0aW1lcyAgfFxyXG4gKiAgICAgIG5lZ2F0ZWQgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHBsdXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHByZWNpc2lvbiAgICAgICAgICAgICAgICBzZCAgICAgfFxyXG4gKiAgICAgIHNoaWZ0ZWRCeSAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHNxdWFyZVJvb3QgICAgICAgICAgICAgICBzcXJ0ICAgfFxyXG4gKiAgICAgIHRvRXhwb25lbnRpYWwgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvRml4ZWQgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvRm9ybWF0ICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvRnJhY3Rpb24gICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvSlNPTiAgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvTnVtYmVyICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvUHJlY2lzaW9uICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHRvU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKiAgICAgIHZhbHVlT2YgICAgICAgICAgICAgICAgICAgICAgICAgfFxyXG4gKlxyXG4gKi9cclxuXHJcblxyXG4gIHZhciBCaWdOdW1iZXIsXHJcbiAgICBpc051bWVyaWMgPSAvXi0/KD86XFxkKyg/OlxcLlxcZCopP3xcXC5cXGQrKSg/OmVbKy1dP1xcZCspPyQvaSxcclxuICAgIGhhc1N5bWJvbCA9IHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09ICdzeW1ib2wnLFxyXG5cclxuICAgIG1hdGhjZWlsID0gTWF0aC5jZWlsLFxyXG4gICAgbWF0aGZsb29yID0gTWF0aC5mbG9vcixcclxuXHJcbiAgICBiaWdudW1iZXJFcnJvciA9ICdbQmlnTnVtYmVyIEVycm9yXSAnLFxyXG4gICAgdG9vTWFueURpZ2l0cyA9IGJpZ251bWJlckVycm9yICsgJ051bWJlciBwcmltaXRpdmUgaGFzIG1vcmUgdGhhbiAxNSBzaWduaWZpY2FudCBkaWdpdHM6ICcsXHJcblxyXG4gICAgQkFTRSA9IDFlMTQsXHJcbiAgICBMT0dfQkFTRSA9IDE0LFxyXG4gICAgTUFYX1NBRkVfSU5URUdFUiA9IDB4MWZmZmZmZmZmZmZmZmYsICAgICAgICAgLy8gMl41MyAtIDFcclxuICAgIC8vIE1BWF9JTlQzMiA9IDB4N2ZmZmZmZmYsICAgICAgICAgICAgICAgICAgIC8vIDJeMzEgLSAxXHJcbiAgICBQT1dTX1RFTiA9IFsxLCAxMCwgMTAwLCAxZTMsIDFlNCwgMWU1LCAxZTYsIDFlNywgMWU4LCAxZTksIDFlMTAsIDFlMTEsIDFlMTIsIDFlMTNdLFxyXG4gICAgU1FSVF9CQVNFID0gMWU3LFxyXG5cclxuICAgIC8vIEVESVRBQkxFXHJcbiAgICAvLyBUaGUgbGltaXQgb24gdGhlIHZhbHVlIG9mIERFQ0lNQUxfUExBQ0VTLCBUT19FWFBfTkVHLCBUT19FWFBfUE9TLCBNSU5fRVhQLCBNQVhfRVhQLCBhbmRcclxuICAgIC8vIHRoZSBhcmd1bWVudHMgdG8gdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9Gb3JtYXQsIGFuZCB0b1ByZWNpc2lvbi5cclxuICAgIE1BWCA9IDFFOTsgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gTUFYX0lOVDMyXHJcblxyXG5cclxuICAvKlxyXG4gICAqIENyZWF0ZSBhbmQgcmV0dXJuIGEgQmlnTnVtYmVyIGNvbnN0cnVjdG9yLlxyXG4gICAqL1xyXG4gIGZ1bmN0aW9uIGNsb25lKGNvbmZpZ09iamVjdCkge1xyXG4gICAgdmFyIGRpdiwgY29udmVydEJhc2UsIHBhcnNlTnVtZXJpYyxcclxuICAgICAgUCA9IEJpZ051bWJlci5wcm90b3R5cGUgPSB7IGNvbnN0cnVjdG9yOiBCaWdOdW1iZXIsIHRvU3RyaW5nOiBudWxsLCB2YWx1ZU9mOiBudWxsIH0sXHJcbiAgICAgIE9ORSA9IG5ldyBCaWdOdW1iZXIoMSksXHJcblxyXG5cclxuICAgICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBFRElUQUJMRSBDT05GSUcgREVGQVVMVFMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuXHJcbiAgICAgIC8vIFRoZSBkZWZhdWx0IHZhbHVlcyBiZWxvdyBtdXN0IGJlIGludGVnZXJzIHdpdGhpbiB0aGUgaW5jbHVzaXZlIHJhbmdlcyBzdGF0ZWQuXHJcbiAgICAgIC8vIFRoZSB2YWx1ZXMgY2FuIGFsc28gYmUgY2hhbmdlZCBhdCBydW4tdGltZSB1c2luZyBCaWdOdW1iZXIuc2V0LlxyXG5cclxuICAgICAgLy8gVGhlIG1heGltdW0gbnVtYmVyIG9mIGRlY2ltYWwgcGxhY2VzIGZvciBvcGVyYXRpb25zIGludm9sdmluZyBkaXZpc2lvbi5cclxuICAgICAgREVDSU1BTF9QTEFDRVMgPSAyMCwgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWFxyXG5cclxuICAgICAgLy8gVGhlIHJvdW5kaW5nIG1vZGUgdXNlZCB3aGVuIHJvdW5kaW5nIHRvIHRoZSBhYm92ZSBkZWNpbWFsIHBsYWNlcywgYW5kIHdoZW4gdXNpbmdcclxuICAgICAgLy8gdG9FeHBvbmVudGlhbCwgdG9GaXhlZCwgdG9Gb3JtYXQgYW5kIHRvUHJlY2lzaW9uLCBhbmQgcm91bmQgKGRlZmF1bHQgdmFsdWUpLlxyXG4gICAgICAvLyBVUCAgICAgICAgIDAgQXdheSBmcm9tIHplcm8uXHJcbiAgICAgIC8vIERPV04gICAgICAgMSBUb3dhcmRzIHplcm8uXHJcbiAgICAgIC8vIENFSUwgICAgICAgMiBUb3dhcmRzICtJbmZpbml0eS5cclxuICAgICAgLy8gRkxPT1IgICAgICAzIFRvd2FyZHMgLUluZmluaXR5LlxyXG4gICAgICAvLyBIQUxGX1VQICAgIDQgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIHVwLlxyXG4gICAgICAvLyBIQUxGX0RPV04gIDUgVG93YXJkcyBuZWFyZXN0IG5laWdoYm91ci4gSWYgZXF1aWRpc3RhbnQsIGRvd24uXHJcbiAgICAgIC8vIEhBTEZfRVZFTiAgNiBUb3dhcmRzIG5lYXJlc3QgbmVpZ2hib3VyLiBJZiBlcXVpZGlzdGFudCwgdG93YXJkcyBldmVuIG5laWdoYm91ci5cclxuICAgICAgLy8gSEFMRl9DRUlMICA3IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0b3dhcmRzICtJbmZpbml0eS5cclxuICAgICAgLy8gSEFMRl9GTE9PUiA4IFRvd2FyZHMgbmVhcmVzdCBuZWlnaGJvdXIuIElmIGVxdWlkaXN0YW50LCB0b3dhcmRzIC1JbmZpbml0eS5cclxuICAgICAgUk9VTkRJTkdfTU9ERSA9IDQsICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDhcclxuXHJcbiAgICAgIC8vIEVYUE9ORU5USUFMX0FUIDogW1RPX0VYUF9ORUcgLCBUT19FWFBfUE9TXVxyXG5cclxuICAgICAgLy8gVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBiZW5lYXRoIHdoaWNoIHRvU3RyaW5nIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgIC8vIE51bWJlciB0eXBlOiAtN1xyXG4gICAgICBUT19FWFBfTkVHID0gLTcsICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDAgdG8gLU1BWFxyXG5cclxuICAgICAgLy8gVGhlIGV4cG9uZW50IHZhbHVlIGF0IGFuZCBhYm92ZSB3aGljaCB0b1N0cmluZyByZXR1cm5zIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICAvLyBOdW1iZXIgdHlwZTogMjFcclxuICAgICAgVE9fRVhQX1BPUyA9IDIxLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIE1BWFxyXG5cclxuICAgICAgLy8gUkFOR0UgOiBbTUlOX0VYUCwgTUFYX0VYUF1cclxuXHJcbiAgICAgIC8vIFRoZSBtaW5pbXVtIGV4cG9uZW50IHZhbHVlLCBiZW5lYXRoIHdoaWNoIHVuZGVyZmxvdyB0byB6ZXJvIG9jY3Vycy5cclxuICAgICAgLy8gTnVtYmVyIHR5cGU6IC0zMjQgICg1ZS0zMjQpXHJcbiAgICAgIE1JTl9FWFAgPSAtMWU3LCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gLTEgdG8gLU1BWFxyXG5cclxuICAgICAgLy8gVGhlIG1heGltdW0gZXhwb25lbnQgdmFsdWUsIGFib3ZlIHdoaWNoIG92ZXJmbG93IHRvIEluZmluaXR5IG9jY3Vycy5cclxuICAgICAgLy8gTnVtYmVyIHR5cGU6ICAzMDggICgxLjc5NzY5MzEzNDg2MjMxNTdlKzMwOClcclxuICAgICAgLy8gRm9yIE1BWF9FWFAgPiAxZTcsIGUuZy4gbmV3IEJpZ051bWJlcignMWUxMDAwMDAwMDAnKS5wbHVzKDEpIG1heSBiZSBzbG93LlxyXG4gICAgICBNQVhfRVhQID0gMWU3LCAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIDEgdG8gTUFYXHJcblxyXG4gICAgICAvLyBXaGV0aGVyIHRvIHVzZSBjcnlwdG9ncmFwaGljYWxseS1zZWN1cmUgcmFuZG9tIG51bWJlciBnZW5lcmF0aW9uLCBpZiBhdmFpbGFibGUuXHJcbiAgICAgIENSWVBUTyA9IGZhbHNlLCAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdHJ1ZSBvciBmYWxzZVxyXG5cclxuICAgICAgLy8gVGhlIG1vZHVsbyBtb2RlIHVzZWQgd2hlbiBjYWxjdWxhdGluZyB0aGUgbW9kdWx1czogYSBtb2Qgbi5cclxuICAgICAgLy8gVGhlIHF1b3RpZW50IChxID0gYSAvIG4pIGlzIGNhbGN1bGF0ZWQgYWNjb3JkaW5nIHRvIHRoZSBjb3JyZXNwb25kaW5nIHJvdW5kaW5nIG1vZGUuXHJcbiAgICAgIC8vIFRoZSByZW1haW5kZXIgKHIpIGlzIGNhbGN1bGF0ZWQgYXM6IHIgPSBhIC0gbiAqIHEuXHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIFVQICAgICAgICAwIFRoZSByZW1haW5kZXIgaXMgcG9zaXRpdmUgaWYgdGhlIGRpdmlkZW5kIGlzIG5lZ2F0aXZlLCBlbHNlIGlzIG5lZ2F0aXZlLlxyXG4gICAgICAvLyBET1dOICAgICAgMSBUaGUgcmVtYWluZGVyIGhhcyB0aGUgc2FtZSBzaWduIGFzIHRoZSBkaXZpZGVuZC5cclxuICAgICAgLy8gICAgICAgICAgICAgVGhpcyBtb2R1bG8gbW9kZSBpcyBjb21tb25seSBrbm93biBhcyAndHJ1bmNhdGVkIGRpdmlzaW9uJyBhbmQgaXNcclxuICAgICAgLy8gICAgICAgICAgICAgZXF1aXZhbGVudCB0byAoYSAlIG4pIGluIEphdmFTY3JpcHQuXHJcbiAgICAgIC8vIEZMT09SICAgICAzIFRoZSByZW1haW5kZXIgaGFzIHRoZSBzYW1lIHNpZ24gYXMgdGhlIGRpdmlzb3IgKFB5dGhvbiAlKS5cclxuICAgICAgLy8gSEFMRl9FVkVOIDYgVGhpcyBtb2R1bG8gbW9kZSBpbXBsZW1lbnRzIHRoZSBJRUVFIDc1NCByZW1haW5kZXIgZnVuY3Rpb24uXHJcbiAgICAgIC8vIEVVQ0xJRCAgICA5IEV1Y2xpZGlhbiBkaXZpc2lvbi4gcSA9IHNpZ24obikgKiBmbG9vcihhIC8gYWJzKG4pKS5cclxuICAgICAgLy8gICAgICAgICAgICAgVGhlIHJlbWFpbmRlciBpcyBhbHdheXMgcG9zaXRpdmUuXHJcbiAgICAgIC8vXHJcbiAgICAgIC8vIFRoZSB0cnVuY2F0ZWQgZGl2aXNpb24sIGZsb29yZWQgZGl2aXNpb24sIEV1Y2xpZGlhbiBkaXZpc2lvbiBhbmQgSUVFRSA3NTQgcmVtYWluZGVyXHJcbiAgICAgIC8vIG1vZGVzIGFyZSBjb21tb25seSB1c2VkIGZvciB0aGUgbW9kdWx1cyBvcGVyYXRpb24uXHJcbiAgICAgIC8vIEFsdGhvdWdoIHRoZSBvdGhlciByb3VuZGluZyBtb2RlcyBjYW4gYWxzbyBiZSB1c2VkLCB0aGV5IG1heSBub3QgZ2l2ZSB1c2VmdWwgcmVzdWx0cy5cclxuICAgICAgTU9EVUxPX01PREUgPSAxLCAgICAgICAgICAgICAgICAgICAgICAgICAvLyAwIHRvIDlcclxuXHJcbiAgICAgIC8vIFRoZSBtYXhpbXVtIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHMgb2YgdGhlIHJlc3VsdCBvZiB0aGUgZXhwb25lbnRpYXRlZEJ5IG9wZXJhdGlvbi5cclxuICAgICAgLy8gSWYgUE9XX1BSRUNJU0lPTiBpcyAwLCB0aGVyZSB3aWxsIGJlIHVubGltaXRlZCBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgIFBPV19QUkVDSVNJT04gPSAwLCAgICAgICAgICAgICAgICAgICAgLy8gMCB0byBNQVhcclxuXHJcbiAgICAgIC8vIFRoZSBmb3JtYXQgc3BlY2lmaWNhdGlvbiB1c2VkIGJ5IHRoZSBCaWdOdW1iZXIucHJvdG90eXBlLnRvRm9ybWF0IG1ldGhvZC5cclxuICAgICAgRk9STUFUID0ge1xyXG4gICAgICAgIHByZWZpeDogJycsXHJcbiAgICAgICAgZ3JvdXBTaXplOiAzLFxyXG4gICAgICAgIHNlY29uZGFyeUdyb3VwU2l6ZTogMCxcclxuICAgICAgICBncm91cFNlcGFyYXRvcjogJywnLFxyXG4gICAgICAgIGRlY2ltYWxTZXBhcmF0b3I6ICcuJyxcclxuICAgICAgICBmcmFjdGlvbkdyb3VwU2l6ZTogMCxcclxuICAgICAgICBmcmFjdGlvbkdyb3VwU2VwYXJhdG9yOiAnXFx4QTAnLCAgICAgIC8vIG5vbi1icmVha2luZyBzcGFjZVxyXG4gICAgICAgIHN1ZmZpeDogJydcclxuICAgICAgfSxcclxuXHJcbiAgICAgIC8vIFRoZSBhbHBoYWJldCB1c2VkIGZvciBiYXNlIGNvbnZlcnNpb24uIEl0IG11c3QgYmUgYXQgbGVhc3QgMiBjaGFyYWN0ZXJzIGxvbmcsIHdpdGggbm8gJysnLFxyXG4gICAgICAvLyAnLScsICcuJywgd2hpdGVzcGFjZSwgb3IgcmVwZWF0ZWQgY2hhcmFjdGVyLlxyXG4gICAgICAvLyAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVokXydcclxuICAgICAgQUxQSEFCRVQgPSAnMDEyMzQ1Njc4OWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6JztcclxuXHJcblxyXG4gICAgLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcblxyXG4gICAgLy8gQ09OU1RSVUNUT1JcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFRoZSBCaWdOdW1iZXIgY29uc3RydWN0b3IgYW5kIGV4cG9ydGVkIGZ1bmN0aW9uLlxyXG4gICAgICogQ3JlYXRlIGFuZCByZXR1cm4gYSBuZXcgaW5zdGFuY2Ugb2YgYSBCaWdOdW1iZXIgb2JqZWN0LlxyXG4gICAgICpcclxuICAgICAqIHYge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfSBBIG51bWVyaWMgdmFsdWUuXHJcbiAgICAgKiBbYl0ge251bWJlcn0gVGhlIGJhc2Ugb2Ygdi4gSW50ZWdlciwgMiB0byBBTFBIQUJFVC5sZW5ndGggaW5jbHVzaXZlLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBCaWdOdW1iZXIodiwgYikge1xyXG4gICAgICB2YXIgYWxwaGFiZXQsIGMsIGNhc2VDaGFuZ2VkLCBlLCBpLCBpc051bSwgbGVuLCBzdHIsXHJcbiAgICAgICAgeCA9IHRoaXM7XHJcblxyXG4gICAgICAvLyBFbmFibGUgY29uc3RydWN0b3IgY2FsbCB3aXRob3V0IGBuZXdgLlxyXG4gICAgICBpZiAoISh4IGluc3RhbmNlb2YgQmlnTnVtYmVyKSkgcmV0dXJuIG5ldyBCaWdOdW1iZXIodiwgYik7XHJcblxyXG4gICAgICBpZiAoYiA9PSBudWxsKSB7XHJcblxyXG4gICAgICAgIGlmICh2ICYmIHYuX2lzQmlnTnVtYmVyID09PSB0cnVlKSB7XHJcbiAgICAgICAgICB4LnMgPSB2LnM7XHJcblxyXG4gICAgICAgICAgaWYgKCF2LmMgfHwgdi5lID4gTUFYX0VYUCkge1xyXG4gICAgICAgICAgICB4LmMgPSB4LmUgPSBudWxsO1xyXG4gICAgICAgICAgfSBlbHNlIGlmICh2LmUgPCBNSU5fRVhQKSB7XHJcbiAgICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHguZSA9IHYuZTtcclxuICAgICAgICAgICAgeC5jID0gdi5jLnNsaWNlKCk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKChpc051bSA9IHR5cGVvZiB2ID09ICdudW1iZXInKSAmJiB2ICogMCA9PSAwKSB7XHJcblxyXG4gICAgICAgICAgLy8gVXNlIGAxIC8gbmAgdG8gaGFuZGxlIG1pbnVzIHplcm8gYWxzby5cclxuICAgICAgICAgIHgucyA9IDEgLyB2IDwgMCA/ICh2ID0gLXYsIC0xKSA6IDE7XHJcblxyXG4gICAgICAgICAgLy8gRmFzdCBwYXRoIGZvciBpbnRlZ2Vycywgd2hlcmUgbiA8IDIxNDc0ODM2NDggKDIqKjMxKS5cclxuICAgICAgICAgIGlmICh2ID09PSB+fnYpIHtcclxuICAgICAgICAgICAgZm9yIChlID0gMCwgaSA9IHY7IGkgPj0gMTA7IGkgLz0gMTAsIGUrKyk7XHJcblxyXG4gICAgICAgICAgICBpZiAoZSA+IE1BWF9FWFApIHtcclxuICAgICAgICAgICAgICB4LmMgPSB4LmUgPSBudWxsO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHguZSA9IGU7XHJcbiAgICAgICAgICAgICAgeC5jID0gW3ZdO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgc3RyID0gU3RyaW5nKHYpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgaWYgKCFpc051bWVyaWMudGVzdChzdHIgPSBTdHJpbmcodikpKSByZXR1cm4gcGFyc2VOdW1lcmljKHgsIHN0ciwgaXNOdW0pO1xyXG5cclxuICAgICAgICAgIHgucyA9IHN0ci5jaGFyQ29kZUF0KDApID09IDQ1ID8gKHN0ciA9IHN0ci5zbGljZSgxKSwgLTEpIDogMTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gc3RyLmluZGV4T2YoJy4nKSkgPiAtMSkgc3RyID0gc3RyLnJlcGxhY2UoJy4nLCAnJyk7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50aWFsIGZvcm0/XHJcbiAgICAgICAgaWYgKChpID0gc3RyLnNlYXJjaCgvZS9pKSkgPiAwKSB7XHJcblxyXG4gICAgICAgICAgLy8gRGV0ZXJtaW5lIGV4cG9uZW50LlxyXG4gICAgICAgICAgaWYgKGUgPCAwKSBlID0gaTtcclxuICAgICAgICAgIGUgKz0gK3N0ci5zbGljZShpICsgMSk7XHJcbiAgICAgICAgICBzdHIgPSBzdHIuc3Vic3RyaW5nKDAsIGkpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgICAgICAvLyBJbnRlZ2VyLlxyXG4gICAgICAgICAgZSA9IHN0ci5sZW5ndGg7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIEJhc2Uge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge2J9J1xyXG4gICAgICAgIGludENoZWNrKGIsIDIsIEFMUEhBQkVULmxlbmd0aCwgJ0Jhc2UnKTtcclxuXHJcbiAgICAgICAgLy8gQWxsb3cgZXhwb25lbnRpYWwgbm90YXRpb24gdG8gYmUgdXNlZCB3aXRoIGJhc2UgMTAgYXJndW1lbnQsIHdoaWxlXHJcbiAgICAgICAgLy8gYWxzbyByb3VuZGluZyB0byBERUNJTUFMX1BMQUNFUyBhcyB3aXRoIG90aGVyIGJhc2VzLlxyXG4gICAgICAgIGlmIChiID09IDEwKSB7XHJcbiAgICAgICAgICB4ID0gbmV3IEJpZ051bWJlcih2KTtcclxuICAgICAgICAgIHJldHVybiByb3VuZCh4LCBERUNJTUFMX1BMQUNFUyArIHguZSArIDEsIFJPVU5ESU5HX01PREUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3RyID0gU3RyaW5nKHYpO1xyXG5cclxuICAgICAgICBpZiAoaXNOdW0gPSB0eXBlb2YgdiA9PSAnbnVtYmVyJykge1xyXG5cclxuICAgICAgICAgIC8vIEF2b2lkIHBvdGVudGlhbCBpbnRlcnByZXRhdGlvbiBvZiBJbmZpbml0eSBhbmQgTmFOIGFzIGJhc2UgNDQrIHZhbHVlcy5cclxuICAgICAgICAgIGlmICh2ICogMCAhPSAwKSByZXR1cm4gcGFyc2VOdW1lcmljKHgsIHN0ciwgaXNOdW0sIGIpO1xyXG5cclxuICAgICAgICAgIHgucyA9IDEgLyB2IDwgMCA/IChzdHIgPSBzdHIuc2xpY2UoMSksIC0xKSA6IDE7XHJcblxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIE51bWJlciBwcmltaXRpdmUgaGFzIG1vcmUgdGhhbiAxNSBzaWduaWZpY2FudCBkaWdpdHM6IHtufSdcclxuICAgICAgICAgIGlmIChCaWdOdW1iZXIuREVCVUcgJiYgc3RyLnJlcGxhY2UoL14wXFwuMCp8XFwuLywgJycpLmxlbmd0aCA+IDE1KSB7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgICAgICAodG9vTWFueURpZ2l0cyArIHYpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB4LnMgPSBzdHIuY2hhckNvZGVBdCgwKSA9PT0gNDUgPyAoc3RyID0gc3RyLnNsaWNlKDEpLCAtMSkgOiAxO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYWxwaGFiZXQgPSBBTFBIQUJFVC5zbGljZSgwLCBiKTtcclxuICAgICAgICBlID0gaSA9IDA7XHJcblxyXG4gICAgICAgIC8vIENoZWNrIHRoYXQgc3RyIGlzIGEgdmFsaWQgYmFzZSBiIG51bWJlci5cclxuICAgICAgICAvLyBEb24ndCB1c2UgUmVnRXhwLCBzbyBhbHBoYWJldCBjYW4gY29udGFpbiBzcGVjaWFsIGNoYXJhY3RlcnMuXHJcbiAgICAgICAgZm9yIChsZW4gPSBzdHIubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcclxuICAgICAgICAgIGlmIChhbHBoYWJldC5pbmRleE9mKGMgPSBzdHIuY2hhckF0KGkpKSA8IDApIHtcclxuICAgICAgICAgICAgaWYgKGMgPT0gJy4nKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIElmICcuJyBpcyBub3QgdGhlIGZpcnN0IGNoYXJhY3RlciBhbmQgaXQgaGFzIG5vdCBiZSBmb3VuZCBiZWZvcmUuXHJcbiAgICAgICAgICAgICAgaWYgKGkgPiBlKSB7XHJcbiAgICAgICAgICAgICAgICBlID0gbGVuO1xyXG4gICAgICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFjYXNlQ2hhbmdlZCkge1xyXG5cclxuICAgICAgICAgICAgICAvLyBBbGxvdyBlLmcuIGhleGFkZWNpbWFsICdGRicgYXMgd2VsbCBhcyAnZmYnLlxyXG4gICAgICAgICAgICAgIGlmIChzdHIgPT0gc3RyLnRvVXBwZXJDYXNlKCkgJiYgKHN0ciA9IHN0ci50b0xvd2VyQ2FzZSgpKSB8fFxyXG4gICAgICAgICAgICAgICAgICBzdHIgPT0gc3RyLnRvTG93ZXJDYXNlKCkgJiYgKHN0ciA9IHN0ci50b1VwcGVyQ2FzZSgpKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZUNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgaSA9IC0xO1xyXG4gICAgICAgICAgICAgICAgZSA9IDA7XHJcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiBwYXJzZU51bWVyaWMoeCwgU3RyaW5nKHYpLCBpc051bSwgYik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBQcmV2ZW50IGxhdGVyIGNoZWNrIGZvciBsZW5ndGggb24gY29udmVydGVkIG51bWJlci5cclxuICAgICAgICBpc051bSA9IGZhbHNlO1xyXG4gICAgICAgIHN0ciA9IGNvbnZlcnRCYXNlKHN0ciwgYiwgMTAsIHgucyk7XHJcblxyXG4gICAgICAgIC8vIERlY2ltYWwgcG9pbnQ/XHJcbiAgICAgICAgaWYgKChlID0gc3RyLmluZGV4T2YoJy4nKSkgPiAtMSkgc3RyID0gc3RyLnJlcGxhY2UoJy4nLCAnJyk7XHJcbiAgICAgICAgZWxzZSBlID0gc3RyLmxlbmd0aDtcclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gRGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgIGZvciAoaSA9IDA7IHN0ci5jaGFyQ29kZUF0KGkpID09PSA0ODsgaSsrKTtcclxuXHJcbiAgICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgZm9yIChsZW4gPSBzdHIubGVuZ3RoOyBzdHIuY2hhckNvZGVBdCgtLWxlbikgPT09IDQ4Oyk7XHJcblxyXG4gICAgICBpZiAoc3RyID0gc3RyLnNsaWNlKGksICsrbGVuKSkge1xyXG4gICAgICAgIGxlbiAtPSBpO1xyXG5cclxuICAgICAgICAvLyAnW0JpZ051bWJlciBFcnJvcl0gTnVtYmVyIHByaW1pdGl2ZSBoYXMgbW9yZSB0aGFuIDE1IHNpZ25pZmljYW50IGRpZ2l0czoge259J1xyXG4gICAgICAgIGlmIChpc051bSAmJiBCaWdOdW1iZXIuREVCVUcgJiZcclxuICAgICAgICAgIGxlbiA+IDE1ICYmICh2ID4gTUFYX1NBRkVfSU5URUdFUiB8fCB2ICE9PSBtYXRoZmxvb3IodikpKSB7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgICAgICAodG9vTWFueURpZ2l0cyArICh4LnMgKiB2KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAgLy8gT3ZlcmZsb3c/XHJcbiAgICAgICAgaWYgKChlID0gZSAtIGkgLSAxKSA+IE1BWF9FWFApIHtcclxuXHJcbiAgICAgICAgICAvLyBJbmZpbml0eS5cclxuICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIFVuZGVyZmxvdz9cclxuICAgICAgICB9IGVsc2UgaWYgKGUgPCBNSU5fRVhQKSB7XHJcblxyXG4gICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeC5lID0gZTtcclxuICAgICAgICAgIHguYyA9IFtdO1xyXG5cclxuICAgICAgICAgIC8vIFRyYW5zZm9ybSBiYXNlXHJcblxyXG4gICAgICAgICAgLy8gZSBpcyB0aGUgYmFzZSAxMCBleHBvbmVudC5cclxuICAgICAgICAgIC8vIGkgaXMgd2hlcmUgdG8gc2xpY2Ugc3RyIHRvIGdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiB0aGUgY29lZmZpY2llbnQgYXJyYXkuXHJcbiAgICAgICAgICBpID0gKGUgKyAxKSAlIExPR19CQVNFO1xyXG4gICAgICAgICAgaWYgKGUgPCAwKSBpICs9IExPR19CQVNFOyAgLy8gaSA8IDFcclxuXHJcbiAgICAgICAgICBpZiAoaSA8IGxlbikge1xyXG4gICAgICAgICAgICBpZiAoaSkgeC5jLnB1c2goK3N0ci5zbGljZSgwLCBpKSk7XHJcblxyXG4gICAgICAgICAgICBmb3IgKGxlbiAtPSBMT0dfQkFTRTsgaSA8IGxlbjspIHtcclxuICAgICAgICAgICAgICB4LmMucHVzaCgrc3RyLnNsaWNlKGksIGkgKz0gTE9HX0JBU0UpKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgaSA9IExPR19CQVNFIC0gKHN0ciA9IHN0ci5zbGljZShpKSkubGVuZ3RoO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaSAtPSBsZW47XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgZm9yICg7IGktLTsgc3RyICs9ICcwJyk7XHJcbiAgICAgICAgICB4LmMucHVzaCgrc3RyKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIFplcm8uXHJcbiAgICAgICAgeC5jID0gW3guZSA9IDBdO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxuICAgIC8vIENPTlNUUlVDVE9SIFBST1BFUlRJRVNcclxuXHJcblxyXG4gICAgQmlnTnVtYmVyLmNsb25lID0gY2xvbmU7XHJcblxyXG4gICAgQmlnTnVtYmVyLlJPVU5EX1VQID0gMDtcclxuICAgIEJpZ051bWJlci5ST1VORF9ET1dOID0gMTtcclxuICAgIEJpZ051bWJlci5ST1VORF9DRUlMID0gMjtcclxuICAgIEJpZ051bWJlci5ST1VORF9GTE9PUiA9IDM7XHJcbiAgICBCaWdOdW1iZXIuUk9VTkRfSEFMRl9VUCA9IDQ7XHJcbiAgICBCaWdOdW1iZXIuUk9VTkRfSEFMRl9ET1dOID0gNTtcclxuICAgIEJpZ051bWJlci5ST1VORF9IQUxGX0VWRU4gPSA2O1xyXG4gICAgQmlnTnVtYmVyLlJPVU5EX0hBTEZfQ0VJTCA9IDc7XHJcbiAgICBCaWdOdW1iZXIuUk9VTkRfSEFMRl9GTE9PUiA9IDg7XHJcbiAgICBCaWdOdW1iZXIuRVVDTElEID0gOTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIENvbmZpZ3VyZSBpbmZyZXF1ZW50bHktY2hhbmdpbmcgbGlicmFyeS13aWRlIHNldHRpbmdzLlxyXG4gICAgICpcclxuICAgICAqIEFjY2VwdCBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIG9wdGlvbmFsIHByb3BlcnRpZXMgKGlmIHRoZSB2YWx1ZSBvZiBhIHByb3BlcnR5IGlzXHJcbiAgICAgKiBhIG51bWJlciwgaXQgbXVzdCBiZSBhbiBpbnRlZ2VyIHdpdGhpbiB0aGUgaW5jbHVzaXZlIHJhbmdlIHN0YXRlZCk6XHJcbiAgICAgKlxyXG4gICAgICogICBERUNJTUFMX1BMQUNFUyAgIHtudW1iZXJ9ICAgICAgICAgICAwIHRvIE1BWFxyXG4gICAgICogICBST1VORElOR19NT0RFICAgIHtudW1iZXJ9ICAgICAgICAgICAwIHRvIDhcclxuICAgICAqICAgRVhQT05FTlRJQUxfQVQgICB7bnVtYmVyfG51bWJlcltdfSAgLU1BWCB0byBNQVggIG9yICBbLU1BWCB0byAwLCAwIHRvIE1BWF1cclxuICAgICAqICAgUkFOR0UgICAgICAgICAgICB7bnVtYmVyfG51bWJlcltdfSAgLU1BWCB0byBNQVggKG5vdCB6ZXJvKSAgb3IgIFstTUFYIHRvIC0xLCAxIHRvIE1BWF1cclxuICAgICAqICAgQ1JZUFRPICAgICAgICAgICB7Ym9vbGVhbn0gICAgICAgICAgdHJ1ZSBvciBmYWxzZVxyXG4gICAgICogICBNT0RVTE9fTU9ERSAgICAgIHtudW1iZXJ9ICAgICAgICAgICAwIHRvIDlcclxuICAgICAqICAgUE9XX1BSRUNJU0lPTiAgICAgICB7bnVtYmVyfSAgICAgICAgICAgMCB0byBNQVhcclxuICAgICAqICAgQUxQSEFCRVQgICAgICAgICB7c3RyaW5nfSAgICAgICAgICAgQSBzdHJpbmcgb2YgdHdvIG9yIG1vcmUgdW5pcXVlIGNoYXJhY3RlcnMgd2hpY2ggZG9lc1xyXG4gICAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub3QgY29udGFpbiAnLicuXHJcbiAgICAgKiAgIEZPUk1BVCAgICAgICAgICAge29iamVjdH0gICAgICAgICAgIEFuIG9iamVjdCB3aXRoIHNvbWUgb2YgdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxyXG4gICAgICogICAgIHByZWZpeCAgICAgICAgICAgICAgICAge3N0cmluZ31cclxuICAgICAqICAgICBncm91cFNpemUgICAgICAgICAgICAgIHtudW1iZXJ9XHJcbiAgICAgKiAgICAgc2Vjb25kYXJ5R3JvdXBTaXplICAgICB7bnVtYmVyfVxyXG4gICAgICogICAgIGdyb3VwU2VwYXJhdG9yICAgICAgICAge3N0cmluZ31cclxuICAgICAqICAgICBkZWNpbWFsU2VwYXJhdG9yICAgICAgIHtzdHJpbmd9XHJcbiAgICAgKiAgICAgZnJhY3Rpb25Hcm91cFNpemUgICAgICB7bnVtYmVyfVxyXG4gICAgICogICAgIGZyYWN0aW9uR3JvdXBTZXBhcmF0b3Ige3N0cmluZ31cclxuICAgICAqICAgICBzdWZmaXggICAgICAgICAgICAgICAgIHtzdHJpbmd9XHJcbiAgICAgKlxyXG4gICAgICogKFRoZSB2YWx1ZXMgYXNzaWduZWQgdG8gdGhlIGFib3ZlIEZPUk1BVCBvYmplY3QgcHJvcGVydGllcyBhcmUgbm90IGNoZWNrZWQgZm9yIHZhbGlkaXR5LilcclxuICAgICAqXHJcbiAgICAgKiBFLmcuXHJcbiAgICAgKiBCaWdOdW1iZXIuY29uZmlnKHsgREVDSU1BTF9QTEFDRVMgOiAyMCwgUk9VTkRJTkdfTU9ERSA6IDQgfSlcclxuICAgICAqXHJcbiAgICAgKiBJZ25vcmUgcHJvcGVydGllcy9wYXJhbWV0ZXJzIHNldCB0byBudWxsIG9yIHVuZGVmaW5lZCwgZXhjZXB0IGZvciBBTFBIQUJFVC5cclxuICAgICAqXHJcbiAgICAgKiBSZXR1cm4gYW4gb2JqZWN0IHdpdGggdGhlIHByb3BlcnRpZXMgY3VycmVudCB2YWx1ZXMuXHJcbiAgICAgKi9cclxuICAgIEJpZ051bWJlci5jb25maWcgPSBCaWdOdW1iZXIuc2V0ID0gZnVuY3Rpb24gKG9iaikge1xyXG4gICAgICB2YXIgcCwgdjtcclxuXHJcbiAgICAgIGlmIChvYmogIT0gbnVsbCkge1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIG9iaiA9PSAnb2JqZWN0Jykge1xyXG5cclxuICAgICAgICAgIC8vIERFQ0lNQUxfUExBQ0VTIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBERUNJTUFMX1BMQUNFUyB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7dn0nXHJcbiAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHAgPSAnREVDSU1BTF9QTEFDRVMnKSkge1xyXG4gICAgICAgICAgICB2ID0gb2JqW3BdO1xyXG4gICAgICAgICAgICBpbnRDaGVjayh2LCAwLCBNQVgsIHApO1xyXG4gICAgICAgICAgICBERUNJTUFMX1BMQUNFUyA9IHY7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUk9VTkRJTkdfTU9ERSB7bnVtYmVyfSBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIFJPVU5ESU5HX01PREUge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge3Z9J1xyXG4gICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwID0gJ1JPVU5ESU5HX01PREUnKSkge1xyXG4gICAgICAgICAgICB2ID0gb2JqW3BdO1xyXG4gICAgICAgICAgICBpbnRDaGVjayh2LCAwLCA4LCBwKTtcclxuICAgICAgICAgICAgUk9VTkRJTkdfTU9ERSA9IHY7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRVhQT05FTlRJQUxfQVQge251bWJlcnxudW1iZXJbXX1cclxuICAgICAgICAgIC8vIEludGVnZXIsIC1NQVggdG8gTUFYIGluY2x1c2l2ZSBvclxyXG4gICAgICAgICAgLy8gW2ludGVnZXIgLU1BWCB0byAwIGluY2x1c2l2ZSwgMCB0byBNQVggaW5jbHVzaXZlXS5cclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBFWFBPTkVOVElBTF9BVCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7dn0nXHJcbiAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHAgPSAnRVhQT05FTlRJQUxfQVQnKSkge1xyXG4gICAgICAgICAgICB2ID0gb2JqW3BdO1xyXG4gICAgICAgICAgICBpZiAodiAmJiB2LnBvcCkge1xyXG4gICAgICAgICAgICAgIGludENoZWNrKHZbMF0sIC1NQVgsIDAsIHApO1xyXG4gICAgICAgICAgICAgIGludENoZWNrKHZbMV0sIDAsIE1BWCwgcCk7XHJcbiAgICAgICAgICAgICAgVE9fRVhQX05FRyA9IHZbMF07XHJcbiAgICAgICAgICAgICAgVE9fRVhQX1BPUyA9IHZbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaW50Q2hlY2sodiwgLU1BWCwgTUFYLCBwKTtcclxuICAgICAgICAgICAgICBUT19FWFBfTkVHID0gLShUT19FWFBfUE9TID0gdiA8IDAgPyAtdiA6IHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUkFOR0Uge251bWJlcnxudW1iZXJbXX0gTm9uLXplcm8gaW50ZWdlciwgLU1BWCB0byBNQVggaW5jbHVzaXZlIG9yXHJcbiAgICAgICAgICAvLyBbaW50ZWdlciAtTUFYIHRvIC0xIGluY2x1c2l2ZSwgaW50ZWdlciAxIHRvIE1BWCBpbmNsdXNpdmVdLlxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIFJBTkdFIHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZXxjYW5ub3QgYmUgemVyb306IHt2fSdcclxuICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocCA9ICdSQU5HRScpKSB7XHJcbiAgICAgICAgICAgIHYgPSBvYmpbcF07XHJcbiAgICAgICAgICAgIGlmICh2ICYmIHYucG9wKSB7XHJcbiAgICAgICAgICAgICAgaW50Q2hlY2sodlswXSwgLU1BWCwgLTEsIHApO1xyXG4gICAgICAgICAgICAgIGludENoZWNrKHZbMV0sIDEsIE1BWCwgcCk7XHJcbiAgICAgICAgICAgICAgTUlOX0VYUCA9IHZbMF07XHJcbiAgICAgICAgICAgICAgTUFYX0VYUCA9IHZbMV07XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgaW50Q2hlY2sodiwgLU1BWCwgTUFYLCBwKTtcclxuICAgICAgICAgICAgICBpZiAodikge1xyXG4gICAgICAgICAgICAgICAgTUlOX0VYUCA9IC0oTUFYX0VYUCA9IHYgPCAwID8gLXYgOiB2KTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyBwICsgJyBjYW5ub3QgYmUgemVybzogJyArIHYpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENSWVBUTyB7Ym9vbGVhbn0gdHJ1ZSBvciBmYWxzZS5cclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBDUllQVE8gbm90IHRydWUgb3IgZmFsc2U6IHt2fSdcclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBjcnlwdG8gdW5hdmFpbGFibGUnXHJcbiAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KHAgPSAnQ1JZUFRPJykpIHtcclxuICAgICAgICAgICAgdiA9IG9ialtwXTtcclxuICAgICAgICAgICAgaWYgKHYgPT09ICEhdikge1xyXG4gICAgICAgICAgICAgIGlmICh2KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNyeXB0byAhPSAndW5kZWZpbmVkJyAmJiBjcnlwdG8gJiZcclxuICAgICAgICAgICAgICAgICAoY3J5cHRvLmdldFJhbmRvbVZhbHVlcyB8fCBjcnlwdG8ucmFuZG9tQnl0ZXMpKSB7XHJcbiAgICAgICAgICAgICAgICAgIENSWVBUTyA9IHY7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBDUllQVE8gPSAhdjtcclxuICAgICAgICAgICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgICAgICAgIChiaWdudW1iZXJFcnJvciArICdjcnlwdG8gdW5hdmFpbGFibGUnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgQ1JZUFRPID0gdjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgICAgKGJpZ251bWJlckVycm9yICsgcCArICcgbm90IHRydWUgb3IgZmFsc2U6ICcgKyB2KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIE1PRFVMT19NT0RFIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gOSBpbmNsdXNpdmUuXHJcbiAgICAgICAgICAvLyAnW0JpZ051bWJlciBFcnJvcl0gTU9EVUxPX01PREUge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge3Z9J1xyXG4gICAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwID0gJ01PRFVMT19NT0RFJykpIHtcclxuICAgICAgICAgICAgdiA9IG9ialtwXTtcclxuICAgICAgICAgICAgaW50Q2hlY2sodiwgMCwgOSwgcCk7XHJcbiAgICAgICAgICAgIE1PRFVMT19NT0RFID0gdjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBQT1dfUFJFQ0lTSU9OIHtudW1iZXJ9IEludGVnZXIsIDAgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAgICAgIC8vICdbQmlnTnVtYmVyIEVycm9yXSBQT1dfUFJFQ0lTSU9OIHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZX06IHt2fSdcclxuICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocCA9ICdQT1dfUFJFQ0lTSU9OJykpIHtcclxuICAgICAgICAgICAgdiA9IG9ialtwXTtcclxuICAgICAgICAgICAgaW50Q2hlY2sodiwgMCwgTUFYLCBwKTtcclxuICAgICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IHY7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRk9STUFUIHtvYmplY3R9XHJcbiAgICAgICAgICAvLyAnW0JpZ051bWJlciBFcnJvcl0gRk9STUFUIG5vdCBhbiBvYmplY3Q6IHt2fSdcclxuICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocCA9ICdGT1JNQVQnKSkge1xyXG4gICAgICAgICAgICB2ID0gb2JqW3BdO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT0gJ29iamVjdCcpIEZPUk1BVCA9IHY7XHJcbiAgICAgICAgICAgIGVsc2UgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgIChiaWdudW1iZXJFcnJvciArIHAgKyAnIG5vdCBhbiBvYmplY3Q6ICcgKyB2KTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBBTFBIQUJFVCB7c3RyaW5nfVxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIEFMUEhBQkVUIGludmFsaWQ6IHt2fSdcclxuICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkocCA9ICdBTFBIQUJFVCcpKSB7XHJcbiAgICAgICAgICAgIHYgPSBvYmpbcF07XHJcblxyXG4gICAgICAgICAgICAvLyBEaXNhbGxvdyBpZiBvbmx5IG9uZSBjaGFyYWN0ZXIsXHJcbiAgICAgICAgICAgIC8vIG9yIGlmIGl0IGNvbnRhaW5zICcrJywgJy0nLCAnLicsIHdoaXRlc3BhY2UsIG9yIGEgcmVwZWF0ZWQgY2hhcmFjdGVyLlxyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT0gJ3N0cmluZycgJiYgIS9eLiR8WystLlxcc118KC4pLipcXDEvLnRlc3QodikpIHtcclxuICAgICAgICAgICAgICBBTFBIQUJFVCA9IHY7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAgICAgKGJpZ251bWJlckVycm9yICsgcCArICcgaW52YWxpZDogJyArIHYpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIE9iamVjdCBleHBlY3RlZDoge3Z9J1xyXG4gICAgICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyAnT2JqZWN0IGV4cGVjdGVkOiAnICsgb2JqKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB7XHJcbiAgICAgICAgREVDSU1BTF9QTEFDRVM6IERFQ0lNQUxfUExBQ0VTLFxyXG4gICAgICAgIFJPVU5ESU5HX01PREU6IFJPVU5ESU5HX01PREUsXHJcbiAgICAgICAgRVhQT05FTlRJQUxfQVQ6IFtUT19FWFBfTkVHLCBUT19FWFBfUE9TXSxcclxuICAgICAgICBSQU5HRTogW01JTl9FWFAsIE1BWF9FWFBdLFxyXG4gICAgICAgIENSWVBUTzogQ1JZUFRPLFxyXG4gICAgICAgIE1PRFVMT19NT0RFOiBNT0RVTE9fTU9ERSxcclxuICAgICAgICBQT1dfUFJFQ0lTSU9OOiBQT1dfUFJFQ0lTSU9OLFxyXG4gICAgICAgIEZPUk1BVDogRk9STUFULFxyXG4gICAgICAgIEFMUEhBQkVUOiBBTFBIQUJFVFxyXG4gICAgICB9O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHYgaXMgYSBCaWdOdW1iZXIgaW5zdGFuY2UsIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICAgKlxyXG4gICAgICogSWYgQmlnTnVtYmVyLkRFQlVHIGlzIHRydWUsIHRocm93IGlmIGEgQmlnTnVtYmVyIGluc3RhbmNlIGlzIG5vdCB3ZWxsLWZvcm1lZC5cclxuICAgICAqXHJcbiAgICAgKiB2IHthbnl9XHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEludmFsaWQgQmlnTnVtYmVyOiB7dn0nXHJcbiAgICAgKi9cclxuICAgIEJpZ051bWJlci5pc0JpZ051bWJlciA9IGZ1bmN0aW9uICh2KSB7XHJcbiAgICAgIGlmICghdiB8fCB2Ll9pc0JpZ051bWJlciAhPT0gdHJ1ZSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICBpZiAoIUJpZ051bWJlci5ERUJVRykgcmV0dXJuIHRydWU7XHJcblxyXG4gICAgICB2YXIgaSwgbixcclxuICAgICAgICBjID0gdi5jLFxyXG4gICAgICAgIGUgPSB2LmUsXHJcbiAgICAgICAgcyA9IHYucztcclxuXHJcbiAgICAgIG91dDogaWYgKHt9LnRvU3RyaW5nLmNhbGwoYykgPT0gJ1tvYmplY3QgQXJyYXldJykge1xyXG5cclxuICAgICAgICBpZiAoKHMgPT09IDEgfHwgcyA9PT0gLTEpICYmIGUgPj0gLU1BWCAmJiBlIDw9IE1BWCAmJiBlID09PSBtYXRoZmxvb3IoZSkpIHtcclxuXHJcbiAgICAgICAgICAvLyBJZiB0aGUgZmlyc3QgZWxlbWVudCBpcyB6ZXJvLCB0aGUgQmlnTnVtYmVyIHZhbHVlIG11c3QgYmUgemVyby5cclxuICAgICAgICAgIGlmIChjWzBdID09PSAwKSB7XHJcbiAgICAgICAgICAgIGlmIChlID09PSAwICYmIGMubGVuZ3RoID09PSAxKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgYnJlYWsgb3V0O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIENhbGN1bGF0ZSBudW1iZXIgb2YgZGlnaXRzIHRoYXQgY1swXSBzaG91bGQgaGF2ZSwgYmFzZWQgb24gdGhlIGV4cG9uZW50LlxyXG4gICAgICAgICAgaSA9IChlICsgMSkgJSBMT0dfQkFTRTtcclxuICAgICAgICAgIGlmIChpIDwgMSkgaSArPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgICAvLyBDYWxjdWxhdGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBjWzBdLlxyXG4gICAgICAgICAgLy9pZiAoTWF0aC5jZWlsKE1hdGgubG9nKGNbMF0gKyAxKSAvIE1hdGguTE4xMCkgPT0gaSkge1xyXG4gICAgICAgICAgaWYgKFN0cmluZyhjWzBdKS5sZW5ndGggPT0gaSkge1xyXG5cclxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICBuID0gY1tpXTtcclxuICAgICAgICAgICAgICBpZiAobiA8IDAgfHwgbiA+PSBCQVNFIHx8IG4gIT09IG1hdGhmbG9vcihuKSkgYnJlYWsgb3V0O1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyBMYXN0IGVsZW1lbnQgY2Fubm90IGJlIHplcm8sIHVubGVzcyBpdCBpcyB0aGUgb25seSBlbGVtZW50LlxyXG4gICAgICAgICAgICBpZiAobiAhPT0gMCkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgLy8gSW5maW5pdHkvTmFOXHJcbiAgICAgIH0gZWxzZSBpZiAoYyA9PT0gbnVsbCAmJiBlID09PSBudWxsICYmIChzID09PSBudWxsIHx8IHMgPT09IDEgfHwgcyA9PT0gLTEpKSB7XHJcbiAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgKGJpZ251bWJlckVycm9yICsgJ0ludmFsaWQgQmlnTnVtYmVyOiAnICsgdik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgbWF4aW11bSBvZiB0aGUgYXJndW1lbnRzLlxyXG4gICAgICpcclxuICAgICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIEJpZ051bWJlci5tYXhpbXVtID0gQmlnTnVtYmVyLm1heCA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIG1heE9yTWluKGFyZ3VtZW50cywgUC5sdCk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgbWluaW11bSBvZiB0aGUgYXJndW1lbnRzLlxyXG4gICAgICpcclxuICAgICAqIGFyZ3VtZW50cyB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9XHJcbiAgICAgKi9cclxuICAgIEJpZ051bWJlci5taW5pbXVtID0gQmlnTnVtYmVyLm1pbiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIG1heE9yTWluKGFyZ3VtZW50cywgUC5ndCk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aXRoIGEgcmFuZG9tIHZhbHVlIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiAwIGFuZCBsZXNzIHRoYW4gMSxcclxuICAgICAqIGFuZCB3aXRoIGRwLCBvciBERUNJTUFMX1BMQUNFUyBpZiBkcCBpcyBvbWl0dGVkLCBkZWNpbWFsIHBsYWNlcyAob3IgbGVzcyBpZiB0cmFpbGluZ1xyXG4gICAgICogemVyb3MgYXJlIHByb2R1Y2VkKS5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEFyZ3VtZW50IHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZX06IHtkcH0nXHJcbiAgICAgKiAnW0JpZ051bWJlciBFcnJvcl0gY3J5cHRvIHVuYXZhaWxhYmxlJ1xyXG4gICAgICovXHJcbiAgICBCaWdOdW1iZXIucmFuZG9tID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHBvdzJfNTMgPSAweDIwMDAwMDAwMDAwMDAwO1xyXG5cclxuICAgICAgLy8gUmV0dXJuIGEgNTMgYml0IGludGVnZXIgbiwgd2hlcmUgMCA8PSBuIDwgOTAwNzE5OTI1NDc0MDk5Mi5cclxuICAgICAgLy8gQ2hlY2sgaWYgTWF0aC5yYW5kb20oKSBwcm9kdWNlcyBtb3JlIHRoYW4gMzIgYml0cyBvZiByYW5kb21uZXNzLlxyXG4gICAgICAvLyBJZiBpdCBkb2VzLCBhc3N1bWUgYXQgbGVhc3QgNTMgYml0cyBhcmUgcHJvZHVjZWQsIG90aGVyd2lzZSBhc3N1bWUgYXQgbGVhc3QgMzAgYml0cy5cclxuICAgICAgLy8gMHg0MDAwMDAwMCBpcyAyXjMwLCAweDgwMDAwMCBpcyAyXjIzLCAweDFmZmZmZiBpcyAyXjIxIC0gMS5cclxuICAgICAgdmFyIHJhbmRvbTUzYml0SW50ID0gKE1hdGgucmFuZG9tKCkgKiBwb3cyXzUzKSAmIDB4MWZmZmZmXHJcbiAgICAgICA/IGZ1bmN0aW9uICgpIHsgcmV0dXJuIG1hdGhmbG9vcihNYXRoLnJhbmRvbSgpICogcG93Ml81Myk7IH1cclxuICAgICAgIDogZnVuY3Rpb24gKCkgeyByZXR1cm4gKChNYXRoLnJhbmRvbSgpICogMHg0MDAwMDAwMCB8IDApICogMHg4MDAwMDApICtcclxuICAgICAgICAgKE1hdGgucmFuZG9tKCkgKiAweDgwMDAwMCB8IDApOyB9O1xyXG5cclxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChkcCkge1xyXG4gICAgICAgIHZhciBhLCBiLCBlLCBrLCB2LFxyXG4gICAgICAgICAgaSA9IDAsXHJcbiAgICAgICAgICBjID0gW10sXHJcbiAgICAgICAgICByYW5kID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG5cclxuICAgICAgICBpZiAoZHAgPT0gbnVsbCkgZHAgPSBERUNJTUFMX1BMQUNFUztcclxuICAgICAgICBlbHNlIGludENoZWNrKGRwLCAwLCBNQVgpO1xyXG5cclxuICAgICAgICBrID0gbWF0aGNlaWwoZHAgLyBMT0dfQkFTRSk7XHJcblxyXG4gICAgICAgIGlmIChDUllQVE8pIHtcclxuXHJcbiAgICAgICAgICAvLyBCcm93c2VycyBzdXBwb3J0aW5nIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMuXHJcbiAgICAgICAgICBpZiAoY3J5cHRvLmdldFJhbmRvbVZhbHVlcykge1xyXG5cclxuICAgICAgICAgICAgYSA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KGsgKj0gMikpO1xyXG5cclxuICAgICAgICAgICAgZm9yICg7IGkgPCBrOykge1xyXG5cclxuICAgICAgICAgICAgICAvLyA1MyBiaXRzOlxyXG4gICAgICAgICAgICAgIC8vICgoTWF0aC5wb3coMiwgMzIpIC0gMSkgKiBNYXRoLnBvdygyLCAyMSkpLnRvU3RyaW5nKDIpXHJcbiAgICAgICAgICAgICAgLy8gMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMDAwMDAgMDAwMDAwMDAgMDAwMDAwMDBcclxuICAgICAgICAgICAgICAvLyAoKE1hdGgucG93KDIsIDMyKSAtIDEpID4+PiAxMSkudG9TdHJpbmcoMilcclxuICAgICAgICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAxMTExMSAxMTExMTExMSAxMTExMTExMVxyXG4gICAgICAgICAgICAgIC8vIDB4MjAwMDAgaXMgMl4yMS5cclxuICAgICAgICAgICAgICB2ID0gYVtpXSAqIDB4MjAwMDAgKyAoYVtpICsgMV0gPj4+IDExKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gUmVqZWN0aW9uIHNhbXBsaW5nOlxyXG4gICAgICAgICAgICAgIC8vIDAgPD0gdiA8IDkwMDcxOTkyNTQ3NDA5OTJcclxuICAgICAgICAgICAgICAvLyBQcm9iYWJpbGl0eSB0aGF0IHYgPj0gOWUxNSwgaXNcclxuICAgICAgICAgICAgICAvLyA3MTk5MjU0NzQwOTkyIC8gOTAwNzE5OTI1NDc0MDk5MiB+PSAwLjAwMDgsIGkuZS4gMSBpbiAxMjUxXHJcbiAgICAgICAgICAgICAgaWYgKHYgPj0gOWUxNSkge1xyXG4gICAgICAgICAgICAgICAgYiA9IGNyeXB0by5nZXRSYW5kb21WYWx1ZXMobmV3IFVpbnQzMkFycmF5KDIpKTtcclxuICAgICAgICAgICAgICAgIGFbaV0gPSBiWzBdO1xyXG4gICAgICAgICAgICAgICAgYVtpICsgMV0gPSBiWzFdO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gMCA8PSB2IDw9IDg5OTk5OTk5OTk5OTk5OTlcclxuICAgICAgICAgICAgICAgIC8vIDAgPD0gKHYgJSAxZTE0KSA8PSA5OTk5OTk5OTk5OTk5OVxyXG4gICAgICAgICAgICAgICAgYy5wdXNoKHYgJSAxZTE0KTtcclxuICAgICAgICAgICAgICAgIGkgKz0gMjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSA9IGsgLyAyO1xyXG5cclxuICAgICAgICAgIC8vIE5vZGUuanMgc3VwcG9ydGluZyBjcnlwdG8ucmFuZG9tQnl0ZXMuXHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGNyeXB0by5yYW5kb21CeXRlcykge1xyXG5cclxuICAgICAgICAgICAgLy8gYnVmZmVyXHJcbiAgICAgICAgICAgIGEgPSBjcnlwdG8ucmFuZG9tQnl0ZXMoayAqPSA3KTtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyBpIDwgazspIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gMHgxMDAwMDAwMDAwMDAwIGlzIDJeNDgsIDB4MTAwMDAwMDAwMDAgaXMgMl40MFxyXG4gICAgICAgICAgICAgIC8vIDB4MTAwMDAwMDAwIGlzIDJeMzIsIDB4MTAwMDAwMCBpcyAyXjI0XHJcbiAgICAgICAgICAgICAgLy8gMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTEgMTExMTExMTFcclxuICAgICAgICAgICAgICAvLyAwIDw9IHYgPCA5MDA3MTk5MjU0NzQwOTkyXHJcbiAgICAgICAgICAgICAgdiA9ICgoYVtpXSAmIDMxKSAqIDB4MTAwMDAwMDAwMDAwMCkgKyAoYVtpICsgMV0gKiAweDEwMDAwMDAwMDAwKSArXHJcbiAgICAgICAgICAgICAgICAgKGFbaSArIDJdICogMHgxMDAwMDAwMDApICsgKGFbaSArIDNdICogMHgxMDAwMDAwKSArXHJcbiAgICAgICAgICAgICAgICAgKGFbaSArIDRdIDw8IDE2KSArIChhW2kgKyA1XSA8PCA4KSArIGFbaSArIDZdO1xyXG5cclxuICAgICAgICAgICAgICBpZiAodiA+PSA5ZTE1KSB7XHJcbiAgICAgICAgICAgICAgICBjcnlwdG8ucmFuZG9tQnl0ZXMoNykuY29weShhLCBpKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIDAgPD0gKHYgJSAxZTE0KSA8PSA5OTk5OTk5OTk5OTk5OVxyXG4gICAgICAgICAgICAgICAgYy5wdXNoKHYgJSAxZTE0KTtcclxuICAgICAgICAgICAgICAgIGkgKz0gNztcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaSA9IGsgLyA3O1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgQ1JZUFRPID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyAnY3J5cHRvIHVuYXZhaWxhYmxlJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBVc2UgTWF0aC5yYW5kb20uXHJcbiAgICAgICAgaWYgKCFDUllQVE8pIHtcclxuXHJcbiAgICAgICAgICBmb3IgKDsgaSA8IGs7KSB7XHJcbiAgICAgICAgICAgIHYgPSByYW5kb201M2JpdEludCgpO1xyXG4gICAgICAgICAgICBpZiAodiA8IDllMTUpIGNbaSsrXSA9IHYgJSAxZTE0O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgayA9IGNbLS1pXTtcclxuICAgICAgICBkcCAlPSBMT0dfQkFTRTtcclxuXHJcbiAgICAgICAgLy8gQ29udmVydCB0cmFpbGluZyBkaWdpdHMgdG8gemVyb3MgYWNjb3JkaW5nIHRvIGRwLlxyXG4gICAgICAgIGlmIChrICYmIGRwKSB7XHJcbiAgICAgICAgICB2ID0gUE9XU19URU5bTE9HX0JBU0UgLSBkcF07XHJcbiAgICAgICAgICBjW2ldID0gbWF0aGZsb29yKGsgLyB2KSAqIHY7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgZWxlbWVudHMgd2hpY2ggYXJlIHplcm8uXHJcbiAgICAgICAgZm9yICg7IGNbaV0gPT09IDA7IGMucG9wKCksIGktLSk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICBjID0gW2UgPSAwXTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIC8vIFJlbW92ZSBsZWFkaW5nIGVsZW1lbnRzIHdoaWNoIGFyZSB6ZXJvIGFuZCBhZGp1c3QgZXhwb25lbnQgYWNjb3JkaW5nbHkuXHJcbiAgICAgICAgICBmb3IgKGUgPSAtMSA7IGNbMF0gPT09IDA7IGMuc3BsaWNlKDAsIDEpLCBlIC09IExPR19CQVNFKTtcclxuXHJcbiAgICAgICAgICAvLyBDb3VudCB0aGUgZGlnaXRzIG9mIHRoZSBmaXJzdCBlbGVtZW50IG9mIGMgdG8gZGV0ZXJtaW5lIGxlYWRpbmcgemVyb3MsIGFuZC4uLlxyXG4gICAgICAgICAgZm9yIChpID0gMSwgdiA9IGNbMF07IHYgPj0gMTA7IHYgLz0gMTAsIGkrKyk7XHJcblxyXG4gICAgICAgICAgLy8gYWRqdXN0IHRoZSBleHBvbmVudCBhY2NvcmRpbmdseS5cclxuICAgICAgICAgIGlmIChpIDwgTE9HX0JBU0UpIGUgLT0gTE9HX0JBU0UgLSBpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmFuZC5lID0gZTtcclxuICAgICAgICByYW5kLmMgPSBjO1xyXG4gICAgICAgIHJldHVybiByYW5kO1xyXG4gICAgICB9O1xyXG4gICAgfSkoKTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgc3VtIG9mIHRoZSBhcmd1bWVudHMuXHJcbiAgICAgKlxyXG4gICAgICogYXJndW1lbnRzIHtudW1iZXJ8c3RyaW5nfEJpZ051bWJlcn1cclxuICAgICAqL1xyXG4gICAgQmlnTnVtYmVyLnN1bSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGkgPSAxLFxyXG4gICAgICAgIGFyZ3MgPSBhcmd1bWVudHMsXHJcbiAgICAgICAgc3VtID0gbmV3IEJpZ051bWJlcihhcmdzWzBdKTtcclxuICAgICAgZm9yICg7IGkgPCBhcmdzLmxlbmd0aDspIHN1bSA9IHN1bS5wbHVzKGFyZ3NbaSsrXSk7XHJcbiAgICAgIHJldHVybiBzdW07XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvLyBQUklWQVRFIEZVTkNUSU9OU1xyXG5cclxuXHJcbiAgICAvLyBDYWxsZWQgYnkgQmlnTnVtYmVyIGFuZCBCaWdOdW1iZXIucHJvdG90eXBlLnRvU3RyaW5nLlxyXG4gICAgY29udmVydEJhc2UgPSAoZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgZGVjaW1hbCA9ICcwMTIzNDU2Nzg5JztcclxuXHJcbiAgICAgIC8qXHJcbiAgICAgICAqIENvbnZlcnQgc3RyaW5nIG9mIGJhc2VJbiB0byBhbiBhcnJheSBvZiBudW1iZXJzIG9mIGJhc2VPdXQuXHJcbiAgICAgICAqIEVnLiB0b0Jhc2VPdXQoJzI1NScsIDEwLCAxNikgcmV0dXJucyBbMTUsIDE1XS5cclxuICAgICAgICogRWcuIHRvQmFzZU91dCgnZmYnLCAxNiwgMTApIHJldHVybnMgWzIsIDUsIDVdLlxyXG4gICAgICAgKi9cclxuICAgICAgZnVuY3Rpb24gdG9CYXNlT3V0KHN0ciwgYmFzZUluLCBiYXNlT3V0LCBhbHBoYWJldCkge1xyXG4gICAgICAgIHZhciBqLFxyXG4gICAgICAgICAgYXJyID0gWzBdLFxyXG4gICAgICAgICAgYXJyTCxcclxuICAgICAgICAgIGkgPSAwLFxyXG4gICAgICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgICAgZm9yICg7IGkgPCBsZW47KSB7XHJcbiAgICAgICAgICBmb3IgKGFyckwgPSBhcnIubGVuZ3RoOyBhcnJMLS07IGFyclthcnJMXSAqPSBiYXNlSW4pO1xyXG5cclxuICAgICAgICAgIGFyclswXSArPSBhbHBoYWJldC5pbmRleE9mKHN0ci5jaGFyQXQoaSsrKSk7XHJcblxyXG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGFyci5sZW5ndGg7IGorKykge1xyXG5cclxuICAgICAgICAgICAgaWYgKGFycltqXSA+IGJhc2VPdXQgLSAxKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGFycltqICsgMV0gPT0gbnVsbCkgYXJyW2ogKyAxXSA9IDA7XHJcbiAgICAgICAgICAgICAgYXJyW2ogKyAxXSArPSBhcnJbal0gLyBiYXNlT3V0IHwgMDtcclxuICAgICAgICAgICAgICBhcnJbal0gJT0gYmFzZU91dDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGFyci5yZXZlcnNlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIENvbnZlcnQgYSBudW1lcmljIHN0cmluZyBvZiBiYXNlSW4gdG8gYSBudW1lcmljIHN0cmluZyBvZiBiYXNlT3V0LlxyXG4gICAgICAvLyBJZiB0aGUgY2FsbGVyIGlzIHRvU3RyaW5nLCB3ZSBhcmUgY29udmVydGluZyBmcm9tIGJhc2UgMTAgdG8gYmFzZU91dC5cclxuICAgICAgLy8gSWYgdGhlIGNhbGxlciBpcyBCaWdOdW1iZXIsIHdlIGFyZSBjb252ZXJ0aW5nIGZyb20gYmFzZUluIHRvIGJhc2UgMTAuXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoc3RyLCBiYXNlSW4sIGJhc2VPdXQsIHNpZ24sIGNhbGxlcklzVG9TdHJpbmcpIHtcclxuICAgICAgICB2YXIgYWxwaGFiZXQsIGQsIGUsIGssIHIsIHgsIHhjLCB5LFxyXG4gICAgICAgICAgaSA9IHN0ci5pbmRleE9mKCcuJyksXHJcbiAgICAgICAgICBkcCA9IERFQ0lNQUxfUExBQ0VTLFxyXG4gICAgICAgICAgcm0gPSBST1VORElOR19NT0RFO1xyXG5cclxuICAgICAgICAvLyBOb24taW50ZWdlci5cclxuICAgICAgICBpZiAoaSA+PSAwKSB7XHJcbiAgICAgICAgICBrID0gUE9XX1BSRUNJU0lPTjtcclxuXHJcbiAgICAgICAgICAvLyBVbmxpbWl0ZWQgcHJlY2lzaW9uLlxyXG4gICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IDA7XHJcbiAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZSgnLicsICcnKTtcclxuICAgICAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKGJhc2VJbik7XHJcbiAgICAgICAgICB4ID0geS5wb3coc3RyLmxlbmd0aCAtIGkpO1xyXG4gICAgICAgICAgUE9XX1BSRUNJU0lPTiA9IGs7XHJcblxyXG4gICAgICAgICAgLy8gQ29udmVydCBzdHIgYXMgaWYgYW4gaW50ZWdlciwgdGhlbiByZXN0b3JlIHRoZSBmcmFjdGlvbiBwYXJ0IGJ5IGRpdmlkaW5nIHRoZVxyXG4gICAgICAgICAgLy8gcmVzdWx0IGJ5IGl0cyBiYXNlIHJhaXNlZCB0byBhIHBvd2VyLlxyXG5cclxuICAgICAgICAgIHkuYyA9IHRvQmFzZU91dCh0b0ZpeGVkUG9pbnQoY29lZmZUb1N0cmluZyh4LmMpLCB4LmUsICcwJyksXHJcbiAgICAgICAgICAgMTAsIGJhc2VPdXQsIGRlY2ltYWwpO1xyXG4gICAgICAgICAgeS5lID0geS5jLmxlbmd0aDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIENvbnZlcnQgdGhlIG51bWJlciBhcyBpbnRlZ2VyLlxyXG5cclxuICAgICAgICB4YyA9IHRvQmFzZU91dChzdHIsIGJhc2VJbiwgYmFzZU91dCwgY2FsbGVySXNUb1N0cmluZ1xyXG4gICAgICAgICA/IChhbHBoYWJldCA9IEFMUEhBQkVULCBkZWNpbWFsKVxyXG4gICAgICAgICA6IChhbHBoYWJldCA9IGRlY2ltYWwsIEFMUEhBQkVUKSk7XHJcblxyXG4gICAgICAgIC8vIHhjIG5vdyByZXByZXNlbnRzIHN0ciBhcyBhbiBpbnRlZ2VyIGFuZCBjb252ZXJ0ZWQgdG8gYmFzZU91dC4gZSBpcyB0aGUgZXhwb25lbnQuXHJcbiAgICAgICAgZSA9IGsgPSB4Yy5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKDsgeGNbLS1rXSA9PSAwOyB4Yy5wb3AoKSk7XHJcblxyXG4gICAgICAgIC8vIFplcm8/XHJcbiAgICAgICAgaWYgKCF4Y1swXSkgcmV0dXJuIGFscGhhYmV0LmNoYXJBdCgwKTtcclxuXHJcbiAgICAgICAgLy8gRG9lcyBzdHIgcmVwcmVzZW50IGFuIGludGVnZXI/IElmIHNvLCBubyBuZWVkIGZvciB0aGUgZGl2aXNpb24uXHJcbiAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAtLWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHguYyA9IHhjO1xyXG4gICAgICAgICAgeC5lID0gZTtcclxuXHJcbiAgICAgICAgICAvLyBUaGUgc2lnbiBpcyBuZWVkZWQgZm9yIGNvcnJlY3Qgcm91bmRpbmcuXHJcbiAgICAgICAgICB4LnMgPSBzaWduO1xyXG4gICAgICAgICAgeCA9IGRpdih4LCB5LCBkcCwgcm0sIGJhc2VPdXQpO1xyXG4gICAgICAgICAgeGMgPSB4LmM7XHJcbiAgICAgICAgICByID0geC5yO1xyXG4gICAgICAgICAgZSA9IHguZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIHhjIG5vdyByZXByZXNlbnRzIHN0ciBjb252ZXJ0ZWQgdG8gYmFzZU91dC5cclxuXHJcbiAgICAgICAgLy8gVEhlIGluZGV4IG9mIHRoZSByb3VuZGluZyBkaWdpdC5cclxuICAgICAgICBkID0gZSArIGRwICsgMTtcclxuXHJcbiAgICAgICAgLy8gVGhlIHJvdW5kaW5nIGRpZ2l0OiB0aGUgZGlnaXQgdG8gdGhlIHJpZ2h0IG9mIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgIGkgPSB4Y1tkXTtcclxuXHJcbiAgICAgICAgLy8gTG9vayBhdCB0aGUgcm91bmRpbmcgZGlnaXRzIGFuZCBtb2RlIHRvIGRldGVybWluZSB3aGV0aGVyIHRvIHJvdW5kIHVwLlxyXG5cclxuICAgICAgICBrID0gYmFzZU91dCAvIDI7XHJcbiAgICAgICAgciA9IHIgfHwgZCA8IDAgfHwgeGNbZCArIDFdICE9IG51bGw7XHJcblxyXG4gICAgICAgIHIgPSBybSA8IDQgPyAoaSAhPSBudWxsIHx8IHIpICYmIChybSA9PSAwIHx8IHJtID09ICh4LnMgPCAwID8gMyA6IDIpKVxyXG4gICAgICAgICAgICAgIDogaSA+IGsgfHwgaSA9PSBrICYmKHJtID09IDQgfHwgciB8fCBybSA9PSA2ICYmIHhjW2QgLSAxXSAmIDEgfHxcclxuICAgICAgICAgICAgICAgcm0gPT0gKHgucyA8IDAgPyA4IDogNykpO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgaW5kZXggb2YgdGhlIHJvdW5kaW5nIGRpZ2l0IGlzIG5vdCBncmVhdGVyIHRoYW4gemVybywgb3IgeGMgcmVwcmVzZW50c1xyXG4gICAgICAgIC8vIHplcm8sIHRoZW4gdGhlIHJlc3VsdCBvZiB0aGUgYmFzZSBjb252ZXJzaW9uIGlzIHplcm8gb3IsIGlmIHJvdW5kaW5nIHVwLCBhIHZhbHVlXHJcbiAgICAgICAgLy8gc3VjaCBhcyAwLjAwMDAxLlxyXG4gICAgICAgIGlmIChkIDwgMSB8fCAheGNbMF0pIHtcclxuXHJcbiAgICAgICAgICAvLyAxXi1kcCBvciAwXHJcbiAgICAgICAgICBzdHIgPSByID8gdG9GaXhlZFBvaW50KGFscGhhYmV0LmNoYXJBdCgxKSwgLWRwLCBhbHBoYWJldC5jaGFyQXQoMCkpIDogYWxwaGFiZXQuY2hhckF0KDApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgICAgLy8gVHJ1bmNhdGUgeGMgdG8gdGhlIHJlcXVpcmVkIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAgICAgIHhjLmxlbmd0aCA9IGQ7XHJcblxyXG4gICAgICAgICAgLy8gUm91bmQgdXA/XHJcbiAgICAgICAgICBpZiAocikge1xyXG5cclxuICAgICAgICAgICAgLy8gUm91bmRpbmcgdXAgbWF5IG1lYW4gdGhlIHByZXZpb3VzIGRpZ2l0IGhhcyB0byBiZSByb3VuZGVkIHVwIGFuZCBzbyBvbi5cclxuICAgICAgICAgICAgZm9yICgtLWJhc2VPdXQ7ICsreGNbLS1kXSA+IGJhc2VPdXQ7KSB7XHJcbiAgICAgICAgICAgICAgeGNbZF0gPSAwO1xyXG5cclxuICAgICAgICAgICAgICBpZiAoIWQpIHtcclxuICAgICAgICAgICAgICAgICsrZTtcclxuICAgICAgICAgICAgICAgIHhjID0gWzFdLmNvbmNhdCh4Yyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gRGV0ZXJtaW5lIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgZm9yIChrID0geGMubGVuZ3RoOyAheGNbLS1rXTspO1xyXG5cclxuICAgICAgICAgIC8vIEUuZy4gWzQsIDExLCAxNV0gYmVjb21lcyA0YmYuXHJcbiAgICAgICAgICBmb3IgKGkgPSAwLCBzdHIgPSAnJzsgaSA8PSBrOyBzdHIgKz0gYWxwaGFiZXQuY2hhckF0KHhjW2krK10pKTtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgbGVhZGluZyB6ZXJvcywgZGVjaW1hbCBwb2ludCBhbmQgdHJhaWxpbmcgemVyb3MgYXMgcmVxdWlyZWQuXHJcbiAgICAgICAgICBzdHIgPSB0b0ZpeGVkUG9pbnQoc3RyLCBlLCBhbHBoYWJldC5jaGFyQXQoMCkpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVGhlIGNhbGxlciB3aWxsIGFkZCB0aGUgc2lnbi5cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICB9O1xyXG4gICAgfSkoKTtcclxuXHJcblxyXG4gICAgLy8gUGVyZm9ybSBkaXZpc2lvbiBpbiB0aGUgc3BlY2lmaWVkIGJhc2UuIENhbGxlZCBieSBkaXYgYW5kIGNvbnZlcnRCYXNlLlxyXG4gICAgZGl2ID0gKGZ1bmN0aW9uICgpIHtcclxuXHJcbiAgICAgIC8vIEFzc3VtZSBub24temVybyB4IGFuZCBrLlxyXG4gICAgICBmdW5jdGlvbiBtdWx0aXBseSh4LCBrLCBiYXNlKSB7XHJcbiAgICAgICAgdmFyIG0sIHRlbXAsIHhsbywgeGhpLFxyXG4gICAgICAgICAgY2FycnkgPSAwLFxyXG4gICAgICAgICAgaSA9IHgubGVuZ3RoLFxyXG4gICAgICAgICAga2xvID0gayAlIFNRUlRfQkFTRSxcclxuICAgICAgICAgIGtoaSA9IGsgLyBTUVJUX0JBU0UgfCAwO1xyXG5cclxuICAgICAgICBmb3IgKHggPSB4LnNsaWNlKCk7IGktLTspIHtcclxuICAgICAgICAgIHhsbyA9IHhbaV0gJSBTUVJUX0JBU0U7XHJcbiAgICAgICAgICB4aGkgPSB4W2ldIC8gU1FSVF9CQVNFIHwgMDtcclxuICAgICAgICAgIG0gPSBraGkgKiB4bG8gKyB4aGkgKiBrbG87XHJcbiAgICAgICAgICB0ZW1wID0ga2xvICogeGxvICsgKChtICUgU1FSVF9CQVNFKSAqIFNRUlRfQkFTRSkgKyBjYXJyeTtcclxuICAgICAgICAgIGNhcnJ5ID0gKHRlbXAgLyBiYXNlIHwgMCkgKyAobSAvIFNRUlRfQkFTRSB8IDApICsga2hpICogeGhpO1xyXG4gICAgICAgICAgeFtpXSA9IHRlbXAgJSBiYXNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGNhcnJ5KSB4ID0gW2NhcnJ5XS5jb25jYXQoeCk7XHJcblxyXG4gICAgICAgIHJldHVybiB4O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBjb21wYXJlKGEsIGIsIGFMLCBiTCkge1xyXG4gICAgICAgIHZhciBpLCBjbXA7XHJcblxyXG4gICAgICAgIGlmIChhTCAhPSBiTCkge1xyXG4gICAgICAgICAgY21wID0gYUwgPiBiTCA/IDEgOiAtMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgIGZvciAoaSA9IGNtcCA9IDA7IGkgPCBhTDsgaSsrKSB7XHJcblxyXG4gICAgICAgICAgICBpZiAoYVtpXSAhPSBiW2ldKSB7XHJcbiAgICAgICAgICAgICAgY21wID0gYVtpXSA+IGJbaV0gPyAxIDogLTE7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBjbXA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHN1YnRyYWN0KGEsIGIsIGFMLCBiYXNlKSB7XHJcbiAgICAgICAgdmFyIGkgPSAwO1xyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCBiIGZyb20gYS5cclxuICAgICAgICBmb3IgKDsgYUwtLTspIHtcclxuICAgICAgICAgIGFbYUxdIC09IGk7XHJcbiAgICAgICAgICBpID0gYVthTF0gPCBiW2FMXSA/IDEgOiAwO1xyXG4gICAgICAgICAgYVthTF0gPSBpICogYmFzZSArIGFbYUxdIC0gYlthTF07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKDsgIWFbMF0gJiYgYS5sZW5ndGggPiAxOyBhLnNwbGljZSgwLCAxKSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHg6IGRpdmlkZW5kLCB5OiBkaXZpc29yLlxyXG4gICAgICByZXR1cm4gZnVuY3Rpb24gKHgsIHksIGRwLCBybSwgYmFzZSkge1xyXG4gICAgICAgIHZhciBjbXAsIGUsIGksIG1vcmUsIG4sIHByb2QsIHByb2RMLCBxLCBxYywgcmVtLCByZW1MLCByZW0wLCB4aSwgeEwsIHljMCxcclxuICAgICAgICAgIHlMLCB5eixcclxuICAgICAgICAgIHMgPSB4LnMgPT0geS5zID8gMSA6IC0xLFxyXG4gICAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgICB5YyA9IHkuYztcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIE5hTiwgSW5maW5pdHkgb3IgMD9cclxuICAgICAgICBpZiAoIXhjIHx8ICF4Y1swXSB8fCAheWMgfHwgIXljWzBdKSB7XHJcblxyXG4gICAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoXHJcblxyXG4gICAgICAgICAgIC8vIFJldHVybiBOYU4gaWYgZWl0aGVyIE5hTiwgb3IgYm90aCBJbmZpbml0eSBvciAwLlxyXG4gICAgICAgICAgICF4LnMgfHwgIXkucyB8fCAoeGMgPyB5YyAmJiB4Y1swXSA9PSB5Y1swXSA6ICF5YykgPyBOYU4gOlxyXG5cclxuICAgICAgICAgICAgLy8gUmV0dXJuIMKxMCBpZiB4IGlzIMKxMCBvciB5IGlzIMKxSW5maW5pdHksIG9yIHJldHVybiDCsUluZmluaXR5IGFzIHkgaXMgwrEwLlxyXG4gICAgICAgICAgICB4YyAmJiB4Y1swXSA9PSAwIHx8ICF5YyA/IHMgKiAwIDogcyAvIDBcclxuICAgICAgICAgKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHEgPSBuZXcgQmlnTnVtYmVyKHMpO1xyXG4gICAgICAgIHFjID0gcS5jID0gW107XHJcbiAgICAgICAgZSA9IHguZSAtIHkuZTtcclxuICAgICAgICBzID0gZHAgKyBlICsgMTtcclxuXHJcbiAgICAgICAgaWYgKCFiYXNlKSB7XHJcbiAgICAgICAgICBiYXNlID0gQkFTRTtcclxuICAgICAgICAgIGUgPSBiaXRGbG9vcih4LmUgLyBMT0dfQkFTRSkgLSBiaXRGbG9vcih5LmUgLyBMT0dfQkFTRSk7XHJcbiAgICAgICAgICBzID0gcyAvIExPR19CQVNFIHwgMDtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlc3VsdCBleHBvbmVudCBtYXkgYmUgb25lIGxlc3MgdGhlbiB0aGUgY3VycmVudCB2YWx1ZSBvZiBlLlxyXG4gICAgICAgIC8vIFRoZSBjb2VmZmljaWVudHMgb2YgdGhlIEJpZ051bWJlcnMgZnJvbSBjb252ZXJ0QmFzZSBtYXkgaGF2ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgICBmb3IgKGkgPSAwOyB5Y1tpXSA9PSAoeGNbaV0gfHwgMCk7IGkrKyk7XHJcblxyXG4gICAgICAgIGlmICh5Y1tpXSA+ICh4Y1tpXSB8fCAwKSkgZS0tO1xyXG5cclxuICAgICAgICBpZiAocyA8IDApIHtcclxuICAgICAgICAgIHFjLnB1c2goMSk7XHJcbiAgICAgICAgICBtb3JlID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeEwgPSB4Yy5sZW5ndGg7XHJcbiAgICAgICAgICB5TCA9IHljLmxlbmd0aDtcclxuICAgICAgICAgIGkgPSAwO1xyXG4gICAgICAgICAgcyArPSAyO1xyXG5cclxuICAgICAgICAgIC8vIE5vcm1hbGlzZSB4YyBhbmQgeWMgc28gaGlnaGVzdCBvcmRlciBkaWdpdCBvZiB5YyBpcyA+PSBiYXNlIC8gMi5cclxuXHJcbiAgICAgICAgICBuID0gbWF0aGZsb29yKGJhc2UgLyAoeWNbMF0gKyAxKSk7XHJcblxyXG4gICAgICAgICAgLy8gTm90IG5lY2Vzc2FyeSwgYnV0IHRvIGhhbmRsZSBvZGQgYmFzZXMgd2hlcmUgeWNbMF0gPT0gKGJhc2UgLyAyKSAtIDEuXHJcbiAgICAgICAgICAvLyBpZiAobiA+IDEgfHwgbisrID09IDEgJiYgeWNbMF0gPCBiYXNlIC8gMikge1xyXG4gICAgICAgICAgaWYgKG4gPiAxKSB7XHJcbiAgICAgICAgICAgIHljID0gbXVsdGlwbHkoeWMsIG4sIGJhc2UpO1xyXG4gICAgICAgICAgICB4YyA9IG11bHRpcGx5KHhjLCBuLCBiYXNlKTtcclxuICAgICAgICAgICAgeUwgPSB5Yy5sZW5ndGg7XHJcbiAgICAgICAgICAgIHhMID0geGMubGVuZ3RoO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIHhpID0geUw7XHJcbiAgICAgICAgICByZW0gPSB4Yy5zbGljZSgwLCB5TCk7XHJcbiAgICAgICAgICByZW1MID0gcmVtLmxlbmd0aDtcclxuXHJcbiAgICAgICAgICAvLyBBZGQgemVyb3MgdG8gbWFrZSByZW1haW5kZXIgYXMgbG9uZyBhcyBkaXZpc29yLlxyXG4gICAgICAgICAgZm9yICg7IHJlbUwgPCB5TDsgcmVtW3JlbUwrK10gPSAwKTtcclxuICAgICAgICAgIHl6ID0geWMuc2xpY2UoKTtcclxuICAgICAgICAgIHl6ID0gWzBdLmNvbmNhdCh5eik7XHJcbiAgICAgICAgICB5YzAgPSB5Y1swXTtcclxuICAgICAgICAgIGlmICh5Y1sxXSA+PSBiYXNlIC8gMikgeWMwKys7XHJcbiAgICAgICAgICAvLyBOb3QgbmVjZXNzYXJ5LCBidXQgdG8gcHJldmVudCB0cmlhbCBkaWdpdCBuID4gYmFzZSwgd2hlbiB1c2luZyBiYXNlIDMuXHJcbiAgICAgICAgICAvLyBlbHNlIGlmIChiYXNlID09IDMgJiYgeWMwID09IDEpIHljMCA9IDEgKyAxZS0xNTtcclxuXHJcbiAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgIG4gPSAwO1xyXG5cclxuICAgICAgICAgICAgLy8gQ29tcGFyZSBkaXZpc29yIGFuZCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgIGNtcCA9IGNvbXBhcmUoeWMsIHJlbSwgeUwsIHJlbUwpO1xyXG5cclxuICAgICAgICAgICAgLy8gSWYgZGl2aXNvciA8IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgaWYgKGNtcCA8IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gQ2FsY3VsYXRlIHRyaWFsIGRpZ2l0LCBuLlxyXG5cclxuICAgICAgICAgICAgICByZW0wID0gcmVtWzBdO1xyXG4gICAgICAgICAgICAgIGlmICh5TCAhPSByZW1MKSByZW0wID0gcmVtMCAqIGJhc2UgKyAocmVtWzFdIHx8IDApO1xyXG5cclxuICAgICAgICAgICAgICAvLyBuIGlzIGhvdyBtYW55IHRpbWVzIHRoZSBkaXZpc29yIGdvZXMgaW50byB0aGUgY3VycmVudCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgbiA9IG1hdGhmbG9vcihyZW0wIC8geWMwKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gIEFsZ29yaXRobTpcclxuICAgICAgICAgICAgICAvLyAgcHJvZHVjdCA9IGRpdmlzb3IgbXVsdGlwbGllZCBieSB0cmlhbCBkaWdpdCAobikuXHJcbiAgICAgICAgICAgICAgLy8gIENvbXBhcmUgcHJvZHVjdCBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgIC8vICBJZiBwcm9kdWN0IGlzIGdyZWF0ZXIgdGhhbiByZW1haW5kZXI6XHJcbiAgICAgICAgICAgICAgLy8gICAgU3VidHJhY3QgZGl2aXNvciBmcm9tIHByb2R1Y3QsIGRlY3JlbWVudCB0cmlhbCBkaWdpdC5cclxuICAgICAgICAgICAgICAvLyAgU3VidHJhY3QgcHJvZHVjdCBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAvLyAgSWYgcHJvZHVjdCB3YXMgbGVzcyB0aGFuIHJlbWFpbmRlciBhdCB0aGUgbGFzdCBjb21wYXJlOlxyXG4gICAgICAgICAgICAgIC8vICAgIENvbXBhcmUgbmV3IHJlbWFpbmRlciBhbmQgZGl2aXNvci5cclxuICAgICAgICAgICAgICAvLyAgICBJZiByZW1haW5kZXIgaXMgZ3JlYXRlciB0aGFuIGRpdmlzb3I6XHJcbiAgICAgICAgICAgICAgLy8gICAgICBTdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLCBpbmNyZW1lbnQgdHJpYWwgZGlnaXQuXHJcblxyXG4gICAgICAgICAgICAgIGlmIChuID4gMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG4gbWF5IGJlID4gYmFzZSBvbmx5IHdoZW4gYmFzZSBpcyAzLlxyXG4gICAgICAgICAgICAgICAgaWYgKG4gPj0gYmFzZSkgbiA9IGJhc2UgLSAxO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIHByb2R1Y3QgPSBkaXZpc29yICogdHJpYWwgZGlnaXQuXHJcbiAgICAgICAgICAgICAgICBwcm9kID0gbXVsdGlwbHkoeWMsIG4sIGJhc2UpO1xyXG4gICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgcHJvZHVjdCBhbmQgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgcHJvZHVjdCA+IHJlbWFpbmRlciB0aGVuIHRyaWFsIGRpZ2l0IG4gdG9vIGhpZ2guXHJcbiAgICAgICAgICAgICAgICAvLyBuIGlzIDEgdG9vIGhpZ2ggYWJvdXQgNSUgb2YgdGhlIHRpbWUsIGFuZCBpcyBub3Qga25vd24gdG8gaGF2ZVxyXG4gICAgICAgICAgICAgICAgLy8gZXZlciBiZWVuIG1vcmUgdGhhbiAxIHRvbyBoaWdoLlxyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNvbXBhcmUocHJvZCwgcmVtLCBwcm9kTCwgcmVtTCkgPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICBuLS07XHJcblxyXG4gICAgICAgICAgICAgICAgICAvLyBTdWJ0cmFjdCBkaXZpc29yIGZyb20gcHJvZHVjdC5cclxuICAgICAgICAgICAgICAgICAgc3VidHJhY3QocHJvZCwgeUwgPCBwcm9kTCA/IHl6IDogeWMsIHByb2RMLCBiYXNlKTtcclxuICAgICAgICAgICAgICAgICAgcHJvZEwgPSBwcm9kLmxlbmd0aDtcclxuICAgICAgICAgICAgICAgICAgY21wID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIG4gaXMgMCBvciAxLCBjbXAgaXMgLTEuXHJcbiAgICAgICAgICAgICAgICAvLyBJZiBuIGlzIDAsIHRoZXJlIGlzIG5vIG5lZWQgdG8gY29tcGFyZSB5YyBhbmQgcmVtIGFnYWluIGJlbG93LFxyXG4gICAgICAgICAgICAgICAgLy8gc28gY2hhbmdlIGNtcCB0byAxIHRvIGF2b2lkIGl0LlxyXG4gICAgICAgICAgICAgICAgLy8gSWYgbiBpcyAxLCBsZWF2ZSBjbXAgYXMgLTEsIHNvIHljIGFuZCByZW0gYXJlIGNvbXBhcmVkIGFnYWluLlxyXG4gICAgICAgICAgICAgICAgaWYgKG4gPT0gMCkge1xyXG5cclxuICAgICAgICAgICAgICAgICAgLy8gZGl2aXNvciA8IHJlbWFpbmRlciwgc28gbiBtdXN0IGJlIGF0IGxlYXN0IDEuXHJcbiAgICAgICAgICAgICAgICAgIGNtcCA9IG4gPSAxO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIHByb2R1Y3QgPSBkaXZpc29yXHJcbiAgICAgICAgICAgICAgICBwcm9kID0geWMuc2xpY2UoKTtcclxuICAgICAgICAgICAgICAgIHByb2RMID0gcHJvZC5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBpZiAocHJvZEwgPCByZW1MKSBwcm9kID0gWzBdLmNvbmNhdChwcm9kKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gU3VidHJhY3QgcHJvZHVjdCBmcm9tIHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICBzdWJ0cmFjdChyZW0sIHByb2QsIHJlbUwsIGJhc2UpO1xyXG4gICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG5cclxuICAgICAgICAgICAgICAgLy8gSWYgcHJvZHVjdCB3YXMgPCByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgaWYgKGNtcCA9PSAtMSkge1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIENvbXBhcmUgZGl2aXNvciBhbmQgbmV3IHJlbWFpbmRlci5cclxuICAgICAgICAgICAgICAgIC8vIElmIGRpdmlzb3IgPCBuZXcgcmVtYWluZGVyLCBzdWJ0cmFjdCBkaXZpc29yIGZyb20gcmVtYWluZGVyLlxyXG4gICAgICAgICAgICAgICAgLy8gVHJpYWwgZGlnaXQgbiB0b28gbG93LlxyXG4gICAgICAgICAgICAgICAgLy8gbiBpcyAxIHRvbyBsb3cgYWJvdXQgNSUgb2YgdGhlIHRpbWUsIGFuZCB2ZXJ5IHJhcmVseSAyIHRvbyBsb3cuXHJcbiAgICAgICAgICAgICAgICB3aGlsZSAoY29tcGFyZSh5YywgcmVtLCB5TCwgcmVtTCkgPCAxKSB7XHJcbiAgICAgICAgICAgICAgICAgIG4rKztcclxuXHJcbiAgICAgICAgICAgICAgICAgIC8vIFN1YnRyYWN0IGRpdmlzb3IgZnJvbSByZW1haW5kZXIuXHJcbiAgICAgICAgICAgICAgICAgIHN1YnRyYWN0KHJlbSwgeUwgPCByZW1MID8geXogOiB5YywgcmVtTCwgYmFzZSk7XHJcbiAgICAgICAgICAgICAgICAgIHJlbUwgPSByZW0ubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChjbXAgPT09IDApIHtcclxuICAgICAgICAgICAgICBuKys7XHJcbiAgICAgICAgICAgICAgcmVtID0gWzBdO1xyXG4gICAgICAgICAgICB9IC8vIGVsc2UgY21wID09PSAxIGFuZCBuIHdpbGwgYmUgMFxyXG5cclxuICAgICAgICAgICAgLy8gQWRkIHRoZSBuZXh0IGRpZ2l0LCBuLCB0byB0aGUgcmVzdWx0IGFycmF5LlxyXG4gICAgICAgICAgICBxY1tpKytdID0gbjtcclxuXHJcbiAgICAgICAgICAgIC8vIFVwZGF0ZSB0aGUgcmVtYWluZGVyLlxyXG4gICAgICAgICAgICBpZiAocmVtWzBdKSB7XHJcbiAgICAgICAgICAgICAgcmVtW3JlbUwrK10gPSB4Y1t4aV0gfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICByZW0gPSBbeGNbeGldXTtcclxuICAgICAgICAgICAgICByZW1MID0gMTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSB3aGlsZSAoKHhpKysgPCB4TCB8fCByZW1bMF0gIT0gbnVsbCkgJiYgcy0tKTtcclxuXHJcbiAgICAgICAgICBtb3JlID0gcmVtWzBdICE9IG51bGw7XHJcblxyXG4gICAgICAgICAgLy8gTGVhZGluZyB6ZXJvP1xyXG4gICAgICAgICAgaWYgKCFxY1swXSkgcWMuc3BsaWNlKDAsIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGJhc2UgPT0gQkFTRSkge1xyXG5cclxuICAgICAgICAgIC8vIFRvIGNhbGN1bGF0ZSBxLmUsIGZpcnN0IGdldCB0aGUgbnVtYmVyIG9mIGRpZ2l0cyBvZiBxY1swXS5cclxuICAgICAgICAgIGZvciAoaSA9IDEsIHMgPSBxY1swXTsgcyA+PSAxMDsgcyAvPSAxMCwgaSsrKTtcclxuXHJcbiAgICAgICAgICByb3VuZChxLCBkcCArIChxLmUgPSBpICsgZSAqIExPR19CQVNFIC0gMSkgKyAxLCBybSwgbW9yZSk7XHJcblxyXG4gICAgICAgIC8vIENhbGxlciBpcyBjb252ZXJ0QmFzZS5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcS5lID0gZTtcclxuICAgICAgICAgIHEuciA9ICttb3JlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHE7XHJcbiAgICAgIH07XHJcbiAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyIG4gaW4gZml4ZWQtcG9pbnQgb3IgZXhwb25lbnRpYWxcclxuICAgICAqIG5vdGF0aW9uIHJvdW5kZWQgdG8gdGhlIHNwZWNpZmllZCBkZWNpbWFsIHBsYWNlcyBvciBzaWduaWZpY2FudCBkaWdpdHMuXHJcbiAgICAgKlxyXG4gICAgICogbjogYSBCaWdOdW1iZXIuXHJcbiAgICAgKiBpOiB0aGUgaW5kZXggb2YgdGhlIGxhc3QgZGlnaXQgcmVxdWlyZWQgKGkuZS4gdGhlIGRpZ2l0IHRoYXQgbWF5IGJlIHJvdW5kZWQgdXApLlxyXG4gICAgICogcm06IHRoZSByb3VuZGluZyBtb2RlLlxyXG4gICAgICogaWQ6IDEgKHRvRXhwb25lbnRpYWwpIG9yIDIgKHRvUHJlY2lzaW9uKS5cclxuICAgICAqL1xyXG4gICAgZnVuY3Rpb24gZm9ybWF0KG4sIGksIHJtLCBpZCkge1xyXG4gICAgICB2YXIgYzAsIGUsIG5lLCBsZW4sIHN0cjtcclxuXHJcbiAgICAgIGlmIChybSA9PSBudWxsKSBybSA9IFJPVU5ESU5HX01PREU7XHJcbiAgICAgIGVsc2UgaW50Q2hlY2socm0sIDAsIDgpO1xyXG5cclxuICAgICAgaWYgKCFuLmMpIHJldHVybiBuLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICBjMCA9IG4uY1swXTtcclxuICAgICAgbmUgPSBuLmU7XHJcblxyXG4gICAgICBpZiAoaSA9PSBudWxsKSB7XHJcbiAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyhuLmMpO1xyXG4gICAgICAgIHN0ciA9IGlkID09IDEgfHwgaWQgPT0gMiAmJiAobmUgPD0gVE9fRVhQX05FRyB8fCBuZSA+PSBUT19FWFBfUE9TKVxyXG4gICAgICAgICA/IHRvRXhwb25lbnRpYWwoc3RyLCBuZSlcclxuICAgICAgICAgOiB0b0ZpeGVkUG9pbnQoc3RyLCBuZSwgJzAnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBuID0gcm91bmQobmV3IEJpZ051bWJlcihuKSwgaSwgcm0pO1xyXG5cclxuICAgICAgICAvLyBuLmUgbWF5IGhhdmUgY2hhbmdlZCBpZiB0aGUgdmFsdWUgd2FzIHJvdW5kZWQgdXAuXHJcbiAgICAgICAgZSA9IG4uZTtcclxuXHJcbiAgICAgICAgc3RyID0gY29lZmZUb1N0cmluZyhuLmMpO1xyXG4gICAgICAgIGxlbiA9IHN0ci5sZW5ndGg7XHJcblxyXG4gICAgICAgIC8vIHRvUHJlY2lzaW9uIHJldHVybnMgZXhwb25lbnRpYWwgbm90YXRpb24gaWYgdGhlIG51bWJlciBvZiBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgICAgICAvLyBzcGVjaWZpZWQgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzIG5lY2Vzc2FyeSB0byByZXByZXNlbnQgdGhlIGludGVnZXJcclxuICAgICAgICAvLyBwYXJ0IG9mIHRoZSB2YWx1ZSBpbiBmaXhlZC1wb2ludCBub3RhdGlvbi5cclxuXHJcbiAgICAgICAgLy8gRXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgICAgaWYgKGlkID09IDEgfHwgaWQgPT0gMiAmJiAoaSA8PSBlIHx8IGUgPD0gVE9fRVhQX05FRykpIHtcclxuXHJcbiAgICAgICAgICAvLyBBcHBlbmQgemVyb3M/XHJcbiAgICAgICAgICBmb3IgKDsgbGVuIDwgaTsgc3RyICs9ICcwJywgbGVuKyspO1xyXG4gICAgICAgICAgc3RyID0gdG9FeHBvbmVudGlhbChzdHIsIGUpO1xyXG5cclxuICAgICAgICAvLyBGaXhlZC1wb2ludCBub3RhdGlvbi5cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaSAtPSBuZTtcclxuICAgICAgICAgIHN0ciA9IHRvRml4ZWRQb2ludChzdHIsIGUsICcwJyk7XHJcblxyXG4gICAgICAgICAgLy8gQXBwZW5kIHplcm9zP1xyXG4gICAgICAgICAgaWYgKGUgKyAxID4gbGVuKSB7XHJcbiAgICAgICAgICAgIGlmICgtLWkgPiAwKSBmb3IgKHN0ciArPSAnLic7IGktLTsgc3RyICs9ICcwJyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpICs9IGUgLSBsZW47XHJcbiAgICAgICAgICAgIGlmIChpID4gMCkge1xyXG4gICAgICAgICAgICAgIGlmIChlICsgMSA9PSBsZW4pIHN0ciArPSAnLic7XHJcbiAgICAgICAgICAgICAgZm9yICg7IGktLTsgc3RyICs9ICcwJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBuLnMgPCAwICYmIGMwID8gJy0nICsgc3RyIDogc3RyO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvLyBIYW5kbGUgQmlnTnVtYmVyLm1heCBhbmQgQmlnTnVtYmVyLm1pbi5cclxuICAgIGZ1bmN0aW9uIG1heE9yTWluKGFyZ3MsIG1ldGhvZCkge1xyXG4gICAgICB2YXIgbixcclxuICAgICAgICBpID0gMSxcclxuICAgICAgICBtID0gbmV3IEJpZ051bWJlcihhcmdzWzBdKTtcclxuXHJcbiAgICAgIGZvciAoOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIG4gPSBuZXcgQmlnTnVtYmVyKGFyZ3NbaV0pO1xyXG5cclxuICAgICAgICAvLyBJZiBhbnkgbnVtYmVyIGlzIE5hTiwgcmV0dXJuIE5hTi5cclxuICAgICAgICBpZiAoIW4ucykge1xyXG4gICAgICAgICAgbSA9IG47XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICB9IGVsc2UgaWYgKG1ldGhvZC5jYWxsKG0sIG4pKSB7XHJcbiAgICAgICAgICBtID0gbjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBtO1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogU3RyaXAgdHJhaWxpbmcgemVyb3MsIGNhbGN1bGF0ZSBiYXNlIDEwIGV4cG9uZW50IGFuZCBjaGVjayBhZ2FpbnN0IE1JTl9FWFAgYW5kIE1BWF9FWFAuXHJcbiAgICAgKiBDYWxsZWQgYnkgbWludXMsIHBsdXMgYW5kIHRpbWVzLlxyXG4gICAgICovXHJcbiAgICBmdW5jdGlvbiBub3JtYWxpc2UobiwgYywgZSkge1xyXG4gICAgICB2YXIgaSA9IDEsXHJcbiAgICAgICAgaiA9IGMubGVuZ3RoO1xyXG5cclxuICAgICAgIC8vIFJlbW92ZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgICAgZm9yICg7ICFjWy0tal07IGMucG9wKCkpO1xyXG5cclxuICAgICAgLy8gQ2FsY3VsYXRlIHRoZSBiYXNlIDEwIGV4cG9uZW50LiBGaXJzdCBnZXQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgY1swXS5cclxuICAgICAgZm9yIChqID0gY1swXTsgaiA+PSAxMDsgaiAvPSAxMCwgaSsrKTtcclxuXHJcbiAgICAgIC8vIE92ZXJmbG93P1xyXG4gICAgICBpZiAoKGUgPSBpICsgZSAqIExPR19CQVNFIC0gMSkgPiBNQVhfRVhQKSB7XHJcblxyXG4gICAgICAgIC8vIEluZmluaXR5LlxyXG4gICAgICAgIG4uYyA9IG4uZSA9IG51bGw7XHJcblxyXG4gICAgICAvLyBVbmRlcmZsb3c/XHJcbiAgICAgIH0gZWxzZSBpZiAoZSA8IE1JTl9FWFApIHtcclxuXHJcbiAgICAgICAgLy8gWmVyby5cclxuICAgICAgICBuLmMgPSBbbi5lID0gMF07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbi5lID0gZTtcclxuICAgICAgICBuLmMgPSBjO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gSGFuZGxlIHZhbHVlcyB0aGF0IGZhaWwgdGhlIHZhbGlkaXR5IHRlc3QgaW4gQmlnTnVtYmVyLlxyXG4gICAgcGFyc2VOdW1lcmljID0gKGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGJhc2VQcmVmaXggPSAvXigtPykwKFt4Ym9dKSg/PVxcd1tcXHcuXSokKS9pLFxyXG4gICAgICAgIGRvdEFmdGVyID0gL14oW14uXSspXFwuJC8sXHJcbiAgICAgICAgZG90QmVmb3JlID0gL15cXC4oW14uXSspJC8sXHJcbiAgICAgICAgaXNJbmZpbml0eU9yTmFOID0gL14tPyhJbmZpbml0eXxOYU4pJC8sXHJcbiAgICAgICAgd2hpdGVzcGFjZU9yUGx1cyA9IC9eXFxzKlxcKyg/PVtcXHcuXSl8Xlxccyt8XFxzKyQvZztcclxuXHJcbiAgICAgIHJldHVybiBmdW5jdGlvbiAoeCwgc3RyLCBpc051bSwgYikge1xyXG4gICAgICAgIHZhciBiYXNlLFxyXG4gICAgICAgICAgcyA9IGlzTnVtID8gc3RyIDogc3RyLnJlcGxhY2Uod2hpdGVzcGFjZU9yUGx1cywgJycpO1xyXG5cclxuICAgICAgICAvLyBObyBleGNlcHRpb24gb24gwrFJbmZpbml0eSBvciBOYU4uXHJcbiAgICAgICAgaWYgKGlzSW5maW5pdHlPck5hTi50ZXN0KHMpKSB7XHJcbiAgICAgICAgICB4LnMgPSBpc05hTihzKSA/IG51bGwgOiBzIDwgMCA/IC0xIDogMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKCFpc051bSkge1xyXG5cclxuICAgICAgICAgICAgLy8gYmFzZVByZWZpeCA9IC9eKC0/KTAoW3hib10pKD89XFx3W1xcdy5dKiQpL2lcclxuICAgICAgICAgICAgcyA9IHMucmVwbGFjZShiYXNlUHJlZml4LCBmdW5jdGlvbiAobSwgcDEsIHAyKSB7XHJcbiAgICAgICAgICAgICAgYmFzZSA9IChwMiA9IHAyLnRvTG93ZXJDYXNlKCkpID09ICd4JyA/IDE2IDogcDIgPT0gJ2InID8gMiA6IDg7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICFiIHx8IGIgPT0gYmFzZSA/IHAxIDogbTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBpZiAoYikge1xyXG4gICAgICAgICAgICAgIGJhc2UgPSBiO1xyXG5cclxuICAgICAgICAgICAgICAvLyBFLmcuICcxLicgdG8gJzEnLCAnLjEnIHRvICcwLjEnXHJcbiAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShkb3RBZnRlciwgJyQxJykucmVwbGFjZShkb3RCZWZvcmUsICcwLiQxJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIGlmIChzdHIgIT0gcykgcmV0dXJuIG5ldyBCaWdOdW1iZXIocywgYmFzZSk7XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIE5vdCBhIG51bWJlcjoge259J1xyXG4gICAgICAgICAgLy8gJ1tCaWdOdW1iZXIgRXJyb3JdIE5vdCBhIGJhc2Uge2J9IG51bWJlcjoge259J1xyXG4gICAgICAgICAgaWYgKEJpZ051bWJlci5ERUJVRykge1xyXG4gICAgICAgICAgICB0aHJvdyBFcnJvclxyXG4gICAgICAgICAgICAgIChiaWdudW1iZXJFcnJvciArICdOb3QgYScgKyAoYiA/ICcgYmFzZSAnICsgYiA6ICcnKSArICcgbnVtYmVyOiAnICsgc3RyKTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBOYU5cclxuICAgICAgICAgIHgucyA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4LmMgPSB4LmUgPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9KSgpO1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUm91bmQgeCB0byBzZCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBybS4gQ2hlY2sgZm9yIG92ZXIvdW5kZXItZmxvdy5cclxuICAgICAqIElmIHIgaXMgdHJ1dGh5LCBpdCBpcyBrbm93biB0aGF0IHRoZXJlIGFyZSBtb3JlIGRpZ2l0cyBhZnRlciB0aGUgcm91bmRpbmcgZGlnaXQuXHJcbiAgICAgKi9cclxuICAgIGZ1bmN0aW9uIHJvdW5kKHgsIHNkLCBybSwgcikge1xyXG4gICAgICB2YXIgZCwgaSwgaiwgaywgbiwgbmksIHJkLFxyXG4gICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgIHBvd3MxMCA9IFBPV1NfVEVOO1xyXG5cclxuICAgICAgLy8gaWYgeCBpcyBub3QgSW5maW5pdHkgb3IgTmFOLi4uXHJcbiAgICAgIGlmICh4Yykge1xyXG5cclxuICAgICAgICAvLyByZCBpcyB0aGUgcm91bmRpbmcgZGlnaXQsIGkuZS4gdGhlIGRpZ2l0IGFmdGVyIHRoZSBkaWdpdCB0aGF0IG1heSBiZSByb3VuZGVkIHVwLlxyXG4gICAgICAgIC8vIG4gaXMgYSBiYXNlIDFlMTQgbnVtYmVyLCB0aGUgdmFsdWUgb2YgdGhlIGVsZW1lbnQgb2YgYXJyYXkgeC5jIGNvbnRhaW5pbmcgcmQuXHJcbiAgICAgICAgLy8gbmkgaXMgdGhlIGluZGV4IG9mIG4gd2l0aGluIHguYy5cclxuICAgICAgICAvLyBkIGlzIHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIG4uXHJcbiAgICAgICAgLy8gaSBpcyB0aGUgaW5kZXggb2YgcmQgd2l0aGluIG4gaW5jbHVkaW5nIGxlYWRpbmcgemVyb3MuXHJcbiAgICAgICAgLy8gaiBpcyB0aGUgYWN0dWFsIGluZGV4IG9mIHJkIHdpdGhpbiBuIChpZiA8IDAsIHJkIGlzIGEgbGVhZGluZyB6ZXJvKS5cclxuICAgICAgICBvdXQ6IHtcclxuXHJcbiAgICAgICAgICAvLyBHZXQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIGZpcnN0IGVsZW1lbnQgb2YgeGMuXHJcbiAgICAgICAgICBmb3IgKGQgPSAxLCBrID0geGNbMF07IGsgPj0gMTA7IGsgLz0gMTAsIGQrKyk7XHJcbiAgICAgICAgICBpID0gc2QgLSBkO1xyXG5cclxuICAgICAgICAgIC8vIElmIHRoZSByb3VuZGluZyBkaWdpdCBpcyBpbiB0aGUgZmlyc3QgZWxlbWVudCBvZiB4Yy4uLlxyXG4gICAgICAgICAgaWYgKGkgPCAwKSB7XHJcbiAgICAgICAgICAgIGkgKz0gTE9HX0JBU0U7XHJcbiAgICAgICAgICAgIGogPSBzZDtcclxuICAgICAgICAgICAgbiA9IHhjW25pID0gMF07XHJcblxyXG4gICAgICAgICAgICAvLyBHZXQgdGhlIHJvdW5kaW5nIGRpZ2l0IGF0IGluZGV4IGogb2Ygbi5cclxuICAgICAgICAgICAgcmQgPSBuIC8gcG93czEwW2QgLSBqIC0gMV0gJSAxMCB8IDA7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBuaSA9IG1hdGhjZWlsKChpICsgMSkgLyBMT0dfQkFTRSk7XHJcblxyXG4gICAgICAgICAgICBpZiAobmkgPj0geGMubGVuZ3RoKSB7XHJcblxyXG4gICAgICAgICAgICAgIGlmIChyKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gTmVlZGVkIGJ5IHNxcnQuXHJcbiAgICAgICAgICAgICAgICBmb3IgKDsgeGMubGVuZ3RoIDw9IG5pOyB4Yy5wdXNoKDApKTtcclxuICAgICAgICAgICAgICAgIG4gPSByZCA9IDA7XHJcbiAgICAgICAgICAgICAgICBkID0gMTtcclxuICAgICAgICAgICAgICAgIGkgJT0gTE9HX0JBU0U7XHJcbiAgICAgICAgICAgICAgICBqID0gaSAtIExPR19CQVNFICsgMTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgYnJlYWsgb3V0O1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBuID0gayA9IHhjW25pXTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gR2V0IHRoZSBudW1iZXIgb2YgZGlnaXRzIG9mIG4uXHJcbiAgICAgICAgICAgICAgZm9yIChkID0gMTsgayA+PSAxMDsgayAvPSAxMCwgZCsrKTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gR2V0IHRoZSBpbmRleCBvZiByZCB3aXRoaW4gbi5cclxuICAgICAgICAgICAgICBpICU9IExPR19CQVNFO1xyXG5cclxuICAgICAgICAgICAgICAvLyBHZXQgdGhlIGluZGV4IG9mIHJkIHdpdGhpbiBuLCBhZGp1c3RlZCBmb3IgbGVhZGluZyB6ZXJvcy5cclxuICAgICAgICAgICAgICAvLyBUaGUgbnVtYmVyIG9mIGxlYWRpbmcgemVyb3Mgb2YgbiBpcyBnaXZlbiBieSBMT0dfQkFTRSAtIGQuXHJcbiAgICAgICAgICAgICAgaiA9IGkgLSBMT0dfQkFTRSArIGQ7XHJcblxyXG4gICAgICAgICAgICAgIC8vIEdldCB0aGUgcm91bmRpbmcgZGlnaXQgYXQgaW5kZXggaiBvZiBuLlxyXG4gICAgICAgICAgICAgIHJkID0gaiA8IDAgPyAwIDogbiAvIHBvd3MxMFtkIC0gaiAtIDFdICUgMTAgfCAwO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgciA9IHIgfHwgc2QgPCAwIHx8XHJcblxyXG4gICAgICAgICAgLy8gQXJlIHRoZXJlIGFueSBub24temVybyBkaWdpdHMgYWZ0ZXIgdGhlIHJvdW5kaW5nIGRpZ2l0P1xyXG4gICAgICAgICAgLy8gVGhlIGV4cHJlc3Npb24gIG4gJSBwb3dzMTBbZCAtIGogLSAxXSAgcmV0dXJucyBhbGwgZGlnaXRzIG9mIG4gdG8gdGhlIHJpZ2h0XHJcbiAgICAgICAgICAvLyBvZiB0aGUgZGlnaXQgYXQgaiwgZS5nLiBpZiBuIGlzIDkwODcxNCBhbmQgaiBpcyAyLCB0aGUgZXhwcmVzc2lvbiBnaXZlcyA3MTQuXHJcbiAgICAgICAgICAgeGNbbmkgKyAxXSAhPSBudWxsIHx8IChqIDwgMCA/IG4gOiBuICUgcG93czEwW2QgLSBqIC0gMV0pO1xyXG5cclxuICAgICAgICAgIHIgPSBybSA8IDRcclxuICAgICAgICAgICA/IChyZCB8fCByKSAmJiAocm0gPT0gMCB8fCBybSA9PSAoeC5zIDwgMCA/IDMgOiAyKSlcclxuICAgICAgICAgICA6IHJkID4gNSB8fCByZCA9PSA1ICYmIChybSA9PSA0IHx8IHIgfHwgcm0gPT0gNiAmJlxyXG5cclxuICAgICAgICAgICAgLy8gQ2hlY2sgd2hldGhlciB0aGUgZGlnaXQgdG8gdGhlIGxlZnQgb2YgdGhlIHJvdW5kaW5nIGRpZ2l0IGlzIG9kZC5cclxuICAgICAgICAgICAgKChpID4gMCA/IGogPiAwID8gbiAvIHBvd3MxMFtkIC0gal0gOiAwIDogeGNbbmkgLSAxXSkgJSAxMCkgJiAxIHx8XHJcbiAgICAgICAgICAgICBybSA9PSAoeC5zIDwgMCA/IDggOiA3KSk7XHJcblxyXG4gICAgICAgICAgaWYgKHNkIDwgMSB8fCAheGNbMF0pIHtcclxuICAgICAgICAgICAgeGMubGVuZ3RoID0gMDtcclxuXHJcbiAgICAgICAgICAgIGlmIChyKSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIENvbnZlcnQgc2QgdG8gZGVjaW1hbCBwbGFjZXMuXHJcbiAgICAgICAgICAgICAgc2QgLT0geC5lICsgMTtcclxuXHJcbiAgICAgICAgICAgICAgLy8gMSwgMC4xLCAwLjAxLCAwLjAwMSwgMC4wMDAxIGV0Yy5cclxuICAgICAgICAgICAgICB4Y1swXSA9IHBvd3MxMFsoTE9HX0JBU0UgLSBzZCAlIExPR19CQVNFKSAlIExPR19CQVNFXTtcclxuICAgICAgICAgICAgICB4LmUgPSAtc2QgfHwgMDtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuXHJcbiAgICAgICAgICAgICAgLy8gWmVyby5cclxuICAgICAgICAgICAgICB4Y1swXSA9IHguZSA9IDA7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB4O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFJlbW92ZSBleGNlc3MgZGlnaXRzLlxyXG4gICAgICAgICAgaWYgKGkgPT0gMCkge1xyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBuaTtcclxuICAgICAgICAgICAgayA9IDE7XHJcbiAgICAgICAgICAgIG5pLS07XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB4Yy5sZW5ndGggPSBuaSArIDE7XHJcbiAgICAgICAgICAgIGsgPSBwb3dzMTBbTE9HX0JBU0UgLSBpXTtcclxuXHJcbiAgICAgICAgICAgIC8vIEUuZy4gNTY3MDAgYmVjb21lcyA1NjAwMCBpZiA3IGlzIHRoZSByb3VuZGluZyBkaWdpdC5cclxuICAgICAgICAgICAgLy8gaiA+IDAgbWVhbnMgaSA+IG51bWJlciBvZiBsZWFkaW5nIHplcm9zIG9mIG4uXHJcbiAgICAgICAgICAgIHhjW25pXSA9IGogPiAwID8gbWF0aGZsb29yKG4gLyBwb3dzMTBbZCAtIGpdICUgcG93czEwW2pdKSAqIGsgOiAwO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIFJvdW5kIHVwP1xyXG4gICAgICAgICAgaWYgKHIpIHtcclxuXHJcbiAgICAgICAgICAgIGZvciAoOyA7KSB7XHJcblxyXG4gICAgICAgICAgICAgIC8vIElmIHRoZSBkaWdpdCB0byBiZSByb3VuZGVkIHVwIGlzIGluIHRoZSBmaXJzdCBlbGVtZW50IG9mIHhjLi4uXHJcbiAgICAgICAgICAgICAgaWYgKG5pID09IDApIHtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBpIHdpbGwgYmUgdGhlIGxlbmd0aCBvZiB4Y1swXSBiZWZvcmUgayBpcyBhZGRlZC5cclxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDEsIGogPSB4Y1swXTsgaiA+PSAxMDsgaiAvPSAxMCwgaSsrKTtcclxuICAgICAgICAgICAgICAgIGogPSB4Y1swXSArPSBrO1xyXG4gICAgICAgICAgICAgICAgZm9yIChrID0gMTsgaiA+PSAxMDsgaiAvPSAxMCwgaysrKTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBpZiBpICE9IGsgdGhlIGxlbmd0aCBoYXMgaW5jcmVhc2VkLlxyXG4gICAgICAgICAgICAgICAgaWYgKGkgIT0gaykge1xyXG4gICAgICAgICAgICAgICAgICB4LmUrKztcclxuICAgICAgICAgICAgICAgICAgaWYgKHhjWzBdID09IEJBU0UpIHhjWzBdID0gMTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgeGNbbmldICs9IGs7XHJcbiAgICAgICAgICAgICAgICBpZiAoeGNbbmldICE9IEJBU0UpIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgeGNbbmktLV0gPSAwO1xyXG4gICAgICAgICAgICAgICAgayA9IDE7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHplcm9zLlxyXG4gICAgICAgICAgZm9yIChpID0geGMubGVuZ3RoOyB4Y1stLWldID09PSAwOyB4Yy5wb3AoKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBPdmVyZmxvdz8gSW5maW5pdHkuXHJcbiAgICAgICAgaWYgKHguZSA+IE1BWF9FWFApIHtcclxuICAgICAgICAgIHguYyA9IHguZSA9IG51bGw7XHJcblxyXG4gICAgICAgIC8vIFVuZGVyZmxvdz8gWmVyby5cclxuICAgICAgICB9IGVsc2UgaWYgKHguZSA8IE1JTl9FWFApIHtcclxuICAgICAgICAgIHguYyA9IFt4LmUgPSAwXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiB4O1xyXG4gICAgfVxyXG5cclxuXHJcbiAgICBmdW5jdGlvbiB2YWx1ZU9mKG4pIHtcclxuICAgICAgdmFyIHN0cixcclxuICAgICAgICBlID0gbi5lO1xyXG5cclxuICAgICAgaWYgKGUgPT09IG51bGwpIHJldHVybiBuLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICBzdHIgPSBjb2VmZlRvU3RyaW5nKG4uYyk7XHJcblxyXG4gICAgICBzdHIgPSBlIDw9IFRPX0VYUF9ORUcgfHwgZSA+PSBUT19FWFBfUE9TXHJcbiAgICAgICAgPyB0b0V4cG9uZW50aWFsKHN0ciwgZSlcclxuICAgICAgICA6IHRvRml4ZWRQb2ludChzdHIsIGUsICcwJyk7XHJcblxyXG4gICAgICByZXR1cm4gbi5zIDwgMCA/ICctJyArIHN0ciA6IHN0cjtcclxuICAgIH1cclxuXHJcblxyXG4gICAgLy8gUFJPVE9UWVBFL0lOU1RBTkNFIE1FVEhPRFNcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIGFic29sdXRlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLlxyXG4gICAgICovXHJcbiAgICBQLmFic29sdXRlVmFsdWUgPSBQLmFicyA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIHggPSBuZXcgQmlnTnVtYmVyKHRoaXMpO1xyXG4gICAgICBpZiAoeC5zIDwgMCkgeC5zID0gMTtcclxuICAgICAgcmV0dXJuIHg7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuXHJcbiAgICAgKiAgIDEgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLFxyXG4gICAgICogICAtMSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIoeSwgYiksXHJcbiAgICAgKiAgIDAgaWYgdGhleSBoYXZlIHRoZSBzYW1lIHZhbHVlLFxyXG4gICAgICogICBvciBudWxsIGlmIHRoZSB2YWx1ZSBvZiBlaXRoZXIgaXMgTmFOLlxyXG4gICAgICovXHJcbiAgICBQLmNvbXBhcmVkVG8gPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICByZXR1cm4gY29tcGFyZSh0aGlzLCBuZXcgQmlnTnVtYmVyKHksIGIpKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBJZiBkcCBpcyB1bmRlZmluZWQgb3IgbnVsbCBvciB0cnVlIG9yIGZhbHNlLCByZXR1cm4gdGhlIG51bWJlciBvZiBkZWNpbWFsIHBsYWNlcyBvZiB0aGVcclxuICAgICAqIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLCBvciBudWxsIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyDCsUluZmluaXR5IG9yIE5hTi5cclxuICAgICAqXHJcbiAgICAgKiBPdGhlcndpc2UsIGlmIGRwIGlzIGEgbnVtYmVyLCByZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzXHJcbiAgICAgKiBCaWdOdW1iZXIgcm91bmRlZCB0byBhIG1heGltdW0gb2YgZHAgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3JcclxuICAgICAqIFJPVU5ESU5HX01PREUgaWYgcm0gaXMgb21pdHRlZC5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzOiBpbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEFyZ3VtZW50IHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZX06IHtkcHxybX0nXHJcbiAgICAgKi9cclxuICAgIFAuZGVjaW1hbFBsYWNlcyA9IFAuZHAgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgIHZhciBjLCBuLCB2LFxyXG4gICAgICAgIHggPSB0aGlzO1xyXG5cclxuICAgICAgaWYgKGRwICE9IG51bGwpIHtcclxuICAgICAgICBpbnRDaGVjayhkcCwgMCwgTUFYKTtcclxuICAgICAgICBpZiAocm0gPT0gbnVsbCkgcm0gPSBST1VORElOR19NT0RFO1xyXG4gICAgICAgIGVsc2UgaW50Q2hlY2socm0sIDAsIDgpO1xyXG5cclxuICAgICAgICByZXR1cm4gcm91bmQobmV3IEJpZ051bWJlcih4KSwgZHAgKyB4LmUgKyAxLCBybSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICghKGMgPSB4LmMpKSByZXR1cm4gbnVsbDtcclxuICAgICAgbiA9ICgodiA9IGMubGVuZ3RoIC0gMSkgLSBiaXRGbG9vcih0aGlzLmUgLyBMT0dfQkFTRSkpICogTE9HX0JBU0U7XHJcblxyXG4gICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IG51bWJlci5cclxuICAgICAgaWYgKHYgPSBjW3ZdKSBmb3IgKDsgdiAlIDEwID09IDA7IHYgLz0gMTAsIG4tLSk7XHJcbiAgICAgIGlmIChuIDwgMCkgbiA9IDA7XHJcblxyXG4gICAgICByZXR1cm4gbjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgbiAvIDAgPSBJXHJcbiAgICAgKiAgbiAvIE4gPSBOXHJcbiAgICAgKiAgbiAvIEkgPSAwXHJcbiAgICAgKiAgMCAvIG4gPSAwXHJcbiAgICAgKiAgMCAvIDAgPSBOXHJcbiAgICAgKiAgMCAvIE4gPSBOXHJcbiAgICAgKiAgMCAvIEkgPSAwXHJcbiAgICAgKiAgTiAvIG4gPSBOXHJcbiAgICAgKiAgTiAvIDAgPSBOXHJcbiAgICAgKiAgTiAvIE4gPSBOXHJcbiAgICAgKiAgTiAvIEkgPSBOXHJcbiAgICAgKiAgSSAvIG4gPSBJXHJcbiAgICAgKiAgSSAvIDAgPSBJXHJcbiAgICAgKiAgSSAvIE4gPSBOXHJcbiAgICAgKiAgSSAvIEkgPSBOXHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgZGl2aWRlZCBieSB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZ051bWJlcih5LCBiKSwgcm91bmRlZCBhY2NvcmRpbmcgdG8gREVDSU1BTF9QTEFDRVMgYW5kIFJPVU5ESU5HX01PREUuXHJcbiAgICAgKi9cclxuICAgIFAuZGl2aWRlZEJ5ID0gUC5kaXYgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICByZXR1cm4gZGl2KHRoaXMsIG5ldyBCaWdOdW1iZXIoeSwgYiksIERFQ0lNQUxfUExBQ0VTLCBST1VORElOR19NT0RFKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSBpbnRlZ2VyIHBhcnQgb2YgZGl2aWRpbmcgdGhlIHZhbHVlIG9mIHRoaXNcclxuICAgICAqIEJpZ051bWJlciBieSB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLlxyXG4gICAgICovXHJcbiAgICBQLmRpdmlkZWRUb0ludGVnZXJCeSA9IFAuaWRpdiA9IGZ1bmN0aW9uICh5LCBiKSB7XHJcbiAgICAgIHJldHVybiBkaXYodGhpcywgbmV3IEJpZ051bWJlcih5LCBiKSwgMCwgMSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBleHBvbmVudGlhdGVkIGJ5IG4uXHJcbiAgICAgKlxyXG4gICAgICogSWYgbSBpcyBwcmVzZW50LCByZXR1cm4gdGhlIHJlc3VsdCBtb2R1bG8gbS5cclxuICAgICAqIElmIG4gaXMgbmVnYXRpdmUgcm91bmQgYWNjb3JkaW5nIHRvIERFQ0lNQUxfUExBQ0VTIGFuZCBST1VORElOR19NT0RFLlxyXG4gICAgICogSWYgUE9XX1BSRUNJU0lPTiBpcyBub24temVybyBhbmQgbSBpcyBub3QgcHJlc2VudCwgcm91bmQgdG8gUE9XX1BSRUNJU0lPTiB1c2luZyBST1VORElOR19NT0RFLlxyXG4gICAgICpcclxuICAgICAqIFRoZSBtb2R1bGFyIHBvd2VyIG9wZXJhdGlvbiB3b3JrcyBlZmZpY2llbnRseSB3aGVuIHgsIG4sIGFuZCBtIGFyZSBpbnRlZ2Vycywgb3RoZXJ3aXNlIGl0XHJcbiAgICAgKiBpcyBlcXVpdmFsZW50IHRvIGNhbGN1bGF0aW5nIHguZXhwb25lbnRpYXRlZEJ5KG4pLm1vZHVsbyhtKSB3aXRoIGEgUE9XX1BSRUNJU0lPTiBvZiAwLlxyXG4gICAgICpcclxuICAgICAqIG4ge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfSBUaGUgZXhwb25lbnQuIEFuIGludGVnZXIuXHJcbiAgICAgKiBbbV0ge251bWJlcnxzdHJpbmd8QmlnTnVtYmVyfSBUaGUgbW9kdWx1cy5cclxuICAgICAqXHJcbiAgICAgKiAnW0JpZ051bWJlciBFcnJvcl0gRXhwb25lbnQgbm90IGFuIGludGVnZXI6IHtufSdcclxuICAgICAqL1xyXG4gICAgUC5leHBvbmVudGlhdGVkQnkgPSBQLnBvdyA9IGZ1bmN0aW9uIChuLCBtKSB7XHJcbiAgICAgIHZhciBoYWxmLCBpc01vZEV4cCwgaSwgaywgbW9yZSwgbklzQmlnLCBuSXNOZWcsIG5Jc09kZCwgeSxcclxuICAgICAgICB4ID0gdGhpcztcclxuXHJcbiAgICAgIG4gPSBuZXcgQmlnTnVtYmVyKG4pO1xyXG5cclxuICAgICAgLy8gQWxsb3cgTmFOIGFuZCDCsUluZmluaXR5LCBidXQgbm90IG90aGVyIG5vbi1pbnRlZ2Vycy5cclxuICAgICAgaWYgKG4uYyAmJiAhbi5pc0ludGVnZXIoKSkge1xyXG4gICAgICAgIHRocm93IEVycm9yXHJcbiAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyAnRXhwb25lbnQgbm90IGFuIGludGVnZXI6ICcgKyB2YWx1ZU9mKG4pKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG0gIT0gbnVsbCkgbSA9IG5ldyBCaWdOdW1iZXIobSk7XHJcblxyXG4gICAgICAvLyBFeHBvbmVudCBvZiBNQVhfU0FGRV9JTlRFR0VSIGlzIDE1LlxyXG4gICAgICBuSXNCaWcgPSBuLmUgPiAxNDtcclxuXHJcbiAgICAgIC8vIElmIHggaXMgTmFOLCDCsUluZmluaXR5LCDCsTAgb3IgwrExLCBvciBuIGlzIMKxSW5maW5pdHksIE5hTiBvciDCsTAuXHJcbiAgICAgIGlmICgheC5jIHx8ICF4LmNbMF0gfHwgeC5jWzBdID09IDEgJiYgIXguZSAmJiB4LmMubGVuZ3RoID09IDEgfHwgIW4uYyB8fCAhbi5jWzBdKSB7XHJcblxyXG4gICAgICAgIC8vIFRoZSBzaWduIG9mIHRoZSByZXN1bHQgb2YgcG93IHdoZW4geCBpcyBuZWdhdGl2ZSBkZXBlbmRzIG9uIHRoZSBldmVubmVzcyBvZiBuLlxyXG4gICAgICAgIC8vIElmICtuIG92ZXJmbG93cyB0byDCsUluZmluaXR5LCB0aGUgZXZlbm5lc3Mgb2YgbiB3b3VsZCBiZSBub3QgYmUga25vd24uXHJcbiAgICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoTWF0aC5wb3coK3ZhbHVlT2YoeCksIG5Jc0JpZyA/IDIgLSBpc09kZChuKSA6ICt2YWx1ZU9mKG4pKSk7XHJcbiAgICAgICAgcmV0dXJuIG0gPyB5Lm1vZChtKSA6IHk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIG5Jc05lZyA9IG4ucyA8IDA7XHJcblxyXG4gICAgICBpZiAobSkge1xyXG5cclxuICAgICAgICAvLyB4ICUgbSByZXR1cm5zIE5hTiBpZiBhYnMobSkgaXMgemVybywgb3IgbSBpcyBOYU4uXHJcbiAgICAgICAgaWYgKG0uYyA/ICFtLmNbMF0gOiAhbS5zKSByZXR1cm4gbmV3IEJpZ051bWJlcihOYU4pO1xyXG5cclxuICAgICAgICBpc01vZEV4cCA9ICFuSXNOZWcgJiYgeC5pc0ludGVnZXIoKSAmJiBtLmlzSW50ZWdlcigpO1xyXG5cclxuICAgICAgICBpZiAoaXNNb2RFeHApIHggPSB4Lm1vZChtKTtcclxuXHJcbiAgICAgIC8vIE92ZXJmbG93IHRvIMKxSW5maW5pdHk6ID49MioqMWUxMCBvciA+PTEuMDAwMDAyNCoqMWUxNS5cclxuICAgICAgLy8gVW5kZXJmbG93IHRvIMKxMDogPD0wLjc5KioxZTEwIG9yIDw9MC45OTk5OTc1KioxZTE1LlxyXG4gICAgICB9IGVsc2UgaWYgKG4uZSA+IDkgJiYgKHguZSA+IDAgfHwgeC5lIDwgLTEgfHwgKHguZSA9PSAwXHJcbiAgICAgICAgLy8gWzEsIDI0MDAwMDAwMF1cclxuICAgICAgICA/IHguY1swXSA+IDEgfHwgbklzQmlnICYmIHguY1sxXSA+PSAyNGU3XHJcbiAgICAgICAgLy8gWzgwMDAwMDAwMDAwMDAwXSAgWzk5OTk5NzUwMDAwMDAwXVxyXG4gICAgICAgIDogeC5jWzBdIDwgOGUxMyB8fCBuSXNCaWcgJiYgeC5jWzBdIDw9IDk5OTk5NzVlNykpKSB7XHJcblxyXG4gICAgICAgIC8vIElmIHggaXMgbmVnYXRpdmUgYW5kIG4gaXMgb2RkLCBrID0gLTAsIGVsc2UgayA9IDAuXHJcbiAgICAgICAgayA9IHgucyA8IDAgJiYgaXNPZGQobikgPyAtMCA6IDA7XHJcblxyXG4gICAgICAgIC8vIElmIHggPj0gMSwgayA9IMKxSW5maW5pdHkuXHJcbiAgICAgICAgaWYgKHguZSA+IC0xKSBrID0gMSAvIGs7XHJcblxyXG4gICAgICAgIC8vIElmIG4gaXMgbmVnYXRpdmUgcmV0dXJuIMKxMCwgZWxzZSByZXR1cm4gwrFJbmZpbml0eS5cclxuICAgICAgICByZXR1cm4gbmV3IEJpZ051bWJlcihuSXNOZWcgPyAxIC8gayA6IGspO1xyXG5cclxuICAgICAgfSBlbHNlIGlmIChQT1dfUFJFQ0lTSU9OKSB7XHJcblxyXG4gICAgICAgIC8vIFRydW5jYXRpbmcgZWFjaCBjb2VmZmljaWVudCBhcnJheSB0byBhIGxlbmd0aCBvZiBrIGFmdGVyIGVhY2ggbXVsdGlwbGljYXRpb25cclxuICAgICAgICAvLyBlcXVhdGVzIHRvIHRydW5jYXRpbmcgc2lnbmlmaWNhbnQgZGlnaXRzIHRvIFBPV19QUkVDSVNJT04gKyBbMjgsIDQxXSxcclxuICAgICAgICAvLyBpLmUuIHRoZXJlIHdpbGwgYmUgYSBtaW5pbXVtIG9mIDI4IGd1YXJkIGRpZ2l0cyByZXRhaW5lZC5cclxuICAgICAgICBrID0gbWF0aGNlaWwoUE9XX1BSRUNJU0lPTiAvIExPR19CQVNFICsgMik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChuSXNCaWcpIHtcclxuICAgICAgICBoYWxmID0gbmV3IEJpZ051bWJlcigwLjUpO1xyXG4gICAgICAgIGlmIChuSXNOZWcpIG4ucyA9IDE7XHJcbiAgICAgICAgbklzT2RkID0gaXNPZGQobik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaSA9IE1hdGguYWJzKCt2YWx1ZU9mKG4pKTtcclxuICAgICAgICBuSXNPZGQgPSBpICUgMjtcclxuICAgICAgfVxyXG5cclxuICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoT05FKTtcclxuXHJcbiAgICAgIC8vIFBlcmZvcm1zIDU0IGxvb3AgaXRlcmF0aW9ucyBmb3IgbiBvZiA5MDA3MTk5MjU0NzQwOTkxLlxyXG4gICAgICBmb3IgKDsgOykge1xyXG5cclxuICAgICAgICBpZiAobklzT2RkKSB7XHJcbiAgICAgICAgICB5ID0geS50aW1lcyh4KTtcclxuICAgICAgICAgIGlmICgheS5jKSBicmVhaztcclxuXHJcbiAgICAgICAgICBpZiAoaykge1xyXG4gICAgICAgICAgICBpZiAoeS5jLmxlbmd0aCA+IGspIHkuYy5sZW5ndGggPSBrO1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChpc01vZEV4cCkge1xyXG4gICAgICAgICAgICB5ID0geS5tb2QobSk7ICAgIC8veSA9IHkubWludXMoZGl2KHksIG0sIDAsIE1PRFVMT19NT0RFKS50aW1lcyhtKSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaSkge1xyXG4gICAgICAgICAgaSA9IG1hdGhmbG9vcihpIC8gMik7XHJcbiAgICAgICAgICBpZiAoaSA9PT0gMCkgYnJlYWs7XHJcbiAgICAgICAgICBuSXNPZGQgPSBpICUgMjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbiA9IG4udGltZXMoaGFsZik7XHJcbiAgICAgICAgICByb3VuZChuLCBuLmUgKyAxLCAxKTtcclxuXHJcbiAgICAgICAgICBpZiAobi5lID4gMTQpIHtcclxuICAgICAgICAgICAgbklzT2RkID0gaXNPZGQobik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpID0gK3ZhbHVlT2Yobik7XHJcbiAgICAgICAgICAgIGlmIChpID09PSAwKSBicmVhaztcclxuICAgICAgICAgICAgbklzT2RkID0gaSAlIDI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB4ID0geC50aW1lcyh4KTtcclxuXHJcbiAgICAgICAgaWYgKGspIHtcclxuICAgICAgICAgIGlmICh4LmMgJiYgeC5jLmxlbmd0aCA+IGspIHguYy5sZW5ndGggPSBrO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoaXNNb2RFeHApIHtcclxuICAgICAgICAgIHggPSB4Lm1vZChtKTsgICAgLy94ID0geC5taW51cyhkaXYoeCwgbSwgMCwgTU9EVUxPX01PREUpLnRpbWVzKG0pKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChpc01vZEV4cCkgcmV0dXJuIHk7XHJcbiAgICAgIGlmIChuSXNOZWcpIHkgPSBPTkUuZGl2KHkpO1xyXG5cclxuICAgICAgcmV0dXJuIG0gPyB5Lm1vZChtKSA6IGsgPyByb3VuZCh5LCBQT1dfUFJFQ0lTSU9OLCBST1VORElOR19NT0RFLCBtb3JlKSA6IHk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBhbiBpbnRlZ2VyXHJcbiAgICAgKiB1c2luZyByb3VuZGluZyBtb2RlIHJtLCBvciBST1VORElOR19NT0RFIGlmIHJtIGlzIG9taXR0ZWQuXHJcbiAgICAgKlxyXG4gICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7cm19J1xyXG4gICAgICovXHJcbiAgICBQLmludGVnZXJWYWx1ZSA9IGZ1bmN0aW9uIChybSkge1xyXG4gICAgICB2YXIgbiA9IG5ldyBCaWdOdW1iZXIodGhpcyk7XHJcbiAgICAgIGlmIChybSA9PSBudWxsKSBybSA9IFJPVU5ESU5HX01PREU7XHJcbiAgICAgIGVsc2UgaW50Q2hlY2socm0sIDAsIDgpO1xyXG4gICAgICByZXR1cm4gcm91bmQobiwgbi5lICsgMSwgcm0pO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBlcXVhbCB0byB0aGUgdmFsdWUgb2YgQmlnTnVtYmVyKHksIGIpLFxyXG4gICAgICogb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc0VxdWFsVG8gPSBQLmVxID0gZnVuY3Rpb24gKHksIGIpIHtcclxuICAgICAgcmV0dXJuIGNvbXBhcmUodGhpcywgbmV3IEJpZ051bWJlcih5LCBiKSkgPT09IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGEgZmluaXRlIG51bWJlciwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc0Zpbml0ZSA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuICEhdGhpcy5jO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBncmVhdGVyIHRoYW4gdGhlIHZhbHVlIG9mIEJpZ051bWJlcih5LCBiKSxcclxuICAgICAqIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuaXNHcmVhdGVyVGhhbiA9IFAuZ3QgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICByZXR1cm4gY29tcGFyZSh0aGlzLCBuZXcgQmlnTnVtYmVyKHksIGIpKSA+IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZ051bWJlcih5LCBiKSwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc0dyZWF0ZXJUaGFuT3JFcXVhbFRvID0gUC5ndGUgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICByZXR1cm4gKGIgPSBjb21wYXJlKHRoaXMsIG5ldyBCaWdOdW1iZXIoeSwgYikpKSA9PT0gMSB8fCBiID09PSAwO1xyXG5cclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgYW4gaW50ZWdlciwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc0ludGVnZXIgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiAhIXRoaXMuYyAmJiBiaXRGbG9vcih0aGlzLmUgLyBMT0dfQkFTRSkgPiB0aGlzLmMubGVuZ3RoIC0gMjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgbGVzcyB0aGFuIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXIoeSwgYiksXHJcbiAgICAgKiBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmlzTGVzc1RoYW4gPSBQLmx0ID0gZnVuY3Rpb24gKHksIGIpIHtcclxuICAgICAgcmV0dXJuIGNvbXBhcmUodGhpcywgbmV3IEJpZ051bWJlcih5LCBiKSkgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWdOdW1iZXIoeSwgYiksIG90aGVyd2lzZSByZXR1cm4gZmFsc2UuXHJcbiAgICAgKi9cclxuICAgIFAuaXNMZXNzVGhhbk9yRXF1YWxUbyA9IFAubHRlID0gZnVuY3Rpb24gKHksIGIpIHtcclxuICAgICAgcmV0dXJuIChiID0gY29tcGFyZSh0aGlzLCBuZXcgQmlnTnVtYmVyKHksIGIpKSkgPT09IC0xIHx8IGIgPT09IDA7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIE5hTiwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc05hTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuICF0aGlzLnM7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRydWUgaWYgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGlzIG5lZ2F0aXZlLCBvdGhlcndpc2UgcmV0dXJuIGZhbHNlLlxyXG4gICAgICovXHJcbiAgICBQLmlzTmVnYXRpdmUgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnMgPCAwO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiB0cnVlIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyBwb3NpdGl2ZSwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc1Bvc2l0aXZlID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gdGhpcy5zID4gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gdHJ1ZSBpZiB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaXMgMCBvciAtMCwgb3RoZXJ3aXNlIHJldHVybiBmYWxzZS5cclxuICAgICAqL1xyXG4gICAgUC5pc1plcm8gPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiAhIXRoaXMuYyAmJiB0aGlzLmNbMF0gPT0gMDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgbiAtIDAgPSBuXHJcbiAgICAgKiAgbiAtIE4gPSBOXHJcbiAgICAgKiAgbiAtIEkgPSAtSVxyXG4gICAgICogIDAgLSBuID0gLW5cclxuICAgICAqICAwIC0gMCA9IDBcclxuICAgICAqICAwIC0gTiA9IE5cclxuICAgICAqICAwIC0gSSA9IC1JXHJcbiAgICAgKiAgTiAtIG4gPSBOXHJcbiAgICAgKiAgTiAtIDAgPSBOXHJcbiAgICAgKiAgTiAtIE4gPSBOXHJcbiAgICAgKiAgTiAtIEkgPSBOXHJcbiAgICAgKiAgSSAtIG4gPSBJXHJcbiAgICAgKiAgSSAtIDAgPSBJXHJcbiAgICAgKiAgSSAtIE4gPSBOXHJcbiAgICAgKiAgSSAtIEkgPSBOXHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgbWludXMgdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWdOdW1iZXIoeSwgYikuXHJcbiAgICAgKi9cclxuICAgIFAubWludXMgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICB2YXIgaSwgaiwgdCwgeExUeSxcclxuICAgICAgICB4ID0gdGhpcyxcclxuICAgICAgICBhID0geC5zO1xyXG5cclxuICAgICAgeSA9IG5ldyBCaWdOdW1iZXIoeSwgYik7XHJcbiAgICAgIGIgPSB5LnM7XHJcblxyXG4gICAgICAvLyBFaXRoZXIgTmFOP1xyXG4gICAgICBpZiAoIWEgfHwgIWIpIHJldHVybiBuZXcgQmlnTnVtYmVyKE5hTik7XHJcblxyXG4gICAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICAgIGlmIChhICE9IGIpIHtcclxuICAgICAgICB5LnMgPSAtYjtcclxuICAgICAgICByZXR1cm4geC5wbHVzKHkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgeGUgPSB4LmUgLyBMT0dfQkFTRSxcclxuICAgICAgICB5ZSA9IHkuZSAvIExPR19CQVNFLFxyXG4gICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgaWYgKCF4ZSB8fCAheWUpIHtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIEluZmluaXR5P1xyXG4gICAgICAgIGlmICgheGMgfHwgIXljKSByZXR1cm4geGMgPyAoeS5zID0gLWIsIHkpIDogbmV3IEJpZ051bWJlcih5YyA/IHggOiBOYU4pO1xyXG5cclxuICAgICAgICAvLyBFaXRoZXIgemVybz9cclxuICAgICAgICBpZiAoIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAgIC8vIFJldHVybiB5IGlmIHkgaXMgbm9uLXplcm8sIHggaWYgeCBpcyBub24temVybywgb3IgemVybyBpZiBib3RoIGFyZSB6ZXJvLlxyXG4gICAgICAgICAgcmV0dXJuIHljWzBdID8gKHkucyA9IC1iLCB5KSA6IG5ldyBCaWdOdW1iZXIoeGNbMF0gPyB4IDpcclxuXHJcbiAgICAgICAgICAgLy8gSUVFRSA3NTQgKDIwMDgpIDYuMzogbiAtIG4gPSAtMCB3aGVuIHJvdW5kaW5nIHRvIC1JbmZpbml0eVxyXG4gICAgICAgICAgIFJPVU5ESU5HX01PREUgPT0gMyA/IC0wIDogMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICB4ZSA9IGJpdEZsb29yKHhlKTtcclxuICAgICAgeWUgPSBiaXRGbG9vcih5ZSk7XHJcbiAgICAgIHhjID0geGMuc2xpY2UoKTtcclxuXHJcbiAgICAgIC8vIERldGVybWluZSB3aGljaCBpcyB0aGUgYmlnZ2VyIG51bWJlci5cclxuICAgICAgaWYgKGEgPSB4ZSAtIHllKSB7XHJcblxyXG4gICAgICAgIGlmICh4TFR5ID0gYSA8IDApIHtcclxuICAgICAgICAgIGEgPSAtYTtcclxuICAgICAgICAgIHQgPSB4YztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHQucmV2ZXJzZSgpO1xyXG5cclxuICAgICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy5cclxuICAgICAgICBmb3IgKGIgPSBhOyBiLS07IHQucHVzaCgwKSk7XHJcbiAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcblxyXG4gICAgICAgIC8vIEV4cG9uZW50cyBlcXVhbC4gQ2hlY2sgZGlnaXQgYnkgZGlnaXQuXHJcbiAgICAgICAgaiA9ICh4TFR5ID0gKGEgPSB4Yy5sZW5ndGgpIDwgKGIgPSB5Yy5sZW5ndGgpKSA/IGEgOiBiO1xyXG5cclxuICAgICAgICBmb3IgKGEgPSBiID0gMDsgYiA8IGo7IGIrKykge1xyXG5cclxuICAgICAgICAgIGlmICh4Y1tiXSAhPSB5Y1tiXSkge1xyXG4gICAgICAgICAgICB4TFR5ID0geGNbYl0gPCB5Y1tiXTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB4IDwgeT8gUG9pbnQgeGMgdG8gdGhlIGFycmF5IG9mIHRoZSBiaWdnZXIgbnVtYmVyLlxyXG4gICAgICBpZiAoeExUeSkgdCA9IHhjLCB4YyA9IHljLCB5YyA9IHQsIHkucyA9IC15LnM7XHJcblxyXG4gICAgICBiID0gKGogPSB5Yy5sZW5ndGgpIC0gKGkgPSB4Yy5sZW5ndGgpO1xyXG5cclxuICAgICAgLy8gQXBwZW5kIHplcm9zIHRvIHhjIGlmIHNob3J0ZXIuXHJcbiAgICAgIC8vIE5vIG5lZWQgdG8gYWRkIHplcm9zIHRvIHljIGlmIHNob3J0ZXIgYXMgc3VidHJhY3Qgb25seSBuZWVkcyB0byBzdGFydCBhdCB5Yy5sZW5ndGguXHJcbiAgICAgIGlmIChiID4gMCkgZm9yICg7IGItLTsgeGNbaSsrXSA9IDApO1xyXG4gICAgICBiID0gQkFTRSAtIDE7XHJcblxyXG4gICAgICAvLyBTdWJ0cmFjdCB5YyBmcm9tIHhjLlxyXG4gICAgICBmb3IgKDsgaiA+IGE7KSB7XHJcblxyXG4gICAgICAgIGlmICh4Y1stLWpdIDwgeWNbal0pIHtcclxuICAgICAgICAgIGZvciAoaSA9IGo7IGkgJiYgIXhjWy0taV07IHhjW2ldID0gYik7XHJcbiAgICAgICAgICAtLXhjW2ldO1xyXG4gICAgICAgICAgeGNbal0gKz0gQkFTRTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHhjW2pdIC09IHljW2pdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBSZW1vdmUgbGVhZGluZyB6ZXJvcyBhbmQgYWRqdXN0IGV4cG9uZW50IGFjY29yZGluZ2x5LlxyXG4gICAgICBmb3IgKDsgeGNbMF0gPT0gMDsgeGMuc3BsaWNlKDAsIDEpLCAtLXllKTtcclxuXHJcbiAgICAgIC8vIFplcm8/XHJcbiAgICAgIGlmICgheGNbMF0pIHtcclxuXHJcbiAgICAgICAgLy8gRm9sbG93aW5nIElFRUUgNzU0ICgyMDA4KSA2LjMsXHJcbiAgICAgICAgLy8gbiAtIG4gPSArMCAgYnV0ICBuIC0gbiA9IC0wICB3aGVuIHJvdW5kaW5nIHRvd2FyZHMgLUluZmluaXR5LlxyXG4gICAgICAgIHkucyA9IFJPVU5ESU5HX01PREUgPT0gMyA/IC0xIDogMTtcclxuICAgICAgICB5LmMgPSBbeS5lID0gMF07XHJcbiAgICAgICAgcmV0dXJuIHk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIE5vIG5lZWQgdG8gY2hlY2sgZm9yIEluZmluaXR5IGFzICt4IC0gK3kgIT0gSW5maW5pdHkgJiYgLXggLSAteSAhPSBJbmZpbml0eVxyXG4gICAgICAvLyBmb3IgZmluaXRlIHggYW5kIHkuXHJcbiAgICAgIHJldHVybiBub3JtYWxpc2UoeSwgeGMsIHllKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgIG4gJSAwID0gIE5cclxuICAgICAqICAgbiAlIE4gPSAgTlxyXG4gICAgICogICBuICUgSSA9ICBuXHJcbiAgICAgKiAgIDAgJSBuID0gIDBcclxuICAgICAqICAtMCAlIG4gPSAtMFxyXG4gICAgICogICAwICUgMCA9ICBOXHJcbiAgICAgKiAgIDAgJSBOID0gIE5cclxuICAgICAqICAgMCAlIEkgPSAgMFxyXG4gICAgICogICBOICUgbiA9ICBOXHJcbiAgICAgKiAgIE4gJSAwID0gIE5cclxuICAgICAqICAgTiAlIE4gPSAgTlxyXG4gICAgICogICBOICUgSSA9ICBOXHJcbiAgICAgKiAgIEkgJSBuID0gIE5cclxuICAgICAqICAgSSAlIDAgPSAgTlxyXG4gICAgICogICBJICUgTiA9ICBOXHJcbiAgICAgKiAgIEkgJSBJID0gIE5cclxuICAgICAqXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBtb2R1bG8gdGhlIHZhbHVlIG9mXHJcbiAgICAgKiBCaWdOdW1iZXIoeSwgYikuIFRoZSByZXN1bHQgZGVwZW5kcyBvbiB0aGUgdmFsdWUgb2YgTU9EVUxPX01PREUuXHJcbiAgICAgKi9cclxuICAgIFAubW9kdWxvID0gUC5tb2QgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICB2YXIgcSwgcyxcclxuICAgICAgICB4ID0gdGhpcztcclxuXHJcbiAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKHksIGIpO1xyXG5cclxuICAgICAgLy8gUmV0dXJuIE5hTiBpZiB4IGlzIEluZmluaXR5IG9yIE5hTiwgb3IgeSBpcyBOYU4gb3IgemVyby5cclxuICAgICAgaWYgKCF4LmMgfHwgIXkucyB8fCB5LmMgJiYgIXkuY1swXSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgQmlnTnVtYmVyKE5hTik7XHJcblxyXG4gICAgICAvLyBSZXR1cm4geCBpZiB5IGlzIEluZmluaXR5IG9yIHggaXMgemVyby5cclxuICAgICAgfSBlbHNlIGlmICgheS5jIHx8IHguYyAmJiAheC5jWzBdKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoeCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChNT0RVTE9fTU9ERSA9PSA5KSB7XHJcblxyXG4gICAgICAgIC8vIEV1Y2xpZGlhbiBkaXZpc2lvbjogcSA9IHNpZ24oeSkgKiBmbG9vcih4IC8gYWJzKHkpKVxyXG4gICAgICAgIC8vIHIgPSB4IC0gcXkgICAgd2hlcmUgIDAgPD0gciA8IGFicyh5KVxyXG4gICAgICAgIHMgPSB5LnM7XHJcbiAgICAgICAgeS5zID0gMTtcclxuICAgICAgICBxID0gZGl2KHgsIHksIDAsIDMpO1xyXG4gICAgICAgIHkucyA9IHM7XHJcbiAgICAgICAgcS5zICo9IHM7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcSA9IGRpdih4LCB5LCAwLCBNT0RVTE9fTU9ERSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHkgPSB4Lm1pbnVzKHEudGltZXMoeSkpO1xyXG5cclxuICAgICAgLy8gVG8gbWF0Y2ggSmF2YVNjcmlwdCAlLCBlbnN1cmUgc2lnbiBvZiB6ZXJvIGlzIHNpZ24gb2YgZGl2aWRlbmQuXHJcbiAgICAgIGlmICgheS5jWzBdICYmIE1PRFVMT19NT0RFID09IDEpIHkucyA9IHgucztcclxuXHJcbiAgICAgIHJldHVybiB5O1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqICBuICogMCA9IDBcclxuICAgICAqICBuICogTiA9IE5cclxuICAgICAqICBuICogSSA9IElcclxuICAgICAqICAwICogbiA9IDBcclxuICAgICAqICAwICogMCA9IDBcclxuICAgICAqICAwICogTiA9IE5cclxuICAgICAqICAwICogSSA9IE5cclxuICAgICAqICBOICogbiA9IE5cclxuICAgICAqICBOICogMCA9IE5cclxuICAgICAqICBOICogTiA9IE5cclxuICAgICAqICBOICogSSA9IE5cclxuICAgICAqICBJICogbiA9IElcclxuICAgICAqICBJICogMCA9IE5cclxuICAgICAqICBJICogTiA9IE5cclxuICAgICAqICBJICogSSA9IElcclxuICAgICAqXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBtdWx0aXBsaWVkIGJ5IHRoZSB2YWx1ZVxyXG4gICAgICogb2YgQmlnTnVtYmVyKHksIGIpLlxyXG4gICAgICovXHJcbiAgICBQLm11bHRpcGxpZWRCeSA9IFAudGltZXMgPSBmdW5jdGlvbiAoeSwgYikge1xyXG4gICAgICB2YXIgYywgZSwgaSwgaiwgaywgbSwgeGNMLCB4bG8sIHhoaSwgeWNMLCB5bG8sIHloaSwgemMsXHJcbiAgICAgICAgYmFzZSwgc3FydEJhc2UsXHJcbiAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgeGMgPSB4LmMsXHJcbiAgICAgICAgeWMgPSAoeSA9IG5ldyBCaWdOdW1iZXIoeSwgYikpLmM7XHJcblxyXG4gICAgICAvLyBFaXRoZXIgTmFOLCDCsUluZmluaXR5IG9yIMKxMD9cclxuICAgICAgaWYgKCF4YyB8fCAheWMgfHwgIXhjWzBdIHx8ICF5Y1swXSkge1xyXG5cclxuICAgICAgICAvLyBSZXR1cm4gTmFOIGlmIGVpdGhlciBpcyBOYU4sIG9yIG9uZSBpcyAwIGFuZCB0aGUgb3RoZXIgaXMgSW5maW5pdHkuXHJcbiAgICAgICAgaWYgKCF4LnMgfHwgIXkucyB8fCB4YyAmJiAheGNbMF0gJiYgIXljIHx8IHljICYmICF5Y1swXSAmJiAheGMpIHtcclxuICAgICAgICAgIHkuYyA9IHkuZSA9IHkucyA9IG51bGw7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHkucyAqPSB4LnM7XHJcblxyXG4gICAgICAgICAgLy8gUmV0dXJuIMKxSW5maW5pdHkgaWYgZWl0aGVyIGlzIMKxSW5maW5pdHkuXHJcbiAgICAgICAgICBpZiAoIXhjIHx8ICF5Yykge1xyXG4gICAgICAgICAgICB5LmMgPSB5LmUgPSBudWxsO1xyXG5cclxuICAgICAgICAgIC8vIFJldHVybiDCsTAgaWYgZWl0aGVyIGlzIMKxMC5cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHkuYyA9IFswXTtcclxuICAgICAgICAgICAgeS5lID0gMDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB5O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBlID0gYml0Rmxvb3IoeC5lIC8gTE9HX0JBU0UpICsgYml0Rmxvb3IoeS5lIC8gTE9HX0JBU0UpO1xyXG4gICAgICB5LnMgKj0geC5zO1xyXG4gICAgICB4Y0wgPSB4Yy5sZW5ndGg7XHJcbiAgICAgIHljTCA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIEVuc3VyZSB4YyBwb2ludHMgdG8gbG9uZ2VyIGFycmF5IGFuZCB4Y0wgdG8gaXRzIGxlbmd0aC5cclxuICAgICAgaWYgKHhjTCA8IHljTCkgemMgPSB4YywgeGMgPSB5YywgeWMgPSB6YywgaSA9IHhjTCwgeGNMID0geWNMLCB5Y0wgPSBpO1xyXG5cclxuICAgICAgLy8gSW5pdGlhbGlzZSB0aGUgcmVzdWx0IGFycmF5IHdpdGggemVyb3MuXHJcbiAgICAgIGZvciAoaSA9IHhjTCArIHljTCwgemMgPSBbXTsgaS0tOyB6Yy5wdXNoKDApKTtcclxuXHJcbiAgICAgIGJhc2UgPSBCQVNFO1xyXG4gICAgICBzcXJ0QmFzZSA9IFNRUlRfQkFTRTtcclxuXHJcbiAgICAgIGZvciAoaSA9IHljTDsgLS1pID49IDA7KSB7XHJcbiAgICAgICAgYyA9IDA7XHJcbiAgICAgICAgeWxvID0geWNbaV0gJSBzcXJ0QmFzZTtcclxuICAgICAgICB5aGkgPSB5Y1tpXSAvIHNxcnRCYXNlIHwgMDtcclxuXHJcbiAgICAgICAgZm9yIChrID0geGNMLCBqID0gaSArIGs7IGogPiBpOykge1xyXG4gICAgICAgICAgeGxvID0geGNbLS1rXSAlIHNxcnRCYXNlO1xyXG4gICAgICAgICAgeGhpID0geGNba10gLyBzcXJ0QmFzZSB8IDA7XHJcbiAgICAgICAgICBtID0geWhpICogeGxvICsgeGhpICogeWxvO1xyXG4gICAgICAgICAgeGxvID0geWxvICogeGxvICsgKChtICUgc3FydEJhc2UpICogc3FydEJhc2UpICsgemNbal0gKyBjO1xyXG4gICAgICAgICAgYyA9ICh4bG8gLyBiYXNlIHwgMCkgKyAobSAvIHNxcnRCYXNlIHwgMCkgKyB5aGkgKiB4aGk7XHJcbiAgICAgICAgICB6Y1tqLS1dID0geGxvICUgYmFzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHpjW2pdID0gYztcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGMpIHtcclxuICAgICAgICArK2U7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgemMuc3BsaWNlKDAsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gbm9ybWFsaXNlKHksIHpjLCBlKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBuZXcgQmlnTnVtYmVyIHdob3NlIHZhbHVlIGlzIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBuZWdhdGVkLFxyXG4gICAgICogaS5lLiBtdWx0aXBsaWVkIGJ5IC0xLlxyXG4gICAgICovXHJcbiAgICBQLm5lZ2F0ZWQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciB4ID0gbmV3IEJpZ051bWJlcih0aGlzKTtcclxuICAgICAgeC5zID0gLXgucyB8fCBudWxsO1xyXG4gICAgICByZXR1cm4geDtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiAgbiArIDAgPSBuXHJcbiAgICAgKiAgbiArIE4gPSBOXHJcbiAgICAgKiAgbiArIEkgPSBJXHJcbiAgICAgKiAgMCArIG4gPSBuXHJcbiAgICAgKiAgMCArIDAgPSAwXHJcbiAgICAgKiAgMCArIE4gPSBOXHJcbiAgICAgKiAgMCArIEkgPSBJXHJcbiAgICAgKiAgTiArIG4gPSBOXHJcbiAgICAgKiAgTiArIDAgPSBOXHJcbiAgICAgKiAgTiArIE4gPSBOXHJcbiAgICAgKiAgTiArIEkgPSBOXHJcbiAgICAgKiAgSSArIG4gPSBJXHJcbiAgICAgKiAgSSArIDAgPSBJXHJcbiAgICAgKiAgSSArIE4gPSBOXHJcbiAgICAgKiAgSSArIEkgPSBJXHJcbiAgICAgKlxyXG4gICAgICogUmV0dXJuIGEgbmV3IEJpZ051bWJlciB3aG9zZSB2YWx1ZSBpcyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcGx1cyB0aGUgdmFsdWUgb2ZcclxuICAgICAqIEJpZ051bWJlcih5LCBiKS5cclxuICAgICAqL1xyXG4gICAgUC5wbHVzID0gZnVuY3Rpb24gKHksIGIpIHtcclxuICAgICAgdmFyIHQsXHJcbiAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgYSA9IHgucztcclxuXHJcbiAgICAgIHkgPSBuZXcgQmlnTnVtYmVyKHksIGIpO1xyXG4gICAgICBiID0geS5zO1xyXG5cclxuICAgICAgLy8gRWl0aGVyIE5hTj9cclxuICAgICAgaWYgKCFhIHx8ICFiKSByZXR1cm4gbmV3IEJpZ051bWJlcihOYU4pO1xyXG5cclxuICAgICAgLy8gU2lnbnMgZGlmZmVyP1xyXG4gICAgICAgaWYgKGEgIT0gYikge1xyXG4gICAgICAgIHkucyA9IC1iO1xyXG4gICAgICAgIHJldHVybiB4Lm1pbnVzKHkpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICB2YXIgeGUgPSB4LmUgLyBMT0dfQkFTRSxcclxuICAgICAgICB5ZSA9IHkuZSAvIExPR19CQVNFLFxyXG4gICAgICAgIHhjID0geC5jLFxyXG4gICAgICAgIHljID0geS5jO1xyXG5cclxuICAgICAgaWYgKCF4ZSB8fCAheWUpIHtcclxuXHJcbiAgICAgICAgLy8gUmV0dXJuIMKxSW5maW5pdHkgaWYgZWl0aGVyIMKxSW5maW5pdHkuXHJcbiAgICAgICAgaWYgKCF4YyB8fCAheWMpIHJldHVybiBuZXcgQmlnTnVtYmVyKGEgLyAwKTtcclxuXHJcbiAgICAgICAgLy8gRWl0aGVyIHplcm8/XHJcbiAgICAgICAgLy8gUmV0dXJuIHkgaWYgeSBpcyBub24temVybywgeCBpZiB4IGlzIG5vbi16ZXJvLCBvciB6ZXJvIGlmIGJvdGggYXJlIHplcm8uXHJcbiAgICAgICAgaWYgKCF4Y1swXSB8fCAheWNbMF0pIHJldHVybiB5Y1swXSA/IHkgOiBuZXcgQmlnTnVtYmVyKHhjWzBdID8geCA6IGEgKiAwKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgeGUgPSBiaXRGbG9vcih4ZSk7XHJcbiAgICAgIHllID0gYml0Rmxvb3IoeWUpO1xyXG4gICAgICB4YyA9IHhjLnNsaWNlKCk7XHJcblxyXG4gICAgICAvLyBQcmVwZW5kIHplcm9zIHRvIGVxdWFsaXNlIGV4cG9uZW50cy4gRmFzdGVyIHRvIHVzZSByZXZlcnNlIHRoZW4gZG8gdW5zaGlmdHMuXHJcbiAgICAgIGlmIChhID0geGUgLSB5ZSkge1xyXG4gICAgICAgIGlmIChhID4gMCkge1xyXG4gICAgICAgICAgeWUgPSB4ZTtcclxuICAgICAgICAgIHQgPSB5YztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYSA9IC1hO1xyXG4gICAgICAgICAgdCA9IHhjO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgZm9yICg7IGEtLTsgdC5wdXNoKDApKTtcclxuICAgICAgICB0LnJldmVyc2UoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgYSA9IHhjLmxlbmd0aDtcclxuICAgICAgYiA9IHljLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIFBvaW50IHhjIHRvIHRoZSBsb25nZXIgYXJyYXksIGFuZCBiIHRvIHRoZSBzaG9ydGVyIGxlbmd0aC5cclxuICAgICAgaWYgKGEgLSBiIDwgMCkgdCA9IHljLCB5YyA9IHhjLCB4YyA9IHQsIGIgPSBhO1xyXG5cclxuICAgICAgLy8gT25seSBzdGFydCBhZGRpbmcgYXQgeWMubGVuZ3RoIC0gMSBhcyB0aGUgZnVydGhlciBkaWdpdHMgb2YgeGMgY2FuIGJlIGlnbm9yZWQuXHJcbiAgICAgIGZvciAoYSA9IDA7IGI7KSB7XHJcbiAgICAgICAgYSA9ICh4Y1stLWJdID0geGNbYl0gKyB5Y1tiXSArIGEpIC8gQkFTRSB8IDA7XHJcbiAgICAgICAgeGNbYl0gPSBCQVNFID09PSB4Y1tiXSA/IDAgOiB4Y1tiXSAlIEJBU0U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChhKSB7XHJcbiAgICAgICAgeGMgPSBbYV0uY29uY2F0KHhjKTtcclxuICAgICAgICArK3llO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBObyBuZWVkIHRvIGNoZWNrIGZvciB6ZXJvLCBhcyAreCArICt5ICE9IDAgJiYgLXggKyAteSAhPSAwXHJcbiAgICAgIC8vIHllID0gTUFYX0VYUCArIDEgcG9zc2libGVcclxuICAgICAgcmV0dXJuIG5vcm1hbGlzZSh5LCB4YywgeWUpO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIElmIHNkIGlzIHVuZGVmaW5lZCBvciBudWxsIG9yIHRydWUgb3IgZmFsc2UsIHJldHVybiB0aGUgbnVtYmVyIG9mIHNpZ25pZmljYW50IGRpZ2l0cyBvZlxyXG4gICAgICogdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyLCBvciBudWxsIGlmIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpcyDCsUluZmluaXR5IG9yIE5hTi5cclxuICAgICAqIElmIHNkIGlzIHRydWUgaW5jbHVkZSBpbnRlZ2VyLXBhcnQgdHJhaWxpbmcgemVyb3MgaW4gdGhlIGNvdW50LlxyXG4gICAgICpcclxuICAgICAqIE90aGVyd2lzZSwgaWYgc2QgaXMgYSBudW1iZXIsIHJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXNcclxuICAgICAqIEJpZ051bWJlciByb3VuZGVkIHRvIGEgbWF4aW11bSBvZiBzZCBzaWduaWZpY2FudCBkaWdpdHMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3JcclxuICAgICAqIFJPVU5ESU5HX01PREUgaWYgcm0gaXMgb21pdHRlZC5cclxuICAgICAqXHJcbiAgICAgKiBzZCB7bnVtYmVyfGJvb2xlYW59IG51bWJlcjogc2lnbmlmaWNhbnQgZGlnaXRzOiBpbnRlZ2VyLCAxIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgIGJvb2xlYW46IHdoZXRoZXIgdG8gY291bnQgaW50ZWdlci1wYXJ0IHRyYWlsaW5nIHplcm9zOiB0cnVlIG9yIGZhbHNlLlxyXG4gICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7c2R8cm19J1xyXG4gICAgICovXHJcbiAgICBQLnByZWNpc2lvbiA9IFAuc2QgPSBmdW5jdGlvbiAoc2QsIHJtKSB7XHJcbiAgICAgIHZhciBjLCBuLCB2LFxyXG4gICAgICAgIHggPSB0aGlzO1xyXG5cclxuICAgICAgaWYgKHNkICE9IG51bGwgJiYgc2QgIT09ICEhc2QpIHtcclxuICAgICAgICBpbnRDaGVjayhzZCwgMSwgTUFYKTtcclxuICAgICAgICBpZiAocm0gPT0gbnVsbCkgcm0gPSBST1VORElOR19NT0RFO1xyXG4gICAgICAgIGVsc2UgaW50Q2hlY2socm0sIDAsIDgpO1xyXG5cclxuICAgICAgICByZXR1cm4gcm91bmQobmV3IEJpZ051bWJlcih4KSwgc2QsIHJtKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCEoYyA9IHguYykpIHJldHVybiBudWxsO1xyXG4gICAgICB2ID0gYy5sZW5ndGggLSAxO1xyXG4gICAgICBuID0gdiAqIExPR19CQVNFICsgMTtcclxuXHJcbiAgICAgIGlmICh2ID0gY1t2XSkge1xyXG5cclxuICAgICAgICAvLyBTdWJ0cmFjdCB0aGUgbnVtYmVyIG9mIHRyYWlsaW5nIHplcm9zIG9mIHRoZSBsYXN0IGVsZW1lbnQuXHJcbiAgICAgICAgZm9yICg7IHYgJSAxMCA9PSAwOyB2IC89IDEwLCBuLS0pO1xyXG5cclxuICAgICAgICAvLyBBZGQgdGhlIG51bWJlciBvZiBkaWdpdHMgb2YgdGhlIGZpcnN0IGVsZW1lbnQuXHJcbiAgICAgICAgZm9yICh2ID0gY1swXTsgdiA+PSAxMDsgdiAvPSAxMCwgbisrKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHNkICYmIHguZSArIDEgPiBuKSBuID0geC5lICsgMTtcclxuXHJcbiAgICAgIHJldHVybiBuO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIHNoaWZ0ZWQgYnkgayBwbGFjZXNcclxuICAgICAqIChwb3dlcnMgb2YgMTApLiBTaGlmdCB0byB0aGUgcmlnaHQgaWYgbiA+IDAsIGFuZCB0byB0aGUgbGVmdCBpZiBuIDwgMC5cclxuICAgICAqXHJcbiAgICAgKiBrIHtudW1iZXJ9IEludGVnZXIsIC1NQVhfU0FGRV9JTlRFR0VSIHRvIE1BWF9TQUZFX0lOVEVHRVIgaW5jbHVzaXZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7a30nXHJcbiAgICAgKi9cclxuICAgIFAuc2hpZnRlZEJ5ID0gZnVuY3Rpb24gKGspIHtcclxuICAgICAgaW50Q2hlY2soaywgLU1BWF9TQUZFX0lOVEVHRVIsIE1BWF9TQUZFX0lOVEVHRVIpO1xyXG4gICAgICByZXR1cm4gdGhpcy50aW1lcygnMWUnICsgayk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogIHNxcnQoLW4pID0gIE5cclxuICAgICAqICBzcXJ0KE4pID0gIE5cclxuICAgICAqICBzcXJ0KC1JKSA9ICBOXHJcbiAgICAgKiAgc3FydChJKSA9ICBJXHJcbiAgICAgKiAgc3FydCgwKSA9ICAwXHJcbiAgICAgKiAgc3FydCgtMCkgPSAtMFxyXG4gICAgICpcclxuICAgICAqIFJldHVybiBhIG5ldyBCaWdOdW1iZXIgd2hvc2UgdmFsdWUgaXMgdGhlIHNxdWFyZSByb290IG9mIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlcixcclxuICAgICAqIHJvdW5kZWQgYWNjb3JkaW5nIHRvIERFQ0lNQUxfUExBQ0VTIGFuZCBST1VORElOR19NT0RFLlxyXG4gICAgICovXHJcbiAgICBQLnNxdWFyZVJvb3QgPSBQLnNxcnQgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHZhciBtLCBuLCByLCByZXAsIHQsXHJcbiAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgYyA9IHguYyxcclxuICAgICAgICBzID0geC5zLFxyXG4gICAgICAgIGUgPSB4LmUsXHJcbiAgICAgICAgZHAgPSBERUNJTUFMX1BMQUNFUyArIDQsXHJcbiAgICAgICAgaGFsZiA9IG5ldyBCaWdOdW1iZXIoJzAuNScpO1xyXG5cclxuICAgICAgLy8gTmVnYXRpdmUvTmFOL0luZmluaXR5L3plcm8/XHJcbiAgICAgIGlmIChzICE9PSAxIHx8ICFjIHx8ICFjWzBdKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBCaWdOdW1iZXIoIXMgfHwgcyA8IDAgJiYgKCFjIHx8IGNbMF0pID8gTmFOIDogYyA/IHggOiAxIC8gMCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIEluaXRpYWwgZXN0aW1hdGUuXHJcbiAgICAgIHMgPSBNYXRoLnNxcnQoK3ZhbHVlT2YoeCkpO1xyXG5cclxuICAgICAgLy8gTWF0aC5zcXJ0IHVuZGVyZmxvdy9vdmVyZmxvdz9cclxuICAgICAgLy8gUGFzcyB4IHRvIE1hdGguc3FydCBhcyBpbnRlZ2VyLCB0aGVuIGFkanVzdCB0aGUgZXhwb25lbnQgb2YgdGhlIHJlc3VsdC5cclxuICAgICAgaWYgKHMgPT0gMCB8fCBzID09IDEgLyAwKSB7XHJcbiAgICAgICAgbiA9IGNvZWZmVG9TdHJpbmcoYyk7XHJcbiAgICAgICAgaWYgKChuLmxlbmd0aCArIGUpICUgMiA9PSAwKSBuICs9ICcwJztcclxuICAgICAgICBzID0gTWF0aC5zcXJ0KCtuKTtcclxuICAgICAgICBlID0gYml0Rmxvb3IoKGUgKyAxKSAvIDIpIC0gKGUgPCAwIHx8IGUgJSAyKTtcclxuXHJcbiAgICAgICAgaWYgKHMgPT0gMSAvIDApIHtcclxuICAgICAgICAgIG4gPSAnMWUnICsgZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbiA9IHMudG9FeHBvbmVudGlhbCgpO1xyXG4gICAgICAgICAgbiA9IG4uc2xpY2UoMCwgbi5pbmRleE9mKCdlJykgKyAxKSArIGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByID0gbmV3IEJpZ051bWJlcihuKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByID0gbmV3IEJpZ051bWJlcihzICsgJycpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBDaGVjayBmb3IgemVyby5cclxuICAgICAgLy8gciBjb3VsZCBiZSB6ZXJvIGlmIE1JTl9FWFAgaXMgY2hhbmdlZCBhZnRlciB0aGUgdGhpcyB2YWx1ZSB3YXMgY3JlYXRlZC5cclxuICAgICAgLy8gVGhpcyB3b3VsZCBjYXVzZSBhIGRpdmlzaW9uIGJ5IHplcm8gKHgvdCkgYW5kIGhlbmNlIEluZmluaXR5IGJlbG93LCB3aGljaCB3b3VsZCBjYXVzZVxyXG4gICAgICAvLyBjb2VmZlRvU3RyaW5nIHRvIHRocm93LlxyXG4gICAgICBpZiAoci5jWzBdKSB7XHJcbiAgICAgICAgZSA9IHIuZTtcclxuICAgICAgICBzID0gZSArIGRwO1xyXG4gICAgICAgIGlmIChzIDwgMykgcyA9IDA7XHJcblxyXG4gICAgICAgIC8vIE5ld3Rvbi1SYXBoc29uIGl0ZXJhdGlvbi5cclxuICAgICAgICBmb3IgKDsgOykge1xyXG4gICAgICAgICAgdCA9IHI7XHJcbiAgICAgICAgICByID0gaGFsZi50aW1lcyh0LnBsdXMoZGl2KHgsIHQsIGRwLCAxKSkpO1xyXG5cclxuICAgICAgICAgIGlmIChjb2VmZlRvU3RyaW5nKHQuYykuc2xpY2UoMCwgcykgPT09IChuID0gY29lZmZUb1N0cmluZyhyLmMpKS5zbGljZSgwLCBzKSkge1xyXG5cclxuICAgICAgICAgICAgLy8gVGhlIGV4cG9uZW50IG9mIHIgbWF5IGhlcmUgYmUgb25lIGxlc3MgdGhhbiB0aGUgZmluYWwgcmVzdWx0IGV4cG9uZW50LFxyXG4gICAgICAgICAgICAvLyBlLmcgMC4wMDA5OTk5IChlLTQpIC0tPiAwLjAwMSAoZS0zKSwgc28gYWRqdXN0IHMgc28gdGhlIHJvdW5kaW5nIGRpZ2l0c1xyXG4gICAgICAgICAgICAvLyBhcmUgaW5kZXhlZCBjb3JyZWN0bHkuXHJcbiAgICAgICAgICAgIGlmIChyLmUgPCBlKSAtLXM7XHJcbiAgICAgICAgICAgIG4gPSBuLnNsaWNlKHMgLSAzLCBzICsgMSk7XHJcblxyXG4gICAgICAgICAgICAvLyBUaGUgNHRoIHJvdW5kaW5nIGRpZ2l0IG1heSBiZSBpbiBlcnJvciBieSAtMSBzbyBpZiB0aGUgNCByb3VuZGluZyBkaWdpdHNcclxuICAgICAgICAgICAgLy8gYXJlIDk5OTkgb3IgNDk5OSAoaS5lLiBhcHByb2FjaGluZyBhIHJvdW5kaW5nIGJvdW5kYXJ5KSBjb250aW51ZSB0aGVcclxuICAgICAgICAgICAgLy8gaXRlcmF0aW9uLlxyXG4gICAgICAgICAgICBpZiAobiA9PSAnOTk5OScgfHwgIXJlcCAmJiBuID09ICc0OTk5Jykge1xyXG5cclxuICAgICAgICAgICAgICAvLyBPbiB0aGUgZmlyc3QgaXRlcmF0aW9uIG9ubHksIGNoZWNrIHRvIHNlZSBpZiByb3VuZGluZyB1cCBnaXZlcyB0aGVcclxuICAgICAgICAgICAgICAvLyBleGFjdCByZXN1bHQgYXMgdGhlIG5pbmVzIG1heSBpbmZpbml0ZWx5IHJlcGVhdC5cclxuICAgICAgICAgICAgICBpZiAoIXJlcCkge1xyXG4gICAgICAgICAgICAgICAgcm91bmQodCwgdC5lICsgREVDSU1BTF9QTEFDRVMgKyAyLCAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAodC50aW1lcyh0KS5lcSh4KSkge1xyXG4gICAgICAgICAgICAgICAgICByID0gdDtcclxuICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICBkcCArPSA0O1xyXG4gICAgICAgICAgICAgIHMgKz0gNDtcclxuICAgICAgICAgICAgICByZXAgPSAxO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG5cclxuICAgICAgICAgICAgICAvLyBJZiByb3VuZGluZyBkaWdpdHMgYXJlIG51bGwsIDB7MCw0fSBvciA1MHswLDN9LCBjaGVjayBmb3IgZXhhY3RcclxuICAgICAgICAgICAgICAvLyByZXN1bHQuIElmIG5vdCwgdGhlbiB0aGVyZSBhcmUgZnVydGhlciBkaWdpdHMgYW5kIG0gd2lsbCBiZSB0cnV0aHkuXHJcbiAgICAgICAgICAgICAgaWYgKCErbiB8fCAhK24uc2xpY2UoMSkgJiYgbi5jaGFyQXQoMCkgPT0gJzUnKSB7XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gVHJ1bmNhdGUgdG8gdGhlIGZpcnN0IHJvdW5kaW5nIGRpZ2l0LlxyXG4gICAgICAgICAgICAgICAgcm91bmQociwgci5lICsgREVDSU1BTF9QTEFDRVMgKyAyLCAxKTtcclxuICAgICAgICAgICAgICAgIG0gPSAhci50aW1lcyhyKS5lcSh4KTtcclxuICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gcm91bmQociwgci5lICsgREVDSU1BTF9QTEFDRVMgKyAxLCBST1VORElOR19NT0RFLCBtKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpbiBleHBvbmVudGlhbCBub3RhdGlvbiBhbmRcclxuICAgICAqIHJvdW5kZWQgdXNpbmcgUk9VTkRJTkdfTU9ERSB0byBkcCBmaXhlZCBkZWNpbWFsIHBsYWNlcy5cclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEFyZ3VtZW50IHtub3QgYSBwcmltaXRpdmUgbnVtYmVyfG5vdCBhbiBpbnRlZ2VyfG91dCBvZiByYW5nZX06IHtkcHxybX0nXHJcbiAgICAgKi9cclxuICAgIFAudG9FeHBvbmVudGlhbCA9IGZ1bmN0aW9uIChkcCwgcm0pIHtcclxuICAgICAgaWYgKGRwICE9IG51bGwpIHtcclxuICAgICAgICBpbnRDaGVjayhkcCwgMCwgTUFYKTtcclxuICAgICAgICBkcCsrO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmb3JtYXQodGhpcywgZHAsIHJtLCAxKTtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBpbiBmaXhlZC1wb2ludCBub3RhdGlvbiByb3VuZGluZ1xyXG4gICAgICogdG8gZHAgZml4ZWQgZGVjaW1hbCBwbGFjZXMgdXNpbmcgcm91bmRpbmcgbW9kZSBybSwgb3IgUk9VTkRJTkdfTU9ERSBpZiBybSBpcyBvbWl0dGVkLlxyXG4gICAgICpcclxuICAgICAqIE5vdGU6IGFzIHdpdGggSmF2YVNjcmlwdCdzIG51bWJlciB0eXBlLCAoLTApLnRvRml4ZWQoMCkgaXMgJzAnLFxyXG4gICAgICogYnV0IGUuZy4gKC0wLjAwMDAxKS50b0ZpeGVkKDApIGlzICctMCcuXHJcbiAgICAgKlxyXG4gICAgICogW2RwXSB7bnVtYmVyfSBEZWNpbWFsIHBsYWNlcy4gSW50ZWdlciwgMCB0byBNQVggaW5jbHVzaXZlLlxyXG4gICAgICogW3JtXSB7bnVtYmVyfSBSb3VuZGluZyBtb2RlLiBJbnRlZ2VyLCAwIHRvIDggaW5jbHVzaXZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7ZHB8cm19J1xyXG4gICAgICovXHJcbiAgICBQLnRvRml4ZWQgPSBmdW5jdGlvbiAoZHAsIHJtKSB7XHJcbiAgICAgIGlmIChkcCAhPSBudWxsKSB7XHJcbiAgICAgICAgaW50Q2hlY2soZHAsIDAsIE1BWCk7XHJcbiAgICAgICAgZHAgPSBkcCArIHRoaXMuZSArIDE7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGZvcm1hdCh0aGlzLCBkcCwgcm0pO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgLypcclxuICAgICAqIFJldHVybiBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHZhbHVlIG9mIHRoaXMgQmlnTnVtYmVyIGluIGZpeGVkLXBvaW50IG5vdGF0aW9uIHJvdW5kZWRcclxuICAgICAqIHVzaW5nIHJtIG9yIFJPVU5ESU5HX01PREUgdG8gZHAgZGVjaW1hbCBwbGFjZXMsIGFuZCBmb3JtYXR0ZWQgYWNjb3JkaW5nIHRvIHRoZSBwcm9wZXJ0aWVzXHJcbiAgICAgKiBvZiB0aGUgZm9ybWF0IG9yIEZPUk1BVCBvYmplY3QgKHNlZSBCaWdOdW1iZXIuc2V0KS5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgZm9ybWF0dGluZyBvYmplY3QgbWF5IGNvbnRhaW4gc29tZSBvciBhbGwgb2YgdGhlIHByb3BlcnRpZXMgc2hvd24gYmVsb3cuXHJcbiAgICAgKlxyXG4gICAgICogRk9STUFUID0ge1xyXG4gICAgICogICBwcmVmaXg6ICcnLFxyXG4gICAgICogICBncm91cFNpemU6IDMsXHJcbiAgICAgKiAgIHNlY29uZGFyeUdyb3VwU2l6ZTogMCxcclxuICAgICAqICAgZ3JvdXBTZXBhcmF0b3I6ICcsJyxcclxuICAgICAqICAgZGVjaW1hbFNlcGFyYXRvcjogJy4nLFxyXG4gICAgICogICBmcmFjdGlvbkdyb3VwU2l6ZTogMCxcclxuICAgICAqICAgZnJhY3Rpb25Hcm91cFNlcGFyYXRvcjogJ1xceEEwJywgICAgICAvLyBub24tYnJlYWtpbmcgc3BhY2VcclxuICAgICAqICAgc3VmZml4OiAnJ1xyXG4gICAgICogfTtcclxuICAgICAqXHJcbiAgICAgKiBbZHBdIHtudW1iZXJ9IERlY2ltYWwgcGxhY2VzLiBJbnRlZ2VyLCAwIHRvIE1BWCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbcm1dIHtudW1iZXJ9IFJvdW5kaW5nIG1vZGUuIEludGVnZXIsIDAgdG8gOCBpbmNsdXNpdmUuXHJcbiAgICAgKiBbZm9ybWF0XSB7b2JqZWN0fSBGb3JtYXR0aW5nIG9wdGlvbnMuIFNlZSBGT1JNQVQgcGJqZWN0IGFib3ZlLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGEgcHJpbWl0aXZlIG51bWJlcnxub3QgYW4gaW50ZWdlcnxvdXQgb2YgcmFuZ2V9OiB7ZHB8cm19J1xyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEFyZ3VtZW50IG5vdCBhbiBvYmplY3Q6IHtmb3JtYXR9J1xyXG4gICAgICovXHJcbiAgICBQLnRvRm9ybWF0ID0gZnVuY3Rpb24gKGRwLCBybSwgZm9ybWF0KSB7XHJcbiAgICAgIHZhciBzdHIsXHJcbiAgICAgICAgeCA9IHRoaXM7XHJcblxyXG4gICAgICBpZiAoZm9ybWF0ID09IG51bGwpIHtcclxuICAgICAgICBpZiAoZHAgIT0gbnVsbCAmJiBybSAmJiB0eXBlb2Ygcm0gPT0gJ29iamVjdCcpIHtcclxuICAgICAgICAgIGZvcm1hdCA9IHJtO1xyXG4gICAgICAgICAgcm0gPSBudWxsO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHAgJiYgdHlwZW9mIGRwID09ICdvYmplY3QnKSB7XHJcbiAgICAgICAgICBmb3JtYXQgPSBkcDtcclxuICAgICAgICAgIGRwID0gcm0gPSBudWxsO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBmb3JtYXQgPSBGT1JNQVQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBmb3JtYXQgIT0gJ29iamVjdCcpIHtcclxuICAgICAgICB0aHJvdyBFcnJvclxyXG4gICAgICAgICAgKGJpZ251bWJlckVycm9yICsgJ0FyZ3VtZW50IG5vdCBhbiBvYmplY3Q6ICcgKyBmb3JtYXQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBzdHIgPSB4LnRvRml4ZWQoZHAsIHJtKTtcclxuXHJcbiAgICAgIGlmICh4LmMpIHtcclxuICAgICAgICB2YXIgaSxcclxuICAgICAgICAgIGFyciA9IHN0ci5zcGxpdCgnLicpLFxyXG4gICAgICAgICAgZzEgPSArZm9ybWF0Lmdyb3VwU2l6ZSxcclxuICAgICAgICAgIGcyID0gK2Zvcm1hdC5zZWNvbmRhcnlHcm91cFNpemUsXHJcbiAgICAgICAgICBncm91cFNlcGFyYXRvciA9IGZvcm1hdC5ncm91cFNlcGFyYXRvciB8fCAnJyxcclxuICAgICAgICAgIGludFBhcnQgPSBhcnJbMF0sXHJcbiAgICAgICAgICBmcmFjdGlvblBhcnQgPSBhcnJbMV0sXHJcbiAgICAgICAgICBpc05lZyA9IHgucyA8IDAsXHJcbiAgICAgICAgICBpbnREaWdpdHMgPSBpc05lZyA/IGludFBhcnQuc2xpY2UoMSkgOiBpbnRQYXJ0LFxyXG4gICAgICAgICAgbGVuID0gaW50RGlnaXRzLmxlbmd0aDtcclxuXHJcbiAgICAgICAgaWYgKGcyKSBpID0gZzEsIGcxID0gZzIsIGcyID0gaSwgbGVuIC09IGk7XHJcblxyXG4gICAgICAgIGlmIChnMSA+IDAgJiYgbGVuID4gMCkge1xyXG4gICAgICAgICAgaSA9IGxlbiAlIGcxIHx8IGcxO1xyXG4gICAgICAgICAgaW50UGFydCA9IGludERpZ2l0cy5zdWJzdHIoMCwgaSk7XHJcbiAgICAgICAgICBmb3IgKDsgaSA8IGxlbjsgaSArPSBnMSkgaW50UGFydCArPSBncm91cFNlcGFyYXRvciArIGludERpZ2l0cy5zdWJzdHIoaSwgZzEpO1xyXG4gICAgICAgICAgaWYgKGcyID4gMCkgaW50UGFydCArPSBncm91cFNlcGFyYXRvciArIGludERpZ2l0cy5zbGljZShpKTtcclxuICAgICAgICAgIGlmIChpc05lZykgaW50UGFydCA9ICctJyArIGludFBhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdHIgPSBmcmFjdGlvblBhcnRcclxuICAgICAgICAgPyBpbnRQYXJ0ICsgKGZvcm1hdC5kZWNpbWFsU2VwYXJhdG9yIHx8ICcnKSArICgoZzIgPSArZm9ybWF0LmZyYWN0aW9uR3JvdXBTaXplKVxyXG4gICAgICAgICAgPyBmcmFjdGlvblBhcnQucmVwbGFjZShuZXcgUmVnRXhwKCdcXFxcZHsnICsgZzIgKyAnfVxcXFxCJywgJ2cnKSxcclxuICAgICAgICAgICAnJCYnICsgKGZvcm1hdC5mcmFjdGlvbkdyb3VwU2VwYXJhdG9yIHx8ICcnKSlcclxuICAgICAgICAgIDogZnJhY3Rpb25QYXJ0KVxyXG4gICAgICAgICA6IGludFBhcnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiAoZm9ybWF0LnByZWZpeCB8fCAnJykgKyBzdHIgKyAoZm9ybWF0LnN1ZmZpeCB8fCAnJyk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGFuIGFycmF5IG9mIHR3byBCaWdOdW1iZXJzIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgYXMgYSBzaW1wbGVcclxuICAgICAqIGZyYWN0aW9uIHdpdGggYW4gaW50ZWdlciBudW1lcmF0b3IgYW5kIGFuIGludGVnZXIgZGVub21pbmF0b3IuXHJcbiAgICAgKiBUaGUgZGVub21pbmF0b3Igd2lsbCBiZSBhIHBvc2l0aXZlIG5vbi16ZXJvIHZhbHVlIGxlc3MgdGhhbiBvciBlcXVhbCB0byB0aGUgc3BlY2lmaWVkXHJcbiAgICAgKiBtYXhpbXVtIGRlbm9taW5hdG9yLiBJZiBhIG1heGltdW0gZGVub21pbmF0b3IgaXMgbm90IHNwZWNpZmllZCwgdGhlIGRlbm9taW5hdG9yIHdpbGwgYmVcclxuICAgICAqIHRoZSBsb3dlc3QgdmFsdWUgbmVjZXNzYXJ5IHRvIHJlcHJlc2VudCB0aGUgbnVtYmVyIGV4YWN0bHkuXHJcbiAgICAgKlxyXG4gICAgICogW21kXSB7bnVtYmVyfHN0cmluZ3xCaWdOdW1iZXJ9IEludGVnZXIgPj0gMSwgb3IgSW5maW5pdHkuIFRoZSBtYXhpbXVtIGRlbm9taW5hdG9yLlxyXG4gICAgICpcclxuICAgICAqICdbQmlnTnVtYmVyIEVycm9yXSBBcmd1bWVudCB7bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfSA6IHttZH0nXHJcbiAgICAgKi9cclxuICAgIFAudG9GcmFjdGlvbiA9IGZ1bmN0aW9uIChtZCkge1xyXG4gICAgICB2YXIgZCwgZDAsIGQxLCBkMiwgZSwgZXhwLCBuLCBuMCwgbjEsIHEsIHIsIHMsXHJcbiAgICAgICAgeCA9IHRoaXMsXHJcbiAgICAgICAgeGMgPSB4LmM7XHJcblxyXG4gICAgICBpZiAobWQgIT0gbnVsbCkge1xyXG4gICAgICAgIG4gPSBuZXcgQmlnTnVtYmVyKG1kKTtcclxuXHJcbiAgICAgICAgLy8gVGhyb3cgaWYgbWQgaXMgbGVzcyB0aGFuIG9uZSBvciBpcyBub3QgYW4gaW50ZWdlciwgdW5sZXNzIGl0IGlzIEluZmluaXR5LlxyXG4gICAgICAgIGlmICghbi5pc0ludGVnZXIoKSAmJiAobi5jIHx8IG4ucyAhPT0gMSkgfHwgbi5sdChPTkUpKSB7XHJcbiAgICAgICAgICB0aHJvdyBFcnJvclxyXG4gICAgICAgICAgICAoYmlnbnVtYmVyRXJyb3IgKyAnQXJndW1lbnQgJyArXHJcbiAgICAgICAgICAgICAgKG4uaXNJbnRlZ2VyKCkgPyAnb3V0IG9mIHJhbmdlOiAnIDogJ25vdCBhbiBpbnRlZ2VyOiAnKSArIHZhbHVlT2YobikpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCF4YykgcmV0dXJuIG5ldyBCaWdOdW1iZXIoeCk7XHJcblxyXG4gICAgICBkID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG4gICAgICBuMSA9IGQwID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG4gICAgICBkMSA9IG4wID0gbmV3IEJpZ051bWJlcihPTkUpO1xyXG4gICAgICBzID0gY29lZmZUb1N0cmluZyh4Yyk7XHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgaW5pdGlhbCBkZW5vbWluYXRvci5cclxuICAgICAgLy8gZCBpcyBhIHBvd2VyIG9mIDEwIGFuZCB0aGUgbWluaW11bSBtYXggZGVub21pbmF0b3IgdGhhdCBzcGVjaWZpZXMgdGhlIHZhbHVlIGV4YWN0bHkuXHJcbiAgICAgIGUgPSBkLmUgPSBzLmxlbmd0aCAtIHguZSAtIDE7XHJcbiAgICAgIGQuY1swXSA9IFBPV1NfVEVOWyhleHAgPSBlICUgTE9HX0JBU0UpIDwgMCA/IExPR19CQVNFICsgZXhwIDogZXhwXTtcclxuICAgICAgbWQgPSAhbWQgfHwgbi5jb21wYXJlZFRvKGQpID4gMCA/IChlID4gMCA/IGQgOiBuMSkgOiBuO1xyXG5cclxuICAgICAgZXhwID0gTUFYX0VYUDtcclxuICAgICAgTUFYX0VYUCA9IDEgLyAwO1xyXG4gICAgICBuID0gbmV3IEJpZ051bWJlcihzKTtcclxuXHJcbiAgICAgIC8vIG4wID0gZDEgPSAwXHJcbiAgICAgIG4wLmNbMF0gPSAwO1xyXG5cclxuICAgICAgZm9yICg7IDspICB7XHJcbiAgICAgICAgcSA9IGRpdihuLCBkLCAwLCAxKTtcclxuICAgICAgICBkMiA9IGQwLnBsdXMocS50aW1lcyhkMSkpO1xyXG4gICAgICAgIGlmIChkMi5jb21wYXJlZFRvKG1kKSA9PSAxKSBicmVhaztcclxuICAgICAgICBkMCA9IGQxO1xyXG4gICAgICAgIGQxID0gZDI7XHJcbiAgICAgICAgbjEgPSBuMC5wbHVzKHEudGltZXMoZDIgPSBuMSkpO1xyXG4gICAgICAgIG4wID0gZDI7XHJcbiAgICAgICAgZCA9IG4ubWludXMocS50aW1lcyhkMiA9IGQpKTtcclxuICAgICAgICBuID0gZDI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGQyID0gZGl2KG1kLm1pbnVzKGQwKSwgZDEsIDAsIDEpO1xyXG4gICAgICBuMCA9IG4wLnBsdXMoZDIudGltZXMobjEpKTtcclxuICAgICAgZDAgPSBkMC5wbHVzKGQyLnRpbWVzKGQxKSk7XHJcbiAgICAgIG4wLnMgPSBuMS5zID0geC5zO1xyXG4gICAgICBlID0gZSAqIDI7XHJcblxyXG4gICAgICAvLyBEZXRlcm1pbmUgd2hpY2ggZnJhY3Rpb24gaXMgY2xvc2VyIHRvIHgsIG4wL2QwIG9yIG4xL2QxXHJcbiAgICAgIHIgPSBkaXYobjEsIGQxLCBlLCBST1VORElOR19NT0RFKS5taW51cyh4KS5hYnMoKS5jb21wYXJlZFRvKFxyXG4gICAgICAgICAgZGl2KG4wLCBkMCwgZSwgUk9VTkRJTkdfTU9ERSkubWludXMoeCkuYWJzKCkpIDwgMSA/IFtuMSwgZDFdIDogW24wLCBkMF07XHJcblxyXG4gICAgICBNQVhfRVhQID0gZXhwO1xyXG5cclxuICAgICAgcmV0dXJuIHI7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGlzIEJpZ051bWJlciBjb252ZXJ0ZWQgdG8gYSBudW1iZXIgcHJpbWl0aXZlLlxyXG4gICAgICovXHJcbiAgICBQLnRvTnVtYmVyID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICByZXR1cm4gK3ZhbHVlT2YodGhpcyk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgcm91bmRlZCB0byBzZCBzaWduaWZpY2FudCBkaWdpdHNcclxuICAgICAqIHVzaW5nIHJvdW5kaW5nIG1vZGUgcm0gb3IgUk9VTkRJTkdfTU9ERS4gSWYgc2QgaXMgbGVzcyB0aGFuIHRoZSBudW1iZXIgb2YgZGlnaXRzXHJcbiAgICAgKiBuZWNlc3NhcnkgdG8gcmVwcmVzZW50IHRoZSBpbnRlZ2VyIHBhcnQgb2YgdGhlIHZhbHVlIGluIGZpeGVkLXBvaW50IG5vdGF0aW9uLCB0aGVuIHVzZVxyXG4gICAgICogZXhwb25lbnRpYWwgbm90YXRpb24uXHJcbiAgICAgKlxyXG4gICAgICogW3NkXSB7bnVtYmVyfSBTaWduaWZpY2FudCBkaWdpdHMuIEludGVnZXIsIDEgdG8gTUFYIGluY2x1c2l2ZS5cclxuICAgICAqIFtybV0ge251bWJlcn0gUm91bmRpbmcgbW9kZS4gSW50ZWdlciwgMCB0byA4IGluY2x1c2l2ZS5cclxuICAgICAqXHJcbiAgICAgKiAnW0JpZ051bWJlciBFcnJvcl0gQXJndW1lbnQge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge3NkfHJtfSdcclxuICAgICAqL1xyXG4gICAgUC50b1ByZWNpc2lvbiA9IGZ1bmN0aW9uIChzZCwgcm0pIHtcclxuICAgICAgaWYgKHNkICE9IG51bGwpIGludENoZWNrKHNkLCAxLCBNQVgpO1xyXG4gICAgICByZXR1cm4gZm9ybWF0KHRoaXMsIHNkLCBybSwgMik7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAvKlxyXG4gICAgICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgdmFsdWUgb2YgdGhpcyBCaWdOdW1iZXIgaW4gYmFzZSBiLCBvciBiYXNlIDEwIGlmIGIgaXNcclxuICAgICAqIG9taXR0ZWQuIElmIGEgYmFzZSBpcyBzcGVjaWZpZWQsIGluY2x1ZGluZyBiYXNlIDEwLCByb3VuZCBhY2NvcmRpbmcgdG8gREVDSU1BTF9QTEFDRVMgYW5kXHJcbiAgICAgKiBST1VORElOR19NT0RFLiBJZiBhIGJhc2UgaXMgbm90IHNwZWNpZmllZCwgYW5kIHRoaXMgQmlnTnVtYmVyIGhhcyBhIHBvc2l0aXZlIGV4cG9uZW50XHJcbiAgICAgKiB0aGF0IGlzIGVxdWFsIHRvIG9yIGdyZWF0ZXIgdGhhbiBUT19FWFBfUE9TLCBvciBhIG5lZ2F0aXZlIGV4cG9uZW50IGVxdWFsIHRvIG9yIGxlc3MgdGhhblxyXG4gICAgICogVE9fRVhQX05FRywgcmV0dXJuIGV4cG9uZW50aWFsIG5vdGF0aW9uLlxyXG4gICAgICpcclxuICAgICAqIFtiXSB7bnVtYmVyfSBJbnRlZ2VyLCAyIHRvIEFMUEhBQkVULmxlbmd0aCBpbmNsdXNpdmUuXHJcbiAgICAgKlxyXG4gICAgICogJ1tCaWdOdW1iZXIgRXJyb3JdIEJhc2Uge25vdCBhIHByaW1pdGl2ZSBudW1iZXJ8bm90IGFuIGludGVnZXJ8b3V0IG9mIHJhbmdlfToge2J9J1xyXG4gICAgICovXHJcbiAgICBQLnRvU3RyaW5nID0gZnVuY3Rpb24gKGIpIHtcclxuICAgICAgdmFyIHN0cixcclxuICAgICAgICBuID0gdGhpcyxcclxuICAgICAgICBzID0gbi5zLFxyXG4gICAgICAgIGUgPSBuLmU7XHJcblxyXG4gICAgICAvLyBJbmZpbml0eSBvciBOYU4/XHJcbiAgICAgIGlmIChlID09PSBudWxsKSB7XHJcbiAgICAgICAgaWYgKHMpIHtcclxuICAgICAgICAgIHN0ciA9ICdJbmZpbml0eSc7XHJcbiAgICAgICAgICBpZiAocyA8IDApIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgc3RyID0gJ05hTic7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGlmIChiID09IG51bGwpIHtcclxuICAgICAgICAgIHN0ciA9IGUgPD0gVE9fRVhQX05FRyB8fCBlID49IFRPX0VYUF9QT1NcclxuICAgICAgICAgICA/IHRvRXhwb25lbnRpYWwoY29lZmZUb1N0cmluZyhuLmMpLCBlKVxyXG4gICAgICAgICAgIDogdG9GaXhlZFBvaW50KGNvZWZmVG9TdHJpbmcobi5jKSwgZSwgJzAnKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGIgPT09IDEwKSB7XHJcbiAgICAgICAgICBuID0gcm91bmQobmV3IEJpZ051bWJlcihuKSwgREVDSU1BTF9QTEFDRVMgKyBlICsgMSwgUk9VTkRJTkdfTU9ERSk7XHJcbiAgICAgICAgICBzdHIgPSB0b0ZpeGVkUG9pbnQoY29lZmZUb1N0cmluZyhuLmMpLCBuLmUsICcwJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGludENoZWNrKGIsIDIsIEFMUEhBQkVULmxlbmd0aCwgJ0Jhc2UnKTtcclxuICAgICAgICAgIHN0ciA9IGNvbnZlcnRCYXNlKHRvRml4ZWRQb2ludChjb2VmZlRvU3RyaW5nKG4uYyksIGUsICcwJyksIDEwLCBiLCBzLCB0cnVlKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChzIDwgMCAmJiBuLmNbMF0pIHN0ciA9ICctJyArIHN0cjtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcblxyXG5cclxuICAgIC8qXHJcbiAgICAgKiBSZXR1cm4gYXMgdG9TdHJpbmcsIGJ1dCBkbyBub3QgYWNjZXB0IGEgYmFzZSBhcmd1bWVudCwgYW5kIGluY2x1ZGUgdGhlIG1pbnVzIHNpZ24gZm9yXHJcbiAgICAgKiBuZWdhdGl2ZSB6ZXJvLlxyXG4gICAgICovXHJcbiAgICBQLnZhbHVlT2YgPSBQLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIHZhbHVlT2YodGhpcyk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICBQLl9pc0JpZ051bWJlciA9IHRydWU7XHJcblxyXG4gICAgaWYgKGhhc1N5bWJvbCkge1xyXG4gICAgICBQW1N5bWJvbC50b1N0cmluZ1RhZ10gPSAnQmlnTnVtYmVyJztcclxuXHJcbiAgICAgIC8vIE5vZGUuanMgdjEwLjEyLjArXHJcbiAgICAgIFBbU3ltYm9sLmZvcignbm9kZWpzLnV0aWwuaW5zcGVjdC5jdXN0b20nKV0gPSBQLnZhbHVlT2Y7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGNvbmZpZ09iamVjdCAhPSBudWxsKSBCaWdOdW1iZXIuc2V0KGNvbmZpZ09iamVjdCk7XHJcblxyXG4gICAgcmV0dXJuIEJpZ051bWJlcjtcclxuICB9XHJcblxyXG5cclxuICAvLyBQUklWQVRFIEhFTFBFUiBGVU5DVElPTlNcclxuXHJcbiAgLy8gVGhlc2UgZnVuY3Rpb25zIGRvbid0IG5lZWQgYWNjZXNzIHRvIHZhcmlhYmxlcyxcclxuICAvLyBlLmcuIERFQ0lNQUxfUExBQ0VTLCBpbiB0aGUgc2NvcGUgb2YgdGhlIGBjbG9uZWAgZnVuY3Rpb24gYWJvdmUuXHJcblxyXG5cclxuICBmdW5jdGlvbiBiaXRGbG9vcihuKSB7XHJcbiAgICB2YXIgaSA9IG4gfCAwO1xyXG4gICAgcmV0dXJuIG4gPiAwIHx8IG4gPT09IGkgPyBpIDogaSAtIDE7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gUmV0dXJuIGEgY29lZmZpY2llbnQgYXJyYXkgYXMgYSBzdHJpbmcgb2YgYmFzZSAxMCBkaWdpdHMuXHJcbiAgZnVuY3Rpb24gY29lZmZUb1N0cmluZyhhKSB7XHJcbiAgICB2YXIgcywgeixcclxuICAgICAgaSA9IDEsXHJcbiAgICAgIGogPSBhLmxlbmd0aCxcclxuICAgICAgciA9IGFbMF0gKyAnJztcclxuXHJcbiAgICBmb3IgKDsgaSA8IGo7KSB7XHJcbiAgICAgIHMgPSBhW2krK10gKyAnJztcclxuICAgICAgeiA9IExPR19CQVNFIC0gcy5sZW5ndGg7XHJcbiAgICAgIGZvciAoOyB6LS07IHMgPSAnMCcgKyBzKTtcclxuICAgICAgciArPSBzO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIERldGVybWluZSB0cmFpbGluZyB6ZXJvcy5cclxuICAgIGZvciAoaiA9IHIubGVuZ3RoOyByLmNoYXJDb2RlQXQoLS1qKSA9PT0gNDg7KTtcclxuXHJcbiAgICByZXR1cm4gci5zbGljZSgwLCBqICsgMSB8fCAxKTtcclxuICB9XHJcblxyXG5cclxuICAvLyBDb21wYXJlIHRoZSB2YWx1ZSBvZiBCaWdOdW1iZXJzIHggYW5kIHkuXHJcbiAgZnVuY3Rpb24gY29tcGFyZSh4LCB5KSB7XHJcbiAgICB2YXIgYSwgYixcclxuICAgICAgeGMgPSB4LmMsXHJcbiAgICAgIHljID0geS5jLFxyXG4gICAgICBpID0geC5zLFxyXG4gICAgICBqID0geS5zLFxyXG4gICAgICBrID0geC5lLFxyXG4gICAgICBsID0geS5lO1xyXG5cclxuICAgIC8vIEVpdGhlciBOYU4/XHJcbiAgICBpZiAoIWkgfHwgIWopIHJldHVybiBudWxsO1xyXG5cclxuICAgIGEgPSB4YyAmJiAheGNbMF07XHJcbiAgICBiID0geWMgJiYgIXljWzBdO1xyXG5cclxuICAgIC8vIEVpdGhlciB6ZXJvP1xyXG4gICAgaWYgKGEgfHwgYikgcmV0dXJuIGEgPyBiID8gMCA6IC1qIDogaTtcclxuXHJcbiAgICAvLyBTaWducyBkaWZmZXI/XHJcbiAgICBpZiAoaSAhPSBqKSByZXR1cm4gaTtcclxuXHJcbiAgICBhID0gaSA8IDA7XHJcbiAgICBiID0gayA9PSBsO1xyXG5cclxuICAgIC8vIEVpdGhlciBJbmZpbml0eT9cclxuICAgIGlmICgheGMgfHwgIXljKSByZXR1cm4gYiA/IDAgOiAheGMgXiBhID8gMSA6IC0xO1xyXG5cclxuICAgIC8vIENvbXBhcmUgZXhwb25lbnRzLlxyXG4gICAgaWYgKCFiKSByZXR1cm4gayA+IGwgXiBhID8gMSA6IC0xO1xyXG5cclxuICAgIGogPSAoayA9IHhjLmxlbmd0aCkgPCAobCA9IHljLmxlbmd0aCkgPyBrIDogbDtcclxuXHJcbiAgICAvLyBDb21wYXJlIGRpZ2l0IGJ5IGRpZ2l0LlxyXG4gICAgZm9yIChpID0gMDsgaSA8IGo7IGkrKykgaWYgKHhjW2ldICE9IHljW2ldKSByZXR1cm4geGNbaV0gPiB5Y1tpXSBeIGEgPyAxIDogLTE7XHJcblxyXG4gICAgLy8gQ29tcGFyZSBsZW5ndGhzLlxyXG4gICAgcmV0dXJuIGsgPT0gbCA/IDAgOiBrID4gbCBeIGEgPyAxIDogLTE7XHJcbiAgfVxyXG5cclxuXHJcbiAgLypcclxuICAgKiBDaGVjayB0aGF0IG4gaXMgYSBwcmltaXRpdmUgbnVtYmVyLCBhbiBpbnRlZ2VyLCBhbmQgaW4gcmFuZ2UsIG90aGVyd2lzZSB0aHJvdy5cclxuICAgKi9cclxuICBmdW5jdGlvbiBpbnRDaGVjayhuLCBtaW4sIG1heCwgbmFtZSkge1xyXG4gICAgaWYgKG4gPCBtaW4gfHwgbiA+IG1heCB8fCBuICE9PSBtYXRoZmxvb3IobikpIHtcclxuICAgICAgdGhyb3cgRXJyb3JcclxuICAgICAgIChiaWdudW1iZXJFcnJvciArIChuYW1lIHx8ICdBcmd1bWVudCcpICsgKHR5cGVvZiBuID09ICdudW1iZXInXHJcbiAgICAgICAgID8gbiA8IG1pbiB8fCBuID4gbWF4ID8gJyBvdXQgb2YgcmFuZ2U6ICcgOiAnIG5vdCBhbiBpbnRlZ2VyOiAnXHJcbiAgICAgICAgIDogJyBub3QgYSBwcmltaXRpdmUgbnVtYmVyOiAnKSArIFN0cmluZyhuKSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gQXNzdW1lcyBmaW5pdGUgbi5cclxuICBmdW5jdGlvbiBpc09kZChuKSB7XHJcbiAgICB2YXIgayA9IG4uYy5sZW5ndGggLSAxO1xyXG4gICAgcmV0dXJuIGJpdEZsb29yKG4uZSAvIExPR19CQVNFKSA9PSBrICYmIG4uY1trXSAlIDIgIT0gMDtcclxuICB9XHJcblxyXG5cclxuICBmdW5jdGlvbiB0b0V4cG9uZW50aWFsKHN0ciwgZSkge1xyXG4gICAgcmV0dXJuIChzdHIubGVuZ3RoID4gMSA/IHN0ci5jaGFyQXQoMCkgKyAnLicgKyBzdHIuc2xpY2UoMSkgOiBzdHIpICtcclxuICAgICAoZSA8IDAgPyAnZScgOiAnZSsnKSArIGU7XHJcbiAgfVxyXG5cclxuXHJcbiAgZnVuY3Rpb24gdG9GaXhlZFBvaW50KHN0ciwgZSwgeikge1xyXG4gICAgdmFyIGxlbiwgenM7XHJcblxyXG4gICAgLy8gTmVnYXRpdmUgZXhwb25lbnQ/XHJcbiAgICBpZiAoZSA8IDApIHtcclxuXHJcbiAgICAgIC8vIFByZXBlbmQgemVyb3MuXHJcbiAgICAgIGZvciAoenMgPSB6ICsgJy4nOyArK2U7IHpzICs9IHopO1xyXG4gICAgICBzdHIgPSB6cyArIHN0cjtcclxuXHJcbiAgICAvLyBQb3NpdGl2ZSBleHBvbmVudFxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbGVuID0gc3RyLmxlbmd0aDtcclxuXHJcbiAgICAgIC8vIEFwcGVuZCB6ZXJvcy5cclxuICAgICAgaWYgKCsrZSA+IGxlbikge1xyXG4gICAgICAgIGZvciAoenMgPSB6LCBlIC09IGxlbjsgLS1lOyB6cyArPSB6KTtcclxuICAgICAgICBzdHIgKz0genM7XHJcbiAgICAgIH0gZWxzZSBpZiAoZSA8IGxlbikge1xyXG4gICAgICAgIHN0ciA9IHN0ci5zbGljZSgwLCBlKSArICcuJyArIHN0ci5zbGljZShlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBzdHI7XHJcbiAgfVxyXG5cclxuXHJcbiAgLy8gRVhQT1JUXHJcblxyXG5cclxuICBCaWdOdW1iZXIgPSBjbG9uZSgpO1xyXG4gIEJpZ051bWJlclsnZGVmYXVsdCddID0gQmlnTnVtYmVyLkJpZ051bWJlciA9IEJpZ051bWJlcjtcclxuXHJcbiAgLy8gQU1ELlxyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKGZ1bmN0aW9uICgpIHsgcmV0dXJuIEJpZ051bWJlcjsgfSk7XHJcblxyXG4gIC8vIE5vZGUuanMgYW5kIG90aGVyIGVudmlyb25tZW50cyB0aGF0IHN1cHBvcnQgbW9kdWxlLmV4cG9ydHMuXHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XHJcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEJpZ051bWJlcjtcclxuXHJcbiAgLy8gQnJvd3Nlci5cclxuICB9IGVsc2Uge1xyXG4gICAgaWYgKCFnbG9iYWxPYmplY3QpIHtcclxuICAgICAgZ2xvYmFsT2JqZWN0ID0gdHlwZW9mIHNlbGYgIT0gJ3VuZGVmaW5lZCcgJiYgc2VsZiA/IHNlbGYgOiB3aW5kb3c7XHJcbiAgICB9XHJcblxyXG4gICAgZ2xvYmFsT2JqZWN0LkJpZ051bWJlciA9IEJpZ051bWJlcjtcclxuICB9XHJcbn0pKHRoaXMpO1xyXG4iLCIvKiFcbiAqIENvcHlyaWdodCAoYykgMjAxNyBCZW5qYW1pbiBWYW4gUnlzZWdoZW08YmVuamFtaW5AdmFucnlzZWdoZW0uY29tPlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgbGFuZ3VhZ2VUYWc6IFwiZW4tVVNcIixcbiAgICBkZWxpbWl0ZXJzOiB7XG4gICAgICAgIHRob3VzYW5kczogXCIsXCIsXG4gICAgICAgIGRlY2ltYWw6IFwiLlwiXG4gICAgfSxcbiAgICBhYmJyZXZpYXRpb25zOiB7XG4gICAgICAgIHRob3VzYW5kOiBcImtcIixcbiAgICAgICAgbWlsbGlvbjogXCJtXCIsXG4gICAgICAgIGJpbGxpb246IFwiYlwiLFxuICAgICAgICB0cmlsbGlvbjogXCJ0XCJcbiAgICB9LFxuICAgIHNwYWNlU2VwYXJhdGVkOiBmYWxzZSxcbiAgICBvcmRpbmFsOiBmdW5jdGlvbihudW1iZXIpIHtcbiAgICAgICAgbGV0IGIgPSBudW1iZXIgJSAxMDtcbiAgICAgICAgcmV0dXJuICh+fihudW1iZXIgJSAxMDAgLyAxMCkgPT09IDEpID8gXCJ0aFwiIDogKGIgPT09IDEpID8gXCJzdFwiIDogKGIgPT09IDIpID8gXCJuZFwiIDogKGIgPT09IDMpID8gXCJyZFwiIDogXCJ0aFwiO1xuICAgIH0sXG4gICAgYnl0ZXM6IHtcbiAgICAgICAgYmluYXJ5U3VmZml4ZXM6IFtcIkJcIiwgXCJLaUJcIiwgXCJNaUJcIiwgXCJHaUJcIiwgXCJUaUJcIiwgXCJQaUJcIiwgXCJFaUJcIiwgXCJaaUJcIiwgXCJZaUJcIl0sXG4gICAgICAgIGRlY2ltYWxTdWZmaXhlczogW1wiQlwiLCBcIktCXCIsIFwiTUJcIiwgXCJHQlwiLCBcIlRCXCIsIFwiUEJcIiwgXCJFQlwiLCBcIlpCXCIsIFwiWUJcIl1cbiAgICB9LFxuICAgIGN1cnJlbmN5OiB7XG4gICAgICAgIHN5bWJvbDogXCIkXCIsXG4gICAgICAgIHBvc2l0aW9uOiBcInByZWZpeFwiLFxuICAgICAgICBjb2RlOiBcIlVTRFwiXG4gICAgfSxcbiAgICBjdXJyZW5jeUZvcm1hdDoge1xuICAgICAgICB0aG91c2FuZFNlcGFyYXRlZDogdHJ1ZSxcbiAgICAgICAgdG90YWxMZW5ndGg6IDQsXG4gICAgICAgIHNwYWNlU2VwYXJhdGVkOiB0cnVlLFxuICAgICAgICBzcGFjZVNlcGFyYXRlZEN1cnJlbmN5OiB0cnVlXG4gICAgfSxcbiAgICBmb3JtYXRzOiB7XG4gICAgICAgIGZvdXJEaWdpdHM6IHtcbiAgICAgICAgICAgIHRvdGFsTGVuZ3RoOiA0LFxuICAgICAgICAgICAgc3BhY2VTZXBhcmF0ZWQ6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgZnVsbFdpdGhUd29EZWNpbWFsczoge1xuICAgICAgICAgICAgb3V0cHV0OiBcImN1cnJlbmN5XCIsXG4gICAgICAgICAgICB0aG91c2FuZFNlcGFyYXRlZDogdHJ1ZSxcbiAgICAgICAgICAgIG1hbnRpc3NhOiAyXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bGxXaXRoVHdvRGVjaW1hbHNOb0N1cnJlbmN5OiB7XG4gICAgICAgICAgICB0aG91c2FuZFNlcGFyYXRlZDogdHJ1ZSxcbiAgICAgICAgICAgIG1hbnRpc3NhOiAyXG4gICAgICAgIH0sXG4gICAgICAgIGZ1bGxXaXRoTm9EZWNpbWFsczoge1xuICAgICAgICAgICAgb3V0cHV0OiBcImN1cnJlbmN5XCIsXG4gICAgICAgICAgICB0aG91c2FuZFNlcGFyYXRlZDogdHJ1ZSxcbiAgICAgICAgICAgIG1hbnRpc3NhOiAwXG4gICAgICAgIH1cbiAgICB9XG59O1xuIiwiLyohXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgQmVuamFtaW4gVmFuIFJ5c2VnaGVtPGJlbmphbWluQHZhbnJ5c2VnaGVtLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbiAqIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICovXG5cbmNvbnN0IGdsb2JhbFN0YXRlID0gcmVxdWlyZShcIi4vZ2xvYmFsU3RhdGVcIik7XG5jb25zdCB2YWxpZGF0aW5nID0gcmVxdWlyZShcIi4vdmFsaWRhdGluZ1wiKTtcbmNvbnN0IHBhcnNpbmcgPSByZXF1aXJlKFwiLi9wYXJzaW5nXCIpO1xuY29uc3QgQmlnTnVtYmVyID0gcmVxdWlyZShcImJpZ251bWJlci5qc1wiKTtcblxuY29uc3QgcG93ZXJzID0ge1xuICAgIHRyaWxsaW9uOiBNYXRoLnBvdygxMCwgMTIpLFxuICAgIGJpbGxpb246IE1hdGgucG93KDEwLCA5KSxcbiAgICBtaWxsaW9uOiBNYXRoLnBvdygxMCwgNiksXG4gICAgdGhvdXNhbmQ6IE1hdGgucG93KDEwLCAzKVxufTtcblxuY29uc3QgZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgdG90YWxMZW5ndGg6IDAsXG4gICAgY2hhcmFjdGVyaXN0aWM6IDAsXG4gICAgZm9yY2VBdmVyYWdlOiBmYWxzZSxcbiAgICBhdmVyYWdlOiBmYWxzZSxcbiAgICBtYW50aXNzYTogLTEsXG4gICAgb3B0aW9uYWxNYW50aXNzYTogdHJ1ZSxcbiAgICB0aG91c2FuZFNlcGFyYXRlZDogZmFsc2UsXG4gICAgc3BhY2VTZXBhcmF0ZWQ6IGZhbHNlLFxuICAgIG5lZ2F0aXZlOiBcInNpZ25cIixcbiAgICBmb3JjZVNpZ246IGZhbHNlLFxuICAgIHJvdW5kaW5nRnVuY3Rpb246IE1hdGgucm91bmQsXG4gICAgc3BhY2VTZXBhcmF0ZWRBYmJyZXZpYXRpb246IGZhbHNlXG59O1xuXG5jb25zdCB7IGJpbmFyeVN1ZmZpeGVzLCBkZWNpbWFsU3VmZml4ZXMgfSA9IGdsb2JhbFN0YXRlLmN1cnJlbnRCeXRlcygpO1xuXG5jb25zdCBieXRlcyA9IHtcbiAgICBnZW5lcmFsOiB7IHNjYWxlOiAxMDI0LCBzdWZmaXhlczogZGVjaW1hbFN1ZmZpeGVzLCBtYXJrZXI6IFwiYmRcIiB9LFxuICAgIGJpbmFyeTogeyBzY2FsZTogMTAyNCwgc3VmZml4ZXM6IGJpbmFyeVN1ZmZpeGVzLCBtYXJrZXI6IFwiYlwiIH0sXG4gICAgZGVjaW1hbDogeyBzY2FsZTogMTAwMCwgc3VmZml4ZXM6IGRlY2ltYWxTdWZmaXhlcywgbWFya2VyOiBcImRcIiB9XG59O1xuXG4vKipcbiAqIEVudHJ5IHBvaW50LiBGb3JtYXQgdGhlIHByb3ZpZGVkIElOU1RBTkNFIGFjY29yZGluZyB0byB0aGUgUFJPVklERURGT1JNQVQuXG4gKiBUaGlzIG1ldGhvZCBlbnN1cmUgdGhlIHByZWZpeCBhbmQgcG9zdGZpeCBhcmUgYWRkZWQgYXMgdGhlIGxhc3Qgc3RlcC5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gaW5zdGFuY2UgLSBudW1icm8gaW5zdGFuY2UgdG8gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdHxzdHJpbmd9IFtwcm92aWRlZEZvcm1hdF0gLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0gbnVtYnJvIC0gdGhlIG51bWJybyBzaW5nbGV0b25cbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybWF0KGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCA9IHt9LCBudW1icm8pIHtcbiAgICBpZiAodHlwZW9mIHByb3ZpZGVkRm9ybWF0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHByb3ZpZGVkRm9ybWF0ID0gcGFyc2luZy5wYXJzZUZvcm1hdChwcm92aWRlZEZvcm1hdCk7XG4gICAgfVxuXG4gICAgbGV0IHZhbGlkID0gdmFsaWRhdGluZy52YWxpZGF0ZUZvcm1hdChwcm92aWRlZEZvcm1hdCk7XG5cbiAgICBpZiAoIXZhbGlkKSB7XG4gICAgICAgIHJldHVybiBcIkVSUk9SOiBpbnZhbGlkIGZvcm1hdFwiO1xuICAgIH1cblxuICAgIGxldCBwcmVmaXggPSBwcm92aWRlZEZvcm1hdC5wcmVmaXggfHwgXCJcIjtcbiAgICBsZXQgcG9zdGZpeCA9IHByb3ZpZGVkRm9ybWF0LnBvc3RmaXggfHwgXCJcIjtcblxuICAgIGxldCBvdXRwdXQgPSBmb3JtYXROdW1icm8oaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBudW1icm8pO1xuICAgIG91dHB1dCA9IGluc2VydFByZWZpeChvdXRwdXQsIHByZWZpeCk7XG4gICAgb3V0cHV0ID0gaW5zZXJ0UG9zdGZpeChvdXRwdXQsIHBvc3RmaXgpO1xuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBwcm92aWRlZCBJTlNUQU5DRSBhY2NvcmRpbmcgdG8gdGhlIFBST1ZJREVERk9STUFULlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IHByb3ZpZGVkRm9ybWF0IC0gc3BlY2lmaWNhdGlvbiBmb3IgZm9ybWF0dGluZ1xuICogQHBhcmFtIG51bWJybyAtIHRoZSBudW1icm8gc2luZ2xldG9uXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdE51bWJybyhpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIG51bWJybykge1xuICAgIHN3aXRjaCAocHJvdmlkZWRGb3JtYXQub3V0cHV0KSB7XG4gICAgICAgIGNhc2UgXCJjdXJyZW5jeVwiOiB7XG4gICAgICAgICAgICBwcm92aWRlZEZvcm1hdCA9IGZvcm1hdE9yRGVmYXVsdChwcm92aWRlZEZvcm1hdCwgZ2xvYmFsU3RhdGUuY3VycmVudEN1cnJlbmN5RGVmYXVsdEZvcm1hdCgpKTtcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRDdXJyZW5jeShpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIGdsb2JhbFN0YXRlLCBudW1icm8pO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJwZXJjZW50XCI6IHtcbiAgICAgICAgICAgIHByb3ZpZGVkRm9ybWF0ID0gZm9ybWF0T3JEZWZhdWx0KHByb3ZpZGVkRm9ybWF0LCBnbG9iYWxTdGF0ZS5jdXJyZW50UGVyY2VudGFnZURlZmF1bHRGb3JtYXQoKSk7XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0UGVyY2VudGFnZShpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIGdsb2JhbFN0YXRlLCBudW1icm8pO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgXCJieXRlXCI6XG4gICAgICAgICAgICBwcm92aWRlZEZvcm1hdCA9IGZvcm1hdE9yRGVmYXVsdChwcm92aWRlZEZvcm1hdCwgZ2xvYmFsU3RhdGUuY3VycmVudEJ5dGVEZWZhdWx0Rm9ybWF0KCkpO1xuICAgICAgICAgICAgcmV0dXJuIGZvcm1hdEJ5dGUoaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBnbG9iYWxTdGF0ZSwgbnVtYnJvKTtcbiAgICAgICAgY2FzZSBcInRpbWVcIjpcbiAgICAgICAgICAgIHByb3ZpZGVkRm9ybWF0ID0gZm9ybWF0T3JEZWZhdWx0KHByb3ZpZGVkRm9ybWF0LCBnbG9iYWxTdGF0ZS5jdXJyZW50VGltZURlZmF1bHRGb3JtYXQoKSk7XG4gICAgICAgICAgICByZXR1cm4gZm9ybWF0VGltZShpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIGdsb2JhbFN0YXRlLCBudW1icm8pO1xuICAgICAgICBjYXNlIFwib3JkaW5hbFwiOlxuICAgICAgICAgICAgcHJvdmlkZWRGb3JtYXQgPSBmb3JtYXRPckRlZmF1bHQocHJvdmlkZWRGb3JtYXQsIGdsb2JhbFN0YXRlLmN1cnJlbnRPcmRpbmFsRGVmYXVsdEZvcm1hdCgpKTtcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXRPcmRpbmFsKGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgZ2xvYmFsU3RhdGUsIG51bWJybyk7XG4gICAgICAgIGNhc2UgXCJudW1iZXJcIjpcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIHJldHVybiBmb3JtYXROdW1iZXIoe1xuICAgICAgICAgICAgICAgIGluc3RhbmNlLFxuICAgICAgICAgICAgICAgIHByb3ZpZGVkRm9ybWF0LFxuICAgICAgICAgICAgICAgIG51bWJyb1xuICAgICAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vKipcbiAqIEdldCB0aGUgZGVjaW1hbCBieXRlIHVuaXQgKE1CKSBmb3IgdGhlIHByb3ZpZGVkIG51bWJybyBJTlNUQU5DRS5cbiAqIFdlIGdvIGZyb20gb25lIHVuaXQgdG8gYW5vdGhlciB1c2luZyB0aGUgZGVjaW1hbCBzeXN0ZW0gKDEwMDApLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBjb21wdXRlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldERlY2ltYWxCeXRlVW5pdChpbnN0YW5jZSkge1xuICAgIGxldCBkYXRhID0gYnl0ZXMuZGVjaW1hbDtcbiAgICByZXR1cm4gZ2V0Rm9ybWF0Qnl0ZVVuaXRzKGluc3RhbmNlLl92YWx1ZSwgZGF0YS5zdWZmaXhlcywgZGF0YS5zY2FsZSkuc3VmZml4O1xufVxuXG4vKipcbiAqIEdldCB0aGUgYmluYXJ5IGJ5dGUgdW5pdCAoTWlCKSBmb3IgdGhlIHByb3ZpZGVkIG51bWJybyBJTlNUQU5DRS5cbiAqIFdlIGdvIGZyb20gb25lIHVuaXQgdG8gYW5vdGhlciB1c2luZyB0aGUgZGVjaW1hbCBzeXN0ZW0gKDEwMjQpLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBjb21wdXRlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGdldEJpbmFyeUJ5dGVVbml0KGluc3RhbmNlKSB7XG4gICAgbGV0IGRhdGEgPSBieXRlcy5iaW5hcnk7XG4gICAgcmV0dXJuIGdldEZvcm1hdEJ5dGVVbml0cyhpbnN0YW5jZS5fdmFsdWUsIGRhdGEuc3VmZml4ZXMsIGRhdGEuc2NhbGUpLnN1ZmZpeDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGRlY2ltYWwgYnl0ZSB1bml0IChNQikgZm9yIHRoZSBwcm92aWRlZCBudW1icm8gSU5TVEFOQ0UuXG4gKiBXZSBnbyBmcm9tIG9uZSB1bml0IHRvIGFub3RoZXIgdXNpbmcgdGhlIGRlY2ltYWwgc3lzdGVtICgxMDI0KS5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gaW5zdGFuY2UgLSBudW1icm8gaW5zdGFuY2UgdG8gY29tcHV0ZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRCeXRlVW5pdChpbnN0YW5jZSkge1xuICAgIGxldCBkYXRhID0gYnl0ZXMuZ2VuZXJhbDtcbiAgICByZXR1cm4gZ2V0Rm9ybWF0Qnl0ZVVuaXRzKGluc3RhbmNlLl92YWx1ZSwgZGF0YS5zdWZmaXhlcywgZGF0YS5zY2FsZSkuc3VmZml4O1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgdmFsdWUgYW5kIHRoZSBzdWZmaXggY29tcHV0ZWQgaW4gYnl0ZS5cbiAqIEl0IHVzZXMgdGhlIFNVRkZJWEVTIGFuZCB0aGUgU0NBTEUgcHJvdmlkZWQuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gTnVtYmVyIHRvIGZvcm1hdFxuICogQHBhcmFtIHtbU3RyaW5nXX0gc3VmZml4ZXMgLSBMaXN0IG9mIHN1ZmZpeGVzXG4gKiBAcGFyYW0ge251bWJlcn0gc2NhbGUgLSBOdW1iZXIgaW4tYmV0d2VlbiB0d28gdW5pdHNcbiAqIEByZXR1cm4ge3t2YWx1ZTogTnVtYmVyLCBzdWZmaXg6IFN0cmluZ319XG4gKi9cbmZ1bmN0aW9uIGdldEZvcm1hdEJ5dGVVbml0cyh2YWx1ZSwgc3VmZml4ZXMsIHNjYWxlKSB7XG4gICAgbGV0IHN1ZmZpeCA9IHN1ZmZpeGVzWzBdO1xuICAgIGxldCBhYnMgPSBNYXRoLmFicyh2YWx1ZSk7XG5cbiAgICBpZiAoYWJzID49IHNjYWxlKSB7XG4gICAgICAgIGZvciAobGV0IHBvd2VyID0gMTsgcG93ZXIgPCBzdWZmaXhlcy5sZW5ndGg7ICsrcG93ZXIpIHtcbiAgICAgICAgICAgIGxldCBtaW4gPSBNYXRoLnBvdyhzY2FsZSwgcG93ZXIpO1xuICAgICAgICAgICAgbGV0IG1heCA9IE1hdGgucG93KHNjYWxlLCBwb3dlciArIDEpO1xuXG4gICAgICAgICAgICBpZiAoYWJzID49IG1pbiAmJiBhYnMgPCBtYXgpIHtcbiAgICAgICAgICAgICAgICBzdWZmaXggPSBzdWZmaXhlc1twb3dlcl07XG4gICAgICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSAvIG1pbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbHVlcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gW3NjYWxlXSBZQiBuZXZlciBzZXQgdGhlIHN1ZmZpeFxuICAgICAgICBpZiAoc3VmZml4ID09PSBzdWZmaXhlc1swXSkge1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSAvIE1hdGgucG93KHNjYWxlLCBzdWZmaXhlcy5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIHN1ZmZpeCA9IHN1ZmZpeGVzW3N1ZmZpeGVzLmxlbmd0aCAtIDFdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgdmFsdWUsIHN1ZmZpeCB9O1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYXMgYnl0ZXMgdXNpbmcgdGhlIFBST1ZJREVERk9STUFULCBhbmQgU1RBVEUuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGZvcm1hdFxuICogQHBhcmFtIHt7fX0gcHJvdmlkZWRGb3JtYXQgLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge2dsb2JhbFN0YXRlfSBzdGF0ZSAtIHNoYXJlZCBzdGF0ZSBvZiB0aGUgbGlicmFyeVxuICogQHBhcmFtIG51bWJybyAtIHRoZSBudW1icm8gc2luZ2xldG9uXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdEJ5dGUoaW5zdGFuY2UsIHByb3ZpZGVkRm9ybWF0LCBzdGF0ZSwgbnVtYnJvKSB7XG4gICAgbGV0IGJhc2UgPSBwcm92aWRlZEZvcm1hdC5iYXNlIHx8IFwiYmluYXJ5XCI7XG4gICAgbGV0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgcHJvdmlkZWRGb3JtYXQpO1xuXG4gICAgY29uc3QgeyBiaW5hcnlTdWZmaXhlczogbG9jYWxCaW5hcnlTdWZmaXhlcywgZGVjaW1hbFN1ZmZpeGVzOiBsb2NhbERlY2ltYWxTdWZmaXhlcyB9ID0gc3RhdGUuY3VycmVudEJ5dGVzKCk7XG5cbiAgICBjb25zdCBsb2NhbEJ5dGVzID0ge1xuICAgICAgICBnZW5lcmFsOiB7IHNjYWxlOiAxMDI0LCBzdWZmaXhlczogbG9jYWxEZWNpbWFsU3VmZml4ZXMgfHwgZGVjaW1hbFN1ZmZpeGVzLCBtYXJrZXI6IFwiYmRcIiB9LFxuICAgICAgICBiaW5hcnk6IHsgc2NhbGU6IDEwMjQsIHN1ZmZpeGVzOiBsb2NhbEJpbmFyeVN1ZmZpeGVzIHx8IGJpbmFyeVN1ZmZpeGVzLCBtYXJrZXI6IFwiYlwiIH0sXG4gICAgICAgIGRlY2ltYWw6IHsgc2NhbGU6IDEwMDAsIHN1ZmZpeGVzOiBsb2NhbERlY2ltYWxTdWZmaXhlcyB8fCBkZWNpbWFsU3VmZml4ZXMsIG1hcmtlcjogXCJkXCIgfVxuICAgIH07XG4gICAgbGV0IGJhc2VJbmZvID0gbG9jYWxCeXRlc1tiYXNlXTtcblxuICAgIGxldCB7IHZhbHVlLCBzdWZmaXggfSA9IGdldEZvcm1hdEJ5dGVVbml0cyhpbnN0YW5jZS5fdmFsdWUsIGJhc2VJbmZvLnN1ZmZpeGVzLCBiYXNlSW5mby5zY2FsZSk7XG5cbiAgICBsZXQgb3V0cHV0ID0gZm9ybWF0TnVtYmVyKHtcbiAgICAgICAgaW5zdGFuY2U6IG51bWJybyh2YWx1ZSksXG4gICAgICAgIHByb3ZpZGVkRm9ybWF0LFxuICAgICAgICBzdGF0ZSxcbiAgICAgICAgZGVmYXVsdHM6IHN0YXRlLmN1cnJlbnRCeXRlRGVmYXVsdEZvcm1hdCgpXG4gICAgfSk7XG5cbiAgICByZXR1cm4gYCR7b3V0cHV0fSR7b3B0aW9ucy5zcGFjZVNlcGFyYXRlZCA/IFwiIFwiIDogXCJcIn0ke3N1ZmZpeH1gO1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYXMgYW4gb3JkaW5hbCB1c2luZyB0aGUgUFJPVklERURGT1JNQVQsXG4gKiBhbmQgdGhlIFNUQVRFLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IHByb3ZpZGVkRm9ybWF0IC0gc3BlY2lmaWNhdGlvbiBmb3IgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtnbG9iYWxTdGF0ZX0gc3RhdGUgLSBzaGFyZWQgc3RhdGUgb2YgdGhlIGxpYnJhcnlcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZm9ybWF0T3JkaW5hbChpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIHN0YXRlKSB7XG4gICAgbGV0IG9yZGluYWxGbiA9IHN0YXRlLmN1cnJlbnRPcmRpbmFsKCk7XG4gICAgbGV0IG9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0T3B0aW9ucywgcHJvdmlkZWRGb3JtYXQpO1xuXG4gICAgbGV0IG91dHB1dCA9IGZvcm1hdE51bWJlcih7XG4gICAgICAgIGluc3RhbmNlLFxuICAgICAgICBwcm92aWRlZEZvcm1hdCxcbiAgICAgICAgc3RhdGVcbiAgICB9KTtcbiAgICBsZXQgb3JkaW5hbCA9IG9yZGluYWxGbihpbnN0YW5jZS5fdmFsdWUpO1xuXG4gICAgcmV0dXJuIGAke291dHB1dH0ke29wdGlvbnMuc3BhY2VTZXBhcmF0ZWQgPyBcIiBcIiA6IFwiXCJ9JHtvcmRpbmFsfWA7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBwcm92aWRlZCBJTlNUQU5DRSBhcyBhIHRpbWUgSEg6TU06U1MuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGZvcm1hdFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXRUaW1lKGluc3RhbmNlKSB7XG4gICAgbGV0IGhvdXJzID0gTWF0aC5mbG9vcihpbnN0YW5jZS5fdmFsdWUgLyA2MCAvIDYwKTtcbiAgICBsZXQgbWludXRlcyA9IE1hdGguZmxvb3IoKGluc3RhbmNlLl92YWx1ZSAtIChob3VycyAqIDYwICogNjApKSAvIDYwKTtcbiAgICBsZXQgc2Vjb25kcyA9IE1hdGgucm91bmQoaW5zdGFuY2UuX3ZhbHVlIC0gKGhvdXJzICogNjAgKiA2MCkgLSAobWludXRlcyAqIDYwKSk7XG4gICAgcmV0dXJuIGAke2hvdXJzfTokeyhtaW51dGVzIDwgMTApID8gXCIwXCIgOiBcIlwifSR7bWludXRlc306JHsoc2Vjb25kcyA8IDEwKSA/IFwiMFwiIDogXCJcIn0ke3NlY29uZHN9YDtcbn1cblxuLyoqXG4gKiBGb3JtYXQgdGhlIHByb3ZpZGVkIElOU1RBTkNFIGFzIGEgcGVyY2VudGFnZSB1c2luZyB0aGUgUFJPVklERURGT1JNQVQsXG4gKiBhbmQgdGhlIFNUQVRFLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IHByb3ZpZGVkRm9ybWF0IC0gc3BlY2lmaWNhdGlvbiBmb3IgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtnbG9iYWxTdGF0ZX0gc3RhdGUgLSBzaGFyZWQgc3RhdGUgb2YgdGhlIGxpYnJhcnlcbiAqIEBwYXJhbSBudW1icm8gLSB0aGUgbnVtYnJvIHNpbmdsZXRvblxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXRQZXJjZW50YWdlKGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgc3RhdGUsIG51bWJybykge1xuICAgIGxldCBwcmVmaXhTeW1ib2wgPSBwcm92aWRlZEZvcm1hdC5wcmVmaXhTeW1ib2w7XG5cbiAgICBsZXQgb3V0cHV0ID0gZm9ybWF0TnVtYmVyKHtcbiAgICAgICAgaW5zdGFuY2U6IG51bWJybyhpbnN0YW5jZS5fdmFsdWUgKiAxMDApLFxuICAgICAgICBwcm92aWRlZEZvcm1hdCxcbiAgICAgICAgc3RhdGVcbiAgICB9KTtcbiAgICBsZXQgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBwcm92aWRlZEZvcm1hdCk7XG5cbiAgICBpZiAocHJlZml4U3ltYm9sKSB7XG4gICAgICAgIHJldHVybiBgJSR7b3B0aW9ucy5zcGFjZVNlcGFyYXRlZCA/IFwiIFwiIDogXCJcIn0ke291dHB1dH1gO1xuICAgIH1cblxuICAgIHJldHVybiBgJHtvdXRwdXR9JHtvcHRpb25zLnNwYWNlU2VwYXJhdGVkID8gXCIgXCIgOiBcIlwifSVgO1xufVxuXG4vKipcbiAqIEZvcm1hdCB0aGUgcHJvdmlkZWQgSU5TVEFOQ0UgYXMgYSBwZXJjZW50YWdlIHVzaW5nIHRoZSBQUk9WSURFREZPUk1BVCxcbiAqIGFuZCB0aGUgU1RBVEUuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IGluc3RhbmNlIC0gbnVtYnJvIGluc3RhbmNlIHRvIGZvcm1hdFxuICogQHBhcmFtIHt7fX0gcHJvdmlkZWRGb3JtYXQgLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge2dsb2JhbFN0YXRlfSBzdGF0ZSAtIHNoYXJlZCBzdGF0ZSBvZiB0aGUgbGlicmFyeVxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBmb3JtYXRDdXJyZW5jeShpbnN0YW5jZSwgcHJvdmlkZWRGb3JtYXQsIHN0YXRlKSB7XG4gICAgY29uc3QgY3VycmVudEN1cnJlbmN5ID0gc3RhdGUuY3VycmVudEN1cnJlbmN5KCk7XG4gICAgbGV0IGNsb25lZEZvcm1hdCA9IE9iamVjdC5hc3NpZ24oe30sIHByb3ZpZGVkRm9ybWF0KTtcbiAgICBsZXQgb3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe30sIGRlZmF1bHRPcHRpb25zLCBjbG9uZWRGb3JtYXQpO1xuICAgIGxldCBkZWNpbWFsU2VwYXJhdG9yID0gdW5kZWZpbmVkO1xuICAgIGxldCBzcGFjZSA9IFwiXCI7XG4gICAgbGV0IGF2ZXJhZ2UgPSAhIW9wdGlvbnMudG90YWxMZW5ndGggfHwgISFvcHRpb25zLmZvcmNlQXZlcmFnZSB8fCBvcHRpb25zLmF2ZXJhZ2U7XG4gICAgbGV0IHBvc2l0aW9uID0gY2xvbmVkRm9ybWF0LmN1cnJlbmN5UG9zaXRpb24gfHwgY3VycmVudEN1cnJlbmN5LnBvc2l0aW9uO1xuICAgIGxldCBzeW1ib2wgPSBjbG9uZWRGb3JtYXQuY3VycmVuY3lTeW1ib2wgfHwgY3VycmVudEN1cnJlbmN5LnN5bWJvbDtcbiAgICBjb25zdCBzcGFjZVNlcGFyYXRlZEN1cnJlbmN5ID0gb3B0aW9ucy5zcGFjZVNlcGFyYXRlZEN1cnJlbmN5ICE9PSB2b2lkIDBcbiAgICAgICAgPyBvcHRpb25zLnNwYWNlU2VwYXJhdGVkQ3VycmVuY3kgOiBvcHRpb25zLnNwYWNlU2VwYXJhdGVkO1xuXG4gICAgaWYgKGNsb25lZEZvcm1hdC5sb3dQcmVjaXNpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjbG9uZWRGb3JtYXQubG93UHJlY2lzaW9uID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaWYgKHNwYWNlU2VwYXJhdGVkQ3VycmVuY3kpIHtcbiAgICAgICAgc3BhY2UgPSBcIiBcIjtcbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPT09IFwiaW5maXhcIikge1xuICAgICAgICBkZWNpbWFsU2VwYXJhdG9yID0gc3BhY2UgKyBzeW1ib2wgKyBzcGFjZTtcbiAgICB9XG5cbiAgICBsZXQgb3V0cHV0ID0gZm9ybWF0TnVtYmVyKHtcbiAgICAgICAgaW5zdGFuY2UsXG4gICAgICAgIHByb3ZpZGVkRm9ybWF0OiBjbG9uZWRGb3JtYXQsXG4gICAgICAgIHN0YXRlLFxuICAgICAgICBkZWNpbWFsU2VwYXJhdG9yXG4gICAgfSk7XG5cbiAgICBpZiAocG9zaXRpb24gPT09IFwicHJlZml4XCIpIHtcbiAgICAgICAgaWYgKGluc3RhbmNlLl92YWx1ZSA8IDAgJiYgb3B0aW9ucy5uZWdhdGl2ZSA9PT0gXCJzaWduXCIpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IGAtJHtzcGFjZX0ke3N5bWJvbH0ke291dHB1dC5zbGljZSgxKX1gO1xuICAgICAgICB9IGVsc2UgaWYgKGluc3RhbmNlLl92YWx1ZSA+IDAgJiYgb3B0aW9ucy5mb3JjZVNpZ24pIHtcbiAgICAgICAgICAgIG91dHB1dCA9IGArJHtzcGFjZX0ke3N5bWJvbH0ke291dHB1dC5zbGljZSgxKX1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgb3V0cHV0ID0gc3ltYm9sICsgc3BhY2UgKyBvdXRwdXQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIXBvc2l0aW9uIHx8IHBvc2l0aW9uID09PSBcInBvc3RmaXhcIikge1xuICAgICAgICBzcGFjZSA9ICFvcHRpb25zLnNwYWNlU2VwYXJhdGVkQWJicmV2aWF0aW9uICYmIGF2ZXJhZ2UgPyBcIlwiIDogc3BhY2U7XG4gICAgICAgIG91dHB1dCA9IG91dHB1dCArIHNwYWNlICsgc3ltYm9sO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgYXZlcmFnZSB2YWx1ZSBvdXQgb2YgVkFMVUUuXG4gKiBUaGUgb3RoZXIgcGFyYW1ldGVycyBhcmUgY29tcHV0YXRpb24gb3B0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSB2YWx1ZSB0byBjb21wdXRlXG4gKiBAcGFyYW0ge3N0cmluZ30gW2ZvcmNlQXZlcmFnZV0gLSBmb3JjZWQgdW5pdCB1c2VkIHRvIGNvbXB1dGVcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW2xvd1ByZWNpc2lvbj10cnVlXSAtIHJlZHVjZSBhdmVyYWdlIHByZWNpc2lvblxuICogQHBhcmFtIHt7fX0gYWJicmV2aWF0aW9ucyAtIHBhcnQgb2YgdGhlIGxhbmd1YWdlIHNwZWNpZmljYXRpb25cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc3BhY2VTZXBhcmF0ZWQgLSBgdHJ1ZWAgaWYgYSBzcGFjZSBtdXN0IGJlIGluc2VydGVkIGJldHdlZW4gdGhlIHZhbHVlIGFuZCB0aGUgYWJicmV2aWF0aW9uXG4gKiBAcGFyYW0ge251bWJlcn0gW3RvdGFsTGVuZ3RoXSAtIHRvdGFsIGxlbmd0aCBvZiB0aGUgb3V0cHV0IGluY2x1ZGluZyB0aGUgY2hhcmFjdGVyaXN0aWMgYW5kIHRoZSBtYW50aXNzYVxuICogQHBhcmFtIHtmdW5jdGlvbn0gcm91bmRpbmdGdW5jdGlvbiAtIGZ1bmN0aW9uIHVzZWQgdG8gcm91bmQgbnVtYmVyc1xuICogQHJldHVybiB7e3ZhbHVlOiBudW1iZXIsIGFiYnJldmlhdGlvbjogc3RyaW5nLCBtYW50aXNzYVByZWNpc2lvbjogbnVtYmVyfX1cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUF2ZXJhZ2UoeyB2YWx1ZSwgZm9yY2VBdmVyYWdlLCBsb3dQcmVjaXNpb24gPSB0cnVlLCBhYmJyZXZpYXRpb25zLCBzcGFjZVNlcGFyYXRlZCA9IGZhbHNlLCB0b3RhbExlbmd0aCA9IDAsIHJvdW5kaW5nRnVuY3Rpb24gPSBNYXRoLnJvdW5kIH0pIHtcbiAgICBsZXQgYWJicmV2aWF0aW9uID0gXCJcIjtcbiAgICBsZXQgYWJzID0gTWF0aC5hYnModmFsdWUpO1xuICAgIGxldCBtYW50aXNzYVByZWNpc2lvbiA9IC0xO1xuXG4gICAgaWYgKGZvcmNlQXZlcmFnZSAmJiBhYmJyZXZpYXRpb25zW2ZvcmNlQXZlcmFnZV0gJiYgcG93ZXJzW2ZvcmNlQXZlcmFnZV0pIHtcbiAgICAgICAgYWJicmV2aWF0aW9uID0gYWJicmV2aWF0aW9uc1tmb3JjZUF2ZXJhZ2VdO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlIC8gcG93ZXJzW2ZvcmNlQXZlcmFnZV07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGFicyA+PSBwb3dlcnMudHJpbGxpb24gfHwgKGxvd1ByZWNpc2lvbiAmJiByb3VuZGluZ0Z1bmN0aW9uKGFicyAvIHBvd2Vycy50cmlsbGlvbikgPT09IDEpKSB7XG4gICAgICAgICAgICAvLyB0cmlsbGlvblxuICAgICAgICAgICAgYWJicmV2aWF0aW9uID0gYWJicmV2aWF0aW9ucy50cmlsbGlvbjtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgLyBwb3dlcnMudHJpbGxpb247XG4gICAgICAgIH0gZWxzZSBpZiAoYWJzIDwgcG93ZXJzLnRyaWxsaW9uICYmIGFicyA+PSBwb3dlcnMuYmlsbGlvbiB8fCAobG93UHJlY2lzaW9uICYmIHJvdW5kaW5nRnVuY3Rpb24oYWJzIC8gcG93ZXJzLmJpbGxpb24pID09PSAxKSkge1xuICAgICAgICAgICAgLy8gYmlsbGlvblxuICAgICAgICAgICAgYWJicmV2aWF0aW9uID0gYWJicmV2aWF0aW9ucy5iaWxsaW9uO1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSAvIHBvd2Vycy5iaWxsaW9uO1xuICAgICAgICB9IGVsc2UgaWYgKGFicyA8IHBvd2Vycy5iaWxsaW9uICYmIGFicyA+PSBwb3dlcnMubWlsbGlvbiB8fCAobG93UHJlY2lzaW9uICYmIHJvdW5kaW5nRnVuY3Rpb24oYWJzIC8gcG93ZXJzLm1pbGxpb24pID09PSAxKSkge1xuICAgICAgICAgICAgLy8gbWlsbGlvblxuICAgICAgICAgICAgYWJicmV2aWF0aW9uID0gYWJicmV2aWF0aW9ucy5taWxsaW9uO1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZSAvIHBvd2Vycy5taWxsaW9uO1xuICAgICAgICB9IGVsc2UgaWYgKGFicyA8IHBvd2Vycy5taWxsaW9uICYmIGFicyA+PSBwb3dlcnMudGhvdXNhbmQgfHwgKGxvd1ByZWNpc2lvbiAmJiByb3VuZGluZ0Z1bmN0aW9uKGFicyAvIHBvd2Vycy50aG91c2FuZCkgPT09IDEpKSB7XG4gICAgICAgICAgICAvLyB0aG91c2FuZFxuICAgICAgICAgICAgYWJicmV2aWF0aW9uID0gYWJicmV2aWF0aW9ucy50aG91c2FuZDtcbiAgICAgICAgICAgIHZhbHVlID0gdmFsdWUgLyBwb3dlcnMudGhvdXNhbmQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgb3B0aW9uYWxTcGFjZSA9IHNwYWNlU2VwYXJhdGVkID8gXCIgXCIgOiBcIlwiO1xuXG4gICAgaWYgKGFiYnJldmlhdGlvbikge1xuICAgICAgICBhYmJyZXZpYXRpb24gPSBvcHRpb25hbFNwYWNlICsgYWJicmV2aWF0aW9uO1xuICAgIH1cblxuICAgIGlmICh0b3RhbExlbmd0aCkge1xuICAgICAgICBsZXQgaXNOZWdhdGl2ZSA9IHZhbHVlIDwgMDtcbiAgICAgICAgbGV0IGNoYXJhY3RlcmlzdGljID0gdmFsdWUudG9TdHJpbmcoKS5zcGxpdChcIi5cIilbMF07XG5cbiAgICAgICAgbGV0IGNoYXJhY3RlcmlzdGljTGVuZ3RoID0gaXNOZWdhdGl2ZVxuICAgICAgICAgICAgPyBjaGFyYWN0ZXJpc3RpYy5sZW5ndGggLSAxXG4gICAgICAgICAgICA6IGNoYXJhY3RlcmlzdGljLmxlbmd0aDtcblxuICAgICAgICBtYW50aXNzYVByZWNpc2lvbiA9IE1hdGgubWF4KHRvdGFsTGVuZ3RoIC0gY2hhcmFjdGVyaXN0aWNMZW5ndGgsIDApO1xuICAgIH1cblxuICAgIHJldHVybiB7IHZhbHVlLCBhYmJyZXZpYXRpb24sIG1hbnRpc3NhUHJlY2lzaW9uIH07XG59XG5cbi8qKlxuICogQ29tcHV0ZSBhbiBleHBvbmVudGlhbCBmb3JtIGZvciBWQUxVRSwgdGFraW5nIGludG8gYWNjb3VudCBDSEFSQUNURVJJU1RJQ1xuICogaWYgcHJvdmlkZWQuXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSB2YWx1ZSB0byBjb21wdXRlXG4gKiBAcGFyYW0ge251bWJlcn0gW2NoYXJhY3RlcmlzdGljUHJlY2lzaW9uXSAtIG9wdGlvbmFsIGNoYXJhY3RlcmlzdGljIGxlbmd0aFxuICogQHJldHVybiB7e3ZhbHVlOiBudW1iZXIsIGFiYnJldmlhdGlvbjogc3RyaW5nfX1cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUV4cG9uZW50aWFsKHsgdmFsdWUsIGNoYXJhY3RlcmlzdGljUHJlY2lzaW9uID0gMCB9KSB7XG4gICAgbGV0IFtudW1iZXJTdHJpbmcsIGV4cG9uZW50aWFsXSA9IHZhbHVlLnRvRXhwb25lbnRpYWwoKS5zcGxpdChcImVcIik7XG4gICAgbGV0IG51bWJlciA9ICtudW1iZXJTdHJpbmc7XG5cbiAgICBpZiAoIWNoYXJhY3RlcmlzdGljUHJlY2lzaW9uKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogbnVtYmVyLFxuICAgICAgICAgICAgYWJicmV2aWF0aW9uOiBgZSR7ZXhwb25lbnRpYWx9YFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGxldCBjaGFyYWN0ZXJpc3RpY0xlbmd0aCA9IDE7IC8vIHNlZSBgdG9FeHBvbmVudGlhbGBcblxuICAgIGlmIChjaGFyYWN0ZXJpc3RpY0xlbmd0aCA8IGNoYXJhY3RlcmlzdGljUHJlY2lzaW9uKSB7XG4gICAgICAgIG51bWJlciA9IG51bWJlciAqIE1hdGgucG93KDEwLCBjaGFyYWN0ZXJpc3RpY1ByZWNpc2lvbiAtIGNoYXJhY3RlcmlzdGljTGVuZ3RoKTtcbiAgICAgICAgZXhwb25lbnRpYWwgPSArZXhwb25lbnRpYWwgLSAoY2hhcmFjdGVyaXN0aWNQcmVjaXNpb24gLSBjaGFyYWN0ZXJpc3RpY0xlbmd0aCk7XG4gICAgICAgIGV4cG9uZW50aWFsID0gZXhwb25lbnRpYWwgPj0gMCA/IGArJHtleHBvbmVudGlhbH1gIDogZXhwb25lbnRpYWw7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IG51bWJlcixcbiAgICAgICAgYWJicmV2aWF0aW9uOiBgZSR7ZXhwb25lbnRpYWx9YFxuICAgIH07XG59XG5cbi8qKlxuICogUmV0dXJuIGEgc3RyaW5nIG9mIE5VTUJFUiB6ZXJvLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSBudW1iZXIgLSBMZW5ndGggb2YgdGhlIG91dHB1dFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiB6ZXJvZXMobnVtYmVyKSB7XG4gICAgbGV0IHJlc3VsdCA9IFwiXCI7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXI7IGkrKykge1xuICAgICAgICByZXN1bHQgKz0gXCIwXCI7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIFZBTFVFIHdpdGggYSBQUkVDSVNJT04tbG9uZyBtYW50aXNzYS5cbiAqIFRoaXMgbWV0aG9kIGlzIGZvciBsYXJnZS9zbWFsbCBudW1iZXJzIG9ubHkgKGEuay5hLiBpbmNsdWRpbmcgYSBcImVcIikuXG4gKlxuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gbnVtYmVyIHRvIHByZWNpc2VcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcmVjaXNpb24gLSBkZXNpcmVkIGxlbmd0aCBmb3IgdGhlIG1hbnRpc3NhXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHRvRml4ZWRMYXJnZSh2YWx1ZSwgcHJlY2lzaW9uKSB7XG4gICAgbGV0IHJlc3VsdCA9IHZhbHVlLnRvU3RyaW5nKCk7XG5cbiAgICBsZXQgW2Jhc2UsIGV4cF0gPSByZXN1bHQuc3BsaXQoXCJlXCIpO1xuXG4gICAgbGV0IFtjaGFyYWN0ZXJpc3RpYywgbWFudGlzc2EgPSBcIlwiXSA9IGJhc2Uuc3BsaXQoXCIuXCIpO1xuXG4gICAgaWYgKCtleHAgPiAwKSB7XG4gICAgICAgIHJlc3VsdCA9IGNoYXJhY3RlcmlzdGljICsgbWFudGlzc2EgKyB6ZXJvZXMoZXhwIC0gbWFudGlzc2EubGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsZXQgcHJlZml4ID0gXCIuXCI7XG5cbiAgICAgICAgaWYgKCtjaGFyYWN0ZXJpc3RpYyA8IDApIHtcbiAgICAgICAgICAgIHByZWZpeCA9IGAtMCR7cHJlZml4fWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwcmVmaXggPSBgMCR7cHJlZml4fWA7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgc3VmZml4ID0gKHplcm9lcygtZXhwIC0gMSkgKyBNYXRoLmFicyhjaGFyYWN0ZXJpc3RpYykgKyBtYW50aXNzYSkuc3Vic3RyKDAsIHByZWNpc2lvbik7XG4gICAgICAgIGlmIChzdWZmaXgubGVuZ3RoIDwgcHJlY2lzaW9uKSB7XG4gICAgICAgICAgICBzdWZmaXggKz0gemVyb2VzKHByZWNpc2lvbiAtIHN1ZmZpeC5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgICAgIHJlc3VsdCA9IHByZWZpeCArIHN1ZmZpeDtcbiAgICB9XG5cbiAgICBpZiAoK2V4cCA+IDAgJiYgcHJlY2lzaW9uID4gMCkge1xuICAgICAgICByZXN1bHQgKz0gYC4ke3plcm9lcyhwcmVjaXNpb24pfWA7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuLyoqXG4gKiBSZXR1cm4gYSBzdHJpbmcgcmVwcmVzZW50aW5nIFZBTFVFIHdpdGggYSBQUkVDSVNJT04tbG9uZyBtYW50aXNzYS5cbiAqXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBudW1iZXIgdG8gcHJlY2lzZVxuICogQHBhcmFtIHtudW1iZXJ9IHByZWNpc2lvbiAtIGRlc2lyZWQgbGVuZ3RoIGZvciB0aGUgbWFudGlzc2FcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IHJvdW5kaW5nRnVuY3Rpb24gLSByb3VuZGluZyBmdW5jdGlvbiB0byBiZSB1c2VkXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHRvRml4ZWQodmFsdWUsIHByZWNpc2lvbiwgcm91bmRpbmdGdW5jdGlvbiA9IE1hdGgucm91bmQpIHtcbiAgICBpZiAodmFsdWUudG9TdHJpbmcoKS5pbmRleE9mKFwiZVwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmV0dXJuIHRvRml4ZWRMYXJnZSh2YWx1ZSwgcHJlY2lzaW9uKTtcbiAgICB9XG5cbiAgICBjb25zdCBuID0gbmV3IEJpZ051bWJlcihyb3VuZGluZ0Z1bmN0aW9uKCtgJHt2YWx1ZX1lKyR7cHJlY2lzaW9ufWApIC8gKE1hdGgucG93KDEwLCBwcmVjaXNpb24pKSk7XG4gICAgcmV0dXJuIG4udG9GaXhlZChwcmVjaXNpb24pO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBPVVRQVVQgd2l0aCBhIG1hbnRpc3NhIHByZWNpc2lvbiBvZiBQUkVDSVNJT04uXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAtIG91dHB1dCBiZWluZyBidWlsZCBpbiB0aGUgcHJvY2VzcyBvZiBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBudW1iZXIgYmVpbmcgY3VycmVudGx5IGZvcm1hdHRlZFxuICogQHBhcmFtIHtib29sZWFufSBvcHRpb25hbE1hbnRpc3NhIC0gaWYgYHRydWVgLCB0aGUgbWFudGlzc2EgaXMgb21pdHRlZCB3aGVuIGl0J3Mgb25seSB6ZXJvZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcmVjaXNpb24gLSBkZXNpcmVkIHByZWNpc2lvbiBvZiB0aGUgbWFudGlzc2FcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdHJpbSAtIGlmIGB0cnVlYCwgdHJhaWxpbmcgemVyb2VzIGFyZSByZW1vdmVkIGZyb20gdGhlIG1hbnRpc3NhXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHNldE1hbnRpc3NhUHJlY2lzaW9uKG91dHB1dCwgdmFsdWUsIG9wdGlvbmFsTWFudGlzc2EsIHByZWNpc2lvbiwgdHJpbSwgcm91bmRpbmdGdW5jdGlvbikge1xuICAgIGlmIChwcmVjaXNpb24gPT09IC0xKSB7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdCA9IHRvRml4ZWQodmFsdWUsIHByZWNpc2lvbiwgcm91bmRpbmdGdW5jdGlvbik7XG4gICAgbGV0IFtjdXJyZW50Q2hhcmFjdGVyaXN0aWMsIGN1cnJlbnRNYW50aXNzYSA9IFwiXCJdID0gcmVzdWx0LnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpO1xuXG4gICAgaWYgKGN1cnJlbnRNYW50aXNzYS5tYXRjaCgvXjArJC8pICYmIChvcHRpb25hbE1hbnRpc3NhIHx8IHRyaW0pKSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50Q2hhcmFjdGVyaXN0aWM7XG4gICAgfVxuXG4gICAgbGV0IGhhc1RyYWlsaW5nWmVyb2VzID0gY3VycmVudE1hbnRpc3NhLm1hdGNoKC8wKyQvKTtcbiAgICBpZiAodHJpbSAmJiBoYXNUcmFpbGluZ1plcm9lcykge1xuICAgICAgICByZXR1cm4gYCR7Y3VycmVudENoYXJhY3RlcmlzdGljfS4ke2N1cnJlbnRNYW50aXNzYS50b1N0cmluZygpLnNsaWNlKDAsIGhhc1RyYWlsaW5nWmVyb2VzLmluZGV4KX1gO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQudG9TdHJpbmcoKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgT1VUUFVUIHdpdGggYSBjaGFyYWN0ZXJpc3RpYyBwcmVjaXNpb24gb2YgUFJFQ0lTSU9OLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBvdXRwdXQgLSBvdXRwdXQgYmVpbmcgYnVpbGQgaW4gdGhlIHByb2Nlc3Mgb2YgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gbnVtYmVyIGJlaW5nIGN1cnJlbnRseSBmb3JtYXR0ZWRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gb3B0aW9uYWxDaGFyYWN0ZXJpc3RpYyAtIGB0cnVlYCBpZiB0aGUgY2hhcmFjdGVyaXN0aWMgaXMgb21pdHRlZCB3aGVuIGl0J3Mgb25seSB6ZXJvZXNcbiAqIEBwYXJhbSB7bnVtYmVyfSBwcmVjaXNpb24gLSBkZXNpcmVkIHByZWNpc2lvbiBvZiB0aGUgY2hhcmFjdGVyaXN0aWNcbiAqIEByZXR1cm4ge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gc2V0Q2hhcmFjdGVyaXN0aWNQcmVjaXNpb24ob3V0cHV0LCB2YWx1ZSwgb3B0aW9uYWxDaGFyYWN0ZXJpc3RpYywgcHJlY2lzaW9uKSB7XG4gICAgbGV0IHJlc3VsdCA9IG91dHB1dDtcbiAgICBsZXQgW2N1cnJlbnRDaGFyYWN0ZXJpc3RpYywgY3VycmVudE1hbnRpc3NhXSA9IHJlc3VsdC50b1N0cmluZygpLnNwbGl0KFwiLlwiKTtcblxuICAgIGlmIChjdXJyZW50Q2hhcmFjdGVyaXN0aWMubWF0Y2goL14tPzAkLykgJiYgb3B0aW9uYWxDaGFyYWN0ZXJpc3RpYykge1xuICAgICAgICBpZiAoIWN1cnJlbnRNYW50aXNzYSkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRDaGFyYWN0ZXJpc3RpYy5yZXBsYWNlKFwiMFwiLCBcIlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBgJHtjdXJyZW50Q2hhcmFjdGVyaXN0aWMucmVwbGFjZShcIjBcIiwgXCJcIil9LiR7Y3VycmVudE1hbnRpc3NhfWA7XG4gICAgfVxuXG4gICAgY29uc3QgaGFzTmVnYXRpdmVTaWduID0gdmFsdWUgPCAwICYmIGN1cnJlbnRDaGFyYWN0ZXJpc3RpYy5pbmRleE9mKFwiLVwiKSA9PT0gMDtcbiAgICBpZiAoaGFzTmVnYXRpdmVTaWduKSB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIG5lZ2F0aXZlIHNpZ25cbiAgICAgICAgICAgIGN1cnJlbnRDaGFyYWN0ZXJpc3RpYyA9IGN1cnJlbnRDaGFyYWN0ZXJpc3RpYy5zbGljZSgxKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5zbGljZSgxKTtcbiAgICB9XG5cbiAgICBpZiAoY3VycmVudENoYXJhY3RlcmlzdGljLmxlbmd0aCA8IHByZWNpc2lvbikge1xuICAgICAgICBsZXQgbWlzc2luZ1plcm9zID0gcHJlY2lzaW9uIC0gY3VycmVudENoYXJhY3RlcmlzdGljLmxlbmd0aDtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBtaXNzaW5nWmVyb3M7IGkrKykge1xuICAgICAgICAgICAgcmVzdWx0ID0gYDAke3Jlc3VsdH1gO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGhhc05lZ2F0aXZlU2lnbikge1xuICAgICAgICAvLyBBZGQgYmFjayB0aGUgbWludXMgc2lnblxuICAgICAgICByZXN1bHQgPSBgLSR7cmVzdWx0fWA7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQudG9TdHJpbmcoKTtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGluZGV4ZXMgd2hlcmUgYXJlIHRoZSBncm91cCBzZXBhcmF0aW9ucyBhZnRlciBzcGxpdHRpbmdcbiAqIGB0b3RhbExlbmd0aGAgaW4gZ3JvdXAgb2YgYGdyb3VwU2l6ZWAgc2l6ZS5cbiAqIEltcG9ydGFudDogd2Ugc3RhcnQgZ3JvdXBpbmcgZnJvbSB0aGUgcmlnaHQgaGFuZCBzaWRlLlxuICpcbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3RhbExlbmd0aCAtIHRvdGFsIGxlbmd0aCBvZiB0aGUgY2hhcmFjdGVyaXN0aWMgdG8gc3BsaXRcbiAqIEBwYXJhbSB7bnVtYmVyfSBncm91cFNpemUgLSBsZW5ndGggb2YgZWFjaCBncm91cFxuICogQHJldHVybiB7W251bWJlcl19XG4gKi9cbmZ1bmN0aW9uIGluZGV4ZXNPZkdyb3VwU3BhY2VzKHRvdGFsTGVuZ3RoLCBncm91cFNpemUpIHtcbiAgICBsZXQgcmVzdWx0ID0gW107XG4gICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgIGZvciAobGV0IGkgPSB0b3RhbExlbmd0aDsgaSA+IDA7IGktLSkge1xuICAgICAgICBpZiAoY291bnRlciA9PT0gZ3JvdXBTaXplKSB7XG4gICAgICAgICAgICByZXN1bHQudW5zaGlmdChpKTtcbiAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGNvdW50ZXIrKztcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIFJlcGxhY2UgdGhlIGRlY2ltYWwgc2VwYXJhdG9yIHdpdGggREVDSU1BTFNFUEFSQVRPUiBhbmQgaW5zZXJ0IHRob3VzYW5kXG4gKiBzZXBhcmF0b3JzLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBvdXRwdXQgLSBvdXRwdXQgYmVpbmcgYnVpbGQgaW4gdGhlIHByb2Nlc3Mgb2YgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtudW1iZXJ9IHZhbHVlIC0gbnVtYmVyIGJlaW5nIGN1cnJlbnRseSBmb3JtYXR0ZWRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gdGhvdXNhbmRTZXBhcmF0ZWQgLSBgdHJ1ZWAgaWYgdGhlIGNoYXJhY3RlcmlzdGljIG11c3QgYmUgc2VwYXJhdGVkXG4gKiBAcGFyYW0ge2dsb2JhbFN0YXRlfSBzdGF0ZSAtIHNoYXJlZCBzdGF0ZSBvZiB0aGUgbGlicmFyeVxuICogQHBhcmFtIHtzdHJpbmd9IGRlY2ltYWxTZXBhcmF0b3IgLSBzdHJpbmcgdG8gdXNlIGFzIGRlY2ltYWwgc2VwYXJhdG9yXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIHJlcGxhY2VEZWxpbWl0ZXJzKG91dHB1dCwgdmFsdWUsIHRob3VzYW5kU2VwYXJhdGVkLCBzdGF0ZSwgZGVjaW1hbFNlcGFyYXRvcikge1xuICAgIGxldCBkZWxpbWl0ZXJzID0gc3RhdGUuY3VycmVudERlbGltaXRlcnMoKTtcbiAgICBsZXQgdGhvdXNhbmRTZXBhcmF0b3IgPSBkZWxpbWl0ZXJzLnRob3VzYW5kcztcbiAgICBkZWNpbWFsU2VwYXJhdG9yID0gZGVjaW1hbFNlcGFyYXRvciB8fCBkZWxpbWl0ZXJzLmRlY2ltYWw7XG4gICAgbGV0IHRob3VzYW5kc1NpemUgPSBkZWxpbWl0ZXJzLnRob3VzYW5kc1NpemUgfHwgMztcblxuICAgIGxldCByZXN1bHQgPSBvdXRwdXQudG9TdHJpbmcoKTtcbiAgICBsZXQgY2hhcmFjdGVyaXN0aWMgPSByZXN1bHQuc3BsaXQoXCIuXCIpWzBdO1xuICAgIGxldCBtYW50aXNzYSA9IHJlc3VsdC5zcGxpdChcIi5cIilbMV07XG4gICAgY29uc3QgaGFzTmVnYXRpdmVTaWduID0gdmFsdWUgPCAwICYmIGNoYXJhY3RlcmlzdGljLmluZGV4T2YoXCItXCIpID09PSAwO1xuXG4gICAgaWYgKHRob3VzYW5kU2VwYXJhdGVkKSB7XG4gICAgICAgIGlmIChoYXNOZWdhdGl2ZVNpZ24pIHtcbiAgICAgICAgICAgIC8vIFJlbW92ZSB0aGUgbmVnYXRpdmUgc2lnblxuICAgICAgICAgICAgY2hhcmFjdGVyaXN0aWMgPSBjaGFyYWN0ZXJpc3RpYy5zbGljZSgxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbmRleGVzVG9JbnNlcnRUaG91c2FuZERlbGltaXRlcnMgPSBpbmRleGVzT2ZHcm91cFNwYWNlcyhjaGFyYWN0ZXJpc3RpYy5sZW5ndGgsIHRob3VzYW5kc1NpemUpO1xuICAgICAgICBpbmRleGVzVG9JbnNlcnRUaG91c2FuZERlbGltaXRlcnMuZm9yRWFjaCgocG9zaXRpb24sIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjaGFyYWN0ZXJpc3RpYyA9IGNoYXJhY3RlcmlzdGljLnNsaWNlKDAsIHBvc2l0aW9uICsgaW5kZXgpICsgdGhvdXNhbmRTZXBhcmF0b3IgKyBjaGFyYWN0ZXJpc3RpYy5zbGljZShwb3NpdGlvbiArIGluZGV4KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGhhc05lZ2F0aXZlU2lnbikge1xuICAgICAgICAgICAgLy8gQWRkIGJhY2sgdGhlIG5lZ2F0aXZlIHNpZ25cbiAgICAgICAgICAgIGNoYXJhY3RlcmlzdGljID0gYC0ke2NoYXJhY3RlcmlzdGljfWA7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIW1hbnRpc3NhKSB7XG4gICAgICAgIHJlc3VsdCA9IGNoYXJhY3RlcmlzdGljO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IGNoYXJhY3RlcmlzdGljICsgZGVjaW1hbFNlcGFyYXRvciArIG1hbnRpc3NhO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuXG4vKipcbiAqIEluc2VydCB0aGUgcHJvdmlkZWQgQUJCUkVWSUFUSU9OIGF0IHRoZSBlbmQgb2YgT1VUUFVULlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBvdXRwdXQgLSBvdXRwdXQgYmVpbmcgYnVpbGQgaW4gdGhlIHByb2Nlc3Mgb2YgZm9ybWF0dGluZ1xuICogQHBhcmFtIHtzdHJpbmd9IGFiYnJldmlhdGlvbiAtIGFiYnJldmlhdGlvbiB0byBhcHBlbmRcbiAqIEByZXR1cm4geyp9XG4gKi9cbmZ1bmN0aW9uIGluc2VydEFiYnJldmlhdGlvbihvdXRwdXQsIGFiYnJldmlhdGlvbikge1xuICAgIHJldHVybiBvdXRwdXQgKyBhYmJyZXZpYXRpb247XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSBwb3NpdGl2ZS9uZWdhdGl2ZSBzaWduIGFjY29yZGluZyB0byB0aGUgTkVHQVRJVkUgZmxhZy5cbiAqIElmIHRoZSB2YWx1ZSBpcyBuZWdhdGl2ZSBidXQgc3RpbGwgb3V0cHV0IGFzIDAsIHRoZSBuZWdhdGl2ZSBzaWduIGlzIHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAtIG91dHB1dCBiZWluZyBidWlsZCBpbiB0aGUgcHJvY2VzcyBvZiBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge251bWJlcn0gdmFsdWUgLSBudW1iZXIgYmVpbmcgY3VycmVudGx5IGZvcm1hdHRlZFxuICogQHBhcmFtIHtzdHJpbmd9IG5lZ2F0aXZlIC0gZmxhZyBmb3IgdGhlIG5lZ2F0aXZlIGZvcm0gKFwic2lnblwiIG9yIFwicGFyZW50aGVzaXNcIilcbiAqIEByZXR1cm4geyp9XG4gKi9cbmZ1bmN0aW9uIGluc2VydFNpZ24ob3V0cHV0LCB2YWx1ZSwgbmVnYXRpdmUpIHtcbiAgICBpZiAodmFsdWUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9XG5cbiAgICBpZiAoK291dHB1dCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gb3V0cHV0LnJlcGxhY2UoXCItXCIsIFwiXCIpO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSA+IDApIHtcbiAgICAgICAgcmV0dXJuIGArJHtvdXRwdXR9YDtcbiAgICB9XG5cbiAgICBpZiAobmVnYXRpdmUgPT09IFwic2lnblwiKSB7XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGAoJHtvdXRwdXQucmVwbGFjZShcIi1cIiwgXCJcIil9KWA7XG59XG5cbi8qKlxuICogSW5zZXJ0IHRoZSBwcm92aWRlZCBQUkVGSVggYXQgdGhlIHN0YXJ0IG9mIE9VVFBVVC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gb3V0cHV0IC0gb3V0cHV0IGJlaW5nIGJ1aWxkIGluIHRoZSBwcm9jZXNzIG9mIGZvcm1hdHRpbmdcbiAqIEBwYXJhbSB7c3RyaW5nfSBwcmVmaXggLSBhYmJyZXZpYXRpb24gdG8gcHJlcGVuZFxuICogQHJldHVybiB7Kn1cbiAqL1xuZnVuY3Rpb24gaW5zZXJ0UHJlZml4KG91dHB1dCwgcHJlZml4KSB7XG4gICAgcmV0dXJuIHByZWZpeCArIG91dHB1dDtcbn1cblxuLyoqXG4gKiBJbnNlcnQgdGhlIHByb3ZpZGVkIFBPU1RGSVggYXQgdGhlIGVuZCBvZiBPVVRQVVQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IG91dHB1dCAtIG91dHB1dCBiZWluZyBidWlsZCBpbiB0aGUgcHJvY2VzcyBvZiBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gcG9zdGZpeCAtIGFiYnJldmlhdGlvbiB0byBhcHBlbmRcbiAqIEByZXR1cm4geyp9XG4gKi9cbmZ1bmN0aW9uIGluc2VydFBvc3RmaXgob3V0cHV0LCBwb3N0Zml4KSB7XG4gICAgcmV0dXJuIG91dHB1dCArIHBvc3RmaXg7XG59XG5cbi8qKlxuICogRm9ybWF0IHRoZSBwcm92aWRlZCBJTlNUQU5DRSBhcyBhIG51bWJlciB1c2luZyB0aGUgUFJPVklERURGT1JNQVQsXG4gKiBhbmQgdGhlIFNUQVRFLlxuICogVGhpcyBpcyB0aGUga2V5IG1ldGhvZCBvZiB0aGUgZnJhbWV3b3JrIVxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBpbnN0YW5jZSAtIG51bWJybyBpbnN0YW5jZSB0byBmb3JtYXRcbiAqIEBwYXJhbSB7e319IFtwcm92aWRlZEZvcm1hdF0gLSBzcGVjaWZpY2F0aW9uIGZvciBmb3JtYXR0aW5nXG4gKiBAcGFyYW0ge2dsb2JhbFN0YXRlfSBzdGF0ZSAtIHNoYXJlZCBzdGF0ZSBvZiB0aGUgbGlicmFyeVxuICogQHBhcmFtIHtzdHJpbmd9IGRlY2ltYWxTZXBhcmF0b3IgLSBzdHJpbmcgdG8gdXNlIGFzIGRlY2ltYWwgc2VwYXJhdG9yXG4gKiBAcGFyYW0ge3t9fSBkZWZhdWx0cyAtIFNldCBvZiBkZWZhdWx0IHZhbHVlcyB1c2VkIGZvciBmb3JtYXR0aW5nXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGZvcm1hdE51bWJlcih7IGluc3RhbmNlLCBwcm92aWRlZEZvcm1hdCwgc3RhdGUgPSBnbG9iYWxTdGF0ZSwgZGVjaW1hbFNlcGFyYXRvciwgZGVmYXVsdHMgPSBzdGF0ZS5jdXJyZW50RGVmYXVsdHMoKSB9KSB7XG4gICAgbGV0IHZhbHVlID0gaW5zdGFuY2UuX3ZhbHVlO1xuXG4gICAgaWYgKHZhbHVlID09PSAwICYmIHN0YXRlLmhhc1plcm9Gb3JtYXQoKSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZ2V0WmVyb0Zvcm1hdCgpO1xuICAgIH1cblxuICAgIGlmICghaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgIH1cblxuICAgIGxldCBvcHRpb25zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdE9wdGlvbnMsIGRlZmF1bHRzLCBwcm92aWRlZEZvcm1hdCk7XG5cbiAgICBsZXQgdG90YWxMZW5ndGggPSBvcHRpb25zLnRvdGFsTGVuZ3RoO1xuICAgIGxldCBjaGFyYWN0ZXJpc3RpY1ByZWNpc2lvbiA9IHRvdGFsTGVuZ3RoID8gMCA6IG9wdGlvbnMuY2hhcmFjdGVyaXN0aWM7XG4gICAgbGV0IG9wdGlvbmFsQ2hhcmFjdGVyaXN0aWMgPSBvcHRpb25zLm9wdGlvbmFsQ2hhcmFjdGVyaXN0aWM7XG4gICAgbGV0IGZvcmNlQXZlcmFnZSA9IG9wdGlvbnMuZm9yY2VBdmVyYWdlO1xuICAgIGxldCBsb3dQcmVjaXNpb24gPSBvcHRpb25zLmxvd1ByZWNpc2lvbjtcbiAgICBsZXQgYXZlcmFnZSA9ICEhdG90YWxMZW5ndGggfHwgISFmb3JjZUF2ZXJhZ2UgfHwgb3B0aW9ucy5hdmVyYWdlO1xuXG4gICAgLy8gZGVmYXVsdCB3aGVuIGF2ZXJhZ2luZyBpcyB0byBjaG9wIG9mZiBkZWNpbWFsc1xuICAgIGxldCBtYW50aXNzYVByZWNpc2lvbiA9IHRvdGFsTGVuZ3RoID8gLTEgOiAoYXZlcmFnZSAmJiBwcm92aWRlZEZvcm1hdC5tYW50aXNzYSA9PT0gdW5kZWZpbmVkID8gMCA6IG9wdGlvbnMubWFudGlzc2EpO1xuICAgIGxldCBvcHRpb25hbE1hbnRpc3NhID0gdG90YWxMZW5ndGggPyBmYWxzZSA6IChwcm92aWRlZEZvcm1hdC5vcHRpb25hbE1hbnRpc3NhID09PSB1bmRlZmluZWQgPyBtYW50aXNzYVByZWNpc2lvbiA9PT0gLTEgOiBvcHRpb25zLm9wdGlvbmFsTWFudGlzc2EpO1xuICAgIGxldCB0cmltTWFudGlzc2EgPSBvcHRpb25zLnRyaW1NYW50aXNzYTtcbiAgICBsZXQgdGhvdXNhbmRTZXBhcmF0ZWQgPSBvcHRpb25zLnRob3VzYW5kU2VwYXJhdGVkO1xuICAgIGxldCBzcGFjZVNlcGFyYXRlZCA9IG9wdGlvbnMuc3BhY2VTZXBhcmF0ZWQ7XG4gICAgbGV0IG5lZ2F0aXZlID0gb3B0aW9ucy5uZWdhdGl2ZTtcbiAgICBsZXQgZm9yY2VTaWduID0gb3B0aW9ucy5mb3JjZVNpZ247XG4gICAgbGV0IGV4cG9uZW50aWFsID0gb3B0aW9ucy5leHBvbmVudGlhbDtcbiAgICBsZXQgcm91bmRpbmdGdW5jdGlvbiA9IG9wdGlvbnMucm91bmRpbmdGdW5jdGlvbjtcblxuICAgIGxldCBhYmJyZXZpYXRpb24gPSBcIlwiO1xuICAgIGlmIChhdmVyYWdlKSB7XG4gICAgICAgIGxldCBkYXRhID0gY29tcHV0ZUF2ZXJhZ2Uoe1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBmb3JjZUF2ZXJhZ2UsXG4gICAgICAgICAgICBsb3dQcmVjaXNpb24sXG4gICAgICAgICAgICBhYmJyZXZpYXRpb25zOiBzdGF0ZS5jdXJyZW50QWJicmV2aWF0aW9ucygpLFxuICAgICAgICAgICAgc3BhY2VTZXBhcmF0ZWQsXG4gICAgICAgICAgICByb3VuZGluZ0Z1bmN0aW9uLFxuICAgICAgICAgICAgdG90YWxMZW5ndGhcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdmFsdWUgPSBkYXRhLnZhbHVlO1xuICAgICAgICBhYmJyZXZpYXRpb24gKz0gZGF0YS5hYmJyZXZpYXRpb247XG5cbiAgICAgICAgaWYgKHRvdGFsTGVuZ3RoKSB7XG4gICAgICAgICAgICBtYW50aXNzYVByZWNpc2lvbiA9IGRhdGEubWFudGlzc2FQcmVjaXNpb247XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZXhwb25lbnRpYWwpIHtcbiAgICAgICAgbGV0IGRhdGEgPSBjb21wdXRlRXhwb25lbnRpYWwoe1xuICAgICAgICAgICAgdmFsdWUsXG4gICAgICAgICAgICBjaGFyYWN0ZXJpc3RpY1ByZWNpc2lvblxuICAgICAgICB9KTtcblxuICAgICAgICB2YWx1ZSA9IGRhdGEudmFsdWU7XG4gICAgICAgIGFiYnJldmlhdGlvbiA9IGRhdGEuYWJicmV2aWF0aW9uICsgYWJicmV2aWF0aW9uO1xuICAgIH1cblxuICAgIGxldCBvdXRwdXQgPSBzZXRNYW50aXNzYVByZWNpc2lvbih2YWx1ZS50b1N0cmluZygpLCB2YWx1ZSwgb3B0aW9uYWxNYW50aXNzYSwgbWFudGlzc2FQcmVjaXNpb24sIHRyaW1NYW50aXNzYSwgcm91bmRpbmdGdW5jdGlvbik7XG4gICAgb3V0cHV0ID0gc2V0Q2hhcmFjdGVyaXN0aWNQcmVjaXNpb24ob3V0cHV0LCB2YWx1ZSwgb3B0aW9uYWxDaGFyYWN0ZXJpc3RpYywgY2hhcmFjdGVyaXN0aWNQcmVjaXNpb24pO1xuICAgIG91dHB1dCA9IHJlcGxhY2VEZWxpbWl0ZXJzKG91dHB1dCwgdmFsdWUsIHRob3VzYW5kU2VwYXJhdGVkLCBzdGF0ZSwgZGVjaW1hbFNlcGFyYXRvcik7XG5cbiAgICBpZiAoYXZlcmFnZSB8fCBleHBvbmVudGlhbCkge1xuICAgICAgICBvdXRwdXQgPSBpbnNlcnRBYmJyZXZpYXRpb24ob3V0cHV0LCBhYmJyZXZpYXRpb24pO1xuICAgIH1cblxuICAgIGlmIChmb3JjZVNpZ24gfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgIG91dHB1dCA9IGluc2VydFNpZ24ob3V0cHV0LCB2YWx1ZSwgbmVnYXRpdmUpO1xuICAgIH1cblxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbi8qKlxuICogSWYgRk9STUFUIGlzIG5vbi1udWxsIGFuZCBub3QganVzdCBhbiBvdXRwdXQsIHJldHVybiBGT1JNQVQuXG4gKiBSZXR1cm4gREVGQVVMVEZPUk1BVCBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHByb3ZpZGVkRm9ybWF0XG4gKiBAcGFyYW0gZGVmYXVsdEZvcm1hdFxuICovXG5mdW5jdGlvbiBmb3JtYXRPckRlZmF1bHQocHJvdmlkZWRGb3JtYXQsIGRlZmF1bHRGb3JtYXQpIHtcbiAgICBpZiAoIXByb3ZpZGVkRm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0Rm9ybWF0O1xuICAgIH1cblxuICAgIGxldCBrZXlzID0gT2JqZWN0LmtleXMocHJvdmlkZWRGb3JtYXQpO1xuICAgIGlmIChrZXlzLmxlbmd0aCA9PT0gMSAmJiBrZXlzWzBdID09PSBcIm91dHB1dFwiKSB7XG4gICAgICAgIHJldHVybiBkZWZhdWx0Rm9ybWF0O1xuICAgIH1cblxuICAgIHJldHVybiBwcm92aWRlZEZvcm1hdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSAobnVtYnJvKSA9PiAoe1xuICAgIGZvcm1hdDogKC4uLmFyZ3MpID0+IGZvcm1hdCguLi5hcmdzLCBudW1icm8pLFxuICAgIGdldEJ5dGVVbml0OiAoLi4uYXJncykgPT4gZ2V0Qnl0ZVVuaXQoLi4uYXJncywgbnVtYnJvKSxcbiAgICBnZXRCaW5hcnlCeXRlVW5pdDogKC4uLmFyZ3MpID0+IGdldEJpbmFyeUJ5dGVVbml0KC4uLmFyZ3MsIG51bWJybyksXG4gICAgZ2V0RGVjaW1hbEJ5dGVVbml0OiAoLi4uYXJncykgPT4gZ2V0RGVjaW1hbEJ5dGVVbml0KC4uLmFyZ3MsIG51bWJybyksXG4gICAgZm9ybWF0T3JEZWZhdWx0XG59KTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBlblVTID0gcmVxdWlyZShcIi4vZW4tVVNcIik7XG5jb25zdCB2YWxpZGF0aW5nID0gcmVxdWlyZShcIi4vdmFsaWRhdGluZ1wiKTtcbmNvbnN0IHBhcnNpbmcgPSByZXF1aXJlKFwiLi9wYXJzaW5nXCIpO1xuXG5sZXQgc3RhdGUgPSB7fTtcblxubGV0IGN1cnJlbnRMYW5ndWFnZVRhZyA9IHVuZGVmaW5lZDtcbmxldCBsYW5ndWFnZXMgPSB7fTtcblxubGV0IHplcm9Gb3JtYXQgPSBudWxsO1xuXG5sZXQgZ2xvYmFsRGVmYXVsdHMgPSB7fTtcblxuZnVuY3Rpb24gY2hvb3NlTGFuZ3VhZ2UodGFnKSB7IGN1cnJlbnRMYW5ndWFnZVRhZyA9IHRhZzsgfVxuXG5mdW5jdGlvbiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkgeyByZXR1cm4gbGFuZ3VhZ2VzW2N1cnJlbnRMYW5ndWFnZVRhZ107IH1cblxuLyoqXG4gKiBSZXR1cm4gYWxsIHRoZSByZWdpc3RlciBsYW5ndWFnZXNcbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUubGFuZ3VhZ2VzID0gKCkgPT4gT2JqZWN0LmFzc2lnbih7fSwgbGFuZ3VhZ2VzKTtcblxuLy9cbi8vIEN1cnJlbnQgbGFuZ3VhZ2UgYWNjZXNzb3JzXG4vL1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBsYW5ndWFnZSB0YWdcbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnN0YXRlLmN1cnJlbnRMYW5ndWFnZSA9ICgpID0+IGN1cnJlbnRMYW5ndWFnZVRhZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgYnl0ZXMgZGF0YVxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50Qnl0ZXMgPSAoKSA9PiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkuYnl0ZXMgfHwge307XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGxhbmd1YWdlIGN1cnJlbmN5IGRhdGFcbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUuY3VycmVudEN1cnJlbmN5ID0gKCkgPT4gY3VycmVudExhbmd1YWdlRGF0YSgpLmN1cnJlbmN5O1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBsYW5ndWFnZSBhYmJyZXZpYXRpb25zIGRhdGFcbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUuY3VycmVudEFiYnJldmlhdGlvbnMgPSAoKSA9PiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkuYWJicmV2aWF0aW9ucztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgZGVsaW1pdGVycyBkYXRhXG4gKlxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmN1cnJlbnREZWxpbWl0ZXJzID0gKCkgPT4gY3VycmVudExhbmd1YWdlRGF0YSgpLmRlbGltaXRlcnM7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBjdXJyZW50IGxhbmd1YWdlIG9yZGluYWwgZnVuY3Rpb25cbiAqXG4gKiBAcmV0dXJuIHtmdW5jdGlvbn1cbiAqL1xuc3RhdGUuY3VycmVudE9yZGluYWwgPSAoKSA9PiBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkub3JkaW5hbDtcblxuLy9cbi8vIERlZmF1bHRzXG4vL1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVudCBmb3JtYXR0aW5nIGRlZmF1bHRzLlxuICogRmlyc3QgdXNlIHRoZSBjdXJyZW50IGxhbmd1YWdlIGRlZmF1bHQsIHRoZW4gZmFsbGJhY2sgdG8gdGhlIGdsb2JhbGx5IGRlZmluZWQgZGVmYXVsdHMuXG4gKlxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmN1cnJlbnREZWZhdWx0cyA9ICgpID0+IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRMYW5ndWFnZURhdGEoKS5kZWZhdWx0cywgZ2xvYmFsRGVmYXVsdHMpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgb3JkaW5hbCBkZWZhdWx0LWZvcm1hdC5cbiAqIEZpcnN0IHVzZSB0aGUgY3VycmVudCBsYW5ndWFnZSBvcmRpbmFsIGRlZmF1bHQsIHRoZW4gZmFsbGJhY2sgdG8gdGhlIHJlZ3VsYXIgZGVmYXVsdHMuXG4gKlxuICogQHJldHVybiB7e319XG4gKi9cbnN0YXRlLmN1cnJlbnRPcmRpbmFsRGVmYXVsdEZvcm1hdCA9ICgpID0+IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmN1cnJlbnREZWZhdWx0cygpLCBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkub3JkaW5hbEZvcm1hdCk7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBieXRlIGRlZmF1bHQtZm9ybWF0LlxuICogRmlyc3QgdXNlIHRoZSBjdXJyZW50IGxhbmd1YWdlIGJ5dGUgZGVmYXVsdCwgdGhlbiBmYWxsYmFjayB0byB0aGUgcmVndWxhciBkZWZhdWx0cy5cbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUuY3VycmVudEJ5dGVEZWZhdWx0Rm9ybWF0ID0gKCkgPT4gT2JqZWN0LmFzc2lnbih7fSwgc3RhdGUuY3VycmVudERlZmF1bHRzKCksIGN1cnJlbnRMYW5ndWFnZURhdGEoKS5ieXRlRm9ybWF0KTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHBlcmNlbnRhZ2UgZGVmYXVsdC1mb3JtYXQuXG4gKiBGaXJzdCB1c2UgdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgcGVyY2VudGFnZSBkZWZhdWx0LCB0aGVuIGZhbGxiYWNrIHRvIHRoZSByZWd1bGFyIGRlZmF1bHRzLlxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50UGVyY2VudGFnZURlZmF1bHRGb3JtYXQgPSAoKSA9PiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5jdXJyZW50RGVmYXVsdHMoKSwgY3VycmVudExhbmd1YWdlRGF0YSgpLnBlcmNlbnRhZ2VGb3JtYXQpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgY3VycmVuY3kgZGVmYXVsdC1mb3JtYXQuXG4gKiBGaXJzdCB1c2UgdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgY3VycmVuY3kgZGVmYXVsdCwgdGhlbiBmYWxsYmFjayB0byB0aGUgcmVndWxhciBkZWZhdWx0cy5cbiAqXG4gKiBAcmV0dXJuIHt7fX1cbiAqL1xuc3RhdGUuY3VycmVudEN1cnJlbmN5RGVmYXVsdEZvcm1hdCA9ICgpID0+IE9iamVjdC5hc3NpZ24oe30sIHN0YXRlLmN1cnJlbnREZWZhdWx0cygpLCBjdXJyZW50TGFuZ3VhZ2VEYXRhKCkuY3VycmVuY3lGb3JtYXQpO1xuXG4vKipcbiAqIFJldHVybiB0aGUgdGltZSBkZWZhdWx0LWZvcm1hdC5cbiAqIEZpcnN0IHVzZSB0aGUgY3VycmVudCBsYW5ndWFnZSBjdXJyZW5jeSBkZWZhdWx0LCB0aGVuIGZhbGxiYWNrIHRvIHRoZSByZWd1bGFyIGRlZmF1bHRzLlxuICpcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5jdXJyZW50VGltZURlZmF1bHRGb3JtYXQgPSAoKSA9PiBPYmplY3QuYXNzaWduKHt9LCBzdGF0ZS5jdXJyZW50RGVmYXVsdHMoKSwgY3VycmVudExhbmd1YWdlRGF0YSgpLnRpbWVGb3JtYXQpO1xuXG4vKipcbiAqIFNldCB0aGUgZ2xvYmFsIGZvcm1hdHRpbmcgZGVmYXVsdHMuXG4gKlxuICogQHBhcmFtIHt7fXxzdHJpbmd9IGZvcm1hdCAtIGZvcm1hdHRpbmcgb3B0aW9ucyB0byB1c2UgYXMgZGVmYXVsdHNcbiAqL1xuc3RhdGUuc2V0RGVmYXVsdHMgPSAoZm9ybWF0KSA9PiB7XG4gICAgZm9ybWF0ID0gcGFyc2luZy5wYXJzZUZvcm1hdChmb3JtYXQpO1xuICAgIGlmICh2YWxpZGF0aW5nLnZhbGlkYXRlRm9ybWF0KGZvcm1hdCkpIHtcbiAgICAgICAgZ2xvYmFsRGVmYXVsdHMgPSBmb3JtYXQ7XG4gICAgfVxufTtcblxuLy9cbi8vIFplcm8gZm9ybWF0XG4vL1xuXG4vKipcbiAqIFJldHVybiB0aGUgZm9ybWF0IHN0cmluZyBmb3IgMC5cbiAqXG4gKiBAcmV0dXJuIHtzdHJpbmd9XG4gKi9cbnN0YXRlLmdldFplcm9Gb3JtYXQgPSAoKSA9PiB6ZXJvRm9ybWF0O1xuXG4vKipcbiAqIFNldCBhIFNUUklORyB0byBvdXRwdXQgd2hlbiB0aGUgdmFsdWUgaXMgMC5cbiAqXG4gKiBAcGFyYW0ge3t9fHN0cmluZ30gc3RyaW5nIC0gc3RyaW5nIHRvIHNldFxuICovXG5zdGF0ZS5zZXRaZXJvRm9ybWF0ID0gKHN0cmluZykgPT4gemVyb0Zvcm1hdCA9IHR5cGVvZihzdHJpbmcpID09PSBcInN0cmluZ1wiID8gc3RyaW5nIDogbnVsbDtcblxuLyoqXG4gKiBSZXR1cm4gdHJ1ZSBpZiBhIGZvcm1hdCBmb3IgMCBoYXMgYmVlbiBzZXQgYWxyZWFkeS5cbiAqXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5zdGF0ZS5oYXNaZXJvRm9ybWF0ID0gKCkgPT4gemVyb0Zvcm1hdCAhPT0gbnVsbDtcblxuLy9cbi8vIEdldHRlcnMvU2V0dGVyc1xuLy9cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxhbmd1YWdlIGRhdGEgZm9yIHRoZSBwcm92aWRlZCBUQUcuXG4gKiBSZXR1cm4gdGhlIGN1cnJlbnQgbGFuZ3VhZ2UgZGF0YSBpZiBubyB0YWcgaXMgcHJvdmlkZWQuXG4gKlxuICogVGhyb3cgYW4gZXJyb3IgaWYgdGhlIHRhZyBkb2Vzbid0IG1hdGNoIGFueSByZWdpc3RlcmVkIGxhbmd1YWdlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBbdGFnXSAtIGxhbmd1YWdlIHRhZyBvZiBhIHJlZ2lzdGVyZWQgbGFuZ3VhZ2VcbiAqIEByZXR1cm4ge3t9fVxuICovXG5zdGF0ZS5sYW5ndWFnZURhdGEgPSAodGFnKSA9PiB7XG4gICAgaWYgKHRhZykge1xuICAgICAgICBpZiAobGFuZ3VhZ2VzW3RhZ10pIHtcbiAgICAgICAgICAgIHJldHVybiBsYW5ndWFnZXNbdGFnXTtcbiAgICAgICAgfVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gdGFnIFwiJHt0YWd9XCJgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY3VycmVudExhbmd1YWdlRGF0YSgpO1xufTtcblxuLyoqXG4gKiBSZWdpc3RlciB0aGUgcHJvdmlkZWQgREFUQSBhcyBhIGxhbmd1YWdlIGlmIGFuZCBvbmx5IGlmIHRoZSBkYXRhIGlzIHZhbGlkLlxuICogSWYgdGhlIGRhdGEgaXMgbm90IHZhbGlkLCBhbiBlcnJvciBpcyB0aHJvd24uXG4gKlxuICogV2hlbiBVU0VMQU5HVUFHRSBpcyB0cnVlLCB0aGUgcmVnaXN0ZXJlZCBsYW5ndWFnZSBpcyB0aGVuIHVzZWQuXG4gKlxuICogQHBhcmFtIHt7fX0gZGF0YSAtIGxhbmd1YWdlIGRhdGEgdG8gcmVnaXN0ZXJcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gW3VzZUxhbmd1YWdlXSAtIGB0cnVlYCBpZiB0aGUgcHJvdmlkZWQgZGF0YSBzaG91bGQgYmVjb21lIHRoZSBjdXJyZW50IGxhbmd1YWdlXG4gKi9cbnN0YXRlLnJlZ2lzdGVyTGFuZ3VhZ2UgPSAoZGF0YSwgdXNlTGFuZ3VhZ2UgPSBmYWxzZSkgPT4ge1xuICAgIGlmICghdmFsaWRhdGluZy52YWxpZGF0ZUxhbmd1YWdlKGRhdGEpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgbGFuZ3VhZ2UgZGF0YVwiKTtcbiAgICB9XG5cbiAgICBsYW5ndWFnZXNbZGF0YS5sYW5ndWFnZVRhZ10gPSBkYXRhO1xuXG4gICAgaWYgKHVzZUxhbmd1YWdlKSB7XG4gICAgICAgIGNob29zZUxhbmd1YWdlKGRhdGEubGFuZ3VhZ2VUYWcpO1xuICAgIH1cbn07XG5cbi8qKlxuICogU2V0IHRoZSBjdXJyZW50IGxhbmd1YWdlIGFjY29yZGluZyB0byBUQUcuXG4gKiBJZiBUQUcgZG9lc24ndCBtYXRjaCBhIHJlZ2lzdGVyZWQgbGFuZ3VhZ2UsIGFub3RoZXIgbGFuZ3VhZ2UgbWF0Y2hpbmdcbiAqIHRoZSBcImxhbmd1YWdlXCIgcGFydCBvZiB0aGUgdGFnIChhY2NvcmRpbmcgdG8gQkNQNDc6IGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvcmZjL2JjcC9iY3A0Ny50eHQpLlxuICogSWYgbm9uZSwgdGhlIEZBTExCQUNLVEFHIGlzIHVzZWQuIElmIHRoZSBGQUxMQkFDS1RBRyBkb2Vzbid0IG1hdGNoIGEgcmVnaXN0ZXIgbGFuZ3VhZ2UsXG4gKiBgZW4tVVNgIGlzIGZpbmFsbHkgdXNlZC5cbiAqXG4gKiBAcGFyYW0gdGFnXG4gKiBAcGFyYW0gZmFsbGJhY2tUYWdcbiAqL1xuc3RhdGUuc2V0TGFuZ3VhZ2UgPSAodGFnLCBmYWxsYmFja1RhZyA9IGVuVVMubGFuZ3VhZ2VUYWcpID0+IHtcbiAgICBpZiAoIWxhbmd1YWdlc1t0YWddKSB7XG4gICAgICAgIGxldCBzdWZmaXggPSB0YWcuc3BsaXQoXCItXCIpWzBdO1xuXG4gICAgICAgIGxldCBtYXRjaGluZ0xhbmd1YWdlVGFnID0gT2JqZWN0LmtleXMobGFuZ3VhZ2VzKS5maW5kKGVhY2ggPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGVhY2guc3BsaXQoXCItXCIpWzBdID09PSBzdWZmaXg7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmICghbGFuZ3VhZ2VzW21hdGNoaW5nTGFuZ3VhZ2VUYWddKSB7XG4gICAgICAgICAgICBjaG9vc2VMYW5ndWFnZShmYWxsYmFja1RhZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjaG9vc2VMYW5ndWFnZShtYXRjaGluZ0xhbmd1YWdlVGFnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNob29zZUxhbmd1YWdlKHRhZyk7XG59O1xuXG5zdGF0ZS5yZWdpc3Rlckxhbmd1YWdlKGVuVVMpO1xuY3VycmVudExhbmd1YWdlVGFnID0gZW5VUy5sYW5ndWFnZVRhZztcblxubW9kdWxlLmV4cG9ydHMgPSBzdGF0ZTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG4vKipcbiAqIExvYWQgbGFuZ3VhZ2VzIG1hdGNoaW5nIFRBR1MuIFNpbGVudGx5IHBhc3Mgb3ZlciB0aGUgZmFpbGluZyBsb2FkLlxuICpcbiAqIFdlIGFzc3VtZSBoZXJlIHRoYXQgd2UgYXJlIGluIGEgbm9kZSBlbnZpcm9ubWVudCwgc28gd2UgZG9uJ3QgY2hlY2sgZm9yIGl0LlxuICogQHBhcmFtIHtbU3RyaW5nXX0gdGFncyAtIGxpc3Qgb2YgdGFncyB0byBsb2FkXG4gKiBAcGFyYW0ge051bWJyb30gbnVtYnJvIC0gdGhlIG51bWJybyBzaW5nbGV0b25cbiAqL1xuZnVuY3Rpb24gbG9hZExhbmd1YWdlc0luTm9kZSh0YWdzLCBudW1icm8pIHtcbiAgICB0YWdzLmZvckVhY2goKHRhZykgPT4ge1xuICAgICAgICBsZXQgZGF0YSA9IHVuZGVmaW5lZDtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGRhdGEgPSByZXF1aXJlKGAuLi9sYW5ndWFnZXMvJHt0YWd9YCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFVuYWJsZSB0byBsb2FkIFwiJHt0YWd9XCIuIE5vIG1hdGNoaW5nIGxhbmd1YWdlIGZpbGUgZm91bmQuYCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIG51bWJyby5yZWdpc3Rlckxhbmd1YWdlKGRhdGEpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gKG51bWJybykgPT4gKHtcbiAgICBsb2FkTGFuZ3VhZ2VzSW5Ob2RlOiAodGFncykgPT4gbG9hZExhbmd1YWdlc0luTm9kZSh0YWdzLCBudW1icm8pXG59KTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBCaWdOdW1iZXIgPSByZXF1aXJlKFwiYmlnbnVtYmVyLmpzXCIpO1xuXG4vKipcbiAqIEFkZCBhIG51bWJlciBvciBhIG51bWJybyB0byBOLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBuIC0gYXVnZW5kXG4gKiBAcGFyYW0ge251bWJlcnxOdW1icm99IG90aGVyIC0gYWRkZW5kXG4gKiBAcGFyYW0ge251bWJyb30gbnVtYnJvIC0gbnVtYnJvIHNpbmdsZXRvblxuICogQHJldHVybiB7TnVtYnJvfSBuXG4gKi9cbmZ1bmN0aW9uIGFkZChuLCBvdGhlciwgbnVtYnJvKSB7XG4gICAgbGV0IHZhbHVlID0gbmV3IEJpZ051bWJlcihuLl92YWx1ZSk7XG4gICAgbGV0IG90aGVyVmFsdWUgPSBvdGhlcjtcblxuICAgIGlmIChudW1icm8uaXNOdW1icm8ob3RoZXIpKSB7XG4gICAgICAgIG90aGVyVmFsdWUgPSBvdGhlci5fdmFsdWU7XG4gICAgfVxuXG4gICAgb3RoZXJWYWx1ZSA9IG5ldyBCaWdOdW1iZXIob3RoZXJWYWx1ZSk7XG5cbiAgICBuLl92YWx1ZSA9IHZhbHVlLnBsdXMob3RoZXJWYWx1ZSkudG9OdW1iZXIoKTtcbiAgICByZXR1cm4gbjtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdCBhIG51bWJlciBvciBhIG51bWJybyBmcm9tIE4uXG4gKlxuICogQHBhcmFtIHtOdW1icm99IG4gLSBtaW51ZW5kXG4gKiBAcGFyYW0ge251bWJlcnxOdW1icm99IG90aGVyIC0gc3VidHJhaGVuZFxuICogQHBhcmFtIHtudW1icm99IG51bWJybyAtIG51bWJybyBzaW5nbGV0b25cbiAqIEByZXR1cm4ge051bWJyb30gblxuICovXG5mdW5jdGlvbiBzdWJ0cmFjdChuLCBvdGhlciwgbnVtYnJvKSB7XG4gICAgbGV0IHZhbHVlID0gbmV3IEJpZ051bWJlcihuLl92YWx1ZSk7XG4gICAgbGV0IG90aGVyVmFsdWUgPSBvdGhlcjtcblxuICAgIGlmIChudW1icm8uaXNOdW1icm8ob3RoZXIpKSB7XG4gICAgICAgIG90aGVyVmFsdWUgPSBvdGhlci5fdmFsdWU7XG4gICAgfVxuXG4gICAgb3RoZXJWYWx1ZSA9IG5ldyBCaWdOdW1iZXIob3RoZXJWYWx1ZSk7XG5cbiAgICBuLl92YWx1ZSA9IHZhbHVlLm1pbnVzKG90aGVyVmFsdWUpLnRvTnVtYmVyKCk7XG4gICAgcmV0dXJuIG47XG59XG5cbi8qKlxuICogTXVsdGlwbHkgTiBieSBhIG51bWJlciBvciBhIG51bWJyby5cbiAqXG4gKiBAcGFyYW0ge051bWJyb30gbiAtIG11bHRpcGxpY2FuZFxuICogQHBhcmFtIHtudW1iZXJ8TnVtYnJvfSBvdGhlciAtIG11bHRpcGxpZXJcbiAqIEBwYXJhbSB7bnVtYnJvfSBudW1icm8gLSBudW1icm8gc2luZ2xldG9uXG4gKiBAcmV0dXJuIHtOdW1icm99IG5cbiAqL1xuZnVuY3Rpb24gbXVsdGlwbHkobiwgb3RoZXIsIG51bWJybykge1xuICAgIGxldCB2YWx1ZSA9IG5ldyBCaWdOdW1iZXIobi5fdmFsdWUpO1xuICAgIGxldCBvdGhlclZhbHVlID0gb3RoZXI7XG5cbiAgICBpZiAobnVtYnJvLmlzTnVtYnJvKG90aGVyKSkge1xuICAgICAgICBvdGhlclZhbHVlID0gb3RoZXIuX3ZhbHVlO1xuICAgIH1cblxuICAgIG90aGVyVmFsdWUgPSBuZXcgQmlnTnVtYmVyKG90aGVyVmFsdWUpO1xuXG4gICAgbi5fdmFsdWUgPSB2YWx1ZS50aW1lcyhvdGhlclZhbHVlKS50b051bWJlcigpO1xuICAgIHJldHVybiBuO1xufVxuXG4vKipcbiAqIERpdmlkZSBOIGJ5IGEgbnVtYmVyIG9yIGEgbnVtYnJvLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvfSBuIC0gZGl2aWRlbmRcbiAqIEBwYXJhbSB7bnVtYmVyfE51bWJyb30gb3RoZXIgLSBkaXZpc29yXG4gKiBAcGFyYW0ge251bWJyb30gbnVtYnJvIC0gbnVtYnJvIHNpbmdsZXRvblxuICogQHJldHVybiB7TnVtYnJvfSBuXG4gKi9cbmZ1bmN0aW9uIGRpdmlkZShuLCBvdGhlciwgbnVtYnJvKSB7XG4gICAgbGV0IHZhbHVlID0gbmV3IEJpZ051bWJlcihuLl92YWx1ZSk7XG4gICAgbGV0IG90aGVyVmFsdWUgPSBvdGhlcjtcblxuICAgIGlmIChudW1icm8uaXNOdW1icm8ob3RoZXIpKSB7XG4gICAgICAgIG90aGVyVmFsdWUgPSBvdGhlci5fdmFsdWU7XG4gICAgfVxuXG4gICAgb3RoZXJWYWx1ZSA9IG5ldyBCaWdOdW1iZXIob3RoZXJWYWx1ZSk7XG5cbiAgICBuLl92YWx1ZSA9IHZhbHVlLmRpdmlkZWRCeShvdGhlclZhbHVlKS50b051bWJlcigpO1xuICAgIHJldHVybiBuO1xufVxuXG4vKipcbiAqIFNldCBOIHRvIHRoZSBPVEhFUiAob3IgdGhlIHZhbHVlIG9mIE9USEVSIHdoZW4gaXQncyBhIG51bWJybyBpbnN0YW5jZSkuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IG4gLSBudW1icm8gaW5zdGFuY2UgdG8gbXV0YXRlXG4gKiBAcGFyYW0ge251bWJlcnxOdW1icm99IG90aGVyIC0gbmV3IHZhbHVlIHRvIGFzc2lnbiB0byBOXG4gKiBAcGFyYW0ge251bWJyb30gbnVtYnJvIC0gbnVtYnJvIHNpbmdsZXRvblxuICogQHJldHVybiB7TnVtYnJvfSBuXG4gKi9cbmZ1bmN0aW9uIHNldCAobiwgb3RoZXIsIG51bWJybykge1xuICAgIGxldCB2YWx1ZSA9IG90aGVyO1xuXG4gICAgaWYgKG51bWJyby5pc051bWJybyhvdGhlcikpIHtcbiAgICAgICAgdmFsdWUgPSBvdGhlci5fdmFsdWU7XG4gICAgfVxuXG4gICAgbi5fdmFsdWUgPSB2YWx1ZTtcbiAgICByZXR1cm4gbjtcbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGRpc3RhbmNlIGJldHdlZW4gTiBhbmQgT1RIRVIuXG4gKlxuICogQHBhcmFtIHtOdW1icm99IG5cbiAqIEBwYXJhbSB7bnVtYmVyfE51bWJyb30gb3RoZXJcbiAqIEBwYXJhbSB7bnVtYnJvfSBudW1icm8gLSBudW1icm8gc2luZ2xldG9uXG4gKiBAcmV0dXJuIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIGRpZmZlcmVuY2Uobiwgb3RoZXIsIG51bWJybykge1xuICAgIGxldCBjbG9uZSA9IG51bWJybyhuLl92YWx1ZSk7XG4gICAgc3VidHJhY3QoY2xvbmUsIG90aGVyLCBudW1icm8pO1xuXG4gICAgcmV0dXJuIE1hdGguYWJzKGNsb25lLl92YWx1ZSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gbnVtYnJvID0+ICh7XG4gICAgYWRkOiAobiwgb3RoZXIpID0+IGFkZChuLCBvdGhlciwgbnVtYnJvKSxcbiAgICBzdWJ0cmFjdDogKG4sIG90aGVyKSA9PiBzdWJ0cmFjdChuLCBvdGhlciwgbnVtYnJvKSxcbiAgICBtdWx0aXBseTogKG4sIG90aGVyKSA9PiBtdWx0aXBseShuLCBvdGhlciwgbnVtYnJvKSxcbiAgICBkaXZpZGU6IChuLCBvdGhlcikgPT4gZGl2aWRlKG4sIG90aGVyLCBudW1icm8pLFxuICAgIHNldDogKG4sIG90aGVyKSA9PiBzZXQobiwgb3RoZXIsIG51bWJybyksXG4gICAgZGlmZmVyZW5jZTogKG4sIG90aGVyKSA9PiBkaWZmZXJlbmNlKG4sIG90aGVyLCBudW1icm8pLFxuICAgIEJpZ051bWJlcjogQmlnTnVtYmVyXG59KTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5jb25zdCBWRVJTSU9OID0gXCIyLjMuNlwiO1xuXG5jb25zdCBnbG9iYWxTdGF0ZSA9IHJlcXVpcmUoXCIuL2dsb2JhbFN0YXRlXCIpO1xuY29uc3QgdmFsaWRhdG9yID0gcmVxdWlyZShcIi4vdmFsaWRhdGluZ1wiKTtcbmNvbnN0IGxvYWRlciA9IHJlcXVpcmUoXCIuL2xvYWRpbmdcIikobnVtYnJvKTtcbmNvbnN0IHVuZm9ybWF0dGVyID0gcmVxdWlyZShcIi4vdW5mb3JtYXR0aW5nXCIpO1xubGV0IGZvcm1hdHRlciA9IHJlcXVpcmUoXCIuL2Zvcm1hdHRpbmdcIikobnVtYnJvKTtcbmxldCBtYW5pcHVsYXRlID0gcmVxdWlyZShcIi4vbWFuaXB1bGF0aW5nXCIpKG51bWJybyk7XG5jb25zdCBwYXJzaW5nID0gcmVxdWlyZShcIi4vcGFyc2luZ1wiKTtcblxuY2xhc3MgTnVtYnJvIHtcbiAgICBjb25zdHJ1Y3RvcihudW1iZXIpIHtcbiAgICAgICAgdGhpcy5fdmFsdWUgPSBudW1iZXI7XG4gICAgfVxuXG4gICAgY2xvbmUoKSB7IHJldHVybiBudW1icm8odGhpcy5fdmFsdWUpOyB9XG5cbiAgICBmb3JtYXQoZm9ybWF0ID0ge30pIHsgcmV0dXJuIGZvcm1hdHRlci5mb3JtYXQodGhpcywgZm9ybWF0KTsgfVxuXG4gICAgZm9ybWF0Q3VycmVuY3koZm9ybWF0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgZm9ybWF0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBmb3JtYXQgPSBwYXJzaW5nLnBhcnNlRm9ybWF0KGZvcm1hdCk7XG4gICAgICAgIH1cbiAgICAgICAgZm9ybWF0ID0gZm9ybWF0dGVyLmZvcm1hdE9yRGVmYXVsdChmb3JtYXQsIGdsb2JhbFN0YXRlLmN1cnJlbnRDdXJyZW5jeURlZmF1bHRGb3JtYXQoKSk7XG4gICAgICAgIGZvcm1hdC5vdXRwdXQgPSBcImN1cnJlbmN5XCI7XG4gICAgICAgIHJldHVybiBmb3JtYXR0ZXIuZm9ybWF0KHRoaXMsIGZvcm1hdCk7XG4gICAgfVxuXG4gICAgZm9ybWF0VGltZShmb3JtYXQgPSB7fSkge1xuICAgICAgICBmb3JtYXQub3V0cHV0ID0gXCJ0aW1lXCI7XG4gICAgICAgIHJldHVybiBmb3JtYXR0ZXIuZm9ybWF0KHRoaXMsIGZvcm1hdCk7XG4gICAgfVxuXG4gICAgYmluYXJ5Qnl0ZVVuaXRzKCkgeyByZXR1cm4gZm9ybWF0dGVyLmdldEJpbmFyeUJ5dGVVbml0KHRoaXMpO31cblxuICAgIGRlY2ltYWxCeXRlVW5pdHMoKSB7IHJldHVybiBmb3JtYXR0ZXIuZ2V0RGVjaW1hbEJ5dGVVbml0KHRoaXMpO31cblxuICAgIGJ5dGVVbml0cygpIHsgcmV0dXJuIGZvcm1hdHRlci5nZXRCeXRlVW5pdCh0aGlzKTt9XG5cbiAgICBkaWZmZXJlbmNlKG90aGVyKSB7IHJldHVybiBtYW5pcHVsYXRlLmRpZmZlcmVuY2UodGhpcywgb3RoZXIpOyB9XG5cbiAgICBhZGQob3RoZXIpIHsgcmV0dXJuIG1hbmlwdWxhdGUuYWRkKHRoaXMsIG90aGVyKTsgfVxuXG4gICAgc3VidHJhY3Qob3RoZXIpIHsgcmV0dXJuIG1hbmlwdWxhdGUuc3VidHJhY3QodGhpcywgb3RoZXIpOyB9XG5cbiAgICBtdWx0aXBseShvdGhlcikgeyByZXR1cm4gbWFuaXB1bGF0ZS5tdWx0aXBseSh0aGlzLCBvdGhlcik7IH1cblxuICAgIGRpdmlkZShvdGhlcikgeyByZXR1cm4gbWFuaXB1bGF0ZS5kaXZpZGUodGhpcywgb3RoZXIpOyB9XG5cbiAgICBzZXQoaW5wdXQpIHsgcmV0dXJuIG1hbmlwdWxhdGUuc2V0KHRoaXMsIG5vcm1hbGl6ZUlucHV0KGlucHV0KSk7IH1cblxuICAgIHZhbHVlKCkgeyByZXR1cm4gdGhpcy5fdmFsdWU7IH1cblxuICAgIHZhbHVlT2YoKSB7IHJldHVybiB0aGlzLl92YWx1ZTsgfVxufVxuXG4vKipcbiAqIE1ha2UgaXRzIGJlc3QgdG8gY29udmVydCBpbnB1dCBpbnRvIGEgbnVtYmVyLlxuICpcbiAqIEBwYXJhbSB7bnVtYnJvfHN0cmluZ3xudW1iZXJ9IGlucHV0IC0gSW5wdXQgdG8gY29udmVydFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVJbnB1dChpbnB1dCkge1xuICAgIGxldCByZXN1bHQgPSBpbnB1dDtcbiAgICBpZiAobnVtYnJvLmlzTnVtYnJvKGlucHV0KSkge1xuICAgICAgICByZXN1bHQgPSBpbnB1dC5fdmFsdWU7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgcmVzdWx0ID0gbnVtYnJvLnVuZm9ybWF0KGlucHV0KTtcbiAgICB9IGVsc2UgaWYgKGlzTmFOKGlucHV0KSkge1xuICAgICAgICByZXN1bHQgPSBOYU47XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxuZnVuY3Rpb24gbnVtYnJvKGlucHV0KSB7XG4gICAgcmV0dXJuIG5ldyBOdW1icm8obm9ybWFsaXplSW5wdXQoaW5wdXQpKTtcbn1cblxubnVtYnJvLnZlcnNpb24gPSBWRVJTSU9OO1xuXG5udW1icm8uaXNOdW1icm8gPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICByZXR1cm4gb2JqZWN0IGluc3RhbmNlb2YgTnVtYnJvO1xufTtcblxuLy9cbi8vIGBudW1icm9gIHN0YXRpYyBtZXRob2RzXG4vL1xuXG5udW1icm8ubGFuZ3VhZ2UgPSBnbG9iYWxTdGF0ZS5jdXJyZW50TGFuZ3VhZ2U7XG5udW1icm8ucmVnaXN0ZXJMYW5ndWFnZSA9IGdsb2JhbFN0YXRlLnJlZ2lzdGVyTGFuZ3VhZ2U7XG5udW1icm8uc2V0TGFuZ3VhZ2UgPSBnbG9iYWxTdGF0ZS5zZXRMYW5ndWFnZTtcbm51bWJyby5sYW5ndWFnZXMgPSBnbG9iYWxTdGF0ZS5sYW5ndWFnZXM7XG5udW1icm8ubGFuZ3VhZ2VEYXRhID0gZ2xvYmFsU3RhdGUubGFuZ3VhZ2VEYXRhO1xubnVtYnJvLnplcm9Gb3JtYXQgPSBnbG9iYWxTdGF0ZS5zZXRaZXJvRm9ybWF0O1xubnVtYnJvLmRlZmF1bHRGb3JtYXQgPSBnbG9iYWxTdGF0ZS5jdXJyZW50RGVmYXVsdHM7XG5udW1icm8uc2V0RGVmYXVsdHMgPSBnbG9iYWxTdGF0ZS5zZXREZWZhdWx0cztcbm51bWJyby5kZWZhdWx0Q3VycmVuY3lGb3JtYXQgPSBnbG9iYWxTdGF0ZS5jdXJyZW50Q3VycmVuY3lEZWZhdWx0Rm9ybWF0O1xubnVtYnJvLnZhbGlkYXRlID0gdmFsaWRhdG9yLnZhbGlkYXRlO1xubnVtYnJvLmxvYWRMYW5ndWFnZXNJbk5vZGUgPSBsb2FkZXIubG9hZExhbmd1YWdlc0luTm9kZTtcbm51bWJyby51bmZvcm1hdCA9IHVuZm9ybWF0dGVyLnVuZm9ybWF0O1xubnVtYnJvLkJpZ051bWJlciA9IG1hbmlwdWxhdGUuQmlnTnVtYmVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG51bWJybztcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG4vKipcbiAqIFBhcnNlIHRoZSBmb3JtYXQgU1RSSU5HIGxvb2tpbmcgZm9yIGEgcHJlZml4LiBBcHBlbmQgaXQgdG8gUkVTVUxUIHdoZW4gZm91bmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIGZvcm1hdFxuICogQHBhcmFtIHtOdW1icm9Gb3JtYXR9IHJlc3VsdCAtIFJlc3VsdCBhY2N1bXVsYXRvclxuICogQHJldHVybiB7c3RyaW5nfSAtIGZvcm1hdFxuICovXG5mdW5jdGlvbiBwYXJzZVByZWZpeChzdHJpbmcsIHJlc3VsdCkge1xuICAgIGxldCBtYXRjaCA9IHN0cmluZy5tYXRjaCgvXnsoW159XSopfS8pO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgICByZXN1bHQucHJlZml4ID0gbWF0Y2hbMV07XG4gICAgICAgIHJldHVybiBzdHJpbmcuc2xpY2UobWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nO1xufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBmb3JtYXQgU1RSSU5HIGxvb2tpbmcgZm9yIGEgcG9zdGZpeC4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VQb3N0Zml4KHN0cmluZywgcmVzdWx0KSB7XG4gICAgbGV0IG1hdGNoID0gc3RyaW5nLm1hdGNoKC97KFtefV0qKX0kLyk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHJlc3VsdC5wb3N0Zml4ID0gbWF0Y2hbMV07XG5cbiAgICAgICAgcmV0dXJuIHN0cmluZy5zbGljZSgwLCAtbWF0Y2hbMF0ubGVuZ3RoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc3RyaW5nO1xufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBmb3JtYXQgU1RSSU5HIGxvb2tpbmcgZm9yIHRoZSBvdXRwdXQgdmFsdWUuIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKi9cbmZ1bmN0aW9uIHBhcnNlT3V0cHV0KHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiJFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0Lm91dHB1dCA9IFwiY3VycmVuY3lcIjtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcIiVcIikgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5vdXRwdXQgPSBcInBlcmNlbnRcIjtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmcuaW5kZXhPZihcImJkXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQub3V0cHV0ID0gXCJieXRlXCI7XG4gICAgICAgIHJlc3VsdC5iYXNlID0gXCJnZW5lcmFsXCI7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCJiXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQub3V0cHV0ID0gXCJieXRlXCI7XG4gICAgICAgIHJlc3VsdC5iYXNlID0gXCJiaW5hcnlcIjtcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgfVxuXG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiZFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0Lm91dHB1dCA9IFwiYnl0ZVwiO1xuICAgICAgICByZXN1bHQuYmFzZSA9IFwiZGVjaW1hbFwiO1xuICAgICAgICByZXR1cm47XG5cbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCI6XCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQub3V0cHV0ID0gXCJ0aW1lXCI7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCJvXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQub3V0cHV0ID0gXCJvcmRpbmFsXCI7XG4gICAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBmb3JtYXQgU1RSSU5HIGxvb2tpbmcgZm9yIHRoZSB0aG91c2FuZCBzZXBhcmF0ZWQgdmFsdWUuIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gZm9ybWF0XG4gKi9cbmZ1bmN0aW9uIHBhcnNlVGhvdXNhbmRTZXBhcmF0ZWQoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCIsXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQudGhvdXNhbmRTZXBhcmF0ZWQgPSB0cnVlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciB0aGUgc3BhY2Ugc2VwYXJhdGVkIHZhbHVlLiBBcHBlbmQgaXQgdG8gUkVTVUxUIHdoZW4gZm91bmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIGZvcm1hdFxuICogQHBhcmFtIHtOdW1icm9Gb3JtYXR9IHJlc3VsdCAtIFJlc3VsdCBhY2N1bXVsYXRvclxuICogQHJldHVybiB7c3RyaW5nfSAtIGZvcm1hdFxuICovXG5mdW5jdGlvbiBwYXJzZVNwYWNlU2VwYXJhdGVkKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiIFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LnNwYWNlU2VwYXJhdGVkID0gdHJ1ZTtcbiAgICAgICAgcmVzdWx0LnNwYWNlU2VwYXJhdGVkQ3VycmVuY3kgPSB0cnVlO1xuXG4gICAgICAgIGlmIChyZXN1bHQuYXZlcmFnZSB8fCByZXN1bHQuZm9yY2VBdmVyYWdlKSB7XG4gICAgICAgICAgICByZXN1bHQuc3BhY2VTZXBhcmF0ZWRBYmJyZXZpYXRpb24gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBmb3JtYXQgU1RSSU5HIGxvb2tpbmcgZm9yIHRoZSB0b3RhbCBsZW5ndGguIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gZm9ybWF0XG4gKi9cbmZ1bmN0aW9uIHBhcnNlVG90YWxMZW5ndGgoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBsZXQgbWF0Y2ggPSBzdHJpbmcubWF0Y2goL1sxLTldK1swLTldKi8pO1xuXG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHJlc3VsdC50b3RhbExlbmd0aCA9ICttYXRjaFswXTtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgbG9va2luZyBmb3IgdGhlIGNoYXJhY3RlcmlzdGljIGxlbmd0aC4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VDaGFyYWN0ZXJpc3RpYyhzdHJpbmcsIHJlc3VsdCkge1xuICAgIGxldCBjaGFyYWN0ZXJpc3RpYyA9IHN0cmluZy5zcGxpdChcIi5cIilbMF07XG4gICAgbGV0IG1hdGNoID0gY2hhcmFjdGVyaXN0aWMubWF0Y2goLzArLyk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIHJlc3VsdC5jaGFyYWN0ZXJpc3RpYyA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgbG9va2luZyBmb3IgdGhlIG1hbnRpc3NhIGxlbmd0aC4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VNYW50aXNzYShzdHJpbmcsIHJlc3VsdCkge1xuICAgIGxldCBtYW50aXNzYSA9IHN0cmluZy5zcGxpdChcIi5cIilbMV07XG4gICAgaWYgKG1hbnRpc3NhKSB7XG4gICAgICAgIGxldCBtYXRjaCA9IG1hbnRpc3NhLm1hdGNoKC8wKy8pO1xuICAgICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgICAgIHJlc3VsdC5tYW50aXNzYSA9IG1hdGNoWzBdLmxlbmd0aDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciBhIHRyaW1tZWQgbWFudGlzc2EuIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKi9cbmZ1bmN0aW9uIHBhcnNlVHJpbU1hbnRpc3NhKHN0cmluZywgcmVzdWx0KSB7XG4gICAgY29uc3QgbWFudGlzc2EgPSBzdHJpbmcuc3BsaXQoXCIuXCIpWzFdO1xuICAgIGlmIChtYW50aXNzYSkge1xuICAgICAgICByZXN1bHQudHJpbU1hbnRpc3NhID0gbWFudGlzc2EuaW5kZXhPZihcIltcIikgIT09IC0xO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciB0aGUgYXZlcmFnZSB2YWx1ZS4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VBdmVyYWdlKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5pbmRleE9mKFwiYVwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LmF2ZXJhZ2UgPSB0cnVlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBsb29raW5nIGZvciBhIGZvcmNlZCBhdmVyYWdlIHByZWNpc2lvbi4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VGb3JjZUF2ZXJhZ2Uoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCJLXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQuZm9yY2VBdmVyYWdlID0gXCJ0aG91c2FuZFwiO1xuICAgIH0gZWxzZSBpZiAoc3RyaW5nLmluZGV4T2YoXCJNXCIpICE9PSAtMSkge1xuICAgICAgICByZXN1bHQuZm9yY2VBdmVyYWdlID0gXCJtaWxsaW9uXCI7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcuaW5kZXhPZihcIkJcIikgIT09IC0xKSB7XG4gICAgICAgIHJlc3VsdC5mb3JjZUF2ZXJhZ2UgPSBcImJpbGxpb25cIjtcbiAgICB9IGVsc2UgaWYgKHN0cmluZy5pbmRleE9mKFwiVFwiKSAhPT0gLTEpIHtcbiAgICAgICAgcmVzdWx0LmZvcmNlQXZlcmFnZSA9IFwidHJpbGxpb25cIjtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgZmluZGluZyBpZiB0aGUgbWFudGlzc2EgaXMgb3B0aW9uYWwuIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKiBAcmV0dXJuIHtzdHJpbmd9IC0gZm9ybWF0XG4gKi9cbmZ1bmN0aW9uIHBhcnNlT3B0aW9uYWxNYW50aXNzYShzdHJpbmcsIHJlc3VsdCkge1xuICAgIGlmIChzdHJpbmcubWF0Y2goL1xcW1xcLl0vKSkge1xuICAgICAgICByZXN1bHQub3B0aW9uYWxNYW50aXNzYSA9IHRydWU7XG4gICAgfSBlbHNlIGlmIChzdHJpbmcubWF0Y2goL1xcLi8pKSB7XG4gICAgICAgIHJlc3VsdC5vcHRpb25hbE1hbnRpc3NhID0gZmFsc2U7XG4gICAgfVxufVxuXG4vKipcbiAqIFBhcnNlIHRoZSBmb3JtYXQgU1RSSU5HIGZpbmRpbmcgaWYgdGhlIGNoYXJhY3RlcmlzdGljIGlzIG9wdGlvbmFsLiBBcHBlbmQgaXQgdG8gUkVTVUxUIHdoZW4gZm91bmQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0cmluZyAtIGZvcm1hdFxuICogQHBhcmFtIHtOdW1icm9Gb3JtYXR9IHJlc3VsdCAtIFJlc3VsdCBhY2N1bXVsYXRvclxuICogQHJldHVybiB7c3RyaW5nfSAtIGZvcm1hdFxuICovXG5mdW5jdGlvbiBwYXJzZU9wdGlvbmFsQ2hhcmFjdGVyaXN0aWMoc3RyaW5nLCByZXN1bHQpIHtcbiAgICBpZiAoc3RyaW5nLmluZGV4T2YoXCIuXCIpICE9PSAtMSkge1xuICAgICAgICBsZXQgY2hhcmFjdGVyaXN0aWMgPSBzdHJpbmcuc3BsaXQoXCIuXCIpWzBdO1xuICAgICAgICByZXN1bHQub3B0aW9uYWxDaGFyYWN0ZXJpc3RpYyA9IGNoYXJhY3RlcmlzdGljLmluZGV4T2YoXCIwXCIpID09PSAtMTtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgbG9va2luZyBmb3IgdGhlIG5lZ2F0aXZlIGZvcm1hdC4gQXBwZW5kIGl0IHRvIFJFU1VMVCB3aGVuIGZvdW5kLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge3N0cmluZ30gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VOZWdhdGl2ZShzdHJpbmcsIHJlc3VsdCkge1xuICAgIGlmIChzdHJpbmcubWF0Y2goL15cXCs/XFwoW14pXSpcXCkkLykpIHtcbiAgICAgICAgcmVzdWx0Lm5lZ2F0aXZlID0gXCJwYXJlbnRoZXNpc1wiO1xuICAgIH1cbiAgICBpZiAoc3RyaW5nLm1hdGNoKC9eXFwrPy0vKSkge1xuICAgICAgICByZXN1bHQubmVnYXRpdmUgPSBcInNpZ25cIjtcbiAgICB9XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGZvcm1hdCBTVFJJTkcgZmluZGluZyBpZiB0aGUgc2lnbiBpcyBtYW5kYXRvcnkuIEFwcGVuZCBpdCB0byBSRVNVTFQgd2hlbiBmb3VuZC5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyaW5nIC0gZm9ybWF0XG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gcmVzdWx0IC0gUmVzdWx0IGFjY3VtdWxhdG9yXG4gKi9cbmZ1bmN0aW9uIHBhcnNlRm9yY2VTaWduKHN0cmluZywgcmVzdWx0KSB7XG4gICAgaWYgKHN0cmluZy5tYXRjaCgvXlxcKy8pKSB7XG4gICAgICAgIHJlc3VsdC5mb3JjZVNpZ24gPSB0cnVlO1xuICAgIH1cbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgZm9ybWF0IFNUUklORyBhbmQgYWNjdW11bGF0aW5nIHRoZSB2YWx1ZXMgaWUgUkVTVUxULlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJpbmcgLSBmb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSByZXN1bHQgLSBSZXN1bHQgYWNjdW11bGF0b3JcbiAqIEByZXR1cm4ge051bWJyb0Zvcm1hdH0gLSBmb3JtYXRcbiAqL1xuZnVuY3Rpb24gcGFyc2VGb3JtYXQoc3RyaW5nLCByZXN1bHQgPSB7fSkge1xuICAgIGlmICh0eXBlb2Ygc3RyaW5nICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBzdHJpbmc7XG4gICAgfVxuXG4gICAgc3RyaW5nID0gcGFyc2VQcmVmaXgoc3RyaW5nLCByZXN1bHQpO1xuICAgIHN0cmluZyA9IHBhcnNlUG9zdGZpeChzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VPdXRwdXQoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlVG90YWxMZW5ndGgoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlQ2hhcmFjdGVyaXN0aWMoc3RyaW5nLCByZXN1bHQpO1xuICAgIHBhcnNlT3B0aW9uYWxDaGFyYWN0ZXJpc3RpYyhzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VBdmVyYWdlKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZUZvcmNlQXZlcmFnZShzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VNYW50aXNzYShzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VPcHRpb25hbE1hbnRpc3NhKHN0cmluZywgcmVzdWx0KTtcbiAgICBwYXJzZVRyaW1NYW50aXNzYShzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VUaG91c2FuZFNlcGFyYXRlZChzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VTcGFjZVNlcGFyYXRlZChzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VOZWdhdGl2ZShzdHJpbmcsIHJlc3VsdCk7XG4gICAgcGFyc2VGb3JjZVNpZ24oc3RyaW5nLCByZXN1bHQpO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgcGFyc2VGb3JtYXRcbn07XG4iLCIvKiFcbiAqIENvcHlyaWdodCAoYykgMjAxNyBCZW5qYW1pbiBWYW4gUnlzZWdoZW08YmVuamFtaW5AdmFucnlzZWdoZW0uY29tPlxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuICogYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKi9cblxuY29uc3QgYWxsU3VmZml4ZXMgPSBbXG4gICAge2tleTogXCJaaUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDI0LCA3KX0sXG4gICAge2tleTogXCJaQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMDAsIDcpfSxcbiAgICB7a2V5OiBcIllpQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMjQsIDgpfSxcbiAgICB7a2V5OiBcIllCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAwMCwgOCl9LFxuICAgIHtrZXk6IFwiVGlCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAyNCwgNCl9LFxuICAgIHtrZXk6IFwiVEJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDAwLCA0KX0sXG4gICAge2tleTogXCJQaUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDI0LCA1KX0sXG4gICAge2tleTogXCJQQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMDAsIDUpfSxcbiAgICB7a2V5OiBcIk1pQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMjQsIDIpfSxcbiAgICB7a2V5OiBcIk1CXCIsIGZhY3RvcjogTWF0aC5wb3coMTAwMCwgMil9LFxuICAgIHtrZXk6IFwiS2lCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAyNCwgMSl9LFxuICAgIHtrZXk6IFwiS0JcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDAwLCAxKX0sXG4gICAge2tleTogXCJHaUJcIiwgZmFjdG9yOiBNYXRoLnBvdygxMDI0LCAzKX0sXG4gICAge2tleTogXCJHQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMDAsIDMpfSxcbiAgICB7a2V5OiBcIkVpQlwiLCBmYWN0b3I6IE1hdGgucG93KDEwMjQsIDYpfSxcbiAgICB7a2V5OiBcIkVCXCIsIGZhY3RvcjogTWF0aC5wb3coMTAwMCwgNil9LFxuICAgIHtrZXk6IFwiQlwiLCBmYWN0b3I6IDF9XG5dO1xuXG4vKipcbiAqIEdlbmVyYXRlIGEgUmVnRXhwIHdoZXJlIFMgZ2V0IGFsbCBSZWdFeHAgc3BlY2lmaWMgY2hhcmFjdGVycyBlc2NhcGVkLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzIC0gc3RyaW5nIHJlcHJlc2VudGluZyBhIFJlZ0V4cFxuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBlc2NhcGVSZWdFeHAocykge1xuICAgIHJldHVybiBzLnJlcGxhY2UoL1stL1xcXFxeJCorPy4oKXxbXFxde31dL2csIFwiXFxcXCQmXCIpO1xufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IGNvbXB1dGUgdGhlIHVuZm9ybWF0dGVkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0cmluZyAtIHN0cmluZyB0byB1bmZvcm1hdFxuICogQHBhcmFtIHsqfSBkZWxpbWl0ZXJzIC0gRGVsaW1pdGVycyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBpbnB1dFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtjdXJyZW5jeVN5bWJvbF0gLSBzeW1ib2wgdXNlZCBmb3IgY3VycmVuY3kgd2hpbGUgZ2VuZXJhdGluZyB0aGUgaW5wdXRTdHJpbmdcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG9yZGluYWwgLSBmdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIGFuIG9yZGluYWwgb3V0IG9mIGEgbnVtYmVyXG4gKiBAcGFyYW0ge3N0cmluZ30gemVyb0Zvcm1hdCAtIHN0cmluZyByZXByZXNlbnRpbmcgemVyb1xuICogQHBhcmFtIHsqfSBhYmJyZXZpYXRpb25zIC0gYWJicmV2aWF0aW9ucyB1c2VkIHdoaWxlIGdlbmVyYXRpbmcgdGhlIGlucHV0U3RyaW5nXG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gZm9ybWF0IC0gZm9ybWF0IHVzZWQgd2hpbGUgZ2VuZXJhdGluZyB0aGUgaW5wdXRTdHJpbmdcbiAqIEByZXR1cm4ge251bWJlcnx1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVVbmZvcm1hdHRlZFZhbHVlKGlucHV0U3RyaW5nLCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCA9IFwiXCIsIG9yZGluYWwsIHplcm9Gb3JtYXQsIGFiYnJldmlhdGlvbnMsIGZvcm1hdCkge1xuICAgIGlmICghaXNOYU4oK2lucHV0U3RyaW5nKSkge1xuICAgICAgICByZXR1cm4gK2lucHV0U3RyaW5nO1xuICAgIH1cblxuICAgIGxldCBzdHJpcHBlZCA9IFwiXCI7XG4gICAgLy8gTmVnYXRpdmVcblxuICAgIGxldCBuZXdJbnB1dCA9IGlucHV0U3RyaW5nLnJlcGxhY2UoLyheW14oXSopXFwoKC4qKVxcKShbXildKiQpLywgXCIkMSQyJDNcIik7XG5cbiAgICBpZiAobmV3SW5wdXQgIT09IGlucHV0U3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAtMSAqIGNvbXB1dGVVbmZvcm1hdHRlZFZhbHVlKG5ld0lucHV0LCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KTtcbiAgICB9XG5cbiAgICAvLyBCeXRlXG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFsbFN1ZmZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBzdWZmaXggPSBhbGxTdWZmaXhlc1tpXTtcbiAgICAgICAgc3RyaXBwZWQgPSBpbnB1dFN0cmluZy5yZXBsYWNlKFJlZ0V4cChgKFswLTkgXSkoJHtzdWZmaXgua2V5fSkkYCksIFwiJDFcIik7XG5cbiAgICAgICAgaWYgKHN0cmlwcGVkICE9PSBpbnB1dFN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXB1dGVVbmZvcm1hdHRlZFZhbHVlKHN0cmlwcGVkLCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KSAqIHN1ZmZpeC5mYWN0b3I7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBQZXJjZW50XG5cbiAgICBzdHJpcHBlZCA9IGlucHV0U3RyaW5nLnJlcGxhY2UoXCIlXCIsIFwiXCIpO1xuXG4gICAgaWYgKHN0cmlwcGVkICE9PSBpbnB1dFN0cmluZykge1xuICAgICAgICByZXR1cm4gY29tcHV0ZVVuZm9ybWF0dGVkVmFsdWUoc3RyaXBwZWQsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpIC8gMTAwO1xuICAgIH1cblxuICAgIC8vIE9yZGluYWxcblxuICAgIGxldCBwb3NzaWJsZU9yZGluYWxWYWx1ZSA9IHBhcnNlRmxvYXQoaW5wdXRTdHJpbmcpO1xuXG4gICAgaWYgKGlzTmFOKHBvc3NpYmxlT3JkaW5hbFZhbHVlKSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGxldCBvcmRpbmFsU3RyaW5nID0gb3JkaW5hbChwb3NzaWJsZU9yZGluYWxWYWx1ZSk7XG4gICAgaWYgKG9yZGluYWxTdHJpbmcgJiYgb3JkaW5hbFN0cmluZyAhPT0gXCIuXCIpIHsgLy8gaWYgb3JkaW5hbCBpcyBcIi5cIiBpdCB3aWxsIGJlIGNhdWdodCBuZXh0IHJvdW5kIGluIHRoZSAraW5wdXRTdHJpbmdcbiAgICAgICAgc3RyaXBwZWQgPSBpbnB1dFN0cmluZy5yZXBsYWNlKG5ldyBSZWdFeHAoYCR7ZXNjYXBlUmVnRXhwKG9yZGluYWxTdHJpbmcpfSRgKSwgXCJcIik7XG5cbiAgICAgICAgaWYgKHN0cmlwcGVkICE9PSBpbnB1dFN0cmluZykge1xuICAgICAgICAgICAgcmV0dXJuIGNvbXB1dGVVbmZvcm1hdHRlZFZhbHVlKHN0cmlwcGVkLCBkZWxpbWl0ZXJzLCBjdXJyZW5jeVN5bWJvbCwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEF2ZXJhZ2VcblxuICAgIGxldCBpbnZlcnNlZEFiYnJldmlhdGlvbnMgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhhYmJyZXZpYXRpb25zKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgaW52ZXJzZWRBYmJyZXZpYXRpb25zW2FiYnJldmlhdGlvbnNba2V5XV0gPSBrZXk7XG4gICAgfSk7XG5cbiAgICBsZXQgYWJicmV2aWF0aW9uVmFsdWVzID0gT2JqZWN0LmtleXMoaW52ZXJzZWRBYmJyZXZpYXRpb25zKS5zb3J0KCkucmV2ZXJzZSgpO1xuICAgIGxldCBudW1iZXJPZkFiYnJldmlhdGlvbnMgPSBhYmJyZXZpYXRpb25WYWx1ZXMubGVuZ3RoO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBudW1iZXJPZkFiYnJldmlhdGlvbnM7IGkrKykge1xuICAgICAgICBsZXQgdmFsdWUgPSBhYmJyZXZpYXRpb25WYWx1ZXNbaV07XG4gICAgICAgIGxldCBrZXkgPSBpbnZlcnNlZEFiYnJldmlhdGlvbnNbdmFsdWVdO1xuXG4gICAgICAgIHN0cmlwcGVkID0gaW5wdXRTdHJpbmcucmVwbGFjZSh2YWx1ZSwgXCJcIik7XG4gICAgICAgIGlmIChzdHJpcHBlZCAhPT0gaW5wdXRTdHJpbmcpIHtcbiAgICAgICAgICAgIGxldCBmYWN0b3IgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICBzd2l0Y2ggKGtleSkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGRlZmF1bHQtY2FzZVxuICAgICAgICAgICAgICAgIGNhc2UgXCJ0aG91c2FuZFwiOlxuICAgICAgICAgICAgICAgICAgICBmYWN0b3IgPSBNYXRoLnBvdygxMCwgMyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJtaWxsaW9uXCI6XG4gICAgICAgICAgICAgICAgICAgIGZhY3RvciA9IE1hdGgucG93KDEwLCA2KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImJpbGxpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgZmFjdG9yID0gTWF0aC5wb3coMTAsIDkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwidHJpbGxpb25cIjpcbiAgICAgICAgICAgICAgICAgICAgZmFjdG9yID0gTWF0aC5wb3coMTAsIDEyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY29tcHV0ZVVuZm9ybWF0dGVkVmFsdWUoc3RyaXBwZWQsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpICogZmFjdG9yO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBSZW1vdmVzIGluIG9uZSBwYXNzIGFsbCBmb3JtYXR0aW5nIHN5bWJvbHMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IGlucHV0U3RyaW5nIC0gc3RyaW5nIHRvIHVuZm9ybWF0XG4gKiBAcGFyYW0geyp9IGRlbGltaXRlcnMgLSBEZWxpbWl0ZXJzIHVzZWQgdG8gZ2VuZXJhdGUgdGhlIGlucHV0U3RyaW5nXG4gKiBAcGFyYW0ge3N0cmluZ30gW2N1cnJlbmN5U3ltYm9sXSAtIHN5bWJvbCB1c2VkIGZvciBjdXJyZW5jeSB3aGlsZSBnZW5lcmF0aW5nIHRoZSBpbnB1dFN0cmluZ1xuICogQHJldHVybiB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiByZW1vdmVGb3JtYXR0aW5nU3ltYm9scyhpbnB1dFN0cmluZywgZGVsaW1pdGVycywgY3VycmVuY3lTeW1ib2wgPSBcIlwiKSB7XG4gICAgLy8gQ3VycmVuY3lcblxuICAgIGxldCBzdHJpcHBlZCA9IGlucHV0U3RyaW5nLnJlcGxhY2UoY3VycmVuY3lTeW1ib2wsIFwiXCIpO1xuXG4gICAgLy8gVGhvdXNhbmQgc2VwYXJhdG9yc1xuXG4gICAgc3RyaXBwZWQgPSBzdHJpcHBlZC5yZXBsYWNlKG5ldyBSZWdFeHAoYChbMC05XSkke2VzY2FwZVJlZ0V4cChkZWxpbWl0ZXJzLnRob3VzYW5kcyl9KFswLTldKWAsIFwiZ1wiKSwgXCIkMSQyXCIpO1xuXG4gICAgLy8gRGVjaW1hbFxuXG4gICAgc3RyaXBwZWQgPSBzdHJpcHBlZC5yZXBsYWNlKGRlbGltaXRlcnMuZGVjaW1hbCwgXCIuXCIpO1xuXG4gICAgcmV0dXJuIHN0cmlwcGVkO1xufVxuXG4vKipcbiAqIFVuZm9ybWF0IGEgbnVtYnJvLWdlbmVyYXRlZCBzdHJpbmcgdG8gcmV0cmlldmUgdGhlIG9yaWdpbmFsIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0cmluZyAtIHN0cmluZyB0byB1bmZvcm1hdFxuICogQHBhcmFtIHsqfSBkZWxpbWl0ZXJzIC0gRGVsaW1pdGVycyB1c2VkIHRvIGdlbmVyYXRlIHRoZSBpbnB1dFN0cmluZ1xuICogQHBhcmFtIHtzdHJpbmd9IFtjdXJyZW5jeVN5bWJvbF0gLSBzeW1ib2wgdXNlZCBmb3IgY3VycmVuY3kgd2hpbGUgZ2VuZXJhdGluZyB0aGUgaW5wdXRTdHJpbmdcbiAqIEBwYXJhbSB7ZnVuY3Rpb259IG9yZGluYWwgLSBmdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIGFuIG9yZGluYWwgb3V0IG9mIGEgbnVtYmVyXG4gKiBAcGFyYW0ge3N0cmluZ30gemVyb0Zvcm1hdCAtIHN0cmluZyByZXByZXNlbnRpbmcgemVyb1xuICogQHBhcmFtIHsqfSBhYmJyZXZpYXRpb25zIC0gYWJicmV2aWF0aW9ucyB1c2VkIHdoaWxlIGdlbmVyYXRpbmcgdGhlIGlucHV0U3RyaW5nXG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gZm9ybWF0IC0gZm9ybWF0IHVzZWQgd2hpbGUgZ2VuZXJhdGluZyB0aGUgaW5wdXRTdHJpbmdcbiAqIEByZXR1cm4ge251bWJlcnx1bmRlZmluZWR9XG4gKi9cbmZ1bmN0aW9uIHVuZm9ybWF0VmFsdWUoaW5wdXRTdHJpbmcsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sID0gXCJcIiwgb3JkaW5hbCwgemVyb0Zvcm1hdCwgYWJicmV2aWF0aW9ucywgZm9ybWF0KSB7XG4gICAgaWYgKGlucHV0U3RyaW5nID09PSBcIlwiKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgLy8gWmVybyBGb3JtYXRcblxuICAgIGlmIChpbnB1dFN0cmluZyA9PT0gemVyb0Zvcm1hdCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBsZXQgdmFsdWUgPSByZW1vdmVGb3JtYXR0aW5nU3ltYm9scyhpbnB1dFN0cmluZywgZGVsaW1pdGVycywgY3VycmVuY3lTeW1ib2wpO1xuICAgIHJldHVybiBjb21wdXRlVW5mb3JtYXR0ZWRWYWx1ZSh2YWx1ZSwgZGVsaW1pdGVycywgY3VycmVuY3lTeW1ib2wsIG9yZGluYWwsIHplcm9Gb3JtYXQsIGFiYnJldmlhdGlvbnMsIGZvcm1hdCk7XG59XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIElOUFVUU1RSSU5HIHJlcHJlc2VudHMgYSB0aW1lLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0cmluZyAtIHN0cmluZyB0byBjaGVja1xuICogQHBhcmFtIHsqfSBkZWxpbWl0ZXJzIC0gRGVsaW1pdGVycyB1c2VkIHdoaWxlIGdlbmVyYXRpbmcgdGhlIGlucHV0U3RyaW5nXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBtYXRjaGVzVGltZShpbnB1dFN0cmluZywgZGVsaW1pdGVycykge1xuICAgIGxldCBzZXBhcmF0b3JzID0gaW5wdXRTdHJpbmcuaW5kZXhPZihcIjpcIikgJiYgZGVsaW1pdGVycy50aG91c2FuZHMgIT09IFwiOlwiO1xuXG4gICAgaWYgKCFzZXBhcmF0b3JzKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgc2VnbWVudHMgPSBpbnB1dFN0cmluZy5zcGxpdChcIjpcIik7XG4gICAgaWYgKHNlZ21lbnRzLmxlbmd0aCAhPT0gMykge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IGhvdXJzID0gK3NlZ21lbnRzWzBdO1xuICAgIGxldCBtaW51dGVzID0gK3NlZ21lbnRzWzFdO1xuICAgIGxldCBzZWNvbmRzID0gK3NlZ21lbnRzWzJdO1xuXG4gICAgcmV0dXJuICFpc05hTihob3VycykgJiYgIWlzTmFOKG1pbnV0ZXMpICYmICFpc05hTihzZWNvbmRzKTtcbn1cblxuLyoqXG4gKiBVbmZvcm1hdCBhIG51bWJyby1nZW5lcmF0ZWQgc3RyaW5nIHJlcHJlc2VudGluZyBhIHRpbWUgdG8gcmV0cmlldmUgdGhlIG9yaWdpbmFsIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBpbnB1dFN0cmluZyAtIHN0cmluZyB0byB1bmZvcm1hdFxuICogQHJldHVybiB7bnVtYmVyfVxuICovXG5mdW5jdGlvbiB1bmZvcm1hdFRpbWUoaW5wdXRTdHJpbmcpIHtcbiAgICBsZXQgc2VnbWVudHMgPSBpbnB1dFN0cmluZy5zcGxpdChcIjpcIik7XG5cbiAgICBsZXQgaG91cnMgPSArc2VnbWVudHNbMF07XG4gICAgbGV0IG1pbnV0ZXMgPSArc2VnbWVudHNbMV07XG4gICAgbGV0IHNlY29uZHMgPSArc2VnbWVudHNbMl07XG5cbiAgICByZXR1cm4gc2Vjb25kcyArIDYwICogbWludXRlcyArIDM2MDAgKiBob3Vycztcbn1cblxuLyoqXG4gKiBVbmZvcm1hdCBhIG51bWJyby1nZW5lcmF0ZWQgc3RyaW5nIHRvIHJldHJpZXZlIHRoZSBvcmlnaW5hbCB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gaW5wdXRTdHJpbmcgLSBzdHJpbmcgdG8gdW5mb3JtYXRcbiAqIEBwYXJhbSB7TnVtYnJvRm9ybWF0fSBmb3JtYXQgLSBmb3JtYXQgdXNlZCAgd2hpbGUgZ2VuZXJhdGluZyB0aGUgaW5wdXRTdHJpbmdcbiAqIEByZXR1cm4ge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gdW5mb3JtYXQoaW5wdXRTdHJpbmcsIGZvcm1hdCkge1xuICAgIC8vIEF2b2lkIGNpcmN1bGFyIHJlZmVyZW5jZXNcbiAgICBjb25zdCBnbG9iYWxTdGF0ZSA9IHJlcXVpcmUoXCIuL2dsb2JhbFN0YXRlXCIpO1xuXG4gICAgbGV0IGRlbGltaXRlcnMgPSBnbG9iYWxTdGF0ZS5jdXJyZW50RGVsaW1pdGVycygpO1xuICAgIGxldCBjdXJyZW5jeVN5bWJvbCA9IGdsb2JhbFN0YXRlLmN1cnJlbnRDdXJyZW5jeSgpLnN5bWJvbDtcbiAgICBsZXQgb3JkaW5hbCA9IGdsb2JhbFN0YXRlLmN1cnJlbnRPcmRpbmFsKCk7XG4gICAgbGV0IHplcm9Gb3JtYXQgPSBnbG9iYWxTdGF0ZS5nZXRaZXJvRm9ybWF0KCk7XG4gICAgbGV0IGFiYnJldmlhdGlvbnMgPSBnbG9iYWxTdGF0ZS5jdXJyZW50QWJicmV2aWF0aW9ucygpO1xuXG4gICAgbGV0IHZhbHVlID0gdW5kZWZpbmVkO1xuXG4gICAgaWYgKHR5cGVvZiBpbnB1dFN0cmluZyA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAobWF0Y2hlc1RpbWUoaW5wdXRTdHJpbmcsIGRlbGltaXRlcnMpKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVuZm9ybWF0VGltZShpbnB1dFN0cmluZyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVuZm9ybWF0VmFsdWUoaW5wdXRTdHJpbmcsIGRlbGltaXRlcnMsIGN1cnJlbmN5U3ltYm9sLCBvcmRpbmFsLCB6ZXJvRm9ybWF0LCBhYmJyZXZpYXRpb25zLCBmb3JtYXQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgaW5wdXRTdHJpbmcgPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgdmFsdWUgPSBpbnB1dFN0cmluZztcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHVlO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICB1bmZvcm1hdFxufTtcbiIsIi8qIVxuICogQ29weXJpZ2h0IChjKSAyMDE3IEJlbmphbWluIFZhbiBSeXNlZ2hlbTxiZW5qYW1pbkB2YW5yeXNlZ2hlbS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG5sZXQgdW5mb3JtYXR0ZXIgPSByZXF1aXJlKFwiLi91bmZvcm1hdHRpbmdcIik7XG5cbi8vIFNpbXBsaWZpZWQgcmVnZXhwIHN1cHBvcnRpbmcgb25seSBgbGFuZ3VhZ2VgLCBgc2NyaXB0YCwgYW5kIGByZWdpb25gXG5jb25zdCBiY3A0N1JlZ0V4cCA9IC9eW2Etel17MiwzfSgtW2EtekEtWl17NH0pPygtKFtBLVpdezJ9fFswLTldezN9KSk/JC87XG5cbmNvbnN0IHZhbGlkT3V0cHV0VmFsdWVzID0gW1xuICAgIFwiY3VycmVuY3lcIixcbiAgICBcInBlcmNlbnRcIixcbiAgICBcImJ5dGVcIixcbiAgICBcInRpbWVcIixcbiAgICBcIm9yZGluYWxcIixcbiAgICBcIm51bWJlclwiXG5dO1xuXG5jb25zdCB2YWxpZEZvcmNlQXZlcmFnZVZhbHVlcyA9IFtcbiAgICBcInRyaWxsaW9uXCIsXG4gICAgXCJiaWxsaW9uXCIsXG4gICAgXCJtaWxsaW9uXCIsXG4gICAgXCJ0aG91c2FuZFwiXG5dO1xuXG5jb25zdCB2YWxpZEN1cnJlbmN5UG9zaXRpb24gPSBbXG4gICAgXCJwcmVmaXhcIixcbiAgICBcImluZml4XCIsXG4gICAgXCJwb3N0Zml4XCJcbl07XG5cbmNvbnN0IHZhbGlkTmVnYXRpdmVWYWx1ZXMgPSBbXG4gICAgXCJzaWduXCIsXG4gICAgXCJwYXJlbnRoZXNpc1wiXG5dO1xuXG5jb25zdCB2YWxpZE1hbmRhdG9yeUFiYnJldmlhdGlvbnMgPSB7XG4gICAgdHlwZTogXCJvYmplY3RcIixcbiAgICBjaGlsZHJlbjoge1xuICAgICAgICB0aG91c2FuZDoge1xuICAgICAgICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBtaWxsaW9uOiB7XG4gICAgICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGJpbGxpb246IHtcbiAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICAgICAgfSxcbiAgICAgICAgdHJpbGxpb246IHtcbiAgICAgICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICAgICAgfVxuICAgIH0sXG4gICAgbWFuZGF0b3J5OiB0cnVlXG59O1xuXG5jb25zdCB2YWxpZEFiYnJldmlhdGlvbnMgPSB7XG4gICAgdHlwZTogXCJvYmplY3RcIixcbiAgICBjaGlsZHJlbjoge1xuICAgICAgICB0aG91c2FuZDogXCJzdHJpbmdcIixcbiAgICAgICAgbWlsbGlvbjogXCJzdHJpbmdcIixcbiAgICAgICAgYmlsbGlvbjogXCJzdHJpbmdcIixcbiAgICAgICAgdHJpbGxpb246IFwic3RyaW5nXCJcbiAgICB9XG59O1xuXG5jb25zdCB2YWxpZEJhc2VWYWx1ZXMgPSBbXG4gICAgXCJkZWNpbWFsXCIsXG4gICAgXCJiaW5hcnlcIixcbiAgICBcImdlbmVyYWxcIlxuXTtcblxuY29uc3QgdmFsaWRGb3JtYXQgPSB7XG4gICAgb3V0cHV0OiB7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIHZhbGlkVmFsdWVzOiB2YWxpZE91dHB1dFZhbHVlc1xuICAgIH0sXG4gICAgYmFzZToge1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICB2YWxpZFZhbHVlczogdmFsaWRCYXNlVmFsdWVzLFxuICAgICAgICByZXN0cmljdGlvbjogKG51bWJlciwgZm9ybWF0KSA9PiBmb3JtYXQub3V0cHV0ID09PSBcImJ5dGVcIixcbiAgICAgICAgbWVzc2FnZTogXCJgYmFzZWAgbXVzdCBiZSBwcm92aWRlZCBvbmx5IHdoZW4gdGhlIG91dHB1dCBpcyBgYnl0ZWBcIixcbiAgICAgICAgbWFuZGF0b3J5OiAoZm9ybWF0KSA9PiBmb3JtYXQub3V0cHV0ID09PSBcImJ5dGVcIlxuICAgIH0sXG4gICAgY2hhcmFjdGVyaXN0aWM6IHtcbiAgICAgICAgdHlwZTogXCJudW1iZXJcIixcbiAgICAgICAgcmVzdHJpY3Rpb246IChudW1iZXIpID0+IG51bWJlciA+PSAwLFxuICAgICAgICBtZXNzYWdlOiBcInZhbHVlIG11c3QgYmUgcG9zaXRpdmVcIlxuICAgIH0sXG4gICAgcHJlZml4OiBcInN0cmluZ1wiLFxuICAgIHBvc3RmaXg6IFwic3RyaW5nXCIsXG4gICAgZm9yY2VBdmVyYWdlOiB7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIHZhbGlkVmFsdWVzOiB2YWxpZEZvcmNlQXZlcmFnZVZhbHVlc1xuICAgIH0sXG4gICAgYXZlcmFnZTogXCJib29sZWFuXCIsXG4gICAgbG93UHJlY2lzaW9uOiB7XG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICByZXN0cmljdGlvbjogKG51bWJlciwgZm9ybWF0KSA9PiBmb3JtYXQuYXZlcmFnZSA9PT0gdHJ1ZSxcbiAgICAgICAgbWVzc2FnZTogXCJgbG93UHJlY2lzaW9uYCBtdXN0IGJlIHByb3ZpZGVkIG9ubHkgd2hlbiB0aGUgb3B0aW9uIGBhdmVyYWdlYCBpcyBzZXRcIlxuICAgIH0sXG4gICAgY3VycmVuY3lQb3NpdGlvbjoge1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICB2YWxpZFZhbHVlczogdmFsaWRDdXJyZW5jeVBvc2l0aW9uXG4gICAgfSxcbiAgICBjdXJyZW5jeVN5bWJvbDogXCJzdHJpbmdcIixcbiAgICB0b3RhbExlbmd0aDoge1xuICAgICAgICB0eXBlOiBcIm51bWJlclwiLFxuICAgICAgICByZXN0cmljdGlvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXN0cmljdGlvbjogKG51bWJlcikgPT4gbnVtYmVyID49IDAsXG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJ2YWx1ZSBtdXN0IGJlIHBvc2l0aXZlXCJcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmVzdHJpY3Rpb246IChudW1iZXIsIGZvcm1hdCkgPT4gIWZvcm1hdC5leHBvbmVudGlhbCxcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImB0b3RhbExlbmd0aGAgaXMgaW5jb21wYXRpYmxlIHdpdGggYGV4cG9uZW50aWFsYFwiXG4gICAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICB9LFxuICAgIG1hbnRpc3NhOiB7XG4gICAgICAgIHR5cGU6IFwibnVtYmVyXCIsXG4gICAgICAgIHJlc3RyaWN0aW9uOiAobnVtYmVyKSA9PiBudW1iZXIgPj0gMCxcbiAgICAgICAgbWVzc2FnZTogXCJ2YWx1ZSBtdXN0IGJlIHBvc2l0aXZlXCJcbiAgICB9LFxuICAgIG9wdGlvbmFsTWFudGlzc2E6IFwiYm9vbGVhblwiLFxuICAgIHRyaW1NYW50aXNzYTogXCJib29sZWFuXCIsXG4gICAgcm91bmRpbmdGdW5jdGlvbjogXCJmdW5jdGlvblwiLFxuICAgIG9wdGlvbmFsQ2hhcmFjdGVyaXN0aWM6IFwiYm9vbGVhblwiLFxuICAgIHRob3VzYW5kU2VwYXJhdGVkOiBcImJvb2xlYW5cIixcbiAgICBzcGFjZVNlcGFyYXRlZDogXCJib29sZWFuXCIsXG4gICAgc3BhY2VTZXBhcmF0ZWRDdXJyZW5jeTogXCJib29sZWFuXCIsXG4gICAgc3BhY2VTZXBhcmF0ZWRBYmJyZXZpYXRpb246IFwiYm9vbGVhblwiLFxuICAgIGFiYnJldmlhdGlvbnM6IHZhbGlkQWJicmV2aWF0aW9ucyxcbiAgICBuZWdhdGl2ZToge1xuICAgICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgICAgICB2YWxpZFZhbHVlczogdmFsaWROZWdhdGl2ZVZhbHVlc1xuICAgIH0sXG4gICAgZm9yY2VTaWduOiBcImJvb2xlYW5cIixcbiAgICBleHBvbmVudGlhbDoge1xuICAgICAgICB0eXBlOiBcImJvb2xlYW5cIlxuICAgIH0sXG4gICAgcHJlZml4U3ltYm9sOiB7XG4gICAgICAgIHR5cGU6IFwiYm9vbGVhblwiLFxuICAgICAgICByZXN0cmljdGlvbjogKG51bWJlciwgZm9ybWF0KSA9PiBmb3JtYXQub3V0cHV0ID09PSBcInBlcmNlbnRcIixcbiAgICAgICAgbWVzc2FnZTogXCJgcHJlZml4U3ltYm9sYCBjYW4gYmUgcHJvdmlkZWQgb25seSB3aGVuIHRoZSBvdXRwdXQgaXMgYHBlcmNlbnRgXCJcbiAgICB9XG59O1xuXG5jb25zdCB2YWxpZExhbmd1YWdlID0ge1xuICAgIGxhbmd1YWdlVGFnOiB7XG4gICAgICAgIHR5cGU6IFwic3RyaW5nXCIsXG4gICAgICAgIG1hbmRhdG9yeTogdHJ1ZSxcbiAgICAgICAgcmVzdHJpY3Rpb246ICh0YWcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0YWcubWF0Y2goYmNwNDdSZWdFeHApO1xuICAgICAgICB9LFxuICAgICAgICBtZXNzYWdlOiBcInRoZSBsYW5ndWFnZSB0YWcgbXVzdCBmb2xsb3cgdGhlIEJDUCA0NyBzcGVjaWZpY2F0aW9uIChzZWUgaHR0cHM6Ly90b29scy5pZWZ0Lm9yZy9odG1sL2JjcDQ3KVwiXG4gICAgfSxcbiAgICBkZWxpbWl0ZXJzOiB7XG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgIGNoaWxkcmVuOiB7XG4gICAgICAgICAgICB0aG91c2FuZHM6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICBkZWNpbWFsOiBcInN0cmluZ1wiLFxuICAgICAgICAgICAgdGhvdXNhbmRzU2l6ZTogXCJudW1iZXJcIlxuICAgICAgICB9LFxuICAgICAgICBtYW5kYXRvcnk6IHRydWVcbiAgICB9LFxuICAgIGFiYnJldmlhdGlvbnM6IHZhbGlkTWFuZGF0b3J5QWJicmV2aWF0aW9ucyxcbiAgICBzcGFjZVNlcGFyYXRlZDogXCJib29sZWFuXCIsXG4gICAgc3BhY2VTZXBhcmF0ZWRDdXJyZW5jeTogXCJib29sZWFuXCIsXG4gICAgb3JkaW5hbDoge1xuICAgICAgICB0eXBlOiBcImZ1bmN0aW9uXCIsXG4gICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgIH0sXG4gICAgYnl0ZXM6IHtcbiAgICAgICAgdHlwZTogXCJvYmplY3RcIixcbiAgICAgICAgY2hpbGRyZW46IHtcbiAgICAgICAgICAgIGJpbmFyeVN1ZmZpeGVzOiBcIm9iamVjdFwiLFxuICAgICAgICAgICAgZGVjaW1hbFN1ZmZpeGVzOiBcIm9iamVjdFwiXG4gICAgICAgIH1cbiAgICB9LFxuICAgIGN1cnJlbmN5OiB7XG4gICAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICAgIGNoaWxkcmVuOiB7XG4gICAgICAgICAgICBzeW1ib2w6IFwic3RyaW5nXCIsXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJzdHJpbmdcIixcbiAgICAgICAgICAgIGNvZGU6IFwic3RyaW5nXCJcbiAgICAgICAgfSxcbiAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgfSxcbiAgICBkZWZhdWx0czogXCJmb3JtYXRcIixcbiAgICBvcmRpbmFsRm9ybWF0OiBcImZvcm1hdFwiLFxuICAgIGJ5dGVGb3JtYXQ6IFwiZm9ybWF0XCIsXG4gICAgcGVyY2VudGFnZUZvcm1hdDogXCJmb3JtYXRcIixcbiAgICBjdXJyZW5jeUZvcm1hdDogXCJmb3JtYXRcIixcbiAgICB0aW1lRGVmYXVsdHM6IFwiZm9ybWF0XCIsXG4gICAgZm9ybWF0czoge1xuICAgICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgICBjaGlsZHJlbjoge1xuICAgICAgICAgICAgZm91ckRpZ2l0czoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVsbFdpdGhUd29EZWNpbWFsczoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVsbFdpdGhUd29EZWNpbWFsc05vQ3VycmVuY3k6IHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcImZvcm1hdFwiLFxuICAgICAgICAgICAgICAgIG1hbmRhdG9yeTogdHJ1ZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bGxXaXRoTm9EZWNpbWFsczoge1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiZm9ybWF0XCIsXG4gICAgICAgICAgICAgICAgbWFuZGF0b3J5OiB0cnVlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIENoZWNrIHRoZSB2YWxpZGl0eSBvZiB0aGUgcHJvdmlkZWQgaW5wdXQgYW5kIGZvcm1hdC5cbiAqIFRoZSBjaGVjayBpcyBOT1QgbGF6eS5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ3xudW1iZXJ8TnVtYnJvfSBpbnB1dCAtIGlucHV0IHRvIGNoZWNrXG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gZm9ybWF0IC0gZm9ybWF0IHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIHdoZW4gZXZlcnl0aGluZyBpcyBjb3JyZWN0XG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlKGlucHV0LCBmb3JtYXQpIHtcbiAgICBsZXQgdmFsaWRJbnB1dCA9IHZhbGlkYXRlSW5wdXQoaW5wdXQpO1xuICAgIGxldCBpc0Zvcm1hdFZhbGlkID0gdmFsaWRhdGVGb3JtYXQoZm9ybWF0KTtcblxuICAgIHJldHVybiB2YWxpZElucHV0ICYmIGlzRm9ybWF0VmFsaWQ7XG59XG5cbi8qKlxuICogQ2hlY2sgdGhlIHZhbGlkaXR5IG9mIHRoZSBudW1icm8gaW5wdXQuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd8bnVtYmVyfE51bWJyb30gaW5wdXQgLSBpbnB1dCB0byBjaGVja1xuICogQHJldHVybiB7Ym9vbGVhbn0gVHJ1ZSB3aGVuIGV2ZXJ5dGhpbmcgaXMgY29ycmVjdFxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUlucHV0KGlucHV0KSB7XG4gICAgbGV0IHZhbHVlID0gdW5mb3JtYXR0ZXIudW5mb3JtYXQoaW5wdXQpO1xuXG4gICAgcmV0dXJuIHZhbHVlICE9PSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ2hlY2sgdGhlIHZhbGlkaXR5IG9mIHRoZSBwcm92aWRlZCBmb3JtYXQgVE9WQUxJREFURSBhZ2FpbnN0IFNQRUMuXG4gKlxuICogQHBhcmFtIHtOdW1icm9Gb3JtYXR9IHRvVmFsaWRhdGUgLSBmb3JtYXQgdG8gY2hlY2tcbiAqIEBwYXJhbSB7Kn0gc3BlYyAtIHNwZWNpZmljYXRpb24gYWdhaW5zdCB3aGljaCB0byBjaGVja1xuICogQHBhcmFtIHtzdHJpbmd9IHByZWZpeCAtIHByZWZpeCB1c2UgZm9yIGVycm9yIG1lc3NhZ2VzXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNraXBNYW5kYXRvcnlDaGVjayAtIGB0cnVlYCB3aGVuIHRoZSBjaGVjayBmb3IgbWFuZGF0b3J5IGtleSBtdXN0IGJlIHNraXBwZWRcbiAqIEByZXR1cm4ge2Jvb2xlYW59IFRydWUgd2hlbiBldmVyeXRoaW5nIGlzIGNvcnJlY3RcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGVTcGVjKHRvVmFsaWRhdGUsIHNwZWMsIHByZWZpeCwgc2tpcE1hbmRhdG9yeUNoZWNrID0gZmFsc2UpIHtcbiAgICBsZXQgcmVzdWx0cyA9IE9iamVjdC5rZXlzKHRvVmFsaWRhdGUpLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgIGlmICghc3BlY1trZXldKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGAke3ByZWZpeH0gSW52YWxpZCBrZXk6ICR7a2V5fWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB2YWx1ZSA9IHRvVmFsaWRhdGVba2V5XTtcbiAgICAgICAgbGV0IGRhdGEgPSBzcGVjW2tleV07XG5cbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgICAgICBkYXRhID0ge3R5cGU6IGRhdGF9O1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEudHlwZSA9PT0gXCJmb3JtYXRcIikgeyAvLyBhbGwgZm9ybWF0cyBhcmUgcGFydGlhbCAoYS5rLmEgd2lsbCBiZSBtZXJnZWQgd2l0aCBzb21lIGRlZmF1bHQgdmFsdWVzKSB0aHVzIG5vIG5lZWQgdG8gY2hlY2sgbWFuZGF0b3J5IHZhbHVlc1xuICAgICAgICAgICAgbGV0IHZhbGlkID0gdmFsaWRhdGVTcGVjKHZhbHVlLCB2YWxpZEZvcm1hdCwgYFtWYWxpZGF0ZSAke2tleX1dYCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgIGlmICghdmFsaWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlICE9PSBkYXRhLnR5cGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7cHJlZml4fSAke2tleX0gdHlwZSBtaXNtYXRjaGVkOiBcIiR7ZGF0YS50eXBlfVwiIGV4cGVjdGVkLCBcIiR7dHlwZW9mIHZhbHVlfVwiIHByb3ZpZGVkYCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRhdGEucmVzdHJpY3Rpb25zICYmIGRhdGEucmVzdHJpY3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgbGV0IGxlbmd0aCA9IGRhdGEucmVzdHJpY3Rpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBsZXQge3Jlc3RyaWN0aW9uLCBtZXNzYWdlfSA9IGRhdGEucmVzdHJpY3Rpb25zW2ldO1xuICAgICAgICAgICAgICAgIGlmICghcmVzdHJpY3Rpb24odmFsdWUsIHRvVmFsaWRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7cHJlZml4fSAke2tleX0gaW52YWxpZCB2YWx1ZTogJHttZXNzYWdlfWApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkYXRhLnJlc3RyaWN0aW9uICYmICFkYXRhLnJlc3RyaWN0aW9uKHZhbHVlLCB0b1ZhbGlkYXRlKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtwcmVmaXh9ICR7a2V5fSBpbnZhbGlkIHZhbHVlOiAke2RhdGEubWVzc2FnZX1gKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS52YWxpZFZhbHVlcyAmJiBkYXRhLnZhbGlkVmFsdWVzLmluZGV4T2YodmFsdWUpID09PSAtMSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihgJHtwcmVmaXh9ICR7a2V5fSBpbnZhbGlkIHZhbHVlOiBtdXN0IGJlIGFtb25nICR7SlNPTi5zdHJpbmdpZnkoZGF0YS52YWxpZFZhbHVlcyl9LCBcIiR7dmFsdWV9XCIgcHJvdmlkZWRgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1jb25zb2xlXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGF0YS5jaGlsZHJlbikge1xuICAgICAgICAgICAgbGV0IHZhbGlkID0gdmFsaWRhdGVTcGVjKHZhbHVlLCBkYXRhLmNoaWxkcmVuLCBgW1ZhbGlkYXRlICR7a2V5fV1gKTtcblxuICAgICAgICAgICAgaWYgKCF2YWxpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0pO1xuXG4gICAgaWYgKCFza2lwTWFuZGF0b3J5Q2hlY2spIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKC4uLk9iamVjdC5rZXlzKHNwZWMpLm1hcCgoa2V5KSA9PiB7XG4gICAgICAgICAgICBsZXQgZGF0YSA9IHNwZWNba2V5XTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gXCJzdHJpbmdcIikge1xuICAgICAgICAgICAgICAgIGRhdGEgPSB7dHlwZTogZGF0YX07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChkYXRhLm1hbmRhdG9yeSkge1xuICAgICAgICAgICAgICAgIGxldCBtYW5kYXRvcnkgPSBkYXRhLm1hbmRhdG9yeTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1hbmRhdG9yeSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hbmRhdG9yeSA9IG1hbmRhdG9yeSh0b1ZhbGlkYXRlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobWFuZGF0b3J5ICYmIHRvVmFsaWRhdGVba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYCR7cHJlZml4fSBNaXNzaW5nIG1hbmRhdG9yeSBrZXkgXCIke2tleX1cImApOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLWNvbnNvbGVcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cy5yZWR1Y2UoKGFjYywgY3VycmVudCkgPT4ge1xuICAgICAgICByZXR1cm4gYWNjICYmIGN1cnJlbnQ7XG4gICAgfSwgdHJ1ZSk7XG59XG5cbi8qKlxuICogQ2hlY2sgdGhlIHByb3ZpZGVkIEZPUk1BVC5cbiAqXG4gKiBAcGFyYW0ge051bWJyb0Zvcm1hdH0gZm9ybWF0IC0gZm9ybWF0IHRvIGNoZWNrXG4gKiBAcmV0dXJuIHtib29sZWFufVxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUZvcm1hdChmb3JtYXQpIHtcbiAgICByZXR1cm4gdmFsaWRhdGVTcGVjKGZvcm1hdCwgdmFsaWRGb3JtYXQsIFwiW1ZhbGlkYXRlIGZvcm1hdF1cIik7XG59XG5cbi8qKlxuICogQ2hlY2sgdGhlIHByb3ZpZGVkIExBTkdVQUdFLlxuICpcbiAqIEBwYXJhbSB7TnVtYnJvTGFuZ3VhZ2V9IGxhbmd1YWdlIC0gbGFuZ3VhZ2UgdG8gY2hlY2tcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIHZhbGlkYXRlTGFuZ3VhZ2UobGFuZ3VhZ2UpIHtcbiAgICByZXR1cm4gdmFsaWRhdGVTcGVjKGxhbmd1YWdlLCB2YWxpZExhbmd1YWdlLCBcIltWYWxpZGF0ZSBsYW5ndWFnZV1cIik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIHZhbGlkYXRlLFxuICAgIHZhbGlkYXRlRm9ybWF0LFxuICAgIHZhbGlkYXRlSW5wdXQsXG4gICAgdmFsaWRhdGVMYW5ndWFnZVxufTtcbiJdfQ==
