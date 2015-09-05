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

    initialize: -> @connect()

    connect: ->
      if @nssocket then @nssocket.destroy()
      @set nssocket: nssocket = Nssocket.NsSocket reconnect: false, type: 'tcp4'
      nssocket.connect @get('host'), @get('port')
