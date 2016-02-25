// grab the things we need
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
	id: Number,
  	user_name: String,
	lon: Number,
	lat: Number,
	progress: Number,
	check_time: Number
});



// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);



// make this available to our users in our Node applications
module.exports = User;
