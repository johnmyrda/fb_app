define(["parse", "keys",
         "models/state_model", "router"],
function(Parse, AppKeys, StateModel, AppRouter) {
    "use strict";

    //Initialize Parse SDK with JavaScript keys
    Parse.initialize(AppKeys.parse.appId, AppKeys.parse.jsKey);

    //Initialize Facebook SDK
    Parse.FacebookUtils.init({
        appId: AppKeys.facebook.appId,
        xfbml: false, // parse XFBML
        version: 'v2.1'
    });

    //Start the App
    new AppRouter();
    StateModel.determineLoginStatus(function(){
        Parse.history.start({pushState: true});
    });
});