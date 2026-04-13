const numbro = require("../../src/numbro");
const zhTW = require("../../languages/zh-TW");
const enableCjkForLanguage = require("../helpers/enableCjkForLanguage");

describe("zh-TW", () => {
    beforeAll(() => {
        enableCjkForLanguage(zhTW);
        numbro.registerLanguage(zhTW, true);
    });

    afterAll(() => {
        numbro.setLanguage("en-US");
    });

    it("formats correctly", () => {
        let data = [
            [10000, "0,0.0000", "10,000.0000"],
            [10000.23, "0,0", "10,000.23"],
            [-10000, "0,0.0", "-10,000.0"],
            [10000.1234, "0.000", "10000.123"],
            [-10000, "(0,0.0000)", "(10,000.0000)"],
            [-0.23, ".00", "-.23"],
            [-0.23, "(.00)", "(.23)"],
            [0.23, "0.00000", "0.23000"],
            [1230974, "0.0a", "123.1萬"],
            [1460, "0a", "1460"],
            [-104000, "0a", "-10萬"],
            [1, "0o", "1."],
            [52, "0o", "52."],
            [23, "0o", "23."],
            [100, "0o", "100."],
            [1, "0[.]0", "1"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format correctly ${input} with ${format}`);
        });
    });

    it("formats currency correctly", () => {
        let data = [
            [1000.234, "$0,0.00"],
            [-1000.234, "($0,0)"],
            [-1000.234, "$0.00"],
            [1230974, "($0.00a)"]
        ];

        data.forEach(([input, format]) => {
            const numericFormat = format.replace(/\$/g, "");
            const numberPart = numbro(input).format(numericFormat);
            const sym = zhTW.currency.symbol || "";
            const pos = zhTW.currency.position || "postfix";

            let expectedResult = "";
            if (pos === "prefix") {
                if (numberPart[0] === "-") {
                    expectedResult = `-${sym}${numberPart.slice(1)}`;
                } else if (numberPart[0] === "+") {
                    expectedResult = `+${sym}${numberPart.slice(1)}`;
                } else {
                    expectedResult = `${sym}${numberPart}`;
                }
            } else if (pos === "infix") {
                expectedResult = numberPart.replace(/\./, sym);
            } else {
                expectedResult = `${numberPart}${sym}`;
            }

            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format currency correctly ${input} with ${format}`);
        });
    });

    it("formats percentage correctly", () => {
        let data = [
            [1, "0%", "100%"],
            [0.974878234, "0.000%", "97.488%"],
            [-0.43, "0%", "-43%"],
            [0.43, "(0.000%)", "43.000%"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format percentage correctly ${input} with ${format}`);
        });
    });

    it("unformats correctly", () => {
        const sym = zhTW.currency.symbol || zhTW.currency.code || "";
        let data = [
            ["10,000.123", 10000.123],
            ["(0.12345)", -0.12345],
            ["(1.23百萬)", -1230000],
            ["1.23百萬", 1230000],
            ["10千", 10000],
            ["-10千", -10000],
            ["23.", 23],
            [`${sym}10,000.00`, 10000],
            ["1.5億", 150000000],
            ["12億", 1200000000],
            ["-76%", -0.76],
            ["2:23:57", 8637]
        ];

        data.forEach(([input, expectedResult]) => {
            let result = numbro.unformat(input);
            expect(result).toBe(expectedResult, `Should unformat correctly ${input}`);
        });
    });
});
