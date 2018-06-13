/*
 * grunt-contrib-less
 * http://gruntjs.com/
 *
 * Copyright (c) 2016 Tyler Kellen, contributors
 * Licensed under the MIT license.
 */

'use strict';

var path = require('path');
var _ = require('lodash');
var async = require('async');
var chalk = require('chalk');
var less = require('less');

module.exports = function(grunt) {
  grunt.registerMultiTask('less', 'Compile LESS files to CSS', function() {
    var done = this.async();

    var options = this.options({
      banner: ''
    });

    if (this.files.length < 1) {
      grunt.verbose.warn('Destination not written because no source files were provided.');
    }

    var tally = {
      sheets: 0,
      maps: 0
    };

    async.eachSeries(this.files, function(f, nextFileObj) {
      var destFile = f.dest;

      var files = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        }
        return true;
      });

      if (files.length === 0) {
        if (f.src.length < 1) {
          grunt.log.warn('Destination ' + chalk.cyan(destFile) + ' not written because no source files were found.');
        }

        // No src files, goto next target. Warn would have been issued above.
        return nextFileObj();
      }

      var compiled = [];
      var i = 0;

      async.concatSeries(files, function(file, next) {
        if (i++ > 0) {
          options.banner = '';
        }

        compileLess(file, destFile, options)
          .then(function(output) {
            compiled.push(output.css);
            if (options.sourceMap && !options.sourceMapFileInline) {
              var sourceMapFilename = options.sourceMapFilename;
              if (!sourceMapFilename) {
                sourceMapFilename = destFile + '.map';
              }
              grunt.file.write(sourceMapFilename, output.map);
              grunt.verbose.writeln('File ' + chalk.cyan(sourceMapFilename) + ' created.');
              tally.maps++;
            }
            process.nextTick(next);
          },
          function(err) {
            nextFileObj(err);
          });
      }, function() {
        if (compiled.length < 1) {
          grunt.log.warn('Destination ' + chalk.cyan(destFile) + ' not written because compiled files were empty.');
        } else {
          var allCss = compiled.join(options.compress ? '' : grunt.util.normalizelf(grunt.util.linefeed));
          grunt.file.write(destFile, allCss);
          grunt.verbose.writeln('File ' + chalk.cyan(destFile) + ' created');
          tally.sheets++;
        }
        nextFileObj();
      });

    }, function () {
      if (tally.sheets) {
        grunt.log.ok(tally.sheets + ' ' + grunt.util.pluralize(tally.sheets, 'stylesheet/stylesheets') + ' created.');
      }

      if (tally.maps) {
        grunt.log.ok(tally.maps + ' ' + grunt.util.pluralize(tally.maps, 'sourcemap/sourcemaps') + ' created.');
      }

      done();
    });
  });

  var compileLess = function(srcFile, destFile, options) {
    options = _.assign({filename: srcFile}, options);
    options.paths = options.paths || [path.dirname(srcFile)];

    if (typeof options.paths === 'function') {
      try {
        options.paths = options.paths(srcFile);
      } catch (e) {
        grunt.fail.warn(wrapError(e, 'Generating @import paths failed.'));
      }
    }

    if (options.sourceMap && !options.sourceMapFileInline && !options.sourceMapFilename) {
      options.sourceMapFilename = path.basename(destFile) + '.map';
    }

    if (typeof options.sourceMapBasepath === 'function') {
      try {
        options.sourceMapBasepath = options.sourceMapBasepath(srcFile);
      } catch (e) {
        grunt.fail.warn(wrapError(e, 'Generating sourceMapBasepath failed.'));
      }
    }

    if (typeof options.sourceMap === 'boolean' && options.sourceMap) {
      options.sourceMap = {
        sourceMapBasepath: options.sourceMapBasepath,
        sourceMapFilename: options.sourceMapFilename,
        sourceMapInputFilename: options.sourceMapInputFilename,
        sourceMapFullFilename: options.sourceMapFullFilename,
        sourceMapURL: options.sourceMapURL,
        sourceMapRootpath: options.sourceMapRootpath,
        outputSourceFiles: options.outputSourceFiles,
        sourceMapFileInline: options.sourceMapFileInline
      };
    }

    var srcCode = grunt.file.read(srcFile);

    // Equivalent to --modify-vars option.
    // Properties under options.modifyVars are appended as less variables
    // to override global variables.
    var modifyVarsOutput = parseVariableOptions(options.modifyVars);
    if (modifyVarsOutput) {
      srcCode += '\n' + modifyVarsOutput;
    }

    // Load custom functions
    if (options.customFunctions) {
      Object.keys(options.customFunctions).forEach(function(name) {
        less.functions.functionRegistry.add(name.toLowerCase(), function() {
          var args = [].slice.call(arguments);
          args.unshift(less);
          var res = options.customFunctions[name].apply(this, args);
          return typeof res === 'object' ? res : new less.tree.Anonymous(res);
        });
      });
    }

    return less.render(srcCode, options)
      .catch(function(err) {
        lessError(err, srcFile);
        throw err;
      });
  };

  var parseVariableOptions = function(options) {
    var pairs = _.toPairs(options);
    var output = '';
    pairs.forEach(function(pair) {
      output += '@' + pair[0] + ':' + pair[1] + ';';
    });
    return output;
  };

  var formatLessError = function(e) {
    var pos = '[' + 'L' + e.line + ':' + ('C' + e.column) + ']';
    return e.filename + ': ' + pos + ' ' + e.message;
  };

  var lessError = function(e, file) {
    var message = less.formatError ? less.formatError(e) : formatLessError(e);

    grunt.log.error(message);
    grunt.fail.warn('Error compiling ' + file);
  };

  var wrapError = function (e, message) {
    var err = new Error(message);
    err.origError = e;
    return err;
  };
};
