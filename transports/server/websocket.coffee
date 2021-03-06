_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

io = require 'socket.io'

core = require '../../core'

_.extend exports, require('../websocket')

webSocketServer = exports.webSocketServer = core.server.extend4000 validator.ValidatedModel,
    validator:
        http: 'Instance'

    defaults:
        name: 'webSocketServer'

    defaultChannelClass: exports.webSocketChannel

    initialize: ->
        @http = @get 'http'

        @socketIo = io.listen @http, log: false

        @socketIo.on 'connection', (socketIoClient) =>
            name = socketIoClient.id
            @log 'connection received from ' + name
            channel = new @channelClass parent: @, socketIo: socketIoClient

            channel.on 'change:name', (model,newname) =>
                delete @clients[name]
                @clients[newname] = model
                @trigger 'connect:' + newname, model
            @clients[name] = channel

            @trigger 'connect:' + name, channel
            @trigger 'connect', channel

        @socketIo.on 'disconnect', (socketIoClient) =>
            delete @clients[channel.get('name')]
            @trigger 'disconnect', channel

    end: ->
        if @ended then return
        @ended = true
        _.map @socketIo.sockets.sockets, (socket) ->
            socket.disconnect()

        @http.close()
        core.core::end.call @
