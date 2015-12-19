/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  2014 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Manage the REST Services for the Gameboard Mobile App for the Bookmarks
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
var Bookmarks = {

	/*
	 * Add a Video to the list of Favourites.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	addBookmark: function(req, res) {

		// Parse the Bid and get it ready to be used as a key
		var uuid = null;
		try {
			uuid = parseInt(req.params.userid);
		} catch(err) {
			res.status(404).send("userid is malformed");
		}

		// Getthe Videos Database
		var bookmarks = nano.db.use('gb_bookmarks');

		// Add the User that created the Bookmark
		var data = req.body;
		data.muuid = uuid;

		// Inser the bookmark into the database
		bookmarks.insert(data, function(err, body) {
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
	removeBookmark: function(req, res) {

		// Parse the Bid and get it ready to be used as a key
		var uuid = null;
		try {
			uuid = parseInt(req.params.uuid);
		} catch(err) {
			res.status(404).send("userid is malformed");
		}

		// Getthe Videos Database
		var bookmarks = nano.db.use('gb_bookmarks');

		// List all the focs
		bookmarks.fetch({keys:[userid]},function(err, body) {
		  if (!err) {

		  	// Get the Document that is holding the Favourites
		  	var fav = body.rows[0];

		  	// Check if we have the video already in the List
		  	// !!

		  	// Remove Video from the Array

		  	// Add the Video to the List of Favourites
		  	fav.members.push(uuid);

		  	// Now lets add the video into the List
			favourites.update(fav, function(err, body) {
			  if (!err) {
				res.json(fav);

				// Notify End User
				notify.send(["all"],"FAVORITE_VIDEO_REMOVED");

			  } else {
			  	res.status(400).send(err);
			  }
			});

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
	fetchBookmarksByUserId: function(req, res) {

		// Return a Favourites List which is a set of UUIDs and then its
		if(config.local) {

			// Retreive an Array of Members
			var bookmarks = JSON.parse(fs.readFileSync('./data/gb_bookmarks.json', 'utf8'));

			// Send back
		  	res.send(bookmarks);

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
				var bookmarks = nano.db.use('gb_bookmarks');

				// List all the focs
				bookmarks.view('bookmarks','bookmarks',{keys:[userid],include_docs:true},function(err, body) {
				  if (!err) {

                      if(body.rows.length > 0) {
                          // Send the item found
                          res.send(body.rows);
                      }
                      else {
                          // Cannot find it
                          res.status(404).send({status:404,message:"no bookmarks has not been found"});
                      }
                  } else {
                      // Not Found
                      res.status(404).send(err);
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
	router.get('/bookmarks/:userid', Bookmarks.fetchBookmarksByUserId);
	router.post('/bookmarks/:userid', Bookmarks.addBookmark);
	router.delete('/bookmarks/:userid', Bookmarks.removeBookmark);

	return router;
}
