define([
    "models/state_model",
    "parse",
    "underscore",
    "jquery"
],function(StateModel){


    var HeaderView = Parse.View.extend({

        events: {
            "click #logoutButton": "logOut",

        },

        el: "#header",

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$(".content_container").html(_.template($("#app-header-template").html()));
        },

        logOut: function () {
            StateModel.logOut();
        }

    });

    return HeaderView;
});