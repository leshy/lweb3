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
      @when 'engineIo', (engineIo) =>
        @engineIo = engineIo

        @listenTo @engineIo, 'message', (msg) =>
            msg = JSON.parse(msg)
#            @log '< ' + util.inspect(msg,depth: 0) , msg, 'in'
            @log '< ' + JSON.stringify(msg), msg, 'in'
            @event msg, @realm
            @trigger 'msg', msg


        disconnectListener = =>
            @engineIo.removeListener 'error', disconnectListener
            @engineIo.removeListener 'close', disconnectListener
            @trigger 'disconnect'
            @log "Lost Connection", {}, "disconnect"
            @end()

        @engineIo.once 'error', disconnectListener
        @engineIo.once 'close', disconnectListener

      @when 'parent', (parent) =>
          parent.on 'end', => @end()
          @on 'msg', (msg) => parent.event msg, @realm

    send: (msg) ->
#        @log "> " + JSON.stringify(msg), msg, "out"
        @engineIo.send JSON.stringify msg
