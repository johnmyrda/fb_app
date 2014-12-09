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
    mainConfigFile : "main.js",
    baseUrl : "../",
    name: "main",
    out: "main.js",
    removeCombined: true,
    findNestedDependencies: true
})