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
api.post('/join', function(req, res) {
	// first, check if the room exists
  	getRoom(req, function(roomResult) {
    	var user_name = req.body.user_name;
    	var found = false;
    	// check if the user already joined
		for (var i = 0; i < roomResult.users.length; i++) {
			if (roomResult.users[i].user_name == user_name) {
				found = true;
			}
		}
		// if the user haven't joined yet, add the user into room and save room
		if (!found){
			var chris = new User({
				user_name: req.body.user_name,
				lat: req.body.lat,
				lon: req.body.lon,
				progress: -1,
				check_time: -1
			});
			roomResult.users.push(chris);
			roomResult.save(function(err) {if (err) throw err;});
		}
    	res.json(roomResult);
	});
});

api.post('/update', function(request, response){
	// get the params from the urls
	var room_num = request.body.room_num;
	var user_name = request.body.user_name;
	var lat = request.body.lat;
	var lon = request.body.lon;
	var progress = request.body.progress;

	Room.findOne({room_num: room_num}, function(err, room) {
		if (err) throw err;
		// if no such room, just return a friendly message
		if (room == null) {
			response.end("No room number " + room_num + ", stupid. Or create a new room! :)");
			return;
		}

		// find the index of our dear user in the room json
		var index = room.users.map(function(d) { return d['user_name']; }).indexOf(user_name);

		// if no such user, just return a friendly message
		if (index == -1) {
			response.end("No such user " + user_name + " in room number " + room_num + ", stupid. Or join the room first! :)");
			return;
		}
		// check_time needs refresh when user makes progress
		if (progress > room.users[index].progress) {
			var d = new Date();
   			var n = d.getTime();
			room.users[index].check_time = n;
		}

		// update and save!
		room.users[index].lat = lat;
		room.users[index].lon = lon;
		room.users[index].progress = progress;
		room.save(function(err) {if (err) throw err;});
		response.json(room);
	});
});


// Helper function to get a room according to room number
function getRoom(req, cb) {
	// get room from DB, create a new one if not exist yet
	var room_num = req.body.room_num;
	Room.findOne({room_num: room_num}, function(err, room) {
		if (err) throw err;
		// if already exists, just return
		if (room != null) {
			cb(room);
			console.log(room);
		}
		// if dont exist yet, create a new room using the user's lon, lat
 		else {
			// send google place request
			var lon = req.body.lon;
			var lat = req.body.lat;
			var rest_api = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyA9oGIO45zHzrEwc-XuTZAT2-ltcPpDyk0&radius=500&location='+lat+','+lon;
			var location = [];

  			request.get(rest_api, function (error, response, body) {
		      	if (!error && response.statusCode == 200) {
			        //console.log(body); // Show the HTML for the Modulus homepage.
			        //console.log("got google response");
					var google_rest_result = JSON.parse(body);

					//build the array for nearby 5 locations
					// make the cycle!
					var start_point = {lon: lon, lat: lat};
					location.push(start_point);
					// filter the results that's too far away
					var filtered_places = google_rest_result.results.filter(function(d) { 
						return checkpoint_valid(start_point.lat, start_point.lon, d.geometry.location.lat, d.geometry.location.lng);
					});

					console.log('# of valid checkpoints' + filtered_places.length + '/' + google_rest_result.results.length);

					// choose 3 random locations!
					var num_checkpoints = 3;
					var indexes;
					if (filtered_places.length <= num_checkpoints) {
						// just use all we got if not enough results
						indexes = Array(num_checkpoints).fill().map((x,i)=>i);
					} else {
						// randomly pick checkpoints
						indexes = pick(num_checkpoints, 0, filtered_places.length - 1);
					}
					
					for (var i = 0; i < indexes.length; i++) {
						var latitude = filtered_places[indexes[i]].geometry.location.lat;
						var longitude = filtered_places[indexes[i]].geometry.location.lng;
						var loc = {lon: longitude, lat:latitude};
						location.push(loc);
					}
					location.push(start_point);

					var room_obj = new Room({
						room_num: room_num,
						locations: location
					});

					room_obj.save(function(err){
						if (err) throw err;
					});
					console.log('created new room:'+room_obj);
					cb(room_obj);
				}
			});
		}
	});
}


function pick(n, min, max){
    var values = [], i = max;
    while(i >= min) values.push(i--);
    var results = [];
    var maxIndex = max;
    for(i=1; i <= n; i++){
        maxIndex--;
        var index = Math.floor(maxIndex * Math.random());
        results.push(values[index]);
        values[index] = values[maxIndex];
    }
    return results;
}

function checkpoint_valid (current_lat, current_lng, cp_lat, cp_lng) {
	// 5km is too far away
	var a = getDistanceFromLatLonInKm(current_lat, current_lng, cp_lat, cp_lng);
	// console.log(a+'km');
	return (a < 5);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

module.exports = api;
