# autocompile

require! {
  redis
  crypto
  leshdash: { keys, map, flattenDeep, omit }
  'backbone4000/extras': Backbone
  bluebird: p
  subscriptionman2: subscriptionMan
  '../core'
}

module.exports = core.bus.extend4000 do

  initialize: ->
    @tags = {}
    if not @get('name') then @set name: crypto.randomBytes(32).toString 'base64'
    @pub = redis.createClient!
    @sub = redis.createClient!
    @sub.on 'pmessage', (pattern,channel,message) -> console.log "MSG IN", message

  send: (to, msg) -> 
    console.log "bus/" + @makeName(to, "|")

  makeName: (data, separator=" ") ->
    map((keys data).sort!, ~>
      if (val = data[ it ]) is true then val = ""
      it + ":" + val).join separator 
  
  updateSub: -> new p (resolve,reject) ~> 
    subscribe = ~>
      @each @tags, (value, key) -> if value then true
      
    if not @_subscribed then return subscribe!
    @sub.unsubscribe!
    @sub.once 'unsubscribe', subscribe
    
  addTag: (data) ->
    @tags <<< data
    @updateSub!
    
  delTag: (tag) ->
    @tags = omit @tags, tag
    @updateSub!


