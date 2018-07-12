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
const numbro = rewire("../../src/numbro");

describe("numbro", () => {
    describe("Numbro", () => {
        it("creates instances with a `_value` field", () => {
            let Numbro = numbro.__get__("Numbro");
            let instance = new Numbro(45);

            expect(instance._value).toBe(45);
        });
    });

    describe("normalizeInput", () => {
        let normalizeInput = undefined;
        let isNaN = undefined;
        let revert = undefined;

        beforeEach(() => {
            normalizeInput = numbro.__get__("normalizeInput");
            isNaN = jasmine.createSpy("isNaN");
            revert = numbro.__set__({
                isNaN
            });
        });

        afterEach(() => {
            revert();
        });

        it("returns the value of the input when its a Numbro instance", () => {
            let input = jasmine.createSpy("input");
            let value = jasmine.createSpy("value");
            input._value = value;
            spyOn(numbro, "isNumbro").and.returnValue(true);

            let result = normalizeInput(input);
            expect(result).toBe(value);
        });

        it("returns the output of unformat when te input is a string", () => {
            let input = "foo";
            let value = jasmine.createSpy("value");
            spyOn(numbro, "unformat").and.returnValue(value);

            let result = normalizeInput(input);
            expect(result).toBe(value);
        });

        it("returns NaN for NaN", () => {
            let input = NaN;
            isNaN.and.returnValue(true);

            let result = normalizeInput(input);
            expect(result).toBeNaN();
        });

        it("returns NaN for NaN", () => {
            let input = {};
            isNaN.and.returnValue(true);

            let result = normalizeInput(input);
            expect(result).toBeNaN();
        });

        it("returns the input when it's a number", () => {
            let input = 5;
            let result = normalizeInput(input);
            expect(result).toBe(input);
        });
    });

    describe("numbro", () => {
        let normalizeInput = undefined;
        let Numbro = undefined;
        let revert = undefined;

        beforeEach(() => {
            normalizeInput = jasmine.createSpy("normalizeInput");
            Numbro = jasmine.createSpy("Numbro");
            revert = numbro.__set__({ normalizeInput, Numbro });
        });

        afterEach(() => {
            revert();
        });

        it("normalizes the input", () => {
            let input = jasmine.createSpy("input");
            numbro(input);

            expect(normalizeInput).toHaveBeenCalledWith(input);
        });

        it("creates an instance of Numbro", () => {
            let input = jasmine.createSpy("input");
            let normalizedInput = jasmine.createSpy("normalizedInput");
            let instance = jasmine.createSpy("instance");
            normalizeInput.and.returnValue(normalizedInput);
            Numbro.and.returnValue(instance);

            let result = numbro(input);

            expect(Numbro).toHaveBeenCalledWith(normalizedInput);
            expect(result).toBe(instance);
        });
    });

    describe("Numbro.prototype", () => {
        let instance = undefined;
        let formatterFormat = undefined;
        let getBinaryByteUnit = undefined;
        let getDecimalByteUnit = undefined;
        let getByteUnit = undefined;
        let formatOrDefault = undefined;
        let difference = undefined;
        let add = undefined;
        let subtract = undefined;
        let revert = undefined;
        let multiply = undefined;
        let divide = undefined;

        beforeEach(() => {
            instance = numbro(1);
            formatterFormat = jasmine.createSpy("formatterFormat");
            getBinaryByteUnit = jasmine.createSpy("getBinaryByteUnit");
            getDecimalByteUnit = jasmine.createSpy("getDecimalByteUnit");
            getByteUnit = jasmine.createSpy("getByteUnit");
            formatOrDefault = jasmine.createSpy("formatOrDefault");
            difference = jasmine.createSpy("difference");
            add = jasmine.createSpy("add");
            subtract = jasmine.createSpy("subtract");
            multiply = jasmine.createSpy("multiply");
            divide = jasmine.createSpy("divide");

            revert = numbro.__set__({
                formatter: {
                    formatOrDefault,
                    format: formatterFormat,
                    getByteUnit,
                    getBinaryByteUnit,
                    getDecimalByteUnit
                },
                manipulate: {
                    difference,
                    add,
                    subtract,
                    multiply,
                    divide
                }
            });
        });

        afterEach(() => {
            revert();
        });

        afterAll(() => {
            revert();
        });

        it("clones", () => {
            let clone = instance.clone();
            expect(clone._value).toBe(instance._value);
        });

        it("format", () => {
            let format = jasmine.createSpy("format");
            instance.format(format);

            expect(formatterFormat).toHaveBeenCalledWith(instance, format);
        });

        it("formatCurrency", () => {
            let format = jasmine.createSpy("format");
            formatOrDefault.and.returnValue(format);
            instance.formatCurrency(format);

            expect(format.output).toBe("currency");
            expect(formatterFormat).toHaveBeenCalledWith(instance, format);
        });

        it("formatCurrency keeps the output", () => {
            formatOrDefault.and.returnValue({});
            let result = instance.formatCurrency("HH:MM:SS");

            expect(result).toBeUndefined();
        });

        it("formatTime", () => {
            let format = jasmine.createSpy("format");
            instance.formatTime(format);

            expect(format.output).toBe("time");
            expect(formatterFormat).toHaveBeenCalledWith(instance, format);
        });

        it("getBinaryByteUnit", () => {
            instance.binaryByteUnits();

            expect(getBinaryByteUnit).toHaveBeenCalledWith(instance);
        });

        it("getDecimalByteUnit", () => {
            instance.decimalByteUnits();

            expect(getDecimalByteUnit).toHaveBeenCalledWith(instance);
        });

        it("getByteUnit", () => {
            instance.byteUnits();

            expect(getByteUnit).toHaveBeenCalledWith(instance);
        });

        it("difference", () => {
            let other = jasmine.createSpy("other");
            instance.difference(other);

            expect(difference).toHaveBeenCalledWith(instance, other);
        });

        it("add", () => {
            let other = jasmine.createSpy("other");
            instance.add(other);

            expect(add).toHaveBeenCalledWith(instance, other);
        });

        it("subtract", () => {
            let other = jasmine.createSpy("other");
            instance.subtract(other);

            expect(subtract).toHaveBeenCalledWith(instance, other);
        });

        it("multiply", () => {
            let other = jasmine.createSpy("other");
            instance.multiply(other);

            expect(multiply).toHaveBeenCalledWith(instance, other);
        });

        it("divide", () => {
            let other = jasmine.createSpy("other");
            instance.divide(other);

            expect(divide).toHaveBeenCalledWith(instance, other);
        });

        it("value", () => {
            let result = instance.value();

            expect(result).toBe(1);
        });

        it("valueOf", () => {
            let result = instance.valueOf();

            expect(result).toBe(1);
        });

        describe("set", () => {
            let set = undefined;
            let normalizeInput = undefined;

            beforeEach(() => {
                instance = numbro(1);
                set = jasmine.createSpy("set");
                normalizeInput = jasmine.createSpy("normalizeInput");

                revert = numbro.__set__({
                    normalizeInput,
                    manipulate: {
                        set
                    }
                });
            });

            afterEach(() => {
                revert();
            });

            it("normalizes the input", () => {
                let input = jasmine.createSpy("input");
                let normalizedInput = jasmine.createSpy("normalizedInput");
                normalizeInput.and.returnValue(normalizedInput);

                instance.set(input);

                expect(normalizeInput).toHaveBeenCalledWith(input);
                expect(set).toHaveBeenCalledWith(instance, normalizedInput);
            });
        });
    });

    describe("Regression", () => {
        const numbro = rewire("../../src/numbro"); // eslint-disable-line no-shadow

        it("Issue 321", () => {
            numbro("23555.12").formatCurrency("0,0.00");
        });

        it("Issue 343", () => {
            let result = numbro("1000").format({ mantissa: 2 });
            expect(result).toBe("1000.00");
        });

        it("Issue 344", () => {
            let result = numbro("1000").formatCurrency({
                currencyPosition: "infix",
                currencySymbol: "FOO",
                mantissa: 2
            });
            expect(result).toBe("1000FOO00");
        });

        it("Issue 358", () => {
            let options = {
                mantissa: 4,
                trimMantissa: true
            };

            expect(numbro(1.23).format(options)).toBe("1.23");
            expect(numbro(1.234).format(options)).toBe("1.234");
            expect(numbro(1.2345).format(options)).toBe("1.2345");
            expect(numbro(1.23456).format(options)).toBe("1.2346");
        });

        it("Issue #364", () => {
            let options = {
                mantissa: 2,
                trimMantissa: true
            };

            expect(numbro(1.23).format(options)).toBe("1.23");
            expect(numbro(1.234).format(options)).toBe("1.23");
            expect(numbro(1.235).format(options)).toBe("1.24");
            expect(numbro(1.236).format(options)).toBe("1.24");


            options.roundingFunction = Math.floor;
            expect(numbro(1.23).format(options)).toBe("1.23");
            expect(numbro(1.234).format(options)).toBe("1.23");
            expect(numbro(1.235).format(options)).toBe("1.23");
            expect(numbro(1.236).format(options)).toBe("1.23");

            options.roundingFunction = Math.ceil;
            expect(numbro(1.23).format(options)).toBe("1.23");
            expect(numbro(1.234).format(options)).toBe("1.24");
            expect(numbro(1.235).format(options)).toBe("1.24");
            expect(numbro(1.236).format(options)).toBe("1.24");
        });

        it("Issue 372", () => {
            let options = {
                mantissa: 0,
                trimMantissa: true
            };

            expect(numbro(200).format(options)).toBe("200");
            expect(numbro(200.0001).format(options)).toBe("200");
        });
    });
});
