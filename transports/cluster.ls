# autocompile

require! { 
  underscore: _
  backbone4000: Backbone
  subscriptionman2: subscriptionMan
  '../core'
  helpers
  util
  cluster
}

validator = require('validator2-extras'); v = validator.v

export
  clusterChannel: core.channel.extend4000 do
    initialize: -> process.on 'message', (@event _, @realm)
    send: (msg) -> process.send msg
