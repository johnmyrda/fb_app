define([
    "text!templates/login/login-main_template.html",
    "parse",
    "jquery",
    "underscore"
],function(loginMainTemplate){

    var LoginMainView = Parse.View.extend({

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(_.template(loginMainTemplate));
            return this;
        }
    });

    return LoginMainView;
});