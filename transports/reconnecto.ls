require! {
  backbone4000: Backbone
  helpers: h
  '../core': core
  underscore: _
}


memBuffer = exports.memBuffer = Backbone.Model.extend4000 do
  initialize: -> @buffer = []
  push: -> @buffer.push it
  shift: -> @buffer.shift()
  empty: -> not @buffer.length


memBufferDropper = exports.memBufferDropper = Backbone.Model.extend4000 do
  initialize: ->
    @buffer = []
    @size = @get('size') or 1000
    
  push: ->
    @buffer.push it
    if @size < @buffer.length then @buffer.shift()
      
  shift: -> @buffer.shift()
  empty: -> not @buffer.length

reconnecto = exports.reconnecto = core.channel.extend4000 core.channelHost, do
  defaults:
    name: 'reconnecto'
    bufferClass: memBufferDropper
    autoconnect: true
    
  initialize: ->
    bufferClass = @get('bufferClass')
    @buffer = new bufferClass()
    @connected = false
    @cnt = 0
    
    if @get('autoconnect') then _.defer ~> @connect!
    
  connect: ->
    @log 'connect'
    if @channel then @stopListening @channel
    @channel = new @channelClass name: 'r-' + @cnt++, parent: @
    
    @listenTo @channel, 'disconnect', ~> @reconnect!
    
    @listenTo @channel, 'connect', ~>
      @log 'connected'
      @connected = true
      @emptyBuffer!

  emptyBuffer: ->
    if @buffer.empty() then return
    if @send @buffer.shift() then @emptyBuffer!
  
  reconnect: ->
    @log 'reconnect'
    @connected = false
    h.wait 1000, ~> @connect!
    
  send: (msg) ->
    if @connected
      @channel.send msg
      return true
    else
      @buffer.push msg
      return false

