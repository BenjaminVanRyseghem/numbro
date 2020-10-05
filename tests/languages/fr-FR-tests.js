const numbro = require("../../src/numbro");
const frFR = require("../../languages/fr-FR");

describe("fr-FR", () => {
    beforeAll(() => {
        numbro.registerLanguage(frFR, true);
    });

    afterAll(() => {
        numbro.setLanguage("en-US");
    });

    it("formats correctly", () => {
        let data = [
            [10000, "0,0.0000", "10 000,0000"],
            [10000.23, "0,0", "10 000,23"],
            [-10000, "0,0.0", "-10 000,0"],
            [10000.1234, "0.000", "10000,123"],
            [-10000, "(0,0.0000)", "(10 000,0000)"],
            [-0.23, ".00", "-,23"],
            [-0.23, "(.00)", "(,23)"],
            [0.23, "0.00000", "0,23000"],
            [1230974, "0.0a", "1,2M"],
            [1460, "0a", "1k"],
            [-104000, "0a", "-104k"],
            [1, "0o", "1er"],
            [52, "0o", "52ème"],
            [23, "0o", "23ème"],
            [100, "0o", "100ème"],
            [1, "0[.]0", "1"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format correctly ${input} with ${format}`);
        });
    });

    it("formats currency correctly", () => {
        let data = [
            [1000.234, "$", "1,000 k€"],
            [1000.234, "$0,0.00", "1 000,23€"],
            [-1000.234, "($0,0)", "(1 000,234)€"],
            [-1000.234, "$0.00", "-1000,23€"],
            [1230974, "($0.00a)", "1,23M€"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format currency correctly ${input} with ${format}`);
        });
    });

    it("formats bytes correctly", () => {
        let data = [
            [100, { output: "byte", base: "decimal" }, "100o"],
            [2048, { output: "byte", base: "decimal" }, "2,048Ko"],
            [7884486213, { output: "byte", base: "decimal", mantissa: 1 }, "7,9Go"],
            [3467479682787, { output: "byte", base: "decimal", mantissa: 1 }, "3,5To"],
            [100, { output: "byte", base: "binary" }, "100o"],
            [2048, { output: "byte", base: "binary" }, "2Kio"],
            [7884486213, { output: "byte", base: "binary", mantissa: 1 }, "7,3Gio"],
            [3467479682787, { output: "byte", base: "binary", mantissa: 1 }, "3,2Tio"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format bytes correctly ${input} with ${format.base}`);
        });
    });

    it("formats percentage correctly", () => {
        let data = [
            [1, "0%", "100%"],
            [0.974878234, "0.000%", "97,488%"],
            [-0.43, "0%", "-43%"],
            [0.43, "(0.000%)", "43,000%"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format percentage correctly ${input} with ${format}`);
        });
    });

    it("unformats correctly", () => {
        let data = [
            ["10 000,123", 10000.123],
            ["(0,12345)", -0.12345],
            ["(1,23M€)", -1230000],
            ["10k", 10000],
            ["-10k", -10000],
            ["23ème", 23],
            ["10 000,00€", 10000],
            ["-76%", -0.76],
            ["2:23:57", 8637]
        ];

        data.forEach(([input, expectedResult]) => {
            let result = numbro.unformat(input);
            expect(result).toBe(expectedResult, `Should unformat correctly ${input}`);
        });
    });
});
