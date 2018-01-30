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
const unformatting = rewire("../../src/unformatting");
const enUS = require("../../src/en-US");
const globalState = require("../../src/globalState");

describe("unformatting", () => {
    describe("unformat", () => {
        let unformatValue = undefined;
        let unformatTime = undefined;
        let matchesTime = undefined;
        let revert = undefined;

        beforeEach(() => {
            unformatValue = jasmine.createSpy("unformatValue");
            unformatTime = jasmine.createSpy("unformatTime");
            matchesTime = jasmine.createSpy("matchesTime");
            revert = unformatting.__set__({
                unformatValue,
                unformatTime,
                matchesTime
            });
        });

        afterEach(() => {
            revert();
        });

        it("produces a numbro instance with the result of `unformatValue`", () => {
            let value = jasmine.createSpy("value");

            unformatValue.and.returnValue(value);

            let result = unformatting.unformat("");
            expect(result).toBe(value);
        });

        it("returns undefined if the value is undefined", () => {
            let input = jasmine.createSpy("input");
            unformatValue.and.returnValue(undefined);

            let result = unformatting.unformat(input);
            expect(result).toBe(undefined);
        });

        it("unformats time when the input matches a time", () => {
            matchesTime.and.returnValue(true);

            unformatting.unformat("");
            expect(unformatTime).toHaveBeenCalled();
        });
    });

    describe("unformatValue", () => {
        let unformatValue = undefined;

        beforeEach(() => {
            unformatValue = unformatting.__get__("unformatValue");
        });

        it("unformats correctly", () => {
            let data = [
                // [[input, delimiters], expectedOutput]
                [["N/A", {thousands: ",", decimal: "."}], 0],

                [[".12", {thousands: ",", decimal: "."}], 0.12],
                [[",12", {thousands: ".", decimal: ","}], 0.12],

                [["(123)", {thousands: ",", decimal: "."}], -123],

                [["1,234.56", {thousands: ",", decimal: "."}], 1234.56],
                [["1T234D56", {thousands: "T", decimal: "D"}], 1234.56],
                [["1.234,56", {thousands: ".", decimal: ","}], 1234.56],

                [["$1.234,56", {thousands: ".", decimal: ","}, "$"], 1234.56],
                [["1.234,56$", {thousands: ".", decimal: ","}, "$"], 1234.56],

                [["1234.56B", {thousands: ",", decimal: "."}], 1234.56],
                [
                    [
                        "1234.56KB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1000, 1)
                ],
                [
                    [
                        "1234.56MB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1000, 2)
                ],
                [
                    [
                        "1234.56GB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1000, 3)
                ],
                [
                    [
                        "1234.56TB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1000, 4)
                ],
                [
                    [
                        "1234.56PB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1000, 5)
                ],
                [
                    [
                        "1234.56EB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1000, 6)
                ],
                [
                    [
                        "1234.56ZB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1000, 7)
                ],
                [
                    [
                        "1234.56YB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1000, 8)
                ],

                [
                    [
                        "1234.56KiB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1024, 1)
                ],
                [
                    [
                        "1234.56MiB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1024, 2)
                ],
                [
                    [
                        "1234.56GiB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1024, 3)
                ],
                [
                    [
                        "1234.56TiB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1024, 4)
                ],
                [
                    [
                        "1234.56PiB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1024, 5)
                ],
                [
                    [
                        "1234.56EiB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1024, 6)
                ],
                [
                    [
                        "1234.56ZiB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1024, 7)
                ],
                [
                    [
                        "1234.56YiB",
                        {
                            thousands: ",",
                            decimal: "."
                        }
                    ],
                    1234.56 * Math.pow(1024, 8)
                ],

                [["1234.56%", {thousands: ",", decimal: "."}], 12.3456],

                [["1st", {thousands: ",", decimal: "."}], 1],
                [["2nd", {thousands: ",", decimal: "."}], 2],
                [["3rd", {thousands: ",", decimal: "."}], 3],
                [["12th", {thousands: ",", decimal: "."}], 12],
                [["21st", {thousands: ",", decimal: "."}], 21],

                [["3k", {thousands: ",", decimal: "."}], 3000],
                [["3m", {thousands: ",", decimal: "."}], 3000000],
                [["3b", {thousands: ",", decimal: "."}], 3000000000],
                [["3t", {thousands: ",", decimal: "."}], 3000000000000],

                [["foo", {thousands: ".", decimal: ","}], undefined],
                [["12foo", {thousands: ".", decimal: ","}], undefined]
            ];

            data.forEach(([[input, delimiters, currencySymbol], expectedOutput]) => {
                let result = unformatValue(input, delimiters, currencySymbol, enUS.ordinal, "N/A", enUS.abbreviations);
                expect(result).toEqual(expectedOutput);
            });
        });
    });

    describe("matchesTime", () => {
        let matchesTime = undefined;

        beforeEach(() => {
            matchesTime = unformatting.__get__("matchesTime");
        });

        it("detects time representing strings", () => {
            let data = [
                // [value, delimiters, expectedOutput]
                ["foo", {}, false],
                ["00:00:00", {}, true],
                ["1:12:34", {}, true],
                ["1:12:34", { thousands: ":" }, false],
                ["1:foo:bar", {}, false],
                ["foo", {}, false]
            ];

            data.forEach(([value, delimiters, expectedOutput]) => {
                let result = matchesTime(value, delimiters);
                expect(result).toBe(expectedOutput);
            });
        });
    });

    describe("unformatTime", () => {
        let unformatTime = undefined;

        beforeEach(() => {
            unformatTime = unformatting.__get__("unformatTime");
        });

        it("detects time representing strings", () => {
            let data = [
                // [value, expectedOutput]
                ["00:00:00", 0],
                ["00:00:34", 34],
                ["00:12:34", 754],
                ["1:12:34", 4354]
            ];

            data.forEach(([value, expectedOutput]) => {
                let result = unformatTime(value);
                expect(result).toBe(expectedOutput);
            });
        });
    });
});

describe("[unformatting] regression tests", () => {
    describe("compatible with version 1", () => {

        let previousFormat = undefined;

        beforeEach(() => {
            previousFormat = globalState.getZeroFormat();
            globalState.setZeroFormat("N/A");
        });

        afterEach(() => {
            globalState.setZeroFormat(previousFormat);
        });

        it("works", () => {
            let data = [
                ["2:23:57", 8637],
                ["-76%", -0.76],
                ["100B", 100],
                ["3.154 TiB", 3.154 * Math.pow(1024, 4)],
                ["3.154 TB", 3154000000000],
                ["1.5YiB", 1.5 * Math.pow(1024, 8)], // 1024^8
                ["1.5YB", 1.5 * Math.pow(1000, 8)], // 1000^8
                ["1024YiB", Math.pow(1024, 9)], // 1024^9
                ["1000YB", Math.pow(1000, 9)], // 1000^9
                ["($1.23m)", -1230000],
                ["$ 10,000.00", 10000],
                ["10,000.123", 10000.123],
                ["(0.12345)", -0.12345],
                // ["((--0.12345))", 0.12345],
                ["23rd", 23],
                ["31st", 31],
                ["1.23t", 1230000000000],
                ["N/A", 0],

                // Invalid strings which don't represent a number are converted
                // to undefined.
                ["", undefined],
                ["not a number", undefined],

                // Pass Through for Numbers
                [0, 0],
                [1, 1],
                [1.1, 1.1],
                [-0, 0],
                [-1, -1],
                [-1.1, -1.1],
                [NaN, NaN],

                // JavaScript values which are neither Number or String are
                // converted to undefined.
                [undefined, undefined],
                [null, undefined],
                [[], undefined],
                [{}, undefined]
            ];

            data.forEach(([value, expectedOutput]) => {
                let result = unformatting.unformat(value);
                if (expectedOutput === undefined) {
                    expect(result).toBe(expectedOutput);
                } else if (isNaN(expectedOutput)) {
                    expect(value).toBeNaN();
                } else {
                    expect(result).toBe(expectedOutput);
                }
            });
        });
    });

    describe("Regression", () => {
        it("Issue 328", () => {
            let unformatValue = unformatting.__get__("unformatValue");
            let result = unformatValue("12.000", { thousands: ".", decimal: "," }, undefined, enUS.ordinal, "N/A", enUS.abbreviations);
            expect(result).toEqual(12000);
        });
    });
});
