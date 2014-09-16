// weather.js

// call the packages we need
var request = require('request');        // https://github.com/mikeal/request

module.exports = {

    lookupCurrentWeather: function (location, shouldicycle, callback) {
        var url = 'http://api.openweathermap.org/data/2.5/weather?q=' + location + '&units=metric';
        request({ uri : url, json : true }, function (error, response, body) {
            // console.log('Weather for ' + location + ' ' + response.statusCode + ' ' + body.length);
            if (error) return callback(error);
            shouldicycle.city = body.name;
            shouldicycle.temp = Math.round(body.main.temp);
            shouldicycle.symbol = body.weather[0].icon;
            shouldicycle.windDegree = Math.round(body.wind.deg);
            shouldicycle.windDirection = degToCompass(shouldicycle.windDegree);
            shouldicycle.windSpeed = Math.round(body.wind.speed);
            callback();
        });
    },

    lookupAirQuality: function (airQuality, shouldicycle, callback) {
        var url = 'http://api.erg.kcl.ac.uk/AirQuality/Hourly/MonitoringIndex/SiteCode=' + airQuality.toUpperCase() + '/Json';
    
        request({ uri : url, json : true }, function (error, response, body) {
            // console.log('Air quality for ' + airQuality + ' ' + response.statusCode + ' ' + JSON.stringify(body));
            if (error) return callback(error);
            if (body && body.HourlyAirQualityIndex && body.HourlyAirQualityIndex.LocalAuthority && body.HourlyAirQualityIndex.LocalAuthority.Site && body.HourlyAirQualityIndex.LocalAuthority.Site.species) {
                var site = body.HourlyAirQualityIndex.LocalAuthority.Site;
                site.species.forEach(function (species) {
                    var pollution = { name: site['@SiteCode'], speciesCode: species['@SpeciesCode'], airQualityIndex: species['@AirQualityIndex'] };
                    shouldicycle.pollution.push(pollution);
                });
            }
            callback();
        });
    }
}

var degToCompass = function (num) {
    var val = Math.floor((num / 22.5) + 0.5);
    var arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}
