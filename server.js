var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs');

var http = require('http'),
    sys = require('sys'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

var contentTypeMap = {
txt: 'text/plain',
     html: 'text/html',
     xml: 'application/xml',
     jpg: 'image/jpeg',
     png: 'image/png',
     tiff: 'image/tiff',
     gif: 'image/gif'
};

app.listen(8080);

function handler(request, response) {
        function write(code, body, headers) {
        if (!headers) headers = {};
        if (!headers['Content-Type']) headers['Content-Type'] = contentTypeMap.txt;

        response.writeHead(code, headers);
        response.end(body);

        sys.print(request.method+' '+request.url+' '+code+' '+(body||'').length+'\n');
        }

        try {
        
        //default
        if(request.url == "/") request.url = "/index.html";
                
        var pathname = url.parse(request.url).pathname.substring(1);

        if (pathname.indexOf('..') != -1) {
        write(404, "cannot ask for files with .. in the name\n");
        return;
        }

        path.exists(pathname, function(exists) {
            if (!exists) {
            write(404, "There ain't any file bitch\n");
            return;
            }

            fs.stat(pathname, function(err, stats) {
                if (err) {
                write(400, "unable to read file information: "+err+"\n");
                return;
                }

                fs.readFile(pathname, function(err, data) {
                    if (err) {
                    write(400, "unable to read file: "+err+"\n");
                    return;
                    }

                    write(200, data, {'Content-Type': contentTypeMap[path.extname(pathname).substring(1).toLowerCase()]});
                    });
                });
        });
        } catch (e) {
            write(500, e.toString());
        }
}

var players = [];

io.sockets.on('connection', function (socket) {
       
        //Let know the client that the server is alive
        try
        {
            socket.has('nickname') 
        }
        catch(error)
        {
            socket.emit('Greeting');
            console.log("nenememes, errror"+error);
        }
       
        socket.on('setNickname', function(name) {
            console.log("About to set nick to: "+name);
            socket.set('nickname',name,function() { socket.emit('ready'); });
            console.log("nick SET!");
            console.log(players);
            console.log('dada');
            players.push(name);


            console.log("Player "+name+" successfully registered in player list");
            console.log("Updated list:");
            console.log(players);
        });

        //receive the new position
        socket.on('move', function(coords) {
            console.log("player is moving");
            //store it
            //socket.set(players[]);
            //broadcast it
        });
       
        });
