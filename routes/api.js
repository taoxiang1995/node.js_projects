var express = require('express');
var api = express.Router();
var request = require('request');

 //get the result from google places rest api
api.post('/join', function(request, response){
  //request.query.var_name to get the parameter.
  //suppose to get:room_num, user_name, lon, lat
  //response: room_num, room_name, array of check points, obj of user joined (name, id, lon, lat)
  request.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyA9oGIO45zHzrEwc-XuTZAT2-ltcPpDyk0&radius=500&location=-33.8670522,151.1957362', function (error, response, body) {
      if (!error && response.statusCode == 200) {
          //console.log(body); // Show the HTML for the Modulus homepage.
          console.log("got google response");
          var google_rest_result;
          google_rest_result = JSON.parse(body);
          var room_num = request.body.room_num;
		  //generate room_name
		  var room_name = "room"+request.body.room_num;
		  //generate the array of check points
		  //get the longitute and latitude
		  var lon = request.body.lon;
		  var lat = request.body.lat;


		  //build the array for nearby 5 locations
		  var locations = [];

		  for (var i = 0; i<5; i++)
		  {
		    var latitude = google_rest_result.results[i].geometry.location.lat;
		    var longitude =google_rest_result.results[i].geometry.location.lng;
		    var loc = {lon: longitude, lat:latitude };
		    locations.push(loc);
		  }
		  //form the json
		  var back = {
		    'room_num' : room_num,
		    'room_name' : room_name,
		    'loc' : locations
		  }
		  response.json(back);
		}
	});

});


api.get('/update', function(request, response){
  //form the json
  var back = {
    'room_num' : room_num,
    'room_name' : room_name
  }
  response.json(back);
});

module.exports = api;
