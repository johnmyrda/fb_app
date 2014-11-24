define([
    "views/main/messagefeed_view",
    "parse",
    "jquery",
    "underscore"
],function(MessageFeedView, Parse, $, _){

    var StatusUpdateView = Parse.View.extend({
        events: {
            "click .plusMinusButtons": "alterFreeTime",
            "click #bored_button": "saveStatus",
            "keypress #desired-activity-textarea": "updateOnEnter",
            "blur #desired-activity-textarea": "cacheStatus"
        },

        template: _.template($("#app-main-template").html()),
        subtemplate: _.template($("#hours_selector-template").html()),

        id: "findFreeFriends",

        initialize: function () {
            this.model.setDefaults();
            this.render();
            this.message_feed = new MessageFeedView({
                collection: this.collection
            });
            this.model.on("change:hoursFree", this.renderHoursSelector, this);
        },

        // If you hit `enter`, upload the status.
        updateOnEnter: function (e) {
            if (e.keyCode === 13) {
                if (e.shiftKey === false) {
                    if (this.$("#bored_button").is(":disabled")) {
                        return false;
                    }
                    this.saveStatus();
                    return false;
                }
            }
        },

        cacheStatus: function () {
            this.model.set("desiredActivity", $("#desired-activity-textarea").val());
        },

        saveStatus: function () {
            this.cacheStatus();
            var self = this;
            self.$("#bored_button").attr("disabled", "disabled");
            this.model.save({
                success: function () {
                    self.$("#bored_button").removeAttr("disabled");
                    self.collection.fetch({});
                },
                error: function (error) {
                    self.$("#bored_button").removeAttr("disabled");
                }
            });
        },

        alterFreeTime: function (event) {
            //function specific
            var lower_bound = 0.5;
            var upper_bound = 9;
            var increment = 0.5;
            //user data to be modified
            var currentHoursFree = Number(this.model.get("hoursFree"));

            var button_id = event.currentTarget.id;
            if (button_id === "plus_button") {
                this.model.set("hoursFree", Math.min(upper_bound, (currentHoursFree + increment)));
            }
            if (button_id === "minus_button") {
                this.model.set("hoursFree", Math.max(lower_bound, (currentHoursFree - increment)));
            }
        },

        render: function () {
            $(this.el).html(this.template());
            $("#main .content_container").html(this.el);
            require(["plugins/jquery.elastic.min"], function(){
                $("#desired-activity-textarea").elastic();
            });
            $("#hours_selector").html(this.subtemplate(this.model.toJSON()));
        },

        renderHoursSelector: function () {
            $("#hours_selector").html(this.subtemplate(this.model.toJSON()));
        }
    });

    return StatusUpdateView;
});