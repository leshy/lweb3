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

    ip: ->
      request = @engineIo.request
      ip = request.headers['x-real-ip'] or request.headers['x-forwarded-for'] or request.connection.remoteAddress
      _.last ip.split(":") # get rid of pesky ipv6. what is ipv6? I don't know.

    initialize: ->
        @engineIo = @get 'engineIo'
        @set name: 'ip-' + @ip()

        @engineIo.on 'message', (msg) =>
            msg = JSON.parse(msg)
            @log '< ' + util.inspect(msg,depth: 0) , msg, 'in'
            @event msg, @realm
            @trigger 'msg', msg

        @engineIo.once 'close', =>
            @trigger 'disconnect'
            @log "Lost Connection"
            @end()

        @when 'parent', (parent) =>
            parent.on 'end', => @end()
            @on 'msg', (msg) => parent.event msg, @realm

    send: (msg) ->
        @log "> " + util.inspect(msg,depth: 0), msg, "out"
        @engineIo.send JSON.stringify msg
