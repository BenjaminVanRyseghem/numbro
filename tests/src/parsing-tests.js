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
const parsing = rewire("../../src/parsing");

describe("parsing", () => {
    describe("parseFormat", () => {
        let parsePrefix = undefined;
        let parsePostfix = undefined;
        let parseOutput = undefined;
        let parseThousandSeparated = undefined;
        let parseSpaceSeparated = undefined;
        let parseTotalLength = undefined;
        let parseCharacteristic = undefined;
        let parseMantissa = undefined;
        let parseAverage = undefined;
        let parseForceAverage = undefined;
        let parseOptionalMantissa = undefined;
        let parseOptionalCharacteristic = undefined;
        let parseNegative = undefined;
        let parseForceSign = undefined;
        let revert = undefined;

        beforeEach(() => {
            parseOutput = jasmine.createSpy("parseOutput");
            parsePrefix = jasmine.createSpy("parsePrefix");
            parsePostfix = jasmine.createSpy("parsePostfix");
            parseThousandSeparated = jasmine.createSpy("parseThousandSeparated");
            parseSpaceSeparated = jasmine.createSpy("parseSpaceSeparated");
            parseTotalLength = jasmine.createSpy("parseSpaceSeparated");
            parseCharacteristic = jasmine.createSpy("parseCharacteristic");
            parseMantissa = jasmine.createSpy("parseMantissa");
            parseAverage = jasmine.createSpy("parseAverage");
            parseForceAverage = jasmine.createSpy("parseForceAverage");
            parseOptionalMantissa = jasmine.createSpy("parseOptionalMantissa");
            parseOptionalCharacteristic = jasmine.createSpy("parseOptionalCharacteristic");
            parseNegative = jasmine.createSpy("parseNegative");
            parseForceSign = jasmine.createSpy("parseForceSign");

            revert = parsing.__set__({
                parsePrefix,
                parsePostfix,
                parseOutput,
                parseThousandSeparated,
                parseSpaceSeparated,
                parseTotalLength,
                parseCharacteristic,
                parseMantissa,
                parseOptionalMantissa,
                parseOptionalCharacteristic,
                parseAverage,
                parseForceAverage,
                parseNegative,
                parseForceSign
            });
        });

        afterEach(() => {
            revert();
        });

        it("looks for the output", () => {
            let result = jasmine.createSpy("result");

            parsing.parseFormat("", result);
            expect(parseOutput).toHaveBeenCalled();
        });

        it("returns the input if it's not a string", () => {
            let input = jasmine.createSpy("input");
            let result = jasmine.createSpy("result");

            let format = parsing.parseFormat(input, result);
            expect(parseOutput).not.toHaveBeenCalled();
            expect(format).toBe(input);
        });
    });

    describe("parseFormat output", () => {
        it("produces the correct format", () => {
            let data = [
                // [string, expectedFormat]
                [
                    "$",
                    {
                        output: "currency"
                    }
                ],
                [
                    ",$",
                    {
                        output: "currency",
                        thousandSeparated: true
                    }
                ],
                [
                    "{,}$",
                    {
                        output: "currency",
                        prefix: ","
                    }
                ],
                [
                    "${,}", // eslint-disable-line no-template-curly-in-string
                    {
                        output: "currency",
                        postfix: ","
                    }
                ],
                [
                    "$ ", // eslint-disable-line no-template-curly-in-string
                    {
                        output: "currency",
                        spaceSeparated: true
                    }
                ],
                [
                    " $", // eslint-disable-line no-template-curly-in-string
                    {
                        output: "currency",
                        spaceSeparated: true
                    }
                ],
                [
                    ",4 $",
                    {
                        thousandSeparated: true,
                        output: "currency",
                        totalLength: 4,
                        spaceSeparated: true
                    }
                ],
                [
                    ",00 $",
                    {
                        thousandSeparated: true,
                        output: "currency",
                        characteristic: 2,
                        spaceSeparated: true
                    }
                ],
                [
                    ",.00 $",
                    {
                        thousandSeparated: true,
                        output: "currency",
                        mantissa: 2,
                        spaceSeparated: true,
                        optionalMantissa: false,
                        optionalCharacteristic: true
                    }
                ],
                [
                    "a$",
                    {
                        output: "currency",
                        average: true
                    }
                ],
                [
                    ",[.]00 $",
                    {
                        thousandSeparated: true,
                        output: "currency",
                        mantissa: 2,
                        spaceSeparated: true,
                        optionalMantissa: true,
                        optionalCharacteristic: true
                    }
                ],
                [
                    ",.4 $",
                    {
                        thousandSeparated: true,
                        output: "currency",
                        totalLength: 4,
                        spaceSeparated: true,
                        optionalMantissa: false,
                        optionalCharacteristic: true
                    }
                ],
                [
                    "($)",
                    {
                        output: "currency",
                        negative: "parenthesis"
                    }
                ],
                [
                    "+($)",
                    {
                        output: "currency",
                        negative: "parenthesis",
                        forceSign: true
                    }
                ],
                [
                    "-$",
                    {
                        output: "currency",
                        negative: "sign"
                    }
                ],
                [
                    "+-$",
                    {
                        output: "currency",
                        negative: "sign",
                        forceSign: true
                    }
                ],
                [
                    ".",
                    {
                        optionalCharacteristic: true,
                        optionalMantissa: false
                    }
                ],
                [
                    "K",
                    {
                        forceAverage: "thousand"
                    }
                ],
                [
                    "M",
                    {
                        forceAverage: "million"
                    }
                ],
                [
                    "B",
                    {
                        forceAverage: "billion"
                    }
                ],
                [
                    "T",
                    {
                        forceAverage: "trillion"
                    }
                ]
            ];

            data.forEach(([string, expectedFormat]) => {
                let result = parsing.parseFormat(string);
                expect(result).toEqual(expectedFormat);
            });
        });
    });

    describe("output", () => {
        let parseOutput = undefined;

        beforeEach(() => {
            parseOutput = parsing.__get__("parseOutput");
        });

        it("detects currency", () => {
            let result = {};
            parseOutput("$", result);
            expect(result.output).toBe("currency");
        });

        it("detects percent", () => {
            let result = {};
            parseOutput("%", result);
            expect(result.output).toBe("percent");
        });

        it("detects general byte", () => {
            let result = {};
            parseOutput("bd", result);
            expect(result.output).toBe("byte");
            expect(result.base).toBe("general");
        });

        it("detects binary byte", () => {
            let result = {};
            parseOutput("b", result);
            expect(result.output).toBe("byte");
            expect(result.base).toBe("binary");
        });

        it("detects decimal byte", () => {
            let result = {};
            parseOutput("d", result);
            expect(result.output).toBe("byte");
            expect(result.base).toBe("decimal");
        });

        it("detects time", () => {
            let result = {};
            parseOutput(":", result);
            expect(result.output).toBe("time");
        });

        it("detects ordinal", () => {
            let result = {};
            parseOutput("o", result);
            expect(result.output).toBe("ordinal");
        });

        it("leaves the output unset otherwise", () => {
            let result = {};
            parseOutput("", result);
            expect(result.output).toBe(undefined);
        });
    });
});
