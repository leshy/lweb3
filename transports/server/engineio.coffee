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
        name: 'EIOServer'

    defaultChannelClass: exports.engineIoChannel.extend4000
      initialize: ->
        @when 'engineIo', =>
          @set name: 'ip-' + @ip()

      ip: ->
        request = @engineIo.request

        ip = request.headers['x-real-ip'] or request.headers['x-forwarded-for'] or request.connection.remoteAddress
        _.last ip.split(":") # get rid of pesky ipv6. what is ipv6? I don't know.

    initialize: ->
        @http = @get 'http'

        @engineIo = engineio.attach @http

        @engineIo.on 'connection', (engineIoClient) =>
            channel = new @channelClass parent: @, engineIo: engineIoClient, logger: @logger
            name = channel.name()
            channel.log 'Connection Received', { headers: engineIoClient.request.headers }

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
