const express = require('express')
const app = express()
app.use('/elb-healthcheck', require('express-healthcheck')());
app.listen(8080)

var server = require("http").createServer();
var io = require("socket.io")(server);

var redisHost = '10.148.0.5'
var redis  = require('redis');
client = redis.createClient(redisHost);
 
// Create and use a Socket.IO Redis store
var RedisStore = require('socket.io/lib/stores/redis')
io.set('store', new RedisStore({
  redisPub : redis.createClient(redisHost),
  redisSub : redis.createClient(redisHost),
  redisClient : client
}));

var players = {};
var total=0;
 
function Player(id) {
  this.id = id;
  this.no = -1;
 
  //movement
  // this.x = 0;
  // this.y = 1;
  // this.z = 0;
  // this.rx = 0;
  // this.ry = 0;
  // this.rz = 0;
  this.tx = 0;
  this.ty = 0;
  this.tz = 0;
 
  //avatar
  this.gender = -1;
  this.hat = -1;
  this.glass = -1;
  this.skin = -1;
  this.dress = -1;
 
  //info
  this.entity = null;
  this.name = "Bob";
  this.userid = "";
  this.roomID = -1;
  this.emote = -1;
}
 
io.sockets.on("connection", function(socket) {
  //console.log("Client has connected!");
 
  socket.on("initialize", function(data) {
    var total = client.incr('clients');

    var newPlayer = new Player(id);
    newPlayer.name = data.name;
    newPlayer.userid = data.userid;
    newPlayer.gender = data.gender;
    newPlayer.skin = data.skin;
    newPlayer.glass = data.glass;
    newPlayer.hat = data.hat;
    newPlayer.dress = data.dress;
    newPlayer.roomID = data.roomID;
    newPlayer.userid = data.userid;
    newPlayer.no = data.no;

    client.set('socket:' + socket.id, JSON.stringify(newPlayer));

    client.keys('')

    socket.emit("playerData", { id: id, players: players });
    socket.broadcast.emit("playerJoined", newPlayer);
    console.log(
      "Client with name " +
        newPlayer.name +
        " has been initalized" +
        " gender: " +
        newPlayer.gender +
        " skin: " +
        newPlayer.skin +
        " glass: " +
        newPlayer.glass +
        " uid: " +
        newPlayer.userid
    );
    total+=1;
    console.log('The Total active clients: '+total);
  });
 
  socket.on("positionUpdate", function(data) {
    if (!players[data.id]) return;
    // players[data.id].x = data.x;
    // players[data.id].y = data.y;
    // players[data.id].z = data.z;
    // //Addition
    // players[data.id].rx = data.rx;
    // players[data.id].ry = data.ry;
    // players[data.id].rz = data.rz;
    //target
    players[data.id].tx = data.tx;
    players[data.id].ty = data.ty;
    players[data.id].tz = data.tz;
    //console.log(data.id+" "+ data.tx+" "+data.ty+" "+data.tz);
    socket.broadcast.emit("playerMoved", data);
  });
 
//   socket.on("emojiUpdate", function(data) {
//     if (!players[data.id]) return;
//     players[data.id].emote = data.emote;
 
//     console.log("emoji:" + data.emote);
//     socket.broadcast.emit("changeEmoji", data);
//   });
 
//   socket.on("avatarUpdate", function(data) {
//     if (!players[data.id]) return;
//     players[data.id].gender = data.gender;
//     players[data.id].skin = data.skin;
//     players[data.id].glass = data.glass;
//     players[data.id].hat = data.hat;
//     players[data.id].dress = data.dress;
 
//     socket.broadcast.emit("changeAvatar", data);
//   });
 
  socket.on("disconnect", function() {
    if (!players[socket.id]) return;
    delete players[socket.id];
    console.log("Disconnected");
    // Update clients with the new player killed
    socket.broadcast.emit("killPlayer", socket.id);
    total-=1;
    console.log('The Total active clients: '+total);
  });
});
server.listen(80)
console.log("Server started.");
