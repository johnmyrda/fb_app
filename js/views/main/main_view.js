define([
    "collections/friendstatuses_collection",
    "views/main/statusupdate_view",
    "views/main/messagefeed_view",
    "parse"
],function(FriendStatuses, StatusUpdateView, MessageFeedView){

    var MainView = Parse.View.extend({

        initialize: function () {
            var self = this;
            this.friendStatuses = new FriendStatuses();
            Parse.User.current().get("UserInfo").fetch( {
                success: function(object){
                    console.log(object);
                    self.UserInfo = object;
                    self.statusUpdateView = new StatusUpdateView({model: self.UserInfo, collection: self.friendStatuses});
                    self.messageFeedView = new MessageFeedView({collection: self.friendStatuses});
                    self.render();
                },
                error: function(object, error){
                    console.log(error);
                }
            });
        },

        render: function () {
            this.$el.append(this.statusUpdateView.render().$el);
            this.$el.append(this.messageFeedView.render().$el);
            return this;
        }
    });

    return MainView;
});