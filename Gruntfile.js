module.exports = function(grunt) {
    grunt.initConfig({
        jasmine_node: {
            specFolders: ["./tests/specs"],
            specNameMatcher: "spec", // load only specs containing specNameMatcher
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
            }
        }
    });

    grunt.loadNpmTasks('grunt-jasmine-node');
    grunt.loadNpmTasks('grunt-shell');

    grunt.registerTask('test', 'jasmine_node');
    grunt.registerTask('website', 'shell:website');
};