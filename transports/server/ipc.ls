require! {
  backbone4000: Backbone
  subscriptionman2: subscriptionMan
  bluebird: p
  
  child_process: cp
  '../../core'
  '../ipc': { ipcChannel }
}

validator = require('validator2-extras'); v = validator.v

export ipcServer = core.server.extend4000 do
    defaults:
      name: 'ipcServer'

    defaultChannelClass: ipcChannel

    fork: (...args) -> new p (resolve,reject) ~> 
      child = cp.fork.apply cp, args
      @receiveConnection channel = new @channelClass parent: @, process: child, name: "proc-#{ child.pid }"
      channel.subscribeOnce ready: true, -> resolve channel
      channel
      
