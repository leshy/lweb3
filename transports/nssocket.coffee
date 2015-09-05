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
      @on 'change:nssocket', (self, nssocket) => @bindSocket nssocket

  bindSocket: (nssocket) ->
    @nssocket = nssocket
    @listenTo @nssocket, ['data', 'msg'], (msg) =>
      @log '< ' + util.inspect(msg,depth: 0) , msg, 'in'
      @event msg, @realm

    @listenTo @nssocket, 'error', (e) =>
      @trigger 'error', e

    @listenTo @nssocket, 'start', => @trigger 'connect'

    @listenTo @nssocket, 'close', =>
      @trigger 'disconnect'
      @log "Lost Connection"
      @end()

    @when 'parent', (parent) =>
      #parent.on 'end', => @end()
      console.log 'got parent'
      @listenTo @nssocket, [ 'data', 'msg' ], (msg) =>
        console.log "PARENT EVENT", msg
        parent.event msg, @realm

  send: (msg) ->
    @log "> " + util.inspect(msg,depth: 0), msg, "out"
    @nssocket.send 'msg', msg

  end: ->
    @nssocket.destroy()
