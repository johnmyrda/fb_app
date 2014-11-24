define([
    "models/state_model",
    "parse",
    "jquery",
    "underscore"
],function(StateModel){



    var LoginHeaderView = Parse.View.extend({

        events: {
            "click #loginButton": "logIn"
        },

        el: "#header",

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$(".content_container").html(_.template($("#login-header-template").html()));
        },

        logIn: function () {
            var self = this;
            Parse.FacebookUtils.logIn("user_friends", {
                success: function (user) {
                    Parse.User.current().save().then(function () {
                        return Parse.Cloud.run("initUser", {});
                    }).then(function () {
                        return Parse.User.current().fetch({});
                    }).then(function () {
                        StateModel.set("loginStatus", true);
                        //self.undelegateEvents();
                        //delete self; //I need to figure out how to do backbone memory management properly. This comment intentionally left long and obnoxious.
                        return;
                    }, function (error) {
                        console.log(error);
                    });
                },
                error: function (user, error) {
                    console.log("User cancelled the Facebook login or did not fully authorize.");
                }
            });

            return false;
        }
    });

    return LoginHeaderView;
});