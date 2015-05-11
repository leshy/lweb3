_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v
util = require 'util'

core = require '../core'

engineIoChannel = exports.engineIoChannel = core.channel.extend4000
    defaults:
        name: 'engineIo'

    initialize: ->
        @when 'engineIo', (@engineIo) =>
            if id = @engineIo.id then @set name: id
            @engineIo.on 'message', (msg) =>
                msg = JSON.parse(msg)
                @log "<", msg
                @event msg, @realm
                @trigger 'msg', msg

            @engineIo.on 'close', =>
                @trigger 'disconnect'
                @log "Lost Connection"
                @end()

            @when 'parent', (parent) =>
                parent.on 'end', => @end()
                @on 'msg', (msg) => parent.event msg, @realm

    send: (msg) ->
        @log ">", msg
        @engineIo.send JSON.stringify msg
