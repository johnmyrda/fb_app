//Configuration for requirejs
requirejs.config({
    //"baseUrl": "js",
    "paths": {
        "jquery": "libraries/jquery-1.11.1",//"//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min"
        "underscore": "libraries/underscore",//"//cdnjs.cloudflare.com/ajax/libs/underscore.js/1.7.0/underscore-min"
        "parse": "libraries/parse-1.3.1",//"http://www.parsecdn.com/js/parse-1.3.1.min"
        "facebook": "libraries/facebook"//"//connect.facebook.net/en_US/sdk"
    },
    shim: {
        "parse": {
            exports: "Parse",
            deps: ["facebook", "jquery"]
        },
        "underscore": {
            exports: "_"
        },
        "facebook":{
            exports: "FB"
        },
        "app":{
            "deps": ["facebook, parse"]
        }
    }
    //urlArgs: "bust=" + (new Date()).getTime()
});

requirejs(["app"]);