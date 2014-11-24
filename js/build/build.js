// 1. Install nodejs (it will automatically installs requirejs)

//- assuming the folder structure for your app is:
// app
// 		css
// 		img
// 		js
// 		main.js
// 		index.html
// build
// 		app.build.js
// 		r.js (downloaded from requirejs website)

// 2. the command line to run:
// $ node r.js -o app.build.js
//

({
    paths: {
        jquery: "empty:",
        underscore: "empty:",
        parse: "empty:",
        facebook: "empty:"
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
    },
    baseUrl : "../",
    name: "main",
    out: "main.js",
    removeCombined: true
})