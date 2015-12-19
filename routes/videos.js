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

// Global Config for access to Cloudant
var dbconfig = global.dbconfig;
var config = global.config;
var nano = global.nano;

// Define Videos Methods
var Videos = {

	/*
	 * List all Videos data stored by Cloudant.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	fetchVideos: function(req, res) {

		// User the Videos Database
		var videos = nano.db.use('gb_videos');

		// List all the focs
		videos.list(function(err, body) {
		  if (!err) {
		  	res.send(body.rows);
		  } else {
		  	// Not Found
		  	res.status(404).send(err);
		  }
		});

	},

	/*
	 * List all Videos by Board ID.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	fetchVideosByBIDandRank: function(req, res) {

		// Handle SKIP and LIMIT for paging
		var bookmark = req.query.bookmark;
		var limit = req.query.limit;

		if(!limit) {
			res.status(400).send({status:400,error:"skip or limit has not been passed as query parameters"});
		}

		// Stub to access the local board
		if (config.local) {

			req.logger.info("Loading Local...");

            // If now Book Mark
            if(!bookmark) {
                bookmark = "bkm1";
            }

			// Retreive an Array of Members
			var videos = JSON.parse(fs.readFileSync('./data/gb_board_'+bookmark+'.json', 'utf8'));

			// Send back
		  	res.send(videos);

		} else {

			// Parse the Bid and get it ready to be used as a key
			var bid = null;
			try {
				bid = parseInt(req.params.bid);
			} catch(err) {
				res.status(404).send({status:404,error:"bid id is malformed"});
			}

			// Lets Chain a couple of calls to Cloudant together
			Q.fcall(function(){

				// Create a Defered
				var def = Q.defer();

				// Getthe Videos Database
				var boards = nano.db.use('gb_boards');

				// Retrieve the Board stats
				boards.view("board","view",{keys:[bid],include_docs:true},function(err, body) {
				  if (!err) {
				  	// Return the results
				  	if(_.isObject(body)) {
				  		if(body.rows.length > 0) {
				  			// Lets add to the Doc the Videos associated with a Board
					  		def.resolve(body.rows[0].doc);
				  		} else {
							def.reject({status:404,error:"No boards found"});
				  		}
				  	} else {
				  		def.reject({status:500,error:"returned object is malformed"});
				  	}
				  }
				  else {
				  	// Hande an error
				  	def.reject({status:404,error:"no board found"});
				  }
				},function(err){
				  def.reject(err);
				});

				return def.promise;

			}).then(function(_board) {

				// Create a Defered
				var def = Q.defer();

				// Get instance to Videos
				var videos = nano.db.use('gb_videos');

				console.log("bid",bid,"bookmark",bookmark,"limit",limit);

				var _query = {
									q:'bid:'+bid,
									"sort":'"rank"',
									limit:limit
                };

				// If we have a bookmark add it, so we can navigate				
				if(bookmark) {
					_query["bookmark"] = bookmark;
				}

                console.log(_query);

				// List all the focs
				videos.search("board","search", _query,function(err, body) {

				  if (!err) {

				  	if(_.isObject(body)) {

			  			// Pull out all the
					  	// Join the first call with the second one
					  	var board = _.extend(_board,{videos:body});
					  	def.resolve(board);

				  	} else {

				  		def.reject({status:500,error:"Video array is malformed"});
				  	}

				  } else {
				  	def.resolve(_.extend(_board,{videos:[]}));
				  }
				});

				return def.promise;

			}).then(function(board) {

				// Return the Board details back to the the Callee
			  	res.send(board);

			}).catch(function(err) {

				// Fail with an Error
			  	res.status(err.status).send(err);

			}).done();

		}
	},


/*
	 * List all your Videos by User Id.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	fetchVideosByUserId: function(req, res) {


		// Stub to access the local board
		if (config.local) {

			req.logger.info("Loading Local...");

			// Retreive an Array of Members
			var videos = JSON.parse(fs.readFileSync('./data/gb_yourvideos.json', 'utf8'));

			// Send back
		  	res.send(videos);

		} else {

			// Parse the Bid and get it ready to be used as a key
			var userid = null;
			try {
				bid = req.params.userid;
			} catch(err) {
				res.status(404).send({status:404,error:"bid id is malformed"});
			}

			// Lets Chain a couple of calls to Cloudant together
			Q.fcall(function(){

				// Create a Defered
				var def = Q.defer();

				// Getthe Videos Database
				var members = nano.db.use('gb_members');

				// Retrieve the Board stats
				members.view("member","member",{keys:[userid],include_docs:true},function(err, body) {
				  if (!err) {
				  	// Return the results
				  	if(_.isObject(body)) {
				  		if(body.rows.length > 0) {
				  			// Lets add to the Doc the Videos associated with a Board
					  		def.resolve(body.rows[0].doc);
				  		} else {
							def.reject({status:404,error:"no boards found"});
				  		}
				  	} else {
				  		def.reject("returned object is malformed");
				  	}
				  }
				  else {
				  	// Hande an error
				  	def.reject({status:404, error:"no board found"});
				  }
				},function(err){
				  def.reject(err);
				});

				return def.promise;

			}).then(function(_board) {

				// Create a Defered
				var def = Q.defer();

				// Get instance to Videos
				var videos = nano.db.use('gb_videos');

				// List all the focs
				//videos.search("bid","bid", {q:'bid:'+bid,"sort":'"rank"',offset:skip,limit:limit}
				videos.view("bid","bid",{keys:[userid],skip:skip,limit:limit,include_docs:true},function(err, body) {
				  if (!err) {
				  	if(_.isObject(body)) {
					  	// Join the first call with the second one
					  	var board = _.extend(_board,{videos:body});
					  	def.resolve(board);
				  	} else {
				  		def.reject({status:500,error:"Video array is malformed"});
				  	}

				  } else {
				  	def.reject({status:400,error:"No videos found in the board"});
				  }
				});

				return def.promise;

			}).then(function(board) {

				// Return the Board details back to the the Callee
			  	res.send(board);

			}).catch(function(err) {

				// Fail with an Error
			  	res.status(err.status).send(err);

			}).done();

		}
	},

	/*
	 * List all Videos by Board ID.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	fetchVideosByYTID: function(req, res) {

		// User the Videos Database
		var videos = nano.db.use('gb_videos');

		// List all the focs
		videos.search("board","search", {q:'ytid:'+req.params.ytid},function(err, body) {
		  if (!err) {
		  	res.send(body.rows);
		  } else {
		  	// Not Found
		  	res.status(400).send(err);
		  }
		});

	},

	/*
	 * List all Videos data stored by Cloudant.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/videos/{id}
	 *
	*/
	fetchVideosById: function(req, res) {

		// Stub to access the local board
		if (config.local) {

			req.logger.info("Loading Local...");

			// Retreive an Array of Members
			var videos = JSON.parse(fs.readFileSync('./data/gb_video.json', 'utf8'));

			// Send back
		  	res.send(videos);

		} else {


			// User the Videos Database
			var videos = nano.db.use('gb_videos');

			// List all the focs
			videos.fetch({keys:[req.params.id]},function(err, body) {
			  if (!err) {

			  	// Check we have  avideo
			  	if(body.rows > 0) {
			  		res.send(body.rows[0].doc);
			  	} else {
			  		res.send(404);
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
     *     *
     */
	 createVideo: function(req, res){

		// TODO : Validate Body of Payload Check its Validate

		console.log(nano);

		// User the Videos Database
		var videos = nano.db.use('gb_videos');

		videos.insert(req.body, function(err, body) {
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
	router.get('/videos/board/:bid', Videos.fetchVideosByBIDandRank);
	router.get('/videos', Videos.fetchVideos);
	router.get('/videos/youtube/:ytid', Videos.fetchVideosByYTID);
	router.get('/videos/:id', Videos.fetchVideosById);
	router.get('/videos/yours/:userid', Videos.fetchVideosByUserId);
	router.post('/videos',	Videos.createVideo);

	return router;
}
