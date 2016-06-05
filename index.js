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
var teamOne = ["",""];
var teamTwo = ["",""];
var blueScore = 0;
var redScore = 0;
var player = [
          this.one = {
            name : "arthur"
          },
          this.two = {
            name : "null"
          },
          this.three = {
            name : "null"
          },
          this.four = {
            name : "null"
          }
        ]

var str = "I have a cat, a dog, and a goat.";


var replacePlayer = function(sentenceTw){
  if(lastGoalRed){
    var mapObj = {
     red_play1: "@"+ player[1].name,
     red_play2:"@"+ player[3].name,
     blue_play1: "@"+ player[0].name,
     blue_play2: "@"+ player[2].name,
     scoringteam_play1 :"@"+ player[1].name,
     scoringteam_play2 :"@"+ player[3].name ,
     loosingteam_play1 : "@"+ player[0].name,
     loosingteam_play2 : "@"+ player[2].name
    };
  }else{
    var mapObj = {
     red_play1: "@"+ player[1].name,
     red_play2:"@"+ player[3].name,
     blue_play1: "@"+ player[0].name,
     blue_play2: "@"+ player[2].name,
     scoringteam_play1 :"@"+ player[0].name,
     scoringteam_play2 :"@"+ player[2].name ,
     loosingteam_play1 : "@"+ player[1].name,
     loosingteam_play2 : "@"+ player[3].name
    };
  }
  var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
  sentenceTw = sentenceTw.replace(re, function(matched){
    return mapObj[matched];
  });
  return  "🔵" + blueScore + " - " + redScore + "🔴" + sentenceTw
}
var newTwit = sentences.twoVtwo[(Math.random() * sentences.twoVtwo.length) |0];
var tw = replacePlayer(newTwit);

console.log(tw);
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



/* REAL TIME PART  */
io.on('connection', function(socket){
  console.log('a user connected');

  app.post('/newgoal', function(req,res){
    console.log(req.body);
    res.json({
            success: true,
            message: 'All is fine'
    });
    if(req.body.redGoal>0){
      redScore += 1;
      lastGoalRed =true;
    }else{
      blueScore +=1;
      lastGoalRed =false ;
    }

    if(redScore>= 10 ){
      if(player.three!=""){
        var newTwit = sentences.twoVtwo[(Math.random() * sentences.twoVtwo.length) |0];
        var tw = replacePlayer(newTwit);
        T.post('statuses/update', { status:tw}, function(err, data, response) {
          console.log(data)
        })
      }
    }
    console.log("Posted a Goal");
    lastBut = Date.now();

  });



  socket.on('onNameChange', function(msg){
    /*teams.first.player1 = teamOne[0];
    teams.first.player2 = teamOne[1]?teamOne[1]:"";
    teams.second.player1 = teamTwo[0];
    teams.second.player2 = teamTwo[1]?teamTwo[1]:"";
    */
    player.one = msg.player.one;
    player.two = msg.player.two;
    player.three = msg.player.three? msg.player.three : "" ;
    player.four = msg.player.four? msg.player.four : "" ;

    //var new_text = text.replace(/want/g, "dont want");
   console.log("Name Changed")
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
