// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var request    = require('request');
var async      = require('async');

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

router.get('/cycle', function(req, res) {
	var location = req.query.location;
	var airQuality = req.query.airquality;
	var shouldicycle = {};

	async.parallel([
		// Get weather
		function(callback) {
			if (location) {
				getWeather(location, shouldicycle, callback);
			}
		},
		// Get airquality - todo, use async.forEach instead?
		function(callback) {
			if (airQuality) {
        		getAirQuality(airQuality, shouldicycle, callback);
    		}
		}
	]);

	res.json(shouldicycle);	
});

function getWeather(location, shouldicycle, callback) {
	request('http://api.openweathermap.org/data/2.5/forecast?q=' + location + '&units=metric', function (error, response, body) {
		console.log('Looking up weather for ' + location);
		console.log(response.statusCode + ' ' + body.length + ' bytes');
		if (error) return callback(error);
		shouldicycle.temp = 'todo';
		callback();
	});
};

function getAirQuality(airQuality, shouldicycle, callback) {
    airQuality.forEach(function(entry) {
        request('http://api.erg.kcl.ac.uk/AirQuality/Hourly/MonitoringIndex/SiteCode=' + entry + '/Json', function(error, response, body) {
            console.log('Looking up air quality for ' + entry);
            console.log(response.statusCode + ' ' + body.length + ' bytes');
    		if (error) return callback(error);
			shouldicycle.airQuality = 'todo';
			callback();
        });
    });
}

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);