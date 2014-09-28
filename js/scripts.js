$(function() {

    //Grab app keys from seperate files
    $.getScript("js/keys.js");

    //Initialize Parse App with JavaScript keys
    Parse.initialize(parseKeys.appId, parseKeys.jsKey);

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
        return String(string).replace(/[&<>"'\/]/g, function (s) {
            return entityMap[s];
        });
    }
    
    //Backbone/Parse Structure
    //Models
    
    var UserInfoModel = Parse.Object.extend("UserInfo",{
        defaults: {
            desiredActivity: "",
            hoursFree: 2
        },
        setDefaults: function() {
            if(!this.has("desiredActivity")){
                this.set("hoursFree", this.defaults.hoursFree);
            }
        }
    });
    
    var UserStatus = Parse.Object.extend("UserStatus",{
    // Default attributes for the User.
    defaults: {
      desiredActivity: "",
      hoursFree: 2
    },

    initialize: function() {
      if (Parse.User.current().has("hoursFree")) {
        this.set("hoursFree", Parse.User.current().get("hoursFree"));
      }
      this.fb_sync();
    },
    //update function will take whatever the current state of the model is and upload it to the server
    upload: function( options ) {
        console.log(this.toJSON());
        Parse.User.current().save(this.toJSON(), {
            success: function(current_user) {
                if(_.has(options, "success")){
                    options.success();
                }
            // the object saved successfully
            },
            error: function(current_user, error) {
                console.log(error);
                if(_.has(options, "error")){
                    options.error(error);
                }
            //the save failed.
            //error is a Parse.Error with an error code
            }
        });
    },
    //sync function will download the most recent version of the model from the server based on timestamps
    sync: function () {},
    fb_sync: function( ) {
        FB.api("/me?fields=id,first_name,name", function(response){
            if(response){
                fb_data = {fb_id: response.id, fb_name: response.name, fb_firstname: response.first_name};
                //Parse.User.current().set(fb_data);
                Parse.User.current().save(fb_data, {
                    success: function(current_user) {
                        //if(_.has(options, "success")){
                        //    options.success();
                        //}
                    // the object saved successfully
                    },
                    error: function(current_user, error) {
                        console.log(error);
                        //if(_.has(options, "error")){
                        //    options.error(error);
                        //}
                    //the save failed.
                    //error is a Parse.Error with an error code
                    }
                });
            }else{
                console.log(response.error);
            }
        });
    }
  });
  
    
    //Collections

    var FriendStatuses = Parse.Collection.extend({
        model: UserInfoModel,
        initialize: function() {
            var self = this;
            FB.api("/me/friends?fields=id", function(response){
                if(response.data){
                    var fb_friend_ids = []
                    $.each(response.data, function(index, friend) {
                        fb_friend_ids.push(friend.id);
                    });
                    fb_friend_ids.push(Parse.User.current().get("fb_id"));
                    self.query = new Parse.Query(UserInfoModel);
                    self.query.exists("desiredActivity");
                    self.query.containedIn("fb_id", fb_friend_ids);
                    self.fetch({});
                    //console.log(self);
                }else{
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
        self = this;
        Parse.FacebookUtils.logIn( "user_friends", {
            success: function(user) {
                new MainView();
                self.undelegateEvents();
                delete self;               
            },
            error: function(user, error){
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
            "keypress #desired_activity_textarea": "updateOnEnter",
            "blur #desired_activity_textarea": "cacheStatus"
        },
        
        template: _.template($("#app-main-template").html()),
        subtemplate: _.template($("#hours_selector-template").html()),
        
        id: "findFreeFriends",
        
        initialize: function() {
            this.render();
            this.message_feed = new messageFeedView({collection: this.collection});            
            this.model.on("change:hoursFree", this.renderHoursSelector, this);
        },
        
        // If you hit `enter`, upload the status.
        updateOnEnter: function(e) {
            if (e.keyCode == 13) {
                if(e.shiftKey === false){
                    if(this.$("#bored_button").is(":disabled")){
                        return false;
                    }
                    this.saveStatus();
                    return false;
                }
            }
        },
        
        cacheStatus: function(){
            this.model.set("desiredActivity", $("#desired_activity_textarea").val());
        },
        
        saveStatus: function() {
            this.cacheStatus();
            self = this;
            self.$("#bored_button").attr("disabled", "disabled");
            this.model.save({
                success: function() {
                    self.$("#bored_button").removeAttr("disabled");
                    self.collection.fetch({});
                },
                error : function (error){
                    self.$("#bored_button").removeAttr("disabled");
                }
            });
        },
        
        alterFreeTime: function(event) {
            //function specific
            var lower_bound = .5;
            var upper_bound = 9;
            var increment = .5;
            //user data to be modified
            var currentHoursFree = Number(this.model.get("hoursFree"));
            
            var button_id = event.currentTarget.id;
            if(button_id === "plus_button"){
                this.model.set("hoursFree", Math.min(upper_bound, (currentHoursFree + increment)));
            }
            if(button_id === "minus_button"){
                this.model.set("hoursFree", Math.max(lower_bound, (currentHoursFree - increment)));
            }
        },

        render: function() {
            $(this.el).html(this.template());
            $("#main .content_container").html(this.el);
            $("#desired_activity_textarea").elastic();
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
        
        intialize: function() {
        },
        
        render: function() {
            modelJSON = this.model.toJSON();
            modelJSON["desiredActivity"] = escapeHtml(modelJSON["desiredActivity"]);
            $(this.el).html(this.template(modelJSON));
            return this.el;
        }
    });
    
    var messageFeedView = Parse.View.extend({
        events: {
            
        },
        
        el: $("#message_feed"),
        
        initialize: function() {
            //console.log(this.collection.length);
            this.refreshFeed();
            this.collection.on("reset", this.refreshFeed, this);
        },
        //functions
        render: function(){
            console.log("messageFeedView Rendered");
        },
        
        refreshFeed: function() {
            //console.log("refreshFeed");
            //console.log(this);
            $("#message_feed").html("");
            this.collection.each(this.addOne);
        },
        
        addOne: function(user) {
            var view = new statusView({model: user});
            this.$("#message_feed").append(view.render());
        }
    });

    
    var MainView = Parse.View.extend({
        events: {
            "click #logoutButton": "logOut"
        },
    
        el: "#global_container",
        
        initialize: function() {
            self = this;
            Parse.Cloud.run("initUser", {}, {
                success: function(UserInfo) {
                    UserInfo.fetch().then( function(stuff){
                        UserInfo.setDefaults();
                        self.UserInfo = UserInfo;
                        self.friendStatuses = new FriendStatuses;
                        self.status_update = new statusUpdateView({model: self.UserInfo, collection: self.friendStatuses});
                    });
                },
                error: function(error) {
                    console.log(error);
                }
            });
            self.render();
        },
    
        logOut: function() {
            Parse.User.logOut();
            new LogInView();
            this.undelegateEvents();
            delete this;
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
            self = this;
            //new AppUser();
            window.fbAsyncInit = function(){
                Parse.FacebookUtils.init({
                    appId      : fbKeys.appId, // App ID
                    xfbml      : false,  // parse XFBML
                    version    : 'v2.1'
                });
                self.render();
            };
        },

        render: function() {
            FB.getLoginStatus(function(response) {
                if (response.status == "connected" && Parse.User.current()){
                    new MainView();
                } else {
                    new LogInView();
                }
            });
        }
    });
    
    //Router
    
    //Start the App
    new AppView;

});