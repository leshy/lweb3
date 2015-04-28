validator = require('validator2-extras')
v = validator.v

Server = require './transports/server/websocket'
Client = require './transports/client/websocket'

helpers = require 'helpers'
express = require 'express'
Http = require 'http'

port = 8192
colors = require 'colors'

gimmeEnv = (callback) ->
    app = express()
    http = Http.createServer app
    http.listen port

    lwebs = new Server.webSocketServer http: http, verbose: false
    lwebc = new Client.webSocketClient host: 'http://localhost:' + port, verbose: false

    lwebs.on 'connect', (s) -> callback lwebs, s, lwebc

gimmeEnv (lweb, server, client) ->
  
  

