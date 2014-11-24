define([
    "parse",
    "jquery",
    "underscore"
],function(){

    var LoginMainView = Parse.View.extend({
        el: "#main",

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$(".content_container").html(_.template($("#login-main-template").html()));
        }
    });

    return LoginMainView;
});