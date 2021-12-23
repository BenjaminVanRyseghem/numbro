/* eslint-disable no-var */
/* eslint-disable linebreak-style */
// Node
if (typeof module !== "undefined" && module.exports) {
    var numbro = require("../src/numbro.js");
    var expect = require("chai").expect;
}

describe("null-test", () => {

    describe("Test Null", () => {
        it("should return ERROR!", () => {
            expect(numbro(null).format("0,0")).to.equal("ERROR!");
        });
    });

    describe("Test String", () => {
        it("", () => {
            expect(numbro("Hello").format("0,0")).to.equal("ERROR!");
        });
    });
});
