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
var noAction;

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

var playerCallCounter = 0;


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
     loosingteam_play2 : "@"+ player[1].name,
     loosingteam : "Team Bleu"
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
     loosingteam_play2 : "@"+ player[3].name,
     loosingteam : "Team Rouge"
    };
  }
  var re = new RegExp(Object.keys(mapObj).join("|"),"gi");
  sentenceTw = sentenceTw.replace(re, function(matched){
    return mapObj[matched];
  });
  return  sentenceTw;
}

var T = new Twit({
  consumer_key:'tEdHRzqIwQN196zRQXkVkyCtu',
  consumer_secret:'rI2WzjjiFazIXXlC498ZdJao9zbYjcj6lWy4EkFmf1h5pmNYli',
  access_token:'4233599248-aeqI3HmurSt70SG9lZ5bf4tNBW7l1khZNF8X2QS',
  access_token_secret:  'bknox3Vc8syHxxbLpotQ3BdcyCbikbFIv1dExOsTeTb0A'
});
/* WEB PART */
app.get('*', function(req, res) {
       res.sendFile(__dirname + '/public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

function postTwoMin() {
    var newTwit = sentences.twoMin[(Math.random() * sentences.twoMin.length) |0];
    var tw = replacePlayer(newTwit);
    T.post('statuses/update', { status:tw}, function(err, data, response) {
      console.log(err);
    })
}
var resetMatch = function(){
  redScore = 0 ;
  blueScore = 0 ;
  playing = false;
  clearInterval(noAction);
}
var jsonParser = bodyParser.json()
app.use(bodyParser.json({ type: 'application/*+json' }));

/* REAL TIME PART  */
io.on('connection', function(socket){
  console.log('a user connected');

  io.sockets.emit('newConnection');

  app.post('/newgoal',jsonParser, function(req,res){
    if(playing){
      console.log(req.body);
      clearInterval(noAction);

      noAction = setInterval(postTwoMin, 120000);
      if(req.body.redGoal>0){
        redScore += 1;
        lastGoalRed =true;
      }else{
        blueScore +=1;
        lastGoalRed =false ;
      }
      if(blueScore < 10 && redScore < 10){
        if(player[1].name !=""){
          var newTwit = sentences.twoVtwo[(Math.random() * sentences.twoVtwo.length) |0];
          var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
          if(lastGoalRed){
            io.sockets.emit('addGoal', 'red', tw);
          }else{
            io.sockets.emit('addGoal', 'blue', tw);
          }
          T.post('statuses/update', { status:tw}, function(err, data, response) {
          })
        }else{
          var newTwit = sentences.oneVone[(Math.random() * sentences.oneVone.length) |0];
          var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
          console.log(tw);
          if(lastGoalRed){
            io.sockets.emit('addGoal', 'red', tw);
          }else{
            io.sockets.emit('addGoal', 'blue', tw);
          }
          T.post('statuses/update', { status:tw}, function(err, data, response) {
          })
        }
      }else if(blueScore >= 10 || redScore >= 10){
        if(player[1].name !=""){
          var newTwit = sentences.endOneGame[(Math.random() * sentences.endOneGame.length) |0];
          var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
          T.post('statuses/update', { status:tw}, function(err, data, response) {
          })
          console.log('stopMatch');
          io.sockets.emit('onStopMatch');
        }else{
          var newTwit = sentences.endTwoGame[(Math.random() * sentences.endTwoGame.length) |0];
          var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
            console.log(tw);
            T.post('statuses/update', { status:tw}, function(err, data, response) {
            })
            console.log('stopMatch');
            io.sockets.emit('onStopMatch');
          }
      }

      console.log("Posted a Goal");
    }
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
  });

  socket.on('onPlayerCall', function(msg){
    resetMatch();
    if(player[1].name!= "" && player[3].name!= ""){
      var newTwit = sentences.playerCall[playerCallCounter];
      playerCallCounter = (playerCallCounter + 1)%sentences.playerCall.length;
      var tw = replacePlayer(newTwit);
      console.log(playerCallCounter);
      T.post('statuses/update', { status:tw}, function(err, data, response) {
        console.log(response);
      })
    }
  });

  socket.on('onScoreChanged', function(msg){
   console.log(msg)
   if(msg == "plus red"){
     redScore+=1;
     lastGoalRed =true;
     if(redScore >= 10 && player[1].name != ""){
       var newTwit = sentences.endTwoGame[(Math.random() * sentences.endTwoGame.length) |0];
       var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
       T.post('statuses/update', { status:tw}, function(err, data, response) {
       })
       io.emit('onStopMatch');
       resetMatch();
     }else if(redScore >= 10 ){
       var newTwit = sentences.endOneGame[(Math.random() * sentences.endOneGame.length) |0];
       var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
       T.post('statuses/update', { status:tw}, function(err, data, response) {
       })
       io.emit('onStopMatch');
       resetMatch();
     }
   }
   if(msg == "minus red" && redScore > 0){
     lastGoalRed =false;
     redScore -=1;
   }
   if(msg == "plus blue"){
      blueScore+=1;
      lastGoalRed =false;
     if(blueScore >= 10 && player[1].name != ""){
       var newTwit = sentences.endTwoGame[(Math.random() * sentences.endTwoGame.length) |0];
       var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
       T.post('statuses/update', { status:tw}, function(err, data, response) {
       })
       io.emit('onStopMatch');
       resetMatch();
     }else if(blueScore >= 10 ){
       var newTwit = sentences.endOneGame[(Math.random() * sentences.endOneGame.length) |0];
       var tw = "🔵" + blueScore + " - " + redScore + "🔴" + replacePlayer(newTwit);
       T.post('statuses/update', { status:tw}, function(err, data, response) {
       })
       io.emit('onStopMatch');
       resetMatch();
     }
   }
   if(msg == "minus blue" && blueScore > 0){
     lastGoalRed =true;
     blueScore-=1;
   }

  });

  socket.on('onStartMatch', function(msg){
    console.log("StartMatch");
    if(player[1].name!= "" && player[3].name!= ""){
      playing = true;
      var newTwit = sentences.launchTwo[( Math.random() * sentences.launchTwo.length) |0];
      var tw = replacePlayer(newTwit);
      //  console.log("player 1 : "+ player[1] +" !");
      console.log(tw);
      //console.log(( Math.random() * sentences.launchTwo.length) |0);
      T.post('statuses/update', { status:tw}, function(err, data, response) {
        console.log(data);
      })
    }else{
      playing = true;
      var newTwit = sentences.launchOne[(Math.random() * sentences.launchOne.length) |0];
      var tw = replacePlayer(newTwit);
        console.log(tw);
      T.post('statuses/update', { status:tw}, function(err, data, response) {
      //  console.log(data)
      })
    }
  });
  socket.on('onGoal', function(msg){
    if(redScore >= 10 || blueScore >= 10 ){
        resetMatch();
        socket.emit('onStopMatch', function(msg){
          console.log(msg)
        });
    }
  });

  socket.on('onStopMatch', function(msg){
   console.log(msg)
    resetMatch();
  });
});


http.listen(port);
console.log('Magic happens on port ' + port);
