const numbro = require("../../src/numbro");
const enIN = require("../../languages/en-IN");

describe("en-IN", () => {
    beforeAll(() => {
        numbro.registerLanguage(enIN, true);
    });

    afterAll(() => {
        numbro.setLanguage("en-US");
    });

    it("formats correctly", () => {
        let data = [
            [10000, "0,0.00", "10,000.00"],
            [10000.23, "0,0", "10,000.23"],
            [-4560.45, "0,0.00", "-4,560.45"],
            [1000000, "0,0", "10,00,000"],
            [10000000, "0,0", "1,00,00,000"],
            [517456.99, "0,0", "5,17,456.99"],
            [-10000, "0,0.0", "-10,000.0"],
            [10000.1234, "0.000", "10000.123"],
            [-10000, "(0,0.0000)", "(10,000.0000)"],
            [-0.23, ".00", "-.23"],
            [-0.23, "(.00)", "(.23)"],
            [0.23, "0.00000", "0.23000"],
            [1230974, "0.0a", "12.3\u004C"], //L
            [556, "0.00a", "0.56k"],
            [1460, "0a", "1k"],
            [-104000, "0a", "-1\u004C"],
            [-22104090, "0a", "-2\u0043\u0072"], //Cr
            [1, "0o", "1st"],
            [52, "0o", "52nd"],
            [23, "0o", "23rd"],
            [100, "0o", "100th"],
            [1, "0[.]0", "1"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format correctly ${input} with ${format}`);
        });
    });

    it("formats currency correctly", () => {
        let data = [
            [1000.234, "$", "₹1.000k"],
            [1000.234, "$0,0.00", "₹1,000.23"],
            [55600.234, "$0,0.00", "₹55,600.23"],
            [-1000.234, "($0,0)", "₹(1,000.234)"],
            [-1000.234, "$0.00", "-₹1000.23"],
            [1230974, "($0.00a)", "₹12.31L"],
            [45689245, "($0.000a)", "₹4.569Cr"],
            [-1230974, "$0.00a", "-₹12.31L"]
        ];

        data.forEach(([input, format, expectedResult]) => {
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
        let data = [
            ["10,000.123", 10000.123],
            ["(0.12345)", -0.12345],
            ["(₹12.3L)", -1230000],
            ["(₹550.33Cr)", -5503300000],
            ["10k", 10000],
            ["-10k", -10000],
            ["23rd", 23],
            ["₹10,000.00", 10000],
            ["₹96,56,000.00", 9656000],
            ["₹150,22,51,000.10", 1502251000.1],
            ["-76%", -0.76],
            ["2:23:57", 8637]
        ];

        data.forEach(([input, expectedResult]) => {
            let result = numbro.unformat(input);
            expect(result).toBe(expectedResult, `Should unformat correctly ${input}`);
        });
    });
});
