define([
    "text!templates/main/message-feed-status_template.html",
    "parse",
    "jquery",
    "underscore"
],function(messageFeedStatusTemplate,Parse, $, _){

    var StatusView = Parse.View.extend({

        template: _.template(messageFeedStatusTemplate),

        events: {},

        className: "user-status",

        initialize: function () {
        },

        getTimestampHTML: function () {
            var timestamp = "";
            var timestampTitle = "";
            var classes = "user-status-timestamp";
            var expirationTime = this.model.getExpirationTime();
            var now = this.model.collection.clock.get("time");
            var timeFree_ms = expirationTime - now;
            if (timeFree_ms <= 0) {
                this.modelJSON['fb_chatLink'] = false;
                classes += " user-status-timestamp-expired";
                timestamp = "expired";
                timestampTitle = ("expired on " + expirationTime.toLocaleString());
            } else {
                var freeHours = parseInt(timeFree_ms / (3600000) % 24, 10);//360000 = 1000 * 60 * 60
                var freeMinutes = parseInt(timeFree_ms / (60000) % 60, 10);//60000  = 1000 * 60
                //building text for timestamp
                timestamp = freeHours + ":" + (freeMinutes < 10 ? "0" : "") + freeMinutes;

                //building title text for timestamp
                timestampTitle = "free for ";
                if (freeHours > 0) {
                    //hoursFree === 1 ? "" : "s"
                    timestampTitle += (freeHours + " hour" + (freeHours === 1 ? "" : "s") + " and ");
                }
                if (freeMinutes > 0 || (freeMinutes === 0 && freeHours > 0)) {
                    timestampTitle += (freeMinutes + " minute" + (freeMinutes === 1 ? "" : "s"));
                } else {
                    timestampTitle += "less than a minute";
                }
            }
            var template = _.template('<div class="<%= classes %>" title="<%= timestampTitle %>"><%= timestamp %></div>');
            return template({
                "timestamp": timestamp,
                "timestampTitle": timestampTitle,
                "classes": classes
            });
        },

        render: function () {
            this.modelJSON = this.model.toJSON();
            this.modelJSON["fb_chatLink"] = true;
            this.modelJSON["timestampHTML"] = this.getTimestampHTML();
            this.modelJSON["desiredActivity"] = _.escape(this.modelJSON["desiredActivity"]);
            if (Parse.User.current().get("authData").facebook.id === this.modelJSON["fb_id"]) {
                this.modelJSON["fb_chatLink"] = false;
                this.modelJSON["fb_name"] = "You";
            }
            //console.log(modelJSON);
            this.$el.html(this.template(this.modelJSON));
            return this.el;
        }
    });

    return StatusView;
});