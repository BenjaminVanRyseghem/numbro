const numbro = require("../../src/numbro");
const nlBE = require("../../languages/nl-BE");

describe("nl-BE", () => {
    beforeAll(() => {
        numbro.registerLanguage(nlBE, true);
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
            [1230974, "0.0a", "1,2mln"],
            [1460, "0a", "1k"],
            [-104000, "0a", "-104k"],
            [0, "0o", "0de"],
            [1, "0o", "1ste"],
            [2, "0o", "2de"],
            [8, "0o", "8ste"],
            [19, "0o", "19de"],
            [20, "0o", "20ste"],
            [100, "0o", "100ste"],
            [102, "0o", "102de"],
            [108, "0o", "108ste"],
            [109, "0o", "109de"],
            [1, "0[.]0", "1"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format correctly ${input} with ${format}`);
        });
    });

    it("formats currency correctly", () => {
        let data = [
            [1000.234, "0,0.00$", "1 000,23€"],
            [-1000.234, "(0,0$)", "(1 000,234)€"],
            [-1000.234, "0.00$", "-1000,23€"],
            [1230974, "(0.00a$)", "1,23mln€"]
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
            ["10 000,123", 10000.123],
            ["(0,12345)", -0.12345],
            ["(€ 1,23 mln)", -1230000],
            ["10k", 10000],
            ["-10k", -10000],
            ["23ste", 23],
            ["€ 10 000,00", 10000],
            ["-76%", -0.76],
            ["2:23:57", 8637]
        ];

        data.forEach(([input, expectedResult]) => {
            let result = numbro.unformat(input);
            expect(result).toBe(expectedResult, `Should unformat correctly ${input}`);
        });
    });
});
