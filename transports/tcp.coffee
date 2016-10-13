#autocompile
_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

core = require '../core'

tcpSocketChannel = exports.tcpSocketChannel = core.channel.extend4000
    defaults:
        name: 'tcp'

    initialize: ->
        @when 'socket', (@socket) =>
            @socket.on 'data', (msg) =>
                msg = JSON.parse String msg
                @log "<", msg
                @event msg, @realm
                @trigger 'msg', msg

            @socket.on 'connect', => @trigger 'connect'
            @socket.on 'end', => @trigger 'disconnect'


        @when 'parent', (parent) =>
          @on 'msg', (msg) => parent.event msg, @realm

    send: (msg) ->
        @log ">", msg
        @socket.write JSON.stringify msg
