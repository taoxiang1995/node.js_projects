var express = require ('express');
var request = require ('request');
var bodyParser = require('body-parser');

var app = express();
var api = require('./routes/api');



//lets require/import the mongodb native drivers.
var mongodb = require('mongodb');

//We need to work with "MongoClient" interface in order to connect to a mongodb server.
var MongoClient = mongodb.MongoClient;

// Connection URL. This is where your mongodb server is running.
var url = 'mongodb://localhost:27017/users';

// Use connect method to connect to the Server


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/', api);

var port = Number(process.env.PORT || 3000 );

app.listen(3000, function(){
  console.log('Listening on port 3000');
});