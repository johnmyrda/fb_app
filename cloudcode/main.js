//For use with Parse Cloud Code - see https://parse.com/docs/cloud_code_guide
//Validation, metadata creation, and security for some fields
Parse.Cloud.beforeSave("UserInfo", function(request, response) {
    //if the status has been updated in any way, the time that the update occurred is saved
    //also, validate input for certain fields
    var dirtyKeys = request.object.dirtyKeys();
    for (index in dirtyKeys) {
        var dirtyKey = dirtyKeys[index];
        
        //validate "hoursFree" value
        if(dirtyKey === "hoursFree"){
            if(request.object.get("hoursFree") < 0 || request.object.get("hoursFree") >= 24){
                response.error("Invalid value entered for hoursFree");
                return;
            }            
        }
        
        //validate "desiredActivity" value
        if(dirtyKey === "desiredActivity"){
            if(request.object.get("desiredActivity").length > 200){
                request.object.set("desiredActivity", request.object.get("desiredActivity").substring(0, 197) + "...")
            }
        }
       
        if(dirtyKey === "hoursFree" || dirtyKey === "desiredActivity") {
            var updatedAt = new Date();
            request.object.set("statusUpdatedAt", updatedAt);
        }
    }
    response.success();
});

Parse.Cloud.define("getServerTime", function(request, response) {
    var nowish = new Date();
    response.success(nowish);
});

function fbSync(currentUser) {
        var authData = currentUser.get('authData');
        var UserInfoObject = currentUser.get('UserInfo');
        var fbGraphApiUrl = 'https://graph.facebook.com/v2.1/me?fields=id,name,first_name&access_token='+ authData.facebook.access_token;
        return Parse.Cloud.httpRequest({url: fbGraphApiUrl}).then(function(httpResponse){
            var fbData = httpResponse.data;
            var fbUserInfo = {fb_id: fbData.id, fb_firstName: fbData.first_name, fb_name: fbData.name};
            return UserInfoObject.save(fbUserInfo);
        }).then(function(UserInfo){
            return UserInfo;
        });
}

//initUser - Function to be called upon login to the application
//to ensure appropriate user objects exist and that Facebook data is in sync
//accepts a user object as the request object
Parse.Cloud.define("initUser", function(request, response) {
    var user = request.user;
    if (!user.has("UserInfo")){
        var UserInfo = Parse.Object.extend("UserInfo");
        var UserInfoObject = new UserInfo();
        UserInfoObject.save().then(function(UserInfoObject) {
                return user.save("UserInfo", UserInfoObject);
            }).then(function(currentUser) {
                return fbSync(currentUser);
            }).then(function(UIO) {
                return response.success(UIO);                
            },
            function(error){
                response.error(error);
            });
    } else {
        fbSync(user).then(function(UIO){
            response.success(UIO);
        },
        function(error){
            response.error(error);
        });
    }
});