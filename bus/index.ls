# autocompile
require! {
  leshdash: { flatten }
  
  'backbone4000/extras': Backbone
  subscriptionman2: subMan
  
  path
  autoIndex
  
  bluebird: p
  
  '../core': core
}
  

Bus = Backbone.Tagged.extend4000 do

  initialize: (@opts) ->
    @on 'addTag', -> listen it
    @on 'delTag', -> unlisten it
  
  send: (...address, message) ->
    ...

  listen: (...address) -> new p (resolve,reject) ~> 
    address = flatten address
    ...

export autoIndex do
  __dirname
  new RegExp /js$/
