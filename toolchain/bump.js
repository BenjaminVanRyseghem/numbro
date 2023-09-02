const path = require("node:path");
const fs = require("node:fs/promises");
const bump = require("bump-regex");

const referencesToVersion = [
    "./package.json",
    "./bower.json",
    "./component.json",
    "./src/numbro.js"
];

const root = path.resolve(__dirname, "..");

let promises = referencesToVersion.map(async (file) => {
    let filePath = path.resolve(root, file);
    let content = await fs.readFile(filePath);
    let options = {
        str: content.toString(),
        type: process.argv[2],
    };

    return new Promise((resolve, reject) => {
        bump(options, (err, out) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(fs.writeFile(filePath, out.str))
        })
    })
});

Promise.all(promises)
