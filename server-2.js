(function() {
  var app, contentTypeMap, fs, handler, http, io, path, players, sys, url;
  handler = function(request, response) {
    var pathname, write;
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
    } catch (e) {
      return write(500, e.toString());
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
        socket: socket,
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
          console.log(p.id);
        }
        if (p.socket !== socket) {
          return p.socket.emit('CreateNewPlayer', player);
        }
      });
      return console.log("Finished getting the player into the server");
    });
    return socket.on("move", function(coords) {
      return players.forEach(function(player) {
        if (player.socket !== socket) {
          player.socket.emit('receiveMove', coords);
        }
        if (player.socket === socket) {
          player.x += coords.dx;
          player.y += coords.dy;
          player.z += coords.dz;
          player.rx += coords.drx;
          player.rz += coords.drz;
          return player.ry += coords.dry;
        }
      });
    });
  });
}).call(this);
