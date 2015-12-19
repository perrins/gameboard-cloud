/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  2014 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Manage the REST Services for the Gameboard Mobile App
 *
 */

// Get the Express Router
var router = require('express').Router();
var fs = require("fs");
var Q = require("q");
var request = require('request');
var config = global.config;
var dbconfig = global.dbconfig;

// Define members Methods
var members = {

    /*
     * List all members data stored by Cloudant.
     *
     * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/members/{id}
     *
     */
    fetchMembers: function (req, res) {

        // Handle Stub for local work
        if (config.local) {

            // Retreive an Array of Members
            var members = JSON.parse(fs.readFileSync('./data/gb_members.json', 'utf8'));

            // Send back
            res.json(members);

            return;

        }

        // Lets get Nano
        var nano = require('nano')(dbconfig.clurl, dbconfig.cookies['cloudant']);

        // User the members Database
        var members = nano.db.use('gb_members');

        // List all the focs
        members.list(function (err, body) {
            if (!err) {
                res.send(body.rows);
            } else {
                // Not Found
                res.status(400).send(err);
            }
        });

    },

    /*
     * List all members by Board ID.
     *
     * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/members/{id}
     *
     */
    searchMembers: function (req, res) {

        // Validate the Parameters

        // Handle Stub for local work
        if (config.local) {

            // Retreive an Array of Members
            var members = JSON.parse(fs.readFileSync('./data/gb_members.json', 'utf8'));

            // Send back
            res.json(members);

            return;

        }

        // Lets get Nano
        var nano = require('nano')(dbconfig.clurl, dbconfig.cookies['cloudant']);

        // User the members Database
        var members = nano.db.use('gb_members');

        // List all the focs
        members.search("muuid", "muuid", {q: 'muuid:' + req.params.muuid}, function (err, body) {
            if (!err) {
                res.send(body.rows);
            } else {
                // Not Found
                res.status(400).send(err);
            }
        });

    },

    /*
     * List all members data stored by Cloudant.
     *
     * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/members/{id}
     *
     */
    fetchMemberById: function (req, res) {

        // Handle Stub for local work
        if (config.local) {

            // Retreive an Array of Members
            var members = JSON.parse(fs.readFileSync('./data/gb_member.json', 'utf8'));

            // Send back
            res.json(members);

            return;

        }

        // Lets get Nano
        var nano = require('nano')(dbconfig.clurl, dbconfig.cookies['cloudant']);

        // User the members Database
        var members = nano.db.use('gb_members');

        members.view('member', 'member', {keys: [req.params.muuid], include_docs: true}, function (err, body) {

            // Check we have something to send back
            if (!err) {

                if (body.rows.length > 0) {

                    var row = body.rows[0];
                    if (row.id == "_design/member") {
                        res.status(404).send({"error": "not_found"});
                    } else {
                        // Send the item found
                        res.send(row.doc);
                    }
                }
                else {

                    // Cannot find it
                    res.status(404).send({status: 404, message: "member has not been found"});

                }
            } else {
                // Not Found
                res.status(404).send(err);
            }
        });

    },

    /*
     * Create a new Video with the json data contained in request body. The content-type must be set to application/json.
     * To make the below sample code run correctly, the json data must contain id attribute, here is the sample.
     *
     * To test: curl -X POST -H 'Content-Type: application/json' -d '{\'id\':\'1\', \'name\':\'MBaaS\'}' http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/video
     *
     */
    registerMember: function (req, res) {

        // Lets Check the Data and Call to See if the Member has already been created
        var newmember = req.body;

        // Check we have an Object
        if (!_.isObject(newmember)) {
            res.status(500).send({statusCode: 500, "error": "No member data included in POST operation"});
            return;
        }

        // Lets Chain some call together, first lets register the member with Cloudant
        // The best way of calling Async call
        // Use the members Database
        var members = nano.db.use('gb_members');

        // 1. Lets Check if User Already Exists
        Q.fcall(function () {

            var def = Q.defer();

            def.resolve(newmember);
            /*
            // Check if Member can be found by MUUID which is the key from Google OAUTH if not then we can register them
            members.view('member', 'member', {keys: [newmember.muuid]}, function (err, body) {

                // Check we have something to send back
                if (!err) {

                    if (body.rows.length > 0) {
                        def.resolve(newmember);
                    }
                    else {
                        // Cannot find it
                        def.reject({status: 404, message: "member has not been found"});
                    }
                } else {
                    // Not Found
                    def.reject({status: 500, message: "problem trying to find an existing member"});
                }
            });
            */

            return def.promise;

        // 2. if Not then lets create them
        }).then(function(data) {

            // Make the Call to the Service and return a JSON Payload only if Zurmo is enabled
            // We make want to turn this off
            // if (config.zurmoAPI.enable) {

            // Register with Zurmo First then take its details and merge with CloudDant store
            var def = RegisterWithCRM(newmember);

            return def;

        }).then(function (crm) {

            // create a defer
            var def = Q.defer();

            // Check
            if (!_.isObject(crm)) {
                def.reject({status:500,message:"failed to create CRM Entry"});
            } else if (crm.status=="SUCCESS") {

                // Add the CRM ID to the Cloudant JSON structure so we can cross reference later
                var cmember = _.extend(newmember, {crm_id:crm.data.id});

                // Q Handle saving in Cloudant and
                members.insert(cmember, function (err, body) {
                    if (!err) {
                        // Check we have a good Insert
                        if (body.ok) {
                            def.resolve(newmember);
                        } else {
                            def.reject(body);
                        }
                    } else {
                        def.reject(err);
                    }
                });
            } else {
                def.reject({status:500,message:"Failed to create CRM entry something wrong with the model", error:data.errors});
            }
            return def.promise;

        }).then(function (data) {

            // One file check we have a formed JSO Object redead to send back to the callee
            if (_.isObject(data)) {
                // Send the Results
                // The final point of sending back a valid location call to a callee
                res.json(data.body);
            } else {
                // Send an Error if we cannot send back a valid location
                res.status(404).send(data);
            }

        }).fail(function (error) {

            // Send an Error if we cannot send back a valid location
            res.status(error.status).send(error);

        }).done();

    }

};

// Store the information inside Zurmo
function RegisterWithCRM(member) {

    // Lets Chain a couple of calls together
    var _def = Q.fcall(function () {

        return zurmoAuth();

    }).then(function (token) {

        // Defer for async processing
        var def = Q.defer();

        // Create a Member Payload to Call Zurmo with for Creation
        var _member = prepareMember(member);

        // Prepare the Headers
        var _headers = config.zurmoCreate;

        // Set the Tokens
        _headers.ZURMO_SESSION_ID = token.data.sessionId;
        _headers.ZURMO_TOKEN =  token.data.token;

        // Define the Payload
        var input = {
            method: 'post',
            headers: _headers,
            form: _member,
            json:true,
            url: config.zurmoHost + config.zurmoAPI.create
        };

        // Make the Call to the Service
        request(input, function (error, response, body) {
            // Check if we have an error condition
            // If so then reject the promise
            if (_.isObject(error)) {
                def.reject(error);
            } else {
                // Send the response onto the Parsing stage of the request
                def.resolve(body);
            }
        }, function (err) {
            // if error condition reject
            def.reject(err);
        });

        return def.promise;

    }).fail(function(err){
        var def = Q.defer();
        def.reject(err);
        return def.promise;
    });

    return _def;

};

// Authorise with Zurmo before making REST Calls
function zurmoAuth () {

    var def = Q.defer();

    // Define the Payload
    var input = {
        method: 'get',
        headers: config.zurmoAuth,
        url: config.zurmoHost + config.zurmoAPI.auth
    };

    // Make the Call to the Service
    request(input, function (error, response, body) {
        // Check if we have an error condition
        // If so then reject the promise
        if (_.isObject(error) || response.statusCode == 500) {
            def.reject(body);
        } else {
            // Parse it into JSON Object
            body = JSON.parse(body);
            // Send the response onto the Parsing stage of the request
            def.resolve(body);
        }
    }, function (err) {
        // if error condition reject
        def.reject(err);
    });

    return def.promise;

};

function prepareMember(member) {

    var _member = {
        "data": {
            "department": "",
            "name" : member.user.firstname+" " +member.user.lastname,
            "firstName": member.user.firstname,
            "jobTitle": member.user.occupation,
            "lastName": member.user.lastname,
            "mobilePhone": member.telephone,
            "primaryAddress": {
                "invalid": "0",
                "latitude": null,
                "longitude": null,
                "street1": member.address1,
                "street2": member.address2,
                "city": member.towncity,
                "state": "",
                "postalCode": member.postcode,
                "country": member.country

            },
            "primaryEmail": {
                "emailAddress": member.emailaccount,
                "isInvalid": null,
                "optOut": "0"
            },
            "companyName": "Gameboard",
            "description": member.muuid,
            "source": {
                "id": 3,
                "value": "Self-Generated"
            },
            "state" : {
                "id":6
            }
        }
    };

    return _member;
};

// Define Routes
module.exports = exports = function () {

    // Define Routes for Member Management
    router.get('/search/members', members.searchMembers);
    router.get('/members', members.fetchMembers);
    router.get('/members/:muuid', members.fetchMemberById);
    router.post('/members/register', members.registerMember);

    return router;
};



