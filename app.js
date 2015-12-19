/*
 *  Licensed Materials - Property of Gameboard Ltd
 *  5725-I43 (C) Copyright Gameboard Ltd. 2011,2014. All Rights Reserved.
 *  UK Government Users Restricted Rights - Use, duplication or
 *  disclosure restricted by GSA ADP Schedule Contract with Gameboard Ltd.
 *
 *  Manage the REST Services for the Gameboard Mobile App
 *
 */
 var express = require('express'),
    ibmbluemix = require('ibmbluemix'),
    ibmdata = require('ibmdata'),
    colors = require('colors'),
   csrf = require('csurf'),
    bodyParser = require('body-parser')
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session');

    fs = require("fs"),
    appConfig = JSON.parse(fs.readFileSync('config.json', 'utf8')),
    pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Load Express and the IBM Bluemix SDKs

var config = appConfig,
    app = express(),
    logger = ibmbluemix.getLogger();

logger.info(" _____ _                 _ ".red);
logger.info("/  __ \\ |               | |".red);
logger.info("| /  \\/ | ___  _   _  __| |".red);
logger.info("| |   | |/ _ \\| | | |/ _` |".red);
logger.info("| \\__/\\ | (_) | |_| | (_| |".red);
logger.info(" \\____/_|\\___/ \\__,_|\\__,_|".red);

logger.info('');
logger.info('** Gameboard Cloud Server ***');
logger.info('Version '+ pkg.version.red +' (Alpha)');
logger.info('');

// Global Config for access to Cloudant
var dbconfig = {
    clurl: null,
    cookies: {}
};

// init core sdk
ibmbluemix.initialize(config).then(function(config) {

    logger.info("CONFIG:" + JSON.stringify(config));

    // Load the Bluemix Configuration
    var ibmconfig = ibmbluemix.getConfig();

    // Define the Mechanics for a security token passed through a session
    app.use(cookieParser(ibmconfig.SECURITY_PUBLICKEY));
    app.use(cookieSession({
        secret: ibmconfig.SECURITY_PUBLICKEY
    }));

    var _csrf = csrf({cookie:true});
    var parseForm = bodyParser.urlencoded({ extended: false });

    app.use(_csrf);

    // init service sdks
    app.use(function(req, res, next) {
        req.ibmbluemix = ibmbluemix;
        req.ibmdata = ibmdata.initializeService(req);
        //req.ibmpush = ibmpush.initializeService(req);
        req.ibmconfig = ibmconfig;
        req.logger = logger;
        next();

   });

    // Load the Notification System
    //var notify = require("./lib/notify")(appConfig,logger);

    // Authenticate with Cloudant
    // Load Nano
    logger.info("Starting members Router...");

    // Get the VCAP Services
    var service = ibmconfig.vcapServices['cloudantNoSQLDB'];

    // If this is not defined then it means we are running locally
    if (_.isUndefined(service)) {
        creds = {
            "username": "3c2d8585-7642-4995-98d0-cca3ae5730c1-bluemix",
            "password": "e0b50b46bf05eafef6ada3754f1b80b4aba9f1787a93be114946b9e2679125cb",
            "host": "3c2d8585-7642-4995-98d0-cca3ae5730c1-bluemix.cloudant.com",
            "port": 443,
            "url": "https://3c2d8585-7642-4995-98d0-cca3ae5730c1-bluemix:e0b50b46bf05eafef6ada3754f1b80b4aba9f1787a93be114946b9e2679125cb@3c2d8585-7642-4995-98d0-cca3ae5730c1-bluemix.cloudant.com"
        }
    } else {
        // Get the Credentials
        var creds = service[0]['credentials'];
    }

    logger.info('Loading nano...');

    dbconfig.clurl = 'https://' + creds.host + ":" + creds.port;

    var nano = require('nano')(dbconfig.clurl),
        username = creds.username,
        userpass = creds.password,
        callback = console.log, // this would normally be some callback
        cookies = {}; // store cookies, normally redis or something

    global.dbconfig = dbconfig;
    global.config = config;
    //global.notify = notify;
    global.nano = nano;
    global.logger = logger;
    global.csrf = csrf;
    global.parse = parseForm;


    logger.info("Authenticating with nano...");

    // Register the Routes that need to configured for Cloudant access
    var routes = function() {

        // Setup Notify System and the defer into setting up the rest of the system
        //notify.init().then(function(){

            // Check where we are getting data from 
            if(config.local) {
                logger.info ("ACCESSING LOCAL STUBS...")
            } else {
                logger.info ("ACCESSING BLUEMIX !!!")
            }

            logger.info("Registering Routes...");

            // REGISTER CLOUDANT Based Routes pass Notification service into them

            var routers = [
                "videos",
                "members",
                "favourites",
                "notifications",
                "bookmarks",
                "search",
                "youtube",
                "genres",
                "games",
                "categories",
                "social"
            ];

            routers.forEach(function (router) {
                // Moved these imports etc into global object.
                logger.info("Registering: " + router.yellow);
                app.use(ibmconfig.getContextRoot(), require("./routes/" + router)());
            });

            //notify.send(["setup"], {"initilized":true});
            logger.info("Routes Registered !!".green);
            logger.info("Server Ready ..... bring it on !".green)

        //}).catch(function(err){
        //    console.log(err);
        //});

    };

    // Check if we are local
    if (config.local) {
        routes();
    } else {

        // Authenticate
        nano.auth(username, userpass, function(err, body, headers) {

            logger.info("Nano Authenticated ...", err);

            if (err) {
                return callback(err);
            }

            // Save the Cookie for use with Calls
            if (headers && headers['set-cookie']) {
                logger.info('Cookie:'+headers['set-cookie']);
                dbconfig.cookies['cloudant'] = headers['set-cookie'];
            }

            // Register Routes
            routes();

            callback("Ready...");

        });
    }

    // init basics for an express app
    app.use(require('./lib/setup'));

    //uncomment below code to protect endpoints created afterwards by MAS
    //var mas = require('ibmsecurity')();
    //app.use(mas);
    logger.info('Context root: ' + ibmconfig.getContextRoot());

    /*
    // Search for Videos registered
    app.use(ibmconfig.getContextRoot(), require('./routes/search'));

    // Manage the Notifications
    app.use(ibmconfig.getContextRoot(), require('./routes/notification'));

    */


    // Manage a Static Console
    app.use(ibmconfig.getContextRoot(), require('./lib/staticfile'));

    // Want to see how you can easily extend this template to work with third party node modules?
    // If so, add the Twilio service to your Mobile Cloud application and uncomment this next line.
    // app.use(ibmconfig.getContextRoot(), require('./lib/mytwilio')(ibmbluemix));

    var port = "3002";
    if (process.env.VCAP_SERVICES) {
        port = ibmconfig.getPort();
    }
    // Listen
    app.listen(port);

    logger.info('Server started at port: ' + port);


});

//redirect to cloudcode doc page when accessing the root context
app.get('/', function(req, res) {
    res.redirect('http://game-board.co/');
});
