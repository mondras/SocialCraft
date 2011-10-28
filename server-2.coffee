handler = (request, response) ->
  write = (code, body, headers) ->
    headers = {}  unless headers
    headers["Content-Type"] = contentTypeMap.txt  unless headers["Content-Type"]
    response.writeHead code, headers
    response.end body
    sys.print request.method + " " + request.url + " " + code + " " + (body or "").length + "\n"
  try
    request.url = "/index.html"  if request.url is "/"
    pathname = url.parse(request.url).pathname.substring(1)
    unless pathname.indexOf("..") is -1
      write 404, "cannot ask for files with .. in the name\n"
      return
    path.exists pathname, (exists) ->
      unless exists
        write 404, "There ain't any file bitch\n"
        return
      fs.stat pathname, (err, stats) ->
        if err
          write 400, "unable to read file information: " + err + "\n"
          return
        fs.readFile pathname, (err, data) ->
          if err
            write 400, "unable to read file: " + err + "\n"
            return
          write 200, data,
            "Content-Type": contentTypeMap[path.extname(pathname).substring(1).toLowerCase()]
  catch e
    write 500, e.toString()
app = require("http").createServer(handler)
io = require("socket.io").listen(app)
fs = require("fs")
http = require("http")
sys = require("sys")
url = require("url")
path = require("path")
fs = require("fs")
contentTypeMap =
  txt: "text/plain"
  html: "text/html"
  xml: "application/xml"
  jpg: "image/jpeg"
  png: "image/png"
  tiff: "image/tiff"
  gif: "image/gif"

app.listen 8080
players = []
io.sockets.on "connection", (socket) ->
  try
    socket.has "nickname"
  catch error
    socket.emit "Greeting"
    console.log "nenememes, errror" + error
  socket.on "setNickname", (name) ->
    console.log "About to set nick to: " + name
    socket.set "nickname", name, ->
      socket.emit "ready"

    console.log "nick SET!"
    console.log players
    console.log "dada"
    player = name: name
    players.push player
    console.log "Player " + name + " successfully registered in player list"
    console.log "Updated list:"
    console.log players

  socket.on "move", (coords) ->
    console.log "player is moving"