$(function() {

    "use strict";

    //Initialize Parse App with JavaScript keys
    Parse.initialize(AppKeys.parse.appId, AppKeys.parse.jsKey);

    //Utility Functions

    //HTML Escaping Function from https://github.com/janl/mustache.js
    //License used by mustache.js is below:
    /*The MIT License

    Copyright (c) 2009 Chris Wanstrath (Ruby)
    Copyright (c) 2010-2014 Jan Lehnardt (JavaScript)

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.*/
    var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
    };

    function escapeHtml(string) {
        return String(string).replace(/[&<>"'\/]/g, function(s) {
            return entityMap[s];
        });
    }

    //Backbone/Parse Structure
    //Models

    var ClockModel = Parse.Object.extend("Clock", {
        initialize: function() {
            var self = this;
            self.set("time", new Date());
            Parse.Cloud.run("getServerTime", {}, {
                success: function(response) {
                    self.set("time", response);
                },
                error: function(error) {
                    console.log(error);
                }
            });
            this.startClock(60000);
        },

        startClock: function(interval) {
            var self = this;
            setInterval(function() {
                self.set("time", new Date(self.get("time").getTime() + interval));
            }, interval);
        }
    });

    var UserInfoModel = Parse.Object.extend("UserInfo", {
        defaults: {
            desiredActivity: "",
            hoursFree: 2
        },

        setDefaults: function() {
            //console.log(this);
            if (!this.has("desiredActivity") || !this.has("hoursFree")) {
                this.set("hoursFree", this.defaults.hoursFree);
            }
        },

        getExpirationTime: function() {
            var expirationDate = new Date(this.get("statusUpdatedAt").getTime() + this.get("hoursFree") * 60 * 60 * 1000);
            return expirationDate;
        }
    });

    //Collections

    //collection of statuses from fb friends - includes self
    var FriendStatuses = Parse.Collection.extend({
        model: UserInfoModel,

        comparator: function(model) {
            return (-1 * model.get("statusUpdatedAt").getTime());
        },

        initialize: function() {
            var self = this;
            this.clock = new ClockModel();
            FB.api("/me/friends?fields=id", function(response) {
                if (response.data) {
                    var fb_friend_ids = [];
                    $.each(response.data, function(index, friend) {
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

    //Views
    var LogInView = Parse.View.extend({
        events: {
            "click #loginButton": "logIn"
        },

        el: "#global_container",

        initialize: function() {
            _.bindAll(this, "logIn");
            this.render();
        },

        logIn: function() {
            var self = this;
            Parse.FacebookUtils.logIn("user_friends", {
                success: function(user) {
                    Parse.User.current().save().then(function() {
                        return Parse.Cloud.run("initUser", {});
                    }).then(function() {
                        return Parse.User.current().fetch({});
                    }).then(function() {
                        new MainView();
                        self.undelegateEvents();
                        //delete self; //I need to figure out how to do backbone memory management properly. This comment intentionally left long and obnoxious.
                        return;
                    }, function(error) {
                        console.log(error);
                    });
                },
                error: function(user, error) {
                    console.log("User cancelled the Facebook login or did not fully authorize.");
                }
            });

            return false;
        },

        render: function() {
            $("#header .content_container").html(_.template($("#login-header-template").html()));
            $("#main .content_container").html(_.template($("#login-main-template").html()));
            //this.delegateEvents();
        }
    });

    var statusUpdateView = Parse.View.extend({
        events: {
            "click .plusMinusButtons": "alterFreeTime",
            "click #bored_button": "saveStatus",
            "keypress #desired-activity-textarea": "updateOnEnter",
            "blur #desired-activity-textarea": "cacheStatus"
        },

        template: _.template($("#app-main-template").html()),
        subtemplate: _.template($("#hours_selector-template").html()),

        id: "findFreeFriends",

        initialize: function() {
            this.model.setDefaults();
            this.render();
            this.message_feed = new messageFeedView({
                collection: this.collection
            });
            this.model.on("change:hoursFree", this.renderHoursSelector, this);
        },

        // If you hit `enter`, upload the status.
        updateOnEnter: function(e) {
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

        cacheStatus: function() {
            this.model.set("desiredActivity", $("#desired-activity-textarea").val());
        },

        saveStatus: function() {
            this.cacheStatus();
            var self = this;
            self.$("#bored_button").attr("disabled", "disabled");
            this.model.save({
                success: function() {
                    self.$("#bored_button").removeAttr("disabled");
                    self.collection.fetch({});
                },
                error: function(error) {
                    self.$("#bored_button").removeAttr("disabled");
                }
            });
        },

        alterFreeTime: function(event) {
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

        render: function() {
            $(this.el).html(this.template());
            $("#main .content_container").html(this.el);
            $("#desired-activity-textarea").elastic();
            $("#hours_selector").html(this.subtemplate(this.model.toJSON()));
        },

        renderHoursSelector: function() {
            $("#hours_selector").html(this.subtemplate(this.model.toJSON()));
        }
    });

    var statusView = Parse.View.extend({

        template: _.template($("#message_feed-status-template").html()),

        events: {},

        className: "user-status",

        intialize: function() {},

        getTimestampHTML: function() {
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

        render: function() {
            this.modelJSON = this.model.toJSON();
            this.modelJSON["fb_chatLink"] = true;
            this.modelJSON["timestampHTML"] = this.getTimestampHTML();
            this.modelJSON["desiredActivity"] = escapeHtml(this.modelJSON["desiredActivity"]);
            if (Parse.User.current().get("authData").facebook.id === this.modelJSON["fb_id"]) {
                this.modelJSON["fb_chatLink"] = false;
                this.modelJSON["fb_name"] = "You";
            }
            //console.log(modelJSON);
            $(this.el).html(this.template(this.modelJSON));
            return this.el;
        }
    });

    var messageFeedView = Parse.View.extend({
        events: {

        },

        el: $("#message_feed"),

        initialize: function() {
            this.render();
            this.collection.on("reset", this.render, this);
            this.collection.clock.on("change:time", this.render, this);
        },
        //functions
        render: function() {
            $("#message_feed").html("");
            this.collection.each(this.addOne);
        },

        addOne: function(user) {
            var view = new statusView({
                model: user
            });
            $("#message_feed").append(view.render());
        }
    });


    var MainView = Parse.View.extend({
        events: {
            "click #logoutButton": "logOut"
        },

        el: "#global_container",

        initialize: function() {
            var self = this;
            this.friendStatuses = new FriendStatuses();
            this.UserInfo = Parse.User.current().get("UserInfo");
            this.UserInfo.fetch({}).then(function() {
                self.status_update = new statusUpdateView({
                    model: self.UserInfo,
                    collection: self.friendStatuses
                });
            });
            this.render();
        },

        logOut: function() {
            Parse.User.logOut();
            new LogInView();
            this.undelegateEvents();
            //delete this;//I need to figure out how to do backbone memory management properly. This comment intentionally left long and obnoxious.
        },

        render: function() {
            $("#header .content_container").html(_.template($("#app-header-template").html()));
            //this.delegateEvents();
        }
    });

    var AppView = Parse.View.extend({
        // Instead of generating a new element, bind to the existing skeleton of
        // the App already present in the HTML.
        el: $("#global_container"),

        initialize: function() {
            var self = this;
            window.fbAsyncInit = function() {
                Parse.FacebookUtils.init({
                    appId: AppKeys.facebook.appId, // App ID
                    xfbml: false, // parse XFBML
                    version: 'v2.1'
                });
                self.render();
            };
        },

        render: function() {
            FB.getLoginStatus(function(response) {
                if (response.status === "connected" && Parse.User.current() && Parse.User.current().get("authData").facebook.id === response.authResponse.userID) {
                    new MainView();
                } else {
                    Parse.User.logOut();
                    new LogInView();
                }
            });
        }
    });

    //Router
    //not yet implemented - will be used when app has multiple pages

    //Start the App
    new AppView();
});