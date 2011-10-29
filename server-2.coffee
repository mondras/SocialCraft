handler = (request, response) ->
  write = (code, body, headers) ->
    headers = {}  unless headers
    headers["Content-Type"] = contentTypeMap.txt  unless headers["Content-Type"]
    response.writeHead code, headers
    response.end body
    sys.print request.method + " " + request.url + " " + code + " " + (body or "").length + "\n"
  facebook = (url) ->
    console.log "voy a sacar::"
    console.log url


    #response.writeHead 200, {'host':'lulu'}
    #response.end "LOL"
    sys.print "Got photo :)"
  try
    if request.url.indexOf("fbpics") > 0 
        #write 200, "FBPICS BNI"
        console.log "Getting FB pic..."
        parsed = url.parse request.url, true

        transfer = http.createClient 80, 'graph.facebook.com'
        transfer_request = transfer.request 'GET', "/"+parsed.query.uid+"/picture", {'host':'graph.facebook.com'} 
        transfer_request.on 'response', (transfer_response) ->
            
            transfer_response.on 'end', (data) -> 
                processed_response = url.parse transfer_response.headers.location
                proxy = http.createClient 80, processed_response.host 
                proxy_request = proxy.request 'GET', processed_response.pathname, {'host':processed_response.host}
                
                proxy_request.on 'response', (proxy_response) ->
                     console.log "Recibimos datos del servidor medio"
                     proxy_response.addListener 'data', (chunk) -> response.write chunk, 'binary'
                     proxy_response.addListener 'end', -> response.end()
                     response.writeHead proxy_response.statusCode, proxy_response.headers

                proxy_request.write "LOL"
                proxy_request.end

        transfer_request.write "LOL"
        transfer_request.end

    else
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
    write 500, "OMFG, an error!!!! FUUUUUUUUUUUUUUUUUUUU <br>"+e.toString()

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

io.set 'log level', 1
io.sockets.on "connection", (socket) ->
  try
    socket.has "nickname"
  catch error
    socket.emit "Greeting"
    console.log "nenememes, errror" + error
 
  socket.on "setNickname", (data) ->
    console.log "About to set nick to: " + data.name
    socket.set "nickname", data.name, ->
      socket.emit "ready"

    player = 
        id: data.name
        socket: socket.id
        x: data.x
        y: data.y
        z: data.z
        rx: data.rx
        ry: data.ry
        rz: data.rz
        
    players.push player
    console.log "Player " + player.id + " successfully registered in player list"
    console.log "Updated list:"

    players.forEach (p) ->
        console.log p.id if typeof p.id is "string"
    socket.broadcast.emit('createNewPlayer',player) 
    socket.emit('createExistingPlayers',players)
    
    console.log("Finished getting the player into the server");
    
         
  socket.on "move", (coords) ->
    socket.broadcast.emit('receiveMove',coords) 
    players.forEach (player) ->
        if player.socket is socket.id
            player.x    = coords.dx
            player.y    = coords.dy
            player.z    = coords.dz
            player.rx   = coords.drx
            player.rz   = coords.drz
            player.ry   = coords.dry
    #console.log "player is moving"
