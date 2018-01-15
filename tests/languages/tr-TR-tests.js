const numbro = require("../../src/numbro");
const trTR = require("../../languages/tr-TR");

describe("tr-TR", () => {
    beforeAll(() => {
        numbro.registerLanguage(trTR, true);
    });

    afterAll(() => {
        numbro.setLanguage("en-US");
    });

    it("formats correctly", () => {
        let data = [
            [10000, "0,0.0000", "10.000,0000"],
            [10000.23, "0,0", "10.000,23"],
            [-10000, "0,0.0", "-10.000,0"],
            [10000.1234, "0.000", "10000,123"],
            [-10000, "(0,0.0000)", "(10.000,0000)"],
            [-0.23, ".00", "-,23"],
            [-0.23, "(.00)", "(,23)"],
            [0.23, "0.00000", "0,23000"],
            [1230974, "0.0a", "1,2milyon"],
            [1460, "0a", "1bin"],
            [-104000, "0a", "-104bin"],
            [1, "0o", "1'inci"],
            [52, "0o", "52'nci"],
            [23, "0o", "23'üncü"],
            [100, "0o", "100'üncü"],
            [1, "0[.]0", "1"]
        ];

        data.forEach(([input, format, expectedResult]) => {
            let result = numbro(input).format(format);
            expect(result).toBe(expectedResult, `Should format correctly ${input} with ${format}`);
        });
    });

    it("formats currency correctly", () => {
        let data = [
            [1000.234, "$0,0.00", "1.000,23\u20BA"],
            [-1000.234, "($0,0)", "(1.000,234)\u20BA"],
            [-1000.234, "$0.00", "-1000,23\u20BA"],
            [1230974, "($0.00a)", "1,23milyon\u20BA"]
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
            ["(1,23)milyon\u20BA", -1230000],
            ["10bin", 10000],
            ["-10bin", -10000],
            ["21'inci", 21],
            ["25'inci", 25],
            ["28'inci", 28],
            ["270'inci", 270],
            ["280'inci", 280],
            ["22'nci", 22],
            ["27'nci", 27],
            ["220'nci", 220],
            ["250'nci", 250],
            ["23'üncü", 23],
            ["24'üncü", 24],
            ["2100'üncü", 2100],
            ["26'ncı", 26],
            ["29'uncu", 29],
            ["210'uncu", 210],
            ["230'uncu", 230],
            ["0'ıncı", 0],
            ["260'ıncı", 260],
            ["290'ıncı", 290],
            ["\u20BA10.000,00", 10000],
            ["-76%", -0.76],
            ["2:23:57", 8637]
        ];

        data.forEach(([input, expectedResult]) => {
            let result = numbro.unformat(input);
            expect(result).toBe(expectedResult, `Should unformat correctly ${input}`);
        });
    });
});
