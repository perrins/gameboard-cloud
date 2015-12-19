/*
 *  Licensed Materials - Property of categorieboard Ltd
 *  2014 (C) Copyright categorieboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with categorieboard Ltd.
 *
 *  Manage the REST Services for the categorieboard Mobile App
 *
 */

// Get the Express Router
var router = require('express').Router();
var _ = require('underscore');
var fs = require("fs");

var config = global.config;
var dbconfig = global.dbconfig;

// Define members Methods
var categories = {

	/*
	 * List all members data stored by Cloudant.
	 *
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/members/{id}
	 *
	*/
	fetchCategories: function(req, res) {


		//Stub for local work
		if (config.local) {

			// Retreive an Array of Members
			var categories = JSON.parse(fs.readFileSync('./data/gb_categories.json', 'utf8'));

			// Send back
		  	res.send(categories.docs[0]);

		} else {


			// Lets get Nano
			var nano     = require('nano')(dbconfig.clurl,dbconfig.cookies['cloudant']);

			// User the members Database
			var categories = nano.db.use('gb_categories');

			// List all the focs
			categories.list({include_docs:true},function(err, body) {
			  if (!err) {
			  	// Remove Doc References from array
                var cats = new Array();
                body.rows.forEach(function(item){
                    cats.push(item.doc);
                });
			  	res.json(cats[0]);
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
	fetchCategorieById: function(req, res) {

		// Validate the Parameters

		// Handle Stub for local work
		if (config.local) {

			// Retreive an Array of Members
			var categories = JSON.parse(fs.readFileSync('./data/gb_categories.json', 'utf8'));

			// Send back
		  	res.send(categories.docs[0]);

		} else {

			// Lets get Nano
			var nano     = require('nano')(dbconfig.clurl,dbconfig.cookies['cloudant']);

			// User the members Database
			var categories = nano.db.use('gb_categories');

			categories.fetch({include_docs:true},{gid:[req.params.gid]},function(err, body) {
			  if (!err) {

				// Remove Doc References from array
                var cats = new Array();
                body.rows.forEach(function(item){
                    cats.push(item.doc);
                });
                // Check we have some Cats
                if(cats.length>0) {
			  		res.json(cats[0]);
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
	 registerCategorie: function(req, res){

		// Lets get Nano
		var nano     = require('nano')(dbconfig.clurl,dbconfig.cookies['cloudant']);

		// User the members Database
		var categories = nano.db.use('gb_categories');

		// Validate Body
		categories.insert(req.body, function(err, body) {
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
	router.get('/categories', 	categories.fetchCategories);
	router.get('/categories/:gid', categories.fetchCategorieById)
	router.post('/categories', categories.registerCategorie);

	return router;
}



