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
  console.log(req)
  res.json({
          success: true,
          message: 'Enjoy your token!',
          token: "HelloWorld"
  });
  console.log("Posted a Goal");
});

/* REAL TIME PART  */
io.on('connection', function(socket){
  console.log('a user connected');
  io.sockets.emit( 'newConnection' );

  socket.on('onNameChange', function(msg){
    for (var i = 0; i < msg.length; i++) {
      if (msg[i].name != '') {
        console.log(msg[i].name);
      }
    }
  });

  socket.on('onPlayerCall', function(msg){
   console.log(msg)
  });

  socket.on('onStartMatch', function(msg){
   console.log(msg)
  });

  socket.on('onGoal', function(msg){
   socket.emit('onStopMatch', function(msg){
    console.log(msg)
   });
  });

  socket.on('onStopMatch', function(msg){
   console.log(msg)
  });

});


http.listen(port);
console.log('Magic happens on port ' + port);
