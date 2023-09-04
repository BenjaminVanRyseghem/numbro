const numbro = require("../../src/numbro");
const idID = require("../../languages/id-ID");

describe("id-ID", () => {
    beforeAll(() => {
        numbro.registerLanguage(idID, true);
    });

    afterAll(() => {
        numbro.setLanguage("en-US");
    });

    it("formats correctly", () => {
        let data = [
            [10000, "0,0.0000", "10.000,0000"],
            [10000.23, "0,0", "10.000,23"],
            [-10000, "0,0.0", "-10.000,0"],
            [10000.1234, "0.000", "10.000,123"],
            [-10000, "(0,0.0000)", "(10.000,0000)"],
            [-0.23, ".00", "-,23"],
            [-0.23, "(.00)", "(,23)"],
            [0.23, "0.00000", "0,23000"],
            [1230974, "0.0a", "1,2jt"],
            [1460, "0a", "1rb"],
            [-104000, "0a", "-104rb"],
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
            [1000.234, "Rp", "Rp1.000,234"],
            [1000.234, "Rp0,0.00", "Rp1.000,23"],
            [-1000.234, "(Rp0,0)", "(Rp1.000,234)"],
            [-1000.234, "Rp0.00", "-Rp1.000,23"],
            [1230974, "(Rp0.00a)", "Rp1,23jt"]
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
            ["10.000,123", 10000.123],
            ["(0,12345)", -0.12345],
            ["(Rp1,23jt)", -1230000],
            ["1rb", 1000],
            ["-104rb", -104000],
            ["23rd", 23],
            ["Rp10.000,00", 10000],
            ["-76%", -0.76],
            ["2:23:57", 8637]
        ];

        data.forEach(([input, expectedResult]) => {
            let result = numbro.unformat(input);
            expect(result).toBe(expectedResult, `Should unformat correctly ${input}`);
        });
    });
});
