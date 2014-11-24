//Configuration for requirejs
requirejs.config({
    "baseUrl": "js",
    "paths": {
        jquery: ["//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min", "libraries/jquery-1.11.1"],
        underscore: ["//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min","libraries/underscore"],
        parse: ["http://www.parsecdn.com/js/parse-1.3.1.min","libraries/parse-1.3.1"],
        facebook: ["//connect.facebook.net/en_US/all","libraries/facebook"]
    },
    shim: {
        "parse": {
            exports: "Parse"
        },
        "underscore": {
            exports: "_"
        },
        "facebook":{
            exports: "FB"
        }
    }
    //urlArgs: "bust=" + (new Date()).getTime()
});

requirejs(["app"]);