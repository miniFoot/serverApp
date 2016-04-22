var express    = require('express');        // call express
var app        = express();                 // define our app using express
var http       = require('http').Server(app);
var io         = require('socket.io')(http);
var Twit       = require('twit');
var bodyParser = require('body-parser');

app.use(express.static('public'));
var port = process.env.PORT || 8080;


var T = new Twit({
  consumer_key:         '...',
  consumer_secret:      '...',
  access_token:         '...',
  access_token_secret:  '...'
})

/* WEB PART */
app.get('*', function(req, res) {
       res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
   });


/* ARDUINO PART */
app.post('/newGoal', function(req,res){
  res.json({
          success: true,
          message: 'Enjoy your token!',
          token: "HelloWorld"
  });

});

/* REAL TIME PART  */
io.on('connection', function(socket){
  console.log('a user connected');
});


http.listen(port);
console.log('Magic happens on port ' + port);
