const numbro = require("../../src/numbro");
const csCZ = require("../../languages/cs-CZ");

describe("cs-CZ", () => {
    beforeAll(() => {
        numbro.registerLanguage(csCZ, true);
    });

    afterAll(() => {
        numbro.setLanguage("en-US");
    });

    it("formats correctly", () => {
        let data = [
            [10000, "0,0.0000", "10\u00a0000,0000"],
            [10000.23, "0,0", "10\u00a0000,23"],
            [-10000, "0,0.0", "-10\u00a0000,0"],
            [10000.1234, "0.000", "10000,123"],
            [-10000, "(0,0.0000)", "(10\u00a0000,0000)"],
            [-0.23, ".00", "-,23"],
            [-0.23, "(.00)", "(,23)"],
            [0.23, "0.00000", "0,23000"],
            [1230974, "0.0a", "1,2mil."],
            [1460, "0a", "1tis."],
            [1000000000, "0a", "1mld."],
            [1000000000000, "0a", "1bil."],
            [-104000, "0a", "-104tis."],
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
            [1000.234, "0,0.00 $", "1 000,23 Kč"],
            [-1000.234, "(0,0 $)", "(1 000,234) Kč"],
            [-1000.234, "0.00 $", "-1000,23 Kč"],
            [1230974, "(0.00a $)", "1,23 mil. Kč"],
            [12.23, "(0.00a $)", "12,23 Kč"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format currency correctly ${input} with ${format}`);
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
            ["10\u00a0000,123", 10000.123],
            ["(0,12345)", -0.12345],
            ["(1,23mil.Kč)", -1230000],
            ["1,23mil. Kč", 1230000],
            ["10tis.", 10000],
            ["-10tis.", -10000],
            ["23.", 23],
            ["10\u00a0000,00Kč", 10000],
            ["-76%", -0.76],
            ["2:23:57", 8637]
        ];

        data.forEach(([input, expectedResult]) => {
            let result = numbro.unformat(input);
            expect(result).toBe(expectedResult, `Should unformat correctly ${input}`);
        });
    });
});
