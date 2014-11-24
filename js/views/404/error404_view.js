define([
    "parse",
    "jquery",
    "underscore"
],function(){

    var Error404View = Parse.View.extend({
        el: "#main",

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$(".content_container").html(_.template($("#error-404-template").html()));
        }
    });

    return Error404View;
});