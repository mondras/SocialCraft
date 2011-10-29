console.log("Loading client sockets...");

var socket = io.connect('http://'+window.location.host);
var players = [];

function sendPlayerMove(dx,dy,dz,drx,dry,drz)
{
    coords = {id: player.nickname, dx:dx, dy:dy, dz:dz, drx:drx, dry:dry,drz:drz};
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
            console.log(newPlayer);
            socket.emit('setNickname', newPlayer);
            console.log("init-game");
           }
}

//Server is ready
socket.on('Greeting', function (data) {
       serverReady = true;
         });

socket.on('receiveMoves', function (data) {
        console.log("Someone moved!");

});

socket.on('createNewPlayer', function(data) {
        console.log("A new player has arrived!");
        console.log(data);
        
});
