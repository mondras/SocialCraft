(function() {
  var app, contentTypeMap, fs, handler, http, io, path, players, sys, url;
  handler = function(request, response) {
    var parsed, pathname, proxy, proxy_request, write;
    write = function(code, body, headers) {
      if (!headers) {
        headers = {};
      }
      if (!headers["Content-Type"]) {
        headers["Content-Type"] = contentTypeMap.txt;
      }
      response.writeHead(code, headers);
      response.end(body);
      return sys.print(request.method + " " + request.url + " " + code + " " + (body || "").length + "\n");
    };
    try {
      if (request.url.indexOf("fbpics") > 0) {
        parsed = url.parse(request.url, true);
        console.log(parsed.query.uid);
        proxy = http.createClient(80, 'graph.facebook.com');
        proxy_request = proxy.request('GET', "/" + parsed.query.uid + '/picture', {
          'host': 'graph.facebook.com'
        });
        proxy_request.addListener('response', function(proxy_response) {
          var inception_proxy, inception_proxy_request, parsed_inception;
          console.log("Recibimos datos del servidor medio");
          parsed_inception = url.parse(proxy_response.headers.location);
          console.log(parsed_inception);
          console.log("looking for" + parsed_inception);
          inception_proxy = http.createClient(80, parsed_inception.host);
          inception_proxy_request = inception_proxy.request('GET', parsed_inception.pathname, {
            'host': parsed_inception.host
          });
          console.log(inception_proxy_request);
          inception_proxy_request.addListener('response', function(inception_proxy_response) {
            console.log("REcibimos datos del servidor final");
            inception_proxy_response.addListener('data', function(chunk) {
              return response.write(chunk, 'binary');
            });
            inception_proxy_response.addListener('end', function() {
              return response.end();
            });
            proxy_response.writeHead(inception_proxy_response.statusCode, inception_proxy_response.headers);
            return response.writeHead(proxy_response.statusCode, proxy_response.headers);
          });
          proxy_request.addListener('data', function(chunk) {
            return inception_proxy_request.write(chunk, 'binary');
          });
          return proxy_request.addListener('end', function() {
            return inception_proxy_request.end();
          });
        });
        request.addListener('data', function(chunk) {
          return proxy_request.write(chunk, 'binary');
        });
        return request.addListener('end', function() {
          return proxy_request.end();
        });
      } else {
        if (request.url === "/") {
          request.url = "/index.html";
        }
        pathname = url.parse(request.url).pathname.substring(1);
        if (pathname.indexOf("..") !== -1) {
          write(404, "cannot ask for files with .. in the name\n");
          return;
        }
        return path.exists(pathname, function(exists) {
          if (!exists) {
            write(404, "There ain't any file bitch\n");
            return;
          }
          return fs.stat(pathname, function(err, stats) {
            if (err) {
              write(400, "unable to read file information: " + err + "\n");
              return;
            }
            return fs.readFile(pathname, function(err, data) {
              if (err) {
                write(400, "unable to read file: " + err + "\n");
                return;
              }
              return write(200, data, {
                "Content-Type": contentTypeMap[path.extname(pathname).substring(1).toLowerCase()]
              });
            });
          });
        });
      }
    } catch (e) {
      return write(500, "OMFG, an error!!!! FUUUUUUUUUUUUUUUUUUUU <br>" + e.toString());
    }
  };
  app = require("http").createServer(handler);
  io = require("socket.io").listen(app);
  fs = require("fs");
  http = require("http");
  sys = require("sys");
  url = require("url");
  path = require("path");
  fs = require("fs");
  contentTypeMap = {
    txt: "text/plain",
    html: "text/html",
    xml: "application/xml",
    jpg: "image/jpeg",
    png: "image/png",
    tiff: "image/tiff",
    gif: "image/gif"
  };
  app.listen(8080);
  players = [];
  io.set('log level', 1);
  io.sockets.on("connection", function(socket) {
    try {
      socket.has("nickname");
    } catch (error) {
      socket.emit("Greeting");
      console.log("nenememes, errror" + error);
    }
    socket.on("setNickname", function(data) {
      var player;
      console.log("About to set nick to: " + data.name);
      socket.set("nickname", data.name, function() {
        return socket.emit("ready");
      });
      player = {
        id: data.name,
        socket: socket.id,
        x: data.x,
        y: data.y,
        z: data.z,
        rx: data.rx,
        ry: data.ry,
        rz: data.rz
      };
      players.push(player);
      console.log("Player " + player.id + " successfully registered in player list");
      console.log("Updated list:");
      players.forEach(function(p) {
        if (typeof p.id === "string") {
          return console.log(p.id);
        }
      });
      socket.broadcast.emit('createNewPlayer', player);
      socket.emit('createExistingPlayers', players);
      return console.log("Finished getting the player into the server");
    });
    return socket.on("move", function(coords) {
      socket.broadcast.emit('receiveMove', coords);
      return players.forEach(function(player) {
        if (player.socket === socket.id) {
          player.x = coords.dx;
          player.y = coords.dy;
          player.z = coords.dz;
          player.rx = coords.drx;
          player.rz = coords.drz;
          return player.ry = coords.dry;
        }
      });
    });
  });
}).call(this);
