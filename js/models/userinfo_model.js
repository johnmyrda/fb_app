define([
    'parse'
], function(){
    var UserInfoModel = Parse.Object.extend("UserInfo", {
        defaults: {
            desiredActivity: "",
            hoursFree: 2
        },

        setDefaults: function () {
            //console.log(this);
            if (!this.has("desiredActivity") || !this.has("hoursFree")) {
                this.set("hoursFree", this.defaults.hoursFree);
            }
        },

        //
        getExpirationTime: function () {
            var expirationDate = new Date(this.get("statusUpdatedAt").getTime() + this.get("hoursFree") * 3600000);//60 * 60 * 1000 = 3600000
            return expirationDate;
        }
    },{//classProps

    });

    return UserInfoModel;
});