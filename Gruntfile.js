/*
 * Copyright (C) 2015 OpenSeadragon contributors
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * - Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * - Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * - Neither the name of OpenSeadragon nor the names of its contributors
 *   may be used to endorse or promote products derived from this software
 *   without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
module.exports = function (grunt) {

    // ----------
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-compress");
    grunt.loadNpmTasks("grunt-jpm");
    grunt.loadNpmTasks("grunt-crx");

    // ----------
    // Project configuration.
    grunt.initConfig({
        clean: {
            build: ["build"],
            chromium: ["build/chromium"],
            firefox: ["build/firefox"]
        },
        watch: {
            files: ["Gruntfile.js", "chromium/*", "firefox/*", "common/*"],
            tasks: "watchTask"
        },
        jpm: {
            options: {
                src: "build/firefox",
                xpi: "build"
            }
        },
        crx: {
            crx: {
                "src": "build/chromium/**/*",
                "dest": "build",
                "options": {
                    "privateKey": "../openseadragonizer.pem"
                }
            }
        },
        compress: {
            chromium: {
                options: {
                    archive: "build/chromium.zip"
                },
                files: [{
                        expand: true,
                        cwd: "build/chromium",
                        src: ["**/*"],
                        dest: ""
                    }
                ]
            }
        }
    });

    // ----------
    // Watch task.
    // Called from the watch feature; does a full build or a particular browser build,
    // depending on whether you used --browsername on the command line.
    grunt.registerTask("watchTask", function () {
        if (grunt.option('chromium')) {
            grunt.task.run("build:chromium");
        } else if (grunt.option('firefox')) {
            grunt.task.run("build:firefox");
        } else {
            grunt.task.run("build");
        }
    });

    // ----------
    // Chromium build task.
    grunt.registerTask("build:chromium", function () {
        grunt.file.recurse("common", function (abspath, rootdir, subdir, filename) {
            subdir = subdir ? subdir + "/" : "";
            grunt.file.copy(abspath, "build/chromium/" + subdir + filename);
        });
        grunt.file.recurse("chromium", function (abspath, rootdir, subdir, filename) {
            subdir = subdir ? subdir + "/" : "";
            grunt.file.copy(abspath, "build/chromium/" + subdir + filename);
        });
        grunt.task.run("compress:chromium");
    });

    // ----------
    // Firefox build task.
    grunt.registerTask("build:firefox", function () {
        grunt.file.recurse("common", function (abspath, rootdir, subdir, filename) {
            subdir = subdir ? subdir + "/" : "";
            grunt.file.copy(abspath, "build/firefox/data/" + subdir + filename);
        });
        grunt.file.recurse("firefox", function (abspath, rootdir, subdir, filename) {
            subdir = subdir ? subdir + "/" : "";
            grunt.file.copy(abspath, "build/firefox/" + subdir + filename);
        });
        grunt.file.copy("build/firefox/data/logo48.png", "build/firefox/icon.png");
        grunt.task.run("jpm:xpi");
    });

    // ----------
    // Full build task.
    grunt.registerTask("build", ["clean", "build:chromium", "build:firefox"]);

    // ----------
    // Default task.
    // Does a normal build.
    grunt.registerTask("default", ["build"]);
};
