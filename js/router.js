define([
    "models/state_model",
    "views/main/main_view", "views/header/header_view",
    "views/login/loginmain_view",
    "views/settings/settings_view", "views/dev/dev_view", "views/404/error404_view",
    "views/app_view"
],function(StateModel, MainView, HeaderView,
           LoginMainView,
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
            this.AppView = new AppView();
            this.model = StateModel;
        },

        home: function () {
            this.AppView.gotoView(MainView);
        },

        login: function () {
            this.AppView.gotoView(LoginMainView);
        },

        dev: function () {
            this.AppView.gotoView(DevView);
        },

        settings: function () {
            this.AppView.gotoView(SettingsView);
        },

        error404: function () {
            this.AppView.gotoView(Error404View);
        },

        route: function (route, name, callback) {

            //Parse.Router.prototype.route(route, name, callback);
            var login = this.login;
            var new_callback = function () {
                if (StateModel.get("loginStatus") === false) {
                    return login.call(this);
                } else {
                    return callback.call(this);
                }
            };
            //console.log(this);
            return Parse.Router.prototype.route.call(this, route, name, new_callback);
        }

    });

    return AppRouter;
});