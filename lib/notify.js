/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  5725-I43 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Notify is a utlity export for wraping MQ Light Send functions
 *
 */

var mqlight = require('mqlight');
var Q = require('q');
var mqc = null;
var config = null;
var logger = null;
var opts = {};


// TODO: Retreive the Current Member details and core information so a notification 
// can be issued for that user.

var notify = {
		
	/*
     * To test: curl -X POST -H "Content-Type: application/json" http://${appHostName}.mybluemix.net/${appHostName}/v1/apps/${applicationId}/notifyOtherDevices
     */	
	send: function(type, payload) {

		logger.info("Sending Message....");

	    // Send a setup message to say we are ready to rock
        mqc.send(config.PUBLISH_TOPIC, {"type":type,"payload":payload});

	},
	init : function(req) {

		var def = Q.defer();


		// Retrieve the Member ID from the Cookies
		// Then get the member information



	    /*
	     * Create our MQ Light client
	     * If we are not running in Bluemix, then default to a local MQ Light connection  
	     * handle if we want MQ to be local and not conected
	     */
	    if (config.mqlocal) {

	    	mqc = { 
	    		  	send:function(type,payload) 
	    		  	{
	    				logger.info(type,payload);
	    			}
	    	};

	    	def.resolve(mqc)

	    } else {

		    mqc = mqlight.createClient(opts, function(err) {

		    	// Check if we have an error
		        if (err) {
		            logger.error('Connection to ' + opts.service + ' using client-id ' + mqc.id + ' failed: ' + err);
					def.reject(err);	            
		        } else {
		        	logger.info("MQLight Connected");
		            logger.info('Connected to ' + opts.service + ' using client-id ' + mqc.id);
		        }

		        // Resolve the Defered with the Client Initialisation
		        def.resolve(mqc);

		    });
		}    
		return def.promise;

	}
	
};

module.exports = exports = function(_config,_logger){

	// Accept and manage the configuration
	config = _config;
	logger = _logger;

    // Authenticate with MQLight Server
    /* REGISTER CLIENT TO NOTIFY SERVER */
    /*
     * Establish MQ credentials
     */
    var mqlightService = {};
    if (process.env.VCAP_SERVICES) {
        logger.info('Running BlueMix...');
        if (config['mqlight'] == null) {
            throw 'Error - Check that app is bound to service';
        }
        mqlightService = config['mqlight'];
        opts.service = mqlightService.credentials.connectionLookupURI;
        opts.user = mqlightService.credentials.username;
        opts.password = mqlightService.credentials.password;
    } else {
        logger.info('Running locally');
        opts.service = 'amqp://localhost';
    }

    return notify;

};


	

