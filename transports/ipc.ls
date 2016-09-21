# autocompile

require! {
  backbone4000: Backbone
  subscriptionman2: subscriptionMan
  child_process: cp
  '../core'
}

validator = require('validator2-extras'); v = validator.v
  
export ipcChannel = core.channel.extend4000 validator.validatedModel, do
  validator:
    process: 'Instance'
  
  defaults:
    name: 'ipc'

  initialize: ->
    @process = @get 'process'
    @process.on 'message', (msg, handle) ~> @event msg, @realm
    @process.on 'disconnect', ~> @end!
    @process.on 'error', ~> @end!
    @process.on 'exit', ~> @end!
    
  send: -> @process.send it

