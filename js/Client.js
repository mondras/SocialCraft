console.log("Loading client sockets...");

var socket = io.connect('http://localhost:8080');
var player = {};
player.nickname = "TROLLDAD";

//Server is ready
socket.on('Greeting', function (data) {
        console.log("Server is alive, displaying nickname box"); 
        console.log(player);
        var nickname = prompt("The server is alive, what's your name?");
        socket.emit('setNickname', nickname);
        player.nickname = nickname;
        console.log("Sending nickname" + player.nickname);
        //console.log(data);
        //socket.emit('my other event', { my: 'data' });
        });


