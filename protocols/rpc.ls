#autocompile

require! {
  util
  leshdash : { flattenDeep, each }
  bluebird: p
  
  backbone4000: Backbone
  
  subscriptionman2: subscriptionMan
  '../core'
  './query'
}

validator = require('validator2-extras'); v = validator.v

export class remoteObject
  (parent, name, methods) ->
    each methods, (method) ~>
      @[method] = (...args) -> parent.remoteCall name, method, args

    
export client = core.protocol.extend4000 do
    defaults:
        name: 'rpcClient'
        
    requires: [ query.client ]

    functions: ->
        remoteObject: ~>  @remoteObject ...

    remoteCall: (name, method, args) -> new p (resolve,reject) ~>
      @parent.query rpc: name, method: method, args: args, (msg,end) ->
        if msg.err then reject msg.err else resolve msg.data
      
    remoteObject: (name, ...methods) ->
      return new remoteObject @, name, flattenDeep methods

export server = core.protocol.extend4000 do
    defaults:
        name: 'rpcServer'
        
    requires: [ query.server ]

    functions: ->
        exportObject: ~>  @remoteObject ...

    initialize: ->
      @remoteObjects = {}
      
      @when 'parent', (parent) ~> 
        parent.onQuery rpc: String, method: String, args: Array, (msg,reply) ~>
          if not obj = @remoteObjects[msg.rpc] then return reply.end err: 'not found'

          res = obj[msg.method].apply obj, msg.args
          .then (res) -> reply.end data: res
          .catch (err) -> reply.end err: err
          
    remoteObject: (name, obj) ->
      @remoteObjects[name] = obj

