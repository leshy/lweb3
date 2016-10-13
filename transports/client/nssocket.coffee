#autocompile
_ = require 'underscore'
Backbone = require 'backbone4000'
helpers = require 'helpers'

subscriptionMan = require('subscriptionman2')
validator = require('validator2-extras'); v = validator.v

Nssocket = require 'nssocket'

_.extend exports, require('../nssocket')

nssocketClient = exports.nssocketClient = exports.nssocketChannel.extend4000
    defaults:
        name: 'nssocketClient'
        reconnect: false

    initialize: -> @connect()

    connect: ->
      if @nssocket then @nssocket.destroy()
      @set nssocket: @nssocket = Nssocket.NsSocket reconnect: @get('reconnect'), type: 'tcp4'
      @nssocket.on 'reconnect', (bla) -> console.log 'nssocket evnet', bla

      @nssocket.connect @get('host'), @get('port')
      @trigger 'connect'
