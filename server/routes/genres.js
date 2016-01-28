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
var appconfig = global.appConfig;
var dbconfig = global.dbconfig;
var nano = global.nano;

// Define members Methods
var Genres = {

	/*
	 * List all members data stored by Cloudant.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/members/{id}
	 *
	*/
	fetchGenres: function(req, res) {


		//Stub for local work
		if (appConfig.local) {

			// Retreive an Array of Members
			var genres = JSON.parse(fs.readFileSync('./data/gb_genres.json', 'utf8'));

			// Send back
		  	res.send(genres.docs);

		} else {

			// User the members Database
			var Genres = nano.db.use('gb_genres');

			// List all the focs
			Genres.list({include_docs:true},function(err, body) {
			  if (!err) {

                // Remove Doc References from array
                var genres = new Array();
                body.rows.forEach(function(item){
                    genres.push(item.doc);
                });

                // Send back the Array of Genres
			  	res.json(genres);


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
	fetchGenreById: function(req, res) {

		// Validate the Parameters

		// Handle Stub for local work
		if (appConfig.local) {

			// Retreive an Array of Members
			var members = JSON.parse(fs.readFileSync('./data/gb_genres.json', 'utf8'));

			// Send back
		  	res.send(members);

		} else {

			// User the members Database
			var Genres = nano.db.use('gb_genres');

			Genres.fetch({gid:[req.params.gid]},function(err, body) {
			  if (!err) {
			  	res.json(body.rows);
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
	 registerGenre: function(req, res){

		// User the members Database
		var Genres = nano.db.use('gb_genres');

		// Validate Body
		Genres.insert(req.body, function(err, body) {
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
	router.get('/genres', 	Genres.fetchGenres );
	router.get('/genres/:gid', Genres.fetchGenreById)
	router.post('/genres', Genres.registerGenre);

	return router;
}
