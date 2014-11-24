define([
    "views/main/status_view",
    "parse",
    "jquery"
], function(StatusView, Parse, $){

    var MessageFeedView = Parse.View.extend({
        events: {},

        el: $("#message_feed"),

        initialize: function () {
            this.render();
            this.collection.on("reset", this.render, this);
            this.collection.clock.on("change:time", this.render, this);
        },
        //functions
        render: function () {
            $("#message_feed").html("");
            this.collection.each(this.addOne);
        },

        addOne: function (user) {
            var view = new StatusView({
                model: user
            });
            $("#message_feed").append(view.render());
        }
    });

    return MessageFeedView;
});