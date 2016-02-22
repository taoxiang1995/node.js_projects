

API CALLS:

http://localhost3000/join
prams: room_num lon lat user_name

respons a json back Ex:
{
  "room_num": "5",
  "user_name": "taoxiang",
  "5_loc": [
    {
      "lon": -118.459463,
      "lat": 34.1002455,
      "_id": "56ca4fbeaf98b1a7a6046901"
    },
    {
      "lon": -118.4469123,
      "lat": 34.0703581,
      "_id": "56ca4fbeaf98b1a7a6046900"
    },
    {
      "lon": -118.4482626,
      "lat": 34.0720941,
      "_id": "56ca4fbeaf98b1a7a60468ff"
    },
    {
      "lon": -118.4479914,
      "lat": 34.07007530000001,
      "_id": "56ca4fbeaf98b1a7a60468fe"
    },
    {
      "lon": -118.4507061,
      "lat": 34.075016,
      "_id": "56ca4fbeaf98b1a7a60468fd"
    }
  ]
}




Data base structure:
there are two collections, user collection and room collection
=>for user collection:
{
  id: Number,
  user_name: String,
  cur_location: {lon: Number, lat: Number},
  room_num: Number
}
=>for room collection
{
  room_num: Number,
  locations :[{lat: Number, lon: Number}]
}