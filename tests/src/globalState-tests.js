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

const rewire = require("rewire");
const globalState = rewire("../../src/globalState");

const validating = require("../../src/validating");
const parsing = require("../../src/parsing");
const enUS = require("../../src/en-US");

describe("globalState-tests", () => {
    describe("chooseLanguage", () => {
        let chooseLanguage = undefined;

        beforeEach(() => {
            chooseLanguage = globalState.__get__("chooseLanguage");
        });

        afterEach(() => {
            chooseLanguage("en-US");
        });

        it("set the current tag property (with no check)", () => {
            chooseLanguage("fooboo");
            let currentTag = globalState.currentLanguage();
            expect(currentTag).toBe("fooboo");
        });
    });

    describe("languages", () => {
        it("returns the all the registered languages", () => {
            let result = globalState.languages();
            expect(result).toEqual({
                "en-US": enUS
            });
        });

        it("returns a copy to avoid spoiling", () => {
            let result = globalState.languages();
            result.foo = 34;
            let newResult = globalState.languages();

            expect(newResult).toEqual({
                "en-US": enUS
            });
        });
    });

    describe("currentCurrency", () => {
        let languages = undefined;
        let revert = undefined;

        beforeEach(() => {
            languages = {"en-US": Object.assign({}, enUS)};
            revert = globalState.__set__({languages});
        });

        afterEach(() => {
            revert();
        });

        it("returns the currency for the current language", () => {
            let currency = jasmine.createSpy("currency");
            languages["en-US"].currency = currency;

            let result = globalState.currentCurrency();
            expect(result).toBe(currency);
        });
    });

    describe("currentOrdinal", () => {
        let languages = undefined;
        let revert = undefined;

        beforeEach(() => {
            languages = {"en-US": Object.assign({}, enUS)};
            revert = globalState.__set__({languages});
        });

        afterEach(() => {
            revert();
        });

        it("returns the ordinal for the current language", () => {
            let ordinal = jasmine.createSpy("ordinal");
            languages["en-US"].ordinal = ordinal;

            let result = globalState.currentOrdinal();
            expect(result).toBe(ordinal);
        });
    });

    describe("currentDefaults", () => {
        let languages = undefined;
        let revert = undefined;

        beforeEach(() => {
            languages = {"en-US": Object.assign({}, enUS)};
            revert = globalState.__set__({languages});
        });

        afterEach(() => {
            revert();
        });

        it("returns the defaults for the current language", () => {
            let defaults = jasmine.createSpy("defaults");
            languages["en-US"].defaults = defaults;

            let result = globalState.currentDefaults();
            expect(result).not.toBe(defaults); // returns a copy
            expect(result).toEqual(Object.assign({}, defaults));
        });
    });

    describe("currentOrdinalDefaults", () => {
        let languages = undefined;
        let revert = undefined;

        beforeEach(() => {
            languages = {"en-US": Object.assign({}, enUS)};
            revert = globalState.__set__({languages});
        });

        afterEach(() => {
            revert();
        });

        it("returns the ordinal defaults for the current language", () => {
            let ordinalFormat = jasmine.createSpy("ordinalFormat");
            languages["en-US"].ordinalFormat = ordinalFormat;

            let result = globalState.currentOrdinalDefaultFormat();
            expect(result).not.toBe(ordinalFormat); // returns a copy
            Object.keys(ordinalFormat).forEach((key) => {
                expect(result[key]).toBeDefined();
            });
        });

        it("combines ordinal defaults with defaults", () => {
            let defaults = {foo: 1, baz: 3};
            let ordinalFormat = {foo: 2, bar: 2};
            languages["en-US"].defaults = defaults;
            languages["en-US"].ordinalFormat = ordinalFormat;

            let result = globalState.currentOrdinalDefaultFormat();
            expect(result).toEqual({foo: 2, bar: 2, baz: 3});
        });
    });

    describe("currentByteDefaults", () => {
        let languages = undefined;
        let revert = undefined;

        beforeEach(() => {
            languages = {"en-US": Object.assign({}, enUS)};
            revert = globalState.__set__({languages});
        });

        afterEach(() => {
            revert();
        });

        it("returns the byte defaults for the current language", () => {
            let byteFormat = jasmine.createSpy("byteFormat");
            languages["en-US"].byteFormat = byteFormat;

            let result = globalState.currentByteDefaultFormat();
            expect(result).not.toBe(byteFormat); // returns a copy
            Object.keys(byteFormat).forEach((key) => {
                expect(result[key]).toBeDefined();
            });
        });

        it("combines byte defaults with defaults", () => {
            let defaults = {foo: 1, baz: 3};
            let byteFormat = {foo: 2, bar: 2};
            languages["en-US"].defaults = defaults;
            languages["en-US"].byteFormat = byteFormat;

            let result = globalState.currentByteDefaultFormat();
            expect(result).toEqual({foo: 2, bar: 2, baz: 3});
        });
    });

    describe("currentPercentageDefaults", () => {
        let languages = undefined;
        let revert = undefined;

        beforeEach(() => {
            languages = {"en-US": Object.assign({}, enUS)};
            revert = globalState.__set__({languages});
        });

        afterEach(() => {
            revert();
        });

        it("returns the percentage defaults for the current language", () => {
            let percentageFormat = jasmine.createSpy("percentageFormat");
            languages["en-US"].percentageFormat = percentageFormat;

            let result = globalState.currentPercentageDefaultFormat();
            expect(result).not.toBe(percentageFormat); // returns a copy
            Object.keys(percentageFormat).forEach((key) => {
                expect(result[key]).toBeDefined();
            });
        });

        it("combines percentage defaults with defaults", () => {
            let defaults = {foo: 1, baz: 3};
            let percentageFormat = {foo: 2, bar: 2};
            languages["en-US"].defaults = defaults;
            languages["en-US"].percentageFormat = percentageFormat;

            let result = globalState.currentPercentageDefaultFormat();
            expect(result).toEqual({foo: 2, bar: 2, baz: 3});
        });
    });

    describe("currentCurrencyDefaults", () => {
        let languages = undefined;
        let revert = undefined;

        beforeEach(() => {
            languages = {"en-US": Object.assign({}, enUS)};
            revert = globalState.__set__({languages});
        });

        afterEach(() => {
            revert();
        });

        it("returns the currency defaults for the current language", () => {
            let currencyFormat = jasmine.createSpy("currencyFormat");
            languages["en-US"].currencyFormat = currencyFormat;

            let result = globalState.currentCurrencyDefaultFormat();
            expect(result).not.toBe(currencyFormat); // returns a copy
            Object.keys(currencyFormat).forEach((key) => {
                expect(result[key]).toBeDefined();
            });
        });

        it("combines currency defaults with defaults", () => {
            let defaults = {foo: 1, baz: 3};
            let currencyFormat = {foo: 2, bar: 2};
            languages["en-US"].defaults = defaults;
            languages["en-US"].currencyFormat = currencyFormat;

            let result = globalState.currentCurrencyDefaultFormat();
            expect(result).toEqual({foo: 2, bar: 2, baz: 3});
        });
    });

    describe("setDefaults", () => {
        it("parses the format", () => {
            let format = jasmine.createSpy("format");
            spyOn(parsing, "parseFormat");
            spyOn(validating, "validateFormat");

            globalState.setDefaults(format);

            expect(parsing.parseFormat).toHaveBeenCalledWith(format);
        });

        it("validates the format", () => {
            let format = jasmine.createSpy("format");
            let parsedFormat = jasmine.createSpy("parsedFormat");
            spyOn(parsing, "parseFormat");
            parsing.parseFormat.and.returnValue(parsedFormat);
            spyOn(validating, "validateFormat");

            globalState.setDefaults(format);

            expect(validating.validateFormat).toHaveBeenCalledWith(parsedFormat);
        });

        it("doesn't change the format when its invalid", () => {
            let format = jasmine.createSpy("format");
            spyOn(parsing, "parseFormat");
            spyOn(validating, "validateFormat");
            validating.validateFormat.and.returnValue(false);

            let oldDefaults = globalState.currentDefaults();

            globalState.setDefaults(format);

            let newDefaults = globalState.currentDefaults();

            expect(newDefaults).toEqual(oldDefaults);
        });

        it("changes the format when its valid", () => {
            let format = jasmine.createSpy("format");
            spyOn(parsing, "parseFormat");
            spyOn(validating, "validateFormat");
            parsing.parseFormat.and.returnValue(format);
            validating.validateFormat.and.returnValue(true);

            let oldDefaults = globalState.currentDefaults();

            globalState.setDefaults(format);

            let newDefaults = globalState.currentDefaults();

            expect(newDefaults).not.toEqual(oldDefaults);
        });
    });

    describe("[get|set]ZeroFormat", () => {
        it("returns previously set format", () => {
            let format = "foo";
            globalState.setZeroFormat(format);
            let result = globalState.getZeroFormat();

            expect(result).toBe(format);
        });

        it("set null when not a string", () => {
            let format = 42;
            globalState.setZeroFormat(format);
            let result = globalState.getZeroFormat();

            expect(result).toBe(null);
        });
    });

    describe("hasZeroFormat", () => {
        it("returns true when a format is set", () => {
            let format = "foo";
            globalState.setZeroFormat(format);
            let result = globalState.hasZeroFormat();

            expect(result).toBeTruthy();
        });

        it("returns false when a format is null", () => {
            let format = 42;
            globalState.setZeroFormat(format);
            let result = globalState.hasZeroFormat();

            expect(result).toBeFalsy();
        });
    });

    describe("languageData", () => {
        it("returns the current language data when no argument passed", () => {
            let data = globalState.languageData();
            expect(data).toBe(enUS);
        });

        it("returns the language data matching the passed tag", () => {
            let enGB = {
                languageTag: "en-GB",
                delimiters: {},
                abbreviations: {
                    thousand: "",
                    million: "",
                    billion: "",
                    trillion: ""
                },
                ordinal: () => "",
                currency: {}
            };
            globalState.registerLanguage(enGB);

            let data = globalState.languageData("en-GB");
            expect(data).toBe(enGB);
        });

        it("throws an exception when tag is not matching any language", () => {
            let fn = globalState.languageData.bind(null, "inexisting tag");
            expect(fn).toThrowError();
        });
    });

    describe("registerLanguage", () => {
        it("throws an error when the data are not valid", () => {
            let invalidData = jasmine.createSpy("invalidData");
            spyOn(validating, "validateLanguage");
            validating.validateLanguage.and.returnValue(false);

            let fn = globalState.registerLanguage.bind(null, invalidData);
            expect(fn).toThrowError();
        });

        it("doesn't change the current language", () => {
            let enGB = {languageTag: "en-GB"};
            spyOn(validating, "validateLanguage");
            validating.validateLanguage.and.returnValue(true);

            globalState.registerLanguage(enGB);

            let currentLanguage = globalState.currentLanguage();
            expect(currentLanguage).toBe("en-US");
        });

        it("set the register language as current when `useLanguage` is true", () => {
            let enGB = {languageTag: "en-GB"};
            spyOn(validating, "validateLanguage");
            validating.validateLanguage.and.returnValue(true);

            globalState.registerLanguage(enGB, true);

            let currentLanguage = globalState.currentLanguage();
            expect(currentLanguage).toBe("en-GB");
        });
    });

    describe("setLanguage", () => {
        let chooseLanguage = undefined;
        let revert = undefined;

        beforeEach(() => {
            chooseLanguage = jasmine.createSpy("chooseLanguage");
            revert = globalState.__set__({chooseLanguage});
        });

        afterEach(() => {
            revert();
        });

        it("set the language if the tag matches an existing language", () => {
            globalState.setLanguage("en-US");
            expect(chooseLanguage).toHaveBeenCalledWith("en-US");
        });

        it("tries to find a matching suffix if the tag is not found", () => {
            globalState.setLanguage("en");
            expect(chooseLanguage).toHaveBeenCalledWith("en-US");
        });

        it("fallbacks to `fallbackTag` when no matching suffix is found", () => {
            globalState.setLanguage("fr", "fallback");
            expect(chooseLanguage).toHaveBeenCalledWith("fallback");
        });

        it("has `en-US` as default fallback to ensure we can set a language", () => {
            globalState.setLanguage("fr");
            expect(chooseLanguage).toHaveBeenCalledWith(enUS.languageTag);
        });

        it("set the language without subtag", () => {
            globalState.setLanguage("en");
            expect(chooseLanguage).toHaveBeenCalledTimes(1);
            expect(globalState.currentLanguage()).not.toEqual("en");
        });
    });
});
