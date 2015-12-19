/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  2014 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Manage the REST Services for the Gameboard Mobile App for the Notifications
 *
 */

// Get the Express Router
var router = require('express').Router();
var fs = require("fs");

// Global Config for access to Cloudant
var config = global.config;
var dbconfig = global.dbconfig;
var nano = global.nano;

// Define Videos Methods
var Notifications = {

	/*
	 * Add a Video to the list of Favourites.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	addNotification: function(req, res) {

		// Let them think they are getting a successful add
		if (config.local) {
			res.send({info:"success"});
		}

		// Parse the Bid and get it ready to be used as a key
		var uuid = null;
		try {
			uuid = parseInt(req.params.userid);
		} catch(err) {
			res.status(404).send("userid is malformed");
		}

		// Getthe Videos Database
		var bookmarks = nano.db.use('gb_notifications');

		// Add the User that created the Bookmark
		var data = req.body;
		data.userid = uuid;

		// Inser the bookmark into the database
		notifications.insert(data, function(err, body) {
		  if (!err) {
			res.json(body);
		  } else {
		  	res.status(400).send(err);
		  }
		});

	},

	/*
	 * Fetch All the Videos by User Id
	 * Get the list of Favourite Videos and Favourite Members
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	removeNotification: function(req, res) {

		// Parse the Bid and get it ready to be used as a key
		var uuid = null;
		try {
			uuid = parseInt(req.params.uuid);
		} catch(err) {
			res.status(404).send("userid is malformed");
		}

		// Getthe Videos Database
		var notifications = nano.db.use('gb_notifications');

		// List all the focs
		notifications.fetch({keys:[userid]},function(err, body) {
		  if (!err) {

		  	// Get the Document that is holding the Favourites
		  	var fav = body.rows[0];

		  	// Check if we have the video already in the List
		  	// !!

		  	// Remove Video from the Array


		  } else {
		  	// Not Found
		  	res.status(400).send(err);
		  }
		});


	},


	/*
	 * Fetch All the Videos by User Id
	 * Get the list of Favourite Videos and Favourite Members
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	fetchNotificationsByUserId: function(req, res) {

		// Return a Favourites List which is a set of UUIDs and then its
		if(config.local) {

			// Retreive an Array of Members
			var notifications = JSON.parse(fs.readFileSync('./data/gb_notifications.json', 'utf8'));

			// Send back
		  	res.send(notifications);

		} else {

			// Parse the Bid and get it ready to be used as a key
			var userid = null;
			try {
				userid = parseInt(req.params.userid);
			} catch(err) {
				res.status(404).send("userid is malformed");
			}

			// Lets Chain a couple of calls to Cloudant together
			Q.fcall(function(){

				// Create a Defered
				var def = Q.defer();

				// Getthe Videos Database
				var notifications = nano.db.use('gb_notifications');

				// List all the focs
				notifications.fetch({keys:[userid]},function(err, body) {
				  if (!err) {

				  	// Check we have a valid returned object before sending on
				  	def.resolve(body.rows[0].doc);

				  } else {
				  	// Not Found
				  	res.status(400).send(err);
				  }
				});

				return def.promise;

			}).catch(function(err) {

				// Fail with an Error
			  	res.status(400).send(err);

			}).done();
		}
	}

};

// Define Routes
module.exports = exports = function() {

	// Define Routes for Favourite Management
	router.get('/notifications/:userid', Notifications.fetchNotificationsByUserId);
	router.post('/notifications/:userid', Notifications.addNotification);
	router.delete('/notifications/:userid', Notifications.removeNotification);

	return router;
}
