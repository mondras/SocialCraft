console.log("Loading client sockets...");

var socket = io.connect('http://'+window.location.host);
var player = {};
player.nickname = "TROLLDAD";

var players = [];

function sendPlayerMove(dx,dy,dz,drx,dry,drz)
{
    coords = {id: player.nickname, dx:dx, dy:dy, dz:dz, drx:drx, dry:dry,drz:drz};
    socket.emit('move',coords);
}

//Server is ready
socket.on('Greeting', function (data) {
        console.log("Server is alive, displaying nickname box"); 
        console.log(player);
        var nickname = prompt("The server is alive, what's your name?");
        socket.emit('setNickname', nickname);
        player.nickname = nickname;
        console.log("Sending nickname: " + player.nickname);
        console.log("init-game");
        });

socket.on('receiveMoves', function (data) {
        console.log("Someone moved!");

});

socket.on('createNewPlayer', function(data) {
        console.log("A new player has arrived!");
        console.log(data);
        
});
