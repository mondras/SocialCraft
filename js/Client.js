console.log("Loading client sockets...");

var socket = io.connect('http://'+window.location.host);
var playerId = "";
var players = [];

function sendPlayerMove(dx,dy,dz,drx,dry,drz)
{
    coords = {id: playerId, dx:dx, dy:dy, dz:dz, drx:drx, dry:dry,drz:drz};
    socket.emit('move',coords);
}

//Server is ready
socket.on('Greeting', function (data) {
        console.log("Server is alive, displaying nickname box"); 
        var nickname = "";
        nickname = prompt("The server is alive, what's your name?");
        var newPlayer = {
        name:nickname,
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
        rx: player.rotation.x,
        ry: player.rotation.y,
        rz: player.rotation.z
        };
        playerId = nickname;
        console.log(newPlayer);
        socket.emit('setNickname', newPlayer);
        console.log("init-game");
        });

socket.on('receiveMoves', function (data) {
        //console.log("Someone moved!");
        var objectPlayer = players[data.id];
        if (objectPlayer != null)
        {
            objectPlayer.position.x += data.dx;
            objectPlayer.position.y += data.dy;
            objectPlayer.position.z += data.dz;

            objectPlayer.rotation.x += data.drx;
            objectPlayer.rotation.y += data.dry;
            objectPlayer.rotation.z += data.drz;
        }
});

socket.on('createNewPlayer', function(data) {
        console.log("A new player has arrived!");
        console.log(data);
        players[data.id] = createPlayerOnMap(data);
});
