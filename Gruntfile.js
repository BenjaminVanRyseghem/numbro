module.exports = function(grunt) {
	grunt.initConfig({
		less: {
			development: {
				options: {
					paths: ["css"],
					dumpLineNumbers: "comments"
				},
				files: {
					"css/style.css": "less/style.less"
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');

	grunt.registerTask('css', ['less']);
};