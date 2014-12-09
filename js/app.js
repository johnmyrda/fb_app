define(["parse",
         "models/state_model", "router"],
function(Parse, StateModel, AppRouter) {
        "use strict";

        //Start the App
        new AppRouter();
        StateModel.determineLoginStatus(function(){
            Parse.history.start({pushState: true});
        });
});