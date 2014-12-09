define([
    "keys",
    "parse"
],function(AppKeys, Parse){
        //Initialize Parse SDK with JavaScript keys
        Parse.initialize(AppKeys.parse.appId, AppKeys.parse.jsKey);

        //Initialize Facebook SDK
        Parse.FacebookUtils.init({
            appId: AppKeys.facebook.appId,
            xfbml: false, // parse XFBML
            version: 'v2.1'
        });
});