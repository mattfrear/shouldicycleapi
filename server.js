// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var async      = require('async');          // http://www.sebastianseilund.com/nodejs-async-in-practice
var weather    = require('./weather.js');

var port = process.env.PORT || 8080; 		// set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router(); 				// get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
	// do logging
	console.log('Something is happening.');
	next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
	res.json({ message: 'hooray! welcome to our cycle api!' });	
});

router.get('/cycle', function(req, res, next) {
	var location = req.query.location;
	var airQualities = req.query.airquality;
	var shouldicycle = {};
	shouldicycle.pollution = [];

	async.parallel([
		// Get weather
		function(callback) {
			if (location) {
				weather.lookupCurrentWeather(location, shouldicycle, callback);
			}
			else {
				callback();
			}
		},
		// Get airquality
		function(callback) {
			if (airQualities) {
				var airQualityArray = airQualities.split(',');
			    async.forEach(airQualityArray, function(airQuality, airQualityCallback) {
			        weather.lookupAirQuality(airQuality, shouldicycle, airQualityCallback);
			    }, callback);
			}
			else {
				callback();
			}
		}
	], 
	// This is called when weather and airquality are done
	function(err) {
		if (err) return next(err);
		res.json(shouldicycle);	
	});
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);