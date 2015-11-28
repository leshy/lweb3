_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

engineio = require 'engine.io-client'

_.extend exports, require('../engineio')

engineIoClient = exports.engineIoClient = exports.engineIoChannel.extend4000
    defaults:
        name: 'engineIoClient'

    initialize: ->
        @set engineIo: @engineIo = engineio.Socket(@get('host') or 'ws://' + window?location?host)
        #@engineIo.binaryType = 'blob'
        @engineIo.on 'open', => @trigger 'connect'

#    ip: ->
#      @engineIo.request.headers['x-real-ip'] or @engineIo.request.headers['x-forwarded-for']

    end: ->
        if @ended then return
        @ended = true
        @engineIo.close()
        @trigger 'end'
