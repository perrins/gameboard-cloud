/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  5725-I43 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Manage the REST Services for the Gameboard Mobile App
 *
 */

// Prepare Router
var fs = require("fs");
var config = global.config;
var notify = global.notify;
var router = require('express').Router();

// Access the YT API
var yt = require("youtube-api");

// Define Route Methods
var Youtube = {

	/*
	 * List all Videos for the authenticated user
     *
 	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/youtube/videos
	 *
	 */
	 getYourVideos: function(req, res) {

	 	var local = false;

	 	if (config.local || local) {

	 		req.logger.info("Loading Local...");
			// Retreive an Array of Members
			var ytvideos = JSON.parse(fs.readFileSync('./data/gb_youtube.json', 'utf8'));
			res.json(ytvideos);
			return;
	 	}

	 	// Retrieve the Access Token from the Headers
	 	var accessToken = req.header('IBM-Security-Token');

	 	if (_.isUndefined(accessToken)) {
	 		res.status(401).send("User authentication is not valid for this request");
	 	}

	 	// How Do we Keep Authentication
		yt.authenticate({
		    type: "oauth",
		    token: accessToken
		});

		// Access the List of Videos for Authenticated User
		yt.channels.list({
		    "part": "contentDetails",
		    "mine" : true
		}, function (err, data) {
			if (err) {
				if(err==="Invalid Credentials") {
					res.status(401).send(err);
				} else {
					res.status(404).send(err);
				}
			} else {

				// Lets Access the Play list
				if(data.items.length> 0) {

					// Manage Paging 
					// Get the Playlist
					var playlist = data.items[0].contentDetails.relatedPlaylists.uploads;
					yt.playlistItems.list({
					    "part": "snippet",
					    "playlistId" : playlist,
					    'maxResults' : 50
					}, function (err, data) {

						// Send
						if(err){
							res.status(404).send(err);
						} else {
							res.json(data);
						}

					});

				} else {
					res.status(404).send("No playlists returned for this user")
				}

			}
		});

	},

   getVideo: function(req, res){

   		// Return Stub file if we are working in Local mode.
   		if(config.local) {

   			return;
   		};


	 	// Retrieve the Access Token from the Headers
	 	var accessToken = req.header('IBM-Security-Token');

	 	if (_.isUndefined(accessToken)) {
	 		res.status(401).send("User authentication is not valid for this request");
	 	}

	 	// How Do we Keep Authentication
		yt.authenticate({
		    type: "oauth",
		    token: accessToken
		});

		// Get the Youtube ID
		var _id = req.params.id

		if(!_id || _.isUndefined(_id)){
			res.status(404).send("Invalid request for video");
		}

		// Define the Query scope for YouTube
		var scope = "contentDetails,fileDetails,id,liveStreamingDetails,player,processingDetails,recordingDetails,statistics,status,topicDetails,snippet";

		// Access the List of Videos for Authenticated User
		yt.videos.list({
		    "part": scope,
		    "id" : _id
		}, function (err, data) {
			if (err) {
				if(err==="Invalid Credentials") {
					res.status(401).send(err);
				} else {
					res.status(404).send(err);
				}
			} else {

				// Return the Video
				res.json(data);

			}
		});

	}

};

// Define Routes
module.exports = exports = function() {

	router.get('/youtube/videos', Youtube.getYourVideos);
	router.get('/youtube/video/:id', Youtube.getVideo);

	return router;
}




