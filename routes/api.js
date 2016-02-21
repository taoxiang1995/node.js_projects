var express = require('express');
var api = express.Router();
var request = require('request');






// if our user.js file is at app/models/user.js
var User = require('../db_user');
var Room = require('../db_room');
  
var mongoose = require('mongoose');









 //get the result from google places rest api
api.post('/join', function(req, res){
	console.log("joining");

	//-33.8670522,151.1957362

  //request.query.var_name to get the parameter.
  //suppose to get:room_num, user_name, lon, lat
  //response: room_num, room_name, array of check points, obj of user joined (name, id, lon, lat)
  var lon = req.body.lon;
  var lat = req.body.lat;
  
	//console.log(lon);
	//console.log(lat);
  var rest_api = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyA9oGIO45zHzrEwc-XuTZAT2-ltcPpDyk0&radius=500&location='+lat+','+lon;

  request.get(rest_api, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          //console.log(body); // Show the HTML for the Modulus homepage.
          console.log("got google response");
          var google_rest_result;
          google_rest_result = JSON.parse(body);
          var room_num = req.body.room_num;
		  //generate room_name
		  var room_name = "room"+req.body.room_num;
		  //generate the array of check points
		  //get the longitute and latitude
		  var lon = req.body.lon;
		  var lat = req.body.lat;

		  //build the array for nearby 5 locations
		  var location = [];

		  for (var i = 0; i<5; i++)
		  {
		    var latitude = google_rest_result.results[i].geometry.location.lat;
		    var longitude =google_rest_result.results[i].geometry.location.lng;
		    var loc = {lon: longitude, lat:latitude };
		    location.push(loc);
		  }
		  
		  /*
			*  save user info to the database.

			*/
					// create a new user called chris
				var chris = new User({
				  
				  user_name: req.body.user_name,
				  cur_location: {lon: req.body.lon, lat: req.body.lat},
				  room_num: req.body.room_num
				});



				// call the built-in save method to save to the database
				chris.save(function(err) {
				  if (err) throw err;

				  console.log('User saved successfully!');
				});

				var room = new Room({
					room_num: req.body.room_num,
					locations: location
				});


				Room.count({room_num: req.body.room_num}, function (err, count){ 
				    if(count==0){
				        room.save(function(err){
					if (err) throw err;

					console.log('Room saved successfukky!');
					});
				    }
				}); 

				//form the json
		  var back = {
		    'room_num' : room_num,
		    'room_name' : room_name,
		    'loc' : location
		  }
		  res.json(back);
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
