define([
    'parse',
    'facebook'
], function(){
    var StateModel = Parse.Object.extend("AppState", {

        defaults: {
            loginStatus: false //True if user is logged in, false if not
            ,init: false
        },

        init: function(){
        },

        determineLoginStatus: function (callback, options){
            var self = this;
            //FB.getLoginStatus is Async. Be Careful.
            FB.getLoginStatus(function (response) {
                if (response.status === "connected" && Parse.User.current() && Parse.User.current().get("authData").facebook.id === response.authResponse.userID) {
                    self.set("loginStatus", true);
                } else {
                    self.logOut();
                }
                if(callback && typeof(callback) === "function"){
                    if(!options){
                        options = {};
                    }
                    //console.log(callback, options);
                    callback();
                }
            });
        },

        logOut: function () {
            //console.log(this.get("loginStatus"));
            Parse.User.logOut();
            this.set({"loginStatus": false});
        }
    },{//classProps

    });

    return new StateModel();
});