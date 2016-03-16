#!/usr/bin/env node
var a=require('ejabberd-auth');
var l=a.logger;
var request = require('request');
var nconf   = require('nconf').env().argv();

nconf.defaults({
    hardcoded: {
    }    
});

a.run({
    log: {
        filename: __dirname+"/auth.log",
        level: 'warn'
    },
    actions: {
        auth: function(done, userName, domain, password) {
            l.log('warn', "authV3", arguments);
            
            if (nconf.get("hardcoded") && nconf.get("hardcoded")[userName] && nconf.get("hardcoded")[userName]==password) {
              // this is for bots, eg. skynet
              return done(true);
            }
            var headers = {
                "Authorization": userName+":"+password
            };
            request.get("https://auth.oss.rocks/api/authorize", {headers: headers}, function(err, res, body) {
                if (res && res.statusCode == 200) { // 200 means access
                    var data=JSON.parse(body).data;
                    if (data.accessMask && data.accessMask&1) { // if group has jabber access == 1
                      return done(true);
                    }
                }
                return done(false);
            });
        },
        isuser: function(done, userName) {
            done(true); // always true, prevents registration
        }
    }
});