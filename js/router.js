define([
    "models/state_model",
    "views/main/main_view", "views/main/header_view",
    "views/login/loginheader_view", "views/login/loginmain_view",
    "views/settings/settings_view", "views/dev/dev_view", "views/404/error404_view",
    "views/app_view"
],function(StateModel, MainView, HeaderView,
           LoginHeaderView, LoginMainView,
           SettingsView, DevView, Error404View,
           AppView){

    var AppRouter = Parse.Router.extend({

        routes: {
            "": "home",
            //"login":"login",
            "dev": "dev",
            "settings": "settings",
            "*404": "error404"
        },

        initialize: function () {
            this.model = StateModel;
            this.model.on("change:loginStatus", this.nav, this);
        },

        nav: function () {
            console.log("router.nav");
            if (StateModel.get("loginStatus") === false) {
                this.login();
            } else {
                this.home();
            }
        },

        home: function () {
            new AppView({subView: MainView});
        },

        login: function () {
            new AppView({subView: LoginMainView, subHeader: LoginHeaderView});
        },

        dev: function () {
            new AppView({subView: DevView});
        },

        settings: function () {
            new AppView({subView: SettingsView});
        },

        error404: function () {
            new AppView({subView: Error404View});
        },

        route: function (route, name, callback) {

            //Parse.Router.prototype.route(route, name, callback);
            var login = this.login;
            var new_callback = function () {
                //console.log(name);
                if (StateModel.get("loginStatus") === false) {
                    return login();
                } else {
                    return callback();
                }
            };
            //console.log(callback);
            return Parse.Router.prototype.route(route, name, new_callback);
        }

    });

    return AppRouter;
});