# autocompile

require! {
  backbone4000: Backbone
  subscriptionman2: subscriptionMan
  '../../core'
  child_process: cp
  '../ipc': { ipcChannel }
}

validator = require('validator2-extras'); v = validator.v
  
export ipcClient = ipcChannel.extend4000 do
  validator:
    process: 'Instance'
    
  defaults:
    name: 'ipcClient'
    process: process

  initialize: -> @send ready: true
