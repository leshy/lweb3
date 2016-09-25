# autocompile

require! {
  redis
  crypto
  leshdash: { map, flattenDeep }
  'backbone4000/extras': Backbone
  subscriptionman2: subscriptionMan
  '../core'
}
export redis = core.bus.extend4000 do
  initialize: ->
    if not @get('name') then @set name: crypto.randomBytes(32).toString 'base64'
    @pub = redis.createClient!
    @sub = redis.createClient!

    @sub.subscribe "name:#{ @get 'name' }"

  addTag: (tag, data=true) ->
    p.all do
      if data isnt true then @sub.subscribe "bus," tag + ":" + data else true
      @sub.subscribe "bus." + tag
      
    .then ~> Backbone.Tagged::addTag.call @, tag, data

  delTag: (tag) ->
    val = @tags[ tag ]
    p.all do
      if val isnt true then @sub.unsubscribe "bus," tag + ":" + val else true
      @sub.unsubscribe "bus." + tag
      
    .then ~> Backbone.Tagged::delTag.call @, tag, data


    
