define([
    "views/main/status_view",
    "parse"
], function(StatusView, Parse){

    var MessageFeedView = Parse.View.extend({
        events: {},

        id: "#message_feed",

        initialize: function () {
            this.render();
            this.collection.on("reset", this.render, this);
            this.collection.clock.on("change:time", this.render, this);
        },
        //functions
        render: function () {
            this.$el.html("");
            this.collection.each(this.addOne, this);
            return this;
        },

        addOne: function (user) {
            var view = new StatusView({
                model: user
            });
            this.$el.append(view.render());
        }
    });

    return MessageFeedView;
});