console.log("Loading client sockets...");

var socket = io.connect('http://localhost:8080');
var player = {};
player.nickname = "TROLLDAD";

var players = [];

function sendPlayerMove(dx,dy,dz,drx,dry,drz)
{
 
    coords = {dx:dx, dy:dy, dz:dz, drx:drx, dry:dry,drz:drz};
    console.log("player moved"+coords);
    console.log(coords)
    socket.emit('move',coords);
}

//Server is ready
socket.on('Greeting', function (data) {
        console.log("Server is alive, displaying nickname box"); 
        console.log(player);
        var nickname = prompt("The server is alive, what's your name?");
        socket.emit('setNickname', nickname);
        player.nickname = nickname;
        console.log("Sending nickname" + player.nickname);
        console.log("init-game");
        });

socket.on('update', function (data) {
        console.log("Someone moved!");

});
