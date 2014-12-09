define([
    "views/header/header_view",
    "parse",
    "jquery"
],function(HeaderView){

    var AppView = Parse.View.extend({

        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: "#global_container",

        events: {},

        initialize: function () {
            this.headerElement = $("#header");
            this.HeaderView = new HeaderView({className: "content_container"});
            this.headerElement.append(this.HeaderView.$el);

            this.mainElement = $("#main");
            this.MainView = false;
        },

        render: function () {
        },

        gotoView: function(view){
            //console.log(view);
            if(this.MainView){
                this.MainView.remove();
                this.MainView.unbind();
            }
            this.MainView = new view({className: "content_container"});
            this.mainElement.append(this.MainView.$el);

        }

    });

    return AppView;
});