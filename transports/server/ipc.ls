require! {
  backbone4000: Backbone
  subscriptionman2: subscriptionMan
  bluebird: p
  
  child_process: cp
  '../../core'
  '../ipc': { ipcChannel }
}

validator = require('validator2-extras'); v = validator.v

export ipcConnection = ipcChannel.extend4000 do
  initialize: ->
    @set name: @process.pid
    @on 'end', -> console.log "child process exited"      

export ipcServer = core.server.extend4000 do
    defaults:
      name: 'ipcServer'

    defaultChannelClass: ipcChannel

    fork: (...args) -> new p (resolve,reject) ~>
      child = cp.fork.apply cp, args
      @receiveConnection channel = new @channelClass parent: @, process: child, name: "ipc-#{ child.pid }"
      
      channel.subscribeWait do
        5000
        ready: true
        -> resolve channel
        -> channel.end!; reject new Error "error forking"
        
      channel
      
