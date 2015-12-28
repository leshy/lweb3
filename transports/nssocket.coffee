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
    @when 'nssocket', (nssocket) =>
      @bindSocket nssocket
      @on 'change:nssocket', (self, nssocket) =>
        @bindSocket nssocket

  bindSocket: (@nssocket) ->
    @nssocket.on ['data', 'msg'], (msg) =>
      @log '< ' + util.inspect(msg,depth: 0) , msg, 'in'
      @event msg, @realm

    @nssocket.on 'error', (e) =>
      @trigger 'error', e

    @nssocket.on 'start', => @trigger 'connect'

    @nssocket.on 'close', =>
      @trigger 'disconnect'
      @log "Lost Connection"
      @end()

    @when 'parent', (parent) =>
      parent.once 'end', => @end()
      @nssocket.on [ 'data', 'msg' ], (msg) =>
        parent.event msg, @realm

  send: (msg) ->
    @log "> " + util.inspect(msg,depth: 0), msg, "out"
    @nssocket.send 'msg', msg

  end: ->
    @nssocket.destroy()
    core.channel::end.call @
