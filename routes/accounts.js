/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  5725-I43 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Manage the REST Services for the Gameboard Mobile App
 * 
 */


var router = require('express').Router();

var GB_ACCOUNTS = "GB_ACCOUNTS";

/*

	Expected Payload Structure for GB_Account Type
	{
	
		id;
		phone;
		firstname = "";
		surname = "";
		over18 = false;
		countryCode;
		memberSince;
		Accountid;
		nickname;
		twitter;
		facebook;
		platform;
		ametag = "";
		email;
	
		address {
			String AddressLine1; 
			String AddressLine2; 
			String TownCity; 	 
			String County;	 
			String Postcode; 	 
			String Country; 	 
		},
	
		valid = true; 		  // Is account valid for use
	
		credit = 0L;
		serviceType = 0;

	}

*/


// Define Account Methods
var Accounts = {


	/*
	 * List all Accounts data stored by IBM Data Service.
	 * 
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/Accounts
	 * 
	 */
	 getAccounts: function(req, res){
		var query = req.data.Query.ofType(GB_Account);
		query.find().done(function(Accounts) {
			res.json(Accounts);
		}, function(err){
		    res.send(err);
		});
	},

	/*
	 * Find the Account's data for the given parameter. The sample code below filters Account data by the id attribtue. It can be filtered by other attribute set. 
	 * Take the name attribute as an example, it can be filtered by name attribute by using api 'query.find({name: 'MBaaS'})'.
	 * 
	 * To test: curl http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/Accounts/1
	 * 
	 */
	 getAccount: function(req, res){
		var query = req.data.Query.ofType(GB_Account);
		query.find({id: req.params.id}, {limit: 1}).done(function(Account) {
			if (Account.length==1) {
				res.json(Account);
			}
			else {
				res.status(404);
				res.send('No such Account found');
			}
		}, function(err){
		    res.send(err);
		});
	},

	/*
     * Create a new Account with the json data contained in request body. The content-type must be set to application/json.
     * To make the below sample code run correctly, the json data must contain id attribute, here is the sample.
     * {
     *  'id':'1',
     *  'name': 'MBaaS'
     * }
     * 
     * To test: curl -X POST -H 'Content-Type: application/json' -d '{\'id\':\'1\', \'name\':\'MBaaS\'}' http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/Accounts
     * 
     */
	 createAccount: function(req, res){
		var Account = req.data.Object.ofType(GB_Account, req.body);
		Account.save().then(function(saved) {
			res.json(saved);
		}, function(err){
		    res.send(err);
		});		
	},

	/*
	 * Modify the Account's data matched the id attribute with the put request body.
	 * 
	 * To test: curl -X PUT -H 'Content-Type: application/json' -d '{\'id\':\'1\', \'name\':\'MBaaS\'}' http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/Accounts/1
	 * 
	 */
	 updateAccount: function(req, res){	
		var query = req.data.Query.ofType(GB_Account);
		query.find({id: req.params.id}, {limit: 1}).then(function(Account) {
			Account.forEach(function(person){
				person.set(req.body);
				person.save().then(function(updated) {
					res.json(updated);
				}, function(err){
				    res.send(err);
				});
			});
		}, function(err){
		    res.send(err);
		});
	},

	/*
	 * Delete the Account's data for the given parameter. Below shows how to delete the Account data by the id attribtue. 
	 * It can be also deleted by other attribute like name by changing query.find option.
	 * 
	 * To test: curl -X DELETE http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/Accounts/1
	 * 
	 */
	 deleteAccount: function(req, res){
		var query = req.data.Query.ofType(GB_Account);
		query.find({id: req.params.id}, {limit: 1}).done(function(Accounts) {
			if (Accounts.length==1) {
				Accounts[0].del().done(function(deleted) {
					var isDeleted = deleted.isDeleted();
					if (deleted.isDeleted()) {
						res.send('delete successfully.');
					}
					else {
						res.status(500);
						res.send('delete failed.');
					}
				}, function(err){
				    res.send(err);
				});
			}
			else {
				res.status(404);
				res.send('No such Account found');
			}
		}, function(err){
		    res.send(err);
		});
	}
};

// Define Routes for Account Management
router.get('/accounts',    	Accounts.getAccounts);
router.get('/accounts/:id', 	Accounts.getAccount);
router.post('/accounts',		Accounts.createAccount);
router.put('/accounts/:id',	Accounts.updateAccount);
router.delete('/accounts/:id', Accounts.deleteAccount);

module.exports = exports = router;


	

