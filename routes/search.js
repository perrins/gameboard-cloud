/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  2014 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Manage the REST Services for the Gameboard Mobile App
 *
 *  SEARCH
 *
 */

// Get the Express Router
var router = require('express').Router();
var _ = require('underscore');
var fs = require("fs");

// Global Config for access to Cloudant
var config = global.config;
var dbconfig = global.dbconfig;
var nano = global.nano;

// Define Search Methods
var Search = {

    /*
     * List all  data stored by Cloudant.
     *
     * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/Search/{id}
     *
     */
    searchByQuery: function(req, res) {

        // Handle SKIP and LIMIT for paging
        var skip = req.query.bookmark;
        var limit = req.query.limit;
        var query = req.query.query;

        if (!limit) {
            res.status(404).send("limit has not been passed as query parameters");
        }

        // Check we have a query.
        if (query === undefined|| query === null || query === "") {
            query = "*:*";
        } else {
            query = "fields:" + query + "*";
        }

        local = false;

        // Add in Paging
        // Stub to access the local board
        if (config.local || local) {

            req.logger.info("Loading Local...");

            // Retreive an Array of Members
            var search = JSON.parse(fs.readFileSync('./data/gb_search_' + skip + '.json', 'utf8'));

            // Send back
            res.send(search);

        } else {


            // Get instance to Videos
            var videos = nano.db.use('gb_videos');

            // Here comes the Query
            console.log("query", query, "skip", skip, "limit", limit);

            // Query the Docs from the Cloudant Lucene Search Index
            // All the key fields have been concatinated into a single field called Fields
            // The Query then search that single field for a matching item
            videos.search("board", "search", {
                q: query,
                "sort": '"rank"',
                offset: skip,
                limit: limit
            }, function(err, body) {

                if (!err) {

                    if (_.isObject(body)) {

                        // Join the first call with the second one
                        res.send(body);

                    } else {

                        res.status(500).send({
                            status : 500,
                            error: "Video array is malformed"
                        });
                    }

                } else {
                    res.status(404).send({
                        status : 404,
                        error: "No videos found in the board"
                    });
                }
            });

        }
    }

};

// Define Routes
module.exports = exports = function() {

    // Define Routes for Video Management
    router.get('/search', Search.searchByQuery);

    return router;
}
