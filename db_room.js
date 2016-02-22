// grab the things we need
var mongoose = require('mongoose');

var Schema2 = mongoose.Schema;

// create a schema


var roomSchema = new Schema2({
  room_num: Number,
  locations :[{lat: Number, lon: Number}]
});

// the schema is useless so far
// we need to create a model using it

var Room = mongoose.model('Room', roomSchema);


// make this available to our users in our Node applications
module.exports = Room;
