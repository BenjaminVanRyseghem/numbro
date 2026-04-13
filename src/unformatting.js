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

const allSuffixes = [
    {key: "ZiB", factor: Math.pow(1024, 7)},
    {key: "ZB", factor: Math.pow(1000, 7)},
    {key: "YiB", factor: Math.pow(1024, 8)},
    {key: "YB", factor: Math.pow(1000, 8)},
    {key: "TiB", factor: Math.pow(1024, 4)},
    {key: "TB", factor: Math.pow(1000, 4)},
    {key: "PiB", factor: Math.pow(1024, 5)},
    {key: "PB", factor: Math.pow(1000, 5)},
    {key: "MiB", factor: Math.pow(1024, 2)},
    {key: "MB", factor: Math.pow(1000, 2)},
    {key: "KiB", factor: Math.pow(1024, 1)},
    {key: "KB", factor: Math.pow(1000, 1)},
    {key: "GiB", factor: Math.pow(1024, 3)},
    {key: "GB", factor: Math.pow(1000, 3)},
    {key: "EiB", factor: Math.pow(1024, 6)},
    {key: "EB", factor: Math.pow(1000, 6)},
    {key: "B", factor: 1}
];

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
function computeUnformattedValue(inputString, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, abbreviationUnits, format) {
    if (!isNaN(+inputString)) {
        return +inputString;
    }

    let stripped = "";
    // Negative

    let newInput = inputString.replace(/(^[^(]*)\((.*)\)([^)]*$)/, "$1$2$3");

    if (newInput !== inputString) {
        return -1 * computeUnformattedValue(newInput, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, abbreviationUnits, format);
    }

    // Byte

    for (let i = 0; i < allSuffixes.length; i++) {
        let suffix = allSuffixes[i];
        stripped = inputString.replace(RegExp(`([0-9 ])(${suffix.key})$`), "$1");

        if (stripped !== inputString) {
            return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, abbreviationUnits, format) * suffix.factor;
        }
    }

    // Percent

    stripped = inputString.replace("%", "");

    if (stripped !== inputString) {
        return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, abbreviationUnits, format) / 100;
    }

    // Ordinal

    let possibleOrdinalValue = parseFloat(inputString);

    if (isNaN(possibleOrdinalValue)) {
        return undefined;
    }

    let ordinalString = ordinal(possibleOrdinalValue);
    if (ordinalString && ordinalString !== ".") { // if ordinal is "." it will be caught next round in the +inputString
        stripped = inputString.replace(new RegExp(`${escapeRegExp(ordinalString)}$`), "");

        if (stripped !== inputString) {
            return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, abbreviationUnits, format);
        }
    }

    // Average

    let inversedAbbreviations = {};
    // `abbreviations` here is expected to be the displayAbbreviations mapping
    Object.keys(abbreviations).forEach((key) => {
        inversedAbbreviations[abbreviations[key]] = key;
    });

    // Prefer longer display tokens first (e.g. '百萬' before '萬') to avoid
    // premature partial matches when multiple tokens share suffixes.
    let abbreviationValues = Object.keys(inversedAbbreviations).sort((a, b) => b.length - a.length);
    let numberOfAbbreviations = abbreviationValues.length;

    for (let i = 0; i < numberOfAbbreviations; i++) {
        let value = abbreviationValues[i];
        let key = inversedAbbreviations[value];

        stripped = inputString.replace(value, "");
        if (stripped !== inputString) {
            let factor = undefined;
            if (abbreviationUnits && abbreviationUnits[key]) {
                factor = abbreviationUnits[key];
            } else {
                // fallback to default short-scale
                switch (key) { // eslint-disable-line default-case
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
            }
            return computeUnformattedValue(stripped, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, abbreviationUnits, format) * factor;
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
function removeFormattingSymbols(inputString, delimiters, currencySymbol) {
    // Currency: currencySymbol may be a string or an array of strings
    let stripped = inputString;
    // Normalize to array, remove falsy entries, and prefer longest tokens first
    const symbols = (Array.isArray(currencySymbol) ? currencySymbol.slice() : [currencySymbol])
        .filter(Boolean)
        .sort((a, b) => b.length - a.length);

    symbols.forEach((sym) => {
        try {
            stripped = stripped.replace(new RegExp(escapeRegExp(sym), "g"), "");
        } catch (e) {
            // fallback to simple replace
            stripped = stripped.split(sym).join("");
        }
    });

    // Thousand separators
    stripped = stripped.replace(new RegExp(`([0-9])${escapeRegExp(delimiters.thousands)}([0-9])`, "g"), "$1$2");

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
function unformatValue(inputString, delimiters, currencySymbol = "", ordinal, zeroFormat, abbreviations, abbreviationUnits, format) {
    if (inputString === "") {
        return undefined;
    }

    // Zero Format

    if (inputString === zeroFormat) {
        return 0;
    }

    let value = removeFormattingSymbols(inputString, delimiters, currencySymbol);
    // abbreviations param is expected to be the language's displayAbbreviations
    // Obtain the units mapping from globalState when available via a caller.
    // If the caller passed abbreviations coming from globalState.currentDisplayAbbreviations,
    // the caller (unformat) will provide the abbreviationUnits as well.
    // For backward compatibility, default to undefined here; the top-level
    // `unformat` will pass abbreviationUnits.
    return computeUnformattedValue(value, delimiters, currencySymbol, ordinal, zeroFormat, abbreviations, abbreviationUnits, format);
}

/**
 * Check if the INPUTSTRING represents a time.
 *
 * @param {string} inputString - string to check
 * @param {*} delimiters - Delimiters used while generating the inputString
 * @return {boolean}
 */
function matchesTime(inputString, delimiters) {
    let separators = inputString.indexOf(":") && delimiters.thousands !== ":";

    if (!separators) {
        return false;
    }

    let segments = inputString.split(":");
    if (segments.length !== 3) {
        return false;
    }

    let hours = +segments[0];
    let minutes = +segments[1];
    let seconds = +segments[2];

    return !isNaN(hours) && !isNaN(minutes) && !isNaN(seconds);
}

/**
 * Unformat a numbro-generated string representing a time to retrieve the original value.
 *
 * @param {string} inputString - string to unformat
 * @return {number}
 */
function unformatTime(inputString) {
    let segments = inputString.split(":");

    let hours = +segments[0];
    let minutes = +segments[1];
    let seconds = +segments[2];

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
    const globalState = require("./globalState");

    let delimiters = globalState.currentDelimiters();
    const currencyData = globalState.currentCurrency();
    // build a list of possible currency tokens to strip (symbol, alternates, code)
    let currencySymbols = [];
    if (currencyData) {
        if (currencyData.symbol) { currencySymbols.push(currencyData.symbol); }
        if (currencyData.alternates && Array.isArray(currencyData.alternates)) {
            currencySymbols = currencySymbols.concat(currencyData.alternates.filter(Boolean));
        }
        if (currencyData.code) { currencySymbols.push(currencyData.code); }
    }
    let ordinal = globalState.currentOrdinal();
    let zeroFormat = globalState.getZeroFormat();
    const scheme = (globalState && globalState.currentAbbreviationScheme) ? globalState.currentAbbreviationScheme() : "short-scale";
    // When the language uses the default short-scale, keep legacy behaviour:
    // use `currentAbbreviations()` for display and no custom units.
    // Start from legacy abbreviations so we continue to recognize
    // strings like "千", "百万" etc. When a non-short-scale scheme
    // is active, merge the language's CJK displayAbbreviations so that
    // both legacy and CJK tokens are recognized by `unformat`.
    let legacyAbbreviations = globalState.currentAbbreviations();
    let displayAbbreviations = legacyAbbreviations;
    let abbreviationUnits = undefined;
    if (scheme && scheme !== "short-scale") {
        const cjkDisplay = globalState.currentDisplayAbbreviations();
        // Merge: keep legacy keys but allow CJK display tokens to be present
        displayAbbreviations = Object.assign({}, legacyAbbreviations, cjkDisplay);
        abbreviationUnits = globalState.currentAbbreviationUnits();
    }

    let value = undefined;

    if (typeof inputString === "string") {
        if (matchesTime(inputString, delimiters)) {
            value = unformatTime(inputString);
        } else {
            value = unformatValue(inputString, delimiters, currencySymbols, ordinal, zeroFormat, displayAbbreviations, abbreviationUnits, format);
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
    unformat
};
