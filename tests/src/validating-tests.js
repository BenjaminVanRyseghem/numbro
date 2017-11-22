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
const validating = rewire("../../src/validating");
const unformatting = require("../../src/unformatting");

describe("validatingSpec", () => {
    describe("validate", () => {
        let validateInput = undefined;
        let validateFormat = undefined;
        let revert = undefined;

        beforeEach(() => {
            validateInput = jasmine.createSpy("validateInput");
            validateFormat = jasmine.createSpy("validateFormat");
            revert = validating.__set__({validateFormat, validateInput});
        });

        afterEach(() => {
            revert();
        });

        it("validates the input and the format", () => {
            let input = jasmine.createSpy("input");
            let format = jasmine.createSpy("format");
            validating.validate(input, format);

            expect(validateInput).toHaveBeenCalledWith(input);
            expect(validateFormat).toHaveBeenCalledWith(format);
        });

        it("is valid when input AND format are valid", () => {
            validateInput.and.returnValue(true);
            validateFormat.and.returnValue(true);
            let result = validating.validate();
            expect(result).toBeTruthy();
        });

        it("is invalid when input is valid", () => {
            validateInput.and.returnValue(false);
            validateFormat.and.returnValue(true);
            let result = validating.validate();
            expect(result).toBeFalsy();
        });

        it("is invalid when format is valid", () => {
            validateInput.and.returnValue(true);
            validateFormat.and.returnValue(false);
            let result = validating.validate();
            expect(result).toBeFalsy();
        });
    });

    describe("validateFormat", () => {
        let error = undefined;
        let revert = undefined;

        beforeEach(() => {
            error = jasmine.createSpy("error");
            revert = validating.__set__({
                console: {error}
            });
        });

        afterEach(() => {
            revert();
        });

        it("validates valid formats", () => {
            let data = [
                // format
                {prefix: "foo"},
                {mantissa: 3},
                {totalLength: 3}
            ];

            data.forEach((format) => {
                let result = validating.validateFormat(format);
                expect(result).toBeTruthy();
            });
        });

        it("invalidates invalid formats", () => {
            let data = [
                // [format, errorMessage]
                [
                    {
                        bar: 0
                    },
                    "[Validate format] Invalid key: bar"
                ],
                [
                    {
                        prefix: 2
                    },
                    "[Validate format] prefix type mismatched: \"string\" expected, \"number\" provided"
                ],
                [
                    {
                        characteristic: -2
                    },
                    "[Validate format] characteristic invalid value: value must be positive"
                ], [
                    {
                        mantissa: -2
                    },
                    "[Validate format] mantissa invalid value: value must be positive"
                ], [
                    {
                        totalLength: -2
                    },
                    "[Validate format] totalLength invalid value: value must be positive"
                ],
                [
                    {
                        output: "lapin"
                    },
                    "[Validate format] output invalid value: must be among [\"currency\",\"percent\",\"byte\",\"time\",\"ordinal\",\"number\"], \"lapin\" provided"
                ],
                [
                    {
                        totalLength: 2,
                        exponential: true
                    },
                    "[Validate format] totalLength invalid value: `totalLength` is incompatible with `exponential`"
                ],
                [
                    {
                        prefixSymbol: true,
                        output: "currency"
                    },
                    "[Validate format] prefixSymbol invalid value: `prefixSymbol` can be provided only when the output is `percent`"
                ]
            ];

            data.forEach(([format, errorMessage]) => {
                let result = validating.validateFormat(format);
                expect(result).toBeFalsy();
                expect(error.calls.mostRecent().args[0]).toBe(errorMessage);
            });
        });
    });

    describe("validateLanguage", () => {
        let error = undefined;
        let revert = undefined;

        beforeEach(() => {
            error = jasmine.createSpy("error");
            revert = validating.__set__({
                console: {error}
            });
        });

        afterEach(() => {
            revert();
        });

        it("validates valid language", () => {
            let data = [
                // language
                {
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
                }
            ];

            data.forEach((format) => {
                let result = validating.validateLanguage(format);
                expect(result).toBeTruthy();
            });
        });

        it("invalidates invalid language", () => {
            let data = [
                // [language, errorMessage]
                [
                    {
                        delimiters: {},
                        abbreviations: {
                            thousand: "",
                            million: "",
                            billion: "",
                            trillion: ""
                        },
                        ordinal: () => "",
                        currency: {}
                    },
                    "[Validate language] Missing mandatory key \"languageTag\""
                ],
                [
                    {
                        bar: 0,
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
                    },
                    "[Validate language] Invalid key: bar"
                ],
                [
                    {
                        languageTag: 2,
                        delimiters: {},
                        abbreviations: {
                            thousand: "",
                            million: "",
                            billion: "",
                            trillion: ""
                        },
                        ordinal: () => "",
                        currency: {}
                    },
                    "[Validate language] languageTag type mismatched: \"string\" expected, \"number\" provided"
                ],
                [
                    {
                        languageTag: "en-GB",
                        delimiters: {},
                        abbreviations: {
                            thousand: "",
                            million: "",
                            billion: "",
                            trillion: ""
                        },
                        ordinal: () => "",
                        currency: {},
                        currencyFormat: {bar: 2}
                    },
                    "[Validate currencyFormat] Invalid key: bar"
                ],
                [
                    {
                        languageTag: "en-GB",
                        delimiters: {},
                        abbreviations: {
                            thousand: "",
                            million: "",
                            billion: "",
                            trillion: ""
                        },
                        ordinal: () => "",
                        currency: {symbol: 2}
                    },
                    "[Validate currency] symbol type mismatched: \"string\" expected, \"number\" provided"
                ]
            ];

            data.forEach(([format, errorMessage]) => {
                let result = validating.validateLanguage(format);
                expect(result).toBeFalsy();
                expect(error.calls.mostRecent().args[0]).toBe(errorMessage);
            });
        });
    });

    describe("validateInput", () => {
        it("validates anything that can be unformatted", () => {
            spyOn(unformatting, "unformat").and.returnValue(123);
            expect(validating.validateInput()).toBeTruthy();
        });

        it("doesn't validate anything that cannot be unformatted", () => {
            spyOn(unformatting, "unformat").and.returnValue(undefined);
            expect(validating.validateInput()).toBeFalsy();
        });
    });

});
