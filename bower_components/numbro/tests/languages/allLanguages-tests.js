const languages = require("auto-load")("languages"); // eslint-disable-line ensure-test-file
const validating = require("../../src/validating");

describe("all languages", () => {
    it("are valid", () => {
        Object.keys(languages).forEach((name) => {
            let language = languages[name];
            expect(validating.validateLanguage(language)).toBeTruthy(`Invalid language "${name}"`);
        });
    });
});
