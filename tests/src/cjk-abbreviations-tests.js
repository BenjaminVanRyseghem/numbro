const numbro = require("../../src/numbro");
// ensure matching source file is loaded for the ensure-test-file lint rule
require("../../src/cjk-abbreviations");
const globalState = require("../../src/globalState");
const enableCjkForLanguage = require("../helpers/enableCjkForLanguage");

describe("CJK abbreviation scheme", () => {
    it("formats and unformats Japanese '億' correctly", () => {
        const previous = globalState.currentLanguage();
        const ja = Object.assign({}, require("../../languages/ja-JP"));
        enableCjkForLanguage(ja);
        globalState.registerLanguage(ja, true);

        let out = numbro(1200000000).format({ average: true });
        expect(out).toBe("12億");

        let back = numbro.unformat("12億");
        expect(back).toBe(1200000000);

        globalState.setLanguage(previous);
    });

    it("formats and unformats Korean '억' correctly", () => {
        const previous = globalState.currentLanguage();
        const ko = Object.assign({}, require("../../languages/ko-KR"));
        enableCjkForLanguage(ko);
        globalState.registerLanguage(ko, true);

        let out = numbro(1200000000).format({ average: true });
        expect(out).toBe("12억");

        let back = numbro.unformat("12억");
        expect(back).toBe(1200000000);

        globalState.setLanguage(previous);
    });

    it("formats and unformats Simplified Chinese '亿' correctly", () => {
        const previous = globalState.currentLanguage();
        const zh = Object.assign({}, require("../../languages/zh-CN"));
        enableCjkForLanguage(zh);
        globalState.registerLanguage(zh, true);

        let out = numbro(1200000000).format({ average: true });
        expect(out).toBe("12亿");

        let back = numbro.unformat("12亿");
        expect(back).toBe(1200000000);

        globalState.setLanguage(previous);
    });
});
