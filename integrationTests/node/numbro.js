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

let numbro = require("../../dist/numbro");

describe("[integration node] numbro", () => {
    it("has the correct static API", () => {
        expect(numbro.language).toBeTruthy();
        expect(numbro.registerLanguage).toBeTruthy();
        expect(numbro.setLanguage).toBeTruthy();
        expect(numbro.languages).toBeTruthy();
        expect(numbro.languageData).toBeTruthy();
        expect(numbro.zeroFormat).toBeTruthy();
        expect(numbro.defaultFormat).toBeTruthy();
        expect(numbro.setDefaults).toBeTruthy();
        expect(numbro.defaultCurrencyFormat).toBeTruthy();
        expect(numbro.validate).toBeTruthy();
        expect(numbro.loadLanguagesInNode).toBeTruthy();
        expect(numbro.unformat).toBeTruthy();
    });

    it("has the correct instance API", () => {
        let instance = numbro(12);
        expect(instance.clone).toBeTruthy();
        expect(instance.format).toBeTruthy();
        expect(instance.formatCurrency).toBeTruthy();
        expect(instance.formatTime).toBeTruthy();
        expect(instance.binaryByteUnits).toBeTruthy();
        expect(instance.decimalByteUnits).toBeTruthy();
        expect(instance.byteUnits).toBeTruthy();
        expect(instance.difference).toBeTruthy();
        expect(instance.add).toBeTruthy();
        expect(instance.subtract).toBeTruthy();
        expect(instance.multiply).toBeTruthy();
        expect(instance.divide).toBeTruthy();
        expect(instance.set).toBeTruthy();
        expect(instance.value).toBeTruthy();
        expect(instance.valueOf).toBeTruthy();
    });
});
