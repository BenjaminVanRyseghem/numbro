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

const plugins = require("gulp-load-plugins")({
    rename: {
        "gulp-jasmine-phantom-requirejs": "jasminePhantom"
    }
});

gulp.task("default", ["lint", "test"]);

gulp.task("lint", ["lint:js"]);

gulp.task("lint:js", () => {
    return gulp.src(["./src/**/*.js", "./tests/**/*.js", "./languages/**/*.js"])
        .pipe(plugins.eslint({rulePaths: ["./eslint_rules"]}))
        .pipe(plugins.eslint.format("unix"))
        .pipe(plugins.eslint.failAfterError());
});

// Tests

gulp.task("pre-test", () => {
    return gulp.src(["./src/**/*.js", "./languages/**/*.js"])
        .pipe(plugins.istanbul())
        .pipe(plugins.istanbul.hookRequire());
});

gulp.task("test", ["test:unit", "test:integration"], () => {});

gulp.task("test:unit", ["pre-test"], () => {
    return gulp.src("./tests/**/*.js")
        .pipe(plugins.jasmine({
            reporter: new reporters.TerminalReporter()
        }))
        .pipe(plugins.istanbul.writeReports())
        .pipe(plugins.istanbul.enforceThresholds({thresholds: {global: 100}}));
});

gulp.task("test:integration", ["test:integration:node", "test:integration:amd"], () => {});

gulp.task("test:integration:amd", ["build"], (done) => {
        new Server({
            configFile: `${__dirname }/karma.conf.js`,
            singleRun: true
        }, done).start();
    }
);

gulp.task("test:integration:node", ["build"], () => {
        return gulp.src("./integrationTests/node/**/*.js")
            .pipe(plugins.jasmine({
                reporter: new reporters.TerminalReporter()
            }));
    }
);

// Build

gulp.task("build", ["build:src", "build:src:min", "build:languages", "build:all-languages"]);

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
        .pipe(plugins.sourcemaps.init({loadMaps: true}))
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
                .pipe(plugins.sourcemaps.init({loadMaps: true}))
                .pipe(plugins.uglify())
                .on("error", plugins.util.log)
                .pipe(plugins.sourcemaps.write("./"))
                .pipe(gulp.dest("./dist/languages/"));
        }));
});

gulp.task("build:all-languages", ["build:languages"], () => {
    let dir = "./dist";
    fs.readdir(`${dir}/languages`, (_, files) => {
        let langFiles = files
            .filter(file => file.match(/\.js$/))
            .map(file => `exports["${file.replace(".min.js", "")}"]=require("${dir}/languages/${file}");`)
            .join("");
        fs.writeFile("./languages.js", langFiles, () => {
            const babelify = require("babelify");
            let b = browserify({
                standalone: "numbro.allLanguages",
                entries: "./languages.js",
                debug: true,
                transform: [babelify]
            });

            return b.bundle()
                .pipe(source("languages.min.js"))
                .pipe(buffer())
                .pipe(plugins.sourcemaps.init({ loadMaps: true }))
                .pipe(plugins.uglify())
                .on("error", plugins.util.log)
                .pipe(plugins.sourcemaps.write("./"))
                .pipe(gulp.dest(dir));
        });
    });
});

// Bumping

const referencesToVersion = [
    "./package.json",
    "./bower.json",
    "./component.json",
    "./src/numbro.js"
];

gulp.task("bump:major", () => {
    gulp.src(referencesToVersion, {base: "./"})
        .pipe(plugins.bump({
            type: "major",
            global: true
        }))
        .pipe(gulp.dest("./"));
});

gulp.task("bump:minor", () => {
    gulp.src(referencesToVersion, {base: "./"})
        .pipe(plugins.bump({
            type: "minor",
            global: true
        }))
        .pipe(gulp.dest("./"));
});

gulp.task("bump:patch", () => {
    gulp.src(referencesToVersion, {base: "./"})
        .pipe(plugins.bump({
            type: "patch",
            global: true
        }))
        .pipe(gulp.dest("./"));
});

// Clean

gulp.task("clean", ["clean:build"]);

gulp.task("clean:build", (cb) => {
    return del(["dist"], cb);
});
