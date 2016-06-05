var express    = require('express');        // call express
var app        = express();                 // define our app using express
var http       = require('http').Server(app);
var io         = require('socket.io')(http);
var Twit       = require('twit');
var bodyParser = require('body-parser');
var fs         = require('fs');
var sentences  = require("./sentence.json");

/***** A VOIR ****/
/*
Emoji
Phrase
Fin mockup.

Rechercher un autre capteur
credit

*/
/****/
app.use(express.static('public'));
var port = process.env.PORT || 8080;

var lastBut;
var lastGoalRed, lastGoalBlue;
var blueScore = 0;
var redScore = 0;
var playing = false;
var player = [
          this.one = {
            name : ""
          },
          this.two = {
            name : ""
          },
          this.three = {
            name : ""
          },
          this.four = {
            name : ""
          }
        ]

var str = "I have a cat, a dog, and a goat.";


var replacePlayer = function(sentenceTw){
  if(lastGoalRed){
    var mapObj = {
     red_play1: "@"+ player[2].name,
     red_play2:"@"+ player[3].name,
     blue_play1: "@"+ player[0].name,
     blue_play2: "@"+ player[1].name,
     scoringteam_play1 :"@"+ player[2].name,
     scoringteam_play2 :"@"+ player[3].name ,
     loosingteam_play1 : "@"+ player[0].name,
     loosingteam_play2 : "@"+ player[1].name
    };
  }else{
    var mapObj = {
     red_play1: "@"+ player[2].name,
     red_play2:"@"+ player[3].name,
     blue_play1: "@"+ player[0].name,
     blue_play2: "@"+ player[1].name,
     scoringteam_play1 :"@"+ player[0].name,
     scoringteam_play2 :"@"+ player[1].name ,
     loosingteam_play1 : "@"+ player[2].name,
     loosingteam_play2 : "@"+ player[3].name
    };
  }
  var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
  sentenceTw = sentenceTw.replace(re, function(matched){
    return mapObj[matched];
  });
  return  sentenceTw;
}

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

var jsonParser = bodyParser.json()
app.use(bodyParser.json({ type: 'application/*+json' }));

/* REAL TIME PART  */
io.on('connection', function(socket){
  console.log('a user connected');
  io.sockets.emit( 'newConnection' );

  app.post('/newgoal',jsonParser, function(req,res){
    console.log(req.body);


    if(req.body.redGoal>0){
      redScore += 1;
      lastGoalRed =true;
    }else{
      blueScore +=1;
      lastGoalRed =false ;
    }

    if(player[1].name !=""){
      var newTwit = sentences.twoVtwo[(Math.random() * sentences.twoVtwo.length) |0];
      var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
      T.post('statuses/update', { status:tw}, function(err, data, response) {
      })
    }else{
        var newTwit = sentences.oneVone[(Math.random() * sentences.oneVone.length) |0];
        var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
        console.log(tw);
        T.post('statuses/update', { status:tw}, function(err, data, response) {
        })
      }
    console.log("Posted a Goal");
    lastBut = Date.now();
    res.json({
            success: true,
            message: 'All is fine'
    });
  });



  socket.on('onNameChange', function(msg){
   console.log("Name Changed")
    for (var i = 0; i < msg.length; i++) {
        player[i].name = msg[i].name;
    }

    if(player[1].name!= "" && player[3].name!= ""){
      var newTwit = sentences.launchTwo[( Math.random() * sentences.launchTwo.length) |0];
      var tw = replacePlayer(newTwit);
      //  console.log("player 1 : "+ player[1] +" !");
      console.log(tw);

      //console.log(( Math.random() * sentences.launchTwo.length) |0);
      T.post('statuses/update', { status:tw}, function(err, data, response) {
        //console.log(data)
      })
    }else{
      var newTwit = sentences.launchOne[(Math.random() * sentences.launchOne.length) |0];
      var tw = replacePlayer(newTwit);
        console.log(tw);
      T.post('statuses/update', { status:tw}, function(err, data, response) {
      //  console.log(data)
      })
    }
  });

  socket.on('onPlayerCall', function(msg){
   console.log(msg)
  });

  socket.on('onStartMatch', function(msg){
    playing = true;


  });

  socket.on('onGoal', function(msg){

    if(redScore>= 10 || blueScore >= 10 ){
      socket.emit('onStopMatch', function(msg){
       console.log(msg)
      });
    }

  });

  socket.on('onStopMatch', function(msg){
   console.log(msg)
    redScore = 0 ;
    blueScore = 0 ;
    playing = false;
  });

});


http.listen(port);
console.log('Magic happens on port ' + port);
