// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var request    = require('request');

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
	var airquality = req.query.airquality;
	var weather = {};
	if (location.length > 0) {
		var weather = getWeather(location);
	}
	
	res.json({ location: location, airquality: airquality, weather: weather });	
});

function getWeather(location) {
	request('http://api.openweathermap.org/data/2.5/forecast?q=' + location + '&units=metric', function (error, response, body) {
		console.log('Looking up weather for ' + location);
		console.log(response);
	});
};

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);