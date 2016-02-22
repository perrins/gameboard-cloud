/*
*  Licensed Materials - Property of Gameboard
*  5725-I43 (C) Copyright Gameboard. 2011,2016. All Rights Reserved.
*  UK Government Users Restricted Rights - Use, duplication or
*  disclosure restricted by GSA ADP Schedule Contract with Gameboard.
*
*  Manage the REST Services for the Gameboard Mobile App
*
*/

var loopback = require('loopback'),
    boot = require('loopback-boot'),
    logger = require('winston');
    colors = require('colors'),
    _ = require('lodash'),
    cookieParser = require('cookie-parser'),
    fs = require("fs"),
    appConfig = JSON.parse(fs.readFileSync(process.cwd()+'/appconfig.json', 'utf8')),
    pkg = JSON.parse(fs.readFileSync(process.cwd()+'/package.json', 'utf8')),
    express = require("express"),
    logger = require('winston'),
    pkgcloud = require('pkgcloud-bluemix-objectstorage');

logger.info(" _____ _                 _ ".red);
logger.info("/  __ \\ |               | |".red);
logger.info("| /  \\/ | ___  _   _  __| |".red);
logger.info("| |   | |/ _ \\| | | |/ _` |".red);
logger.info("| \\__/\\ | (_) | |_| | (_| |".red);
logger.info(" \\____/_|\\___/ \\__,_|\\__,_|".red);

logger.info('');
logger.info('** Gameboard Cloud Server ***');
logger.info('Version : '+ pkg.version.red +' (Alpha)');
logger.info('');

// Global Config for access to Cloudant
var dbconfig = {
    clurl: null,
    cookies: {}
};

var objs = null;
if (process.env.VCAP_SERVICES) {
    var services = JSON.parse(process.env.VCAP_SERVICES);
    objs = services['Object-Storage'][0];
} else {
    // Specify local Postgresql connection properties here.
    objs =
            {
                "name": "gameboard-cloud-objects",
                "label": "Object-Storage",
                "plan": "Beta",
                "credentials": {
                    "auth_url": "https://identity.open.softlayer.com",
                    "project": "object_storage_f5ddf4ee_f7d8_491f_b87a_b683b921c7df",
                    "projectId": "b782d65489024ce5a785d80cc2bf908d",
                    "region": "dallas",
                    "userId": "04f499d9ef3e43bda29e46f2df9dcd7a",
                    "username": "admin_f5ddf4ee-f7d8-491f-b87a-b683b921c7df_4db867286d76",
                    "password": "Tz(KhpX.86fqC3og",
                    "domainId": "1040acb5f7c6470095ae3ad5592a418b",
                    "domainName": "839541"
                }
            };

}

if (_.isNull(objs)) {
    logger.error("Object Storage configuraiton is not valid");
    exit;
}


// Create a LoopBack instance
var app = module.exports = loopback();

//redirect to cloudcode doc page when accessing the root context
//app.get('/', function(req, res) {
//    res.redirect('http://game-board.co/');
//});


// ------------ Protecting mobile backend with Mobile Client Access start -----------------
/*
// Load passport (http://passportjs.org)
var passport = require('passport');

// Get the MCA passport strategy to use
var MCABackendStrategy = require('bms-mca-token-validation-strategy').MCABackendStrategy;

// Tell passport to use the MCA strategy
passport.use(new MCABackendStrategy())

// Tell application to use passport
app.use(passport.initialize());

// Protect DELETE endpoint so it can only be accessed by HelloTodo mobile samples
app.delete('/api/Items/:id', passport.authenticate('mca-backend-strategy', {session: false}));

// Protect /protected endpoint which is used in Getting Started with Bluemix Mobile Services tutorials
app.get('/protected', passport.authenticate('mca-backend-strategy', {session: false}), function(req, res){
	res.send("Hello, this is a protected resouce of the mobile backend application!");
});

*/
// ------------ Protecting backend APIs with Mobile Client Access end -----------------

app.serverInit = function() {

    // init service sdks
    app.use(function(req, res, next) {

        console.log("Original Url: "+req.originalUrl); // '/admin/new'
        console.log("Base Url: "+req.baseUrl); // '/admin'
        console.log("Path:"+req.path); // '/new'

        req.appConfig = appConfig;
        req.logger = logger;
        next();
    });

    // constructing configuration for pkgcloud - pulls information from VCAP_SERVICES (objs)
    var config = {};

    config.provider = "openstack";
    config.authUrl = 'https://identity.open.softlayer.com/';
    config.region= 'dallas';
    config.useServiceCatalog = true;
    // true for apps inside bluemix, otherwise false
    config.useInternal = false;
    config.tenantId = objs.credentials.projectId;
    config.userId = objs.credentials.userId;
    config.username = objs.credentials.username;
    config.password = objs.credentials.password;
    config.auth = {
        forceUri  : "https://identity.open.softlayer.com/v3/auth/tokens",
        // use public for apps outside bluemix and internal for apps inside bluemix
        interfaceName : "public",
        "identity": {
            "methods": [
                "password"
            ],
            "password": {
                "user": {
                    "id": objs.credentials.userId,
                    "password": objs.credentials.password
                }
            }
        },
        "scope": {
            "project": {
                "id": objs.credentials.projectId
            }
        }
    };

    // creates a pkgcloud storage client
    var storageClient = pkgcloud.storage.createClient(config);
    storageClient.auth(function (error) {
        if (error) {
            console.error("storageClient.auth() : error creating storage client: ", error);
        }
        else {
            // creates a proxy server if the storage client successfully authenticates
            // we are going to send up the endpoint /dam/:container/:downFile to connect to our object storage on bluemix
            var proxyRouter = express.Router();
            app.use('/api/objects', proxyRouter);

            app.get('/api/objects/:container/:downFile', function(req, res) {
                // this is using the pkgcloud api - we are piping the requested file from the requested container into the response
                storageClient.download({
                    container: req.params.container,
                    remote: req.params.downFile
                }).pipe(res);
            });
        }
    });

    // Load the Notification System
    //var notify = require("./lib/notify")(appConfig,logger);

    // Authenticate with Cloudant
    // Load Nano
    logger.info("Starting Router...");

    // Lets parse the Services from VCAP into
    var bmServices = [];
    if(!_.isUndefined(process.env.VCAP_SERVICES)) {
        bmServices = JSON.parse(process.env.VCAP_SERVICES);
    }

    // Get the VCAP Services From Bluemix
    var service = bmServices['cloudantNoSQLDB'];

    // If this is not defined then it means we are running locally
    if ( _.isUndefined(service) ) {
        creds = appConfig.cloudantDb;
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

    // Define Global Variables for Routes
    global.dbconfig = dbconfig;
    global.appConfig = appConfig;
    //global.notify = notify;
    global.nano = nano;
    global.logger = logger;

    logger.info("Authenticating with nano...");

    // Register the Routes that need to configured for Cloudant access
    var routes = function() {

        // Setup Notify System and the defer into setting up the rest of the system
        //notify.init().then(function(){

        // Check where we are getting data from
        if(appConfig.local) {
            logger.info ("ACCESSING LOCAL STUBS...")
        } else {
            logger.info ("ACCESSING BLUEMIX !!!")
        }

        logger.info("Registering Routes...");

        // REGISTER CLOUDANT Based Routes pass Notification service into them
        var routers = [
            "favourites",
            "bookmarks",
            "youtube",
            "members",
            "search",
            "social"
        ];

        // Register the Routes with the App Context
        routers.forEach(function (router) {

            // Moved these imports etc into global object.
            logger.info("Registering: " + router.yellow);
            app.use("/", require("./routes/" + router)());

        });

        //notify.send(["setup"], {"initilized":true});
        logger.info("Routes Registered !!".green);
        logger.info("Server Ready ..... bring it on !".green)

    };

    // Check if we are local
    if (appConfig.local) {
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

};

app.storageInit = function() {

    // constructing configuration for pkgcloud - pulls information from VCAP_SERVICES (objs)
    var config = {};

    config.provider = "openstack";
    config.authUrl = 'https://identity.open.softlayer.com/';
    config.region= 'dallas';
    config.useServiceCatalog = true;
    // true for apps inside bluemix, otherwise false
    config.useInternal = false;
    config.tenantId = objs.credentials.projectId;
    config.userId = objs.credentials.userId;
    config.username = objs.credentials.username;
    config.password = objs.credentials.password;
    config.auth = {
        forceUri  : "https://identity.open.softlayer.com/v3/auth/tokens",
        // use public for apps outside bluemix and internal for apps inside bluemix
        interfaceName : "public",
        "identity": {
            "methods": [
                "password"
            ],
            "password": {
                "user": {
                    "id": objs.credentials.userId,
                    "password": objs.credentials.password
                }
            }
        },
        "scope": {
            "project": {
                "id": objs.credentials.projectId
            }
        }
    };

    // creates a pkgcloud storage client
    var storageClient = pkgcloud.storage.createClient(config);
    storageClient.auth(function (error) {
        if (error) {
            console.error("storageClient.auth() : error creating storage client: ", error);
        }
        else {
            // creates a proxy server if the storage client successfully authenticates
            // we are going to send up the endpoint /dam/:container/:downFile to connect to our object storage on bluemix
            var proxyRouter = express.Router();
            app.use('/dam', proxyRouter);

            app.get('/dam/:container/:downFile', function(req, res) {
                // this is using the pkgcloud api - we are piping the requested file from the requested container into the response
                storageClient.download({
                    container: req.params.container,
                    remote: req.params.downFile
                }).pipe(res);
            });
        }
    });

}

app.start = function () {

	// start the web server
	return app.listen(function () {

 		app.emit('Started !');

        //Use Bluemix host and port ...
        var host = process.env.VCAP_APP_HOST || 'localhost';
        var port = process.env.VCAP_APP_PORT || 3001;

        // Initialise the none Strong Loop Routes and Services
        app.serverInit();

        // Initialize the Storage Proxy
        app.storageInit();

        // Initialize the Explorer
        var baseUrl = app.get('url').replace(/\/$/, '');
		logger.info('Web server listening at: %s', baseUrl);
		var componentExplorer = app.get('loopback-component-explorer');
		if (componentExplorer) {
			console.log('Browse your REST API at %s%s', baseUrl, componentExplorer.mountPath);
		}

	});

};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
	if (err) throw err;
	if (require.main === module)
		app.start();
});
