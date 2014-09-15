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
	var airQualities = req.query.airquality;
	var shouldicycle = {};
	shouldicycle.pollution = [];

	async.parallel([
		// Get weather
		function(callback) {
			if (location) {
				getWeather(location, shouldicycle, callback);
			}
			else {
				callback();
			}
		},
		// Get airquality
		function(callback) {
			if (airQualities) {
				var airQualityArray = airQualities.split(',');
				async.forEach(airQualityArray, function(airQuality, callback) {
	        		getAirQuality(airQuality, shouldicycle, callback);
				}, callback)
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

function getWeather(location, shouldicycle, callback) {
	request('http://api.openweathermap.org/data/2.5/forecast?q=' + location + '&units=metric', function (error, response, body) {
		console.log('Weather for ' + location + ' ' + response.statusCode + ' ' + body.length + ' bytes');
		if (error) return callback(error);
		shouldicycle.temp = 'todo';
		callback();
	});
};

function getAirQuality(airQuality, shouldicycle, callback) {
    request('http://api.erg.kcl.ac.uk/AirQuality/Hourly/MonitoringIndex/SiteCode=' + airQuality.toUpperCase() + '/Json', function(error, response, body) {
        console.log('Air quality for ' + airQuality + ' ' + response.statusCode + ' ' + body.length + ' bytes');
		if (error) return callback(error);
		shouldicycle.pollution.push({ airQuality : 'todo'});
		callback();
    });
}

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);