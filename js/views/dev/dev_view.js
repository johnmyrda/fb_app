define([
    "text!templates/dev/dev_template.html",
    "parse",
    "jquery",
    "underscore"
],function(devTemplate){

    var DevView = Parse.View.extend({

        initialize: function () {
            this.render();
        },

        render: function () {
            this.$el.html(_.template(devTemplate));
            return this;
        }
    });

    return DevView;
});