_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v
util = require 'util'

core = require '../core'

webSocketChannel = exports.webSocketChannel = core.channel.extend4000
    defaults:
        name: 'webSocket'

    initialize: ->
        @when 'socketIo', (@socketIo) =>
            if id = @socketIo.id
                @set name: 'ws-' + id

            @socketIo.on 'msg', (msg) =>
                @log '< ' + util.inspect(msg,depth: 0) , msg, 'in'
                @event msg, @realm
                @trigger 'msg', msg

            @socketIo.on 'disconnect', =>
                @trigger 'disconnect'
                @log "Lost Connection"
                @end()

            @when 'parent', (parent) =>
                parent.on 'end', => @end()
                @on 'msg', (msg) => parent.event msg, @realm

    send: (msg) ->
        @log "> " + util.inspect(msg,depth: 0), msg, "out"
        try
            JSON.stringify(msg)
        catch err
            console.error "cannot stringify", util.inspect msg, depth: 4, colors: true
            throw err

        @socketIo.emit 'msg', msg
