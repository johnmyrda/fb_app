define([
    'parse'
], function(){
    var StateModel = Parse.Object.extend("AppState", {

        defaults: {
            loginStatus: false //True if user is logged in, false if not
        },

        logOut: function () {
            console.log(this.get("loginStatus"));
            Parse.User.logOut();
            this.set({"loginStatus": false});
        }
    });

    return new StateModel();
});