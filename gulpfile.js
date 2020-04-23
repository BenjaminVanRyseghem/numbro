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

const gulp = require("gulp");
const del = require("del");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const path = require("path");
const fs = require("fs");
const reporters = require("jasmine-reporters");
const Server = require("karma").Server;

const { series, parallel } = gulp;

const plugins = require("gulp-load-plugins")({
    rename: {
        "gulp-jasmine-phantom-requirejs": "jasminePhantom"
    }
});

gulp.task("lint:js", () => {
    return gulp.src(["./src/**/*.js", "./tests/**/*.js", "./languages/**/*.js"])
        .pipe(plugins.eslint({ rulePaths: ["./eslint_rules"] }))
        .pipe(plugins.eslint.format("unix"))
        .pipe(plugins.eslint.failAfterError());
});

gulp.task("lint", parallel("lint:js"));

// Build

gulp.task("build:src", () => {
    const babelify = require("babelify");
    // set up the browserify instance on a task basis
    let b = browserify({
        standalone: "numbro",
        entries: "./src/numbro.js",
        debug: true,
        transform: [babelify]
    });

    return b.bundle()
        .pipe(source("numbro.js"))
        .pipe(buffer())
        // Add transformation tasks to the pipeline here.
        .on("error", plugins.util.log)
        .pipe(gulp.dest("./dist"));
});

gulp.task("build:src:min", () => {
    const babelify = require("babelify");
    // set up the browserify instance on a task basis
    let b = browserify({
        standalone: "numbro",
        entries: "./src/numbro.js",
        debug: true,
        transform: [babelify]
    });

    return b.bundle()
        .pipe(source("numbro.min.js"))
        .pipe(buffer())
        .pipe(plugins.sourcemaps.init({ loadMaps: true }))
        // Add transformation tasks to the pipeline here.
        .pipe(plugins.uglify())
        .on("error", plugins.util.log)
        .pipe(plugins.sourcemaps.write("./"))
        .pipe(gulp.dest("./dist"));
});

gulp.task("build:languages", () => {
    const babelify = require("babelify");
    return gulp.src("./languages/**/*.js")
        .pipe(plugins.foreach((stream, file) => {
            let fullName = file.history[0];
            let extension = path.extname(fullName);
            let baseName = path.basename(fullName, extension);

            let b = browserify({
                standalone: `numbro.${baseName}`,
                entries: fullName,
                debug: true,
                transform: [babelify]
            });

            return b.bundle()
                .pipe(source(`${baseName}.min${extension}`))
                .pipe(buffer())
                .pipe(plugins.sourcemaps.init({ loadMaps: true }))
                .pipe(plugins.uglify())
                .on("error", plugins.util.log)
                .pipe(plugins.sourcemaps.write("./"))
                .pipe(gulp.dest("./dist/languages/"));
        }));
});

function buildLanguages(dir = ".", minify = true) {
    return (cb) => {
        fs.readdir(`${dir}/languages`, (_, files) => {
            let langFiles = files
                .filter(file => file.match(/\.js$/))
                .map(file => `exports["${file.replace(".min.js", "")}"]=require("${dir}/languages/${file}");`)
                .join(minify ? "" : "\n");
            fs.writeFile("./languages.js", langFiles, () => {
                const babelify = require("babelify");
                let b = browserify({
                    standalone: "numbro.allLanguages",
                    entries: "./languages.js",
                    debug: minify,
                    transform: [minify ? babelify : () => {}]
                });

                if (!minify) {
                    return cb();
                }

                return b.bundle()
                    .pipe(source("languages.min.js"))
                    .pipe(buffer())
                    .pipe(plugins.sourcemaps.init({ loadMaps: true }))
                    .pipe(plugins.uglify())
                    .on("error", plugins.util.log)
                    .pipe(plugins.sourcemaps.write("./"))
                    .pipe(gulp.dest(dir))
                    .on("end", cb);
            });
        });
    };
}

gulp.task("build:write-languages", buildLanguages("./dist"));
gulp.task("build:write-languages-unminified", buildLanguages(".", false));

gulp.task("build:all-languages", series("build:languages", "build:write-languages"));

gulp.task("build", series("build:src", "build:src:min", "build:languages", "build:all-languages"));

// Tests

gulp.task("pre-test", () => {
    return gulp.src(["./src/**/*.js", "./languages/**/*.js"])
        .pipe(plugins.istanbul())
        .pipe(plugins.istanbul.hookRequire());
});

gulp.task("test:unit:run", () => {
    return gulp.src("./tests/**/*.js")
        .pipe(plugins.jasmine({
            reporter: new reporters.TerminalReporter()
        }))
        .pipe(plugins.istanbul.writeReports())
        .pipe(plugins.istanbul.enforceThresholds({ thresholds: { global: 100 } }));
});

gulp.task("test:unit", series("pre-test", "test:unit:run"));

gulp.task("test:integration:amd", series("build"), (done) => {
        new Server({
            configFile: `${__dirname}/karma.conf.js`,
            singleRun: true
        }, done).start();
    }
);

gulp.task("test:integration:node", series("build"), (cb) => {
        return gulp.src("./integrationTests/node/**/*.js")
            .pipe(plugins.jasmine({
                reporter: new reporters.TerminalReporter()
            }))
            .pipe(cb);
    }
);

gulp.task("test:integration", parallel("test:integration:node", "test:integration:amd"), () => {});

gulp.task("test", parallel("test:unit", "test:integration"), () => {});

// Bumping

const referencesToVersion = [
    "./package.json",
    "./bower.json",
    "./component.json",
    "./src/numbro.js"
];

gulp.task("bump:major", () => {
    return gulp.src(referencesToVersion, { base: "./" })
        .pipe(plugins.bump({
            type: "major",
            global: true
        }))
        .pipe(gulp.dest("./"));
});

gulp.task("bump:minor", () => {
    return gulp.src(referencesToVersion, { base: "./" })
        .pipe(plugins.bump({
            type: "minor",
            global: true
        }))
        .pipe(gulp.dest("./"));
});

gulp.task("bump:patch", () => {
    return gulp.src(referencesToVersion, { base: "./" })
        .pipe(plugins.bump({
            type: "patch",
            global: true
        }))
        .pipe(gulp.dest("./"));
});

// Clean

gulp.task("clean:build", (cb) => {
    return del(["dist"], cb);
});

gulp.task("clean", series("clean:build"));

exports.build = series("build");
exports["bump:major"] = series("bump:major");
exports["bump:minor"] = series("bump:minor");
exports["bump:patch"] = series("bump:patch");
exports["build:write-languages-unminified"] = series("build:write-languages-unminified");
exports.lint = series("lint");
exports.test = series("test");
exports.default = parallel("lint", "test");
