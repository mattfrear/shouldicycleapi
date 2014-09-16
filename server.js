// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express'); 		// call express
var app        = express(); 				// define our app using express
var request    = require('request');        // https://github.com/mikeal/request
var async      = require('async');          // http://www.sebastianseilund.com/nodejs-async-in-practice

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
			    async.forEach(airQualityArray, function(airQuality, airQualityCallback) {
			        getAirQuality(airQuality, shouldicycle, airQualityCallback);
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

function getWeather(location, shouldicycle, callback) {
    var url = 'http://api.openweathermap.org/data/2.5/forecast?q=' + location + '&units=metric';
    request({ uri : url, json : true }, function (error, response, body) {
        console.log('Weather for ' + location + ' ' + response.statusCode + ' ' + body.length);
        if (error) return callback(error);
        shouldicycle.city = body.city.name;
        var closestForecast = calcClosestForecast(body.list);
        shouldicycle.temp = Math.round(closestForecast.main.temp);
        shouldicycle.symbol = closestForecast.weather[0].icon;
        shouldicycle.windDegree = Math.round(closestForecast.wind.deg);
        shouldicycle.windDirection = "todo";
        shouldicycle.windSpeed = Math.round(closestForecast.wind.speed);
		callback();
	});
};

function calcClosestForecast(forecasts) {
    var nowInSeconds = Math.round(Date.now() / 1000);
    var closest = 0;
    var closestDiff = Math.abs(nowInSeconds - forecasts[0].dt);
    for (var i = 1; i < forecasts.length; i++) {
        var diff = Math.abs(nowInSeconds - forecasts[i].dt);
        if (diff < closestDiff) {
            closest = i;
            closestDiff = diff;
        }
    }

    return forecasts[closest];
}

function getAirQuality(airQuality, shouldicycle, callback) {
    var url = 'http://api.erg.kcl.ac.uk/AirQuality/Hourly/MonitoringIndex/SiteCode=' + airQuality.toUpperCase() + '/Json';

    request({ uri : url, json : true }, function(error, response, body) {
        // console.log('Air quality for ' + airQuality + ' ' + response.statusCode + ' ' + JSON.stringify(body));
        if (error) return callback(error);
        if (body && body.HourlyAirQualityIndex && body.HourlyAirQualityIndex.LocalAuthority && body.HourlyAirQualityIndex.LocalAuthority.Site && body.HourlyAirQualityIndex.LocalAuthority.Site.species) {
            var site = body.HourlyAirQualityIndex.LocalAuthority.Site;
            site.species.forEach(function(species) {
                var pollution = { name: site['@SiteCode'], speciesCode: species['@SpeciesCode'], airQualityIndex: species['@AirQualityIndex'] };
                shouldicycle.pollution.push(pollution);
            });
        }
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