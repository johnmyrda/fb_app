define([
    "text!templates/main/app-main_template.html",
    "text!templates/main/hours-selector_template.html",
    "parse",
    "jquery",
    "underscore"
],function(appMainTemplate, hoursSelectorTemplate, Parse, $, _){

    var StatusUpdateView = Parse.View.extend({
        events: {
            "click .plusMinusButtons": "alterFreeTime",
            "click #bored_button": "saveStatus",
            "keypress #desired-activity-textarea": "updateOnEnter",
            "blur #desired-activity-textarea": "cacheStatus"
        },

        template: _.template(appMainTemplate),
        subtemplate: _.template(hoursSelectorTemplate),

        id: "findFreeFriends",

        initialize: function () {
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
            self.$el.find("#bored_button").attr("disabled", "disabled");
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
            var self = this;
            //console.log(this.el);
            this.$el.html(this.template);
            require(["plugins/jquery.elastic.min"], function(){
                self.$el.find("#desired-activity-textarea").elastic();
            });
            this.renderHoursSelector();
            return this;
        },

        renderHoursSelector: function () {
            var hoursSelectorHTML = this.subtemplate(this.model.toJSON());
            if(this.$hoursSelector){
                this.$hoursSelector.html(hoursSelectorHTML);
            } else {
                this.$hoursSelector = this.$el.find("#hours_selector").html(hoursSelectorHTML);
            }
        }
    });

    return StatusUpdateView;
});