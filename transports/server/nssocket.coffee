_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

nssocket = require 'nssocket'

core = require '../../core'

_.extend exports, require('../nssocket')

nssocketServer = exports.nssocketServer = core.server.extend4000 validator.ValidatedModel,
    validator:
        port: Number

    defaults:
        name: 'nssocketServer'
        autostart: true

    defaultChannelClass: exports.nssocketChannel

    start: ->
        @nssocket.listen @get 'port'

    initialize: ->
        port = @get 'port'

        @nssocket = nssocket.createServer (clientSocket) =>
            channel = new @channelClass parent: @, nssocket: clientSocket, name: 'ns-' + @channelName()
            channel.log 'connection received'
            @receiveConnection channel

        if @get('autostart') is true then @start()

    end: ->
        @nssocket.disconnect()
        core.core::end.call @
