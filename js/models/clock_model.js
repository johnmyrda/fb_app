define([
    'parse'
], function(){
    var ClockModel = Parse.Object.extend("Clock", {
        initialize: function () {
            var self = this;
            self.set("time", new Date());
            Parse.Cloud.run("getServerTime", {}, {
                success: function (response) {
                    self.set("time", response);
                },
                error: function (error) {
                    console.log(error);
                }
            });
            this.startClock(60000);
        },

        startClock: function (interval) {
            var self = this;
            setInterval(function () {
                self.set("time", new Date(self.get("time").getTime() + interval));
            }, interval);
        }
    });

    return ClockModel;
});