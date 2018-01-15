/*!
 * Copyright (c) 2017 Benjamin Van Ryseghem<benjamin@vanryseghem.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const path = require("path");
const fs = require("fs");
const minimatch = require("minimatch");

const MESSAGE = "No test file found for \"{{file}}\", expecting \"{{testFile}}\" to exists.";
const LOADING_MESSAGE = "A test file should load its matching source file (\"{{file}}\").";

module.exports = function(context) {

    let options = context.options[0];

    function buildTestFileName(file, testFolder, builder) {
        let extension = path.extname(file);
        let base = file.slice(0, -extension.length);
        let testFile = builder(base);
        return path.join(testFolder, testFile + extension);
    }

    function foundLoader(loader, stringToFind, sourceCode, comments) {
        let index = sourceCode.text.indexOf(`${loader}("${stringToFind}")`);

        if (index === -1) {
            return false;
        }

        let length = comments.length;
        for (let i = 0; i < length; i++) {
            let comment = comments[i];
            if (comment.start <= index && index <= comment.end) {
                return false;
            }
        }

        return true;
    }

    function foundRewire(stringToFind, sourceCode, comments) {
        return foundLoader("rewire", stringToFind, sourceCode, comments);
    }

    function foundRequire(stringToFind, sourceCode, comments) {
        return foundLoader("require", stringToFind, sourceCode, comments);
    }

    function hasMatchingTestFile(node, filePath) {
        let localPath = path.relative(process.cwd(), filePath);

        if (!minimatch(localPath, options.source)) {
            return;
        }

        let testFile = (buildTestFileName(localPath, options.testFolder, options.testFileBuilder));
        let exists = fs.existsSync(path.resolve(testFile));
        if (!exists) {
            context.report({
                node: node,
                message: MESSAGE,
                data: {
                    file: localPath,
                    testFile: testFile
                }
            });
        }
    }

    function hasPathFromTestToSource(node, testFile) {
        let localPath = path.relative(process.cwd(), testFile);

        if (!minimatch(localPath, `${options.testFolder}/**/*.*`)) {
            return;
        }

        let extension = path.extname(localPath);
        // let base = localPath.slice(0, -extension.length);

        let regexp = `${options.testFileBuilder("(.+)") + extension}$`;
        if (!localPath.match(new RegExp(regexp))) {
            return;
        }

        let sourceFile = path.relative(path.resolve(options.testFolder), localPath.match(new RegExp(regexp))[1]);
        let stringToFind = path.relative(testFile, path.resolve(sourceFile));
        stringToFind = stringToFind.replace("../", "");

        let sourceCode = context.getSourceCode();
        let comments = sourceCode["tokensAndComments"].filter((each) => (each.type === "Block" || each.type === "Line"));

        if (!foundRequire(stringToFind, sourceCode, comments) && !foundRewire(stringToFind, sourceCode, comments)) {
            context.report({
                node: node,
                message: LOADING_MESSAGE,
                data: {
                    file: sourceFile + extension
                }
            });
        }
    }

    //--------------------------------------------------------------------------
    // Public
    //--------------------------------------------------------------------------

    return {
        "Program": function(node) {
            hasMatchingTestFile(node, context.getFilename());
            hasPathFromTestToSource(node, context.getFilename());
        }
    };
};

module.exports.schema = [
    {
        "type": "object",
        "properties": {
            "source": {
                "type": "string"
            },
            "testFolder": {
                "type": "string"
            },
            "testFileBuilder": {
                "type": "function"
            }
        },
        "additionalProperties": true
    }
];
