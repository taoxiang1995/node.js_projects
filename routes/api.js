var express = require('express');
var api = express.Router();
var request = require('request');

// if our user.js file is at app/models/user.js
var User = require('../db_user');
var Room = require('../db_room');
var Twitter = require('twitter');
  
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
api.post('/adwords', function(req, res) {
	
	// first, check if the room exists
  	getRoom(req, function(roomResult) {
    	
    	res.json(roomResult);
	});
});


api.post('/locations', function(req, res) {
	
	// first, check if the room exists
  	getLocation(req, function(result) {
    	
    	res.json(result);
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

	//var key_word = req.body.key_word;
	var key_word = req.headers.key_word;
	//var key_word = 'LA';
	console.log(key_word);
	

	var client = new Twitter({
		  consumer_key: 'KsRUqkY9CZO1Y3rpJLEABgPKB',
		  consumer_secret: 'PVxUcF3YNKxxSv5wsTE4kIOCwshJZSKSkAAfCVxj8OJlgVNNJN',
		  access_token_key: '726422661841055745-KMgta1tZtaMDeYpAy8QoWEHpAMvmZQ4',
		  access_token_secret: '0fjmsNnaRFobzhFi4Hs4fIuHwQAk6Z6adFs1wFLulRFgI'
		});

	var params = {screen_name: 'nodejs'};
	client.get('search/tweets.json?q=%23'+key_word+'&result_type=recent', params, function(error, tweets, response){
	  if (!error) {

	    var final_result = [];

	    var tweet_result=[];
	    for (var i =0; i<tweets.statuses.length; i++)
	    {
	    	tweet_result[i] = tweets.statuses[i].text;
	    }

	    for (var i=0; i<tweet_result.length; i++)
	    {
	    	for (var b = 0; b<tweet_result[i].length; b++)
	    	{
	    		var hashtags="";
		    	//tweet_result[i]
		    	//console.log(tweet_result[i]);
		    	if (tweet_result[i][b]=="#")
		    	{
		    		for (b=b; tweet_result[i][b]!=' '&&b<tweet_result[i].length; b++)
		    		{
		    			//console.log(tweet_result[i][b]);
		    			hashtags = hashtags + tweet_result[i][b];
		    			//hashtags = hashtags.concat(tweet_result[i][b]);
		    		}
		    		b--;
		    		final_result.push(hashtags);
		    	}
	    	}
	    	    	
	    }

    //final_result is the array contain all the hashtag
    for (var i=0; i<final_result.length; i++)
    {
    	for (var b=i+1; b<final_result.length; b++)
    	{
    		if (final_result[i]==final_result[b])
    		{
    			final_result.splice(b, 1);
    		}
    	}
    }

    cb(final_result);
  }
});
}


// Helper function to get a room according to room number
function getLocation (req, cb) {
	// get room from DB, create a new one if not exist yet
	var room_num = req.body.room_num;
	Room.findOne({room_num: room_num}, function(err, room) {
		if (err) throw err;
		// if already exists, just return
		
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

					// //build the array for nearby 5 locations
					// // make the cycle!
					// var start_point = {lon: lon, lat: lat};
					// location.push(start_point);
					// // filter the results that's too far away
					// var filtered_places = google_rest_result.results.filter(function(d) { 
					// 	return checkpoint_valid(start_point.lat, start_point.lon, d.geometry.location.lat, d.geometry.location.lng);
					// });

					// console.log('# of valid checkpoints' + filtered_places.length + '/' + google_rest_result.results.length);

					// // choose 3 random locations!
					// var num_checkpoints = 3;
					// var indexes;
					// if (filtered_places.length <= num_checkpoints) {
					// 	// just use all we got if not enough results
					// 	indexes = Array(num_checkpoints).fill().map((x,i)=>i);
					// } else {
					// 	// randomly pick checkpoints
					// 	indexes = pick(num_checkpoints, 0, filtered_places.length - 1);
					// 	console.log(JSON.stringify(indexes));
					// }
					
					// for (var i = 0; i < indexes.length; i++) {
					// 	var latitude = filtered_places[indexes[i]].geometry.location.lat;
					// 	var longitude = filtered_places[indexes[i]].geometry.location.lng;
					// 	var loc = {lon: longitude, lat:latitude};
					// 	location.push(loc);
					// }
					// location.push(start_point);

					// var room_obj = new Room({
					// 	room_num: room_num,
					// 	locations: location
					// });

					// room_obj.save(function(err){
					// 	if (err) throw err;
					// });
					// console.log('created new room:'+room_obj);
					var final = [];
					for (var i=0; i<google_rest_result.results.length; i++)
					{
						final.push(google_rest_result.results[i].name)
					}
					cb(final);
				}
			});
		}
	});

}

module.exports = api;
