/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  2014 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Manage the REST Services for the Gameboard Mobile App for the Favourites
 *
 */

// Get the Express Router
var router = require('express').Router();
var _ = require('underscore');
var fs = require("fs");

// Global Config for access to Cloudant
var notify = global.notify;
var config = global.config;
var dbconfig = global.dbconfig;

// Define Videos Methods
var Favs = {

	/*
	 * Add a Video to the list of Favourites.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	addVideo: function(req, res) {

		// Lets get Nano
		var nano     = require('nano')(dbconfig.clurl,dbconfig.cookies['cloudant']);

		// Parse the Bid and get it ready to be used as a key
		var uuid = null;
		try {
			uuid = parseInt(req.params.uuid);
		} catch(err) {
			res.status(404).send("userid is malformed");
		}

		// Get the Videos Database
		var favourites = nano.db.use('gb_favourites');

		// List all the focs
		videos.fetch({keys:[userid]},function(err, body) {
		  if (!err) {

		  	// Get the Document that is holding the Favourites
		  	var fav = body.rows[0];

		  	// Check if we have the video already in the List
		  	// !!
		  	// Add the Video to the List of Favourites
		  	fav.videos.push(uuid);

		  	// Now lets add the video into the List
			favourites.update(fav, function(err, body) {
			  if (!err) {
				res.json(fav);

				// Notify End User
				notify.send(["all"],"FAVORITE_VIDEO_ADDED");

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
	 * Add a Video to the list of Favourites.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	addMember: function(req, res) {

		// Lets get Nano
		var nano     = require('nano')(dbconfig.clurl,dbconfig.cookies['cloudant']);

		// Parse the Bid and get it ready to be used as a key
		var uuid = null;
		try {
			uuid = parseInt(req.params.uuid);
		} catch(err) {
			res.status(404).send("userid is malformed");
		}

		// Getthe Videos Database
		var favourites = nano.db.use('gb_favourites');

		// List all the focs
		videos.fetch({keys:[userid]},function(err, body) {
		  if (!err) {

		  	// Get the Document that is holding the Favourites
		  	var fav = body.rows[0];

		  	// Check if we have the video already in the List
		  	// !!


		  	// Add the Video to the List of Favourites
		  	fav.members.push(uuid);

		  	// Now lets add the video into the List
			favourites.update(fav, function(err, body) {
			  if (!err) {
				res.json(fav);

				// Notify End User
				notify.send(["all"],"FAVORITE_MEMBER_ADDED");

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
	removeVideo: function(req, res) {

		// Lets get Nano
		var nano     = require('nano')(dbconfig.clurl,dbconfig.cookies['cloudant']);

		// Parse the Bid and get it ready to be used as a key
		var uuid = null;
		try {
			uuid = parseInt(req.params.uuid);
		} catch(err) {
			res.status(404).send("userid is malformed");
		}

		// Getthe Videos Database
		var favourites = nano.db.use('gb_favourites');

		// List all the focs
		videos.fetch({keys:[userid]},function(err, body) {
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
	removeMember: function(req, res) {

		// Lets get Nano
		var nano     = require('nano')(dbconfig.clurl,dbconfig.cookies['cloudant']);

		// Parse the Bid and get it ready to be used as a key
		var uuid = null;
		try {
			uuid = parseInt(req.params.uuid);
		} catch(err) {
			res.status(404).send("userid is malformed");
		}

		// Getthe Videos Database
		var favourites = nano.db.use('gb_favourites');

		// List all the focs
		videos.fetch({keys:[userid]},function(err, body) {
		  if (!err) {

		  	// Get the Document that is holding the Favourites
		  	var fav = body.rows[0];

		  	// Check if we have the video already in the List
		  	// !!

		  	// Remove Video from the Array

		  	// Now lets add the video into the List
			favourites.update(fav, function(err, body) {
			  if (!err) {
				res.json(fav);
			  } else {
			  	res.status(400).send(err);

				// Notify End User
				notify.send(["all"],"FAVORITE_MEMBER_REMOVED");

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
	fetchFavouritesByUserId: function(req, res) {

		// Return a Favourites List which is a set of UUIDs and then its
		if(config.local) {

			// Retreive an Array of Members
			var favourites = JSON.parse(fs.readFileSync('./data/gb_favourties.json', 'utf8'));

			// Send back
		  	res.send(favourites);

		} else {

			var nano     = require('nano')(dbconfig.clurl,dbconfig.cookies['cloudant']);

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
				var favourites = nano.db.use('gb_favourites');

				// List all the focs
				favourites.view("favourites","favourites",{keys:[userid],include_docs:true},function(err, body) {

//				favourites.fetch({keys:[userid],include_docs:true},function(err, body) {

				  if (!err) {

				  	console.log(JSON.stringify(body));

				  	// Check we have a valid returned object before sending on
				  	if ( body.rows.length > 0) {
				  		def.resolve(body.rows[0].doc);
				  	} else {
				  		def.resolve([]);
				  	}


				  } else {
				  	// Not Found
				  	res.status(400).send(err);
				  }
				});

				return def.promise;

			}).then(function(favs){

				// Create a Defered
				var def = Q.defer();


				// Getthe Videos Database
				var videos = nano.db.use('gb_videos');

				// Retrieve the Board stats
				videos.view("bid","bid",{keys:favs.videos,include_docs:true},function(err, body) {
				  if (!err) {
				  	// Return the results
				  	if(_.isObject(body)) {
				  		if(body.rows.length > 0) {
				  			// Lets add to the Doc the Videos associated with a Board
				  			favs.videos = body.rows;
					  		def.resolve(favs);
				  		} else {

				  			favs.videos = [];
							def.resolve(favs);
				  		}
				  	} else {
				  		def.reject("returned object is malformed");
				  	}
				  }
				  else {
				  	// Hande an error
				  	def.reject("no videos found");
				  }
				},function(err){
				  def.reject(err);
				});

				return def.promise;

			}).then(function(favs) {

				// Create a Defered
				var def = Q.defer();

				// Getthe Videos Database
				var members = nano.db.use('gb_members');

				// Retrieve the Board stats
				videos.view("members","members",{keys:favs.members,include_docs:true},function(err, body) {
				  if (!err) {
				  	// Return the results
				  	if(_.isObject(body)) {
				  		if(body.rows.length > 0) {
				  			// Lets add to the Doc the Videos associated with a Board
				  			favs.members = body.rows;
					  		def.resolve(favs);
				  		} else {

				  			favs.members = [];
							def.resolve(favs);

				  		}
				  	} else {
				  		def.reject("returned object is malformed");
				  	}
				  }
				  else {
				  	// Hande an error
				  	def.reject("no members found");
				  }
				},function(err){
				  def.reject(err);
				});

				return def.promise;

			}).then(function(favs) {

				// Manange the final preparation of the Favourites List before sending back
				// to the user.

				// Return the Board details back to the the Callee
			  	res.send(favs);

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
	router.get('/favourites/:userid', Favs.fetchFavouritesByUserId);
	router.post('/favourites/:userid/video', Favs.addVideo);
	router.post('/favourites/:userid/video/:vuuid', Favs.removeVideo);
	router.post('/favourites/:userid/member', Favs.addMember);
	router.post('/favourites/:userid/member/:muuid', Favs.removeMember);

	return router;
}
