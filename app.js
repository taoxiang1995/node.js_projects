var express = require ('express');
var request = require ('request');
var bodyParser = require('body-parser');

var app = express();
var api = require('./routes/api');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use('/', api);

app.listen(3000, function(){
  console.log('Listening on port 3000');
});