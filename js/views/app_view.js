define([
    "views/main/header_view",
    "parse",
    "jquery"
],function(HeaderView){

    var AppView = Parse.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#global_container"),

        events: {},

        initialize: function () {
            this.options.subHeader = this.options.subHeader || HeaderView;
            this.render();
        },

        render: function () {
            new this.options.subHeader();
            new this.options.subView();
        }

    });

    return AppView;
});