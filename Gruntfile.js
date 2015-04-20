var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            languages: {
                src: [
                    'languages/**/*.js',
                ],
                dest: 'dist/languages.js',
            },
        },
        uglify: {
            my_target: {
                files: [
                    { src: [ 'dist/languages.js' ], dest: 'dist/min/languages.min.js', },
                    { src: [ 'numbro.js' ], dest: 'dist/min/numbro.min.js', },
                ].concat( fs.readdirSync('./languages').map(function (fileName) {
                    var lang = path.basename(fileName, '.js');
                    return {
                        src: [path.join('languages/', fileName)],
                        dest: path.join('dist/min/languages/', lang + '.min.js'),
                    };
                }))
            },
            options: {
                preserveComments: 'some',
            },
        },
        bump: {
            options: {
                files: [
                    'package.json',
                    'bower.json',
                    'component.json',
                    'numbro.js',
                ],
                updateConfigs: ['pkg'],
                commit: false,
                createTag: false,
                push: false,
                globalReplace: true,
                regExp: new RegExp('([\'|\"]?version[\'|\"]?[ ]*[:=][ ]*[\'|\"]?)(\\d+\\.\\d+\\.\\d+(-\\.\\d+)?(-\\d+)?)[\\d||A-a|.|-]*([\'|\"]?)')
            },
        },
        confirm: {
            release: {
                options: {
                    question: 'Are you sure you want to publish a new release' +
                        ' with version <%= pkg.version %>? (yes/no)',
                    continue: function(answer) {
                        return ['yes', 'y'].indexOf(answer.toLowerCase()) !== -1;
                    }
                }
            }
        },
        release:{
            options: {
                bump: false,
                additionalFiles: [
                    'bower.json',
                    'component.json',
                ],
                tagName: 'v<%= version %>',
            },
        },
        nodeunit: {
            all: ['tests/**/*.js'],
        },
        jshint: {
            all: [
                'Gruntfile.js',
                'numbro.js',
                'languages/**/*.js'
            ],
            options: {
                'node': true,
                'browser': true,
                'curly': true,
                'devel': false,
                'eqeqeq': true,
                'eqnull': true,
                'newcap': true,
                'noarg': true,
                'onevar': true,
                'undef': true,
                'sub': true,
                'strict': false,
                'quotmark': 'single'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-bump');
    grunt.loadNpmTasks('grunt-confirm');
    grunt.loadNpmTasks('grunt-release');


    grunt.registerTask('default', [
        'test'
    ]);

    grunt.registerTask('test', [
        'jshint',
        'nodeunit'
    ]);

    grunt.registerTask('build', [
        'test',
        'concat',
        'uglify'
    ]);

    // wrap grunt-release with confirmation
    [
        'patch',
        'minor',
        'major',
        'prerelease'
    ].forEach(function (detail) {
        grunt.registerTask('publish:'+detail, [
            'bump:'+detail,
            'confirm:release',
            'release',
        ]);
    });
    grunt.registerTask('publish', ['publish:patch']);


    // Travis CI task.
    grunt.registerTask('travis', ['test']);
};
