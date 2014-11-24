define(["jquery", "keys", "parse", "facebook",
         "models/state_model", "router"],
function($, AppKeys, Parse, FB, StateModel, AppRouter) {
    (function () {

        "use strict";


        //Initialize Parse SDK with JavaScript keys
        Parse.initialize(AppKeys.parse.appId, AppKeys.parse.jsKey);

        //Initialize Facebook SDK
        Parse.FacebookUtils.init({
            appId: AppKeys.facebook.appId, // App ID
            xfbml: false, // parse XFBML
            version: 'v2.1'
        });

        //Start the App
        FB.getLoginStatus(function (response) {
            if (response.status === "connected" && Parse.User.current() && Parse.User.current().get("authData").facebook.id === response.authResponse.userID) {
                StateModel.set("loginStatus", true);
            } else {
                StateModel.logOut();
            }
            new AppRouter();
            Parse.history.start({pushState: true});
        });

    })();
});