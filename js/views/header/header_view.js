define([
    "../../models/state_model",
    "text!templates/header/header_template.html",
    "text!templates/header/app-header_template.html",
    "text!templates/header/login-header_template.html",
    "parse",
    "underscore",
    "jquery"
],function(StateModel, headerTemplate, appHeaderTemplate, loginHeaderTemplate){


    var HeaderView = Parse.View.extend({

        events: {
            "click #logoutButton": "logOut",
            "click #loginButton": "logIn",
            "click .app-link-home": "navHome"
        },

        //el: "#header",

        initialize: function () {
            this.render();
            this.model = StateModel;
            this.model.on("change:loginStatus", this.renderNav, this);
        },

        render: function () {
            this.$el.html(_.template(headerTemplate));
            return this;
        },

        renderNav: function(){
            this.undelegateEvents();
            var nav = this.$el.find("#header-nav");
            nav.html("");
            if(StateModel.get("loginStatus") === true){
                nav.html(_.template(appHeaderTemplate));
            } else {
                nav.html(_.template(loginHeaderTemplate));
            }
            this.delegateEvents();
        },

        logOut: function () {
            StateModel.logOut();
            Parse.history.loadUrl("");
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
                        Parse.history.loadUrl("");
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
        },

        navHome: function(){
            console.log(Parse.history.getFragment());
            if(Parse.history.getFragment() === ""){
                Parse.history.loadUrl("");
            } else {
                Parse.history.navigate("", {trigger: true});
            }
        }

    });

    return HeaderView;
});