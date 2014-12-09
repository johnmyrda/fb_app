define([
    "text!templates/404/error-404-template.html",
    "parse",
    "jquery",
    "underscore"
],function(error404Template){

    var Error404View = Parse.View.extend({

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(_.template(error404Template));
            return this;
        }
    });

    return Error404View;
});