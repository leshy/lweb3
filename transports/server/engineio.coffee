_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

engineio = require 'engine.io'

core = require '../../core'

_.extend exports, require('../engineio')

engineIoServer = exports.engineIoServer = core.server.extend4000 validator.ValidatedModel,
    validator:
        http: 'Instance'

    defaults:
        name: 'engineIoServer'

    defaultChannelClass: exports.engineIoChannel

    initialize: ->
        @http = @get 'http'
        @engineIo = engineio.attach @http

        @engineIo.on 'connection', (engineIoClient) =>
            @log 'connection received to ' + name = engineIoClient.id, { ip: ip = engineIoClient.request.socket.remoteAddress, headers: engineIoClient.request.headers }

            channel = new @channelClass parent: @, engineIo: engineIoClient, name: name

            channel.on 'change:name', (model,newname) =>
                delete @clients[name]
                @clients[newname] = model
                @trigger 'connect:' + newname, model
            @clients[name] = channel

            @trigger 'connect:' + name, channel
            @trigger 'connect', channel


    end: ->
        if @ended then return
        @ended = true

        #_.map @socketIo.sockets.sockets, (socket) ->
        #    socket.disconnect()

        @http.close()
        core.core::end.call @
