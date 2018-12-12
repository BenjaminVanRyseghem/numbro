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
const manipulatingModule = rewire("../../src/manipulating");
const manipulating = manipulatingModule(numbroStub);
const BigNumber = require("bignumber.js");

function numbroStub(value) {
    return {_value: value};
}

describe("manipulating", () => {
    beforeEach(() => {
        numbroStub.isNumbro = jasmine.createSpy("isNumbro");
    });


    describe("add", () => {
        it("works with numbers", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.1, 0.2, 0.3],
                [new BigNumber(0.1), new BigNumber(0.2), 0.3],
                [0.1, new BigNumber(0.2), 0.3],
                [new BigNumber(0.1), 0.2, 0.3],
                [1000, 10, 1010],
                [0.5, 3, 3.5],
                [-100, 200, 100],
                [0.1, 0.2, 0.3]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                let instance = numbroStub(value);
                let result = manipulating.add(instance, other);
                expect(result._value).toBe(expectedOutput);
            });
        });

        it("works with numbro instances", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.1, 0.2, 0.3],
                [new BigNumber(0.1), new BigNumber(0.2), 0.3],
                [0.1, new BigNumber(0.2), 0.3],
                [new BigNumber(0.1), 0.2, 0.3],
                [1000, 10, 1010],
                [0.5, 3, 3.5],
                [-100, 200, 100],
                [0.1, 0.2, 0.3]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                numbroStub.isNumbro.and.returnValue(true);
                let instance = numbroStub(value);
                let result = manipulating.add(instance, numbroStub(other));
                expect(result._value).toBe(expectedOutput);
            });
        });
    });

    describe("subtract", () => {
        it("works with numbers", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.1, 0.2, -0.1],
                [new BigNumber(0.1), new BigNumber(0.2), -0.1],
                [0.1, new BigNumber(0.2), -0.1],
                [new BigNumber(0.1), 0.2, -0.1],
                [1000, 10, 990],
                [0.5, 3, -2.5],
                [-100, 200, -300],
                [0.3, 0.1, 0.2]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                let instance = numbroStub(value);
                let result = manipulating.subtract(instance, other);
                expect(result._value).toBe(expectedOutput);
            });
        });

        it("works with numbro instances", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.1, 0.2, -0.1],
                [new BigNumber(0.1), new BigNumber(0.2), -0.1],
                [0.1, new BigNumber(0.2), -0.1],
                [new BigNumber(0.1), 0.2, -0.1],
                [1000, 10, 990],
                [0.5, 3, -2.5],
                [-100, 200, -300],
                [0.3, 0.1, 0.2]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                numbroStub.isNumbro.and.returnValue(true);
                let instance = numbroStub(value);
                let result = manipulating.subtract(instance, numbroStub(other));
                expect(result._value).toBe(expectedOutput);
            });
        });
    });

    describe("multiply", () => {
        it("works with numbers", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.1, 0.2, 0.02],
                [new BigNumber(0.1), new BigNumber(0.2), 0.02],
                [0.1, new BigNumber(0.2), 0.02],
                [new BigNumber(0.1), 0.2, 0.02],
                [1000, 10, 10000],
                [0.5, 3, 1.5],
                [-100, 200, -20000],
                [0.1, 0.2, 0.02]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                let instance = numbroStub(value);
                let result = manipulating.multiply(instance, other);
                expect(result._value).toBe(expectedOutput);
            });
        });

        it("works with numbro instances", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.1, 0.2, 0.02],
                [new BigNumber(0.1), new BigNumber(0.2), 0.02],
                [0.1, new BigNumber(0.2), 0.02],
                [new BigNumber(0.1), 0.2, 0.02],
                [1000, 10, 10000],
                [0.5, 3, 1.5],
                [-100, 200, -20000],
                [0.1, 0.2, 0.02]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                numbroStub.isNumbro.and.returnValue(true);
                let instance = numbroStub(value);
                let result = manipulating.multiply(instance, numbroStub(other));
                expect(result._value).toBe(expectedOutput);
            });
        });

        it("works with repeating decimals", () => {
            numbroStub.isNumbro.and.returnValue(true);
            let instance = numbroStub(1/3);
            let result = manipulating.multiply(instance, numbroStub(1));
            expect(result._value).toBe(0.3333333333333333);
        });
    });

    describe("divide", () => {
        it("works with numbers", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.1, 0.2, 0.5],
                [new BigNumber(0.1), new BigNumber(0.2), 0.5],
                [0.1, new BigNumber(0.2), 0.5],
                [new BigNumber(0.1), 0.2, 0.5],
                [1000, 10, 100],
                [0.5, 3, 0.16666666666666666],
                [-100, 200, -0.5],
                [5.3, 0.1, 53]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                let instance = numbroStub(value);
                let result = manipulating.divide(instance, other);
                expect(result._value).toBe(expectedOutput);
            });
        });

        it("works with numbro instances", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.1, 0.2, 0.5],
                [new BigNumber(0.1), new BigNumber(0.2), 0.5],
                [0.1, new BigNumber(0.2), 0.5],
                [new BigNumber(0.1), 0.2, 0.5],
                [1000, 10, 100],
                [0.5, 3, 0.16666666666666666],
                [-100, 200, -0.5],
                [5.3, 0.1, 53]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                numbroStub.isNumbro.and.returnValue(true);
                let instance = numbroStub(value);
                let result = manipulating.divide(instance, numbroStub(other));
                expect(result._value).toBe(expectedOutput);
            });
        });
    });

    describe("set", () => {
        it("works with numbers", () => {
            let data = [
                // [value, other]
                [new BigNumber(0.1), new BigNumber(0.2)],
                [0.1, new BigNumber(0.2)],
                [new BigNumber(0.1), 0.2],
                [1000, 10],
                [0.5, 3],
                [-100, 200],
                [5.3, 0.1]
            ];

            data.forEach(([value, other]) => {
                let instance = numbroStub(value);
                let result = manipulating.set(instance, other);
                expect(result._value).toBe(other);
            });
        });

        it("works with numbro instances", () => {
            let data = [
                // [value, other]
                [new BigNumber(0.1), new BigNumber(0.2)],
                [0.1, new BigNumber(0.2)],
                [new BigNumber(0.1), 0.2],
                [1000, 10],
                [0.5, 3],
                [-100, 200],
                [5.3, 0.1]
            ];

            data.forEach(([value, other]) => {
                numbroStub.isNumbro.and.returnValue(true);
                let instance = numbroStub(value);
                let result = manipulating.set(instance, numbroStub(other));
                expect(result._value).toBe(other);
            });
        });
    });

    describe("difference", () => {
        it("works with numbers", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.01, 0.2, 0.19],
                [new BigNumber(0.01), new BigNumber(0.2), 0.19],
                [0.01, new BigNumber(0.2), 0.19],
                [new BigNumber(0.01), 0.2, 0.19],
                [1000, 10, 990],
                [0.5, 3, 2.5],
                [-100, 200, 300],
                [0.3, 0.1, 0.2]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                let instance = numbroStub(value);
                let result = manipulating.difference(instance, other);
                expect(result).toBe(expectedOutput);
                expect(instance._value).not.toBe(result);
            });
        });

        it("works with numbro instances", () => {
            let data = [
                // [value, other, expectedOutput]
                [0.01, 0.2, 0.19],
                [new BigNumber(0.01), new BigNumber(0.2), 0.19],
                [0.01, new BigNumber(0.2), 0.19],
                [new BigNumber(0.01), 0.2, 0.19],
                [1000, 10, 990],
                [0.5, 3, 2.5],
                [-100, 200, 300],
                [0.3, 0.1, 0.2]
            ];

            data.forEach(([value, other, expectedOutput]) => {
                numbroStub.isNumbro.and.returnValue(true);
                let instance = numbroStub(value);
                let result = manipulating.difference(instance, numbroStub(other));
                expect(result).toBe(expectedOutput);
                expect(instance._value).not.toBe(result);
            });
        });
    });
});
