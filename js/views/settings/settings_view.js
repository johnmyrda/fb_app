define([
    "parse",
    "jquery",
    "underscore"
],function(){

        var SettingsView = Parse.View.extend({
        el: "#main",

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$(".content_container").html(_.template($("#settings-template").html()));
        }
    });

    return SettingsView;
});