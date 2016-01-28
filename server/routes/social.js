/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  2014 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Manage the REST Services for the Social Mobile App
 *
 */

// Get the Express Router
var router = require('express').Router();
var _ = require('underscore');
var fs = require("fs");

var OAuth = require("oauthio");
var graph = require("fbgraph");

var config = global.config;
var dbconfig = global.dbconfig;
var nano = global.nano;
var csrf = global.csrf;
var parse = global.parse;

// Define members Methods
var social = {

	/*
	 * List all members data stored by Cloudant.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/members/{id}
	 *
	*/
	getAuthCode: function(req, res) {


        //Node.js
        var token = OAuth.generateStateToken(req.session);

        // Get CSRF Token get client to return it on a header
        logger.info("TOKEN "+token);

        var _csrf = ""; //req.csrfToken();
        console.log("CSRF: "+_csrf);

        res.status(200).send({token:token, csrf: _csrf } );

	},
    getAuthorisation: function(req, res) {

        console.log("INSIDE AUTHORISATION");

        // Get the Provider
        var provider = req.params.provider;

        logger.info("CODE "+req.body.code);
        var code = req.body.code;

        // Authenticate the Provider and send back proper tokens
        OAuth.auth(provider, req.session, {
            code:code
        }).then(function (token) {

            logger.info("TOKEN "+JSON.stringify(token));

            // Check we have a Code
            if (_.isObject(token)) {

                // Test FB
                if (provider==="facebook") {

                    graph.setAccessToken(token.access_token);
                    graph.setAppSecret(config.FACEBOOK_SECRET);

                    /*
                    var wallPost = {
                        message: "Testing Testing !!)"
                    };
                    graph.post("/feed", wallPost, function(err, res) {
                        // returns the post id
                        console.log(res.id); // { id: xxxxx}
                    },function(err){
                        console.log(err);
                    });
                    */

                    graph.get('/me',function(err,info) {

                        // Check if we have an error
                        if(err) {
                            res.status(404).send(err);
                        } else {

                            var user = {
                                id : info.id,
                                email: info.email,
                                firstname: info.first_name,
                                lastname: info.last_name,
                                name: info.name,
                                code: code
                            };
                            // Send Data back
                            res.json({token:token,user:user});
                        }

                    },function(err){
                        logger.info(err);
                    });

                } else {

                    // Get the User Information
                    token.me().then(function(user){

                        res.json({token:token,user:user});

                    }).fail(function(err){
                        logger.info("ERROR "+JSON.stringify(err));
                        res.status(500).send(err);
                    })

                }

            } else {

                res.status(404).send({status: 404, error: "Could not get an access token"});
            }

        }).fail(function (err) {
            logger.info("ERROR 500 "+JSON.stringify(err));
            res.status(500).send(err);
        });

    }

};

// Define Routes
module.exports = exports = function() {

    OAuth.initialize(appConfig.SECURITY_PUBLICKEY, appConfig.SECURITY_SECRET);

	router.get('/social/authcode', 	social.getAuthCode);
    router.post('/social/authorise/:provider', social.getAuthorisation);

    return router;
}



