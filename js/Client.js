console.log("Loading client sockets...");

var socket = io.connect('http://'+window.location.host);
var playerId = "";
var players = [];

function sendPlayerMove(dx,dy,dz,drx,dry,drz)
{
    coords = {id: playerId, dx:dx, dy:dy, dz:dz, drx:drx, dry:dry,drz:drz};
    socket.emit('move',coords);
}
var serverReady = false;
function registerPlayer()
{ 
        if(loginReady && loginReady)
        {
            console.log("Server is alive, displaying nickname box"); 
           var nickname = "";
            var newPlayer = {
            name:uid,
            x: player.position.x,
            y: player.position.y,
            z: player.position.z,
            rx: player.rotation.x,
            ry: player.rotation.y,
            rz: player.rotation.z
            };
            playerId = uid;
            console.log(newPlayer);
            socket.emit('setNickname', newPlayer);
            console.log("init-game");
           }
}

//Server is ready
socket.on('Greeting', function (data) {
       serverReady = true;
         });

socket.on('receiveMove', function (data) {
       // console.log("Somseone moved!" + data.id);
        var objectPlayer = players[data.id];
        if (objectPlayer != null)
        {
            objectPlayer.position.x = data.dx;
            objectPlayer.position.y = data.dy;
            objectPlayer.position.z = data.dz;

            objectPlayer.rotation.x = data.drx;
            objectPlayer.rotation.y = data.dry;
            objectPlayer.rotation.z = data.drz;
        }
});

socket.on('createExistingPlayers', function(data){
        if(data.length > 0)
        {
            data.forEach(function(player) {
                if (player.id != playerId && players[player.id] == null)
                {
                    console.log("Create existing player");
                    console.log(player);
                    players[player.id] = createPlayerOnMap(player);
                }
            });
        }
});

socket.on('createNewPlayer', function(data) {
        if (players[data.id] == null)
        {
            console.log("A new player has arrived!");
            console.log(data);
            players[data.id] = createPlayerOnMap(data);
        }
});
