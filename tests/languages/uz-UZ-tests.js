const numbro = require("../../src/numbro");
const trTR = require("../../languages/uz-UZ");

describe("uz-UZ", () => {
    beforeAll(() => {
        numbro.registerLanguage(uzUZ, true);
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
            [1460, "0a", "1ming"],
            [-104000, "0a", "-104ming"],
            [1, "0[.]0", "1"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format correctly ${input} with ${format}`);
        });
    });

    it("formats currency correctly", () => {
        let data = [
            [1000.234, "$0,0.00", "1 000,23\u20BA"],
            [-1000.234, "($0,0)", "(1 000,234)\u20BA"],
            [-1000.234, "$0.00", "-1000,23\u20BA"],
            [1230974, "($0.00a)", "1,23mln\u20BA"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format currency correctly ${input} with ${format}`);
        });
    });
});