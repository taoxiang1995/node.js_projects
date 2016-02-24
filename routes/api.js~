var express = require('express');
var api = express.Router();
var request = require('request');

// if our user.js file is at app/models/user.js
var User = require('../db_user');
var Room = require('../db_room');
  
var mongoose = require('mongoose');
var mongo_uri = process.env.MONGOLAB_URI;
var uriUtil = require('mongodb-uri');
var mongo = require('mongodb');
var mongooseUri = uriUtil.formatMongoose(mongo_uri); 
mongoose.connect(mongooseUri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function(){
  // console.log("connected to mongo");
  // Email.find({},function(err, emails){
  //     if(err){
  //       console.log("error" + err);
  //     }else{
  //       console.log("emails " +emails);
  //     }
  //   });
  // Order.find({},function(err, emails){
  //     if(err){
  //       console.log("error" + err);
  //     }else{
  //       console.log("orders: " +emails);
  //     }
  //   });
});



// mongoose.connect('mongodb://localhost:27017/users');


/*
*  input: http://localhost3000/join room_num lon lat user_name
	back: a json package, contains room_num, user_name, five check points locations
	*/
api.post('/join', function(req, res){
  
  var rest_api = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyA9oGIO45zHzrEwc-XuTZAT2-ltcPpDyk0&radius=500&location='+req.body.lat+','+req.body.lon;

  request.get(rest_api, function (error, response, body) {
      if (!error && response.statusCode == 200) {
          //console.log(body); // Show the HTML for the Modulus homepage.
          //console.log("got google response");
         
          var google_rest_result = JSON.parse(body);
          var room_num = req.body.room_num;
		  
		  //generate the array of check points
		  //get the longitute and latitude
		  var lon = req.body.lon;
		  var lat = req.body.lat;

		  //build the array for nearby 5 locations
		  var location = [];

		  for (var i = 0; i<5 && i<  google_rest_result.results.length; i++)
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
				});

				var room_obj = new Room({
					room_num: req.body.room_num,
					locations: location
				});
				
				var list_of_locations;
				//get the 5 locations from the database.

				Room.findOne({ room_num:  req.body.room_num}, 'locations', function(err, locs) {
				  if (err) throw err;
				  //console.log(locs.locations);
				  list_of_locations = locs.locations;
				  //console.log(list_of_locations);

				  // object of the user
				  if (locs == null)
				  {
				  	room_obj.save(function(err){
				 	if (err) throw err;
				 	//list_of_locations = locs.locations;
				 	//console.log('Room saved successfukky!');
				 	});
				  }
				  				  //console.log(list_of_locations);
					});


				    var locationss = Room.findOne({room_num: req.body.room_num});
					locationss.select('locations');

				    locationss.exec(function (err, person) {
						if (err) return handleError(err);
						list_of_locations =  person.locations;
						var back = {
							'room_num' : room_num,
							'user_name' : req.body.user_name,
							//'loc' : location,
							'5_loc': list_of_locations
							}
							res.json(back);

							})
		}
	});


});


/*
*	
*/

api.post('/update', function(request, response){
  //form the json
  var back = {
    'room_num' : room_num,
    'room_name' : room_name
  }
  response.json(back);
});

module.exports = api;
