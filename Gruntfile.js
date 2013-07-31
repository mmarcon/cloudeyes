module.exports = function(grunt) {
    grunt.initConfig({
        jasmine_node: {
            specNameMatcher: "spec",
            projectRoot: ".",
            forceExit: true,
            captureExceptions: true,
            jUnit: {
                report: false,
                savePath: "./tests/reports/jasmine/",
                useDotNotation: true,
                consolidate: true
            }
        },
        shell: {
            website: {
                command: 'git subtree push --prefix website/dist origin gh-pages',
                options: {
                    stdout: true
                }
            },
            websitebuild: {
                command: 'grunt',
                options: {
                    stdout: true,
                    execOptions: {
                        cwd: './website'
                    }
                }
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                ignores: [
                    'lib/master.js',
                    'lib/node.js',
                    'lib/probe.js',
                    'lib/report.js'
                ]
            },
            all: ['Gruntfile.js', 'lib/**/*.js', 'test/**/*.js']
        },
        functional_tests: {
            options: {
                stdout: true
            }
        }
    });

    grunt.registerTask('functional_tests', 'Runs Cloudeyes functional tests', function(){
        var done = this.async();
        var runner = require('./tests/functional/runner');
        runner.run(done);
    });

    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('test', ['jshint', 'jasmine_node', 'functional_tests']);
    grunt.registerTask('unit', ['jshint', 'jasmine_node']);
    grunt.registerTask('functional', ['jshint', 'functional_tests']);
    grunt.registerTask('webbuild', 'shell:websitebuild');
    grunt.registerTask('webdeploy', 'shell:website');
};