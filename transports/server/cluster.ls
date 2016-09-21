# autocompile

require! { 
  underscore: { each }
  backbone4000: Backbone
  helpers
  subscriptionman2: subscriptionMan
  '../core'
  util
  cluster
}

validator = require('validator2-extras'); v = validator.v

export

  clusterServer: core.server.extend4000 do
    start: ->
      receiveWorker = (worker) ~> 
        @receiveConnection new @channelClass parent: @, worker: worker, name: 'worker-' + @channelName()
        
      each cluster.workers, receiveWorker
      cluster.on 'online', receiveWorker
