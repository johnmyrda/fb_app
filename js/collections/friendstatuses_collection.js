define([
    "models/userinfo_model",
    "models/clock_model",
    "parse",
    "facebook"
],function(UserInfoModel, ClockModel){

    //collection of statuses from fb friends - includes self
    var FriendStatuses = Parse.Collection.extend({
        model: UserInfoModel,

        comparator: function (model) {
            return (-1 * model.get("statusUpdatedAt").getTime());
        },

        initialize: function () {
            this.clock = new ClockModel();
            this.FBQuery();
        },

        FBQuery: function(){
            var self = this;
            FB.api("/me/friends?fields=id", function (response) {
                if (response.data) {
                    var fb_friend_ids = [];
                    $.each(response.data, function (index, friend) {
                        fb_friend_ids.push(friend.id);
                    });
                    fb_friend_ids.push(Parse.User.current().get("authData").facebook.id);
                    self.query = new Parse.Query(UserInfoModel);
                    self.query.exists("desiredActivity");
                    self.query.containedIn("fb_id", fb_friend_ids);
                    self.fetch({});
                    //console.log(self);
                } else {
                    console.log(response.error);
                }
            });
        }
    });

    return FriendStatuses;
});