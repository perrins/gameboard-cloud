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
var _ = require('underscore');
var fs = require("fs");

var config = global.config;
var dbconfig = global.dbconfig;
var nano = global.nano;

// Define members Methods
var games = {

	/*
	 * List all members data stored by Cloudant.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/members/{id}
	 *
	*/
	fetchGames: function(req, res) {


		//Stub for local work
		if (config.local) {

			// Retreive an Array of Members
			var games = JSON.parse(fs.readFileSync('./data/gb_games.json', 'utf8'));

			// Send back
		  	res.send(games.docs[0]);

		} else {

			// User the members Database
			var games = nano.db.use('gb_games');

			// List all the focs
			games.list({include_docs:true},function(err, body) {
			  if (!err) {

     			// Remove Doc References from array
                var games = new Array();
                body.rows.forEach(function(item){
                    games.push(item.doc);
                });

                // Check we have some Games
                if(games.length>0) {
			  		res.json(games[0]);
			  	} else {
			  		res.json(null);
			  	}


			  } else {
			  	// Not Found
			  	res.status(400).send(err);
			  }
			});
		}

	},

	/*
	 * List all members by Board ID.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/members/{id}
	 *
	*/
	fetchGameById: function(req, res) {

		// Validate the Parameters

		// Handle Stub for local work
		if (config.local) {

			// Retreive an Array of Members
			var games = JSON.parse(fs.readFileSync('./data/gb_games.json', 'utf8'));

			// Send back
		  	res.send(games.docs);

		} else {

			// User the members Database
			var games = nano.db.use('gb_games');

			games.fetch({include_docs:true},{gid:[req.params.gid]},function(err, body) {
			  if (!err) {

			  	// Remove Doc References from array
                var games = new Array();
                body.rows.forEach(function(item){
                    games.push(item.doc);
                });

                // Check we have some Games
                if(games.length>0) {
			  		res.json(games[0]);
			  	} else {
			  		res.json(null);
			  	}

			  } else {
			  	// Not Found
			  	res.status(400).send(err);
			  }
			});
		}

	},

	/*
     * Create a new Video with the json data contained in request body. The content-type must be set to application/json.
     * To make the below sample code run correctly, the json data must contain id attribute, here is the sample.
     *
     * To test: curl -X POST -H 'Content-Type: application/json' -d '{\'id\':\'1\', \'name\':\'MBaaS\'}' http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/video
     *
     */
	 registerGame: function(req, res){

		// User the members Database
		var games = nano.db.use('gb_games');

		// Validate Body

		games.insert(req.body, function(err, body) {
		  if (!err) {
			res.json(body);
		  } else {
		  	res.status(400).send(err);
		  }
		});

	}

};

// Define Routes
module.exports = exports = function() {

	// Define Routes for Video Management
	router.get('/games', 	games.fetchGames);
	router.get('/games/:gid', games.fetchGameById)
	router.post('/games', games.registerGame);

	return router;
}



