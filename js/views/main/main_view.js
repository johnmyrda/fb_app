define([
    "collections/friendstatuses_collection",
    "views/main/statusupdate_view",
    "parse"
],function(FriendStatuses, StatusUpdateView){

    var MainView = Parse.View.extend({

        el: "#main",

        initialize: function () {
            var self = this;
            this.friendStatuses = new FriendStatuses();
            this.UserInfo = Parse.User.current().get("UserInfo");
            this.UserInfo.fetch({}).then(function () {
                self.status_update = new StatusUpdateView({
                    model: self.UserInfo,
                    collection: self.friendStatuses
                });
            });
            //this.render();
        },

        render: function () {
            //this.$(".content_container").html(_.template($("#app-header-template").html()));
            //this.delegateEvents();
        }
    });

    return MainView;
});