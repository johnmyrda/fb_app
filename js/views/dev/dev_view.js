define([
    "parse",
    "jquery",
    "underscore"
],function(){

    var DevView = Parse.View.extend({
        el: "#main",

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$(".content_container").html(_.template($("#dev-template").html()));
        }
    });

    return DevView;
});