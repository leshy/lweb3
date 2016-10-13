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

      @when 'parent', (parent) =>
        @on 'msg', (msg) => parent.event msg, @realm

      @when 'socket', (@socket) =>
        @socket.on 'data', (msg) =>
          try
            msg = JSON.parse String msg
          catch
            return @end()

          @log "<", msg
          @event msg, @realm
          @trigger 'msg', msg

        @socket.on 'connect', => @trigger 'connect'
        @socket.on 'end', => @end()

    send: (msg) ->
      @log ">", msg
      @socket.write JSON.stringify msg

    end: ->
      @socket.destroy()
      core.channel::end.call @
