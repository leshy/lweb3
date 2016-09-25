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
    @tags = {  }
    if not @get('name') then @set name: crypto.randomBytes(32).toString 'base64'
    @pub = redis.createClient!
    @sub = redis.createClient!
    @subscribed = false


  updateSub: ->
    sub = ~> new p (resolve,reject) ~> 
      @sub.subscribe subName = "bus/" + map((keys @tags).sort!, ~> it + ":" + @tags[ it ]).join '|'
      @sub.once 'subscribe', ~>
        console.log "SUB!", subName
        @subscribed = true
        resolve!

    if @subscribed
      @sub.once 'unsubscribe', sub
      @sub.unsubscribe!
      
    else sub!
    
  addTag: (data) ->
    @tags <<< data
    @updateSub!
    
  delTag: (tag) ->
    @tags = omit @tags, tag
    @updateSub!
