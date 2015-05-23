_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

core = require '../core'
util = require 'util'

nssocketChannel = exports.nssocketChannel = core.channel.extend4000
  defaults:
    name: 'nsSocket'

  initialize: ->
    @when 'nssocket', (@nssocket) =>
      @nssocket.data 'msg', (msg) =>
        @log '< ' + util.inspect(msg,depth: 0) , msg, 'in'
        @event msg, @realm

      @nssocket.on 'start', => @trigger 'connect'
      @nssocket.on 'close', =>
        @trigger 'disconnect'
        @log "Lost Connection"
        @end()

    @when 'parent', (parent) =>
      #parent.on 'end', => @end()
      @nssocket.on 'msg', (msg) =>
        parent.event msg, @realm

  send: (msg) ->
    @log "> " + util.inspect(msg,depth: 0), msg, "out"
    @nssocket.send 'msg', msg
