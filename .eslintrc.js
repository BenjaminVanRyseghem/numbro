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

const disabled = 0;
const warning = 1;
const error = 2;

module.exports = {
    "root": true,
    "extends": "eslint:recommended",
    "plugins": [
        "jasmine"
    ],
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "impliedStrict": true
    },
    "env": {
        "node": true,
        "jasmine": true,
        "amd": true,
        "es6": true
    },
    // "rulesdir": ["eslint_rules"],
    "rules": {
        "ensure-test-file": [
            error, {
                "source": "+(src|languages)/**/*.js",
                "testFolder": "tests",
                "testFileBuilder": (name) => `${name}-tests`
            }
        ],
        "array-bracket-newline": [error, {"multiline": true}],
        "array-bracket-spacing": [error, "never"],
        "array-callback-return": error,
        "arrow-spacing": error,
        "comma-dangle": error,
        "comma-spacing": [error, {"before": false, "after": true}],
        "consistent-return": error,
        "default-case": error,
        "eqeqeq": error,
        "func-style": [error, "declaration", {"allowArrowFunctions": true}],
        "handle-callback-err": error,
        "init-declarations": [error, "always"],
        "key-spacing": [error, {"beforeColon": false, "afterColon": true}],
        "keyword-spacing": [error, {"before": true}],
        "linebreak-style": [error, "unix"],
        "no-confusing-arrow": error,
        "no-else-return": error,
        "no-eval": error,
        "no-implied-eval": error,
        "no-labels": error,
        "no-loop-func": error,
        "no-multi-spaces": error,
        "no-sequences": error,
        "no-shadow": error,
        "no-template-curly-in-string": error,
        "no-throw-literal": error,
        "no-trailing-spaces": error,
        "no-use-before-define": [error, "nofunc"],
        "no-useless-constructor": error,
        "no-useless-return": error,
        "no-var": error,
        "no-with": error,
        "one-var": [error, "never"],
        "prefer-arrow-callback": error,
        "prefer-rest-params": error,
        "prefer-spread": error,
        "prefer-template": error,
        "quotes": [error, "double"],
        "semi": [error, "always"],
        "strict": [error, "never"],
        "yoda": [error, "never", {"exceptRange": true}]
    }
};
