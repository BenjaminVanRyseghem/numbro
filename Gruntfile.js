var fs = require('fs');
var path = require('path');

module.exports = function(grunt) {

    grunt.initConfig({
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

    // Travis CI task.
    grunt.registerTask('travis', ['test']);
};