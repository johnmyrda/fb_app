define([
    "text!templates/settings/settings_template.html",
    "parse",
    "jquery",
    "underscore"
],function(settingsTemplate){

    var SettingsView = Parse.View.extend({

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(_.template(settingsTemplate));
            return this;
        }
    });

    return SettingsView;
});